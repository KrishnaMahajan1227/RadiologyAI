/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      xs: '420px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1800px',
    },
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        serif: ['"Georgia"', 'serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      colors: {
        // Premium clinical palette — mirrors the marketing site (navy + gold + platinum)
        navy: {
          50: '#eef2f9',
          100: '#dbe3f0',
          200: '#b3c4dd',
          300: '#83a0c4',
          400: '#4f74a0',
          500: '#2f4f78',
          600: '#1c3557',
          700: '#152744',
          800: '#0d1c36',
          850: '#0a1730',
          900: '#091428',
          950: '#03070f',
        },
        gold: {
          50: '#fbf7ec',
          100: '#f5ebce',
          200: '#e9d59c',
          300: '#e0c578',
          400: '#d3b45f',
          500: '#c8a84b',
          600: '#a9873a',
          700: '#87692e',
          800: '#6b5325',
          900: '#584420',
        },
        platinum: {
          50: '#f7f9fc',
          100: '#eef2f8',
          200: '#d4dff0',
          300: '#b8c8e2',
          400: '#a8c4e8',
        },
      },
      boxShadow: {
        premium: '0 1px 2px rgba(9,20,40,0.04), 0 8px 24px -8px rgba(9,20,40,0.12), 0 24px 48px -24px rgba(9,20,40,0.18)',
        'premium-lg': '0 2px 4px rgba(9,20,40,0.06), 0 16px 40px -12px rgba(9,20,40,0.22), 0 32px 64px -24px rgba(9,20,40,0.28)',
        'premium-dark': '0 1px 2px rgba(0,0,0,0.2), 0 8px 24px -8px rgba(0,0,0,0.4), 0 24px 48px -24px rgba(0,0,0,0.5)',
        gold: '0 4px 14px -2px rgba(200,168,75,0.35)',
        'inner-gold': 'inset 0 0 0 1px rgba(200,168,75,0.35)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #e0c578 0%, #c8a84b 55%, #a9873a 100%)',
        'navy-gradient': 'linear-gradient(160deg, #152744 0%, #0d1c36 55%, #03070f 100%)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0, transform: 'translateY(6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: 0, transform: 'translateY(-8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.35s ease-out',
        slideDown: 'slideDown 0.25s ease-out',
        shimmer: 'shimmer 2.2s linear infinite',
      },
    },
  },
  plugins: [],
};
