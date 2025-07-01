# FlowGenius Development Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Plugin
```bash
npm run build
```

### 3. Test in Obsidian

#### Option A: Using symlink (Recommended for development)
1. Find your Obsidian vault's `.obsidian/plugins` directory
2. Create a symlink to this plugin directory:
   ```bash
   ln -s /path/to/this/plugin /path/to/vault/.obsidian/plugins/flow-genius
   ```
3. Reload Obsidian or go to Settings → Community plugins → Reload

#### Option B: Manual copy
1. Copy `main.js`, `manifest.json`, and `styles.css` to your vault's `.obsidian/plugins/flow-genius/` directory
2. Reload Obsidian

### 4. Enable the Plugin
1. Go to Settings → Community plugins
2. Disable Safe mode if needed
3. Find "FlowGenius" and enable it

### 5. Configure API Keys
1. Go to Settings → FlowGenius
2. Add your OpenAI API key (starts with `sk-`)
3. Add your Replicate API key (starts with `r8_`)

## Development Workflow

### Watch Mode
For automatic rebuilding during development:
```bash
npm run dev
```

### Testing
1. Create or open a note in Obsidian
2. Add some content (the plugin analyzes up to 8000 characters)
3. Click the FlowGenius icon in the left ribbon or use Command Palette (Cmd/Ctrl+P) → "Generate immersive background"
4. Wait for generation (5-10 seconds)
5. The background should appear behind your notes

### Debugging
- Open Obsidian Developer Console: View → Toggle Developer Tools (Cmd/Ctrl+Shift+I)
- Check for errors in the console
- Plugin logs workflow state changes

## Project Structure
```
├── main.ts                 # Main plugin file
├── src/
│   ├── types.ts           # TypeScript interfaces
│   ├── core/
│   │   └── ContentAnalyzer.ts    # Extracts and analyzes note content
│   ├── api/
│   │   ├── OpenAIClient.ts       # OpenAI API integration
│   │   └── ReplicateClient.ts    # Replicate API integration
│   └── workflows/
│       └── GenerationWorkflow.ts  # LangGraph-inspired workflow orchestration
```

## API Keys

### OpenAI
- Get your API key from: https://platform.openai.com/api-keys
- Used for generating optimized image prompts from your content

### Replicate
- Get your API key from: https://replicate.com/account/api-tokens
- Used for generating the actual background images

## Troubleshooting

### Plugin doesn't appear in Obsidian
- Make sure you've built the plugin (`npm run build`)
- Check that files are in the correct location
- Try reloading Obsidian

### API errors
- Verify your API keys are correct
- Check you have credits/balance in your accounts
- Look for specific error messages in the developer console

### Background doesn't appear
- Check the opacity setting (default 0.3)
- Try a different theme
- Check developer console for CSS errors 