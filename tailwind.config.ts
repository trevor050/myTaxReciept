
import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme"
const plugin = require('tailwindcss/plugin'); // Import plugin

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
          '1': 'hsl(var(--chart-1))', '2': 'hsl(var(--chart-2))', '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))', '5': 'hsl(var(--chart-5))', '6': 'hsl(var(--chart-6))',
          '7': 'hsl(var(--chart-7))', '8': 'hsl(var(--chart-8))', '9': 'hsl(var(--chart-9))',
          '10': 'hsl(var(--chart-10))', '11': 'hsl(var(--chart-11))', '12': 'hsl(var(--chart-12))',
          '13': 'hsl(var(--chart-13))', '14': 'hsl(var(--chart-14))', '15': 'hsl(var(--chart-15))',
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
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 6px)'
      },
       keyframes: {
        'accordion-down': {
          from: { height: '0', opacity: '0', transform: 'translateY(-5px)' },
          to: { height: 'var(--radix-accordion-content-height)', opacity: '1', transform: 'translateY(0)' },
        },
        'accordion-up': {
           from: { height: 'var(--radix-accordion-content-height)', opacity: '1', transform: 'translateY(0)' },
           to: { height: '0', opacity: '0', transform: 'translateY(-5px)' },
        },
        'fadeIn': {
            'from': { opacity: '0' },
            'to': { opacity: '1' },
        },
        'slideInUp': {
            'from': { transform: 'translateY(15px)', opacity: '0' },
            'to': { transform: 'translateY(0)', opacity: '1' },
        },
        'slideOutUp': { // Added
             from: { transform: 'translateY(0)', opacity: '1' },
             to: { transform: 'translateY(-15px)', opacity: '0' },
        },
        'slideInDown': { // Added
            from: { transform: 'translateY(-15px)', opacity: '0' },
            to: { transform: 'translateY(0)', opacity: '1' },
        },
        'scaleIn': { // Added
             from: { opacity: '0', transform: 'scale(0.95)' },
             to: { opacity: '1', transform: 'scale(1)' },
        },
        'scaleOut': { // Added
            from: { opacity: '1', transform: 'scale(1)' },
            to: { opacity: '0', transform: 'scale(0.95)' },
        },
        'glow': { // Use hsla with CSS variables for opacity
            '0%, 100%': { boxShadow: "0 0 5px hsla(var(--primary) / 0.5), 0 0 10px hsla(var(--primary) / 0.3)" },
            '50%': { boxShadow: "0 0 15px hsla(var(--primary) / 0.6), 0 0 25px hsla(var(--primary) / 0.4)" },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.3s ease-out',
        'accordion-up': 'accordion-up 0.25s ease-out',
        'fadeIn': 'fadeIn 0.5s ease-out forwards',
        'slideInUp': 'slideInUp 0.45s cubic-bezier(0.25, 0.8, 0.25, 1) forwards',
        'slideOutUp': 'slideOutUp 0.3s ease-in forwards', // Added
        'slideInDown': 'slideInDown 0.45s cubic-bezier(0.25, 0.8, 0.25, 1) forwards', // Added
        'scaleIn': 'scaleIn 0.2s ease-out forwards', // Added
        'scaleOut': 'scaleOut 0.15s ease-in forwards', // Added
        'glow': 'glow 2.5s ease-in-out infinite', // Added
      }
    }
  },
  plugins: [
      require("tailwindcss-animate"),
      // Add custom scrollbar utilities
      plugin(function({ addUtilities }: { addUtilities: any }) {
          addUtilities({
              '.scrollbar-thin': {
                  'scrollbar-width': 'thin',
                  '&::-webkit-scrollbar': {
                      width: '8px',
                      height: '8px',
                  },
              },
              '.scrollbar-thumb-muted': {
                 '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'hsl(var(--muted))',
                      borderRadius: '10px',
                      border: '2px solid hsl(var(--background))', // Match background
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                       backgroundColor: 'hsl(var(--muted-foreground))',
                  },
              },
               '.scrollbar-track-transparent': {
                   '&::-webkit-scrollbar-track': {
                       backgroundColor: 'transparent',
                   },
               },
          })
      })
    ],
} satisfies Config;
