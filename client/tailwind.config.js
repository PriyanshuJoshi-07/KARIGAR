/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        clay: {
          50: "#F7F1E8",
          100: "#EFE4D4",
          200: "#E2C9A8",
          300: "#D4A574",
          400: "#C4894A",
          500: "#A66B32",
          600: "#8B5424",
          700: "#6E3F1A",
          800: "#4A2A12",
          900: "#2C180A"
        },
        indigo: {
          deep: "#1B3A4B",
          mid: "#2E5A6E"
        },
        madder: "#8B3A2A",
        cream: "#FBF7F0",
        ink: "#1F1710"
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Source Sans 3", "system-ui", "sans-serif"]
      },
      boxShadow: {
        card: "0 8px 24px rgba(44, 24, 10, 0.08)",
        lift: "0 12px 32px rgba(44, 24, 10, 0.12)"
      }
    }
  },
  plugins: []
};
