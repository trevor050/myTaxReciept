import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme"
const plugin = require('tailwindcss/plugin');

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
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
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
        sm: 'calc(var(--radius) - 6px)',
        xl: 'calc(var(--radius) + 2px)',
        '2xl': 'calc(var(--radius) + 6px)',
      },
      keyframes: {
        'accordion-down': {
          from: { 
            height: '0', 
            opacity: '0', 
            transform: 'translateY(-8px)' 
          },
          to: { 
            height: 'var(--radix-accordion-content-height)', 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        'accordion-up': {
          from: { 
            height: 'var(--radix-accordion-content-height)', 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
          to: { 
            height: '0', 
            opacity: '0', 
            transform: 'translateY(-8px)' 
          },
        },
        'fadeIn': {
          'from': { opacity: '0', transform: 'translateY(4px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'slideInUp': {
          'from': { transform: 'translateY(20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        'slideOutUp': {
          from: { transform: 'translateY(0)', opacity: '1' },
          to: { transform: 'translateY(-20px)', opacity: '0' },
        },
        'slideInDown': {
          from: { transform: 'translateY(-20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'scaleIn': {
          from: { 
            opacity: '0', 
            transform: 'scale(0.92) translateY(8px)' 
          },
          to: { 
            opacity: '1', 
            transform: 'scale(1) translateY(0)' 
          },
        },
        'scaleOut': {
          from: { 
            opacity: '1', 
            transform: 'scale(1) translateY(0)' 
          },
          to: { 
            opacity: '0', 
            transform: 'scale(0.92) translateY(8px)' 
          },
        },
        'glow': {
          '0%, 100%': { 
            boxShadow: "0 0 8px hsla(var(--primary) / 0.4), 0 0 16px hsla(var(--primary) / 0.2), 0 0 24px hsla(var(--primary) / 0.1)" 
          },
          '50%': { 
            boxShadow: "0 0 16px hsla(var(--primary) / 0.6), 0 0 32px hsla(var(--primary) / 0.4), 0 0 48px hsla(var(--primary) / 0.2)" 
          },
        },
        'glow-dark': {
          '0%, 100%': { 
            boxShadow: "0 0 8px hsla(270 75% 65% / 0.4), 0 0 16px hsla(270 75% 65% / 0.2), 0 0 24px hsla(270 75% 65% / 0.1)" 
          },
          '50%': { 
            boxShadow: "0 0 16px hsla(270 75% 65% / 0.6), 0 0 32px hsla(270 75% 65% / 0.4), 0 0 48px hsla(270 75% 65% / 0.2)" 
          },
        },
        'float': {
          '0%, 100%': { 
            transform: 'translateY(0px) scale(1)' 
          },
          '50%': { 
            transform: 'translateY(-4px) scale(1.02)' 
          },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 hsla(var(--primary) / 0.7)',
          },
          '70%': {
            boxShadow: '0 0 0 10px hsla(var(--primary) / 0)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        'accordion-up': 'accordion-up 0.3s cubic-bezier(0.55, 0, 1, 0.45)',
        'fadeIn': 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slideInUp': 'slideInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slideOutUp': 'slideOutUp 0.3s cubic-bezier(0.55, 0, 1, 0.45) forwards',
        'slideInDown': 'slideInDown 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'scaleIn': 'scaleIn 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'scaleOut': 'scaleOut 0.2s cubic-bezier(0.55, 0, 1, 0.45) forwards',
        'glow': 'glow 3s ease-in-out infinite',
        'glow-dark': 'glow-dark 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px -5px hsla(var(--primary) / 0.5)',
        'glow-lg': '0 0 40px -10px hsla(var(--primary) / 0.4)',
        'inner-glow': 'inset 0 0 20px -5px hsla(var(--primary) / 0.2)',
      },
    }
  },
  plugins: [
      require("tailwindcss-animate"),
      plugin(function({ addUtilities, addComponents }: { addUtilities: any, addComponents: any }) {
          addUtilities({
              '.scrollbar-thin': {
                  'scrollbar-width': 'thin',
                  'scrollbar-color': 'hsl(var(--muted)) transparent',
              },
              '.scrollbar-thin::-webkit-scrollbar': {
                  width: '6px',
                  height: '6px',
              },
              '.scrollbar-thumb-muted': {
                 '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'hsl(var(--muted-foreground) / 0.3)',
                      borderRadius: '8px',
                      border: '1px solid transparent',
                      backgroundClip: 'content-box',
                  },
              },
              '.scrollbar-thumb-muted::-webkit-scrollbar-thumb:hover': {
                       backgroundColor: 'hsl(var(--muted-foreground) / 0.5)',
                       backgroundClip: 'content-box',
              },
               '.scrollbar-track-transparent': {
                   '&::-webkit-scrollbar-track': {
                       backgroundColor: 'transparent',
                   },
               },
               '.glass': {
                   backdropFilter: 'blur(8px) saturate(120%)',
                   backgroundColor: 'hsla(var(--background) / 0.8)',
                   border: '1px solid hsla(var(--border) / 0.2)',
               },
               '.glass-card': {
                   backdropFilter: 'blur(12px) saturate(120%)',
                   backgroundColor: 'hsla(var(--card) / 0.8)',
                   border: '1px solid hsla(var(--border) / 0.3)',
               },
          });
          
          addComponents({
              '.btn-primary': {
                  '@apply bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105': {},
              },
              '.btn-secondary': {
                  '@apply bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md hover:shadow-lg transition-all duration-200': {},
              },
              '.card-modern': {
                  '@apply bg-card border border-border/60 rounded-xl shadow-lg backdrop-blur-sm': {},
              },
              '.text-gradient': {
                  '@apply bg-gradient-to-r from-primary via-chart-4 to-chart-1 bg-clip-text text-transparent': {},
              },
          });
      })
    ],
} satisfies Config;

