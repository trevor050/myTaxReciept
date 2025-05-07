
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
  // Mock data derived from the user-provided example ($52,000 total)
  // Includes tooltipText and wikiLink for all items
  const detailedBreakdown: TaxSpending[] = [
    {
      id: 'health',
      category: 'Health',
      percentage: (12906.86 / REFERENCE_TOTAL_TAX) * 100, // ~24.82%
      subItems: [
        { id: 'medicaid', description: 'Medicaid', amountPerDollar: 5336.01 / REFERENCE_TOTAL_TAX, tooltipText: 'Provides health coverage for low-income individuals and families, jointly funded by federal and state governments.', wikiLink: 'https://en.wikipedia.org/wiki/Medicaid', category: 'Health' },
        { id: 'medicare', description: 'Medicare', amountPerDollar: 4854.13 / REFERENCE_TOTAL_TAX, tooltipText: 'Federal health insurance program primarily for people aged 65 or older, and some younger people with disabilities.', wikiLink: 'https://en.wikipedia.org/wiki/Medicare_(United_States)', category: 'Health' },
        { id: 'nih', description: 'National Institutes of Health', amountPerDollar: 436.73 / REFERENCE_TOTAL_TAX, tooltipText: 'The primary U.S. agency responsible for biomedical and public health research.', wikiLink: 'https://en.wikipedia.org/wiki/National_Institutes_of_Health', category: 'Health' },
        { id: 'cdc', description: 'Centers for Disease Control & Prevention (CDC)', amountPerDollar: 137.72 / REFERENCE_TOTAL_TAX, tooltipText: 'National public health agency focused on disease control, prevention, and health promotion.', wikiLink: 'https://en.wikipedia.org/wiki/Centers_for_Disease_Control_and_Prevention', category: 'Health' },
        { id: 'substance_mental_health', description: 'Substance use & mental health programs', amountPerDollar: 86.89 / REFERENCE_TOTAL_TAX, tooltipText: 'Funding for programs addressing substance abuse and mental health issues, primarily via SAMHSA.', wikiLink: 'https://en.wikipedia.org/wiki/Substance_Abuse_and_Mental_Health_Services_Administration', category: 'Health' },
      ],
    },
    {
      id: 'war_weapons',
      category: 'War and Weapons',
      percentage: (10852.53 / REFERENCE_TOTAL_TAX) * 100, // ~20.87%
      subItems: [
        { id: 'pentagon', description: 'Pentagon', amountPerDollar: 8574.28 / REFERENCE_TOTAL_TAX, tooltipText: 'Overall budget for the United States Department of Defense headquarters and operations.', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Department_of_Defense', category: 'War and Weapons' },
        { id: 'pentagon_contractors', description: 'Pentagon - Contractors', amountPerDollar: 4187.01 / REFERENCE_TOTAL_TAX, tooltipText: 'Funds paid to private companies contracted by the Department of Defense for various services, equipment, and research.', wikiLink: 'https://en.wikipedia.org/wiki/Military_contractor', category: 'War and Weapons' },
        { id: 'pentagon_personnel', description: 'Pentagon - Military Personnel', amountPerDollar: 1786.15 / REFERENCE_TOTAL_TAX, tooltipText: 'Costs associated with salaries, benefits, housing, and support for active-duty military members.', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Armed_Forces', category: 'War and Weapons' },
        { id: 'pentagon_top5_contractors', description: 'Pentagon - Top 5 Contractors', amountPerDollar: 1137.58 / REFERENCE_TOTAL_TAX, tooltipText: 'Spending allocated specifically to the five largest private defense contractors (e.g., Lockheed Martin, Boeing, Raytheon).', wikiLink: 'https://en.wikipedia.org/wiki/List_of_United_States_defense_contractors_by_arms_sales', category: 'War and Weapons' },
        { id: 'nuclear_weapons', description: 'Nuclear Weapons', amountPerDollar: 339.51 / REFERENCE_TOTAL_TAX, tooltipText: 'Funding for the development, maintenance, security, and modernization of the U.S. nuclear arsenal, managed by the NNSA.', wikiLink: 'https://en.wikipedia.org/wiki/Nuclear_weapons_of_the_United_States', category: 'War and Weapons' },
        { id: 'foreign_military_aid', description: 'Aid to foreign militaries', amountPerDollar: 258.74 / REFERENCE_TOTAL_TAX, tooltipText: 'Financial and material assistance (e.g., weapons, training) provided to the armed forces of other countries.', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Foreign_Military_Financing', category: 'War and Weapons' },
        { id: 'israel_wars', description: 'Israel wars (Pentagon & aid)', amountPerDollar: 214.14 / REFERENCE_TOTAL_TAX, tooltipText: 'Specific allocation related to U.S. support for Israel\'s military and defense, including direct aid and joint military operations.', wikiLink: 'https://en.wikipedia.org/wiki/Israel%E2%80%93United_States_military_relations', category: 'War and Weapons' },
        { id: 'f35', description: 'F-35 Jet Fighter', amountPerDollar: 127.86 / REFERENCE_TOTAL_TAX, tooltipText: 'Funding for the F-35 Lightning II program, a family of single-seat, single-engine, all-weather stealth multirole combat aircraft.', wikiLink: 'https://en.wikipedia.org/wiki/Lockheed_Martin_F-35_Lightning_II', category: 'War and Weapons' },
        { id: 'pentagon_spacex', description: 'Pentagon - SpaceX Contracts', amountPerDollar: 17.04 / REFERENCE_TOTAL_TAX, tooltipText: 'Contracts awarded by the Department of Defense to SpaceX for national security space launch services and other projects.', wikiLink: 'https://en.wikipedia.org/wiki/SpaceX#Government_contracts', category: 'War and Weapons' },
        { id: 'pentagon_dei', description: 'Pentagon - Diversity, Equity, Inclusion (DEI)', amountPerDollar: 1.08 / REFERENCE_TOTAL_TAX, tooltipText: 'Funding allocated to Diversity, Equity, and Inclusion initiatives and programs within the Department of Defense.', wikiLink: 'https://en.wikipedia.org/wiki/Diversity,_equity,_and_inclusion', category: 'War and Weapons' },
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
        { id: 'va', description: 'Veterans\' Affairs (VA)', amountPerDollar: 3251.63 / REFERENCE_TOTAL_TAX, tooltipText: 'Provides a wide range of services including healthcare, disability compensation, education benefits (GI Bill), home loans, and burial benefits to U.S. military veterans.', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Department_of_Veterans_Affairs', category: 'Veterans' },
        { id: 'pact_act', description: 'Veterans Toxic Exposure Fund (PACT Act)', amountPerDollar: 189.31 / REFERENCE_TOTAL_TAX, tooltipText: 'Specifically funds healthcare, research, and benefits for veterans exposed to burn pits, Agent Orange, and other toxic substances during military service.', wikiLink: 'https://en.wikipedia.org/wiki/PACT_Act', category: 'Veterans' },
      ],
    },
    {
      id: 'unemployment_labor',
      category: 'Unemployment and Labor',
      percentage: (3089.14 / REFERENCE_TOTAL_TAX) * 100, // ~5.94%
      subItems: [
        { id: 'tanf', description: 'Temporary Assistance for Needy Families', amountPerDollar: 530.51 / REFERENCE_TOTAL_TAX, tooltipText: 'Provides temporary financial assistance, job training, and support services to low-income families with children, aimed at promoting self-sufficiency.', wikiLink: 'https://en.wikipedia.org/wiki/Temporary_Assistance_for_Needy_Families', category: 'Unemployment and Labor' },
        { id: 'child_tax_credit', description: 'Child Tax Credit', amountPerDollar: 270.23 / REFERENCE_TOTAL_TAX, tooltipText: 'A tax credit provided to eligible taxpayers for qualifying dependent children, designed to help offset the cost of raising children.', wikiLink: 'https://en.wikipedia.org/wiki/Child_tax_credit_(United_States)', category: 'Unemployment and Labor' },
        { id: 'refugee_assistance', description: 'Refugee Assistance', amountPerDollar: 76.71 / REFERENCE_TOTAL_TAX, tooltipText: 'Funding for programs supporting the resettlement, integration, and initial needs of refugees admitted to the United States.', wikiLink: 'https://en.wikipedia.org/wiki/Office_of_Refugee_Resettlement', category: 'Unemployment and Labor' },
        { id: 'liheap', description: 'Low Income Home Energy Assistance Program', amountPerDollar: 49.13 / REFERENCE_TOTAL_TAX, tooltipText: 'Helps eligible low-income households pay their heating and cooling bills, and covers energy crisis assistance and weatherization.', wikiLink: 'https://en.wikipedia.org/wiki/Low_Income_Home_Energy_Assistance_Program', category: 'Unemployment and Labor' },
        { id: 'nlrb', description: 'National Labor Relations Board (NLRB)', amountPerDollar: 3.00 / REFERENCE_TOTAL_TAX, tooltipText: 'An independent U.S. government agency enforcing federal labor law concerning collective bargaining and unfair labor practices by employers and unions.', wikiLink: 'https://en.wikipedia.org/wiki/National_Labor_Relations_Board', category: 'Unemployment and Labor' },
      ],
    },
    {
      id: 'education',
      category: 'Education',
      percentage: (2382.28 / REFERENCE_TOTAL_TAX) * 100, // ~4.58%
      subItems: [
        { id: 'dept_education', description: 'Department of Education', amountPerDollar: 2305.39 / REFERENCE_TOTAL_TAX, tooltipText: 'The cabinet-level department overseeing federal education policy, programs, and funding distribution.', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Department_of_Education', category: 'Education' },
        { id: 'college_aid', description: 'Dept. of Education - College Aid', amountPerDollar: 1220.53 / REFERENCE_TOTAL_TAX, tooltipText: 'Includes federal financial aid programs for postsecondary education like Pell Grants, federal student loans (Direct Loans), and Work-Study.', wikiLink: 'https://en.wikipedia.org/wiki/Student_financial_aid_in_the_United_States', category: 'Education' },
        { id: 'k12_schools', description: 'Dept. of Education - K-12 Schools', amountPerDollar: 896.15 / REFERENCE_TOTAL_TAX, tooltipText: 'Federal funding supporting elementary and secondary education, often targeting disadvantaged students (e.g., Title I) and students with disabilities (IDEA).', wikiLink: 'https://en.wikipedia.org/wiki/Elementary_and_Secondary_Education_Act', category: 'Education' },
        { id: 'cpb', description: 'Corporation for Public Broadcasting', amountPerDollar: 5.50 / REFERENCE_TOTAL_TAX, tooltipText: 'A private, non-profit corporation created by Congress to fund public radio (NPR) and television (PBS) stations.', wikiLink: 'https://en.wikipedia.org/wiki/Corporation_for_Public_Broadcasting', category: 'Education' },
        { id: 'imls', description: 'Museum and Library Services', amountPerDollar: 4.20 / REFERENCE_TOTAL_TAX, tooltipText: 'The primary source of federal support for the nation\'s libraries and museums, providing grants and policy leadership.', wikiLink: 'https://en.wikipedia.org/wiki/Institute_of_Museum_and_Library_Services', category: 'Education' },
      ],
    },
    {
      id: 'food_agriculture',
      category: 'Food and Agriculture',
      percentage: (2101.90 / REFERENCE_TOTAL_TAX) * 100, // ~4.04%
      subItems: [
        { id: 'snap', description: 'Food stamps (SNAP)', amountPerDollar: 1305.30 / REFERENCE_TOTAL_TAX, tooltipText: 'The Supplemental Nutrition Assistance Program, providing food-purchasing assistance for low- and no-income people living in the U.S.', wikiLink: 'https://en.wikipedia.org/wiki/Supplemental_Nutrition_Assistance_Program', category: 'Food and Agriculture' },
        { id: 'school_lunch', description: 'School Lunch & child nutrition', amountPerDollar: 353.78 / REFERENCE_TOTAL_TAX, tooltipText: 'Includes the National School Lunch Program and School Breakfast Program, providing free or reduced-price meals to eligible children in schools.', wikiLink: 'https://en.wikipedia.org/wiki/National_School_Lunch_Program', category: 'Food and Agriculture' },
        { id: 'fsa', description: 'Farm Services Agency', amountPerDollar: 85.90 / REFERENCE_TOTAL_TAX, tooltipText: 'An agency within the USDA providing loans, commodity price support, disaster assistance, and conservation programs to farmers and ranchers.', wikiLink: 'https://en.wikipedia.org/wiki/Farm_Service_Agency', category: 'Food and Agriculture' },
        { id: 'wic', description: 'Women, Infants, & Children (WIC)', amountPerDollar: 48.76 / REFERENCE_TOTAL_TAX, tooltipText: 'A supplemental nutrition program providing nutritious foods, nutrition education, and healthcare referrals for low-income pregnant women, new mothers, infants, and children up to age five.', wikiLink: 'https://en.wikipedia.org/wiki/WIC', category: 'Food and Agriculture' },
      ],
    },
    {
      id: 'government',
      category: 'Government',
      percentage: (1906.73 / REFERENCE_TOTAL_TAX) * 100, // ~3.67%
      subItems: [
        { id: 'fdic', description: 'Federal Deposit Insurance Corporation', amountPerDollar: 454.03 / REFERENCE_TOTAL_TAX, tooltipText: 'An independent agency created by Congress to maintain stability and public confidence in the nation\'s financial system by insuring deposits in U.S. banks.', wikiLink: 'https://en.wikipedia.org/wiki/Federal_Deposit_Insurance_Corporation', category: 'Government' },
        { id: 'irs', description: 'Internal Revenue Service', amountPerDollar: 231.86 / REFERENCE_TOTAL_TAX, tooltipText: 'The U.S. government agency responsible for tax collection and the administration of the Internal Revenue Code.', wikiLink: 'https://en.wikipedia.org/wiki/Internal_Revenue_Service', category: 'Government' },
        { id: 'federal_courts', description: 'Federal Court System', amountPerDollar: 90.92 / REFERENCE_TOTAL_TAX, tooltipText: 'The judiciary branch of the U.S. federal government, including district courts, courts of appeals, and the Supreme Court.', wikiLink: 'https://en.wikipedia.org/wiki/Federal_judiciary_of_the_United_States', category: 'Government' },
        { id: 'public_defenders', description: 'Federal Court System - Public Defenders', amountPerDollar: 12.91 / REFERENCE_TOTAL_TAX, tooltipText: 'Attorneys appointed and funded by the federal government to represent defendants in federal criminal cases who cannot afford to hire their own lawyer.', wikiLink: 'https://en.wikipedia.org/wiki/Federal_Public_Defender', category: 'Government' },
        { id: 'usps', description: 'Postal Service', amountPerDollar: 11.53 / REFERENCE_TOTAL_TAX, tooltipText: 'An independent agency of the executive branch responsible for providing postal service in the U.S. (Note: Primarily funded by postage revenue, but receives some federal appropriations).', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Postal_Service', category: 'Government' },
        { id: 'cfpb', description: 'Consumer Financial Protection Bureau (CFPB)', amountPerDollar: 8.58 / REFERENCE_TOTAL_TAX, tooltipText: 'A regulatory agency charged with overseeing financial products and services offered to consumers.', wikiLink: 'https://en.wikipedia.org/wiki/Consumer_Financial_Protection_Bureau', category: 'Government' },
        { id: 'mbda', description: 'Minority Business Development Agency', amountPerDollar: 1.21 / REFERENCE_TOTAL_TAX, tooltipText: 'An agency within the Department of Commerce dedicated to promoting the growth and competitiveness of minority-owned businesses.', wikiLink: 'https://en.wikipedia.org/wiki/Minority_Business_Development_Agency', category: 'Government' },
        { id: 'usich', description: 'Interagency Council on Homelessness', amountPerDollar: 0.04 / REFERENCE_TOTAL_TAX, tooltipText: 'Coordinates the federal response to homelessness across 19 federal agencies.', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Interagency_Council_on_Homelessness', category: 'Government' },
      ],
    },
     {
      id: 'housing_community',
      category: 'Housing and Community',
      percentage: (1792.12 / REFERENCE_TOTAL_TAX) * 100, // ~3.45%
      subItems: [
        { id: 'fema', description: 'Federal Emergency Management Agency', amountPerDollar: 635.39 / REFERENCE_TOTAL_TAX, tooltipText: 'An agency within the Department of Homeland Security coordinating the federal government\'s response to disasters.', wikiLink: 'https://en.wikipedia.org/wiki/Federal_Emergency_Management_Agency', category: 'Housing and Community' },
        { id: 'fema_drf', description: 'FEMA - Disaster Relief Fund', amountPerDollar: 553.28 / REFERENCE_TOTAL_TAX, tooltipText: 'The primary source of funding for federal disaster response, recovery, and mitigation efforts managed by FEMA.', wikiLink: 'https://en.wikipedia.org/wiki/Disaster_Relief_Fund', category: 'Housing and Community' },
        { id: 'hud', description: 'Dept. of Housing and Urban Development', amountPerDollar: 525.67 / REFERENCE_TOTAL_TAX, tooltipText: 'The cabinet department responsible for national housing policy, community development, and affordable housing programs.', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Department_of_Housing_and_Urban_Development', category: 'Housing and Community' },
        { id: 'head_start', description: 'Head Start', amountPerDollar: 112.87 / REFERENCE_TOTAL_TAX, tooltipText: 'A program providing comprehensive early childhood education, health, nutrition, and parent involvement services to low-income children and families.', wikiLink: 'https://en.wikipedia.org/wiki/Head_Start_Program', category: 'Housing and Community' },
        { id: 'public_housing', description: 'Public Housing', amountPerDollar: 71.97 / REFERENCE_TOTAL_TAX, tooltipText: 'Affordable rental housing programs funded by HUD for eligible low-income families, the elderly, and persons with disabilities.', wikiLink: 'https://en.wikipedia.org/wiki/Public_housing_in_the_United_States', category: 'Housing and Community' },
      ],
    },
    {
      id: 'energy_environment',
      category: 'Energy and Environment',
      percentage: (1103.55 / REFERENCE_TOTAL_TAX) * 100, // ~2.12%
       subItems: [
         { id: 'epa', description: 'Environmental Protection Agency', amountPerDollar: 373.06 / REFERENCE_TOTAL_TAX, tooltipText: 'An agency responsible for creating and enforcing regulations based on laws passed by Congress to protect human health and the environment.', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Environmental_Protection_Agency', category: 'Energy and Environment' },
         { id: 'forest_service', description: 'Forest Service', amountPerDollar: 115.03 / REFERENCE_TOTAL_TAX, tooltipText: 'An agency within the USDA that administers the nation\'s 154 national forests and 20 national grasslands.', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Forest_Service', category: 'Energy and Environment' },
         { id: 'noaa', description: 'Nat\'l Oceanic & Atmospheric Administration (NOAA)', amountPerDollar: 73.37 / REFERENCE_TOTAL_TAX, tooltipText: 'A scientific agency within the Department of Commerce focusing on the conditions of the oceans, major waterways, and the atmosphere.', wikiLink: 'https://en.wikipedia.org/wiki/National_Oceanic_and_Atmospheric_Administration', category: 'Energy and Environment' },
         { id: 'renewable_energy', description: 'Energy efficiency and renewable energy', amountPerDollar: 73.36 / REFERENCE_TOTAL_TAX, tooltipText: 'Funding for programs within the Department of Energy promoting energy efficiency improvements and the development/deployment of renewable energy technologies.', wikiLink: 'https://en.wikipedia.org/wiki/Office_of_Energy_Efficiency_and_Renewable_Energy', category: 'Energy and Environment' },
         { id: 'nps', description: 'National Park Service', amountPerDollar: 41.60 / REFERENCE_TOTAL_TAX, tooltipText: 'An agency within the Department of the Interior managing all national parks, many national monuments, and other conservation and historical properties.', wikiLink: 'https://en.wikipedia.org/wiki/National_Park_Service', category: 'Energy and Environment' },
       ],
    },
    {
        id: 'international_affairs',
        category: 'International Affairs',
        percentage: (681.73 / REFERENCE_TOTAL_TAX) * 100, // ~1.31%
        subItems: [
            { id: 'diplomacy', description: 'Diplomacy', amountPerDollar: 151.70 / REFERENCE_TOTAL_TAX, tooltipText: 'Funding for the Department of State, including U.S. embassies, consulates, and diplomatic personnel abroad.', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Department_of_State', category: 'International Affairs' },
            { id: 'usaid', description: 'U.S. Agency for International Development (USAID)', amountPerDollar: 115.34 / REFERENCE_TOTAL_TAX, tooltipText: 'The lead U.S. government agency primarily responsible for administering civilian foreign aid and development assistance.', wikiLink: 'https://en.wikipedia.org/wiki/United_States_Agency_for_International_Development', category: 'International Affairs' },
            { id: 'usaid_climate', description: 'USAID - Climate Aid', amountPerDollar: 8.77 / REFERENCE_TOTAL_TAX, tooltipText: 'Specific funding within USAID dedicated to helping other countries mitigate and adapt to the impacts of climate change.', wikiLink: 'https://www.usaid.gov/climate', category: 'International Affairs' },
        ],
    },
    {
        id: 'law_enforcement',
        category: 'Law Enforcement',
        percentage: (668.42 / REFERENCE_TOTAL_TAX) * 100, // ~1.29%
        subItems: [
            { id: 'deportations_border', description: 'Deportations & border patrol', amountPerDollar: 287.64 / REFERENCE_TOTAL_TAX, tooltipText: 'Funding primarily for Immigration and Customs Enforcement (ICE) for interior enforcement/deportations and Customs and Border Protection (CBP) for border security.', wikiLink: 'https://en.wikipedia.org/wiki/U.S._Immigration_and_Customs_Enforcement', category: 'Law Enforcement' },
            { id: 'federal_prisons', description: 'Federal Prisons', amountPerDollar: 83.29 / REFERENCE_TOTAL_TAX, tooltipText: 'Funding for the Bureau of Prisons, responsible for the custody and care of federal inmates.', wikiLink: 'https://en.wikipedia.org/wiki/Federal_Bureau_of_Prisons', category: 'Law Enforcement' },
        ],
    },
    {
        id: 'transportation',
        category: 'Transportation',
        percentage: (578.94 / REFERENCE_TOTAL_TAX) * 100, // ~1.11%
        subItems: [
            { id: 'highways', description: 'Highways', amountPerDollar: 111.66 / REFERENCE_TOTAL_TAX, tooltipText: 'Funding distributed to states via the Federal Highway Administration (FHWA) for the construction, maintenance, and repair of the federal-aid highway system.', wikiLink: 'https://en.wikipedia.org/wiki/Federal_Highway_Administration', category: 'Transportation' },
            { id: 'public_transit', description: 'Public transit', amountPerDollar: 87.29 / REFERENCE_TOTAL_TAX, tooltipText: 'Federal funding provided through the Federal Transit Administration (FTA) to support public transportation systems like buses, subways, and light rail.', wikiLink: 'https://en.wikipedia.org/wiki/Federal_Transit_Administration', category: 'Transportation' },
            { id: 'tsa', description: 'Transportation Security Administration (TSA)', amountPerDollar: 68.68 / REFERENCE_TOTAL_TAX, tooltipText: 'An agency within the Department of Homeland Security responsible for security of the traveling public, primarily focusing on aviation security.', wikiLink: 'https://en.wikipedia.org/wiki/Transportation_Security_Administration', category: 'Transportation' },
            { id: 'faa', description: 'Federal Aviation Administration', amountPerDollar: 68.38 / REFERENCE_TOTAL_TAX, tooltipText: 'An agency within the Department of Transportation responsible for regulating all aspects of civil aviation in the U.S.', wikiLink: 'https://en.wikipedia.org/wiki/Federal_Aviation_Administration', category: 'Transportation' },
            { id: 'amtrak', description: 'Amtrak & Rail Service', amountPerDollar: 40.28 / REFERENCE_TOTAL_TAX, tooltipText: 'Federal funding supporting Amtrak, the national passenger railroad corporation, and potentially other rail initiatives.', wikiLink: 'https://en.wikipedia.org/wiki/Amtrak', category: 'Transportation' },
        ],
    },
    {
        id: 'science',
        category: 'Science',
        percentage: (411.82 / REFERENCE_TOTAL_TAX) * 100, // ~0.79%
        subItems: [
            { id: 'nasa', description: 'National Aeronautics & Space Administration (NASA)', amountPerDollar: 225.57 / REFERENCE_TOTAL_TAX, tooltipText: 'An independent agency responsible for the U.S. civilian space program, as well as aeronautics and aerospace research.', wikiLink: 'https://en.wikipedia.org/wiki/NASA', category: 'Science' },
            { id: 'nsf', description: 'National Science Foundation', amountPerDollar: 96.62 / REFERENCE_TOTAL_TAX, tooltipText: 'An independent federal agency supporting fundamental research and education in all non-medical fields of science and engineering.', wikiLink: 'https://en.wikipedia.org/wiki/National_Science_Foundation', category: 'Science' },
            { id: 'nasa_spacex', description: 'NASA - SpaceX Contracts', amountPerDollar: 14.95 / REFERENCE_TOTAL_TAX, tooltipText: 'Contracts awarded by NASA to SpaceX for commercial cargo resupply, crew transportation to the ISS, and lunar landing systems (Artemis).', wikiLink: 'https://en.wikipedia.org/wiki/SpaceX#NASA_contracts', category: 'Science' },
        ],
    },
  ];

  // Sort by percentage descending
  detailedBreakdown.sort((a, b) => b.percentage - a.percentage);

  // Assign category to subItems before returning
  return detailedBreakdown.map(category => ({
      ...category,
      subItems: category.subItems?.map(subItem => ({
          ...subItem,
          category: category.category // Add category to subitem for later grouping
      }))
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
