/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class', // or media
  theme: {
    extend: {
      colors: {
        background: "#0B0B0B",
        surface: "#0B0B0B",
        "surface-dim": "#131313",
        "surface-bright": "#3A3939",
        "surface-container-lowest": "#0E0E0E",
        "surface-container-low": "#131313",
        "surface-container": "#181818",
        "surface-container-high": "#2A2A2A",
        "surface-container-highest": "#353534",
        "on-surface": "#FFFFFF",
        "on-surface-variant": "#E5BDBE",
        "inverse-surface": "#E5E2E1",
        "inverse-on-surface": "#313030",
        outline: "#AC8889",
        "outline-variant": "#262626",
        "surface-tint": "#FFB3B6",
        primary: "#E50914",
        "on-primary": "#FFFFFF",
        "primary-container": "#E50914",
        "on-primary-container": "#FFFFFF",
        "inverse-primary": "#BE0037",
        secondary: "#C8C6C5",
        "on-secondary": "#303030",
        "secondary-container": "#474746",
        "on-secondary-container": "#B7B5B4",
        tertiary: "#74D8BD",
        "on-tertiary": "#00382D",
        "tertiary-container": "#00836C",
        "on-tertiary-container": "#EEFFF7",
        error: "#FFB4AB",
        "on-error": "#690005",
        "error-container": "#93000A",
        "on-error-container": "#FFDAD6"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      spacing: {
        unit: "8px",
        "container-padding": "24px",
        gutter: "16px",
        "component-gap": "8px",
        "stack-tight": "4px",
        // New: scale used throughout components (xs → xl)
        xs: "4px",
        sm: "8px",
        base: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        margin: "24px", // page/container side padding (Layout, TopAppBar, Sidebar)
      },
      fontSize: {
        // [fontSize, { lineHeight, letterSpacing }]
        "headline-xl": ["2.25rem", { lineHeight: "2.75rem", letterSpacing: "-0.01em" }], // 36px
        "headline-lg": ["1.75rem", { lineHeight: "2.25rem", letterSpacing: "-0.005em" }], // 28px
        "headline-md": ["1.25rem", { lineHeight: "1.75rem" }], // 20px
        "body-lg": ["1.125rem", { lineHeight: "1.75rem" }], // 18px
        "body-md": ["1rem", { lineHeight: "1.5rem" }], // 16px
        "body-sm": ["0.875rem", { lineHeight: "1.25rem" }], // 14px
        "label-md": ["0.875rem", { lineHeight: "1.25rem" }], // 14px
        "label-sm": ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.02em" }], // 12px
      },
    },
  },
  plugins: [],
}
