import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--border) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        
        vettrack: {
          /* Dark Teal - Headers and key text */
          dark: '#0F2328',
          /* Sage Green / Teal - Main Buttons and highlights */
          accent: '#46A094',
          /* Light Mint - Success states */
          success: '#10B981',
          /* Soft Coral - Errors */
          error: '#F87171',
          /* Warm gray - Borders and subtle backgrounds */
          muted: '#EBF0F0'
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
