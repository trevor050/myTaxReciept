/**
 * @fileOverview Generates relatable text snippets comparing currency amounts to everyday purchases.
 */

import { sample } from 'lodash';

export interface CurrencyPerspectiveItem {
    cost: number; // Approximate cost in USD
    description: string;
    icon?: string; // Optional: Suggest an icon name (e.g., from lucide-react)
}

// List of common purchases and their approximate costs (USD)
// Target: 50+ items, diverse range, max around $1000-$1500
const currencyPerspectives: CurrencyPerspectiveItem[] = [
    // Ultra Cheap ($0 - $5)
    { cost: 1.50, description: "a vending machine soda", icon: "GlassWater" },
    { cost: 2.00, description: "a pack of gum", icon: "Package" },
    { cost: 3.00, description: "a bus fare", icon: "Bus" },
    { cost: 4.00, description: "a coffee shop pastry", icon: "Croissant" },
    { cost: 5.00, description: "a fancy coffee drink", icon: "Coffee" },

    // Cheap ($6 - $15)
    { cost: 6.00, description: "a fast-food value meal", icon: "Utensils" }, // Replaced Burger with Utensils
    { cost: 7.00, description: "a pint of craft beer", icon: "Beer" },
    { cost: 8.00, description: "a paperback book", icon: "BookOpen" },
    { cost: 9.00, description: "a month of basic music streaming", icon: "Music" },
    { cost: 10.00, description: "a movie ticket (matinee)", icon: "Ticket" },
    { cost: 12.00, description: "lunch from a food truck", icon: "Truck" },
    { cost: 13.00, description: "a cocktail at a bar", icon: "Martini" },
    { cost: 15.00, description: "a month of standard video streaming", icon: "Tv" },

    // Moderate ($16 - $50)
    { cost: 18.00, description: "a large pizza delivery", icon: "Pizza" },
    { cost: 20.00, description: "a new release paperback book", icon: "BookOpen" },
    { cost: 25.00, description: "a rideshare across town", icon: "Car" },
    { cost: 30.00, description: "dinner at a casual restaurant", icon: "Utensils" },
    { cost: 35.00, description: "a video game on sale", icon: "Gamepad2" },
    { cost: 40.00, description: "a nice bottle of wine", icon: "Grape" },
    { cost: 45.00, description: "a month of premium streaming bundle", icon: "Tv" },
    { cost: 50.00, description: "a pair of basic sneakers", icon: "Footprints" },

    // Medium ($51 - $100)
    { cost: 55.00, description: "a concert t-shirt", icon: "Shirt" },
    { cost: 60.00, description: "a full price new video game", icon: "Gamepad2" },
    { cost: 65.00, description: "a month of unlimited yoga classes", icon: "Dumbbell" },
    { cost: 70.00, description: "a decent quality backpack", icon: "Backpack" },
    { cost: 75.00, description: "a grocery haul for two people", icon: "ShoppingCart" },
    { cost: 80.00, description: "a pair of jeans", icon: "PersonStanding" }, // Placeholder
    { cost: 90.00, description: "an oil change for a car", icon: "Wrench" },
    { cost: 100.00, description: "a nice dinner for two", icon: "Utensils" },

    // High ($101 - $300)
    { cost: 110.00, description: "a ticket to a major sporting event", icon: "Trophy" },
    { cost: 125.00, description: "a pair of noise-cancelling earbuds", icon: "Headphones" },
    { cost: 150.00, description: "a weekend camping trip essentials", icon: "Tent" },
    { cost: 175.00, description: "a basic tablet computer", icon: "Tablet" },
    { cost: 200.00, description: "a Broadway show ticket (mid-range)", icon: "Theater" },
    { cost: 225.00, description: "a budget airline round-trip flight", icon: "Plane" },
    { cost: 250.00, description: "a decent bicycle", icon: "Bike" },
    { cost: 275.00, description: "a smart watch", icon: "Watch" },
    { cost: 300.00, description: "a month's worth of groceries for a small family", icon: "ShoppingCart" },

    // Very High ($301 - $750)
    { cost: 350.00, description: "a gaming console", icon: "Gamepad2" },
    { cost: 400.00, description: "a mid-range smartphone (subsidized/older model)", icon: "Smartphone" },
    { cost: 450.00, description: "a weekend hotel stay", icon: "Bed" },
    { cost: 500.00, description: "a quality suit", icon: "PersonStanding" }, // Replaced UserTie
    { cost: 550.00, description: "a set of car tires", icon: "CircleDot" },
    { cost: 600.00, description: "a round-trip domestic flight", icon: "Plane" },
    { cost: 650.00, description: "a basic laptop", icon: "Laptop" },
    { cost: 700.00, description: "a month's rent in a low-cost area", icon: "Home" },
    { cost: 750.00, description: "a high-end bicycle", icon: "Bike" },

    // Expensive ($751 - $1500)
    { cost: 800.00, description: "a flagship smartphone (new)", icon: "Smartphone" },
    { cost: 900.00, description: "a designer handbag", icon: "ShoppingBag" },
    { cost: 1000.00, description: "a high-end laptop", icon: "Laptop" },
    { cost: 1100.00, description: "a month's rent in a mid-cost city", icon: "Home" },
    { cost: 1250.00, description: "a premium set of golf clubs", icon: "CircleDot" }, // Replaced Golf with CircleDot
    { cost: 1500.00, description: "a used car down payment", icon: "Car" }, // Upper limit
];

/**
 * Generates a list of relatable purchase perspectives that sum up to (or close to) the total amount
 * using a randomized selection process.
 *
 * @param totalAmount The total amount in USD.
 * @param maxItems The maximum number of distinct item types to include in the list.
 * @returns An array of objects, each containing the item description, icon, and the number of times it could be purchased, or null if totalAmount is too low.
 */
export interface CombinedCurrencyPerspective {
    description: string;
    icon?: string;
    count: number;
}

export function generateCurrencyPerspectiveList(
    totalAmount: number,
    maxItems: number = 5
): CombinedCurrencyPerspective[] | null {
    if (isNaN(totalAmount) || totalAmount < 1) { // Minimum $1 to show anything
        return null;
    }

    let remainingAmount = totalAmount;
    const purchaseCounts = new Map<string, { icon?: string; count: number }>();
    const MIN_AMOUNT_THRESHOLD = 0.50; // Stop when remaining amount is very small
    let iterations = 0;
    const MAX_ITERATIONS = 300; // Increased max iterations

    // Removed the check for purchaseCounts.size to allow more items for larger amounts
    while (remainingAmount >= MIN_AMOUNT_THRESHOLD && iterations < MAX_ITERATIONS) {
        iterations++;
        const availablePurchases = currencyPerspectives.filter(p => p.cost <= remainingAmount && p.cost > 0);

        if (availablePurchases.length === 0) {
            break;
        }

        // Strategy: If remaining amount is large, bias towards picking larger items
        let chosenPurchase: CurrencyPerspectiveItem | undefined;
        if (remainingAmount > 500 && availablePurchases.some(p => p.cost > 100)) {
            // If remaining amount > $500 and large items are available, increase chance of picking one
            const largeItems = availablePurchases.filter(p => p.cost > 100);
            if (Math.random() < 0.6 && largeItems.length > 0) { // 60% chance to pick a large item
                 chosenPurchase = sample(largeItems);
            } else {
                 chosenPurchase = sample(availablePurchases);
            }
        } else {
             chosenPurchase = sample(availablePurchases);
        }


        if (!chosenPurchase) break;

        const current = purchaseCounts.get(chosenPurchase.description);
        purchaseCounts.set(chosenPurchase.description, {
            icon: chosenPurchase.icon,
            count: (current?.count || 0) + 1,
        });

        remainingAmount -= chosenPurchase.cost;
    }

    const resultList: CombinedCurrencyPerspective[] = Array.from(purchaseCounts.entries()).map(
        ([description, { icon, count }]) => ({
            description,
            icon,
            count,
        })
    );

    resultList.sort((a, b) => b.count - a.count); // Sort by most frequent

    // Apply maxItems limit *after* accumulating counts
    if (resultList.length > maxItems) {
        resultList.length = maxItems;
    }

    // Fallback logic remains the same
    if (resultList.length === 0) {
        const closest = currencyPerspectives
            .filter(p => p.cost > 0)
            .reduce((prev, curr) =>
                 (curr.cost > 0 && Math.abs(curr.cost - totalAmount) < Math.abs(prev.cost - totalAmount)) ? curr : prev
            , { cost: Infinity, description: '' });
        if (closest.cost <= totalAmount * 1.5 && closest.cost >= 1) { // Only if reasonably close and >= $1
            return [{ description: closest.description, icon: closest.icon, count: 1 }];
        }
        return null;
    }

    return resultList;
}
