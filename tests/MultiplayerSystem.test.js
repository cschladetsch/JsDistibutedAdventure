/**
 * Test suite for Multiplayer System
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  Player,
  GameSession,
  MultiplayerServer
} from '../lib/MultiplayerSystem.js';

// Mock WebSocket for testing
class MockWebSocket {
  constructor() {
    this.readyState = 1; // OPEN
    this.messages = [];
    this.listeners = {};
  }

  send(data) {
    this.messages.push(data);
  }

  close() {
    this.readyState = 3; // CLOSED
  }

  on(event, callback) {
    this.listeners[event] = callback;
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event](data);
    }
  }
}

describe('Player', () => {
  let player;
  let mockSocket;

  beforeEach(() => {
    mockSocket = new MockWebSocket();
    player = new Player('test_id', 'TestPlayer', mockSocket);
  });

  test('should create player with correct properties', () => {
    expect(player.id).toBe('test_id');
    expect(player.name).toBe('TestPlayer');
    expect(player.socket).toBe(mockSocket);
    expect(player.isHost).toBe(false);
    expect(player.isReady).toBe(false);
    expect(player.connected).toBe(true);
  });

  test('should update activity on actions', () => {
    const oldActivity = player.lastActivity;

    // Wait a bit to ensure time difference
    setTimeout(() => {
      player.updateActivity();
      expect(player.lastActivity).toBeGreaterThan(oldActivity);
    }, 10);
  });

  test('should set ready status', () => {
    expect(player.isReady).toBe(false);

    player.setReady(true);
    expect(player.isReady).toBe(true);
  });

  test('should cast and clear votes', () => {
    const choice = { text: 'Go north', target: 'north_room' };

    expect(player.vote).toBeNull();

    player.vote(choice);
    expect(player.vote).toBe(choice);

    player.clearVote();
    expect(player.vote).toBeNull();
  });

  test('should send messages through socket', () => {
    const result = player.sendMessage('test_type', { message: 'hello' });

    expect(result).toBe(true);
    expect(mockSocket.messages).toHaveLength(1);

    const sentMessage = JSON.parse(mockSocket.messages[0]);
    expect(sentMessage.type).toBe('test_type');
    expect(sentMessage.data.message).toBe('hello');
  });

  test('should handle disconnection', () => {
    expect(player.connected).toBe(true);

    player.disconnect();
    expect(player.connected).toBe(false);
    expect(player.socket).toBeNull();
  });

  test('should check if player is active', () => {
    expect(player.isActive()).toBe(true);

    // Simulate old activity
    player.lastActivity = Date.now() - 400000; // 6.67 minutes ago
    expect(player.isActive()).toBe(false);
  });

  test('should serialize player data', () => {
    player.isHost = true;
    player.isReady = true;

    const serialized = player.serialize();

    expect(serialized.id).toBe(player.id);
    expect(serialized.name).toBe(player.name);
    expect(serialized.isHost).toBe(true);
    expect(serialized.isReady).toBe(true);
    expect(serialized.connected).toBe(true);
    expect(serialized).toHaveProperty('stats');
    expect(serialized).toHaveProperty('lastActivity');
  });
});

describe('GameSession', () => {
  let session;
  let hostPlayer;
  let mockSocket;

  beforeEach(() => {
    mockSocket = new MockWebSocket();
    hostPlayer = new Player('host_id', 'HostPlayer', mockSocket);
    session = new GameSession('session_id', hostPlayer);
  });

  test('should create session with correct properties', () => {
    expect(session.id).toBe('session_id');
    expect(session.hostId).toBe('host_id');
    expect(session.gameState).toBe('waiting');
    expect(session.players.size).toBe(0);
    expect(session.voting.active).toBe(false);
  });

  test('should add players to session', () => {
    const player = new Player('player_id', 'Player1', new MockWebSocket());

    const result = session.addPlayer(player);

    expect(result).toBe(true);
    expect(session.players.size).toBe(1);
    expect(session.players.has('player_id')).toBe(true);
    expect(player.sessionId).toBe('session_id');
  });

  test('should reject duplicate players', () => {
    const player = new Player('player_id', 'Player1', new MockWebSocket());

    session.addPlayer(player);

    expect(() => {
      session.addPlayer(player);
    }).toThrow('Player already in session');
  });

  test('should reject players when session is full', () => {
    session.settings.maxPlayers = 1;

    const player1 = new Player('player1', 'Player1', new MockWebSocket());
    const player2 = new Player('player2', 'Player2', new MockWebSocket());

    session.addPlayer(player1);

    expect(() => {
      session.addPlayer(player2);
    }).toThrow('Session is full');
  });

  test('should remove players from session', () => {
    const player = new Player('player_id', 'Player1', new MockWebSocket());
    session.addPlayer(player);

    const result = session.removePlayer('player_id');

    expect(result).toBe(true);
    expect(session.players.size).toBe(0);
    expect(player.connected).toBe(false);
  });

  test('should assign new host when host leaves', () => {
    const host = new Player('host_id', 'Host', new MockWebSocket());
    const player = new Player('player_id', 'Player', new MockWebSocket());

    host.isHost = true;
    session.addPlayer(host);
    session.addPlayer(player);

    session.removePlayer('host_id');

    expect(session.hostId).toBe('player_id');
    expect(player.isHost).toBe(true);
  });

  test('should start story and change game state', () => {
    const mockStory = {
      id: 'test_story',
      title: 'Test Story',
      start_page_id: 'start',
      getPage: jest.fn().mockReturnValue({
        id: 'start',
        text: 'Story begins...',
        prompts: [
          { text: 'Choice 1', target_id: 'page1' },
          { text: 'Choice 2', target_id: 'page2' }
        ]
      })
    };

    session.startStory(mockStory);

    expect(session.gameState).toBe('story');
    expect(session.currentStory).toBe(mockStory);
    expect(session.storyId).toBe('test_story');
  });

  test('should start voting when story has choices', () => {
    session.currentPage = {
      id: 'test_page',
      text: 'Choose your path',
      prompts: [
        { text: 'Go left', target_id: 'left' },
        { text: 'Go right', target_id: 'right' }
      ]
    };

    session.startVoting();

    expect(session.gameState).toBe('voting');
    expect(session.voting.active).toBe(true);
    expect(session.voting.choices).toHaveLength(2);
  });

  test('should cast votes and track them', () => {
    session.currentPage = {
      prompts: [
        { text: 'Choice 1', target_id: 'page1' },
        { text: 'Choice 2', target_id: 'page2' }
      ]
    };
    session.startVoting();

    const player = new Player('player_id', 'Player', new MockWebSocket());
    session.addPlayer(player);

    const result = session.castVote('player_id', 0);

    expect(result).toBe(true);
    expect(session.voting.votes.get('player_id')).toBe(0);
    expect(player.vote).toBeDefined();
  });

  test('should reject invalid votes', () => {
    session.currentPage = {
      prompts: [{ text: 'Only choice', target_id: 'next' }]
    };
    session.startVoting();

    const player = new Player('player_id', 'Player', new MockWebSocket());
    session.addPlayer(player);

    expect(() => {
      session.castVote('player_id', 5); // Invalid choice index
    }).toThrow('Invalid choice index');
  });

  test('should resolve voting and select winning choice', () => {
    session.currentPage = {
      id: 'current',
      prompts: [
        { text: 'Choice 1', target_id: 'page1' },
        { text: 'Choice 2', target_id: 'page2' }
      ]
    };
    session.startVoting();

    // Mock the story for page advancement
    session.currentStory = {
      getPage: jest.fn().mockReturnValue({
        id: 'page1',
        text: 'You chose wisely',
        prompts: []
      })
    };

    // Add players and votes
    const player1 = new Player('p1', 'Player1', new MockWebSocket());
    const player2 = new Player('p2', 'Player2', new MockWebSocket());
    session.addPlayer(player1);
    session.addPlayer(player2);

    session.castVote('p1', 0);
    session.castVote('p2', 0);

    // Mock setTimeout to resolve immediately
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

    session.resolveVoting();

    expect(session.voting.active).toBe(false);
    expect(session.history).toHaveLength(1);
    expect(session.history[0].choice.target_id).toBe('page1');

    global.setTimeout.mockRestore();
  });

  test('should handle tie-breaking in voting', () => {
    session.currentPage = {
      prompts: [
        { text: 'Choice 1', target_id: 'page1' },
        { text: 'Choice 2', target_id: 'page2' }
      ]
    };
    session.startVoting();

    session.currentStory = {
      getPage: jest.fn().mockReturnValue({ id: 'result', prompts: [] })
    };

    const player1 = new Player('p1', 'Player1', new MockWebSocket());
    const player2 = new Player('p2', 'Player2', new MockWebSocket());
    session.addPlayer(player1);
    session.addPlayer(player2);

    session.castVote('p1', 0);
    session.castVote('p2', 1);

    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());
    jest.spyOn(Math, 'random').mockReturnValue(0.3); // Predictable tie-breaking

    session.resolveVoting();

    expect(session.voting.active).toBe(false);

    Math.random.mockRestore();
    global.setTimeout.mockRestore();
  });

  test('should end session with reason', () => {
    const player = new Player('player_id', 'Player', new MockWebSocket());
    session.addPlayer(player);

    session.endSession('test_reason');

    expect(session.gameState).toBe('ended');
    expect(session.players.size).toBe(0);
    expect(player.connected).toBe(false);
  });

  test('should broadcast messages to all players', () => {
    const player1 = new Player('p1', 'Player1', new MockWebSocket());
    const player2 = new Player('p2', 'Player2', new MockWebSocket());

    session.addPlayer(player1);
    session.addPlayer(player2);

    const successCount = session.broadcastToAll('test_message', { data: 'test' });

    expect(successCount).toBe(2);
    expect(player1.socket.messages).toHaveLength(2); // Join + broadcast
    expect(player2.socket.messages).toHaveLength(2); // Join + broadcast
  });

  test('should get session status', () => {
    const status = session.getStatus();

    expect(status).toHaveProperty('id');
    expect(status).toHaveProperty('hostId');
    expect(status).toHaveProperty('gameState');
    expect(status).toHaveProperty('playerCount');
    expect(status).toHaveProperty('created');
  });

  test('should serialize complete session data', () => {
    const player = new Player('player_id', 'Player', new MockWebSocket());
    session.addPlayer(player);

    const serialized = session.serialize();

    expect(serialized).toHaveProperty('id');
    expect(serialized).toHaveProperty('players');
    expect(serialized).toHaveProperty('settings');
    expect(serialized).toHaveProperty('history');
    expect(serialized.players).toHaveLength(1);
  });
});

describe('MultiplayerServer', () => {
  let server;

  beforeEach(() => {
    server = new MultiplayerServer();

    // Mock WebSocketServer
    server.server = {
      on: jest.fn(),
      close: jest.fn()
    };
  });

  afterEach(() => {
    if (server.isRunning) {
      server.stop();
    }
  });

  test('should create server with default settings', () => {
    expect(server.sessions).toBeInstanceOf(Map);
    expect(server.players).toBeInstanceOf(Map);
    expect(server.isRunning).toBe(false);
  });

  test('should handle player registration', () => {
    const mockSocket = new MockWebSocket();
    const message = {
      type: 'register',
      data: { playerId: 'test_id', playerName: 'TestPlayer' }
    };

    server.handleMessage(mockSocket, message);

    expect(server.players.has('test_id')).toBe(true);
    expect(mockSocket.playerId).toBe('test_id');
    expect(mockSocket.messages).toHaveLength(1);

    const response = JSON.parse(mockSocket.messages[0]);
    expect(response.type).toBe('registration_success');
  });

  test('should reject registration with empty name', () => {
    const mockSocket = new MockWebSocket();
    const message = {
      type: 'register',
      data: { playerId: 'test_id', playerName: '' }
    };

    expect(() => {
      server.handleMessage(mockSocket, message);
    }).toThrow('Player name is required');
  });

  test('should handle session creation', () => {
    const mockSocket = new MockWebSocket();

    // First register player
    server.handleMessage(mockSocket, {
      type: 'register',
      data: { playerId: 'host_id', playerName: 'Host' }
    });

    // Then create session
    server.handleMessage(mockSocket, {
      type: 'create_session',
      data: { sessionId: 'test_session' }
    });

    expect(server.sessions.has('test_session')).toBe(true);
    const session = server.sessions.get('test_session');
    expect(session.hostId).toBe('host_id');
    expect(session.players.has('host_id')).toBe(true);
  });

  test('should handle joining existing session', () => {
    const hostSocket = new MockWebSocket();
    const playerSocket = new MockWebSocket();

    // Register host and create session
    server.handleMessage(hostSocket, {
      type: 'register',
      data: { playerId: 'host_id', playerName: 'Host' }
    });

    server.handleMessage(hostSocket, {
      type: 'create_session',
      data: { sessionId: 'test_session' }
    });

    // Register player and join session
    server.handleMessage(playerSocket, {
      type: 'register',
      data: { playerId: 'player_id', playerName: 'Player' }
    });

    server.handleMessage(playerSocket, {
      type: 'join_session',
      data: { sessionId: 'test_session' }
    });

    const session = server.sessions.get('test_session');
    expect(session.players.size).toBe(2);
    expect(session.players.has('player_id')).toBe(true);
  });

  test('should handle vote casting', () => {
    const mockSocket = new MockWebSocket();

    // Set up session with voting
    server.handleMessage(mockSocket, {
      type: 'register',
      data: { playerId: 'player_id', playerName: 'Player' }
    });

    server.handleMessage(mockSocket, {
      type: 'create_session',
      data: { sessionId: 'test_session' }
    });

    const session = server.sessions.get('test_session');
    session.currentPage = {
      prompts: [
        { text: 'Choice 1', target_id: 'page1' },
        { text: 'Choice 2', target_id: 'page2' }
      ]
    };
    session.startVoting();

    server.handleMessage(mockSocket, {
      type: 'cast_vote',
      data: { choiceIndex: 0 }
    });

    expect(session.voting.votes.has('player_id')).toBe(true);
    expect(session.voting.votes.get('player_id')).toBe(0);
  });

  test('should handle player disconnection', () => {
    const mockSocket = new MockWebSocket();

    server.handleMessage(mockSocket, {
      type: 'register',
      data: { playerId: 'player_id', playerName: 'Player' }
    });

    expect(server.players.has('player_id')).toBe(true);

    server.handleDisconnection(mockSocket);

    expect(server.players.has('player_id')).toBe(false);
  });

  test('should handle chat messages', () => {
    const mockSocket = new MockWebSocket();

    // Set up player in session
    server.handleMessage(mockSocket, {
      type: 'register',
      data: { playerId: 'player_id', playerName: 'Player' }
    });

    server.handleMessage(mockSocket, {
      type: 'create_session',
      data: { sessionId: 'test_session' }
    });

    server.handleMessage(mockSocket, {
      type: 'chat_message',
      data: { message: 'Hello everyone!' }
    });

    // Should broadcast to session
    expect(mockSocket.messages.length).toBeGreaterThan(0);
  });

  test('should get server status', () => {
    server.isRunning = true;

    const status = server.getServerStatus();

    expect(status).toHaveProperty('isRunning');
    expect(status).toHaveProperty('port');
    expect(status).toHaveProperty('playerCount');
    expect(status).toHaveProperty('sessionCount');
    expect(status).toHaveProperty('activeSessions');
    expect(status.isRunning).toBe(true);
  });

  test('should cleanup inactive sessions and players', () => {
    // Add inactive session
    const oldSession = new GameSession('old_session', new Player('old_host', 'OldHost'));
    oldSession.lastActivity = Date.now() - 2000000; // Very old
    server.sessions.set('old_session', oldSession);

    // Add inactive player
    const oldPlayer = new Player('old_player', 'OldPlayer');
    oldPlayer.lastActivity = Date.now() - 400000; // Inactive
    server.players.set('old_player', oldPlayer);

    server.cleanupInactiveSessions();
    server.cleanupInactivePlayers();

    expect(server.sessions.has('old_session')).toBe(false);
    expect(server.players.has('old_player')).toBe(false);
  });
});

describe('Integration Tests', () => {
  test('should simulate complete multiplayer story session', async () => {
    const server = new MultiplayerServer();

    // Mock sockets for two players
    const hostSocket = new MockWebSocket();
    const playerSocket = new MockWebSocket();

    // Register players
    server.handleMessage(hostSocket, {
      type: 'register',
      data: { playerId: 'host', playerName: 'Host' }
    });

    server.handleMessage(playerSocket, {
      type: 'register',
      data: { playerId: 'player', playerName: 'Player' }
    });

    // Create session
    server.handleMessage(hostSocket, {
      type: 'create_session',
      data: { sessionId: 'story_session' }
    });

    // Player joins session
    server.handleMessage(playerSocket, {
      type: 'join_session',
      data: { sessionId: 'story_session' }
    });

    const session = server.sessions.get('story_session');
    expect(session.players.size).toBe(2);

    // Start story (mock)
    const mockStory = {
      id: 'test_story',
      title: 'Test Adventure',
      start_page_id: 'start',
      getPage: jest.fn().mockReturnValue({
        id: 'start',
        text: 'Your adventure begins...',
        prompts: [
          { text: 'Go north', target_id: 'north' },
          { text: 'Go south', target_id: 'south' }
        ]
      })
    };

    session.startStory(mockStory);
    expect(session.gameState).toBe('story');

    // Start voting
    session.startVoting();
    expect(session.voting.active).toBe(true);

    // Cast votes
    server.handleMessage(hostSocket, {
      type: 'cast_vote',
      data: { choiceIndex: 0 }
    });

    server.handleMessage(playerSocket, {
      type: 'cast_vote',
      data: { choiceIndex: 0 }
    });

    expect(session.voting.votes.size).toBe(2);

    // Chat messages
    server.handleMessage(hostSocket, {
      type: 'chat_message',
      data: { message: 'Good choice everyone!' }
    });

    // Verify messages were broadcast
    expect(hostSocket.messages.length).toBeGreaterThan(0);
    expect(playerSocket.messages.length).toBeGreaterThan(0);
  });
});