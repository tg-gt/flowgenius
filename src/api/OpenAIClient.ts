import { requestUrl } from 'obsidian';

export class OpenAIClient {
    private apiKey: string;
    private baseUrl = 'https://api.openai.com/v1';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Generates an optimized image generation prompt using OpenAI
     */
    async generateImagePrompt(contentContext: string): Promise<string> {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not configured');
        }

        const response = await requestUrl({
            url: `${this.baseUrl}/chat/completions`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4-turbo-preview',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert at creating detailed, atmospheric image generation prompts. 
                        Your prompts should be vivid, specific, and optimized for AI image generation.
                        Focus on creating immersive, non-distracting backgrounds suitable for a writing environment.
                        Include details about lighting, atmosphere, color palette, and composition.`
                    },
                    {
                        role: 'user',
                        content: contentContext
                    }
                ],
                temperature: 0.8,
                max_tokens: 300
            })
        });

        if (response.status !== 200) {
            throw new Error(`OpenAI API error: ${response.status} - ${response.text}`);
        }

        const data = response.json;
        return data.choices[0].message.content;
    }

    /**
     * Validates the API key by making a minimal request
     */
    async validateApiKey(): Promise<boolean> {
        try {
            const response = await requestUrl({
                url: `${this.baseUrl}/models`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return response.status === 200;
        } catch {
            return false;
        }
    }
} 