'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import type { Location } from '@/services/tax-spending';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, LocateFixed, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Slimmed-down mobile version of the location step.
 * – No Enter-to-skip instructions (physical keyboards aren't the norm on phones).
 * – Uses generous padding / spacing to better fill vertical space.
 * – Keeps all original functionality (manual zip / city, geolocation, skip button).
 */
interface LocationStepMobileProps {
  onSubmit: (location: Location | null, zipCode?: string) => void;
}

export default function LocationStepMobile({ onSubmit }: LocationStepMobileProps) {
  const { toast } = useToast();
  const [manualLocation, setManualLocation] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [geoSupported, setGeoSupported] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setGeoSupported(typeof navigator !== 'undefined' && !!navigator.geolocation);
    inputRef.current?.focus();
  }, []);

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualLocation.trim();
    if (!trimmed) {
      onSubmit(null);
      toast({ title: 'Using default location.' });
      return;
    }
    const zipMatch = trimmed.match(/^\d{5}/);
    const zip = zipMatch ? zipMatch[0] : undefined;
    const placeholder: Location = { lat: 40.7128, lng: -74.006 };
    onSubmit(placeholder, zip);
    toast({ title: 'Location set', description: trimmed });
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        onSubmit({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
        toast({ title: 'Location found' });
      },
      err => {
        setIsLocating(false);
        toast({ title: 'Location error', description: err.message, variant: 'destructive' });
      }
    );
  };

  return (
    <div className="px-4 py-8 space-y-8">
      {/* Simple header */}
      <div className="text-center space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Where are you located?</h2>
        <p className="text-muted-foreground text-sm">
          This helps us provide more accurate tax estimates
        </p>
      </div>

      {/* Main input */}
      <form onSubmit={submitManual} className="space-y-4">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
          <Input
            ref={inputRef}
            placeholder="ZIP code or City, State"
            value={manualLocation}
            onChange={e => setManualLocation(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={!manualLocation.trim()} 
          className="w-full h-12 text-base font-medium"
        >
          Continue
        </Button>
      </form>

      {/* Quick options */}
      <div className="space-y-3">
        {geoSupported && (
          <Button 
            variant="outline" 
            onClick={useCurrentLocation} 
            disabled={isLocating} 
            className="w-full h-12 text-base"
          >
            {isLocating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Getting location...
              </>
            ) : (
              <>
                <LocateFixed className="h-4 w-4 mr-2" />
                Use my current location
              </>
            )}
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          className="w-full h-12 text-base text-muted-foreground" 
          onClick={() => onSubmit(null)}
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
} 