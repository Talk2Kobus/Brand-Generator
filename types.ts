import type { Chat } from "@google/genai";

export interface ColorInfo {
  hex: string;
  name: string;
  usage: string;
}

export interface FontPairing {
  header: string;
  body: string;
}

export interface BrandIdentityText {
  colorPalette: ColorInfo[];
  fontPairing: FontPairing;
  primaryLogoPrompt: string;
  secondaryMarkPrompts: string[];
  mockupPrompts: string[];
}

export interface BrandBible extends BrandIdentityText {
  primaryLogoUrl: string;
  secondaryMarkUrls: string[];
  mockupUrls: { title: string; url: string }[];
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export interface ChatBotProps {
    chatSession: Chat | null;
}

// Types for component regeneration
export type RegenerationType = 'primaryLogo' | 'secondaryMark' | 'mockup' | 'colorPalette' | 'fontPairing';

export interface RegenerationRequest {
  type: RegenerationType;
  title: string;
  index?: number;
}