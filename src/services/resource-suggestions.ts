
'use server';
/**
 * @fileOverview Service for suggesting relevant resources and organizations
 * based on user's email customization choices (selected items, funding levels, tone).
 */

import type { SelectedItem as UserSelectedItem } from '@/services/tax-spending';
import type { Tone } from './email/types';
import type { MatchedReason, BadgeType, SuggestedResource } from '@/types/resource-suggestions';
import { RESOURCE_DATABASE, getItemAdvocacyTags, getActionFromFundingLevel, generateMatchedReason, MAX_SUGGESTIONS, assignBadgesToResource, MAX_BADGES_PER_RESOURCE } from '@/lib/resource-suggestion-logic';


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

  let bestMatchAssignedThisRun = false;
  let topMatchCountThisRun = 0;
  const MAX_TOP_MATCHES_THIS_RUN = 2;
  const otherResourcesWithBadges = new Map<string, Set<BadgeType>>();


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

    let isBestMatchForThisRun = false;
    let isTopMatchForThisRun = false;
    const hasHighMatchCount = resource.matchCount && resource.matchCount >= Math.max(1, Math.floor(userConcerns.size * 0.60));

    if (!bestMatchAssignedThisRun && hasHighMatchCount && resource.score > 3.5 && userConcerns.size > 0) {
        isBestMatchForThisRun = true;
        bestMatchAssignedThisRun = true;
    }
    if (topMatchCountThisRun < MAX_TOP_MATCHES_THIS_RUN && !isBestMatchForThisRun && hasHighMatchCount && resource.score > 2.5 && userConcerns.size > 0) {
        isTopMatchForThisRun = true;
        topMatchCountThisRun++;
    }

    const finalBadges = assignBadgesToResource(resource, userConcerns.size, isBestMatchForThisRun, isTopMatchForThisRun, otherResourcesWithBadges);
    if (finalBadges.length > 0) {
        otherResourcesWithBadges.set(resource.url, new Set(finalBadges));
    }


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

