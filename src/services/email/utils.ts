/**
 * @fileOverview Utility functions for email generation, including helpers for randomness and text manipulation.
 */

import type { Tone, FundingLevel, FundingActionRationale } from './types';

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

/** Cleans up item description for better readability in sentences. Handles more prefixes, acronyms, and phrasing issues. */
export function cleanItemDescription(description: string): string {
    let cleaned = description.trim();

    // --- Prefix Removals ---
    const prefixesToRemove = [
        'Pentagon - ', 'Dept. of Education - ', 'Federal Court System - ', 'FEMA - ',
        'USAID - ', 'NASA - ', 'Dept. of Housing and Urban Development', // Remove ' - ' here if needed
        'Nat\'l Oceanic & Atmospheric Administration ',
        'Nat\'l Oceanic & Atmospheric Admin. ',
        'Energy efficiency and ' // Often part of a longer phrase
    ];
    for (const prefix of prefixesToRemove) {
        if (cleaned.startsWith(prefix)) {
            cleaned = cleaned.substring(prefix.length);
            break; // Assume only one major prefix needs removal
        }
    }
    // Specific case for HUD
     if (cleaned.startsWith('Dept. of Housing and Urban Development')) {
         cleaned = 'the Department of Housing and Urban Development'; // Replace with full name if prefix removed
     }


    // --- Acronym Expansion & Phrasing ---
    const acronymMap: Record<string, string> = {
        '(CDC)': 'the Centers for Disease Control and Prevention',
        '(NLRB)': 'the National Labor Relations Board',
        '(CFPB)': 'the Consumer Financial Protection Bureau',
        '(WIC)': 'the Women, Infants, & Children program',
        '(VA)': 'Veterans\' Affairs programs', // Make slightly more specific
        '(SNAP)': 'the Supplemental Nutrition Assistance Program (food stamps)',
        '(NOAA)': 'the National Oceanic and Atmospheric Administration',
        '(NASA)': 'the National Aeronautics and Space Administration',
        '(NIH)': 'the National Institutes of Health',
        '(PACT Act)': 'the PACT Act toxic exposure fund',
        '(DEI)': 'Diversity, Equity, and Inclusion initiatives',
        '(TSA)': 'the Transportation Security Administration',
        '(FAA)': 'the Federal Aviation Administration',
        '(FSA)': 'the Farm Service Agency',
        '(FDIC)': 'the Federal Deposit Insurance Corporation',
        '(IRS)': 'the Internal Revenue Service',
        '(USPS)': 'the Postal Service', // Often referred to just as this
        '(MBDA)': 'the Minority Business Development Agency',
        '(USICH)': 'the Interagency Council on Homelessness',
        '(HUD)': 'the Department of Housing and Urban Development',
        '(EPA)': 'the Environmental Protection Agency',
        '(NPS)': 'the National Park Service',
        '(NSF)': 'the National Science Foundation',
        '(CPB)': 'the Corporation for Public Broadcasting',
        '(IMLS)': 'Museum and Library Services programs', // Slightly more specific
        '(LIHEAP)': 'the Low Income Home Energy Assistance Program',
        '(TANF)': 'Temporary Assistance for Needy Families',
    };

    for (const acronym in acronymMap) {
        cleaned = cleaned.replace(acronym, acronymMap[acronym]);
    }

     // Handle specific known phrasing issues AFTER acronym expansion
     cleaned = cleaned.replace(/^Pentagon$/, 'the Pentagon budget');
     cleaned = cleaned.replace(/^Diplomacy$/, 'State Department diplomatic programs');
     cleaned = cleaned.replace(/^Highways$/, 'federal highway funding');
     cleaned = cleaned.replace(/^Public transit$/, 'federal public transit funding');
     cleaned = cleaned.replace(/^Head Start$/, 'the Head Start program');
     cleaned = cleaned.replace(/^Public Housing$/, 'public housing programs');
     cleaned = cleaned.replace(/^Nuclear Weapons$/, 'nuclear weapons programs');
     cleaned = cleaned.replace(/^Medicare$/, 'the Medicare program');
     cleaned = cleaned.replace(/^Medicaid$/, 'the Medicaid program');
     cleaned = cleaned.replace(/^Federal Prisons$/, 'the federal prison system');
     cleaned = cleaned.replace(/^Forest Service$/, 'the U.S. Forest Service');
     cleaned = cleaned.replace(/^Internal Revenue Service$/, 'the Internal Revenue Service (IRS)'); // Add back common acronym for clarity


    // Remove any remaining simple parenthesized text (like source notes if any)
    cleaned = cleaned.replace(/\s*\([^)]+\)$/, '');
    cleaned = cleaned.replace(/\s*\([^)]+\)/, '');

    // --- Article and Capitalization Cleanup ---
    // Ensure it doesn't start with 'the ' if it's now redundant, e.g., "the the Centers for..."
    if (cleaned.toLowerCase().startsWith('the the ')) {
        cleaned = cleaned.substring(4);
    }
    // Correct potential double 'the' after prefix removal, e.g., "the The Pentagon" -> "The Pentagon"
    cleaned = cleaned.replace(/^the The /i, 'The ');
    // Ensure proper nouns maintain capitalization (simple check for now)
    cleaned = cleaned.split(' ').map(word => {
        if (['Pentagon', 'Medicare', 'Medicaid', 'Congress', 'National', 'Federal', 'Administration', 'Department', 'Agency', 'Service', 'Bureau', 'Institutes', 'Foundation'].includes(word) && word.length > 2) {
             return word; // Keep likely proper nouns capitalized
        }
        // Add specific agency names if needed
        if (['CDC', 'NLRB', 'CFPB', 'WIC', 'VA', 'SNAP', 'NOAA', 'NASA', 'NIH', 'PACT', 'DEI', 'TSA', 'FAA', 'FSA', 'FDIC', 'IRS', 'USPS', 'MBDA', 'USICH', 'HUD', 'EPA', 'NPS', 'NSF', 'CPB', 'IMLS', 'LIHEAP', 'TANF'].includes(word)) {
             return word;
        }
         // Keep already capitalized words (likely acronyms or names)
        if (word === word.toUpperCase() && word.length > 1) {
            return word;
        }
        // Basic attempt to keep mid-sentence proper nouns (like 'Veterans' Affairs') - less reliable
        // if (word.charAt(0) === word.charAt(0).toUpperCase() && index > 0) return word;

        // Otherwise, typically lowercase unless it's the first word (handled later)
        return word.toLowerCase();
    }).join(' ');

     // Ensure the very first word is capitalized after all transformations
     cleaned = capitalizeFirstLetter(cleaned.trim());


    return cleaned.trim();
}


/** Determines the rationale type based on funding level */
export function getFundingActionRationale(level: FundingLevel): FundingActionRationale {
    if (level < 0) return 'cut';
    if (level > 0) return 'fund';
    return 'review'; // Level 0 maps to review/efficiency rationales
}

/** Capitalizes the first letter of a string. */
export function capitalizeFirstLetter(string: string): string {
    if (!string) return string;
    // Find first alphabetic character and capitalize it
    const match = string.match(/[a-zA-Z]/);
    if (match) {
        const index = match.index!;
        return string.substring(0, index) + string.charAt(index).toUpperCase() + string.slice(index + 1);
    }
    return string; // Return original if no alphabetic char found
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
    // Match [.!?], optional quotes/spaces, then a lowercase letter. Handle start of new paragraphs (\n\n).
    cleaned = cleaned.replace(/([.!?]['"]?)(\s*\n\n?|\s+)([a-z])/g, (match, p1, p2, p3) => `${p1}${p2}${p3.toUpperCase()}`);

    // 4. Remove potential duplicate punctuation.
    cleaned = cleaned.replace(/([.!?]){2,}/g, '$1'); // e.g., "..!?" -> "!"
    cleaned = cleaned.replace(/([,;:]){2,}/g, '$1'); // e.g., ",," -> ","

     // 5. Remove potential stray characters or fragments (like single letters 'a.' 'f.' from previous errors) - More cautious
     // Remove single lowercase letters followed by a period and space/newline, ONLY if preceded by whitespace/start.
     cleaned = cleaned.replace(/(^|\s)[b-hj-z]\.\s+/g, '$1');
     // Remove single uppercase letters similarly, but be even more cautious (avoid 'A.', 'I.')
     cleaned = cleaned.replace(/(^|\s)[B-HJ-Z]\.\s+/g, '$1');


     // 6. Ensure the very first letter of the entire text is capitalized.
     cleaned = capitalizeFirstLetter(cleaned.trim());

     // 7. Trim any leading/trailing whitespace from the final result.
     cleaned = cleaned.trim();

     // 8. Final check for sentences not ending in punctuation (due to rationale logic complexities)
     // Split into paragraphs first
     cleaned = cleaned.split('\n\n').map(paragraph => {
         // Split paragraph into potential sentences (crude split by period/qmark/exclam)
         // Then rejoin, ensuring each part ends correctly.
          return paragraph.split(/([.!?])\s*/).reduce((acc, part, index, arr) => {
            if (index % 2 === 0 && part.trim()) { // Even indices are sentence parts
                const nextPunct = arr[index + 1] || ''; // Punctuation following this part
                // Ensure part ends with punctuation if it's not empty and not followed by required punct
                if (!part.trim().match(/[.!?]$/) && !nextPunct.match(/[.!?]/)) {
                   acc += punctuateSentence(part.trim());
                } else {
                   acc += part.trim(); // Add the part as is
                }
                 acc += nextPunct ? `${nextPunct} ` : ' '; // Add the punctuation and space back
            }
            return acc;
          }, '').trim();
     }).join('\n\n');


    return cleaned;
}
