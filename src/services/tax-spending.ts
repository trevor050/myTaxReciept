
/**
 * @fileOverview Service for fetching mock tax spending data and generating email content.
 */

import { generateRepresentativeEmailContent } from './email/generator'; // Import the generation logic
import type { FundingLevel, SelectedItem as EmailSelectedItem } from './email/types'; // Import types from email modules
import taxData from '@/data/tax-spending.json';

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
const REFERENCE_TOTAL_TAX = taxData.referenceTotalTax;

/**
 * Asynchronously retrieves a detailed tax spending breakdown.
 * Data is loaded from an external JSON file for easier editing.
 */
export async function getTaxSpending(_location: Location, _taxAmount: number): Promise<TaxSpending[]> {
  const detailedBreakdown: TaxSpending[] = [...taxData.detailedBreakdown];
  // Sort by percentage descending
  detailedBreakdown.sort((a, b) => b.percentage - a.percentage);
  validateSpendingData(detailedBreakdown);
  return detailedBreakdown;
}

/**
 * Ensures that each category's sub items sum to the parent percentage.
 * Throws an error during development if a mismatch is detected.
 */
function validateSpendingData(data: TaxSpending[]): void {
  for (const category of data) {
    if (!category.subItems || category.subItems.length === 0) continue;
    const sum = category.subItems.reduce((acc, item) => acc + item.amountPerDollar, 0);
    const target = category.percentage / 100;
    if (Math.abs(sum - target) > 0.0001) {
      throw new Error(`Sub-item totals for ${category.id} do not equal parent percentage`);
    }
  }
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
