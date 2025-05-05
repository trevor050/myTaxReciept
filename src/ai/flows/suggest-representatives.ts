'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting relevant representatives to contact based on a user's tax spending breakdown.
 *
 * - suggestRepresentatives - A function that suggests relevant representatives based on tax spending.
 * - SuggestRepresentativesInput - The input type for the suggestRepresentatives function.
 * - SuggestRepresentativesOutput - The return type for the suggestRepresentatives function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {TaxSpending} from '@/services/tax-spending';

const SuggestRepresentativesInputSchema = z.object({
  taxSpending: z
    .array(z.object({
      category: z.string(),
      percentage: z.number(),
    }))
    .describe('The tax spending breakdown, including category and percentage.'),
});
export type SuggestRepresentativesInput = z.infer<typeof SuggestRepresentativesInputSchema>;

const SuggestRepresentativesOutputSchema = z.object({
  shouldSuggestRepresentatives: z
    .boolean()
    .describe('Whether or not the user should be suggested to contact representatives.'),
  reason: z
    .string()
    .describe('The reason for suggesting or not suggesting to contact representatives.'),
  suggestedCategories: z
    .array(z.string())
    .describe('The spending categories for which contacting representatives is most relevant.'),
});
export type SuggestRepresentativesOutput = z.infer<typeof SuggestRepresentativesOutputSchema>;

export async function suggestRepresentatives(input: SuggestRepresentativesInput): Promise<SuggestRepresentativesOutput> {
  return suggestRepresentativesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRepresentativesPrompt',
  input: {schema: SuggestRepresentativesInputSchema},
  output: {schema: SuggestRepresentativesOutputSchema},
  prompt: `You are an AI assistant helping users understand their tax spending and connect with relevant representatives.

  Based on the user's tax spending breakdown, determine whether they should be suggested to contact their representatives. Provide a reason for your determination.

  Tax Spending Breakdown:
  {{#each taxSpending}}
  - Category: {{this.category}}, Percentage: {{this.percentage}}%
  {{/each}}

  Consider these factors when deciding whether to suggest contacting representatives:
  - Significant spending in a particular category
  - User's potential interest in influencing policy changes related to specific categories

  If you suggest contacting representatives, identify the specific spending categories for which contacting representatives would be most relevant.

  Return your answer in JSON format.
`,
});

const suggestRepresentativesFlow = ai.defineFlow(
  {
    name: 'suggestRepresentativesFlow',
    inputSchema: SuggestRepresentativesInputSchema,
    outputSchema: SuggestRepresentativesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
