/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // iPad Pro 11" optimized breakpoints
      screens: {
        'tablet': '768px',
        'tablet-landscape': { 'raw': '(min-width: 1024px) and (orientation: landscape)' },
        'tablet-portrait': { 'raw': '(max-width: 1023px) and (orientation: portrait)' },
      },
      // Touch-friendly sizing
      spacing: {
        '11': '2.75rem', // 44px - minimum touch target
        '18': '4.5rem',  // 72px - comfortable touch target
      },
      // iPad-optimized typography
      fontSize: {
        'base': ['16px', '24px'], // Minimum readable size for iPad
        'lg': ['18px', '28px'],
        'xl': ['20px', '30px'],
        '2xl': ['24px', '36px'],
      },
      // Custom colors for paint store theme with Indonesian context
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          900: '#0f172a',
        },
        // Indonesian currency colors
        rupiah: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        }
      },
      // Touch-friendly animations
      animation: {
        'touch-feedback': 'scale 0.1s ease-in-out',
      },
      keyframes: {
        scale: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}