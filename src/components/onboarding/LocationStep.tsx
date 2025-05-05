'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import type { Location } from '@/services/tax-spending';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, LocateFixed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationStepProps {
  onSubmit: (location: Location) => void;
}

export default function LocationStep({ onSubmit }: LocationStepProps) {
  const [manualLocation, setManualLocation] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();

  // State to hold location derived from browser API, used to prevent hydration mismatch
  const [browserLocation, setBrowserLocation] = useState<Location | null>(null);

  useEffect(() => {
    // This effect runs only on the client after hydration
    // We can safely access navigator here
    if (navigator.geolocation) {
      // Browser supports geolocation
    } else {
       // Browser doesn't support geolocation, maybe inform user or disable button
       console.log("Geolocation is not supported by this browser.");
    }
  }, []);


  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setBrowserLocation(location); // Store location obtained via browser API
          onSubmit(location); // Submit the location
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
    } else {
      setIsLocating(false);
      toast({
        title: 'Location Error',
        description: 'Geolocation is not supported by your browser. Please enter manually.',
        variant: 'destructive',
      });
    }
  };

  const handleManualSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Basic validation - ensure input is not empty
    if (!manualLocation.trim()) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a location (e.g., zip code, city).',
        variant: 'destructive',
      });
      return;
    }
    // TODO: Implement geocoding to convert manualLocation string to lat/lng
    // For now, using placeholder coordinates. Replace with actual geocoding API call.
    console.warn('Geocoding not implemented. Using placeholder location.');
    const placeholderLocation: Location = { lat: 40.7128, lng: -74.0060 }; // Example: NYC
    onSubmit(placeholderLocation);
     toast({
        title: 'Location Set',
        description: `Using location: ${manualLocation}`,
     });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">Enter Your Location</h2>
      <p className="text-center text-muted-foreground">
        Help us find tax spending data relevant to your area.
      </p>

      <Button
        onClick={handleUseCurrentLocation}
        disabled={isLocating}
        className="w-full"
        variant="outline"
      >
        <LocateFixed className="mr-2 h-4 w-4" />
        {isLocating ? 'Locating...' : 'Use Current Location'}
      </Button>

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
