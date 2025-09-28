/**
 * Multiplayer System
 * Real-time multiplayer support with shared stories and voting
 */

import { WebSocketServer } from 'ws';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import Logger from './Logger.js';
import ConfigManager from './ConfigManager.js';
import ErrorHandler, { ValidationError } from './ErrorHandler.js';

export class Player {
  constructor(id, name, socket = null) {
    this.id = id || uuidv4();
    this.name = name;
    this.socket = socket;
    this.sessionId = null;
    this.isHost = false;
    this.isReady = false;
    this.lastActivity = Date.now();
    this.stats = {
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      level: 1,
      experience: 0,
      gold: 0
    };
    this.inventory = [];
    this.preferences = {
      autoAdvance: false,
      votingTimeout: 30000
    };
    this.vote = null;
    this.connected = socket !== null;
  }

  updateActivity() {
    this.lastActivity = Date.now();
  }

  setReady(ready = true) {
    this.isReady = ready;
    this.updateActivity();
  }

  vote(choice) {
    this.vote = choice;
    this.updateActivity();
    Logger.multiplayer('Player voted', {
      playerId: this.id,
      sessionId: this.sessionId,
      choice: choice.text
    });
  }

  clearVote() {
    this.vote = null;
  }

  sendMessage(type, data) {
    if (this.socket && this.socket.readyState === 1) { // OPEN
      try {
        this.socket.send(JSON.stringify({ type, data }));
        return true;
      } catch (error) {
        Logger.error('Failed to send message to player', {
          playerId: this.id,
          error: error.message
        });
        return false;
      }
    }
    return false;
  }

  disconnect() {
    this.connected = false;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  isActive() {
    return Date.now() - this.lastActivity < 300000; // 5 minutes
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      isHost: this.isHost,
      isReady: this.isReady,
      connected: this.connected,
      vote: this.vote,
      stats: this.stats,
      lastActivity: this.lastActivity
    };
  }
}

export class GameSession {
  constructor(id, hostPlayer, storyId = null) {
    this.id = id || uuidv4();
    this.hostId = hostPlayer.id;
    this.players = new Map();
    this.storyId = storyId;
    this.currentStory = null;
    this.currentPage = null;
    this.gameState = 'waiting'; // waiting, story, voting, combat, paused, ended
    this.settings = {
      maxPlayers: ConfigManager.multiplayer.maxPlayers,
      votingTimeout: 30000,
      enableVoting: ConfigManager.multiplayer.enableVoting,
      autoAdvanceThreshold: 0.8, // 80% of players must vote
      allowSpectators: true,
      pauseOnDisconnect: true
    };
    this.voting = {
      active: false,
      choices: [],
      votes: new Map(), // playerId -> choiceIndex
      timeout: null,
      startTime: null
    };
    this.history = [];
    this.created = Date.now();
    this.lastActivity = Date.now();
    this.eventEmitter = new EventEmitter();
  }

  addPlayer(player) {
    if (this.players.size >= this.settings.maxPlayers) {
      throw new ValidationError('Session is full', { sessionId: this.id, maxPlayers: this.settings.maxPlayers });
    }

    if (this.players.has(player.id)) {
      throw new ValidationError('Player already in session', { sessionId: this.id, playerId: player.id });
    }

    player.sessionId = this.id;
    this.players.set(player.id, player);
    this.lastActivity = Date.now();

    this.broadcastToAll('player_joined', {
      player: player.serialize(),
      playerCount: this.players.size
    });

    Logger.multiplayer('Player joined session', {
      sessionId: this.id,
      playerId: player.id,
      playerName: player.name,
      playerCount: this.players.size
    });

    return true;
  }

  removePlayer(playerId) {
    const player = this.players.get(playerId);
    if (!player) return false;

    player.disconnect();
    this.players.delete(playerId);

    // If host left, assign new host
    if (playerId === this.hostId && this.players.size > 0) {
      const newHost = Array.from(this.players.values())[0];
      newHost.isHost = true;
      this.hostId = newHost.id;

      this.broadcastToAll('new_host', {
        hostId: newHost.id,
        hostName: newHost.name
      });
    }

    this.broadcastToAll('player_left', {
      playerId,
      playerCount: this.players.size
    });

    Logger.multiplayer('Player left session', {
      sessionId: this.id,
      playerId,
      playerCount: this.players.size
    });

    // Handle empty session
    if (this.players.size === 0) {
      this.endSession('empty');
    } else if (this.settings.pauseOnDisconnect && this.gameState === 'voting') {
      this.pauseVoting();
    }

    return true;
  }

  startStory(story) {
    if (this.gameState !== 'waiting') {
      throw new ValidationError('Cannot start story in current state', {
        sessionId: this.id,
        currentState: this.gameState
      });
    }

    this.currentStory = story;
    this.storyId = story.id;
    this.currentPage = story.getPage(story.start_page_id);
    this.gameState = 'story';
    this.lastActivity = Date.now();

    this.broadcastToAll('story_started', {
      storyId: this.storyId,
      storyTitle: story.title,
      currentPage: this.serializePage(this.currentPage)
    });

    Logger.multiplayer('Story started in session', {
      sessionId: this.id,
      storyId: this.storyId,
      playerCount: this.players.size
    });

    // Auto-advance to choices if page has them
    if (this.currentPage.prompts.length > 0) {
      setTimeout(() => this.startVoting(), 2000);
    }
  }

  startVoting() {
    if (!this.currentPage || this.currentPage.prompts.length === 0) {
      this.endSession('no_choices');
      return;
    }

    this.gameState = 'voting';
    this.voting.active = true;
    this.voting.choices = this.currentPage.prompts;
    this.voting.votes.clear();
    this.voting.startTime = Date.now();

    // Clear previous votes
    for (const player of this.players.values()) {
      player.clearVote();
    }

    this.broadcastToAll('voting_started', {
      choices: this.voting.choices.map((choice, index) => ({
        index,
        text: choice.text
      })),
      timeout: this.settings.votingTimeout
    });

    // Set voting timeout
    this.voting.timeout = setTimeout(() => {
      this.resolveVoting();
    }, this.settings.votingTimeout);

    Logger.multiplayer('Voting started', {
      sessionId: this.id,
      choiceCount: this.voting.choices.length,
      timeout: this.settings.votingTimeout
    });
  }

  castVote(playerId, choiceIndex) {
    if (!this.voting.active) {
      throw new ValidationError('No active voting', { sessionId: this.id });
    }

    if (choiceIndex < 0 || choiceIndex >= this.voting.choices.length) {
      throw new ValidationError('Invalid choice index', {
        sessionId: this.id,
        choiceIndex,
        maxIndex: this.voting.choices.length - 1
      });
    }

    const player = this.players.get(playerId);
    if (!player) {
      throw new ValidationError('Player not in session', { sessionId: this.id, playerId });
    }

    const choice = this.voting.choices[choiceIndex];
    player.vote(choice);
    this.voting.votes.set(playerId, choiceIndex);

    this.broadcastToAll('vote_cast', {
      playerId,
      playerName: player.name,
      choiceIndex,
      voteCount: this.voting.votes.size,
      totalPlayers: this.players.size
    });

    // Check if we can auto-advance
    const votePercentage = this.voting.votes.size / this.players.size;
    if (votePercentage >= this.settings.autoAdvanceThreshold) {
      this.resolveVoting();
    }

    return true;
  }

  resolveVoting() {
    if (!this.voting.active) return;

    clearTimeout(this.voting.timeout);
    this.voting.active = false;

    // Count votes
    const voteCounts = new Map();
    for (const choiceIndex of this.voting.votes.values()) {
      voteCounts.set(choiceIndex, (voteCounts.get(choiceIndex) || 0) + 1);
    }

    // Determine winning choice
    let winningChoice = 0;
    let maxVotes = 0;

    for (const [choiceIndex, votes] of voteCounts.entries()) {
      if (votes > maxVotes) {
        maxVotes = votes;
        winningChoice = choiceIndex;
      }
    }

    // Handle tie-breaking
    if (maxVotes === 0) {
      // No votes cast, choose random
      winningChoice = Math.floor(Math.random() * this.voting.choices.length);
    } else {
      // Check for ties
      const tiedChoices = Array.from(voteCounts.entries())
        .filter(([_, votes]) => votes === maxVotes)
        .map(([index, _]) => index);

      if (tiedChoices.length > 1) {
        winningChoice = tiedChoices[Math.floor(Math.random() * tiedChoices.length)];
      }
    }

    const selectedChoice = this.voting.choices[winningChoice];

    this.broadcastToAll('voting_resolved', {
      winningChoice,
      selectedChoice: selectedChoice.text,
      voteCounts: Object.fromEntries(voteCounts),
      totalVotes: this.voting.votes.size
    });

    Logger.multiplayer('Voting resolved', {
      sessionId: this.id,
      winningChoice,
      selectedText: selectedChoice.text,
      totalVotes: this.voting.votes.size,
      playerCount: this.players.size
    });

    // Record in history
    this.history.push({
      timestamp: Date.now(),
      type: 'choice',
      pageId: this.currentPage.id,
      choice: selectedChoice,
      votes: Object.fromEntries(voteCounts),
      players: Array.from(this.players.keys())
    });

    // Advance to next page
    setTimeout(() => this.advanceToNextPage(selectedChoice), 1500);
  }

  advanceToNextPage(choice) {
    if (!this.currentStory) {
      this.endSession('no_story');
      return;
    }

    const nextPage = this.currentStory.getPage(choice.target_id);
    if (!nextPage) {
      this.endSession('story_complete');
      return;
    }

    this.currentPage = nextPage;
    this.gameState = 'story';

    this.broadcastToAll('page_changed', {
      currentPage: this.serializePage(this.currentPage)
    });

    // Start next voting round if there are choices
    if (this.currentPage.prompts.length > 0) {
      setTimeout(() => this.startVoting(), 3000);
    } else {
      this.endSession('story_complete');
    }
  }

  pauseVoting() {
    if (this.voting.active) {
      clearTimeout(this.voting.timeout);
      this.gameState = 'paused';

      this.broadcastToAll('voting_paused', {
        reason: 'player_disconnected'
      });

      Logger.multiplayer('Voting paused', {
        sessionId: this.id,
        reason: 'player_disconnected'
      });
    }
  }

  resumeVoting() {
    if (this.gameState === 'paused' && this.voting.choices.length > 0) {
      this.gameState = 'voting';
      this.voting.active = true;

      const remainingTime = this.settings.votingTimeout - (Date.now() - this.voting.startTime);
      const timeout = Math.max(5000, remainingTime); // At least 5 seconds

      this.voting.timeout = setTimeout(() => {
        this.resolveVoting();
      }, timeout);

      this.broadcastToAll('voting_resumed', {
        remainingTime: timeout
      });

      Logger.multiplayer('Voting resumed', {
        sessionId: this.id,
        remainingTime: timeout
      });
    }
  }

  endSession(reason = 'manual') {
    this.gameState = 'ended';

    this.broadcastToAll('session_ended', {
      reason,
      history: this.history,
      duration: Date.now() - this.created
    });

    Logger.multiplayer('Session ended', {
      sessionId: this.id,
      reason,
      duration: Date.now() - this.created,
      playerCount: this.players.size
    });

    // Disconnect all players
    for (const player of this.players.values()) {
      player.disconnect();
    }

    this.players.clear();
    this.eventEmitter.emit('session_ended', this.id, reason);
  }

  broadcastToAll(type, data) {
    const message = JSON.stringify({ type, data });
    let successCount = 0;

    for (const player of this.players.values()) {
      if (player.sendMessage(type, data)) {
        successCount++;
      }
    }

    return successCount;
  }

  broadcastToOthers(excludePlayerId, type, data) {
    const message = JSON.stringify({ type, data });
    let successCount = 0;

    for (const player of this.players.values()) {
      if (player.id !== excludePlayerId && player.sendMessage(type, data)) {
        successCount++;
      }
    }

    return successCount;
  }

  serializePage(page) {
    return {
      id: page.id,
      text: page.text,
      background: page.background,
      choices: page.prompts.map((prompt, index) => ({
        index,
        text: prompt.text,
        target: prompt.target_id
      }))
    };
  }

  getStatus() {
    return {
      id: this.id,
      hostId: this.hostId,
      gameState: this.gameState,
      playerCount: this.players.size,
      maxPlayers: this.settings.maxPlayers,
      storyId: this.storyId,
      voting: this.voting.active ? {
        choiceCount: this.voting.choices.length,
        voteCount: this.voting.votes.size,
        timeRemaining: this.voting.startTime ?
          this.settings.votingTimeout - (Date.now() - this.voting.startTime) : null
      } : null,
      created: this.created,
      lastActivity: this.lastActivity
    };
  }

  serialize() {
    return {
      ...this.getStatus(),
      players: Array.from(this.players.values()).map(p => p.serialize()),
      settings: this.settings,
      history: this.history.slice(-10) // Last 10 events
    };
  }
}

export class MultiplayerServer {
  constructor() {
    this.server = null;
    this.sessions = new Map();
    this.players = new Map();
    this.isRunning = false;
    this.port = ConfigManager.app.port || 3000;
    this.cleanupInterval = null;
  }

  start() {
    if (this.isRunning) return false;

    try {
      this.server = new WebSocketServer({
        port: this.port,
        verifyClient: this.verifyClient.bind(this)
      });

      this.server.on('connection', this.handleConnection.bind(this));
      this.server.on('error', this.handleServerError.bind(this));

      this.isRunning = true;
      this.startCleanupInterval();

      Logger.multiplayer('Multiplayer server started', {
        port: this.port,
        maxPlayers: ConfigManager.multiplayer.maxPlayers
      });

      return true;
    } catch (error) {
      Logger.errorWithContext(error, { operation: 'multiplayer_server_start' });
      return false;
    }
  }

  stop() {
    if (!this.isRunning) return false;

    // End all sessions
    for (const session of this.sessions.values()) {
      session.endSession('server_shutdown');
    }

    // Disconnect all players
    for (const player of this.players.values()) {
      player.disconnect();
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    if (this.server) {
      this.server.close();
      this.server = null;
    }

    this.sessions.clear();
    this.players.clear();
    this.isRunning = false;

    Logger.multiplayer('Multiplayer server stopped');
    return true;
  }

  verifyClient(info) {
    // Basic verification - could be enhanced with authentication
    return true;
  }

  handleConnection(socket, request) {
    Logger.multiplayer('New connection attempt', {
      ip: request.socket.remoteAddress,
      userAgent: request.headers['user-agent']
    });

    socket.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        this.handleMessage(socket, message);
      } catch (error) {
        Logger.error('Failed to parse message', { error: error.message });
        socket.send(JSON.stringify({
          type: 'error',
          data: { message: 'Invalid message format' }
        }));
      }
    });

    socket.on('close', () => {
      this.handleDisconnection(socket);
    });

    socket.on('error', (error) => {
      Logger.error('Socket error', { error: error.message });
    });
  }

  handleMessage(socket, message) {
    const { type, data } = message;

    try {
      switch (type) {
        case 'register':
          this.handlePlayerRegistration(socket, data);
          break;
        case 'create_session':
          this.handleCreateSession(socket, data);
          break;
        case 'join_session':
          this.handleJoinSession(socket, data);
          break;
        case 'leave_session':
          this.handleLeaveSession(socket, data);
          break;
        case 'start_story':
          this.handleStartStory(socket, data);
          break;
        case 'cast_vote':
          this.handleCastVote(socket, data);
          break;
        case 'chat_message':
          this.handleChatMessage(socket, data);
          break;
        default:
          socket.send(JSON.stringify({
            type: 'error',
            data: { message: `Unknown message type: ${type}` }
          }));
      }
    } catch (error) {
      Logger.errorWithContext(error, { messageType: type, data });
      socket.send(JSON.stringify({
        type: 'error',
        data: { message: ErrorHandler.handleStoryError(error) }
      }));
    }
  }

  handlePlayerRegistration(socket, data) {
    const { playerId, playerName } = data;

    if (!playerName || playerName.trim().length === 0) {
      throw new ValidationError('Player name is required');
    }

    const player = new Player(playerId, playerName.trim(), socket);
    this.players.set(player.id, player);

    socket.playerId = player.id;

    socket.send(JSON.stringify({
      type: 'registration_success',
      data: {
        playerId: player.id,
        playerName: player.name
      }
    }));

    Logger.multiplayer('Player registered', {
      playerId: player.id,
      playerName: player.name
    });
  }

  handleCreateSession(socket, data) {
    const player = this.players.get(socket.playerId);
    if (!player) throw new ValidationError('Player not registered');

    const session = new GameSession(data.sessionId, player, data.storyId);
    player.isHost = true;

    this.sessions.set(session.id, session);
    session.addPlayer(player);

    // Set up session event handlers
    session.eventEmitter.on('session_ended', (sessionId) => {
      this.sessions.delete(sessionId);
    });

    socket.send(JSON.stringify({
      type: 'session_created',
      data: {
        sessionId: session.id,
        isHost: true
      }
    }));

    Logger.multiplayer('Session created', {
      sessionId: session.id,
      hostId: player.id,
      hostName: player.name
    });
  }

  handleJoinSession(socket, data) {
    const { sessionId } = data;
    const player = this.players.get(socket.playerId);

    if (!player) throw new ValidationError('Player not registered');

    const session = this.sessions.get(sessionId);
    if (!session) throw new ValidationError('Session not found');

    session.addPlayer(player);

    socket.send(JSON.stringify({
      type: 'session_joined',
      data: {
        sessionId: session.id,
        isHost: false,
        session: session.serialize()
      }
    }));
  }

  handleLeaveSession(socket, data) {
    const player = this.players.get(socket.playerId);
    if (!player || !player.sessionId) return;

    const session = this.sessions.get(player.sessionId);
    if (session) {
      session.removePlayer(player.id);
    }

    player.sessionId = null;
    player.isHost = false;

    socket.send(JSON.stringify({
      type: 'session_left',
      data: { success: true }
    }));
  }

  handleStartStory(socket, data) {
    const player = this.players.get(socket.playerId);
    if (!player || !player.isHost) {
      throw new ValidationError('Only host can start stories');
    }

    const session = this.sessions.get(player.sessionId);
    if (!session) throw new ValidationError('Session not found');

    // This would need integration with the story system
    // For now, we'll simulate starting a story
    const mockStory = {
      id: data.storyId || 'default',
      title: 'Multiplayer Adventure',
      start_page_id: 'start',
      getPage: (id) => ({
        id,
        text: 'Your multiplayer adventure begins...',
        prompts: [
          { text: 'Explore the cave', target_id: 'cave' },
          { text: 'Visit the village', target_id: 'village' }
        ]
      })
    };

    session.startStory(mockStory);
  }

  handleCastVote(socket, data) {
    const { choiceIndex } = data;
    const player = this.players.get(socket.playerId);

    if (!player || !player.sessionId) {
      throw new ValidationError('Player not in session');
    }

    const session = this.sessions.get(player.sessionId);
    if (!session) throw new ValidationError('Session not found');

    session.castVote(player.id, choiceIndex);
  }

  handleChatMessage(socket, data) {
    const { message } = data;
    const player = this.players.get(socket.playerId);

    if (!player || !player.sessionId) return;

    const session = this.sessions.get(player.sessionId);
    if (!session) return;

    session.broadcastToAll('chat_message', {
      playerId: player.id,
      playerName: player.name,
      message,
      timestamp: Date.now()
    });
  }

  handleDisconnection(socket) {
    const playerId = socket.playerId;
    if (!playerId) return;

    const player = this.players.get(playerId);
    if (!player) return;

    // Remove from session if in one
    if (player.sessionId) {
      const session = this.sessions.get(player.sessionId);
      if (session) {
        session.removePlayer(playerId);
      }
    }

    this.players.delete(playerId);

    Logger.multiplayer('Player disconnected', {
      playerId,
      playerName: player.name
    });
  }

  handleServerError(error) {
    Logger.errorWithContext(error, { component: 'multiplayer_server' });
  }

  startCleanupInterval() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveSessions();
      this.cleanupInactivePlayers();
    }, 60000); // Run every minute
  }

  cleanupInactiveSessions() {
    const now = Date.now();
    const timeout = ConfigManager.multiplayer.sessionTimeout;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > timeout) {
        Logger.multiplayer('Cleaning up inactive session', {
          sessionId,
          inactiveTime: now - session.lastActivity
        });
        session.endSession('timeout');
      }
    }
  }

  cleanupInactivePlayers() {
    for (const [playerId, player] of this.players.entries()) {
      if (!player.isActive()) {
        Logger.multiplayer('Cleaning up inactive player', {
          playerId,
          playerName: player.name
        });
        this.players.delete(playerId);
      }
    }
  }

  getServerStatus() {
    return {
      isRunning: this.isRunning,
      port: this.port,
      playerCount: this.players.size,
      sessionCount: this.sessions.size,
      activeSessions: Array.from(this.sessions.values()).map(s => s.getStatus())
    };
  }
}

export default MultiplayerServer;