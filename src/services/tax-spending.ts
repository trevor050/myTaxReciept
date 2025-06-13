/**
 * @fileOverview Service for fetching mock tax spending data and generating email content.
 */

import { generateRepresentativeEmailContent } from './email/generator'; // Import the generation logic
import type { FundingLevel, SelectedItem as EmailSelectedItem } from './email/types'; // Import types from email modules

// ---------- interfaces -----------------------------------------------------
/**
 * Represents a geographical location.
 */
export interface Location {
  /**
   * The latitude of the location.
   */
  lat: number;
  /**
   * The longitude of the location.
   */
  lng: number;
}

/**
 * Represents a sub-item within a main tax spending category.
 */
export interface TaxSpendingSubItem {
  /**
   * Unique identifier for the sub-item (e.g., 'medicaid').
   */
  id: string;
  /**
   * Description of the sub-category (e.g., "Medicaid").
   */
  description: string;
  /**
   * The amount spent on this sub-category for every dollar of total tax paid,
   * based on the reference breakdown ($52,000 total).
   */
  amountPerDollar: number;
  /**
   * A brief explanation of the item for tooltips. Optional.
   */
  tooltipText?: string;
  /**
   * A URL to a relevant Wikipedia page for more information. Optional.
   */
  wikiLink?: string;
  /**
   * Category name, added during data processing. Now required.
   */
  category: string;
}


/**
 * Represents tax spending information for a specific main category.
 */
export interface TaxSpending {
  /**
   * Unique identifier for the category (e.g., 'health').
   */
  id: string;
  /**
   * The main category of spending (e.g., Health, Defense).
   */
  category: string;
  /**
   * The percentage of total tax money spent on this main category.
   */
  percentage: number;
   /**
    * Optional array of sub-items detailing the spending within this category.
    */
   subItems?: TaxSpendingSubItem[];
   /**
    * Optional tooltip text for the main category (used for Interest on Debt).
    */
   tooltipText?: string;
   /**
    * A URL to a relevant Wikipedia page for more information. Optional.
    */
   wikiLink?: string;
}

/**
 * Represents an item selected by the user for the email, including their desired funding change.
 * Extends the type from email/types to ensure consistency.
 */
export interface SelectedItem extends EmailSelectedItem {
  // Inherits id, description, fundingLevel from EmailSelectedItem
  category: string; // Explicitly include category here for dashboard usage
}


// ---------- data fetching (mock) -------------------------------------------

// Reference total tax amount from the provided example
const REFERENCE_TOTAL_TAX = 52000;

/**
 * Asynchronously retrieves a detailed tax spending breakdown.
 * This currently returns mock data based on the user-provided example.
 *
 * @param _location The location (currently unused in mock).
 * @param _taxAmount The total tax amount (used for scaling calculations, though percentages are fixed in mock).
 * @returns A promise that resolves to an array of TaxSpending objects.
 */
export async function getTaxSpending(_location: Location, _taxAmount: number): Promise<TaxSpending[]> {
  // FY-2024 aligned mock data — percentages are rounded whole-number shares of total
  const detailedBreakdown: TaxSpending[] = [
    /** Social Security – 21 % */
    {
      id: 'social_security',
      category: 'Social Security',
      percentage: 21,
      subItems: [
        { id: 'ss_retirement', description: 'Retirement benefits', tooltipText: 'The bedrock of retirement for millions, Social Security represents a promise between generations. These are the funds paid to retired workers, their spouses, and survivors, a lifeline earned over a lifetime of work.', amountPerDollar: 8920 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Social_Security_(United_States)', category: 'Social Security' },
        { id: 'ss_disability', description: 'Disability benefits', tooltipText: 'Provides essential income for individuals who can no longer work due to a significant disability. This is a crucial safety net that protects families from financial ruin in the face of unexpected illness or injury.', amountPerDollar: 2000 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Social_Security_Disability_Insurance', category: 'Social Security' },
      ],
    },

    /** Health – 24 % */
    {
      id: 'health',
      category: 'Health',
      percentage: 24,
      subItems: [
        { id: 'medicare', description: 'Medicare', tooltipText: 'Guarantees health coverage for Americans aged 65 and older, and for some younger people with disabilities. It is the single largest public health insurance program in the United States.', amountPerDollar: 5400 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Medicare_(United_States)', category: 'Health' },
        { id: 'medicaid', description: 'Medicaid', tooltipText: 'A joint federal and state program that provides health coverage to millions of Americans, including eligible low-income adults, children, pregnant women, elderly adults and people with disabilities.', amountPerDollar: 4600 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Medicaid', category: 'Health' },
        { id: 'aca_subsidies', description: 'ACA marketplace subsidies', tooltipText: 'These subsidies, in the form of tax credits, help millions of individuals and families afford health insurance purchased through the Affordable Care Act marketplace, making coverage accessible.', amountPerDollar: 1250 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Health_insurance_marketplace', category: 'Health' },
        { id: 'chip', description: 'CHIP (children)', tooltipText: 'The Children\'s Health Insurance Program provides low-cost health coverage to children in families who earn too much to qualify for Medicaid but cannot afford private insurance. This ensures that children\'s health is not determined by their parents\' income.', amountPerDollar: 250 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Children%27s_Health_Insurance_Program', category: 'Health' },
        { id: 'nih', description: 'NIH – Medical research', tooltipText: 'The National Institutes of Health is the primary agency responsible for biomedical and public health research. Its funding drives scientific discovery and has led to countless medical breakthroughs.', amountPerDollar: 400 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/National_Institutes_of_Health', category: 'Health' },
        { id: 'cdc', description: 'CDC – Disease control', tooltipText: 'The Centers for Disease Control and Prevention is the nation\'s leading public health agency, tasked with protecting Americans from health threats, both foreign and domestic, and responding to health emergencies.', amountPerDollar: 100 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Centers_for_Disease_Control_and_Prevention', category: 'Health' },
      ],
    },

    /** Defense – 13 % */
    {
      id: 'defense',
      category: 'Defense (War & Weapons)',
      percentage: 13,
      subItems: [
        { id: 'military_personnel', description: 'Military personnel', tooltipText: 'This covers the salaries, benefits, and housing for all active-duty military personnel. It reflects the direct human cost of maintaining a large, professional fighting force.', amountPerDollar: 1800 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Military_budget_of_the_United_States#By_title', category: 'Defense (War & Weapons)' },
        { id: 'operations_maintenance', description: 'Operations & maintenance', tooltipText: 'These funds are used for the day-to-day running of the military, including training, equipment maintenance, and operating bases around the world. Critics argue this budget enables a vast and costly global military presence.', amountPerDollar: 2400 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/United_States_Department_of_Defense', category: 'Defense (War & Weapons)' },
        { id: 'weapons_procurement', description: 'Weapons & procurement', tooltipText: 'Funding for the acquisition of new weapons systems, vehicles, and technology from private defense contractors. This expenditure is at the heart of the military-industrial complex.', amountPerDollar: 1800 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Military-industrial_complex', category: 'Defense (War & Weapons)' },
        { id: 'nuclear_weapons', description: 'Nuclear forces', tooltipText: 'This funds the maintenance, security, and modernization of the U.S. nuclear arsenal. The immense cost and existential risk of these weapons make their funding a subject of intense debate.', amountPerDollar: 300 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Nuclear_weapons_of_the_United_States', category: 'Defense (War & Weapons)' },
        { id: 'foreign_military_aid', description: 'Foreign military aid', tooltipText: 'This represents security assistance, training, and weaponry provided to foreign governments and their militaries. Activists often question whether this aid promotes stability or fuels conflicts abroad.', amountPerDollar: 460 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Foreign_military_financing', category: 'Defense (War & Weapons)' },
      ],
    },

    /** Interest on the debt – 13 % */
    { id: 'interest_debt', category: 'Interest on Debt', percentage: 13, wikiLink: 'https://en.wikipedia.org/wiki/National_debt_of_the_United_States', tooltipText: 'This is the cost of servicing past national debt, generated by decades of spending more than was collected in revenue. Every dollar spent here is a dollar that cannot be invested in current priorities like health, education, or infrastructure.' },

    /** Veterans & Federal Retirement – 8 % */
    {
      id: 'veterans_retirement',
      category: 'Veterans & Federal Retirement',
      percentage: 8,
      subItems: [
        { id: 'va_programs', description: 'Veterans Affairs (VA)', tooltipText: 'This provides healthcare, disability benefits, and educational opportunities (like the GI Bill) to military veterans. It represents a commitment to care for those who have served in the armed forces.', amountPerDollar: 2500 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/United_States_Department_of_Veterans_Affairs', category: 'Veterans & Federal Retirement' },
        { id: 'military_pensions', description: 'Military retirement pay', tooltipText: 'These are lifetime pensions paid to career service members who have completed 20 or more years in the military. This system is a key incentive for long-term military service.', amountPerDollar: 900 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Military_pay_of_the_United_States#Retirement', category: 'Veterans & Federal Retirement' },
        { id: 'civilian_pensions', description: 'Federal civilian pensions', tooltipText: 'This covers the retirement costs for the millions of non-military federal employees, from postal workers to park rangers. It is a fundamental component of public service compensation.', amountPerDollar: 680 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Federal_Employees_Retirement_System', category: 'Veterans & Federal Retirement' },
        { id: 'pact_act', description: 'PACT Act – Toxic-exposure care', tooltipText: 'A recent and significant fund to provide healthcare for veterans exposed to burn pits, Agent Orange, and other toxins during their service. Its creation was the result of years of advocacy by veterans and their families.', amountPerDollar: 80 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/PACT_Act', category: 'Veterans & Federal Retirement' },
      ],
    },

    /** Economic security programs – 7 % */
    {
      id: 'economic_security',
      category: 'Economic Security & Job Benefits',
      percentage: 7,
      subItems: [
        { id: 'snap', description: 'SNAP (food assistance)', tooltipText: 'The Supplemental Nutrition Assistance Program helps low-income individuals and families afford groceries. It is one of the most effective anti-poverty programs in the country.', amountPerDollar: 1300 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Supplemental_Nutrition_Assistance_Program', category: 'Economic Security & Job Benefits' },
        { id: 'unemployment_insurance', description: 'Unemployment insurance', tooltipText: 'This joint state-federal program provides temporary income support to workers who have lost their jobs through no fault of their own. It serves as a critical buffer during economic downturns.', amountPerDollar: 600 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Unemployment_benefits_in_the_United_States', category: 'Economic Security & Job Benefits' },
        { id: 'ssi', description: 'Supplemental Security Income', tooltipText: 'SSI provides a minimum level of income for aged, blind, and disabled individuals who have very limited financial resources. It is distinct from Social Security Disability Insurance (SSDI) but serves a similar anti-poverty function.', amountPerDollar: 360 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Supplemental_Security_Income', category: 'Economic Security & Job Benefits' },
        { id: 'tanf', description: 'TANF cash assistance', tooltipText: 'Provides temporary financial assistance and work support to low-income families with children. Critics argue its funding levels and strict rules limit its effectiveness as a safety net.', amountPerDollar: 240 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Temporary_Assistance_for_Needy_Families', category: 'Economic Security & Job Benefits' },
        { id: 'child_tax_credit', description: 'Child tax credit', tooltipText: 'This tax credit is designed to help offset the significant costs of raising children. Expansions of this credit have been shown to dramatically reduce child poverty.', amountPerDollar: 270 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Child_tax_credit_(United_States)', category: 'Economic Security & Job Benefits' },
        { id: 'liheap', description: 'Energy assistance (LIHEAP)', tooltipText: 'The Low Income Home Energy Assistance Program helps eligible households pay their heating and cooling bills, preventing utility shut-offs and ensuring basic living standards.', amountPerDollar: 50 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Low_Income_Home_Energy_Assistance_Program', category: 'Economic Security & Job Benefits' },
      ],
    },

    /** Education – 5 % */
    {
      id: 'education',
      category: 'Education',
      percentage: 5,
      subItems: [
        { id: 'k12_schools', description: 'K-12 schools (Title I, IDEA)', tooltipText: 'This represents federal support for public schools, primarily through Title I grants for disadvantaged students and IDEA grants for students with disabilities. It aims to supplement, not replace, state and local funding.', amountPerDollar: 900 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Elementary_and_Secondary_Education_Act', category: 'Education' },
        { id: 'college_aid', description: 'College aid (Pell, loans)', tooltipText: 'This includes Pell Grants for low-income students and the administrative costs of the federal student loan program. The level of funding directly impacts college affordability and student debt levels.', amountPerDollar: 1300 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Student_financial_aid_in_the_United_States', category: 'Education' },
        { id: 'ed_ops', description: 'Education Dept. operations', tooltipText: 'These are the administrative costs for the Department of Education, which oversees federal education policy and distributes funding to states and institutions.', amountPerDollar: 400 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/United_States_Department_of_Education', category: 'Education' },
      ],
    },

    /** Housing & Community – 3 % */
    {
      id: 'housing_community',
      category: 'Housing & Community',
      percentage: 3,
      subItems: [
        { id: 'hud', description: 'Housing & Urban Development', tooltipText: 'The Department of Housing and Urban Development (HUD) funds a wide range of programs aimed at ensuring access to safe and affordable housing and promoting community development.', amountPerDollar: 526 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/United_States_Department_of_Housing_and_Urban_Development', category: 'Housing & Community' },
        { id: 'public_housing', description: 'Public housing & vouchers', tooltipText: 'This includes funding for public housing developments and Section 8 vouchers, which help low-income families, the elderly, and the disabled afford decent housing in the private market.', amountPerDollar: 300 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Section_8_(housing)', category: 'Housing & Community' },
        { id: 'fema_disaster', description: 'FEMA – disaster relief', tooltipText: 'The Federal Emergency Management Agency (FEMA) provides disaster relief funds to communities impacted by natural disasters like hurricanes, floods, and wildfires. Climate change is increasing the demand on these funds.', amountPerDollar: 560 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Disaster_Relief_Fund', category: 'Housing & Community' },
        { id: 'head_start', description: 'Head Start (early childhood)', tooltipText: 'A long-running program providing comprehensive early childhood education, health, and nutrition services to low-income children and their families, aiming to close opportunity gaps.', amountPerDollar: 113 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Head_Start', category: 'Housing & Community' },
        { id: 'community_block_grants', description: 'Community development grants', tooltipText: 'Community Development Block Grants (CDBG) are flexible funds that cities and counties can use for a wide range of local projects, from affordable housing to infrastructure improvements.', amountPerDollar: 61 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Community_Development_Block_Grant', category: 'Housing & Community' },
      ],
    },

    /** Transportation – 2 % */
    {
      id: 'transportation',
      category: 'Transportation',
      percentage: 2,
      subItems: [
        { id: 'highways', description: 'Highways', tooltipText: 'The Federal Highway Administration provides funding to states for the construction and maintenance of the National Highway System. This spending shapes our cities and impacts our carbon footprint.', amountPerDollar: 500 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Federal_Highway_Administration', category: 'Transportation' },
        { id: 'public_transit', description: 'Public transit', tooltipText: 'This funding supports public transportation systems like buses, subways, and light rail. Advocates argue that increasing this funding is crucial for equity and climate action.', amountPerDollar: 220 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Federal_Transit_Administration', category: 'Transportation' },
        { id: 'rail_service', description: 'Amtrak & rail service', tooltipText: 'This represents the federal subsidy for Amtrak, the national passenger rail corporation. The U.S. invests significantly less in passenger rail compared to many other developed nations.', amountPerDollar: 120 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Amtrak', category: 'Transportation' },
        { id: 'tsa', description: 'TSA & aviation security', tooltipText: 'The Transportation Security Administration is responsible for security at U.S. airports. Its budget and practices are frequent topics of debate regarding privacy and effectiveness.', amountPerDollar: 100 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Transportation_Security_Administration', category: 'Transportation' },
        { id: 'faa', description: 'FAA – air-traffic control', tooltipText: 'The Federal Aviation Administration regulates all aspects of civil aviation, including air traffic control and airline safety. Its performance is critical to the safety of millions of travelers.', amountPerDollar: 100 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Federal_Aviation_Administration', category: 'Transportation' },
      ],
    },

    /** Energy & Environment – 1 % */
    {
      id: 'energy_environment',
      category: 'Energy & Environment',
      percentage: 1,
      subItems: [
        { id: 'epa', description: 'EPA – environmental protection', tooltipText: 'The Environmental Protection Agency (EPA) is responsible for enforcing the nation\'s bedrock environmental laws, such as the Clean Air Act and Clean Water Act. Its funding level directly impacts its ability to protect public health.', amountPerDollar: 180 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/United_States_Environmental_Protection_Agency', category: 'Energy & Environment' },
        { id: 'renewables', description: 'Renewable energy & efficiency', tooltipText: 'This funding, primarily through the Department of Energy, supports research, development, and deployment of clean energy technologies. Activists see this as a critical but underfunded tool in the fight against climate change.', amountPerDollar: 80 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Office_of_Energy_Efficiency_and_Renewable_Energy', category: 'Energy & Environment' },
        { id: 'forest_service', description: 'Forest Service', tooltipText: 'The U.S. Forest Service manages the nation\'s 154 national forests and 20 national grasslands. Its responsibilities range from timber harvesting to wildfire prevention and ecosystem restoration.', amountPerDollar: 110 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/United_States_Forest_Service', category: 'Energy & Environment' },
        { id: 'national_parks', description: 'National Park Service', tooltipText: 'The National Park Service protects and maintains America\'s most treasured natural and historical sites. These funds cover everything from park ranger salaries to trail maintenance.', amountPerDollar: 50 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/National_Park_Service', category: 'Energy & Environment' },
        { id: 'noaa', description: 'NOAA – oceans & atmosphere', tooltipText: 'The National Oceanic and Atmospheric Administration is a scientific agency that provides weather forecasts, monitors climate change, and manages ocean resources. Its research is vital for understanding our changing planet.', amountPerDollar: 100 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/National_Oceanic_and_Atmospheric_Administration', category: 'Energy & Environment' },
      ],
    },

    /** International Affairs – 1 % */
    {
      id: 'international_affairs',
      category: 'International Affairs',
      percentage: 1,
      subItems: [
        { id: 'diplomacy', description: 'Diplomacy (State Dept.)', tooltipText: 'This funds the Department of State, including U.S. embassies, consulates, and diplomatic personnel. Proponents argue that robust diplomatic funding is a more effective and far cheaper way to ensure security than military spending.', amountPerDollar: 200 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/United_States_Department_of_State', category: 'International Affairs' },
        { id: 'usaid', description: 'Development aid (USAID)', tooltipText: 'USAID is the lead agency for administering civilian foreign aid and development assistance. This funding addresses global poverty, hunger, and disease, which can be root causes of instability.', amountPerDollar: 200 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/United_States_Agency_for_International_Development', category: 'International Affairs' },
        { id: 'climate_aid', description: 'Climate & disaster aid', tooltipText: 'This specific funding within USAID is dedicated to helping other countries mitigate and adapt to the impacts of climate change. It is a key part of the U.S. commitment to international climate agreements.', amountPerDollar: 120 / REFERENCE_TOTAL_TAX, wikiLink: 'https://www.usaid.gov/climate', category: 'International Affairs' },
      ],
    },

    /** Law Enforcement & Justice – 1 % */
    {
      id: 'law_enforcement',
      category: 'Law Enforcement & Justice',
      percentage: 1,
      subItems: [
        { id: 'fbi', description: 'FBI & federal investigators', tooltipText: 'This funds the Federal Bureau of Investigation, the primary domestic intelligence and security service of the United States, and its principal federal law enforcement agency.', amountPerDollar: 190 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Federal_Bureau_of_Investigation', category: 'Law Enforcement & Justice' },
        { id: 'border_security', description: 'Border security & ICE', tooltipText: 'Funds both Customs and Border Protection (CBP) for border security and Immigration and Customs Enforcement (ICE) for interior enforcement and deportations. These agencies are at the center of the national immigration debate.', amountPerDollar: 220 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/U.S._Immigration_and_Customs_Enforcement', category: 'Law Enforcement & Justice' },
        { id: 'federal_prisons', description: 'Federal prisons', tooltipText: 'This funds the Bureau of Prisons, which is responsible for the custody and care of individuals convicted of federal crimes. The size and cost of the federal prison system are a major focus for justice reform advocates.', amountPerDollar: 110 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Federal_Bureau_of_Prisons', category: 'Law Enforcement & Justice' },
      ],
    },

    /** Science & Technology – 1 % */
    {
      id: 'science',
      category: 'Science & Technology',
      percentage: 1,
      subItems: [
        { id: 'nasa', description: 'NASA – space exploration', tooltipText: 'NASA is responsible for the U.S. civilian space program and for aeronautics and aerospace research. Its missions have inspired generations and led to numerous technological spinoffs.', amountPerDollar: 250 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/NASA', category: 'Science & Technology' },
        { id: 'nsf', description: 'National Science Foundation', tooltipText: 'The NSF is an independent federal agency that supports fundamental research and education in all the non-medical fields of science and engineering. This is a primary driver of basic research in the U.S.', amountPerDollar: 100 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/National_Science_Foundation', category: 'Science & Technology' },
        { id: 'arpa_research', description: 'DARPA / ARPA-style R&D', tooltipText: 'These agencies, like DARPA and ARPA-E, fund high-risk, high-reward research with the goal of developing breakthrough technologies for national security and energy. The internet itself originated from this type of research.', amountPerDollar: 80 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Advanced_Research_Projects_Agency', category: 'Science & Technology' },
        { id: 'commercial_space', description: 'Commercial space contracts', tooltipText: 'This represents contracts awarded by NASA to private companies like SpaceX and Boeing for services like transporting astronauts and cargo to the International Space Station.', amountPerDollar: 90 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Commercial_Crew_Program', category: 'Science & Technology' },
      ],
    },

    /** Government operations (small slice, excludes self-funded FDIC) – 1 % */
    {
      id: 'government_ops',
      category: 'Government Operations',
      percentage: 1,
      subItems: [
        { id: 'irs', description: 'Internal Revenue Service', tooltipText: 'The IRS is responsible for tax collection and administration of the tax code. The level of funding for the IRS directly impacts its ability to perform taxpayer service and enforce tax laws fairly.', amountPerDollar: 240 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Internal_Revenue_Service', category: 'Government Operations' },
        { id: 'federal_courts', description: 'Federal court system', tooltipText: 'This funds the judiciary branch of the U.S. government, including district courts, courts of appeals, and the Supreme Court. These institutions are fundamental to upholding the rule of law.', amountPerDollar: 90 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Federal_judiciary_of_the_United_States', category: 'Government Operations' },
        { id: 'public_defenders', description: 'Federal public defenders', tooltipText: 'These federally funded attorneys represent defendants in federal criminal cases who cannot afford to hire their own lawyer, fulfilling the constitutional right to counsel.', amountPerDollar: 13 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Federal_Public_Defender', category: 'Government Operations' },
        { id: 'cfpb', description: 'Consumer Financial Protection Bureau', tooltipText: 'The CFPB is a regulatory agency charged with overseeing financial products and services that are offered to consumers. It was created to protect consumers from unfair, deceptive, or abusive practices.', amountPerDollar: 9 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Consumer_Financial_Protection_Bureau', category: 'Government Operations' },
        { id: 'mbda', description: 'Minority Business Dev. Agency', tooltipText: 'An agency within the Department of Commerce dedicated to promoting the growth and competitiveness of minority-owned businesses in the United States.', amountPerDollar: 1 / REFERENCE_TOTAL_TAX, wikiLink: 'https://en.wikipedia.org/wiki/Minority_Business_Development_Agency', category: 'Government Operations' },
      ],
    },
  ];

  // Put the biggest slices first for a nicer UX
  detailedBreakdown.sort((a, b) => b.percentage - a.percentage);

  // Stamp the parent category name onto each sub-item (useful for grouping)
  return detailedBreakdown.map(cat => ({
    ...cat,
    subItems: cat.subItems?.map(si => ({ ...si, category: cat.category })),
  }));
}


// ---------- email generation function (wrapper) -----------------------------

/**
 * Public function to generate the email. Calls the core logic from generator.ts.
 * Ensures selectedItems passed to the generator include the category.
 */
export function generateRepresentativeEmail(
    selectedItemsWithCategory: Array<SelectedItem & { category: string }>, // Expect items with category
    aggressiveness: number,
    userName: string,
    userLocation: string,
    balanceBudgetPreference: boolean
): { subject: string; body: string } {
    // Pass arguments directly to the core generator function
    return generateRepresentativeEmailContent(
        selectedItemsWithCategory,
        aggressiveness,
        userName,
        userLocation,
        balanceBudgetPreference
    );
}
