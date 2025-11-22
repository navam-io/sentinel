/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // Primary Palette - Sentinel Signal
        'sentinel-primary': '#6EE3F6',
        'sentinel-primary-dark': '#3CBACD',

        // Secondary Palette - AI Reliability
        'sentinel-secondary': '#9B8CFF',
        'sentinel-secondary-dark': '#6C5AE0',

        // Neutral Palette - Infra-grade (spec-03.md)
        'sentinel-bg': '#0C0F12',
        'sentinel-bg-elevated': '#14181D',
        'sentinel-surface': '#1C2026',
        'sentinel-border': '#2C323A',
        'sentinel-text': '#E2E5E9',
        'sentinel-text-dim': '#A0A4A9',
        'sentinel-text-muted': '#A0A4A9',  // Alias for text-dim

        // Semantic - Test Results (spec-03.md)
        'sentinel-success': '#4ADE80',
        'sentinel-danger': '#F87171',
        'sentinel-error': '#F87171',   // Alias for danger
        'sentinel-warning': '#FBBF24',
        'sentinel-info': '#38BDF8',

        // State Colors
        'sentinel-hover': 'rgba(110, 227, 246, 0.1)',
        'sentinel-active': 'rgba(110, 227, 246, 0.2)',
        'sentinel-glow': 'rgba(110, 227, 246, 0.35)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        'xs': '0.75rem',    // 12px
        'sm': '0.875rem',   // 14px
        'base': '1rem',     // 16px
        'lg': '1.125rem',   // 18px
        'xl': '1.25rem',    // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '1.875rem',  // 30px
        '4xl': '2.25rem',   // 36px
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        'sentinel': '0.375rem',
        'sentinel-lg': '0.5rem',
      },
      boxShadow: {
        'sentinel': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'sentinel-glow': '0 0 20px rgba(110, 227, 246, 0.35)',
        'sentinel-glow-lg': '0 0 40px rgba(110, 227, 246, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      transitionDuration: {
        '120': '120ms',
        '160': '160ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
