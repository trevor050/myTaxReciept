
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
}

// Priority map for displaying badges, lower numbers are higher priority
export const BADGE_DISPLAY_PRIORITY_MAP: Record<BadgeType, number> = {
  'Best Match': 1,
  'Top Match': 2,
  'High Impact': 3,
  'Data-Driven': 4,
  'Legal Advocacy': 5,
  'Established Voice': 6,
  'Grassroots Power': 7,
  'Community Pick': 8,
  'Niche Focus': 9,
  'Broad Focus': 10,
  'General Interest': 11,
};
