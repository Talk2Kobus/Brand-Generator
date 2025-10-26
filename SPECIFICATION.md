# Project Specification: Brand Identity Generator

## 1. Overview

This document outlines the functional and technical specifications for the Brand Identity Generator, a web application that leverages a multi-agent AI system to create comprehensive brand identities from a user's company mission. It also includes user accounts, a brand library, and an analytics dashboard.

## 2. Core Features

### 2.1. Guided Brand Generation Workflow

The application will guide the user through a multi-step process to generate their brand identity.

-   **Stage 1: Mission Input**: The user provides their company's mission statement or business idea.
-   **Stage 2: Name Suggestion**: The AI suggests creative business names.
-   **Stage 3: Domain Availability Check (Optional)**: A mocked service checks domain availability for suggested names.
-   **Stage 4: Brand Voice & Tone Definition**: The AI generates "Brand Voice Archetypes" to define brand personality.
-   **Stage 5: Brand Bible Generation**: The AI generates all brand components.
-   **Stage 6: Brand Bible Display**: The complete brand bible is displayed.

### 2.2. Brand Bible Components

The generated brand bible will include:

-   **Color Palette**: 5 colors with hex codes, names, and usage.
-   **Typography**: A header/body Google Font pairing.
-   **Logos**: One primary logo and two secondary marks.
-   **Mockups**: Three photorealistic mockups.
-   **Brand Voice**: The selected brand voice archetype.

### 2.3. Iterative Regeneration

-   Every component of the brand bible can be individually regenerated via a modal where the user provides text feedback.

### 2.4. Downloadable Brand Guide

-   The complete brand bible can be exported as a self-contained HTML file.

### 2.5. User Authentication

-   **2.5.1. Auth Modal**: A single modal provides forms for both login and registration.
-   **2.5.2. Email/Password**: Users can create an account and log in using their email and password.
-   **2.5.3. Social Sign-On**: Users can sign up or log in using "Continue with Google" and "Continue with Facebook" options for a streamlined experience.
-   **2.5.4. Session Management**: The application state will reflect whether a user is authenticated, unlocking features like the Library and Analytics.

### 2.6. Personal Brand Library

-   **2.6.1. Saving**: Authenticated users will see a "Save to Library" button on the brand results page.
-   **2.6.2. Viewing**: A new "My Library" navigation item will take users to a gallery view of all their saved brands. Each brand is displayed as a card with its name and primary logo.
-   **2.6.3. Loading**: Clicking a brand in the library will load its full brand bible back into the "Generator" view, allowing the user to view, edit, or re-download it.

### 2.7. Analytics Dashboard

-   **2.7.1. Community Trends**: A new "Analytics" navigation item, visible to authenticated users, will display community-wide trends.
-   **2.7.2. Data Displayed**: The dashboard will feature stat cards and charts showing:
    -   Total number of brands created across the platform.
    -   The most frequently used colors.
    -   The most frequently used header and body fonts.

### 2.8. AI Chat Assistant

-   A separate "AI Chat" view provides a conversational interface with an AI assistant specialized in branding.
-   **Multimodal Input**: Users can attach an image to their message to ask questions about visual content.

## 3. Technical Architecture

-   **Framework**: React with TypeScript, built using Vite.
-   **Styling**: Tailwind CSS.
-   **State Management**: React Hooks (`useState`, `useContext`).
    -   `ErrorContext`: For global, non-intrusive error notifications.
    -   `AuthContext`: For managing user authentication state, session information, and providing auth functions to components.
-   **AI Integration**:
    -   Uses the Gemini API via the `@google/genai` SDK.
    -   A modular `aiService.ts` abstracts the provider, allowing for easy swapping.
    -   `config.ts` maps agent roles to specific model names (detailed in `AGENTS.md`).
-   **Orchestration**: The primary orchestrator of the multi-agent system is the `BrandGenerator.tsx` component. It manages the application state, directs the user workflow through various stages, calls the appropriate AI service functions (agents) at each stage, and assembles their outputs into the final brand bible.
-   **Backend (Mocked)**:
    -   A comprehensive mock API is implemented in `services/apiService.ts`.
    -   It uses `localStorage` to simulate a database, providing persistence for users, brand identities, and analytics events across browser sessions.
    -   This allows the application to be fully functional for local development without a real backend.
-   **Image Generation**: The `imagen` model is used for all visual assets.
-   **JSON and Schema Enforcement**: The application relies on the AI model's ability to generate structured JSON by providing detailed response schemas.

## 4. User Experience & Design

-   **Layout**: A clean, modern, and responsive dark-mode theme.
-   **Feedback**: Clear loading indicators and progress messages are used during all asynchronous operations.
-   **Error Handling**: A user-friendly toast notification system displays non-technical error messages.
-   **Accessibility**: Standard accessibility practices are followed.