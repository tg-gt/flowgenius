# Technical Decisions & Clarifications

## Overview
This document clarifies key technical decisions for the FlowGenius Obsidian plugin based on initial requirements discussion.

## Core Decisions

### 1. **Content Analysis**
- **Scope**: Full note content up to 8,000 characters
- **No truncation strategies needed** - if content exceeds 8k chars, take the first 8k
- **No linked content analysis** - only the current active note

### 2. **Trigger Mechanism**
- **Manual only**: User clicks a button to generate background
- **No real-time updates** - eliminates debouncing complexity
- **No automatic triggers** on save, note switch, etc.
- **Button location**: TBD (ribbon icon, command palette, or both)

### 3. **Caching Strategy**
- **No caching implemented** in MVP
- Each button click generates a fresh image
- Simplifies initial implementation

### 4. **Image Generation**
- **MVP**: Single image generation per trigger
- **Future Enhancement**: Generate 4 options, user selects preferred
- **Resolution**: TBD based on performance testing
- **Model**: Start with single Replicate model (e.g., SDXL)

### 5. **API Key Management**
- **User provides own keys** for:
  - OpenAI API
  - Replicate API
- **Storage**: Obsidian plugin settings (built-in secure storage)
- **UI**: Standard Obsidian settings tab with password-type input fields

### 6. **Background Persistence**
- **Vault-wide**: One background for entire vault
- **Persists** across sessions until manually changed/removed
- **Storage**: Save image reference in plugin data
- **Clear option**: Button to remove current background

## Implementation Flow

[See diagram above]

## Open Questions

### High Priority
1. **UI/UX for trigger button** - Where should it be placed?
   - Ribbon icon (left sidebar)?
   - Command palette action?
   - Both?
   - Floating button?

2. **Background removal** - How does user clear the background?
   - Separate "Clear Background" button?
   - Toggle on/off?
   - Right-click context menu?

3. **Loading state** - What happens during generation (5-10 seconds)?
   - Progress indicator?
   - Disable button?
   - Show status in status bar?

### Medium Priority
4. **Error handling** - What if API calls fail?
   - Show notification?
   - Fallback to previous background?
   - Retry logic?

5. **Image storage** - Where to save generated images?
   - `.obsidian/plugins/flowgenius/backgrounds/`?
   - Configurable location?

### Future Considerations
6. **Per-note backgrounds** - Future feature?
7. **Background history** - Keep last N backgrounds?
8. **Export/import** - Share backgrounds between vaults?

## Technical Stack Confirmation

- **Plugin Framework**: Obsidian Plugin API
- **Animation**: Pure CSS (Ken Burns effect)
- **State Management**: Obsidian plugin settings
- **API Integration**: Direct fetch() calls to OpenAI and Replicate
- **LangGraph**: For workflow orchestration (if complexity warrants)

## Next Steps

1. Resolve high-priority open questions
2. Create basic plugin scaffold with settings UI
3. Implement OpenAI integration for prompt generation
4. Implement Replicate integration for image generation
5. Add CSS injection for background display
6. Add animation effects
7. Polish UX and error handling 