/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        tesla: ['Inter', 'sans-serif'],
      },
      colors: {
        blue: {
          600: '#4169E1', // Royal Blue
        },
        slate: {
          900: '#1a1a1a', // Dark for text
        }
      }
    },
  },
  plugins: [],
}
