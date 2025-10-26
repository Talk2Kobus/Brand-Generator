// config.ts

// The primary AI provider to use for all services.
// To add a new provider, you would create a new service file in `/services/providers`
// that exports functions with the same signatures, then update `/services/aiService.ts`.
export const AI_PROVIDER: 'GEMINI' = 'GEMINI'; // Future options: 'OPEN_AI', 'ANTHROPIC', etc.

/**
 * This configuration maps abstract roles to specific AI model names.
 * This allows for easy swapping of model versions or tiers without changing the application logic.
 */
export const MODELS = {
  // Used for suggesting creative business names.
  NAME_GENERATOR: 'gemini-2.5-flash',

  // Used for the initial, complex brand bible generation. Needs strong JSON/Schema support.
  BRAND_STRATEGIST: 'gemini-2.5-pro',
  
  // Used for all high-quality image generation tasks.
  VISUAL_ARTIST: 'imagen-4.0-generate-001',
  
  // Used for fast, context-aware regeneration of text prompts.
  CREATIVE_DIRECTOR: 'gemini-2.5-flash',
  
  // Used for regenerating structured data like colors/fonts. Needs strong JSON/Schema support.
  DESIGN_SPECIALIST: 'gemini-2.5-pro',
  
  // Used for the low-latency, streaming chatbot.
  BRANDING_ASSISTANT: 'gemini-2.5-flash',
};