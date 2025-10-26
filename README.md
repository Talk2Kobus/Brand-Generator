# Brand Identity Generator & AI Chat

This is an advanced web application that uses a multi-agent AI system to generate a complete brand identity based on a simple company mission. It also features user authentication, a personal library for saved brands, an analytics dashboard, and an integrated AI chat assistant.

## Features

-   **Multi-Step Guided Workflow**: A clean, step-by-step process guides the user from idea to complete brand identity.
-   **User Authentication**: Secure sign-up and login with email/password or social providers (Google, Facebook).
-   **Personal Brand Library**: Authenticated users can save their generated brand identities to a personal library and load them back for viewing or editing.
-   **Analytics Dashboard**: See community-wide trends, including the most popular colors and fonts used in brand generation.
-   **AI Name Suggestion**: Enter a business idea and get a list of creative, memorable business names.
-   **Domain Availability Check**: Check if suggested names are available with a desired TLD (e.g., .com, .io, .co.za). Includes auto-suggestion of TLD based on user location.
-   **Brand Voice & Tone Definition**: The AI suggests brand archetypes (e.g., "The Sage," "The Jester") to define the brand's personality, which influences all subsequent visual generation.
-   **Comprehensive Brand Bible**: Generates a full suite of brand assets, including:
    -   **Color Palette**: A 5-color palette with hex codes, creative names, and usage guides.
    -   **Typography**: A curated pairing of Google Fonts for headers and body text.
    -   **Logos**: A primary logo and two secondary brand marks.
    -   **Brand Mockups**: Photorealistic mockups of the brand in action (business cards, websites, t-shirts).
-   **Iterative Regeneration**: Don't like a specific element? Regenerate any part of the brand bible (logo, colors, fonts, mockups) with a simple text prompt describing the desired change.
-   **Downloadable Brand Guide**: Export the complete brand bible as a stylish, self-contained HTML file.
-   **Integrated AI Chat**: Switch to a dedicated chat view to ask a specialized branding assistant for marketing ideas or design feedback.
    -   **Multimodal Input**: Users can attach an image to their messages to ask questions about visual content.
-   **Error Handling**: A clean, non-intrusive toast notification system for handling API or other errors gracefully.

## Architecture

This project is built as a modern, single-page application using **React** and **TypeScript**.

-   **Frontend**: Built with Vite, React, and styled with Tailwind CSS for rapid, responsive UI development.
-   **AI Services**: The application features a modular AI service architecture.
    -   A central `aiService.ts` acts as a facade, allowing the application to be provider-agnostic.
    -   The current implementation uses the **Gemini API** via the `@google/genai` SDK, located in `services/providers/gemini.ts`.
    -   Adding a new provider (e.g., OpenAI) would only require a new provider file and a one-line change in `config.ts`.
-   **Multi-Agent System**: The branding workflow is broken down into a series of tasks, each handled by a specialized AI "agent" with a specific role and model, as defined in `config.ts` and documented in `AGENTS.md`. The orchestration of these agents is managed by the main React component, `BrandGenerator.tsx`, which directs the workflow, calls the appropriate agent for each step, and collates the results.
-   **Backend (Simulated)**: To provide a seamless, out-of-the-box development experience, the project includes a comprehensive mock backend in `services/apiService.ts`. This service uses **localStorage** to simulate a real database, handling user authentication, session management, and CRUD operations for brand identities and analytics. This allows the full application to be run and tested locally without any backend setup.
-   **Production Backend Guide**: For developers who wish to deploy this application in a production environment, a detailed prompt for generating the necessary serverless backend on Google Cloud is provided in `backend_prompt.md`. This prompt outlines the required database schema (see `database_schema.sql`) and API endpoints.

## Getting Started

### Prerequisites

-   Node.js (v18 or later)
-   npm, yarn, or pnpm

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/brand-identity-generator.git
    cd brand-identity-generator
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your API Key:**
    -   You will need a Gemini API key.
    -   The project expects the API key to be available as an environment variable. The specific mechanism for this depends on your deployment environment.

## Contributing

Contributions are welcome! Please read `CONTRIBUTING.md` for guidelines on how to report bugs, suggest features, and submit pull requests.

This project has adopted the Contributor Covenant Code of Conduct. Please see `CODE_OF_CONDUCT.md` for more information.