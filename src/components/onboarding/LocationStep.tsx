'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import type { Location } from '@/services/tax-spending';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, LocateFixed, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

interface LocationStepProps {
  onSubmit: (location: Location) => void;
}

export default function LocationStep({ onSubmit }: LocationStepProps) {
  const [manualLocation, setManualLocation] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [geolocationSupported, setGeolocationSupported] = useState<boolean | null>(null); // Use null initial state
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();


  useEffect(() => {
    // This effect runs only on the client after hydration
    setIsClient(true);
    if (navigator.geolocation) {
      setGeolocationSupported(true);
    } else {
       console.log("Geolocation is not supported by this browser.");
       setGeolocationSupported(false);
    }
  }, []); // Empty dependency array ensures this runs once on mount


  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return; // Guard against unexpected calls

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onSubmit(location); // Submit the location directly
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
    // TODO: Implement geocoding to convert manualLocation string to lat/lng
    console.warn('Geocoding not implemented. Using placeholder location.');
    const placeholderLocation: Location = { lat: 40.7128, lng: -74.0060 }; // Example: NYC
    onSubmit(placeholderLocation);
     toast({
        title: 'Location Set',
        description: `Using location: ${manualLocation}`,
     });
  };

  // Render loading state until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="space-y-6">
         <Skeleton className="h-8 w-3/4 mx-auto" />
         <Skeleton className="h-6 w-full mx-auto" />
         <Skeleton className="h-10 w-full" />
         <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or enter manually
              </span>
            </div>
        </div>
         <div className="space-y-4">
            <div className="space-y-2">
                 <Skeleton className="h-4 w-1/4" />
                 <Skeleton className="h-10 w-full" />
            </div>
             <Skeleton className="h-10 w-full" />
         </div>
      </div>
    );
  }

  // Render actual content only on the client
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">Enter Your Location</h2>
      <p className="text-center text-muted-foreground">
        Help us find tax spending data relevant to your area.
      </p>

      {/* Geolocation button section */}
      <Button
        onClick={handleUseCurrentLocation}
        disabled={geolocationSupported === false || isLocating} // Disable if not supported or already locating
        className="w-full"
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
      {geolocationSupported === false && (
        <p className="text-xs text-center text-muted-foreground">
            Geolocation is not available or supported by your browser. Please enter manually.
        </p>
      )}

      {/* Separator */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or enter manually
          </span>
        </div>
      </div>

      {/* Manual input form */}
      <form onSubmit={handleManualSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location (Zip Code or City)</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="location"
              type="text"
              placeholder="e.g., 90210 or San Francisco"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              className="pl-10"
              aria-label="Enter your location manually"
              required // Make manual input required
            />
          </div>
        </div>
        <Button type="submit" className="w-full">
          Next
        </Button>
      </form>
    </div>
  );
}
