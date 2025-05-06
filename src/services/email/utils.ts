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

/** Cleans up item description for better readability in sentences. */
export function cleanItemDescription(description: string): string {
    // Remove common prefixes
    let cleaned = description.replace(/^(Pentagon - |Dept\. of Education - |Federal Court System - |FEMA - |USAID - |NASA - )/,'');
    // Optional: Convert acronyms in parentheses to full name if desired (more complex logic needed here)
    // Example: Simple removal of parenthesized text
    // cleaned = cleaned.replace(/\s*\([^)]+\)$/, ''); // Removes trailing acronyms in parens
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

/** Ensures a sentence ends with appropriate punctuation (defaulting to period). */
export function punctuateSentence(sentence: string): string {
    if (!sentence) return '.'; // Return period if empty
    const lastChar = sentence.trim().slice(-1);
    if (['.', '!', '?'].includes(lastChar)) {
        return sentence.trim(); // Already punctuated
    }
    return sentence.trim() + '.';
}

/** Basic cleanup of generated text */
export function cleanupText(text: string): string {
    return text
        .replace(/\s+/g, ' ') // Consolidate multiple spaces
        .replace(/ \./g, '.') // Remove space before period
        .replace(/ ,/g, ',') // Remove space before comma
        .replace(/ ;/g, ';') // Remove space before semicolon
        .replace(/\n\n+/g, '\n\n') // Consolidate multiple newlines
        .trim(); // Remove leading/trailing whitespace
}
