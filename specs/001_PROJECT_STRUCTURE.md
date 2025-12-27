# Specification: Project Structure Refactoring

**ID**: SPEC-001
**Created**: 2025-12-27
**Author**: Architect
**Status**: Ready for Implementation

## 1. Objective
Refactor the current flat directory structure to a scalable, domain-organized hierarchy. This prepares the application for multi-page additions and complex feature development without clutter.

## 2. Target Structure
The `src` directory must be reorganized as follows. Ensure all import paths are updated to match the new locations.

```text
src/
├── assets/             # Static assets (images, fonts)
├── components/
│   ├── layout/         # Layout specific components
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   ├── sections/       # Page-specific sections (Large components)
│   │   ├── Hero.jsx
│   │   ├── Marquee.jsx
│   │   ├── ShopFavorites.jsx
│   │   ├── Philosophy.jsx
│   │   ├── Subscription.jsx
│   │   └── VisitUs.jsx
│   └── ui/             # Reusable atoms (Buttons, Inputs) - Empty for now
├── pages/
│   └── Home.jsx        # Main landing page composition
├── lib/                # Utilities and constants
│   └── utils.js        # (Optional) Utils placeholder
├── App.jsx             # Root Router/Layout wrapper
└── main.jsx            # Entry point
```

## 3. Implementation Steps

### Step 3.1: Directory Creation
Create the following directories:
- `src/components/layout`
- `src/components/sections`
- `src/components/ui`
- `src/pages`
- `src/lib`

### Step 3.2: Component Migration
Move existing files to their new destinations:
1.  **Layout Components**:
    - `src/components/Header.jsx` -> `src/components/layout/Header.jsx`
    - `src/components/Footer.jsx` -> `src/components/layout/Footer.jsx`
2.  **Section Components**:
    - `src/components/Hero.jsx` -> `src/components/sections/Hero.jsx`
    - `src/components/Marquee.jsx` -> `src/components/sections/Marquee.jsx`
    - `src/components/ShopFavorites.jsx` -> `src/components/sections/ShopFavorites.jsx`
    - `src/components/Philosophy.jsx` -> `src/components/sections/Philosophy.jsx`
    - `src/components/Subscription.jsx` -> `src/components/sections/Subscription.jsx`
    - `src/components/VisitUs.jsx` -> `src/components/sections/VisitUs.jsx`

### Step 3.3: Page Creation
Create `src/pages/Home.jsx`.
-   **Content**: Extract the layout composition (Hero, Marquee, ShopFavorites, etc.) from `App.jsx` and place it here.
-   **Structure**: `Home` should ideally render a Fragment containing the ordered sections.

### Step 3.4: App.jsx Update
Refactor `App.jsx` to:
1.  Import `Header` and `Footer` from `layout`.
2.  Import `Home` from `pages`.
3.  Render structure:
    ```jsx
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Home />
      </main>
      <Footer />
    </div>
    ```

## 4. Validation Criteria
-   All files reside in their designated new paths.
-   `npm run dev` starts without any import errors.
-   The application visual appearance remains identical to the pre-refactor state.
