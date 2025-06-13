"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Always return the same structure to avoid hydration mismatches
  // The key is to suppress hydration warnings for this specific component
  return (
    <div suppressHydrationWarning>
      <Button
        variant="ghost"
        size="icon"
        onClick={mounted ? () => setTheme(theme === "light" ? "dark" : "light") : undefined}
        disabled={!mounted}
        aria-label={mounted && theme ? (theme === "light" ? "Switch to dark mode" : "Switch to light mode") : "Toggle theme"}
      >
        {/* Always render both icons but control visibility with CSS */}
        <Sun 
          className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" 
          suppressHydrationWarning
        />
        <Moon 
          className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" 
          suppressHydrationWarning
        />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  )
}
