
'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // Keep DialogClose for explicit close button
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { generateRepresentativeEmail, type SelectedItem } from '@/services/tax-spending';
import { Mail, Send, Settings2, X } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/**
 * Props for the email customization modal.
 */
interface EmailCustomizationModalProps {
  selectedItems: SelectedItem[];
  balanceBudgetChecked: boolean;
  onSubmit: (emailDetails: { subject: string; body: string }) => void;
  open: boolean; // Controlled by parent
  onOpenChange: (open: boolean) => void; // Controlled by parent
}

// Define aggressiveness and reduction levels with labels
const aggressivenessLevels = [
  { value: 0, label: "Polite Inquiry" },
  { value: 50, label: "Concerned" },
  { value: 100, label: "Stern Demand" },
];

const reductionLevels = [
  { value: 0, label: "Review" }, // Request review/justification
  { value: 50, label: "Reduce" }, // Suggest reduction
  { value: 100, label: "Reallocate" }, // Demand reallocation/gutting
];

// Helper to find the nearest label for a slider value
const getLabel = (levels: { value: number; label: string }[], value: number): string => {
  let closest = levels[0];
  let minDiff = Math.abs(value - closest.value);

  for (let i = 1; i < levels.length; i++) {
    const diff = Math.abs(value - levels[i].value);
    if (diff < minDiff) {
      minDiff = diff;
      closest = levels[i];
    }
  }
  return closest.label;
};

export default function EmailCustomizationModal({
  selectedItems,
  balanceBudgetChecked,
  onSubmit,
  open,
  onOpenChange,
}: EmailCustomizationModalProps) {
  /* --------------------------------------------------
   * Local state
   * ------------------------------------------------*/
  const [aggressiveness, setAggressiveness] = useState(50);
  const [itemReductions, setItemReductions] = useState<{ [key: string]: number }>({});
  const [userName, setUserName] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  // Reset sliders and user info when modal opens or selection changes
  useEffect(() => {
    if (open) {
      setAggressiveness(50); // Reset tone to default
      setItemReductions(
        selectedItems.reduce((acc, item) => {
          acc[item.id] = 50; // Default each selected item to 'Reduce'
          return acc;
        }, {} as { [key: string]: number })
      );
      // Optionally clear user info:
      // setUserName('');
      // setUserLocation('');
    }
  }, [open, selectedItems]); // Rerun effect if modal opens or items change

  // Handle change for per-item reduction sliders
  const handleReductionChange = (itemId: string, value: number[]) => {
    setItemReductions(prev => ({ ...prev, [itemId]: value[0] }));
  };

  // Handle form submission (generate email)
  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Basic validation for user info
    if (!userName || !userLocation) {
      toast({
        title: "Missing Information",
        description: "Please enter your name and location to generate the email.",
        variant: "destructive",
      });
      // Focus the first empty field
      if (!userName) {
          document.getElementById("userName")?.focus();
      } else if (!userLocation) {
          document.getElementById("userLocation")?.focus();
      }
      return;
    }

    // Generate email content using the service function
    const emailDetails = generateRepresentativeEmail(
      selectedItems.map(item => ({
        ...item,
        reductionLevel: itemReductions[item.id] ?? 50, // Ensure a level is passed
      })),
      aggressiveness,
      userName,
      userLocation,
      balanceBudgetChecked
    );

    onSubmit(emailDetails); // Pass generated details to parent handler
    onOpenChange(false); // Close the modal after successful submission
  };

  // Disable generate button if user info is missing
  const isGenerateDisabled = !userName || !userLocation;

  /* --------------------------------------------------
   * Render
   * ------------------------------------------------*/
  return (
    // Use the Dialog component which handles overlay and centering
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
         className={cn(
            // Sizing: Responsive width and max height, allow scrolling
            "sm:max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] xl:max-w-[50vw]",
            "max-h-[90vh] flex flex-col",
            // Styling: Remove default padding, rounded corners, border, shadow
            "p-0 rounded-lg overflow-hidden border-border/70 shadow-2xl"
        )}
        // Remove the default close button provided by DialogContent to avoid duplicates
        // The explicit <DialogClose> button inside DialogHeader will handle closing.
        // showCloseButton={false} // This prop doesn't exist, rely on structure
      >
         {/* Header section */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/50 flex-shrink-0 relative"> {/* Added relative positioning */}
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Settings2 className="h-5 w-5" /> Customise Your Email
          </DialogTitle>
          <DialogDescription>
            Adjust the tone and specific requests for your message to your representative.
          </DialogDescription>
          {/* Explicit close button using DialogClose */}
           <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground" // Positioned top-right
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        {/* Scrollable main content area */}
        <ScrollArea className="flex-grow overflow-y-auto">
          {/* Form element wrapping the customizable options */}
          <form
            id="email-customization-form" // ID allows triggering submit from footer button
            ref={formRef}
            onSubmit={handleFormSubmit}
            className="space-y-6 px-6 py-4" // Add padding within the scroll area
          >
            {/* Overall Tone Slider */}
            <div className="space-y-3">
              <Label htmlFor="aggressiveness" className="text-base font-medium">
                Overall Tone
              </Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="aggressiveness"
                  min={0}
                  max={100}
                  step={50}
                  value={[aggressiveness]}
                  onValueChange={(value) => setAggressiveness(value[0])}
                  className="flex-grow" // Take up available space
                />
                <span className="text-sm font-medium text-muted-foreground w-24 text-right tabular-nums shrink-0">
                  {getLabel(aggressivenessLevels, aggressiveness)}
                </span>
              </div>
            </div>

            {/* Per-Item Reduction Sliders */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <Label className="text-base font-medium">Specific Spending Requests</Label>
              {selectedItems.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No specific spending items selected.</p>
              ) : (
                // Map through selected items to create sliders
                selectedItems.map((item) => (
                  <div key={item.id} className="space-y-2 ml-1">
                    <Label htmlFor={`reduction-${item.id}`} className="text-sm text-muted-foreground">
                      {item.description}
                    </Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        id={`reduction-${item.id}`}
                        min={0}
                        max={100}
                        step={50}
                        value={[itemReductions[item.id] ?? 50]} // Default to 50 if somehow not set
                        onValueChange={(value) => handleReductionChange(item.id, value)}
                        className="flex-grow"
                      />
                      <span className="text-sm font-medium text-muted-foreground w-24 text-right tabular-nums shrink-0">
                        {getLabel(reductionLevels, itemReductions[item.id] ?? 50)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Budget Balance Confirmation */}
            {balanceBudgetChecked && (
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm font-medium text-foreground">Budget Balance:</p>
                <p className="text-sm text-muted-foreground">
                  You've indicated a priority for balancing the budget. This will be included in the email.
                </p>
              </div>
            )}

            {/* User Information Input Fields */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <Label className="text-base font-medium">Your Information (Required by Officials)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* User Name Input */}
                <div className="space-y-1.5">
                  <Label htmlFor="userName" className="text-sm">
                    Your Name
                  </Label>
                  <Input
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g., Jane Doe"
                    required
                    className="text-base sm:text-sm" // Adjust text size
                  />
                </div>
                {/* User Location Input */}
                <div className="space-y-1.5">
                  <Label htmlFor="userLocation" className="text-sm">
                    City, State, Zip Code
                  </Label>
                  <Input
                    id="userLocation"
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    placeholder="e.g., Anytown, CA 90210"
                    required
                    className="text-base sm:text-sm"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Representatives require constituent details to verify residency.
              </p>
            </div>
          </form>
        </ScrollArea>

        {/* Footer section with action buttons */}
        <DialogFooter className="px-6 pb-5 pt-4 border-t border-border/50 flex-shrink-0">
          {/* Cancel button using DialogClose */}
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          {/* Submit button linked to the form via its ID */}
          <Button type="submit" form="email-customization-form" disabled={isGenerateDisabled}>
            <Send className="mr-2 h-4 w-4" /> Generate Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    