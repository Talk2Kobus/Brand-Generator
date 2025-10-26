# Brand Identity Generator & AI Chat

![Brand Identity Generator](https://storage.googleapis.com/aistudio-marketplace/project-brand-ai/screenshot.png)

A powerful, AI-driven application that generates a complete brand identity based on a simple mission statement. It creates logos, color palettes, typography, and mockups, and includes an integrated AI chatbot for branding advice.

## Features

-   **Comprehensive Brand Bible**: Generates a full brand identity from a single mission statement.
-   **AI-Powered Content**:
    -   Uses **Gemini 2.5 Pro** to generate a structured "Brand Bible" including color palettes, font pairings, and detailed image prompts.
    -   Uses **Imagen 4** for high-quality generation of a primary logo, secondary marks, and photorealistic mockups (business card, website, t-shirt).
-   **Interactive & Iterative Design**:
    -   **Regenerate Anything**: Don't like a specific element? Regenerate the logo, a mockup, the color palette, or the font pairing with a specific request for changes, without starting over.
    -   **Context-Aware**: The AI considers the existing brand identity when regenerating an element to ensure consistency.
-   **Export Brand Bible**: Download all generated assets—logos, mockups, and a professionally styled HTML brand guide—as a single `.zip` file.
-   **Integrated AI Assistant**:
    -   Chat with a branding-focused AI assistant powered by **Gemini 2.5 Flash** for quick advice, ideas, and answers to your questions.
    -   Features a streaming response for a real-time conversational experience.
-   **Modern UI/UX**:
    -   Sleek, responsive interface built with Tailwind CSS.
    -   **Dynamic Google Font Loading**: Automatically fetches and applies the generated font pairings to preview them live.
    -   **Loading Skeletons**: An animated skeleton screen provides a great user experience while the initial brand identity is being generated.
    -   **Robust Error Handling**: User-friendly toast notifications appear for API failures or validation errors, ensuring a smooth experience.
    -   **Interactive Components**: Includes features like "copy-to-clipboard" for color codes.

## Tech Stack

-   **Frontend**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **AI**: [Google Gemini API (`@google/genai`)](https://ai.google.dev/sdks)
-   **File Packaging**: [JSZip](https://stuk.github.io/jszip/), [FileSaver.js](https://github.com/eligrey/FileSaver.js/)
-   **Module Loading**: Leverages import maps for efficient, CDN-based package management without a build step.

## AI Agent Architecture

This application utilizes a sophisticated multi-agent system where different AI models are assigned specialized roles to collaborate on the final output. This approach ensures high-quality results by using the best model for each specific task—from complex structured data generation to fast conversational chat.

For a detailed breakdown of each agent's role, prompts, and configuration, please see the **[AI Agent Architecture Document](./AGENTS.md)**.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   A package manager like `npm` or `yarn`
-   A Google AI Studio API Key. You can get one from the [Google AI Studio](https://aistudio.google.com/).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/brand-identity-generator.git
    cd brand-identity-generator
    ```

2.  **Install dependencies:**
    This project uses import maps and doesn't have traditional `node_modules` for frontend packages. However, you might add development tools in the future. If you do, run:
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    The application requires your Google AI API key to function.

    -   Create a new file named `.env` in the root of your project.
    -   Add your API key to this file:
        ```
        VITE_API_KEY=your_google_ai_studio_api_key_here
        ```
    > **Note:** The project is configured to use `process.env.API_KEY`. If running locally with a tool like Vite, you'll need to prefix it with `VITE_` and update `geminiService.ts` to read `process.env.VITE_API_KEY` for local development. The provided code is structured for an environment where `process.env.API_KEY` is directly injected.

4.  **Run the development server:**
    You can serve the files using a simple local server. A great option is `serve`.
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
├── services/           # API interaction layer (geminiService.ts)
├── utils/              # Utility functions (e.g., HTML generation)
├── types.ts            # TypeScript type definitions for the app
├── App.tsx             # Main application component, handles routing/views
├── index.html          # The main HTML file
├── index.tsx           # React application entry point
├── AGENTS.md           # Detailed breakdown of the AI agent architecture
├── README.md           # This file
└── ...                 # Other project files
```

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please see `CONTRIBUTING.md` for details on our code of conduct and the process for submitting pull requests to us.

## License

Distributed under the MIT License. See `LICENSE` for more information.
