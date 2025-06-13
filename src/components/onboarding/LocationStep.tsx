
'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import type { Location } from '@/services/tax-spending';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, LocateFixed, Loader2, CornerDownLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LocationStepProps {
  // Update onSubmit to accept optional zipCode
  onSubmit: (location: Location | null, zipCode?: string) => void;
}

export default function LocationStep({ onSubmit }: LocationStepProps) {
  const [manualLocation, setManualLocation] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [geolocationSupported, setGeolocationSupported] = useState<boolean | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true); // Ensure this runs only on client
    const checkGeolocation = () => {
      // Check navigator object existence before accessing geolocation
      setGeolocationSupported(typeof navigator !== 'undefined' && !!navigator.geolocation);
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        console.log("Geolocation is not supported by this browser.");
      }
    };

    if (typeof window !== 'undefined') { // Ensure navigator is accessed only on client
        checkGeolocation();
        // Focus input on mount for easier typing/skipping
        inputRef.current?.focus();
    }


    // Add keydown listener for Enter key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        // Prevent default form submission behavior if input is focused
        if (document.activeElement === inputRef.current) {
            event.preventDefault();
             // If input has value, submit it manually
             if (manualLocation.trim()) {
                handleManualSubmit(event as unknown as React.FormEvent); // Cast event type
             } else {
                 // If input is empty, skip (submit null)
                 onSubmit(null); // Pass null for location, no zip code
                 toast({
                     title: 'Skipped Location',
                     description: 'Using default location.',
                 });
             }
        }
        // Allow Enter for button clicks elsewhere
      }
    };


    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // Add manualLocation to dependencies to re-evaluate Enter key press logic
  }, [manualLocation, onSubmit, toast]);


  const handleUseCurrentLocation = () => {
    // Re-check geolocation support just in case
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onSubmit(location); // No zip code when using current location
        setIsLocating(false);
        toast({
          title: 'Location Found',
          description: 'Using your current location.',
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLocating(false);
        toast({
          title: 'Location Error',
          description: `Could not get your location: ${error.message}. Please enter manually or skip.`,
          variant: 'destructive',
        });
      }
    );
  };

  const handleManualSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedLocation = manualLocation.trim();
    let zipCode: string | undefined = undefined;

    if (!trimmedLocation) {
       // Allow submitting empty input to trigger skip logic
        onSubmit(null); // Pass null location, no zip
         toast({
            title: 'Skipped Location',
            description: 'Using default location.',
         });
      return;
    }

    // Basic Zip Code Check
    const zipMatch = trimmedLocation.match(/^\d{5}/); // Match first 5 digits as potential zip
    if (zipMatch) {
        zipCode = zipMatch[0];
    } else if (!/^[a-zA-Z\s,]+$/.test(trimmedLocation)) { // Check for City, State format otherwise
         toast({
            title: 'Invalid Format',
            description: 'Please enter a valid 5-digit Zip Code or City, State.',
            variant: 'destructive',
         });
         return;
    }

    // Placeholder Geocoding - replace with actual service or local lookup logic
    console.warn('Geocoding not implemented. Using placeholder location based on input.');
    // Very basic/dummy "geocoding" based on input - FOR DEMO ONLY
    let placeholderLat = 40.7128; // Default NYC
    let placeholderLng = -74.0060;
    if (zipCode && zipCode.startsWith('9')) { // California-ish zip
        placeholderLat = 34.0522;
        placeholderLng = -118.2437;
    } else if (trimmedLocation.toLowerCase().includes('chicago')) {
        placeholderLat = 41.8781;
        placeholderLng = -87.6298;
    }
    // Add more dummy cases or a simple lookup table if needed for demo

    const placeholderLocation: Location = { lat: placeholderLat, lng: placeholderLng };
    onSubmit(placeholderLocation, zipCode); // Pass placeholder location AND the extracted zip code
     toast({
        title: 'Location Set',
        description: `Using location approximation for: ${trimmedLocation}`,
     });
  };

  // Skeleton loader for SSR/initial render
  if (!isClient) {
    return (
      <div className="space-y-6 animate-fadeIn">
         <Skeleton className="h-12 w-full" />
         <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
        </div>
         <div className="space-y-4">
            <div className="space-y-2">
                 <Skeleton className="h-4 w-1/4" />
                 <Skeleton className="h-12 w-full" />
                 <Skeleton className="h-4 w-3/4 mt-1" />
            </div>
             <Skeleton className="h-12 w-full mt-2" />
         </div>
      </div>
    );
  }

  // Client-side rendered content
  return (
    <div className="space-y-4 sm:space-y-6"> {/* Adjusted spacing for mobile */}
      {/* Main Input Form */}
      <form onSubmit={handleManualSubmit} className="space-y-3 sm:space-y-4"> {/* Adjusted spacing for mobile */}
        <div className="space-y-1 sm:space-y-2"> {/* Adjusted spacing for mobile */}
          <Label htmlFor="location" className="sr-only">Location (Zip Code or City, State) or press Enter to skip</Label>
          <div className="relative">
             <MapPin className={cn(
                 "absolute left-3 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground/70 pointer-events-none transition-colors duration-200",
                 isClient && inputRef.current === document.activeElement && "text-primary" // Highlight icon on focus (client only)
             )} />
            <Input
              ref={inputRef}
              id="location"
              type="text"
              placeholder="Enter Location (e.g., 10001)"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              className="pl-9 sm:pl-10 pr-12 sm:pr-16 h-11 sm:h-12 text-base sm:text-lg text-center" // Adjusted padding, height and font for mobile
              aria-label="Enter your location manually or press Enter to skip"
              aria-describedby="location-skip-hint" // Describe the skip action
            />
            {/* Skip Hint */}
            <div id="location-skip-hint" className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground/70 pointer-events-none">
               Skip <CornerDownLeft className="h-3 w-3"/>
            </div>
          </div>
           <p className="text-xs text-muted-foreground pt-1 text-center">Enter your zip code or city, state or press <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-sm dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">Enter</kbd> to use the default.</p>
        </div>
        <Button type="submit" className="w-full transition-all duration-200 ease-in-out hover:scale-[1.02] text-sm sm:text-base" size="lg">
          Find My Tax Breakdown
        </Button>
      </form>

      {/* Separator */}
      <div className="relative my-2 sm:my-4"> {/* Adjusted margin for mobile */}
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/70" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground/80">
            Or
          </span>
        </div>
      </div>

      {/* Alternative Options */}
      <div className="text-center space-y-1 sm:space-y-2"> {/* Adjusted spacing for mobile */}
        {geolocationSupported && (
          <Button
            variant="outline"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="transition-colors w-full sm:w-auto text-sm sm:text-base border-primary/50 text-primary hover:bg-primary/5 mb-2" // Adjusted styling to match other steps
            size="lg"
          >
            {isLocating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Locating...
              </>
            ) : (
              <>
                <LocateFixed className="mr-2 h-4 w-4" />
                Use Current Location
              </>
            )}
          </Button>
        )}
        <Button 
          variant="outline"
          onClick={() => {
            onSubmit(null);
            toast({
              title: 'Using Default',
              description: 'Using default location for tax calculation.',
            });
          }}
          className="transition-colors w-full sm:w-auto text-sm sm:text-base border-primary/50 text-primary hover:bg-primary/5" // Adjusted styling to match other steps
          size="lg"
        >
          <MapPin className="mr-2 h-4 w-4" /> Use Default Location
        </Button>
      </div>
    </div>
  );
}

