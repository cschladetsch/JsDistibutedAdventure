/**
 * Advanced Quest System
 * Handles quest tracking, progression, and rewards for open world stories
 */

export class QuestSystem {
    constructor() {
        this.activeQuests = new Map();
        this.completedQuests = new Map();
        this.questGivers = new Map();
        this.questChains = new Map();
        this.worldState = {};
    }

    /**
     * Quest types and their behaviors
     */
    static QUEST_TYPES = {
        MAIN: 'main',           // Story-critical quests
        SIDE: 'side',           // Optional quests
        DAILY: 'daily',         // Repeatable daily quests
        CHAIN: 'chain',         // Multi-part quest series
        FETCH: 'fetch',         // Collect/deliver items
        KILL: 'kill',           // Defeat specific enemies
        ESCORT: 'escort',       // Protect NPCs
        EXPLORE: 'explore',     // Discover locations
        PUZZLE: 'puzzle',       // Solve mysteries/riddles
        SOCIAL: 'social'        // Talk to NPCs/build relationships
    };

    /**
     * Quest status values
     */
    static QUEST_STATUS = {
        LOCKED: 'locked',           // Not yet available
        AVAILABLE: 'available',     // Can be started
        ACTIVE: 'active',           // Currently in progress
        COMPLETED: 'completed',     // Successfully finished
        FAILED: 'failed',           // Failed or abandoned
        TURNED_IN: 'turned_in'      // Completed and rewards claimed
    };

    /**
     * Add a new quest to the system
     */
    addQuest(questData) {
        const quest = {
            id: questData.id,
            title: questData.title,
            description: questData.description,
            type: questData.type || QuestSystem.QUEST_TYPES.SIDE,
            status: questData.status || QuestSystem.QUEST_STATUS.AVAILABLE,

            // Quest giver information
            giver: questData.giver || null,
            giverLocation: questData.giverLocation || null,

            // Requirements to start quest
            requirements: questData.requirements || {},

            // Quest objectives
            objectives: questData.objectives || [],
            currentObjective: 0,

            // Rewards
            rewards: questData.rewards || {},

            // Quest chain information
            chainId: questData.chainId || null,
            previousQuest: questData.previousQuest || null,
            nextQuest: questData.nextQuest || null,

            // Progress tracking
            progress: {},
            startTime: null,
            completionTime: null,

            // Metadata
            estimatedTime: questData.estimatedTime || 'Unknown',
            difficulty: questData.difficulty || 'Normal',
            category: questData.category || 'General',

            // Story flags and world state changes
            flagsOnStart: questData.flagsOnStart || [],
            flagsOnComplete: questData.flagsOnComplete || [],
            worldStateChanges: questData.worldStateChanges || {}
        };

        if (quest.status === QuestSystem.QUEST_STATUS.AVAILABLE) {
            this.activeQuests.set(quest.id, quest);
        }

        return quest;
    }

    /**
     * Check if player meets quest requirements
     */
    meetsRequirements(questId, playerState) {
        const quest = this.activeQuests.get(questId) || this.completedQuests.get(questId);
        if (!quest) return false;

        const req = quest.requirements;

        // Check level requirement
        if (req.level && playerState.level < req.level) {
            return { meets: false, reason: `Requires level ${req.level}` };
        }

        // Check stat requirements
        if (req.stats) {
            for (const [stat, value] of Object.entries(req.stats)) {
                if ((playerState.stats[stat] || 0) < value) {
                    return { meets: false, reason: `Requires ${stat}: ${value}` };
                }
            }
        }

        // Check item requirements
        if (req.items) {
            for (const item of req.items) {
                if (!playerState.inventory.includes(item)) {
                    return { meets: false, reason: `Requires item: ${item}` };
                }
            }
        }

        // Check completed quest requirements
        if (req.completedQuests) {
            for (const questId of req.completedQuests) {
                if (!this.completedQuests.has(questId)) {
                    const questTitle = this.getQuestTitle(questId);
                    return { meets: false, reason: `Requires completion of: ${questTitle}` };
                }
            }
        }

        // Check story flags
        if (req.flags) {
            for (const flag of req.flags) {
                if (!playerState.flags.includes(flag)) {
                    return { meets: false, reason: `Requires story progress: ${flag}` };
                }
            }
        }

        // Check reputation requirements
        if (req.reputation) {
            for (const [faction, value] of Object.entries(req.reputation)) {
                if ((playerState.reputation[faction] || 0) < value) {
                    return { meets: false, reason: `Requires ${faction} reputation: ${value}` };
                }
            }
        }

        return { meets: true };
    }

    /**
     * Start a quest
     */
    startQuest(questId, playerState) {
        const quest = this.activeQuests.get(questId);
        if (!quest) {
            return { success: false, error: 'Quest not found' };
        }

        const requirementCheck = this.meetsRequirements(questId, playerState);
        if (!requirementCheck.meets) {
            return { success: false, error: requirementCheck.reason };
        }

        quest.status = QuestSystem.QUEST_STATUS.ACTIVE;
        quest.startTime = new Date();

        // Apply starting flags
        quest.flagsOnStart.forEach(flag => {
            if (!playerState.flags.includes(flag)) {
                playerState.flags.push(flag);
            }
        });

        // Initialize objective progress
        quest.objectives.forEach((objective, index) => {
            quest.progress[index] = {
                completed: false,
                current: 0,
                required: objective.required || 1,
                description: objective.description
            };
        });

        return {
            success: true,
            quest: quest,
            message: `Started quest: ${quest.title}`
        };
    }

    /**
     * Update quest progress
     */
    updateQuestProgress(questId, objectiveIndex, amount = 1, playerState) {
        const quest = this.activeQuests.get(questId);
        if (!quest || quest.status !== QuestSystem.QUEST_STATUS.ACTIVE) {
            return { success: false, error: 'Quest not active' };
        }

        if (!quest.progress[objectiveIndex]) {
            return { success: false, error: 'Invalid objective' };
        }

        const objective = quest.progress[objectiveIndex];
        const previousCurrent = objective.current;

        objective.current = Math.min(objective.current + amount, objective.required);

        if (objective.current >= objective.required && !objective.completed) {
            objective.completed = true;

            // Check if all objectives are complete
            const allComplete = Object.values(quest.progress).every(obj => obj.completed);

            if (allComplete) {
                return this.completeQuest(questId, playerState);
            }

            return {
                success: true,
                objectiveCompleted: true,
                message: `Objective completed: ${objective.description}`,
                progress: objective
            };
        }

        return {
            success: true,
            objectiveCompleted: false,
            message: `Progress: ${objective.current}/${objective.required}`,
            progress: objective,
            progressGained: objective.current - previousCurrent
        };
    }

    /**
     * Complete a quest
     */
    completeQuest(questId, playerState) {
        const quest = this.activeQuests.get(questId);
        if (!quest) {
            return { success: false, error: 'Quest not found' };
        }

        quest.status = QuestSystem.QUEST_STATUS.COMPLETED;
        quest.completionTime = new Date();

        // Move from active to completed
        this.activeQuests.delete(questId);
        this.completedQuests.set(questId, quest);

        // Apply completion flags
        quest.flagsOnComplete.forEach(flag => {
            if (!playerState.flags.includes(flag)) {
                playerState.flags.push(flag);
            }
        });

        // Apply world state changes
        Object.assign(this.worldState, quest.worldStateChanges);

        // Unlock next quest in chain
        if (quest.nextQuest) {
            this.unlockQuest(quest.nextQuest);
        }

        return {
            success: true,
            quest: quest,
            message: `Quest completed: ${quest.title}!`,
            rewards: quest.rewards
        };
    }

    /**
     * Award quest rewards to player
     */
    awardRewards(questId, playerState) {
        const quest = this.completedQuests.get(questId);
        if (!quest || quest.status !== QuestSystem.QUEST_STATUS.COMPLETED) {
            return { success: false, error: 'Quest not completed' };
        }

        const rewards = quest.rewards;
        const awardedRewards = [];

        // Award experience
        if (rewards.experience) {
            playerState.experience += rewards.experience;
            awardedRewards.push(`${rewards.experience} XP`);
        }

        // Award gold
        if (rewards.gold) {
            playerState.gold += rewards.gold;
            awardedRewards.push(`${rewards.gold} gold`);
        }

        // Award items
        if (rewards.items) {
            rewards.items.forEach(item => {
                playerState.inventory.push(item);
                awardedRewards.push(item);
            });
        }

        // Award stat increases
        if (rewards.stats) {
            Object.entries(rewards.stats).forEach(([stat, increase]) => {
                playerState.stats[stat] = (playerState.stats[stat] || 0) + increase;
                awardedRewards.push(`+${increase} ${stat}`);
            });
        }

        // Award reputation
        if (rewards.reputation) {
            Object.entries(rewards.reputation).forEach(([faction, increase]) => {
                playerState.reputation[faction] = (playerState.reputation[faction] || 0) + increase;
                awardedRewards.push(`+${increase} ${faction} reputation`);
            });
        }

        quest.status = QuestSystem.QUEST_STATUS.TURNED_IN;

        return {
            success: true,
            rewards: awardedRewards,
            message: `Rewards claimed: ${awardedRewards.join(', ')}`
        };
    }

    /**
     * Get all available quests for player
     */
    getAvailableQuests(playerState) {
        const available = [];

        for (const quest of this.activeQuests.values()) {
            if (quest.status === QuestSystem.QUEST_STATUS.AVAILABLE) {
                const canStart = this.meetsRequirements(quest.id, playerState);
                if (canStart.meets) {
                    available.push(quest);
                }
            }
        }

        return available;
    }

    /**
     * Get all active quests
     */
    getActiveQuests() {
        return Array.from(this.activeQuests.values())
            .filter(quest => quest.status === QuestSystem.QUEST_STATUS.ACTIVE);
    }

    /**
     * Get completed quests
     */
    getCompletedQuests() {
        return Array.from(this.completedQuests.values());
    }

    /**
     * Generate quest log summary
     */
    generateQuestLog(playerState) {
        const activeQuests = this.getActiveQuests();
        const availableQuests = this.getAvailableQuests(playerState);
        const completedQuests = this.getCompletedQuests();

        let log = "📋 QUEST LOG\n";
        log += "=" * 50 + "\n\n";

        // Active quests
        if (activeQuests.length > 0) {
            log += "🔄 ACTIVE QUESTS:\n";
            activeQuests.forEach(quest => {
                log += `• ${quest.title} (${quest.type})\n`;
                log += `  ${quest.description}\n`;

                // Show current objective
                const currentObj = quest.objectives[quest.currentObjective];
                if (currentObj) {
                    const progress = quest.progress[quest.currentObjective];
                    log += `  Current: ${currentObj.description} (${progress.current}/${progress.required})\n`;
                }

                log += `  Difficulty: ${quest.difficulty} | Est. Time: ${quest.estimatedTime}\n\n`;
            });
        }

        // Available quests
        if (availableQuests.length > 0) {
            log += "✨ AVAILABLE QUESTS:\n";
            availableQuests.forEach(quest => {
                log += `• ${quest.title} (${quest.type})\n`;
                log += `  ${quest.description}\n`;
                if (quest.giver) {
                    log += `  Quest Giver: ${quest.giver} at ${quest.giverLocation}\n`;
                }
                log += `  Difficulty: ${quest.difficulty} | Est. Time: ${quest.estimatedTime}\n\n`;
            });
        }

        // Completed quests count
        log += `🏆 COMPLETED QUESTS: ${completedQuests.length}\n`;

        return log;
    }

    /**
     * Create predefined quest templates
     */
    static createQuestTemplates() {
        return {
            // Main story quest template
            mainStoryQuest: (title, description, requirements = {}) => ({
                type: QuestSystem.QUEST_TYPES.MAIN,
                title,
                description,
                requirements,
                difficulty: 'Normal',
                estimatedTime: '15-30 minutes',
                category: 'Main Story'
            }),

            // Fetch quest template
            fetchQuest: (title, items, npc, location) => ({
                type: QuestSystem.QUEST_TYPES.FETCH,
                title,
                description: `Collect ${items.join(', ')} and deliver to ${npc}`,
                objectives: [
                    { description: `Collect ${items.join(', ')}`, required: items.length },
                    { description: `Return to ${npc}`, required: 1 }
                ],
                giver: npc,
                giverLocation: location,
                difficulty: 'Easy',
                estimatedTime: '5-10 minutes'
            }),

            // Combat quest template
            combatQuest: (title, enemy, count, location) => ({
                type: QuestSystem.QUEST_TYPES.KILL,
                title,
                description: `Defeat ${count} ${enemy} in ${location}`,
                objectives: [
                    { description: `Defeat ${enemy}`, required: count }
                ],
                difficulty: 'Normal',
                estimatedTime: '10-20 minutes'
            }),

            // Exploration quest template
            explorationQuest: (title, locations) => ({
                type: QuestSystem.QUEST_TYPES.EXPLORE,
                title,
                description: `Discover and explore ${locations.join(', ')}`,
                objectives: locations.map(loc => ({
                    description: `Explore ${loc}`,
                    required: 1
                })),
                difficulty: 'Easy',
                estimatedTime: '10-15 minutes'
            })
        };
    }

    /**
     * Helper methods
     */
    unlockQuest(questId) {
        const quest = this.activeQuests.get(questId);
        if (quest && quest.status === QuestSystem.QUEST_STATUS.LOCKED) {
            quest.status = QuestSystem.QUEST_STATUS.AVAILABLE;
        }
    }

    getQuestTitle(questId) {
        const quest = this.activeQuests.get(questId) || this.completedQuests.get(questId);
        return quest ? quest.title : 'Unknown Quest';
    }

    getQuestProgress(questId) {
        const quest = this.activeQuests.get(questId);
        return quest ? quest.progress : null;
    }

    failQuest(questId, reason = 'Quest failed') {
        const quest = this.activeQuests.get(questId);
        if (quest) {
            quest.status = QuestSystem.QUEST_STATUS.FAILED;
            quest.failureReason = reason;
            this.activeQuests.delete(questId);
            return { success: true, message: reason };
        }
        return { success: false, error: 'Quest not found' };
    }
}

export default QuestSystem;