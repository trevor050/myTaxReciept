
'use client';

import * as React from 'react';
import { useState } from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import { generateRepresentativeEmail, type SelectedItem } from '@/services/tax-spending'; // Adjust path as needed
import { Mail, Send, Settings2, X } from 'lucide-react';

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
  // Initialize reduction levels for each selected item
  const [itemReductions, setItemReductions] = useState<{ [key: string]: number }>(
    selectedItems.reduce((acc, item) => {
      acc[item.id] = 50; // Default to 'Reduce'
      return acc;
    }, {} as { [key: string]: number })
  );
  const [userName, setUserName] = useState('');
  const [userLocation, setUserLocation] = useState(''); // e.g., "City, State, Zip"

  // Update itemReductions when selectedItems change externally (e.g., closing and reopening modal)
  React.useEffect(() => {
    setItemReductions(
      selectedItems.reduce((acc, item) => {
        acc[item.id] = itemReductions[item.id] ?? 50; // Keep existing value or default to 50
        return acc;
      }, {} as { [key: string]: number })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems]); // Only re-run if selectedItems array itself changes


  const handleReductionChange = (itemId: string, value: number[]) => {
    setItemReductions(prev => ({ ...prev, [itemId]: value[0] }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const emailDetails = generateRepresentativeEmail(
      selectedItems.map(item => ({
        ...item,
        reductionLevel: itemReductions[item.id], // Add reduction level to each item
      })),
      aggressiveness,
      userName,
      userLocation
    );
    onSubmit(emailDetails);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] flex flex-col">
        <DialogHeader className="pr-10"> {/* Add padding to avoid overlap with close button */}
          <DialogTitle className="flex items-center gap-2 text-xl">
             <Settings2 className="h-5 w-5" /> Customize Your Email
          </DialogTitle>
          <DialogDescription>
            Adjust the tone and specific requests for your message to your representative.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto px-1 py-2 space-y-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"> {/* Make form scrollable */}
            {/* Overall Tone Slider */}
            <div className="space-y-3">
                <Label htmlFor="aggressiveness" className="text-base font-medium">Overall Tone</Label>
                <div className="flex items-center gap-4">
                    <Slider
                        id="aggressiveness"
                        min={0}
                        max={100}
                        step={50} // Steps match the defined levels
                        value={[aggressiveness]}
                        onValueChange={(value) => setAggressiveness(value[0])}
                        className="flex-grow"
                    />
                     <span className="text-sm font-medium text-muted-foreground w-24 text-right tabular-nums">
                        {getLabel(aggressivenessLevels, aggressiveness)}
                    </span>
                </div>

            </div>

            {/* Per-Item Reduction Sliders */}
             <div className="space-y-4 pt-4 border-t border-border/50">
                 <Label className="text-base font-medium">Specific Requests per Item</Label>
                 {selectedItems.map((item) => (
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
                            <span className="text-sm font-medium text-muted-foreground w-24 text-right tabular-nums">
                                {getLabel(reductionLevels, itemReductions[item.id] ?? 50)}
                            </span>
                        </div>
                    </div>
                 ))}
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
                         />
                     </div>
                </div>
                 <p className="text-xs text-muted-foreground">This information is typically required for representatives to verify you are a constituent.</p>
            </div>
        </form>


        <DialogFooter className="mt-auto pt-4 border-t border-border/50"> {/* Ensure footer is at bottom */}
             <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
             <Button type="submit" onClick={handleSubmit} disabled={!userName || !userLocation}>
                 <Send className="mr-2 h-4 w-4" /> Generate Email
            </Button>
        </DialogFooter>
         {/* Explicit Close Button (optional, DialogClose inside DialogContent already exists) */}
         {/* <DialogClose asChild>
             <Button variant="ghost" size="icon" className="absolute right-4 top-4">
                <X className="h-4 w-4" />
             </Button>
        </DialogClose> */}
      </DialogContent>
    </Dialog>
  );
}
