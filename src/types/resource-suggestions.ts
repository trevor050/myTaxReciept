
/**
 * @fileOverview Type definitions for resource suggestion features.
 */

export interface MatchedReason {
  type: 'supports' | 'opposes' | 'reviews' | 'general';
  description: string; // What the org does related to the tag
  originalConcern: string; // User's original concern text
  actionableTag: string; // The specific tag from the resource that matched, cleaned for display
}

// Expanded badge types
export type BadgeType =
  | 'Best Match'
  | 'Top Match'
  | 'Your Match' // Added new badge type
  | 'High Impact'
  | 'Broad Focus'
  | 'Niche Focus'
  | 'Community Pick'
  | 'Grassroots Power'
  | 'Data-Driven'
  | 'Legal Advocacy'
  | 'Established Voice'
  | 'General Interest';

export interface SuggestedResource {
  name: string;
  url: string;
  description: string;
  overallRelevance: string; // AI-generated summary of why it's relevant
  icon?: string;
  matchCount?: number; // How many of the user's distinct concerns it matches
  matchedReasons?: MatchedReason[];
  badges?: BadgeType[];
  mainCategory: string;
  prominence?: 'high' | 'medium' | 'low';
  focusType?: 'broad' | 'niche';
  orgTypeTags?: ('grassroots' | 'research' | 'legal' | 'established' | 'activism' | 'think-tank' | 'direct-service')[];
  intendedBadgeProfile?: ('single-prominent' | 'double-diverse' | 'triple-focused' | 'community-focused')[]; // Hint for badge assignment
}

// Priority map for displaying badges, lower numbers are higher priority
export const BADGE_DISPLAY_PRIORITY_MAP: Record<BadgeType, number> = {
  'Best Match': 1,
  'Top Match': 2,
  'Your Match': 3, // Added "Your Match" with priority
  'High Impact': 4,
  'Data-Driven': 5,
  'Legal Advocacy': 6,
  'Established Voice': 7,
  'Grassroots Power': 8,
  'Community Pick': 9,
  'Niche Focus': 10,
  'Broad Focus': 11,
  'General Interest': 12,
};

