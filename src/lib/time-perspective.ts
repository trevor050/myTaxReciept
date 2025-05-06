/**
 * @fileOverview Generates relatable text snippets comparing work time to everyday activities.
 */

import { sample } from 'lodash'; // Using lodash for random sampling

export interface TimePerspectiveItem {
    minutes: number;
    description: string;
    icon?: string; // Optional: Suggest an icon name (e.g., from lucide-react)
}

// Ordered list of activities and their approximate durations in minutes (Expanded & Sorted Ascending)
// Target: 70+ items, max duration ~3000 mins (50 hours), more experiential, avoid generic 'work'
const timePerspectives: TimePerspectiveItem[] = [
    // Ultra Short (1-5 mins)
    { minutes: 1, description: "take a few deep breaths", icon: "Wind" },
    { minutes: 2, description: "brush your teeth thoroughly", icon: "Smile" },
    { minutes: 3, description: "listen to a song intro/outro", icon: "Music2" },
    { minutes: 4, description: "do a quick stretch routine", icon: "Move" },
    { minutes: 5, description: "make a cup of instant coffee or tea", icon: "Coffee" },

    // Short (6-15 mins)
    { minutes: 6, description: "quickly scan news headlines", icon: "Newspaper" },
    { minutes: 7, description: "check and reply to a couple of emails", icon: "Mail" },
    { minutes: 8, description: "water a few houseplants", icon: "Sprout" },
    { minutes: 9, description: "walk to the end of the street and back", icon: "Footprints" },
    { minutes: 10, description: "listen to 2-3 average pop songs", icon: "Music" },
    { minutes: 12, description: "read a short online news article", icon: "BookOpen" },
    { minutes: 13, description: "fold a small basket of laundry", icon: "WashingMachine" },
    { minutes: 15, description: "take a brisk walk around the block", icon: "Footprints" },
    { minutes: 15, description: "listen to a short daily podcast", icon: "Podcast" },

    // Medium-Short (16-30 mins)
    { minutes: 17, description: "solve an easy Sudoku puzzle", icon: "Puzzle" },
    { minutes: 18, description: "unload the dishwasher", icon: "Sparkles" }, // Using Sparkles for clean
    { minutes: 20, description: "read a chapter of a novel", icon: "BookOpen" },
    { minutes: 22, description: "watch a typical YouTube video essay", icon: "Youtube" },
    { minutes: 25, description: "do a quick tidy-up of one room", icon: "SprayCan" },
    { minutes: 28, description: "play a few levels of a mobile game", icon: "Gamepad2" },
    { minutes: 30, description: "watch an episode of a standard sitcom", icon: "Tv" },
    { minutes: 30, description: "practice mindfulness or meditate", icon: "BrainCircuit" },

    // Medium (31-60 mins)
    { minutes: 33, description: "cook a simple breakfast from scratch", icon: "EggFried" },
    { minutes: 35, description: "make and eat a sandwich lunch", icon: "Sandwich" }, // Assuming Sandwich icon exists or use Utensils
    { minutes: 40, description: "make a quick grocery run for essentials", icon: "ShoppingCart" },
    { minutes: 45, description: "do a short yoga or HIIT workout video", icon: "Dumbbell" },
    { minutes: 50, description: "plan your meals for the next few days", icon: "NotebookPen" },
    { minutes: 55, description: "learn a few useful phrases in a new language", icon: "Languages" },
    { minutes: 60, description: "prepare and eat a standard dinner", icon: "Utensils" }, // 1 hour
    { minutes: 60, description: "attend a typical team meeting", icon: "Users" },

    // Medium-Long (61-120 mins / 1-2 hours)
    { minutes: 65, description: "go for a focused jog or run", icon: "Footprints" },
    { minutes: 70, description: "watch a documentary episode", icon: "Film" },
    { minutes: 75, description: "do a full load of laundry (wash & dry)", icon: "WashingMachine" },
    { minutes: 80, description: "play a competitive online game match", icon: "Gamepad2" },
    { minutes: 90, description: "watch a shorter feature film", icon: "Film" }, // 1.5 hours
    { minutes: 100, description: "bake a batch of cookies or muffins", icon: "Cookie" },
    { minutes: 110, description: "spend some quality time at a local park", icon: "Trees" },
    { minutes: 120, description: "watch an average-length movie", icon: "Clapperboard" }, // 2 hours
    { minutes: 120, description: "have a relaxed dinner with conversation", icon: "Pizza" }, // Assuming Pizza icon exists or use Utensils

    // Long (121-240 mins / 2-4 hours)
    { minutes: 135, description: "assemble a small piece of IKEA furniture", icon: "Hammer" },
    { minutes: 150, description: "visit a local farmer's market and browse", icon: "ShoppingBasket" }, // 2.5 hours
    { minutes: 165, description: "learn and play a new board game", icon: "Dice5" },
    { minutes: 180, description: "attend a local community festival or event", icon: "Building" }, // 3 hours
    { minutes: 180, description: "prepare and host a simple dinner party", icon: "ChefHat" },
    { minutes: 200, description: "go on a bike ride on a local trail", icon: "Bike" },
    { minutes: 210, description: "visit a local museum or small art gallery", icon: "Landmark" }, // 3.5 hours
    { minutes: 240, description: "take a scenic drive to a nearby viewpoint", icon: "MapIcon" }, // 4 hours // Using MapIcon alias
    { minutes: 240, description: "watch two full movies back-to-back", icon: "Clapperboard"},

    // Very Long (241-600 mins / 4-10 hours)
    { minutes: 270, description: "attend a half-day professional workshop", icon: "Presentation" }, // 4.5 hours
    { minutes: 300, description: "deep clean your kitchen or bathroom", icon: "Sparkles" }, // 5 hours
    { minutes: 330, description: "plant some flowers or start a small garden bed", icon: "Flower2" },
    { minutes: 360, description: "attend a live music concert (including travel)", icon: "Music" }, // 6 hours
    { minutes: 390, description: "spend an afternoon volunteering for a cause", icon: "HandHeart" },
    { minutes: 420, description: "paint an accent wall in a room", icon: "PaintRoller" }, // 7 hours
    { minutes: 450, description: "binge-watch half a season of a TV show", icon: "Tv" },
    { minutes: 480, description: "go on a moderate day hike in the mountains", icon: "MountainSnow" }, // 8 hours
    { minutes: 540, description: "fly one-way Chicago to NYC (incl. airport time)", icon: "PlaneTakeoff" }, // 9 hours
    { minutes: 600, description: "attend a full-day conference or training seminar", icon: "ClipboardCheck" }, // 10 hours

    // Extended (601-3000 mins / 10-50 hours)
    { minutes: 660, description: "drive from Boston to Washington D.C.", icon: "Car"},
    { minutes: 720, description: "drive from Los Angeles to San Francisco", icon: "Navigation" }, // 12 hours
    { minutes: 840, description: "binge-watch an entire short TV series season", icon: "Youtube" }, // 14 hours
    { minutes: 960, description: "complete a significant weekend home DIY project", icon: "Wrench" }, // 16 hours
    { minutes: 1140, description: "take a long weekend road trip adventure", icon: "MapPinned" }, // 19 hours
    { minutes: 1440, description: "spend a full day thoroughly exploring a new city", icon: "Building2" }, // 24 hours / 1 day
    { minutes: 1800, description: "learn the absolute basics of knitting or crochet", icon: "BrainCircuit" }, // 30 hours
    { minutes: 2160, description: "take a relaxing 3-day weekend getaway", icon: "Luggage" }, // 36 hours
    { minutes: 2400, description: "complete a substantial online course module", icon: "GraduationCap" }, // 40 hours
    { minutes: 2700, description: "drive from New York City to Miami", icon: "Car" }, // ~45 hours driving
    { minutes: 3000, description: "fly round-trip NYC to London (incl. airport/travel time)", icon: "Globe" }, // ~50 hours (MAX LIMIT)
];


/**
 * Generates a list of relatable time perspective activities that sum up to (or close to) the total minutes
 * using a randomized selection process. Aims to cover at least 96% of the total time.
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
    let accumulatedMinutes = 0; // Keep track of time covered
    const minTargetMinutes = totalMinutes * 0.96; // Target 96% coverage

    // Use a Map to store activity description -> { icon, count }
    const activityCounts = new Map<string, { icon?: string; count: number }>();
    const MIN_TIME_THRESHOLD = 1; // Stop when remaining time is very small

    // Limit iterations to prevent infinite loops
    let iterations = 0;
    const MAX_ITERATIONS = 300; // Increased iterations

    // Loop while we haven't covered enough time and haven't hit limits
    while (remainingMinutes >= MIN_TIME_THRESHOLD && accumulatedMinutes < minTargetMinutes && iterations < MAX_ITERATIONS) {
        iterations++;
        // Filter perspectives that fit within the remaining time
        // Prioritize larger chunks if far from target? (Simple random for now)
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

        // Subtract the duration from remaining time AND add to accumulated time
        remainingMinutes -= chosenPerspective.minutes;
        accumulatedMinutes += chosenPerspective.minutes;
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

    // Limit the number of *distinct* items shown in the tooltip
    if (resultList.length > maxItems) {
        resultList.length = maxItems;
    }


    // If the list is empty after trying (or didn't reach target sufficiently), try fallback
     if (resultList.length === 0 || accumulatedMinutes < minTargetMinutes * 0.8) { // Lowered threshold slightly for fallback trigger
         // Fallback: Find the single closest perspective (even if slightly over) for very small amounts
         const closest = timePerspectives
              .filter(p => p.minutes > 0) // Ensure we don't pick a zero-minute item
              .reduce((prev, curr) =>
                 (curr.minutes > 0 && Math.abs(curr.minutes - totalMinutes) < Math.abs(prev.minutes - totalMinutes)) ? curr : prev
              , { minutes: Infinity, description: '' }); // Start with Infinity
          if (closest.minutes <= totalMinutes * 1.5 && closest.minutes >= 1) { // Only if reasonably close and >= 1 min
              return [{ description: closest.description, icon: closest.icon, count: 1 }];
          }
         return null; // Return null if even fallback fails
     }

    return resultList;
}
