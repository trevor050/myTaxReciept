
/**
 * @fileOverview Logic for suggesting relevant resources and organizations.
 * This file contains the database of resources and helper functions for matching and scoring.
 */

import { cleanItemDescription } from '@/services/email/utils';
import type { FundingLevel } from '@/services/email/types';
import type { MatchedReason, BadgeType, SuggestedResource } from '@/types/resource-suggestions'; // Ensure these types are correctly defined/imported

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
    name: 'Committee for a Responsible Federal Budget (CRFB)',
    url: 'https://www.crfb.org/',
    description: 'A nonpartisan, non-profit organization committed to educating the public and policymakers about fiscal policy issues.',
    icon: 'Banknote',
    mainCategory: 'Fiscal Responsibility',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'established', 'data-driven', 'think-tank'],
    advocacyTags: ['fiscal_responsibility', 'debt_reduction', 'budget_reform', 'entitlement_reform_review', 'interest_debt_review', 'tax_reform_review', 'medicare_review', 'medicaid_review', 'snap_review', 'child_tax_credit_review'],
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
  },
  {
    name: 'Electronic Frontier Foundation (EFF)',
    url: 'https://www.eff.org/',
    description: 'Defending civil liberties in the digital world. Works on issues of free speech, privacy, innovation, and consumer rights online.',
    icon: 'ShieldCheck', // Re-using, maybe Wifi or Lock later
    mainCategory: 'Civil Rights & Social Justice',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['legal', 'research', 'established', 'activism'],
    advocacyTags: ['digital_rights', 'privacy_rights', 'free_speech_online', 'surveillance_review', 'cfpb_review', 'tech_policy_reform', 'nasa_spacex_cut_review', 'tsa_review'],
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
  },
  {
    name: 'Iraq and Afghanistan Veterans of America (IAVA)',
    url: 'https://iava.org/',
    description: 'The leading post-9/11 veteran empowerment organization (VEO) with the most diverse and rapidly growing membership in America.',
    icon: 'ShieldCheck', // Re-using
    mainCategory: 'Veterans Affairs',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['grassroots', 'activism'],
    advocacyTags: ['veterans_affairs_fund', 'pact_act_fund', 'mental_health_fund', 'post_911_veterans', 'va_review', 'suicide_prevention_fund'],
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
  },
  {
    name: 'RAICES',
    url: 'https://www.raicestexas.org/',
    description: 'A nonprofit agency that promotes justice by providing free and low-cost legal services to underserved immigrant children, families, and refugees.',
    icon: 'Gavel', // Using Gavel as proxy for legal services
    mainCategory: 'Immigration',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['legal', 'direct-service', 'grassroots'],
    advocacyTags: ['immigrant_rights', 'refugee_assistance_fund', 'legal_aid', 'deportations_border_review', 'asylum_reform'],
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
    // Default to a review tag if specific action tag not found but item is known (and not a general category policy tag)
    if(!tags.some(t => t.endsWith('_policy'))) {
        tags.push(`${itemId}_review`); 
        tags.push(`${idLower}_review`);
    }
  }

  // Fallback if no specific or general category tags were added for some reason
  if (tags.length === 0) {
    tags.push(`${itemId}_${fundingAction}`); // e.g. some_new_item_fund
  }
  return Array.from(new Set(tags)); // Ensure unique tags
}

export function getActionFromFundingLevel(level: FundingLevel): FundingAction {
    if (level < -0.5) return 'slash'; // Covers -2 and -1
    if (level > 0.5) return 'fund';   // Covers 1 and 2
    return 'review';                 // Covers 0
}

export function generateMatchedReason(tag: string, originalConcernDescription: string, fundingAction: FundingAction): MatchedReason {
    let reasonType: MatchedReason['type'] = 'general';
    let actionableTag = tag.replace(/_/g, ' '); // Basic cleaning for display

    // Determine reason type based on tag suffixes
    if (tag.endsWith('_cut') || tag.endsWith('_slash')) {
        reasonType = 'opposes';
        actionableTag = actionableTag.replace(/ cut$| slash$/i, ''); // Remove suffix
    } else if (tag.endsWith('_fund')) {
        reasonType = 'supports';
        actionableTag = actionableTag.replace(/ fund$/i, ''); // Remove suffix
    } else if (tag.endsWith('_review') || tag.endsWith('_reform')) {
        reasonType = 'reviews';
        actionableTag = actionableTag.replace(/ review$| reform$/i, ''); // Remove suffix
    }

    // Attempt to make actionableTag more human-readable
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
        description: `${actionableTag}`, // This is what the org does
        originalConcern: `${userActionText} ${cleanedConcern}`, // This is what the user wants for the item
        actionableTag: actionableTag.trim() // Cleaned tag for display
    };
}

export const MAX_SUGGESTIONS = 50; // Max suggestions to show
export const MAX_BADGES_PER_RESOURCE = 2; // Average 1-2, max 2-3. Let's aim for 2.
