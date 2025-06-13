
/**
 * @fileOverview Type definitions for AI model options.
 */
import type { LucideIcon } from 'lucide-react';
import { ClipboardSignatureIcon } from 'lucide-react'; // Keep for template
import type { SVGProps } from 'react';

// Import custom SVG icon components
import ChatGPTIcon from '@/components/icons/ChatGPTIcon';
import ClaudeIcon from '@/components/icons/ClaudeIcon';
import CopilotIcon from '@/components/icons/CopilotIcon';
import PerplexityIcon from '@/components/icons/PerplexityIcon';
import YouComIcon from '@/components/icons/YouComIcon';


// Updated AIModelOption interface
export interface AIModelOption {
  id: string;
  name: string;
  provider?: string;
  url: string;
  icon: LucideIcon | React.ComponentType<SVGProps<SVGSVGElement>>; // Allow LucideIcon or custom SVG Component
  tag?: string;
  tagColor?: string;
  description: string;
  isAIMeta: boolean;
}

export const AI_MODEL_OPTIONS: AIModelOption[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    provider: 'OpenAI',
    url: 'https://chat.openai.com/?model=gpt-4o&q=<YOUR_PROMPT>',
    icon: ChatGPTIcon,
    tag: 'Recommended',
    tagColor: 'bg-green-100 text-green-800 dark:bg-green-800/40 dark:text-green-200',
    description: 'Versatile model for generating well-rounded email drafts. Prompt is auto-filled.',
    isAIMeta: true,
  },
  {
    id: 'claude',
    name: 'Claude',
    provider: 'Anthropic',
    url: 'https://claude.ai/new?q=<YOUR_PROMPT>',
    icon: ClaudeIcon,
    tag: 'Best Writer',
    tagColor: 'bg-orange-100 text-orange-700 dark:bg-orange-700/30 dark:text-orange-300',
    description: 'Known for strong, nuanced writing. Excellent for detailed emails. Prompt is auto-filled.',
    isAIMeta: true,
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    url: 'https://www.perplexity.ai/search?q=<YOUR_PROMPT>',
    icon: PerplexityIcon,
    tag: 'Best Search',
    tagColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-800/40 dark:text-cyan-200',
    description: 'Integrates real-time search for up-to-date, cited information. Prompt is auto-filled.',
    isAIMeta: true,
  },
  {
    id: 'copilot',
    name: 'Copilot',
    provider: 'Microsoft',
    url: 'https://www.bing.com/search?showconv=1&q=<YOUR_PROMPT>',
    icon: CopilotIcon,
    tag: 'All-Arounder',
    tagColor: 'bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-300',
    description: 'Microsoft\'s AI assistant with Bing search integration for current context. Prompt is auto-filled.',
    isAIMeta: true,
  },
  {
    id: 'you',
    name: 'You.com',
    url: 'https://you.com/search?q=<YOUR_PROMPT>&tbm=youchat',
    icon: YouComIcon,
    tag: 'Researcher',
    tagColor: 'bg-purple-100 text-purple-700 dark:bg-purple-700/30 dark:text-purple-300',
    description: 'AI chat with smart reasoning and integrated web search. Prompt is auto-filled.',
    isAIMeta: true,
  },
  {
    id: 'template',
    name: 'Use Standard Template',
    url: '',
    icon: ClipboardSignatureIcon, // Keep Lucide icon for template
    tag: 'Eco-Friendly',
    tagColor: 'bg-lime-100 text-lime-700 dark:bg-lime-700/30 dark:text-lime-300',
    description: 'Generates email locally. Near-zero energy use, may read more automated.',
    isAIMeta: false,
  },
];

