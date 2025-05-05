
'use server';

/**
 * @fileOverview This file defines a Genkit flow for identifying the top tax spending categories.
 *
 * - suggestRepresentatives - A function that identifies top spending categories.
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

// Simplified Output Schema - Focus on identifying key areas
const SuggestRepresentativesOutputSchema = z.object({
  topSpendingCategories: z
    .array(z.string())
    .describe('The main spending categories representing the largest portions of the tax breakdown (typically top 2-3).'),
  reason: z
    .string()
    .describe('A brief explanation of why these categories were identified (e.g., based on highest percentages).'),
});
export type SuggestRepresentativesOutput = z.infer<typeof SuggestRepresentativesOutputSchema>;

export async function suggestRepresentatives(input: SuggestRepresentativesInput): Promise<SuggestRepresentativesOutput> {
  return suggestRepresentativesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRepresentativesPrompt',
  input: {schema: SuggestRepresentativesInputSchema},
  output: {schema: SuggestRepresentativesOutputSchema},
  // Updated prompt to simply identify top 2-3 categories by percentage
  prompt: `You are an AI assistant analyzing tax spending data.

  Based on the user's detailed tax spending breakdown provided below, identify the top 2 or 3 main spending categories that account for the largest percentages of the total spending.

  Detailed Tax Spending Breakdown:
  {{#each taxSpending}}
  - Category: {{this.category}}, Percentage: {{this.percentage}}%
  {{/each}}

  List only the names of these main categories in the 'topSpendingCategories' array.
  Provide a very brief, neutral reason like "Analysis based on highest spending areas." in the 'reason' field.

  Return your answer strictly in JSON format matching the output schema.
`,
});

const suggestRepresentativesFlow = ai.defineFlow(
  {
    name: 'suggestRepresentativesFlow',
    inputSchema: SuggestRepresentativesInputSchema,
    outputSchema: SuggestRepresentativesOutputSchema,
  },
  async input => {
    // Manual fallback/simplification if AI needed:
    // 1. Sort input.taxSpending by percentage descending.
    // 2. Take the top 2-3 categories.
    // 3. Return the simplified output structure.
    // Example manual implementation (uncomment/adapt if removing AI):
    /*
    const sortedSpending = [...input.taxSpending].sort((a, b) => b.percentage - a.percentage);
    const topCategories = sortedSpending.slice(0, 3).map(item => item.category);
    return {
        topSpendingCategories: topCategories,
        reason: "Analysis based on highest spending percentages.",
    };
    */

    // Continue using AI for now, but with the simplified prompt/output
    const {output} = await prompt(input);
    // Add defensive check for output existence
    if (!output) {
        console.error("AI prompt failed to return an output. Using manual fallback.");
        // Implement manual fallback logic here as described above
        const sortedSpending = [...input.taxSpending].sort((a, b) => b.percentage - a.percentage);
        const topCategories = sortedSpending.slice(0, 3).map(item => item.category);
        return {
            topSpendingCategories: topCategories,
            reason: "Analysis based on highest spending percentages (fallback).",
        };
    }
    return output;
  }
);

