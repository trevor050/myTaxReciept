
/**
 * @fileOverview Contains the core logic for generating representative email content.
 * Organizes arguments into paragraphs by category for better readability and flow.
 */

import type { SelectedItem as UserSelectedItem, Tone, FundingActionRationale } from './types';
import {
  SUBJECT, OPENING, LIST_INTRO,
  BUDGET_DEBT, CALL_TO_ACTION, RATIONALE_CONNECTORS, ITEM_OPENERS,
  CATEGORY_INTRO_PHRASES, INTRA_PARAGRAPH_CONNECTORS, SALUTATIONS, ACTION_PHRASES, // Use ACTION_PHRASES
  SPECIFIC_RATIONALES
} from './templates';
import {
  toneBucket, randomChoice, cleanItemDescription, getFundingActionRationale,
  capitalizeFirstLetter, punctuateSentence, cleanupText
} from './utils';

export { SUBJECT };

/**
 * Generates the core sentence block about a specific item, combining action and rationale.
 * Ensures punctuation and capitalization. Simplified for conciseness.
 */
function generateItemSentence(item: UserSelectedItem, tone: Tone, isFirstItemInCategory: boolean): string {
    const fundingLevel = item.fundingLevel;
    const actionRationaleType = getFundingActionRationale(fundingLevel);
    const cleanedDescription = cleanItemDescription(item.description);

    let baseActionPhrase = ACTION_PHRASES[fundingLevel]?.[tone];
    if (!baseActionPhrase) { // Fallback if tone-specific phrase is missing
        baseActionPhrase = ACTION_PHRASES[fundingLevel]?.[0] || "its funding level should be reviewed.";
    }
    if (typeof baseActionPhrase === 'object' && Array.isArray(baseActionPhrase)) { // Should not happen with new structure but good fallback
        baseActionPhrase = randomChoice(baseActionPhrase as string[]);
    }


    const rationaleKey = `${item.id}_${actionRationaleType}`;
    let specificRationaleOptions = SPECIFIC_RATIONALES[rationaleKey] || SPECIFIC_RATIONALES[`default_${actionRationaleType}`];

    if (!specificRationaleOptions || specificRationaleOptions.length === 0) {
        specificRationaleOptions = SPECIFIC_RATIONALES[`default_${actionRationaleType}`] || [];
    }
    const specificRationale = specificRationaleOptions.length > 0 ? randomChoice(specificRationaleOptions).trim() : '';

    let sentenceOpener = "";
    if (isFirstItemInCategory) {
        sentenceOpener = randomChoice(ITEM_OPENERS[actionRationaleType] || ITEM_OPENERS.review).replace("{ITEM}", cleanedDescription);
        sentenceOpener = capitalizeFirstLetter(sentenceOpener.trim().replace(/[.,;:!?]$/, ''));
    } else {
        // For subsequent items, be more direct or use a connector
        sentenceOpener = cleanedDescription; // Start with the item itself
    }


    let sentence = `${sentenceOpener} ${baseActionPhrase}`;

    if (specificRationale) {
        const connectorsForTone = RATIONALE_CONNECTORS[tone] || RATIONALE_CONNECTORS[0];
        let connector = randomChoice(connectorsForTone);

        // Simplify connector logic
        if (sentence.match(/[.!?]$/)) { // Ends with strong punctuation
            connector = capitalizeFirstLetter(connector.startsWith('.') ? connector.slice(1).trim() : connector.trim());
            sentence += ` ${connector}`;
        } else { // Does not end with strong punctuation
            connector = connector.startsWith(',') || connector.startsWith(';') ? ` ${connector.trim()}` : `, ${connector.trim()}`;
            sentence += connector;
        }
        sentence += ` ${specificRationale.charAt(0).toLowerCase() + specificRationale.slice(1)}`; // Lowercase rationale if following connector
    }

    return punctuateSentence(sentence.trim());
}


/**
 * Generates a draft email to representatives, grouping arguments by category.
 */
export function generateRepresentativeEmailContent(
    selectedItemsWithCategory: Array<UserSelectedItem & { category: string }>,
    aggressiveness: number,
    userName: string,
    userLocation: string,
    balanceBudgetPreference: boolean
): { subject: string; body: string } {

    const tone = toneBucket(aggressiveness);
    const subjectText = randomChoice(SUBJECT[tone] || SUBJECT[0]);
    const opening = OPENING[tone] ? OPENING[tone](userLocation || '[Your Area]') : OPENING[0](userLocation || '[Your Area]');

    const itemsByCategory: { [category: string]: UserSelectedItem[] } = {};
    selectedItemsWithCategory.forEach(item => {
        const categoryKey = item.category || 'Uncategorized'; // Ensure a fallback category name
        if (!itemsByCategory[categoryKey]) {
            itemsByCategory[categoryKey] = [];
        }
        itemsByCategory[categoryKey].push({
            id: item.id,
            description: item.description,
            fundingLevel: item.fundingLevel,
        });
    });

    let categoryParagraphBlocks: string[] = [];

    const sortedCategories = Object.keys(itemsByCategory).sort((a, b) => {
        const order: Record<string, number> = {
            "War and Weapons": 1, "Health": 2, "Interest on Debt": 3, "Veterans": 4,
            "Education": 5, "Housing and Community": 6, "Food and Agriculture": 7,
            "Unemployment and Labor": 8, "Government": 9, "Energy and Environment": 10,
            "International Affairs": 11, "Law Enforcement": 12, "Transportation": 13, "Science": 14, "Uncategorized": 15
        };
        return (order[a] || 99) - (order[b] || 99);
    });

    if (sortedCategories.length > 0) {
        categoryParagraphBlocks.push(randomChoice(LIST_INTRO[tone] || LIST_INTRO[0]));

        sortedCategories.forEach((category) => {
            const introOptions = CATEGORY_INTRO_PHRASES[category] || CATEGORY_INTRO_PHRASES.default;
            let categoryIntro = randomChoice(introOptions || ["On {CATEGORY}:"]);
            categoryIntro = capitalizeFirstLetter(categoryIntro.replace('{CATEGORY}', category).replace(/[:.,;]?$/, ':'));

            const itemSentences = itemsByCategory[category].map((item, index) => generateItemSentence(item, tone, index === 0));

            let paragraphContent = categoryIntro;
            itemSentences.forEach((sentence, index) => {
                if (index === 0) {
                    paragraphContent += ` ${sentence}`;
                } else {
                     // More concise connection for subsequent items within a category
                    paragraphContent += ` ${randomChoice(INTRA_PARAGRAPH_CONNECTORS)} ${sentence.charAt(0).toLowerCase() + sentence.slice(1)}`;
                }
            });
            categoryParagraphBlocks.push(paragraphContent);
        });
    }

    const itemBlock = categoryParagraphBlocks.join('\n\n');
    const budgetParagraph = balanceBudgetPreference ? `\n\n${BUDGET_DEBT[tone] || BUDGET_DEBT[0]}` : "";

    let callToActionText: string;
     if (selectedItemsWithCategory.length === 0 && balanceBudgetPreference) {
          callToActionText = {
              0: "Please share your plans for promoting fiscal responsibility and addressing national debt.",
              1: "I urge you to outline steps towards fiscal sustainability and reducing national debt.",
              2: "I expect a detailed plan on curbing national debt and championing fiscal discipline.",
              3: "I demand immediate proposals on tackling national debt and restoring fiscal responsibility."
          }[tone] || CALL_TO_ACTION[0];
     } else if (selectedItemsWithCategory.length === 0 && !balanceBudgetPreference) {
          callToActionText = "I would appreciate your thoughts on current federal budget priorities and responsible stewardship of taxpayer funds.";
     } else {
         callToActionText = CALL_TO_ACTION[tone] || CALL_TO_ACTION[0];
     }

    const callToAction = `\n\n${callToActionText}`;
    const salutation = `\n\n${randomChoice(SALUTATIONS)}`;
    const signature = `\n\n${userName || '[Your Name]'}\n${userLocation || '[Your City, State, Zip Code]'}`;

    let body = opening + (itemBlock ? '\n\n' + itemBlock : '') + budgetParagraph + callToAction + salutation + signature;

    body = cleanupText(body);

    return { subject: subjectText, body };
}
