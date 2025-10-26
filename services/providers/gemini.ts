import { GoogleGenAI, Type } from "@google/genai";
import type { Chat as GeminiChat } from "@google/genai";
import type { BrandIdentityText, BrandBible, ColorInfo, FontPairing, ChatSession, ChatMessageChunk, BrandVoice } from '../../types';
import { MODELS } from '../../config';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const colorPaletteSchema = {
    type: Type.ARRAY,
    description: "A 5-color palette. Include hex codes, creative names, and usage notes for each color.",
    items: {
      type: Type.OBJECT,
      properties: {
        hex: { type: Type.STRING, description: "The hex code of the color, e.g., '#RRGGBB'." },
        name: { type: Type.STRING, description: "A creative name for the color." },
        usage: { type: Type.STRING, description: "How this color should be used (e.g., primary, accent, background)." },
      },
      required: ["hex", "name", "usage"],
    },
};

const fontPairingSchema = {
    type: Type.OBJECT,
    description: "A pairing of two Google Fonts, one for headers and one for body text.",
    properties: {
      header: { type: Type.STRING, description: "The name of the Google Font for headers." },
      body: { type: Type.STRING, description: "The name of the Google Font for body text." },
    },
    required: ["header", "body"],
};

const brandIdentitySchema = {
  type: Type.OBJECT,
  properties: {
    colorPalette: colorPaletteSchema,
    fontPairing: fontPairingSchema,
    primaryLogoPrompt: {
      type: Type.STRING,
      description: "A detailed, descriptive prompt for generating a primary company logo. The prompt should specify a modern, minimalist style suitable for a vector logo, and suggest a simple color scheme based on the generated palette. Describe the visual elements clearly. Example: 'A minimalist vector logo of a soaring eagle, using clean lines and a simple two-tone color scheme of deep blue and bright gold, on a pure white background.'"
    },
    secondaryMarkPrompts: {
      type: Type.ARRAY,
      description: "An array of two descriptive prompts for generating secondary brand marks or icons. These should be simpler than the primary logo but visually related.",
      items: {
        type: Type.STRING
      },
    },
    mockupPrompts: {
        type: Type.ARRAY,
        description: "An array of exactly three detailed, photorealistic prompts for generating brand mockups. These prompts should incorporate the generated logo, color palette, and typography style. The mockups should be: 1. A modern business card. 2. A website landing page displayed on a laptop screen. 3. A logo printed on a t-shirt worn by a model.",
        items: {
            type: Type.STRING
        }
    }
  },
  required: ["colorPalette", "fontPairing", "primaryLogoPrompt", "secondaryMarkPrompts", "mockupPrompts"],
};

const brandVoiceSchema = {
    type: Type.OBJECT,
    properties: {
        voices: {
            type: Type.ARRAY,
            description: "An array of 3-5 distinct brand voice archetypes.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the archetype, e.g., 'The Sage'." },
                    description: { type: Type.STRING, description: "A one-sentence description of the voice." },
                    keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-4 keywords representing the voice." },
                },
                required: ["name", "description", "keywords"],
            }
        }
    },
    required: ["voices"]
};

export async function suggestBusinessNames(mission: string): Promise<string[]> {
    const response = await ai.models.generateContent({
        model: MODELS.NAME_GENERATOR,
        contents: `Based on the following business idea, suggest 5 creative, memorable, and available-sounding business names. The mission is: "${mission}". Output a JSON array of strings.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    names: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                },
                required: ["names"]
            },
        },
    });
    return JSON.parse(response.text).names;
}

export async function generateBrandVoiceArchetypes(mission: string, companyName: string): Promise<BrandVoice[]> {
    const response = await ai.models.generateContent({
        model: MODELS.VOICE_STRATEGIST,
        contents: `Based on the company name "${companyName}" and its mission "${mission}", generate 3 distinct brand voice archetypes. For each, provide a name (e.g., 'The Sage'), a one-sentence description, and 3-4 keywords (e.g., 'Wise, Authoritative, Guiding, Trustworthy'). Output this as a structured JSON array.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: brandVoiceSchema,
        },
    });
    return JSON.parse(response.text).voices;
}

export async function generateBrandIdentity(mission: string, companyName: string, brandVoice?: BrandVoice): Promise<BrandIdentityText> {
  const voiceContext = brandVoice 
    ? `The brand's chosen voice is '${brandVoice.name}': ${brandVoice.description} (Keywords: ${brandVoice.keywords.join(', ')}). All generated content should reflect this personality.`
    : "No specific brand voice was chosen, so use a generally professional and appealing tone.";
  
  const prompt = `You are a world-class branding expert. Based on the following company name, mission, and brand voice, generate a complete brand identity bible. 
  Company Name: "${companyName}". 
  Mission: "${mission}".
  Brand Voice: ${voiceContext}`;
  
  const response = await ai.models.generateContent({
    model: MODELS.BRAND_STRATEGIST,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: brandIdentitySchema,
    },
  });
  const parsed = JSON.parse(response.text);
  
  parsed.secondaryMarkPrompts = (parsed.secondaryMarkPrompts || []).slice(0, 2);
  if (parsed.secondaryMarkPrompts.length < 2) throw new Error("Model did not generate enough secondary mark prompts.");
  
  parsed.mockupPrompts = (parsed.mockupPrompts || []).slice(0, 3);
  if (parsed.mockupPrompts.length < 3) throw new Error("Model did not generate enough mockup prompts.");

  return parsed;
}

export async function generateImage(prompt: string): Promise<string> {
  const response = await ai.models.generateImages({
    model: MODELS.VISUAL_ARTIST,
    prompt: prompt,
    config: {
      numberOfImages: 1,
      aspectRatio: '1:1',
    },
  });

  const base64ImageBytes: string | undefined = response.generatedImages[0]?.image.imageBytes;
  if (!base64ImageBytes) {
    throw new Error("No image data returned from API.");
  }
  return `data:image/png;base64,${base64ImageBytes}`;
}

class GeminiChatWrapper implements ChatSession {
  private geminiChat: GeminiChat;

  constructor(chat: GeminiChat) {
    this.geminiChat = chat;
  }

  async sendMessageStream(params: { message: string }): Promise<AsyncIterable<ChatMessageChunk>> {
    const stream = await this.geminiChat.sendMessageStream({ message: params.message });
    return (async function*(): AsyncIterable<ChatMessageChunk> {
        for await (const chunk of stream) {
            yield { text: chunk.text };
        }
    })();
  }
}

export function createChat(): ChatSession {
    const geminiChat = ai.chats.create({
        model: MODELS.BRANDING_ASSISTANT,
        config: {
            systemInstruction: 'You are a friendly and helpful assistant specializing in branding, marketing, and design. Provide concise and actionable advice.',
        },
    });
    return new GeminiChatWrapper(geminiChat);
}

// --- REGENERATION FUNCTIONS ---

function getContext(mission: string, companyName: string, currentIdentity: BrandBible): string {
    const voiceContext = currentIdentity.brandVoice
        ? `Brand Voice: '${currentIdentity.brandVoice.name}' (${currentIdentity.brandVoice.keywords.join(', ')})`
        : '';
    return `
      Company Name: "${companyName}"
      Original Mission: "${mission}"
      Current Colors: ${currentIdentity.colorPalette.map(c => c.name).join(', ')}
      Current Fonts: Header - ${currentIdentity.fontPairing.header}, Body - ${currentIdentity.fontPairing.body}
      ${voiceContext}
    `;
}

async function regeneratePrompt(mission: string, companyName: string, currentIdentity: BrandBible, changeRequest: string, itemDescription: string): Promise<string> {
    const context = getContext(mission, companyName, currentIdentity);
    const response = await ai.models.generateContent({
        model: MODELS.CREATIVE_DIRECTOR,
        contents: `You are a creative director. Based on the following context, regenerate an image prompt for a ${itemDescription}. The user's specific change request is: "${changeRequest}".
        Context: ${context}
        Output only the new, detailed, and photorealistic image prompt. Do not include any other text or explanation.`,
    });
    return response.text.trim();
}

export const regenerateLogoPrompt = (mission: string, companyName: string, currentIdentity: BrandBible, changeRequest: string, logoType: 'primary' | 'secondary') => 
    regeneratePrompt(mission, companyName, currentIdentity, changeRequest, `${logoType} logo`);

export const regenerateMockupPrompt = (mission: string, companyName: string, currentIdentity: BrandBible, changeRequest: string, mockupTitle: string) =>
    regeneratePrompt(mission, companyName, currentIdentity, changeRequest, `${mockupTitle} mockup`);


export async function regenerateColorPalette(mission: string, companyName: string, currentIdentity: BrandBible, changeRequest: string): Promise<ColorInfo[]> {
    const context = getContext(mission, companyName, currentIdentity);
    const response = await ai.models.generateContent({
        model: MODELS.DESIGN_SPECIALIST,
        contents: `Based on the brand context, regenerate the 5-color palette. The user has requested: "${changeRequest}".
        Context: ${context}
        Output JSON that adheres to the schema.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {type: Type.OBJECT, properties: { colorPalette: colorPaletteSchema }, required: ["colorPalette"]},
        },
    });
    return JSON.parse(response.text).colorPalette;
}

export async function regenerateFontPairing(mission: string, companyName: string, currentIdentity: BrandBible, changeRequest: string): Promise<FontPairing> {
    const context = getContext(mission, companyName, currentIdentity);
    const response = await ai.models.generateContent({
        model: MODELS.DESIGN_SPECIALIST,
        contents: `Based on the brand context, regenerate the Google Font pairing. The user has requested: "${changeRequest}".
        Context: ${context}
        Output JSON that adheres to the schema.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {type: Type.OBJECT, properties: { fontPairing: fontPairingSchema }, required: ["fontPairing"]},
        },
    });
     return JSON.parse(response.text).fontPairing;
}