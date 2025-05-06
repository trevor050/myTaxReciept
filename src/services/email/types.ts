/**
 * @fileOverview Defines shared types used across email generation modules.
 */

// Represents the tone of the email (0: Polite, 1: Concerned, 2: Stern, 3: Angry)
export type Tone = 0 | 1 | 2 | 3;

// Represents the desired funding action for an item
export type FundingLevel = -2 | -1 | 0 | 1 | 2;

// Represents the type of rationale based on the funding action
export type FundingActionRationale = 'cut' | 'review' | 'fund';

// Represents a specific item selected by the user for the email
export interface SelectedItem {
  id: string;
  description: string; // The cleaned description used in the email
  fundingLevel: FundingLevel;
}

// Structure for storing email template variations
export type EmailTemplates<T> = Record<Tone, T>;
export type ActionPhrases = Record<FundingLevel, EmailTemplates<string>>; // e.g., ACTION[-2][0]
export type RationaleOptions = Record<string, string[]>; // Key: `${item.id}_${FundingActionRationale}` or `default_${FundingActionRationale}`
export type CategoryIntroPhrases = Record<string, string[]>; // Key: category name or 'default'
