import { NextRequest, NextResponse } from 'next/server';
import type { SelectedItem as UserSelectedItem } from '@/services/tax-spending';
import { mapSliderToFundingLevel } from '@/lib/funding-utils';

// Helper to describe funding levels textually (full description)
const getFundingLevelDescriptionFull = (sliderValue: number): string => {
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

// Helper to describe funding levels textually (short description for AI prompt)
const getFundingLevelDescriptionShort = (sliderValue: number): string => {
    const level = mapSliderToFundingLevel(sliderValue);
    switch (level) {
        case -2: return "Slash Heavily";
        case -1: return "Cut Significantly";
        case 0:  return "Improve Efficiency/Review";
        case 1:  return "Fund";
        case 2:  return "Fund More";
        default: return "Review funding";
    }
};

// Helper to describe tone textually
const getToneDescription = (aggressiveness: number): string => {
    if (aggressiveness <= 15) return "Kind/Polite";
    if (aggressiveness <= 40) return "Concerned";
    if (aggressiveness <= 75) return "Stern";
    return "Angry/Demanding";
}

export async function POST(request: NextRequest) {
  try {
    const { selectedItemsWithSliderValues, aggressiveness, userName, userLocation, balanceBudgetPreference } = await request.json();

    // Basic input validation
    if (!Array.isArray(selectedItemsWithSliderValues)) {
        return NextResponse.json({ error: 'selectedItemsWithSliderValues must be an array' }, { status: 400 });
    }
    if (typeof aggressiveness !== 'number' || aggressiveness < 0 || aggressiveness > 100) {
        return NextResponse.json({ error: 'Invalid aggressiveness value' }, { status: 400 });
    }

    let prompt = `Draft an email to an elected representative about federal budget priorities.
User: ${userName || '[Constituent Name]'}, ${userLocation || '[Constituent Location]'}.
Tone: ${getToneDescription(aggressiveness)} (Aggressiveness: ${aggressiveness}/100. Scale: 0-15 Polite, 16-40 Concerned, 41-75 Stern, 76-100 Angry).

User's concerns:
`;

    const itemsByCategory: Record<string, { id: string; description: string; category: string; sliderValue: number }[]> = {};
    
    if (Array.isArray(selectedItemsWithSliderValues)) {
      selectedItemsWithSliderValues.forEach((item: { id: string; description: string; category: string; sliderValue: number }) => {
        const categoryKey = item.category || 'Other Specific Programs';
        if (!itemsByCategory[categoryKey]) {
            itemsByCategory[categoryKey] = [];
        }
        itemsByCategory[categoryKey].push(item);
      });
    } else {
      console.error("generateAIPrompt: selectedItemsWithSliderValues is not an array", selectedItemsWithSliderValues);
      // Handle as empty or throw error, depending on desired behavior. Here, we'll proceed with empty.
    }

    const sortedCategories = Object.keys(itemsByCategory).sort();

    sortedCategories.forEach(category => {
      prompt += `\nCategory: "${category}":\n`;
      itemsByCategory[category].forEach(item => {
        // Use the short description for the AI prompt
        prompt += `- Item: "${item.description}", User Stance: ${getFundingLevelDescriptionShort(item.sliderValue)} (Preference: ${item.sliderValue}/100 on 0-100 scale where 0=Slash, 50=Review, 100=Fund More).\n`;
      });
    });

    if (selectedItemsWithSliderValues.length === 0 && !balanceBudgetPreference) {
      prompt += "\nNo specific items selected. Email may focus on general budget process.\n";
    }

    if (balanceBudgetPreference) {
      prompt += `\nIMPORTANT: User wants to emphasize balancing the budget and reducing national debt.\n`;
    }

    prompt += `\nGenerate ONLY the email body. Start appropriately for the tone. Group concerns by category. Incorporate debt preference if noted. Conclude with a call to action and salutation fitting the tone. Sound like a constituent. No subject line.`;

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error('Error in generate-ai-prompt API:', error);
    return NextResponse.json({ error: 'Failed to generate AI prompt' }, { status: 500 });
  }
}

// Endpoint for preparing items for AI prompt
export async function PUT(request: NextRequest) {
  try {
    const { initialSelectedItems, itemFundingLevels } = await request.json();

    const itemsForPrompt: { id: string; description: string; category: string; sliderValue: number }[] = [];
    
    // Convert the arrays back to Maps for processing
    const selectedItemsMap = new Map(initialSelectedItems);
    const fundingLevelsMap = new Map(itemFundingLevels);
    
    for (const [id, sliderValue] of fundingLevelsMap.entries()) {
        const originalItem = selectedItemsMap.get(id);
        if (originalItem) {
            itemsForPrompt.push({
                id: originalItem.id,
                description: originalItem.description,
                category: originalItem.category,
                sliderValue: sliderValue,
            });
        }
    }

    return NextResponse.json(itemsForPrompt);
  } catch (error) {
    console.error('Error in prepare-items-for-ai-prompt API:', error);
    return NextResponse.json({ error: 'Failed to prepare items for AI prompt' }, { status: 500 });
  }
} 