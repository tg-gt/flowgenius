export interface FlowGeniusSettings {
    openaiApiKey: string;
    replicateApiKey: string;
    updateFrequency: 'manual' | 'onSave' | 'realtime';
    animationStyle: 'subtle' | 'dynamic' | 'static';
    opacity: number;
    imageStyle: string;
    customInstructions: string;
    enabledFolders: string[];
    currentBackground: string | null;
} 