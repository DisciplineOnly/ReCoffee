# Architectural Decision Log

This document tracks key architectural decisions, their context, and their status.

## ID-001: Technology Stack Selection
- **Status**: Accepted
- **Date**: 2025-12-27
- **Context**: We need a fast, modern, and widely supported stack for a premium web application.
- **Decision**:
  - **Core Framework**: React (v18+) via Vite.
    - *Rationale*: High performance, fast HMR, vast ecosystem.
  - **Styling**: Tailwind CSS.
    - *Rationale*: Utility-first approach ensures consistency and rapid development.
  - **Icons**: Lucide React.
    - *Rationale*: Clean, consistent, and lightweight icon set.
- **Consequences**:
  - Team must be proficient in utility classes.
  - Build step is required (Vite handles this).

## ID-002: Architectural Pattern & State Management
- **Status**: Accepted
- **Date**: 2025-12-27
- **Context**: The application requires fluid transitions and a responsive UI.
- **Decision**:
  - **Pattern**: Single Page Application (SPA).
  - **Data Flow**: Unidirectional (Parent -> Child).
  - **State Management**:
    - **Local State**: `useState` for component-specific logic.
    - **Global State**: React Context only when strictly necessary (avoid Redux/Recoil for now to minimize complexity).
- **Consequences**:
  - SEO requires careful handling (Meta tags, semantic HTML).
  - Simpler data flow reduces debugging time.

## ID-003: Project Directory Structure
- **Status**: Accepted
- **Date**: 2025-12-27
- **Context**: The initial flat `src/components` structure is unscalable and limits maintainability as the app grows.
- **Decision**: Adopt a standard, scalable React folder structure.
  - `src/components/layout`: Global layout elements (Header, Footer).
  - `src/components/ui`: Atomic reusable UI components (Buttons, Inputs).
  - `src/components/sections`: Large feature blocks used on pages (Hero, Pricing).
  - `src/pages`: Page entry points (Smart components).
  - `src/lib`: Utilities and helpers.
  - `src/assets`: Static resources.
- **Consequences**:
  - Requires immediate refactoring of existing codebase.
  - Clear separation of concerns simplifies onboarding.

## ID-004: Brand Identity & Theming
- **Status**: Accepted
- **Date**: 2025-12-27
- **Context**: The application is being rebranded to "ReCaffe" with a specific color palette and logo.
- **Decision**:
  - **Brand Name**: ReCaffe
  - **Logo Source**: User provided image.
  - **Color Palette**:
    - **Primary**: `#BF2645` (Vibrant Red)
    - **Secondary**: `#017DC7` (Bright Blue)
    - **Accent**: `#9B5440` (Coffee Brown)
  - **Implementation**:
    - Extend Tailwind theme with `brand` colors.
    - Replace "Ceremony" with "ReCaffe".
    - Update styling to utilize new palette.
- **Consequences**:
  - Major visual overhaul required.
  - Existing `orange` and `slate` based designs must be migrated to the new palette.

## ID-005: Internationalization & Localization
- **Status**: Accepted
- **Date**: 2025-12-28
- **Context**: The application needs to support Bulgarian language for the local market while maintaining code maintainability.
- **Decision**:
  - **Approach**: Centralized translation system using JSON-based language files.
  - **Default Language**: Bulgarian (bg)
  - **Fallback Language**: English (en) for development/testing
  - **Implementation**:
    - Create `src/lib/translations/` directory structure
    - Separate translation files per language: `bg.json`, `en.json`
    - Implement a lightweight translation hook/utility
    - Extract all hardcoded strings to translation keys
- **Consequences**:
  - All user-facing text must use translation keys
  - Future language additions will be straightforward
  - Slightly increased initial development time for extraction
  - Better maintainability for content updates

