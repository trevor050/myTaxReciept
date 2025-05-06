/**
 * @fileOverview Generates relatable text snippets comparing work time to everyday activities.
 */

import { sample } from 'lodash'; // Using lodash for random sampling

interface TimePerspectiveItem {
    minutes: number;
    description: string;
    icon?: string; // Optional: Suggest an icon name (e.g., from lucide-react)
}

// Ordered list of activities and their approximate durations in minutes (Expanded & Sorted Ascending)
// Target: 50+ items, max duration ~3000 mins (50 hours), more experiential
const timePerspectives: TimePerspectiveItem[] = [
    // Short (1-15 mins)
    { minutes: 1, description: "take a few deep breaths", icon: "Wind" },
    { minutes: 2, description: "brush your teeth", icon: "Smile" },
    { minutes: 3, description: "listen to a song intro", icon: "Music2" },
    { minutes: 4, description: "stretch for a few moments", icon: "Move" }, // Generic move icon
    { minutes: 5, description: "make a cup of coffee or tea", icon: "Coffee" },
    { minutes: 6, description: "quickly skim a news headline feed", icon: "Newspaper" },
    { minutes: 7, description: "check your email", icon: "Mail" },
    { minutes: 8, description: "water a houseplant", icon: "Sprout" },
    { minutes: 10, description: "listen to 2 average songs", icon: "Music" },
    { minutes: 12, description: "read a short online article", icon: "BookOpen" },
    { minutes: 15, description: "take a short walk around the block", icon: "Footprints" },
    { minutes: 15, description: "listen to a short podcast segment", icon: "Podcast" },

    // Medium-Short (16-60 mins)
    { minutes: 18, description: "solve a Sudoku puzzle", icon: "Puzzle" },
    { minutes: 20, description: "read a chapter of a book", icon: "BookOpen" },
    { minutes: 25, description: "do a quick tidy-up of a room", icon: "SprayCan" },
    { minutes: 30, description: "watch an episode of a sitcom", icon: "Tv" },
    { minutes: 30, description: "meditate or practice mindfulness", icon: "BrainCircuit" },
    { minutes: 35, description: "cook a simple breakfast", icon: "EggFried" },
    { minutes: 40, description: "take a quick grocery run for essentials", icon: "ShoppingCart" },
    { minutes: 45, description: "do a short home workout video", icon: "Dumbbell" },
    { minutes: 50, description: "plan your meals for the week", icon: "NotebookPen" },
    { minutes: 55, description: "learn a few phrases in a new language", icon: "Languages" }, // Languages icon
    { minutes: 60, description: "prepare and eat a simple lunch", icon: "Utensils" }, // 1 hour
    { minutes: 60, description: "attend a standard virtual meeting", icon: "Users" },

    // Medium-Long (61-180 mins / 1-3 hours)
    { minutes: 70, description: "go for a brisk walk or jog", icon: "Footprints" },
    { minutes: 75, description: "do a load of laundry (wash & dry)", icon: "WashingMachine" },
    { minutes: 80, description: "play a couple of rounds of a favorite video game", icon: "Gamepad2" }, // Gamepad icon
    { minutes: 90, description: "watch a short feature film", icon: "Film" }, // 1.5 hours
    { minutes: 100, description: "bake a batch of cookies", icon: "Cookie" },
    { minutes: 110, description: "visit a local park for a while", icon: "Trees" }, // Trees icon
    { minutes: 120, description: "watch an average-length movie", icon: "Clapperboard" }, // 2 hours
    { minutes: 135, description: "assemble a small piece of furniture", icon: "Hammer" },
    { minutes: 150, description: "visit a local farmer's market", icon: "ShoppingBasket" }, // Basket icon
    { minutes: 165, description: "learn a new card game", icon: "Dice5" },
    { minutes: 180, description: "attend a local community event", icon: "Building" }, // 3 hours
    { minutes: 180, description: "prepare a nice dinner", icon: "ChefHat" },

    // Long (181-600 mins / 3-10 hours)
    { minutes: 210, description: "visit a local museum or art gallery", icon: "Landmark" }, // 3.5 hours
    { minutes: 240, description: "take a scenic drive to a nearby town", icon: "Map" }, // 4 hours
    { minutes: 270, description: "attend a half-day workshop", icon: "Presentation" },
    { minutes: 300, description: "deep clean a couple of rooms", icon: "Sparkles" }, // 5 hours
    { minutes: 330, description: "plant some flowers in a garden", icon: "Flower2" }, // Flower icon
    { minutes: 360, description: "attend a live music concert", icon: "Music" }, // 6 hours
    { minutes: 390, description: "spend an afternoon volunteering", icon: "HandHeart" },
    { minutes: 420, description: "paint a small accent wall", icon: "PaintRoller" }, // 7 hours
    { minutes: 480, description: "go on a moderate day hike", icon: "MountainSnow" }, // 8 hours
    { minutes: 540, description: "fly from Chicago to New York (incl. airport time)", icon: "PlaneTakeoff" }, // 9 hours
    { minutes: 600, description: "attend a full-day training seminar", icon: "ClipboardCheck" }, // 10 hours

    // Very Long (601-3000 mins / 10-50 hours) - Removed 'work', kept below 50hr cap
    { minutes: 720, description: "drive from Los Angeles to San Francisco", icon: "Navigation" }, // 12 hours
    { minutes: 840, description: "binge-watch a short TV series season", icon: "Youtube" }, // 14 hours
    { minutes: 960, description: "complete a significant weekend DIY project", icon: "Wrench" }, // 16 hours
    { minutes: 1140, description: "take a long weekend road trip", icon: "MapPinned" }, // 19 hours
    { minutes: 1440, description: "spend an entire day exploring a new city", icon: "Building2" }, // 24 hours / 1 day
    { minutes: 1800, description: "learn the basics of a simple new skill (e.g., knitting)", icon: "BrainCircuit" }, // 30 hours
    { minutes: 2160, description: "take a relaxing 3-day weekend getaway trip", icon: "Luggage" }, // 36 hours
    { minutes: 2400, description: "complete a detailed online course module", icon: "GraduationCap" }, // 40 hours
    { minutes: 3000, description: "fly from New York to London (incl. airport time, ~48-50hrs total round trip factored)", icon: "Globe" }, // ~50 hours (MAX LIMIT)
];

// No need to sort for the new random algorithm

/**
 * Generates a list of relatable time perspective activities that sum up to (or close to) the total minutes
 * using a randomized selection process.
 *
 * @param totalMinutes The total number of minutes worked.
 * @param maxItems The maximum number of distinct activity items to include in the list.
 * @returns An array of objects, each containing the activity description, icon, and the number of times it was done, or null if totalMinutes is too low.
 */
export interface CombinedPerspective {
    description: string;
    icon?: string;
    count: number;
}

export function generateCombinedPerspectiveList(
    totalMinutes: number,
    maxItems: number = 5 // Allow slightly more items for variety
): CombinedPerspective[] | null {
    if (isNaN(totalMinutes) || totalMinutes < 1) {
        return null; // Don't show for less than a minute
    }

    let remainingMinutes = totalMinutes;
    // Use a Map to store activity description -> { icon, count }
    const activityCounts = new Map<string, { icon?: string; count: number }>();
    const MIN_TIME_THRESHOLD = 1; // Stop when remaining time is very small

    // Limit iterations to prevent infinite loops with very small remaining times
    let iterations = 0;
    const MAX_ITERATIONS = 100;

    while (remainingMinutes >= MIN_TIME_THRESHOLD && iterations < MAX_ITERATIONS) {
        iterations++;
        // Filter perspectives that fit within the remaining time
        const availablePerspectives = timePerspectives.filter(p => p.minutes <= remainingMinutes && p.minutes > 0);

        if (availablePerspectives.length === 0) {
            // No single activity fits, break the loop
            break;
        }

        // Randomly select one of the fitting perspectives
        const chosenPerspective = sample(availablePerspectives); // Using lodash sample

        if (!chosenPerspective) break; // Should not happen if availablePerspectives > 0, but good practice

        // Update the count for this activity
        const current = activityCounts.get(chosenPerspective.description);
        activityCounts.set(chosenPerspective.description, {
            icon: chosenPerspective.icon,
            count: (current?.count || 0) + 1,
        });

        // Subtract the duration from remaining time
        remainingMinutes -= chosenPerspective.minutes;
    }

    // Convert the map to the desired array structure
    const resultList: CombinedPerspective[] = Array.from(activityCounts.entries()).map(
        ([description, { icon, count }]) => ({
            description,
            icon,
            count,
        })
    );

    // Optional: Sort the final list (e.g., by count descending or original duration)
    resultList.sort((a, b) => b.count - a.count); // Example: sort by most frequent

    // Limit the number of *distinct* items shown
    if (resultList.length > maxItems) {
        resultList.length = maxItems;
    }


    // If the list is empty after trying, return null
     if (resultList.length === 0) {
         // Fallback: Find the single closest perspective (even if slightly over) for very small amounts
         const closest = timePerspectives
              .filter(p => p.minutes > 0) // Ensure we don't pick a zero-minute item
              .reduce((prev, curr) =>
                 Math.abs(curr.minutes - totalMinutes) < Math.abs(prev.minutes - totalMinutes) ? curr : prev
              );
          if (closest && closest.minutes <= totalMinutes * 2 && closest.minutes >= 1) { // Only if reasonably close and >= 1 min
              return [{ description: closest.description, icon: closest.icon, count: 1 }];
          }
         return null;
     }

    return resultList;
}


/**
 * DEPRECATED: Kept for reference or potential fallback, but the list generation is preferred.
 * Generates a relatable time perspective description, potentially combining activities.
 *
 * @param totalMinutes The total number of minutes worked.
 * @returns A string describing relatable activities, or null if no suitable perspective found.
 */
export function getTimePerspectiveText(totalMinutes: number): string | null {
    const combinedList = generateCombinedPerspectiveList(totalMinutes);

    if (!combinedList || combinedList.length === 0) {
        return null;
    }

    let output = "In the time you worked for this, you could have ";
    const descriptions = combinedList.map(item =>
        `${item.description}${item.count > 1 ? ` ${item.count} times` : ''}`
    );

    if (descriptions.length === 1) {
        output += descriptions[0];
    } else if (descriptions.length === 2) {
        output += `${descriptions[0]} and ${descriptions[1]}`;
    } else {
        // Join with commas and "and" for the last item
        const last = descriptions.pop();
        output += descriptions.join(', ') + `, and ${last}`;
    }

    return output + '.';
}


// Example usage (for testing):
// console.log("5 minutes List:", generateCombinedPerspectiveList(5));
// console.log("70 minutes List:", generateCombinedPerspectiveList(70));
// console.log("300 minutes List:", generateCombinedPerspectiveList(300));
// console.log("1000 minutes List:", generateCombinedPerspectiveList(1000));
// console.log("5000 minutes List:", generateCombinedPerspectiveList(5000)); // ~83 hours
// console.log("15000 minutes List:", generateCombinedPerspectiveList(15000)); // ~250 hours - test upper bounds
// console.log("0.5 minutes List:", generateCombinedPerspectiveList(0.5));
// console.log("1 minute List:", generateCombinedPerspectiveList(1));
