/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00b067',
          hover: '#00b067de',
          light: 'rgba(47, 202, 114, 0.1)',
        },
        bg: {
          main: '#F9F9F9',
          section: '#F3F3F3',
          card: '#FFFFFF',
          overlay: 'rgba(0, 0, 0, 0.5)',
        },
        text: {
          primary: '#1A1C1C',
          secondary: '#605E5D',
          accent: '#00B067',
        },
        border: {
          DEFAULT: '#E2E2E2',
          light: '#EFEFEF',
        },
        grey: {
          DEFAULT: '#F3F3F3',
          secondary: '#EFEFEF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        xs: '0.25rem' /* 4px */,
        sm: '0.5rem' /* 8px */,
        md: '0.75rem' /* 12px */,
        base: '1rem' /* 16px */,
        lg: '1.5rem' /* 24px */,
        xl: '2rem' /* 32px */,
        '2xl': '3rem' /* 48px */,
        '3xl': '4rem' /* 64px */,
      },
      borderRadius: {
        'radius-sm': '8px',
        'radius-md': '12px',
        'radius-lg': '16px',
        'radius-xl': '24px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.08)',
        modal: '0 8px 32px rgba(0, 0, 0, 0.12)',
        header: '0 1px 4px rgba(0, 0, 0, 0.06)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '350ms',
      },
    },
  },
  plugins: [],
};
