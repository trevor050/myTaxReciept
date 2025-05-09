
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GripVertical, Mail, X, Send, Lightbulb, BrainCircuit } from 'lucide-react';

import type { SelectedItem as UserSelectedItem } from '@/services/tax-spending';
import { generateRepresentativeEmailContent, SUBJECT } from '@/services/email/generator';
import { generateAIPrompt, prepareItemsForAIPrompt } from '@/services/ai/prompt-generator';
import type { AIModelOption } from '@/types/ai-models';
import { AI_MODEL_OPTIONS } from '@/types/ai-models';
import { mapSliderToFundingLevel } from '@/lib/funding-utils';
import { toneBucket } from '@/services/email/utils';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


const fundingLevels = [
  { value: -2, label: 'Slash Heavily',      color: 'bg-red-600  dark:bg-red-500' },
  { value: -1, label: 'Cut Significantly',  color: 'bg-orange-500 dark:bg-orange-400' },
  { value:  0, label: 'Improve Efficiency', color: 'bg-yellow-500 dark:bg-yellow-400' },
  { value:  1, label: 'Fund',              color: 'bg-green-500 dark:bg-green-400' },
  { value:  2, label: 'Fund More',          color: 'bg-emerald-600 dark:bg-emerald-500' },
];

export default function EmailCustomizationModal (p: EmailCustomizationModalProps) {
  const {
    isOpen, onOpenChange, onEmailGenerated, onSuggestResources,
    selectedItems: initialSelectedItems,
    balanceBudgetChecked, aggressiveness, setAggressiveness,
    itemFundingLevels, setItemFundingLevels,
    userName, setUserName, userLocation, setUserLocation,
    canSuggestResources
  } = p;

  const [pos, setPos] = useState<{x:number|null;y:number|null}>({ x:null, y:null });
  const [drag, setDrag] = useState(false);
  const dragOffset = useRef({x:0,y:0});
  const isInitialOpen = useRef(true);
  const { toast } = useToast();

  const refModal = useRef<HTMLDivElement>(null);
  const refHandle= useRef<HTMLDivElement>(null);

  const [selectedGenerator, setSelectedGenerator] = useState<string>(AI_MODEL_OPTIONS.find(m => m.id === 'chatgpt')?.id || "template");

  useLayoutEffect(()=>{
      if (!isOpen) {
          isInitialOpen.current = true;
      }
  }, [isOpen]);


  useLayoutEffect(() => {
    if (!isOpen || pos.x !== null || !isInitialOpen.current) return;

    const frame = requestAnimationFrame(() => {
        if (!refModal.current) return;
        const { width, height } = refModal.current.getBoundingClientRect();
        if (width && height) {
        setPos({
            x: window.innerWidth  / 2 - width  / 2,
            y: Math.max(20, window.innerHeight / 2 - height / 2),
        });
        isInitialOpen.current = false;
        }
    });

    return () => cancelAnimationFrame(frame);
  }, [isOpen, pos.x]);


  const onDown = useCallback((e:React.MouseEvent)=>{
    if(!refHandle.current?.contains(e.target as Node) || !refModal.current) return;

    if(pos.x===null || pos.y === null || isInitialOpen.current){
      const r = refModal.current.getBoundingClientRect();
      const newPos = {x:r.left,y:r.top};
      setPos(newPos);
      dragOffset.current = {x:e.clientX - newPos.x, y:e.clientY - newPos.y};
    } else {
      dragOffset.current = {x:e.clientX-pos.x,y:e.clientY-pos.y};
    }
    isInitialOpen.current = false;
    setDrag(true);
    document.body.style.userSelect='none';
  },[pos, isInitialOpen]);

  const onMove = useCallback((e:MouseEvent)=>{
    if(!drag||!refModal.current || pos.x === null || pos.y === null) return;
    const {innerWidth:vw,innerHeight:vh}=window;
    const {width:hW,height:hH}=refModal.current.getBoundingClientRect();
    let x=e.clientX-dragOffset.current.x;
    let y=e.clientY-dragOffset.current.y;
    const margin = 5;
    x=Math.max(margin,Math.min(x,vw-hW-margin));
    y=Math.max(margin,Math.min(y,vh-hH-margin));
    setPos({x,y});
  },[drag, pos.x, pos.y]);

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

  const toneText = (v:number)=>v<=15?'Kind':v<=40?'Concerned':v<=75?'Stern':'Angry';
  const fdet = (s:number)=> fundingLevels.find(f=>f.value===mapSliderToFundingLevel(s))??fundingLevels[2];
  const selectedArray = React.useMemo(() => Array.from(initialSelectedItems.values()), [initialSelectedItems]);


  const handleGenerateEmail = async () => {
    const itemsForPrompt = await prepareItemsForAIPrompt(initialSelectedItems, itemFundingLevels);
    const aiModel = AI_MODEL_OPTIONS.find(m => m.id === selectedGenerator);
    const currentTone = toneBucket(aggressiveness);

    if (!aiModel) {
        toast({
            title: 'Error',
            description: 'Selected AI model not found.',
            variant: 'destructive',
        });
        return;
    }

    if (aiModel.isAIMeta) {
        const promptText = await generateAIPrompt(
            itemsForPrompt,
            aggressiveness,
            userName,
            userLocation,
            balanceBudgetChecked
        );
        let urlToOpen = aiModel.url;
        if (aiModel.url.includes('<YOUR_PROMPT>')) {
            urlToOpen = aiModel.url.replace('<YOUR_PROMPT>', encodeURIComponent(promptText));
        }

        toast({
            title: `Opening ${aiModel.name}...`,
            description: `After ${aiModel.name} generates the email, copy the text. Click 'Open Email Draft' to prepare your email client.`,
            duration: 9000,
            action: (
                <Button variant="outline" size="sm" onClick={() => {
                    const genericSubject = SUBJECT[currentTone] || SUBJECT[0];
                    const placeholderBody = `Hello [Representative Name],\n\nI am writing to you today regarding federal budget priorities.\n\n[Please paste the email body generated by ${aiModel.name} here.]\n\nThank you for your time and consideration.\n\nSincerely,\n${userName || '[Your Name]'}\n${userLocation || '[Your Location]'}`;
                    window.location.href = `mailto:?subject=${encodeURIComponent(genericSubject)}&body=${encodeURIComponent(placeholderBody)}`;
                }}>
                    Open Email Draft
                </Button>
            )
        });
        window.open(urlToOpen, '_blank');
        onEmailGenerated();

    } else { // Local Template
        const finalSelectedItemsForTemplate: (UserSelectedItem & { category: string })[] = Array.from(itemFundingLevels.entries()).map(([id, sliderValue]) => {
            const originalItem = initialSelectedItems.get(id);
            return {
                id,
                description: originalItem?.description || 'Unknown Item',
                category: originalItem?.category || 'Unknown Category', // Ensure category is passed
                fundingLevel: mapSliderToFundingLevel(sliderValue) // Convert slider value back to -2 to 2 range
            };
        });


        const {subject, body} = generateRepresentativeEmailContent(
            finalSelectedItemsForTemplate, 
            aggressiveness,
            userName,
            userLocation,
            balanceBudgetChecked
        );
        toast({
            title: 'Email Generated',
            description: 'Opening your email client with the pre-filled template.',
            duration: 5000,
        });
        window.location.href=`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        onEmailGenerated();
    }
  };

  const aiModels = AI_MODEL_OPTIONS.filter(model => model.isAIMeta);
  const templateModel = AI_MODEL_OPTIONS.find(model => !model.isAIMeta);
  const currentGeneratorName = AI_MODEL_OPTIONS.find(m => m.id === selectedGenerator)?.name || "Email";
  const isGenerateDisabled = !userName || !userLocation;


  return(
    <Dialog open={isOpen} onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
             isInitialOpen.current = true;
             setPos({ x: null, y: null });
        }
    }}>
      <DialogContent
        ref={refModal}
        style={
            pos.x !== null && pos.y !== null
            ? { left: pos.x, top: pos.y, transform: 'none' }
            : undefined
        }
        className={cn(
          'fixed z-50 flex max-h-[90vh] sm:max-h-[85vh] w-[95vw] sm:w-[90vw] max-w-3xl flex-col border bg-background shadow-lg sm:rounded-lg',
          pos.x === null && 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 data-[state=open]:animate-scaleIn data-[state=closed]:animate-scaleOut',
          pos.x !== null && 'data-[state=open]:animate-fadeIn data-[state=closed]:animate-scaleOut',
        )}
        onInteractOutside={e=>drag&&e.preventDefault()}
        onOpenAutoFocus={e=>e.preventDefault()}
      >

         <div
            ref={refHandle}
            onMouseDown={onDown}
            className='relative flex shrink-0 cursor-move select-none items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4 bg-card/95 rounded-t-lg'
         >
          <div className='flex items-center gap-2 sm:gap-3 pointer-events-none'>
            <GripVertical className='h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0' />
            <div className='space-y-0 sm:space-y-0.5'>
              <DialogTitle className='text-base sm:text-lg md:text-xl font-semibold flex items-center gap-1.5 sm:gap-2'>
                <Mail className='h-4 w-4 sm:h-5 sm:w-5 text-primary'/> Customize Your Message
              </DialogTitle>
              <DialogDescription className='text-xs sm:text-sm text-muted-foreground'>
                Adjust tone, priorities, provide info, and choose your generator.
              </DialogDescription>
            </div>
          </div>

           <DialogClose asChild>
                <Button variant='ghost' size='icon' className='h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 pointer-events-auto z-20 relative'>
                    <X className='h-3.5 w-3.5 sm:h-4 sm:w-4'/><span className='sr-only'>Close</span>
                </Button>
            </DialogClose>
        </div>


        <ScrollArea className='flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent'>
           <div className="space-y-6 sm:space-y-8">
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                <div className='space-y-1.5 sm:space-y-2'>
                  <Label htmlFor="userName" className="text-xs sm:text-sm">Your Name</Label>
                  <Input id="userName" value={userName} onChange={e=>setUserName(e.target.value)} placeholder='Jane Doe' className="h-8 sm:h-9 text-sm sm:text-base"/>
                </div>
                <div className='space-y-1.5 sm:space-y-2'>
                  <Label htmlFor="userLocation" className="text-xs sm:text-sm">Your Location</Label>
                  <Input id="userLocation" value={userLocation} onChange={e=>setUserLocation(e.target.value)} placeholder='City, ST Zipcode' className="h-8 sm:h-9 text-sm sm:text-base"/>
                </div>
              </div>

              <div className='space-y-2 sm:space-y-3 rounded-lg border p-3 sm:p-4 bg-secondary/30 shadow-inner'>
                <div className='flex justify-between items-center'>
                    <Label htmlFor="aggressiveness" className="text-sm sm:text-base font-semibold">Overall Tone</Label>
                    <span className='text-xs sm:text-sm font-medium text-primary rounded-full bg-primary/10 px-2 sm:px-2.5 py-0.5'>{toneText(aggressiveness)}</span>
                </div>
                <Slider
                    id="aggressiveness"
                    value={[aggressiveness]}
                    onValueChange={v=>setAggressiveness(v[0])}
                    className="my-1.5 sm:my-2"
                />
                <div className='flex justify-between text-[10px] sm:text-xs text-muted-foreground'>
                    <span>Kind / Polite</span><span>Concerned</span><span>Stern / Demanding</span>
                </div>
              </div>

              {selectedArray.length > 0 && (
                <div className='space-y-4 sm:space-y-6'>
                  <h3 className='text-sm sm:text-lg font-semibold border-b pb-1.5 sm:pb-2'>Adjust Funding Priorities</h3>
                  {selectedArray.map(item => {
                    const sliderValue = itemFundingLevels.get(item.id) ?? 50;
                    const det = fdet(sliderValue);
                    return (
                      <div key={item.id} className='space-y-1.5 sm:space-y-2 border p-3 sm:p-4 rounded-md shadow-sm bg-card/50'>
                        <div className='flex justify-between items-start gap-1.5 sm:gap-2'>
                          <Label htmlFor={`funding-${item.id}`} className='text-xs sm:text-sm font-medium text-foreground flex-1'>
                            {item.description}
                          </Label>
                           <span className={cn(
                               'text-[10px] sm:text-xs font-semibold rounded-full px-1.5 sm:px-2 py-0.5 text-white whitespace-nowrap',
                               det.color
                           )}>
                               {det.label}
                           </span>
                        </div>
                        <Slider
                            id={`funding-${item.id}`}
                            value={[sliderValue]}
                            onValueChange={v => setItemFundingLevels(new Map(itemFundingLevels).set(item.id, v[0]))}
                            className={cn(
                                '[&>span>span]:transition-colors [&>span>span]:duration-200',
                                `[&>span>span]:${det.color.split(' ')[0]}`, 
                                '[&>span]:bg-muted'
                            )}
                        />
                        <div className='flex justify-between text-[9px] sm:text-[10px] text-muted-foreground px-1'>
                          <span>Cut</span>
                          <span>Review</span>
                          <span>Increase</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {balanceBudgetChecked && (
                <div className='mt-4 sm:mt-6 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 sm:p-4 text-xs sm:text-sm text-amber-800 dark:text-amber-300'>
                  <p><strong>Note:</strong> Your message will emphasize balancing the budget and tackling the national debt.</p>
                </div>
              )}
           </div>
        </ScrollArea>

        <DialogFooter className='flex shrink-0 flex-col-reverse gap-2 sm:flex-row sm:justify-between items-center px-4 py-3 sm:px-6 sm:py-4 border-t bg-card/95 sticky bottom-0 z-10 rounded-b-lg'>
          <DialogClose asChild><Button variant='outline' className='w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10'>Cancel</Button></DialogClose>
          <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <Button
                variant="secondary"
                onClick={onSuggestResources}
                disabled={!canSuggestResources}
                className='w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10'
            >
                <Lightbulb className='mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4'/> Further Actions
            </Button>
            <div className="flex items-center gap-0.5 w-full sm:w-auto">
              <Button
                  disabled={isGenerateDisabled}
                  onClick={handleGenerateEmail}
                  className={cn(
                    'flex-grow sm:flex-none text-xs sm:text-sm h-9 sm:h-10 rounded-l-md rounded-r-none',
                    isGenerateDisabled
                        ? 'bg-muted hover:bg-muted cursor-not-allowed text-muted-foreground'
                        : 'bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-700 text-primary-foreground dark:from-purple-600 dark:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800'
                   )}
              >
                  <Send className='mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4'/>
                  {selectedGenerator === 'template' ? 'Generate & Open Email' : `Generate with ${currentGeneratorName}`}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default"
                    size="icon"
                    className={cn(
                        "h-9 w-9 sm:h-10 sm:w-10 rounded-l-none rounded-r-md shrink-0",
                        'bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-700 text-primary-foreground dark:from-purple-600 dark:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800'
                    )}
                  >
                    <BrainCircuit className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="sr-only">Choose Generator</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 sm:w-80">
                  <DropdownMenuLabel className="text-xs px-2 pt-2 pb-1">Choose AI Generator</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={selectedGenerator} onValueChange={setSelectedGenerator}>
                    {aiModels.map((modelItem) => {
                      const displayProvider = modelItem.provider && !modelItem.name.toLowerCase().includes(modelItem.provider.toLowerCase()) ? ` (${modelItem.provider})` : '';
                      return (
                        <DropdownMenuRadioItem key={modelItem.id} value={modelItem.id} className="text-xs sm:text-sm leading-snug cursor-pointer py-2 px-2">
                          <div className="flex items-start gap-2.5 w-full">
                             {typeof modelItem.icon === 'string' ? (
                                <img src={modelItem.icon} alt={`${modelItem.name} logo`} className="h-4 w-4 mt-0.5 flex-shrink-0 ai-model-logo" />
                              ) : (
                                <modelItem.icon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0"/>
                              )}
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="font-medium text-foreground">{modelItem.name}{displayProvider}</span>
                                {modelItem.tag && (
                                  <span className={cn(
                                    "text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-sm leading-none",
                                    modelItem.tagColor || "bg-accent text-accent-foreground"
                                  )}>{modelItem.tag}</span>
                                )}
                              </div>
                              <p className="text-muted-foreground text-[10px] sm:text-xs leading-tight">{modelItem.description}</p>
                            </div>
                          </div>
                        </DropdownMenuRadioItem>
                      );
                    })}
                   </DropdownMenuRadioGroup>
                     {templateModel && (
                        <>
                          <DropdownMenuSeparator className="my-1" />
                          <DropdownMenuLabel className="text-xs px-2 pt-1.5 pb-1">Local Template</DropdownMenuLabel>
                           <DropdownMenuRadioGroup value={selectedGenerator} onValueChange={setSelectedGenerator}>
                               <DropdownMenuRadioItem key={templateModel.id} value={templateModel.id} className="text-xs sm:text-sm leading-snug cursor-pointer py-2 px-2">
                                  <div className="flex items-start gap-2.5 w-full">
                                    {typeof templateModel.icon === 'string' ? (
                                        <img src={templateModel.icon} alt={`${templateModel.name} logo`} className="h-4 w-4 mt-0.5 flex-shrink-0 ai-model-logo" />
                                    ) : (
                                        <templateModel.icon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0"/>
                                    )}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="font-medium text-foreground">{templateModel.name}</span>
                                        {templateModel.tag && (
                                          <span className={cn(
                                            "text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-sm leading-none",
                                            templateModel.tagColor || "bg-accent text-accent-foreground"
                                          )}>{templateModel.tag}</span>
                                        )}
                                      </div>
                                      <p className="text-muted-foreground text-[10px] sm:text-xs leading-tight">{templateModel.description}</p>
                                    </div>
                                  </div>
                                </DropdownMenuRadioItem>
                           </DropdownMenuRadioGroup>
                        </>
                     )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EmailCustomizationModalProps{
  isOpen:boolean;
  onOpenChange:(b:boolean)=>void;
  onEmailGenerated: () => void;
  onSuggestResources: () => void;
  canSuggestResources: boolean;
  selectedItems: Map<string, UserSelectedItem & { category: string }>;
  balanceBudgetChecked:boolean;
  taxAmount:number;
  aggressiveness:number;setAggressiveness:(n:number)=>void;
  itemFundingLevels:Map<string,number>;setItemFundingLevels:(m:Map<string,number>)=>void;
  userName:string;setUserName:(s:string)=>void;
  userLocation:string;setUserLocation:(s:string)=>void;
}
