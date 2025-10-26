# AI Agent Architecture

This document provides a detailed breakdown of the different AI agents that collaborate to create the brand identity. The system is designed as a multi-agent workflow where each agent has a specialized role. The specific model for each role is defined in `config.ts`, making the architecture flexible and easy to update. The orchestration of these agents—calling them in the correct sequence and managing the data flow between them—is handled by the application's frontend code. The main `BrandGenerator.tsx` component manages the overall state and workflow, while its modular child "stage" components (e.g., `MissionStage`, `NameSuggestionStage`) handle the specific UI and trigger the appropriate agent for each step.

---

### Agent 1: The Name Generator

This agent provides creative business name ideas based on the user's initial concept.

-   **Model**: `NAME_GENERATOR` (configurable in `config.ts`, default: `gemini-2.5-flash`)
-   **Role**: To interpret the user's company mission and suggest a list of creative, available-sounding business names.
-   **Trigger**: Called when the user clicks the "Suggest Names" button.
-   **Core Prompt**: `"Based on the following business idea, suggest 5 creative, memorable, and available-sounding business names. The mission is: '[USER_MISSION]'. Output a JSON array of strings."`
-   **Output Configuration**:
    -   `responseMimeType`: `"application/json"`
    -   `responseSchema`: A schema that enforces the output is an object containing a `names` property, which is an array of strings.

---

### Agent 2: The Voice Strategist

This agent defines the brand's personality by creating distinct voice archetypes.

-   **Model**: `VOICE_STRATEGIST` (configurable in `config.ts`, default: `gemini-2.5-flash`)
-   **Role**: To analyze the company's mission and name to generate several brand voice archetypes for the user to choose from.
-   **Trigger**: Called after the user selects a business name.
-   **Core Prompt**: `"Based on the company name '[COMPANY_NAME]' and its mission '[USER_MISSION]', generate 3 distinct brand voice archetypes. For each, provide a name (e.g., 'The Sage'), a one-sentence description, and 3-4 keywords (e.g., 'Wise, Authoritative, Guiding, Trustworthy'). Output this as a structured JSON array."`
-   **Output Configuration**:
    -   `responseMimeType`: `"application/json"`
    -   `responseSchema`: A schema that enforces the output is an object containing a `voices` property, which is an array of voice objects (each with a name, description, and keywords).

---

### Agent 3: The Brand Strategist

This is the primary agent responsible for creating the foundational, text-based brand identity, now informed by the brand's voice.

-   **Model**: `BRAND_STRATEGIST` (configurable in `config.ts`, default: `gemini-2.5-pro`)
-   **Role**: To interpret the user's company mission, name, and chosen brand voice to generate a comprehensive, structured JSON object containing all the textual elements of the brand bible.
-   **Trigger**: Called after the user selects a brand voice (or skips the step).
-   **Core Prompt**: `"You are a world-class branding expert. Based on the following company name, mission, and brand voice, generate a complete brand identity bible. Company Name: '[USER_NAME]'. Mission: '[USER_MISSION]'. Brand Voice: '[VOICE_CONTEXT]'"`
-   **Output Configuration**:
    -   `responseMimeType`: `"application/json"`
    -   `responseSchema`: A detailed schema that enforces the structure of the output, including color palettes, font pairings, and various image prompts.

---

### Agent 4: The Visual Artist

This agent is responsible for turning text prompts into high-quality images.

-   **Model**: `VISUAL_ARTIST` (configurable in `config.ts`, default: `imagen-4.0-generate-001`)
-   **Role**: To generate all visual assets, including the primary logo, secondary marks, and brand mockups.
-   **Trigger**: Called multiple times after the Brand Strategist generates prompts, and whenever a user regenerates a visual asset.
-   **Input**: A detailed text prompt.
-   **Output Configuration**: Generates a single 1:1 aspect ratio image and returns it as a base64-encoded string.

---

### Agent 5: The Creative Director

This agent handles the iterative refinement of visual elements by generating new prompts based on user feedback.

-   **Model**: `CREATIVE_DIRECTOR` (configurable in `config.ts`, default: `gemini-2.5-flash`)
-   **Role**: To quickly regenerate a single image prompt for a logo or mockup based on a user's change request and the existing brand context (including brand voice).
-   **Trigger**: Called when a user submits the "Regenerate" form for a specific visual asset.
-   **Core Prompt**: `"You are a creative director. Based on the following context, regenerate an image prompt for a [ITEM_DESCRIPTION]. The user's specific change request is: '[USER_REQUEST]'. Context: [BRAND_BIBLE_CONTEXT] Output only the new, detailed, and photorealistic image prompt. Do not include any other text or explanation."`
-   **Output Configuration**: Outputs a plain text string (the new prompt).

---

### Agent 6: The Design Specialist

This agent is a specialized version of the Brand Strategist, focused on regenerating structured data like colors and fonts.

-   **Model**: `DESIGN_SPECIALIST` (configurable in `config.ts`, default: `gemini-2.5-pro`)
-   **Role**: To regenerate the `colorPalette` or `fontPairing` based on user feedback and the full brand context, ensuring the output remains in the correct JSON format.
-   **Trigger**: Called when a user requests to regenerate the Color Palette or Typography.
-   **Core Prompt**: `"Based on the brand context, regenerate the [color palette / font pairing]. The user has requested: '[USER_REQUEST]'. Context: [BRAND_BIBLE_CONTEXT]. Output JSON that adheres to the schema."`
-   **Output Configuration**:
    -   `responseMimeType`: `"application/json"`
    -   `responseSchema`: A schema for a root object containing the specific sub-schema needed. For example, when regenerating colors, the schema is for an object `{ "colorPalette": [ ... ] }`.

---

### Agent 7: The Branding Assistant

This agent powers the conversational AI chat feature, providing real-time advice and answering questions.

-   **Model**: `BRANDING_ASSISTANT` (configurable in `config.ts`, default: `gemini-2.5-flash`)
-   **Role**: To act as a friendly and helpful branding expert in a chat interface. It is optimized for low-latency, conversational interactions and can process multimodal inputs (text and images).
-   **Trigger**: Called every time the user sends a message in the AI Chat view.
-   **System Instruction**: `"You are a friendly and helpful assistant specializing in branding, marketing, and design. Provide concise and actionable advice."`
-   **Output Configuration**: The response is streamed token-by-token to create a real-time, dynamic chat experience.