/**
 * @fileOverview Contains the core logic for generating representative email content.
 * Separates generation logic from data fetching and templates.
 */

import type { SelectedItem } from '@/services/tax-spending';
import {
  SUBJECT, OPENING, LIST_INTRO, ACTION_PHRASES, SPECIFIC_RATIONALES,
  BUDGET_DEBT, CALL_TO_ACTION, RATIONALE_CONNECTORS, ITEM_OPENERS,
  CATEGORY_INTRO_PHRASES, INTRA_PARAGRAPH_CONNECTORS, SALUTATIONS,
  Tone, FundingActionRationale
} from './templates';
import {
  toneBucket, randomChoice, cleanItemDescription, getFundingActionRationale,
  capitalizeFirstLetter, punctuateSentence, cleanupText
} from './utils';

/**
 * Generates the core sentence block about a specific item, combining action and rationale.
 * Uses refined logic for better flow and natural language.
 */
function generateItemSentence(item: SelectedItem, tone: Tone): string {
    const fundingLevel = item.fundingLevel;
    const actionRationaleType = getFundingActionRationale(fundingLevel);
    const cleanedDescription = cleanItemDescription(item.description);

    // 1. Get the base action phrase + variability
    // Start with a tone-specific phrase and add potential variations
    let baseActionPhrase = randomChoice([
        ACTION_PHRASES[fundingLevel][tone], // Original tone-specific
        // Add some less common, slightly varied alternatives based on level
        ...(fundingLevel === -2 ? ["requires drastic cuts or elimination."] : []),
        ...(fundingLevel === -1 ? ["should be significantly scaled back."] : []),
        ...(fundingLevel === 0 ? ["funding could remain, but only with much stricter efficiency measures."] : []),
        ...(fundingLevel === 1 ? ["deserves reliable, perhaps increased, funding."] : []),
        ...(fundingLevel === 2 ? ["must receive a substantial boost in resources."] : []),
    ]);

    // 2. Get multiple rationale options, falling back to defaults.
    const rationaleKey = `${item.id}_${actionRationaleType}`;
    const rationaleOptions = SPECIFIC_RATIONALES[rationaleKey] || SPECIFIC_RATIONALES[`default_${actionRationaleType}`] || [];

    // 3. Select a specific rationale.
    let specificRationale = randomChoice(rationaleOptions);

    // 4. Construct the sentence - vary structure slightly for flow.
    // Choose sentence opener based on funding action type
    const openerOptions = ITEM_OPENERS[actionRationaleType] || ITEM_OPENERS.review; // Fallback to 'review' openers
    let sentenceOpener = randomChoice(openerOptions).replace("{ITEM}", cleanedDescription);

    // Combine opener, action, and rationale with appropriate connectors
    let sentence = `${sentenceOpener} ${baseActionPhrase}`;

    if (specificRationale) {
        const connectors = tone < 2 ? RATIONALE_CONNECTORS.polite : RATIONALE_CONNECTORS.firm;
        const connector = randomChoice(connectors);

        // Ensure rationale starts lowercase if following comma/semicolon, uppercase if following period.
        let formattedRationale = specificRationale;
        if (connector.startsWith('.') || connector.startsWith('!') || connector.startsWith('?')) {
            formattedRationale = capitalizeFirstLetter(specificRationale);
        } else {
            formattedRationale = specificRationale.charAt(0).toLowerCase() + specificRationale.slice(1);
        }

        // Add connector and rationale
        sentence += `${connector} ${formattedRationale}`;
    }

    // Ensure the sentence ends properly.
    return punctuateSentence(sentence);
}

/**
 * Generates a draft email to representatives based on selected spending items and customization options.
 * Groups items by category into paragraphs for better readability.
 */
export function generateRepresentativeEmailContent(
    selectedItems: SelectedItem[],
    aggressiveness: number,
    userName: string,
    userLocation: string,
    balanceBudgetPreference: boolean
): { subject: string; body: string } {

    const tone = toneBucket(aggressiveness);
    const subject = SUBJECT[tone];
    const opening = OPENING[tone](userLocation || '[Your City, ST Zip]');

    // Group items by category
    const itemsByCategory: { [category: string]: SelectedItem[] } = {};
    selectedItems.forEach(item => {
        const categoryKey = item.category || 'Other Areas'; // Group uncategorized items
        if (!itemsByCategory[categoryKey]) {
            itemsByCategory[categoryKey] = [];
        }
        itemsByCategory[categoryKey].push(item);
    });

    let categorizedParagraphs: string[] = [];

    if (Object.keys(itemsByCategory).length > 0) {
        categorizedParagraphs.push(randomChoice(LIST_INTRO[tone])); // Add overall intro to the item list

        const categories = Object.keys(itemsByCategory);
        categories.forEach((category) => {
            // Select category intro phrase
            const introOptions = CATEGORY_INTRO_PHRASES[category] || CATEGORY_INTRO_PHRASES.default;
            let categoryParagraph = randomChoice(introOptions).replace('{CATEGORY}', category) + "\n"; // Start paragraph with category intro

            const itemSentences = itemsByCategory[category].map(item => generateItemSentence(item, tone));

            // Combine sentences within the category paragraph
            itemSentences.forEach((sentence, index) => {
                categoryParagraph += capitalizeFirstLetter(sentence); // Ensure each sentence starts capitalized
                // Add a connector *between* sentences within the same category for flow
                if (index < itemSentences.length - 1) {
                    categoryParagraph += randomChoice(INTRA_PARAGRAPH_CONNECTORS);
                } else {
                     categoryParagraph += ' '; // Add space before next paragraph potentially
                }
            });
            categorizedParagraphs.push(categoryParagraph.trim()); // Add the completed category paragraph
        });
    }

    // Join category paragraphs with double newlines
    const itemBlock = categorizedParagraphs.join('\n\n');

    // Add the budget/debt paragraph if selected
    const budgetParagraph = balanceBudgetPreference ? `\n\n${BUDGET_DEBT[tone]}` : "";

    // Construct the Call to Action - adjust based on selections
    let callToActionText = CALL_TO_ACTION[tone]; // Start with the default for the tone
    if (selectedItems.length === 0 && balanceBudgetPreference) {
        // If ONLY budget preference is checked, use a tailored CTA focused solely on debt/budget
        callToActionText = {
            0: "Could you please share your specific plans for promoting greater fiscal responsibility and addressing the national debt? Thank you for your attention to this vital matter.",
            1: "I strongly urge you to outline the concrete steps you will take towards achieving fiscal sustainability and reducing the national debt. Accountability on this issue is paramount.",
            2: "I expect a detailed and actionable plan from your office describing how you will aggressively curb the national debt and champion fiscal discipline. Please respond promptly.",
            3: "I demand immediate and specific proposals from you on tackling the national debt and restoring fiscal responsibility. Vague promises are insufficient; concrete action is required."
        }[tone];
    } else if (selectedItems.length > 0 && !balanceBudgetPreference) {
        // If items selected but NOT budget preference, remove debt part from default CTA
        callToActionText = callToActionText.replace(/ and (curb|tackle|aggressively tackle) the( national)? debt/gi, '');
        callToActionText = callToActionText.replace(/ and put our nation on a sustainable fiscal path/gi, '');
    } else if (selectedItems.length === 0 && !balanceBudgetPreference) {
        // Fallback if somehow called with no selections at all
        callToActionText = "I would appreciate hearing your general thoughts on the current federal budget priorities.";
    }
    const callToAction = `\n\n${callToActionText}`;

    // Standard closing
    const salutation = `\n\n${randomChoice(SALUTATIONS)}`;
    const signature = `\n\n${userName || '[Your Name]'}\n${userLocation || '[Your City, State, Zip Code]'}`;

    // Assemble the full body
    let body = opening + (itemBlock ? '\n\n' + itemBlock : '') + budgetParagraph + callToAction + salutation + signature;

    // Final cleanup
    body = cleanupText(body);

    return { subject, body };
}
