/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7C3AED',
          dark: '#6D28D9',
          light: '#A78BFA',
        },
        secondary: {
          DEFAULT: '#3B82F6',
          dark: '#2563EB',
        },
        accent: '#F59E0B',
        success: '#22C55E',
        error: '#EF4444',
        streak: '#FF9600',
        surface: '#F8FAFC',
        muted: '#64748B',
        border: '#E2E8F0',
      },
    },
  },
  plugins: [],
};
