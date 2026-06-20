// PostCSS configuration — processes CSS during the Next.js build pipeline
export default {
  // Plugins are applied in order; each transforms the CSS before the next runs
  plugins: {
    // Tailwind CSS v4 official PostCSS plugin — scans your source for class usage,
    // processes the @import "tailwindcss" directive, and generates the final utility CSS
    "@tailwindcss/postcss": {},
  },
};
