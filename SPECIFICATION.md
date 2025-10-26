# Project Specification: AI Brand Identity Generator & Chat

**Version:** 1.1
**Date:** 2023-10-28

## 1. Project Overview

This document outlines the functional and technical specifications for the AI Brand Identity Generator & Chat application. The primary goal of this project is to provide users with a powerful, AI-driven tool to rapidly create a comprehensive brand identity from a simple mission statement. The application also includes an integrated AI assistant to provide branding advice and answer user questions.

The application is designed as a single-page application (SPA) with a clean, modern, and intuitive user interface, prioritizing a seamless user experience from input to a fully-realized, downloadable brand bible.

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

### 2.4. Brand Bible Export

-   **Functionality**: Users can download the complete generated brand identity as a single `.zip` file.
-   **Trigger**: A "Download Brand Bible" button becomes active after the initial generation is complete.
-   **Contents**: The zip file contains:
    -   `primary-logo.png`
    -   `secondary-mark-1.png`
    -   `secondary-mark-2.png`
    -   `mockup-business-card.png`
    -   `mockup-website-homepage.png`
    -   `mockup-t-shirt.png`
    -   `brand-guide.html`: A self-contained HTML document that includes the company mission, the full color palette with visual swatches, and live typography previews using Google Fonts.

---

## 3. UI/UX Design

### 3.1. General Layout

-   **Single-Page Application (SPA)**: The application operates within a single `index.html` file.
-   **Header**: A sticky header provides the application title and navigation between the "Brand Generator" and "AI Chat" views.
-   **Error Handling**: A global, non-intrusive "toast" notification system displays user-friendly messages for API failures or other errors.
-   **Styling**: A modern, dark-mode theme is implemented using Tailwind CSS. The primary accent color is cyan.
-   **Typography**: The app uses the 'Inter' font as a base. The generated brand bible dynamically loads and applies the selected Google Fonts for the typography preview.

### 3.2. User Flow

1.  The user lands on the **Brand Generator** view.
2.  The user enters their company mission and clicks "Generate Brand."
3.  A full-page **loading skeleton** is displayed. If an error occurs, an error toast appears.
4.  Once generation is complete, the **Brand Bible Dashboard** is displayed.
5.  A **"Download Brand Bible"** button appears, allowing the user to save their assets.
6.  The user can interact with the dashboard: copy hex codes, view mockups, and initiate regeneration for any component.
7.  The user can switch to the **AI Chat** view at any time.

### 3.3. Key UI Components

-   **Mission Input**: A large textarea with a "Generate" button that shows a loading state.
-   **Download Button**: Appears after generation is complete and shows a loading state while the zip file is being prepared.
-   **Brand Dashboard**: A collection of well-structured cards for each brand element.
-   **Regenerate Modal**: A focused dialog that captures user feedback.
-   **Chat Interface**: A scrollable message history with a text input.
-   **Error Toast**: An auto-dismissing banner that appears at the top of the screen to display error messages without interrupting workflow.

---

## 4. Technical Architecture

### 4.1. Frontend Stack

-   **Framework**: React 19 (via CDN import maps)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS (via CDN)
-   **File Packaging**: JSZip, FileSaver.js (via CDN)
-   **Module System**: Native ES Modules with Import Maps, removing the need for a local build step.

### 4.2. State Management

-   **Local Component State**: Managed within React components using `useState` and `useCallback` hooks.
-   **Global Error State**: A global `ErrorContext` provides a centralized `showError` function and state, which is consumed by the `ErrorToast` component. This decouples error reporting from error display.
-   **Top-Down Data Flow**: The `App` component manages top-level state (like the `brandBible` for font loading) and passes it down to child components.

### 4.3. AI Agent Architecture

The application uses a multi-agent system, leveraging different Google AI models for specialized tasks to ensure optimal quality and performance.

-   **Brand Strategist (`gemini-2.5-pro`)**: Generates the initial structured text for the brand bible (prompts, colors, fonts) in JSON format.
-   **Visual Artist (`imagen-4.0-generate-001`)**: Generates all images from text prompts.
-   **Creative Director (`gemini-2.5-flash`)**: Handles fast, context-aware regeneration of image prompts based on user feedback.
-   **Design Specialist (`gemini-2.5-pro`)**: Handles high-quality regeneration of structured data (color palettes, font pairings).
-   **Branding Assistant (`gemini-2.5-flash`)**: Powers the low-latency, streaming AI chat.

For a complete breakdown, see the **[AI Agent Architecture Document](./AGENTS.md)**.

### 4.4. Project Structure

```
/
├── components/         # Reusable React components (ErrorToast, etc.)
├── contexts/           # React context for global state (ErrorContext.tsx)
├── services/           # API interaction layer (geminiService.ts)
├── utils/              # Utility functions (generateBrandGuideHtml.ts)
├── types.ts            # Centralized TypeScript type definitions
├── App.tsx             # Main component, handles view switching & error provider
├── index.html          # Entry point with import maps and CDN links
├── index.tsx           # React root renderer
├── AGENTS.md           # Detailed breakdown of the AI agent architecture
├── README.md           # Project documentation
└── SPECIFICATION.md    # This file
```
