export class ReplicateClient {
    private apiKey: string;
    private baseUrl = 'https://api.replicate.com/v1';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Generates an image using Replicate's SDXL model
     */
    async generateImage(prompt: string): Promise<string> {
        if (!this.apiKey) {
            throw new Error('Replicate API key not configured');
        }

        // Start the prediction
        const predictionResponse = await fetch(`${this.baseUrl}/predictions`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                version: 'a00d0b7dcbb9c3fbb34ba87d2d5b46c56969c84a628bf778a7fdaec30b1b99c5', // SDXL 1.0
                input: {
                    prompt: prompt,
                    negative_prompt: 'text, words, letters, watermark, logo, people, faces, portraits',
                    width: 1024,
                    height: 768,
                    num_outputs: 1,
                    scheduler: 'K_EULER',
                    num_inference_steps: 25,
                    guidance_scale: 7.5,
                    prompt_strength: 0.8,
                    refine: 'expert_ensemble_refiner',
                    high_noise_frac: 0.8
                }
            })
        });

        if (!predictionResponse.ok) {
            const error = await predictionResponse.text();
            throw new Error(`Replicate API error: ${predictionResponse.status} - ${error}`);
        }

        const prediction = await predictionResponse.json();
        
        // Poll for completion
        const imageUrl = await this.pollForCompletion(prediction.id);
        return imageUrl;
    }

    /**
     * Polls the prediction until it's complete
     */
    private async pollForCompletion(predictionId: string): Promise<string> {
        const maxAttempts = 60; // 60 seconds max
        let attempts = 0;

        while (attempts < maxAttempts) {
            const response = await fetch(`${this.baseUrl}/predictions/${predictionId}`, {
                headers: {
                    'Authorization': `Token ${this.apiKey}`,
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to check prediction status: ${response.status}`);
            }

            const prediction = await response.json();

            if (prediction.status === 'succeeded') {
                return prediction.output[0]; // Return the first image URL
            } else if (prediction.status === 'failed') {
                throw new Error(`Image generation failed: ${prediction.error}`);
            }

            // Wait 1 second before polling again
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }

        throw new Error('Image generation timed out');
    }

    /**
     * Validates the API key
     */
    async validateApiKey(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/predictions`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${this.apiKey}`,
                }
            });
            return response.ok;
        } catch {
            return false;
        }
    }
} 