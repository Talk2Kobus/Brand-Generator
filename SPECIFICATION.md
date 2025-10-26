# Project Specification: AI Brand Identity Generator & Chat

**Version:** 1.0
**Date:** 2023-10-27

## 1. Project Overview

This document outlines the functional and technical specifications for the AI Brand Identity Generator & Chat application. The primary goal of this project is to provide users with a powerful, AI-driven tool to rapidly create a comprehensive brand identity from a simple mission statement. The application also includes an integrated AI assistant to provide branding advice and answer user questions.

The application is designed as a single-page application (SPA) with a clean, modern, and intuitive user interface, prioritizing a seamless user experience from input to a fully-realized brand bible.

---

## 2. Core Features

### 2.1. Brand Identity Generation

-   **Input**: The user provides a text-based "company mission" in a textarea.
-   **Process**:
    1.  The mission statement is sent to the Gemini 2.5 Pro model.
    2.  The model is instructed to act as a branding expert and return a structured JSON object (a "Brand Bible") containing text-based assets.
    3.  This JSON object includes a 5-color palette, a Google Font pairing, a primary logo prompt, two secondary mark prompts, and three photorealistic mockup prompts.
    4.  The application then uses the Imagen 4 model to generate images for each of the six received prompts in parallel.
-   **Output**: A visually rich dashboard displaying the complete brand identity:
    -   Primary Logo
    -   Two Secondary Marks/Icons
    -   Three Brand Mockups (Business Card, Website, T-Shirt)
    -   A 5-color palette with hex codes, names, and usage descriptions.
    -   A typography section previewing the generated header and body fonts.

### 2.2. Component-Specific Regeneration

-   **Functionality**: Users can regenerate any individual component of the brand bible without starting the entire process over.
-   **User Flow**:
    1.  The user hovers over a component (e.g., a logo, a mockup, the color palette) and clicks a "Regenerate" button.
    2.  A modal dialog appears, prompting the user to describe the desired changes (e.g., "Make this logo more abstract," "Use a cooler color palette").
    3.  The request, along with the original mission and the context of the current brand bible, is sent to the appropriate Gemini model.
    4.  The model generates a new prompt, color palette, or font pairing based on the request.
    5.  If an image is required, the new prompt is sent to Imagen 4.
    6.  The specific component on the dashboard updates in place, showing a loading state during the process.
-   **Supported Components**: Primary Logo, Secondary Marks, Mockups, Color Palette, Font Pairings.

### 2.3. AI Chat Assistant

-   **Functionality**: A dedicated view provides a chat interface for users to interact with a branding-focused AI assistant.
-   **Model**: Powered by the Gemini 2.5 Flash model, optimized for fast, conversational responses.
-   **User Experience**:
    -   The interface displays a familiar, message-based chat history.
    -   User and bot messages are clearly distinguished.
    -   The AI's response is streamed token by token, providing a real-time, interactive feel.
    -   The chat session is persistent for the duration of the user's session in the app.

---

## 3. UI/UX Design

### 3.1. General Layout

-   **Single-Page Application (SPA)**: The application operates within a single `index.html` file.
-   **Header**: A sticky header provides the application title and navigation between the "Brand Generator" and "AI Chat" views.
-   **Two-View System**: The main content area switches between the `BrandGenerator` and `ChatBot` components.
-   **Styling**: A modern, dark-mode theme is implemented using Tailwind CSS. The primary accent color is cyan, used for buttons, highlights, and links.
-   **Typography**: The app uses the 'Inter' font as a base. The generated brand bible dynamically loads and applies the selected Google Fonts for the typography preview.

### 3.2. User Flow

1.  The user lands on the **Brand Generator** view.
2.  The user enters their company mission into the textarea and clicks "Generate Brand."
3.  A full-page **loading skeleton** is displayed, mimicking the layout of the final dashboard and providing visual feedback that the request is processing.
4.  Once generation is complete, the skeleton is replaced by the **Brand Bible Dashboard**.
5.  The user can interact with the dashboard: copy hex codes, view mockups, and initiate regeneration for any component.
6.  The user can switch to the **AI Chat** view at any time to ask for branding advice.

### 3.3. Key UI Components

-   **Mission Input**: A large textarea with clear instructions. The "Generate" button is disabled until input is provided and shows a loading state during generation.
-   **Brand Dashboard**: A collection of well-structured cards for each brand element.
    -   `ImageCard`: A reusable component for displaying logos and mockups, featuring a title and a hover-to-reveal "Regenerate" button. It handles its own image loading state and displays a spinner during regeneration.
    -   `ColorPalette`: Displays color swatches, names, hex codes (with copy-to-clipboard functionality), and usage info.
    -   `FontPairings`: Previews the header and body fonts with sample text.
-   **Regenerate Modal**: A focused dialog that captures user feedback for regenerating a component.
-   **Chat Interface**: A scrollable message history with a text input and send button at the bottom.

---

## 4. Technical Architecture

### 4.1. Frontend Stack

-   **Framework**: React 19 (via CDN import maps)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS (via CDN)
-   **Module System**: Native ES Modules with Import Maps. This removes the need for a local build step (like Vite or Webpack) and pulls dependencies directly from a CDN.

### 4.2. AI Integration (`@google/genai`)

-   **Library**: The official `@google/genai` SDK is used for all interactions with the Google AI platform.
-   **API Key Management**: The API key is expected to be available as `process.env.API_KEY` in the execution environment.

### 4.3. Model Usage

-   **`gemini-2.5-pro`**: Used for the initial, complex task of generating the structured Brand Bible JSON. Its larger context window and advanced reasoning are ideal for this multi-part generation.
-   **`imagen-4.0-generate-001`**: Used for all image generation tasks. It produces high-quality, photorealistic images from text prompts.
-   **`gemini-2.5-flash`**: Used for the AI Chat assistant and for the faster, more targeted regeneration tasks (like creating a new image prompt). It's chosen for its low latency.

### 4.4. State Management

-   **Local Component State**: State is managed locally within React components using `useState` and `useCallback` hooks.
-   **Top-Down Data Flow**: The main `BrandGenerator` component manages the primary state (mission, brandBible, isLoading) and passes data and callbacks down to its children. The `App` component lifts state for the `brandBible` to manage dynamic font loading.

### 4.5. Project Structure

```
/
├── components/         # Reusable React components
├── services/           # API interaction layer (geminiService.ts)
├── types.ts            # Centralized TypeScript type definitions
├── App.tsx             # Main component, handles view switching
├── index.html          # Entry point with import maps and Tailwind config
├── index.tsx           # React root renderer
├── README.md           # Project documentation
├── SPECIFICATION.md    # This file
└── ...                 # Contribution and licensing files
```
