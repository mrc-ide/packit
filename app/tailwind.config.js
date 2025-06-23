/** @type {import('tailwindcss').Config} */
import * as tailwindAnimate from "tailwindcss-animate";

export const darkMode = ["class"];
export const content = ["./src/**/*.{js,jsx,ts,tsx}"];
export const theme = {
  container: {
    center: true,
    padding: "2rem",
    screens: {
      "2xl": "1400px"
    }
  },
  extend: {
    colors: {
      border: "var(--border)",
      input: "var(--input)",
      ring: "var(--ring)",
      background: "var(--background)",
      foreground: "var(--foreground)",
      scrollbar: "var(--scroll-bar)",
      info: "var(--info)",
      primary: {
        DEFAULT: "var(--primary)",
        foreground: "var(--primary-foreground)"
      },
      secondary: {
        DEFAULT: "var(--secondary)",
        foreground: "var(--secondary-foreground)"
      },
      destructive: {
        DEFAULT: "var(--destructive)",
        foreground: "var(--destructive-foreground)"
      },
      muted: {
        DEFAULT: "var(--muted)",
        foreground: "var(--muted-foreground)"
      },
      accent: {
        DEFAULT: "var(--custom-accent, var(--accent))",
        foreground: "var(--custom-accent-foreground, var(--accent-foreground))"
      },
      popover: {
        DEFAULT: "var(--popover)",
        foreground: "var(--popover-foreground)"
      },
      card: {
        DEFAULT: "var(--card)",
        foreground: "var(--card-foreground)"
      }
    },
    borderRadius: {
      lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)"
    },
    fontFamily: {
      sans: ["Graphik", "sans-serif"],
      serif: ["Merriweather", "serif"]
    },
    keyframes: {
      "accordion-down": {
        from: { height: "0" },
        to: { height: "var(--radix-accordion-content-height)" }
      },
      "accordion-up": {
        from: { height: "var(--radix-accordion-content-height)" },
        to: { height: "0" }
      }
    },
    animation: {
      "accordion-down": "accordion-down 0.2s ease-out",
      "accordion-up": "accordion-up 0.2s ease-out"
    }
  }
};
export const plugins = [tailwindAnimate];
