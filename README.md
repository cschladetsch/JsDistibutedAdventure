# Interactive Story System

A text-based interactive story system with RPG elements, dynamic story generation, and skill-based combat timing mechanics.

## 🎮 Game Features

- **Interactive Stories**: Branching narrative with meaningful choices
- **Combat System**: Skill-based timing bar for attacks
- **RPG Elements**: Character stats, inventory, experience system
- **Story Generation**: Dynamic content creation
- **Colorful Interface**: Rich console output with colors

## 🚀 Quick Start

### Generate a Story
```bash
# Generate story with specified pages
python run.py --generate 50

# Or use the batch file generator
generate_story.bat
```

### Play Stories
```bash
# Play latest story
python play_latest.py

# Choose which story to play
python play_story_choice.py

# Direct Node.js
node run_story.js

# Use launcher
play_story.cmd
```

## 🎯 Combat System

The game features a unique timing-based combat system:

- **Timing Bar**: Animated bar with colored zones
- **Blue Target**: Small blue zone for critical hits
- **Skill-Based**: Precise timing determines damage
- **Visual Feedback**: Colored combat interface

## 📦 File Structure

```
JavascriptDisibutedStory/
├── README.md                 # This file
├── StorySystem.js           # Core narrative engine
├── StoryGenerator.js        # Content generation & combat
├── run_story.js            # Main game runner
├── run.py                  # Python launcher
├── play_latest.py          # Play newest story
├── play_story_choice.py    # Choose story to play
├── generate_story.bat      # Story generator
├── play_story.cmd          # Game launcher
├── external/
│   └── colors.js           # Console color utilities
└── stories/                # Generated story files
    └── *.json             # Story data
```

## 🎲 Game Mechanics

### Story Navigation
- **Choice-driven**: Every decision affects the story
- **Rich Interface**: Colorful prompts and descriptions
- **Character Stats**: Track health, mana, experience
- **Inventory**: Manage weapons and items

### Combat System
- **Timing Challenge**: Hit the blue zone for maximum damage
- **Multiple Actions**: Attack, defend, rush, talk, flee
- **Strategic Depth**: Stamina management and positioning
- **Visual Feedback**: Animated timing bar with colors

## 🛠️ Development

### Prerequisites
- Node.js (any recent version)
- Python 3.x (for launchers)

### Story Creation
Stories are generated dynamically with:
- Multiple themes (fantasy, sci-fi, horror, etc.)
- Branching narratives
- Combat encounters
- RPG progression elements

### Adding Features
1. Modify `StorySystem.js` for core mechanics
2. Update `run_story.js` for game flow
3. Enhance `external/colors.js` for visual improvements

## 📝 License

This project is open source. Feel free to use, modify, and distribute.

---

*An interactive adventure awaits. Choose your path wisely.*