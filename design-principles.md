# Design Principles & System for Mealwise

This document outlines the core design patterns and principles that guide the visual and interaction design of the Mealwise app. Refer to this as the single source of truth for UI consistency, branding, and implementation.

---

## 1. Typography

- **Primary Font:** `Inter` (variable font, loaded via Google Fonts)
  - Applied globally as `--font-sans` and used via Tailwind's `font-sans` utility.
- **Monospace Font:** `JetBrains Mono` (for code/technical UI)
  - Applied as `--font-mono`.
- **Font Sizes:**
  - Use Tailwind's default scale, with `text-base` for body, `text-lg`/`text-xl` for headings.
  - Headings: `font-semibold` or `font-bold`.
  - Labels: `text-sm font-medium`.
- **Line Height & Tracking:**
  - Headings: `leading-none tracking-tight`.
  - Body: `leading-normal`.

## 2. Color Palette

### Base Palette
- **Zinc-inspired Neutral Palette** (for dark mode and light mode):
  - All colors are defined as CSS variables in `globals.css` and mapped to Tailwind via `tailwind.config.js`.
  - **Light Mode:**
    - `--background`: `hsl(0 0% 100%)` (white)
    - `--foreground`: `hsl(0 0% 3.9%)` (almost black)
    - `--muted`, `--border`, `--input`, `--card`, `--popover`, `--secondary`, `--accent`: various shades of zinc/gray
    - `--primary`: `hsl(0 0% 9%)` (deep zinc/gray)
    - `--destructive`: `hsl(0 84.2% 60.2%)` (red)
  - **Dark Mode:**
    - `--background`: `hsl(0 0% 3.9%)` (zinc-900)
    - `--foreground`: `hsl(0 0% 98%)` (zinc-50)
    - `--muted`, `--border`, `--input`, `--card`, `--popover`, `--secondary`, `--accent`: deeper zinc/gray
    - `--primary`: `hsl(0 0% 98%)` (zinc-50)
    - `--destructive`: `hsl(0 62.8% 30.6%)` (dark red)
- **Brand Accent Colors:**
  - Used for charts, highlights, and accents. See `--chart-1` to `--chart-5` in `globals.css`.

### Usage
- Use Tailwind classes like `bg-background`, `text-foreground`, `border-border`, etc. for all UI elements.
- Never hardcode colors; always use the semantic tokens.
- Dark mode is enabled via the `dark` class on `<html>` (see `ThemeProvider`).

## 3. Border Radius

- **System Radius:**
  - Defined as `--radius: 0.5rem` (8px) in `globals.css`.
  - Tailwind config:
    - `rounded-lg`: `var(--radius)`
    - `rounded-md`: `calc(var(--radius) - 2px)`
    - `rounded-sm`: `calc(var(--radius) - 4px)`
- **Usage:**
  - Use `rounded-md` for most buttons, inputs, and small elements.
  - Use `rounded-lg` or `rounded-xl` for cards, modals, and larger containers.
  - Avatars are always `rounded-full`.

## 4. Spacing & Layout

- **Container:**
  - Centered, with `padding: 2rem` and max width of `1400px` on 2xl screens.
- **Consistent Padding:**
  - Use Tailwind's spacing scale (`p-4`, `p-6`, etc.)
- **Cards/Modals:**
  - Use `shadow`, `border`, and `rounded-xl` or `rounded-lg`.

## 5. Shadows & Depth

- Use Tailwind's `shadow` utilities for elevation.
- Cards, modals, popovers, and tooltips should have a subtle shadow for separation.

## 6. Component Patterns

- **Buttons:**
  - Use `rounded-md`, `font-medium`, and semantic color classes (`bg-primary`, `text-primary-foreground`).
  - States: hover, focus, disabled, destructive, outline, ghost, link.
- **Inputs/Textareas:**
  - Use `rounded-md`, `border-input`, `bg-transparent`, `text-base`, `placeholder:text-muted-foreground`.
- **Cards:**
  - Use `rounded-xl`, `bg-card`, `text-card-foreground`, `shadow`.
- **Badges:**
  - Use `rounded-md`, `text-xs font-semibold`, and semantic color classes.
- **Avatars:**
  - Always `rounded-full`, with fallback background as `bg-muted`.
- **Dialogs/Sheets:**
  - Use `rounded-lg` (or `sm:rounded-lg` for responsive), `bg-background`, `shadow-lg`.
- **Tooltips:**
  - Use `rounded-md`, `bg-primary`, `text-primary-foreground`, `text-xs`.

## 7. Accessibility & Interactions

- **Focus States:**
  - Always use visible focus rings (`focus-visible:ring-2 focus-visible:ring-ring`).
- **Transitions:**
  - Use Tailwind's `transition` utilities for color, shadow, and transform changes.
- **Disabled States:**
  - Use `disabled:opacity-50 disabled:pointer-events-none`.

## 8. Theming & Brand Consistency

- **Dark Mode:**
  - Fully supported via the `dark` class and CSS variables.
  - All components must look great in both light and dark modes.
- **Brand Voice:**
  - Clean, modern, and friendly. Avoid excessive decoration.
  - Use whitespace and clear hierarchy for readability.

## 9. Iconography

- Use Lucide icons (or similar) for a consistent, modern look.
- Icons should inherit text color and align with text baselines.

## 10. Animations

- Use subtle, purposeful animations (e.g., fade, slide, accordion) as defined in Tailwind config and `globals.css`.
- Avoid excessive or distracting motion.

---

## References
- `styles/globals.css` — CSS variables and base styles
- `tailwind.config.js` — Tailwind theme extension
- `lib/fonts.ts` — Font setup
- `components/ui/` — UI component implementations
- `app/layout.tsx` — ThemeProvider and global layout

---

**This document is a living guide. Update as the design system evolves!**
