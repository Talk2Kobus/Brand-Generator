# Project Specification: Brand Identity Generator

## 1. Overview

This document outlines the functional and technical specifications for the Brand Identity Generator, a web application that leverages a multi-agent AI system to create comprehensive brand identities from a user's company mission.

## 2. Core Features

### 2.1. Guided Brand Generation Workflow

The application will guide the user through a multi-step process to generate their brand identity.

-   **Stage 1: Mission Input**: The user provides their company's mission statement or business idea in a text area. This is the foundational input for the entire process.
-   **Stage 2: Name Suggestion**:
    -   Based on the mission, the AI will suggest a list of 5 creative and memorable business names.
    -   The user can select a suggested name or enter their own.
-   **Stage 3: Domain Availability Check (Optional)**:
    -   The UI will provide an option to check the domain availability for the suggested names.
    -   It will auto-suggest a TLD based on the user's location (via GeoIP) but allow the user to select from a list of common TLDs.
    -   **Technical Note**: This requires a secure backend proxy to handle API calls to a domain registrar. The frontend will have a mocked implementation. A prompt to build the backend is provided in `backend_prompt.md`.
-   **Stage 4: Brand Voice & Tone Definition**:
    -   After a name is selected, the AI generates 3-5 "Brand Voice Archetypes" (e.g., The Sage, The Jester).
    -   Each archetype is presented with a name, a short description, and keywords.
    -   The user can select one archetype that best fits their brand's personality. This choice will influence the visual style of the generated assets.
    -   The user can also skip this step.
-   **Stage 5: Brand Bible Generation**:
    -   The application will display a loading state with progress messages as the AI generates the brand bible components.
    -   This process involves multiple AI calls to generate text (prompts, colors, fonts) and then images.
-   **Stage 6: Brand Bible Display**:
    -   The complete brand bible is displayed in a clean, organized layout.
    -   The user can view all generated assets.

### 2.2. Brand Bible Components

The generated brand bible will include:

-   **Color Palette**: An array of 5 `ColorInfo` objects, each with a hex code, a creative name, and a usage description.
-   **Typography**: A `FontPairing` object with two Google Font names, one for headers and one for body text. The app will dynamically load these fonts.
-   **Logos**:
    -   One primary logo image.
    -   Two secondary mark/icon images.
-   **Mockups**: Three photorealistic mockup images showcasing the brand identity on different media (e.g., business card, website, apparel).
-   **Brand Voice**: The selected brand voice archetype, if chosen.

### 2.3. Iterative Regeneration

-   Every component of the brand bible (colors, fonts, each logo, each mockup) will have a "Regenerate" button.
-   Clicking this button opens a modal where the user can provide a text prompt describing the desired changes (e.g., "make the logo more abstract," "use a warmer color palette").
-   The application will make a targeted AI call to regenerate only that specific asset, preserving the rest of the brand bible.

### 2.4. Downloadable Brand Guide

-   A "Download" button will be available to export the complete brand bible.
-   The output will be a self-contained HTML file that is well-styled and presents all the brand information, including the dynamically loaded Google Fonts.

### 2.5. AI Chat Assistant

-   The application will feature a separate "AI Chat" view.
-   This view provides a conversational interface with an AI assistant specialized in branding, marketing, and design.
-   The chat will support streaming responses for a real-time feel.

## 3. Technical Architecture

-   **Framework**: React with TypeScript, built using Vite.
-   **Styling**: Tailwind CSS.
-   **State Management**: React Hooks (`useState`, `useCallback`, etc.). A context (`ErrorContext`) will be used for global error handling.
-   **AI Integration**:
    -   The primary interface will be the Gemini API via the `@google/genai` SDK.
    -   The architecture will be modular, with a central `aiService.ts` that exports functions from a selected provider (e.g., Gemini). This allows for easy swapping of backend AI providers.
    -   A `config.ts` file will map abstract agent roles (e.g., `BRAND_STRATEGIST`, `VISUAL_ARTIST`) to specific model names, allowing for easy model updates. This is detailed in `AGENTS.md`.
-   **Image Generation**: The `imagen` model will be used for generating all visual assets.
-   **JSON and Schema Enforcement**: The application will heavily rely on the AI model's ability to generate structured JSON data by providing detailed response schemas.

## 4. User Experience & Design

-   **Layout**: A clean, modern, and responsive dark-mode theme.
-   **Feedback**: The application will provide clear loading indicators and progress messages during AI generation steps to manage user expectations.
-   **Error Handling**: A user-friendly toast notification system will display non-technical error messages.
-   **Accessibility**: Standard accessibility practices (e.g., ARIA attributes, semantic HTML) will be followed.
