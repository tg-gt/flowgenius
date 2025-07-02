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
	backgroundEl: HTMLElement | null = null;
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

		this.addCommand({
			id: 'debug-background',
			name: 'Debug background status',
			callback: () => {
				this.debugBackground();
			}
		});

		this.addCommand({
			id: 'test-background',
			name: 'Apply test background (gradient)',
			callback: () => {
				// Apply a test gradient background to verify the system works
				this.applyTestBackground();
			}
		});

		this.addCommand({
			id: 'test-css-background',
			name: 'Apply test background (CSS method)',
			callback: () => {
				// Test using pure CSS injection
				this.applyCSSBackground();
			}
		});

		this.addCommand({
			id: 'test-all-methods',
			name: 'Test all background methods',
			callback: () => {
				this.testAllBackgroundMethods();
			}
		});

		this.addCommand({
			id: 'test-overlay',
			name: 'Test text overlay (red for visibility)',
			callback: () => {
				this.testTextOverlay();
			}
		});

		// Add settings tab
		this.addSettingTab(new FlowGeniusSettingTab(this.app, this));

		// Initialize background style element
		this.backgroundStyleEl = document.createElement('style');
		document.head.appendChild(this.backgroundStyleEl);

		// Restore background if exists
		if (this.settings.currentBackground) {
			this.applyCSSBackgroundStyle(`url('${this.settings.currentBackground}')`);
		}
	}

	onunload() {
		// Remove background style element
		this.backgroundStyleEl.remove();
		// Remove background element if it exists
		if (this.backgroundEl) {
			this.backgroundEl.remove();
		}
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
				// Use CSS method for generated backgrounds
				this.applyCSSBackgroundStyle(`url('${imageUrl}')`);
			}
		);
	}

	clearBackground() {
		this.settings.currentBackground = null;
		this.saveSettings();
		this.applyCSSBackgroundStyle('');
		// Also clean up any DOM elements
		if (this.backgroundEl) {
			this.backgroundEl.remove();
			this.backgroundEl = null;
		}
		new Notice('Background cleared');
	}

	debugBackground() {
		console.log('=== FlowGenius Debug Info ===');
		console.log('Current background URL:', this.settings.currentBackground);
		console.log('Opacity setting:', this.settings.opacity);
		console.log('Animation style:', this.settings.animationStyle);
		
		// Check if background element exists
		console.log('Background element exists:', !!this.backgroundEl);
		if (this.backgroundEl) {
			console.log('Background element style:', this.backgroundEl.style.cssText);
			console.log('Background element parent:', this.backgroundEl.parentElement?.className);
		}
		
		// Check DOM structure
		const workspace = document.querySelector('.workspace');
		console.log('Workspace element found:', !!workspace);
		
		const bgElement = document.querySelector('.flow-genius-background');
		console.log('Background element in DOM:', !!bgElement);
		
		if (bgElement) {
			const computedStyle = window.getComputedStyle(bgElement as HTMLElement);
			console.log('Background computed styles:');
			console.log('- background-image:', computedStyle.backgroundImage);
			console.log('- opacity:', computedStyle.opacity);
			console.log('- z-index:', computedStyle.zIndex);
			console.log('- position:', computedStyle.position);
		}
		
		new Notice('Debug info logged to console');
	}

	applyTestBackground() {
		// Create a data URL for a gradient background to test
		const canvas = document.createElement('canvas');
		canvas.width = 1024;
		canvas.height = 768;
		const ctx = canvas.getContext('2d');
		if (ctx) {
			// Create a gradient
			const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
			gradient.addColorStop(0, '#667eea');
			gradient.addColorStop(0.5, '#764ba2');
			gradient.addColorStop(1, '#f093fb');
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			
			// Convert to data URL and apply
			const dataUrl = canvas.toDataURL();
			this.settings.currentBackground = dataUrl;
			this.saveSettings();
			this.applyBackground(dataUrl);
			new Notice('Test gradient background applied!');
		}
	}

	applyCSSBackground() {
		// Test gradient using pure CSS
		const testGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)';
		this.applyCSSBackgroundStyle(testGradient);
		new Notice('CSS gradient background applied!');
	}

	applyCSSBackgroundStyle(backgroundImage: string) {
		// Remove any existing background style
		const existingStyle = document.querySelector('#flow-genius-background-style');
		if (existingStyle) {
			existingStyle.remove();
		}

		if (!backgroundImage) {
			return;
		}

		// Determine if we're in dark mode
		const isDarkMode = document.body.classList.contains('theme-dark');

		// Create and inject CSS that applies background directly to view-content
		const styleEl = document.createElement('style');
		styleEl.id = 'flow-genius-background-style';
		styleEl.textContent = `
			/* FlowGenius Background Styles */
			.view-content {
				position: relative !important;
				background-image: ${backgroundImage} !important;
				background-size: cover !important;
				background-position: center !important;
				background-repeat: no-repeat !important;
				background-attachment: fixed !important;
			}
			
			/* Add semi-transparent overlay to the entire content area for readability */
			.view-content > * {
				position: relative !important;
				background-color: ${isDarkMode ? 
					`rgba(30, 30, 30, ${0.35 + (0.15 * (1 - this.settings.opacity))})` : 
					`rgba(255, 255, 255, ${0.35 + (0.15 * (1 - this.settings.opacity))})`
				} !important;
			}
			
			/* Ensure proper padding */
			.view-content .markdown-source-view.mod-cm6 .cm-editor,
			.view-content .markdown-preview-view {
				padding: 40px !important;
			}
			
			/* Optional: Add subtle blur to just the content background */
			.view-content > * {
				backdrop-filter: blur(10px) !important;
				-webkit-backdrop-filter: blur(10px) !important;
			}
		`;
		
		document.head.appendChild(styleEl);
		console.log('FlowGenius: CSS background applied with opacity:', this.settings.opacity);
	}

	applyBackground(imageUrl: string | null) {
		console.log('FlowGenius: Applying background:', imageUrl);
		
		// Remove existing background element if it exists
		if (this.backgroundEl) {
			this.backgroundEl.remove();
			this.backgroundEl = null;
		}
		
		if (!imageUrl) {
			document.body.removeClass('flow-genius-active');
			return;
		}
		
		// Add body class for CSS fallback
		document.body.addClass('flow-genius-active');
		
		// Create background div
		this.backgroundEl = document.createElement('div');
		this.backgroundEl.className = 'flow-genius-background';
		this.backgroundEl.style.cssText = `
			position: fixed !important;
			top: 0 !important;
			left: 0 !important;
			width: 100% !important;
			height: 100% !important;
			background-image: url('${imageUrl}') !important;
			background-size: cover !important;
			background-position: center !important;
			background-repeat: no-repeat !important;
			opacity: ${this.settings.opacity} !important;
			z-index: -1 !important;
			pointer-events: none !important;
		`;
		
		// Add animation if enabled
		if (this.settings.animationStyle === 'subtle') {
			this.backgroundEl.style.animation = 'kenBurns 30s ease-in-out infinite alternate';
		}
		
		// Find the app root element - this is the main Obsidian container
		const appContainer = document.querySelector('.app-container') || 
						   document.querySelector('.workspace') || 
						   document.querySelector('body > div');
		
		if (appContainer) {
			console.log('FlowGenius: Injecting into app container:', appContainer.className);
			// Insert as the first child of the app container
			appContainer.insertBefore(this.backgroundEl, appContainer.firstChild);
			
			// Make sure the container has proper positioning
			const containerStyle = window.getComputedStyle(appContainer);
			if (containerStyle.position === 'static') {
				(appContainer as HTMLElement).style.position = 'relative';
			}
			
			// Ensure the container itself has a z-index
			(appContainer as HTMLElement).style.zIndex = '0';
		} else {
			// Fallback: insert into body
			console.log('FlowGenius: Fallback - injecting into body');
			document.body.insertBefore(this.backgroundEl, document.body.firstChild);
		}
		
		// Add keyframes animation if not already present
		if (!document.querySelector('#flow-genius-animations')) {
			const animationStyle = document.createElement('style');
			animationStyle.id = 'flow-genius-animations';
			animationStyle.textContent = `
				@keyframes kenBurns {
					0% {
						transform: scale(1) translate(0, 0);
					}
					100% {
						transform: scale(1.1) translate(-2%, -2%);
					}
				}
				
				/* Ensure the background stays behind content */
				.flow-genius-background {
					position: fixed !important;
					z-index: -1 !important;
				}
				
				/* Make sure main content areas are above the background */
				.workspace,
				.workspace-container,
				.workspace-tabs,
				.workspace-split {
					position: relative !important;
					background: transparent !important;
				}
				
				/* Ensure the editor panes have proper backgrounds */
				.view-content,
				.markdown-source-view,
				.markdown-preview-view {
					background-color: var(--background-primary) !important;
				}
			`;
			document.head.appendChild(animationStyle);
		}
		
		console.log('FlowGenius: Background element injected');
		if (this.backgroundEl && this.backgroundEl.parentElement) {
			console.log('FlowGenius: Parent element:', this.backgroundEl.parentElement.tagName, this.backgroundEl.parentElement.className);
			console.log('FlowGenius: Background computed position:', window.getComputedStyle(this.backgroundEl).position);
			console.log('FlowGenius: Background computed z-index:', window.getComputedStyle(this.backgroundEl).zIndex);
		}
		
		// Verify the image loads
		const img = new Image();
		img.onload = () => {
			console.log('FlowGenius: Background image loaded successfully');
			new Notice('Background applied successfully!');
		};
		img.onerror = (error) => {
			console.error('FlowGenius: Failed to load background image:', error);
			new Notice('Failed to load background image - check console');
		};
		img.src = imageUrl;
	}

	updateStatus(message: string) {
		this.statusBarItem.setText(message);
	}

	testAllBackgroundMethods() {
		// Create a test gradient
		const testGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)';
		
		// Method 1: Apply to workspace-leaf-content (current approach)
		console.log('Testing Method 1: workspace-leaf-content');
		this.applyCSSBackgroundStyle(testGradient);
		
		// Let user see the result before showing the modal
		new Notice('Applied to workspace-leaf-content - check if visible');
		
		// Show a modal with other options
		const modal = new Modal(this.app);
		modal.contentEl.createEl('h2', { text: 'Background Test Methods' });
		
		const method2Btn = modal.contentEl.createEl('button', { text: 'Test Method 2: View Content Direct' });
		method2Btn.onclick = () => {
			this.applyDirectViewContentBackground(testGradient);
			modal.close();
		};
		
		const method3Btn = modal.contentEl.createEl('button', { text: 'Test Method 3: Workspace Split' });
		method3Btn.onclick = () => {
			this.applyWorkspaceSplitBackground(testGradient);
			modal.close();
		};
		
		modal.open();
	}

	applyDirectViewContentBackground(backgroundImage: string) {
		const existingStyle = document.querySelector('#flow-genius-background-style');
		if (existingStyle) existingStyle.remove();
		
		const styleEl = document.createElement('style');
		styleEl.id = 'flow-genius-background-style';
		styleEl.textContent = `
			.view-content {
				position: relative !important;
				background-image: ${backgroundImage} !important;
				background-size: cover !important;
				background-position: center !important;
			}
			
			.view-content > * {
				position: relative !important;
				background-color: rgba(var(--background-primary-rgb), 0.9) !important;
				backdrop-filter: blur(10px) !important;
				padding: 20px !important;
				border-radius: 8px !important;
			}
		`;
		document.head.appendChild(styleEl);
		new Notice('Applied directly to view-content');
	}

	applyWorkspaceSplitBackground(backgroundImage: string) {
		const existingStyle = document.querySelector('#flow-genius-background-style');
		if (existingStyle) existingStyle.remove();
		
		const styleEl = document.createElement('style');
		styleEl.id = 'flow-genius-background-style';
		styleEl.textContent = `
			.workspace-split.mod-root {
				position: relative !important;
				background-image: ${backgroundImage} !important;
				background-size: cover !important;
				background-position: center !important;
			}
			
			.view-content {
				background-color: rgba(var(--background-primary-rgb), 0.9) !important;
			}
		`;
		document.head.appendChild(styleEl);
		new Notice('Applied to workspace-split');
	}

	testTextOverlay() {
		// Apply a bright red overlay to make sure the overlay system is working
		const existingStyle = document.querySelector('#flow-genius-background-style');
		if (existingStyle) existingStyle.remove();
		
		const styleEl = document.createElement('style');
		styleEl.id = 'flow-genius-background-style';
		styleEl.textContent = `
			.view-content {
				position: relative !important;
				background: linear-gradient(45deg, #ff0000, #00ff00, #0000ff) !important;
			}
			
			.view-content > *::before {
				content: '' !important;
				position: absolute !important;
				top: 0 !important;
				left: 50% !important;
				transform: translateX(-50%) !important;
				width: 900px !important;
				max-width: 100% !important;
				height: 100% !important;
				background: rgba(255, 0, 0, 0.8) !important;
				z-index: -1 !important;
			}
			
			.view-content .markdown-source-view.mod-cm6 .cm-editor,
			.view-content .markdown-preview-view {
				padding: 40px 60px !important;
				max-width: 900px !important;
				margin: 0 auto !important;
				position: relative !important;
			}
		`;
		document.head.appendChild(styleEl);
		new Notice('Red overlay applied - if you don\'t see red, the overlay isn\'t working');
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
						this.plugin.applyCSSBackgroundStyle(`url('${this.plugin.settings.currentBackground}')`);
					}
				}));

		// Animation setting removed - future: AI-generated animated backgrounds

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
