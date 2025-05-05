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
   * Description of the sub-category (e.g., "Medicaid").
   */
  description: string;
  /**
   * The amount spent on this sub-category for every dollar of total tax paid,
   * based on the reference breakdown ($52,000 total).
   */
  amountPerDollar: number;
}


/**
 * Represents tax spending information for a specific main category.
 */
export interface TaxSpending {
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
  const detailedBreakdown: TaxSpending[] = [
    {
      category: 'Health',
      percentage: (12906.86 / REFERENCE_TOTAL_TAX) * 100, // ~24.82%
      subItems: [
        { description: 'Medicaid', amountPerDollar: 5336.01 / REFERENCE_TOTAL_TAX },
        { description: 'Medicare', amountPerDollar: 4854.13 / REFERENCE_TOTAL_TAX },
        { description: 'National Institutes of Health', amountPerDollar: 436.73 / REFERENCE_TOTAL_TAX },
        { description: 'Centers for Disease Control & Prevention (CDC)', amountPerDollar: 137.72 / REFERENCE_TOTAL_TAX },
        { description: 'Substance use & mental health programs', amountPerDollar: 86.89 / REFERENCE_TOTAL_TAX },
      ],
    },
    {
      category: 'War and Weapons',
      percentage: (10852.53 / REFERENCE_TOTAL_TAX) * 100, // ~20.87%
      subItems: [
        { description: 'Pentagon', amountPerDollar: 8574.28 / REFERENCE_TOTAL_TAX },
        { description: 'Pentagon - Contractors', amountPerDollar: 4187.01 / REFERENCE_TOTAL_TAX },
        { description: 'Pentagon - Military Personnel', amountPerDollar: 1786.15 / REFERENCE_TOTAL_TAX },
        { description: 'Pentagon - Top 5 Contractors', amountPerDollar: 1137.58 / REFERENCE_TOTAL_TAX },
        { description: 'Nuclear Weapons', amountPerDollar: 339.51 / REFERENCE_TOTAL_TAX },
        { description: 'Aid to foreign militaries', amountPerDollar: 258.74 / REFERENCE_TOTAL_TAX },
        { description: 'Israel wars (Pentagon & aid)', amountPerDollar: 214.14 / REFERENCE_TOTAL_TAX },
        { description: 'F-35 Jet Fighter', amountPerDollar: 127.86 / REFERENCE_TOTAL_TAX },
        { description: 'Pentagon - SpaceX Contracts', amountPerDollar: 17.04 / REFERENCE_TOTAL_TAX },
        { description: 'Pentagon - Diversity, Equity, Inclusion (DEI)', amountPerDollar: 1.08 / REFERENCE_TOTAL_TAX },
      ],
    },
    {
      category: 'Interest on Debt',
      percentage: (10105.93 / REFERENCE_TOTAL_TAX) * 100, // ~19.43%
    },
    {
      category: 'Veterans',
      percentage: (3253.81 / REFERENCE_TOTAL_TAX) * 100, // ~6.26%
      subItems: [
        { description: 'Veterans\' Affairs (VA)', amountPerDollar: 3251.63 / REFERENCE_TOTAL_TAX },
        { description: 'Veterans Toxic Exposure Fund (PACT Act)', amountPerDollar: 189.31 / REFERENCE_TOTAL_TAX },
      ],
    },
    {
      category: 'Unemployment and Labor',
      percentage: (3089.14 / REFERENCE_TOTAL_TAX) * 100, // ~5.94%
      subItems: [
        { description: 'Temporary Assistance for Needy Families', amountPerDollar: 530.51 / REFERENCE_TOTAL_TAX },
        { description: 'Child Tax Credit', amountPerDollar: 270.23 / REFERENCE_TOTAL_TAX },
        { description: 'Refugee Assistance', amountPerDollar: 76.71 / REFERENCE_TOTAL_TAX },
        { description: 'Low Income Home Energy Assistance Program', amountPerDollar: 49.13 / REFERENCE_TOTAL_TAX },
        { description: 'National Labor Relations Board (NLRB)', amountPerDollar: 3.00 / REFERENCE_TOTAL_TAX },
      ],
    },
    {
      category: 'Education',
      percentage: (2382.28 / REFERENCE_TOTAL_TAX) * 100, // ~4.58%
      subItems: [
        { description: 'Department of Education', amountPerDollar: 2305.39 / REFERENCE_TOTAL_TAX },
        { description: 'Dept. of Education - College Aid', amountPerDollar: 1220.53 / REFERENCE_TOTAL_TAX },
        { description: 'Dept. of Education - K-12 Schools', amountPerDollar: 896.15 / REFERENCE_TOTAL_TAX },
        { description: 'Corporation for Public Broadcasting', amountPerDollar: 5.50 / REFERENCE_TOTAL_TAX },
        { description: 'Museum and Library Services', amountPerDollar: 4.20 / REFERENCE_TOTAL_TAX },
      ],
    },
    {
      category: 'Food and Agriculture',
      percentage: (2101.90 / REFERENCE_TOTAL_TAX) * 100, // ~4.04%
      subItems: [
        { description: 'Food stamps (SNAP)', amountPerDollar: 1305.30 / REFERENCE_TOTAL_TAX },
        { description: 'School Lunch & child nutrition', amountPerDollar: 353.78 / REFERENCE_TOTAL_TAX },
        { description: 'Farm Services Agency', amountPerDollar: 85.90 / REFERENCE_TOTAL_TAX },
        { description: 'Women, Infants, & Children (WIC)', amountPerDollar: 48.76 / REFERENCE_TOTAL_TAX },
      ],
    },
    {
      category: 'Government',
      percentage: (1906.73 / REFERENCE_TOTAL_TAX) * 100, // ~3.67%
      subItems: [
        { description: 'Federal Deposit Insurance Corporation', amountPerDollar: 454.03 / REFERENCE_TOTAL_TAX },
        { description: 'Internal Revenue Service', amountPerDollar: 231.86 / REFERENCE_TOTAL_TAX },
        { description: 'Federal Court System', amountPerDollar: 90.92 / REFERENCE_TOTAL_TAX },
        { description: 'Federal Court System - Public Defenders', amountPerDollar: 12.91 / REFERENCE_TOTAL_TAX },
        { description: 'Postal Service', amountPerDollar: 11.53 / REFERENCE_TOTAL_TAX },
        { description: 'Consumer Financial Protection Bureau (CFPB)', amountPerDollar: 8.58 / REFERENCE_TOTAL_TAX },
        { description: 'Minority Business Development Agency', amountPerDollar: 1.21 / REFERENCE_TOTAL_TAX },
        { description: 'Interagency Council on Homelessness', amountPerDollar: 0.04 / REFERENCE_TOTAL_TAX },
      ],
    },
     {
      category: 'Housing and Community',
      percentage: (1792.12 / REFERENCE_TOTAL_TAX) * 100, // ~3.45%
      subItems: [
        { description: 'Federal Emergency Management Agency', amountPerDollar: 635.39 / REFERENCE_TOTAL_TAX },
        { description: 'FEMA - Disaster Relief Fund', amountPerDollar: 553.28 / REFERENCE_TOTAL_TAX },
        { description: 'Dept. of Housing and Urban Development', amountPerDollar: 525.67 / REFERENCE_TOTAL_TAX },
        { description: 'Head Start', amountPerDollar: 112.87 / REFERENCE_TOTAL_TAX },
        { description: 'Public Housing', amountPerDollar: 71.97 / REFERENCE_TOTAL_TAX },
      ],
    },
    {
      category: 'Energy and Environment',
      percentage: (1103.55 / REFERENCE_TOTAL_TAX) * 100, // ~2.12%
       subItems: [
         { description: 'Environmental Protection Agency', amountPerDollar: 373.06 / REFERENCE_TOTAL_TAX },
         { description: 'Forest Service', amountPerDollar: 115.03 / REFERENCE_TOTAL_TAX },
         { description: 'Nat\'l Oceanic & Atmospheric Administration (NOAA)', amountPerDollar: 73.37 / REFERENCE_TOTAL_TAX },
         { description: 'Energy efficiency and renewable energy', amountPerDollar: 73.36 / REFERENCE_TOTAL_TAX },
         { description: 'National Park Service', amountPerDollar: 41.60 / REFERENCE_TOTAL_TAX },
       ],
    },
    {
        category: 'International Affairs',
        percentage: (681.73 / REFERENCE_TOTAL_TAX) * 100, // ~1.31%
        subItems: [
            { description: 'Diplomacy', amountPerDollar: 151.70 / REFERENCE_TOTAL_TAX },
            { description: 'U.S. Agency for International Development (USAID)', amountPerDollar: 115.34 / REFERENCE_TOTAL_TAX },
            { description: 'USAID - Climate Aid', amountPerDollar: 8.77 / REFERENCE_TOTAL_TAX },
        ],
    },
    {
        category: 'Law Enforcement',
        percentage: (668.42 / REFERENCE_TOTAL_TAX) * 100, // ~1.29%
        subItems: [
            { description: 'Deportations & border patrol', amountPerDollar: 287.64 / REFERENCE_TOTAL_TAX },
            { description: 'Federal Prisons', amountPerDollar: 83.29 / REFERENCE_TOTAL_TAX },
        ],
    },
    {
        category: 'Transportation',
        percentage: (578.94 / REFERENCE_TOTAL_TAX) * 100, // ~1.11%
        subItems: [
            { description: 'Highways', amountPerDollar: 111.66 / REFERENCE_TOTAL_TAX },
            { description: 'Public transit', amountPerDollar: 87.29 / REFERENCE_TOTAL_TAX },
            { description: 'Transportation Security Administration (TSA)', amountPerDollar: 68.68 / REFERENCE_TOTAL_TAX },
            { description: 'Federal Aviation Administration', amountPerDollar: 68.38 / REFERENCE_TOTAL_TAX },
            { description: 'Amtrak & Rail Service', amountPerDollar: 40.28 / REFERENCE_TOTAL_TAX },
        ],
    },
    {
        category: 'Science',
        percentage: (411.82 / REFERENCE_TOTAL_TAX) * 100, // ~0.79%
        subItems: [
            { description: 'National Aeronautics & Space Administration (NASA)', amountPerDollar: 225.57 / REFERENCE_TOTAL_TAX },
            { description: 'National Science Foundation', amountPerDollar: 96.62 / REFERENCE_TOTAL_TAX },
            { description: 'NASA - SpaceX Contracts', amountPerDollar: 14.95 / REFERENCE_TOTAL_TAX },
        ],
    },
    // Add other categories similarly...
  ];

   // Sort by percentage descending
  detailedBreakdown.sort((a, b) => b.percentage - a.percentage);

  return detailedBreakdown;
}
