
'use server';
/**
 * @fileOverview Service for suggesting relevant resources and organizations
 * based on user's email customization choices (selected items, funding levels, tone).
 */

import type { SelectedItem as UserSelectedItem } from '@/services/tax-spending';
import { cleanItemDescription } from '@/services/email/utils';
import type { Tone } from './email/types';
import type { MatchedReason, BadgeType, SuggestedResource } from '@/types/resource-suggestions';
import { BADGE_DISPLAY_PRIORITY_MAP } from '@/types/resource-suggestions'; // Corrected import path
import { RESOURCE_DATABASE, getItemAdvocacyTags, getActionFromFundingLevel, generateMatchedReason, MAX_SUGGESTIONS, MAX_BADGES_PER_RESOURCE } from '@/lib/resource-suggestion-logic';


export async function suggestResources(
  selectedItems: UserSelectedItem[],
  userToneValue: number, // This is the 0-100 slider value for aggressiveness
  balanceBudgetChecked: boolean
): Promise<SuggestedResource[]> {
  const suggestions: SuggestedResource[] = [];
  const suggestedUrls = new Set<string>();
  const userConcerns: Map<string, {action: ReturnType<typeof getActionFromFundingLevel>, itemDescription: string, tags: Set<string>}> = new Map();

  selectedItems.forEach(item => {
    const action = getActionFromFundingLevel(item.fundingLevel);
    const itemTags = new Set(getItemAdvocacyTags(item.id, action));
    userConcerns.set(item.id, {action, itemDescription: item.description, tags: itemTags });
  });

  if (balanceBudgetChecked) {
     const budgetTags = new Set(['fiscal_responsibility', 'debt_reduction', 'budget_reform', 'interest_debt_review']);
     userConcerns.set('balance_budget', {action: 'review', itemDescription: 'Balancing the Budget & Reducing National Debt', tags: budgetTags});
  }

  let bestMatchAssigned = false;
  let topMatchCount = 0;
  const MAX_TOP_MATCHES = 2; 

  const scoredResources = RESOURCE_DATABASE.map(resource => {
    let score = 0;
    const matchedReasonsSet = new Set<string>();
    const detailedMatchedReasons: MatchedReason[] = [];
    let uniqueConcernMatchCount = 0;
    const matchedConcernIds = new Set<string>();

    userConcerns.forEach((concern, concernId) => {
        let concernMatchedThisIteration = false;
        concern.tags.forEach(userTag => {
            if (resource.advocacyTags.includes(userTag)) {
                score++; 
                const reason = generateMatchedReason(userTag, concern.itemDescription, concern.action);
                const reasonKey = `${reason.type}-${reason.actionableTag}-${reason.originalConcern}`;
                if (!matchedReasonsSet.has(reasonKey)) {
                    matchedReasonsSet.add(reasonKey);
                    detailedMatchedReasons.push(reason);
                }
                if (userTag.includes('_cut') || userTag.includes('_fund') || userTag.includes('_slash')) score += 2;
                else if (userTag.includes('_review')) score += 1;
                concernMatchedThisIteration = true;
            }
        });
        if (concernMatchedThisIteration && !matchedConcernIds.has(concernId)) {
            uniqueConcernMatchCount++;
            matchedConcernIds.add(concernId);
        }
    });

    if (resource.prominence === 'high') score += 1.5;
    else if (resource.prominence === 'medium') score += 0.75;

    if (balanceBudgetChecked && resource.advocacyTags.some(t => ['fiscal_responsibility', 'debt_reduction', 'budget_reform'].includes(t))) {
        score += 1.5;
        if(!matchedConcernIds.has('balance_budget')) { 
            uniqueConcernMatchCount++;
            const budgetReason = generateMatchedReason('fiscal_responsibility', 'Balancing the Budget & Reducing National Debt', 'review');
            const budgetReasonKey = `${budgetReason.type}-${budgetReason.actionableTag}-${budgetReason.originalConcern}`;
            if (!matchedReasonsSet.has(budgetReasonKey)) {
                 matchedReasonsSet.add(budgetReasonKey);
                 detailedMatchedReasons.push(budgetReason);
            }
        }
    }
    
    resource.orgTypeTags?.forEach(tag => {
        if (tag === 'legal') score += 0.3;
        if (tag === 'data-driven') score += 0.3;
        if (tag === 'grassroots') score += 0.2;
        if (tag === 'established') score += 0.1;
        if (tag === 'activism') score += 0.25; 
        if (tag === 'think-tank') score += 0.15;
        if (tag === 'direct-service') score += 0.1;
    });


    return { ...resource, score, matchedReasons: detailedMatchedReasons, matchCount: uniqueConcernMatchCount };
  })
  .filter(r => r.score > 0 || (userConcerns.size === 0 && balanceBudgetChecked && r.advocacyTags.some(t => ['fiscal_responsibility', 'debt_reduction'].includes(t)))) 
  .sort((a, b) => { 
    if (b.matchCount !== a.matchCount) return (b.matchCount || 0) - (a.matchCount || 0);
    if (b.score !== a.score) return b.score - a.score;
    const prominenceOrder = { 'high': 1, 'medium': 2, 'low': 3 };
    return (prominenceOrder[a.prominence || 'low'] || 3) - (prominenceOrder[b.prominence || 'low'] || 3);
  });


  for (const resource of scoredResources) {
    if (suggestions.length >= MAX_SUGGESTIONS) break;
    if (suggestedUrls.has(resource.url)) continue; 

    let overallRelevanceReason = `Focuses on key areas relevant to public policy.`; 
    if (resource.matchedReasons && resource.matchedReasons.length > 0) {
        const topReason = resource.matchedReasons[0];
        const toneForRelevance = userToneValue > 66 ? "strongly aligns" : userToneValue > 33 ? "aligns well" : "may be of interest";
        overallRelevanceReason = `${resource.name} ${toneForRelevance} with your stated concern about ${topReason.originalConcern.toLowerCase()} through its work on ${topReason.actionableTag.toLowerCase()}.`;
        if (resource.matchCount && resource.matchCount > 1) {
           overallRelevanceReason += ` It also addresses ${resource.matchCount -1} other concern${resource.matchCount - 1 === 1 ? '' : 's'} you highlighted.`;
        }
        if (balanceBudgetChecked && resource.advocacyTags.some(t => ['fiscal_responsibility', 'debt_reduction'].includes(t)) && !topReason.originalConcern.toLowerCase().includes('budget')) {
            overallRelevanceReason += ` Additionally, they advocate for fiscal responsibility.`;
        }
    } else if (balanceBudgetChecked && resource.advocacyTags.some(t => ['fiscal_responsibility', 'debt_reduction'].includes(t))) {
        overallRelevanceReason = `${resource.name} advocates for fiscal responsibility, aligning with your interest in balancing the budget.`;
    }

    const assignedBadges: BadgeType[] = [];
    const hasHighMatchCount = resource.matchCount && resource.matchCount >= Math.max(1, Math.floor(userConcerns.size * 0.60)); 

    if (!bestMatchAssigned && hasHighMatchCount && resource.score > 3.5 && userConcerns.size > 0) { 
      assignedBadges.push('Best Match');
      bestMatchAssigned = true;
    }

    if (topMatchCount < MAX_TOP_MATCHES && !assignedBadges.includes('Best Match') && hasHighMatchCount && resource.score > 2.5 && userConcerns.size > 0) {
      assignedBadges.push('Top Match');
      topMatchCount++;
    }

    const potentialBadges: Set<BadgeType> = new Set(); 
    if (resource.prominence === 'high' && (resource.matchCount || 0) > 0 && resource.score > 2.0) {
        potentialBadges.add('High Impact');
    }

    const orgTypeToBadgeMap: Partial<Record<NonNullable<typeof resource.orgTypeTags>[number], BadgeType>> = {
        'legal': 'Legal Advocacy', 'data-driven': 'Data-Driven', 'grassroots': 'Grassroots Power',
        'established': 'Established Voice', 'activism': 'High Impact', 
        'think-tank': resource.focusType === 'niche' ? 'Niche Focus' : 'Broad Focus',
    };

    if (resource.orgTypeTags) {
        for (const orgTag of resource.orgTypeTags) {
            const badge = orgTypeToBadgeMap[orgTag];
            if (badge) potentialBadges.add(badge);
        }
    }
    if (resource.focusType === 'broad' && !potentialBadges.has('Broad Focus')) potentialBadges.add('Broad Focus');
    if (resource.focusType === 'niche' && !potentialBadges.has('Niche Focus')) potentialBadges.add('Niche Focus');
    
    const sortedPotentialBadges = Array.from(potentialBadges)
                                     .sort((a,b) => (BADGE_DISPLAY_PRIORITY_MAP[a] || 99) - (BADGE_DISPLAY_PRIORITY_MAP[b] || 99));

    for (const badge of sortedPotentialBadges) {
        if (assignedBadges.length < MAX_BADGES_PER_RESOURCE && !assignedBadges.includes(badge)) {
            assignedBadges.push(badge);
        }
    }
    
    if (assignedBadges.length === 0 && ((resource.matchCount || 0) === 0 || userConcerns.size === 0)) {
        assignedBadges.push('General Interest');
    }
    if (assignedBadges.length < MAX_BADGES_PER_RESOURCE && (resource.matchCount || 0) > 0 && (resource.prominence === 'low' || resource.prominence === 'medium') && !assignedBadges.includes('Community Pick') && Math.random() < 0.33) {
        if (assignedBadges.length < MAX_BADGES_PER_RESOURCE) { 
            assignedBadges.push('Community Pick');
        }
    }

    const finalBadges = assignedBadges
                           .sort((a,b) => (BADGE_DISPLAY_PRIORITY_MAP[a] || 99) - (BADGE_DISPLAY_PRIORITY_MAP[b] || 99))
                           .slice(0, MAX_BADGES_PER_RESOURCE);


    suggestions.push({
      name: resource.name,
      url: resource.url,
      description: resource.description,
      overallRelevance: overallRelevanceReason.trim(),
      icon: resource.icon,
      matchCount: resource.matchCount,
      matchedReasons: resource.matchedReasons,
      badges: finalBadges.length > 0 ? finalBadges : undefined, 
      mainCategory: resource.mainCategory,
      prominence: resource.prominence,
      focusType: resource.focusType,
      orgTypeTags: resource.orgTypeTags,
    });
    suggestedUrls.add(resource.url);
  }
  return suggestions;
}

