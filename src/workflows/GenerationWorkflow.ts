import { ContentAnalyzer } from '../core/ContentAnalyzer';
import { OpenAIClient } from '../api/OpenAIClient';
import { ReplicateClient } from '../api/ReplicateClient';
import { MarkdownView, Notice } from 'obsidian';
import { FlowGeniusSettings } from '../types';

/**
 * LangGraph-inspired workflow for orchestrating the background generation process
 * This implements a simple state machine for the generation pipeline
 */
export class GenerationWorkflow {
    private openAIClient: OpenAIClient;
    private replicateClient: ReplicateClient;
    private settings: FlowGeniusSettings;
    
    // Workflow state
    private state: {
        phase: 'idle' | 'extracting' | 'prompting' | 'generating' | 'applying' | 'complete' | 'error';
        content?: string;
        prompt?: string;
        imageUrl?: string;
        error?: string;
    } = { phase: 'idle' };

    constructor(settings: FlowGeniusSettings) {
        this.settings = settings;
        this.openAIClient = new OpenAIClient(settings.openaiApiKey);
        this.replicateClient = new ReplicateClient(settings.replicateApiKey);
    }

    /**
     * Execute the complete generation workflow
     */
    async execute(
        view: MarkdownView | null,
        onStatusUpdate: (status: string) => void,
        onBackgroundReady: (imageUrl: string) => void
    ): Promise<void> {
        try {
            // Phase 1: Extract content
            this.state.phase = 'extracting';
            onStatusUpdate('Extracting content...');
            
            const content = ContentAnalyzer.extractNoteContent(view);
            if (!content) {
                throw new Error('No active note found');
            }
            this.state.content = content;

            // Phase 2: Generate prompt
            this.state.phase = 'prompting';
            onStatusUpdate('Creating visual description...');
            
            const contextPrompt = ContentAnalyzer.prepareContentForPrompt(
                content,
                this.settings.customInstructions,
                this.settings.imageStyle
            );
            
            const imagePrompt = await this.openAIClient.generateImagePrompt(contextPrompt);
            this.state.prompt = imagePrompt;

            // Phase 3: Generate image
            this.state.phase = 'generating';
            onStatusUpdate('Generating background image...');
            
            const imageUrl = await this.replicateClient.generateImage(imagePrompt);
            this.state.imageUrl = imageUrl;

            // Phase 4: Apply background
            this.state.phase = 'applying';
            onStatusUpdate('Applying background...');
            
            onBackgroundReady(imageUrl);

            // Phase 5: Complete
            this.state.phase = 'complete';
            onStatusUpdate('');
            
            new Notice('Background generated successfully!');
            
        } catch (error) {
            this.state.phase = 'error';
            this.state.error = error.message;
            onStatusUpdate('');
            
            console.error('Generation workflow error:', error);
            new Notice(`Failed to generate background: ${error.message}`);
        }
    }

    /**
     * Get the current workflow state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Reset the workflow state
     */
    reset() {
        this.state = { phase: 'idle' };
    }

    /**
     * Validate that all required settings are configured
     */
    async validateConfiguration(): Promise<{ isValid: boolean; errors: string[] }> {
        const errors: string[] = [];

        if (!this.settings.openaiApiKey) {
            errors.push('OpenAI API key not configured');
        } else {
            const openAIValid = await this.openAIClient.validateApiKey();
            if (!openAIValid) {
                errors.push('Invalid OpenAI API key');
            }
        }

        if (!this.settings.replicateApiKey) {
            errors.push('Replicate API key not configured');
        } else {
            const replicateValid = await this.replicateClient.validateApiKey();
            if (!replicateValid) {
                errors.push('Invalid Replicate API key');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
} 