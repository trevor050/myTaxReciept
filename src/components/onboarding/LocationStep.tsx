
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import type { Location } from '@/services/tax-spending';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, LocateFixed, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface LocationStepProps {
  onSubmit: (location: Location) => void;
}

export default function LocationStep({ onSubmit }: LocationStepProps) {
  const [manualLocation, setManualLocation] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [geolocationSupported, setGeolocationSupported] = useState<boolean | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setGeolocationSupported(!!navigator.geolocation);
    if (!navigator.geolocation) {
       console.log("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleUseCurrentLocation = () => {
    if (!geolocationSupported) return;

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
          description: `Could not get your location: ${error.message}. Please enter manually.`,
          variant: 'destructive',
        });
      }
    );
  };

  const handleManualSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!manualLocation.trim()) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a location (e.g., zip code, city).',
        variant: 'destructive',
      });
      return;
    }
    // Placeholder Geocoding - replace with actual geocoding service call
    console.warn('Geocoding not implemented. Using placeholder location.');
    const placeholderLocation: Location = { lat: 40.7128, lng: -74.0060 }; // Example: NYC
    onSubmit(placeholderLocation);
     toast({
        title: 'Location Set',
        description: `Using location: ${manualLocation}`,
     });
  };

  // Skeleton loader for SSR/initial render
  if (!isClient) {
    return (
      <div className="space-y-6 animate-fadeIn">
         {/* Simplified Skeleton */}
         <Skeleton className="h-10 w-full" />
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
                 <Skeleton className="h-10 w-full" />
            </div>
             <Skeleton className="h-10 w-full mt-2" />
         </div>
      </div>
    );
  }

  // Client-side rendered content
  return (
    <div className="space-y-6">
      {/* Geolocation button section */}
       {geolocationSupported !== null && ( // Only render button section once support is determined
           <>
             <Button
                onClick={handleUseCurrentLocation}
                disabled={!geolocationSupported || isLocating}
                className="w-full transition-all duration-200 ease-in-out hover:scale-[1.02]" // Subtle hover effect
                variant="outline"
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
                    Geolocation is not available. Please enter manually.
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
          <Label htmlFor="location" className="sr-only">Location (Zip Code or City)</Label> {/* Screen reader only label */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70 pointer-events-none" /> {/* Slightly dimmer icon */}
            <Input
              id="location"
              type="text"
              placeholder="Enter Zip Code or City"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              className="pl-10 text-base" // Ensure consistent text size
              aria-label="Enter your location manually"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full transition-all duration-200 ease-in-out hover:scale-[1.02]">
          Next
        </Button>
      </form>
    </div>
  );
}
