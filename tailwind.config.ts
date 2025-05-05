
import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme"

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans], // Use Geist Sans
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)', // Use the CSS variable directly
        md: 'calc(var(--radius) - 4px)', // Adjusted for potentially larger base radius
        sm: 'calc(var(--radius) - 6px)' // Adjusted for potentially larger base radius
      },
       keyframes: {
        'accordion-down': { // Using definition from globals.css
          from: { height: '0', opacity: '0' },
          to: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
        },
        'accordion-up': { // Using definition from globals.css
          from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
          to: { height: '0', opacity: '0' },
        },
        'fadeIn': { // Using definition from globals.css
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
        },
        'slideInUp': { // Using definition from globals.css
            '0%': { transform: 'translateY(12px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.25s ease-out', // Reference animation from globals.css
        'accordion-up': 'accordion-up 0.2s ease-out', // Reference animation from globals.css
        'fadeIn': 'fadeIn 0.4s ease-out forwards', // Reference animation from globals.css
        'slideInUp': 'slideInUp 0.35s cubic-bezier(0.25, 0.8, 0.25, 1) forwards', // Reference animation from globals.css
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

    