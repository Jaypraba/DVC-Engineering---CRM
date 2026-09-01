import type { Config } from "tailwindcss";

/**
 * Tailwind is additive here: this app already ships a complete hand-written
 * stylesheet (styles/globals.css) that the CRM dashboard depends on.
 *
 * Two deliberate choices keep the two systems from fighting:
 *
 * 1. `preflight` is OFF. Preflight resets margins, headings, lists and borders
 *    globally, which would visually break every existing CRM screen. The few
 *    resets Tailwind utilities actually need are re-added in globals.css under
 *    `@layer base`, where the CRM's own unlayered rules still outrank them.
 *
 * 2. Colours resolve from `--ui-*` variables, not the bare shadcn names. The
 *    CRM already defines `--border: #E4E0D8`; shadcn's `--border` is an HSL
 *    triplet, so sharing the name would turn every CRM border into an invalid
 *    value. Class names are unchanged — `border-border`, `bg-background` and
 *    `text-muted-foreground` work exactly as shadcn documents them.
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  corePlugins: { preflight: false },
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        border: "hsl(var(--ui-border))",
        input: "hsl(var(--ui-input))",
        ring: "hsl(var(--ui-ring))",
        background: "hsl(var(--ui-background))",
        foreground: "hsl(var(--ui-foreground))",
        primary: {
          DEFAULT: "hsl(var(--ui-primary))",
          foreground: "hsl(var(--ui-primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--ui-secondary))",
          foreground: "hsl(var(--ui-secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--ui-destructive))",
          foreground: "hsl(var(--ui-destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--ui-muted))",
          foreground: "hsl(var(--ui-muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--ui-accent))",
          foreground: "hsl(var(--ui-accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--ui-popover))",
          foreground: "hsl(var(--ui-popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--ui-card))",
          foreground: "hsl(var(--ui-card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--ui-radius)",
        md: "calc(var(--ui-radius) - 2px)",
        sm: "calc(var(--ui-radius) - 4px)",
      },
      fontFamily: {
        sans: ["Barlow", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Barlow Condensed'", "Barlow", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
