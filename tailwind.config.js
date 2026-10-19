/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      width: {
        'letter': '8.5in',
      },
      minHeight: {
        'letter': '11in',
      },
      padding: {
        'apa-margin': '1in', // 2.54 cm exactos
      },
      fontFamily: {
        times: ['"Times New Roman"', 'Times', 'serif'],
        arial: ['Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}