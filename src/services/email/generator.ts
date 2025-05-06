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
    let baseActionPhrase = '';
    // Correctly access ACTION_PHRASES based on fundingLevel and tone
    if (ACTION_PHRASES[fundingLevel] && ACTION_PHRASES[fundingLevel][tone]) {
        const primaryAction = ACTION_PHRASES[fundingLevel][tone];
        // Add potential variations based on level (ensure these alternatives exist or handle gracefully)
        const alternatives: string[] = [];
        if (fundingLevel === -2) alternatives.push("requires drastic cuts or elimination.");
        if (fundingLevel === -1) alternatives.push("should be significantly scaled back.");
        if (fundingLevel === 0) alternatives.push("funding could remain, but only with much stricter efficiency measures.");
        if (fundingLevel === 1) alternatives.push("deserves reliable, perhaps increased, funding.");
        if (fundingLevel === 2) alternatives.push("must receive a substantial boost in resources.");

        baseActionPhrase = randomChoice([primaryAction, ...alternatives]);
    } else {
        console.error(`Missing action phrase for fundingLevel: ${fundingLevel}, tone: ${tone}`);
        // Fallback phrase if definition is missing
        baseActionPhrase = "requires careful review regarding its funding level.";
    }


    // 2. Get multiple rationale options, falling back to defaults.
    const rationaleKey = `${item.id}_${actionRationaleType}`;
    const rationaleOptions = SPECIFIC_RATIONALES[rationaleKey] || SPECIFIC_RATIONALES[`default_${actionRationaleType}`] || [];

    // 3. Select a specific rationale.
    let specificRationale = rationaleOptions.length > 0 ? randomChoice(rationaleOptions) : '';

    // 4. Construct the sentence - vary structure slightly for flow.
    const openerOptions = ITEM_OPENERS[actionRationaleType] || ITEM_OPENERS.review; // Fallback to 'review' openers
    let sentenceOpener = randomChoice(openerOptions).replace("{ITEM}", cleanedDescription);

    // Combine opener and action phrase - ensure proper spacing and capitalization
    // Ensure sentenceOpener is capitalized and doesn't end with punctuation yet
    sentenceOpener = capitalizeFirstLetter(sentenceOpener.trim().replace(/[.,;:!?]$/, ''));
    let sentence = `${sentenceOpener} ${baseActionPhrase}`;

    // Add rationale if available
    if (specificRationale) {
        const connectors = tone < 2 ? RATIONALE_CONNECTORS.polite : RATIONALE_CONNECTORS.firm;
        const connector = randomChoice(connectors);

        // Format rationale: ensure it starts lowercase unless following a strong punctuation mark from the connector.
        let formattedRationale = specificRationale.trim();
        if (connector.match(/[.!?]$/)) {
            formattedRationale = capitalizeFirstLetter(formattedRationale);
        } else {
             // Ensure lowercase start if it's not the beginning of a sentence segment
            formattedRationale = formattedRationale.charAt(0).toLowerCase() + formattedRationale.slice(1);
        }

        sentence += `${connector} ${formattedRationale}`;
    }

    // Ensure the final sentence ends properly.
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
        // Use item.category passed from the selection, fallback if missing
        const categoryKey = item.category || 'Other Specific Programs';
        if (!itemsByCategory[categoryKey]) {
            itemsByCategory[categoryKey] = [];
        }
        itemsByCategory[categoryKey].push(item);
    });

    let categorizedParagraphs: string[] = [];

    if (Object.keys(itemsByCategory).length > 0) {
        // Add overall intro only if there are items selected
        categorizedParagraphs.push(randomChoice(LIST_INTRO[tone]));

        const categories = Object.keys(itemsByCategory).sort(); // Sort categories for consistent order
        categories.forEach((category) => {
            // Select category intro phrase, ensuring category name isn't repeated if already in the phrase
            const introOptions = CATEGORY_INTRO_PHRASES[category] || CATEGORY_INTRO_PHRASES.default;
            let categoryIntro = randomChoice(introOptions);
            if (!categoryIntro.includes('{CATEGORY}')) {
                 // If the intro phrase doesn't include the placeholder, add the category name explicitly
                 categoryIntro = `${categoryIntro} the category of ${category}:`;
            } else {
                categoryIntro = categoryIntro.replace('{CATEGORY}', category);
            }
            // Ensure intro ends with a colon or appropriate punctuation
            categoryIntro = categoryIntro.trim().replace(/[:.,;]?$/, ':');

            let categoryParagraph = categoryIntro; // Start paragraph with category intro

            const itemSentences = itemsByCategory[category].map(item => generateItemSentence(item, tone));

            // Combine sentences within the category paragraph
            itemSentences.forEach((sentence, index) => {
                 // Ensure each generated sentence starts capitalized (should be handled by generateItemSentence, but double-check)
                 // Add sentence with appropriate leading space or newline/indentation
                categoryParagraph += (index === 0 ? ' ' : ` ${randomChoice(INTRA_PARAGRAPH_CONNECTORS)} `) + capitalizeFirstLetter(sentence);
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
        callToActionText = callToActionText.replace(/ Fiscal discipline must be central to every spending decision Congress makes, starting now./gi, ''); // More specific removal
        callToActionText = callToActionText.replace(/ A concrete, aggressive debt-reduction plan is not optional—it is an absolute necessity./gi, ''); // More specific removal
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

    