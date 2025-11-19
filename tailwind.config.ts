import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "background-shine": {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        "border-width": {
          from: { width: "10px", opacity: "0" },
          to: { width: "100px", opacity: "1" },
        },
        "text-gradient": {
          to: { backgroundPosition: "200% center" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "shimmer-wave": {
          "0%": {
            transform:
              "translateZ(calc(var(--z-distance) * -50px)) scale(var(--scale-distance)) rotateY(calc(var(--rotate-y-distance) * -1))",
            filter: "brightness(0.5) contrast(0.5)",
            opacity: "0",
          },
          "50%": {
            transform: "translateZ(0) scale(1) rotateY(0deg)",
            filter: "brightness(1) contrast(1)",
            opacity: "1",
          },
          "100%": {
            transform:
              "translateZ(calc(var(--z-distance) * -50px)) scale(var(--scale-distance)) rotateY(var(--rotate-y-distance))",
            filter: "brightness(0.5) contrast(0.5)",
            opacity: "0",
          },
        },
        "slide-up-fade": {
          "0%": {
            opacity: "0",
            transform: "translateY(var(--offset, 10px))",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "background-shine": "background-shine 2s linear infinite",
        "border-width": "border-width 3s infinite alternate",
        "text-gradient": "text-gradient 1.5s linear infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "shimmer-wave": "shimmer-wave calc(var(--duration) * 2) ease-in-out calc(var(--delay) * -1) infinite",
        "slide-up-fade": "slide-up-fade 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.2s ease-in-out forwards",
        "fade-in-out": "fadeInOut 3s ease-in-out infinite",
      },
    },

  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
