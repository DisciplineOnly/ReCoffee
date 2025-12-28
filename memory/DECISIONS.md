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

## ID-006: E-Commerce Architecture & State Management
- **Status**: Accepted
- **Date**: 2025-12-28
- **Context**: The application requires full e-commerce functionality including product catalog, shopping cart, and checkout flow.
- **Decision**:
  - **State Management**: React Context API for cart and checkout state
    - *Rationale*: Lightweight, built-in solution sufficient for our needs without external dependencies
  - **Cart Persistence**: LocalStorage for cart state persistence
    - *Rationale*: Maintains cart across sessions without backend complexity
  - **Routing**: React Router v6 for multi-page navigation
    - *Rationale*: Industry standard, excellent documentation, type-safe
  - **Payment Integration**: Placeholder UI for payment selection (Stripe/PayPal integration deferred)
    - *Rationale*: Focus on UX flow first, actual payment processing requires backend
  - **Product Data**: Static JSON initially, designed for easy backend migration
    - *Rationale*: Rapid prototyping, clear data structure for future API integration
- **Consequences**:
  - Need to implement CartContext and CheckoutContext
  - Cart state will be client-side only (no backend sync initially)
  - Payment processing will be simulated until backend integration
  - Easy migration path to full backend when needed


## ID-007: Database Architecture
- **Status**: Accepted
- **Date**: 2025-12-28
- **Context**: The application needs to move from client-side JSON/LocalStorage to a robust, scalable backend database to handle dynamic product inventory and order tracking.
- **Decision**:
  - **Database Engine**: PostgreSQL 16+.
    - *Rationale*: ACID compliance for financial transactions, JSONB support for flexible address schemas, robust Row Level Security (RLS).
  - **Schema Design**: Relational model with normalized Core Entities (Products, Orders) and specific Junction Tables (Product_Flavors). **No User entity** as the store operates on a strict Guest Checkout model.
  - **Data Privacy**: RLS policies will enforce strict access control (Public Insert / Admin Read).
  - **Host**: Supabase (recommended) for managed Postgres + API generation.
- **Consequences**:
  - Requires migration strategy for existing client-side code to fetch data from API.
  - Development environment needs Postgres.
  - No user registration/login flow simplifies the architecture significantly.
