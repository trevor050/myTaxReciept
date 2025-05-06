
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
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { generateRepresentativeEmail, type SelectedItem } from '@/services/tax-spending'; // Adjust path as needed
import { Mail, Send, Settings2, X } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';

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

  // Reset per‑item slider defaults whenever the modal opens or selection changes
  useEffect(() => {
    if (open) {
      setAggressiveness(50);
      setItemReductions(
        selectedItems.reduce((acc, item) => {
          acc[item.id] = 50; // Default to 'Reduce'
          return acc;
        }, {} as { [key: string]: number })
      );
      // Clear user info when opening? Optional:
      // setUserName('');
      // setUserLocation('');
    }
  }, [open, selectedItems]);

  // Handle per‑item reduction slider change
  const handleReductionChange = (itemId: string, value: number[]) => {
    setItemReductions(prev => ({ ...prev, [itemId]: value[0] }));
  };

  // Form submit (generate email)
  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!userName || !userLocation) {
      toast({
        title: "Missing Information",
        description: "Please enter your name and location to generate the email.",
        variant: "destructive",
      });
      return;
    }

    // No need to check selection here, parent ensures button only appears when valid

    const emailDetails = generateRepresentativeEmail(
      selectedItems.map(item => ({
        ...item,
        reductionLevel: itemReductions[item.id] ?? 50,
      })),
      aggressiveness,
      userName,
      userLocation,
      balanceBudgetChecked
    );

    onSubmit(emailDetails);
    onOpenChange(false); // Close the modal after submission
  };

  // Convenience – disable generate button if required info missing
  const isGenerateDisabled = !userName || !userLocation;

  /* --------------------------------------------------
   * Render
   * ------------------------------------------------*/
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Removed DialogTrigger as modal is controlled externally */}
      <DialogContent className="sm:max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] xl:max-w-[50vw] max-h-[90vh] flex flex-col p-0 rounded-lg overflow-hidden border-border/70 shadow-2xl">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/50 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Settings2 className="h-5 w-5" /> Customise Your Email
          </DialogTitle>
          <DialogDescription>
            Adjust the tone and specific requests for your message to your representative.
          </DialogDescription>
          {/* Use DialogClose for the X button */}
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        {/* Scrollable body */}
        <ScrollArea className="flex-grow overflow-y-auto">
          {/* Use an ID for the form to reference in DialogFooter button */}
          <form id="email-customization-form" ref={formRef} onSubmit={handleFormSubmit} className="space-y-6 px-6 py-4">
            {/* Overall tone slider */}
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
                  className="flex-grow"
                />
                <span className="text-sm font-medium text-muted-foreground w-24 text-right tabular-nums shrink-0">
                  {getLabel(aggressivenessLevels, aggressiveness)}
                </span>
              </div>
            </div>

            {/* Per‑item sliders */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <Label className="text-base font-medium">Specific Spending Requests</Label>
              {selectedItems.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No specific spending items selected.</p>
              ) : (
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
                        value={[itemReductions[item.id] ?? 50]}
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

            {/* Budget balance note */}
            {balanceBudgetChecked && (
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm font-medium text-foreground">Budget Balance:</p>
                <p className="text-sm text-muted-foreground">
                  You've indicated a priority for balancing the budget. This will be included in the email.
                </p>
              </div>
            )}

            {/* User info */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <Label className="text-base font-medium">Your Information (Required by Officials)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="text-base sm:text-sm"
                  />
                </div>
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

        <DialogFooter className="px-6 pb-5 pt-4 border-t border-border/50 flex-shrink-0">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          {/* Button triggers the form submit via form ID */}
          <Button type="submit" form="email-customization-form" disabled={isGenerateDisabled}>
            <Send className="mr-2 h-4 w-4" /> Generate Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
