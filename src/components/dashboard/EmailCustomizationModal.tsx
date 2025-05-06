'use client';

import * as React from 'react';
import {
  useState, useRef, useLayoutEffect, useCallback,
} from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GripVertical, Mail, X, Send } from 'lucide-react';

import type { SelectedItem } from '@/services/tax-spending';
import { generateRepresentativeEmail } from '@/services/tax-spending';
import { mapSliderToFundingLevel } from '@/lib/funding-utils';
import { cn } from '@/lib/utils';

/*──────────────── funding presets ────────────────*/
const fundingLevels = [
  { value: -2, label: 'Slash Heavily',      color: 'bg-red-600  dark:bg-red-500' },
  { value: -1, label: 'Cut Significantly',  color: 'bg-orange-500 dark:bg-orange-400' },
  { value:  0, label: 'Improve Efficiency', color: 'bg-yellow-500 dark:bg-yellow-400' },
  { value:  1, label: 'Fund',              color: 'bg-green-500 dark:bg-green-400' },
  { value:  2, label: 'Fund More',          color: 'bg-emerald-600 dark:bg-emerald-500' },
];

/*──────────────── component ───────────────────────*/
export default function EmailCustomizationModal (p: EmailCustomizationModalProps) {
  const {
    isOpen, onOpenChange, selectedItems: initialSelectedItems,
    balanceBudgetChecked, aggressiveness, setAggressiveness,
    itemFundingLevels, setItemFundingLevels,
    userName, setUserName, userLocation, setUserLocation,
  } = p;

  /*───── draggable position (null = CSS centred) ───*/
  const [pos, setPos] = useState<{x:number|null;y:number|null}>({ x:null, y:null });
  const [drag, setDrag] = useState(false);
  const dragOffset = useRef({x:0,y:0});

  const refModal = useRef<HTMLDivElement>(null);
  const refHandle= useRef<HTMLDivElement>(null);

  useLayoutEffect(()=>{ if(!isOpen) setPos({x:null,y:null}); },[isOpen]);

  const onDown = useCallback((e:React.MouseEvent)=>{
    if(!refHandle.current?.contains(e.target as Node) || !refModal.current) return;

    /* lock visual position on first drag */
    if(pos.x===null){
      const r = refModal.current.getBoundingClientRect();
      setPos({x:r.left,y:r.top});
      dragOffset.current = {x:e.clientX-r.left,y:e.clientY-r.top};
    } else {
      dragOffset.current = {x:e.clientX-pos.x,y:e.clientY-pos.y};
    }
    setDrag(true);
    document.body.style.userSelect='none';
  },[pos]);

  const onMove = useCallback((e:MouseEvent)=>{
    if(!drag||!refModal.current) return;
    const {innerWidth:vw,innerHeight:vh}=window;
    const {width:hW,height:hH}=refModal.current.getBoundingClientRect();
    let x=e.clientX-dragOffset.current.x;
    let y=e.clientY-dragOffset.current.y;
    x=Math.max(0,Math.min(x,vw-hW));
    y=Math.max(0,Math.min(y,vh-hH));
    setPos({x,y});
  },[drag]);

  const stopDrag = useCallback(()=>{
    setDrag(false);
    document.body.style.userSelect='';
  },[]);

  useLayoutEffect(()=>{
    if(drag){
      window.addEventListener('mousemove',onMove);
      window.addEventListener('mouseup',stopDrag);
    }else{
      window.removeEventListener('mousemove',onMove);
      window.removeEventListener('mouseup',stopDrag);
    }
    return ()=>{window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',stopDrag);};
  },[drag,onMove,stopDrag]);

  /*──────── helpers ────────*/
  const tone = (v:number)=>v<=15?'Kind':v<=40?'Concerned':v<=75?'Stern':'Angry';
  const fdet = (s:number)=> fundingLevels.find(f=>f.value===mapSliderToFundingLevel(s))??fundingLevels[2];
  const selected = React.useMemo(()=>Array.from(initialSelectedItems.values()),[initialSelectedItems]);

  /*──────── UI ─────────────*/
  return(
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        ref={refModal}
        style={pos.x!==null?{left:pos.x,top:pos.y,transform:'none'}:undefined}
        className={cn(
          'dialog-pop fixed z-50 flex max-h-[85vh] w-[90vw] max-w-3xl flex-col border bg-background shadow-lg sm:w-full sm:rounded-lg',
          pos.x===null&&'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
        )}
        onInteractOutside={e=>drag&&e.preventDefault()}
        onOpenAutoFocus={e=>e.preventDefault()}
      >

        {/*──── HEADER (grab‑handle) ────*/}
        <div
          ref={refHandle}
          onMouseDown={onDown}
          className='relative flex shrink-0 select-none items-center gap-3 border-b px-6 py-4'
        >
          {/* absolute grip */}
          <GripVertical className='absolute left-4 top-4 h-4 w-4 text-muted-foreground' />
          {/* title block (centered) */}
          <div className='mx-auto text-center'>
            <DialogTitle className='flex items-center justify-center gap-2 text-xl font-semibold'>
              <Mail className='h-5 w-5 text-primary'/> Customize Your Email
            </DialogTitle>
            <DialogDescription className='mt-1 text-sm text-muted-foreground'>
              Adjust the tone and desired funding changes for your message.
            </DialogDescription>
          </div>
          {/* close button */}
          <DialogClose asChild>
            <Button variant='ghost' size='icon' className='absolute right-4 top-4 h-8 w-8'>
              <X className='h-4 w-4'/><span className='sr-only'>Close</span>
            </Button>
          </DialogClose>
        </div>

        {/*──── BODY (scrolls) ────*/}
        <ScrollArea className='flex-1 overflow-y-auto px-6 py-4'>

          {/* name / location */}
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Your Name</Label>
              <Input value={userName} onChange={e=>setUserName(e.target.value)} placeholder='Jane Doe'/>
            </div>
            <div className='space-y-2'>
              <Label>Your Location</Label>
              <Input value={userLocation} onChange={e=>setUserLocation(e.target.value)} placeholder='City, ST Zip'/>
            </div>
          </div>

          {/* tone slider */}
          <div className='mt-8 space-y-3 rounded-lg border bg-secondary/30 p-4 shadow-inner'>
            <div className='flex items-center justify-between'>
              <Label>Overall Tone</Label>
              <span className='rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary'>{tone(aggressiveness)}</span>
            </div>
            <Slider value={[aggressiveness]} onValueChange={v=>setAggressiveness(v[0])}/>
            <div className='flex justify-between text-xs text-muted-foreground'>
              <span>Kind / Polite</span><span>Concerned</span><span>Stern / Demanding</span>
            </div>
          </div>

          {/* funding sliders */}
          {selected.length>0&&(
            <div className='mt-8 space-y-6'>
              <h3 className='border-b pb-2 text-lg font-semibold'>Adjust Funding Priorities</h3>
              {selected.map(item=>{
                const slider=itemFundingLevels.get(item.id)??50;
                const det=fdet(slider);
                return(
                  <div key={item.id} className='space-y-2 rounded-md border bg-card/50 p-4 shadow-sm'>
                    <div className='flex items-start justify-between gap-2'>
                      <Label className='flex-1 text-sm'>{item.description}</Label>
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold text-white',det.color)}>{det.label}</span>
                    </div>
                    <Slider
                      value={[slider]}
                      onValueChange={v=>setItemFundingLevels(new Map(itemFundingLevels).set(item.id,v[0]))}
                      className={cn('[&>span>span]:transition-colors',`[&>span>span]:${det.color.split(' ')[0]}`)}
                    />
                    <div className='flex justify-between px-1 text-[10px] text-muted-foreground'><span>Cut</span><span>Review</span><span>Increase</span></div>
                  </div>
                );
              })}
            </div>
          )}

          {balanceBudgetChecked&&(
            <div className='mt-8 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300'>
              <p><strong>Note:</strong> Your email will emphasise balancing the budget and tackling the national debt.</p>
            </div>
          )}

        </ScrollArea>

        {/*──── FOOTER ────*/}
        <DialogFooter className='flex shrink-0 items-center gap-4 border-t bg-card/95 px-6 py-4'>
          <DialogClose asChild><Button variant='outline' className='w-full sm:w-auto'>Cancel</Button></DialogClose>
          <Button
            disabled={!userName||!userLocation}
            onClick={()=>{
              const mapped:SelectedItem[]=Array.from(itemFundingLevels).map(([id,slider])=>({
                id,description:initialSelectedItems.get(id)!.description,
                fundingLevel:mapSliderToFundingLevel(slider)
              }));
              const {subject,body}=generateRepresentativeEmail(mapped,aggressiveness,userName,userLocation,balanceBudgetChecked);
              window.location.href=`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              onOpenChange(false);
            }}
            className='w-full sm:w-auto bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-700 text-primary-foreground
                       dark:from-purple-600 dark:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800'
          >
            <Send className='mr-2 h-4 w-4'/> Generate & Open Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/*──────── prop type (unchanged) ────────*/
interface EmailCustomizationModalProps{
  isOpen:boolean;onOpenChange:(b:boolean)=>void;
  selectedItems:Map<string,SelectedItem>;
  balanceBudgetChecked:boolean;taxAmount:number;
  aggressiveness:number;setAggressiveness:(n:number)=>void;
  itemFundingLevels:Map<string,number>;setItemFundingLevels:(m:Map<string,number>)=>void;
  userName:string;setUserName:(s:string)=>void;
  userLocation:string;setUserLocation:(s:string)=>void;
}