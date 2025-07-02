# FlowGenius - AI-Powered Immersive Writing Environment for Obsidian

Transform your Obsidian writing experience with AI-generated backgrounds that adapt to your content, creating an immersive environment that enhances creativity and focus.

## Overview

FlowGenius is an Obsidian plugin that dynamically generates contextual backgrounds based on what you're writing. Using advanced AI models, it analyzes your note content and creates beautiful, atmospheric backgrounds that complement your work - whether you're writing fantasy stories, technical documentation, or personal journals.

## ✨ Features

- **AI-Powered Background Generation**: Leverages OpenAI for intelligent prompt creation and Replicate for high-quality image generation
- **Content-Aware**: Analyzes your writing to generate backgrounds that match the mood, theme, and setting of your content
- **Subtle Animations**: Includes Ken Burns effect (pan/zoom) for a dynamic yet non-distracting experience
- **Customizable Styles**: Choose from photorealistic, artistic, abstract, or custom image styles
- **Vault-Wide Persistence**: Backgrounds persist across sessions until manually changed
- **Performance Optimized**: Uses CSS animations and intelligent caching for smooth performance

## 🚀 Installation

### Prerequisites
- Obsidian v0.15.0 or higher
- API keys for:
  - [OpenAI](https://platform.openai.com/api-keys) (for prompt generation)
  - [Replicate](https://replicate.com/account/api-tokens) (for image generation)

### Install from Obsidian Community Plugins
1. Open Obsidian Settings
2. Navigate to Community Plugins and turn off Restricted Mode
3. Click "Browse" and search for "FlowGenius"
4. Install and enable the plugin

### Manual Installation
1. Download the latest release from the [releases page](https://github.com/yourusername/obsidian-flowgenius/releases)
2. Extract the files to your vault's `.obsidian/plugins/flowgenius/` folder
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

## ⚙️ Configuration

1. Open Settings → FlowGenius
2. Add your API keys:
   - **OpenAI API Key**: For generating optimized image prompts
   - **Replicate API Key**: For creating the actual background images
3. Customize your preferences:
   - **Image Style**: Choose between photorealistic, artistic, abstract, or custom styles
   - **Animation Style**: Select subtle, dynamic, or static backgrounds
   - **Opacity**: Adjust background transparency (0.1 - 0.5 recommended)
   - **Custom Instructions**: Add specific preferences for image generation

## 📖 Usage

### Generate a Background
1. Open any note in Obsidian
2. Click the FlowGenius icon in the ribbon (left sidebar) or use the command palette (`Cmd/Ctrl + P`)
3. Select "Generate Immersive Background"
4. Wait 5-10 seconds for the AI to analyze your content and generate a background
5. The background will automatically apply to your entire vault

### Clear Background
- Use the "Clear Background" command from the command palette
- Or click the FlowGenius icon while a background is active

### Tips for Best Results
- Write at least a paragraph of content before generating a background
- Use descriptive language that conveys mood and setting
- Experiment with different image styles for various types of content
- Adjust opacity if the background is too distracting

## 🛠️ Technical Architecture

FlowGenius uses a sophisticated workflow pipeline:

1. **Content Analysis**: Extracts up to 8,000 characters from your active note
2. **Prompt Engineering**: Uses GPT-4 to create optimized image generation prompts
3. **Image Generation**: Leverages Stable Diffusion XL via Replicate for high-quality backgrounds
4. **Background Integration**: Seamlessly injects CSS for smooth animations and effects

### Key Components
- `ContentAnalyzer`: Processes and analyzes note content
- `OpenAIClient`: Handles prompt generation via OpenAI API
- `ReplicateClient`: Manages image generation through Replicate
- `GenerationWorkflow`: Orchestrates the entire generation pipeline
- `BackgroundManager`: Handles CSS injection and animations

## 🔧 Development

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/obsidian-flowgenius.git

# Install dependencies
npm install

# Build in development mode
npm run dev

# Build for production
npm run build
```

### Project Structure
```
obsidian-flowgenius/
├── src/
│   ├── api/              # API clients for OpenAI and Replicate
│   ├── core/             # Core functionality (content analysis)
│   ├── workflows/        # LangGraph-inspired workflow orchestration
│   └── types.ts          # TypeScript type definitions
├── docs/                 # Documentation and planning
├── main.ts              # Plugin entry point
└── styles.css           # CSS for animations and styling
```

## 📝 Roadmap

- [ ] Generate multiple image options for user selection
- [ ] Per-note background settings
- [ ] Background history and favorites
- [ ] Integration with local AI models
- [ ] Export/import background collections
- [ ] Real-time background updates as you type

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with the [Obsidian API](https://github.com/obsidianmd/obsidian-api)
- Powered by [OpenAI](https://openai.com) and [Replicate](https://replicate.com)
- Inspired by the need for more immersive writing environments

## ⚠️ Disclaimer

This plugin requires API keys for external services which may incur costs. Please review the pricing for [OpenAI](https://openai.com/pricing) and [Replicate](https://replicate.com/pricing) before use.
