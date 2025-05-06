
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
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
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface EmailCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: SelectedItem[];
  onSubmit: (emailDetails: { subject: string; body: string }) => void;
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

// Helper function to get label from value
const getLabel = (levels: { value: number; label: string }[], value: number): string => {
  // Find the closest level
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
  isOpen,
  onClose,
  selectedItems,
  onSubmit,
}: EmailCustomizationModalProps) {
  const [aggressiveness, setAggressiveness] = useState(50); // Default to 'Concerned'
  const [itemReductions, setItemReductions] = useState<{ [key: string]: number }>(
    selectedItems.reduce((acc, item) => {
      acc[item.id] = 50; // Default to 'Reduce'
      return acc;
    }, {} as { [key: string]: number })
  );
  const [userName, setUserName] = useState('');
  const [userLocation, setUserLocation] = useState(''); // e.g., "City, State, Zip"
  const formRef = React.useRef<HTMLFormElement>(null);
  const { toast } = useToast(); // Use the hook

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
        setAggressiveness(50); // Reset aggressiveness
        // Reset item reductions based on currently selected items
        setItemReductions(
            selectedItems.reduce((acc, item) => {
                acc[item.id] = 50; // Default to 'Reduce'
                return acc;
            }, {} as { [key: string]: number })
        );
        // Optionally clear user info if desired, or keep it persisted
        // setUserName('');
        // setUserLocation('');
    }
  }, [isOpen, selectedItems]); // Rerun when modal opens or selected items change


  const handleReductionChange = (itemId: string, value: number[]) => {
    setItemReductions(prev => ({ ...prev, [itemId]: value[0] }));
  };

  const handleGenerateEmailClick = () => {
    // Trigger form validation and submission
     if (!formRef.current?.checkValidity()) {
         formRef.current?.reportValidity(); // Show browser validation messages
         return;
     }
     // If valid, manually call the submit handler
     handleFormSubmit(new Event('submit') as unknown as React.FormEvent);
  };


  const handleFormSubmit = (event: React.FormEvent) => {
     event.preventDefault(); // Prevent default form submission
     if (!userName || !userLocation) {
        toast({ // Use toast for feedback
           title: "Missing Information",
           description: "Please enter your name and location to generate the email.",
           variant: "destructive",
        });
        return; // Stop if info is missing (redundant check, but safe)
     }
     const emailDetails = generateRepresentativeEmail(
       selectedItems.map(item => ({
         ...item,
         reductionLevel: itemReductions[item.id] ?? 50, // Ensure reduction level is set
       })),
       aggressiveness,
       userName,
       userLocation
     );
     onSubmit(emailDetails);
     // Keep modal open - user might want to copy/paste or re-generate
     // onClose();
   };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Apply centering and max height/width styles directly to DialogContent */}
      <DialogContent className="sm:max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] xl:max-w-[50vw] max-h-[90vh] flex flex-col p-0 rounded-lg overflow-hidden border-border/70 shadow-2xl">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/50 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
             <Settings2 className="h-5 w-5" /> Customize Your Email
          </DialogTitle>
          <DialogDescription>
            Adjust the tone and specific requests for your message to your representative.
          </DialogDescription>
           {/* Use DialogClose provided by ShadCN for the X button */}
           <DialogClose asChild>
             <Button variant="ghost" size="icon" className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
             </Button>
           </DialogClose>
        </DialogHeader>

        {/* Scroll area for the main content */}
        {/* Ensure ScrollArea takes up remaining space and allows scrolling */}
        <ScrollArea className="flex-grow overflow-y-auto">
            <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-6 px-6 py-4">
                {/* Overall Tone Slider */}
                <div className="space-y-3">
                    <Label htmlFor="aggressiveness" className="text-base font-medium">Overall Tone</Label>
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

                {/* Per-Item Reduction Sliders */}
                 <div className="space-y-4 pt-4 border-t border-border/50">
                     <Label className="text-base font-medium">Specific Requests per Item</Label>
                     {selectedItems.length === 0 ? (
                         <p className="text-sm text-muted-foreground italic">No items selected.</p>
                     ) : (
                         selectedItems.map((item) => (
                            <div key={item.id} className="space-y-2 ml-1">
                                <Label htmlFor={`reduction-${item.id}`} className="text-sm text-muted-foreground">{item.description}</Label>
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

                {/* User Info Inputs */}
                 <div className="space-y-4 pt-4 border-t border-border/50">
                     <Label className="text-base font-medium">Your Information (Required by Officials)</Label>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-1.5">
                            <Label htmlFor="userName" className="text-sm">Your Name</Label>
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
                             <Label htmlFor="userLocation" className="text-sm">City, State, Zip Code</Label>
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
                     <p className="text-xs text-muted-foreground">This information is typically required for representatives to verify you are a constituent.</p>
                </div>
            </form>
         </ScrollArea>


        <DialogFooter className="px-6 pb-5 pt-4 border-t border-border/50 flex-shrink-0">
            {/* Use DialogClose for Cancel button */}
             <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
             </DialogClose>
             <Button type="button" onClick={handleGenerateEmailClick} disabled={!userName || !userLocation || selectedItems.length === 0}>
                 <Send className="mr-2 h-4 w-4" /> Generate Email
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
