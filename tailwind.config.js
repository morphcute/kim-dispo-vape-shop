/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#FFD700",
          neon: "#39FF14",
          purple: "#7C3AED",
        },
      },
      backgroundImage: {
        "vape-gradient":
          "radial-gradient(60% 100% at 15% 10%, rgba(124,58,237,.35) 0%, rgba(0,0,0,0) 60%), radial-gradient(60% 80% at 85% 20%, rgba(57,255,20,.25) 0%, rgba(0,0,0,0) 60%), radial-gradient(80% 80% at 50% 100%, rgba(255,215,0,.18) 0%, rgba(0,0,0,0) 60%), linear-gradient(180deg, #0B0B0C 0%, #000 100%)",
      },
      boxShadow: {
        neon: "0 0 10px rgba(255,215,0,.45), 0 0 30px rgba(124,58,237,.25)",
      },
    },
  },
  plugins: [],
}
