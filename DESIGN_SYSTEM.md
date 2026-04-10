# ActiveRecall Design System

A premium, high-contrast, Swiss-inspired design system optimized for clarity and speed. This system was designed to create a "Gold Standard" user experience for personal productivity and learning tools.

## Design Principles

1.  **Extreme Contrast**: Use pure black (`zinc-950`) and white (`zinc-50`) as primary surfaces.
2.  **Typography as UI**: High weights (`font-black`) and tight tracking (`tracking-tighter`) for headings. Small, spaced-out uppercase text for metadata/labels.
3.  **Modern Materiality**: Subtle borders (`zinc-200/800`) and soft shadows for depth, instead of heavy backgrounds.
4.  **Motion-First**: Every interaction should feel responsive and "alive" using `motion/react` spring animations.

## Core Tokens

### Colors (Tailwind 4)
Defined in `src/index.css`:
- `--color-brand-primary`: `zinc-950`
- `--color-brand-secondary`: `zinc-100`
- `--color-brand-accent`: `zinc-400`

### Typography
- **Headings**: `font-black`, `tracking-tighter`, `text-900`.
- **Labels**: `text-[10px]`, `font-black`, `uppercase`, `tracking-[0.2em]`, `text-400`.

---

## Key Components

### 1. The "Premium" Button
Located at `src/presentation/components/ui/Button.tsx`.
Features:
- **Primary**: Solid dark/light inverse.
- **Secondary**: Subtle border, soft hover.
- **Micro-animation**: `active:scale-[0.98]` for tactile feedback.

### 2. The Glass Modal
Located at `src/presentation/components/ui/Modal.tsx`.
Features:
- Backdrop blur.
- Slide-up animation on mobile, scale-in on desktop.

### 3. Methodology Tip
Located at `src/presentation/components/ui/MethodologyTip.tsx`.
A specialized container for educational or secondary content using a subtle gray background and premium typography.

---

## How to use in other projects

1.  **Copy `src/index.css`**: It contains the Tailwind 4 theme definitions and base styles.
2.  **Copy the `src/presentation/components/ui` folder**: These are your building blocks.
3.  **Install Dependencies**:
    ```bash
    npm install lucide-react motion clsx tailwind-merge
    ```
4.  **Reference the Showcase**: Visit `/design` in this app to see all components in action and copy their implementation patterns.

---

## Living Documentation
You can access the live showcase of this design system at the `/design` route of this project. Use it to verify states, animations, and responsiveness.
