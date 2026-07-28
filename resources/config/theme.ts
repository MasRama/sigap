/**
 * SIGAP design tokens — mirror of resources/config/theme.css.
 * Edit theme.css to change the live color; update this file if a component
 * needs the same value in JS (charts, canvas, etc).
 */

export const theme = {
  name: 'SIGAP',
  colors: {
    background: {
      light: '0 0% 100%',
      dark: '215 28% 10%',
    },
    foreground: {
      light: '215 28% 17%',
      dark: '210 20% 96%',
    },
    card: {
      light: '0 0% 100%',
      dark: '215 28% 12%',
    },
    'card-foreground': {
      light: '215 28% 17%',
      dark: '210 20% 96%',
    },
    popover: {
      light: '0 0% 100%',
      dark: '215 28% 12%',
    },
    'popover-foreground': {
      light: '215 28% 17%',
      dark: '210 20% 96%',
    },
    primary: {
      light: '199 89% 48%',
      dark: '199 89% 55%',
    },
    'primary-foreground': {
      light: '0 0% 100%',
      dark: '215 28% 10%',
    },
    secondary: {
      light: '210 40% 96.1%',
      dark: '215 28% 16%',
    },
    'secondary-foreground': {
      light: '215 28% 17%',
      dark: '210 20% 96%',
    },
    muted: {
      light: '210 40% 96.1%',
      dark: '215 28% 16%',
    },
    'muted-foreground': {
      light: '215 16% 46.9%',
      dark: '215 16% 60%',
    },
    accent: {
      light: '199 89% 48%',
      dark: '199 89% 55%',
    },
    'accent-foreground': {
      light: '0 0% 100%',
      dark: '215 28% 10%',
    },
    destructive: {
      light: '0 72% 51%',
      dark: '0 62% 30%',
    },
    'destructive-foreground': {
      light: '0 0% 100%',
      dark: '0 0% 100%',
    },
    border: {
      light: '214 32% 91%',
      dark: '215 28% 18%',
    },
    input: {
      light: '214 32% 91%',
      dark: '215 28% 18%',
    },
    ring: {
      light: '199 89% 48%',
      dark: '199 89% 55%',
    },
  },
  fonts: {
    sans: "'Plus Jakarta Sans', 'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    heading: "'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif",
    body: "'DM Sans', 'Plus Jakarta Sans', system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  radius: '0.5rem',
  shadow: {
    soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
  },
} as const;

export type Theme = typeof theme;
