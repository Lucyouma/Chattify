/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Include all JavaScript/TypeScript files in the src folder
    './public/index.html', // Include the HTML entry point
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007bff', // Custom primary color
        secondary: '#6c757d', // Custom secondary color
        accent: '#ff5722', // Custom accent color
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'], // Custom font family
      },
      spacing: {
        18: '4.5rem', // Custom spacing
      },
      borderRadius: {
        xl: '1rem', // Custom border radius
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Plugin for better form styling
    require('@tailwindcss/typography'), // Plugin for better typography styling
  ],
};
