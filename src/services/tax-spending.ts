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
 * Represents tax spending information for a specific category.
 */
export interface TaxSpending {
  /**
   * The category of spending (e.g., Education, Defense).
   */
  category: string;
  /**
   * The percentage of tax money spent on this category.
   */
  percentage: number;
}

/**
 * Asynchronously retrieves tax spending breakdown for a given location and tax amount.
 *
 * @param location The location for which to retrieve tax spending data.
 * @param taxAmount The total tax amount paid by the user.
 * @returns A promise that resolves to an array of TaxSpending objects representing the spending breakdown.
 */
export async function getTaxSpending(location: Location, taxAmount: number): Promise<TaxSpending[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      category: 'Education',
      percentage: 20,
    },
    {
      category: 'Defense',
      percentage: 15,
    },
    {
      category: 'Healthcare',
      percentage: 25,
    },
    {
      category: 'Infrastructure',
      percentage: 10,
    },
    {
      category: 'Social Security',
      percentage: 30,
    },
  ];
}
