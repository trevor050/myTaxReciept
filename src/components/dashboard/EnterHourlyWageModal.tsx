// src/components/dashboard/EnterHourlyWageModal.tsx
'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EnterHourlyWageModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (wage: number) => void;
}

export default function EnterHourlyWageModal({ isOpen, onOpenChange, onSubmit }: EnterHourlyWageModalProps) {
  const [hourlyWageInput, setHourlyWageInput] = useState('');
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [pos, setPos] = React.useState<{ x: number | null; y: number | null }>({ x: null, y: null });
  const [drag, setDrag] = React.useState(false);
  const dragOffset = React.useRef({ x: 0, y: 0 });
  const isInitialOpen = React.useRef(true);
  const refModal = React.useRef<HTMLDivElement>(null);
  const refHandle = React.useRef<HTMLDivElement>(null);

  // Avoid SSR window access for the `modal` prop
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setIsDesktop(window.innerWidth >= 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setHourlyWageInput(''); // Reset input when modal opens
      // Delay focus slightly to ensure modal is fully rendered and focusable
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
        isInitialOpen.current = true; // Reset for next open
        setPos({ x: null, y: null });
    }
  }, [isOpen]);


  React.useLayoutEffect(() => {
    if (!isOpen || pos.x !== null || !isInitialOpen.current) return;
    const frame = requestAnimationFrame(() => {
      if (!refModal.current) return;
      const { width, height } = refModal.current.getBoundingClientRect();
      if (width && height) {
        setPos({
          x: window.innerWidth / 2 - width / 2,
          y: window.innerHeight / 2 - height / 2,
        });
        isInitialOpen.current = false;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, pos.x]);


  const onDown = React.useCallback((e: React.MouseEvent) => {
    if (!refHandle.current?.contains(e.target as Node) || !refModal.current) return;
    if (pos.x === null) {
      const r = refModal.current.getBoundingClientRect();
      setPos({ x: r.left, y: r.top });
      dragOffset.current = { x: e.clientX - r.left, y: e.clientY - r.top };
       isInitialOpen.current = false;
    } else {
      dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    }
    setDrag(true);
    document.body.style.userSelect = 'none';
  }, [pos]);


  const onMove = React.useCallback((e: MouseEvent) => {
    if (!drag || !refModal.current || pos.x === null ) return;
    const { innerWidth: vw, innerHeight: vh } = window;
    const { width: hW, height: hH } = refModal.current.getBoundingClientRect();
    let x = e.clientX - dragOffset.current.x;
    let y = e.clientY - dragOffset.current.y;
    x = Math.max(0, Math.min(x, vw - hW));
    y = Math.max(0, Math.min(y, vh - hH));
    setPos({ x, y });
  }, [drag, pos.x]);

  const stopDrag = React.useCallback(() => {
    setDrag(false);
    document.body.style.userSelect = '';
  }, []);

  React.useLayoutEffect(() => {
    if (drag) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', stopDrag);
    } else {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', stopDrag);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', stopDrag);
    };
  }, [drag, onMove, stopDrag]);



  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const wageString = hourlyWageInput.replace(/[^0-9.]/g, '');
    const wage = parseFloat(wageString);

    if (isNaN(wage) || wage <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid positive hourly wage.',
        variant: 'destructive',
      });
      inputRef.current?.focus();
      return;
    }
    onSubmit(wage);
    onOpenChange(false); // Close modal on successful submit
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Allow digits, one optional decimal point, and up to two decimal places
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setHourlyWageInput(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} modal={isDesktop}>
      <DialogContent
         ref={refModal}
         style={ pos.x !== null ? { left: pos.x, top: pos.y, transform: 'none' } : undefined }
         className={cn(
            'dialog-pop fixed z-50 flex max-h-[90vh] sm:max-h-[85vh] w-[95vw] sm:w-[90vw] max-w-md flex-col border bg-background shadow-lg sm:rounded-lg',
            pos.x === null && 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'data-[state=open]:animate-scaleIn data-[state=closed]:animate-scaleOut'
         )}
        onInteractOutside={e=>drag&&e.preventDefault()}
        onOpenAutoFocus={e => {
             e.preventDefault();
             // Ensure inputRef.current exists before focusing
             if (inputRef.current) {
                setTimeout(() => inputRef.current?.focus(), 50);
             }
        }}
      >
        <div
            ref={refHandle}
            onMouseDown={onDown}
            className='relative flex shrink-0 cursor-move select-none items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4 bg-card/95 rounded-t-lg'
         >
            <DialogHeader>
                <DialogTitle className="text-base sm:text-lg md:text-xl font-semibold flex items-center gap-1.5 sm:gap-2">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Enter Hourly Wage
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                    To enable the "Time Worked" perspective.
                </DialogDescription>
            </DialogHeader>
            <DialogClose asChild>
                <Button variant='ghost' size='icon' className='h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 pointer-events-auto z-20 relative'>
                    <X className='h-3.5 w-3.5 sm:h-4 sm:w-4'/><span className='sr-only'>Close</span>
                </Button>
            </DialogClose>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-3 sm:px-6 sm:py-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="hourlyWageModalInput" className="sr-only">Hourly Wage</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                id="hourlyWageModalInput"
                type="text"
                inputMode="decimal"
                placeholder="e.g., 25.50"
                value={hourlyWageInput}
                onChange={handleInputChange}
                className="pl-9 h-10 text-sm text-center"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="submit" disabled={!hourlyWageInput.trim()} className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm">
              <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Set Wage & View
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

