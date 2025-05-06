
'use client';

import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SelectedItem } from '@/services/tax-spending'; // Import SelectedItem type
import { generateRepresentativeEmail } from '@/services/tax-spending'; // Import email generation function
import { mapSliderToFundingLevel } from '@/lib/funding-utils'; // Import mapping functions
import { X, Mail, Send, GripVertical } from 'lucide-react'; // Added GripVertical
import { cn } from '@/lib/utils';

interface EmailCustomizationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedItems: Map<string, SelectedItem>; // Receive the map of selected items
  balanceBudgetChecked: boolean;
  taxAmount: number; // Pass tax amount for context if needed

  // Lifted state and setters from parent
  aggressiveness: number;
  setAggressiveness: (value: number) => void;
  itemFundingLevels: Map<string, number>;
  setItemFundingLevels: (value: Map<string, number>) => void;
  userName: string;
  setUserName: (value: string) => void;
  userLocation: string;
  setUserLocation: (value: string) => void;
}

// Define funding levels and their labels/colors
const fundingLevels = [
    { value: -2, label: 'Slash Heavily', color: 'bg-red-600', darkColor: 'dark:bg-red-500' },
    { value: -1, label: 'Cut Significantly', color: 'bg-orange-500', darkColor: 'dark:bg-orange-400' },
    { value: 0, label: 'Improve Efficiency', color: 'bg-yellow-500', darkColor: 'dark:bg-yellow-400' },
    { value: 1, label: 'Fund', color: 'bg-green-500', darkColor: 'dark:bg-green-400' },
    { value: 2, label: 'Fund More', color: 'bg-emerald-600', darkColor: 'dark:bg-emerald-500' },
];

export default function EmailCustomizationModal({
  isOpen,
  onOpenChange,
  selectedItems: initialSelectedItems, // Rename prop
  balanceBudgetChecked,
  taxAmount,
  // Destructure lifted state props
  aggressiveness,
  setAggressiveness,
  itemFundingLevels,
  setItemFundingLevels,
  userName,
  setUserName,
  userLocation,
  setUserLocation,
}: EmailCustomizationModalProps) {

  // --- Draggable State ---
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Initial position: center (will be set on open)
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 }); // Offset from top-left corner
  const modalRef = useRef<HTMLDivElement>(null); // Ref for the modal content
  const dragHandleRef = useRef<HTMLDivElement>(null); // Ref for the drag handle (header)
  const isInitialOpen = useRef(true); // Track initial opening for centering

  // --- Center Modal on Open and Reset Position on Close ---
  useEffect(() => {
    if (isOpen && isInitialOpen.current && modalRef.current) {
       // Calculate initial center position
        const modalWidth = modalRef.current.offsetWidth;
        const modalHeight = modalRef.current.offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Center position relative to viewport
        const initialX = (viewportWidth - modalWidth) / 2;
        const initialY = (viewportHeight - modalHeight) / 2;

        setPosition({ x: initialX, y: initialY });
        isInitialOpen.current = false; // Mark initial centering done
    } else if (!isOpen) {
      isInitialOpen.current = true; // Reset for next open
      // Optionally reset position if desired when closed
       // setPosition({ x: 0, y: 0 }); // Reset to top-left if needed
    }
  }, [isOpen]);


  // --- Drag Handlers ---
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && dragHandleRef.current?.contains(e.target as Node)) {
        setIsDragging(true);
        const modalRect = modalRef.current.getBoundingClientRect();
        setDragStartOffset({
            x: e.clientX - modalRect.left,
            y: e.clientY - modalRect.top,
        });
        e.preventDefault(); // Prevent text selection
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !modalRef.current) return;

    // Calculate new top-left position based on mouse movement and initial offset
    const newX = e.clientX - dragStartOffset.x;
    const newY = e.clientY - dragStartOffset.y;

    setPosition({ x: newX, y: newY });

  }, [isDragging, dragStartOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    // Remove global styles if needed, e.g., body cursor
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // --- Attach/Detach Window Event Listeners ---
  useEffect(() => {
    if (isDragging) {
        document.body.style.cursor = 'grabbing'; // Indicate dragging globally
        document.body.style.userSelect = 'none'; // Prevent text selection
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    } else {
        document.body.style.cursor = ''; // Reset cursor
        document.body.style.userSelect = ''; // Re-enable selection
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }

    // Cleanup function
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        // Ensure styles are cleaned up on unmount
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);


  const handleFundingLevelChange = (itemId: string, value: number[]) => {
    const sliderValue = value[0];
    // Use the setter prop from parent
    setItemFundingLevels(new Map(itemFundingLevels).set(itemId, sliderValue));
  };

  const handleGenerateEmail = () => {
    // Convert slider values back to funding levels (-2 to 2) for email generation
     const finalSelectedItems: SelectedItem[] = Array.from(itemFundingLevels.entries())
        .map(([id, sliderValue]) => {
            const originalItem = initialSelectedItems.get(id);
            if (!originalItem) return null; // Should not happen if logic is correct
            return {
                id: id,
                description: originalItem.description,
                fundingLevel: mapSliderToFundingLevel(sliderValue), // Map slider value back
            };
        })
        .filter((item): item is SelectedItem => item !== null); // Filter out nulls

    const { subject, body } = generateRepresentativeEmail(
      finalSelectedItems,
      aggressiveness,
      userName,
      userLocation,
      balanceBudgetChecked
    );

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open the user's default email client
    if (typeof window !== 'undefined') {
        window.location.href = mailtoLink;
    }
    onOpenChange(false); // Close modal after generating
  };

  const getAggressivenessLabel = (value: number) => {
    if (value <= 15) return 'Kind';
    if (value <= 40) return 'Concerned';
    if (value <= 75) return 'Stern';
    return 'Angry';
  };

  const getFundingLevelDetails = (sliderValue: number) => {
     const levelValue = mapSliderToFundingLevel(sliderValue);
     return fundingLevels.find(level => level.value === levelValue) || fundingLevels[2]; // Default to 'Improve Efficiency'
  };


  // Convert Map to Array for rendering
  const selectedItemsArray = Array.from(initialSelectedItems.values());

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
       <DialogContent
         ref={modalRef} // Add ref to the DialogContent
         style={{
           // Apply position via top/left for fixed positioning
           left: `${position.x}px`,
           top: `${position.y}px`,
           transform: 'none', // Reset any transform if previously used
           // Center initially via Tailwind if position is 0,0 (before drag)
           // This is overridden by style once position changes
         }}
         className={cn(
            "max-w-3xl w-[90vw] sm:w-full p-0 max-h-[85vh]",
            "flex flex-col",
            "fixed", // Ensure fixed positioning
            // Apply centering classes by default, position state overrides via style prop
             !isDragging && position.x === 0 && position.y === 0 && isInitialOpen.current ? "left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2" : "",
             // Animations using keyframes defined in globals.css
             "data-[state=open]:animate-scaleIn data-[state=closed]:animate-scaleOut",
            "z-50 border bg-background shadow-lg sm:rounded-lg"
         )}
         // Prevent Radix default focus trapping from interfering with drag
         onInteractOutside={(e) => {
            if (isDragging) {
              e.preventDefault(); // Prevent closing modal while dragging outside
            }
          }}
       >
         {/* Custom Header - Drag Handle */}
         <DialogHeader
            ref={dragHandleRef} // Add ref to the header as drag handle
            onMouseDown={handleMouseDown} // Attach mouse down handler
            className={cn(
                "px-6 py-4 border-b bg-card/95 sticky top-0 z-10 shrink-0 rounded-t-lg", // Added rounded-t-lg
                isDragging ? "cursor-grabbing" : "cursor-move" // Change cursor on drag
            )}
         >
             <div className="flex justify-between items-center pointer-events-none"> {/* Disable pointer events on inner content */}
                <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground shrink-0"/> {/* Drag indicator */}
                    <div className="space-y-1">
                        <DialogTitle className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
                            <Mail className="h-5 w-5 text-primary" />
                            Customize Your Email
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Adjust the tone and desired funding changes for your message.
                        </DialogDescription>
                    </div>
                </div>
                {/* Keep the close button inside the header but outside the drag handle trigger area logic if needed */}
                <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 pointer-events-auto z-20 relative"> {/* Ensure close button is clickable */}
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                </DialogClose>
             </div>
         </DialogHeader>

        {/* Scrollable Content Area */}
        <ScrollArea className="overflow-y-auto px-6 py-4 flex-1">
          <div className="space-y-8">

            {/* User Info Section */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="userName" className="text-sm font-medium">Your Name</Label>
                    <Input
                        id="userName"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)} // Use setter prop
                        placeholder="Jane Doe"
                        className="h-9"
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="userLocation" className="text-sm font-medium">Your Location</Label>
                    <Input
                        id="userLocation"
                        value={userLocation}
                        onChange={(e) => setUserLocation(e.target.value)} // Use setter prop
                        placeholder="City, ST Zipcode"
                        className="h-9"
                    />
                 </div>
             </div>

            {/* Aggressiveness Slider */}
            <div className="space-y-3 rounded-lg border p-4 bg-secondary/30 shadow-inner">
              <div className="flex justify-between items-center">
                <Label htmlFor="aggressiveness" className="text-base font-semibold">Overall Tone</Label>
                <span className="text-sm font-medium text-primary rounded-full bg-primary/10 px-2.5 py-0.5">
                    {getAggressivenessLabel(aggressiveness)}
                </span>
              </div>
              <Slider
                id="aggressiveness"
                min={0}
                max={100}
                step={1}
                value={[aggressiveness]}
                onValueChange={(value) => setAggressiveness(value[0])} // Use setter prop
                className="my-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Kind / Polite</span>
                <span>Concerned</span>
                <span>Stern / Demanding</span>
              </div>
            </div>

            {/* Funding Level Sliders for Each Item */}
            {selectedItemsArray.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">Adjust Funding Priorities</h3>
                {selectedItemsArray.map((item) => {
                    const sliderValue = itemFundingLevels.get(item.id) ?? 50; // Get from prop
                    const levelDetails = getFundingLevelDetails(sliderValue);
                    return (
                        <div key={item.id} className="space-y-2 border p-4 rounded-md shadow-sm bg-card/50">
                            <div className="flex justify-between items-start gap-2">
                                <Label htmlFor={`funding-${item.id}`} className="text-sm font-medium text-foreground flex-1">
                                    {item.description}
                                </Label>
                                <span className={cn(
                                    "text-xs font-semibold rounded-full px-2 py-0.5 text-white whitespace-nowrap",
                                     levelDetails.color, levelDetails.darkColor // Apply dynamic background color
                                )}>
                                    {levelDetails.label}
                                </span>
                            </div>
                            <Slider
                                id={`funding-${item.id}`}
                                min={0}
                                max={100}
                                step={1} // Fine-grained control, mapping happens on change/generate
                                value={[sliderValue]}
                                onValueChange={(value) => handleFundingLevelChange(item.id, value)} // Uses internal handler calling setter prop
                                className={cn(
                                    "[&>span>span]:transition-colors [&>span>span]:duration-200", // Smooth track color change
                                     `[&>span>span]:${levelDetails.color}`, // Apply dynamic track color
                                     `[&>span>span]:${levelDetails.darkColor}`, // Apply dynamic dark track color
                                    "[&>span]:bg-muted" // Track background
                                )}
                            />
                             <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                                <span>Cut</span>
                                <span>Review</span>
                                <span>Increase</span>
                            </div>
                        </div>
                    );
                })}
              </div>
            )}

            {/* Budget Balancing Preference Display */}
             {balanceBudgetChecked && (
                <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300 shadow-sm">
                    <p><span className="font-semibold">Note:</span> Your email will also emphasize prioritizing a balanced budget and addressing the national debt.</p>
                </div>
             )}
          </div>
        </ScrollArea>

        {/* Footer with Action Button */}
        <DialogFooter className="px-6 py-4 border-t bg-card/95 sticky bottom-0 z-10 sm:justify-between shrink-0 rounded-b-lg"> {/* Added rounded-b-lg */}
           <DialogClose asChild>
             <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
           </DialogClose>
           <Button
                onClick={handleGenerateEmail}
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-700 dark:from-purple-600 dark:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800 text-primary-foreground"
                disabled={!userName || !userLocation} // Basic validation
            >
                <Send className="mr-2 h-4 w-4" />
                Generate & Open Email
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

