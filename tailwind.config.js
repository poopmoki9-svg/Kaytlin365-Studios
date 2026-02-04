/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "neon-magenta": "#ff00ff",
        "neon-cyan": "#00ffff",
        "deep-black": "#050505",
      },
      boxShadow: {
        neon: "0 0 20px rgba(255, 0, 255, 0.45)",
        cyan: "0 0 18px rgba(0, 255, 255, 0.45)",
      },
      backdropBlur: {
        glass: "14px",
      },
    },
  },
  plugins: [],
};
