
/**
 * @fileOverview Type definitions for AI model options.
 */
import type { LucideIcon } from 'lucide-react';
import { BotMessageSquare, FileTextIcon, SearchIcon, MessagesSquareIcon, UserCircleIcon, ClipboardSignatureIcon, BrainCircuit } from 'lucide-react';

export interface AIModelOption {
  id: string;
  name: string;
  url: string;
  icon: LucideIcon;
  tag?: string;
  tagColor?: string; // Tailwind class for tag background/text
  description: string;
  isAIMeta?: boolean; // Flag to group AI models vs local template
}

export const AI_MODEL_OPTIONS: AIModelOption[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT (OpenAI)',
    url: 'https://chat.openai.com/', // User pastes prompt
    icon: BotMessageSquare,
    tag: 'Recommended',
    tagColor: 'bg-blue-100 text-blue-800 dark:bg-blue-700/30 dark:text-blue-200',
    description: 'Versatile model for various text generation tasks. Paste the copied prompt.',
    isAIMeta: true,
  },
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    url: 'https://claude.ai/new?q=<YOUR_PROMPT>',
    icon: FileTextIcon,
    tag: 'Best Writer',
    tagColor: 'bg-purple-600 text-white dark:bg-purple-500 dark:text-purple-50',
    description: 'Known for strong writing capabilities. Prompt will be pre-filled.',
    isAIMeta: true,
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    url: 'https://www.perplexity.ai/search?q=<YOUR_PROMPT>',
    icon: SearchIcon,
    tag: 'Best Search',
    tagColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600/30 dark:text-yellow-200',
    description: 'Provides answers with citations and current info. Prompt will be pre-filled.',
    isAIMeta: true,
  },
  {
    id: 'bing',
    name: 'Microsoft Copilot',
    url: 'https://copilot.microsoft.com/?q=<YOUR_PROMPT>', // Simplified URL, ensure `showconv=1` is not strictly needed or handled by site
    icon: MessagesSquareIcon,
    tag: 'Integrated Search',
    tagColor: 'bg-slate-700 text-white dark:bg-slate-600 dark:text-slate-100',
    description: 'AI chat integrated with Bing search. Prompt will be pre-filled.',
    isAIMeta: true,
  },
  {
    id: 'you',
    name: 'You.com Chat',
    url: 'https://you.com/search?q=<YOUR_PROMPT>', // Using search for prompt injection
    icon: UserCircleIcon,
    tag: 'Researcher',
    tagColor: 'bg-indigo-600 text-white dark:bg-indigo-500 dark:text-indigo-50',
    description: 'Offers various AI modes including research-focused chat. Prompt will be pre-filled.',
    isAIMeta: true,
  },
  // Template option is separated logically
  {
    id: 'template',
    name: 'Use Standard Template',
    url: '', // Not applicable
    icon: ClipboardSignatureIcon, // Changed from BrainCircuit to match initial image better
    tag: 'Eco-Friendly',
    tagColor: 'bg-green-100 text-green-800 dark:bg-green-700/30 dark:text-green-200',
    description: 'Generates email locally. Near-zero energy use, may read more automated.',
    isAIMeta: false,
  },
];

// Note: Icons are imported directly in this file to be used in the array definition.
// This is fine for this setup.
// BrainCircuit was used as a general AI icon before, but specific icons per model are better.
// Defaulted ClipboardSignatureIcon for template as it's about a pre-defined structure.
