'use server';
/**
 * @fileOverview Service for suggesting relevant resources and organizations
 * based on user's email customization choices (selected items, funding levels, tone).
 */

import type { SelectedItem as UserSelectedItem } from '@/services/tax-spending';
import { toneBucket } from '@/services/email/utils';

export interface SuggestedResource {
  name: string;
  url: string;
  description: string;
  relevance: string;
  icon?: string;
}

type FundingAction = 'slash' | 'fund' | 'review';

interface ResourceDatabaseEntry {
  name: string;
  url: string;
  description: string;
  icon?: string;
  advocacyTags: string[]; // Tags representing what this resource advocates for or is about
}

// Expanded Database of Resources with Advocacy Tags
const RESOURCE_DATABASE: ResourceDatabaseEntry[] = [
  // Peace & Demilitarization
  {
    name: 'Peace Action',
    url: 'https://www.peaceaction.org/',
    description: 'Works to promote peace and demilitarization through grassroots organizing and advocacy.',
    icon: 'HandHeart', // Using HandHeart as a stand-in for Peace
    advocacyTags: ['peace', 'military_spending_cut', 'anti_war', 'israel_aid_cut', 'nuclear_disarmament', 'demilitarization', 'diplomacy_first'],
  },
  {
    name: 'Friends Committee on National Legislation (FCNL)',
    url: 'https://www.fcnl.org/',
    description: 'A Quaker lobby in the public interest, working for peace, justice, and environmental stewardship.',
    icon: 'Scale',
    advocacyTags: ['peace', 'social_justice', 'diplomacy_fund', 'foreign_aid_reform', 'military_spending_cut', 'environmental_stewardship', 'human_rights'],
  },
  {
    name: 'Win Without War',
    url: 'https://winwithoutwar.org/',
    description: 'Advocates for a more progressive U.S. foreign policy centered on diplomacy and demilitarization.',
    icon: 'Globe',
    advocacyTags: ['anti_war', 'diplomacy_fund', 'military_spending_cut', 'foreign_aid_fund', 'foreign_policy_reform', 'demilitarization'],
  },
  {
    name: 'Council for a Livable World',
    url: 'https://livableworld.org/',
    description: 'Advocates for policies to reduce the danger of nuclear weapons and promote national security.',
    icon: 'ShieldAlert', // Or Bomb
    advocacyTags: ['nuclear_disarmament', 'national_security_reform', 'arms_control', 'nuclear_weapons_review'],
  },
  {
    name: 'Center for International Policy (CIP)',
    url: 'https://www.internationalpolicy.org/',
    description: 'Promotes a U.S. foreign policy based on international cooperation, demilitarization, and respect for human rights.',
    icon: 'Globe2',
    advocacyTags: ['foreign_policy_reform', 'diplomacy_fund', 'arms_control', 'human_rights', 'demilitarization'],
  },
  // Middle East / Palestine
  {
    name: 'US Campaign for Palestinian Rights (USCPR)',
    url: 'https://uscpr.org/',
    description: 'A national coalition working for Palestinian rights and an end to U.S. support for Israeli occupation.',
    icon: 'Landmark',
    advocacyTags: ['palestinian_rights', 'israel_aid_cut', 'middle_east_peace', 'human_rights'],
  },
  {
    name: 'Jewish Voice for Peace (JVP)',
    url: 'https://www.jewishvoiceforpeace.org/',
    description: 'A progressive Jewish anti-Zionist organization working for peace, justice, and human rights.',
    icon: 'Users',
    advocacyTags: ['palestinian_rights', 'israel_aid_cut', 'anti_war', 'social_justice', 'human_rights'],
  },
  {
    name: 'American-Arab Anti-Discrimination Committee (ADC)',
    url: 'https://www.adc.org/',
    description: 'Defends the rights of people of Arab descent and promotes their rich cultural heritage.',
    icon: 'Users2',
    advocacyTags: ['civil_rights', 'anti_discrimination', 'middle_east_peace', 'palestinian_rights'],
  },
  // Budget & Fiscal Responsibility
  {
    name: 'National Priorities Project (Institute for Policy Studies)',
    url: 'https://nationalpriorities.org/',
    description: 'Analyzes and advocates for a federal budget that prioritizes peace, economic opportunity, and a healthy environment.',
    icon: 'PieChart',
    advocacyTags: ['budget_reform', 'military_spending_cut', 'social_spending_fund', 'tax_fairness', 'fiscal_responsibility', 'pentagon_review'],
  },
  {
    name: 'Taxpayers for Common Sense',
    url: 'https://www.taxpayer.net/',
    description: 'A non-partisan budget watchdog organization working to ensure taxpayer dollars are spent responsibly.',
    icon: 'SearchCheck',
    advocacyTags: ['fiscal_responsibility', 'budget_reform', 'wasteful_spending_cut', 'government_accountability', 'pentagon_contractors_cut', 'f35_cut', 'nasa_spacex_cut_review'],
  },
  {
    name: 'Project On Government Oversight (POGO)',
    url: 'https://www.pogo.org/',
    description: 'A nonpartisan independent watchdog that investigates and exposes waste, corruption, and abuse of power.',
    icon: 'Eye',
    advocacyTags: ['government_accountability', 'pentagon_contractors_review', 'whistleblower_protection', 'wasteful_spending_cut', 'pentagon_review'],
  },
  {
    name: 'Committee for a Responsible Federal Budget (CRFB)',
    url: 'https://www.crfb.org/',
    description: 'A nonpartisan, non-profit organization committed to educating the public and policymakers about fiscal policy issues.',
    icon: 'Banknote',
    advocacyTags: ['fiscal_responsibility', 'debt_reduction', 'budget_reform', 'entitlement_reform_review'],
  },
  {
    name: 'Peter G. Peterson Foundation',
    url: 'https://www.pgpf.org/',
    description: 'Dedicated to increasing awareness of the nature and urgency of key fiscal challenges threatening America\'s future.',
    icon: 'TrendingUp',
    advocacyTags: ['fiscal_responsibility', 'debt_reduction', 'economic_stability', 'budget_reform'],
  },
  // Health
  {
    name: 'Physicians for a National Health Program (PNHP)',
    url: 'https://pnhp.org/',
    description: 'Advocates for a universal, comprehensive single-payer national health program.',
    icon: 'HeartPulse',
    advocacyTags: ['medicare_fund', 'medicaid_fund', 'healthcare_reform', 'single_payer', 'health_equity'],
  },
  {
    name: 'National Alliance on Mental Illness (NAMI)',
    url: 'https://www.nami.org/',
    description: 'The nation’s largest grassroots mental health organization dedicated to building better lives for Americans affected by mental illness.',
    icon: 'Brain',
    advocacyTags: ['mental_health_fund', 'substance_mental_health_fund', 'health_equity'],
  },
  {
    name: 'Families USA',
    url: 'https://familiesusa.org/',
    description: 'A national nonpartisan consumer health advocacy organization.',
    icon: 'Users',
    advocacyTags: ['healthcare_access', 'medicaid_fund', 'medicare_fund', 'health_equity', 'affordable_care_act_fund'],
  },
  {
    name: 'Center on Budget and Policy Priorities (CBPP) - Health',
    url: 'https://www.cbpp.org/research/health',
    description: 'Researches and advocates for policies that reduce poverty and inequality, including in healthcare.',
    icon: 'Activity',
    advocacyTags: ['medicaid_fund', 'affordable_care_act_fund', 'health_equity', 'social_spending_fund'],
  },
  {
    name: 'Kaiser Family Foundation (KFF)',
    url: 'https://www.kff.org/',
    description: 'A non-profit organization focusing on national health issues, as well as the U.S. role in global health policy. (Research, not advocacy)',
    icon: 'FileText',
    advocacyTags: ['health_research', 'medicare_review', 'medicaid_review', 'health_policy_analysis'],
  },
  // Environmental
  {
    name: 'Environmental Working Group (EWG)',
    url: 'https://www.ewg.org/',
    description: 'A non-profit, non-partisan organization dedicated to protecting human health and the environment.',
    icon: 'Leaf',
    advocacyTags: ['epa_fund', 'environmental_protection', 'toxic_chemicals_cut', 'sustainable_agriculture_fund'],
  },
  {
    name: 'Climate Action Network International',
    url: 'https://climatenetwork.org/',
    description: 'A global network of NGOs working to promote government and individual action to limit human-induced climate change.',
    icon: 'CloudSun',
    advocacyTags: ['climate_action_fund', 'usaid_climate_fund', 'renewable_energy_fund', 'environmental_justice'],
  },
  {
    name: 'Sierra Club',
    url: 'https://www.sierraclub.org/',
    description: 'Grassroots environmental organization in the United States. Founded by legendary conservationist John Muir in 1892.',
    icon: 'Mountain',
    advocacyTags: ['environmental_protection', 'climate_action_fund', 'renewable_energy_fund', 'nps_fund', 'forest_service_fund', 'wilderness_protection'],
  },
  {
    name: 'Natural Resources Defense Council (NRDC)',
    url: 'https://www.nrdc.org/',
    description: 'Works to safeguard the earth—its people, its plants and animals, and the natural systems on which all life depends.',
    icon: 'Trees',
    advocacyTags: ['environmental_protection', 'epa_fund', 'climate_action_fund', 'ocean_conservation', 'renewable_energy_fund'],
  },
  // Science & Technology
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
    advocacyTags: ['science_fund', 'environmental_protection', 'nuclear_weapons_review', 'scientific_integrity', 'climate_action_fund'],
  },
  {
    name: 'Federation of American Scientists (FAS)',
    url: 'https://fas.org/',
    description: 'Provides science-based analysis of and solutions to protect against catastrophic threats to national and international security.',
    icon: 'Microscope',
    advocacyTags: ['science_policy', 'national_security_reform', 'arms_control', 'nuclear_weapons_review', 'emerging_tech_review'],
  },
  // General Government Oversight / Social Justice
  {
    name: 'American Civil Liberties Union (ACLU)',
    url: 'https://www.aclu.org/',
    description: 'Works to defend and preserve the individual rights and liberties guaranteed by the Constitution and laws of the United States.',
    icon: 'Gavel',
    advocacyTags: ['civil_rights', 'civil_liberties', 'immigration_reform_review', 'criminal_justice_reform', 'government_accountability', 'deportations_border_review', 'federal_prisons_review'],
  },
  {
    name: 'Common Cause',
    url: 'https://www.commoncause.org/',
    description: 'A nonpartisan grassroots organization dedicated to upholding the core values of American democracy.',
    icon: 'Vote',
    advocacyTags: ['democracy_reform', 'voting_rights', 'campaign_finance_reform', 'government_accountability'],
  },
  {
    name: 'Brennan Center for Justice',
    url: 'https://www.brennancenter.org/',
    description: 'A nonpartisan law and policy institute that works to reform, revitalize, and when necessary, defend our country’s systems of democracy and justice.',
    icon: 'Library',
    advocacyTags: ['democracy_reform', 'voting_rights', 'criminal_justice_reform', 'campaign_finance_reform'],
  },
  // Education
  {
    name: 'National Education Association (NEA)',
    url: 'https://www.nea.org/',
    description: 'The nation\'s largest professional employee organization, committed to advancing the cause of public education.',
    icon: 'School',
    advocacyTags: ['education_fund', 'k12_schools_fund', 'teacher_support', 'public_education'],
  },
  {
    name: 'The Education Trust',
    url: 'https://edtrust.org/',
    description: 'Works to close opportunity gaps that disproportionately affect students of color and students from low-income backgrounds.',
    icon: 'GraduationCap',
    advocacyTags: ['education_equity', 'k12_schools_fund', 'college_aid_fund', 'achievement_gap'],
  },
  // Specific Program Focus
  {
    name: 'Security Policy Reform Institute (SPRI)',
    url: 'https://securityreform.org/',
    description: 'Provides research and analysis to promote responsible U.S. foreign and national security policy.',
    icon: 'ShieldCheck',
    advocacyTags: ['foreign_policy_reform', 'national_security_reform', 'pentagon_review', 'arms_control', 'military_spending_cut'],
  },
   {
    name: 'Demand Progress',
    url: 'https://demandprogress.org/',
    description: 'Fights for a more just and democratic world by campaigning for progressive policies on issues such as civil liberties, government reform, and tech policy.',
    icon: 'Megaphone',
    advocacyTags: ['civil_liberties', 'government_accountability', 'tech_policy_reform', 'nasa_spacex_cut_review']
  },
  {
    name: 'Center for Defense Information (CDI) at POGO',
    url: 'https://www.pogo.org/program/center-for-defense-information/',
    description: 'Works to secure far-reaching reforms in U.S. national security policy, dedicated to strong, sensible, and sustainable national security.',
    icon: 'Search',
    advocacyTags: ['pentagon_review', 'military_spending_cut', 'f35_review', 'national_security_reform', 'pentagon_contractors_review']
  },
];


function getItemAdvocacyTags(itemId: string, fundingAction: FundingAction): string[] {
  const tags: string[] = [];
  const idLower = itemId.toLowerCase();

  // General category mapping
  if (idLower.includes('pentagon') || idLower.includes('military') || idLower.includes('defense') || idLower.includes('f35') || idLower.includes('nuclear_weapons') || idLower.includes('israel_wars') || idLower.includes('foreign_military_aid')) {
    tags.push('defense_spending');
    if (fundingAction === 'slash') tags.push('military_spending_cut', 'demilitarization');
    if (fundingAction === 'fund') tags.push('military_spending_fund');
    if (fundingAction === 'review') tags.push('pentagon_review', 'national_security_reform');
  }
  if (idLower.includes('health') || idLower.includes('medicare') || idLower.includes('medicaid') || idLower.includes('cdc') || idLower.includes('nih') || idLower.includes('substance_mental_health')) {
    tags.push('health_policy');
    if (fundingAction === 'fund') tags.push('healthcare_fund', 'social_spending_fund');
    if (fundingAction === 'slash') tags.push('healthcare_reform', 'health_spending_cut');
    if (fundingAction === 'review') tags.push('healthcare_review');
  }
   if (idLower.includes('education') || idLower.includes('k12_schools') || idLower.includes('college_aid') || idLower.includes('head_start')) {
    tags.push('education_policy');
    if (fundingAction === 'fund') tags.push('education_fund', 'social_spending_fund');
    if (fundingAction === 'slash') tags.push('education_spending_cut');
  }
  if (idLower.includes('environment') || idLower.includes('epa') || idLower.includes('climate') || idLower.includes('renewable_energy') || idLower.includes('forest_service') || idLower.includes('nps') || idLower.includes('noaa')) {
    tags.push('environmental_policy');
    if (fundingAction === 'fund') tags.push('environmental_protection', 'climate_action_fund');
    if (fundingAction === 'slash') tags.push('environmental_spending_cut');
  }


  // Specific item mappings - these are more precise
  const specificMappings: Record<string, Partial<Record<FundingAction, string[]>>> = {
    'israel_wars': { slash: ['israel_aid_cut', 'middle_east_peace'], review: ['israel_aid_review'] },
    'pentagon_contractors': { slash: ['pentagon_contractors_cut'], review: ['pentagon_contractors_review', 'government_accountability'] },
    'nasa_spacex': { slash: ['nasa_spacex_cut_review', 'wasteful_spending_cut'], review: ['nasa_spacex_cut_review', 'government_accountability'] },
    'medicare': { fund: ['medicare_fund'], slash: ['medicare_reform_cut'], review:['medicare_review']},
    'medicaid': { fund: ['medicaid_fund'], review: ['medicaid_review'] },
    'cdc': { fund: ['cdc_fund'], review: ['cdc_review'] },
    'nih': { fund: ['nih_fund'], review: ['nih_review'] },
    'substance_mental_health': { fund: ['mental_health_fund', 'substance_mental_health_fund'], review: ['mental_health_review'] },
    'foreign_military_aid': { slash: ['foreign_aid_cut', 'demilitarization'], review: ['foreign_aid_reform']},
    'nuclear_weapons': {slash: ['nuclear_disarmament'], review: ['nuclear_weapons_review', 'arms_control']}
  };

  if (specificMappings[itemId] && specificMappings[itemId][fundingAction]) {
    tags.push(...specificMappings[itemId][fundingAction]!);
  } else if (specificMappings[itemId]) { // if action doesn't match but item does, add a general review tag for item
     tags.push(`${itemId}_review`);
  }


  // Fallback to item_action if no specific or general category tags were added
  if (tags.length === 0) {
    tags.push(`${itemId}_${fundingAction}`);
  }
  return Array.from(new Set(tags)); // Return unique tags
}

export async function suggestResources(
  selectedItems: UserSelectedItem[],
  aggressiveness: number,
  balanceBudgetChecked: boolean
): Promise<SuggestedResource[]> {
  const userTone = toneBucket(aggressiveness);
  const suggestions: SuggestedResource[] = [];
  const suggestedUrls = new Set<string>();

  const userAdvocacyTags = new Set<string>();

  selectedItems.forEach(item => {
    let action: FundingAction = 'review';
    if (item.fundingLevel < -0.5) action = 'slash'; // -2, -1
    else if (item.fundingLevel > 0.5) action = 'fund'; // 1, 2
    // fundingLevel 0 is 'review'
    getItemAdvocacyTags(item.id, action).forEach(tag => userAdvocacyTags.add(tag));
  });

  if (balanceBudgetChecked) {
    userAdvocacyTags.add('fiscal_responsibility');
    userAdvocacyTags.add('debt_reduction');
    userAdvocacyTags.add('budget_reform');
  }

  // Score resources based on tag matches
  const scoredResources = RESOURCE_DATABASE.map(resource => {
    let score = 0;
    const matchedTags: string[] = [];
    resource.advocacyTags.forEach(tag => {
      if (userAdvocacyTags.has(tag)) {
        score++;
        matchedTags.push(tag.replace(/_/g, ' ')); // For relevance string
      }
    });
    return { ...resource, score, matchedTags };
  }).filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score); // Sort by highest score


  for (const resource of scoredResources) {
    if (suggestions.length >= 5) break; // Max 5 suggestions
    if (suggestedUrls.has(resource.url)) continue;

    let relevanceReason = `This organization's work on ${resource.matchedTags.slice(0, 2).join(' and ')} aligns with your stated concerns.`;
    if (resource.score > 1 && resource.matchedTags.length > 2) {
         relevanceReason = `With a focus on ${resource.matchedTags.slice(0,2).join(', ')}, and other areas you highlighted, ${resource.name} could be a relevant group for you.`;
    }

    if (balanceBudgetChecked && resource.advocacyTags.some(t => ['fiscal_responsibility', 'debt_reduction', 'budget_reform'].includes(t))) {
        if (userTone > 1) {
            relevanceReason = `Given your strong stance on balancing the budget, ${resource.name} actively campaigns for fiscal responsibility.`;
        } else {
            relevanceReason = `Since you're interested in balancing the budget, ${resource.name} focuses on fiscal policy and responsible spending.`;
        }
    } else if (resource.matchedTags.length > 0) {
        const primaryConcern = resource.matchedTags[0];
        if (userTone > 1 && (primaryConcern.includes('cut') || primaryConcern.includes('slash') || primaryConcern.includes('reform'))) {
            relevanceReason = `Given your strong stance, ${resource.name} actively campaigns on issues like ${primaryConcern}.`;
        } else if (userTone < 2 && primaryConcern.includes('fund')) {
            relevanceReason = `${resource.name} advocates for increased support in areas like ${primaryConcern}, reflecting your priorities.`;
        }
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

  return suggestions;
}

    