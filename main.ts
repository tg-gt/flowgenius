import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, addIcon } from 'obsidian';
import { FlowGeniusSettings } from './src/types';
import { GenerationWorkflow } from './src/workflows/GenerationWorkflow';

const DEFAULT_SETTINGS: FlowGeniusSettings = {
	openaiApiKey: '',
	replicateApiKey: '',
	updateFrequency: 'manual',
	animationStyle: 'subtle',
	opacity: 0.3,
	imageStyle: 'photorealistic',
	customInstructions: '',
	enabledFolders: [],
	currentBackground: null
}

export default class FlowGeniusPlugin extends Plugin {
	settings: FlowGeniusSettings;
	statusBarItem: HTMLElement;
	backgroundStyleEl: HTMLStyleElement;
	workflow: GenerationWorkflow;

	async onload() {
		await this.loadSettings();

		// Initialize workflow
		this.workflow = new GenerationWorkflow(this.settings);

		// Add custom icon for FlowGenius
		addIcon('flow-genius', '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>');

		// Create ribbon icon for manual generation
		const ribbonIconEl = this.addRibbonIcon('flow-genius', 'Generate Immersive Background', async (evt: MouseEvent) => {
			await this.generateBackground();
		});
		ribbonIconEl.addClass('flow-genius-ribbon-icon');

		// Add status bar item for generation status
		this.statusBarItem = this.addStatusBarItem();
		this.statusBarItem.setText('');

		// Add command palette commands
		this.addCommand({
			id: 'generate-background',
			name: 'Generate immersive background',
			callback: async () => {
				await this.generateBackground();
			}
		});

		this.addCommand({
			id: 'clear-background',
			name: 'Clear background',
			callback: () => {
				this.clearBackground();
			}
		});

		// Add settings tab
		this.addSettingTab(new FlowGeniusSettingTab(this.app, this));

		// Initialize background style element
		this.backgroundStyleEl = document.createElement('style');
		document.head.appendChild(this.backgroundStyleEl);

		// Restore background if exists
		if (this.settings.currentBackground) {
			this.applyBackground(this.settings.currentBackground);
		}
	}

	onunload() {
		// Remove background style element
		this.backgroundStyleEl.remove();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async generateBackground() {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		
		await this.workflow.execute(
			view,
			(status) => this.updateStatus(status),
			(imageUrl) => {
				this.settings.currentBackground = imageUrl;
				this.saveSettings();
				this.applyBackground(imageUrl);
			}
		);
	}

	clearBackground() {
		this.settings.currentBackground = null;
		this.saveSettings();
		this.applyBackground(null);
		new Notice('Background cleared');
	}

	applyBackground(imageUrl: string | null) {
		if (!imageUrl) {
			this.backgroundStyleEl.textContent = '';
			return;
		}

		// Apply background with animation
		const css = `
			.workspace {
				position: relative;
			}
			
			.workspace::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background-image: url('${imageUrl}');
				background-size: cover;
				background-position: center;
				opacity: ${this.settings.opacity};
				z-index: -1;
				pointer-events: none;
				animation: kenBurns 30s ease-in-out infinite alternate;
			}
			
			@keyframes kenBurns {
				0% {
					transform: scale(1) translate(0, 0);
				}
				100% {
					transform: scale(1.1) translate(-2%, -2%);
				}
			}
		`;

		this.backgroundStyleEl.textContent = css;
	}

	updateStatus(message: string) {
		this.statusBarItem.setText(message);
	}
}

class FlowGeniusSettingTab extends PluginSettingTab {
	plugin: FlowGeniusPlugin;

	constructor(app: App, plugin: FlowGeniusPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'FlowGenius Settings'});

		// API Keys Section
		containerEl.createEl('h3', {text: 'API Configuration'});

		new Setting(containerEl)
			.setName('OpenAI API Key')
			.setDesc('Your OpenAI API key for generating prompts')
			.addText(text => text
				.setPlaceholder('sk-...')
				.setValue(this.plugin.settings.openaiApiKey)
				.onChange(async (value) => {
					this.plugin.settings.openaiApiKey = value;
					await this.plugin.saveSettings();
				}))
			.addExtraButton(button => button
				.setIcon('eye-off')
				.setTooltip('Toggle visibility')
				.onClick(() => {
					const inputEl = containerEl.querySelector('input[placeholder="sk-..."]') as HTMLInputElement;
					inputEl.type = inputEl.type === 'password' ? 'text' : 'password';
				}));

		new Setting(containerEl)
			.setName('Replicate API Key')
			.setDesc('Your Replicate API key for generating images')
			.addText(text => text
				.setPlaceholder('r8_...')
				.setValue(this.plugin.settings.replicateApiKey)
				.onChange(async (value) => {
					this.plugin.settings.replicateApiKey = value;
					await this.plugin.saveSettings();
				}))
			.addExtraButton(button => button
				.setIcon('eye-off')
				.setTooltip('Toggle visibility')
				.onClick(() => {
					const inputEl = containerEl.querySelector('input[placeholder="r8_..."]') as HTMLInputElement;
					inputEl.type = inputEl.type === 'password' ? 'text' : 'password';
				}));

		// Visual Settings Section
		containerEl.createEl('h3', {text: 'Visual Settings'});

		new Setting(containerEl)
			.setName('Background Opacity')
			.setDesc('How transparent the background should be (0.1 - 0.5)')
			.addSlider(slider => slider
				.setLimits(0.1, 0.5, 0.05)
				.setValue(this.plugin.settings.opacity)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.opacity = value;
					await this.plugin.saveSettings();
					// Update background immediately if one exists
					if (this.plugin.settings.currentBackground) {
						this.plugin.applyBackground(this.plugin.settings.currentBackground);
					}
				}));

		new Setting(containerEl)
			.setName('Animation Style')
			.setDesc('How the background should animate')
			.addDropdown(dropdown => dropdown
				.addOption('subtle', 'Subtle (Ken Burns)')
				.addOption('dynamic', 'Dynamic')
				.addOption('static', 'Static')
				.setValue(this.plugin.settings.animationStyle)
				.onChange(async (value: 'subtle' | 'dynamic' | 'static') => {
					this.plugin.settings.animationStyle = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Image Style')
			.setDesc('The visual style for generated images')
			.addText(text => text
				.setPlaceholder('e.g., photorealistic, artistic, abstract')
				.setValue(this.plugin.settings.imageStyle)
				.onChange(async (value) => {
					this.plugin.settings.imageStyle = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Custom Instructions')
			.setDesc('Additional instructions for image generation')
			.addTextArea(text => text
				.setPlaceholder('e.g., dark and moody, vibrant colors, minimalist...')
				.setValue(this.plugin.settings.customInstructions)
				.onChange(async (value) => {
					this.plugin.settings.customInstructions = value;
					await this.plugin.saveSettings();
				}));
	}
}
