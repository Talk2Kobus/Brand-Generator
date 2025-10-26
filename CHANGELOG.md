# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Multimodal Chat**: Users can now attach an image to their messages in the AI Chat, allowing for visual questions and feedback. The chat history displays the sent image.

### Changed
- **Major Refactoring**: Overhauled the frontend architecture for improved maintainability and scalability.
    - The large `BrandGenerator.tsx` component was broken down into smaller, focused "stage" components (e.g., `MissionStage`, `NameSuggestionStage`).
    - Introduced a reusable UI component library in `/components/ui` (e.g., `Button`, `Card`, `Input`) to standardize styling and behavior.
    - Separated styling concerns from component logic, making the application easier to theme and update.