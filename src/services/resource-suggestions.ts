'use server';
/**
 * @fileOverview Service for suggesting relevant resources and organizations
 * based on user's email customization choices (selected items, funding levels, tone).
 */

import type { SelectedItem as UserSelectedItem } from '@/services/tax-spending'; // Assuming this type includes category
import { toneBucket } from '@/services/email/utils'; // Re-use toneBucket if applicable

export interface SuggestedResource {
  name: string;
  url: string;
  description: string; // General description of the organization/resource
  relevance: string; // Why this is relevant to the user's specific choices
  icon?: string; // Optional: Lucide icon name
}

type FundingAction = 'slash' | 'fund' | 'review';

interface ResourceDatabaseEntry {
  name: string;
  url: string;
  description: string;
  icon?: string;
  // Tags representing what this resource advocates for or is about
  advocacyTags: string[];
}

// Simplified Database of Resources with Advocacy Tags
// This should be significantly expanded and curated.
const RESOURCE_DATABASE: ResourceDatabaseEntry[] = [
  {
    name: 'Peace Action',
    url: 'https://www.peaceaction.org/',
    description: 'Works to promote peace and demilitarization through grassroots organizing and advocacy.',
    icon: 'Peace', // Placeholder if Peace icon existed, use HandHeart or similar
    advocacyTags: ['peace', 'military_spending_cut', 'anti_war', 'israel_aid_cut', 'nuclear_disarmament'],
  },
  {
    name: 'Friends Committee on National Legislation (FCNL)',
    url: 'https://www.fcnl.org/',
    description: 'A Quaker lobby in the public interest, working for peace, justice, and environmental stewardship.',
    icon: 'Scale',
    advocacyTags: ['peace', 'social_justice', 'diplomacy_fund', 'foreign_aid_reform', 'military_spending_cut'],
  },
  {
    name: 'Win Without War',
    url: 'https://winwithoutwar.org/',
    description: 'Advocates for a more progressive U.S. foreign policy centered on diplomacy and demilitarization.',
    icon: 'Globe',
    advocacyTags: ['anti_war', 'diplomacy_fund', 'military_spending_cut', 'foreign_aid_fund'],
  },
  {
    name: 'Council for a Livable World',
    url: 'https://livableworld.org/',
    description: 'Advocates for policies to reduce the danger of nuclear weapons and promote national security.',
    icon: 'ShieldAlert',
    advocacyTags: ['nuclear_disarmament', 'national_security_reform', 'arms_control'],
  },
  {
    name: 'US Campaign for Palestinian Rights (USCPR)',
    url: 'https://uscpr.org/',
    description: 'A national coalition working for Palestinian rights and an end to U.S. support for Israeli occupation.',
    icon: 'Landmark', // Or similar that represents rights/justice
    advocacyTags: ['palestinian_rights', 'israel_aid_cut', 'middle_east_peace'],
  },
  {
    name: 'Jewish Voice for Peace (JVP)',
    url: 'https://www.jewishvoiceforpeace.org/',
    description: 'A progressive Jewish anti-Zionist organization working for peace, justice, and human rights.',
    icon: 'Users',
    advocacyTags: ['palestinian_rights', 'israel_aid_cut', 'anti_war', 'social_justice'],
  },
  {
    name: 'National Priorities Project (Institute for Policy Studies)',
    url: 'https://nationalpriorities.org/',
    description: 'Analyzes and advocates for a federal budget that prioritizes peace, economic opportunity, and a healthy environment.',
    icon: 'PieChart',
    advocacyTags: ['budget_reform', 'military_spending_cut', 'social_spending_fund', 'tax_fairness'],
  },
  {
    name: 'Taxpayers for Common Sense',
    url: 'https://www.taxpayer.net/',
    description: 'A non-partisan budget watchdog organization working to ensure taxpayer dollars are spent responsibly.',
    icon: 'SearchCheck',
    advocacyTags: ['fiscal_responsibility', 'budget_reform', 'wasteful_spending_cut'],
  },
  {
    name: 'Project On Government Oversight (POGO)',
    url: 'https://www.pogo.org/',
    description: 'A nonpartisan independent watchdog that investigates and exposes waste, corruption, abuse of power, and when the government fails to serve the public or silences those who report wrongdoing.',
    icon: 'Eye',
    advocacyTags: ['government_accountability', 'pentagon_contractors_review', 'whistleblower_protection'],
  },
  {
    name: 'Center for International Policy (CIP)',
    url: 'https://www.internationalpolicy.org/',
    description: 'Promotes a U.S. foreign policy based on international cooperation, demilitarization, and respect for human rights.',
    icon: 'Globe2',
    advocacyTags: ['foreign_policy_reform', 'diplomacy_fund', 'arms_control', 'human_rights'],
  },
  // Health focused
  {
    name: 'Physicians for a National Health Program (PNHP)',
    url: 'https://pnhp.org/',
    description: 'Advocates for a universal, comprehensive single-payer national health program.',
    icon: 'HeartPulse',
    advocacyTags: ['medicare_fund', 'healthcare_reform', 'single_payer'],
  },
  {
    name: 'National Alliance on Mental Illness (NAMI)',
    url: 'https://www.nami.org/',
    description: 'The nation’s largest grassroots mental health organization dedicated to building better lives for the millions of Americans affected by mental illness.',
    icon: 'Brain',
    advocacyTags: ['mental_health_fund', 'substance_mental_health_fund'],
  },
  // Environmental
  {
    name: 'Environmental Working Group (EWG)',
    url: 'https://www.ewg.org/',
    description: 'A non-profit, non-partisan organization dedicated to protecting human health and the environment.',
    icon: 'Leaf',
    advocacyTags: ['epa_fund', 'environmental_protection', 'toxic_chemicals_cut'],
  },
  {
    name: 'Climate Action Network',
    url: 'https://climatenetwork.org/', // International, but good for awareness
    description: 'A global network of NGOs working to promote government and individual action to limit human-induced climate change.',
    icon: 'CloudSun',
    advocacyTags: ['climate_action_fund', 'usaid_climate_fund', 'renewable_energy_fund'],
  },
  // NASA / Science
  {
    name: 'The Planetary Society',
    url: 'https://www.planetary.org/',
    description: 'Empowers the world\'s citizens to advance space science and exploration.',
    icon: 'Rocket',
    advocacyTags: ['nasa_fund', 'science_fund', 'space_exploration'],
  },
  {
    name: 'Union of Concerned Scientists',
    url: 'https://www.ucsusa.org/',
    description: 'Puts rigorous, independent science to work to solve our planet\'s most pressing problems.',
    icon: 'FlaskConical',
    advocacyTags: ['science_fund', 'environmental_protection', 'nuclear_weapons_review'],
  },
  // Budget Balancing / Debt
  {
    name: 'Committee for a Responsible Federal Budget (CRFB)',
    url: 'https://www.crfb.org/',
    description: 'A nonpartisan, non-profit organization committed to educating the public and policymakers about fiscal policy issues.',
    icon: 'Banknote',
    advocacyTags: ['fiscal_responsibility', 'debt_reduction', 'budget_reform'],
  },
  {
    name: 'Peter G. Peterson Foundation',
    url: 'https://www.pgpf.org/',
    description: 'Dedicated to increasing awareness of the nature and urgency of key fiscal challenges threatening America\'s future and accelerating action on them.',
    icon: 'TrendingUp',
    advocacyTags: ['fiscal_responsibility', 'debt_reduction', 'economic_stability'],
  }
];


function getItemAdvocacyTag(itemId: string, fundingAction: FundingAction): string {
  // Maps specific item IDs and actions to more generic advocacy tags.
  // This needs to be comprehensive and match tags in RESOURCE_DATABASE.
  // Example: 'israel_wars' + 'slash' -> 'israel_aid_cut'
  // 'medicare' + 'fund' -> 'medicare_fund'

  if (itemId.includes('israel_wars') && fundingAction === 'slash') return 'israel_aid_cut';
  if (itemId.includes('medicare') && fundingAction === 'fund') return 'medicare_fund';
  if (itemId.includes('pentagon') && fundingAction === 'slash') return 'military_spending_cut';
  if (itemId.includes('pentagon_contractors') && fundingAction === 'review') return 'pentagon_contractors_review';
  if (itemId.includes('climate') && fundingAction === 'fund') return 'climate_action_fund';
  if (itemId.includes('nasa') && fundingAction === 'fund') return 'nasa_fund';
  if (itemId.includes('nasa_spacex') && fundingAction === 'slash') return 'nasa_spacex_cut_review'; // Generic review/cut
  if (itemId.includes('epa') && fundingAction === 'fund') return 'epa_fund';
  if (itemId.includes('substance_mental_health') && fundingAction === 'fund') return 'mental_health_fund';


  // General tags based on category if specific item doesn't map
  if (itemId.toLowerCase().includes('defense') || itemId.toLowerCase().includes('military') || itemId.toLowerCase().includes('pentagon')) {
    if (fundingAction === 'slash') return 'military_spending_cut';
    if (fundingAction === 'review') return 'defense_spending_review';
  }
  if (itemId.toLowerCase().includes('health')) {
    if (fundingAction === 'fund') return 'healthcare_fund';
    if (fundingAction === 'slash') return 'healthcare_reform'; // Broader term
  }
  // Add more mappings as needed

  return `${itemId}_${fundingAction}`; // Fallback to a more specific tag
}

export async function suggestResources(
  selectedItems: UserSelectedItem[],
  aggressiveness: number,
  balanceBudgetChecked: boolean
): Promise<SuggestedResource[]> {
  const userTone = toneBucket(aggressiveness);
  const suggestions: SuggestedResource[] = [];
  const suggestedUrls = new Set<string>(); // To avoid duplicate suggestions

  const userAdvocacyTags = new Set<string>();

  selectedItems.forEach(item => {
    let action: FundingAction = 'review';
    if (item.fundingLevel < 0) action = 'slash';
    else if (item.fundingLevel > 0) action = 'fund';
    userAdvocacyTags.add(getItemAdvocacyTag(item.id, action));
  });

  if (balanceBudgetChecked) {
    userAdvocacyTags.add('fiscal_responsibility');
    userAdvocacyTags.add('debt_reduction');
  }

  RESOURCE_DATABASE.forEach(resource => {
    const matchingTags = resource.advocacyTags.filter(tag => userAdvocacyTags.has(tag));
    if (matchingTags.length > 0 && !suggestedUrls.has(resource.url)) {
      let relevanceReason = `This organization's work on ${matchingTags.join(', ').replace(/_/g, ' ')} aligns with your stated concerns.`;
      if (userTone > 1 && matchingTags.some(tag => tag.includes('cut') || tag.includes('slash'))) {
        relevanceReason = `Given your strong stance, ${resource.name} actively campaigns on issues like ${matchingTags.filter(t => t.includes('cut') || t.includes('slash')).join(', ').replace(/_/g, ' ')}.`;
      } else if (userTone < 2 && matchingTags.some(tag => tag.includes('fund'))) {
         relevanceReason = `${resource.name} advocates for increased support in areas like ${matchingTags.filter(t => t.includes('fund')).join(', ').replace(/_/g, ' ')}, reflecting your priorities.`;
      }


      suggestions.push({
        name: resource.name,
        url: resource.url,
        description: resource.description,
        relevance: relevanceReason,
        icon: resource.icon,
      });
      suggestedUrls.add(resource.url);
    }
  });

  // Limit to a reasonable number of suggestions
  return suggestions.slice(0, 5);
}
