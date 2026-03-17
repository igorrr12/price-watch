/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#e83e8c",
          dark: "#d12e78"
        },
        cream: "#fefaf0",
        charcoal: "#1a1a1a"
      },
      boxShadow: {
        retro: "3px 3px 0px 0px rgba(26,26,26,1)",
        "retro-sm": "2px 2px 0px 0px rgba(26,26,26,1)",
      }
    }
  },
  plugins: []
};
