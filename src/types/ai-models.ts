
/**
 * @fileOverview Type definitions for AI model options.
 */
import type { LucideIcon } from 'lucide-react';

export interface AIModelOption {
  id: string;
  name: string;
  url: string;
  icon: LucideIcon; // Or React.ElementType if using custom SVGs
  tag?: string;
  tagColor?: string; // Tailwind class for tag background/text
  description: string;
}

export const AI_MODEL_OPTIONS: AIModelOption[] = [
  {
    id: 'template',
    name: 'Use Standard Template',
    url: '', // Not applicable
    icon: ClipboardSignatureIcon,
    tag: 'Eco-Friendly',
    tagColor: 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300',
    description: 'Generates email locally. Near-zero energy use, may read more automated.',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT (OpenAI)',
    url: 'https://chat.openai.com/',
    icon: BotMessageSquare,
    tag: 'Recommended',
    tagColor: 'bg-sky-100 text-sky-700 dark:bg-sky-700/30 dark:text-sky-300',
    description: 'Versatile and widely used model for various text generation tasks.',
  },
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    url: 'https://claude.ai/chats',
    icon: FileTextIcon,
    tag: 'Best Writer',
    tagColor: 'bg-purple-100 text-purple-700 dark:bg-purple-700/30 dark:text-purple-300',
    description: 'Known for its strong writing capabilities and constitutional AI approach.',
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    url: 'https://www.perplexity.ai/',
    icon: SearchIcon,
    tag: 'Up-to-Date',
    tagColor: 'bg-amber-100 text-amber-700 dark:bg-amber-700/30 dark:text-amber-300',
    description: 'Focuses on providing answers with citations and current information.',
  },
  {
    id: 'bing',
    name: 'Microsoft Copilot (Bing)',
    url: 'https://copilot.microsoft.com/', // Updated URL, showconv might not be needed or works differently.
    icon: MessagesSquareIcon,
    tag: 'Integrated Search',
    description: 'AI chat integrated with Bing search for current events and web knowledge.',
  },
  {
    id: 'you',
    name: 'You.com Chat',
    url: 'https://you.com/chat',
    icon: UserCircleIcon,
    tag: 'Researcher',
    description: 'Offers various AI modes including research-focused chat capabilities.',
  },
];

// Re-exporting Lucide icons here to avoid direct import in AI_MODEL_OPTIONS array definition.
// This is a common pattern if the types file needs to be very clean.
// However, for this case, direct import in the array is fine too.
import { BotMessageSquare, FileTextIcon, SearchIcon, MessagesSquareIcon, UserCircleIcon, ClipboardSignatureIcon } from 'lucide-react';
