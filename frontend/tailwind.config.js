/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#1D4ED8', dark: '#1E3A8A', light: '#3B82F6', lighter: '#EFF6FF' },
        accent:    { DEFAULT: '#F59E0B', dark: '#D97706', light: '#FCD34D' },
        sidebar:   '#1E3A8A',
        success:   '#10B981',
        warning:   '#F59E0B',
        danger:    '#EF4444',
        info:      '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', '0.875rem'],
      },
    },
  },
  plugins: [],
};
