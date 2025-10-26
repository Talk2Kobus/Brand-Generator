export interface ColorInfo {
  hex: string;
  name: string;
  usage: string;
}

export interface FontPairing {
  header: string;
  body: string;
}

export interface BrandVoice {
  name: string;
  description: string;
  keywords: string[];
}

export interface BrandIdentityText {
  colorPalette: ColorInfo[];
  fontPairing: FontPairing;
  primaryLogoPrompt: string;
  secondaryMarkPrompts: string[];
  mockupPrompts: string[];
}

export interface BrandBible extends BrandIdentityText {
  id?: string; // Optional ID for saved brands
  // Fix: Add optional mission and companyName to BrandBible type.
  mission?: string; // The company's mission statement
  companyName?: string; // The company's name
  brandVoice?: BrandVoice;
  primaryLogoUrl: string;
  secondaryMarkUrls: string[];
  mockupUrls: { title: string; url: string }[];
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  imageUrl?: string; // For displaying the sent image in the UI
}

// --- CHAT ABSTRACTION ---
export interface ChatMessageChunk {
  text: string;
}

export interface ChatSession {
  sendMessageStream(params: { 
    message: string; 
    image?: { data: string; mimeType: string };
  }): Promise<AsyncIterable<ChatMessageChunk>>;
}

export interface ChatBotProps {
    chatSession: ChatSession | null;
}
// -------------------------

// Types for component regeneration
export type RegenerationType = 'primaryLogo' | 'secondaryMark' | 'mockup' | 'colorPalette' | 'fontPairing';

export interface RegenerationRequest {
  type: RegenerationType;
  title: string;
  index?: number;
}

// --- NEW TYPES FOR AUTH & LIBRARY ---

export interface User {
  id: string;
  email: string;
}

export interface SavedBrand {
    id: string;
    companyName: string;
    primaryLogoUrl: string;
    primaryColor: string;
}

export interface AnalyticsData {
    totalBrands: number;
    colorFrequency: { hex: string; count: number }[];
    fontFrequency: { name: string; type: 'header' | 'body'; count: number }[];
}