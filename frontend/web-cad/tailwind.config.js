/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./public/index.html"],
  theme: {
    extend: {
      boxShadow: {
        "outline-white": "0 0 0 3px #fff",
        "outline-yellow": "0 0 0 2px #fbbf24",
        "outline-blue": "0 0 0 2px #3b82f6",
      },
      rotate: {
        flip: "-180deg",
      },
      backfaceVisibility: ["visible", "hidden"],
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}
