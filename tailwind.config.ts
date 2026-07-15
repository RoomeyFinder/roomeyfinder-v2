import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import animatePlugin from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "40em",
      md: "62em",
      lg: "74em",
      xl: "100em",
      "2xl": "120em",
    },
    extend: {
      colors: {
        brand: {
          DEFAULT: "hsl(var(--brand-main))",
          main: "hsl(var(--brand-main))",
          500: "hsl(var(--brand-main))",
          10: "hsl(var(--brand-main) / 0.1)",
          25: "hsl(var(--brand-main) / 0.25)",
          50: "hsl(var(--brand-main) / 0.5)",
          100: "hsl(var(--brand-secondary))",
        },
        roomey: {
          white: {
            main: "#FFFFFF",
            100: "#F1F1F1",
            200: "#F4F4F4",
            300: "#F8F8F8",
            400: "#F9F9F9",
            500: "#EEEEEE",
            600: "#E5E5E5",
          },
          green: {
            main: "#009A49",
            50: "#49C3A733",
            100: "#49C3A7",
          },
          red: {
            main: "#FE251B",
            50: "#FF00004D",
          },
          gray: {
            main: "#707070",
            100: "#A1A1A1",
            200: "#D9D9D9",
            300: "#5C5F62",
          },
          black: {
            500: "#222222",
          },
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "brand-sm": "1rem",
        "brand-md": "1.2rem",
      },
      fontFamily: {
        sans: ["var(--font-proxima-nova)", ...defaultTheme.fontFamily.sans],
        brand: ["var(--font-proxima-nova)", ...defaultTheme.fontFamily.sans],
      },
      animation: {
        "brand-pulse": "brand-pulse 1500ms ease-in-out infinite",
      },
      keyframes: {
        "brand-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [animatePlugin],
} satisfies Config;
