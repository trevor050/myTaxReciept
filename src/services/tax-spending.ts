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

// Reference total tax amount from the provided example
const REFERENCE_TOTAL_TAX = 52000;

/**
 * Asynchronously retrieves a detailed tax spending breakdown for a given location and tax amount.
 * This currently returns mock data based on the user-provided example.
 *
 * @param location The location for which to retrieve tax spending data (currently unused in mock).
 * @param taxAmount The total tax amount paid by the user (used for calculating absolute amounts).
 * @returns A promise that resolves to an array of TaxSpending objects representing the detailed spending breakdown.
 */
export async function getTaxSpending(location: Location, taxAmount: number): Promise<TaxSpending[]> {
  // TODO: Replace this mock data implementation with a call to a real API based on location.

  // Mock data derived from the user-provided example ($52,000 total)
  // Added tooltipText and wikiLink for all items
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
      // Updated activism-focused paragraph for Interest on Debt
      // Note: Actual national debt will be fetched dynamically in the component
      tooltipText: 'This substantial portion represents the cost of servicing the national debt. This debt is a direct consequence of sustained government spending exceeding revenue collection. Decades of deficit spending (often driven by tax cuts for the wealthy and corporations, unfunded wars, and economic bailouts) contribute to this substantial burden. High interest payments divert critical funds from essential public services, infrastructure projects, education systems, and potential tax relief, raising serious questions about long-term fiscal stability and the accountability of our government\'s financial management.',
      // No subItems, special paragraph handled in component
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
            { id: 'usaid_climate', description: 'USAID - Climate Aid', amountPerDollar: 8.77 / REFERENCE_TOTAL_TAX, tooltipText: 'Specific funding within USAID dedicated to helping other countries mitigate and adapt to the impacts of climate change.', wikiLink: 'https://www.usaid.gov/climate' }, // Link to USAID climate page might be better
        ],
    },
    {
        id: 'law_enforcement',
        category: 'Law Enforcement',
        percentage: (668.42 / REFERENCE_TOTAL_TAX) * 100, // ~1.29%
        subItems: [
            { id: 'deportations_border', description: 'Deportations & border patrol', amountPerDollar: 287.64 / REFERENCE_TOTAL_TAX, tooltipText: 'Funding primarily for Immigration and Customs Enforcement (ICE) for interior enforcement/deportations and Customs and Border Protection (CBP) for border security.', wikiLink: 'https://en.wikipedia.org/wiki/U.S._Immigration_and_Customs_Enforcement' }, // Linking ICE as example
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
            { id: 'nasa_spacex', description: 'NASA - SpaceX Contracts', amountPerDollar: 14.95 / REFERENCE_TOTAL_TAX, tooltipText: 'Contracts awarded by NASA to SpaceX for commercial cargo resupply, crew transportation to the ISS, and lunar landing systems (Artemis).', wikiLink: 'https://en.wikipedia.org/wiki/SpaceX#NASA_contracts' }, // More specific link
        ],
    },
    // Add other categories similarly...
  ];

   // Sort by percentage descending
  detailedBreakdown.sort((a, b) => b.percentage - a.percentage);

  return detailedBreakdown;
}


// ---------- shared types ---------------------------------------------------
export interface SelectedItem {
  id: string;
  description: string;
  /**
   * -2  Slash Heavily  | -1 Cut Significantly | 0 Improve Efficiency
   *  1  Fund           |  2 Fund More
   */
  fundingLevel: -2 | -1 | 0 | 1 | 2;
}

// ---------- helpers --------------------------------------------------------

/** Map 0-100 slider to tone bucket 0-3 */
function toneBucket(aggr: number): 0 | 1 | 2 | 3 {
  return Math.min(3, Math.floor(aggr / 25)) as 0 | 1 | 2 | 3;
}

const SUBJECT: Record<0 | 1 | 2 | 3, string> = {
  0: "A Thoughtful Request on Federal Budget Priorities",
  1: "Concerns About Current Federal Spending",
  2: "Urgent Action Needed on Federal Budget & Debt",
  3: "Immediate Reform Demanded: Federal Spending Out of Control"
};

const OPENING: Record<0 | 1 | 2 | 3, (loc: string) => string> = {
  0: loc => `I hope this message finds you well. I’m writing as a constituent from ${loc || '[your area]'} to share some thoughts on how our tax dollars are being allocated. I believe it's essential that these funds are used responsibly and reflect the priorities of the people they serve.`,
  1: loc => `As your constituent in ${loc || '[your area]'}, I’m increasingly worried about how federal funds are distributed and would like to raise a few points for your consideration. The current spending patterns raise questions about efficiency and alignment with our community's needs.`,
  2: loc => `I’m writing from ${loc || '[your area]'} to express serious dissatisfaction with the current federal budget priorities and to insist that they be re-evaluated immediately. It is imperative that taxpayer money is directed towards initiatives that genuinely benefit the public, not wasted on ineffective or bloated programs.`,
  3: loc => `From ${loc || '[your area]'}, I am sounding the alarm: the present pattern of federal spending is unacceptable and must change without delay. The level of waste and misallocation demands immediate and decisive action from our elected officials.`
};

const LIST_INTRO: Record<0 | 1 | 2 | 3, string> = {
  0: "After reviewing estimates of federal spending, below are the areas I believe deserve a closer look and potential adjustment:",
  1: "My examination of the federal budget breakdown reveals several items of particular concern which I believe require your attention:",
  2: "Based on current spending levels, these specific line-items demand immediate correction and significant changes to their funding:",
  3: "Here are some of the most egregious examples of misplaced priorities and wasteful spending that require your direct intervention:"
};

// action phrases indexed by fundingLevel + tone bucket
const ACTION: Record<-2 | -1 | 0 | 1 | 2, [string, string, string, string]> = {
  [-2]: [ // Slash Heavily
    "funding for which should be dramatically reduced or potentially phased out entirely, as it seems to offer limited value compared to its cost.",
    "which requires a steep reduction; continuing to fund it at current levels appears to be a misuse of taxpayer money.",
    "which must be slashed; the current allocation is indefensible given other pressing needs and the potential for waste.",
    "which must be eliminated. Continuing to fund this represents a betrayal of public trust and fiscal responsibility."
  ],
  [-1]: [ // Cut Significantly
    "which could likely be cut back significantly without harming its core mission, freeing up resources for other priorities.",
    "which requires a significant trim; the budget appears bloated compared to the outcomes it delivers.",
    "which demands a sharp cut. Its current size seems disproportionate, and funds could be better allocated elsewhere.",
    "which needs an aggressive cut. Taxpayers deserve better stewardship of their money than continuing this level of expenditure."
  ],
  [0]: [ // Improve Efficiency
    "the funding level for which seems appropriate, but I urge you to advocate for much tighter oversight and efficiency measures to maximize its impact.",
    "which can remain level, provided there are demonstrable improvements in efficiency and accountability in its operation.",
    "which might stay flat, but only if every dollar is meticulously justified through strict auditing and performance metrics.",
    "which may be justified, but only with rigorous, ongoing oversight to eliminate all potential waste and ensure it achieves its stated goals effectively."
  ],
  [1]: [ // Fund
    "which deserves dependable support. Ensuring stable, adequate funding is essential for it to continue its important work.",
    "which should receive modest and sustainable funding growth to better meet public needs and enhance its effectiveness.",
    "which warrants a clear funding boost given its proven value and positive impact on our communities.",
    "which requires a noticeable increase in funding so it can deliver crucial results at the scale needed."
  ],
  [2]: [ // Fund More
    "which merits a substantial increase in investment. The potential returns and public benefits strongly justify the additional resources.",
    "which needs robust new investment to unlock its full potential and significantly scale its positive impact.",
    "which should be prioritized for major funding growth immediately to address critical needs and opportunities.",
    "which demands urgent, considerable expansion. Anything less represents negligence and a failure to invest in our future."
  ]
};

const BUDGET_DEBT: Record<0 | 1 | 2 | 3, string> = {
  0: "In addition to these specific items, I encourage Congress to keep our long-term national debt in mind and consistently work toward a balanced federal budget where feasible.",
  1: "Furthermore, I urge you to pair any significant spending decisions with a credible and transparent plan for reducing the national debt, which remains a serious concern.",
  2: "Fiscal discipline cannot wait any longer. Balancing the budget must become a central and urgent priority in every legislative discussion and decision.",
  3: "The soaring national debt is an unsustainable burden on future generations. A concrete, aggressive debt-reduction plan is non-negotiable and must be implemented immediately."
};

const CALL_TO_ACTION: Record<0 | 1 | 2 | 3, (hasBudgetPref: boolean) => string> = {
    0: (hasBudgetPref) => `Could you please share your perspective on the funding for these programs${hasBudgetPref ? ' and your approach to achieving greater fiscal responsibility' : ''}? I appreciate your service to our district/state and look forward to hearing your thoughts.`,
    1: (hasBudgetPref) => `I ask that you outline the specific steps you plan to take to address these spending imbalances${hasBudgetPref ? ' and promote fiscal sustainability' : ''}. Keeping constituents informed on these matters is crucial.`,
    2: (hasBudgetPref) => `I expect a detailed response describing the concrete actions you will champion to fix these misguided priorities${hasBudgetPref ? ' and aggressively curb the national debt' : ''}. Accountability on this is paramount.`,
    3: (hasBudgetPref) => `I demand a prompt and specific action plan from your office detailing how you will fight to realign this irresponsible spending${hasBudgetPref ? ' and present a clear path to tackling the national debt' : ''}. Failure to act decisively is unacceptable.`
};


// Greatly expanded list of specific, brief rationales tied to item IDs.
const SPECIFIC_REASONS: Record<string, string> = {
  medicaid_cut: "While important, Medicaid costs need careful review to ensure sustainability without compromising essential care for the vulnerable.",
  medicaid_increase: "Expanding Medicaid access improves health outcomes and economic stability for low-income families.",
  medicare_cut: "Medicare's long-term solvency requires exploring efficiency improvements and cost-saving measures.",
  medicare_increase: "Ensuring seniors have reliable access to quality healthcare through Medicare is a vital commitment.",
  nih_cut: "NIH funding should be scrutinized to ensure research grants are awarded efficiently and target the most pressing health challenges.",
  nih_increase: "Investing in NIH research fuels medical breakthroughs, improves public health, and drives economic growth in biotechnology.",
  cdc_cut: "CDC operations need review for efficiency, but core functions like disease surveillance are essential.",
  cdc_increase: "A robust CDC is critical for pandemic preparedness and protecting national health security.",
  substance_mental_health_cut: "Funding for substance use programs should prioritize evidence-based treatments with proven effectiveness.",
  substance_mental_health_increase: "Addressing the mental health and addiction crisis requires significantly more resources for treatment and prevention.",
  pentagon_cut: "The vast Pentagon budget needs trimming, focusing on genuine defense needs over wasteful projects or excessive contractor profits.",
  pentagon_increase: "Maintaining a strong national defense requires adequate funding for personnel, readiness, and modernization.",
  pentagon_contractors_cut: "Defense contracting requires far greater transparency and stricter oversight to prevent widespread waste, fraud, and abuse.",
  pentagon_personnel_cut: "Military personnel costs should be reviewed for efficiency while ensuring fair compensation and benefits for service members.",
  pentagon_personnel_increase: "Attracting and retaining skilled military personnel requires competitive pay, benefits, and quality of life improvements.",
  pentagon_top5_contractors_cut: "Over-reliance on a few large contractors stifles competition and inflates costs; their share needs reduction.",
  nuclear_weapons_cut: "Maintaining an excessive nuclear arsenal is costly and arguably increases global instability; modernization should be limited.",
  nuclear_weapons_increase: "Modernizing the nuclear deterrent is deemed necessary by some for national security in a complex world.",
  foreign_military_aid_cut: "Foreign military aid often fuels conflicts and diverts resources from domestic needs; it should be sharply curtailed.",
  foreign_military_aid_increase: "Strategic military aid can strengthen allies and support U.S. foreign policy objectives.",
  israel_wars_cut: "Unconditional military aid to foreign nations, regardless of context, drains resources and can entangle the U.S. in conflicts.",
  f35_cut: "The F-35 program has been plagued by cost overruns and performance issues, warranting significant funding cuts.",
  pentagon_spacex_cut: "Public funds subsidizing established private space companies like SpaceX require stronger justification regarding taxpayer value.",
  pentagon_dei_cut: "DEI initiatives within the military should be evaluated for effectiveness and cost, ensuring focus remains on core readiness.",
  va_cut: "VA services need streamlining for efficiency, but cuts must not compromise care for those who served.",
  va_increase: "Fulfilling our promise to veterans requires fully funding VA healthcare, benefits processing, and support services.",
  pact_act_increase: "Addressing toxic exposure requires robust funding for the PACT Act to provide veterans the care they earned.",
  tanf_cut: "TANF effectiveness needs review; funds should support pathways to self-sufficiency, not just temporary relief.",
  tanf_increase: "Strengthening the social safety net requires adequate funding for TANF to support vulnerable families.",
  child_tax_credit_cut: "The Child Tax Credit's structure should be reviewed for cost-effectiveness and targeting.",
  child_tax_credit_increase: "Expanding the Child Tax Credit directly reduces child poverty and supports working families.",
  refugee_assistance_cut: "Refugee resettlement costs should be managed efficiently, focusing on sustainable integration.",
  refugee_assistance_increase: "Providing adequate support for refugee resettlement reflects American values and international obligations.",
  liheap_increase: "LIHEAP is crucial for preventing energy shutoffs and ensuring vulnerable households can afford heating/cooling.",
  nlrb_cut: "The NLRB's role and funding should be reviewed in the context of modern labor relations.",
  nlrb_increase: "Protecting workers' rights requires a fully funded NLRB to investigate unfair labor practices.",
  dept_education_cut: "The federal role in education should be focused and efficient, avoiding bureaucratic overreach.",
  dept_education_increase: "Investing in education at all levels is crucial for national competitiveness and opportunity.",
  college_aid_cut: "Federal college aid programs need reform to address rising tuition costs and loan burdens.",
  college_aid_increase: "Expanding access to affordable higher education through grants and aid strengthens the workforce.",
  k12_schools_cut: "Federal K-12 funding should supplement, not supplant, state/local responsibility, focusing on targeted needs.",
  k12_schools_increase: "Supporting under-resourced K-12 schools, especially for disadvantaged students, is a critical federal role.",
  cpb_cut: "Federal funding for public broadcasting faces scrutiny regarding necessity in a diverse media landscape.",
  imls_cut: "Museum and library funding should be evaluated for impact, potentially shifting more responsibility locally.",
  snap_cut: "SNAP efficiency and work requirements are areas for potential reform, while ensuring food security.",
  snap_increase: "SNAP is a vital defense against hunger and food insecurity for millions of Americans.",
  school_lunch_increase: "Ensuring children have access to nutritious meals at school improves health and academic performance.",
  fsa_cut: "Farm subsidies need reform to reduce market distortions and target support effectively.",
  wic_increase: "WIC provides crucial nutritional support for mothers and young children, improving long-term health.",
  fdic_note: "FDIC funding, while essential for financial stability, operates largely outside direct appropriations.", // Special case
  irs_cut: "IRS funding should focus on efficient tax administration and taxpayer service, not overly burdensome enforcement.",
  irs_increase: "Adequate IRS funding is necessary to close the tax gap, ensure fairness, and improve taxpayer services.",
  federal_courts_increase: "A well-functioning judiciary requires sufficient funding for courts, judges, and staff.",
  public_defenders_increase: "Ensuring the constitutional right to counsel requires adequate funding for federal public defenders.",
  usps_note: "The Postal Service primarily relies on its own revenue, but requires congressional oversight on reforms.", // Special case
  cfpb_cut: "The CFPB's broad regulatory power and funding structure warrant ongoing scrutiny.",
  mbda_increase: "Supporting minority-owned businesses through the MBDA helps address systemic economic disparities.",
  fema_increase: "Increasing frequency and severity of disasters necessitate robust FEMA funding for response and recovery.",
  fema_drf_increase: "The Disaster Relief Fund requires sufficient resources to meet the immediate needs following major disasters.",
  hud_cut: "HUD programs need review for effectiveness in addressing housing affordability and homelessness.",
  hud_increase: "Tackling the affordable housing crisis requires significant investment in HUD programs and rental assistance.",
  head_start_increase: "Head Start provides critical early childhood education and support for disadvantaged children.",
  public_housing_increase: "Investing in public housing maintenance and development is crucial for providing safe, affordable homes.",
  epa_cut: "EPA regulations should be balanced, protecting the environment without unduly burdening the economy.",
  epa_increase: "Addressing climate change and pollution requires a well-funded EPA to enforce environmental laws.",
  forest_service_increase: "Increased funding for the Forest Service is needed for wildfire prevention, mitigation, and forest health.",
  noaa_increase: "NOAA provides essential weather forecasting, climate monitoring, and oceanic research.",
  renewable_energy_cut: "Government subsidies for mature renewable energy technologies should be phased out.",
  renewable_energy_increase: "Accelerating the transition to clean energy requires strong investment in renewables and efficiency.",
  nps_increase: "Maintaining our national parks requires adequate funding for infrastructure, conservation, and staffing.",
  diplomacy_increase: "Robust funding for diplomacy and foreign service strengthens U.S. influence and avoids costly conflicts.",
  usaid_cut: "USAID programs need better oversight to ensure effectiveness and alignment with U.S. interests.",
  usaid_increase: "Foreign aid through USAID addresses global poverty, promotes stability, and fosters goodwill.",
  usaid_climate_cut: "International climate aid should be balanced against domestic needs and focus on verifiable results.",
  deportations_border_cut: "Focusing on border security should prioritize humane treatment and efficient processing, not just enforcement.",
  deportations_border_increase: "Securing the border requires adequate resources for personnel, technology, and infrastructure.",
  federal_prisons_cut: "Reforms are needed to reduce incarceration rates and associated costs, focusing on rehabilitation.",
  highways_increase: "Modernizing crumbling highway infrastructure requires significant federal investment.",
  public_transit_increase: "Expanding and improving public transit reduces congestion, lowers emissions, and increases accessibility.",
  tsa_cut: "TSA efficiency and screening methods need continuous review to balance security and passenger convenience.",
  faa_increase: "Ensuring aviation safety requires robust FAA funding for air traffic control modernization and oversight.",
  amtrak_increase: "Investing in Amtrak and passenger rail offers a viable alternative to congested highways and air travel.",
  nasa_increase: "NASA's exploration and scientific research inspire innovation and advance our understanding of the universe.",
  nsf_increase: "Funding basic scientific research through the NSF is crucial for long-term technological advancement.",
  nasa_spacex_cut: "Contracts with private space companies need rigorous oversight to ensure fair value for taxpayers.",
  // Add default/fallback messages if needed
  default_cut: "This area's funding warrants review for potential savings or reallocation.",
  default_increase: "Increased investment in this area could yield significant public benefits.",
};


/**
 * Generates a draft email to representatives based on selected spending items and customization options.
 * Uses the new, more detailed and natural-sounding generation logic.
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
  const opening = OPENING[tone](userLocation);
  const itemListIntro = selectedItems.length > 0 ? LIST_INTRO[tone] : "";

  const itemDetails = selectedItems.map(item => {
    const actionPhrase = ACTION[item.fundingLevel][tone];
    // Attempt to find a specific reason based on ID and funding level context
    let reasonKey = item.id;
    if (['medicaid', 'medicare', 'nih', 'cdc', 'pentagon', 'pentagon_personnel', 'nuclear_weapons', 'foreign_military_aid', 'israel_wars', 'f35', 'pentagon_spacex', 'pentagon_dei', 'va', 'tanf', 'child_tax_credit', 'refugee_assistance', 'nlrb', 'dept_education', 'college_aid', 'k12_schools', 'cpb', 'imls', 'snap', 'fsa', 'irs', 'public_defenders', 'cfpb', 'hud', 'epa', 'renewable_energy', 'usaid', 'usaid_climate', 'deportations_border', 'federal_prisons', 'tsa', 'nasa_spacex'].includes(item.id)) {
        if (item.fundingLevel < 0) reasonKey += '_cut';
        else if (item.fundingLevel > 0) reasonKey += '_increase';
    } else if (['fdic', 'usps'].includes(item.id)) {
         reasonKey += '_note'; // Special non-funding comment
    }

    const specificReason = SPECIFIC_REASONS[reasonKey] || (item.fundingLevel < 0 ? SPECIFIC_REASONS.default_cut : SPECIFIC_REASONS.default_increase) || ""; // Fallback reason

    // Combine description, action phrase, and specific reason smoothly
    return `Regarding ${item.description}, I believe its funding ${actionPhrase}${specificReason ? ` ${specificReason}` : ''}`;
  }).join(' '); // Join with spaces for a more paragraph-like flow

  const budgetParagraph = balanceBudgetPreference ? `\n\n${BUDGET_DEBT[tone]}` : "";

  const callToAction = `\n\n${CALL_TO_ACTION[tone](balanceBudgetPreference)}`;

  const salutation = "Sincerely,";
  const signature = `${userName || '[Your Name]'}\n${userLocation || '[Your City, State, Zip Code]'}`;

  // Assemble the body
  let body = opening;
  if (itemListIntro && itemDetails) {
      body += `\n\n${itemListIntro}\n\n${itemDetails}`;
  }
  body += budgetParagraph;
  body += callToAction;
  body += `\n\n${salutation}\n\n${signature}`;

  // Basic cleanup: ensure single newlines between paragraphs, remove leading/trailing whitespace
  body = body.replace(/\n\n+/g, '\n\n').trim();

  return { subject, body };
}