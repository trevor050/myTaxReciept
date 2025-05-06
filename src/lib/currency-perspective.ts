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
// Target: 70+ items, diverse range, max around $1000-$1500
const currencyPerspectives: CurrencyPerspectiveItem[] = [
    // Ultra Cheap ($0 - $5)
    { cost: 1.50, description: "a vending machine soda", icon: "GlassWater" },
    { cost: 2.00, description: "a pack of gum", icon: "Package" },
    { cost: 2.50, description: "a lottery scratch ticket", icon: "Ticket" },
    { cost: 3.00, description: "a bus fare", icon: "Bus" },
    { cost: 3.50, description: "a cup of drip coffee", icon: "Coffee" },
    { cost: 4.00, description: "a coffee shop pastry", icon: "Croissant" },
    { cost: 4.50, description: "a street vendor hot dog", icon: "Utensils" },
    { cost: 5.00, description: "a fancy coffee drink", icon: "Coffee" },

    // Cheap ($6 - $15)
    { cost: 6.00, description: "a fast-food value meal", icon: "Utensils" },
    { cost: 7.00, description: "a pint of craft beer", icon: "Beer" },
    { cost: 7.50, description: "a magazine at the airport", icon: "Newspaper" },
    { cost: 8.00, description: "a paperback book", icon: "BookOpen" },
    { cost: 9.00, description: "a month of basic music streaming", icon: "Music" },
    { cost: 10.00, description: "a movie ticket (matinee)", icon: "Ticket" },
    { cost: 11.00, description: "a gourmet sandwich", icon: "Sandwich" },
    { cost: 12.00, description: "lunch from a food truck", icon: "Truck" },
    { cost: 13.00, description: "a cocktail at a bar", icon: "Martini" },
    { cost: 14.00, description: "a large smoothie", icon: "GlassWater" }, // Using GlassWater as proxy
    { cost: 15.00, description: "a month of standard video streaming", icon: "Tv" },

    // Moderate ($16 - $50)
    { cost: 18.00, description: "a large pizza delivery", icon: "Pizza" },
    { cost: 20.00, description: "a new release paperback book", icon: "BookOpen" },
    { cost: 22.00, description: "a bouquet of flowers", icon: "Flower2" },
    { cost: 25.00, description: "a rideshare across town", icon: "Car" },
    { cost: 28.00, description: "a haircut (basic)", icon: "PersonStanding" },
    { cost: 30.00, description: "dinner at a casual restaurant", icon: "Utensils" },
    { cost: 35.00, description: "a video game on sale", icon: "Gamepad2" },
    { cost: 40.00, description: "a nice bottle of wine", icon: "Grape" },
    { cost: 45.00, description: "a month of premium streaming bundle", icon: "Tv" },
    { cost: 50.00, description: "a pair of basic sneakers", icon: "Footprints" },
    { cost: 50.00, description: "a popular board game", icon: "Dice5" },


    // Medium ($51 - $100)
    { cost: 55.00, description: "a concert t-shirt", icon: "Shirt" },
    { cost: 60.00, description: "a full price new video game", icon: "Gamepad2" },
    { cost: 65.00, description: "a month of unlimited yoga classes", icon: "Dumbbell" },
    { cost: 70.00, description: "a decent quality backpack", icon: "Backpack" },
    { cost: 75.00, description: "a grocery haul for two people", icon: "ShoppingCart" },
    { cost: 80.00, description: "a pair of jeans", icon: "PersonStanding" },
    { cost: 85.00, description: "a cast iron skillet", icon: "ChefHat" },
    { cost: 90.00, description: "an oil change for a car", icon: "Wrench" },
    { cost: 95.00, description: "a portable Bluetooth speaker", icon: "Music" }, // Using Music as proxy
    { cost: 100.00, description: "a nice dinner for two", icon: "Utensils" },

    // High ($101 - $300)
    { cost: 110.00, description: "a ticket to a major sporting event", icon: "Trophy" },
    { cost: 120.00, description: "a decent office chair", icon: "Briefcase" }, // Using Briefcase as proxy
    { cost: 125.00, description: "a pair of noise-cancelling earbuds", icon: "Headphones" },
    { cost: 140.00, description: "an electric kettle and coffee grinder set", icon: "Coffee" },
    { cost: 150.00, description: "a weekend camping trip essentials", icon: "Tent" },
    { cost: 160.00, description: "a new set of bed sheets and comforter", icon: "Bed" },
    { cost: 175.00, description: "a basic tablet computer", icon: "Tablet" },
    { cost: 190.00, description: "a food processor or stand mixer attachment", icon: "Utensils" },
    { cost: 200.00, description: "a Broadway show ticket (mid-range)", icon: "Theater" },
    { cost: 225.00, description: "a budget airline round-trip flight", icon: "Plane" },
    { cost: 250.00, description: "a decent bicycle", icon: "Bike" },
    { cost: 275.00, description: "a smart watch", icon: "Watch" },
    { cost: 300.00, description: "a month's worth of groceries for a small family", icon: "ShoppingCart" },
    { cost: 300.00, description: "a simple home security camera system", icon: "Home" },


    // Very High ($301 - $750)
    { cost: 325.00, description: "a beginner acoustic guitar", icon: "Music2" },
    { cost: 350.00, description: "a gaming console", icon: "Gamepad2" },
    { cost: 375.00, description: "a professional chef's knife", icon: "ChefHat" },
    { cost: 400.00, description: "a mid-range smartphone (subsidized/older model)", icon: "Smartphone" },
    { cost: 450.00, description: "a weekend hotel stay", icon: "Bed" },
    { cost: 475.00, description: "a high-quality blender", icon: "GlassWater" }, // Using GlassWater
    { cost: 500.00, description: "a quality suit", icon: "PersonStanding" },
    { cost: 550.00, description: "a set of car tires", icon: "CircleDot" },
    { cost: 575.00, description: "a robot vacuum cleaner", icon: "Sparkles" }, // Using Sparkles
    { cost: 600.00, description: "a round-trip domestic flight", icon: "Plane" },
    { cost: 650.00, description: "a basic laptop", icon: "Laptop" },
    { cost: 700.00, description: "a month's rent in a low-cost area", icon: "Home" },
    { cost: 750.00, description: "a high-end bicycle", icon: "Bike" },
    { cost: 750.00, description: "a leather recliner chair", icon: "Armchair" }, // Assuming Armchair icon exists

    // Expensive ($751 - $1500)
    { cost: 800.00, description: "a flagship smartphone (new)", icon: "Smartphone" },
    { cost: 850.00, description: "a large screen 4K TV", icon: "Tv" },
    { cost: 900.00, description: "a designer handbag", icon: "ShoppingBag" },
    { cost: 950.00, description: "a month's car payment for a new car", icon: "Car" },
    { cost: 1000.00, description: "a high-end laptop", icon: "Laptop" },
    { cost: 1100.00, description: "a month's rent in a mid-cost city", icon: "Home" },
    { cost: 1250.00, description: "a premium set of golf clubs", icon: "CircleDot" },
    { cost: 1350.00, description: "a short international getaway (flight + budget hotel)", icon: "Luggage" },
    { cost: 1500.00, description: "a used car down payment", icon: "Car" }, // Upper limit
    { cost: 1500.00, description: "a high-end home espresso machine", icon: "Coffee" },

];

/**
 * Generates a list of relatable purchase perspectives that sum up to (or close to) the total amount
 * using a randomized selection process. Aims for 98% coverage.
 *
 * @param totalAmount The total amount in USD.
 * @param maxItemsToShow The maximum number of distinct item types to include in the list.
 * @returns An array of objects, each containing the item description, icon, and the number of times it could be purchased, or null if totalAmount is too low.
 */
export interface CombinedCurrencyPerspective {
    description: string;
    icon?: string;
    count: number;
}

export function generateCurrencyPerspectiveList(
    totalAmount: number,
    maxItemsToShow: number = 10 // Max distinct items to show
): CombinedCurrencyPerspective[] | null {
    if (isNaN(totalAmount) || totalAmount < 1) {
        return null;
    }

    let remainingAmount = totalAmount;
    const minTargetCoverage = totalAmount * 0.98; // Target 98% coverage
    let accumulatedAmount = 0;

    const purchaseCounts = new Map<string, { icon?: string; count: number; totalItemCost: number }>();
    const MIN_AMOUNT_THRESHOLD = 0.50; // Smallest item to consider
    let iterations = 0;
    const MAX_ITERATIONS = 500; // Increased max iterations

    while (remainingAmount >= MIN_AMOUNT_THRESHOLD && accumulatedAmount < minTargetCoverage && iterations < MAX_ITERATIONS) {
        iterations++;
        const availablePurchases = currencyPerspectives.filter(p => p.cost <= remainingAmount && p.cost > 0);

        if (availablePurchases.length === 0) {
            break;
        }
        
        let chosenPurchase: CurrencyPerspectiveItem | undefined;
        // Bias towards larger items if remaining amount is large and there's room for more distinct items
        if (remainingAmount > 200 && purchaseCounts.size < maxItemsToShow -2 && availablePurchases.some(p => p.cost > 50)) {
            const largerItems = availablePurchases.filter(p => p.cost > 50);
            if (Math.random() < 0.5 && largerItems.length > 0) { // 50% chance to pick a larger item
                 chosenPurchase = sample(largerItems);
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
            totalItemCost: (current?.totalItemCost || 0) + chosenPurchase.cost,
        });

        remainingAmount -= chosenPurchase.cost;
        accumulatedAmount += chosenPurchase.cost;
    }

    let resultList: CombinedCurrencyPerspective[] = Array.from(purchaseCounts.entries()).map(
        ([description, { icon, count }]) => ({
            description,
            icon,
            count,
        })
    );

    // Sort by total cost contributed by each item type (descending) then by count
    resultList.sort((a, b) => {
        const totalCostA = purchaseCounts.get(a.description)?.totalItemCost || 0;
        const totalCostB = purchaseCounts.get(b.description)?.totalItemCost || 0;
        if (totalCostB !== totalCostA) {
            return totalCostB - totalCostA;
        }
        return (purchaseCounts.get(b.description)?.count || 0) - (purchaseCounts.get(a.description)?.count || 0);
    });

    // Limit the number of *distinct* items shown
    if (resultList.length > maxItemsToShow) {
        resultList.length = maxItemsToShow;
    }

    // Fallback: if still not enough coverage or list is too short, try to add one significant item.
    if (resultList.length === 0 || (resultList.length < Math.min(3, maxItemsToShow) && accumulatedAmount < minTargetCoverage)) {
        const significantRemaining = totalAmount - accumulatedAmount;
        if (significantRemaining > 1) { // Only add fallback if there's a reasonable amount left
             const closestLarger = currencyPerspectives
                .filter(p => p.cost > 0 && p.cost <= significantRemaining * 1.2) // Allow slightly larger
                .sort((a,b) => b.cost - a.cost); // Get largest suitable

            if (closestLarger.length > 0 && !resultList.find(item => item.description === closestLarger[0].description)) {
                 resultList.push({ description: closestLarger[0].description, icon: closestLarger[0].icon, count: 1 });
                 accumulatedAmount += closestLarger[0].cost;
            }
        }
    }

    // Final fallback if list is still empty
    if (resultList.length === 0) {
        const closest = currencyPerspectives
            .filter(p => p.cost > 0)
            .reduce((prev, curr) =>
                (Math.abs(curr.cost - totalAmount) < Math.abs(prev.cost - totalAmount)) ? curr : prev,
                { cost: Infinity, description: '', icon: undefined }
            );
        if (closest.cost <= totalAmount * 1.5 && closest.cost >= 1) {
            return [{ description: closest.description, icon: closest.icon, count: 1 }];
        }
        return null;
    }
    
    // Recalculate total represented cost by the chosen items if list was trimmed or fallback added
    const finalAccumulatedAmount = resultList.reduce((sum, item) => {
        const originalItem = currencyPerspectives.find(p => p.description === item.description);
        return sum + (originalItem ? originalItem.cost * item.count : 0);
    }, 0);

    if (finalAccumulatedAmount < totalAmount * 0.90 && totalAmount > 10) { // More lenient final check
       // console.log("Final list for currency did not meet 90% coverage:", finalAccumulatedAmount, totalAmount);
       // return null; // Option to return null if not enough coverage
    }

    return resultList;
}
