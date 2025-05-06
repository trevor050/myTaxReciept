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
 * Uses refined logic for better flow and natural language. Ensures punctuation and capitalization.
 */
function generateItemSentence(item: SelectedItem, tone: Tone): string {
    const fundingLevel = item.fundingLevel;
    const actionRationaleType = getFundingActionRationale(fundingLevel);
    // Clean description BEFORE using it in opener
    const cleanedDescription = cleanItemDescription(item.description);

    // 1. Get the base action phrase + potential variation
    let baseActionPhrase = '';
    let actionAlternatives: string[] = []; // Specific alternatives based on level

    // Check if the base action phrase exists for the level and tone
    if (ACTION_PHRASES[fundingLevel]?.[tone]) {
        baseActionPhrase = ACTION_PHRASES[fundingLevel][tone];

        // Define specific alternatives for more variety (ensure these are grammatically sound)
        if (fundingLevel === -2) actionAlternatives = ["requires drastic cuts or even elimination.", "is a candidate for significant defunding."];
        if (fundingLevel === -1) actionAlternatives = ["should be markedly scaled back.", "needs substantial reduction."];
        if (fundingLevel === 0) actionAlternatives = ["could continue, but only with rigorous efficiency mandates.", "funding might remain if waste is eliminated."];
        if (fundingLevel === 1) actionAlternatives = ["deserves reliable, perhaps increased, funding.", "should be adequately supported."];
        if (fundingLevel === 2) actionAlternatives = ["must receive a substantial boost in resources.", "requires significant additional investment."];

        // Randomly choose between the base phrase and alternatives if available
        if (actionAlternatives.length > 0 && Math.random() > 0.5) { // 50% chance to use an alternative
            baseActionPhrase = randomChoice(actionAlternatives);
        }
    } else {
        console.error(`Missing action phrase for fundingLevel: ${fundingLevel}, tone: ${tone}`);
        // Fallback phrase if definition is missing - make it a complete thought
        baseActionPhrase = "its funding level requires careful review.";
    }
    // Ensure baseActionPhrase is a complete clause/sentence fragment and properly punctuated if necessary (might need trailing period removal later)
    baseActionPhrase = baseActionPhrase.trim();


    // 2. Get multiple rationale options, falling back to defaults.
    // Use cleaned description in rationale lookup if needed, though current keys don't use it.
    const rationaleKey = `${item.id}_${actionRationaleType}`;
    const rationaleOptions = SPECIFIC_RATIONALES[rationaleKey] || SPECIFIC_RATIONALES[`default_${actionRationaleType}`] || [];

    // 3. Select a specific rationale. Ensure it's a complete thought or clause.
    let specificRationale = rationaleOptions.length > 0 ? randomChoice(rationaleOptions).trim() : '';

    // 4. Construct the sentence - vary structure slightly for flow.
    const openerOptions = ITEM_OPENERS[actionRationaleType] || ITEM_OPENERS.review; // Fallback
    let sentenceOpener = randomChoice(openerOptions).replace("{ITEM}", cleanedDescription);

    // Ensure opener starts capitalized and doesn't end with punctuation prematurely
    sentenceOpener = capitalizeFirstLetter(sentenceOpener.trim().replace(/[.,;:!?]$/, ''));

    // Combine opener and action phrase carefully
    // Case 1: Action phrase is a full sentence itself (ends with .)
    if (baseActionPhrase.endsWith('.')) {
        // Opener acts as introduction
        sentenceOpener = punctuateSentence(sentenceOpener); // End opener with period if action is full sentence
    }
    // Case 2: Action phrase is a clause (doesn't end with .)
    // Concatenate directly, potentially adding a comma if needed, handled later?

    let sentence = `${sentenceOpener} ${baseActionPhrase}`;

    // Add rationale if available, ensuring connection makes sense
    if (specificRationale) {
        const connectors = tone < 2 ? RATIONALE_CONNECTORS.polite : RATIONALE_CONNECTORS.firm;
        let connector = randomChoice(connectors);

        // Ensure connector is appropriate (e.g., don't use ". My reasoning is" if sentence already ended)
        // If the combined `sentence` already ends in punctuation, choose a connector that starts a new sentence.
        if (sentence.match(/[.!?]$/)) {
            // Force connector to start a new sentence if the previous part ended one
            if (!connector.match(/^[A-Z]/)) { // If connector doesn't start Capital
                 connector = randomChoice(connectors.filter(c => c.match(/^[A-Z]/) || c.startsWith('.'))); // Find one that does or starts with '.'
                 if (!connector) connector = ". Specifically,"; // Absolute fallback
            }
             // Ensure connector starts with capital if it follows a period.
             if (connector.startsWith('.')) {
                 connector = connector.slice(1).trim(); // Remove leading period
                 connector = capitalizeFirstLetter(connector);
             } else if (!connector.match(/^[A-Z]/)) {
                  connector = capitalizeFirstLetter(connector); // Ensure capitalization if it's a word like 'Specifically'
             }
             sentence += ` ${connector}`; // Add connector starting new sentence part

        } else {
             // If sentence doesn't end with punctuation, use a connecting phrase/clause connector
             if (connector.match(/^[A-Z]/) || connector.startsWith('.')) { // If connector starts a new sentence type
                  connector = randomChoice(connectors.filter(c => !c.match(/^[A-Z]/) && !c.startsWith('.'))); // Find one that connects clauses
                  if (!connector) connector = "; specifically,"; // Absolute fallback
             }
              // Ensure connector leads with appropriate punctuation if needed (e.g., comma, semicolon)
             if (!connector.startsWith(';') && !connector.startsWith(',')) {
                 connector = `, ${connector}`; // Default to comma separation
             } else {
                 connector = ` ${connector}`; // Add space before existing punctuation like ';'
             }
             sentence += connector;
        }

        // Format rationale: ensure it starts lowercase unless it's explicitly starting a new sentence after the connector.
        let formattedRationale = specificRationale.trim();
        // If the chosen connector *ends* with sentence punctuation OR starts with a Capital letter indicating a new sentence fragment
        if (connector.match(/[.!?]$/) || connector.match(/^[A-Z]/)) {
            formattedRationale = capitalizeFirstLetter(formattedRationale);
        } else {
             // Ensure lowercase start if it's continuing a sentence/clause
            formattedRationale = formattedRationale.charAt(0).toLowerCase() + formattedRationale.slice(1);
        }
        // Ensure rationale ends correctly before final punctuation
        formattedRationale = formattedRationale.replace(/[.;:!?]$/, ''); // Remove potential trailing punctuation before final punctuate call

        sentence += ` ${formattedRationale}`;
    }

    // Ensure the final sentence ends properly, handling potential double punctuation.
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
        const categoryKey = item.category || 'Other Specific Programs'; // Use assigned category
        if (!itemsByCategory[categoryKey]) {
            itemsByCategory[categoryKey] = [];
        }
        itemsByCategory[categoryKey].push(item);
    });

    let categoryParagraphs: string[] = [];

    if (Object.keys(itemsByCategory).length > 0) {
        // Add overall list intro only if items are selected
        categoryParagraphs.push(randomChoice(LIST_INTRO[tone]));

        const categories = Object.keys(itemsByCategory).sort(); // Sort categories
        categories.forEach((category) => {
            // Select category intro phrase
            const introOptions = CATEGORY_INTRO_PHRASES[category] || CATEGORY_INTRO_PHRASES.default;
            let categoryIntro = randomChoice(introOptions);

            // Substitute category name if placeholder exists, otherwise prepend/append naturally
            if (categoryIntro.includes('{CATEGORY}')) {
                categoryIntro = categoryIntro.replace('{CATEGORY}', category);
            } else {
                // Append category name more naturally if not in the template
                categoryIntro = `${categoryIntro} ${category}:`;
            }
             // Ensure intro ends appropriately (e.g., with a colon)
            categoryIntro = categoryIntro.trim().replace(/[:.,;]?$/, ':');

            let categoryParagraph = capitalizeFirstLetter(categoryIntro); // Start paragraph capitalized

            const itemSentences = itemsByCategory[category].map(item => generateItemSentence(item, tone));

            // Combine sentences within the category paragraph using varied connectors
            itemSentences.forEach((sentence, index) => {
                // Ensure sentence starts capitalized (should be handled by generateItemSentence, but double-check)
                let formattedSentence = capitalizeFirstLetter(sentence);

                // Use a connector only between sentences (index > 0)
                if (index > 0) {
                    const connector = randomChoice(INTRA_PARAGRAPH_CONNECTORS);
                    // Add connector + space before the sentence
                    categoryParagraph += ` ${connector} ${formattedSentence}`;
                } else {
                    // Add first sentence directly after intro
                    categoryParagraph += ` ${formattedSentence}`;
                }
            });
             categoryParagraphs.push(categoryParagraph.trim()); // Add the completed, trimmed category paragraph
        });
    }

    // Join category paragraphs with double newlines for separation
    const itemBlock = categoryParagraphs.join('\n\n');

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
        callToActionText = callToActionText.replace(/ Fiscal discipline must be central to every spending decision Congress makes, starting now./gi, '');
        callToActionText = callToActionText.replace(/ A concrete, aggressive debt-reduction plan is not optional—it is an absolute necessity./gi, '');
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

    