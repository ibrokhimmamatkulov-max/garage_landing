/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /**
         * Цвета берутся из CSS-переменных каналами RGB, а не хексами.
         * Благодаря <alpha-value> работают и bg-brand, и bg-brand/25.
         * Смена палитры = подмена переменных в :root, без пересборки конфига.
         *
         * Роли: brand.DEFAULT — заливки, индикаторы, знак в логотипе.
         * brand.ink — рабочий цвет кнопок, ссылок и акцентного текста.
         * Конкретные значения и их контрасты живут в global.css.
         */
        brand: {
          DEFAULT: 'rgb(var(--brand-rgb) / <alpha-value>)',
          ink: 'rgb(var(--brand-ink-rgb) / <alpha-value>)',
          deep: 'rgb(var(--brand-deep-rgb) / <alpha-value>)',
          tint: 'rgb(var(--brand-tint-rgb) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--ink-rgb) / <alpha-value>)',
          muted: 'rgb(var(--ink-muted-rgb) / <alpha-value>)',
          soft: 'rgb(var(--ink-soft-rgb) / <alpha-value>)',
          ghost: 'rgb(var(--ink-ghost-rgb) / <alpha-value>)',
        },
        surface: {
          canvas: 'rgb(var(--canvas-rgb) / <alpha-value>)',
          paper: 'rgb(var(--paper-rgb) / <alpha-value>)',
          sunken: 'rgb(var(--sunken-rgb) / <alpha-value>)',
          raised: 'rgb(var(--paper-rgb) / <alpha-value>)',
          inverse: 'rgb(var(--ink-rgb) / <alpha-value>)',
        },
        hairline: {
          DEFAULT: 'rgb(var(--hairline-rgb) / <alpha-value>)',
          soft: 'rgb(var(--hairline-soft-rgb) / <alpha-value>)',
          strong: 'rgb(var(--hairline-strong-rgb) / <alpha-value>)',
        },
        state: {
          warning: '#A05F00',
          'warning-tint': '#FBF2E4',
          error: '#C4322B',
          'error-tint': '#FBECEA',
          info: '#2C5AA0',
          'info-tint': '#ECF1FA',
        },

        /* --- легаси-алиасы: старые классы в неперенесённых экранах не падают --- */
        primary: {
          DEFAULT: 'rgb(var(--brand-ink-rgb) / <alpha-value>)',
          hover: 'rgb(var(--brand-deep-rgb) / <alpha-value>)',
          light: 'rgb(var(--brand-tint-rgb) / <alpha-value>)',
        },
        bg: {
          main: 'rgb(var(--canvas-rgb) / <alpha-value>)',
          section: 'rgb(var(--sunken-rgb) / <alpha-value>)',
          card: 'rgb(var(--paper-rgb) / <alpha-value>)',
          overlay: 'rgb(var(--ink-rgb) / 0.56)',
        },
        text: {
          primary: 'rgb(var(--ink-rgb) / <alpha-value>)',
          secondary: 'rgb(var(--ink-muted-rgb) / <alpha-value>)',
          accent: 'rgb(var(--brand-ink-rgb) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--hairline-rgb) / <alpha-value>)',
          light: 'rgb(var(--hairline-soft-rgb) / <alpha-value>)',
        },
        grey: {
          DEFAULT: 'rgb(var(--sunken-rgb) / <alpha-value>)',
          secondary: 'rgb(var(--hairline-soft-rgb) / <alpha-value>)',
        },
      },

      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },

      fontSize: {
        /* Шкала с прошитой высотой строки и трекингом — крупное всегда плотнее */
        caption: ['0.8125rem', { lineHeight: '1.15rem' }],
        small: ['0.875rem', { lineHeight: '1.25rem' }],
        body: ['0.9375rem', { lineHeight: '1.4rem' }],
        'body-lg': ['1rem', { lineHeight: '1.5rem' }],
        'title-sm': ['1.0625rem', { lineHeight: '1.35rem', letterSpacing: '-0.011em' }],
        title: ['1.25rem', { lineHeight: '1.55rem', letterSpacing: '-0.016em' }],
        price: ['1.4375rem', { lineHeight: '1.6rem', letterSpacing: '-0.022em' }],
        'display-sm': ['1.75rem', { lineHeight: '1.95rem', letterSpacing: '-0.028em' }],
        display: ['2.25rem', { lineHeight: '2.4rem', letterSpacing: '-0.032em' }],
        'display-lg': ['3.25rem', { lineHeight: '3.35rem', letterSpacing: '-0.036em' }],
      },

      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '0.75rem',
        base: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
      },

      borderRadius: {
        'radius-sm': '8px',
        'radius-md': '12px',
        'radius-lg': '16px',
        'radius-xl': '20px',
        'radius-2xl': '28px',
      },

      boxShadow: {
        /* Покой — только волосяная граница. Тень появляется как отклик на действие. */
        hairline: '0 0 0 1px rgba(16, 16, 15, 0.06)',
        lift: '0 12px 28px -12px rgba(16, 16, 15, 0.22), 0 2px 6px -2px rgba(16, 16, 15, 0.08)',
        pop: '0 20px 48px -16px rgba(16, 16, 15, 0.26)',
        header: '0 1px 0 0 rgba(16, 16, 15, 0.06)',
        card: '0 12px 28px -12px rgba(16, 16, 15, 0.22)',
        modal: '0 32px 64px -24px rgba(16, 16, 15, 0.34)',
        'focus-brand': '0 0 0 3px rgb(var(--brand-rgb) / 0.2)',
      },

      transitionDuration: {
        fast: '140ms',
        base: '220ms',
        slow: '360ms',
      },

      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
        inout: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },

      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      animation: {
        shimmer: 'shimmer 1.5s infinite',
        'rise-in': 'rise-in 0.42s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
