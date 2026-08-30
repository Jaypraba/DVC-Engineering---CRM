import type { Config } from "tailwindcss";

/**
 * Brand tokens derive from the 100mm wordmark: near-black ink, warm off-white
 * paper, and a single acid green used only as an accent.
 *
 * Rule of thumb enforced by review, not by code: never more than two green
 * elements visible in a viewport. If a screen feels energetic rather than
 * restrained, remove green before adding anything else.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.mdx",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#101010",
          soft: "#1C1C1A",
        },
        paper: {
          DEFAULT: "#F4F3EF",
          dim: "#EDEBE5",
        },
        accent: {
          DEFAULT: "#C4F12E",
          dim: "#AEDA1F",
        },
        grey: {
          100: "#E7E5DE",
          200: "#D8D6CE",
          300: "#B5B4AC",
          400: "#8E8E86",
          500: "#6E6E68",
          600: "#55554F",
          700: "#3A3A37",
          800: "#252523",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Display sizes carry tight tracking by default.
        "display-xl": ["clamp(3.25rem, 9vw, 8.5rem)", { lineHeight: "0.92", letterSpacing: "-0.04em" }],
        "display-lg": ["clamp(2.5rem, 6vw, 5.5rem)", { lineHeight: "0.95", letterSpacing: "-0.035em" }],
        "display-md": ["clamp(2rem, 4vw, 3.5rem)", { lineHeight: "1.0", letterSpacing: "-0.03em" }],
        "display-sm": ["clamp(1.5rem, 2.6vw, 2.25rem)", { lineHeight: "1.08", letterSpacing: "-0.025em" }],
        lede: ["clamp(1.125rem, 1.6vw, 1.5rem)", { lineHeight: "1.45", letterSpacing: "-0.01em" }],
        eyebrow: ["0.75rem", { lineHeight: "1", letterSpacing: "0.14em" }],
      },
      maxWidth: {
        prose: "68ch",
      },
      spacing: {
        gutter: "clamp(1.25rem, 4vw, 4rem)",
        section: "clamp(4.5rem, 11vw, 10rem)",
      },
      transitionTimingFunction: {
        // Slow and unhurried. Nothing on this site should feel springy.
        brand: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
      transitionDuration: {
        brand: "600ms",
      },
    },
  },
  plugins: [],
};

export default config;
