
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
  onSubmit: (location: Location | null) => void; // Allow null for skipping
}

export default function LocationStep({ onSubmit }: LocationStepProps) {
  const [manualLocation, setManualLocation] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [geolocationSupported, setGeolocationSupported] = useState<boolean | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
    const checkGeolocation = () => {
        setGeolocationSupported(!!navigator.geolocation);
        if (!navigator.geolocation) {
           console.log("Geolocation is not supported by this browser.");
        }
    };
    checkGeolocation();
    // Focus input on mount for easier typing/skipping
    inputRef.current?.focus();

    // Add keydown listener for Enter key
    const handleKeyDown = (event: KeyboardEvent) => {
       if (event.key === 'Enter') {
           // If input has value, submit it manually
           if (manualLocation.trim()) {
               handleManualSubmit(event as unknown as React.FormEvent); // Cast event type
           } else {
               // If input is empty, skip (submit null)
               onSubmit(null);
               toast({
                   title: 'Skipped Location',
                   description: 'Using default location.',
               });
           }
       }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
    // Add manualLocation to dependencies to re-evaluate Enter key press logic
  }, [manualLocation, onSubmit, toast]);


  const handleUseCurrentLocation = () => {
    if (!geolocationSupported || typeof navigator === 'undefined' || !navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onSubmit(location);
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
    if (!trimmedLocation) {
       // Allow submitting empty input to trigger skip logic
        onSubmit(null);
         toast({
            title: 'Skipped Location',
            description: 'Using default location.',
         });
      return;
    }

    // Basic Zip Code Check (Simple Example - Needs Improvement for real use)
    if (!/^\d{5}(-\d{4})?$/.test(trimmedLocation) && !/^[a-zA-Z\s,]+$/.test(trimmedLocation)) {
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
    if (trimmedLocation.startsWith('9')) { // California-ish zip
        placeholderLat = 34.0522;
        placeholderLng = -118.2437;
    } else if (trimmedLocation.toLowerCase().includes('chicago')) {
        placeholderLat = 41.8781;
        placeholderLng = -87.6298;
    }
    // Add more dummy cases or a simple lookup table if needed for demo

    const placeholderLocation: Location = { lat: placeholderLat, lng: placeholderLng };
    onSubmit(placeholderLocation);
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
    <div className="space-y-6">
      {/* Geolocation button section */}
       {geolocationSupported !== null && (
           <>
             <Button
                onClick={handleUseCurrentLocation}
                disabled={!geolocationSupported || isLocating}
                className="w-full transition-all duration-200 ease-in-out hover:scale-[1.02]"
                variant="outline"
                size="lg"
                aria-live="polite" // Announce changes for screen readers
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
              {!geolocationSupported && (
                <p className="text-xs text-center text-muted-foreground -mt-3">
                    Geolocation is not available. Please enter manually or skip.
                </p>
              )}

              {/* Separator */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/70" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground/80">
                    Or Enter Manually
                  </span>
                </div>
              </div>
          </>
        )}


      {/* Manual input form */}
      <form onSubmit={handleManualSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="location" className="sr-only">Location (Zip Code or City) or press Enter to skip</Label> {/* Updated label */}
          <div className="relative">
             <MapPin className={cn(
                "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/70 pointer-events-none transition-colors duration-200",
                inputRef.current === document.activeElement && "text-primary" // Highlight icon on focus
             )} />
            <Input
              ref={inputRef}
              id="location"
              type="text"
              placeholder="Zip Code or City, State"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              className="pl-10 pr-16 h-12 text-base sm:text-lg" // Added right padding for skip hint
              aria-label="Enter your location manually or press Enter to skip"
              aria-describedby="skip-hint" // Describe the skip action
            />
            {/* Skip Hint */}
            <div id="skip-hint" className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground/70 pointer-events-none">
               Skip <CornerDownLeft className="h-3 w-3"/>
            </div>
          </div>
           <p className="text-xs text-muted-foreground pt-1 pl-1">Enter your location or press <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-sm dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">Enter</kbd> to use the default (New York area).</p>
        </div>
        <Button type="submit" className="w-full transition-all duration-200 ease-in-out hover:scale-[1.02]" size="lg">
           {manualLocation.trim() ? 'Next' : 'Skip & Use Default'}
        </Button>
      </form>
    </div>
  );
}
