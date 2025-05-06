/**
 * @fileOverview Contains the core logic for generating representative email content.
 * Organizes arguments into paragraphs by category for better readability and flow.
 */

import type { SelectedItem, Tone, FundingActionRationale } from './types';
import {
  SUBJECT, OPENING, LIST_INTRO, ACTION, SPECIFIC_RATIONALES,
  BUDGET_DEBT, CALL_TO_ACTION, RATIONALE_CONNECTORS, ITEM_OPENERS,
  CATEGORY_INTRO_PHRASES, INTRA_PARAGRAPH_CONNECTORS, SALUTATIONS
} from './templates';
import {
  toneBucket, randomChoice, cleanItemDescription, getFundingActionRationale,
  capitalizeFirstLetter, punctuateSentence, cleanupText
} from './utils';


/**
 * Generates the core sentence block about a specific item, combining action and rationale.
 * Ensures punctuation and capitalization.
 */
function generateItemSentence(item: SelectedItem, tone: Tone): string {
    const fundingLevel = item.fundingLevel;
    const actionRationaleType = getFundingActionRationale(fundingLevel);
    const cleanedDescription = cleanItemDescription(item.description); // Clean description first

    // 1. Get base action phrase + potential alternative
    let baseActionPhrase = ACTION[fundingLevel][tone];
    // Example alternative selection (simple randomization for now)
    // You could add more sophisticated alternative selection based on context if needed
    // if (Math.random() > 0.7) { // Example: 30% chance to use a slightly different phrase if available
    //    // Find/define alternatives in templates.ts if desired
    // }

    // 2. Get rationale options
    const rationaleKey = `${item.id}_${actionRationaleType}`;
    const rationaleOptions = SPECIFIC_RATIONALES[rationaleKey] || SPECIFIC_RATIONALES[`default_${actionRationaleType}`] || [];
    let specificRationale = rationaleOptions.length > 0 ? randomChoice(rationaleOptions).trim() : '';

    // 3. Construct the sentence
    let sentenceOpener = randomChoice(ITEM_OPENERS[actionRationaleType] || ITEM_OPENERS.review).replace("{ITEM}", cleanedDescription);
    sentenceOpener = capitalizeFirstLetter(sentenceOpener.trim().replace(/[.,;:!?]$/, '')); // Ensure capitalization, remove trailing punctuation

    // Combine opener and action phrase
    let sentence = `${sentenceOpener} ${baseActionPhrase}`;

    // Add rationale if available
    if (specificRationale) {
        const connectors = RATIONALE_CONNECTORS[tone]; // Use tone-specific connectors
        let connector = randomChoice(connectors);
        let formattedRationale = specificRationale.trim().replace(/[.;:!?]$/, ''); // Clean rationale

        // Logic to ensure the connector and rationale flow grammatically
        const sentenceEndsPunct = sentence.match(/[.!?]$/);
        const connectorStartsSentence = connector.match(/^[A-Z]/) || connector.startsWith('.');

        if (sentenceEndsPunct) {
            // If sentence ended, connector MUST start a new sentence/thought
            if (!connectorStartsSentence) {
                connector = randomChoice(connectors.filter(c => c.match(/^[A-Z]/) || c.startsWith('.'))) || ". Specifically,";
            }
             // Clean up connector punctuation (remove leading ., ensure capitalization)
             if (connector.startsWith('.')) connector = capitalizeFirstLetter(connector.slice(1).trim());
             else connector = capitalizeFirstLetter(connector);
             sentence += ` ${connector}`; // Add space before new sentence part
             formattedRationale = capitalizeFirstLetter(formattedRationale); // Rationale starts new sentence part

        } else {
            // If sentence continues, connector should link clauses
            if (connectorStartsSentence) {
                connector = randomChoice(connectors.filter(c => !c.match(/^[A-Z]/) && !c.startsWith('.'))) || "; specifically,";
            }
            // Ensure appropriate punctuation before connector
            if (!connector.startsWith(',') && !connector.startsWith(';')) connector = `, ${connector}`;
            else connector = ` ${connector}`;
            sentence += connector;
            formattedRationale = formattedRationale.charAt(0).toLowerCase() + formattedRationale.slice(1); // Rationale continues sentence
        }
        sentence += ` ${formattedRationale}`;
    }

    return punctuateSentence(sentence); // Ensure final sentence ends correctly
}


/**
 * Generates a draft email to representatives, grouping arguments by category.
 */
export function generateRepresentativeEmailContent(
    selectedItemsWithCategory: Array<SelectedItem & { category: string }>, // Expect items with category
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
    selectedItemsWithCategory.forEach(item => {
        const categoryKey = item.category || 'Other Specific Programs'; // Use assigned category
        if (!itemsByCategory[categoryKey]) {
            itemsByCategory[categoryKey] = [];
        }
        // Store only the core SelectedItem fields needed for sentence generation
        itemsByCategory[categoryKey].push({
            id: item.id,
            description: item.description,
            fundingLevel: item.fundingLevel
        });
    });

    let categoryParagraphs: string[] = [];

    // Sort categories for consistent order (optional, but nice)
    const sortedCategories = Object.keys(itemsByCategory).sort((a, b) => {
         // Prioritize certain categories if needed, e.g., War, Health
        const order: Record<string, number> = { "War and Weapons": 1, "Health": 2, "Interest on Debt": 3 };
        return (order[a] || 99) - (order[b] || 99);
    });


    if (sortedCategories.length > 0) {
        // Add overall list intro only if items are selected
        categoryParagraphs.push(randomChoice(LIST_INTRO[tone])); // Use array version

        sortedCategories.forEach((category) => {
            const introOptions = CATEGORY_INTRO_PHRASES[category] || CATEGORY_INTRO_PHRASES.default;
            let categoryIntro = randomChoice(introOptions);
            categoryIntro = categoryIntro.replace('{CATEGORY}', category).replace(/[:.,;]?$/, ':'); // Format intro

            let categorySentences: string[] = [];
            categorySentences.push(capitalizeFirstLetter(categoryIntro)); // Start paragraph with category intro

            const itemSentences = itemsByCategory[category].map(item => generateItemSentence(item, tone));

            // Combine item sentences within the category paragraph
            itemSentences.forEach((sentence, index) => {
                 // Use varied intra-paragraph connectors ONLY between item sentences
                 if (index > 0) {
                      const connector = randomChoice(INTRA_PARAGRAPH_CONNECTORS);
                      // Ensure connector fits grammatically (e.g., handling clause starters)
                      if (connector.endsWith("that") || connector.endsWith("as")) {
                          // Connector starts a clause, ensure next sentence starts lowercase
                          categorySentences.push(`${connector} ${sentence.charAt(0).toLowerCase() + sentence.slice(1)}`);
                      } else {
                          // Connector starts a new sentence/thought
                          categorySentences.push(`${connector} ${capitalizeFirstLetter(sentence)}`);
                      }
                 } else {
                      // First item sentence follows the category intro directly
                      categorySentences.push(capitalizeFirstLetter(sentence));
                 }
            });

            categoryParagraphs.push(categorySentences.join(' ')); // Join sentences for the paragraph
        });
    }

    // Join category paragraphs with double newlines
    const itemBlock = categoryParagraphs.join('\n\n');

    // Add budget/debt paragraph if selected
    const budgetParagraph = balanceBudgetPreference ? `\n\n${BUDGET_DEBT[tone]}` : "";

    // --- Adjust Call to Action based on selections ---
    let callToActionText = CALL_TO_ACTION[tone];
    // Simplified CTA adjustment logic
     if (selectedItemsWithCategory.length === 0 && balanceBudgetPreference) {
          // Specific CTA if ONLY budget preference is checked
          callToActionText = {
              0: "Could you please share your specific plans for promoting greater fiscal responsibility and addressing the national debt? Thank you for your attention to this vital matter.",
              1: "I strongly urge you to outline the concrete steps you will take towards achieving fiscal sustainability and reducing the national debt. Accountability on this issue is paramount.",
              2: "I expect a detailed and actionable plan from your office describing how you will aggressively curb the national debt and champion fiscal discipline. Please respond promptly.",
              3: "I demand immediate and specific proposals from you on tackling the national debt and restoring fiscal responsibility. Vague promises are insufficient; concrete action is required."
          }[tone];
     } else if (selectedItemsWithCategory.length === 0 && !balanceBudgetPreference) {
          // Fallback if somehow called with no selections
          callToActionText = "I would appreciate hearing your general thoughts on the current federal budget priorities.";
     }
     // Default CTA from templates.ts handles cases with items selected (+/- budget pref implicitly)

    const callToAction = `\n\n${callToActionText}`;
    const salutation = `\n\n${randomChoice(SALUTATIONS)}`;
    const signature = `\n\n${userName || '[Your Name]'}\n${userLocation || '[Your City, State, Zip Code]'}`;

    // Assemble the full body
    let body = opening + (itemBlock ? '\n\n' + itemBlock : '') + budgetParagraph + callToAction + salutation + signature;

    // Final cleanup
    body = cleanupText(body);

    return { subject, body };
}
