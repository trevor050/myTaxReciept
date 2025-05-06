/**
 * @fileOverview Utility functions for email generation, including helpers for randomness and text manipulation.
 */

import type { Tone, FundingActionRationale } from './templates';

/** Map 0-100 slider to tone bucket 0-3 */
export function toneBucket(aggr: number): Tone {
  // Ensures value is between 0 and 3 inclusive.
  // 0-24 -> 0 | 25-49 -> 1 | 50-74 -> 2 | 75-100 -> 3
  return Math.min(3, Math.floor(aggr / 25)) as Tone;
}

/** Selects a random phrasing from an array */
export function randomChoice<T>(arr: T[]): T {
  if (!arr || arr.length === 0) {
    console.warn("Attempted randomChoice on empty or invalid array.");
    // Return a generic neutral string or handle based on expected type T
    return '' as T; // Returning empty string might be safest for text generation
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Cleans up item description for better readability in sentences. Handles more prefixes and acronyms. */
export function cleanItemDescription(description: string): string {
    // Expand list of common prefixes to remove
    const prefixesToRemove = [
        'Pentagon - ', 'Dept. of Education - ', 'Federal Court System - ', 'FEMA - ',
        'USAID - ', 'NASA - ', 'Dept. of Housing and Urban Development - ',
        'Nat\'l Oceanic & Atmospheric Administration ', // Handle NOAA variations
        'Nat\'l Oceanic & Atmospheric Admin. ', // Handle NOAA variations
        'Energy efficiency and '
    ];
    let cleaned = description;
    for (const prefix of prefixesToRemove) {
        if (cleaned.startsWith(prefix)) {
            cleaned = cleaned.substring(prefix.length);
            break; // Remove only the first matching prefix
        }
    }
     // Convert specific acronyms in parentheses to full names or more descriptive phrases
    cleaned = cleaned.replace(/\(CDC\)/, 'the Centers for Disease Control and Prevention');
    cleaned = cleaned.replace(/\(NLRB\)/, 'the National Labor Relations Board');
    cleaned = cleaned.replace(/\(CFPB\)/, 'the Consumer Financial Protection Bureau');
    cleaned = cleaned.replace(/\(WIC\)/, 'the Women, Infants, & Children program');
    cleaned = cleaned.replace(/\(VA\)/, 'Veterans\' Affairs');
    cleaned = cleaned.replace(/\(SNAP\)/, 'the Supplemental Nutrition Assistance Program (food stamps)');
    cleaned = cleaned.replace(/\(NOAA\)/, 'the National Oceanic and Atmospheric Administration');
    cleaned = cleaned.replace(/\(NASA\)/, 'the National Aeronautics and Space Administration');
    cleaned = cleaned.replace(/\(NIH\)/, 'the National Institutes of Health');
    cleaned = cleaned.replace(/\(PACT Act\)/, 'the PACT Act toxic exposure fund');
    cleaned = cleaned.replace(/\(DEI\)/, 'Diversity, Equity, and Inclusion initiatives');
    cleaned = cleaned.replace(/\(TSA\)/, 'the Transportation Security Administration');
    cleaned = cleaned.replace(/\(FAA\)/, 'the Federal Aviation Administration');
    cleaned = cleaned.replace(/\(FSA\)/, 'the Farm Service Agency');
    cleaned = cleaned.replace(/\(FDIC\)/, 'the Federal Deposit Insurance Corporation');
    cleaned = cleaned.replace(/\(IRS\)/, 'the Internal Revenue Service');
    cleaned = cleaned.replace(/\(USPS\)/, 'the Postal Service');
    cleaned = cleaned.replace(/\(MBDA\)/, 'the Minority Business Development Agency');
    cleaned = cleaned.replace(/\(USICH\)/, 'the Interagency Council on Homelessness');
    cleaned = cleaned.replace(/\(HUD\)/, 'the Department of Housing and Urban Development');
    cleaned = cleaned.replace(/\(EPA\)/, 'the Environmental Protection Agency');
    cleaned = cleaned.replace(/\(NPS\)/, 'the National Park Service');
    cleaned = cleaned.replace(/\(NSF\)/, 'the National Science Foundation');
    cleaned = cleaned.replace(/\(CPB\)/, 'the Corporation for Public Broadcasting');
    cleaned = cleaned.replace(/\(IMLS\)/, 'Museum and Library Services');
    cleaned = cleaned.replace(/\(LIHEAP\)/, 'the Low Income Home Energy Assistance Program');
    cleaned = cleaned.replace(/\(TANF\)/, 'Temporary Assistance for Needy Families');

    // Remove any remaining simple parenthesized text (like acronyms not caught above)
    cleaned = cleaned.replace(/\s*\([^)]+\)$/, '');
    cleaned = cleaned.replace(/\s*\([^)]+\)/, ''); // Also remove if not at the end

    // Ensure it doesn't start with 'the ' if it's now redundant, e.g. "the the Centers for..."
    if (cleaned.toLowerCase().startsWith('the the ')) {
        cleaned = cleaned.substring(4);
    }
     // Correct potential double 'the' after prefix removal, e.g., "the The Pentagon" -> "The Pentagon"
    cleaned = cleaned.replace(/^the The /i, 'The ');


    return cleaned.trim();
}


/** Determines the rationale type based on funding level */
export function getFundingActionRationale(level: number): FundingActionRationale {
    if (level < 0) return 'cut';
    if (level > 0) return 'fund';
    return 'review'; // Level 0 maps to review/efficiency rationales
}

/** Capitalizes the first letter of a string. */
export function capitalizeFirstLetter(string: string): string {
    if (!string) return string;
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/** Ensures a sentence or clause ends with appropriate punctuation (defaulting to period). Handles existing punctuation better. */
export function punctuateSentence(sentence: string): string {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) return '.'; // Return period if empty

    // Remove potential trailing whitespace before checking last char
    const lastChar = trimmedSentence.slice(-1);

    // If it already ends in strong punctuation, keep it.
    if (['.', '!', '?'].includes(lastChar)) {
        return trimmedSentence;
    }
     // If it ends with clause punctuation (comma, semicolon, colon), replace with period for sentence end.
     // We handle clause connections separately in the generator.
    if ([',', ';', ':'].includes(lastChar)) {
        return trimmedSentence.slice(0, -1) + '.';
    }
    // Otherwise, add a period.
    return trimmedSentence + '.';
}


/** More robust cleanup of generated text: consolidates whitespace, fixes spacing around punctuation, ensures paragraph breaks, trims stray characters. */
export function cleanupText(text: string): string {
    let cleaned = text;

    // 1. Consolidate whitespace: multiple spaces/tabs to single space, multiple newlines to double newline.
    cleaned = cleaned.replace(/[ \t]+/g, ' ');
    cleaned = cleaned.replace(/\s*\n\s*/g, '\n'); // Temporarily normalize newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n'); // Ensure max two newlines

    // 2. Fix spacing around punctuation: remove space *before*, ensure space *after* (unless end of line/text).
    cleaned = cleaned.replace(/ ([.,!?;:])(?![\d])/g, '$1'); // Remove space before punctuation (avoid affecting numbers like 1.5)
    cleaned = cleaned.replace(/([.,!?;:])(?=\S)/g, '$1 '); // Add space after if followed by non-space

    // 3. Correct capitalization after sentence-ending punctuation.
    // Match [.!?], optional quotes/spaces, then a lowercase letter.
    cleaned = cleaned.replace(/([.!?]['"]?\s+)([a-z])/g, (match, p1, p2) => `${p1}${p2.toUpperCase()}`);

    // 4. Remove potential duplicate punctuation.
    cleaned = cleaned.replace(/([.!?]){2,}/g, '$1'); // e.g., "..!?" -> "!"
    cleaned = cleaned.replace(/([,;:]){2,}/g, '$1'); // e.g., ",," -> ","

     // 5. Remove potential stray characters or fragments (like single letters 'a.' 'f.' from previous errors) - BE CAUTIOUS HERE
     // Remove single letters followed by a period and space/newline, unless it's 'A.' or 'I.'
     cleaned = cleaned.replace(/(?<![A-Za-z])[b-hj-zB-HJ-Z]\.\s+/g, '');
     cleaned = cleaned.replace(/\s[b-hj-zB-HJ-Z]\.(?![A-Za-z])/g, ''); // Handle end of sentence/paragraph cases

     // 6. Ensure the very first letter of the entire text is capitalized.
     cleaned = capitalizeFirstLetter(cleaned.trim());

     // 7. Trim any leading/trailing whitespace from the final result.
     cleaned = cleaned.trim();

    return cleaned;
}

    