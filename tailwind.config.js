/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#134e8f',
          azure: '#134e8f',
          navy: '#0f233a',
          midnight: '#0f233a',
          coral: '#eb4e52',
          ice: '#e8f2fb',
          frostBorder: '#c0dbf1',
          charcoal: '#0f233a',
          accent: '#134e8f',
          gray: '#f8f9fa',
          steel: '#64748b',
          muted: '#e8f2fb',
          hero: {
            from: '#d9ebfa',
            via: '#e8f2fb',
            to: '#cfe4f6',
            overlay: '#e8f2fb',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
