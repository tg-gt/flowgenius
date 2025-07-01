import { MarkdownView } from 'obsidian';

export class ContentAnalyzer {
    /**
     * Extracts content from the active note, limited to 8000 characters
     */
    static extractNoteContent(view: MarkdownView | null): string | null {
        if (!view) {
            return null;
        }

        const content = view.editor.getValue();
        
        // Take first 8000 characters if content is longer
        return content.length > 8000 ? content.substring(0, 8000) : content;
    }

    /**
     * Prepares content for prompt generation by adding context
     */
    static prepareContentForPrompt(
        content: string, 
        customInstructions: string,
        imageStyle: string
    ): string {
        const contextPrompt = `
Content to visualize:
${content}

Style preference: ${imageStyle}
${customInstructions ? `Additional instructions: ${customInstructions}` : ''}

Create a detailed visual description for an immersive background image that:
- Captures the essence and mood of the content
- Creates an atmospheric environment for writing
- Is suitable as a subtle background (not too distracting)
- Follows the specified style preferences
`;
        
        return contextPrompt.trim();
    }

    /**
     * Extracts key themes and mood from content (for future enhancement)
     */
    static analyzeContentThemes(content: string): {
        themes: string[];
        mood: string;
        setting: string;
    } {
        // Simple analysis for MVP - could be enhanced with NLP
        const themes: string[] = [];
        let mood = 'neutral';
        let setting = 'abstract';

        // Basic keyword detection
        const lowerContent = content.toLowerCase();
        
        // Mood detection
        if (lowerContent.includes('dark') || lowerContent.includes('shadow') || lowerContent.includes('night')) {
            mood = 'dark';
        } else if (lowerContent.includes('bright') || lowerContent.includes('light') || lowerContent.includes('sunny')) {
            mood = 'bright';
        } else if (lowerContent.includes('dream') || lowerContent.includes('fantasy') || lowerContent.includes('magic')) {
            mood = 'mystical';
        }

        // Setting detection
        if (lowerContent.includes('forest') || lowerContent.includes('tree') || lowerContent.includes('nature')) {
            setting = 'nature';
        } else if (lowerContent.includes('city') || lowerContent.includes('urban') || lowerContent.includes('building')) {
            setting = 'urban';
        } else if (lowerContent.includes('ocean') || lowerContent.includes('sea') || lowerContent.includes('water')) {
            setting = 'aquatic';
        } else if (lowerContent.includes('space') || lowerContent.includes('star') || lowerContent.includes('galaxy')) {
            setting = 'cosmic';
        }

        return { themes, mood, setting };
    }
} 