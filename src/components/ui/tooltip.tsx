
"use client"

import * as React from "react" // Changed from "import * as React from "react"" to fix syntax
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, align = "center", ...props }, ref) => ( // Increased sideOffset, default align
  <TooltipPrimitive.Portal>
     <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      align={align} // Added align prop
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-scaleIn data-[state=closed]:animate-scaleOut max-w-sm", // Updated animation, added max-width
        // Removed redundant individual side animations as scaleIn/Out handles it
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

