/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
        },
        secondary: {
          500: '#10b981',
          600: '#059669',
        },
        rail: {
          ink: '#0f172a',
          muted: '#64748b',
          line: '#dbeafe',
          card: '#ffffff',
          soft: '#f8fafc',
        },
      },
      boxShadow: {
        premium: '0 24px 80px -36px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
};

