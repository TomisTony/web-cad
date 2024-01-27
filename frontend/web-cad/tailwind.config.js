/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./public/index.html"],
  theme: {
    extend: {
      boxShadow: {
        "outline-white": "0 0 0 3px #fff",
        "outline-yellow": "0 0 0 2px #fbbf24",
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}
