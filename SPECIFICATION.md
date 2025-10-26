# Project Specification: AI Brand Identity Generator & Chat

**Version:** 1.2
**Date:** 2023-10-29

## 1. Project Overview

This document outlines the functional and technical specifications for the AI Brand Identity Generator & Chat application. The primary goal of this project is to provide users with a powerful, AI-driven tool to rapidly create a comprehensive brand identity from a simple mission statement. The application also includes an integrated AI assistant to provide branding advice and answer user questions.

The application is designed as a single-page application (SPA) with a clean, modern, and intuitive user interface, prioritizing a seamless user experience and architectural flexibility.

---

## 2. Core Features

### 2.1. AI Name Suggestion

-   **Functionality**: Before generating a brand, users can optionally request AI-powered name suggestions based on their mission statement.
-   **Process**: The application sends the mission to the **Name Generator** model, which returns a list of potential names. The user can select a name, regenerate the list, or proceed with their own.

### 2.2. Brand Identity Generation

-   **Input**: The user provides a text-based "company mission" and a company name.
-   **Process**:
    1.  The mission and name are sent to the configured **Brand Strategist** model.
    2.  The model is instructed to return a structured JSON object ("Brand Bible") containing text-based assets.
    3.  This JSON object includes a color palette, font pairing, and multiple image prompts.
    4.  The application then uses the configured **Visual Artist** model to generate images for each received prompt.
-   **Output**: A visually rich dashboard displaying the complete brand identity.

### 2.3. Component-Specific Regeneration

-   **Functionality**: Users can regenerate any individual component of the brand bible without starting over.
-   **Process**: A user's request for change is sent to the appropriate AI agent (**Creative Director** for prompts, **Design Specialist** for data) along with the existing brand context, ensuring a coherent and iterative design process.
-   **Supported Components**: Primary Logo, Secondary Marks, Mockups, Color Palette, Font Pairings.

### 2.4. AI Chat Assistant

-   **Functionality**: A dedicated view provides a chat interface for users to interact with a branding-focused AI assistant.
-   **Model**: Powered by the configured **Branding Assistant** model, optimized for fast, conversational responses.
-   **User Experience**: Features a familiar message-based UI with streaming responses for a real-time feel.

### 2.5. Brand Bible Export

-   **Functionality**: Users can download the complete generated brand identity as a single `.zip` file.
-   **Contents**: The zip file contains all generated PNG images and a self-contained `brand-guide.html` file.

---

## 3. UI/UX Design

### 3.1. General Layout

-   **Single-Page Application (SPA)** with a sticky header for navigation between "Brand Generator" and "AI Chat" views.
-   **Styling**: A modern, dark-mode theme implemented using Tailwind CSS.
-   **Error Handling**: A global, non-intrusive "toast" notification system displays user-friendly messages for errors.

### 3.2. Key UI Components

-   **Mission Input**: A large textarea with a "Generate" button that shows a loading state.
-   **Name Suggestion**: An optional workflow with a text input, suggestion buttons, and a regeneration option.
-   **Brand Dashboard**: A collection of well-structured cards for each brand element.
-   **Regenerate Modal**: A focused dialog that captures user feedback for iterative design.
-   **Chat Interface**: A scrollable message history with a text input and streaming responses.
-   **Error Toast**: An auto-dismissing banner that appears at the top of the screen.

---

## 4. Technical Architecture

### 4.1. Frontend Stack

-   **Framework**: React 19 (via CDN import maps)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS (via CDN)
-   **File Packaging**: JSZip, FileSaver.js (via CDN)
-   **Module System**: Native ES Modules with Import Maps.

### 4.2. State Management

-   **Local Component State**: Managed via React hooks (`useState`, `useCallback`).
-   **Global Error State**: A global `ErrorContext` provides a centralized error state, consumed by the `ErrorToast` component.

### 4.3. AI Service Architecture (Provider-Agnostic)

The application features a flexible, provider-agnostic architecture for its AI services.

-   **Configuration (`config.ts`)**: A central file where developers can set the `AI_PROVIDER` (e.g., 'GEMINI') and map abstract roles (e.g., `BRAND_STRATEGIST`) to specific model names.
-   **Service Facade (`services/aiService.ts`)**: The single entry point for all AI interactions in the application. It reads the configuration from `config.ts` and dynamically loads the corresponding provider's implementation. This decouples the UI components from the AI provider logic.
-   **Provider Implementations (`services/providers/`)**: This directory contains provider-specific logic. For example, `gemini.ts` contains all the code that interacts with the `@google/genai` SDK. Adding a new provider would involve creating a new file in this directory that exports functions with the same signatures.

### 4.4. AI Agent Roles

The application uses a multi-agent system, with roles and models defined in `config.ts`.

-   **Name Generator**: Suggests creative business names based on the user's mission.
-   **Brand Strategist**: Generates the initial structured text for the brand bible.
-   **Visual Artist**: Generates all images from text prompts.
-   **Creative Director**: Handles fast, context-aware regeneration of image prompts.
-   **Design Specialist**: Handles high-quality regeneration of structured data (colors, fonts).
-   **Branding Assistant**: Powers the low-latency, streaming AI chat.

For a complete breakdown, see the **[AI Agent Architecture Document](./AGENTS.md)**.

### 4.5. Project Structure

```
/
├── components/         # Reusable React components
├── contexts/           # React context for global state
├── services/           # AI service layer
│   ├── providers/      # Provider-specific implementations (e.g., gemini.ts)
│   └── aiService.ts    # Central service facade
├── utils/              # Utility functions
├── config.ts           # Central AI provider and model configuration
├── types.ts            # Centralized TypeScript type definitions
├── App.tsx             # Main component, handles view switching
└── ...                 # Other project files
```