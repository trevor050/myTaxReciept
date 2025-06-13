/**
 * @fileOverview Logic for suggesting relevant resources and organizations.
 * This file contains the database of resources and helper functions for matching and scoring.
 */

import { cleanItemDescription } from '@/services/email/utils';
import type { FundingLevel } from '@/services/email/types';
import type { MatchedReason, BadgeType, SuggestedResource, IntendedBadgeProfile } from '@/types/resource-suggestions';
import { BADGE_DISPLAY_PRIORITY_MAP } from '@/types/resource-suggestions'; // Already imported, now also export

export { BADGE_DISPLAY_PRIORITY_MAP }; // Export it

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
  intendedBadgeProfile?: IntendedBadgeProfile;
}

export const RESOURCE_DATABASE: ResourceDatabaseEntry[] = [
  // ========== PEACE & DEMILITARIZATION ==========
  {
    name: 'Peace Action',
    url: 'https://www.peaceaction.org/',
    description: 'Works to promote peace and demilitarization through grassroots organizing and advocacy.',
    icon: 'HandHeart',
    mainCategory: 'Peace & Demilitarization',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established', 'activism'],
    advocacyTags: ['peace', 'demilitarization', 'diplomacy_fund', 'defense_cut', 'military_personnel_review', 'operations_maintenance_cut', 'weapons_procurement_cut', 'nuclear_weapons_cut', 'foreign_military_aid_cut', 'international_affairs_fund'],
    intendedBadgeProfile: 'single-prominent',
  },
  {
    name: 'Friends Committee on National Legislation (FCNL)',
    url: 'https://www.fcnl.org/',
    description: 'A Quaker lobby in the public interest, working for peace, justice, and environmental stewardship.',
    icon: 'Scale',
    mainCategory: 'Peace & Social Justice',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established', 'think-tank'],
    advocacyTags: ['peace', 'social_justice', 'human_rights', 'criminal_justice_reform', 'defense_review', 'weapons_procurement_review', 'nuclear_weapons_review', 'foreign_military_aid_review', 'diplomacy_fund', 'international_affairs_fund', 'environmental_stewardship', 'epa_fund', 'federal_prisons_review', 'law_enforcement_review'],
    intendedBadgeProfile: 'double-diverse',
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
    advocacyTags: ['anti_war', 'demilitarization', 'defense_cut', 'foreign_policy_reform', 'diplomacy_fund', 'usaid_fund', 'international_affairs_fund', 'foreign_military_aid_cut'],
    intendedBadgeProfile: 'niche-focused',
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
    advocacyTags: ['nuclear_disarmament', 'arms_control', 'defense_review', 'nuclear_weapons_cut', 'nuclear_weapons_review', 'national_security_reform'],
    intendedBadgeProfile: 'niche-focused',
  },
  {
    name: 'Code Pink',
    url: 'https://www.codepink.org/',
    description: 'A women-led grassroots organization working to end U.S. wars and militarism and redirect resources to life-affirming programs.',
    icon: 'Flower2',
    mainCategory: 'Peace & Demilitarization',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'activism'],
    advocacyTags: ['anti_war', 'peace', 'demilitarization', 'defense_cut', 'foreign_military_aid_cut', 'diplomacy_fund', 'social_spending_fund', 'health_fund', 'education_fund'],
    intendedBadgeProfile: 'single-prominent',
  },
  {
    name: 'Security Policy Reform Institute (SPRI)',
    url: 'https://www.securitypolicy.us/',
    description: 'Provides research and analysis to promote diplomacy and reduce military intervention.',
    icon: 'Wrench',
    mainCategory: 'Peace & Demilitarization',
    prominence: 'low',
    focusType: 'broad',
    orgTypeTags: ['research', 'think-tank'],
    advocacyTags: ['national_security_reform', 'foreign_policy_reform', 'diplomacy_fund', 'defense_review', 'operations_maintenance_review', 'arpa_research_review'],
    intendedBadgeProfile: 'data-driven-focused',
  },
  {
    name: 'Quincy Institute for Responsible Statecraft',
    url: 'https://quincyinst.org/',
    description: 'A think tank promoting ideas that move U.S. foreign policy away from endless war and toward vigorous diplomacy.',
    icon: 'LibrarySquare',
    mainCategory: 'Peace & Demilitarization',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['think-tank', 'research'],
    advocacyTags: ['foreign_policy_reform', 'diplomacy_fund', 'demilitarization', 'defense_review', 'international_affairs_fund', 'anti_war'],
  },
  {
    name: 'Center for International Policy',
    url: 'https://www.internationalpolicy.org/',
    description: 'Promotes cooperation, transparency, and accountability in global relations. Focuses on peace-building and demilitarization.',
    icon: 'Building2',
    mainCategory: 'Peace & Demilitarization',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['research', 'think-tank'],
    advocacyTags: ['foreign_policy_reform', 'diplomacy_fund', 'demilitarization', 'arms_control', 'foreign_military_aid_review', 'usaid_fund'],
  },
  {
    name: 'Beyond the Bomb',
    url: 'https://www.beyondthebomb.org/',
    description: 'A grassroots movement working to free us from the threat of nuclear weapons and build a more just and secure world.',
    icon: 'Bomb',
    mainCategory: 'Peace & Demilitarization',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['grassroots', 'activism'],
    advocacyTags: ['nuclear_disarmament', 'anti_war', 'peace', 'nuclear_weapons_cut', 'defense_review'],
    intendedBadgeProfile: 'niche-focused',
  },
  {
    name: 'Center for Arms Control and Non-Proliferation',
    url: 'https://armscontrolcenter.org/',
    description: 'A non-partisan research organization dedicated to enhancing peace and security through expert policy analysis and thought leadership.',
    icon: 'Target',
    mainCategory: 'Peace & Demilitarization',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['research', 'think-tank'],
    advocacyTags: ['arms_control', 'nuclear_disarmament', 'national_security_reform', 'nuclear_weapons_review', 'defense_review'],
  },

  // ========== HUMAN RIGHTS & REGIONAL CONFLICTS ==========
  {
    name: 'US Campaign for Palestinian Rights (USCPR)',
    url: 'https://uscpr.org/',
    description: 'A national coalition working for Palestinian rights and an end to U.S. support for Israeli occupation.',
    icon: 'Vote',
    mainCategory: 'Human Rights & Regional Conflicts',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['grassroots', 'activism'],
    advocacyTags: ['palestinian_rights', 'human_rights', 'middle_east_peace', 'foreign_military_aid_cut', 'foreign_military_aid_review'],
    intendedBadgeProfile: 'niche-focused',
  },
  {
    name: 'Jewish Voice for Peace (JVP)',
    url: 'https://www.jewishvoiceforpeace.org/',
    description: 'A progressive Jewish anti-Zionist organization working for peace, justice, and human rights.',
    icon: 'Users',
    mainCategory: 'Human Rights & Regional Conflicts',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['grassroots', 'activism'],
    advocacyTags: ['palestinian_rights', 'anti_war', 'social_justice', 'human_rights', 'foreign_military_aid_cut', 'foreign_military_aid_review'],
    intendedBadgeProfile: 'community-focused',
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
    advocacyTags: ['human_rights', 'international_justice', 'refugee_rights', 'arms_control', 'foreign_military_aid_review', 'border_security_review', 'law_enforcement_review'],
    intendedBadgeProfile: 'single-prominent',
  },
  {
    name: 'Human Rights Watch',
    url: 'https://www.hrw.org/',
    description: 'Investigates and reports on abuses, holding abusers accountable to end abusive practices.',
    icon: 'Eye',
    mainCategory: 'Human Rights & Regional Conflicts',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'established'],
    advocacyTags: ['human_rights', 'international_justice', 'accountability_for_abuses', 'war_crimes_review', 'foreign_military_aid_review', 'border_security_review', 'federal_prisons_review'],
    intendedBadgeProfile: 'data-driven-focused',
  },
  {
    name: 'The Carter Center',
    url: 'https://www.cartercenter.org/',
    description: 'Wages peace, fights disease, and builds hope. Focuses on human rights, democracy building, and conflict resolution.',
    icon: 'Landmark',
    mainCategory: 'Human Rights & Regional Conflicts',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['established', 'direct-service'],
    advocacyTags: ['human_rights', 'democracy_reform', 'peace', 'global_health', 'diplomacy_fund', 'usaid_review', 'international_affairs_fund'],
    intendedBadgeProfile: 'single-prominent',
  },

  // ========== BUDGET & FISCAL RESPONSIBILITY ==========
  {
    name: 'National Priorities Project (IPS)',
    url: 'https://nationalpriorities.org/',
    description: 'Analyzes and advocates for a federal budget that prioritizes peace, economic opportunity, and a healthy environment.',
    icon: 'PieChart',
    mainCategory: 'Fiscal Responsibility',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'think-tank'],
    advocacyTags: ['budget_reform', 'tax_fairness', 'fiscal_responsibility', 'defense_cut', 'weapons_procurement_cut', 'nuclear_weapons_cut', 'social_spending_fund', 'interest_debt_review'],
    intendedBadgeProfile: 'data-driven-focused',
  },
  {
    name: 'Taxpayers for Common Sense',
    url: 'https://www.taxpayer.net/',
    description: 'A non-partisan budget watchdog working to ensure taxpayer dollars are spent responsibly.',
    icon: 'SearchCheck',
    mainCategory: 'Fiscal Responsibility',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['research', 'established'],
    advocacyTags: ['fiscal_responsibility', 'budget_reform', 'wasteful_spending_cut', 'government_accountability', 'defense_cut', 'weapons_procurement_cut', 'operations_maintenance_cut', 'commercial_space_review', 'interest_debt_review'],
    intendedBadgeProfile: 'data-driven-focused',
  },
  {
    name: 'Committee for a Responsible Federal Budget',
    url: 'https://www.crfb.org/',
    description: 'A nonpartisan organization committed to educating the public about fiscal policy issues.',
    icon: 'Banknote',
    mainCategory: 'Fiscal Responsibility',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'established', 'think-tank'],
    advocacyTags: ['fiscal_responsibility', 'debt_reduction', 'budget_reform', 'interest_debt_review', 'tax_reform_review', 'social_security_review', 'medicare_review', 'medicaid_review', 'snap_review', 'child_tax_credit_review'],
    intendedBadgeProfile: 'double-diverse',
  },
  {
    name: 'The Concord Coalition',
    url: 'https://www.concordcoalition.org/',
    description: 'A nationwide, non-partisan, grassroots organization advocating for responsible fiscal policy and generational equity.',
    icon: 'Users',
    mainCategory: 'Fiscal Responsibility',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'research', 'established'],
    advocacyTags: ['fiscal_responsibility', 'debt_reduction', 'budget_reform', 'generational_equity', 'social_security_review', 'medicare_review', 'interest_debt_review'],
  },
  {
    name: 'Americans for Tax Fairness',
    url: 'https://americansfortaxfairness.org/',
    description: 'A coalition of national, state, and local organizations united in support of a fair tax system that works for all Americans.',
    icon: 'Scale',
    mainCategory: 'Fiscal Responsibility',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'activism'],
    advocacyTags: ['tax_fairness', 'progressive_taxation', 'corporate_tax_reform', 'irs_fund', 'budget_reform'],
    intendedBadgeProfile: 'single-prominent',
  },

  // ========== CONSERVATIVE & LIBERTARIAN ==========
  {
    name: 'Cato Institute',
    url: 'https://www.cato.org/',
    description: 'A think tank dedicated to the principles of individual liberty, limited government, free markets, and peace.',
    icon: 'LibrarySquare',
    mainCategory: 'Conservative & Libertarian',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['think-tank', 'research', 'established'],
    advocacyTags: ['limited_government', 'free_markets', 'individual_liberty', 'fiscal_responsibility', 'budget_reform', 'defense_review', 'tax_reform_review', 'social_security_review', 'medicare_review', 'education_cut', 'epa_cut'],
    intendedBadgeProfile: 'double-diverse',
  },
  {
    name: 'The Heritage Foundation',
    url: 'https://www.heritage.org/',
    description: 'Promotes conservative public policies based on free enterprise, limited government, and a strong national defense.',
    icon: 'Landmark',
    mainCategory: 'Conservative & Libertarian',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['think-tank', 'research', 'established'],
    advocacyTags: ['conservative_policy', 'limited_government', 'free_enterprise', 'strong_national_defense', 'fiscal_responsibility', 'defense_fund', 'military_personnel_fund', 'tax_reform_review', 'budget_reform', 'irs_cut'],
    intendedBadgeProfile: 'double-diverse',
  },
  {
    name: 'American Enterprise Institute (AEI)',
    url: 'https://www.aei.org/',
    description: 'A conservative think tank that researches government, politics, economics, and social welfare.',
    icon: 'Building',
    mainCategory: 'Conservative & Libertarian',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['research', 'established', 'think-tank'],
    advocacyTags: ['conservative_policy', 'free_enterprise', 'limited_government', 'economic_policy_review', 'national_security_fund', 'defense_fund'],
    intendedBadgeProfile: 'data-driven-focused',
  },
  {
    name: 'Reason Foundation',
    url: 'https://reason.org/',
    description: 'Advances the values of individual freedom and limited government through journalism and public policy research.',
    icon: 'Lightbulb',
    mainCategory: 'Conservative & Libertarian',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['research', 'think-tank'],
    advocacyTags: ['libertarian_policy', 'free_markets', 'individual_liberty', 'privatization', 'transportation_review', 'education_review', 'criminal_justice_reform'],
  },
  {
    name: 'FreedomWorks',
    url: 'https://www.freedomworks.org/',
    description: 'A conservative and libertarian advocacy group that promotes free markets and limited government.',
    icon: 'Fist',
    mainCategory: 'Conservative & Libertarian',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'activism'],
    advocacyTags: ['limited_government', 'free_markets', 'fiscal_responsibility', 'tax_reform_review', 'budget_reform', 'irs_cut'],
  },

  // ========== HEALTHCARE ==========
  {
    name: 'Physicians for a National Health Program (PNHP)',
    url: 'https://pnhp.org/',
    description: 'Advocates for a universal, comprehensive single-payer national health program.',
    icon: 'HeartPulse',
    mainCategory: 'Healthcare',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['grassroots', 'think-tank', 'activism'],
    advocacyTags: ['single_payer', 'health_equity', 'health_fund', 'medicare_fund', 'medicaid_fund', 'aca_subsidies_fund', 'chip_fund', 'nih_fund'],
    intendedBadgeProfile: 'niche-focused',
  },
  {
    name: 'National Alliance on Mental Illness (NAMI)',
    url: 'https://www.nami.org/',
    description: 'The nation\'s largest grassroots mental health organization dedicated to building better lives for Americans affected by mental illness.',
    icon: 'Brain',
    mainCategory: 'Healthcare',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established', 'direct-service'],
    advocacyTags: ['mental_health_fund', 'health_equity', 'health_fund', 'medicaid_fund', 'nih_fund', 'cdc_fund', 'va_programs_fund'],
    intendedBadgeProfile: 'community-focused',
  },
  {
    name: 'Families USA',
    url: 'https://familiesusa.org/',
    description: 'A leading national, non-partisan voice for health care consumers, dedicated to high-quality, affordable health care for all.',
    icon: 'Users',
    mainCategory: 'Healthcare',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['research', 'established', 'think-tank'],
    advocacyTags: ['healthcare_reform', 'health_equity', 'medicaid_fund', 'medicare_fund', 'aca_subsidies_fund', 'chip_fund'],
    intendedBadgeProfile: 'legal-advocacy-focused',
  },
  {
    name: 'NARAL Pro-Choice America',
    url: 'https://www.prochoiceamerica.org/',
    description: 'Works to protect and expand reproductive freedom, including access to abortion and contraception.',
    icon: 'Baby',
    mainCategory: 'Healthcare',
    prominence: 'high',
    focusType: 'niche',
    orgTypeTags: ['activism', 'grassroots', 'established'],
    advocacyTags: ['reproductive_rights', 'healthcare_access', 'womens_health', 'family_planning', 'health_fund'],
    intendedBadgeProfile: 'niche-focused',
  },
  {
    name: 'Planned Parenthood Action Fund',
    url: 'https://www.plannedparenthoodaction.org/',
    description: 'The advocacy and political arm of Planned Parenthood, fighting to protect and expand access to reproductive health care.',
    icon: 'ShieldCheck',
    mainCategory: 'Healthcare',
    prominence: 'high',
    focusType: 'niche',
    orgTypeTags: ['activism', 'grassroots', 'established'],
    advocacyTags: ['reproductive_rights', 'healthcare_access', 'womens_health', 'health_fund', 'medicaid_review'],
  },
  {
    name: 'The Commonwealth Fund',
    url: 'https://www.commonwealthfund.org/',
    description: 'Promotes a high-performing health care system that achieves better access, improved quality, and greater efficiency, particularly for society\'s most vulnerable.',
    icon: 'HeartHandshake',
    mainCategory: 'Healthcare',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['research', 'think-tank'],
    advocacyTags: ['healthcare_reform', 'health_equity', 'health_system_efficiency', 'medicare_review', 'medicaid_review', 'aca_subsidies_review'],
  },

  // ========== ENVIRONMENT & ENERGY ==========
  {
    name: 'Environmental Working Group (EWG)',
    url: 'https://www.ewg.org/',
    description: 'A non-profit organization dedicated to protecting human health and the environment through research and advocacy.',
    icon: 'Leaf',
    mainCategory: 'Environment & Energy',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['research', 'established'],
    advocacyTags: ['environmental_protection', 'food_safety', 'water_quality', 'toxic_chemicals_cut', 'epa_fund', 'renewables_fund', 'snap_review'],
    intendedBadgeProfile: 'data-driven-focused',
  },
  {
    name: 'Sierra Club',
    url: 'https://www.sierraclub.org/',
    description: 'The nation\'s largest and most influential grassroots environmental organization.',
    icon: 'Mountain',
    mainCategory: 'Environment & Energy',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established', 'legal', 'activism'],
    advocacyTags: ['environmental_protection', 'climate_action_fund', 'public_lands_fund', 'wilderness_protection', 'energy_environment_fund', 'epa_fund', 'renewables_fund', 'forest_service_fund', 'national_parks_fund', 'noaa_fund'],
    intendedBadgeProfile: 'single-prominent',
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
    advocacyTags: ['environmental_protection', 'climate_action_fund', 'ocean_conservation', 'energy_environment_fund', 'epa_fund', 'renewables_fund', 'forest_service_fund', 'noaa_fund', 'usaid_fund'],
    intendedBadgeProfile: 'legal-advocacy-focused',
  },
  {
    name: 'Earthjustice',
    url: 'https://earthjustice.org/',
    description: 'A nonprofit public interest environmental law organization that wields the power of law to protect people\'s health and our planet.',
    icon: 'Gavel',
    mainCategory: 'Environment & Energy',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['legal', 'established'],
    advocacyTags: ['environmental_law', 'environmental_justice', 'wilderness_protection', 'ocean_conservation', 'climate_action_fund', 'energy_environment_fund', 'epa_fund', 'renewables_review', 'forest_service_review'],
    intendedBadgeProfile: 'legal-advocacy-focused',
  },
  {
    name: 'Greenpeace USA',
    url: 'https://www.greenpeace.org/usa/',
    description: 'Uses non-violent creative action to confront the systems that threaten our environment.',
    icon: 'Globe',
    mainCategory: 'Environment & Energy',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'activism', 'established'],
    advocacyTags: ['environmental_protection', 'ocean_conservation', 'deforestation_cut', 'plastic_pollution_cut', 'climate_action_fund', 'renewables_fund', 'epa_fund'],
    intendedBadgeProfile: 'community-focused',
  },
  {
    name: 'League of Conservation Voters (LCV)',
    url: 'https://www.lcv.org/',
    description: 'Advocates for sound environmental laws, holds elected officials accountable, and elects pro-environment candidates.',
    icon: 'Vote',
    mainCategory: 'Environment & Energy',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['activism', 'established'],
    advocacyTags: ['environmental_policy', 'political_accountability', 'climate_action_fund', 'epa_fund', 'renewables_fund'],
    intendedBadgeProfile: 'single-prominent',
  },
  {
    name: 'Defenders of Wildlife',
    url: 'https://defenders.org/',
    description: 'Dedicated to the protection of all native animals and plants in their natural communities.',
    icon: 'Rabbit',
    mainCategory: 'Environment & Energy',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['activism', 'legal', 'established'],
    advocacyTags: ['wildlife_protection', 'endangered_species_act', 'habitat_conservation', 'environmental_law', 'energy_environment_review', 'forest_service_fund', 'national_parks_fund'],
  },
  {
    name: 'Sunrise Movement',
    url: 'https://www.sunrisemovement.org/',
    description: 'A youth-led movement to stop climate change and create millions of good jobs in the process.',
    icon: 'CloudSun',
    mainCategory: 'Environment & Energy',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['grassroots', 'activism'],
    advocacyTags: ['climate_action_fund', 'green_new_deal', 'youth_activism', 'renewables_fund', 'public_transit_fund', 'climate_aid_fund'],
  },
  {
    name: 'The Nature Conservancy',
    url: 'https://www.nature.org/',
    description: 'A global environmental nonprofit working to create a world where people and nature can thrive.',
    icon: 'Sprout',
    mainCategory: 'Environment & Energy',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['established', 'direct-service', 'research'],
    advocacyTags: ['conservation', 'climate_action_fund', 'ocean_conservation', 'freshwater_protection', 'forest_service_review', 'national_parks_review', 'noaa_review'],
  },
  
  // ========== SCIENCE & TECHNOLOGY ==========
  {
    name: 'The Planetary Society',
    url: 'https://www.planetary.org/',
    description: 'Empowers the world\'s citizens to advance space science and exploration.',
    icon: 'Rocket',
    mainCategory: 'Science & Technology',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['grassroots', 'research', 'activism'],
    advocacyTags: ['space_exploration', 'science_fund', 'nasa_fund', 'nsf_fund', 'commercial_space_review'],
    intendedBadgeProfile: 'niche-focused',
  },
  {
    name: 'Union of Concerned Scientists',
    url: 'https://www.ucsusa.org/',
    description: 'Puts rigorous, independent science to work to solve our planet\'s most pressing problems.',
    icon: 'FlaskConical',
    mainCategory: 'Science & Technology',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'established', 'think-tank'],
    advocacyTags: ['scientific_integrity', 'science_fund', 'environmental_protection', 'climate_action_fund', 'sustainable_agriculture', 'nuclear_weapons_review', 'epa_review', 'nsf_review', 'nasa_review'],
    intendedBadgeProfile: 'data-driven-focused',
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
    advocacyTags: ['science_policy', 'national_security_reform', 'arms_control', 'nuclear_weapons_review', 'arpa_research_review'],
    intendedBadgeProfile: 'data-driven-focused',
  },
  {
    name: 'Electronic Frontier Foundation (EFF)',
    url: 'https://www.eff.org/',
    description: 'Defending civil liberties in the digital world. Works on issues of free speech, privacy, innovation, and consumer rights online.',
    icon: 'ShieldAlert',
    mainCategory: 'Science & Technology',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['legal', 'research', 'established', 'activism'],
    advocacyTags: ['digital_rights', 'privacy_rights', 'free_speech_online', 'surveillance_review', 'corporate_power_review', 'tsa_review', 'cfpb_review', 'commercial_space_review'],
    intendedBadgeProfile: 'legal-advocacy-focused',
  },
  {
    name: 'Center for Democracy & Technology (CDT)',
    url: 'https://cdt.org/',
    description: 'Works to promote democratic values by shaping technology policy and architecture, with a focus on the rights of the individual.',
    icon: 'Computer',
    mainCategory: 'Science & Technology',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['research', 'legal', 'think-tank'],
    advocacyTags: ['digital_rights', 'privacy_rights', 'free_speech_online', 'surveillance_review', 'democracy_reform', 'fbi_review'],
  },

  // ========== CIVIL RIGHTS & SOCIAL JUSTICE ==========
  {
    name: 'American Civil Liberties Union (ACLU)',
    url: 'https://www.aclu.org/',
    description: 'Works to defend and preserve the individual rights and liberties guaranteed by the Constitution and laws of the United States.',
    icon: 'Gavel',
    mainCategory: 'Civil Rights & Social Justice',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['legal', 'established', 'grassroots', 'activism'],
    advocacyTags: ['civil_rights', 'civil_liberties', 'privacy_rights', 'government_accountability', 'criminal_justice_reform', 'immigration_reform', 'law_enforcement_review', 'border_security_review', 'federal_prisons_review', 'public_defenders_fund'],
    intendedBadgeProfile: 'legal-advocacy-focused',
  },
  {
    name: 'NAACP Legal Defense Fund (LDF)',
    url: 'https://www.naacpldf.org/',
    description: 'America\'s premier legal organization fighting for racial justice through litigation, advocacy, and public education.',
    icon: 'Scale',
    mainCategory: 'Civil Rights & Social Justice',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['legal', 'established'],
    advocacyTags: ['racial_justice', 'civil_rights', 'voting_rights', 'education_equity', 'criminal_justice_reform', 'k12_schools_review', 'mbda_fund'],
    intendedBadgeProfile: 'legal-advocacy-focused',
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
    advocacyTags: ['anti_hate', 'civil_rights', 'racial_justice', 'immigrant_rights', 'lgbtq_rights', 'criminal_justice_reform', 'law_enforcement_review'],
    intendedBadgeProfile: 'triple-focused',
  },
  {
    name: 'The Marshall Project',
    url: 'https://www.themarshallproject.org/',
    description: 'A nonpartisan, nonprofit news organization covering the U.S. criminal justice system.',
    icon: 'Newspaper',
    mainCategory: 'Civil Rights & Social Justice',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['research'],
    advocacyTags: ['criminal_justice_reform', 'racial_justice', 'law_enforcement_review', 'federal_prisons_review', 'border_security_review', 'public_defenders_fund'],
    intendedBadgeProfile: 'data-driven-focused',
  },
  {
    name: 'The Sentencing Project',
    url: 'https://www.sentencingproject.org/',
    description: 'Works for a fair and effective U.S. criminal justice system by promoting reforms in sentencing policy, addressing unjust racial disparities and practices, and advocating for alternatives to incarceration.',
    icon: 'FileText',
    mainCategory: 'Civil Rights & Social Justice',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['research', 'think-tank'],
    advocacyTags: ['criminal_justice_reform', 'sentencing_reform', 'racial_justice', 'federal_prisons_cut', 'law_enforcement_review'],
  },
  {
    name: 'Brady United Against Gun Violence',
    url: 'https://www.bradyunited.org/',
    description: 'Works to pass, enforce, and protect sensible gun laws and regulations to reduce gun violence.',
    icon: 'ShieldAlert',
    mainCategory: 'Civil Rights & Social Justice',
    prominence: 'high',
    focusType: 'niche',
    orgTypeTags: ['activism', 'legal', 'grassroots'],
    advocacyTags: ['gun_violence_prevention', 'public_safety', 'background_checks', 'community_violence_intervention', 'law_enforcement_review'],
    intendedBadgeProfile: 'niche-focused',
  },
  {
    name: 'The Bail Project',
    url: 'https://bailproject.org/',
    description: 'A national nonprofit organization that pays bail for people in need, reuniting families and restoring the presumption of innocence.',
    icon: 'Wallet',
    mainCategory: 'Civil Rights & Social Justice',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['direct-service', 'activism'],
    advocacyTags: ['criminal_justice_reform', 'bail_reform', 'racial_justice', 'federal_prisons_review', 'public_defenders_fund'],
  },
  {
    name: 'Human Rights Campaign (HRC)',
    url: 'https://www.hrc.org/',
    description: 'The largest LGBTQ civil rights organization in the United States, working to achieve equality for lesbian, gay, bisexual, transgender and queer Americans.',
    icon: 'Rainbow',
    mainCategory: 'Civil Rights & Social Justice',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['activism', 'grassroots', 'established'],
    advocacyTags: ['lgbtq_rights', 'civil_rights', 'equality', 'health_equity', 'anti_hate'],
  },

  // ========== DEMOCRACY & GOVERNANCE ==========
  {
    name: 'Common Cause',
    url: 'https://www.commoncause.org/',
    description: 'A nonpartisan grassroots organization dedicated to upholding the core values of American democracy.',
    icon: 'Vote',
    mainCategory: 'Democracy & Governance',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established'],
    advocacyTags: ['democracy_reform', 'voting_rights', 'campaign_finance_reform', 'government_accountability', 'ethics_reform', 'federal_courts_review', 'irs_review'],
    intendedBadgeProfile: 'community-focused',
  },
  {
    name: 'Brennan Center for Justice',
    url: 'https://www.brennancenter.org/',
    description: 'A nonpartisan law and policy institute that works to reform, revitalize, and defend our country\'s systems of democracy and justice.',
    icon: 'LibrarySquare',
    mainCategory: 'Democracy & Governance',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'legal', 'established', 'think-tank'],
    advocacyTags: ['democracy_reform', 'voting_rights', 'campaign_finance_reform', 'criminal_justice_reform', 'justice_system_review', 'government_ops_review', 'federal_courts_review', 'public_defenders_fund', 'federal_prisons_review'],
    intendedBadgeProfile: 'triple-focused',
  },
  {
    name: 'Center for Responsive Politics (OpenSecrets)',
    url: 'https://www.opensecrets.org/',
    description: 'Tracks money in U.S. politics and its effect on elections and public policy.',
    icon: 'DollarSign',
    mainCategory: 'Democracy & Governance',
    prominence: 'high',
    focusType: 'niche',
    orgTypeTags: ['research', 'established'],
    advocacyTags: ['campaign_finance_reform', 'government_accountability', 'ethics_reform', 'lobbying_reform', 'weapons_procurement_review'],
    intendedBadgeProfile: 'data-driven-focused',
  },
  {
    name: 'Demand Progress',
    url: 'https://demandprogress.org/',
    description: 'Fights for a more just and democratic world by organizing for progressive policy changes on surveillance, money in politics, and corporate power.',
    icon: 'Megaphone',
    mainCategory: 'Democracy & Governance',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'activism'],
    advocacyTags: ['democracy_reform', 'anti_surveillance', 'corporate_power_review', 'government_accountability', 'privacy_rights', 'cfpb_fund', 'tsa_review'],
    intendedBadgeProfile: 'community-focused',
  },
  {
    name: 'Project On Government Oversight (POGO)',
    url: 'https://www.pogo.org/',
    description: 'A nonpartisan independent watchdog that investigates and exposes waste, corruption, and abuse of power.',
    icon: 'Eye',
    mainCategory: 'Democracy & Governance',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'established'],
    advocacyTags: ['government_accountability', 'whistleblower_protection', 'wasteful_spending_cut', 'defense_review', 'weapons_procurement_review', 'operations_maintenance_review', 'government_ops_review', 'irs_review', 'cfpb_review'],
    intendedBadgeProfile: 'data-driven-focused',
  },
  {
    name: 'ProPublica',
    url: 'https://www.propublica.org/',
    description: 'An independent, nonprofit newsroom that produces investigative journalism with moral force.',
    icon: 'Search',
    mainCategory: 'Democracy & Governance',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research'],
    advocacyTags: ['investigative_journalism', 'government_accountability', 'corporate_accountability', 'defense_review', 'irs_review', 'fema_disaster_review'],
    intendedBadgeProfile: 'data-driven-focused',
  },
  {
    name: 'League of Women Voters',
    url: 'https://www.lwv.org/',
    description: 'A nonpartisan political organization encouraging informed and active participation in government.',
    icon: 'Landmark',
    mainCategory: 'Democracy & Governance',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established'],
    advocacyTags: ['voting_rights', 'democracy_reform', 'civic_engagement', 'government_accountability'],
    intendedBadgeProfile: 'community-focused',
  },

  // ========== EDUCATION ==========
  {
    name: 'National Education Association (NEA)',
    url: 'https://www.nea.org/',
    description: 'The nation\'s largest professional employee organization, committed to advancing the cause of public education.',
    icon: 'School',
    mainCategory: 'Education',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established', 'direct-service'],
    advocacyTags: ['public_education', 'teacher_support', 'education_fund', 'k12_schools_fund', 'college_aid_fund', 'head_start_fund', 'ed_ops_fund'],
    intendedBadgeProfile: 'community-focused',
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
    advocacyTags: ['education_equity', 'social_justice', 'education_fund', 'k12_schools_fund', 'college_aid_fund', 'ed_ops_review'],
    intendedBadgeProfile: 'data-driven-focused',
  },
  {
    name: 'Teach For America',
    url: 'https://www.teachforamerica.org/',
    description: 'Finds, develops, and supports a network of leaders who expand opportunity for children from classrooms, schools, and every sector and field that shapes the broader systems in which schools operate.',
    icon: 'Users',
    mainCategory: 'Education',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['direct-service', 'established'],
    advocacyTags: ['education_equity', 'teacher_development', 'k12_schools_review', 'ed_ops_review'],
  },
  {
    name: 'Student Debt Crisis Center',
    url: 'https://www.studentdebtcrisis.org/',
    description: 'A non-profit organization dedicated to ending the student debt crisis.',
    icon: 'FileMinus',
    mainCategory: 'Education',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['grassroots', 'activism'],
    advocacyTags: ['student_debt_reform', 'higher_education_affordability', 'college_aid_review', 'education_review'],
    intendedBadgeProfile: 'niche-focused',
  },

  // ========== HOUSING & COMMUNITY ==========
  {
    name: 'National Low Income Housing Coalition',
    url: 'https://nlihc.org/',
    description: 'Dedicated to achieving socially just public policy that ensures people with the lowest incomes have affordable and decent homes.',
    icon: 'Home',
    mainCategory: 'Housing & Community',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'grassroots', 'established', 'think-tank'],
    advocacyTags: ['housing_affordability', 'homelessness_prevention', 'social_spending_fund', 'housing_community_fund', 'hud_fund', 'public_housing_fund', 'liheap_fund', 'community_block_grants_fund'],
    intendedBadgeProfile: 'legal-advocacy-focused',
  },
  {
    name: 'National Alliance to End Homelessness',
    url: 'https://endhomelessness.org/',
    description: 'A nonpartisan organization committed to preventing and ending homelessness in the United States.',
    icon: 'Bed',
    mainCategory: 'Housing & Community',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['research', 'established', 'direct-service'],
    advocacyTags: ['homelessness_prevention', 'housing_first', 'housing_community_fund', 'hud_fund', 'public_housing_review', 'mental_health_fund', 'va_programs_fund'],
    intendedBadgeProfile: 'community-focused',
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
    advocacyTags: ['housing_affordability', 'community_development', 'volunteerism', 'hud_review', 'community_block_grants_fund'],
    intendedBadgeProfile: 'community-focused',
  },
  {
    name: 'Local Initiatives Support Corporation (LISC)',
    url: 'https://www.lisc.org/',
    description: 'A national non-profit that equips communities with the capital, strategy, and know-how to become places where people can thrive.',
    icon: 'Building2',
    mainCategory: 'Housing & Community',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['direct-service', 'established'],
    advocacyTags: ['community_development', 'housing_affordability', 'economic_opportunity', 'community_block_grants_fund', 'hud_review', 'mbda_fund'],
  },

  // ========== FOOD & AGRICULTURE ==========
  {
    name: 'Food Research & Action Center (FRAC)',
    url: 'https://frac.org/',
    description: 'The leading national nonprofit organization working to eradicate poverty-related hunger and undernutrition in the United States.',
    icon: 'Utensils',
    mainCategory: 'Food & Agriculture',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'established', 'think-tank'],
    advocacyTags: ['anti_hunger', 'food_security', 'social_spending_fund', 'economic_security_fund', 'snap_fund', 'tanf_fund', 'child_tax_credit_fund'],
    intendedBadgeProfile: 'data-driven-focused',
  },
  {
    name: 'National Sustainable Agriculture Coalition',
    url: 'https://sustainableagriculture.net/',
    description: 'An alliance of grassroots organizations that advocates for federal policy reform for sustainable agriculture and food systems.',
    icon: 'Tractor',
    mainCategory: 'Food & Agriculture',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established', 'think-tank'],
    advocacyTags: ['sustainable_agriculture', 'food_systems_change', 'rural_development', 'farm_bill_reform', 'snap_review'],
    intendedBadgeProfile: 'community-focused',
  },
  {
    name: 'Feeding America',
    url: 'https://www.feedingamerica.org/',
    description: 'The nation\'s largest domestic hunger-relief organization, a network of 200 food banks and 60,000 food pantries.',
    icon: 'ShoppingBasket',
    mainCategory: 'Food & Agriculture',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['direct-service', 'established'],
    advocacyTags: ['anti_hunger', 'food_security', 'snap_fund', 'tanf_fund', 'child_tax_credit_fund'],
  },
  {
    name: 'Heifer International',
    url: 'https://www.heifer.org/',
    description: 'Works with communities to end hunger and poverty and care for the Earth.',
    icon: 'Cow',
    mainCategory: 'Food & Agriculture',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['direct-service', 'established'],
    advocacyTags: ['anti_hunger', 'sustainable_agriculture', 'global_poverty', 'usaid_review', 'climate_aid_review'],
  },

  // ========== VETERANS AFFAIRS ==========
  {
    name: 'Veterans of Foreign Wars (VFW)',
    url: 'https://www.vfw.org/',
    description: 'A nonprofit service organization for eligible veterans and military service members from the active, guard and reserve forces.',
    icon: 'Medal',
    mainCategory: 'Veterans Affairs',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established', 'direct-service'],
    advocacyTags: ['veteran_benefits', 'national_security_fund', 'veterans_retirement_fund', 'va_programs_fund', 'military_pensions_fund', 'pact_act_fund', 'defense_fund'],
    intendedBadgeProfile: 'community-focused',
  },
  {
    name: 'Iraq and Afghanistan Veterans of America (IAVA)',
    url: 'https://iava.org/',
    description: 'The leading post-9/11 veteran empowerment organization with a diverse and rapidly growing membership.',
    icon: 'Users',
    mainCategory: 'Veterans Affairs',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['grassroots', 'activism'],
    advocacyTags: ['post_911_veterans', 'suicide_prevention_fund', 'veterans_retirement_fund', 'va_programs_fund', 'pact_act_fund', 'mental_health_fund'],
    intendedBadgeProfile: 'niche-focused',
  },
  {
    name: 'Disabled American Veterans (DAV)',
    url: 'https://www.dav.org/',
    description: 'Provides a lifetime of support for veterans of all generations and their families, helping more than 1 million veterans in positive, life-changing ways each year.',
    icon: 'HelpingHand',
    mainCategory: 'Veterans Affairs',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['direct-service', 'established'],
    advocacyTags: ['veteran_benefits', 'disability_rights', 'va_programs_fund', 'ss_disability_review', 'military_pensions_review'],
  },
  {
    name: 'Student Veterans of America (SVA)',
    url: 'https://studentveterans.org/',
    description: 'Provides military veterans with the resources, support, and advocacy needed to succeed in higher education and following graduation.',
    icon: 'GraduationCap',
    mainCategory: 'Veterans Affairs',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['direct-service', 'grassroots'],
    advocacyTags: ['veteran_benefits', 'higher_education', 'gi_bill', 'va_programs_review', 'college_aid_review'],
  },

  // ========== LABOR & WORKER RIGHTS ==========
  {
    name: 'AFL-CIO',
    url: 'https://aflcio.org/',
    description: 'The largest federation of unions in the United States, representing more than 12.5 million working men and women.',
    icon: 'Hammer',
    mainCategory: 'Labor & Worker Rights',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established'],
    advocacyTags: ['labor_rights', 'worker_protections', 'fair_wages', 'economic_security_fund', 'unemployment_insurance_fund', 'tanf_fund', 'child_tax_credit_fund'],
    intendedBadgeProfile: 'single-prominent',
  },
  {
    name: 'National Employment Law Project (NELP)',
    url: 'https://www.nelp.org/',
    description: 'A research and advocacy organization that fights for policies to create good jobs and strengthen protections for low-wage workers.',
    icon: 'Briefcase',
    mainCategory: 'Labor & Worker Rights',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['research', 'legal', 'think-tank'],
    advocacyTags: ['worker_rights', 'fair_wages', 'job_safety', 'social_safety_net_fund', 'unemployment_insurance_review', 'economic_security_review'],
    intendedBadgeProfile: 'legal-advocacy-focused',
  },
  {
    name: 'Service Employees International Union (SEIU)',
    url: 'https://www.seiu.org/',
    description: 'An organization of 2 million members united by the belief in the dignity and worth of workers and the services they provide.',
    icon: 'HeartHandshake',
    mainCategory: 'Labor & Worker Rights',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['grassroots', 'established'],
    advocacyTags: ['labor_rights', 'worker_protections', 'fair_wages', 'health_care_workers', 'immigrant_rights'],
  },
  {
    name: 'Fight for $15',
    url: 'https://fightfor15.org/',
    description: 'A global political movement working to increase the minimum wage to $15 an hour.',
    icon: 'DollarSign',
    mainCategory: 'Labor & Worker Rights',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['grassroots', 'activism'],
    advocacyTags: ['fair_wages', 'minimum_wage_increase', 'worker_rights', 'economic_justice'],
  },

   // ========== IMMIGRATION ==========
  {
    name: 'National Immigration Law Center (NILC)',
    url: 'https://www.nilc.org/',
    description: 'Dedicated to defending and advancing the rights of immigrants with low income.',
    icon: 'Anchor',
    mainCategory: 'Immigration',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['legal', 'research', 'established'],
    advocacyTags: ['immigration_reform', 'immigrant_rights', 'civil_rights', 'law_enforcement_review', 'border_security_cut', 'snap_fund', 'medicaid_fund'],
    intendedBadgeProfile: 'legal-advocacy-focused',
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
    advocacyTags: ['immigration_reform', 'immigrant_rights', 'economic_contribution_immigrants', 'law_enforcement_review', 'border_security_review'],
    intendedBadgeProfile: 'data-driven-focused',
  },
  {
    name: 'RAICES',
    url: 'https://www.raicestexas.org/',
    description: 'Provides free and low-cost legal services to underserved immigrant children, families, and refugees.',
    icon: 'Gavel',
    mainCategory: 'Immigration',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['legal', 'direct-service', 'grassroots'],
    advocacyTags: ['immigrant_rights', 'refugee_assistance', 'legal_aid', 'asylum_reform', 'law_enforcement_cut', 'border_security_cut'],
    intendedBadgeProfile: 'community-focused',
  },
  {
    name: 'United We Dream',
    url: 'https://unitedwedream.org/',
    description: 'The largest immigrant youth-led community in the country, creating welcoming spaces for young people - regardless of immigration status.',
    icon: 'CloudSun',
    mainCategory: 'Immigration',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['grassroots', 'activism'],
    advocacyTags: ['immigration_reform', 'daca', 'youth_activism', 'immigrant_rights', 'border_security_cut'],
  },

  // ========== CONSUMER PROTECTION ==========
  {
    name: 'Consumer Federation of America (CFA)',
    url: 'https://consumerfed.org/',
    description: 'An association of non-profit consumer organizations advancing the consumer interest through research, advocacy, and education.',
    icon: 'ShoppingCart',
    mainCategory: 'Consumer Protection',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['research', 'established', 'think-tank'],
    advocacyTags: ['consumer_rights', 'financial_regulation_review', 'product_safety', 'privacy_rights', 'government_ops_fund', 'cfpb_fund'],
    intendedBadgeProfile: 'triple-focused',
  },
  {
    name: 'U.S. PIRG (Public Interest Research Group)',
    url: 'https://pirg.org/',
    description: 'Stands up to powerful interests whenever they threaten our health and safety, our financial security, or our right to fully participate in our democratic society.',
    icon: 'Megaphone',
    mainCategory: 'Consumer Protection',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['activism', 'grassroots'],
    advocacyTags: ['consumer_rights', 'public_health', 'corporate_accountability', 'cfpb_fund', 'epa_fund', 'transportation_review'],
  },
  {
    name: 'Center for Science in the Public Interest (CSPI)',
    url: 'https://www.cspinet.org/',
    description: 'A consumer advocacy organization whose twin missions are to conduct innovative research and advocacy programs in health and nutrition, and to provide consumers with current, useful information.',
    icon: 'Beaker',
    mainCategory: 'Consumer Protection',
    prominence: 'medium',
    focusType: 'niche',
    orgTypeTags: ['research', 'activism'],
    advocacyTags: ['consumer_rights', 'food_safety', 'public_health', 'nutrition_policy', 'snap_review', 'cdc_review'],
  },

  // ========== TRANSPORTATION ==========
  {
    name: 'Transportation for America',
    url: 'https://t4america.org/',
    description: 'An alliance of leaders from across the country united to invest in a modern transportation system.',
    icon: 'Train',
    mainCategory: 'Transportation',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['think-tank', 'activism', 'established'],
    advocacyTags: ['transportation_reform', 'complete_streets', 'transportation_fund', 'public_transit_fund', 'highways_review', 'rail_service_fund', 'faa_review'],
    intendedBadgeProfile: 'double-diverse',
  },
  {
    name: 'America Walks',
    url: 'https://americawalks.org/',
    description: 'Works to make America a great place to walk by promoting walkable communities.',
    icon: 'Footprints',
    mainCategory: 'Transportation',
    prominence: 'low',
    focusType: 'niche',
    orgTypeTags: ['grassroots', 'activism'],
    advocacyTags: ['walkability', 'complete_streets', 'transportation_reform', 'public_transit_fund', 'highways_cut'],
  },

  // ========== ECONOMIC JUSTICE ==========
  {
    name: 'Center on Budget and Policy Priorities (CBPP)',
    url: 'https://www.cbpp.org/',
    description: 'A nonpartisan research and policy institute pursuing policies designed to reduce poverty and inequality.',
    icon: 'TrendingUp',
    mainCategory: 'Economic Justice',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'established', 'think-tank'],
    advocacyTags: ['poverty_reduction', 'economic_inequality', 'tax_fairness', 'social_safety_net_fund', 'economic_security_fund', 'snap_fund', 'child_tax_credit_fund', 'housing_affordability', 'hud_fund'],
    intendedBadgeProfile: 'data-driven-focused',
  },
  {
    name: 'Center for Economic and Policy Research (CEPR)',
    url: 'https://cepr.net/',
    description: 'Promoting democratic debate on the most important economic and social issues that affect people\'s lives.',
    icon: 'Activity',
    mainCategory: 'Economic Justice',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['research', 'think-tank'],
    advocacyTags: ['economic_policy_review', 'social_safety_net_fund', 'full_employment', 'global_economic_justice', 'social_security_review', 'medicare_review'],
    intendedBadgeProfile: 'data-driven-focused',
  },
  {
    name: 'The Roosevelt Institute',
    url: 'https://rooseveltinstitute.org/',
    description: 'A think tank that promotes the legacy of Franklin and Eleanor Roosevelt by developing progressive ideas and leadership.',
    icon: 'BrainCircuit',
    mainCategory: 'Economic Justice',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['research', 'think-tank'],
    advocacyTags: ['progressive_policy', 'economic_inequality', 'corporate_power_review', 'workers_rights', 'climate_action_fund', 'social_safety_net_fund'],
  },
  {
    name: 'Demos',
    url: 'https://www.demos.org/',
    description: 'A dynamic "think-and-do" tank that powers the movement for a just, inclusive, multiracial democracy.',
    icon: 'UserCheck',
    mainCategory: 'Economic Justice',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['research', 'think-tank', 'activism'],
    advocacyTags: ['economic_justice', 'racial_equity', 'democracy_reform', 'voting_rights', 'student_debt_reform'],
  },
  {
    name: 'Institute for Policy Studies (IPS)',
    url: 'https://ips-dc.org/',
    description: 'A multi-issue think tank that has conducted progressive research and action for over 50 years.',
    icon: 'Library',
    mainCategory: 'Economic Justice',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['research', 'think-tank'],
    advocacyTags: ['progressive_policy', 'economic_inequality', 'racial_justice', 'climate_justice', 'peace', 'budget_reform'],
  },

  // ========== PUBLIC POLICY RESEARCH (GENERAL) ==========
  {
    name: 'Brookings Institution',
    url: 'https://www.brookings.edu/',
    description: 'A nonprofit public policy organization committed to independent research and policy solutions.',
    icon: 'Building',
    mainCategory: 'Public Policy Research',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'established', 'think-tank'],
    advocacyTags: ['public_policy_research', 'economic_policy_review', 'foreign_policy_review', 'social_policy_review', 'governance_reform', 'defense_review', 'health_review', 'education_review'],
    intendedBadgeProfile: 'double-diverse',
  },
  {
    name: 'The Urban Institute',
    url: 'https://www.urban.org/',
    description: 'A nonprofit research organization that provides data and evidence to help advance upward mobility and equity.',
    icon: 'MapPinned',
    mainCategory: 'Public Policy Research',
    prominence: 'medium',
    focusType: 'broad',
    orgTypeTags: ['research', 'think-tank'],
    advocacyTags: ['social_policy_review', 'economic_policy_review', 'racial_equity', 'poverty_reduction', 'housing_review', 'criminal_justice_review'],
  },
  {
    name: 'RAND Corporation',
    url: 'https://www.rand.org/',
    description: 'A research organization that develops solutions to public policy challenges to help make communities throughout the world safer and more secure.',
    icon: 'Brain',
    mainCategory: 'Public Policy Research',
    prominence: 'high',
    focusType: 'broad',
    orgTypeTags: ['research', 'established', 'think-tank'],
    advocacyTags: ['public_policy_research', 'national_security_review', 'health_policy_review', 'education_policy_review', 'infrastructure_review'],
  },
];


// --- NEW, SIMPLIFIED TAG GENERATION LOGIC ---

/**
 * Maps a spending item ID to a set of advocacy tags.
 * This new version uses a direct mapping for clarity and maintainability.
 * @param itemId The unique identifier for the spending item (e.g., 'ss_retirement').
 * @param fundingAction The user's desired action ('slash', 'fund', 'review').
 * @returns An array of relevant advocacy tags.
 */
export function getItemAdvocacyTags(itemId: string, fundingAction: FundingAction): string[] {
  const baseTag = itemId; // The new item IDs are the base tags.
  const tags: Set<string> = new Set();

  // Add the action-specific tag.
  tags.add(`${baseTag}_${fundingAction}`);

  // Add broader, category-level tags for more general matching.
  const categoryMap: { [key: string]: string[] } = {
    // Social Security
    'ss_retirement': ['social_security', 'social_safety_net'],
    'ss_disability': ['social_security', 'social_safety_net', 'disability_rights'],
    // Health
    'medicare': ['health', 'social_safety_net'],
    'medicaid': ['health', 'social_safety_net', 'poverty_reduction'],
    'aca_subsidies': ['health', 'healthcare_reform'],
    'chip': ['health', 'childrens_welfare'],
    'nih': ['health', 'science'],
    'cdc': ['health', 'public_safety'],
    // Defense
    'military_personnel': ['defense', 'national_security'],
    'operations_maintenance': ['defense', 'national_security', 'wasteful_spending'],
    'weapons_procurement': ['defense', 'national_security', 'wasteful_spending', 'corporate_power'],
    'nuclear_weapons': ['defense', 'national_security', 'nuclear_disarmament'],
    'foreign_military_aid': ['defense', 'foreign_policy', 'international_affairs'],
    // Interest
    'interest_debt': ['fiscal_responsibility', 'debt_reduction', 'budget_reform'],
    // Veterans & Retirement
    'va_programs': ['veterans_retirement', 'veteran_benefits'],
    'military_pensions': ['veterans_retirement', 'veteran_benefits'],
    'civilian_pensions': ['veterans_retirement', 'government_ops'],
    'pact_act': ['veterans_retirement', 'veteran_benefits', 'health'],
    // Economic Security
    'snap': ['economic_security', 'social_safety_net', 'poverty_reduction', 'anti_hunger'],
    'unemployment_insurance': ['economic_security', 'social_safety_net', 'labor_rights'],
    'ssi': ['economic_security', 'social_safety_net', 'disability_rights', 'poverty_reduction'],
    'tanf': ['economic_security', 'social_safety_net', 'poverty_reduction'],
    'child_tax_credit': ['economic_security', 'social_safety_net', 'poverty_reduction', 'childrens_welfare'],
    'liheap': ['economic_security', 'social_safety_net', 'energy'],
    // Education
    'k12_schools': ['education', 'childrens_welfare'],
    'college_aid': ['education', 'higher_education'],
    'ed_ops': ['education', 'government_ops'],
    // Housing & Community
    'hud': ['housing_community', 'housing_affordability'],
    'public_housing': ['housing_community', 'housing_affordability', 'poverty_reduction'],
    'fema_disaster': ['housing_community', 'disaster_relief', 'climate_action'],
    'head_start': ['housing_community', 'education', 'childrens_welfare', 'poverty_reduction'],
    'community_block_grants': ['housing_community', 'community_development'],
    // Transportation
    'highways': ['transportation', 'infrastructure'],
    'public_transit': ['transportation', 'infrastructure', 'climate_action'],
    'rail_service': ['transportation', 'infrastructure', 'climate_action'],
    'tsa': ['transportation', 'national_security', 'civil_liberties'],
    'faa': ['transportation', 'public_safety'],
    // Energy & Environment
    'epa': ['energy_environment', 'environmental_protection', 'public_health'],
    'renewables': ['energy_environment', 'climate_action', 'energy'],
    'forest_service': ['energy_environment', 'public_lands', 'conservation'],
    'national_parks': ['energy_environment', 'public_lands', 'conservation'],
    'noaa': ['energy_environment', 'science', 'climate_action'],
    // International Affairs
    'diplomacy': ['international_affairs', 'foreign_policy', 'diplomacy'],
    'usaid': ['international_affairs', 'foreign_policy', 'humanitarian_aid'],
    'climate_aid': ['international_affairs', 'foreign_policy', 'climate_action', 'humanitarian_aid'],
    // Law Enforcement
    'fbi': ['law_enforcement', 'national_security', 'civil_liberties'],
    'border_security': ['law_enforcement', 'immigration_reform', 'civil_liberties'],
    'federal_prisons': ['law_enforcement', 'criminal_justice_reform'],
    // Science & Tech
    'nasa': ['science', 'space_exploration'],
    'nsf': ['science'],
    'arpa_research': ['science', 'defense', 'energy'],
    'commercial_space': ['science', 'space_exploration', 'corporate_power'],
    // Government Ops
    'irs': ['government_ops', 'tax_fairness', 'fiscal_responsibility'],
    'federal_courts': ['government_ops', 'justice_system'],
    'public_defenders': ['government_ops', 'justice_system', 'criminal_justice_reform'],
    'cfpb': ['government_ops', 'consumer_rights', 'corporate_power'],
    'mbda': ['government_ops', 'racial_justice', 'economic_inequality'],
  };

  const generalTags = categoryMap[baseTag] || [];
  generalTags.forEach(tag => {
    // For general tags, the action is suffixed to the general tag itself,
    // e.g., 'health_fund', 'defense_cut', 'transportation_review'
    tags.add(`${tag}_${fundingAction}`);
  });

  return Array.from(tags);
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

export const MAX_BADGES_PER_RESOURCE = 3;

export function assignBadgesToResource(
  resource: SuggestedResource,
  userConcernsSize: number,
  isBestMatch: boolean,
  isTopMatch: boolean,
  isYourMatch: boolean,
  otherResourcesWithBadges: Map<string, Set<BadgeType>>
): BadgeType[] {
  const assignedBadges: Set<BadgeType> = new Set();
  const targetBadgeProfiles: Record<IntendedBadgeProfile, {min: number, max: number}> = {
    'single-prominent': {min: 1, max: 1},
    'double-diverse':   {min: 1, max: 2},
    'triple-focused':   {min: 2, max: 3},
    'community-focused':{min: 1, max: 2},
    'data-driven-focused': {min: 1, max: 2},
    'legal-advocacy-focused': {min: 1, max: 2},
    'niche-focused': {min: 1, max: 1},
  };

  const profile = resource.intendedBadgeProfile || 'double-diverse';
  let targetDescriptiveBadges = targetBadgeProfiles[profile].min + Math.floor(Math.random() * (targetBadgeProfiles[profile].max - targetBadgeProfiles[profile].min + 1));


  if (isBestMatch) assignedBadges.add('Best Match');
  else if (isTopMatch) assignedBadges.add('Top Match');
  else if (isYourMatch) assignedBadges.add('Your Match');

  targetDescriptiveBadges = Math.max(0, targetDescriptiveBadges - assignedBadges.size);


  const potentialDescriptiveBadges: BadgeType[] = [];
  if (resource.prominence === 'high') potentialDescriptiveBadges.push('High Impact');
  if (resource.focusType === 'broad') potentialDescriptiveBadges.push('Broad Focus');
  if (resource.focusType === 'niche') potentialDescriptiveBadges.push('Niche Focus');

  const orgTypeToBadgeMap: Partial<Record<NonNullable<typeof resource.orgTypeTags>[number], BadgeType>> = {
      'legal': 'Legal Advocacy', 'data-driven': 'Data-Driven', 'grassroots': 'Grassroots Power',
      'established': 'Established Voice', 'activism': 'High Impact',
      'think-tank': 'Data-Driven',
      'direct-service': 'Community Pick',
  };
  resource.orgTypeTags?.forEach(tag => {
      if (orgTypeToBadgeMap[tag] && !potentialDescriptiveBadges.includes(orgTypeToBadgeMap[tag]!)) {
          potentialDescriptiveBadges.push(orgTypeToBadgeMap[tag]!);
      }
  });

  let availableDescriptiveBadges = potentialDescriptiveBadges.filter(b => !assignedBadges.has(b));

  const allAssignedDescriptiveBadgesCount = new Map<BadgeType, number>();
  otherResourcesWithBadges.forEach(badgesOnOtherResource => {
      badgesOnOtherResource.forEach(b => {
          if (availableDescriptiveBadges.includes(b)) {
            allAssignedDescriptiveBadgesCount.set(b, (allAssignedDescriptiveBadgesCount.get(b) || 0) + 1);
          }
      });
  });

  availableDescriptiveBadges.sort((a, b) => {
    const countA = allAssignedDescriptiveBadgesCount.get(a) || 0;
    const countB = allAssignedDescriptiveBadgesCount.get(b) || 0;
    if (countA !== countB) return countA - countB; // Prioritize less used badges
    const priorityA = BADGE_DISPLAY_PRIORITY_MAP[a] || 99;
    const priorityB = BADGE_DISPLAY_PRIORITY_MAP[b] || 99;
    if (priorityA !== priorityB) return priorityA - priorityB; // Then by defined priority
    return Math.random() - 0.5; // Finally, randomize if still tied
  });

  for (let i = 0; i < targetDescriptiveBadges && i < availableDescriptiveBadges.length; i++) {
    if (assignedBadges.size >= MAX_BADGES_PER_RESOURCE) break;
    assignedBadges.add(availableDescriptiveBadges[i]);
  }

  if (assignedBadges.size === 0 && ((resource.matchCount || 0) === 0 || userConcernsSize === 0) ) {
      assignedBadges.add('General Interest');
  }

  if (assignedBadges.size === 0 && (resource.matchCount || 0) > 0 && availableDescriptiveBadges.length > 0) {
      assignedBadges.add(availableDescriptiveBadges[0]);
  }


  return Array.from(assignedBadges)
      .sort((a, b) => (BADGE_DISPLAY_PRIORITY_MAP[a] || 99) - (BADGE_DISPLAY_PRIORITY_MAP[b] || 99))
      .slice(0, MAX_BADGES_PER_RESOURCE);
}
