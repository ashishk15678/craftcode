/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Premium dark theme palette
        // background: 'hsl(222, 47%, 5%)',
        // foreground: 'hsl(210, 40%, 98%)',
        // card: 'hsl(222, 47%, 8%)',
        // 'card-foreground': 'hsl(210, 40%, 98%)',
        // primary: 'hsl(262, 83%, 58%)',
        // 'primary-foreground': 'hsl(210, 40%, 98%)',
        // secondary: 'hsl(217, 33%, 12%)',
        // 'secondary-foreground': 'hsl(210, 40%, 98%)',
        // muted: 'hsl(217, 33%, 15%)',
        // 'muted-foreground': 'hsl(215, 20%, 65%)',
        // accent: 'hsl(262, 83%, 58%)',
        // 'accent-foreground': 'hsl(210, 40%, 98%)',
        // destructive: 'hsl(0, 62%, 50%)',
        // border: 'hsl(217, 33%, 18%)',
        // input: 'hsl(217, 33%, 18%)',
        // ring: 'hsl(262, 83%, 58%)',
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        beam: "beam 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        "grid-fade": "grid-fade 8s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        beam: {
          "0%, 100%": { "stroke-dashoffset": "1000" },
          "50%": { "stroke-dashoffset": "0" },
        },
        glow: {
          "0%": { opacity: "0.4" },
          "100%": { opacity: "1" },
        },
        "grid-fade": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.7" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(139, 92, 246, 0.3)",
        "glow-lg": "0 0 40px rgba(139, 92, 246, 0.4)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
