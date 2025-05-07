
/**
 * @fileOverview Logic for suggesting relevant resources and organizations.
 * This file contains the database of resources and helper functions for matching and scoring.
 */

import { cleanItemDescription } from '@/services/email/utils';
import type { FundingLevel } from '@/services/email/types';
import type { MatchedReason, BadgeType, SuggestedResource } from '@/types/resource-suggestions';
import { BADGE_DISPLAY_PRIORITY_MAP } from '@/types/resource-suggestions';

export type FundingAction = 'slash' | 'fund' | 'review';

interface ResourceDatabaseEntry {
  name: string;
  url: string;
  description: string;
  icon?: string;
  advocacyTags: string[];
  mainCategory: string;
  prominence?: 'high' | 'medium' | 'low';
  focusType?: 'broad' | 'niche';
  orgTypeTags?: ('grassroots' | 'research' | 'legal' | 'established' | 'activism' | 'think-tank' | 'direct-service')[];
  intendedBadgeProfile?: ('single-prominent' | 'double-diverse' | 'triple-focused' | 'community-focused')[];
}

export const RESOURCE_DATABASE: ResourceDatabaseEntry[] = [
  // Peace & Demilitarization (5)
  {
    name: 'Peace Action',
    url: 'https://www.peaceaction.org/',
    description: 'Works to promote peace and demilitarization through grassroots organizing and advocacy.',
    icon: 'HandHeart',
    mainCategory: 'Peace & Demilitarization',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established', 'activism'],
    advocacyTags: ['peace', 'military_spending_cut', 'anti_war', 'israel_aid_cut', 'nuclear_disarmament', 'demilitarization', 'diplomacy_first', 'foreign_military_aid_cut', 'pentagon_cut', 'israel_wars_cut'],
    intendedBadgeProfile: ['double-diverse'],
  },
  {
    name: 'Friends Committee on National Legislation (FCNL)',
    url: 'https://www.fcnl.org/',
    description: 'A Quaker lobby in the public interest, working for peace, justice, and environmental stewardship.',
    icon: 'Scale',
    mainCategory: 'Peace & Social Justice',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established', 'think-tank'],
    advocacyTags: ['peace', 'social_justice', 'diplomacy_fund', 'foreign_aid_reform', 'military_spending_cut', 'environmental_stewardship', 'human_rights', 'federal_prisons_review', 'criminal_justice_reform', 'pentagon_review'],
    intendedBadgeProfile: ['triple-focused'],
  },
  {
    name: 'Win Without War',
    url: 'https://winwithoutwar.org/',
    description: 'Advocates for a more progressive U.S. foreign policy centered on diplomacy and demilitarization.',
    icon: 'Globe',
    mainCategory: 'Peace & Demilitarization',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'think-tank'],
    advocacyTags: ['anti_war', 'diplomacy_fund', 'military_spending_cut', 'foreign_aid_fund', 'foreign_policy_reform', 'demilitarization', 'usaid_fund', 'israel_wars_review'],
    intendedBadgeProfile: ['double-diverse'],
  },
  {
    name: 'Council for a Livable World',
    url: 'https://livableworld.org/',
    description: 'Advocates for policies to reduce the danger of nuclear weapons and promote national security.',
    icon: 'ShieldAlert',
    mainCategory: 'Peace & Demilitarization',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['research', 'established', 'think-tank'],
    advocacyTags: ['nuclear_disarmament', 'national_security_reform', 'arms_control', 'nuclear_weapons_review', 'nuclear_weapons_cut', 'pentagon_review'],
    intendedBadgeProfile: ['single-prominent'],
  },
  {
    name: 'Code Pink',
    url: 'https://www.codepink.org/',
    description: 'A women-led grassroots organization working to end U.S. wars and militarism, support peace and human rights initiatives, and redirect resources to healthcare, education, green jobs and other life-affirming programs.',
    icon: 'Dove',
    mainCategory: 'Peace & Demilitarization',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'activism'],
    advocacyTags: ['anti_war', 'peace', 'demilitarization', 'military_spending_cut', 'israel_aid_cut', 'diplomacy_fund', 'social_spending_fund', 'pentagon_cut', 'israel_wars_cut'],
    intendedBadgeProfile: ['double-diverse'],
  },
  // Human Rights & Regional Conflicts (4 existing + new)
  {
    name: 'US Campaign for Palestinian Rights (USCPR)',
    url: 'https://uscpr.org/',
    description: 'A national coalition working for Palestinian rights and an end to U.S. support for Israeli occupation.',
    icon: 'Landmark',
    mainCategory: 'Human Rights & Regional Conflicts',
    prominence: 'high',
    focusType: 'niche',
    orgTypeTags: ['grassroots', 'activism'],
    advocacyTags: ['palestinian_rights', 'israel_aid_cut', 'middle_east_peace', 'human_rights', 'israel_wars_cut', 'foreign_military_aid_cut'],
    intendedBadgeProfile: ['single-prominent'],
  },
  {
    name: 'Jewish Voice for Peace (JVP)',
    url: 'https://www.jewishvoiceforpeace.org/',
    description: 'A progressive Jewish anti-Zionist organization working for peace, justice, and human rights.',
    icon: 'Users',
    mainCategory: 'Human Rights & Regional Conflicts',
    prominence: 'high',
    focusType: 'niche',
    orgTypeTags: ['grassroots', 'activism'],
    advocacyTags: ['palestinian_rights', 'israel_aid_cut', 'anti_war', 'social_justice', 'human_rights', 'israel_wars_cut'],
    intendedBadgeProfile: ['single-prominent'],
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
    advocacyTags: ['human_rights', 'international_justice', 'refugee_rights', 'arms_control', 'foreign_military_aid_review', 'israel_wars_review', 'refugee_assistance_fund'],
    intendedBadgeProfile: ['double-diverse'],
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
    advocacyTags: ['human_rights', 'international_justice', 'accountability_for_abuses', 'war_crimes_review', 'foreign_military_aid_review', 'israel_wars_review', 'deportations_border_review'],
    intendedBadgeProfile: ['triple-focused'],
  },
  // Budget & Fiscal Responsibility (4 existing + new)
  {
    name: 'National Priorities Project (Institute for Policy Studies)',
    url: 'https://nationalpriorities.org/',
    description: 'Analyzes and advocates for a federal budget that prioritizes peace, economic opportunity, and a healthy environment.',
    icon: 'PieChart',
    mainCategory: 'Fiscal Responsibility',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'data-driven', 'think-tank'],
    advocacyTags: ['budget_reform', 'military_spending_cut', 'social_spending_fund', 'tax_fairness', 'fiscal_responsibility', 'pentagon_review', 'interest_debt_review', 'pentagon_cut', 'f35_cut', 'nuclear_weapons_cut'],
    intendedBadgeProfile: ['double-diverse'],
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
    intendedBadgeProfile: ['double-diverse'],
  },
  {
    name: 'Committee for a Responsible Federal Budget (CRFB)',
    url: 'https://www.crfb.org/',
    description: 'A nonpartisan, non-profit organization committed to educating the public and policymakers about fiscal policy issues.',
    icon: 'Banknote',
    mainCategory: 'Fiscal Responsibility',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'established', 'data-driven', 'think-tank'],
    advocacyTags: ['fiscal_responsibility', 'debt_reduction', 'budget_reform', 'entitlement_reform_review', 'interest_debt_review', 'tax_reform_review', 'medicare_review', 'medicaid_review', 'snap_review', 'child_tax_credit_review'],
    intendedBadgeProfile: ['triple-focused'],
  },
  {
    name: 'Cato Institute',
    url: 'https://www.cato.org/',
    description: 'A public policy research organization—a think tank—dedicated to the principles of individual liberty, limited government, free markets, and peace.',
    icon: 'LibrarySquare',
    mainCategory: 'Fiscal Responsibility',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['think-tank', 'research', 'established'],
    advocacyTags: ['limited_government', 'free_markets', 'individual_liberty', 'fiscal_responsibility', 'budget_reform', 'pentagon_review', 'tax_reform_review', 'entitlement_reform_review', 'epa_cut', 'dept_education_cut'],
    intendedBadgeProfile: ['double-diverse'],
  },
  {
    name: 'The Heritage Foundation',
    url: 'https://www.heritage.org/',
    description: 'A research and educational institution whose mission is to formulate and promote conservative public policies based on the principles of free enterprise, limited government, individual freedom, traditional American values, and a strong national defense.',
    icon: 'Landmark',
    mainCategory: 'Fiscal Responsibility',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['think-tank', 'research', 'established'],
    advocacyTags: ['conservative_policy', 'limited_government', 'free_enterprise', 'strong_national_defense', 'fiscal_responsibility', 'pentagon_fund', 'tax_reform_review', 'budget_reform', 'irs_cut'],
    intendedBadgeProfile: ['double-diverse'],
  },
  // Healthcare (2 existing + new)
  {
    name: 'Physicians for a National Health Program (PNHP)',
    url: 'https://pnhp.org/',
    description: 'Advocates for a universal, comprehensive single-payer national health program.',
    icon: 'HeartPulse',
    mainCategory: 'Healthcare',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['grassroots', 'think-tank'],
    advocacyTags: ['medicare_fund', 'medicaid_fund', 'healthcare_reform', 'single_payer', 'health_equity', 'nih_fund', 'substance_mental_health_fund'],
    intendedBadgeProfile: ['single-prominent'],
  },
  {
    name: 'National Alliance on Mental Illness (NAMI)',
    url: 'https://www.nami.org/',
    description: 'The nation’s largest grassroots mental health organization dedicated to building better lives for Americans affected by mental illness.',
    icon: 'Brain',
    mainCategory: 'Healthcare',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established', 'direct-service'],
    advocacyTags: ['mental_health_fund', 'substance_mental_health_fund', 'health_equity', 'cdc_fund', 'nih_fund', 'va_fund', 'medicaid_fund'],
    intendedBadgeProfile: ['double-diverse'],
  },
  {
    name: 'Families USA',
    url: 'https://familiesusa.org/',
    description: 'A leading national, non-partisan voice for health care consumers, dedicated to the achievement of high-quality, affordable health care and improved health for all.',
    icon: 'Users',
    mainCategory: 'Healthcare',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['research', 'established', 'think-tank'],
    advocacyTags: ['healthcare_reform', 'medicaid_fund', 'medicare_fund', 'health_equity', 'affordable_care_act_fund'],
    intendedBadgeProfile: ['double-diverse'],
  },
  // Environment & Energy (6 existing + new)
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
    intendedBadgeProfile: ['triple-focused'],
  },
  {
    name: 'Sierra Club',
    url: 'https://www.sierraclub.org/',
    description: 'Grassroots environmental organization in the United States. Founded by legendary conservationist John Muir in 1892.',
    icon: 'Mountain',
    mainCategory: 'Environment & Energy',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established', 'legal', 'activism'],
    advocacyTags: ['environmental_protection', 'climate_action_fund', 'renewable_energy_fund', 'nps_fund', 'forest_service_fund', 'wilderness_protection', 'epa_fund', 'noaa_fund', 'public_lands_fund'],
    intendedBadgeProfile: ['double-diverse'],
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
    advocacyTags: ['environmental_protection', 'epa_fund', 'climate_action_fund', 'ocean_conservation', 'renewable_energy_fund', 'noaa_fund', 'forest_service_fund', 'water_quality_fund', 'usaid_climate_fund'],
    intendedBadgeProfile: ['triple-focused'],
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
    advocacyTags: ['environmental_law', 'epa_fund', 'climate_action_fund', 'wilderness_protection', 'renewable_energy_review', 'environmental_justice', 'ocean_conservation', 'forest_service_review'],
    intendedBadgeProfile: ['single-prominent'],
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
    advocacyTags: ['forest_protection', 'climate_action_fund', 'corporate_accountability', 'human_rights', 'environmental_justice', 'fossil_fuel_subsidies_cut', 'forest_service_fund'],
    intendedBadgeProfile: ['double-diverse'],
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
    intendedBadgeProfile: ['double-diverse'],
  },
  {
    name: 'League of Conservation Voters (LCV)',
    url: 'https://www.lcv.org/',
    description: 'Advocates for sound environmental laws and policies, holds elected officials accountable for their votes and actions, and elects pro-environment candidates.',
    icon: 'Vote',
    mainCategory: 'Environment & Energy',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['activism', 'established'],
    advocacyTags: ['environmental_policy', 'climate_action_fund', 'epa_fund', 'renewable_energy_fund', 'clean_water_fund'],
    intendedBadgeProfile: ['single-prominent'],
  },
  // Science & Technology (2 existing + new)
  {
    name: 'The Planetary Society',
    url: 'https://www.planetary.org/',
    description: 'Empowers the world\'s citizens to advance space science and exploration.',
    icon: 'Rocket',
    mainCategory: 'Science & Technology',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['grassroots', 'research'],
    advocacyTags: ['nasa_fund', 'science_fund', 'space_exploration', 'nsf_fund', 'nasa_review', 'nasa_spacex_review'],
    intendedBadgeProfile: ['single-prominent'],
  },
  {
    name: 'Union of Concerned Scientists',
    url: 'https://www.ucsusa.org/',
    description: 'Puts rigorous, independent science to work to solve our planet\'s most pressing problems.',
    icon: 'FlaskConical',
    mainCategory: 'Science & Technology',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'data-driven', 'established', 'think-tank'],
    advocacyTags: ['science_fund', 'environmental_protection', 'nuclear_weapons_review', 'scientific_integrity', 'climate_action_fund', 'sustainable_agriculture_fund', 'epa_review', 'nsf_review', 'food_safety_review', 'nasa_review'],
    intendedBadgeProfile: ['triple-focused'],
  },
  {
    name: 'Federation of American Scientists (FAS)',
    url: 'https://fas.org/',
    description: 'Provides science-based analysis of and solutions to protect against catastrophic threats to national and international security.',
    icon: 'Atom',
    mainCategory: 'Science & Technology',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['research', 'think-tank', 'established'],
    advocacyTags: ['science_policy', 'national_security_reform', 'nuclear_weapons_review', 'arms_control', 'emerging_tech_policy'],
    intendedBadgeProfile: ['double-diverse'],
  },
  // Civil Rights & Social Justice (5 existing + new)
  {
    name: 'American Civil Liberties Union (ACLU)',
    url: 'https://www.aclu.org/',
    description: 'Works to defend and preserve the individual rights and liberties guaranteed by the Constitution and laws of the United States.',
    icon: 'Gavel',
    mainCategory: 'Civil Rights & Social Justice',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['legal', 'established', 'grassroots', 'activism'],
    advocacyTags: ['civil_rights', 'civil_liberties', 'immigration_reform_review', 'criminal_justice_reform', 'government_accountability', 'deportations_border_review', 'federal_prisons_review', 'privacy_rights', 'nlrb_review', 'public_defenders_fund'],
    intendedBadgeProfile: ['triple-focused'],
  },
  {
    name: 'NAACP Legal Defense and Educational Fund (LDF)',
    url: 'https://www.naacpldf.org/',
    description: 'America’s premier legal organization fighting for racial justice.',
    icon: 'Scale',
    mainCategory: 'Civil Rights & Social Justice',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['legal', 'established'],
    advocacyTags: ['racial_justice', 'civil_rights', 'voting_rights', 'education_equity', 'criminal_justice_reform', 'mbda_fund'],
    intendedBadgeProfile: ['double-diverse'],
  },
  {
    name: 'Southern Poverty Law Center (SPLC)',
    url: 'https://www.splcenter.org/',
    description: 'Dedicated to fighting hate and bigotry and to seeking justice for the most vulnerable members of our society.',
    icon: 'ShieldCheck',
    mainCategory: 'Civil Rights & Social Justice',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['legal', 'research', 'established'],
    advocacyTags: ['anti_hate', 'civil_rights', 'racial_justice', 'immigrant_rights', 'lgbtq_rights', 'criminal_justice_reform'],
    intendedBadgeProfile: ['double-diverse'],
  },
  {
    name: 'Electronic Frontier Foundation (EFF)',
    url: 'https://www.eff.org/',
    description: 'Defending civil liberties in the digital world. Works on issues of free speech, privacy, innovation, and consumer rights online.',
    icon: 'ShieldCheck',
    mainCategory: 'Civil Rights & Social Justice',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['legal', 'research', 'established', 'activism'],
    advocacyTags: ['digital_rights', 'privacy_rights', 'free_speech_online', 'surveillance_review', 'cfpb_review', 'tech_policy_reform', 'nasa_spacex_cut_review', 'tsa_review'],
    intendedBadgeProfile: ['double-diverse'],
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
    advocacyTags: ['criminal_justice_reform', 'federal_prisons_review', 'racial_justice', 'public_defenders_fund', 'deportations_border_review'],
    intendedBadgeProfile: ['single-prominent'],
  },
  // Democracy & Governance (3 existing + new)
  {
    name: 'Common Cause',
    url: 'https://www.commoncause.org/',
    description: 'A nonpartisan grassroots organization dedicated to upholding the core values of American democracy.',
    icon: 'Vote',
    mainCategory: 'Democracy & Governance',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established'],
    advocacyTags: ['democracy_reform', 'voting_rights', 'campaign_finance_reform', 'government_accountability', 'ethics_reform', 'irs_review', 'federal_courts_review', 'usps_review'],
    intendedBadgeProfile: ['double-diverse'],
  },
  {
    name: 'Brennan Center for Justice',
    url: 'https://www.brennancenter.org/',
    description: 'A nonpartisan law and policy institute that works to reform, revitalize, and when necessary, defend our country’s systems of democracy and justice.',
    icon: 'LibrarySquare',
    mainCategory: 'Democracy & Governance',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'legal', 'established', 'think-tank'],
    advocacyTags: ['democracy_reform', 'voting_rights', 'criminal_justice_reform', 'campaign_finance_reform', 'justice_system_review', 'federal_courts_review', 'public_defenders_fund', 'federal_prisons_reform'],
    intendedBadgeProfile: ['triple-focused'],
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
    advocacyTags: ['campaign_finance_reform', 'government_accountability', 'ethics_reform', 'lobbying_reform', 'pentagon_contractors_review'],
    intendedBadgeProfile: ['single-prominent'],
  },
  {
    name: 'Demand Progress',
    url: 'https://demandprogress.org/',
    description: 'Fights for a more just and democratic world by organizing for progressive policy changes on issues of surveillance, money in politics, and corporate power.',
    icon: 'Megaphone',
    mainCategory: 'Democracy & Governance',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'activism'],
    advocacyTags: ['democracy_reform', 'anti_surveillance', 'corporate_accountability', 'government_accountability', 'privacy_rights', 'cfpb_fund', 'nlrb_fund', 'tsa_review'],
    intendedBadgeProfile: ['double-diverse'],
  },
  // Government Accountability (1 existing + new)
  {
    name: 'Project On Government Oversight (POGO)',
    url: 'https://www.pogo.org/',
    description: 'A nonpartisan independent watchdog that investigates and exposes waste, corruption, and abuse of power.',
    icon: 'Eye',
    mainCategory: 'Government Accountability',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'data-driven', 'established'],
    advocacyTags: ['government_accountability', 'pentagon_contractors_review', 'whistleblower_protection', 'wasteful_spending_cut', 'pentagon_review', 'f35_review', 'pentagon_cut', 'irs_review', 'cfpb_review', 'fdic_review'],
    intendedBadgeProfile: ['triple-focused'],
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
    advocacyTags: ['government_accountability', 'investigative_journalism', 'corporate_accountability', 'pentagon_review', 'irs_review', 'fema_review'],
    intendedBadgeProfile: ['double-diverse'],
  },
  // Education (1 existing + new)
  {
    name: 'National Education Association (NEA)',
    url: 'https://www.nea.org/',
    description: 'The nation\'s largest professional employee organization, committed to advancing the cause of public education.',
    icon: 'School',
    mainCategory: 'Education',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established', 'direct-service'],
    advocacyTags: ['education_fund', 'k12_schools_fund', 'teacher_support', 'public_education', 'college_aid_fund', 'head_start_fund', 'dept_education_fund', 'imls_fund', 'cpb_fund'],
    intendedBadgeProfile: ['double-diverse'],
  },
  {
    name: 'The Education Trust',
    url: 'https://edtrust.org/',
    description: 'Works to close opportunity gaps that disproportionately affect students of color and students from low-income families.',
    icon: 'GraduationCap',
    mainCategory: 'Education',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['research', 'think-tank', 'established'],
    advocacyTags: ['education_equity', 'k12_schools_fund', 'college_aid_fund', 'dept_education_review', 'social_justice'],
    intendedBadgeProfile: ['single-prominent'],
  },
  // Housing & Homelessness (2 existing + new)
  {
    name: 'National Low Income Housing Coalition (NLIHC)',
    url: 'https://nlihc.org/',
    description: 'Dedicated solely to achieving socially just public policy that ensures people with the lowest incomes in the United States have affordable and decent homes.',
    icon: 'Home',
    mainCategory: 'Housing & Community',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'grassroots', 'established', 'think-tank'],
    advocacyTags: ['housing_affordability', 'hud_fund', 'public_housing_fund', 'homelessness_prevention', 'rental_assistance_fund', 'usich_fund', 'liheap_fund', 'social_spending_fund'],
    intendedBadgeProfile: ['triple-focused'],
  },
  {
    name: 'National Alliance to End Homelessness',
    url: 'https://endhomelessness.org/',
    description: 'A nonpartisan organization committed to preventing and ending homelessness in the United States.',
    icon: 'Bed',
    mainCategory: 'Housing & Community',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'established', 'direct-service'],
    advocacyTags: ['homelessness_prevention', 'usich_fund', 'hud_fund', 'housing_first', 'rental_assistance_fund', 'public_housing_review', 'mental_health_fund', 'va_fund'],
    intendedBadgeProfile: ['double-diverse'],
  },
  {
    name: 'Habitat for Humanity International',
    url: 'https://www.habitat.org/',
    description: 'A nonprofit organization that helps families build and improve places to call home.',
    icon: 'Hammer',
    mainCategory: 'Housing & Community',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'direct-service', 'established'],
    advocacyTags: ['housing_affordability', 'hud_review', 'community_development', 'volunteerism'],
    intendedBadgeProfile: ['single-prominent'],
  },
  // Food & Agriculture (1 existing + new)
  {
    name: 'Food Research & Action Center (FRAC)',
    url: 'https://frac.org/',
    description: 'The leading national nonprofit organization working to eradicate poverty-related hunger and undernutrition in the United States.',
    icon: 'Utensils',
    mainCategory: 'Food & Agriculture',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'established', 'think-tank'],
    advocacyTags: ['snap_fund', 'wic_fund', 'school_lunch_fund', 'anti_hunger', 'food_security', 'child_tax_credit_fund', 'social_spending_fund', 'fsa_review'],
    intendedBadgeProfile: ['triple-focused'],
  },
  {
    name: 'National Sustainable Agriculture Coalition (NSAC)',
    url: 'https://sustainableagriculture.net/',
    description: 'An alliance of grassroots organizations that advocates for federal policy reform to advance the sustainability of agriculture, food systems, natural resources, and rural communities.',
    icon: 'Wheat',
    mainCategory: 'Food & Agriculture',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established', 'think-tank'],
    advocacyTags: ['sustainable_agriculture_fund', 'fsa_review', 'farm_bill_reform', 'food_systems_change', 'rural_development'],
    intendedBadgeProfile: ['double-diverse'],
  },
  // Veterans (1 existing + new)
  {
    name: 'Veterans of Foreign Wars (VFW)',
    url: 'https://www.vfw.org/',
    description: 'A nonprofit veterans service organization comprised of eligible veterans and military service members from the active, guard and reserve forces.',
    icon: 'Medal',
    mainCategory: 'Veterans Affairs',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established', 'direct-service'],
    advocacyTags: ['veterans_affairs_fund', 'pact_act_fund', 'veteran_benefits', 'national_security_fund', 'pentagon_personnel_fund', 'va_fund', 'va_review'],
    intendedBadgeProfile: ['double-diverse'],
  },
  {
    name: 'Iraq and Afghanistan Veterans of America (IAVA)',
    url: 'https://iava.org/',
    description: 'The leading post-9/11 veteran empowerment organization (VEO) with the most diverse and rapidly growing membership in America.',
    icon: 'ShieldCheck',
    mainCategory: 'Veterans Affairs',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['grassroots', 'activism'],
    advocacyTags: ['veterans_affairs_fund', 'pact_act_fund', 'mental_health_fund', 'post_911_veterans', 'va_review', 'suicide_prevention_fund'],
    intendedBadgeProfile: ['single-prominent'],
  },
  // Labor & Worker Rights (1 existing + new)
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
    intendedBadgeProfile: ['double-diverse'],
  },
  {
    name: 'National Employment Law Project (NELP)',
    url: 'https://www.nelp.org/',
    description: 'A research and advocacy organization that fights for policies to create good jobs, expand access to work, and strengthen protections and support for low-wage workers and the unemployed.',
    icon: 'Briefcase',
    mainCategory: 'Labor & Worker Rights',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['research', 'legal', 'think-tank'],
    advocacyTags: ['worker_rights', 'fair_wages', 'unemployment_insurance_reform', 'job_safety', 'nlrb_review', 'social_safety_net_fund'],
    intendedBadgeProfile: ['double-diverse'],
  },
   // Immigration (2 existing + new)
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
    intendedBadgeProfile: ['double-diverse'],
  },
  {
    name: 'American Immigration Council',
    url: 'https://www.americanimmigrationcouncil.org/',
    description: 'Works to strengthen America by shaping how America thinks about and acts towards immigrants and immigration.',
    icon: 'Users',
    mainCategory: 'Immigration',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['research', 'established', 'think-tank'],
    advocacyTags: ['immigration_reform_review', 'immigrant_rights', 'deportations_border_review', 'economic_contribution_immigrants', 'refugee_assistance_fund'],
    intendedBadgeProfile: ['single-prominent'],
  },
  {
    name: 'RAICES',
    url: 'https://www.raicestexas.org/',
    description: 'A nonprofit agency that promotes justice by providing free and low-cost legal services to underserved immigrant children, families, and refugees.',
    icon: 'Gavel',
    mainCategory: 'Immigration',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['legal', 'direct-service', 'grassroots'],
    advocacyTags: ['immigrant_rights', 'refugee_assistance_fund', 'legal_aid', 'deportations_border_review', 'asylum_reform'],
    intendedBadgeProfile: ['double-diverse'],
  },
  // Consumer Protection
  {
    name: 'Consumer Federation of America (CFA)',
    url: 'https://consumerfed.org/',
    description: 'An association of non-profit consumer organizations dedicated to advancing the consumer interest through research, advocacy, and education.',
    icon: 'ShoppingCart',
    mainCategory: 'Consumer Protection',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['research', 'established', 'think-tank'],
    advocacyTags: ['consumer_rights', 'cfpb_fund', 'financial_regulation_review', 'product_safety', 'privacy_rights'],
    intendedBadgeProfile: ['double-diverse'],
  },
  // Transportation
  {
    name: 'Transportation for America',
    url: 'https://t4america.org/',
    description: 'An alliance of elected, business and civic leaders from communities across the country, united to ensure that states and the federal government step up to invest in a modern transportation system.',
    icon: 'Train',
    mainCategory: 'Transportation',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['think-tank', 'activism', 'established'],
    advocacyTags: ['transportation_reform', 'public_transit_fund', 'infrastructure_fund', 'complete_streets', 'highways_review', 'amtrak_fund', 'faa_review'],
    intendedBadgeProfile: ['single-prominent'],
  },
  // Arts & Culture
  {
    name: 'Americans for the Arts',
    url: 'https://www.americansforthearts.org/',
    description: 'The nation’s leading nonprofit organization for advancing the arts and arts education.',
    icon: 'Palette',
    mainCategory: 'Arts & Culture',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['established', 'research', 'direct-service'],
    advocacyTags: ['arts_funding_fund', 'cpb_fund', 'imls_fund', 'nea_fund', 'creative_economy'],
    intendedBadgeProfile: ['single-prominent'],
  },
  // Added Organizations
  {
    name: 'ASPCA (American Society for the Prevention of Cruelty to Animals)',
    url: 'https://www.aspca.org/',
    description: 'Works to save lives and secure compassionate treatment for animals across America.',
    icon: 'PawPrint',
    mainCategory: 'Animal Welfare',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['established', 'activism', 'direct-service'],
    advocacyTags: ['animal_welfare', 'animal_protection_laws', 'anti_cruelty_fund', 'pet_adoption_support'],
    intendedBadgeProfile: ['double-diverse'],
  },
  {
    name: 'The Arc of the United States',
    url: 'https://thearc.org/',
    description: 'Promotes and protects the human rights of people with intellectual and developmental disabilities and actively supports their full inclusion and participation in the community.',
    icon: 'Wheelchair',
    mainCategory: 'Disability Rights',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established', 'legal'],
    advocacyTags: ['disability_rights', 'inclusion_fund', 'medicaid_fund', 'social_security_review', 'education_equity'],
    intendedBadgeProfile: ['triple-focused'],
  },
  {
    name: 'Center on Budget and Policy Priorities (CBPP)',
    url: 'https://www.cbpp.org/',
    description: 'A nonpartisan research and policy institute pursuing federal and state policies designed to reduce poverty and inequality.',
    icon: 'TrendingUp', // Used for economic focus
    mainCategory: 'Economic Justice',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'data-driven', 'think-tank', 'established'],
    advocacyTags: ['poverty_reduction', 'economic_inequality_cut', 'social_safety_net_fund', 'snap_fund', 'wic_fund', 'child_tax_credit_fund', 'housing_affordability', 'tax_fairness'],
    intendedBadgeProfile: ['triple-focused'],
  },
  {
    name: 'Brookings Institution',
    url: 'https://www.brookings.edu/',
    description: 'A nonprofit public policy organization committed to independent research and policy solutions.',
    icon: 'BuildingIcon', // Generic for institution
    mainCategory: 'Public Policy Research',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'established', 'think-tank'],
    advocacyTags: ['public_policy_research', 'economic_policy_review', 'foreign_policy_review', 'social_policy_review', 'governance_reform'],
    intendedBadgeProfile: ['double-diverse'],
  },
  {
    name: 'American Enterprise Institute (AEI)',
    url: 'https://www.aei.org/',
    description: 'A conservative think tank that researches government, politics, economics, and social welfare.',
    icon: 'LibrarySquare',
    mainCategory: 'Public Policy Research',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'established', 'think-tank'],
    advocacyTags: ['conservative_policy', 'free_enterprise', 'limited_government', 'economic_policy_review', 'national_security_fund'],
    intendedBadgeProfile: ['double-diverse'],
  },
];


export function getItemAdvocacyTags(itemId: string, fundingAction: FundingAction): string[] {
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
    if(!tags.some(t => t.endsWith('_policy'))) {
        tags.push(`${itemId}_review`);
        tags.push(`${idLower}_review`);
    }
  }

  if (tags.length === 0) {
    tags.push(`${itemId}_${fundingAction}`);
  }
  return Array.from(new Set(tags));
}

export function getActionFromFundingLevel(level: FundingLevel): FundingAction {
    if (level < -0.5) return 'slash';
    if (level > 0.5) return 'fund';
    return 'review';
}

export function generateMatchedReason(tag: string, originalConcernDescription: string, fundingAction: FundingAction): MatchedReason {
    let reasonType: MatchedReason['type'] = 'general';
    let actionableTag = tag.replace(/_/g, ' ');

    if (tag.endsWith('_cut') || tag.endsWith('_slash')) {
        reasonType = 'opposes';
        actionableTag = actionableTag.replace(/ cut$| slash$/i, '');
    } else if (tag.endsWith('_fund')) {
        reasonType = 'supports';
        actionableTag = actionableTag.replace(/ fund$/i, '');
    } else if (tag.endsWith('_review') || tag.endsWith('_reform')) {
        reasonType = 'reviews';
        actionableTag = actionableTag.replace(/ review$| reform$/i, '');
    }

    actionableTag = actionableTag
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    actionableTag = actionableTag.replace(/ Policy$/, '').replace(/ Reform$/, '').replace(/ Spending$/, '');

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
        actionableTag: actionableTag.trim()
    };
}

export const MAX_SUGGESTIONS = 50;
export const MAX_BADGES_PER_RESOURCE = 3; // Max badges per resource

// Refined Badge Assignment Logic
export function assignBadgesToResource(
  resource: SuggestedResource,
  userConcernsSize: number,
  isBestMatch: boolean,
  isTopMatch: boolean,
  otherResourcesWithBadges: Map<string, Set<BadgeType>> // Keep track of badges assigned to other resources
): BadgeType[] {
  const assignedBadges: Set<BadgeType> = new Set();
  const potentialBadgesPool: BadgeType[] = [];

  if (isBestMatch) assignedBadges.add('Best Match');
  if (isTopMatch && !assignedBadges.has('Best Match')) assignedBadges.add('Top Match');

  // Populate potential badges based on resource properties
  if (resource.prominence === 'high') potentialBadgesPool.push('High Impact');
  if (resource.focusType === 'broad') potentialBadgesPool.push('Broad Focus');
  if (resource.focusType === 'niche') potentialBadgesPool.push('Niche Focus');

  const orgTypeToBadgeMap: Partial<Record<NonNullable<typeof resource.orgTypeTags>[number], BadgeType>> = {
      'legal': 'Legal Advocacy', 'data-driven': 'Data-Driven', 'grassroots': 'Grassroots Power',
      'established': 'Established Voice', 'activism': 'High Impact', // Activism can also imply High Impact
      'think-tank': 'Data-Driven', // Think tanks are often data-driven
      'direct-service': 'Community Pick', // Direct service often implies community pick
  };
  resource.orgTypeTags?.forEach(tag => {
      if (orgTypeToBadgeMap[tag] && !potentialBadgesPool.includes(orgTypeToBadgeMap[tag]!)) {
          potentialBadgesPool.push(orgTypeToBadgeMap[tag]!);
      }
  });

  // Filter out badges already assigned (Best/Top Match)
  let availableBadges = potentialBadgesPool.filter(b => !assignedBadges.has(b));

  // Try to diversify badges based on what other resources have
  const allAssignedBadgesCount = new Map<BadgeType, number>();
  otherResourcesWithBadges.forEach(badges => {
      badges.forEach(b => allAssignedBadgesCount.set(b, (allAssignedBadgesCount.get(b) || 0) + 1));
  });

  // Sort available badges: prioritize less common ones if this resource is a good fit
  availableBadges.sort((a, b) => {
    const countA = allAssignedBadgesCount.get(a) || 0;
    const countB = allAssignedBadgesCount.get(b) || 0;
    if (countA !== countB) return countA - countB; // Prioritize less used badges
    return (BADGE_DISPLAY_PRIORITY_MAP[a] || 99) - (BADGE_DISPLAY_PRIORITY_MAP[b] || 99); // Fallback to display priority
  });


  // Determine target number of *additional* badges (beyond Best/Top Match)
  let targetAdditionalBadges = 0;
  if (resource.intendedBadgeProfile?.includes('single-prominent') || Math.random() < 0.15) { // ~15% get 1 additional (or 0 if Best/Top assigned)
      targetAdditionalBadges = 1;
  } else if (resource.intendedBadgeProfile?.includes('triple-focused') || Math.random() < 0.35) { // ~35% get 3 additional
      targetAdditionalBadges = 3;
  } else { // ~50% get 2 additional
      targetAdditionalBadges = 2;
  }
  // Adjust target if Best/Top already assigned, aiming for total around MAX_BADGES_PER_RESOURCE
  targetAdditionalBadges = Math.max(0, Math.min(MAX_BADGES_PER_RESOURCE - assignedBadges.size, targetAdditionalBadges));


  for (const badge of availableBadges) {
      if (assignedBadges.size >= MAX_BADGES_PER_RESOURCE || assignedBadges.size >= (isBestMatch || isTopMatch ? 1 : 0) + targetAdditionalBadges) break;
      assignedBadges.add(badge);
  }

  // Fallback: If no specific badges assigned and no user matches, assign 'General Interest'
  if (assignedBadges.size === 0 && ((resource.matchCount || 0) === 0 || userConcernsSize === 0)) {
      assignedBadges.add('General Interest');
  }

  // If still under target and has matches and suitable profile, consider 'Community Pick'
  if (assignedBadges.size < MAX_BADGES_PER_RESOURCE && assignedBadges.size < ((isBestMatch || isTopMatch ? 1 : 0) + targetAdditionalBadges) &&
      (resource.matchCount || 0) > 0 &&
      (resource.prominence === 'low' || resource.prominence === 'medium' || resource.intendedBadgeProfile?.includes('community-focused')) &&
      !assignedBadges.has('Community Pick') && Math.random() < 0.33) {
      assignedBadges.add('Community Pick');
  }

  return Array.from(assignedBadges)
      .sort((a, b) => (BADGE_DISPLAY_PRIORITY_MAP[a] || 99) - (BADGE_DISPLAY_PRIORITY_MAP[b] || 99))
      .slice(0, MAX_BADGES_PER_RESOURCE);
}
