# DeepSeek Local Setup Guide

This guide explains how to set up DeepSeek locally for X-rated story generation.

## Prerequisites

- Node.js installed
- Git installed
- At least 8GB RAM (16GB recommended)
- 10GB+ free disk space

## Option 1: Using Ollama (Recommended)

### 1. Install Ollama

**Windows:**
```bash
# Download and install from: https://ollama.ai/download/windows
# Or use winget:
winget install Ollama.Ollama
```

**Linux/macOS:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Pull DeepSeek Model

```bash
# Pull the DeepSeek R1 model (7B parameters)
ollama pull deepseek-r1:latest

# Or for a smaller model:
ollama pull deepseek-r1:1.5b

# For maximum performance (requires 32GB+ RAM):
ollama pull deepseek-r1:32b
```

### 3. Start Ollama Service

```bash
# Start Ollama (usually runs automatically)
ollama serve
```

### 4. Test the Setup

```bash
# Test the model
ollama run deepseek-r1:latest
```

Type a test prompt like "Write a short story" and press Enter. If it responds, the setup is working.

## Option 2: Using LM Studio

### 1. Download LM Studio
- Go to https://lmstudio.ai/
- Download and install LM Studio

### 2. Download DeepSeek Model
- Open LM Studio
- Search for "deepseek" in the model browser
- Download "deepseek-r1-distill-llama-7b"

### 3. Start Local Server
- Go to "Local Server" tab
- Load the DeepSeek model
- Start the server on port 1234

### 4. Update Configuration
Update the DeepSeek client configuration:
```javascript
const hybridGenerator = new HybridStoryGenerator(storySystem, {
    deepSeek: {
        baseUrl: 'http://localhost:1234', // LM Studio endpoint
        model: 'deepseek-r1-distill-llama-7b',
        timeout: 45000
    }
});
```

## Configuration

### Content Rating Settings

```javascript
// For R-rated content
const hybridGenerator = new HybridStoryGenerator(storySystem, {
    contentRating: 'R',
    enableXRated: true,
    xRatedThreshold: 0.3 // 30% mature content
});

// For X-rated content
const hybridGenerator = new HybridStoryGenerator(storySystem, {
    contentRating: 'X',
    enableXRated: true,
    xRatedThreshold: 0.5 // 50% explicit content
});
```

### Model Parameters

```javascript
const hybridGenerator = new HybridStoryGenerator(storySystem, {
    deepSeek: {
        baseUrl: 'http://localhost:11434',
        model: 'deepseek-r1:latest',
        timeout: 60000,
        maxRetries: 3
    }
});
```

## Testing the Setup

### 1. Check Model Availability
```bash
node -e "
const DeepSeekClient = require('./external/DeepSeekClient');
const client = new DeepSeekClient();
client.isAvailable().then(available => {
    console.log('DeepSeek available:', available);
    if (available) {
        client.getModelInfo().then(info => console.log('Model info:', info));
    }
});
"
```

### 2. Generate Test Story
```bash
# Generate an X-rated story
node generate_xrated_story.js
```

### 3. Run the Generated Story
```bash
# Play the latest generated story
node run_story.js
```

## Troubleshooting

### Common Issues

**1. "Connection refused" errors:**
- Ensure Ollama is running: `ollama serve`
- Check if port 11434 is available
- Try restarting Ollama

**2. "Model not found" errors:**
- Verify model is pulled: `ollama list`
- Pull the model again: `ollama pull deepseek-r1:latest`

**3. Slow generation:**
- Use a smaller model (1.5b instead of 7b)
- Increase timeout values
- Close other applications to free RAM

**4. Content not explicit enough:**
- Increase `xRatedThreshold` value
- Adjust model temperature (higher = more creative)
- Modify prompts in DeepSeekClient.js

### Performance Optimization

**For better performance:**
- Use GPU acceleration if available
- Increase system RAM
- Use SSD storage
- Close unnecessary applications

**Model size recommendations:**
- 8GB RAM: deepseek-r1:1.5b
- 16GB RAM: deepseek-r1:7b
- 32GB+ RAM: deepseek-r1:32b

## Security Notes

- DeepSeek runs locally - no data sent to external servers
- Generated content is stored locally in the `stories/` folder
- X-rated content is marked with appropriate tags
- All generated content includes mature content warnings

## API Endpoints

The DeepSeek client expects these Ollama endpoints:
- `GET /api/tags` - List available models
- `POST /api/generate` - Generate completions
- `POST /api/show` - Get model information

## Examples

### Basic X-rated Generation
```javascript
const { HybridStoryGenerator } = require('./external/HybridStoryGenerator');
const { StorySystem } = require('./StorySystem');

const system = new StorySystem();
const generator = new HybridStoryGenerator(system, {
    contentRating: 'X',
    enableXRated: true
});

const story = await generator.generateHybridStory(
    "A passionate cyberpunk romance",
    20
);
```

### Custom Themes
```javascript
const story = await generator.generateHybridStory(
    "Your custom theme here",
    25,
    {
        themes: ['romance', 'passion', 'adventure'],
        includeExplicitContent: true
    }
);
```