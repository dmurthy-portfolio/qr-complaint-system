/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f4f6fa',
          100: '#e4e9f2',
          200: '#c7d1e3',
          300: '#9dadc9',
          400: '#6c80a3',
          500: '#4c5f84',
          600: '#38496b',
          700: '#2b3a57',
          800: '#1e2c47', // primary ink navy
          900: '#141d33',
        },
        amber: {
          50: '#fdf6ea',
          100: '#faebc9',
          200: '#f4d493',
          300: '#edb95c',
          400: '#e8a33d', // accent
          500: '#d98b23',
          600: '#b56c19',
        },
        paper: '#faf9f6',
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        ticket: '0 1px 2px rgba(20, 29, 51, 0.06), 0 8px 24px rgba(20, 29, 51, 0.08)',
      },
    },
  },
  plugins: [],
};
