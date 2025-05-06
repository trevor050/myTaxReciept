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
    // Provide a sensible default or throw error depending on context
    console.warn("Attempted randomChoice on empty or invalid array.");
    return '' as T; // Return empty string as a safe default
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Cleans up item description for better readability in sentences. Handles more prefixes. */
export function cleanItemDescription(description: string): string {
    // Expand list of common prefixes to remove
    const prefixesToRemove = [
        'Pentagon - ', 'Dept. of Education - ', 'Federal Court System - ', 'FEMA - ',
        'USAID - ', 'NASA - ', 'Dept. of Housing and Urban Development - ',
        'Nat\'l Oceanic & Atmospheric Administration ', // Handle NOAA variations
        'Nat\'l Oceanic & Atmospheric Admin. ', // Handle NOAA variations
        'Energy efficiency and ' // Handle this specific phrasing if needed
    ];
    let cleaned = description;
    for (const prefix of prefixesToRemove) {
        if (cleaned.startsWith(prefix)) {
            cleaned = cleaned.substring(prefix.length);
            break; // Remove only the first matching prefix
        }
    }
     // Optional: Convert specific acronyms in parentheses to full names or more descriptive phrases
    cleaned = cleaned.replace(/\(CDC\)/, 'the Centers for Disease Control and Prevention');
    cleaned = cleaned.replace(/\(NLRB\)/, 'the National Labor Relations Board');
    cleaned = cleaned.replace(/\(CFPB\)/, 'the Consumer Financial Protection Bureau');
    cleaned = cleaned.replace(/\(WIC\)/, 'the Women, Infants, & Children program');
    cleaned = cleaned.replace(/\(VA\)/, 'Veterans\' Affairs');
    cleaned = cleaned.replace(/\(SNAP\)/, 'the Supplemental Nutrition Assistance Program (food stamps)');
    cleaned = cleaned.replace(/\(NOAA\)/, 'the National Oceanic and Atmospheric Administration');
    cleaned = cleaned.replace(/\(NASA\)/, 'the National Aeronautics and Space Administration');
    cleaned = cleaned.replace(/\(NIH\)/, 'the National Institutes of Health');
    cleaned = cleaned.replace(/\(PACT Act\)/, 'the PACT Act toxic exposure fund'); // Be more descriptive
    cleaned = cleaned.replace(/\(DEI\)/, 'Diversity, Equity, and Inclusion initiatives');

    // Remove any remaining simple parenthesized text at the end (like acronyms not caught above)
    cleaned = cleaned.replace(/\s*\([^)]+\)$/, '');

    // Ensure it doesn't start with 'the ' if it's now redundant, e.g. "the the Centers for..."
    if (cleaned.toLowerCase().startsWith('the the ')) {
        cleaned = cleaned.substring(4);
    }

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

/** Ensures a sentence or clause ends with appropriate punctuation (defaulting to period). Handles existing punctuation. */
export function punctuateSentence(sentence: string): string {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) return '.'; // Return period if empty

    const lastChar = trimmedSentence.slice(-1);

    // If it already ends in strong punctuation, keep it.
    if (['.', '!', '?'].includes(lastChar)) {
        return trimmedSentence;
    }
     // If it ends with clause punctuation (comma, semicolon), replace with period for sentence end.
     // We handle clause connections separately.
    if ([',', ';', ':'].includes(lastChar)) {
        return trimmedSentence.slice(0, -1) + '.';
    }
    // Otherwise, add a period.
    return trimmedSentence + '.';
}


/** Basic cleanup of generated text: consolidates whitespace, fixes spacing around punctuation, ensures paragraph breaks. */
export function cleanupText(text: string): string {
    let cleaned = text;

    // Consolidate multiple spaces/newlines into single spaces or double newlines
    cleaned = cleaned.replace(/\s*\n\s*\n\s*/g, '\n\n'); // Ensure only double newlines between paragraphs
    cleaned = cleaned.replace(/[ \t]+/g, ' '); // Consolidate horizontal whitespace

    // Fix spacing around punctuation
    cleaned = cleaned.replace(/ ([.,!?;:])/g, '$1'); // Remove space before punctuation
    cleaned = cleaned.replace(/([.,!?;:])(?!\s|$)/g, '$1 '); // Ensure space after punctuation if not end of line/text

    // Correct capitalization after sentence-ending punctuation followed by space
    cleaned = cleaned.replace(/([.!?])\s+([a-z])/g, (match, p1, p2) => `${p1} ${p2.toUpperCase()}`);

    // Remove potential duplicate punctuation (e.g., "..!?" -> "!")
    cleaned = cleaned.replace(/([.!?]){2,}/g, '$1');
    cleaned = cleaned.replace(/([,;:]){2,}/g, '$1');

    // Ensure first letter of the entire text is capitalized
    cleaned = capitalizeFirstLetter(cleaned.trim());

     // Handle potential leading lowercase after connectors like "additionally,"
     cleaned = cleaned.replace(/\n\n([a-z])/g, (match, p1) => `\n\n${p1.toUpperCase()}`);
     cleaned = cleaned.replace(/([.!?]\s)([a-z])/g, (match, p1, p2) => `${p1}${p2.toUpperCase()}`);


    return cleaned.trim(); // Final trim
}

    