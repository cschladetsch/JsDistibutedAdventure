# 🎮 JavaScript Distributed Story System v2.0

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

An advanced interactive text-based RPG story system with AI-powered narrative generation, multiplayer support, and rich gameplay mechanics.

## ✨ Features

### 🎯 Core System
- **Interactive Text Adventures** with branching narratives
- **AI-Powered Story Generation** using Claude, DeepSeek, and web enhancement
- **Advanced Combat System** with timing-based mechanics, magic, and equipment
- **Real-time Multiplayer** with WebSocket support and voting systems
- **Rich Terminal UI** with ASCII art, animations, and visual effects

### 🤖 AI Integration
- **Multiple AI Models** for diverse story generation
- **Adaptive Difficulty** that learns from player behavior
- **Web-Enhanced Stories** using real-time content fetching
- **Player Profiling** for personalized experiences
- **Dynamic Choice Generation** based on player preferences

### ⚔️ RPG Mechanics
- **Equipment System** with weapons, armor, and durability
- **Magic & Spells** with mana management and cooldowns
- **Character Progression** with stats, levels, and skills
- **Quest System** with main, side, and daily quests
- **Settlement Building** and NPC relationships

### 🌐 Multiplayer Features
- **Shared Story Sessions** with up to 4 players
- **Democratic Voting** for story choices
- **Real-time Chat** and player interaction
- **Session Management** with host controls
- **Spectator Mode** for observers

### 🎨 Enhanced UI/UX
- **Rich Console Interface** with blessed.js terminal UI
- **ASCII Art** and visual effects
- **Sound Effects** and animations
- **Health/Mana Bars** with visual indicators
- **Inventory Management** with visual displays

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/yourname/javascript-distributed-story.git
cd javascript-distributed-story

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start the game
npm start
```

### First Run

```bash
# 🎯 QUICK START - Play the timing combat game
npm run play:simple

# Generate different story types
npm run generate:random     # Random interesting story
npm run generate:mystery    # Detective/puzzle story
npm run generate:horror     # Horror/thriller story

# Generate massive open worlds
npm run generate:fantasy    # Fantasy kingdom with quests
npm run generate:space-station  # Space station adventure

# Play generated stories
npm run play:latest
python run.py
```

## 📖 Configuration

### Environment Variables

Create a `.env` file with your configuration:

```env
# API Keys
CLAUDE_API_KEY=your_claude_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
GROQ_API_KEY=your_groq_api_key

# Server Settings
PORT=3000
NODE_ENV=development

# Story Settings
DEFAULT_STORY_LENGTH=20
CONTENT_RATING=PG-13
ENABLE_WEB_ENHANCEMENT=true

# Combat Settings
COMBAT_ANIMATION_SPEED=60
TIMING_BAR_DIFFICULTY=normal
```

## 🎮 How to Play

### Single Player Mode

1. **Start a new adventure:**
   ```bash
   npm start
   ```

2. **Navigate the story** using numbered choices (1-9)
3. **Use hot keys:**
   - `v` - View inventory
   - `q` - Quest log
   - `s` - Player stats
   - `h` - Help

### Combat System

- **Timing Bar Combat:** Press ENTER when the marker hits the optimal zones
  - 🎯 **Perfect Hit:** 2x damage (critical hit!)
  - ✅ **Excellent:** 1.5x damage (bonus damage)
  - ⚠️ **Good Hit:** 1.2x damage (normal damage)
  - ❌ **Poor Timing:** 0.5x damage (reduced damage)

- **ATK/DEF System:** Your attack vs enemy defense determines damage
- **Item Effects:** Use scrolls and potions to boost stats permanently
- **Equipment System:** Weapons, armor, and magical items
- **Magic System:** Cast spells using mana

### Multiplayer Mode

1. **Start server:**
   ```bash
   npm run server
   ```

2. **Players connect** via WebSocket
3. **Host starts story** and players vote on choices
4. **Democratic decision making** with real-time voting

## 🛠️ Development

### Project Structure

```
javascript-distributed-story/
├── lib/                          # Core library modules
│   ├── Logger.js                 # Logging system
│   ├── ConfigManager.js          # Configuration management
│   ├── ErrorHandler.js           # Error handling
│   ├── EnhancedCombatSystem.js   # Combat mechanics
│   ├── EnhancedUI.js             # User interface
│   ├── AdaptiveAI.js             # AI learning system
│   ├── GameplayFeatures.js       # Quests, NPCs, settlements
│   └── MultiplayerSystem.js      # Multiplayer support
├── config/                       # Configuration files
├── stories/                      # Generated stories
├── external/                     # External integrations
├── tests/                        # Test files
└── docs/                         # Documentation
```

## 📚 Scripts Reference

### Story Generation
```bash
npm run generate         # Generate new story
npm run generate:web     # Generate with web enhancement
npm run generate:rich    # Generate rich dynamic story
```

### Gameplay
```bash
npm run play            # Play interactive story
npm run play:latest     # Play most recent story
npm run play:choice     # Play with choice selection
```

### Combat
```bash
npm run combat:demo     # Show combat bar visualization
npm run combat:simulate # Simulate combat sequence
```

### Development
```bash
npm run dev            # Start in development mode
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint issues
npm run format         # Format with Prettier
npm run build          # Build and validate
npm run test           # Run tests
npm run test:coverage  # Run tests with coverage
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit changes:** `git commit -m 'Add amazing feature'`
4. **Push to branch:** `git push origin feature/amazing-feature`
5. **Open Pull Request**

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for interactive storytelling enthusiasts**

*Transform your imagination into playable adventures!*