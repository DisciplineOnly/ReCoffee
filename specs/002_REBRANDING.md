# Specification: ReCaffe Rebranding

**ID**: SPEC-002
**Created**: 2025-12-27
**Author**: Architect
**Status**: Ready for Implementation

## 1. Objective
Transform the visual identity of the application from "Ceremony Coffee Roasters" to **ReCaffe**. This involves updating the brand name, logo, color palette, and overall aesthetic to match the new vibrant identity.

## 2. Brand Identity Assets

### 2.1 Logo
- **Source**: `C:/Users/Emil/.gemini/antigravity/brain/3332d9d3-789e-466e-8b75-007e4a78af47/uploaded_image_1766846418143.jpg`
- **Target Location**: `src/assets/logo.jpg`
- **Usage**: Use as the main brand mark in the Header and Footer.

### 2.2 Color Palette
Update `tailwind.config.js` with the following brand tokens:

| Token | Hex Code | Description |
| :--- | :--- | :--- |
| `brand-primary` | `#BF2645` | Vibrant Red - Main actions, CTAs, emphasis |
| `brand-secondary` | `#017DC7` | Bright Blue - Large background blocks, secondary emphasis |
| `brand-accent` | `#9B5440` | Coffee Brown - Small elements, borders, subtle text |

## 3. Implementation Steps

### Step 3.1: Global Theme Update
- Modify `tailwind.config.js` to include the new brand colors under `theme.extend.colors`.
- Update `index.css` or global styles to set the default selection color to `brand-primary`.

### Step 3.2: Header Rebranding
- Replace "CEREMONY Coffee Roasters" text with the **ReCaffe** logo image.
- Adjust the header height and padding if necessary to accommodate the new logo.
- Update hover states of navigation links to use `brand-primary`.

### Step 3.3: Hero Section Update
- Transition the Hero section aesthetic.
- Use `brand-secondary` (#017DC7) as a background accent or for the "New Arrival" badge text.
- Update the primary CTA ("Shop Destroyer") to use `brand-primary` (#BF2645) for its underline or background.
- Update text content from "House Espresso Elevated" to "ReCaffe: Redefining Coffee".

### Step 3.4: Section-wise Color Replacement
Audit all sections and perform the following replacements:
- **Buttons/Links**: Replace `orange-800` or `slate-900` accents with `brand-primary`.
- **Badges/Tags**: Use a mix of `brand-secondary` for background and white text.
- **Accents**: Use `brand-accent` for small icons or decorative elements.

### Step 3.5: Footer Update
- Replace "CEREMONY" text with the logo or "ReCaffe" in a bold serif font.
- Update newsletter join button to use `brand-primary`.
- Update link hover states to `brand-primary`.

## 4. Design Guidelines (Architectural Review)
- **Contrast**: Ensure high contrast where Red (#BF2645) and Blue (#017DC7) meet. Use white space or neutral grays (#F0F2F4) as buffers.
- **Tone**: The new brand is more vibrant and energetic than the previous muted one. Ensure typography remains "Premium" but the colors provide "Energy".
- **Naming**: Ensure all instances of "Ceremony" are replaced with "ReCaffe" across the codebase.

## 5. Validation Criteria
-   `tailwind.config.js` contains the three new brand color tokens.
-   The logo image is correctly displayed in the Header.
-   No traces of "Ceremony" remain in the UI text.
-   CTAs and highlights use the new Primary Red color.
