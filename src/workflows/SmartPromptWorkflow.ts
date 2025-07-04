import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

interface ContentAnalysis {
  contentType: 'technical' | 'creative' | 'personal' | 'academic';
  mood: 'calm' | 'energetic' | 'dark' | 'bright' | 'neutral';
  visualStyle: string;
}

export class SmartPromptWorkflow {
  private llm: ChatOpenAI;

  constructor(apiKey: string) {
    this.llm = new ChatOpenAI({
      modelName: "gpt-4-turbo-preview",
      temperature: 0.7,
      maxTokens: 300,
      openAIApiKey: apiKey,
    });
  }

  /**
   * Execute the smart prompt workflow: analyze content then generate optimized prompt
   */
  async execute(content: string): Promise<string> {
    try {
      // Step 1: Analyze content
      const analysis = await this.analyzeContent(content);
      
      // Step 2: Generate optimized prompt based on analysis
      const optimizedPrompt = await this.generateOptimizedPrompt(content, analysis);
      
      return optimizedPrompt;
    } catch (error) {
      console.error('SmartPromptWorkflow error:', error);
      throw error;
    }
  }

  /**
   * Analyze content to determine type, mood, and visual style
   */
  private async analyzeContent(content: string): Promise<ContentAnalysis> {
    const analysisPrompt = `Analyze the following content and classify it into:
1. Content Type: technical, creative, personal, or academic
2. Mood: calm, energetic, dark, bright, or neutral
3. Visual Style: brief description of appropriate visual atmosphere

Content:
${content}

Respond in this exact format:
Type: [content_type]
Mood: [mood]
Style: [visual_style_description]`;

    const response = await this.llm.invoke([
      new SystemMessage("You are an expert content analyzer. Classify content for optimal background image generation."),
      new HumanMessage(analysisPrompt)
    ]);

    const analysis = response.content as string;
    
    // Parse the response
    const typeMatch = analysis.match(/Type:\s*(\w+)/i);
    const moodMatch = analysis.match(/Mood:\s*(\w+)/i);
    const styleMatch = analysis.match(/Style:\s*(.+)/i);

    return {
      contentType: (typeMatch?.[1]?.toLowerCase() as ContentAnalysis['contentType']) || 'personal',
      mood: (moodMatch?.[1]?.toLowerCase() as ContentAnalysis['mood']) || 'neutral',
      visualStyle: styleMatch?.[1]?.trim() || 'calm, professional atmosphere',
    };
  }

  /**
   * Generate optimized prompt based on content analysis
   */
  private async generateOptimizedPrompt(content: string, analysis: ContentAnalysis): Promise<string> {
    const promptTemplate = this.getPromptTemplate(analysis.contentType, analysis.mood);
    
    const optimizationPrompt = `Create a detailed, atmospheric image generation prompt for a background image.

Content Analysis:
- Type: ${analysis.contentType}
- Mood: ${analysis.mood}
- Style: ${analysis.visualStyle}

Base Template: ${promptTemplate}

Original Content Summary:
${content.substring(0, 500)}...

Create an optimized prompt that:
- Captures the essence and mood of the content
- Creates an immersive but non-distracting background
- Includes specific lighting, atmosphere, and composition details
- Is suitable for AI image generation

Respond with only the optimized prompt, no additional text.`;

    const response = await this.llm.invoke([
      new SystemMessage("You are an expert at creating detailed, atmospheric image generation prompts optimized for AI image generation."),
      new HumanMessage(optimizationPrompt)
    ]);

    return response.content as string;
  }

  /**
   * Get base prompt template based on content type and mood
   */
  private getPromptTemplate(contentType: string, mood: string): string {
    const templates = {
      technical: {
        calm: "Clean, minimal, professional workspace with subtle geometric patterns, soft focused lighting, modern minimalist design",
        energetic: "Dynamic, modern tech environment with sleek interfaces, bright accent lighting, innovative atmosphere",
        dark: "Sophisticated dark workspace with subtle neon accents, professional coding environment, focused ambiance",
        bright: "Bright, airy modern office space with clean lines, natural light, productive atmosphere",
        neutral: "Professional, clean workspace with balanced lighting, organized environment, distraction-free"
      },
      creative: {
        calm: "Peaceful creative studio with soft, inspiring lighting, artistic atmosphere, gentle creative energy",
        energetic: "Vibrant creative space with dynamic lighting, artistic chaos, inspiring creative energy",
        dark: "Moody creative atelier with dramatic lighting, artistic shadows, intense creative focus",
        bright: "Bright, inspiring creative space with natural light, artistic materials, uplifting atmosphere",
        neutral: "Balanced creative environment with artistic elements, comfortable lighting, creative flow"
      },
      personal: {
        calm: "Cozy, intimate personal space with warm lighting, comfortable atmosphere, private sanctuary",
        energetic: "Lively personal space with vibrant colors, energetic atmosphere, personal expression",
        dark: "Intimate, contemplative personal space with soft shadows, reflective mood, personal depth",
        bright: "Cheerful, personal space with warm natural light, uplifting atmosphere, personal comfort",
        neutral: "Comfortable personal environment with balanced lighting, familiar atmosphere, personal peace"
      },
      academic: {
        calm: "Serene library atmosphere with soft reading lights, scholarly environment, contemplative study space",
        energetic: "Dynamic academic environment with bright lighting, innovative learning space, intellectual energy",
        dark: "Traditional academic setting with warm lamplight, classical scholarly atmosphere, deep focus",
        bright: "Bright, modern academic space with natural light, clean learning environment, intellectual clarity",
        neutral: "Balanced academic environment with comfortable lighting, focused study atmosphere, scholarly peace"
      }
    };

    return templates[contentType as keyof typeof templates]?.[mood as keyof typeof templates.technical] || 
           templates.personal.neutral;
  }
} 