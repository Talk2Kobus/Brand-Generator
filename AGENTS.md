# AI Agent Architecture

This document provides a detailed breakdown of the different AI agents (powered by Google's models) that collaborate to create the brand identity within this application. The system is designed as a multi-agent workflow, where each agent has a specialized role.

---

### Agent 1: The Brand Strategist

This is the primary agent responsible for creating the foundational, text-based brand identity.

-   **Model**: `gemini-2.5-pro`
-   **Role**: To interpret the user's company mission and generate a comprehensive, structured JSON object containing all the textual elements of the brand bible.
-   **Trigger**: Called once when the user clicks the initial "Generate Brand" button.
-   **Core Prompt**: `"You are a world-class branding expert. Based on the following company mission, generate a complete brand identity bible. The mission is: '[USER_MISSION]'"`
-   **Output Configuration**:
    -   `responseMimeType`: `"application/json"`
    -   `responseSchema`: A detailed schema that enforces the structure of the output. The key components of the schema are:
        -   `colorPalette`: An array of 5 objects, each with `hex`, `name`, and `usage`.
        -   `fontPairing`: An object with `header` and `body` font names (from Google Fonts).
        -   `primaryLogoPrompt`: A detailed, descriptive prompt for generating the main logo.
        -   `secondaryMarkPrompts`: An array of two descriptive prompts for simpler brand marks.
        -   `mockupPrompts`: An array of three detailed, photorealistic prompts for specific mockups (business card, website, t-shirt).

---

### Agent 2: The Visual Artist

This agent is responsible for turning text prompts into high-quality images.

-   **Model**: `imagen-4.0-generate-001`
-   **Role**: To generate all visual assets, including the primary logo, secondary marks, and brand mockups.
-   **Trigger**: Called multiple times in parallel after the Brand Strategist generates the initial prompts. It's also called whenever a user requests to regenerate a specific visual asset.
-   **Input**: A detailed text prompt (e.g., `"A minimalist vector logo of a soaring eagle..."`).
-   **Output Configuration**:
    -   `numberOfImages`: 1
    -   `aspectRatio`: `'1:1'`
    -   Returns a base64-encoded string for the generated image.

---

### Agent 3: The Creative Director

This agent handles the iterative refinement of visual elements by generating new prompts based on user feedback.

-   **Model**: `gemini-2.5-flash`
-   **Role**: To regenerate a single image prompt for a logo or mockup based on user's change request. It's designed to be fast and context-aware.
-   **Trigger**: Called when a user submits the "Regenerate" form for a specific logo, mark, or mockup.
-   **Core Prompt**: `"You are a creative director. Based on the following context, regenerate an image prompt for a [ITEM_DESCRIPTION]. The user's specific change request is: '[USER_REQUEST]'. Context: [BRAND_BIBLE_CONTEXT] Output only the new, detailed, and photorealistic image prompt."`
-   **Output Configuration**: Outputs a plain text string, which is the new prompt to be passed to the Visual Artist agent.

---

### Agent 4: The Design Specialist

This agent is a specialized version of the Brand Strategist, focused on regenerating structured data like colors and fonts.

-   **Model**: `gemini-2.5-pro`
-   **Role**: To regenerate the `colorPalette` or `fontPairing` based on user feedback, ensuring the output remains in the correct JSON format. The Pro model is used to maintain high quality and adhere to the schema.
-   **Trigger**: Called when a user requests to regenerate the Color Palette or Typography.
-   **Core Prompt**: `"Based on the company mission '[USER_MISSION]' and their existing brand identity, regenerate the [color palette / font pairing]. The user has requested: '[USER_REQUEST]'. Output JSON that adheres to the schema."`
-   **Output Configuration**:
    -   `responseMimeType`: `"application/json"`
    -   `responseSchema`: The specific sub-schema for either `colorPalette` or `fontPairing`.

---

### Agent 5: The Branding Assistant

This agent powers the conversational AI chat feature, providing real-time advice and answering questions.

-   **Model**: `gemini-2.5-flash`
-   **Role**: To act as a friendly and helpful branding expert in a chat interface. It is optimized for low-latency, conversational interactions.
-   **Trigger**: Called every time the user sends a message in the AI Chat view.
-   **System Instruction**: `"You are a friendly and helpful assistant specializing in branding, marketing, and design. Provide concise and actionable advice."`
-   **Output Configuration**: The response is streamed token-by-token to create a real-time, dynamic chat experience.
