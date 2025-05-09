
/**
 * @fileOverview Type definitions for AI model options.
 */
import type { LucideIcon } from 'lucide-react';
import { ClipboardSignatureIcon } from 'lucide-react'; // Keep for template

// Updated AIModelOption interface
export interface AIModelOption {
  id: string;
  name: string;
  provider?: string;
  url: string;
  icon: string | LucideIcon; // Can be a path to an SVG or a LucideIcon component
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
    icon: '/assets/ChatGPT.svg', // Path to SVG
    tag: 'Recommended',
    tagColor: 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300',
    description: 'Versatile model for generating well-rounded email drafts. Prompt is auto-filled.',
    isAIMeta: true,
  },
  {
    id: 'claude',
    name: 'Claude',
    provider: 'Anthropic',
    url: 'https://claude.ai/new?q=<YOUR_PROMPT>',
    icon: '/assets/Claude.svg', // Path to SVG
    tag: 'Best Writer',
    tagColor: 'bg-orange-100 text-orange-700 dark:bg-orange-700/30 dark:text-orange-300',
    description: 'Known for strong, nuanced writing. Excellent for detailed emails. Prompt is auto-filled.',
    isAIMeta: true,
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    // provider: 'Perplexity AI', // Removed for brevity
    url: 'https://www.perplexity.ai/search?q=<YOUR_PROMPT>',
    icon: '/assets/Perplexity.svg', // Path to SVG
    tag: 'Best Search',
    tagColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-700/30 dark:text-cyan-300', // Updated color
    description: 'Integrates real-time search for up-to-date, cited information. Prompt is auto-filled.',
    isAIMeta: true,
  },
  {
    id: 'copilot',
    name: 'Copilot',
    provider: 'Microsoft',
    url: 'https://www.bing.com/search?showconv=1&q=<YOUR_PROMPT>',
    icon: '/assets/Copilot.svg', // Path to SVG
    tag: 'Microsoft Ecosystem',
    tagColor: 'bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-300',
    description: 'AI chat with Bing search integration for current context. Prompt is auto-filled.',
    isAIMeta: true,
  },
  {
    id: 'you',
    name: 'You.com',
    // provider: 'You.com', // Removed for brevity
    url: 'https://you.com/search?q=<YOUR_PROMPT>&tbm=youchat',
    icon: '/assets/you.com.svg', // Path to SVG
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
