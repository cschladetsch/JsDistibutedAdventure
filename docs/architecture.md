---
layout: default
title: Architecture
---

# Interactive Story System Architecture

## Story generation flow

```mermaid
flowchart TB
    DM[DungeonMaster.js] --> SG[StoryGenerator.js]
    SG --> LLM[LLMStoryGenerator.js]
    LLM --> Prompt[Prompt.js]
    DM --> SS[StorySystem.js / StorySystemModule.js]
    SS --> Story[Story.js]
    Story --> Page[Page.js]
    DM --> Combat[Skill-based combat timing]
```
