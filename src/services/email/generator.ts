
/**
 * @fileOverview Contains the core logic for generating representative email content.
 * Organizes arguments into paragraphs by category for better readability and flow.
 */

import type { SelectedItem as UserSelectedItem, Tone } from './types';
import {
  SUBJECT, OPENING, LIST_INTRO,
  BUDGET_DEBT, CALL_TO_ACTION, RATIONALE_CONNECTORS, ITEM_OPENERS,
  CATEGORY_INTRO_PHRASES, INTRA_PARAGRAPH_CONNECTORS, SALUTATIONS, ACTION, // Corrected from ACTION_PHRASES
  SPECIFIC_RATIONALES
} from './templates';
import {
  toneBucket, randomChoice, cleanItemDescription, getFundingActionRationale,
  capitalizeFirstLetter, punctuateSentence, cleanupText
} from './utils';


/**
 * Generates the core sentence block about a specific item, combining action and rationale.
 * Ensures punctuation and capitalization.
 */
function generateItemSentence(item: UserSelectedItem, tone: Tone): string {
    const fundingLevel = item.fundingLevel;
    const actionRationaleType = getFundingActionRationale(fundingLevel);
    const cleanedDescription = cleanItemDescription(item.description);

    // Default base action phrase, will be overridden if specific rationale is not strong enough or item is generic
    let baseActionPhrase = ACTION[fundingLevel]?.[tone] || "funding level should be reviewed.";
    if (typeof baseActionPhrase === 'object' && Array.isArray(baseActionPhrase)) { // In case ACTION[fundingLevel][tone] returns an array
        baseActionPhrase = randomChoice(baseActionPhrase as string[]);
    }


    const rationaleKey = `${item.id}_${actionRationaleType}`;
    let specificRationaleOptions = SPECIFIC_RATIONALES[rationaleKey] || SPECIFIC_RATIONALES[`default_${actionRationaleType}`];

    // If specific rationales are empty, fall back to a more generic default based on action type
    if (!specificRationaleOptions || specificRationaleOptions.length === 0) {
        specificRationaleOptions = SPECIFIC_RATIONALES[`default_${actionRationaleType}`] || [];
    }

    let specificRationale = specificRationaleOptions.length > 0 ? randomChoice(specificRationaleOptions).trim() : '';

    // Ensure sentence opener is always a string
    let sentenceOpenerCandidates = ITEM_OPENERS[actionRationaleType] || ITEM_OPENERS.review;
    if (!Array.isArray(sentenceOpenerCandidates)) {
        sentenceOpenerCandidates = [String(sentenceOpenerCandidates)]; // Ensure it's an array
    }
    let sentenceOpener = randomChoice(sentenceOpenerCandidates).replace("{ITEM}", cleanedDescription);
    sentenceOpener = capitalizeFirstLetter(sentenceOpener.trim().replace(/[.,;:!?]$/, ''));


    let sentence = `${sentenceOpener} ${baseActionPhrase}`;

    if (specificRationale) {
        // Ensure connectors are available for the tone
        const connectorsForTone = RATIONALE_CONNECTORS[tone];
        if (!connectorsForTone || connectorsForTone.length === 0) {
            // Fallback connector if tone-specific ones are missing
            sentence += `. ${capitalizeFirstLetter(specificRationale.trim().replace(/[.;:!?]$/, ''))}`;
        } else {
            let connector = randomChoice(connectorsForTone);
            let formattedRationale = specificRationale.trim().replace(/[.;:!?]$/, '');

            const sentenceEndsPunct = sentence.match(/[.!?]$/);
            const connectorStartsSentence = connector.match(/^[A-Z]/) || connector.startsWith('.');

            if (sentenceEndsPunct) {
                if (!connectorStartsSentence) {
                    // Try to find a sentence-starting connector
                    const sentenceStartingConnectors = connectorsForTone.filter(c => c.match(/^[A-Z]/) || c.startsWith('.'));
                    connector = randomChoice(sentenceStartingConnectors) || ". Specifically,";
                }
                if (connector.startsWith('.')) connector = capitalizeFirstLetter(connector.slice(1).trim());
                else connector = capitalizeFirstLetter(connector);
                sentence += ` ${connector}`;
                formattedRationale = capitalizeFirstLetter(formattedRationale);
            } else {
                if (connectorStartsSentence) {
                    // Try to find a clause-connecting connector
                    const clauseConnectors = connectorsForTone.filter(c => !c.match(/^[A-Z]/) && !c.startsWith('.'));
                    connector = randomChoice(clauseConnectors) || "; specifically,";
                }
                if (!connector.startsWith(',') && !connector.startsWith(';')) connector = `, ${connector}`;
                else connector = ` ${connector}`; // Ensure space before connector
                sentence += connector;
                formattedRationale = formattedRationale.charAt(0).toLowerCase() + formattedRationale.slice(1);
            }
            sentence += ` ${formattedRationale}`;
        }
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
    const subject = randomChoice(SUBJECT[tone] || SUBJECT[0]); // Fallback to polite subject
    const opening = OPENING[tone] ? OPENING[tone](userLocation || '[Your City, ST Zip]') : OPENING[0](userLocation || '[Your City, ST Zip]'); // Fallback to polite opening

    const itemsByCategory: { [category: string]: UserSelectedItem[] } = {};
    selectedItemsWithCategory.forEach(item => {
        const categoryKey = item.category || 'Other Specific Programs'; // Default category
        if (!itemsByCategory[categoryKey]) {
            itemsByCategory[categoryKey] = [];
        }
        // Ensure only necessary fields are pushed
        itemsByCategory[categoryKey].push({
            id: item.id,
            description: item.description,
            fundingLevel: item.fundingLevel,
        });
    });

    let categoryParagraphBlocks: string[] = [];

    const sortedCategories = Object.keys(itemsByCategory).sort((a, b) => {
        const order: Record<string, number> = { "War and Weapons": 1, "Health": 2, "Interest on Debt": 3, "Veterans": 4, "Education": 5 }; // Add more for desired order
        return (order[a] || 99) - (order[b] || 99);
    });

    if (sortedCategories.length > 0) {
        categoryParagraphBlocks.push(randomChoice(LIST_INTRO[tone] || LIST_INTRO[0]));

        sortedCategories.forEach((category) => {
            const introOptions = CATEGORY_INTRO_PHRASES[category] || CATEGORY_INTRO_PHRASES.default;
            let categoryIntro = randomChoice(introOptions || ["Focusing on {CATEGORY}:"]); // Fallback intro
            categoryIntro = capitalizeFirstLetter(categoryIntro.replace('{CATEGORY}', category).replace(/[:.,;]?$/, ':'));

            const itemSentences = itemsByCategory[category].map(item => generateItemSentence(item, tone));

            let currentParagraphSentences: string[] = [categoryIntro];

            itemSentences.forEach((sentence, index) => {
                 if (index > 0 && itemSentences.length > 1) { // Add connector only if more than one item sentence
                      const connector = randomChoice(INTRA_PARAGRAPH_CONNECTORS);
                      if (connector.endsWith("that") || connector.endsWith("as")) { // Simple check for clause connectors
                          currentParagraphSentences.push(`${connector} ${sentence.charAt(0).toLowerCase() + sentence.slice(1)}`);
                      } else {
                          currentParagraphSentences.push(`${connector} ${capitalizeFirstLetter(sentence)}`);
                      }
                 } else {
                      currentParagraphSentences.push(capitalizeFirstLetter(sentence));
                 }
            });
            categoryParagraphBlocks.push(currentParagraphSentences.join(' '));
        });
    }

    const itemBlock = categoryParagraphBlocks.join('\n\n');

    const budgetParagraph = balanceBudgetPreference ? `\n\n${BUDGET_DEBT[tone] || BUDGET_DEBT[0]}` : ""; // Fallback to polite budget statement

    let callToActionText: string;
     if (selectedItemsWithCategory.length === 0 && balanceBudgetPreference) {
          callToActionText = {
              0: "Could you please share your specific plans for promoting greater fiscal responsibility and addressing the national debt? Thank you for your attention to this vital matter.",
              1: "I strongly urge you to outline the concrete steps you will take towards achieving fiscal sustainability and reducing the national debt. Accountability on this issue is paramount.",
              2: "I expect a detailed and actionable plan from your office describing how you will aggressively curb the national debt and champion fiscal discipline. Please respond promptly.",
              3: "I demand immediate and specific proposals from you on tackling the national debt and restoring fiscal responsibility. Vague promises are insufficient; concrete action is required."
          }[tone] || CALL_TO_ACTION[0]; // Fallback CTA
     } else if (selectedItemsWithCategory.length === 0 && !balanceBudgetPreference) {
          callToActionText = "I would appreciate hearing your general thoughts on the current federal budget priorities and how you plan to ensure responsible stewardship of taxpayer funds.";
     } else {
         callToActionText = CALL_TO_ACTION[tone] || CALL_TO_ACTION[0]; // Fallback to polite CTA
     }

    const callToAction = `\n\n${callToActionText}`;
    const salutation = `\n\n${randomChoice(SALUTATIONS)}`;
    const signature = `\n\n${userName || '[Your Name]'}\n${userLocation || '[Your City, State, Zip Code]'}`;

    let body = opening + (itemBlock ? '\n\n' + itemBlock : '') + budgetParagraph + callToAction + salutation + signature;

    body = cleanupText(body);

    return { subject, body };
}
