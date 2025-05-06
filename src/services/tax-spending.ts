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

// --- Tone Mapping ---
type ToneLevel = 0 | 1 | 2 | 3; // 0: Polite -> 3: Angry

/** Maps aggressiveness slider (0-100) to a discrete tone level (0-3). */
function mapAggressivenessToTone(agg: number): ToneLevel {
  if (agg <= 15) return 0; // Polite
  if (agg <= 40) return 1; // Concerned
  if (agg <= 75) return 2; // Stern
  return 3; // Angry
}

// --- Template Snippets (Indexed by ToneLevel) ---

const SUBJECTS: Record<ToneLevel, string> = {
  0: "Thoughts on Federal Budget Priorities",
  1: "Concerns Regarding Federal Spending Allocations",
  2: "Urgent: Reevaluation of Federal Budget Priorities Needed",
  3: "Demand for Immediate Action on Federal Spending and Debt",
};

const OPENINGS: Record<ToneLevel, (loc: string) => string> = {
  0: loc => `I hope this message finds you well. As a constituent from ${loc || '[Your Area]'}, I am writing to share my perspective on how our federal tax dollars are currently being allocated. I believe it's vital that these funds reflect the priorities of the people and are used effectively.`,
  1: loc => `I am writing to you today as a concerned constituent from ${loc || '[Your Area]'} regarding current federal spending patterns. Examining the allocation of funds raises questions about efficiency and alignment with our community's needs and values.`,
  2: loc => `As your constituent in ${loc || '[Your Area]'}, I must express my strong dissatisfaction with the current direction of federal spending. It is imperative that these priorities undergo immediate reevaluation to ensure taxpayer money benefits the public, rather than being lost to inefficiency.`,
  3: loc => `I am writing from ${loc || '[Your Area]'} to demand immediate and decisive action regarding the federal budget. The current pattern of spending, marked by waste and misplaced priorities, is unacceptable and requires your urgent intervention.`,
};

const INTROS_TO_ITEMS: Record<ToneLevel, string> = {
  0: "After reviewing estimates of federal spending, I wanted to highlight a few areas that I believe warrant closer examination and potential adjustments:",
  1: "My analysis of the budget breakdown reveals several specific items that cause me concern and which I urge you to address:",
  2: "Based on current spending levels, the following programs demand significant correction and reassessment of their funding:",
  3: "Below are some of the most concerning examples of what I see as misguided priorities and wasteful spending requiring your direct action:",
};

// --- Detailed Item-Specific Rationales (Indexed by item.id + fundingLevel) ---
// Provides context and justification for the requested funding change.

type FundingAction = 'cut' | 'review' | 'fund'; // Simplified actions for reason mapping

function getFundingAction(level: SelectedItem['fundingLevel']): FundingAction {
    if (level < 0) return 'cut';
    if (level > 0) return 'fund';
    return 'review'; // Level 0: Improve Efficiency
}

// Keys: `${item.id}_${FundingAction}` (e.g., 'medicaid_cut', 'nih_fund', 'pentagon_review')
const SPECIFIC_RATIONALES: Record<string, string[]> = {
    // --- Health ---
    medicaid_cut: [
        "While Medicaid provides a crucial safety net, its rising costs necessitate a careful review to ensure long-term sustainability and efficiency without compromising essential care for vulnerable populations.",
        "Exploring ways to improve efficiency and reduce administrative overhead within Medicaid could free up resources while maintaining the quality of care for recipients.",
        "Ensuring that Medicaid funds are directed towards the most effective treatments and preventative care measures should be a priority in managing its budget.",
    ],
    medicaid_fund: [
        "Expanding Medicaid access is a proven way to improve health outcomes, reduce uncompensated care costs, and increase economic stability for low-income families.",
        "Adequate funding for Medicaid ensures that vulnerable populations, including children, seniors, and individuals with disabilities, receive necessary medical care.",
        "Investing in Medicaid strengthens community health and provides a critical safety net, particularly during economic downturns or public health crises.",
    ],
    medicaid_review: [
        "Medicaid's effectiveness could be enhanced by implementing stricter oversight to prevent fraud and abuse, ensuring funds directly benefit recipients.",
        "Continuously evaluating Medicaid's delivery models and payment structures is important to maximize the value derived from taxpayer investment in the program.",
        "Focusing on preventative care and care coordination within Medicaid could lead to better health outcomes and potentially lower long-term costs.",
    ],
    medicare_cut: [
        "Given Medicare's long-term fiscal challenges, exploring options for greater efficiency, negotiating lower drug prices, and reducing administrative waste is essential.",
        "Reforms aimed at improving the cost-effectiveness of Medicare are needed to ensure its solvency for future generations of seniors.",
        "Careful consideration should be given to Medicare spending to prevent unnecessary procedures or excessive payments, ensuring taxpayer dollars are used wisely.",
    ],
    medicare_fund: [
        "Ensuring seniors have reliable access to comprehensive and affordable healthcare through Medicare is a fundamental commitment we must uphold.",
        "Strengthening Medicare, potentially by adding dental, vision, or hearing coverage, would significantly improve the quality of life for millions of older Americans.",
        "Adequate funding for Medicare is vital for the health and financial security of seniors and individuals with disabilities who rely on the program.",
    ],
    medicare_review: [
        "Implementing measures to combat fraud, waste, and abuse within Medicare is crucial for preserving the program's integrity and resources.",
        "Ongoing evaluation of Medicare's payment systems and benefit structure is needed to ensure it remains efficient and responsive to seniors' healthcare needs.",
        "Promoting value-based care models within Medicare could incentivize higher quality care and better health outcomes at a more sustainable cost.",
    ],
    nih_cut: [
        "While biomedical research is important, NIH funding should be carefully scrutinized to ensure grants target the most pressing health challenges and avoid duplication.",
        "Prioritizing NIH resources towards research with the highest potential for tangible public health benefits could improve the return on investment.",
        "Ensuring efficiency in NIH grant administration and minimizing overhead costs is important for maximizing the research impact of taxpayer dollars.",
    ],
    nih_fund: [
        "Investing robustly in the National Institutes of Health fuels groundbreaking medical discoveries, improves public health, drives economic growth in biotechnology, and maintains U.S. leadership in science.",
        "Increased NIH funding is essential for tackling complex diseases like cancer, Alzheimer's, and infectious diseases, leading to longer, healthier lives.",
        "Supporting basic and translational research through the NIH provides the foundation for future medical innovations and treatments.",
    ],
    nih_review: [
        "NIH grant review processes should be continuously refined to ensure fairness, transparency, and the funding of high-impact research.",
        "Improving data sharing and collaboration fostered by the NIH can accelerate scientific progress and prevent redundant research efforts.",
        "Focusing NIH resources on addressing health disparities and promoting health equity should be a key consideration in funding decisions.",
    ],
     cdc_cut: [
        "The CDC's budget should be reviewed to ensure resources are focused on core public health functions like disease surveillance and outbreak response, minimizing administrative bloat.",
        "Evaluating the effectiveness and necessity of all CDC programs is important to ensure taxpayer dollars are used efficiently for demonstrable public health outcomes.",
        "Streamlining CDC operations and improving coordination with state and local health departments could enhance efficiency.",
    ],
    cdc_fund: [
        "A well-funded CDC is absolutely critical for national health security, pandemic preparedness, and responding effectively to emerging public health threats.",
        "Investing in the CDC's data modernization, laboratory capacity, and public health workforce strengthens our ability to prevent and control diseases.",
        "Supporting the CDC's global health initiatives helps detect and contain outbreaks abroad before they reach U.S. shores.",
    ],
    cdc_review: [
        "Ensuring the CDC provides clear, timely, and science-based guidance during public health emergencies requires robust oversight and accountability.",
        "Improving the CDC's communication strategies and transparency can build public trust and enhance the effectiveness of public health recommendations.",
        "The CDC's role should focus on its core mission of disease control and prevention, avoiding mission creep into areas better handled by other agencies.",
    ],
    substance_mental_health_cut: [
        "Funding for substance use and mental health programs must prioritize evidence-based treatments and recovery support services with proven effectiveness.",
        "Careful evaluation is needed to ensure federal mental health funds are not duplicative of state or private efforts and are achieving measurable results.",
        "Resources should be targeted towards programs demonstrating success in reducing overdoses, improving access to care, and supporting long-term recovery.",
    ],
    substance_mental_health_fund: [
        "Addressing the nation's escalating mental health and addiction crisis requires a significant increase in resources for prevention, treatment, and recovery support.",
        "Expanding access to affordable mental healthcare and substance use disorder treatment, particularly in underserved communities, is a critical public health need.",
        "Investing in the mental health workforce, integrating mental and physical healthcare, and supporting crisis response systems are essential steps.",
    ],
    substance_mental_health_review: [
        "Improving coordination between various federal, state, and local agencies involved in mental health and substance use is key to effective service delivery.",
        "Ensuring parity in insurance coverage for mental health and substance use treatment is crucial for equitable access to care.",
        "Evaluating the effectiveness of different treatment modalities and recovery programs is necessary to optimize the use of public funds.",
    ],
    // --- War and Weapons ---
    pentagon_cut: [
        "The vast Pentagon budget requires significant scrutiny and reduction, focusing resources on genuine national defense needs rather than wasteful projects or excessive contractor profits.",
        "A critical audit of Pentagon spending is long overdue to identify inefficiencies, redundant programs, and opportunities for substantial savings without compromising security.",
        "Shifting funds away from costly, unproven weapons systems towards personnel readiness, maintenance, and emerging threats could strengthen defense more effectively.",
    ],
    pentagon_fund: [
        "Maintaining a strong and ready national defense in an increasingly complex global landscape requires adequate and predictable funding for personnel, training, and modernization.",
        "Investing in advanced military capabilities and technological superiority is necessary to deter potential adversaries and protect U.S. interests.",
        "Ensuring our service members have the best equipment, training, and support is essential for mission success and national security.",
    ],
    pentagon_review: [
        "Rigorous oversight of Pentagon spending is needed to ensure accountability, prevent waste, fraud, and abuse, and guarantee taxpayer dollars are used effectively.",
        "The Pentagon's acquisition processes require reform to control costs, speed up delivery of critical capabilities, and improve contractor performance.",
        "Regularly reassessing strategic priorities and force structure is necessary to ensure the military is optimized for current and future threats, not legacy systems.",
    ],
    pentagon_contractors_cut: [
        "The reliance on private defense contractors often leads to inflated costs, lack of transparency, and potential conflicts of interest; stricter oversight and reduced outsourcing are needed.",
        "Billions could be saved by reducing the Pentagon's dependence on expensive contractors and bringing more functions back in-house where appropriate.",
        "Requiring greater competition, fixed-price contracts where feasible, and robust auditing of defense contractors is essential to protect taxpayer interests.",
    ],
    // No pentagon_contractors_fund rationale - generally focus is on reduction/review
    pentagon_contractors_review: [
        "Transparency in defense contracting must be significantly improved, including detailed reporting on contract performance, costs, and deliverables.",
        "Implementing stronger mechanisms to prevent waste, fraud, and abuse in defense contracting is crucial for responsible stewardship of public funds.",
        "Evaluating the cost-effectiveness of outsourcing specific military functions versus performing them with uniformed personnel or government civilians is necessary.",
    ],
    pentagon_personnel_cut: [
        "While fair compensation is vital, reviewing military personnel costs for efficiencies in areas like healthcare administration, basing, and non-essential benefits is prudent.",
        "Optimizing force structure and reducing unnecessary overhead within the military personnel system could yield savings.",
        "Careful management of personnel costs is necessary, but must be balanced against the need to maintain readiness and support service members and their families.",
    ],
    pentagon_personnel_fund: [
        "Attracting and retaining highly skilled and dedicated military personnel requires competitive pay, comprehensive benefits, quality housing, and robust family support programs.",
        "Investing in the well-being, training, and readiness of our service members is paramount to maintaining an effective all-volunteer force.",
        "Ensuring adequate funding for military personnel accounts is crucial for morale, retention, and overall national security.",
    ],
    pentagon_personnel_review: [
        "Regular reviews of military compensation and benefits packages are needed to ensure they remain competitive and meet the needs of modern service members.",
        "Improving access to quality healthcare, mental health services, and childcare for military families requires ongoing attention and adequate resources.",
        "Streamlining personnel management processes and reducing administrative burdens can improve efficiency and allow service members to focus on their core missions.",
    ],
    pentagon_top5_contractors_cut: [ // Similar to general contractors_cut
        "The heavy concentration of Pentagon contracts among a few large corporations stifles innovation, inflates prices, and warrants action to promote greater competition.",
        "Reducing the share of contracts going to the top 5 defense firms could encourage a more diverse and cost-effective industrial base.",
        "Increased scrutiny is needed on contracts awarded to the largest defense firms to ensure taxpayers are receiving fair value.",
    ],
    pentagon_top5_contractors_review: [ // Similar to general contractors_review
        "The relationship between the Pentagon and its largest contractors requires close oversight to prevent undue influence and ensure accountability.",
        "Evaluating the long-term strategic implications of relying heavily on a small number of dominant defense contractors is important.",
        "Promoting opportunities for smaller and non-traditional defense companies can foster innovation and potentially lower costs.",
    ],
    nuclear_weapons_cut: [
        "Maintaining and modernizing a vast nuclear arsenal is incredibly expensive and arguably increases global risks; funding should be scaled back to focus on essential deterrence.",
        "Exploring arms control agreements and reducing reliance on nuclear weapons could yield significant savings and enhance global security.",
        "Questioning the need for certain costly nuclear modernization programs, like the Sentinel ICBM, is necessary for fiscal responsibility.",
    ],
    nuclear_weapons_fund: [ // Often framed as 'modernization'
        "Modernizing the U.S. nuclear deterrent (triad) is viewed by proponents as essential for maintaining strategic stability and deterring potential adversaries.",
        "Ensuring the safety, security, and reliability of the existing nuclear stockpile requires ongoing investment and modernization efforts.",
        "Funding for nuclear non-proliferation programs, managed alongside arsenal upkeep, is also a critical component of national security.",
    ],
    nuclear_weapons_review: [
        "The long-term costs and strategic justifications for all nuclear modernization programs require rigorous, transparent review by Congress.",
        "Ensuring robust command, control, and safety measures for the nuclear arsenal necessitates continuous oversight and investment.",
        "Balancing investments in nuclear deterrence with conventional forces and emerging technologies is a critical strategic consideration.",
    ],
    foreign_military_aid_cut: [
        "U.S. foreign military aid often fuels conflicts, props up undemocratic regimes, and diverts vast resources from pressing domestic needs; it should be sharply curtailed or eliminated.",
        "Providing weapons and military funding abroad can entangle the U.S. in foreign disputes and provoke unintended consequences.",
        "Reallocating funds from foreign military aid to diplomacy, development assistance, or domestic programs would be a better use of taxpayer money.",
    ],
    foreign_military_aid_fund: [
        "Strategic foreign military aid can strengthen key allies, enhance regional stability, improve interoperability with U.S. forces, and support U.S. foreign policy objectives.",
        "Providing security assistance helps partner nations defend themselves, counter terrorism, and participate in international peacekeeping efforts.",
        "Military aid can be a tool to build relationships and advance U.S. interests in critical regions.",
    ],
    foreign_military_aid_review: [
        "All foreign military aid should be subject to strict conditions regarding human rights, democratic governance, and accountability.",
        "The effectiveness and strategic rationale for each military aid package require continuous evaluation by Congress and the State Department.",
        "Transparency regarding the specific types of aid provided, its intended use, and its actual impact is essential.",
    ],
    israel_wars_cut: [ // More specific version of foreign_military_aid_cut
        "Unconditional and extensive military aid to specific nations, like Israel, drains U.S. resources, potentially enables controversial actions, and limits diplomatic flexibility.",
        "The level of military funding provided to Israel warrants scrutiny, especially when compared to domestic needs or aid provided elsewhere.",
        "Conditioning military aid on compliance with international law and U.S. policy objectives should be standard practice.",
    ],
     israel_wars_fund: [ // More specific version of foreign_military_aid_fund
        "Supporting Israel's security through military aid is viewed by proponents as a key pillar of U.S. policy in the Middle East, ensuring a strategic partner's qualitative military edge.",
        "Funding for systems like Iron Dome and joint military exercises enhances Israeli defense capabilities against regional threats.",
        "Security assistance to Israel is often framed as mutually beneficial, supporting U.S. defense innovation and intelligence sharing.",
    ],
     israel_wars_review: [ // More specific version of foreign_military_aid_review
        "The impact of U.S. military aid to Israel on regional stability and the Israeli-Palestinian conflict requires ongoing, critical assessment.",
        "Transparency regarding the specific uses of U.S. military aid by Israel and its compliance with U.S. law is essential.",
        "Balancing the security partnership with Israel against broader U.S. interests and values in the region is a complex diplomatic challenge.",
    ],
    f35_cut: [
        "The F-35 program, the most expensive weapons system in history, has been plagued by staggering cost overruns, delays, and persistent performance issues, warranting significant funding cuts.",
        "Reducing the total number of F-35s procured could save billions and allow investment in more cost-effective or strategically relevant capabilities.",
        "Continuing to pour money into the F-35 program without addressing its fundamental affordability and reliability problems is fiscally irresponsible.",
    ],
    // No f35_fund rationale - focus is generally on cost/performance criticism
     f35_review: [
        "Ongoing, rigorous testing and evaluation of the F-35's performance, maintenance costs, and combat effectiveness are crucial.",
        "Holding Lockheed Martin accountable for meeting cost and performance targets for the F-35 program is essential.",
        "Exploring alternatives or complementary aircraft to fulfill certain mission requirements might be more cost-effective than relying solely on the F-35.",
    ],
    pentagon_spacex_cut: [ // Combines contractor + specific company criticism
        "Public funds awarded through Pentagon contracts to highly profitable private space companies like SpaceX require stronger justification regarding unique capabilities and taxpayer value.",
        "Ensuring fair competition in national security space launches and avoiding over-reliance on a single provider is important.",
        "The necessity of subsidizing established commercial space ventures with defense contracts should be carefully evaluated.",
    ],
    pentagon_spacex_review: [ // Focus on oversight
        "Contracts awarded to SpaceX and other commercial space providers need robust oversight to ensure performance, cost control, and national security requirements are met.",
        "Transparency regarding the terms and value of Pentagon contracts with commercial space companies is necessary.",
        "Assessing the long-term strategy for utilizing commercial partners for national security space missions is important.",
    ],
    pentagon_dei_cut: [
        "Funding for Diversity, Equity, and Inclusion (DEI) initiatives within the Pentagon should be evaluated for effectiveness, ensuring they contribute demonstrably to military readiness and cohesion without becoming divisive or overly bureaucratic.",
        "Resources allocated to DEI programs must be justified based on clear objectives and measurable outcomes related to mission effectiveness.",
        "Ensuring DEI efforts focus on equal opportunity and meritocracy, rather than quotas or identity politics, is crucial for maintaining military standards.",
    ],
    pentagon_dei_fund: [ // Often framed as enhancing readiness
        "DEI initiatives, when properly implemented, can enhance military readiness by attracting talent from all segments of society, fostering teamwork, and ensuring fair treatment for all service members.",
        "Promoting an inclusive environment where all qualified individuals can serve and succeed strengthens the Armed Forces.",
        "Addressing issues of discrimination or bias within the military through well-designed DEI programs contributes to unit cohesion and effectiveness.",
    ],
    pentagon_dei_review: [
        "The specific goals, metrics, and costs associated with Pentagon DEI programs require clear definition and congressional oversight.",
        "Ensuring DEI training and initiatives are evidence-based and genuinely contribute to a more effective and cohesive military force is paramount.",
        "Balancing DEI goals with the military's primary mission of national defense requires careful consideration.",
    ],
    // --- Veterans ---
    va_cut: [
        "While supporting veterans is paramount, the VA system needs continuous efforts to improve efficiency, reduce bureaucracy, and streamline service delivery without compromising quality of care.",
        "Exploring ways to modernize VA operations, improve IT systems, and reduce administrative overhead could allow resources to be more directly focused on veteran care.",
        "Ensuring accountability within the VA and eliminating wasteful spending are necessary to maximize the effectiveness of funds allocated to veteran services.",
    ],
    va_fund: [
        "Fulfilling our nation's solemn promise to veterans requires robust and sustained funding for VA healthcare, mental health services, disability claims processing, and transition assistance.",
        "Investing in the VA healthcare system, including expanding access points and reducing wait times, is crucial for meeting the complex needs of veterans.",
        "Adequate funding for VA benefits, educational programs like the GI Bill, and housing assistance helps veterans thrive after their service.",
    ],
    va_review: [
        "Improving the timeliness and accuracy of VA disability claims processing remains a critical area requiring ongoing oversight and reform.",
        "Enhancing mental healthcare access and suicide prevention programs for veterans must be a top priority for the VA.",
        "Ensuring seamless coordination between the VA and the Department of Defense for transitioning service members needs continuous improvement.",
    ],
    pact_act_fund: [ // PACT Act focus is generally on funding/implementation
        "Fully funding and effectively implementing the PACT Act is essential to provide veterans exposed to burn pits, Agent Orange, and other toxins the healthcare and benefits they have earned.",
        "Ensuring the VA has the resources needed to process PACT Act claims efficiently and provide specialized care for toxic exposure-related conditions is critical.",
        "Outreach efforts to inform eligible veterans about PACT Act benefits require adequate support.",
    ],
    pact_act_review: [
        "Monitoring the VA's progress in implementing the PACT Act, including claims processing times and access to care for related conditions, is vital.",
        "Continued research into the long-term health effects of toxic exposures during military service is necessary to inform VA care and policies.",
        "Ensuring healthcare providers both within and outside the VA are knowledgeable about toxic exposure issues is important for accurate diagnosis and treatment.",
    ],
     // --- Unemployment and Labor ---
    tanf_cut: [
        "TANF's effectiveness in promoting long-term self-sufficiency needs rigorous evaluation; funding should prioritize programs with proven results in moving families out of poverty.",
        "Ensuring TANF work requirements are meaningful and supported by adequate job training and childcare resources is crucial for the program's goals.",
        "Reducing state flexibility in using TANF funds for purposes unrelated to direct cash assistance or work support could improve its focus.",
    ],
    tanf_fund: [
        "Strengthening the social safety net requires adequate funding for TANF to provide a meaningful level of temporary support for vulnerable families facing hardship.",
        "Investing in TANF-funded job training, education, and supportive services can help parents secure stable employment and improve family well-being.",
        "Adjusting TANF benefit levels, which have eroded significantly over time due to inflation, is necessary to provide meaningful assistance.",
    ],
    tanf_review: [
        "Evaluating the impact of TANF time limits and sanctions on families and children is important.",
        "Improving data collection and reporting on TANF outcomes is needed to assess program effectiveness.",
        "Ensuring TANF programs are responsive to the needs of diverse families, including those facing significant barriers to employment, requires careful design.",
    ],
    child_tax_credit_cut: [
        "The structure and cost of the Child Tax Credit (CTC) should be reviewed to ensure it is targeted effectively towards low- and middle-income families and is fiscally sustainable.",
        "Exploring modifications to the CTC, such as strengthening work requirements or adjusting income phase-outs, could be considered.",
        "Balancing the poverty-reducing impact of the CTC against its overall cost to the federal budget requires careful analysis.",
    ],
    child_tax_credit_fund: [ // Focus on expansion/permanence
        "Expanding the Child Tax Credit, particularly making the full credit available to the lowest-income families, is one of the most effective tools for reducing child poverty.",
        "Making recent expansions of the CTC permanent would provide stability for working families and significantly improve child well-being.",
        "The CTC provides crucial financial support to help families cover the rising costs of raising children, boosting local economies.",
    ],
    child_tax_credit_review: [
        "Simplifying the process for eligible families to claim the Child Tax Credit is important, particularly for those who may not file taxes regularly.",
        "Evaluating the impact of the CTC on parental employment and family economic decisions is relevant for policy design.",
        "Ensuring the CTC interacts effectively with other safety net programs is necessary for a cohesive support system.",
    ],
    refugee_assistance_cut: [
        "While providing refuge is important, the costs associated with resettlement should be managed efficiently, focusing on rapid self-sufficiency and integration.",
        "Ensuring adequate screening and security measures are in place alongside resettlement programs is paramount.",
        "Balancing humanitarian commitments with the fiscal capacity and integration challenges requires careful planning.",
    ],
    refugee_assistance_fund: [
        "Providing adequate resources for refugee resettlement reflects American humanitarian values and fulfills international obligations.",
        "Investing in effective integration programs, including language training, job assistance, and community support, helps refugees become self-sufficient contributors.",
        "Supporting refugee assistance programs demonstrates U.S. leadership and compassion on the global stage.",
    ],
    refugee_assistance_review: [
        "Improving coordination between federal agencies, resettlement organizations, and local communities is key to successful refugee integration.",
        "Evaluating the long-term outcomes of refugees resettled in the U.S. can inform program improvements.",
        "Ensuring resettlement programs are adequately resourced to handle fluctuating arrival numbers and diverse needs is important.",
    ],
    liheap_cut: [
        "LIHEAP funding should be targeted to the most vulnerable households facing genuine energy crises, with strong verification processes.",
        "Exploring ways to encourage energy efficiency improvements alongside bill assistance could provide more sustainable solutions.",
        "Ensuring LIHEAP funds supplement, rather than replace, individual responsibility for energy costs requires careful program design.",
    ],
    liheap_fund: [
        "The Low Income Home Energy Assistance Program (LIHEAP) is crucial for preventing dangerous energy shutoffs and ensuring vulnerable households, including seniors and families with children, can afford heating in winter and cooling in summer.",
        "Adequate funding for LIHEAP provides a vital safety net against energy poverty and improves health outcomes.",
        "Supporting LIHEAP weatherization programs helps low-income households reduce their energy consumption and costs permanently.",
    ],
    liheap_review: [
        "Streamlining the LIHEAP application process can improve access for eligible households.",
        "Ensuring equitable distribution of LIHEAP funds based on need and climate variations is important.",
        "Coordinating LIHEAP with other utility assistance programs and energy efficiency initiatives can maximize impact.",
    ],
    nlrb_cut: [
        "The role and actions of the National Labor Relations Board (NLRB) sometimes face criticism regarding fairness and impact on business; its funding and authority warrant review.",
        "Ensuring the NLRB applies labor laws impartially and efficiently is key to its legitimacy.",
        "Evaluating whether the NLRB's structure and processes are suited to the modern economy could be beneficial.",
    ],
    nlrb_fund: [
        "Protecting workers' fundamental rights to organize, bargain collectively, and address unfair labor practices requires a fully funded and staffed NLRB.",
        "Adequate resources allow the NLRB to investigate charges promptly, conduct fair elections, and remedy violations of labor law.",
        "A strong NLRB is essential for maintaining a balance of power between employers and employees and promoting stable labor relations.",
    ],
    nlrb_review: [
        "Improving the speed and efficiency of NLRB case processing is important for both workers and employers.",
        "Ensuring NLRB decisions are well-reasoned and consistent with legal precedent enhances predictability.",
        "Adapting NLRB rules and procedures to address challenges in the modern workforce, such as the gig economy, is an ongoing task.",
    ],
     // --- Education ---
    dept_education_cut: [
        "The federal role in education should be limited and efficient, avoiding bureaucratic overreach and respecting state and local control over schools.",
        "Consolidating duplicative programs within the Department of Education could yield savings and improve focus.",
        "Evaluating the effectiveness of federal education mandates and grant programs is necessary to ensure they achieve desired outcomes without excessive burden.",
    ],
    dept_education_fund: [
        "Investing in education at all levels—from early childhood to higher education and workforce training—is crucial for individual opportunity, economic growth, and national competitiveness.",
        "The Department of Education plays a vital role in promoting equity, ensuring civil rights in schools, supporting research, and providing financial aid.",
        "Adequate federal funding is necessary to support key education initiatives, particularly for disadvantaged students and underserved communities.",
    ],
    dept_education_review: [
        "Simplifying federal grant applications and reducing administrative burdens on schools and colleges can free up resources for teaching and learning.",
        "Improving data collection and transparency regarding the outcomes of federal education programs is essential for accountability.",
        "Ensuring the Department of Education effectively enforces civil rights laws and protects students from discrimination requires consistent oversight.",
    ],
    college_aid_cut: [
        "Federal college aid programs need significant reform to address the root causes of soaring tuition costs and burdensome student loan debt, rather than just subsidizing the current system.",
        "Exploring ways to simplify the federal student aid system and better target grants and loans based on need and potential for success is warranted.",
        "Holding colleges and universities more accountable for student outcomes and controlling administrative costs should be linked to federal aid eligibility.",
    ],
    college_aid_fund: [
        "Expanding access to affordable higher education through increased funding for Pell Grants, work-study programs, and potentially tuition-free community college strengthens the workforce and promotes social mobility.",
        "Reducing the burden of student loan debt through measures like income-driven repayment plans or targeted forgiveness supports economic security.",
        "Simplifying the FAFSA application process makes it easier for students, particularly those from low-income backgrounds, to access available aid.",
    ],
    college_aid_review: [
        "The complex system of federal student loans requires ongoing review regarding interest rates, repayment options, and servicing practices.",
        "Evaluating the effectiveness of different types of college aid (grants vs. loans vs. work-study) in promoting access and completion is important.",
        "Ensuring federal aid programs support quality educational institutions and protect students from predatory practices requires strong oversight.",
    ],
    k12_schools_cut: [
        "Federal K-12 funding should primarily supplement, not supplant, state and local responsibility for education, focusing on truly necessary national priorities.",
        "Reducing federal mandates and returning more control over education policy and funding decisions to states and local districts could improve responsiveness.",
        "Consolidating overlapping federal K-12 grant programs could increase efficiency and reduce administrative overhead.",
    ],
    k12_schools_fund: [
        "Targeted federal funding for K-12 schools is crucial for supporting under-resourced districts, students with disabilities (IDEA), English language learners, and children from low-income families (Title I).",
        "Investing in programs that support teacher recruitment and retention, school infrastructure, and access to technology can improve educational quality.",
        "Federal support plays a key role in promoting educational equity and ensuring all students have the opportunity to succeed.",
    ],
    k12_schools_review: [
        "Ensuring federal K-12 funds are used effectively to improve student outcomes, particularly for disadvantaged groups, requires strong accountability measures.",
        "Evaluating the impact of federal education laws and regulations on local school districts is important.",
        "Promoting innovation and evidence-based practices in K-12 education should be a focus of federal support.",
    ],
    cpb_cut: [
        "In today's diverse media landscape with countless private options, federal funding for the Corporation for Public Broadcasting (CPB), which supports PBS and NPR, faces scrutiny regarding its necessity.",
        "Questions about political bias in public broadcasting content sometimes lead to calls for reducing or eliminating federal subsidies.",
        "Phasing out federal support for CPB could encourage public broadcasters to rely more on private donations and corporate sponsorships.",
    ],
    cpb_fund: [ // Focus on public service mission
        "The Corporation for Public Broadcasting provides essential funding for high-quality educational programming, objective news coverage, and cultural content accessible to all Americans, regardless of location or income.",
        "Public broadcasting serves underserved communities and provides a vital non-commercial alternative to private media.",
        "Federal support ensures the independence and nationwide reach of public radio and television stations.",
    ],
    cpb_review: [
        "Ensuring CPB funding distribution is fair, transparent, and supports diverse programming requires ongoing oversight.",
        "Evaluating the mechanisms for maintaining editorial independence and objectivity within public broadcasting is important.",
        "Assessing the role of public broadcasting in the digital age and its adaptation to new media platforms is relevant.",
    ],
    imls_cut: [
        "While libraries and museums are valuable community assets, federal funding through the Institute of Museum and Library Services (IMLS) could potentially be reduced, shifting more responsibility to state, local, and private sources.",
        "Prioritizing IMLS grants towards programs with the broadest impact or those serving the most underserved communities might be necessary.",
        "Evaluating the specific outcomes achieved through IMLS funding is important for demonstrating taxpayer value.",
    ],
    imls_fund: [
        "The Institute of Museum and Library Services provides crucial federal support for the nation's libraries and museums, enabling them to offer vital educational resources, digital access, and community programs.",
        "IMLS funding helps libraries bridge the digital divide and supports museums in preserving cultural heritage and providing lifelong learning opportunities.",
        "Federal support through IMLS leverages state and local funding, strengthening these essential community institutions.",
    ],
    imls_review: [
        "Ensuring IMLS grant programs are accessible to libraries and museums of all sizes and types, including those in rural and underserved areas.",
        "Focusing IMLS initiatives on key national priorities like digital literacy, workforce development, and civic engagement.",
        "Improving data collection on the impact of IMLS-funded programs enhances accountability.",
    ],
    // --- Food and Agriculture ---
    snap_cut: [
        "Reforming SNAP (food stamps) to strengthen work requirements, improve program integrity, and reduce dependency could lead to savings while still providing a safety net.",
        "Ensuring SNAP benefits are used for nutritious food items and exploring ways to limit unhealthy purchases warrants consideration.",
        "Tightening eligibility criteria or adjusting benefit levels for SNAP requires careful balancing of fiscal concerns and food security needs.",
    ],
    snap_fund: [
        "SNAP is the nation's most effective anti-hunger program, providing vital food assistance to millions of low-income families, seniors, and individuals with disabilities, and should be fully funded.",
        "Strengthening SNAP benefits can reduce food insecurity, improve health outcomes, and stimulate local economies.",
        "Maintaining broad eligibility and adequate benefit levels for SNAP is crucial, especially during economic downturns.",
    ],
    snap_review: [
        "Simplifying the SNAP application and recertification process can reduce administrative burdens and improve access for eligible households.",
        "Improving SNAP Employment & Training programs to better connect recipients with sustainable employment opportunities.",
        "Ensuring SNAP benefit levels adequately reflect the actual cost of a nutritious diet in different parts of the country.",
    ],
     school_lunch_cut: [
        "Reviewing the nutritional standards and administrative costs of the National School Lunch Program could identify potential efficiencies.",
        "Ensuring school meal programs target assistance effectively to low-income students while managing overall program costs.",
        "Exploring partnerships or alternative models for providing nutritious meals in schools might yield savings.",
    ],
    school_lunch_fund: [
        "Expanding access to free and reduced-price school meals ensures that all children have the nutrition they need to learn and thrive, regardless of their family's income.",
        "Investing in universal free school meals could reduce stigma, improve administrative efficiency, and boost student health and academic performance.",
        "Supporting programs that increase the use of fresh, locally sourced foods in school meals enhances nutritional quality.",
    ],
    school_lunch_review: [
        "Improving the nutritional quality and appeal of school meals to increase student participation and reduce food waste.",
        "Streamlining the application process for free and reduced-price meals.",
        "Ensuring adequate funding and flexibility for schools to meet updated nutritional standards.",
    ],
    fsa_cut: [
        "Reforming farm subsidies administered by the Farm Service Agency (FSA) is needed to reduce market distortions, limit payments to large agricultural corporations, and better target support to small and beginning farmers.",
        "Phasing out certain commodity support programs or disaster payments that encourage risky farming practices could save taxpayer money.",
        "Shifting FSA resources away from traditional subsidies towards conservation programs and rural development could offer better long-term value.",
    ],
    fsa_fund: [
        "The Farm Service Agency provides crucial support for farmers and ranchers, including access to credit, disaster assistance, and conservation programs, ensuring a stable food supply and supporting rural economies.",
        "Adequate funding for FSA loan programs helps beginning farmers and those from underserved groups access capital.",
        "Investing in FSA conservation programs protects natural resources like soil and water while supporting farm income.",
    ],
    fsa_review: [
        "Improving the accessibility and responsiveness of FSA programs, particularly for small, mid-sized, and minority farmers.",
        "Ensuring FSA disaster assistance programs are timely and effective in helping producers recover from natural disasters.",
        "Evaluating the effectiveness of commodity support programs versus conservation incentives in achieving desired agricultural outcomes.",
    ],
    wic_cut: [
        "While WIC is valuable, reviewing its administrative costs and ensuring efficient delivery of benefits could optimize resource use.",
        "Targeting WIC benefits effectively to those most nutritionally at risk requires ongoing evaluation.",
        "Coordinating WIC services with other maternal and child health programs might reduce duplication.",
    ],
    wic_fund: [
        "The Women, Infants, and Children (WIC) program provides critical nutritional support, breastfeeding promotion, and healthcare referrals for low-income pregnant women, new mothers, and young children, demonstrably improving health outcomes.",
        "Fully funding WIC ensures that all eligible participants can receive benefits, reducing infant mortality, improving birth weights, and supporting healthy child development.",
        "Investing in WIC is a cost-effective way to improve long-term health and reduce future healthcare expenditures.",
    ],
    wic_review: [
        "Modernizing WIC food packages to align with current dietary guidelines and participant preferences.",
        "Improving the WIC shopping experience, potentially through enhanced electronic benefit transfer (EBT) systems.",
        "Strengthening WIC's role in providing nutrition education and breastfeeding support.",
    ],
    // --- Government Operations ---
    fdic_note: [ // FDIC is funded by bank premiums, not direct taxes
        "While the FDIC plays a crucial role in financial stability, it's important to note its operations are primarily funded by insurance premiums assessed on banks, not direct taxpayer appropriations.",
        "Oversight of the FDIC focuses on ensuring it effectively manages the deposit insurance fund and regulates banks appropriately.",
        "Maintaining public confidence in the banking system relies on the FDIC's independence and financial strength.",
    ],
    irs_cut: [
        "IRS funding should prioritize efficient tax administration and helpful taxpayer service, avoiding overly burdensome enforcement tactics or audits targeting low-income individuals.",
        "Concerns about IRS overreach or political bias sometimes lead to calls for budget constraints or stricter limitations on its activities.",
        "Investing in simplifying the tax code itself could be a more effective way to improve compliance than simply increasing IRS enforcement budgets.",
    ],
    irs_fund: [
        "Adequate IRS funding is essential to close the 'tax gap' (the difference between taxes owed and taxes paid), ensure fairness in the tax system, combat tax evasion by wealthy individuals and corporations, and improve taxpayer services.",
        "Investing in IRS modernization, including updated IT systems and better taxpayer support tools, can improve efficiency and compliance.",
        "Every dollar invested in effective IRS enforcement, particularly targeting high-income non-compliance, yields significant returns in revenue.",
    ],
    irs_review: [
        "Ensuring the IRS uses its resources fairly and focuses enforcement efforts appropriately requires strong congressional oversight.",
        "Improving IRS taxpayer service, including phone support and online tools, should be a key priority.",
        "Protecting taxpayer rights and ensuring due process during audits and collections is fundamental.",
    ],
    federal_courts_cut: [
        "Reviewing federal court operations for efficiencies in case management, administrative costs, and courthouse security could yield savings.",
        "Exploring alternatives to traditional litigation, such as mediation or arbitration, might reduce court caseloads.",
        "Careful budgeting is necessary, but must not compromise the judiciary's ability to administer justice fairly and impartially.",
    ],
    federal_courts_fund: [
        "A well-functioning and independent federal judiciary requires sufficient funding for judgeships, court staff, courthouse security, and technology to handle caseloads effectively and administer justice without undue delay.",
        "Investing in the federal courts ensures access to justice and upholds the rule of law.",
        "Adequate resources are needed to protect judges and court personnel and maintain secure facilities.",
    ],
    federal_courts_review: [
        "Addressing judicial vacancies and ensuring the timely appointment of judges is crucial for reducing case backlogs.",
        "Improving access to the courts for low-income individuals and promoting pro bono services.",
        "Modernizing court technology and electronic filing systems enhances efficiency and public access.",
    ],
    public_defenders_cut: [ // Generally, focus is on underfunding, but review is possible
        "Ensuring federal public defender offices operate efficiently and manage resources effectively is important.",
        "Evaluating caseloads and resource allocation across different federal districts might reveal opportunities for optimization.",
    ],
    public_defenders_fund: [
        "Ensuring the constitutional right to counsel guaranteed by the Sixth Amendment requires adequate funding for federal public defenders and court-appointed attorneys.",
        "Underfunded public defender systems lead to excessive caseloads, compromising the quality of representation for indigent defendants.",
        "Investing in public defense helps ensure fairness in the justice system and prevent wrongful convictions.",
    ],
    public_defenders_review: [
        "Addressing high caseloads and ensuring public defenders have adequate resources for investigations and expert witnesses.",
        "Promoting pay parity between public defenders and prosecutors to attract and retain qualified attorneys.",
        "Evaluating the effectiveness of different models for providing indigent defense in federal court.",
    ],
     usps_note: [ // USPS is largely self-funded but faces financial challenges/mandates
        "While the Postal Service primarily operates on revenue from postage and services, its financial health is impacted by congressional mandates, such as pre-funding retiree health benefits, which warrant review.",
        "Reforms aimed at modernizing USPS operations, adjusting service standards, and allowing diversification of revenue streams are subjects of ongoing debate.",
        "Ensuring the Postal Service can fulfill its universal service obligation sustainably requires careful consideration of its business model and regulatory environment.",
    ],
    cfpb_cut: [
        "The broad regulatory authority and unique funding structure of the Consumer Financial Protection Bureau (CFPB) warrant ongoing scrutiny regarding accountability and potential economic impact.",
        "Concerns about CFPB regulations being overly burdensome on financial institutions sometimes lead to calls for limiting its power or budget.",
        "Ensuring the CFPB focuses on clear instances of consumer harm and avoids regulatory overreach requires congressional oversight.",
    ],
    cfpb_fund: [
        "The CFPB plays a vital role in protecting consumers from predatory financial practices in areas like mortgages, credit cards, and student loans, requiring adequate resources to fulfill its mission.",
        "Strong enforcement actions by the CFPB return billions of dollars to harmed consumers and deter misconduct by financial companies.",
        "Funding for CFPB's consumer education initiatives helps empower individuals to make informed financial decisions.",
    ],
    cfpb_review: [
        "Ensuring the CFPB's rulemaking process is transparent, data-driven, and considers potential economic impacts.",
        "Improving coordination between the CFPB and other federal and state financial regulators.",
        "Evaluating the effectiveness of CFPB enforcement actions and educational programs in protecting consumers.",
    ],
    mbda_cut: [
        "Evaluating the effectiveness and necessity of the Minority Business Development Agency (MBDA) compared to broader small business support programs is warranted.",
        "Ensuring MBDA programs deliver measurable results in promoting minority business growth and competitiveness.",
        "Consolidating business development programs could potentially increase efficiency.",
    ],
    mbda_fund: [
        "The Minority Business Development Agency plays a unique role in addressing systemic barriers and promoting the growth of minority-owned businesses, contributing to a more equitable economy.",
        "Investing in MBDA programs helps create jobs, build wealth in underserved communities, and foster innovation.",
        "Expanding MBDA's reach and resources can help close the persistent racial wealth gap.",
    ],
    mbda_review: [
        "Improving access to capital and federal contracting opportunities for minority-owned businesses should be a key focus for MBDA.",
        "Strengthening partnerships between MBDA, other federal agencies, and private sector organizations.",
        "Enhancing data collection on the performance and challenges of minority-owned businesses to inform MBDA strategies.",
    ],
     usich_cut: [ // Funding is very small, focus is usually on coordination/effectiveness
        "Evaluating the effectiveness of the Interagency Council on Homelessness (USICH) in coordinating federal efforts and achieving reductions in homelessness.",
        "Ensuring USICH's role complements, rather than duplicates, the work of primary agencies like HUD.",
    ],
    usich_fund: [
        "The USICH plays a crucial role in coordinating the efforts of 19 federal agencies to prevent and end homelessness, requiring adequate resources to facilitate collaboration and implement national strategies.",
        "Supporting USICH helps ensure a more unified and effective federal response to the complex issue of homelessness.",
        "Investing in USICH's capacity to promote evidence-based practices and data sharing across agencies.",
    ],
    usich_review: [
        "Strengthening USICH's authority and resources to hold federal agencies accountable for implementing homelessness strategies.",
        "Improving coordination between federal efforts and state/local homelessness response systems.",
        "Focusing USICH efforts on proven solutions like Housing First.",
    ],
    // --- Housing and Community ---
    fema_cut: [
        "FEMA's disaster response efforts require review for efficiency, particularly regarding administrative costs, contracting practices, and the speed of aid delivery.",
        "Ensuring FEMA funds prioritize immediate life-saving needs and essential recovery efforts, while minimizing potential fraud or misuse.",
        "Balancing federal disaster aid with the need for state/local preparedness and mitigation investments.",
    ],
    fema_fund: [
        "Given the increasing frequency and severity of natural disasters, robust funding for FEMA is essential for effective response, recovery, and mitigation efforts nationwide.",
        "Investing in FEMA's capacity to provide timely assistance to disaster survivors and communities is critical.",
        "Supporting FEMA's pre-disaster mitigation programs helps reduce the long-term costs and impacts of disasters.",
    ],
    fema_review: [
        "Improving the speed, simplicity, and accessibility of FEMA's individual assistance programs for disaster survivors.",
        "Strengthening FEMA's coordination with state, local, tribal, and territorial governments during disaster response.",
        "Ensuring FEMA's recovery and mitigation programs promote resilience and address climate change impacts.",
    ],
     fema_drf_cut: [ // Specific fund within FEMA
        "Oversight is needed to ensure the Disaster Relief Fund (DRF) is managed efficiently and that spending aligns with authorized purposes.",
        "Preventing wasteful spending or delays in obligation of DRF funds requires careful management.",
        "Balancing the need for a healthy DRF balance against overall federal budget constraints.",
    ],
    fema_drf_fund: [
        "Maintaining a sufficiently funded Disaster Relief Fund is crucial for ensuring FEMA can respond immediately and effectively to major disasters without requiring emergency supplemental appropriations.",
        "Predictable and adequate funding for the DRF provides stability for disaster response planning.",
        "Replenishing the DRF proactively ensures resources are available when the next disaster strikes.",
    ],
    fema_drf_review: [
        "Improving transparency regarding DRF spending and obligations.",
        "Ensuring DRF funding formulas and allocation processes are equitable and based on actual disaster needs.",
        "Evaluating the long-term solvency of the DRF given increasing disaster costs.",
    ],
    hud_cut: [
        "Many HUD programs require review for effectiveness in truly addressing the affordable housing crisis and reducing homelessness; streamlining bureaucracy is needed.",
        "Evaluating the cost-effectiveness of different HUD programs (e.g., vouchers vs. public housing development) is important.",
        "Reducing burdensome regulations associated with HUD funding could potentially spur more private sector housing development.",
    ],
    hud_fund: [
        "Tackling the nation's severe affordable housing crisis requires significant investment in HUD programs, including rental assistance (like Section 8 vouchers), public housing revitalization, and community development block grants.",
        "Expanding HUD resources is essential for reducing homelessness, promoting housing stability, and creating pathways to opportunity.",
        "Investing in affordable housing development and preservation through HUD programs stimulates local economies and addresses critical infrastructure needs.",
    ],
    hud_review: [
        "Improving the efficiency and effectiveness of HUD's rental assistance programs to serve more eligible families.",
        "Addressing the large capital backlog in public housing requires sustained investment and innovative solutions.",
        "Ensuring HUD programs effectively promote fair housing, reduce segregation, and expand opportunities in underserved communities.",
    ],
    head_start_cut: [
        "Head Start programs should be rigorously evaluated for long-term impact on child outcomes to ensure taxpayer investment yields results.",
        "Improving quality standards and accountability across all Head Start centers is necessary.",
        "Ensuring Head Start funding complements, rather than duplicates, state-funded pre-K programs.",
    ],
    head_start_fund: [
        "Head Start provides critical comprehensive early childhood education, health, nutrition, and family support services to low-income children, demonstrably improving school readiness and long-term outcomes.",
        "Expanding access to high-quality Head Start programs, particularly Early Head Start for infants and toddlers, is a vital investment in our nation's future.",
        "Adequate funding allows Head Start programs to maintain small class sizes, employ qualified staff, and provide comprehensive services.",
    ],
    head_start_review: [
        "Strengthening Head Start performance standards and ensuring consistent quality across all programs.",
        "Improving coordination between Head Start and K-12 school systems to support smooth transitions for children.",
        "Enhancing support for Head Start staff, including professional development and adequate compensation.",
    ],
    public_housing_cut: [
        "The traditional public housing model faces challenges; exploring alternative affordable housing strategies and improving management efficiency is needed.",
        "Addressing safety concerns and improving living conditions in existing public housing requires significant investment but also better oversight.",
        "Shifting towards housing vouchers (tenant-based rental assistance) is sometimes proposed as a more cost-effective alternative.",
    ],
    public_housing_fund: [
        "Addressing the significant capital repair backlog in the nation's public housing stock is crucial for providing safe and decent living conditions for low-income residents.",
        "Investing in the preservation and modernization of public housing ensures this vital affordable housing resource remains available.",
        "Funding is needed to support resident services and improve management practices in public housing authorities.",
    ],
    public_housing_review: [
        "Implementing effective strategies to address crime and improve safety in public housing developments.",
        "Promoting resident involvement and empowerment in public housing management.",
        "Exploring mixed-finance models and partnerships to revitalize public housing communities.",
    ],
    // --- Energy and Environment ---
    epa_cut: [
        "EPA regulations should be carefully crafted to achieve environmental goals without imposing excessive burdens on businesses and the economy; streamlining permitting processes is needed.",
        "Evaluating the cost-effectiveness of specific EPA regulations and prioritizing actions with the greatest environmental benefit.",
        "Ensuring the EPA relies on sound science and transparent data in its regulatory decisions.",
    ],
    epa_fund: [
        "Addressing critical environmental challenges like climate change, air and water pollution, and hazardous waste cleanup requires a well-funded and effective Environmental Protection Agency (EPA).",
        "Investing in EPA enforcement ensures that environmental laws are upheld and polluters are held accountable.",
        "Supporting EPA's scientific research provides the foundation for sound environmental policy and regulation.",
    ],
    epa_review: [
        "Improving the timeliness and efficiency of EPA's permitting and regulatory review processes.",
        "Ensuring EPA regulations are updated to reflect the best available science and technology.",
        "Strengthening EPA's capacity to address environmental justice issues and protect vulnerable communities disproportionately affected by pollution.",
    ],
     forest_service_cut: [
        "Reviewing Forest Service operations for efficiencies, particularly in timber management and administrative overhead.",
        "Balancing environmental protection with economic uses of national forests, such as logging and grazing, requires careful management.",
        "Prioritizing Forest Service resources towards the most critical wildfire prevention and ecosystem restoration needs.",
    ],
    forest_service_fund: [
        "Increased funding for the U.S. Forest Service is urgently needed to address the escalating wildfire crisis through hazardous fuels reduction, forest restoration, and supporting wildland firefighters.",
        "Investing in the health and resilience of our national forests is crucial for protecting watersheds, biodiversity, and recreational opportunities.",
        "Adequate resources allow the Forest Service to manage national forests sustainably for multiple uses.",
    ],
    forest_service_review: [
        "Improving the pace and scale of hazardous fuels treatments to reduce wildfire risk.",
        "Strengthening partnerships between the Forest Service, state agencies, and local communities for wildfire response and forest management.",
        "Ensuring adequate compensation, benefits, and mental health support for federal wildland firefighters.",
    ],
    noaa_cut: [
        "Evaluating NOAA programs for potential duplication with other agencies or the private sector.",
        "Prioritizing NOAA resources towards core functions like weather forecasting, fisheries management, and climate monitoring.",
        "Ensuring efficiency in NOAA's satellite programs and research vessel operations.",
    ],
    noaa_fund: [
        "The National Oceanic and Atmospheric Administration (NOAA) provides essential services, including life-saving weather forecasts and warnings, climate data, fisheries management, and coastal resilience efforts, requiring robust funding.",
        "Investing in NOAA's weather prediction capabilities, including advanced modeling and observation systems, protects lives and property.",
        "Supporting NOAA's research on oceans, climate change, and atmospheric science is critical for understanding and addressing environmental challenges.",
    ],
    noaa_review: [
        "Improving the accuracy and lead time of NOAA weather forecasts and warnings.",
        "Enhancing NOAA's role in supporting coastal communities adapting to sea-level rise and extreme weather.",
        "Ensuring sustainable management of U.S. fisheries based on the best available science from NOAA.",
    ],
    renewable_energy_cut: [
        "Government subsidies for mature renewable energy technologies like solar and wind should be phased out to allow market forces to drive deployment.",
        "Focusing federal energy R&D on breakthrough technologies rather than subsidizing existing ones.",
        "Evaluating the cost-effectiveness and necessity of specific Department of Energy efficiency and renewable energy programs.",
    ],
    renewable_energy_fund: [
        "Accelerating the transition to a clean energy economy requires significant federal investment in energy efficiency improvements and the research, development, and deployment of renewable energy technologies.",
        "Supporting renewable energy programs creates jobs, reduces greenhouse gas emissions, enhances energy security, and lowers energy costs for consumers.",
        "Investing in grid modernization is crucial to accommodate higher levels of renewable energy generation.",
    ],
    renewable_energy_review: [
        "Ensuring federal renewable energy programs effectively drive innovation and cost reductions.",
        "Improving permitting processes for renewable energy projects and transmission lines.",
        "Targeting investments towards next-generation renewable technologies and energy storage solutions.",
    ],
    nps_cut: [
        "While National Parks are treasures, reviewing National Park Service (NPS) operations for efficiencies and exploring increased reliance on visitor fees or private partnerships could be considered.",
        "Prioritizing NPS resources towards addressing the deferred maintenance backlog and core preservation needs.",
        "Balancing visitor access with resource protection requires careful management.",
    ],
    nps_fund: [
        "Protecting America's natural and cultural heritage requires adequate funding for the National Park Service to manage parks, address the significant deferred maintenance backlog, support educational programs, and ensure visitor safety.",
        "Investing in our National Parks preserves these invaluable resources for future generations and supports local tourism economies.",
        "Providing sufficient resources for NPS staff, including rangers and maintenance workers, is essential for park operations.",
    ],
    nps_review: [
        "Developing sustainable solutions to address the billions of dollars in deferred maintenance across the National Park system.",
        "Managing increasing visitor numbers to prevent overcrowding and resource damage.",
        "Enhancing interpretation and education programs to connect diverse audiences with park resources.",
    ],
    // --- International Affairs ---
    diplomacy_cut: [
        "Reviewing State Department operations for efficiencies, consolidating diplomatic posts where appropriate, and ensuring resources align with core foreign policy objectives.",
        "Evaluating the necessity and cost-effectiveness of all diplomatic programs and initiatives.",
        "Balancing investments in diplomacy with other foreign policy tools like defense and development aid.",
    ],
    diplomacy_fund: [
        "Robust funding for diplomacy and the Foreign Service strengthens U.S. influence, promotes peace and stability, advances economic interests, and often avoids the need for costlier military interventions.",
        "Investing in our diplomatic corps, embassies, and consulates provides the front line for engaging with the world and protecting American citizens abroad.",
        "Supporting public diplomacy programs enhances mutual understanding and counters disinformation.",
    ],
    diplomacy_review: [
        "Ensuring the State Department has the personnel, training, and resources needed to address complex global challenges.",
        "Modernizing diplomatic tools and communication strategies for the 21st century.",
        "Strengthening coordination between the State Department and other foreign affairs agencies like USAID and the Department of Defense.",
    ],
     usaid_cut: [
        "USAID programs require rigorous oversight and evaluation to ensure effectiveness, accountability, and alignment with U.S. strategic interests, avoiding waste or projects with limited impact.",
        "Focusing foreign aid on countries and sectors where it can demonstrably achieve sustainable development outcomes.",
        "Reducing administrative overhead within USAID and improving coordination with other donors.",
    ],
    usaid_fund: [
        "U.S. foreign aid administered by USAID addresses global poverty, promotes health and education, supports democratic governance, provides humanitarian assistance, and fosters long-term stability, advancing both American values and interests.",
        "Investing in global development through USAID can prevent conflicts, mitigate pandemics, and create new economic partners for the U.S.",
        "Adequate funding allows USAID to respond effectively to humanitarian crises and support long-term development goals.",
    ],
    usaid_review: [
        "Improving the measurement and reporting of USAID program outcomes to demonstrate impact and ensure accountability.",
        "Strengthening local partnerships and building capacity within recipient countries for sustainable development.",
        "Ensuring USAID programs are designed and implemented with transparency and strong safeguards against corruption.",
    ],
     usaid_climate_cut: [ // Specific USAID area
        "International climate aid provided through USAID should be carefully evaluated for effectiveness, ensuring funds contribute to verifiable emissions reductions or adaptation measures, and balanced against domestic needs.",
        "Prioritizing climate finance towards projects with the greatest impact and leveraging private sector investment.",
        "Ensuring transparency and accountability in how U.S. climate aid is used by recipient countries.",
    ],
    usaid_climate_fund: [
        "Addressing the global climate crisis requires U.S. leadership and investment, including supporting developing nations through USAID to transition to clean energy, protect forests, and adapt to climate impacts.",
        "International climate finance helps mitigate global emissions that affect the U.S. and fosters diplomatic cooperation.",
        "Investing in climate adaptation abroad can reduce instability and migration pressures driven by climate change.",
    ],
    usaid_climate_review: [
        "Ensuring U.S. climate aid aligns with broader development goals and supports sustainable economic growth.",
        "Improving coordination of climate finance across different U.S. government agencies.",
        "Developing robust monitoring, reporting, and verification (MRV) systems for international climate projects.",
    ],
    // --- Law Enforcement ---
    deportations_border_cut: [
        "Focusing border security resources on humane and efficient processing of asylum seekers, utilizing technology effectively, and addressing the root causes of migration may be more effective and less costly than solely emphasizing enforcement and deportations.",
        "Reviewing the cost and effectiveness of large-scale detention and deportation operations by ICE and CBP.",
        "Prioritizing enforcement actions based on public safety risks rather than broad sweeps.",
    ],
    deportations_border_fund: [
        "Securing the nation's borders requires adequate resources for Customs and Border Protection (CBP) personnel, technology (like surveillance systems), and infrastructure to manage migration flows and prevent illegal crossings.",
        "Funding for Immigration and Customs Enforcement (ICE) is needed for interior enforcement, investigating transnational crime, and managing detention and removal proceedings.",
        "Investing in border security helps maintain national sovereignty and control migration.",
    ],
    deportations_border_review: [
        "Ensuring humane treatment and due process for individuals encountered at the border or subject to immigration enforcement.",
        "Improving efficiency and reducing backlogs in immigration courts and asylum processing.",
        "Enhancing coordination between CBP, ICE, and other agencies involved in border management and immigration.",
    ],
    federal_prisons_cut: [
        "Exploring criminal justice reforms aimed at reducing incarceration rates for non-violent offenses, expanding alternatives to imprisonment, and improving rehabilitation programs could significantly lower the high cost of the federal prison system.",
        "Addressing overcrowding and improving conditions within federal prisons requires attention, but should be paired with efforts to reduce the overall prison population.",
        "Evaluating the effectiveness of different correctional programs in reducing recidivism.",
    ],
    federal_prisons_fund: [
        "Maintaining safe, secure, and humane federal prisons requires adequate funding for staffing (correctional officers), facility maintenance, inmate healthcare, and essential rehabilitation programs.",
        "Investing in education, job training, and substance abuse treatment programs within prisons can help reduce recidivism upon release.",
        "Addressing understaffing and ensuring the safety of both inmates and correctional officers is a critical need.",
    ],
    federal_prisons_review: [
        "Implementing evidence-based practices to reduce violence and improve safety within federal prisons.",
        "Enhancing oversight of healthcare services provided to federal inmates.",
        "Improving reentry programs to support successful transitions back into the community after incarceration.",
    ],
    // --- Transportation ---
    highways_cut: [
        "Federal highway funding should prioritize maintenance and repair of existing infrastructure over costly new highway expansion projects, which can induce more driving.",
        "Ensuring states use federal highway funds efficiently and exploring innovative financing mechanisms.",
        "Balancing highway investments with support for other transportation modes like public transit and rail.",
    ],
    highways_fund: [
        "Modernizing America's aging highway and bridge infrastructure requires significant federal investment to ensure safety, reduce congestion, and support economic activity.",
        "Providing predictable federal funding allows states to undertake large-scale transportation projects.",
        "Investing in highway improvements enhances freight movement and connects communities.",
    ],
    highways_review: [
        "Prioritizing projects that improve safety, reduce bottlenecks, and enhance resilience to climate change.",
        "Streamlining environmental review and permitting processes for critical infrastructure projects.",
        "Incorporating technology and 'smart highway' concepts to improve traffic flow and safety.",
    ],
     public_transit_cut: [
        "Federal public transit funding should prioritize systems with high ridership and demonstrated efficiency, encouraging local and state governments to bear a larger share of operating costs.",
        "Evaluating the cost-effectiveness of specific transit projects, particularly expensive new rail lines.",
        "Ensuring transit agencies operate efficiently and manage resources effectively.",
    ],
    public_transit_fund: [
        "Investing in expanding and improving public transit systems reduces traffic congestion, lowers transportation emissions, increases accessibility for non-drivers, and supports equitable economic development.",
        "Adequate federal funding helps transit agencies maintain safe and reliable service, upgrade aging infrastructure, and transition to cleaner fleets (e.g., electric buses).",
        "Supporting public transit provides affordable transportation options for millions of Americans.",
    ],
    public_transit_review: [
        "Improving service frequency, reliability, and coverage to attract more riders.",
        "Integrating public transit with other transportation modes like biking and walking.",
        "Ensuring transit systems are accessible to people with disabilities.",
    ],
    tsa_cut: [
        "Reviewing TSA screening procedures for efficiency and effectiveness, potentially adopting more risk-based approaches to reduce wait times and passenger inconvenience without compromising security.",
        "Evaluating the cost-effectiveness of specific TSA technologies and programs.",
        "Ensuring appropriate staffing levels and minimizing administrative overhead within the TSA.",
    ],
    tsa_fund: [
        "Maintaining aviation security requires adequate funding for the Transportation Security Administration (TSA) to staff checkpoints, operate screening technology, and address evolving threats.",
        "Investing in advanced screening technologies can enhance security effectiveness and potentially improve efficiency.",
        "Providing competitive pay and training for TSA officers is important for retention and performance.",
    ],
    tsa_review: [
        "Balancing rigorous security screening with passenger facilitation and privacy concerns.",
        "Continuously adapting security protocols to counter new and emerging threats.",
        "Improving communication and coordination between TSA, airports, and airlines.",
    ],
    faa_cut: [
        "Ensuring the Federal Aviation Administration (FAA) operates efficiently, particularly in areas like air traffic control modernization (NextGen) and regulatory processes.",
        "Evaluating the necessity of all FAA programs and prioritizing resources towards core safety functions.",
        "Streamlining aircraft certification processes while maintaining rigorous safety standards.",
    ],
    faa_fund: [
        "Ensuring the safety and efficiency of the U.S. airspace requires robust funding for the Federal Aviation Administration (FAA) to oversee airlines, manage air traffic control, certify aircraft, and invest in infrastructure modernization.",
        "Adequate FAA resources are critical for maintaining the safety record of American aviation.",
        "Investing in NextGen air traffic control modernization enhances capacity, reduces delays, and improves fuel efficiency.",
    ],
    faa_review: [
        "Addressing air traffic controller staffing shortages and improving training programs.",
        "Accelerating the implementation of NextGen technologies.",
        "Enhancing oversight of aircraft manufacturing and maintenance.",
    ],
     amtrak_cut: [
        "Amtrak's reliance on federal subsidies warrants scrutiny regarding its operational efficiency, route profitability, and long-term financial sustainability.",
        "Focusing federal rail investments on corridors with high potential ridership and economic benefit.",
        "Exploring increased private sector involvement or competition in passenger rail.",
    ],
    amtrak_fund: [
        "Investing in Amtrak and intercity passenger rail offers a crucial alternative to congested highways and airports, reduces transportation emissions, and connects communities across the country.",
        "Adequate federal funding allows Amtrak to upgrade aging infrastructure (especially on the Northeast Corridor), modernize its fleet, and expand service to underserved areas.",
        "Supporting passenger rail is part of building a balanced and sustainable national transportation system.",
    ],
    amtrak_review: [
        "Improving Amtrak's on-time performance, customer service, and financial management.",
        "Developing a long-term strategic plan for expanding and modernizing the national passenger rail network.",
        "Ensuring fair access for Amtrak trains on tracks owned by freight railroads.",
    ],
    // --- Science ---
    nasa_cut: [
        "NASA's budget requires careful prioritization, potentially focusing resources on core scientific missions and exploration goals with the highest potential return, while scrutinizing costs of large flagship programs.",
        "Evaluating the balance between human spaceflight programs and robotic missions or earth science research.",
        "Encouraging greater efficiency and cost control in NASA's project management.",
    ],
    nasa_fund: [
        "Investing in NASA fuels scientific discovery, drives technological innovation with broad economic benefits, inspires the next generation of scientists and engineers, and maintains U.S. leadership in space exploration.",
        "Funding for NASA missions—from Mars rovers and the James Webb Space Telescope to Earth observation satellites—expands human knowledge and benefits life on Earth.",
        "Supporting NASA's Artemis program aims to return humans to the Moon and eventually send them to Mars.",
    ],
    nasa_review: [
        "Ensuring NASA maintains a balanced portfolio of programs across science, aeronautics, and human exploration.",
        "Managing the costs and schedules of large, complex missions like Artemis and Mars Sample Return.",
        "Strengthening partnerships between NASA, international space agencies, and the commercial space industry.",
    ],
    nsf_cut: [
        "While basic research is vital, ensuring National Science Foundation (NSF) grants are awarded efficiently and target truly fundamental, high-impact research requires oversight.",
        "Evaluating the balance of NSF funding across different scientific disciplines.",
        "Minimizing administrative overhead associated with NSF grant processes.",
    ],
    nsf_fund: [
        "The National Science Foundation provides essential funding for fundamental research and education across all fields of science and engineering (outside medicine), driving innovation, economic competitiveness, and training the future STEM workforce.",
        "Investing in basic science through the NSF yields unpredictable but often transformative discoveries.",
        "Supporting NSF programs that broaden participation in science and engineering strengthens the nation's talent pool.",
    ],
    nsf_review: [
        "Maintaining the integrity and effectiveness of NSF's merit review process for grant proposals.",
        "Enhancing NSF's role in translating basic research discoveries into practical applications.",
        "Supporting STEM education initiatives from K-12 through graduate school.",
    ],
     nasa_spacex_cut: [ // Similar to Pentagon_SpaceX, but NASA context
        "NASA's reliance on commercial partners like SpaceX for cargo and crew transport needs careful oversight to ensure cost-effectiveness, safety, and fair value for taxpayers compared to traditional government-run programs.",
        "Promoting competition among commercial space providers is crucial for controlling costs.",
        "Evaluating the long-term strategy for utilizing public-private partnerships in space exploration.",
    ],
    nasa_spacex_review: [
        "Ensuring rigorous safety standards and mission assurance processes for commercial crew and cargo missions contracted by NASA.",
        "Transparency regarding the costs and performance of NASA's commercial spaceflight contracts.",
        "Balancing investments in commercial partnerships with NASA's internal capabilities and long-term exploration goals.",
    ],
    // Default fallbacks
    default_cut: ["This program's funding level warrants review for potential savings or reallocation to higher priorities.", "Efficiency improvements or budget reductions should be considered for this area."],
    default_fund: ["Increased investment in this area could yield significant public benefits and address important needs.", "Adequate funding for this program is necessary for it to achieve its objectives effectively."],
    default_review: ["This program requires closer oversight to ensure it operates efficiently and achieves its intended goals.", "Evaluating the effectiveness and impact of this program is important for accountability."],
};


// --- Sentence Construction Logic ---

// Selects a random phrasing from an array
function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Generates the core sentence about a specific item.
function generateItemSentence(item: SelectedItem, tone: ToneLevel): string {
    const fundingLevel = item.fundingLevel;
    const action = getFundingAction(fundingLevel);
    const reasonKey = `${item.id}_${action}`;

    // 1. Get the basic action phrase based on level and tone
    let baseActionPhrase = '';
    if (fundingLevel === -2) baseActionPhrase = randomChoice([ACTION[-2][tone], "requires drastic cuts or elimination."]);
    else if (fundingLevel === -1) baseActionPhrase = randomChoice([ACTION[-1][tone], "should be significantly scaled back."]);
    else if (fundingLevel === 0) baseActionPhrase = randomChoice([ACTION[0][tone], "funding could remain, but only with much stricter efficiency measures."]);
    else if (fundingLevel === 1) baseActionPhrase = randomChoice([ACTION[1][tone], "deserves reliable, perhaps increased, funding."]);
    else if (fundingLevel === 2) baseActionPhrase = randomChoice([ACTION[2][tone], "must receive a substantial boost in resources."]);

    // 2. Get a specific rationale, falling back to default
    const rationaleOptions = SPECIFIC_RATIONALES[reasonKey] || SPECIFIC_RATIONALES[`default_${action}`] || [""];
    const specificRationale = randomChoice(rationaleOptions);

    // 3. Combine description, action, and reason into a flowing sentence
    // Vary sentence structure based on tone and presence of rationale
    let sentence = `Regarding ${item.description}, I believe its funding ${baseActionPhrase}`;

    if (specificRationale) {
        // Integrate reason smoothly
        const connectors = tone < 2 ? [" As", " Indeed,", " Specifically,", " For instance,"] : [" Because", " Clearly,", " Simply put,"];
        const connector = randomChoice(connectors);
        // Adjust connector capitalization/punctuation based on preceding phrase
        if (sentence.endsWith('.')) {
             sentence += `${connector.trim()} ${specificRationale.charAt(0).toLowerCase() + specificRationale.slice(1)}`;
        } else {
             sentence += `;${connector.toLowerCase()} ${specificRationale.charAt(0).toLowerCase() + specificRationale.slice(1)}`;
        }
    }

     // Ensure sentence ends with punctuation.
    if (!sentence.endsWith('.') && !sentence.endsWith('!') && !sentence.endsWith('?')) {
        sentence += '.';
    }

    return sentence;
}


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

  const tone = mapAggressivenessToTone(aggressiveness);
  const subject = SUBJECTS[tone];
  const opening = OPENINGS[tone](userLocation || '[Your City, ST]'); // Add fallback for location
  const introToList = selectedItems.length > 0 ? `\n\n${INTROS_TO_ITEMS[tone]}\n` : "";

  // Generate sentences for each item and combine into a paragraph block
  const itemSentences = selectedItems.map(item => generateItemSentence(item, tone));
  // Join with spaces for a paragraph feel, but maybe add bullet points for longer lists?
  // For now, join with space. Consider adding list formatting if > 3-4 items.
  const itemDetailsParagraph = itemSentences.join(' ');

  const budgetParagraph = balanceBudgetPreference ? `\n\n${BUDGET_DEBT[tone]}` : "";

  // Refine call to action based on whether items or only budget preference was selected
  let callToActionText = '';
  if (selectedItems.length > 0 && balanceBudgetPreference) {
      callToActionText = CALL_TO_ACTION[tone].replace('these issues', 'these specific items and the broader issue of fiscal responsibility').replace('these spending imbalances', 'these specific spending concerns and promote overall fiscal sustainability');
  } else if (selectedItems.length > 0) {
       callToActionText = CALL_TO_ACTION[tone].replace(' and the broader issue of fiscal responsibility', '').replace(' and promote overall fiscal sustainability', '');
  } else if (balanceBudgetPreference) {
       // If only budget preference is checked, tailor the call to action
       callToActionText = {
            0: "Could you please share your perspective on achieving greater fiscal responsibility in the federal budget? I appreciate your service.",
            1: "I ask that you outline the specific steps you plan to take to promote fiscal sustainability. Keeping constituents informed on this crucial matter is important.",
            2: "I expect a detailed response describing the concrete actions you will champion to aggressively curb the national debt. Accountability on fiscal discipline is paramount.",
            3: "I demand a prompt and specific action plan from your office detailing how you will fight for fiscal responsibility and present a clear path to tackling the national debt. Failure to act decisively is unacceptable."
       }[tone];
  } else {
      // Fallback if somehow called with no selections (shouldn't happen via UI)
      callToActionText = "I look forward to hearing your general thoughts on the federal budget.";
  }
  const callToAction = `\n\n${callToActionText}`;


  const salutation = "Sincerely,";
  const signature = `${userName || '[Your Name]'}\n${userLocation || '[Your City, State, Zip Code]'}`;

  // Assemble the body
  let body = opening;
  if (introToList && itemDetailsParagraph) {
      body += introToList + itemDetailsParagraph;
  }
  body += budgetParagraph;
  body += callToAction;
  body += `\n\n${salutation}\n\n${signature}`;

  // Basic cleanup: ensure single newlines between paragraphs, trim whitespace
  body = body.replace(/\n\n+/g, '\n\n').trim();

  return { subject, body };
}
