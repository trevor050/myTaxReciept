
/**
 * @fileOverview Type definitions for AI model options.
 */
import type { LucideIcon } from 'lucide-react';
import { BotMessageSquare, FileTextIcon, SearchIcon, MessagesSquareIcon, UserCircleIcon, ClipboardSignatureIcon } from 'lucide-react';

export interface AIModelOption {
  id: string;
  name: string;
  provider?: string; // Optional provider name for display in dropdown
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
    name: 'ChatGPT',
    provider: 'OpenAI',
    url: 'https://chat.openai.com/?model=gpt-4o&q=<YOUR_PROMPT>',
    icon: BotMessageSquare,
    tag: 'Recommended',
    tagColor: 'bg-teal-100 text-teal-800 dark:bg-teal-700/30 dark:text-teal-200',
    description: 'Versatile model for generating well-rounded email drafts.',
    isAIMeta: true,
  },
  {
    id: 'claude',
    name: 'Claude',
    provider: 'Anthropic',
    url: 'https://claude.ai/new?q=<YOUR_PROMPT>',
    icon: FileTextIcon,
    tag: 'Best Writer',
    tagColor: 'bg-orange-100 text-orange-800 dark:bg-orange-700/30 dark:text-orange-200',
    description: 'Known for strong, nuanced writing. Excellent for detailed emails.',
    isAIMeta: true,
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    provider: 'Perplexity',
    url: 'https://www.perplexity.ai/search?q=<YOUR_PROMPT>',
    icon: SearchIcon,
    tag: 'Best Search',
    tagColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-700/30 dark:text-cyan-200',
    description: 'Integrates real-time search for up-to-date, cited information.',
    isAIMeta: true,
  },
  {
    id: 'copilot',
    name: 'Microsoft Copilot',
    provider: 'Microsoft',
    url: 'https://copilot.microsoft.com/?q=<YOUR_PROMPT>',
    icon: MessagesSquareIcon,
    tag: 'Integrated Search',
    tagColor: 'bg-sky-100 text-sky-800 dark:bg-sky-700/30 dark:text-sky-200',
    description: 'AI chat with Bing search integration for current context.',
    isAIMeta: true,
  },
  {
    id: 'you',
    name: 'You.com Chat',
    provider: 'You.com',
    url: 'https://you.com/search?q=<YOUR_PROMPT>&tbm=youchat',
    icon: UserCircleIcon,
    tag: 'Researcher',
    tagColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-700/30 dark:text-indigo-200',
    description: 'Offers various AI modes, useful for research-backed arguments.',
    isAIMeta: true,
  },
  // Template option is separated logically
  {
    id: 'template',
    name: 'Use Standard Template',
    // No provider for local template
    url: '', // Not applicable, handled locally
    icon: ClipboardSignatureIcon,
    tag: 'Eco-Friendly',
    tagColor: 'bg-green-100 text-green-800 dark:bg-green-700/30 dark:text-green-200',
    description: 'Generates email locally. Near-zero energy use, may read more automated.',
    isAIMeta: false, // Differentiates it from AI models
  },
];

