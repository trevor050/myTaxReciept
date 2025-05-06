
/**
 * @fileOverview Service for fetching mock tax spending data and generating representative emails.
 * Includes refined email generation logic for improved natural language flow and detail.
 */

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
}

/**
 * Represents an item selected by the user for the email, including their desired funding change.
 */
export interface SelectedItem {
  id: string;
  description: string;
  /**
   * -2: Slash Heavily | -1: Cut Significantly | 0: Improve Efficiency
   *  1: Fund | 2: Fund More
   */
  fundingLevel: -2 | -1 | 0 | 1 | 2;
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
  // Mock data derived from the user-provided example ($52,000 total)
  // Includes tooltipText and wikiLink for all items
  const detailedBreakdown: TaxSpending[] = [
    {
      id: 'health',
      category: 'Health',
      percentage: (12906.86 / REFERENCE_TOTAL_TAX) * 100, // ~24.82%
      subItems: [
        { id: 'medicaid', description: 'Medicaid', amountPerDollar: 5336.01 / REFERENCE_TOTAL_TAX, tooltipText: 'Provides health coverage for low-income individuals and families, jointly funded by federal and state governments.', wikiLink: 'https://en.wikipedia.org/wiki/Medicaid' },
        { id: 'medicare', description: 'Medicare', amountPerDollar: 4854.13 / REFERENCE_TOTAL_TAX, tooltipText: 'Federal health insurance program primarily for people aged 65 or older, and some younger people with disabilities.', wikiLink: 'https://en.wikipedia.org/wiki/Medicare_(United_States)' },
        { id: 'nih', description: 'National Institutes of Health', amountPerDollar: 436.73 / REFERENCE_TOTAL_TAX, tooltipText: 'The primary U.S. agency responsible for biomedical and public health research.', wikiLink: 'https://en.wikipedia.org/wiki/National_Institutes_of_Health' },
        { id: 'cdc', description: 'Centers for Disease Control & Prevention (CDC)', amountPerDollar: 137.72 / REFERENCE_TOTAL_TAX, tooltipText: 'National public health agency focused on disease control, prevention, and health promotion.', wikiLink: 'https://en.wikipedia.org/wiki/Centers_for_Disease_Control_and_Prevention' },
        { id: 'substance_mental_health', description: 'Substance use & mental health programs', amountPerDollar: 86.89 / REFERENCE_TOTAL_TAX, tooltipText: 'Funding for programs addressing substance abuse and mental health issues, primarily via SAMHSA.', wikiLink: 'https://en.wikipedia.org/wiki/Substance_Abuse_and_Mental_Health_Services_Administration' },
      ],
    },
    {
      id: 'war_weapons',
      category: 'War and Weapons',
      percentage: (10852.53 / REFERENCE_TOTAL_TAX) * 100, // ~20.87%
      subItems: [
        { id: 'pentagon', description: 'Pentagon', amountPerDollar: 8574.28 / REFERENCE_TOTAL_TAX, tooltipText: 'Overall budget for the United States Department of Defense headquarters and operations.', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Department_of_Defense' },
        { id: 'pentagon_contractors', description: 'Pentagon - Contractors', amountPerDollar: 4187.01 / REFERENCE_TOTAL_TAX, tooltipText: 'Funds paid to private companies contracted by the Department of Defense for various services, equipment, and research.', wikiLink: 'https://en.wikipedia.org/wiki/Military_contractor' },
        { id: 'pentagon_personnel', description: 'Pentagon - Military Personnel', amountPerDollar: 1786.15 / REFERENCE_TOTAL_TAX, tooltipText: 'Costs associated with salaries, benefits, housing, and support for active-duty military members.', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Armed_Forces' },
        { id: 'pentagon_top5_contractors', description: 'Pentagon - Top 5 Contractors', amountPerDollar: 1137.58 / REFERENCE_TOTAL_TAX, tooltipText: 'Spending allocated specifically to the five largest private defense contractors (e.g., Lockheed Martin, Boeing, Raytheon).', wikiLink: 'https://en.wikipedia.org/wiki/List_of_United_States_defense_contractors_by_arms_sales' },
        { id: 'nuclear_weapons', description: 'Nuclear Weapons', amountPerDollar: 339.51 / REFERENCE_TOTAL_TAX, tooltipText: 'Funding for the development, maintenance, security, and modernization of the U.S. nuclear arsenal, managed by the NNSA.', wikiLink: 'https://en.wikipedia.org/wiki/Nuclear_weapons_of_the_United_States' },
        { id: 'foreign_military_aid', description: 'Aid to foreign militaries', amountPerDollar: 258.74 / REFERENCE_TOTAL_TAX, tooltipText: 'Financial and material assistance (e.g., weapons, training) provided to the armed forces of other countries.', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Foreign_Military_Financing' },
        { id: 'israel_wars', description: 'Israel wars (Pentagon & aid)', amountPerDollar: 214.14 / REFERENCE_TOTAL_TAX, tooltipText: 'Specific allocation related to U.S. support for Israel\'s military and defense, including direct aid and joint military operations.', wikiLink: 'https://en.wikipedia.org/wiki/Israel%E2%80%93United_States_military_relations' },
        { id: 'f35', description: 'F-35 Jet Fighter', amountPerDollar: 127.86 / REFERENCE_TOTAL_TAX, tooltipText: 'Funding for the F-35 Lightning II program, a family of single-seat, single-engine, all-weather stealth multirole combat aircraft.', wikiLink: 'https://en.wikipedia.org/wiki/Lockheed_Martin_F-35_Lightning_II' },
        { id: 'pentagon_spacex', description: 'Pentagon - SpaceX Contracts', amountPerDollar: 17.04 / REFERENCE_TOTAL_TAX, tooltipText: 'Contracts awarded by the Department of Defense to SpaceX for national security space launch services and other projects.', wikiLink: 'https://en.wikipedia.org/wiki/SpaceX#Government_contracts' },
        { id: 'pentagon_dei', description: 'Pentagon - Diversity, Equity, Inclusion (DEI)', amountPerDollar: 1.08 / REFERENCE_TOTAL_TAX, tooltipText: 'Funding allocated to Diversity, Equity, and Inclusion initiatives and programs within the Department of Defense.', wikiLink: 'https://en.wikipedia.org/wiki/Diversity,_equity,_and_inclusion' },
      ],
    },
    {
      id: 'interest_debt',
      category: 'Interest on Debt',
      percentage: (10105.93 / REFERENCE_TOTAL_TAX) * 100, // ~19.43%
      tooltipText: 'This substantial portion represents the cost of servicing the national debt. Decades of deficit spending contribute to this burden, diverting funds from other priorities.',
    },
    {
      id: 'veterans',
      category: 'Veterans',
      percentage: (3253.81 / REFERENCE_TOTAL_TAX) * 100, // ~6.26%
      subItems: [
        { id: 'va', description: 'Veterans\' Affairs (VA)', amountPerDollar: 3251.63 / REFERENCE_TOTAL_TAX, tooltipText: 'Provides a wide range of services including healthcare, disability compensation, education benefits (GI Bill), home loans, and burial benefits to U.S. military veterans.', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Department_of_Veterans_Affairs' },
        { id: 'pact_act', description: 'Veterans Toxic Exposure Fund (PACT Act)', amountPerDollar: 189.31 / REFERENCE_TOTAL_TAX, tooltipText: 'Specifically funds healthcare, research, and benefits for veterans exposed to burn pits, Agent Orange, and other toxic substances during military service.', wikiLink: 'https://en.wikipedia.org/wiki/PACT_Act' },
      ],
    },
    {
      id: 'unemployment_labor',
      category: 'Unemployment and Labor',
      percentage: (3089.14 / REFERENCE_TOTAL_TAX) * 100, // ~5.94%
      subItems: [
        { id: 'tanf', description: 'Temporary Assistance for Needy Families', amountPerDollar: 530.51 / REFERENCE_TOTAL_TAX, tooltipText: 'Provides temporary financial assistance, job training, and support services to low-income families with children, aimed at promoting self-sufficiency.', wikiLink: 'https://en.wikipedia.org/wiki/Temporary_Assistance_for_Needy_Families' },
        { id: 'child_tax_credit', description: 'Child Tax Credit', amountPerDollar: 270.23 / REFERENCE_TOTAL_TAX, tooltipText: 'A tax credit provided to eligible taxpayers for qualifying dependent children, designed to help offset the cost of raising children.', wikiLink: 'https://en.wikipedia.org/wiki/Child_tax_credit_(United_States)' },
        { id: 'refugee_assistance', description: 'Refugee Assistance', amountPerDollar: 76.71 / REFERENCE_TOTAL_TAX, tooltipText: 'Funding for programs supporting the resettlement, integration, and initial needs of refugees admitted to the United States.', wikiLink: 'https://en.wikipedia.org/wiki/Office_of_Refugee_Resettlement' },
        { id: 'liheap', description: 'Low Income Home Energy Assistance Program', amountPerDollar: 49.13 / REFERENCE_TOTAL_TAX, tooltipText: 'Helps eligible low-income households pay their heating and cooling bills, and covers energy crisis assistance and weatherization.', wikiLink: 'https://en.wikipedia.org/wiki/Low_Income_Home_Energy_Assistance_Program' },
        { id: 'nlrb', description: 'National Labor Relations Board (NLRB)', amountPerDollar: 3.00 / REFERENCE_TOTAL_TAX, tooltipText: 'An independent U.S. government agency enforcing federal labor law concerning collective bargaining and unfair labor practices by employers and unions.', wikiLink: 'https://en.wikipedia.org/wiki/National_Labor_Relations_Board' },
      ],
    },
    {
      id: 'education',
      category: 'Education',
      percentage: (2382.28 / REFERENCE_TOTAL_TAX) * 100, // ~4.58%
      subItems: [
        { id: 'dept_education', description: 'Department of Education', amountPerDollar: 2305.39 / REFERENCE_TOTAL_TAX, tooltipText: 'The cabinet-level department overseeing federal education policy, programs, and funding distribution.', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Department_of_Education' },
        { id: 'college_aid', description: 'Dept. of Education - College Aid', amountPerDollar: 1220.53 / REFERENCE_TOTAL_TAX, tooltipText: 'Includes federal financial aid programs for postsecondary education like Pell Grants, federal student loans (Direct Loans), and Work-Study.', wikiLink: 'https://en.wikipedia.org/wiki/Student_financial_aid_in_the_United_States' },
        { id: 'k12_schools', description: 'Dept. of Education - K-12 Schools', amountPerDollar: 896.15 / REFERENCE_TOTAL_TAX, tooltipText: 'Federal funding supporting elementary and secondary education, often targeting disadvantaged students (e.g., Title I) and students with disabilities (IDEA).', wikiLink: 'https://en.wikipedia.org/wiki/Elementary_and_Secondary_Education_Act' },
        { id: 'cpb', description: 'Corporation for Public Broadcasting', amountPerDollar: 5.50 / REFERENCE_TOTAL_TAX, tooltipText: 'A private, non-profit corporation created by Congress to fund public radio (NPR) and television (PBS) stations.', wikiLink: 'https://en.wikipedia.org/wiki/Corporation_for_Public_Broadcasting' },
        { id: 'imls', description: 'Museum and Library Services', amountPerDollar: 4.20 / REFERENCE_TOTAL_TAX, tooltipText: 'The primary source of federal support for the nation\'s libraries and museums, providing grants and policy leadership.', wikiLink: 'https://en.wikipedia.org/wiki/Institute_of_Museum_and_Library_Services' },
      ],
    },
    {
      id: 'food_agriculture',
      category: 'Food and Agriculture',
      percentage: (2101.90 / REFERENCE_TOTAL_TAX) * 100, // ~4.04%
      subItems: [
        { id: 'snap', description: 'Food stamps (SNAP)', amountPerDollar: 1305.30 / REFERENCE_TOTAL_TAX, tooltipText: 'The Supplemental Nutrition Assistance Program, providing food-purchasing assistance for low- and no-income people living in the U.S.', wikiLink: 'https://en.wikipedia.org/wiki/Supplemental_Nutrition_Assistance_Program' },
        { id: 'school_lunch', description: 'School Lunch & child nutrition', amountPerDollar: 353.78 / REFERENCE_TOTAL_TAX, tooltipText: 'Includes the National School Lunch Program and School Breakfast Program, providing free or reduced-price meals to eligible children in schools.', wikiLink: 'https://en.wikipedia.org/wiki/National_School_Lunch_Program' },
        { id: 'fsa', description: 'Farm Services Agency', amountPerDollar: 85.90 / REFERENCE_TOTAL_TAX, tooltipText: 'An agency within the USDA providing loans, commodity price support, disaster assistance, and conservation programs to farmers and ranchers.', wikiLink: 'https://en.wikipedia.org/wiki/Farm_Service_Agency' },
        { id: 'wic', description: 'Women, Infants, & Children (WIC)', amountPerDollar: 48.76 / REFERENCE_TOTAL_TAX, tooltipText: 'A supplemental nutrition program providing nutritious foods, nutrition education, and healthcare referrals for low-income pregnant women, new mothers, infants, and children up to age five.', wikiLink: 'https://en.wikipedia.org/wiki/WIC' },
      ],
    },
    {
      id: 'government',
      category: 'Government',
      percentage: (1906.73 / REFERENCE_TOTAL_TAX) * 100, // ~3.67%
      subItems: [
        { id: 'fdic', description: 'Federal Deposit Insurance Corporation', amountPerDollar: 454.03 / REFERENCE_TOTAL_TAX, tooltipText: 'An independent agency created by Congress to maintain stability and public confidence in the nation\'s financial system by insuring deposits in U.S. banks.', wikiLink: 'https://en.wikipedia.org/wiki/Federal_Deposit_Insurance_Corporation' },
        { id: 'irs', description: 'Internal Revenue Service', amountPerDollar: 231.86 / REFERENCE_TOTAL_TAX, tooltipText: 'The U.S. government agency responsible for tax collection and the administration of the Internal Revenue Code.', wikiLink: 'https://en.wikipedia.org/wiki/Internal_Revenue_Service' },
        { id: 'federal_courts', description: 'Federal Court System', amountPerDollar: 90.92 / REFERENCE_TOTAL_TAX, tooltipText: 'The judiciary branch of the U.S. federal government, including district courts, courts of appeals, and the Supreme Court.', wikiLink: 'https://en.wikipedia.org/wiki/Federal_judiciary_of_the_United_States' },
        { id: 'public_defenders', description: 'Federal Court System - Public Defenders', amountPerDollar: 12.91 / REFERENCE_TOTAL_TAX, tooltipText: 'Attorneys appointed and funded by the federal government to represent defendants in federal criminal cases who cannot afford to hire their own lawyer.', wikiLink: 'https://en.wikipedia.org/wiki/Federal_Public_Defender' },
        { id: 'usps', description: 'Postal Service', amountPerDollar: 11.53 / REFERENCE_TOTAL_TAX, tooltipText: 'An independent agency of the executive branch responsible for providing postal service in the U.S. (Note: Primarily funded by postage revenue, but receives some federal appropriations).', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Postal_Service' },
        { id: 'cfpb', description: 'Consumer Financial Protection Bureau (CFPB)', amountPerDollar: 8.58 / REFERENCE_TOTAL_TAX, tooltipText: 'A regulatory agency charged with overseeing financial products and services offered to consumers.', wikiLink: 'https://en.wikipedia.org/wiki/Consumer_Financial_Protection_Bureau' },
        { id: 'mbda', description: 'Minority Business Development Agency', amountPerDollar: 1.21 / REFERENCE_TOTAL_TAX, tooltipText: 'An agency within the Department of Commerce dedicated to promoting the growth and competitiveness of minority-owned businesses.', wikiLink: 'https://en.wikipedia.org/wiki/Minority_Business_Development_Agency' },
        { id: 'usich', description: 'Interagency Council on Homelessness', amountPerDollar: 0.04 / REFERENCE_TOTAL_TAX, tooltipText: 'Coordinates the federal response to homelessness across 19 federal agencies.', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Interagency_Council_on_Homelessness' },
      ],
    },
     {
      id: 'housing_community',
      category: 'Housing and Community',
      percentage: (1792.12 / REFERENCE_TOTAL_TAX) * 100, // ~3.45%
      subItems: [
        { id: 'fema', description: 'Federal Emergency Management Agency', amountPerDollar: 635.39 / REFERENCE_TOTAL_TAX, tooltipText: 'An agency within the Department of Homeland Security coordinating the federal government\'s response to disasters.', wikiLink: 'https://en.wikipedia.org/wiki/Federal_Emergency_Management_Agency' },
        { id: 'fema_drf', description: 'FEMA - Disaster Relief Fund', amountPerDollar: 553.28 / REFERENCE_TOTAL_TAX, tooltipText: 'The primary source of funding for federal disaster response, recovery, and mitigation efforts managed by FEMA.', wikiLink: 'https://en.wikipedia.org/wiki/Disaster_Relief_Fund' },
        { id: 'hud', description: 'Dept. of Housing and Urban Development', amountPerDollar: 525.67 / REFERENCE_TOTAL_TAX, tooltipText: 'The cabinet department responsible for national housing policy, community development, and affordable housing programs.', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Department_of_Housing_and_Urban_Development' },
        { id: 'head_start', description: 'Head Start', amountPerDollar: 112.87 / REFERENCE_TOTAL_TAX, tooltipText: 'A program providing comprehensive early childhood education, health, nutrition, and parent involvement services to low-income children and families.', wikiLink: 'https://en.wikipedia.org/wiki/Head_Start_Program' },
        { id: 'public_housing', description: 'Public Housing', amountPerDollar: 71.97 / REFERENCE_TOTAL_TAX, tooltipText: 'Affordable rental housing programs funded by HUD for eligible low-income families, the elderly, and persons with disabilities.', wikiLink: 'https://en.wikipedia.org/wiki/Public_housing_in_the_United_States' },
      ],
    },
    {
      id: 'energy_environment',
      category: 'Energy and Environment',
      percentage: (1103.55 / REFERENCE_TOTAL_TAX) * 100, // ~2.12%
       subItems: [
         { id: 'epa', description: 'Environmental Protection Agency', amountPerDollar: 373.06 / REFERENCE_TOTAL_TAX, tooltipText: 'An agency responsible for creating and enforcing regulations based on laws passed by Congress to protect human health and the environment.', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Environmental_Protection_Agency' },
         { id: 'forest_service', description: 'Forest Service', amountPerDollar: 115.03 / REFERENCE_TOTAL_TAX, tooltipText: 'An agency within the USDA that administers the nation\'s 154 national forests and 20 national grasslands.', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Forest_Service' },
         { id: 'noaa', description: 'Nat\'l Oceanic & Atmospheric Administration (NOAA)', amountPerDollar: 73.37 / REFERENCE_TOTAL_TAX, tooltipText: 'A scientific agency within the Department of Commerce focusing on the conditions of the oceans, major waterways, and the atmosphere.', wikiLink: 'https://en.wikipedia.org/wiki/National_Oceanic_and_Atmospheric_Administration' },
         { id: 'renewable_energy', description: 'Energy efficiency and renewable energy', amountPerDollar: 73.36 / REFERENCE_TOTAL_TAX, tooltipText: 'Funding for programs within the Department of Energy promoting energy efficiency improvements and the development/deployment of renewable energy technologies.', wikiLink: 'https://en.wikipedia.org/wiki/Office_of_Energy_Efficiency_and_Renewable_Energy' },
         { id: 'nps', description: 'National Park Service', amountPerDollar: 41.60 / REFERENCE_TOTAL_TAX, tooltipText: 'An agency within the Department of the Interior managing all national parks, many national monuments, and other conservation and historical properties.', wikiLink: 'https://en.wikipedia.org/wiki/National_Park_Service' },
       ],
    },
    {
        id: 'international_affairs',
        category: 'International Affairs',
        percentage: (681.73 / REFERENCE_TOTAL_TAX) * 100, // ~1.31%
        subItems: [
            { id: 'diplomacy', description: 'Diplomacy', amountPerDollar: 151.70 / REFERENCE_TOTAL_TAX, tooltipText: 'Funding for the Department of State, including U.S. embassies, consulates, and diplomatic personnel abroad.', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Department_of_State' },
            { id: 'usaid', description: 'U.S. Agency for International Development (USAID)', amountPerDollar: 115.34 / REFERENCE_TOTAL_TAX, tooltipText: 'The lead U.S. government agency primarily responsible for administering civilian foreign aid and development assistance.', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Agency_for_International_Development' },
            { id: 'usaid_climate', description: 'USAID - Climate Aid', amountPerDollar: 8.77 / REFERENCE_TOTAL_TAX, tooltipText: 'Specific funding within USAID dedicated to helping other countries mitigate and adapt to the impacts of climate change.', wikiLink: 'https://www.usaid.gov/climate' },
        ],
    },
    {
        id: 'law_enforcement',
        category: 'Law Enforcement',
        percentage: (668.42 / REFERENCE_TOTAL_TAX) * 100, // ~1.29%
        subItems: [
            { id: 'deportations_border', description: 'Deportations & border patrol', amountPerDollar: 287.64 / REFERENCE_TOTAL_TAX, tooltipText: 'Funding primarily for Immigration and Customs Enforcement (ICE) for interior enforcement/deportations and Customs and Border Protection (CBP) for border security.', wikiLink: 'https://en.wikipedia.org/wiki/U.S._Immigration_and_Customs_Enforcement' },
            { id: 'federal_prisons', description: 'Federal Prisons', amountPerDollar: 83.29 / REFERENCE_TOTAL_TAX, tooltipText: 'Funding for the Bureau of Prisons, responsible for the custody and care of federal inmates.', wikiLink: 'https://en.wikipedia.org/wiki/Federal_Bureau_of_Prisons' },
        ],
    },
    {
        id: 'transportation',
        category: 'Transportation',
        percentage: (578.94 / REFERENCE_TOTAL_TAX) * 100, // ~1.11%
        subItems: [
            { id: 'highways', description: 'Highways', amountPerDollar: 111.66 / REFERENCE_TOTAL_TAX, tooltipText: 'Funding distributed to states via the Federal Highway Administration (FHWA) for the construction, maintenance, and repair of the federal-aid highway system.', wikiLink: 'https://en.wikipedia.org/wiki/Federal_Highway_Administration' },
            { id: 'public_transit', description: 'Public transit', amountPerDollar: 87.29 / REFERENCE_TOTAL_TAX, tooltipText: 'Federal funding provided through the Federal Transit Administration (FTA) to support public transportation systems like buses, subways, and light rail.', wikiLink: 'https://en.wikipedia.org/wiki/Federal_Transit_Administration' },
            { id: 'tsa', description: 'Transportation Security Administration (TSA)', amountPerDollar: 68.68 / REFERENCE_TOTAL_TAX, tooltipText: 'An agency within the Department of Homeland Security responsible for security of the traveling public, primarily focusing on aviation security.', wikiLink: 'https://en.wikipedia.org/wiki/Transportation_Security_Administration' },
            { id: 'faa', description: 'Federal Aviation Administration', amountPerDollar: 68.38 / REFERENCE_TOTAL_TAX, tooltipText: 'An agency within the Department of Transportation responsible for regulating all aspects of civil aviation in the U.S.', wikiLink: 'https://en.wikipedia.org/wiki/Federal_Aviation_Administration' },
            { id: 'amtrak', description: 'Amtrak & Rail Service', amountPerDollar: 40.28 / REFERENCE_TOTAL_TAX, tooltipText: 'Federal funding supporting Amtrak, the national passenger railroad corporation, and potentially other rail initiatives.', wikiLink: 'https://en.wikipedia.org/wiki/Amtrak' },
        ],
    },
    {
        id: 'science',
        category: 'Science',
        percentage: (411.82 / REFERENCE_TOTAL_TAX) * 100, // ~0.79%
        subItems: [
            { id: 'nasa', description: 'National Aeronautics & Space Administration (NASA)', amountPerDollar: 225.57 / REFERENCE_TOTAL_TAX, tooltipText: 'An independent agency responsible for the U.S. civilian space program, as well as aeronautics and aerospace research.', wikiLink: 'https://en.wikipedia.org/wiki/NASA' },
            { id: 'nsf', description: 'National Science Foundation', amountPerDollar: 96.62 / REFERENCE_TOTAL_TAX, tooltipText: 'An independent federal agency supporting fundamental research and education in all non-medical fields of science and engineering.', wikiLink: 'https://en.wikipedia.org/wiki/National_Science_Foundation' },
            { id: 'nasa_spacex', description: 'NASA - SpaceX Contracts', amountPerDollar: 14.95 / REFERENCE_TOTAL_TAX, tooltipText: 'Contracts awarded by NASA to SpaceX for commercial cargo resupply, crew transportation to the ISS, and lunar landing systems (Artemis).', wikiLink: 'https://en.wikipedia.org/wiki/SpaceX#NASA_contracts' },
        ],
    },
  ];

  // Sort by percentage descending
  detailedBreakdown.sort((a, b) => b.percentage - a.percentage);

  return detailedBreakdown;
}


// ---------- email generation logic -----------------------------------------
// emailGenerator.ts refactored and enhanced
// --------------------------------------------------

// ---------- shared types (copied) ------------------------------------------
// interface SelectedItem { id: string; description: string; fundingLevel: -2 | -1 | 0 | 1 | 2; }

// ---------- helpers (copied and enhanced) ----------------------------------

/** Map 0-100 slider to tone bucket 0-3 */
function toneBucket(aggr: number): 0 | 1 | 2 | 3 {
    // Adjusted thresholds for finer control
    if (aggr <= 15) return 0; // Kind/Polite (0-15)
    if (aggr <= 40) return 1; // Concerned (16-40)
    if (aggr <= 75) return 2; // Stern/Demanding (41-75)
    return 3;                 // Angry/Forceful (76-100)
}

/** Selects a random phrasing from an array */
function randomChoice<T>(arr: T[]): T {
    if (!arr || arr.length === 0) return '' as T; // Guard against empty arrays
    return arr[Math.floor(Math.random() * arr.length)];
}

// --- Core Email Content Templates ---

// SUBJECT Lines (Refined for impact and clarity)
const SUBJECT: Record<0 | 1 | 2 | 3, string> = {
    0: "A Constituent's Perspective on Federal Budget Priorities",
    1: "Concerns Regarding Specific Federal Spending Allocations",
    2: "Urgent Request: Reevaluate Federal Budget Priorities and Debt",
    3: "Demand for Immediate Action: Federal Spending & Fiscal Responsibility",
};

// OPENING Paragraphs (More varied phrasing, stronger tone progression)
const OPENING: Record<0 | 1 | 2 | 3, (loc: string) => string> = {
    0: loc => `I hope this message finds you well. As a concerned constituent residing in ${loc || '[Your Area]'}, I am writing to respectfully share my perspective on the current allocation of federal tax dollars. I believe thoughtful discussion about these priorities is essential for effective governance.`,
    1: loc => `I am writing to you today as a constituent from ${loc || '[Your Area]'} with growing concerns about federal spending patterns. Analyzing how our tax money is distributed raises important questions about efficiency, necessity, and alignment with our community's values.`,
    2: loc => `Representing constituents like myself in ${loc || '[Your Area]'}, I must register my strong dissatisfaction with the current trajectory of federal spending. It is imperative that these priorities undergo immediate and serious reevaluation to ensure taxpayer money serves the public good effectively.`,
    3: loc => `From ${loc || '[Your Area]'}, I am compelled to demand immediate and decisive action regarding the federal budget. The current pattern of spending, marked by questionable priorities and apparent waste, is fiscally irresponsible and requires your urgent intervention.`,
};

// INTRODUCTIONS to the list of items (Smoother transitions)
const LIST_INTRO: Record<0 | 1 | 2 | 3, string> = {
    0: "After reviewing estimates of how federal funds are spent, I wanted to highlight a few areas that I believe warrant closer examination:",
    1: "My analysis of the budget breakdown reveals several specific items that cause me significant concern and which I urge you to address:",
    2: "Based on current spending levels, the following programs stand out as demanding significant reassessment and potential correction:",
    3: "Below are some of the most glaring examples of what I perceive as misguided priorities and wasteful spending requiring your direct action:",
};

// ACTION Phrases (indexed by fundingLevel + tone bucket) - Refined and expanded
// Provides the core verb/action describing the desired change.
const ACTION: Record<-2 | -1 | 0 | 1 | 2, [string, string, string, string]> = {
    [-2]: [ // Slash Heavily
        "should be considered for significant reduction or phasing out",
        "requires a substantial cut; its current funding level seems excessive",
        "must be drastically scaled back; this expenditure is difficult to justify",
        "must be eliminated or fundamentally reformed; this spending is unacceptable",
    ],
    [-1]: [ // Cut Significantly
        "funding could likely be reduced without compromising essential functions",
        "should undergo significant cuts; there are clear opportunities for savings",
        "demands a sharp reduction to better align with fiscal responsibility",
        "needs an aggressive cut; taxpayers expect more prudent use of funds",
    ],
    [0]: [ // Improve Efficiency / Maintain with Oversight
        "funding should be maintained, but with a strong emphasis on improving efficiency and accountability",
        "could continue at current levels, provided there's rigorous oversight to maximize its effectiveness",
        "might remain level, but only if waste is eliminated and performance metrics are met",
        "funding is questionable, but acceptable only with strict audits and proven results",
    ],
    [1]: [ // Fund / Modest Increase
        "deserves stable and perhaps modestly increased funding to ensure it can meet its objectives",
        "should receive reliable support, potentially with a moderate increase to enhance its impact",
        "warrants a noticeable funding boost to strengthen its capabilities and reach",
        "requires a clear increase in resources to adequately address important public needs",
    ],
    [2]: [ // Fund More / Substantial Increase
        "merits a substantial increase in funding; the potential benefits are significant",
        "needs robust new investment to expand its positive impact and capabilities",
        "should be prioritized for major funding growth to address critical challenges",
        "demands urgent and considerable expansion; underfunding this area is shortsighted",
    ]
};

// RATIONALE Snippets (indexed by item.id + fundingLevel) - GREATLY EXPANDED & Diversified
// Provides *specific, varied* justifications for the chosen action on that item.
// Aim for 2-4 distinct options per item/action combination.

type FundingActionRationale = 'cut' | 'review' | 'fund'; // For mapping levels to rationale types

function getFundingActionRationale(level: SelectedItem['fundingLevel']): FundingActionRationale {
    if (level < 0) return 'cut';
    if (level > 0) return 'fund';
    return 'review'; // Level 0 maps to review/efficiency rationales
}

// Keys: `${item.id}_${FundingActionRationale}` (e.g., 'medicaid_cut', 'nih_fund', 'pentagon_review')
const SPECIFIC_RATIONALES: Record<string, string[]> = {
    // --- Health ---
    medicaid_cut: [
        "Exploring reforms to enhance Medicaid's long-term fiscal sustainability is crucial, even while preserving essential care.",
        "Targeting Medicaid resources more effectively towards core health services could improve efficiency.",
        "While a vital safety net, Medicaid's growth necessitates exploring ways to control costs responsibly.",
        "Ensuring state and federal Medicaid funds are used with maximum efficiency should be a constant goal.",
    ],
    medicaid_fund: [
        "Expanding Medicaid eligibility remains a powerful tool for improving health outcomes and economic security for vulnerable families.",
        "Robust Medicaid funding is essential for covering low-income children, seniors, and individuals with disabilities.",
        "Investing adequately in Medicaid strengthens community health infrastructure and reduces uncompensated care costs.",
        "Ensuring fair reimbursement rates within Medicaid helps maintain access to providers for recipients.",
    ],
    medicaid_review: [
        "Implementing stronger measures to prevent fraud, waste, and abuse within Medicaid protects taxpayer dollars.",
        "Continuously evaluating Medicaid delivery models for efficiency and effectiveness is key to responsible stewardship.",
        "Focusing Medicaid resources on high-value care and preventative services can lead to better long-term health outcomes.",
        "Streamlining Medicaid administration could reduce overhead and direct more funds to patient care.",
    ],
    medicare_cut: [
        "Addressing Medicare's long-term solvency requires exploring options like negotiating drug prices and reducing administrative waste.",
        "Implementing reforms to improve Medicare's cost-effectiveness is vital for its future.",
        "Careful scrutiny of Medicare spending can prevent unnecessary procedures and ensure value for taxpayers.",
        "Promoting efficiency within the Medicare system is necessary given demographic pressures.",
    ],
    medicare_fund: [
        "Guaranteeing reliable and comprehensive healthcare for seniors through a strong Medicare program is a fundamental commitment.",
        "Strengthening Medicare, potentially by adding benefits like dental or vision coverage, improves seniors' quality of life.",
        "Adequate Medicare funding is critical for the health and financial security of millions of older Americans and those with disabilities.",
        "Ensuring Medicare can negotiate prescription drug prices effectively would lower costs for both beneficiaries and the government.",
    ],
    medicare_review: [
        "Combating fraud and abuse within the Medicare system must remain a top priority.",
        "Ongoing evaluation of Medicare payment systems is needed to incentivize high-quality, efficient care.",
        "Promoting value-based care models within Medicare can lead to better outcomes at a sustainable cost.",
        "Simplifying Medicare enrollment and navigation would benefit beneficiaries.",
    ],
    nih_cut: [
        "While vital, NIH funding should prioritize research with the highest potential for broad public health impact.",
        "Ensuring NIH grants avoid duplication and target truly innovative science is important for fiscal prudence.",
        "Streamlining NIH grant administration could maximize the research impact of taxpayer dollars.",
        "Balancing NIH funding with other national priorities requires careful consideration.",
    ],
    nih_fund: [
        "Investing boldly in the National Institutes of Health accelerates medical breakthroughs and maintains U.S. leadership in biomedical science.",
        "Increased NIH funding is essential for tackling devastating diseases and improving human health across the lifespan.",
        "Supporting basic science research through the NIH provides the crucial foundation for future cures and treatments.",
        "NIH funding drives innovation, creates high-tech jobs, and yields significant long-term economic benefits.",
    ],
    nih_review: [
        "Refining the NIH grant review process ensures fairness and supports the most promising research endeavors.",
        "Fostering greater collaboration and data sharing facilitated by the NIH can speed up scientific progress.",
        "Directing NIH resources towards addressing health disparities is a critical aspect of promoting health equity.",
        "Ensuring transparency and accountability in how NIH funds are utilized.",
    ],
    cdc_cut: [
        "Focusing CDC resources tightly on core functions like disease surveillance and emergency response is essential.",
        "Evaluating the effectiveness of all CDC programs ensures taxpayer money yields tangible public health benefits.",
        "Streamlining CDC operations and reducing administrative overhead could enhance its efficiency.",
        "Ensuring CDC activities do not overlap unnecessarily with state or local health departments.",
    ],
    cdc_fund: [
        "A fully funded CDC is paramount for national security, pandemic preparedness, and effective public health protection.",
        "Investing in the CDC's data systems, labs, and workforce strengthens our ability to prevent and control disease outbreaks.",
        "Supporting the CDC's global health security efforts helps contain threats before they reach the U.S.",
        "Adequate CDC funding ensures timely and reliable public health guidance.",
    ],
    cdc_review: [
        "Improving the clarity and timeliness of CDC guidance during public health emergencies builds trust.",
        "Enhancing CDC communication strategies and transparency is vital for public health effectiveness.",
        "Ensuring the CDC maintains scientific integrity and avoids politicization is crucial.",
        "Strengthening partnerships between the CDC and state/local health agencies improves coordination.",
    ],
    substance_mental_health_cut: [
        "Funding for mental health and substance use programs must prioritize evidence-based treatments with proven outcomes.",
        "Careful evaluation is needed to avoid duplication between federal, state, and private mental health initiatives.",
        "Targeting resources towards programs demonstrably reducing overdoses and supporting long-term recovery.",
        "Ensuring fiscal accountability within substance use and mental health grant programs.",
    ],
    substance_mental_health_fund: [
        "Addressing the nation's mental health and addiction crises requires significantly increased investment in prevention, treatment, and recovery.",
        "Expanding access to affordable mental healthcare and substance use disorder services, especially in underserved areas.",
        "Investing in the behavioral health workforce and integrating mental/physical care are critical steps.",
        "Supporting crisis response systems (like the 988 hotline) requires adequate federal resources.",
    ],
    substance_mental_health_review: [
        "Improving coordination among agencies involved in mental health and substance use is key to effective service delivery.",
        "Enforcing mental health parity laws ensures equitable insurance coverage.",
        "Evaluating the effectiveness of different treatment models helps optimize the use of public funds.",
        "Reducing stigma associated with seeking mental health or substance use treatment requires ongoing effort.",
    ],
    // --- War and Weapons ---
    pentagon_cut: [
        "The immense Pentagon budget demands significant reduction, focusing on genuine defense needs over wasteful projects.",
        "A thorough audit of Pentagon spending is essential to identify inefficiencies and save taxpayer dollars.",
        "Shifting funds from unproven weapons systems towards readiness and personnel could strengthen defense more effectively.",
        "Reducing the Pentagon's budget would free up critical resources for pressing domestic needs.",
    ],
    pentagon_fund: [ // Often framed as 'modernization' or 'readiness'
        "Maintaining a strong national defense in a complex world requires sufficient funding for personnel, training, and modernization.",
        "Investing in advanced military capabilities is necessary to deter adversaries and protect U.S. interests.",
        "Ensuring our troops have the best equipment and support is vital for mission success.",
        "Predictable defense funding enhances strategic planning and readiness.",
    ],
    pentagon_review: [
        "Rigorous oversight of Pentagon spending is crucial to prevent waste, fraud, and abuse.",
        "Reforming the Pentagon's acquisition process is needed to control costs and deliver capabilities faster.",
        "Regularly reassessing strategic priorities ensures the military is optimized for current threats, not past ones.",
        "Improving transparency and accountability in all defense spending is paramount.",
    ],
    pentagon_contractors_cut: [
        "Over-reliance on expensive defense contractors inflates costs and requires stricter oversight and reduced outsourcing.",
        "Billions could be saved by bringing more functions currently performed by contractors back in-house.",
        "Requiring more competition and fixed-price contracts for defense services protects taxpayer interests.",
        "The revolving door between the Pentagon and defense contractors warrants scrutiny and reform.",
    ],
    pentagon_contractors_review: [
        "Enhancing transparency in defense contracting, including performance and cost data, is essential.",
        "Implementing stronger mechanisms to prevent waste and fraud in defense contracts.",
        "Evaluating the cost-effectiveness of outsourcing versus using government personnel for specific functions.",
        "Ensuring contractor performance meets rigorous standards and provides value for money.",
    ],
    pentagon_personnel_cut: [
        "While supporting troops is vital, reviewing personnel costs for efficiencies in areas like healthcare administration or redundant basing.",
        "Optimizing military force structure could potentially yield savings in personnel costs.",
        "Balancing personnel compensation with investments in training and equipment requires careful management.",
    ],
    pentagon_personnel_fund: [
        "Attracting and retaining skilled military personnel necessitates competitive pay, benefits, and quality family support.",
        "Investing in the well-being and readiness of service members is crucial for an effective all-volunteer force.",
        "Adequate funding for military personnel accounts directly impacts morale, retention, and national security.",
        "Ensuring high-quality healthcare and housing for military members and their families is a necessary cost.",
    ],
    pentagon_personnel_review: [
        "Regularly reviewing military compensation packages to ensure competitiveness.",
        "Improving access to quality healthcare, mental health services, and childcare for military families.",
        "Streamlining personnel management processes to reduce administrative burdens.",
        "Focusing on programs that genuinely support service member well-being and readiness.",
    ],
    pentagon_top5_contractors_cut: [ // Specific focus on largest contractors
        "The heavy concentration of defense contracts among a few large firms warrants action to promote greater competition.",
        "Reducing the share of contracts flowing to the top 5 defense corporations could foster a more diverse industrial base.",
        "Increased scrutiny is needed on contracts awarded to the largest defense firms to ensure taxpayers receive fair value.",
        "Breaking up the excessive influence of the largest defense contractors on policy and spending.",
    ],
    pentagon_top5_contractors_review: [
        "The relationship between the Pentagon and its largest contractors needs close oversight to prevent undue influence.",
        "Evaluating the strategic risks of relying heavily on a small number of dominant defense firms.",
        "Promoting opportunities for smaller, innovative companies in the defense sector.",
        "Ensuring mergers among large defense contractors do not further reduce competition.",
    ],
    nuclear_weapons_cut: [
        "The exorbitant cost of maintaining and modernizing a vast nuclear arsenal should be sharply curtailed.",
        "Reducing reliance on nuclear weapons and pursuing arms control could save billions and enhance global security.",
        "Questioning the necessity of specific, costly nuclear modernization programs like the Sentinel ICBM.",
        "Shifting resources from nuclear weapons to conventional deterrence or pressing domestic needs.",
    ],
    nuclear_weapons_fund: [ // Often framed as 'modernization' or 'deterrence'
        "Proponents argue modernizing the nuclear triad is essential for strategic deterrence.",
        "Ensuring the safety, security, and reliability of the existing nuclear stockpile requires ongoing investment.",
        "Maintaining a credible nuclear deterrent is seen by some as vital in a world with nuclear-armed adversaries.",
    ],
    nuclear_weapons_review: [
        "The long-term costs and strategic rationale for all nuclear modernization programs require rigorous congressional review.",
        "Ensuring robust command, control, and safety measures for the nuclear arsenal necessitates continuous oversight.",
        "Balancing investments in nuclear deterrence with conventional forces and diplomacy.",
        "Pursuing arms control negotiations to reduce nuclear risks globally.",
    ],
    foreign_military_aid_cut: [
        "U.S. foreign military aid often fuels conflicts and diverts resources from domestic needs; it should be sharply reduced.",
        "Providing weapons abroad can entangle the U.S. in foreign disputes with unintended consequences.",
        "Reallocating funds from foreign military aid to diplomacy or development assistance would be wiser.",
        "Conditioning all military aid strictly on human rights and accountability.",
    ],
    foreign_military_aid_fund: [ // Often framed as 'strategic interest'
        "Strategic foreign military aid can strengthen key allies and enhance regional stability.",
        "Security assistance helps partner nations defend themselves and counter shared threats like terrorism.",
        "Military aid can be a tool to build relationships and advance U.S. interests abroad.",
    ],
    foreign_military_aid_review: [
        "All foreign military aid must be subject to strict conditions regarding human rights and democratic governance.",
        "The effectiveness and strategic rationale for each military aid package require constant evaluation.",
        "Transparency regarding the specific uses and impacts of U.S. military aid is essential.",
        "Balancing military aid with diplomatic and economic tools in foreign policy.",
    ],
    israel_wars_cut: [ // More specific version of foreign_military_aid_cut
        "Unconditional military aid to specific nations, like Israel, drains U.S. resources and can enable controversial actions.",
        "The level of military funding provided to Israel warrants scrutiny compared to domestic needs.",
        "Conditioning military aid to Israel on compliance with international law and U.S. policy goals.",
        "Reassessing the strategic benefits versus the costs and risks of extensive military aid to Israel.",
    ],
     israel_wars_fund: [ // Specific version of foreign_military_aid_fund
        "Proponents view supporting Israel's security through military aid as a key U.S. policy pillar in the Middle East.",
        "Funding for systems like Iron Dome enhances Israeli defense against regional threats.",
        "Security assistance to Israel is often framed as mutually beneficial for intelligence sharing and defense innovation.",
    ],
     israel_wars_review: [
        "The impact of U.S. military aid to Israel on regional stability and the Israeli-Palestinian conflict requires critical assessment.",
        "Transparency regarding the specific uses of U.S. military aid by Israel is crucial.",
        "Balancing the security partnership with Israel against broader U.S. interests and values in the region.",
        "Ensuring U.S.-provided weapons are used in accordance with international law.",
    ],
    f35_cut: [
        "The F-35 program's staggering cost overruns and persistent performance issues warrant significant funding cuts.",
        "Reducing the total number of F-35s procured could save billions for other priorities.",
        "Continuing massive funding for the F-35 without addressing affordability and reliability is fiscally irresponsible.",
        "Exploring more cost-effective aircraft alternatives for certain mission sets.",
    ],
    f35_review: [
        "Rigorous, independent testing of the F-35's performance, maintenance costs, and combat effectiveness is crucial.",
        "Holding Lockheed Martin accountable for meeting F-35 cost and performance targets.",
        "Ensuring the F-35 program delivers the promised capabilities at an acceptable cost.",
        "Considering the long-term sustainment costs of the F-35 fleet.",
    ],
    pentagon_spacex_cut: [ // Similar to NASA_SpaceX_cut, but DoD focus
        "Pentagon contracts with profitable private space companies like SpaceX need stronger justification regarding unique value.",
        "Ensuring fair competition in national security space launches, avoiding over-reliance on one provider.",
        "Questioning the need to subsidize established commercial space ventures with defense contracts.",
        "Demanding greater transparency on the cost and terms of Pentagon-SpaceX contracts.",
    ],
    pentagon_spacex_review: [
        "Contracts awarded to SpaceX require robust oversight for performance, cost control, and security.",
        "Transparency regarding the terms and value of Pentagon contracts with commercial space companies.",
        "Assessing the long-term strategy for utilizing commercial partners for national security space missions.",
        "Ensuring competition is maintained in the national security launch market.",
    ],
    pentagon_dei_cut: [
        "Funding for Pentagon DEI initiatives should be evaluated for effectiveness, ensuring demonstrable contribution to readiness.",
        "Resources allocated to DEI programs must be justified based on clear objectives and outcomes.",
        "Ensuring DEI efforts focus on equal opportunity and merit, not divisive identity politics.",
        "Preventing DEI programs from becoming overly bureaucratic or detracting from core mission focus.",
    ],
    pentagon_dei_fund: [ // Often framed as enhancing readiness/talent pool
        "Well-implemented DEI initiatives can enhance military readiness by attracting diverse talent and fostering teamwork.",
        "Promoting an inclusive environment strengthens the Armed Forces by ensuring fair treatment for all.",
        "Addressing discrimination or bias through DEI programs contributes to unit cohesion.",
    ],
    pentagon_dei_review: [
        "The goals, metrics, and costs of Pentagon DEI programs require clear definition and congressional oversight.",
        "Ensuring DEI training is evidence-based and genuinely contributes to a more effective military.",
        "Balancing DEI goals with the military's primary mission of national defense.",
        "Guaranteeing DEI initiatives uphold principles of meritocracy and equal opportunity.",
    ],
    // --- Veterans ---
    va_cut: [
        "While supporting veterans, the VA system needs continuous efforts to improve efficiency and reduce bureaucracy.",
        "Modernizing VA operations and IT systems could allow resources to focus more directly on veteran care.",
        "Ensuring accountability and eliminating wasteful spending within the VA maximizes fund effectiveness.",
        "Streamlining VA service delivery without compromising quality of care.",
    ],
    va_fund: [
        "Fulfilling our nation's promise to veterans requires robust funding for VA healthcare, mental health, and benefits.",
        "Investing in the VA system, including expanding access and reducing wait times, meets veterans' complex needs.",
        "Adequate funding for VA benefits like the GI Bill and housing assistance helps veterans thrive.",
        "Supporting VA research contributes to advancements in veteran healthcare.",
    ],
    va_review: [
        "Improving the timeliness and accuracy of VA disability claims processing remains critical.",
        "Enhancing mental healthcare access and suicide prevention programs for veterans must be a top VA priority.",
        "Ensuring seamless coordination between the VA and DoD for transitioning service members.",
        "Modernizing VA facilities and infrastructure to provide state-of-the-art care.",
    ],
    pact_act_fund: [ // PACT Act focus is generally on funding/implementation
        "Fully funding and effectively implementing the PACT Act is essential for veterans exposed to toxins.",
        "Ensuring the VA has resources to process PACT Act claims efficiently and provide specialized care.",
        "Outreach efforts to inform eligible veterans about PACT Act benefits require adequate support.",
        "Investing in research on toxic exposure health effects, funded through the PACT Act.",
    ],
    pact_act_review: [
        "Monitoring the VA's progress in implementing the PACT Act, including claims processing and access to care.",
        "Continued research into the long-term health effects of military toxic exposures.",
        "Ensuring healthcare providers are knowledgeable about toxic exposure issues.",
        "Streamlining the process for veterans to access PACT Act benefits.",
    ],
    // --- Unemployment and Labor ---
    tanf_cut: [
        "TANF's effectiveness needs rigorous evaluation; funding should prioritize programs proven to move families out of poverty.",
        "Ensuring TANF work requirements are meaningful and supported by adequate job training.",
        "Reducing state flexibility to use TANF funds for unrelated purposes could improve focus.",
        "Evaluating whether TANF benefit levels create disincentives to work.",
    ],
    tanf_fund: [
        "Strengthening the safety net requires adequate TANF funding for vulnerable families facing hardship.",
        "Investing in TANF-funded job training and supportive services helps parents secure stable employment.",
        "Adjusting TANF benefit levels for inflation is necessary to provide meaningful assistance.",
        "Supporting TANF programs that address barriers to employment like childcare and transportation.",
    ],
    tanf_review: [
        "Evaluating the impact of TANF time limits and sanctions on family well-being.",
        "Improving data collection on TANF outcomes to assess program effectiveness.",
        "Ensuring TANF programs are responsive to the needs of diverse families.",
        "Strengthening TANF's role in poverty reduction and promoting economic mobility.",
    ],
    child_tax_credit_cut: [
        "The Child Tax Credit (CTC) structure should be reviewed for fiscal sustainability and effective targeting.",
        "Exploring modifications to the CTC, like strengthening work requirements or adjusting income limits.",
        "Balancing the CTC's poverty reduction impact against its overall cost.",
        "Considering whether CTC expansion contributes significantly to inflation.",
    ],
    child_tax_credit_fund: [ // Focus on expansion/permanence
        "Expanding the Child Tax Credit, especially for the lowest-income families, effectively reduces child poverty.",
        "Making recent CTC expansions permanent provides stability for working families.",
        "The CTC helps families cover rising costs, boosting local economies.",
        "Simplifying CTC claiming processes ensures eligible families receive the benefit.",
    ],
    child_tax_credit_review: [
        "Simplifying the process for eligible families to claim the CTC.",
        "Evaluating the CTC's impact on parental employment and family economic decisions.",
        "Ensuring the CTC interacts effectively with other safety net programs.",
        "Assessing the administrative costs versus the benefits delivered by the CTC.",
    ],
    refugee_assistance_cut: [
        "Refugee resettlement costs should be managed efficiently, focusing on rapid self-sufficiency.",
        "Ensuring adequate security screening alongside resettlement programs.",
        "Balancing humanitarian commitments with fiscal capacity and integration challenges.",
        "Exploring ways to increase private sponsorship or community support for refugees.",
    ],
    refugee_assistance_fund: [
        "Providing adequate resources for refugee resettlement reflects American humanitarian values.",
        "Investing in effective integration programs helps refugees become self-sufficient contributors.",
        "Supporting refugee assistance demonstrates U.S. leadership and compassion.",
        "Ensuring resettlement agencies have the resources to meet refugees' initial needs.",
    ],
    refugee_assistance_review: [
        "Improving coordination between federal agencies, resettlement organizations, and local communities.",
        "Evaluating the long-term outcomes of refugees resettled in the U.S.",
        "Ensuring resettlement programs are adequately resourced to handle fluctuating arrivals.",
        "Streamlining the process for refugees to obtain work authorization.",
    ],
    liheap_cut: [
        "LIHEAP funding should target the most vulnerable households, with strong verification.",
        "Encouraging energy efficiency alongside bill assistance provides more sustainable solutions.",
        "Ensuring LIHEAP funds supplement, not replace, individual responsibility.",
        "Reviewing LIHEAP administrative costs for potential savings.",
    ],
    liheap_fund: [
        "LIHEAP is crucial for preventing dangerous energy shutoffs for vulnerable households.",
        "Adequate LIHEAP funding provides a vital safety net against energy poverty.",
        "Supporting LIHEAP weatherization programs helps low-income households reduce energy costs permanently.",
        "Increased LIHEAP funding is needed due to rising energy prices.",
    ],
    liheap_review: [
        "Streamlining the LIHEAP application process improves access for eligible households.",
        "Ensuring equitable distribution of LIHEAP funds based on need and climate.",
        "Coordinating LIHEAP with other utility assistance and efficiency programs maximizes impact.",
        "Evaluating the effectiveness of LIHEAP in preventing energy crises.",
    ],
    nlrb_cut: [
        "The NLRB's actions sometimes face criticism regarding fairness; its funding and authority warrant review.",
        "Ensuring the NLRB applies labor laws impartially and efficiently.",
        "Evaluating whether the NLRB's structure is suited to the modern economy.",
        "Questioning the necessity of certain NLRB enforcement actions.",
    ],
    nlrb_fund: [
        "Protecting workers' rights to organize and bargain collectively requires a fully funded NLRB.",
        "Adequate resources allow the NLRB to investigate charges promptly and remedy violations.",
        "A strong NLRB is essential for maintaining a balance between employers and employees.",
        "Funding the NLRB ensures fair labor practices are upheld.",
    ],
    nlrb_review: [
        "Improving the speed and efficiency of NLRB case processing.",
        "Ensuring NLRB decisions are consistent and well-reasoned.",
        "Adapting NLRB rules to address challenges in the modern workforce (e.g., gig economy).",
        "Maintaining the NLRB's independence and impartiality.",
    ],
    // --- Education ---
    dept_education_cut: [
        "The federal role in education should be limited, avoiding bureaucratic overreach and respecting local control.",
        "Consolidating duplicative programs within the Department of Education could yield savings.",
        "Evaluating the effectiveness of federal education mandates is necessary.",
        "Reducing the administrative burden associated with federal education grants.",
    ],
    dept_education_fund: [
        "Investing in education at all levels is crucial for opportunity and economic growth.",
        "The Department of Education plays a vital role in promoting equity and ensuring civil rights in schools.",
        "Adequate federal funding is necessary to support key education initiatives, especially for disadvantaged students.",
        "Supporting research and innovation in education through federal grants.",
    ],
    dept_education_review: [
        "Simplifying federal grant applications for schools and colleges.",
        "Improving data collection on the outcomes of federal education programs.",
        "Ensuring effective enforcement of civil rights laws in education.",
        "Strengthening the Department's oversight of federal student aid programs.",
    ],
    college_aid_cut: [
        "Federal college aid programs need reform to address soaring tuition costs, not just subsidize them.",
        "Exploring ways to simplify federal student aid and better target it based on need.",
        "Holding colleges more accountable for student outcomes and controlling administrative costs.",
        "Questioning the effectiveness of current student loan programs and seeking alternatives.",
    ],
    college_aid_fund: [
        "Expanding access to affordable higher education requires increased funding for Pell Grants and work-study.",
        "Reducing the burden of student loan debt supports economic security and mobility.",
        "Simplifying the FAFSA application makes it easier for students to access aid.",
        "Investing in programs that support college completion, not just enrollment.",
    ],
    college_aid_review: [
        "Reviewing student loan interest rates, repayment options, and servicing practices.",
        "Evaluating the effectiveness of different types of college aid.",
        "Ensuring federal aid programs support quality institutions and protect students.",
        "Strengthening oversight of for-profit colleges receiving federal aid.",
    ],
    k12_schools_cut: [
        "Federal K-12 funding should primarily supplement state/local efforts, focusing on national priorities.",
        "Reducing federal mandates and returning control over education policy to states and districts.",
        "Consolidating overlapping federal K-12 grant programs could increase efficiency.",
        "Evaluating the actual impact of federal K-12 spending on student achievement.",
    ],
    k12_schools_fund: [
        "Targeted federal funding for K-12 schools is crucial for supporting under-resourced districts and vulnerable students (IDEA, Title I).",
        "Investing in programs supporting teachers, school infrastructure, and technology improves educational quality.",
        "Federal support plays a key role in promoting educational equity.",
        "Funding programs that address learning loss and support student mental health.",
    ],
    k12_schools_review: [
        "Ensuring federal K-12 funds effectively improve outcomes, especially for disadvantaged groups.",
        "Evaluating the impact of federal education laws on local school districts.",
        "Promoting innovation and evidence-based practices in K-12 education.",
        "Strengthening support for students with disabilities and English language learners.",
    ],
    cpb_cut: [
        "In today's diverse media landscape, federal funding for the Corporation for Public Broadcasting faces scrutiny.",
        "Questions about political bias sometimes lead to calls for reducing CPB subsidies.",
        "Phasing out federal support could encourage public broadcasters to rely more on private donations.",
        "Evaluating the necessity of CPB funding compared to other pressing needs.",
    ],
    cpb_fund: [ // Focus on public service mission
        "CPB provides essential funding for quality educational programming and objective news accessible to all.",
        "Public broadcasting serves underserved communities and offers a vital non-commercial alternative.",
        "Federal support ensures the independence and reach of public radio and television.",
        "CPB funding supports local stations that provide valuable community services.",
    ],
    cpb_review: [
        "Ensuring CPB funding distribution is fair, transparent, and supports diverse programming.",
        "Evaluating mechanisms for maintaining editorial independence in public broadcasting.",
        "Assessing public broadcasting's role and adaptation in the digital age.",
        "Strengthening oversight of how CPB funds are used by local stations.",
    ],
    imls_cut: [
        "While libraries/museums are valuable, federal IMLS funding could potentially be reduced, shifting responsibility elsewhere.",
        "Prioritizing IMLS grants towards programs with the broadest impact or serving the most underserved.",
        "Evaluating the specific outcomes achieved through IMLS funding.",
        "Considering whether IMLS functions could be absorbed by other agencies.",
    ],
    imls_fund: [
        "IMLS provides crucial federal support for libraries and museums, enabling vital educational resources and community programs.",
        "IMLS funding helps libraries bridge the digital divide and supports museums in preserving cultural heritage.",
        "Federal support through IMLS leverages state/local funding, strengthening these community institutions.",
        "IMLS grants support innovation and adaptation in library and museum services.",
    ],
    imls_review: [
        "Ensuring IMLS grants are accessible to institutions of all sizes, including rural/underserved areas.",
        "Focusing IMLS initiatives on key priorities like digital literacy and workforce development.",
        "Improving data collection on the impact of IMLS-funded programs.",
        "Strengthening IMLS's role in promoting information access and lifelong learning.",
    ],
    // --- Food and Agriculture ---
    snap_cut: [
        "Reforming SNAP (food stamps) to strengthen work requirements and improve program integrity could lead to savings.",
        "Ensuring SNAP benefits are used for nutritious food items warrants consideration.",
        "Tightening SNAP eligibility requires balancing fiscal concerns and food security.",
        "Reducing SNAP fraud and abuse through better verification methods.",
    ],
    snap_fund: [
        "SNAP is the nation's most effective anti-hunger program and should be fully funded.",
        "Strengthening SNAP benefits reduces food insecurity and improves health outcomes.",
        "Maintaining broad SNAP eligibility is crucial, especially during economic downturns.",
        "SNAP benefits provide significant economic stimulus to local communities.",
    ],
    snap_review: [
        "Simplifying the SNAP application process improves access for eligible households.",
        "Improving SNAP Employment & Training programs to connect recipients with jobs.",
        "Ensuring SNAP benefit levels reflect the actual cost of a nutritious diet.",
        "Using technology to make SNAP benefits easier to access and use.",
    ],
    school_lunch_cut: [
        "Reviewing nutritional standards and administrative costs of the School Lunch Program for efficiencies.",
        "Ensuring school meal programs target assistance effectively to low-income students.",
        "Exploring partnerships or alternative models for providing nutritious school meals.",
        "Balancing meal quality with program cost requires careful management.",
    ],
    school_lunch_fund: [
        "Expanding access to free school meals ensures children have the nutrition needed to learn.",
        "Investing in universal free school meals reduces stigma and improves student health.",
        "Supporting programs using fresh, locally sourced foods in school meals enhances quality.",
        "Adequate funding allows schools to meet nutritional standards and cover rising food costs.",
    ],
    school_lunch_review: [
        "Improving the nutritional quality and appeal of school meals to increase participation.",
        "Streamlining the application process for free/reduced-price meals.",
        "Ensuring adequate funding for schools to meet updated nutritional standards.",
        "Reducing food waste within school meal programs.",
    ],
    fsa_cut: [
        "Reforming farm subsidies administered by the Farm Service Agency (FSA) is needed to reduce market distortions.",
        "Limiting FSA payments to large agricultural corporations and better targeting support to small farmers.",
        "Phasing out certain commodity support programs could save taxpayer money.",
        "Shifting FSA resources from subsidies towards conservation programs.",
    ],
    fsa_fund: [
        "The FSA provides crucial support for farmers, including credit, disaster aid, and conservation programs.",
        "Adequate funding for FSA loan programs helps beginning and underserved farmers access capital.",
        "Investing in FSA conservation programs protects natural resources.",
        "FSA programs help ensure a stable food supply and support rural economies.",
    ],
    fsa_review: [
        "Improving the accessibility of FSA programs for small, mid-sized, and minority farmers.",
        "Ensuring FSA disaster assistance is timely and effective.",
        "Evaluating the effectiveness of commodity support versus conservation incentives.",
        "Modernizing FSA technology and service delivery.",
    ],
    wic_cut: [
        "While valuable, reviewing WIC's administrative costs for efficiency is prudent.",
        "Targeting WIC benefits effectively to those most nutritionally at risk.",
        "Coordinating WIC services with other maternal/child health programs to reduce duplication.",
        "Ensuring WIC food packages offer the best nutritional value for cost.",
    ],
    wic_fund: [
        "WIC provides critical nutritional support for low-income pregnant women, mothers, and young children, improving health outcomes.",
        "Fully funding WIC ensures all eligible participants receive benefits, reducing infant mortality and supporting healthy development.",
        "Investing in WIC is a cost-effective way to improve long-term health.",
        "WIC's nutrition education and breastfeeding support components are highly valuable.",
    ],
    wic_review: [
        "Modernizing WIC food packages to align with current dietary guidelines.",
        "Improving the WIC shopping experience through enhanced EBT systems.",
        "Strengthening WIC's role in providing nutrition education and healthcare referrals.",
        "Increasing WIC participation rates among eligible populations.",
    ],
    // --- Government Operations ---
    fdic_review: [ // FDIC is funded by bank premiums, not direct taxes - focus on oversight/effectiveness
        "Ensuring the FDIC effectively manages the deposit insurance fund and regulates banks.",
        "Maintaining public confidence requires demonstrating the FDIC's independence and financial strength.",
        "Evaluating the adequacy of FDIC resources to handle potential bank failures.",
        "Assessing the FDIC's role in addressing emerging risks in the financial system.",
    ],
    irs_cut: [
        "IRS funding should prioritize efficient tax administration and taxpayer service, avoiding burdensome enforcement.",
        "Concerns about IRS overreach sometimes lead to calls for budget constraints.",
        "Simplifying the tax code itself could be more effective than just increasing IRS enforcement.",
        "Ensuring IRS resources are used fairly and not politically motivated.",
    ],
    irs_fund: [
        "Adequate IRS funding is essential to close the 'tax gap' and ensure fairness.",
        "Investing in IRS modernization improves efficiency and taxpayer service.",
        "Effective IRS enforcement targeting high-income non-compliance yields significant revenue returns.",
        "Providing the IRS resources to combat sophisticated tax evasion schemes.",
    ],
    irs_review: [
        "Ensuring the IRS uses its resources fairly requires strong congressional oversight.",
        "Improving IRS taxpayer service, including phone support and online tools.",
        "Protecting taxpayer rights and ensuring due process during audits.",
        "Focusing IRS enforcement efforts on areas with the highest rates of non-compliance.",
    ],
    federal_courts_cut: [
        "Reviewing federal court operations for efficiencies in case management and administration.",
        "Exploring alternatives to litigation might reduce court caseloads.",
        "Careful budgeting is necessary, but must not compromise the judiciary's ability to function.",
    ],
    federal_courts_fund: [
        "A well-functioning judiciary requires sufficient funding for judgeships, staff, security, and technology.",
        "Investing in the federal courts ensures access to justice and upholds the rule of law.",
        "Adequate resources are needed to protect judges and maintain secure facilities.",
        "Funding technology upgrades enhances court efficiency and public access.",
    ],
    federal_courts_review: [
        "Addressing judicial vacancies to reduce case backlogs.",
        "Improving access to the courts for low-income individuals.",
        "Modernizing court technology and electronic filing systems.",
        "Ensuring the judiciary remains independent and impartial.",
    ],
    public_defenders_fund: [ // Focus is almost always on underfunding
        "Ensuring the constitutional right to counsel requires adequate funding for federal public defenders.",
        "Underfunded public defense systems compromise the quality of representation.",
        "Investing in public defense ensures fairness in the justice system.",
        "Addressing high caseloads requires increased resources for public defenders.",
    ],
    public_defenders_review: [
        "Addressing high caseloads and ensuring defenders have resources for investigations.",
        "Promoting pay parity between public defenders and prosecutors.",
        "Evaluating models for providing indigent defense in federal court.",
        "Supporting training and professional development for public defenders.",
    ],
    usps_review: [ // USPS is largely self-funded but faces mandates/challenges - focus on reform/oversight
        "Reviewing congressional mandates, like retiree health pre-funding, that impact USPS finances.",
        "Supporting USPS modernization efforts and adjustments to service standards.",
        "Allowing USPS diversification of revenue streams warrants consideration.",
        "Ensuring the Postal Service can fulfill its universal service obligation sustainably.",
    ],
    cfpb_cut: [
        "The CFPB's broad authority and funding structure warrant scrutiny regarding accountability.",
        "Concerns about CFPB regulations being overly burdensome on financial institutions.",
        "Ensuring the CFPB focuses on clear consumer harm, avoiding regulatory overreach.",
        "Limiting the CFPB's power or budget is sometimes proposed.",
    ],
    cfpb_fund: [
        "The CFPB plays a vital role in protecting consumers from predatory financial practices.",
        "Strong CFPB enforcement returns billions to harmed consumers and deters misconduct.",
        "Funding CFPB's consumer education helps empower individuals financially.",
        "Adequate resources allow the CFPB to supervise financial institutions effectively.",
    ],
    cfpb_review: [
        "Ensuring the CFPB's rulemaking process is transparent and data-driven.",
        "Improving coordination between the CFPB and other financial regulators.",
        "Evaluating the effectiveness of CFPB enforcement and education programs.",
        "Maintaining the CFPB's independence to protect consumers.",
    ],
    mbda_cut: [
        "Evaluating the MBDA's effectiveness compared to broader small business support programs.",
        "Ensuring MBDA programs deliver measurable results in promoting minority business growth.",
        "Consolidating business development programs could potentially increase efficiency.",
    ],
    mbda_fund: [
        "The MBDA plays a unique role in addressing systemic barriers for minority-owned businesses.",
        "Investing in MBDA programs helps create jobs and build wealth in underserved communities.",
        "Expanding MBDA's reach can help close the persistent racial wealth gap.",
        "Supporting MBDA strengthens the overall economy through diversity.",
    ],
    mbda_review: [
        "Improving access to capital and federal contracting for minority-owned businesses via MBDA.",
        "Strengthening partnerships between MBDA and other agencies/private sector.",
        "Enhancing data collection on minority-owned businesses to inform MBDA strategies.",
        "Ensuring MBDA programs are effectively targeted and managed.",
    ],
    usich_review: [ // Funding is very small - focus on effectiveness/coordination
        "Evaluating USICH's effectiveness in coordinating federal efforts to end homelessness.",
        "Ensuring USICH's role complements, rather than duplicates, HUD's work.",
        "Strengthening USICH's ability to promote evidence-based practices like Housing First.",
        "Improving coordination between federal efforts and state/local homelessness systems.",
    ],
    // --- Housing and Community ---
    fema_cut: [
        "FEMA's disaster response requires review for efficiency in administration and aid delivery.",
        "Ensuring FEMA funds prioritize immediate life-saving needs while minimizing fraud.",
        "Balancing federal disaster aid with state/local preparedness efforts.",
        "Scrutinizing FEMA contracting practices for cost-effectiveness.",
    ],
    fema_fund: [
        "Increasing disaster frequency requires robust FEMA funding for response, recovery, and mitigation.",
        "Investing in FEMA's capacity provides timely assistance to disaster survivors.",
        "Supporting FEMA's pre-disaster mitigation programs reduces long-term costs.",
        "Ensuring FEMA has the resources to handle large-scale disasters effectively.",
    ],
    fema_review: [
        "Improving the speed and accessibility of FEMA's individual assistance programs.",
        "Strengthening FEMA's coordination with state, local, and tribal governments.",
        "Ensuring FEMA programs promote resilience and address climate impacts.",
        "Increasing transparency in FEMA spending and decision-making.",
    ],
    fema_drf_fund: [ // Specific fund within FEMA - focus is usually on adequate balance
        "Maintaining a sufficiently funded Disaster Relief Fund (DRF) is crucial for immediate disaster response.",
        "Predictable and adequate DRF funding provides stability for disaster planning.",
        "Replenishing the DRF proactively ensures resources are available when needed.",
        "Ensuring the DRF can cover the costs of increasingly frequent and severe disasters.",
    ],
    fema_drf_review: [
        "Improving transparency regarding DRF spending and obligations.",
        "Ensuring DRF funding formulas are equitable and based on actual disaster needs.",
        "Evaluating the long-term solvency of the DRF given rising disaster costs.",
        "Streamlining processes for accessing DRF funds for recovery projects.",
    ],
    hud_cut: [
        "HUD programs need review for effectiveness in addressing the affordable housing crisis.",
        "Streamlining HUD bureaucracy and reducing burdensome regulations.",
        "Evaluating the cost-effectiveness of different HUD programs (vouchers vs. development).",
        "Encouraging more private sector involvement in affordable housing.",
    ],
    hud_fund: [
        "Tackling the affordable housing crisis requires significant investment in HUD programs like rental assistance.",
        "Expanding HUD resources is essential for reducing homelessness and promoting housing stability.",
        "Investing in affordable housing development through HUD stimulates local economies.",
        "Funding HUD programs that support community development and fair housing.",
    ],
    hud_review: [
        "Improving the efficiency of HUD's rental assistance programs to serve more families.",
        "Addressing the large capital backlog in public housing requires sustained investment.",
        "Ensuring HUD programs effectively promote fair housing and reduce segregation.",
        "Strengthening HUD oversight of grantees and program performance.",
    ],
    head_start_cut: [
        "Head Start programs should be rigorously evaluated for long-term impact.",
        "Improving quality standards and accountability across all Head Start centers.",
        "Ensuring Head Start funding complements, not duplicates, state pre-K programs.",
        "Focusing Head Start resources on the most effective interventions.",
    ],
    head_start_fund: [
        "Head Start provides critical comprehensive early childhood services, improving school readiness.",
        "Expanding access to high-quality Head Start, especially Early Head Start, is vital.",
        "Adequate funding allows Head Start to maintain quality standards and comprehensive services.",
        "Head Start demonstrably improves long-term outcomes for low-income children.",
    ],
    head_start_review: [
        "Strengthening Head Start performance standards and ensuring consistent quality.",
        "Improving coordination between Head Start and K-12 school systems.",
        "Enhancing support for Head Start staff, including pay and professional development.",
        "Focusing Head Start on evidence-based practices in early childhood education.",
    ],
    public_housing_cut: [
        "The traditional public housing model faces challenges; exploring alternatives is needed.",
        "Improving management efficiency and safety in existing public housing.",
        "Shifting towards housing vouchers is sometimes proposed as more cost-effective.",
        "Addressing the root causes of issues within public housing developments.",
    ],
    public_housing_fund: [
        "Addressing the significant capital repair backlog in public housing is crucial for resident safety.",
        "Investing in the preservation and modernization of public housing keeps it available.",
        "Funding is needed to support resident services and improve management.",
        "Public housing provides deeply affordable homes for very low-income households.",
    ],
    public_housing_review: [
        "Implementing effective strategies to address crime and improve safety.",
        "Promoting resident involvement and empowerment in management.",
        "Exploring mixed-finance models to revitalize public housing communities.",
        "Ensuring public housing is well-maintained and provides decent living conditions.",
    ],
    // --- Energy and Environment ---
    epa_cut: [
        "EPA regulations should balance environmental goals with economic burdens.",
        "Streamlining EPA permitting processes is needed.",
        "Evaluating the cost-effectiveness of specific EPA regulations.",
        "Ensuring the EPA relies on sound science and transparent data.",
    ],
    epa_fund: [
        "Addressing critical environmental challenges requires a well-funded EPA.",
        "Investing in EPA enforcement ensures environmental laws are upheld.",
        "Supporting EPA's scientific research provides the basis for sound policy.",
        "Funding EPA programs that protect air and water quality is essential for public health.",
    ],
    epa_review: [
        "Improving the timeliness of EPA's permitting and regulatory reviews.",
        "Ensuring EPA regulations reflect the best available science.",
        "Strengthening EPA's capacity to address environmental justice issues.",
        "Enhancing EPA transparency and public participation in rulemaking.",
    ],
    forest_service_cut: [
        "Reviewing Forest Service operations for efficiencies in timber management and administration.",
        "Balancing environmental protection with economic uses of national forests.",
        "Prioritizing Forest Service resources towards critical wildfire prevention.",
        "Ensuring cost-effectiveness in Forest Service land management activities.",
    ],
    forest_service_fund: [
        "Increased Forest Service funding is needed to address the escalating wildfire crisis.",
        "Investing in the health of national forests protects watersheds and biodiversity.",
        "Adequate resources allow sustainable management of national forests.",
        "Supporting federal wildland firefighters with better pay and resources.",
    ],
    forest_service_review: [
        "Improving the pace and scale of hazardous fuels treatments.",
        "Strengthening partnerships for wildfire response and forest management.",
        "Ensuring adequate compensation and support for wildland firefighters.",
        "Using the best available science to guide forest restoration efforts.",
    ],
    noaa_cut: [
        "Evaluating NOAA programs for potential duplication with other agencies.",
        "Prioritizing NOAA resources towards core functions like weather forecasting.",
        "Ensuring efficiency in NOAA's satellite and research vessel operations.",
        "Considering whether certain NOAA functions could be handled by the private sector.",
    ],
    noaa_fund: [
        "NOAA provides essential services like weather forecasts, climate data, and fisheries management.",
        "Investing in NOAA's weather prediction capabilities protects lives and property.",
        "Supporting NOAA's research on oceans and climate is critical.",
        "Funding NOAA helps ensure sustainable management of marine resources.",
    ],
    noaa_review: [
        "Improving the accuracy and lead time of NOAA weather forecasts.",
        "Enhancing NOAA's role in supporting coastal resilience.",
        "Ensuring sustainable fisheries management based on NOAA science.",
        "Modernizing NOAA's observation systems (satellites, buoys).",
    ],
    renewable_energy_cut: [
        "Government subsidies for mature renewable energy technologies should be phased out.",
        "Focusing federal energy R&D on breakthrough technologies, not subsidizing existing ones.",
        "Evaluating the cost-effectiveness of specific DOE renewable energy programs.",
        "Allowing market forces to drive renewable energy deployment.",
    ],
    renewable_energy_fund: [
        "Accelerating the clean energy transition requires federal investment in renewables and efficiency.",
        "Supporting renewable energy programs creates jobs and reduces emissions.",
        "Investing in grid modernization is crucial for integrating more renewables.",
        "Funding research into next-generation renewable technologies and storage.",
    ],
    renewable_energy_review: [
        "Ensuring federal renewable energy programs effectively drive innovation.",
        "Improving permitting processes for renewable energy projects.",
        "Targeting investments towards advanced renewable technologies.",
        "Analyzing the grid impacts of increasing renewable energy penetration.",
    ],
    nps_cut: [
        "Reviewing National Park Service (NPS) operations for efficiencies.",
        "Exploring increased reliance on visitor fees or private partnerships for NPS.",
        "Prioritizing NPS resources towards deferred maintenance and core preservation.",
        "Balancing visitor access with resource protection requires careful budget choices.",
    ],
    nps_fund: [
        "Protecting America's natural heritage requires adequate NPS funding to manage parks.",
        "Addressing the significant deferred maintenance backlog in National Parks.",
        "Investing in our National Parks preserves resources and supports local economies.",
        "Providing sufficient resources for NPS staff (rangers, maintenance).",
    ],
    nps_review: [
        "Developing sustainable solutions for the NPS deferred maintenance backlog.",
        "Managing increasing visitor numbers to prevent resource damage.",
        "Enhancing interpretation and education programs in parks.",
        "Improving infrastructure within National Parks.",
    ],
    // --- International Affairs ---
    diplomacy_cut: [
        "Reviewing State Department operations for efficiencies and consolidating posts.",
        "Evaluating the necessity and cost-effectiveness of all diplomatic programs.",
        "Balancing investments in diplomacy with defense and development aid.",
        "Ensuring diplomatic resources align with core foreign policy objectives.",
    ],
    diplomacy_fund: [
        "Robust funding for diplomacy strengthens U.S. influence and promotes peace.",
        "Investing in our diplomatic corps provides the front line for global engagement.",
        "Supporting public diplomacy enhances mutual understanding.",
        "Effective diplomacy can often avoid the need for costlier military interventions.",
    ],
    diplomacy_review: [
        "Ensuring the State Department has resources to address complex global challenges.",
        "Modernizing diplomatic tools and communication strategies.",
        "Strengthening coordination between the State Department and other foreign affairs agencies.",
        "Supporting the professional development and security of Foreign Service officers.",
    ],
    usaid_cut: [
        "USAID programs require rigorous oversight for effectiveness and accountability.",
        "Focusing foreign aid on countries and sectors where it can achieve sustainable outcomes.",
        "Reducing administrative overhead within USAID.",
        "Ensuring foreign aid aligns clearly with U.S. strategic interests.",
    ],
    usaid_fund: [
        "U.S. foreign aid via USAID addresses global poverty, promotes health, and supports democracy.",
        "Investing in global development prevents conflicts and creates economic partners.",
        "Adequate USAID funding allows effective response to humanitarian crises.",
        "Supporting USAID advances both American values and interests abroad.",
    ],
    usaid_review: [
        "Improving measurement and reporting of USAID program outcomes.",
        "Strengthening local partnerships for sustainable development.",
        "Ensuring USAID programs have strong safeguards against corruption.",
        "Adapting USAID strategies to address emerging global challenges.",
    ],
    usaid_climate_cut: [ // Specific USAID area
        "International climate aid needs careful evaluation for effectiveness and verification.",
        "Prioritizing climate finance towards projects with the greatest impact.",
        "Ensuring transparency in how U.S. climate aid is used.",
        "Balancing international climate aid against pressing domestic needs.",
    ],
    usaid_climate_fund: [
        "Addressing the global climate crisis requires U.S. leadership, including supporting developing nations via USAID.",
        "International climate finance helps mitigate global emissions and fosters cooperation.",
        "Investing in climate adaptation abroad can reduce instability and migration.",
        "Supporting clean energy transitions in developing countries benefits global climate goals.",
    ],
    usaid_climate_review: [
        "Ensuring U.S. climate aid aligns with broader development goals.",
        "Improving coordination of climate finance across U.S. agencies.",
        "Developing robust monitoring and verification for international climate projects.",
        "Leveraging private sector investment for global climate solutions.",
    ],
    // --- Law Enforcement ---
    deportations_border_cut: [
        "Focusing border resources on humane processing and addressing root causes of migration may be more effective.",
        "Reviewing the cost and effectiveness of large-scale detention and deportation.",
        "Prioritizing enforcement actions based on public safety risks.",
        "Investing in technology and infrastructure at ports of entry for efficient processing.",
    ],
    deportations_border_fund: [
        "Securing borders requires adequate resources for CBP personnel, technology, and infrastructure.",
        "Funding for ICE is needed for interior enforcement and managing removal proceedings.",
        "Investing in border security helps maintain national sovereignty.",
        "Providing resources to combat smuggling and trafficking at the border.",
    ],
    deportations_border_review: [
        "Ensuring humane treatment and due process in immigration enforcement.",
        "Improving efficiency in immigration courts and asylum processing.",
        "Enhancing coordination between CBP, ICE, and other agencies.",
        "Utilizing technology effectively for border surveillance and management.",
    ],
    federal_prisons_cut: [
        "Exploring criminal justice reforms to reduce incarceration rates for non-violent offenses.",
        "Expanding alternatives to imprisonment could lower costs.",
        "Improving rehabilitation programs to reduce recidivism.",
        "Addressing overcrowding through sentencing reform or other measures.",
    ],
    federal_prisons_fund: [
        "Maintaining safe and humane federal prisons requires funding for staffing, maintenance, and healthcare.",
        "Investing in education and job training programs within prisons reduces recidivism.",
        "Addressing understaffing ensures safety for inmates and correctional officers.",
        "Providing adequate mental health and substance abuse treatment in prisons.",
    ],
    federal_prisons_review: [
        "Implementing evidence-based practices to reduce violence in prisons.",
        "Enhancing oversight of healthcare services for federal inmates.",
        "Improving reentry programs to support successful community transitions.",
        "Evaluating the effectiveness of different correctional programs.",
    ],
    // --- Transportation ---
    highways_cut: [
        "Federal highway funding should prioritize maintenance over costly new expansion.",
        "Ensuring states use federal highway funds efficiently.",
        "Balancing highway investments with support for transit and rail.",
        "Exploring innovative financing mechanisms for highways.",
    ],
    highways_fund: [
        "Modernizing America's aging highway infrastructure requires significant federal investment.",
        "Predictable federal funding allows states to undertake large transportation projects.",
        "Investing in highway improvements enhances safety, reduces congestion, and supports freight movement.",
        "Upgrading bridges and roads is critical for economic activity.",
    ],
    highways_review: [
        "Prioritizing projects that improve safety and reduce bottlenecks.",
        "Streamlining environmental review for critical infrastructure projects.",
        "Incorporating technology to improve traffic flow and safety.",
        "Ensuring highway projects are resilient to climate change impacts.",
    ],
    public_transit_cut: [
        "Federal transit funding should prioritize systems with high ridership and efficiency.",
        "Encouraging local/state governments to bear a larger share of transit operating costs.",
        "Evaluating the cost-effectiveness of specific large transit projects.",
        "Ensuring transit agencies operate efficiently.",
    ],
    public_transit_fund: [
        "Investing in public transit reduces congestion, lowers emissions, and increases accessibility.",
        "Adequate federal funding helps transit agencies maintain safe service and upgrade infrastructure.",
        "Supporting transit provides affordable transportation options.",
        "Funding the transition to cleaner transit fleets (electric buses).",
    ],
    public_transit_review: [
        "Improving transit service frequency, reliability, and coverage.",
        "Integrating transit with other modes like biking and walking.",
        "Ensuring transit systems are accessible to people with disabilities.",
        "Using technology to improve the rider experience (real-time info, payments).",
    ],
    tsa_cut: [
        "Reviewing TSA screening procedures for efficiency, potentially using more risk-based approaches.",
        "Evaluating the cost-effectiveness of specific TSA technologies.",
        "Ensuring appropriate staffing levels and minimizing administrative overhead.",
        "Comparing TSA performance and cost against international counterparts.",
    ],
    tsa_fund: [
        "Maintaining aviation security requires adequate TSA funding for staffing and technology.",
        "Investing in advanced screening technologies enhances security effectiveness.",
        "Providing competitive pay and training for TSA officers improves performance.",
        "Adapting TSA protocols to address evolving security threats.",
    ],
    tsa_review: [
        "Balancing rigorous security screening with passenger facilitation.",
        "Continuously adapting security protocols to counter new threats.",
        "Improving communication between TSA, airports, and airlines.",
        "Evaluating the effectiveness of different screening methods.",
    ],
    faa_cut: [
        "Ensuring the FAA operates efficiently, especially in air traffic control modernization.",
        "Evaluating the necessity of all FAA programs, prioritizing core safety functions.",
        "Streamlining aircraft certification while maintaining rigorous safety standards.",
        "Reducing bureaucratic delays within the FAA.",
    ],
    faa_fund: [
        "Ensuring airspace safety requires robust FAA funding for oversight and air traffic control.",
        "Adequate FAA resources are critical for maintaining aviation safety.",
        "Investing in NextGen air traffic control modernization enhances efficiency.",
        "Funding FAA oversight of aircraft manufacturing and maintenance.",
    ],
    faa_review: [
        "Addressing air traffic controller staffing shortages.",
        "Accelerating the implementation of NextGen technologies.",
        "Enhancing oversight of aircraft manufacturing processes.",
        "Improving coordination between the FAA and international aviation authorities.",
    ],
    amtrak_cut: [
        "Amtrak's reliance on federal subsidies warrants scrutiny regarding operational efficiency.",
        "Focusing federal rail investments on corridors with high potential ridership.",
        "Exploring increased private sector involvement in passenger rail.",
        "Demanding greater financial accountability from Amtrak.",
    ],
    amtrak_fund: [
        "Investing in Amtrak offers an alternative to congested highways and airports.",
        "Adequate funding allows Amtrak to upgrade infrastructure and modernize its fleet.",
        "Supporting passenger rail connects communities and reduces emissions.",
        "Expanding Amtrak service to underserved areas.",
    ],
    amtrak_review: [
        "Improving Amtrak's on-time performance and customer service.",
        "Developing a long-term strategic plan for national passenger rail.",
        "Ensuring fair access for Amtrak trains on freight railroad tracks.",
        "Evaluating the economic and environmental benefits of specific Amtrak routes.",
    ],
    // --- Science ---
    nasa_cut: [
        "NASA's budget requires careful prioritization, potentially focusing on core science missions.",
        "Evaluating the balance between human spaceflight and robotic missions.",
        "Encouraging greater efficiency in NASA project management.",
        "Scrutinizing the costs of large flagship programs like Artemis.",
    ],
    nasa_fund: [
        "Investing in NASA fuels scientific discovery and technological innovation.",
        "Funding NASA missions expands human knowledge and benefits life on Earth.",
        "Supporting NASA maintains U.S. leadership in space exploration.",
        "NASA programs inspire the next generation of scientists and engineers.",
    ],
    nasa_review: [
        "Ensuring NASA maintains a balanced portfolio across science, aeronautics, and exploration.",
        "Managing the costs and schedules of large, complex missions.",
        "Strengthening partnerships between NASA and the commercial space industry.",
        "Prioritizing NASA missions based on scientific merit and national goals.",
    ],
    nsf_cut: [
        "Ensuring NSF grants target truly fundamental, high-impact research.",
        "Evaluating the balance of NSF funding across scientific disciplines.",
        "Minimizing administrative overhead associated with NSF grants.",
        "Prioritizing NSF funding based on national needs and scientific opportunity.",
    ],
    nsf_fund: [
        "The NSF provides essential funding for fundamental research across science and engineering.",
        "Investing in basic science through the NSF drives innovation and economic competitiveness.",
        "Supporting NSF programs broadens participation in STEM fields.",
        "NSF funding trains the future scientific and technical workforce.",
    ],
    nsf_review: [
        "Maintaining the integrity of NSF's merit review process.",
        "Enhancing NSF's role in translating basic research into applications.",
        "Supporting STEM education initiatives from K-12 through graduate school.",
        "Ensuring NSF investments align with long-term national interests.",
    ],
    nasa_spacex_cut: [ // Similar to Pentagon_SpaceX, but NASA context
        "NASA's reliance on commercial partners like SpaceX needs oversight for cost-effectiveness and safety.",
        "Promoting competition among commercial space providers controls costs.",
        "Evaluating the long-term strategy for public-private partnerships in space.",
        "Ensuring taxpayer value in NASA's commercial contracts.",
    ],
    nasa_spacex_review: [
        "Ensuring rigorous safety standards for commercial crew and cargo missions.",
        "Transparency regarding costs and performance of NASA's commercial contracts.",
        "Balancing investments in commercial partnerships with NASA's internal capabilities.",
        "Defining clear roles and responsibilities between NASA and commercial partners.",
    ],
    // --- Generic Fallbacks (Least specific) ---
    default_cut: [
        "This program's current funding level appears disproportionately high compared to its apparent benefits.",
        "Resources allocated here might be better utilized if redirected towards more pressing needs.",
        "A reduction in funding for this area should be seriously considered during budget negotiations.",
    ],
    default_fund: [
        "Adequate investment in this area is likely necessary for it to achieve its stated mission effectively.",
        "Increased resources could potentially unlock greater public benefit from this program.",
        "Ensuring this program has sufficient funding seems prudent based on its objectives.",
    ],
    default_review: [
        "Closer examination of this program's operations is warranted to ensure efficiency.",
        "Regular oversight is needed to confirm this program is delivering value for taxpayer money.",
        "An evaluation of this program's effectiveness and impact would be beneficial.",
    ],
};


// Paragraph about BUDGET/DEBT (More forceful tone progression)
const BUDGET_DEBT: Record<0 | 1 | 2 | 3, string> = {
    0: "Additionally, while addressing specific programs, I hope Congress will also maintain a focus on long-term fiscal responsibility and work towards a sustainable budget path.",
    1: "Beyond these specific items, I strongly urge you to prioritize measures that lead to greater fiscal sustainability and begin addressing our growing national debt.",
    2: "Furthermore, addressing the national debt cannot be postponed. Fiscal discipline must be central to every spending decision Congress makes, starting now.",
    3: "Critically, the soaring national debt is an existential threat to our economic future. A concrete, aggressive debt-reduction plan is not optional—it is an absolute necessity.",
};

// CALL TO ACTION (More direct and demanding at higher tones)
const CALL_TO_ACTION: Record<0 | 1 | 2 | 3, string> = {
    0: "Could you please share your perspective on how these specific funding issues might be addressed in upcoming budget discussions? I appreciate your time and service.",
    1: "I request that you outline the steps you intend to take to address these spending concerns and promote greater fiscal responsibility. Keeping constituents informed is important.",
    2: "I expect a detailed response outlining the concrete actions you will champion to correct these spending priorities and aggressively tackle the national debt. Accountability is essential.",
    3: "I demand a prompt and specific action plan from your office detailing how you will fight to realign this irresponsible spending and put our nation on a sustainable fiscal path. Failure to act is unacceptable.",
};


// --- Sentence Construction Logic (Refined) ---

/** Generates the core sentence block about a specific item, combining action and rationale. */
function generateItemSentence(item: SelectedItem, tone: 0 | 1 | 2 | 3): string {
    const fundingLevel = item.fundingLevel;
    const actionRationaleType = getFundingActionRationale(fundingLevel);

    // 1. Get the base action phrase for the funding level and tone.
    const baseActionPhrase = ACTION[fundingLevel][tone];

    // 2. Get *multiple* rationale options, falling back to defaults.
    const rationaleKey = `${item.id}_${actionRationaleType}`;
    const rationaleOptions = SPECIFIC_RATIONALES[rationaleKey] || SPECIFIC_RATIONALES[`default_${actionRationaleType}`] || [];

    // 3. Select a specific rationale.
    const specificRationale = randomChoice(rationaleOptions);

    // 4. Construct the sentence - vary structure slightly for flow.
    // Start with the item description.
    let sentence = `Regarding funding for ${item.description}, my view is that it ${baseActionPhrase}`;

    // Append the rationale if available, choosing connector based on tone.
    if (specificRationale) {
        const politeConnectors = [", as ", ", because ", ". Specifically, ", ". For instance, "];
        const firmConnectors = ["; ", ". Clearly, ", ". Simply put, ", ". This is because "];
        const connector = randomChoice(tone < 2 ? politeConnectors : firmConnectors);

        // Adjust capitalization and punctuation based on the connector.
        if (connector.startsWith('.')) {
            sentence += `${connector}${specificRationale.charAt(0).toUpperCase() + specificRationale.slice(1)}`;
        } else if (connector.startsWith(';')) {
             sentence += `${connector}${specificRationale.charAt(0).toLowerCase() + specificRationale.slice(1)}`;
        }
         else { // Starts with ", " or similar
            sentence += `${connector}${specificRationale.charAt(0).toLowerCase() + specificRationale.slice(1)}`;
        }
    }

    // Ensure the sentence ends properly.
    if (!/[.!?]$/.test(sentence)) {
        sentence += '.';
    }

    return sentence;
}

// --- Main Email Generation Function (Enhanced) ---

/**
 * Generates a draft email to representatives based on selected spending items and customization options.
 * Uses refined logic for better flow, varied sentence structure, and more detailed reasons.
 *
 * @param selectedItems An array of SelectedItem objects.
 * @param aggressiveness The overall tone (0-100 scale).
 * @param userName The user's name.
 * @param userLocation The user's location (City, ST Zip).
 * @param balanceBudgetPreference Whether the user checked the 'Prioritize Balancing the Budget' box.
 * @returns An object containing the generated email subject and body.
 */
export function generateRepresentativeEmail(
    selectedItems: SelectedItem[],
    aggressiveness: number,
    userName: string,
    userLocation: string,
    balanceBudgetPreference: boolean
): { subject: string; body: string } {

    const tone = toneBucket(aggressiveness);
    const subject = SUBJECT[tone];
    const opening = OPENING[tone](userLocation || '[Your City, ST Zip]'); // Added fallback

    // Build the list of items paragraph block
    let itemsBlock = "";
    if (selectedItems.length > 0) {
        itemsBlock += `\n\n${LIST_INTRO[tone]}\n\n`;
        const itemSentences = selectedItems.map(item => generateItemSentence(item, tone));
        // Join sentences into a single paragraph, attempting smoother flow.
        itemsBlock += itemSentences.join(' '); // Join with space for paragraph feel
    }

    // Add the budget/debt paragraph if selected
    const budgetParagraph = balanceBudgetPreference ? `\n\n${BUDGET_DEBT[tone]}` : "";

    // Construct the Call to Action - adjust based on selections
    let callToActionText = CALL_TO_ACTION[tone]; // Start with the default for the tone
    if (selectedItems.length === 0 && balanceBudgetPreference) {
        // If ONLY budget preference is checked, use a tailored CTA focused solely on debt/budget
        callToActionText = {
            0: "Could you please share your specific plans for promoting greater fiscal responsibility and addressing the national debt? Thank you for your attention to this vital matter.",
            1: "I strongly urge you to outline the concrete steps you will take towards achieving fiscal sustainability and reducing the national debt. Accountability on this issue is paramount.",
            2: "I expect a detailed and actionable plan from your office describing how you will aggressively curb the national debt and champion fiscal discipline. Please respond promptly.",
            3: "I demand immediate and specific proposals from you on tackling the national debt and restoring fiscal responsibility. Vague promises are insufficient; concrete action is required."
        }[tone];
    } else if (selectedItems.length > 0 && !balanceBudgetPreference) {
        // If items selected but NOT budget preference, slightly adjust default CTA if needed (often fine as is)
        // Example: remove debt part if not relevant
        callToActionText = callToActionText.replace(/ and (curb|tackle|address) the( national)? debt/gi, '');
    } else if (selectedItems.length === 0 && !balanceBudgetPreference) {
        // Fallback if somehow called with no selections at all
        callToActionText = "I would appreciate hearing your general thoughts on the current federal budget priorities.";
    }
    const callToAction = `\n\n${callToActionText}`;

    // Standard closing
    const salutation = "\n\nSincerely,";
    const signature = `\n\n${userName || '[Your Name]'}\n${userLocation || '[Your City, State, Zip Code]'}`;

    // Assemble the full body
    let body = opening + itemsBlock + budgetParagraph + callToAction + salutation + signature;

    // Final cleanup: ensure consistent paragraph spacing, trim whitespace
    body = body.replace(/\n\n+/g, '\n\n').trim();

    return { subject, body };
}

    