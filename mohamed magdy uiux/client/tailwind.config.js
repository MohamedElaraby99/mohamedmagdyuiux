/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Cairo', 'sans-serif'],
        'cairo': ['Cairo', 'sans-serif'],
        'lemonada': ['Cairo', 'sans-serif'],
        'inter': ['Cairo', 'sans-serif'],
        'lato': ['Cairo', 'sans-serif'],
        'nunito-sans': ['Cairo', 'sans-serif'],
        'open-sans': ['Cairo', 'sans-serif'],
        'roboto': ['Cairo', 'sans-serif'],
      },
      colors: {
        'input-bg': '#ffffff',
        'input-text': '#000000',
        'input-border': '#d1d5db',
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
          darker: 'var(--color-primary-darker)',
        },
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
      },
      fontWeight: {
        'lemonada-light': '300',
        'lemonada-regular': '400',
        'lemonada-medium': '500',
        'lemonada-semibold': '600',
        'lemonada-bold': '700',
      }
    },
  },
  darkMode: 'class',
  plugins: [require('daisyui')],
}