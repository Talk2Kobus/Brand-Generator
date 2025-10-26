# Brand Identity Generator & AI Chat

![Brand Identity Generator](https://storage.googleapis.com/aistudio-marketplace/project-brand-ai/screenshot.png)

A powerful, AI-driven application that generates a complete brand identity based on a simple mission statement. It creates logos, color palettes, typography, and mockups, and includes an integrated AI chatbot for branding advice.

## Features

-   **Comprehensive Brand Bible**: Generates a full brand identity from a single mission statement.
-   **AI-Powered Content**:
    -   Uses a configurable **Brand Strategist** model (default: `Gemini 2.5 Pro`) to generate a structured "Brand Bible" including color palettes, font pairings, and detailed image prompts.
    -   Uses a configurable **Visual Artist** model (default: `Imagen 4`) for high-quality generation of a primary logo, secondary marks, and photorealistic mockups.
-   **Interactive & Iterative Design**:
    -   **Regenerate Anything**: Don't like a specific element? Regenerate the logo, a mockup, the color palette, or the font pairing with a specific request for changes, without starting over.
    -   **Context-Aware**: The AI considers the existing brand identity when regenerating an element to ensure consistency.
-   **Export Brand Bible**: Download all generated assets—logos, mockups, and a professionally styled HTML brand guide—as a single `.zip` file.
-   **Integrated AI Assistant**:
    -   Chat with a branding-focused AI assistant powered by a configurable model (default: `Gemini 2.5 Flash`) for quick advice, ideas, and answers.
    -   Features a streaming response for a real-time conversational experience.
-   **Modern UI/UX**:
    -   Sleek, responsive interface built with Tailwind CSS.
    -   **Dynamic Google Font Loading**: Automatically fetches and applies the generated font pairings to preview them live.
    -   **Loading Skeletons**: An animated skeleton screen provides a great user experience while the initial brand identity is being generated.
    -   **Robust Error Handling**: User-friendly toast notifications appear for API failures or validation errors.

## Tech Stack

-   **Frontend**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **AI**: [Google Gemini API (`@google/genai`)](https://ai.google.dev/sdks) (by default)
-   **Architecture**: **Provider-Agnostic Service Layer** allows for easy integration of other AI providers.
-   **File Packaging**: [JSZip](https://stuk.github.io/jszip/), [FileSaver.js](https://github.com/eligrey/FileSaver.js/)
-   **Module Loading**: Leverages import maps for efficient, CDN-based package management.

## AI Agent Architecture

This application utilizes a sophisticated multi-agent system where different AI models are assigned specialized roles. This approach ensures high-quality results by using the best model for each specific task. The entire system is configurable through `config.ts`.

For a detailed breakdown of each agent's role, prompts, and configuration, please see the **[AI Agent Architecture Document](./AGENTS.md)**.

## Configuring the AI Provider

This application is designed to be AI provider-agnostic. You can configure which AI service and models to use by editing the `config.ts` file in the root of the project.

```typescript
// config.ts
export const AI_PROVIDER: 'GEMINI' = 'GEMINI'; // Future options: 'OPEN_AI', etc.

export const MODELS = {
    BRAND_STRATEGIST: 'gemini-2.5-pro',
    VISUAL_ARTIST: 'imagen-4.0-generate-001',
    // ... other model roles
};
```

### Adding a New Provider

To add a new AI provider (e.g., OpenAI):
1.  Create a new service file, e.g., `services/providers/openai.ts`.
2.  This file must export functions that match the signatures required by the application (you can use `services/providers/gemini.ts` as a template).
3.  Implement the logic for each function using the new provider's SDK.
4.  Update `services/aiService.ts` to import and include your new provider in the `providers` map.
5.  Update `config.ts` to set `AI_PROVIDER` to your new provider's key (e.g., `'OPEN_AI'`).

## Getting Started

Follow these instructions to get the project running on your local machine.

### Prerequisites

-   A simple web server to serve static files.
-   A Google AI Studio API Key. You can get one from the [Google AI Studio](https://aistudio.google.com/).

### Setup & Running

1.  **Environment Variable**: The application expects `process.env.API_KEY` to be available in its hosting environment. When deploying or running, ensure this variable is injected.

2.  **Run the development server:**
    You can serve the files using any simple local server. A great option is `serve`.
    ```bash
    # Install serve globally if you haven't already
    npm install -g serve

    # Run the server from the project root
    serve .
    ```
    The application should now be running on `http://localhost:3000` (or another port if 3000 is busy).

## Project Structure

```
/
├── components/         # Reusable React components
├── contexts/           # React context for global state (e.g., errors)
├── services/           # AI service layer
│   ├── providers/      # Implementations for each AI provider (e.g., gemini.ts)
│   └── aiService.ts    # Service facade that selects the provider
├── utils/              # Utility functions (e.g., HTML generation)
├── config.ts           # Central configuration for AI provider and models
├── types.ts            # TypeScript type definitions for the app
├── App.tsx             # Main application component
├── AGENTS.md           # Detailed breakdown of the AI agent architecture
└── ...                 # Other project files
```

## Contributing

Contributions are welcome! Please see `CONTRIBUTING.md` for details on our code of conduct and the process for submitting pull requests.

## License

Distributed under the MIT License. See `LICENSE` for more information.
