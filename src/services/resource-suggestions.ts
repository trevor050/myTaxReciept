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
    icon: 'HandHeart',
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
    icon: 'ShieldAlert',
    advocacyTags: ['nuclear_disarmament', 'national_security_reform', 'arms_control', 'nuclear_weapons_review'],
  },
  {
    name: 'Center for International Policy (CIP)',
    url: 'https://www.internationalpolicy.org/',
    description: 'Promotes a U.S. foreign policy based on international cooperation, demilitarization, and respect for human rights.',
    icon: 'Globe2',
    advocacyTags: ['foreign_policy_reform', 'diplomacy_fund', 'arms_control', 'human_rights', 'demilitarization', 'usaid_review'],
  },
  // Middle East / Palestine
  {
    name: 'US Campaign for Palestinian Rights (USCPR)',
    url: 'https://uscpr.org/',
    description: 'A national coalition working for Palestinian rights and an end to U.S. support for Israeli occupation.',
    icon: 'Landmark', // Placeholder
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
    advocacyTags: ['budget_reform', 'military_spending_cut', 'social_spending_fund', 'tax_fairness', 'fiscal_responsibility', 'pentagon_review', 'interest_debt_review'],
  },
  {
    name: 'Taxpayers for Common Sense',
    url: 'https://www.taxpayer.net/',
    description: 'A non-partisan budget watchdog organization working to ensure taxpayer dollars are spent responsibly.',
    icon: 'SearchCheck',
    advocacyTags: ['fiscal_responsibility', 'budget_reform', 'wasteful_spending_cut', 'government_accountability', 'pentagon_contractors_cut', 'f35_cut', 'nasa_spacex_cut_review', 'farm_subsidies_cut', 'interest_debt_review'],
  },
  {
    name: 'Project On Government Oversight (POGO)',
    url: 'https://www.pogo.org/',
    description: 'A nonpartisan independent watchdog that investigates and exposes waste, corruption, and abuse of power.',
    icon: 'Eye',
    advocacyTags: ['government_accountability', 'pentagon_contractors_review', 'whistleblower_protection', 'wasteful_spending_cut', 'pentagon_review', 'f35_review'],
  },
  {
    name: 'Committee for a Responsible Federal Budget (CRFB)',
    url: 'https://www.crfb.org/',
    description: 'A nonpartisan, non-profit organization committed to educating the public and policymakers about fiscal policy issues.',
    icon: 'Banknote',
    advocacyTags: ['fiscal_responsibility', 'debt_reduction', 'budget_reform', 'entitlement_reform_review', 'interest_debt_review', 'tax_reform_review'],
  },
  {
    name: 'Peter G. Peterson Foundation',
    url: 'https://www.pgpf.org/',
    description: 'Dedicated to increasing awareness of the nature and urgency of key fiscal challenges threatening America\'s future.',
    icon: 'TrendingUp',
    advocacyTags: ['fiscal_responsibility', 'debt_reduction', 'economic_stability', 'budget_reform', 'interest_debt_review'],
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
    advocacyTags: ['mental_health_fund', 'substance_mental_health_fund', 'health_equity', 'cdc_fund', 'nih_fund'],
  },
  {
    name: 'Families USA',
    url: 'https://familiesusa.org/',
    description: 'A national nonpartisan consumer health advocacy organization.',
    icon: 'Users',
    advocacyTags: ['healthcare_access', 'medicaid_fund', 'medicare_fund', 'health_equity', 'affordable_care_act_fund', 'child_health_fund'],
  },
  {
    name: 'Center on Budget and Policy Priorities (CBPP) - Health',
    url: 'https://www.cbpp.org/research/health',
    description: 'Researches and advocates for policies that reduce poverty and inequality, including in healthcare.',
    icon: 'Activity',
    advocacyTags: ['medicaid_fund', 'affordable_care_act_fund', 'health_equity', 'social_spending_fund', 'snap_fund', 'child_tax_credit_fund'],
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
    advocacyTags: ['epa_fund', 'environmental_protection', 'toxic_chemicals_cut', 'sustainable_agriculture_fund', 'food_safety_fund', 'water_quality_fund'],
  },
  {
    name: 'Climate Action Network International',
    url: 'https://climatenetwork.org/',
    description: 'A global network of NGOs working to promote government and individual action to limit human-induced climate change.',
    icon: 'CloudSun',
    advocacyTags: ['climate_action_fund', 'usaid_climate_fund', 'renewable_energy_fund', 'environmental_justice', 'fossil_fuel_subsidies_cut'],
  },
  {
    name: 'Sierra Club',
    url: 'https://www.sierraclub.org/',
    description: 'Grassroots environmental organization in the United States. Founded by legendary conservationist John Muir in 1892.',
    icon: 'Mountain',
    advocacyTags: ['environmental_protection', 'climate_action_fund', 'renewable_energy_fund', 'nps_fund', 'forest_service_fund', 'wilderness_protection', 'epa_fund'],
  },
  {
    name: 'Natural Resources Defense Council (NRDC)',
    url: 'https://www.nrdc.org/',
    description: 'Works to safeguard the earth—its people, its plants and animals, and the natural systems on which all life depends.',
    icon: 'Trees',
    advocacyTags: ['environmental_protection', 'epa_fund', 'climate_action_fund', 'ocean_conservation', 'renewable_energy_fund', 'noaa_fund'],
  },
  {
    name: 'League of Conservation Voters (LCV)',
    url: 'https://www.lcv.org/',
    description: 'Advocates for sound environmental laws and policies, holds elected officials accountable for their votes and actions.',
    icon: 'Vote',
    advocacyTags: ['environmental_policy', 'epa_fund', 'climate_action_fund', 'renewable_energy_fund', 'political_action'],
  },
  // Science & Technology
  {
    name: 'The Planetary Society',
    url: 'https://www.planetary.org/',
    description: 'Empowers the world\'s citizens to advance space science and exploration.',
    icon: 'Rocket',
    advocacyTags: ['nasa_fund', 'science_fund', 'space_exploration', 'nsf_fund'],
  },
  {
    name: 'Union of Concerned Scientists',
    url: 'https://www.ucsusa.org/',
    description: 'Puts rigorous, independent science to work to solve our planet\'s most pressing problems.',
    icon: 'FlaskConical',
    advocacyTags: ['science_fund', 'environmental_protection', 'nuclear_weapons_review', 'scientific_integrity', 'climate_action_fund', 'sustainable_agriculture_fund'],
  },
  {
    name: 'Federation of American Scientists (FAS)',
    url: 'https://fas.org/',
    description: 'Provides science-based analysis of and solutions to protect against catastrophic threats to national and international security.',
    icon: 'Microscope',
    advocacyTags: ['science_policy', 'national_security_reform', 'arms_control', 'nuclear_weapons_review', 'emerging_tech_review', 'nsf_fund'],
  },
  // General Government Oversight / Social Justice
  {
    name: 'American Civil Liberties Union (ACLU)',
    url: 'https://www.aclu.org/',
    description: 'Works to defend and preserve the individual rights and liberties guaranteed by the Constitution and laws of the United States.',
    icon: 'Gavel',
    advocacyTags: ['civil_rights', 'civil_liberties', 'immigration_reform_review', 'criminal_justice_reform', 'government_accountability', 'deportations_border_review', 'federal_prisons_review', 'privacy_rights'],
  },
  {
    name: 'Common Cause',
    url: 'https://www.commoncause.org/',
    description: 'A nonpartisan grassroots organization dedicated to upholding the core values of American democracy.',
    icon: 'Vote',
    advocacyTags: ['democracy_reform', 'voting_rights', 'campaign_finance_reform', 'government_accountability', 'ethics_reform'],
  },
  {
    name: 'Brennan Center for Justice',
    url: 'https://www.brennancenter.org/',
    description: 'A nonpartisan law and policy institute that works to reform, revitalize, and when necessary, defend our country’s systems of democracy and justice.',
    icon: 'Library',
    advocacyTags: ['democracy_reform', 'voting_rights', 'criminal_justice_reform', 'campaign_finance_reform', 'justice_system_review'],
  },
  {
    name: 'Southern Poverty Law Center (SPLC)',
    url: 'https://www.splcenter.org/',
    description: 'Monitors hate groups and other extremists throughout the United States and exposes their activities to the public, the media and law enforcement.',
    icon: 'ShieldAlert',
    advocacyTags: ['civil_rights', 'anti_hate', 'social_justice', 'anti_discrimination'],
  },
  // Education
  {
    name: 'National Education Association (NEA)',
    url: 'https://www.nea.org/',
    description: 'The nation\'s largest professional employee organization, committed to advancing the cause of public education.',
    icon: 'School',
    advocacyTags: ['education_fund', 'k12_schools_fund', 'teacher_support', 'public_education', 'college_aid_fund', 'head_start_fund'],
  },
  {
    name: 'The Education Trust',
    url: 'https://edtrust.org/',
    description: 'Works to close opportunity gaps that disproportionately affect students of color and students from low-income backgrounds.',
    icon: 'GraduationCap',
    advocacyTags: ['education_equity', 'k12_schools_fund', 'college_aid_fund', 'achievement_gap', 'dept_education_fund'],
  },
  {
    name: 'Campaign for Free College Tuition',
    url: 'https://www.freecollegenow.org/',
    description: 'Advocates for making public colleges and universities tuition-free for students.',
    icon: 'Landmark',
    advocacyTags: ['college_aid_fund', 'education_reform', 'student_debt_relief'],
  },
  {
    name: 'National Head Start Association',
    url: 'https://nhsa.org/',
    description: 'Supports Head Start programs through advocacy, training, and professional development.',
    icon: 'Users',
    advocacyTags: ['head_start_fund', 'early_childhood_education', 'child_poverty_reduction'],
  },
  {
    name: 'Protect Public Broadcasting (CPB)',
    url: 'https://protectmypublicmedia.org/',
    description: 'Advocates for strong public funding for the Corporation for Public Broadcasting.',
    icon: 'Radio',
    advocacyTags: ['cpb_fund', 'public_media', 'arts_culture_fund'],
  },
  {
    name: 'American Library Association (ALA)',
    url: 'https://www.ala.org/',
    description: 'Promotes libraries and library education internationally. They advocate for funding such as IMLS.',
    icon: 'Library',
    advocacyTags: ['imls_fund', 'libraries_fund', 'literacy_fund', 'information_access'],
  },
  // Specific Program Focus / Defense Watchdogs
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
    advocacyTags: ['civil_liberties', 'government_accountability', 'tech_policy_reform', 'nasa_spacex_cut_review', 'privacy_rights']
  },
  {
    name: 'Center for Defense Information (CDI) at POGO',
    url: 'https://www.pogo.org/program/center-for-defense-information/',
    description: 'Works to secure far-reaching reforms in U.S. national security policy, dedicated to strong, sensible, and sustainable national security.',
    icon: 'Search',
    advocacyTags: ['pentagon_review', 'military_spending_cut', 'f35_review', 'national_security_reform', 'pentagon_contractors_review']
  },
  // Housing & Homelessness
  {
    name: 'National Low Income Housing Coalition (NLIHC)',
    url: 'https://nlihc.org/',
    description: 'Dedicated solely to achieving socially just public policy that ensures people with the lowest incomes in the United States have affordable and decent homes.',
    icon: 'Home',
    advocacyTags: ['housing_affordability', 'hud_fund', 'public_housing_fund', 'homelessness_prevention', 'rental_assistance_fund'],
  },
  {
    name: 'National Alliance to End Homelessness',
    url: 'https://endhomelessness.org/',
    description: 'A nonpartisan organization committed to preventing and ending homelessness in the United States.',
    icon: 'Bed',
    advocacyTags: ['homelessness_prevention', 'usich_fund', 'hud_fund', 'housing_first', 'rental_assistance_fund'],
  },
  // Food & Agriculture
  {
    name: 'Food Research & Action Center (FRAC)',
    url: 'https://frac.org/',
    description: 'The leading national nonprofit organization working to eradicate poverty-related hunger and undernutrition in the United States.',
    icon: 'Utensils',
    advocacyTags: ['snap_fund', 'wic_fund', 'school_lunch_fund', 'anti_hunger', 'food_security'],
  },
  {
    name: 'National Sustainable Agriculture Coalition (NSAC)',
    url: 'https://sustainableagriculture.net/',
    description: 'An alliance of grassroots organizations that advocates for federal policy reform to advance the sustainability of agriculture, food systems, natural resources, and rural communities.',
    icon: 'Tractor',
    advocacyTags: ['sustainable_agriculture_fund', 'fsa_review', 'farm_subsidies_reform', 'local_food_systems'],
  },
  // Veterans
  {
    name: 'Veterans of Foreign Wars (VFW)',
    url: 'https://www.vfw.org/',
    description: 'A nonprofit veterans service organization comprised of eligible veterans and military service members from the active, guard and reserve forces.',
    icon: 'Medal',
    advocacyTags: ['veterans_affairs_fund', 'pact_act_fund', 'veteran_benefits', 'national_security_fund'],
  },
  {
    name: 'Iraq and Afghanistan Veterans of America (IAVA)',
    url: 'https://iava.org/',
    description: 'The leading post-9/11 veteran empowerment organization (VEO) with the most diverse and rapidly growing membership in America.',
    icon: 'Users',
    advocacyTags: ['veterans_affairs_fund', 'pact_act_fund', 'mental_health_fund', 'post911_veterans'],
  },
  // Labor & Worker Rights
  {
    name: 'AFL-CIO',
    url: 'https://aflcio.org/',
    description: 'The largest federation of unions in the United States, representing more than 12.5 million working men and women.',
    icon: 'Hammer',
    advocacyTags: ['labor_rights', 'nlrb_fund', 'worker_protections', 'fair_wages', 'job_safety'],
  },
  {
    name: 'National Employment Law Project (NELP)',
    url: 'https://www.nelp.org/',
    description: 'A non-profit organization that advocates for policies to create good jobs, strengthen worker protections, and help unemployed workers.',
    icon: 'Briefcase',
    advocacyTags: ['labor_rights', 'unemployment_insurance_fund', 'fair_wages', 'worker_protections', 'tanf_review'],
  },
  // Transportation
  {
    name: 'Transportation for America',
    url: 'https://t4america.org/',
    description: 'An advocacy organization made up of local, regional and state leaders who envision a transportation system that safely, affordably and conveniently connects people of all means and ability to jobs, services, and opportunity.',
    icon: 'Bus',
    advocacyTags: ['public_transit_fund', 'transportation_reform', 'highway_review', 'bike_ped_fund', 'amtrak_fund'],
  },
  {
    name: 'American Public Transportation Association (APTA)',
    url: 'https://www.apta.com/',
    description: 'An international organization that has been representing the public transportation industry for over 130 years.',
    icon: 'TramFront',
    advocacyTags: ['public_transit_fund', 'faa_review', 'transportation_safety'],
  },
  // Consumer Protection
  {
    name: 'Consumer Federation of America',
    url: 'https://consumerfed.org/',
    description: 'An association of non-profit consumer organizations established in 1968 to advance the consumer interest through research, advocacy, and education.',
    icon: 'ShieldCheck',
    advocacyTags: ['consumer_protection', 'cfpb_fund', 'product_safety', 'financial_regulation_review'],
  },
  {
    name: 'U.S. PIRG (Public Interest Research Group)',
    url: 'https://uspirg.org/',
    description: 'Stands up to powerful special interests on behalf of the public, working to win concrete results for our health, safety, and well-being.',
    icon: 'Lightbulb',
    advocacyTags: ['consumer_protection', 'environmental_protection', 'health_safety', 'cfpb_fund', 'transportation_safety'],
  },
  // Arts & Culture
  {
    name: 'Americans for the Arts',
    url: 'https://www.americansforthearts.org/',
    description: 'The nation\'s leading nonprofit organization for advancing the arts and arts education.',
    icon: 'Palette',
    advocacyTags: ['arts_culture_fund', 'nea_fund', 'neh_fund', 'cpb_fund', 'imls_fund'], // Assuming NEA/NEH exist or are part of dept_education
  },
];


function getItemAdvocacyTags(itemId: string, fundingAction: FundingAction): string[] {
  const tags: string[] = [];
  const idLower = itemId.toLowerCase();

  // General category mapping first
  if (idLower.includes('pentagon') || idLower.includes('military') || idLower.includes('defense') || idLower.includes('f35') || idLower.includes('nuclear_weapons') || idLower.includes('israel_wars') || idLower.includes('foreign_military_aid')) {
    tags.push('defense_spending');
    if (fundingAction === 'slash') tags.push('military_spending_cut', 'demilitarization');
    if (fundingAction === 'fund') tags.push('military_spending_fund');
    if (fundingAction === 'review') tags.push('pentagon_review', 'national_security_reform');
  }
  if (idLower.includes('health') || idLower.includes('medicare') || idLower.includes('medicaid') || idLower.includes('cdc') || idLower.includes('nih') || idLower.includes('substance_mental_health')) {
    tags.push('health_policy');
    if (fundingAction === 'fund') tags.push('healthcare_fund', 'social_spending_fund');
    if (fundingAction === 'slash') tags.push('health_spending_cut'); // More general "cut"
    if (fundingAction === 'review') tags.push('healthcare_review');
  }
   if (idLower.includes('education') || idLower.includes('k12_schools') || idLower.includes('college_aid') || idLower.includes('head_start') || idLower.includes('cpb') || idLower.includes('imls') || idLower.includes('dept_education')) {
    tags.push('education_policy');
    if (fundingAction === 'fund') tags.push('education_fund', 'social_spending_fund');
    if (fundingAction === 'slash') tags.push('education_spending_cut');
  }
  if (idLower.includes('environment') || idLower.includes('epa') || idLower.includes('climate') || idLower.includes('renewable_energy') || idLower.includes('forest_service') || idLower.includes('nps') || idLower.includes('noaa')) {
    tags.push('environmental_policy');
    if (fundingAction === 'fund') tags.push('environmental_protection', 'climate_action_fund');
    if (fundingAction === 'slash') tags.push('environmental_spending_cut');
  }
  if (idLower.includes('housing') || idLower.includes('hud') || idLower.includes('public_housing') || idLower.includes('fema') || idLower.includes('usich')) {
      tags.push('housing_community_dev');
      if (fundingAction === 'fund') tags.push('housing_affordability', 'hud_fund');
      if (fundingAction === 'slash') tags.push('housing_spending_cut');
  }
  if (idLower.includes('food') || idLower.includes('agriculture') || idLower.includes('snap') || idLower.includes('wic') || idLower.includes('school_lunch') || idLower.includes('fsa')) {
      tags.push('food_agriculture_policy');
      if (fundingAction === 'fund') tags.push('food_security', 'snap_fund', 'wic_fund');
      if (fundingAction === 'slash') tags.push('farm_subsidies_reform');
  }
   if (idLower.includes('transportation') || idLower.includes('highways') || idLower.includes('public_transit') || idLower.includes('tsa') || idLower.includes('faa') || idLower.includes('amtrak')) {
      tags.push('transportation_policy');
      if (fundingAction === 'fund') tags.push('public_transit_fund', 'infrastructure_fund');
      if (fundingAction === 'slash') tags.push('transportation_spending_cut');
  }
  if (idLower.includes('veterans') || idLower.includes('va') || idLower.includes('pact_act')) {
      tags.push('veterans_affairs');
      if (fundingAction === 'fund') tags.push('veterans_affairs_fund', 'pact_act_fund');
  }
  if (idLower.includes('unemployment') || idLower.includes('labor') || idLower.includes('tanf') || idLower.includes('nlrb')) {
      tags.push('labor_policy');
      if (fundingAction === 'fund') tags.push('labor_rights', 'worker_protections');
      if (fundingAction === 'slash') tags.push('labor_spending_cut');
  }
   if (idLower.includes('science') || idLower.includes('nasa') || idLower.includes('nsf')) {
      tags.push('science_tech_policy');
      if (fundingAction === 'fund') tags.push('science_fund', 'nasa_fund', 'nsf_fund');
      if (fundingAction === 'slash') tags.push('science_spending_cut');
  }
  if (idLower.includes('international_affairs') || idLower.includes('diplomacy') || idLower.includes('usaid')) {
      tags.push('foreign_policy');
      if (fundingAction === 'fund') tags.push('diplomacy_fund', 'foreign_aid_fund', 'usaid_fund');
      if (fundingAction === 'slash') tags.push('foreign_aid_cut', 'usaid_review');
  }
   if (idLower.includes('law_enforcement') || idLower.includes('deportations_border') || idLower.includes('federal_prisons')) {
      tags.push('justice_immigration_policy');
      if (fundingAction === 'fund') tags.push('border_security_fund', 'prison_reform_fund');
      if (fundingAction === 'slash') tags.push('immigration_enforcement_cut', 'prison_spending_cut');
      if (fundingAction === 'review') tags.push('criminal_justice_reform', 'immigration_reform_review');
  }
   if (idLower.includes('government_ops') || idLower.includes('irs') || idLower.includes('fdic') || idLower.includes('federal_courts') || idLower.includes('usps') || idLower.includes('cfpb') || idLower.includes('mbda')) {
      tags.push('government_operations');
      if (fundingAction === 'fund') tags.push('irs_fund', 'cfpb_fund');
      if (fundingAction === 'slash') tags.push('government_waste_cut');
      if (fundingAction === 'review') tags.push('government_accountability');
  }



  // Specific item mappings for more precision, overriding or adding to general category tags
  const specificItemToActionTagMapping: Record<string, Partial<Record<FundingAction, string[]>>> = {
    'israel_wars': { slash: ['israel_aid_cut', 'middle_east_peace'], review: ['israel_aid_review'], fund: ['israel_aid_fund'] },
    'pentagon_contractors': { slash: ['pentagon_contractors_cut'], review: ['pentagon_contractors_review'] },
    'nasa_spacex': { slash: ['nasa_spacex_cut_review'], review: ['nasa_spacex_cut_review'], fund: ['nasa_spacex_fund'] }, // Added fund
    'medicare': { fund: ['medicare_fund'], slash: ['medicare_reform_cut'], review:['medicare_review']},
    'medicaid': { fund: ['medicaid_fund'], review: ['medicaid_review'], slash: ['medicaid_cut']},
    'cdc': { fund: ['cdc_fund'], review: ['cdc_review'], slash: ['cdc_cut'] },
    'nih': { fund: ['nih_fund'], review: ['nih_review'], slash: ['nih_cut'] },
    'substance_mental_health': { fund: ['mental_health_fund', 'substance_mental_health_fund'], review: ['mental_health_review'], slash: ['substance_mental_health_cut'] },
    'foreign_military_aid': { slash: ['foreign_aid_cut', 'demilitarization'], review: ['foreign_aid_reform'], fund:['foreign_military_aid_fund']},
    'nuclear_weapons': {slash: ['nuclear_disarmament', 'nuclear_weapons_cut'], review: ['nuclear_weapons_review', 'arms_control'], fund:['nuclear_weapons_fund']},
    'f35': {slash: ['f35_cut'], review: ['f35_review'], fund:['f35_fund']},
    'pentagon_dei': {slash: ['pentagon_dei_cut'], review: ['pentagon_dei_review'], fund: ['pentagon_dei_fund']},
    'va': {fund: ['veterans_affairs_fund'], review: ['va_review'], slash: ['va_cut']},
    'pact_act': {fund: ['pact_act_fund'], review: ['pact_act_review']}, //PACT act generally positive
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
    'fdic': {fund:['fdic_fund'], review:['fdic_review'], slash:['fdic_cut']}, // FDIC less about funding levels, more about scope/policy
    'irs': {fund:['irs_fund'], review:['irs_review'], slash:['irs_cut']},
    'federal_courts': {fund:['federal_courts_fund'], review:['federal_courts_review'], slash:['federal_courts_cut']},
    'public_defenders': {fund:['public_defenders_fund'], review:['public_defenders_review']},
    'usps': {fund:['usps_fund'], review:['usps_review'], slash:['usps_cut']},
    'cfpb': {fund:['cfpb_fund'], review:['cfpb_review'], slash:['cfpb_cut']},
    'mbda': {fund:['mbda_fund'], review:['mbda_review'], slash:['mbda_cut']},
    'usich': {fund:['usich_fund'], review:['usich_review']},
    'fema': {fund:['fema_fund'], review:['fema_review'], slash:['fema_cut']},
    'fema_drf': {fund:['fema_drf_fund'], review:['fema_drf_review']},
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
  };

  const itemSpecificTags = specificItemToActionTagMapping[itemId]?.[fundingAction];
  if (itemSpecificTags) {
    itemSpecificTags.forEach(tag => tags.push(tag));
  } else if (specificItemToActionTagMapping[itemId] && !itemSpecificTags) { // If item matches but action doesn't, add a general review tag for that item
    tags.push(`${itemId}_review`); // e.g. 'f35_review' if action was neutral but f35 was selected
  }


  // Fallback if no other tags were added (should be rare with comprehensive mapping)
  if (tags.length === 0) {
    tags.push(`${itemId}_${fundingAction}`); // e.g. some_new_program_fund
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
    userAdvocacyTags.add('interest_debt_review'); // Add this for debt concern
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

    // Prioritize budget/debt relevance if checked
    const budgetRelatedTags = ['fiscal responsibility', 'debt reduction', 'budget reform', 'interest debt review'];
    const resourceHasBudgetFocus = resource.matchedTags.some(rt => budgetRelatedTags.includes(rt));

    if (balanceBudgetChecked && resourceHasBudgetFocus) {
        if (userTone > 1) { // Stern or Angry
            relevanceReason = `Given your strong stance on balancing the budget, ${resource.name} actively campaigns for fiscal responsibility and scrutinizes government spending.`;
        } else { // Polite or Concerned
            relevanceReason = `Since you're interested in balancing the budget, ${resource.name} focuses on fiscal policy, responsible spending, and provides research on the national debt.`;
        }
    } else if (resource.matchedTags.length > 0) { // If not primarily budget, use other matches
        const primaryConcern = resource.matchedTags[0];
        if (userTone > 1 && (primaryConcern.includes('cut') || primaryConcern.includes('slash') || primaryConcern.includes('reform') || primaryConcern.includes('review'))) {
            relevanceReason = `Given your strong stance, ${resource.name} actively campaigns on issues like ${primaryConcern}.`;
        } else if (userTone < 2 && (primaryConcern.includes('fund') || primaryConcern.includes('support'))) {
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
