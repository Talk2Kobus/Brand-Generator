import { AI_PROVIDER } from '../config';
import * as geminiProvider from './providers/gemini';

// In the future, a developer could add another provider like this:
// import * as openAiProvider from './providers/openai';

/**
 * This is the central hub for AI providers.
 * To add a new provider:
 * 1. Create the provider's implementation in `services/providers/`.
 * 2. Import it here.
 * 3. Add it to the `providers` map below.
 * 4. Update the `AI_PROVIDER` in `config.ts`.
 */
const providers = {
  GEMINI: geminiProvider,
  // OPEN_AI: openAiProvider, // Example for a new provider
};

if (!providers[AI_PROVIDER]) {
  throw new Error(`AI Provider "${AI_PROVIDER}" is not configured in aiService.ts`);
}

/**
 * Export the selected provider's functions.
 * The rest of the application will import all AI functions from this file,
 * remaining completely unaware of the specific provider being used.
 */
export const {
  suggestBusinessNames,
  generateBrandIdentity,
  generateImage,
  createChat,
  regenerateLogoPrompt,
  regenerateMockupPrompt,
  regenerateColorPalette,
  regenerateFontPairing,
} = providers[AI_PROVIDER];