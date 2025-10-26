# AI Agent Architecture

This document provides a detailed breakdown of the different AI agents that collaborate to create the brand identity. The system is designed as a multi-agent workflow where each agent has a specialized role, and the specific model for each role is defined in `config.ts`, making the architecture flexible and easy to update.

---

### Agent 1: The Brand Strategist

This is the primary agent responsible for creating the foundational, text-based brand identity.

-   **Model**: `BRAND_STRATEGIST` (configurable in `config.ts`, default: `gemini-2.5-pro`)
-   **Role**: To interpret the user's company mission and generate a comprehensive, structured JSON object containing all the textual elements of the brand bible.
-   **Trigger**: Called once when the user clicks the initial "Generate Brand" button.
-   **Core Prompt**: `"You are a world-class branding expert. Based on the following company mission, generate a complete brand identity bible. The mission is: '[USER_MISSION]'"`
-   **Output Configuration**:
    -   `responseMimeType`: `"application/json"`
    -   `responseSchema`: A detailed schema that enforces the structure of the output, including color palettes, font pairings, and various image prompts.

---

### Agent 2: The Visual Artist

This agent is responsible for turning text prompts into high-quality images.

-   **Model**: `VISUAL_ARTIST` (configurable in `config.ts`, default: `imagen-4.0-generate-001`)
-   **Role**: To generate all visual assets, including the primary logo, secondary marks, and brand mockups.
-   **Trigger**: Called multiple times after the Brand Strategist generates prompts, and whenever a user regenerates a visual asset.
-   **Input**: A detailed text prompt.
-   **Output Configuration**: Generates a single 1:1 aspect ratio image and returns it as a base64-encoded string.

---

### Agent 3: The Creative Director

This agent handles the iterative refinement of visual elements by generating new prompts based on user feedback.

-   **Model**: `CREATIVE_DIRECTOR` (configurable in `config.ts`, default: `gemini-2.5-flash`)
-   **Role**: To quickly regenerate a single image prompt for a logo or mockup based on a user's change request and the existing brand context.
-   **Trigger**: Called when a user submits the "Regenerate" form for a specific visual asset.
-   **Core Prompt**: `"You are a creative director. Based on the following context, regenerate an image prompt for a [ITEM_DESCRIPTION]. The user's specific change request is: '[USER_REQUEST]'. Context: [BRAND_BIBLE_CONTEXT] Output only the new, detailed, and photorealistic image prompt."`
-   **Output Configuration**: Outputs a plain text string (the new prompt).

---

### Agent 4: The Design Specialist

This agent is a specialized version of the Brand Strategist, focused on regenerating structured data like colors and fonts.

-   **Model**: `DESIGN_SPECIALIST` (configurable in `config.ts`, default: `gemini-2.5-pro`)
-   **Role**: To regenerate the `colorPalette` or `fontPairing` based on user feedback, ensuring the output remains in the correct JSON format.
-   **Trigger**: Called when a user requests to regenerate the Color Palette or Typography.
-   **Core Prompt**: `"Based on the company mission '[USER_MISSION]' and their existing brand identity, regenerate the [color palette / font pairing]. The user has requested: '[USER_REQUEST]'. Output JSON that adheres to the schema."`
-   **Output Configuration**:
    -   `responseMimeType`: `"application/json"`
    -   `responseSchema`: The specific sub-schema for either `colorPalette` or `fontPairing`.

---

### Agent 5: The Branding Assistant

This agent powers the conversational AI chat feature, providing real-time advice and answering questions.

-   **Model**: `BRANDING_ASSISTANT` (configurable in `config.ts`, default: `gemini-2.5-flash`)
-   **Role**: To act as a friendly and helpful branding expert in a chat interface. It is optimized for low-latency, conversational interactions.
-   **Trigger**: Called every time the user sends a message in the AI Chat view.
-   **System Instruction**: `"You are a friendly and helpful assistant specializing in branding, marketing, and design. Provide concise and actionable advice."`
-   **Output Configuration**: The response is streamed token-by-token to create a real-time, dynamic chat experience.
