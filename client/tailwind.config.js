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
        ig: {
          black: '#000000',
          darkBg: '#0e0e10',
          darkSurface: '#18181b',
          darkElevated: '#262626',
          darkBorder: '#2f2f35',
          lightBg: '#ffffff',
          lightSurface: '#fafafa',
          lightElevated: '#efefef',
          lightBorder: '#dbdbdb',
          blue: '#0095f6',
          blueHover: '#1877f2',
          purple: '#833ab4',
          pink: '#fd1d1d',
          orange: '#fcb045',
          textDarkPrimary: '#f5f5f5',
          textDarkSecondary: '#a8a8a8',
          textLightPrimary: '#262626',
          textLightSecondary: '#737373',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'pop': 'pop 0.15s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'heart-beat': 'heartBeat 0.8s ease-in-out infinite',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.8)' },
          '70%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        heartBeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' }
        }
      }
    },
  },
  plugins: [],
}
