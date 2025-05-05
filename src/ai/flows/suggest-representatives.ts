
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
import type {TaxSpending} from '@/services/tax-spending'; // Import the updated type

// Update input schema to match the new TaxSpending structure
const SuggestRepresentativesInputSchema = z.object({
  taxSpending: z
    .array(z.object({
      category: z.string(),
      percentage: z.number(),
       subItems: z.array(z.object({
            description: z.string(),
            amountPerDollar: z.number(),
       })).optional().describe("Optional detailed breakdown within the category"),
    }))
    .describe('The detailed tax spending breakdown, including main categories, percentages, and optional sub-items.'),
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
    .describe('The main spending categories for which contacting representatives is most relevant.'),
});
export type SuggestRepresentativesOutput = z.infer<typeof SuggestRepresentativesOutputSchema>;

export async function suggestRepresentatives(input: SuggestRepresentativesInput): Promise<SuggestRepresentativesOutput> {
  return suggestRepresentativesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRepresentativesPrompt',
  input: {schema: SuggestRepresentativesInputSchema},
  output: {schema: SuggestRepresentativesOutputSchema},
  // Updated prompt to handle the detailed structure and focus analysis
  prompt: `You are an AI assistant helping users understand their detailed tax spending and connect with relevant representatives.

  Based on the user's detailed tax spending breakdown provided below, determine if they should be suggested to contact their representatives about federal spending priorities. Provide a concise reason for your determination.

  Detailed Tax Spending Breakdown:
  {{#each taxSpending}}
  - Category: {{this.category}}, Percentage: {{this.percentage}}%
    {{#if this.subItems}}
      Sub-Items:
      {{#each this.subItems}}
      * {{this.description}}
      {{/each}}
    {{/if}}
  {{/each}}

  Focus your analysis on the main categories and their overall percentages. Consider these factors when deciding whether to suggest contacting representatives:
  - **High Spending Categories:** Are there categories representing a significant portion (e.g., >15-20%) of the total spending? High spending in areas like Defense, Health, or Interest on Debt might warrant attention.
  - **Controversial/Debated Areas:** Does the spending include categories often subject to public debate (e.g., specific military programs, foreign aid, certain social programs)?
  - **Potential for Influence:** Are there categories where citizen feedback might plausibly influence policy decisions (e.g., education funding, environmental protection, infrastructure projects)?

  While sub-item details are provided, base your primary decision on the main categories. Sub-items might add context but don't list them unless a specific sub-item is exceptionally noteworthy and directly influences the decision (which should be rare).

  If you suggest contacting representatives, identify the **main spending categories** (e.g., "War and Weapons", "Health", "Education") that are most relevant for the user to discuss with their officials based on your analysis. Keep the list of suggested categories focused (typically 1-3).

  Return your answer strictly in JSON format matching the output schema. Be concise in your reasoning.
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
    // Add defensive check for output existence
    if (!output) {
        console.error("AI prompt failed to return an output.");
        // Return a default 'do not suggest' response or throw an error
        return {
            shouldSuggestRepresentatives: false,
            reason: "Could not analyze spending data.",
            suggestedCategories: [],
        };
    }
    return output;
  }
);
