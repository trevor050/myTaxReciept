
'use server';
/**
 * @fileOverview Service for suggesting relevant resources and organizations
 * based on user's email customization choices (selected items, funding levels, tone).
 */

import type { SelectedItem as UserSelectedItem } from '@/services/tax-spending';
import { cleanItemDescription } from '@/services/email/utils';
import type { Tone } from './email/types';


export interface MatchedReason {
  type: 'supports' | 'opposes' | 'reviews' | 'general';
  description: string;
  originalConcern: string;
  actionableTag: string; // The specific tag from the resource that matched
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
  | 'Established Voice';

export interface SuggestedResource {
  name: string;
  url: string;
  description: string;
  overallRelevance: string; // AI-generated summary of why it's relevant
  icon?: string;
  matchCount?: number; // How many of the user's distinct concerns it matches
  matchedReasons?: MatchedReason[];
  badges?: BadgeType[];
  mainCategory: string; // For filtering in the modal
}

type FundingAction = 'slash' | 'fund' | 'review';

interface ResourceDatabaseEntry {
  name: string;
  url: string;
  description: string;
  icon?: string;
  advocacyTags: string[]; // Keywords representing what the org advocates for/against
  mainCategory: string; // Broad category for filtering
  prominence?: 'high' | 'medium' | 'low'; // Subjective measure of influence/size
  focusType?: 'broad' | 'niche'; // Scope of issues covered
  orgTypeTags?: ('grassroots' | 'research' | 'legal' | 'established')[]; // For new badge types
}

// Expanded RESOURCE_DATABASE with more organizations and orgTypeTags
const RESOURCE_DATABASE: ResourceDatabaseEntry[] = [
  // Peace & Demilitarization
  {
    name: 'Peace Action',
    url: 'https://www.peaceaction.org/',
    description: 'Works to promote peace and demilitarization through grassroots organizing and advocacy.',
    icon: 'HandHeart',
    mainCategory: 'Peace & Demilitarization',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established'],
    advocacyTags: ['peace', 'military_spending_cut', 'anti_war', 'israel_aid_cut', 'nuclear_disarmament', 'demilitarization', 'diplomacy_first', 'foreign_military_aid_cut', 'pentagon_cut', 'israel_wars_cut'],
  },
  {
    name: 'Friends Committee on National Legislation (FCNL)',
    url: 'https://www.fcnl.org/',
    description: 'A Quaker lobby in the public interest, working for peace, justice, and environmental stewardship.',
    icon: 'Scale',
    mainCategory: 'Peace & Social Justice',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established'],
    advocacyTags: ['peace', 'social_justice', 'diplomacy_fund', 'foreign_aid_reform', 'military_spending_cut', 'environmental_stewardship', 'human_rights', 'federal_prisons_review', 'criminal_justice_reform', 'pentagon_review'],
  },
  {
    name: 'Win Without War',
    url: 'https://winwithoutwar.org/',
    description: 'Advocates for a more progressive U.S. foreign policy centered on diplomacy and demilitarization.',
    icon: 'Globe',
    mainCategory: 'Peace & Demilitarization',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['grassroots'],
    advocacyTags: ['anti_war', 'diplomacy_fund', 'military_spending_cut', 'foreign_aid_fund', 'foreign_policy_reform', 'demilitarization', 'usaid_fund', 'israel_wars_review'],
  },
  {
    name: 'Council for a Livable World',
    url: 'https://livableworld.org/',
    description: 'Advocates for policies to reduce the danger of nuclear weapons and promote national security.',
    icon: 'ShieldAlert',
    mainCategory: 'Peace & Demilitarization',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['research', 'established'],
    advocacyTags: ['nuclear_disarmament', 'national_security_reform', 'arms_control', 'nuclear_weapons_review', 'nuclear_weapons_cut', 'pentagon_review'],
  },
  // Middle East / Palestine
  {
    name: 'US Campaign for Palestinian Rights (USCPR)',
    url: 'https://uscpr.org/',
    description: 'A national coalition working for Palestinian rights and an end to U.S. support for Israeli occupation.',
    icon: 'Landmark',
    mainCategory: 'Human Rights & Regional Conflicts',
    prominence: 'high',
    focusType: 'niche',
    orgTypeTags: ['grassroots'],
    advocacyTags: ['palestinian_rights', 'israel_aid_cut', 'middle_east_peace', 'human_rights', 'israel_wars_cut', 'foreign_military_aid_cut'],
  },
  {
    name: 'Jewish Voice for Peace (JVP)',
    url: 'https://www.jewishvoiceforpeace.org/',
    description: 'A progressive Jewish anti-Zionist organization working for peace, justice, and human rights.',
    icon: 'Users',
    mainCategory: 'Human Rights & Regional Conflicts',
    prominence: 'high',
    focusType: 'niche',
    orgTypeTags: ['grassroots'],
    advocacyTags: ['palestinian_rights', 'israel_aid_cut', 'anti_war', 'social_justice', 'human_rights', 'israel_wars_cut'],
  },
  // Budget & Fiscal Responsibility
  {
    name: 'National Priorities Project (Institute for Policy Studies)',
    url: 'https://nationalpriorities.org/',
    description: 'Analyzes and advocates for a federal budget that prioritizes peace, economic opportunity, and a healthy environment.',
    icon: 'PieChart',
    mainCategory: 'Fiscal Responsibility',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'data-driven'],
    advocacyTags: ['budget_reform', 'military_spending_cut', 'social_spending_fund', 'tax_fairness', 'fiscal_responsibility', 'pentagon_review', 'interest_debt_review', 'pentagon_cut', 'f35_cut', 'nuclear_weapons_cut'],
  },
  {
    name: 'Taxpayers for Common Sense',
    url: 'https://www.taxpayer.net/',
    description: 'A non-partisan budget watchdog organization working to ensure taxpayer dollars are spent responsibly.',
    icon: 'SearchCheck',
    mainCategory: 'Fiscal Responsibility',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'established', 'data-driven'],
    advocacyTags: ['fiscal_responsibility', 'budget_reform', 'wasteful_spending_cut', 'government_accountability', 'pentagon_contractors_cut', 'f35_cut', 'nasa_spacex_cut_review', 'farm_subsidies_cut', 'interest_debt_review', 'fsa_cut', 'pentagon_cut', 'usps_cut'],
  },
  {
    name: 'Project On Government Oversight (POGO)',
    url: 'https://www.pogo.org/',
    description: 'A nonpartisan independent watchdog that investigates and exposes waste, corruption, and abuse of power.',
    icon: 'Eye',
    mainCategory: 'Government Accountability',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'data-driven', 'established'],
    advocacyTags: ['government_accountability', 'pentagon_contractors_review', 'whistleblower_protection', 'wasteful_spending_cut', 'pentagon_review', 'f35_review', 'pentagon_cut', 'irs_review', 'cfpb_review'],
  },
  {
    name: 'Committee for a Responsible Federal Budget (CRFB)',
    url: 'https://www.crfb.org/',
    description: 'A nonpartisan, non-profit organization committed to educating the public and policymakers about fiscal policy issues.',
    icon: 'Banknote',
    mainCategory: 'Fiscal Responsibility',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'established', 'data-driven'],
    advocacyTags: ['fiscal_responsibility', 'debt_reduction', 'budget_reform', 'entitlement_reform_review', 'interest_debt_review', 'tax_reform_review', 'medicare_review', 'medicaid_review', 'snap_review', 'child_tax_credit_review'],
  },
  // Health
  {
    name: 'Physicians for a National Health Program (PNHP)',
    url: 'https://pnhp.org/',
    description: 'Advocates for a universal, comprehensive single-payer national health program.',
    icon: 'HeartPulse',
    mainCategory: 'Healthcare',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['grassroots'],
    advocacyTags: ['medicare_fund', 'medicaid_fund', 'healthcare_reform', 'single_payer', 'health_equity', 'nih_fund'],
  },
  {
    name: 'National Alliance on Mental Illness (NAMI)',
    url: 'https://www.nami.org/',
    description: 'The nation’s largest grassroots mental health organization dedicated to building better lives for Americans affected by mental illness.',
    icon: 'Brain',
    mainCategory: 'Healthcare',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established'],
    advocacyTags: ['mental_health_fund', 'substance_mental_health_fund', 'health_equity', 'cdc_fund', 'nih_fund', 'va_fund'],
  },
  // Environmental
  {
    name: 'Environmental Working Group (EWG)',
    url: 'https://www.ewg.org/',
    description: 'A non-profit, non-partisan organization dedicated to protecting human health and the environment.',
    icon: 'Leaf',
    mainCategory: 'Environment & Energy',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'data-driven', 'established'],
    advocacyTags: ['epa_fund', 'environmental_protection', 'toxic_chemicals_cut', 'sustainable_agriculture_fund', 'food_safety_fund', 'water_quality_fund', 'renewable_energy_fund', 'fsa_review'],
  },
  {
    name: 'Sierra Club',
    url: 'https://www.sierraclub.org/',
    description: 'Grassroots environmental organization in the United States. Founded by legendary conservationist John Muir in 1892.',
    icon: 'Mountain',
    mainCategory: 'Environment & Energy',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established', 'legal'],
    advocacyTags: ['environmental_protection', 'climate_action_fund', 'renewable_energy_fund', 'nps_fund', 'forest_service_fund', 'wilderness_protection', 'epa_fund', 'noaa_fund', 'public_lands_fund'],
  },
  {
    name: 'Natural Resources Defense Council (NRDC)',
    url: 'https://www.nrdc.org/',
    description: 'Works to safeguard the earth—its people, its plants and animals, and the natural systems on which all life depends.',
    icon: 'Trees',
    mainCategory: 'Environment & Energy',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['legal', 'research', 'established'],
    advocacyTags: ['environmental_protection', 'epa_fund', 'climate_action_fund', 'ocean_conservation', 'renewable_energy_fund', 'noaa_fund', 'forest_service_fund', 'water_quality_fund'],
  },
  {
    name: 'Earthjustice',
    url: 'https://earthjustice.org/',
    description: 'A nonprofit public interest environmental law organization. They wield the power of law and the strength of partnership to protect people’s health, to preserve magnificent places and wildlife, to advance clean energy, and to combat climate change.',
    icon: 'Gavel',
    mainCategory: 'Environment & Energy',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['legal', 'established'],
    advocacyTags: ['environmental_law', 'epa_fund', 'climate_action_fund', 'wilderness_protection', 'renewable_energy_review', 'environmental_justice', 'ocean_conservation'],
  },
  {
    name: 'Rainforest Action Network',
    url: 'https://www.ran.org/',
    description: 'Preserves forests, protects the climate and upholds human rights by challenging corporate power and systemic injustice through frontline partnerships and strategic campaigns.',
    icon: 'Sprout',
    mainCategory: 'Environment & Energy',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'activism'],
    advocacyTags: ['forest_protection', 'climate_action_fund', 'corporate_accountability', 'human_rights', 'environmental_justice', 'fossil_fuel_subsidies_cut'],
  },
  {
    name: 'Greenpeace USA',
    url: 'https://www.greenpeace.org/usa/',
    description: 'Uses non-violent creative action to pave the way towards a greener, more peaceful world, and to confront the systems that threaten our environment.',
    icon: 'Globe',
    mainCategory: 'Environment & Energy',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'activism', 'established'],
    advocacyTags: ['environmental_protection', 'climate_action_fund', 'ocean_conservation', 'deforestation_cut', 'plastic_pollution_cut', 'renewable_energy_fund', 'epa_fund'],
  },
  // Science & Technology
  {
    name: 'The Planetary Society',
    url: 'https://www.planetary.org/',
    description: 'Empowers the world\'s citizens to advance space science and exploration.',
    icon: 'Rocket',
    mainCategory: 'Science & Technology',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['grassroots'],
    advocacyTags: ['nasa_fund', 'science_fund', 'space_exploration', 'nsf_fund', 'nasa_review', 'nasa_spacex_review'],
  },
  {
    name: 'Union of Concerned Scientists',
    url: 'https://www.ucsusa.org/',
    description: 'Puts rigorous, independent science to work to solve our planet\'s most pressing problems.',
    icon: 'FlaskConical',
    mainCategory: 'Science & Technology',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'data-driven', 'established'],
    advocacyTags: ['science_fund', 'environmental_protection', 'nuclear_weapons_review', 'scientific_integrity', 'climate_action_fund', 'sustainable_agriculture_fund', 'epa_review', 'nsf_review', 'food_safety_review'],
  },
  // General Government Oversight / Social Justice / Civil Rights
  {
    name: 'American Civil Liberties Union (ACLU)',
    url: 'https://www.aclu.org/',
    description: 'Works to defend and preserve the individual rights and liberties guaranteed by the Constitution and laws of the United States.',
    icon: 'Gavel',
    mainCategory: 'Civil Rights & Social Justice',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['legal', 'established', 'grassroots'],
    advocacyTags: ['civil_rights', 'civil_liberties', 'immigration_reform_review', 'criminal_justice_reform', 'government_accountability', 'deportations_border_review', 'federal_prisons_review', 'privacy_rights', 'nlrb_review', 'public_defenders_fund'],
  },
  {
    name: 'Common Cause',
    url: 'https://www.commoncause.org/',
    description: 'A nonpartisan grassroots organization dedicated to upholding the core values of American democracy.',
    icon: 'Vote',
    mainCategory: 'Democracy & Governance',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established'],
    advocacyTags: ['democracy_reform', 'voting_rights', 'campaign_finance_reform', 'government_accountability', 'ethics_reform', 'irs_review', 'federal_courts_review'],
  },
  {
    name: 'Brennan Center for Justice',
    url: 'https://www.brennancenter.org/',
    description: 'A nonpartisan law and policy institute that works to reform, revitalize, and when necessary, defend our country’s systems of democracy and justice.',
    icon: 'LibrarySquare',
    mainCategory: 'Democracy & Governance',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'legal', 'established'],
    advocacyTags: ['democracy_reform', 'voting_rights', 'criminal_justice_reform', 'campaign_finance_reform', 'justice_system_review', 'federal_courts_review', 'public_defenders_fund', 'federal_prisons_reform'],
  },
  {
    name: 'Electronic Frontier Foundation (EFF)',
    url: 'https://www.eff.org/',
    description: 'Defending civil liberties in the digital world. Works on issues of free speech, privacy, innovation, and consumer rights online.',
    icon: 'Wifi', // Placeholder, Wifi not in lucide, could use Lock or Shield
    mainCategory: 'Civil Rights & Social Justice',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['legal', 'research', 'established'],
    advocacyTags: ['digital_rights', 'privacy_rights', 'free_speech_online', 'surveillance_review', 'cfpb_review', 'tech_policy_reform', 'nasa_spacex_cut_review'],
  },
  {
    name: 'Center for Responsive Politics (OpenSecrets)',
    url: 'https://www.opensecrets.org/',
    description: 'Tracks money in U.S. politics and its effect on elections and public policy.',
    icon: 'DollarSign',
    mainCategory: 'Democracy & Governance',
    prominence: 'high',
    focusType: 'niche',
    orgTypeTags: ['research', 'data-driven', 'established'],
    advocacyTags: ['campaign_finance_reform', 'government_accountability', 'ethics_reform', 'lobbying_reform'],
  },
  {
    name: 'The Marshall Project',
    url: 'https://www.themarshallproject.org/',
    description: 'A nonpartisan, nonprofit news organization that seeks to create and sustain a sense of national urgency about the U.S. criminal justice system.',
    icon: 'Newspaper',
    mainCategory: 'Civil Rights & Social Justice',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['research', 'data-driven'],
    advocacyTags: ['criminal_justice_reform', 'federal_prisons_review', 'racial_justice', 'public_defenders_fund'],
  },
  {
    name: 'ProPublica',
    url: 'https://www.propublica.org/',
    description: 'An independent, nonprofit newsroom that produces investigative journalism with moral force.',
    icon: 'Search',
    mainCategory: 'Government Accountability',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'data-driven'],
    advocacyTags: ['government_accountability', 'investigative_journalism', 'corporate_accountability', 'pentagon_review', 'irs_review'],
  },
   {
    name: 'Amnesty International USA',
    url: 'https://www.amnestyusa.org/',
    description: 'Works to protect people wherever justice, freedom, truth and dignity are denied.',
    icon: 'Globe',
    mainCategory: 'Human Rights & Regional Conflicts',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established', 'activism'],
    advocacyTags: ['human_rights', 'international_justice', 'refugee_rights', 'arms_control', 'foreign_military_aid_review', 'israel_wars_review'],
  },
  {
    name: 'Human Rights Watch',
    url: 'https://www.hrw.org/',
    description: 'Defends and protects human rights worldwide. Investigates and reports on abuses, holds abusers accountable, and challenges governments and those who hold power to end abusive practices and respect international human rights law.',
    icon: 'Eye',
    mainCategory: 'Human Rights & Regional Conflicts',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'established', 'data-driven'],
    advocacyTags: ['human_rights', 'international_justice', 'accountability_for_abuses', 'war_crimes_review', 'foreign_military_aid_review', 'israel_wars_review'],
  },
  // Education
  {
    name: 'National Education Association (NEA)',
    url: 'https://www.nea.org/',
    description: 'The nation\'s largest professional employee organization, committed to advancing the cause of public education.',
    icon: 'School',
    mainCategory: 'Education',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established'],
    advocacyTags: ['education_fund', 'k12_schools_fund', 'teacher_support', 'public_education', 'college_aid_fund', 'head_start_fund', 'dept_education_fund', 'imls_fund'],
  },
  // Housing & Homelessness
  {
    name: 'National Low Income Housing Coalition (NLIHC)',
    url: 'https://nlihc.org/',
    description: 'Dedicated solely to achieving socially just public policy that ensures people with the lowest incomes in the United States have affordable and decent homes.',
    icon: 'Home',
    mainCategory: 'Housing & Community',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'grassroots', 'established'],
    advocacyTags: ['housing_affordability', 'hud_fund', 'public_housing_fund', 'homelessness_prevention', 'rental_assistance_fund', 'usich_fund', 'liheap_fund', 'social_spending_fund'],
  },
  {
    name: 'National Alliance to End Homelessness',
    url: 'https://endhomelessness.org/',
    description: 'A nonpartisan organization committed to preventing and ending homelessness in the United States.',
    icon: 'Bed',
    mainCategory: 'Housing & Community',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'established'],
    advocacyTags: ['homelessness_prevention', 'usich_fund', 'hud_fund', 'housing_first', 'rental_assistance_fund', 'public_housing_review', 'mental_health_fund'],
  },
  // Food & Agriculture
  {
    name: 'Food Research & Action Center (FRAC)',
    url: 'https://frac.org/',
    description: 'The leading national nonprofit organization working to eradicate poverty-related hunger and undernutrition in the United States.',
    icon: 'Utensils',
    mainCategory: 'Food & Agriculture',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'established'],
    advocacyTags: ['snap_fund', 'wic_fund', 'school_lunch_fund', 'anti_hunger', 'food_security', 'child_tax_credit_fund', 'social_spending_fund'],
  },
  // Veterans
  {
    name: 'Veterans of Foreign Wars (VFW)',
    url: 'https://www.vfw.org/',
    description: 'A nonprofit veterans service organization comprised of eligible veterans and military service members from the active, guard and reserve forces.',
    icon: 'Medal',
    mainCategory: 'Veterans Affairs',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established'],
    advocacyTags: ['veterans_affairs_fund', 'pact_act_fund', 'veteran_benefits', 'national_security_fund', 'pentagon_personnel_fund', 'va_fund', 'va_review'],
  },
  // Labor & Worker Rights
  {
    name: 'AFL-CIO',
    url: 'https://aflcio.org/',
    description: 'The largest federation of unions in the United States, representing more than 12.5 million working men and women.',
    icon: 'Hammer',
    mainCategory: 'Labor & Worker Rights',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established'],
    advocacyTags: ['labor_rights', 'nlrb_fund', 'worker_protections', 'fair_wages', 'job_safety', 'unemployment_labor_policy', 'tanf_fund', 'child_tax_credit_fund'],
  },
   // Immigration
  {
    name: 'National Immigration Law Center (NILC)',
    url: 'https://www.nilc.org/',
    description: 'Dedicated to defending and advancing the rights of immigrants with low income.',
    icon: 'Anchor',
    mainCategory: 'Immigration',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['legal', 'research', 'established'],
    advocacyTags: ['immigration_reform_review', 'immigrant_rights', 'deportations_border_review', 'civil_rights', 'refugee_assistance_fund', 'snap_fund', 'medicaid_fund'],
  },
  {
    name: 'American Immigration Council',
    url: 'https://www.americanimmigrationcouncil.org/',
    description: 'Works to strengthen America by shaping how America thinks about and acts towards immigrants and immigration.',
    icon: 'Globe',
    mainCategory: 'Immigration',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['research', 'established'],
    advocacyTags: ['immigration_reform_review', 'immigrant_rights', 'deportations_border_review', 'economic_contribution_immigrants', 'refugee_assistance_fund'],
  },
];


function getItemAdvocacyTags(itemId: string, fundingAction: FundingAction): string[] {
  const tags: string[] = [];
  const idLower = itemId.toLowerCase();

  // General category mapping first
  if (idLower.includes('pentagon') || idLower.includes('military') || idLower.includes('defense') || idLower.includes('f35') || idLower.includes('nuclear_weapons') || idLower.includes('israel_wars') || idLower.includes('foreign_military_aid')) {
    tags.push('defense_spending_policy');
    if (fundingAction === 'slash') tags.push('military_spending_cut', 'demilitarization');
    if (fundingAction === 'fund') tags.push('military_spending_fund', 'national_security_fund');
    if (fundingAction === 'review') tags.push('pentagon_review', 'national_security_reform');
  }
  if (idLower.includes('health') || idLower.includes('medicare') || idLower.includes('medicaid') || idLower.includes('cdc') || idLower.includes('nih') || idLower.includes('substance_mental_health')) {
    tags.push('health_policy');
    if (fundingAction === 'fund') tags.push('healthcare_fund', 'social_spending_fund');
    if (fundingAction === 'slash') tags.push('health_spending_cut');
    if (fundingAction === 'review') tags.push('healthcare_review');
  }
   if (idLower.includes('education') || idLower.includes('k12_schools') || idLower.includes('college_aid') || idLower.includes('head_start') || idLower.includes('cpb') || idLower.includes('imls') || idLower.includes('dept_education')) {
    tags.push('education_policy');
    if (fundingAction === 'fund') tags.push('education_fund', 'social_spending_fund');
    if (fundingAction === 'slash') tags.push('education_spending_cut');
    if (fundingAction === 'review') tags.push('education_review');
  }
  if (idLower.includes('environment') || idLower.includes('epa') || idLower.includes('climate') || idLower.includes('renewable_energy') || idLower.includes('forest_service') || idLower.includes('nps') || idLower.includes('noaa')) {
    tags.push('environmental_policy');
    if (fundingAction === 'fund') tags.push('environmental_protection', 'climate_action_fund');
    if (fundingAction === 'slash') tags.push('environmental_spending_cut');
    if (fundingAction === 'review') tags.push('environmental_review');
  }
  if (idLower.includes('housing') || idLower.includes('hud') || idLower.includes('public_housing') || idLower.includes('fema') || idLower.includes('usich')) {
      tags.push('housing_community_dev_policy');
      if (fundingAction === 'fund') tags.push('housing_affordability', 'hud_fund');
      if (fundingAction === 'slash') tags.push('housing_spending_cut');
      if (fundingAction === 'review') tags.push('housing_review');
  }
  if (idLower.includes('food') || idLower.includes('agriculture') || idLower.includes('snap') || idLower.includes('wic') || idLower.includes('school_lunch') || idLower.includes('fsa')) {
      tags.push('food_agriculture_policy');
      if (fundingAction === 'fund') tags.push('food_security', 'snap_fund', 'wic_fund');
      if (fundingAction === 'slash') tags.push('farm_subsidies_reform', 'food_spending_cut');
      if (fundingAction === 'review') tags.push('food_policy_review');
  }
   if (idLower.includes('transportation') || idLower.includes('highways') || idLower.includes('public_transit') || idLower.includes('tsa') || idLower.includes('faa') || idLower.includes('amtrak')) {
      tags.push('transportation_policy');
      if (fundingAction === 'fund') tags.push('public_transit_fund', 'infrastructure_fund');
      if (fundingAction === 'slash') tags.push('transportation_spending_cut');
      if (fundingAction === 'review') tags.push('transportation_review');
  }
  if (idLower.includes('veterans') || idLower.includes('va') || idLower.includes('pact_act')) {
      tags.push('veterans_affairs_policy');
      if (fundingAction === 'fund') tags.push('veterans_affairs_fund', 'pact_act_fund');
      if (fundingAction === 'slash') tags.push('veterans_spending_cut');
      if (fundingAction === 'review') tags.push('va_review');
  }
  if (idLower.includes('unemployment') || idLower.includes('labor') || idLower.includes('tanf') || idLower.includes('nlrb') || idLower.includes('child_tax_credit') || idLower.includes('refugee_assistance') || idLower.includes('liheap')) {
      tags.push('unemployment_labor_policy');
      if (fundingAction === 'fund') tags.push('labor_rights', 'worker_protections', 'social_safety_net_fund');
      if (fundingAction === 'slash') tags.push('labor_spending_cut', 'social_safety_net_cut');
      if (fundingAction === 'review') tags.push('labor_policy_review');
  }
   if (idLower.includes('science') || idLower.includes('nasa') || idLower.includes('nsf')) {
      tags.push('science_tech_policy');
      if (fundingAction === 'fund') tags.push('science_fund', 'nasa_fund', 'nsf_fund');
      if (fundingAction === 'slash') tags.push('science_spending_cut');
      if (fundingAction === 'review') tags.push('science_policy_review');
  }
  if (idLower.includes('international_affairs') || idLower.includes('diplomacy') || idLower.includes('usaid')) {
      tags.push('foreign_policy');
      if (fundingAction === 'fund') tags.push('diplomacy_fund', 'foreign_aid_fund', 'usaid_fund');
      if (fundingAction === 'slash') tags.push('foreign_aid_cut', 'usaid_cut');
      if (fundingAction === 'review') tags.push('foreign_aid_review', 'usaid_review');
  }
   if (idLower.includes('law_enforcement') || idLower.includes('deportations_border') || idLower.includes('federal_prisons')) {
      tags.push('justice_immigration_policy');
      if (fundingAction === 'fund') tags.push('border_security_fund', 'federal_prisons_fund');
      if (fundingAction === 'slash') tags.push('immigration_enforcement_cut', 'federal_prisons_cut');
      if (fundingAction === 'review') tags.push('criminal_justice_reform', 'immigration_reform_review');
  }
   if (idLower.includes('government_ops') || idLower.includes('irs') || idLower.includes('fdic') || idLower.includes('federal_courts') || idLower.includes('usps') || idLower.includes('cfpb') || idLower.includes('mbda')) {
      tags.push('government_operations_policy');
      if (fundingAction === 'fund') tags.push('irs_fund', 'cfpb_fund', 'public_defenders_fund');
      if (fundingAction === 'slash') tags.push('government_waste_cut', 'irs_cut');
      if (fundingAction === 'review') tags.push('government_accountability', 'irs_review', 'cfpb_review');
  }

  const specificItemToActionTagMapping: Record<string, Partial<Record<FundingAction, string[]>>> = {
    'israel_wars': { slash: ['israel_aid_cut', 'middle_east_peace', 'israel_wars_cut'], review: ['israel_aid_review', 'israel_wars_review'], fund: ['israel_aid_fund', 'israel_wars_fund'] },
    'pentagon_contractors': { slash: ['pentagon_contractors_cut'], review: ['pentagon_contractors_review'] },
    'nasa_spacex': { slash: ['nasa_spacex_cut_review'], review: ['nasa_spacex_cut_review', 'nasa_spacex_review'], fund: ['nasa_spacex_fund'] },
    'medicare': { fund: ['medicare_fund'], slash: ['medicare_reform_cut', 'medicare_cut'], review:['medicare_review']},
    'medicaid': { fund: ['medicaid_fund'], review: ['medicaid_review'], slash: ['medicaid_cut']},
    'cdc': { fund: ['cdc_fund'], review: ['cdc_review'], slash: ['cdc_cut'] },
    'nih': { fund: ['nih_fund'], review: ['nih_review'], slash: ['nih_cut'] },
    'substance_mental_health': { fund: ['mental_health_fund', 'substance_mental_health_fund'], review: ['mental_health_review', 'substance_mental_health_review'], slash: ['substance_mental_health_cut'] },
    'foreign_military_aid': { slash: ['foreign_aid_cut', 'demilitarization', 'foreign_military_aid_cut'], review: ['foreign_aid_reform', 'foreign_military_aid_review'], fund:['foreign_military_aid_fund']},
    'nuclear_weapons': {slash: ['nuclear_disarmament', 'nuclear_weapons_cut'], review: ['nuclear_weapons_review', 'arms_control'], fund:['nuclear_weapons_fund']},
    'f35': {slash: ['f35_cut'], review: ['f35_review'], fund:['f35_fund']},
    'pentagon_dei': {slash: ['pentagon_dei_cut'], review: ['pentagon_dei_review'], fund: ['pentagon_dei_fund']},
    'va': {fund: ['veterans_affairs_fund', 'va_fund'], review: ['va_review'], slash: ['va_cut']},
    'pact_act': {fund: ['pact_act_fund'], review: ['pact_act_review']},
    'tanf': {fund: ['tanf_fund', 'social_spending_fund'], review:['tanf_review'], slash: ['tanf_cut']},
    'child_tax_credit': {fund: ['child_tax_credit_fund', 'social_spending_fund'], review:['child_tax_credit_review'], slash: ['child_tax_credit_cut']},
    'refugee_assistance': {fund: ['refugee_assistance_fund'], review:['refugee_assistance_review'], slash: ['refugee_assistance_cut']},
    'liheap': {fund: ['liheap_fund'], review:['liheap_review'], slash: ['liheap_cut']},
    'nlrb': {fund: ['nlrb_fund'], review:['nlrb_review'], slash: ['nlrb_cut']},
    'dept_education': {fund: ['dept_education_fund', 'education_fund'], review:['dept_education_review'], slash:['dept_education_cut']},
    'college_aid': {fund:['college_aid_fund'], review:['college_aid_review'], slash:['college_aid_cut']},
    'k12_schools': {fund:['k12_schools_fund'], review:['k12_schools_review'], slash:['k12_schools_cut']},
    'cpb': {fund:['cpb_fund'], review:['cpb_review'], slash:['cpb_cut']},
    'imls': {fund:['imls_fund'], review:['imls_review'], slash:['imls_cut']},
    'snap': {fund:['snap_fund'], review:['snap_review'], slash:['snap_cut']},
    'school_lunch': {fund:['school_lunch_fund'], review:['school_lunch_review'], slash:['school_lunch_cut']},
    'fsa': {fund:['fsa_fund'], review:['fsa_review'], slash:['fsa_cut', 'farm_subsidies_reform']},
    'wic': {fund:['wic_fund'], review:['wic_review'], slash:['wic_cut']},
    'fdic': {fund:['fdic_fund'], review:['fdic_review'], slash:['fdic_cut']},
    'irs': {fund:['irs_fund'], review:['irs_review'], slash:['irs_cut']},
    'federal_courts': {fund:['federal_courts_fund'], review:['federal_courts_review'], slash:['federal_courts_cut']},
    'public_defenders': {fund:['public_defenders_fund'], review:['public_defenders_review'], slash:['public_defenders_cut']},
    'usps': {fund:['usps_fund'], review:['usps_review'], slash:['usps_cut']},
    'cfpb': {fund:['cfpb_fund'], review:['cfpb_review'], slash:['cfpb_cut']},
    'mbda': {fund:['mbda_fund'], review:['mbda_review'], slash:['mbda_cut']},
    'usich': {fund:['usich_fund'], review:['usich_review'], slash:['usich_cut']},
    'fema': {fund:['fema_fund'], review:['fema_review'], slash:['fema_cut']},
    'fema_drf': {fund:['fema_drf_fund'], review:['fema_drf_review'], slash:['fema_drf_cut']},
    'hud': {fund:['hud_fund'], review:['hud_review'], slash:['hud_cut']},
    'head_start': {fund:['head_start_fund'], review:['head_start_review'], slash:['head_start_cut']},
    'public_housing': {fund:['public_housing_fund'], review:['public_housing_review'], slash:['public_housing_cut']},
    'epa': {fund:['epa_fund'], review:['epa_review'], slash:['epa_cut']},
    'forest_service': {fund:['forest_service_fund'], review:['forest_service_review'], slash:['forest_service_cut']},
    'noaa': {fund:['noaa_fund'], review:['noaa_review'], slash:['noaa_cut']},
    'renewable_energy': {fund:['renewable_energy_fund'], review:['renewable_energy_review'], slash:['renewable_energy_cut']},
    'nps': {fund:['nps_fund'], review:['nps_review'], slash:['nps_cut']},
    'diplomacy': {fund:['diplomacy_fund'], review:['diplomacy_review'], slash:['diplomacy_cut']},
    'usaid': {fund:['usaid_fund'], review:['usaid_review'], slash:['usaid_cut']},
    'usaid_climate': {fund:['usaid_climate_fund'], review:['usaid_climate_review'], slash:['usaid_climate_cut']},
    'deportations_border': {fund:['deportations_border_fund', 'border_security_fund'], review:['deportations_border_review', 'immigration_reform_review'], slash:['deportations_border_cut', 'immigration_enforcement_cut']},
    'federal_prisons': {fund:['federal_prisons_fund', 'prison_reform_fund'], review:['federal_prisons_review', 'criminal_justice_reform'], slash:['federal_prisons_cut', 'prison_spending_cut']},
    'highways': {fund:['highways_fund', 'infrastructure_fund'], review:['highways_review'], slash:['highways_cut']},
    'public_transit': {fund:['public_transit_fund', 'infrastructure_fund'], review:['public_transit_review'], slash:['public_transit_cut']},
    'tsa': {fund:['tsa_fund'], review:['tsa_review'], slash:['tsa_cut']},
    'faa': {fund:['faa_fund'], review:['faa_review'], slash:['faa_cut']},
    'amtrak': {fund:['amtrak_fund'], review:['amtrak_review'], slash:['amtrak_cut']},
    'nasa': {fund:['nasa_fund', 'science_fund'], review:['nasa_review'], slash:['nasa_cut']},
    'nsf': {fund:['nsf_fund', 'science_fund'], review:['nsf_review'], slash:['nsf_cut']},
    'pentagon': {slash: ['pentagon_cut'], review: ['pentagon_review'], fund: ['pentagon_fund']},
  };

  const itemSpecificTags = specificItemToActionTagMapping[itemId]?.[fundingAction]
    || specificItemToActionTagMapping[idLower]?.[fundingAction];

  if (itemSpecificTags) {
    itemSpecificTags.forEach(tag => tags.push(tag));
  } else if ((specificItemToActionTagMapping[itemId] || specificItemToActionTagMapping[idLower]) && !itemSpecificTags) {
    // If the item ID exists but not the specific action, default to a review tag for that item
    tags.push(`${itemId}_review`);
    tags.push(`${idLower}_review`);
  }

  if (tags.length === 0) {
    // Fallback if no other tags were generated
    tags.push(`${itemId}_${fundingAction}`);
  }
  return Array.from(new Set(tags)); // Remove duplicates
}

function getActionFromFundingLevel(level: number): FundingAction {
    if (level < -0.5) return 'slash'; // Corresponds to -2, -1
    if (level > 0.5) return 'fund';   // Corresponds to 1, 2
    return 'review';                  // Corresponds to 0
}

function generateMatchedReason(tag: string, originalConcernDescription: string, fundingAction: FundingAction): MatchedReason {
    let reasonType: MatchedReason['type'] = 'general';
    let actionableTag = tag.replace(/_/g, ' '); // Default readable tag

    if (tag.includes('_cut') || tag.includes('_slash')) {
        reasonType = 'opposes';
        actionableTag = `${actionableTag.replace(/ cut| slash/i, '')}`;
    } else if (tag.includes('_fund')) {
        reasonType = 'supports';
        actionableTag = `${actionableTag.replace(/ fund/i, '')}`;
    } else if (tag.includes('_review') || tag.includes('_reform')) {
        reasonType = 'reviews';
        actionableTag = `${actionableTag.replace(/ review| reform/i, '')}`;
    }

    const cleanedConcern = cleanItemDescription(originalConcernDescription);
    let userActionText = '';
    switch (fundingAction) {
        case 'slash': userActionText = 'slashing funding for'; break;
        case 'fund': userActionText = 'increasing funding for'; break;
        case 'review': userActionText = 'reviewing spending on'; break;
    }

    return {
        type: reasonType,
        description: `${actionableTag}`,
        originalConcern: `${userActionText} ${cleanedConcern}`,
        actionableTag: actionableTag.trim() // Trim for cleaner display
    };
}

const MAX_SUGGESTIONS = 25; // Limit total suggestions shown
const MAX_BEST_MATCHES = 1;
const MAX_TOP_MATCHES = 2; // After the best match

export async function suggestResources(
  selectedItems: UserSelectedItem[],
  userToneValue: number, // aggressiveness slider value
  balanceBudgetChecked: boolean
): Promise<SuggestedResource[]> {
  const suggestions: SuggestedResource[] = [];
  const suggestedUrls = new Set<string>();

  const userConcerns: Map<string, {action: FundingAction, itemDescription: string, tags: Set<string>}> = new Map();

  selectedItems.forEach(item => {
    const action = getActionFromFundingLevel(item.fundingLevel);
    const itemTags = new Set(getItemAdvocacyTags(item.id, action));
    userConcerns.set(item.id, {action, itemDescription: item.description, tags: itemTags });
  });

  if (balanceBudgetChecked) {
     const budgetTags = new Set(['fiscal_responsibility', 'debt_reduction', 'budget_reform', 'interest_debt_review']);
     userConcerns.set('balance_budget', {action: 'review', itemDescription: 'Balancing the Budget & Reducing National Debt', tags: budgetTags});
  }

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
                const reasonKey = `${reason.type}-${reason.actionableTag}-${reason.originalConcern}`; // More specific key
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

    if (resource.prominence === 'high') score += 3;
    else if (resource.prominence === 'medium') score += 1.5; // Slightly higher weight for medium

    if (balanceBudgetChecked && resource.advocacyTags.some(t => ['fiscal_responsibility', 'debt_reduction', 'budget_reform'].includes(t))) {
        score += 2; // Boost for matching budget concern
        if(!matchedConcernIds.has('balance_budget')) {
            uniqueConcernMatchCount++;
            matchedConcernIds.add('balance_budget');
            const budgetReason = generateMatchedReason('fiscal_responsibility', 'Balancing the Budget & Reducing National Debt', 'review');
            if (!matchedReasonsSet.has(JSON.stringify(budgetReason))) {
                 matchedReasonsSet.add(JSON.stringify(budgetReason));
                 detailedMatchedReasons.push(budgetReason);
            }
        }
    }
     // Boost score if org type matches certain criteria
     if (resource.orgTypeTags?.includes('legal')) score += 0.5;
     if (resource.orgTypeTags?.includes('data-driven')) score += 0.5;
     if (resource.orgTypeTags?.includes('grassroots')) score += 0.25;


    return { ...resource, score, matchedReasons: detailedMatchedReasons, matchCount: uniqueConcernMatchCount };
  }).filter(r => r.score > 0 || (userConcerns.size === 0 && balanceBudgetChecked && r.advocacyTags.some(t => ['fiscal_responsibility', 'debt_reduction'].includes(t)))) // Show fiscal orgs if only budget is checked
    .sort((a, b) => {
        if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
        if (b.score !== a.score) return b.score - a.score;
        const prominenceOrder = { 'high': 1, 'medium': 2, 'low': 3 };
        return (prominenceOrder[a.prominence || 'low'] || 3) - (prominenceOrder[b.prominence || 'low'] || 3);
    });

  let bestMatchAssigned = false;
  let topMatchAssignedCount = 0;

  for (const resource of scoredResources) {
    if (suggestions.length >= MAX_SUGGESTIONS) break;
    if (suggestedUrls.has(resource.url)) continue;

    let overallRelevanceReason = `Focuses on key areas relevant to public policy.`;
    if (resource.matchedReasons && resource.matchedReasons.length > 0) {
        const topReason = resource.matchedReasons[0];
        const toneForRelevance = userToneValue > 66 ? "strongly aligns" : userToneValue > 33 ? "aligns well" : "may be of interest";

        overallRelevanceReason = `${resource.name} ${toneForRelevance} with your stated concern about ${topReason.originalConcern.toLowerCase()} through its work on ${topReason.actionableTag.toLowerCase()}.`;
        if (resource.matchCount > 1) {
           overallRelevanceReason += ` It also addresses ${resource.matchCount -1} other concern${resource.matchCount - 1 === 1 ? '' : 's'} you highlighted.`;
        }
        if (balanceBudgetChecked && resource.advocacyTags.some(t => ['fiscal_responsibility', 'debt_reduction'].includes(t)) && !topReason.originalConcern.toLowerCase().includes('budget')) {
            overallRelevanceReason += ` Additionally, they advocate for fiscal responsibility.`;
        }
    } else if (balanceBudgetChecked && resource.advocacyTags.some(t => ['fiscal_responsibility', 'debt_reduction'].includes(t))) {
        overallRelevanceReason = `${resource.name} advocates for fiscal responsibility, aligning with your interest in balancing the budget.`;
    }


    const badges: BadgeType[] = [];
    // Assign Best Match
    if (!bestMatchAssigned && resource.matchCount >= Math.max(1, Math.floor(userConcerns.size * 0.6)) && resource.score > 3 && resource.prominence === 'high') {
        badges.push('Best Match');
        bestMatchAssigned = true;
    }
    // Assign Top Matches (up to MAX_TOP_MATCHES, not including the Best Match)
    else if (bestMatchAssigned && topMatchAssignedCount < MAX_TOP_MATCHES && resource.matchCount >= Math.max(1, Math.floor(userConcerns.size * 0.4)) && resource.score > 2.5 && (resource.prominence === 'high' || resource.prominence === 'medium')) {
        badges.push('Top Match');
        topMatchAssignedCount++;
    }

    if (resource.prominence === 'high' && !badges.includes('Best Match') && !badges.includes('Top Match')) badges.push('High Impact');
    if (resource.focusType === 'broad') badges.push('Broad Focus');
    if (resource.focusType === 'niche') badges.push('Niche Focus');

    resource.orgTypeTags?.forEach(tag => {
        if (tag === 'grassroots' && !badges.includes('Grassroots Power')) badges.push('Grassroots Power');
        if (tag === 'data-driven' && !badges.includes('Data-Driven')) badges.push('Data-Driven');
        if (tag === 'legal' && !badges.includes('Legal Advocacy')) badges.push('Legal Advocacy');
        if (tag === 'established' && !badges.includes('Established Voice') && resource.prominence === 'high') badges.push('Established Voice');
    });


    // Ensure "Community Pick" is assigned if few other prominent badges and not already a top/best match.
    if (badges.length <=1 && !badges.includes('Best Match') && !badges.includes('Top Match') && (resource.prominence === 'low' || resource.prominence === 'medium')) {
         if (!badges.includes('Community Pick')) badges.push('Community Pick');
    }


    suggestions.push({
      name: resource.name,
      url: resource.url,
      description: resource.description,
      overallRelevance: overallRelevanceReason.trim(),
      icon: resource.icon,
      matchCount: resource.matchCount,
      matchedReasons: resource.matchedReasons,
      badges: badges.length > 0 ? Array.from(new Set(badges)) : undefined, // Ensure unique badges
      mainCategory: resource.mainCategory,
    });
    suggestedUrls.add(resource.url);
  }
  return suggestions;
}
