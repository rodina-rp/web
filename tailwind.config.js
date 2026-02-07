/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#0a0a0a',
        'primary-red': '#8b0000',
        'accent-red': '#c53030',
        'light-red': '#fef2f2',
        'dark-bg': '#1a0a0a',
        'gold-accent': '#d97706'
      },
      fontFamily: {
        'sans': ['Inter', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      }
    }
  },
  plugins: []
}