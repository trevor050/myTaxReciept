
'use server';
/**
 * @fileOverview Generates prompts for AI models to draft emails based on user input.
 */

import type { SelectedItem as UserSelectedItem } from '@/services/tax-spending';
import { mapSliderToFundingLevel } from '@/lib/funding-utils';

// Helper to describe funding levels textually
const getFundingLevelDescription = (sliderValue: number): string => {
    const level = mapSliderToFundingLevel(sliderValue);
    switch (level) {
        case -2: return "Slash Heavily (e.g., eliminate or drastically reduce funding)";
        case -1: return "Cut Significantly (e.g., make notable reductions)";
        case 0:  return "Improve Efficiency/Review (e.g., maintain funding but demand better results or oversight)";
        case 1:  return "Fund (e.g., ensure adequate or modestly increased resources)";
        case 2:  return "Fund More (e.g., substantially increase investment)";
        default: return "Review current funding";
    }
};

// Helper to describe tone textually
const getToneDescription = (aggressiveness: number): string => {
    if (aggressiveness <= 15) return "Kind/Polite";
    if (aggressiveness <= 40) return "Concerned";
    if (aggressiveness <= 75) return "Stern";
    return "Angry/Demanding";
}

export async function generateAIPrompt(
  selectedItemsWithSliderValues: { id: string; description: string; category: string; sliderValue: number }[] | ArrayLike<{ id: string; description: string; category: string; sliderValue: number }>,
  aggressiveness: number, // 0-100 slider value
  userName: string,
  userLocation: string,
  balanceBudgetPreference: boolean
): Promise<string> {
  let prompt = `You are an AI assistant helping a user draft an email to their elected representative regarding federal budget priorities. Please generate ONLY the body of the email.

The user's details are:
Name: ${userName || '[Constituent Name]'}
Location: ${userLocation || '[Constituent Location]'}

The user desires the email to have a ${getToneDescription(aggressiveness)} tone.
On a scale of 0 (most Kind/Polite) to 100 (most Angry/Demanding), the user selected an aggressiveness level of ${aggressiveness}/100.
(Scale guide: 0-15: Kind/Polite, 16-40: Concerned, 41-75: Stern, 76-100: Angry/Demanding).

The user has expressed the following concerns about specific federal spending items, grouped by category:
`;

  let finalItemsToProcess: { id: string; description: string; category: string; sliderValue: number }[];

  if (Array.isArray(selectedItemsWithSliderValues)) {
    finalItemsToProcess = selectedItemsWithSliderValues;
  } else if (selectedItemsWithSliderValues && typeof selectedItemsWithSliderValues === 'object' && typeof (selectedItemsWithSliderValues as any).length === 'number') {
    // Attempt to convert array-like object to array
    finalItemsToProcess = Array.from(selectedItemsWithSliderValues as ArrayLike<{ id: string; description: string; category: string; sliderValue: number }>);
  } else {
    console.error("generateAIPrompt: selectedItemsWithSliderValues is not iterable or is of an unexpected type", selectedItemsWithSliderValues);
    finalItemsToProcess = []; // Default to empty array to prevent crash, though this indicates a deeper issue.
  }

  const itemsByCategory: Record<string, { id: string; description: string; category: string; sliderValue: number }[]> = {};
  finalItemsToProcess.forEach(item => {
    const categoryKey = item.category || 'Other Specific Programs';
    if (!itemsByCategory[categoryKey]) {
        itemsByCategory[categoryKey] = [];
    }
    itemsByCategory[categoryKey].push(item);
  });

  const sortedCategories = Object.keys(itemsByCategory).sort();

  sortedCategories.forEach(category => {
    prompt += `\nFor the category "${category}":\n`;
    itemsByCategory[category].forEach(item => {
      prompt += `- For "${item.description}": The user wants to ${getFundingLevelDescription(item.sliderValue)}. This corresponds to a funding preference of ${item.sliderValue}/100 on our scale (where 0-10 is Slash Heavily, 11-35 is Cut Significantly, 36-65 is Improve Efficiency, 66-90 is Fund, 91-100 is Fund More).\n`;
    });
  });


  if (finalItemsToProcess.length === 0 && !balanceBudgetPreference) {
    prompt += "\nThe user has not selected any specific items for funding changes but may have general thoughts on the budget process.\n";
  }

  if (balanceBudgetPreference) {
    prompt += `\nIMPORTANT: The user also expressed a strong preference for balancing the budget and reducing the national debt. Please ensure this is a prominent theme in the email.\n`;
  }

  prompt += `\nPlease craft an email body reflecting these preferences.
Start with a suitable opening for the specified tone.
Clearly state the concerns regarding each item, grouped by category if multiple items exist in a category.
Incorporate the budget/debt preference if selected.
Conclude with a respectful call to action suitable for the tone, and a standard salutation.
The email should sound like it's coming from a concerned constituent, not an AI.
Generate only the email body. Do not include a subject line.
`;

  return prompt;
}

// This function is called from EmailCustomizationModal to prepare the data for generateAIPrompt
export async function prepareItemsForAIPrompt(
    initialSelectedItems: Map<string, UserSelectedItem>, // Original selections with category
    itemFundingLevels: Map<string, number> // Map of item.id to sliderValue (0-100)
): Promise<{ id: string; description: string; category: string; sliderValue: number }[]> {
    const itemsForPrompt: { id: string; description: string; category: string; sliderValue: number }[] = [];
    for (const [id, sliderValue] of itemFundingLevels.entries()) {
        const originalItem = initialSelectedItems.get(id);
        if (originalItem) {
            itemsForPrompt.push({
                id: originalItem.id,
                description: originalItem.description,
                category: originalItem.category,
                sliderValue: sliderValue,
            });
        }
    }
    return itemsForPrompt;
}
