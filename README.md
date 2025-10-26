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
-   **Integrated AI Assistant**:
    -   Chat with a branding-focused AI assistant powered by **Gemini 2.5 Flash** for quick advice, ideas, and answers to your questions.
    -   Features a streaming response for a real-time conversational experience.
-   **Modern UI/UX**:
    -   Sleek, responsive interface built with Tailwind CSS.
    -   **Dynamic Google Font Loading**: Automatically fetches and applies the generated font pairings to preview them live.
    -   **Loading Skeletons**: An animated skeleton screen provides a great user experience while the initial brand identity is being generated.
    -   **Interactive Components**: Includes features like "copy-to-clipboard" for color codes.

## Tech Stack

-   **Frontend**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **AI**: [Google Gemini API (`@google/genai`)](https://ai.google.dev/sdks)
    -   **Text & Structure**: `gemini-2.5-pro`
    -   **Chat**: `gemini-2.5-flash`
    -   **Image Generation**: `imagen-4.0-generate-001`
-   **Module Loading**: Leverages import maps for efficient, CDN-based package management without a build step.

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
│   ├── BrandGenerator.tsx  # Main component for the generation flow
│   ├── ChatBot.tsx         # The AI chat interface
│   ├── ColorPalette.tsx    # Displays the color palette
│   ├── FontPairings.tsx    # Displays the typography
│   ├── LogoDisplay.tsx     # Displays primary and secondary logos
│   ├── MockupDisplay.tsx   # Displays brand mockups
│   └── ...               # Other UI components
│
├── services/           # API interaction layer
│   └── geminiService.ts    # All logic for interacting with the Gemini API
│
├── types.ts            # TypeScript type definitions for the app
├── App.tsx             # Main application component, handles routing/views
├── index.html          # The main HTML file
├── index.tsx           # React application entry point
└── README.md           # This file
```

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please see `CONTRIBUTING.md` for details on our code of conduct and the process for submitting pull requests to us.

## License

Distributed under the MIT License. See `LICENSE` for more information.
