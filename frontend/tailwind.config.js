/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        apple: {
          bg: {
            light: '#f5f5f7',
            dark: '#0a0a0c',
          },
          card: {
            light: 'rgba(255, 255, 255, 0.65)',
            dark: 'rgba(20, 20, 25, 0.65)',
          },
          border: {
            light: 'rgba(218, 218, 222, 0.5)',
            dark: 'rgba(255, 255, 255, 0.08)',
          },
          text: {
            primary: {
              light: '#1d1d1f',
              dark: '#f5f5f7',
            },
            secondary: {
              light: '#86868b',
              dark: '#a1a1a6',
            }
          }
        }
      },
      backdropBlur: {
        'apple': '24px',
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
