'use client';

import * as React from 'react';
import {
  useState, useRef, useLayoutEffect, useCallback, useEffect,
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
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"

import type { SelectedItem as UserSelectedItem } from '@/services/tax-spending';
import type { FundingLevel } from '@/services/email/types';
import { generateStandardEmail, SUBJECT } from '@/services/email/standard-template';

import type { AIModelOption } from '@/types/ai-models';
import { AI_MODEL_OPTIONS } from '@/types/ai-models';
import { mapSliderToFundingLevel } from '@/lib/funding-utils';
import { toneBucket } from '@/services/email/utils';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import PromptTooLongModal from './PromptTooLongModal';


const fundingLevels = [
  { value: -2, label: 'Slash Heavily',      color: 'bg-red-600  dark:bg-red-500' },
  { value: -1, label: 'Cut Significantly',  color: 'bg-orange-500 dark:bg-orange-400' },
  { value:  0, label: 'Improve Efficiency', color: 'bg-yellow-500 dark:bg-yellow-400' },
  { value:  1, label: 'Fund',              color: 'bg-green-500 dark:bg-green-400' },
  { value:  2, label: 'Fund More',          color: 'bg-emerald-600 dark:bg-emerald-500' },
];

const PROMPT_LENGTH_THRESHOLD = 1900; // Characters

export default function EmailCustomizationModal (p: EmailCustomizationModalProps) {
  const {
    isOpen, onOpenChange, onEmailGenerated, onSuggestResources,
    selectedItems: initialSelectedItems,
    balanceBudgetChecked, aggressiveness, setAggressiveness,
    itemFundingLevels, setItemFundingLevels,
    userName, setUserName, userLocation, setUserLocation,
    canSuggestResources,
    zipCode,
  } = p;

  const [pos, setPos] = useState<{x:number|null;y:number|null}>({ x:null, y:null });
  const [drag, setDrag] = useState(false);
  const dragOffset = useRef({x:0,y:0});
  const isInitialOpen = useRef(true);
  const { toast } = useToast();

  const refModal = useRef<HTMLDivElement>(null);
  const refHandle= useRef<HTMLDivElement>(null);

  const [selectedGenerator, setSelectedGenerator] = useState<string>(AI_MODEL_OPTIONS.find(m => m.id === 'chatgpt')?.id || "template");

  const [isPromptTooLongModalOpen, setIsPromptTooLongModalOpen] = useState(false);
  const [currentPromptForModal, setCurrentPromptForModal] = useState('');
  const [currentAiModelForTooLongModal, setCurrentAiModelForTooLongModal] = useState<AIModelOption | null>(null);

  // Prevent SSR window access for the Dialog modal prop
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setIsDesktop(window.innerWidth >= 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

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
    try {
      // ---- 1. Prepare items for the AI prompt ----
      const prepareResponse = await fetch('/api/generate-ai-prompt', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialSelectedItems: Array.from(initialSelectedItems.entries()),
          itemFundingLevels: Array.from(itemFundingLevels.entries()),
        }),
      });

      if (!prepareResponse.ok) {
        throw new Error('Failed to prepare items for AI prompt');
      }

      const itemsForPrompt = await prepareResponse.json();

      const aiModel = AI_MODEL_OPTIONS.find((m) => m.id === selectedGenerator);
      if (!aiModel) {
        toast({ title: 'Error', description: 'Selected AI model not found.', variant: 'destructive' });
        return;
      }

      const currentTone = toneBucket(aggressiveness);

      // Use placeholders if userName or userLocation is empty
      const finalUserName = userName.trim() === '' ? '[Your Name]' : userName;
      const finalUserLocation = userLocation.trim() === '' ? '[Your Location]' : userLocation;

      // ---- 2. If using an external AI provider, generate the prompt ----
      if (aiModel.isAIMeta) {
        const promptResponse = await fetch('/api/generate-ai-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedItemsWithSliderValues: itemsForPrompt,
            aggressiveness,
            userName: finalUserName,
            userLocation: finalUserLocation,
            balanceBudgetPreference: balanceBudgetChecked,
          }),
        });

        if (!promptResponse.ok) {
          throw new Error('Failed to generate AI prompt');
        }

        const { prompt: promptText } = await promptResponse.json();

        if (promptText.length >= PROMPT_LENGTH_THRESHOLD) {
          setCurrentAiModelForTooLongModal(aiModel);
          setCurrentPromptForModal(promptText);
          setIsPromptTooLongModalOpen(true);
          return;
        }

        let urlToOpen = aiModel.url;
        if (aiModel.url.includes('<YOUR_PROMPT>')) {
          urlToOpen = aiModel.url.replace('<YOUR_PROMPT>', encodeURIComponent(promptText));
        }

        toast({
          title: `Opening ${aiModel.name}...`,
          description: `After ${aiModel.name} generates the email, copy the text. Click 'Open Email Draft' to prepare your email client.`,
          duration: 9000,
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const genericSubject = SUBJECT[currentTone] || SUBJECT[0];
                const placeholderBody = `Hello [Representative Name],\n\nI am writing to you today regarding federal budget priorities.\n\n[Please paste the email body generated by ${aiModel.name} here.]\n\nThank you for your time and consideration.\n\nSincerely,\n${finalUserName}\n${finalUserLocation}`;
                window.location.href = `mailto:?subject=${encodeURIComponent(genericSubject)}&body=${encodeURIComponent(placeholderBody)}`;
              }}
            >
              Open Email Draft
            </Button>
          ),
        });

        // Open differently on mobile to avoid the grey popup issue
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          window.location.href = urlToOpen; // full-page navigation on mobile
        } else {
          window.open(urlToOpen, '_blank');
        }
        onEmailGenerated();
      } else { // Local Template
        const finalSelectedItemsForTemplate: (UserSelectedItem & { category: string })[] = Array.from(itemFundingLevels.entries()).map(([id, sliderValue]) => {
          const originalItem = initialSelectedItems.get(id);
          return {
            id,
            description: originalItem?.description || 'Unknown Item',
            category: originalItem?.category || 'Unknown Category',
            fundingLevel: mapSliderToFundingLevel(sliderValue) as FundingLevel
          };
        });

        const {subject, body} = generateStandardEmail(
          finalSelectedItemsForTemplate,
          aggressiveness,
          finalUserName, // Use potentially placeholder name
          finalUserLocation, // Use potentially placeholder location
          balanceBudgetChecked
        );
        toast({
          title: 'Email Generated',
          description: 'Opening your email client with the pre-filled template.',
          duration: 5000,
        });
        // For mobile we still use mailto directly; behaviour is consistent across devices
        window.location.href=`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        onEmailGenerated();
      }
    } catch (error) {
      console.error('handleGenerateEmail:', error);
      toast({
        title: 'Network Error',
        description: 'Something went wrong while generating the email. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const aiModels = AI_MODEL_OPTIONS.filter(model => model.isAIMeta);
  const templateModel = AI_MODEL_OPTIONS.find(model => !model.isAIMeta);
  const currentGeneratorName = AI_MODEL_OPTIONS.find(m => m.id === selectedGenerator)?.name || "Email";
  // Generate button is no longer disabled based on userName or userLocation
  const isGenerateDisabled = initialSelectedItems.size === 0 && !balanceBudgetChecked;

  useEffect(() => {
    if (zipCode) {
      setUserLocation(zipCode);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zipCode]);

  return(
    <>
    <Dialog open={isOpen} modal={true} onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
             isInitialOpen.current = true;
             setPos({ x: null, y: null });
        }
    }}>
      <DialogContent
        ref={refModal}
        style={
            pos.x !== null && pos.y !== null && isDesktop
            ? { left: pos.x, top: pos.y, transform: 'none' }
            : undefined
        }
        className={cn(
          'fixed z-[90] flex border bg-background shadow-lg',
          // Mobile: full screen
          'h-full w-full max-h-none rounded-none inset-0',
          // Desktop: floating dialog
          'sm:max-h-[85vh] sm:w-[90vw] sm:max-w-3xl sm:rounded-lg',
          // Animation classes
          pos.x === null && 'sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 data-[state=open]:animate-scaleIn data-[state=closed]:animate-scaleOut',
          pos.x !== null && 'data-[state=open]:animate-fadeIn data-[state=closed]:animate-scaleOut',
          'flex-col',
          // Mobile-specific fixes
          'sm:inset-auto touch-manipulation'
        )}
        onInteractOutside={e=>{
          // On mobile, prevent all interaction outside the modal
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            e.preventDefault(); // Block all outside interactions on mobile
            return;
          }
          if (drag) e.preventDefault();
        }}
        onOpenAutoFocus={e=>e.preventDefault()}
      >

         <div
            ref={refHandle}
            onMouseDown={onDown}
            className='relative flex shrink-0 select-none items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4 bg-card/95 sm:cursor-move sm:rounded-t-lg'
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


        <div className="flex-1 overflow-y-auto sm:max-h-[70vh]">
           <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-4">
              <div className='space-y-3 sm:space-y-4'>
                <h3 className='text-sm sm:text-lg font-semibold border-b pb-1.5 sm:pb-2'>Your Information</h3>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="name" className='text-xs sm:text-sm'>Your Name (Optional)</Label>
                    <Input id="name" placeholder="Jane Doe" value={userName} onChange={e=>setUserName(e.target.value)} className="mt-1" />
                  </div>
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
        </div>

        <DialogFooter className='flex shrink-0 flex-col-reverse gap-2 sm:flex-row sm:justify-between items-center px-4 py-3 sm:px-6 sm:py-4 border-t bg-card/95 sticky bottom-0 z-10 sm:rounded-b-lg'>
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
                    'bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-700 text-primary-foreground',
                    'dark:from-purple-600 dark:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800',
                    isGenerateDisabled && 'bg-muted hover:bg-muted cursor-not-allowed text-muted-foreground from-muted to-muted dark:from-muted dark:to-muted opacity-50'
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
                        'bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-700 text-primary-foreground',
                        'dark:from-purple-600 dark:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800',
                         isGenerateDisabled && 'opacity-50' // Keep trigger visually consistent if main button is disabled (though not strictly needed for functionality)
                    )}
                    disabled={isGenerateDisabled} // Disable trigger if main button is disabled
                  >
                    <BrainCircuit className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="sr-only">Choose Generator</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  side="top"
                  className="w-[calc(100vw-2rem)] max-w-[320px] sm:w-80 p-2 z-[200] mx-4 sm:mx-0"
                  sideOffset={8}
                  alignOffset={0}
                  avoidCollisions={true}
                  collisionPadding={16}
                >
                  <DropdownMenuLabel className="px-1 pb-1 text-xs">Choose AI Generator</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={selectedGenerator} onValueChange={setSelectedGenerator} className="space-y-1">
                    {aiModels.map((modelItem) => {
                      const displayProvider = modelItem.provider && !modelItem.name.toLowerCase().includes(modelItem.provider.toLowerCase()) ? ` (${modelItem.provider})` : '';
                      const IconComponent = modelItem.icon;
                      return (
                        <DropdownMenuRadioItem 
                          key={modelItem.id} 
                          value={modelItem.id} 
                          className={cn("ai-option-card py-2", modelItem.id)}
                          hideIndicator
                        >
                          <div className="flex items-center gap-3 w-full">
                             <IconComponent className="ai-model-icon flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-foreground">{modelItem.name}{displayProvider}</span>
                                {modelItem.tag && (
                                  <span className="tag">{modelItem.tag}</span>
                                )}
                              </div>
                              <p className="text-muted-foreground text-xs leading-tight pr-4">{modelItem.description}</p>
                            </div>
                          </div>
                        </DropdownMenuRadioItem>
                      );
                    })}
                   </DropdownMenuRadioGroup>
                     {templateModel && (
                        <>
                          <DropdownMenuSeparator className="my-2" />
                          <DropdownMenuRadioGroup value={selectedGenerator} onValueChange={setSelectedGenerator}>
                               <DropdownMenuRadioItem 
                                 key={templateModel.id} 
                                 value={templateModel.id} 
                                 className="ai-option-card local-template py-2"
                                 hideIndicator
                               >
                                  <div className="flex items-center gap-3 w-full">
                                    <templateModel.icon className="ai-model-icon" />
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium text-foreground">{templateModel.name}</span>
                                        {templateModel.tag && (
                                          <span className={cn(
                                            "tag whitespace-nowrap",
                                            templateModel.tagColor || "bg-accent text-accent-foreground"
                                          )}>{templateModel.tag}</span>
                                        )}
                                      </div>
                                      <p className="text-muted-foreground text-xs leading-tight">{templateModel.description}</p>
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
    {currentAiModelForTooLongModal && (
        <PromptTooLongModal
            isOpen={isPromptTooLongModalOpen}
            onOpenChange={setIsPromptTooLongModalOpen}
            promptText={currentPromptForModal}
            aiModelName={currentAiModelForTooLongModal.name}
            aiModelUrlWithoutPrompt={currentAiModelForTooLongModal.url.replace('<YOUR_PROMPT>', '')}
            onEmailGenerated={onEmailGenerated}
            userName={userName} // Pass current userName (could be empty)
            userLocation={userLocation} // Pass current userLocation (could be empty)
            tone={toneBucket(aggressiveness)}
        />
    )}
    </>
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
  zipCode: string | null;
}

