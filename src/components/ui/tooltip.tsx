
"use client"

import * as React from "react" // Changed from "import * as React from "react"" to fix syntax
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

// Extend props to include an optional isMobile flag
interface TooltipContentProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  isMobile?: boolean;
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps // Use the extended props type
>(({ className, sideOffset = 6, align = "center", isMobile, ...props }, ref) => ( // Added isMobile to destructuring
  <TooltipPrimitive.Portal>
     <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      align={align} // Added align prop
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-scaleIn data-[state=closed]:animate-scaleOut max-w-sm", // Updated animation, added max-width
        // Removed redundant individual side animations as scaleIn/Out handles it
        isMobile && "pointer-events-auto", // Allow pointer events on mobile for interaction
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
