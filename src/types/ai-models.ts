
/**
 * @fileOverview Type definitions for AI model options.
 */
import type { LucideIcon } from 'lucide-react';
import { BotMessageSquare, FileTextIcon, SearchIcon, MessagesSquareIcon, UserCircleIcon, ClipboardSignatureIcon } from 'lucide-react';

export interface AIModelOption {
  id: string;
  name: string;
  url: string;
  icon: LucideIcon;
  tag?: string;
  tagColor?: string; // Tailwind class for tag background/text
  description: string;
  isAIMeta: boolean; // Flag to group AI models vs local template
}

export const AI_MODEL_OPTIONS: AIModelOption[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT (OpenAI)',
    url: 'https://chat.openai.com/', // User pastes prompt
    icon: BotMessageSquare,
    tag: 'Recommended',
    tagColor: 'bg-blue-100 text-blue-800 dark:bg-blue-700/30 dark:text-blue-200',
    description: 'Versatile model. Copy the generated prompt and paste it into ChatGPT.',
    isAIMeta: true,
  },
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    url: 'https://claude.ai/new?q=<YOUR_PROMPT>',
    icon: FileTextIcon,
    tag: 'Best Writer',
    tagColor: 'bg-purple-100 text-purple-800 dark:bg-purple-700/30 dark:text-purple-200',
    description: 'Known for strong writing. Prompt will be auto-filled.',
    isAIMeta: true,
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    url: 'https://www.perplexity.ai/search?q=<YOUR_PROMPT>',
    icon: SearchIcon,
    tag: 'Best Search',
    tagColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700/30 dark:text-yellow-200',
    description: 'Answers with citations & current info. Prompt will be auto-filled.',
    isAIMeta: true,
  },
  {
    id: 'copilot',
    name: 'Microsoft Copilot',
    url: 'https://copilot.microsoft.com/?q=<YOUR_PROMPT>',
    icon: MessagesSquareIcon,
    tag: 'Integrated Search',
    tagColor: 'bg-sky-100 text-sky-800 dark:bg-sky-700/30 dark:text-sky-200',
    description: 'AI chat with Bing search. Prompt will be auto-filled.',
    isAIMeta: true,
  },
  {
    id: 'you',
    name: 'You.com Chat',
    url: 'https://you.com/search?q=<YOUR_PROMPT>&tbm=youchat',
    icon: UserCircleIcon,
    tag: 'Researcher',
    tagColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-700/30 dark:text-indigo-200',
    description: 'Offers various AI modes, including research. Prompt will be auto-filled.',
    isAIMeta: true,
  },
  // Template option is separated logically
  {
    id: 'template',
    name: 'Use Standard Template',
    url: '', // Not applicable, handled locally
    icon: ClipboardSignatureIcon,
    tag: 'Eco-Friendly',
    tagColor: 'bg-green-100 text-green-800 dark:bg-green-700/30 dark:text-green-200',
    description: 'Generates email locally. Near-zero energy use, may read more automated.',
    isAIMeta: false, // Differentiates it from AI models
  },
];
