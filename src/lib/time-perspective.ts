/**
 * @fileOverview Generates relatable text snippets comparing work time to everyday activities.
 */

interface TimePerspectiveItem {
    minutes: number;
    description: string;
    icon?: string; // Optional: Suggest an icon name (e.g., from lucide-react)
}

// Ordered list of activities and their approximate durations in minutes (Expanded & Sorted Ascending)
// Target: 50+ items, max duration ~3000 mins (50 hours)
const timePerspectives: TimePerspectiveItem[] = [
    // Short (1-15 mins)
    { minutes: 1, description: "take a few deep breaths", icon: "Wind" },
    { minutes: 2, description: "brush your teeth", icon: "Smile" }, // No Tooth icon, using Smile
    { minutes: 3, description: "listen to a short song intro", icon: "Music2" },
    { minutes: 5, description: "make a cup of coffee or tea", icon: "Coffee" },
    { minutes: 7, description: "check your email", icon: "Mail" },
    { minutes: 10, description: "listen to 2-3 average songs", icon: "Music" },
    { minutes: 12, description: "read a news article", icon: "Newspaper" },
    { minutes: 15, description: "take a short walk around the block", icon: "Footprints" },
    { minutes: 15, description: "listen to a short podcast segment", icon: "Podcast" },

    // Medium-Short (16-60 mins)
    { minutes: 20, description: "read a chapter of a book", icon: "BookOpen" },
    { minutes: 25, description: "do a quick tidy-up of a room", icon: "SprayCan" }, // No broom icon
    { minutes: 30, description: "watch an episode of a sitcom", icon: "Tv" },
    { minutes: 30, description: "complete a daily crossword puzzle", icon: "Puzzle" },
    { minutes: 35, description: "cook a simple breakfast", icon: "EggFried" },
    { minutes: 40, description: "take a quick grocery run for essentials", icon: "ShoppingCart" },
    { minutes: 45, description: "do a quick home workout", icon: "Dumbbell" },
    { minutes: 50, description: "plan your meals for the week", icon: "NotebookPen" },
    { minutes: 60, description: "prepare and eat a simple meal", icon: "Utensils" }, // 1 hour
    { minutes: 60, description: "attend a standard meeting", icon: "Users" },
    { minutes: 60, description: "mow an average-sized lawn", icon: "Tractor" }, // Tractor as proxy

    // Medium-Long (61-180 mins / 1-3 hours)
    { minutes: 75, description: "do a load of laundry (wash, dry, fold)", icon: "WashingMachine" },
    { minutes: 75, description: "go for a session at the gym", icon: "HeartPulse" },
    { minutes: 90, description: "watch a short feature film", icon: "Film" }, // 1.5 hours
    { minutes: 90, description: "learn a new board game", icon: "Dice5" },
    { minutes: 100, description: "bake a batch of cookies", icon: "Cookie" },
    { minutes: 120, description: "watch an average-length movie", icon: "Clapperboard" }, // 2 hours
    { minutes: 120, description: "volunteer for a couple of hours", icon: "HandHeart" },
    { minutes: 150, description: "assemble a piece of flat-pack furniture", icon: "Hammer" }, // 2.5 hours
    { minutes: 180, description: "attend a local sports game", icon: "Trophy" }, // 3 hours
    { minutes: 180, description: "prepare a complex meal or host a small dinner", icon: "ChefHat" },
    { minutes: 180, description: "visit a local museum", icon: "Landmark" },
    { minutes: 180, description: "write a short blog post or article", icon: "PenTool" },
    { minutes: 180, description: "drive to a nearby city for a visit", icon: "Car" },

    // Long (181-600 mins / 3-10 hours)
    { minutes: 240, description: "take a scenic drive and stop for lunch", icon: "Map" }, // 4 hours
    { minutes: 240, description: "attend a half-day workshop", icon: "Presentation" },
    { minutes: 240, description: "take a short domestic flight (incl. airport time)", icon: "Plane" },
    { minutes: 300, description: "deep clean a couple of rooms", icon: "Sparkles" }, // 5 hours
    { minutes: 300, description: "plant a small garden", icon: "Sprout" },
    { minutes: 360, description: "attend a live concert", icon: "Music" }, // 6 hours
    { minutes: 420, description: "spend an afternoon volunteering", icon: "HelpingHand" }, // 7 hours
    { minutes: 480, description: "work a full standard shift", icon: "Briefcase" }, // 8 hours
    { minutes: 480, description: "paint a small room", icon: "PaintRoller" },
    { minutes: 540, description: "go on a day hike", icon: "MountainSnow" }, // 9 hours
    { minutes: 600, description: "attend a full-day conference", icon: "ClipboardCheck" }, // 10 hours
    { minutes: 600, description: "fly from Chicago to New York (incl. airport time)", icon: "PlaneTakeoff" },

    // Very Long (601-3000 mins / 10-50 hours)
    { minutes: 720, description: "drive from Los Angeles to San Francisco", icon: "Navigation" }, // 12 hours
    { minutes: 960, description: "complete a significant weekend DIY project", icon: "Wrench" }, // 16 hours
    { minutes: 1200, description: "binge-watch an entire season of a TV show", icon: "Youtube" }, // 20 hours
    { minutes: 1440, description: "spend an entire day exploring a new city", icon: "Building2" }, // 24 hours / 1 day
    { minutes: 1800, description: "take a quick weekend road trip", icon: "MapPinned" }, // 30 hours
    { minutes: 2400, description: "learn the basics of a new skill (e.g., coding, instrument)", icon: "BrainCircuit" }, // 40 hours
    { minutes: 2880, description: "take a relaxing weekend getaway trip", icon: "Luggage" }, // 48 hours / 2 days
    { minutes: 3000, description: "work a standard work week (approx)", icon: "CalendarDays" }, // 50 hours (MAX LIMIT)
];


// Sort descending by duration for the combination algorithm
const sortedTimePerspectives = [...timePerspectives].sort((a, b) => b.minutes - a.minutes);

/**
 * Generates a list of relatable time perspective activities that sum up to (or close to) the total minutes.
 *
 * @param totalMinutes The total number of minutes worked.
 * @param maxItems The maximum number of activity items to include in the list.
 * @returns An array of objects, each containing the activity description and the number of times it was done, or null if totalMinutes is too low.
 */
export interface CombinedPerspective {
    description: string;
    icon?: string;
    count: number;
}

export function generateCombinedPerspectiveList(
    totalMinutes: number,
    maxItems: number = 4 // Limit the number of items in the list
): CombinedPerspective[] | null {
    if (isNaN(totalMinutes) || totalMinutes < 1) {
        return null; // Don't show for less than a minute
    }

    let remainingMinutes = totalMinutes;
    const resultList: CombinedPerspective[] = [];
    const usedIndices = new Set<number>(); // Track used perspective indices to avoid immediate repetition

    // Cap remainingMinutes at the highest perspective available to prevent infinite loops on very large numbers
    if (sortedTimePerspectives.length > 0 && remainingMinutes > sortedTimePerspectives[0].minutes * maxItems * 1.5) { // Allow some buffer
        remainingMinutes = sortedTimePerspectives[0].minutes * maxItems * 1.5;
    }


    while (resultList.length < maxItems && remainingMinutes >= 1) {
        // Find the best fit perspective (largest duration less than or equal to remaining)
        let bestFitIndex = -1;
        for (let i = 0; i < sortedTimePerspectives.length; i++) {
             // Ensure the perspective duration is less than remaining and hasn't been just used
             // Allow re-using if it's the only option left or significantly smaller than remaining
            if (sortedTimePerspectives[i].minutes <= remainingMinutes &&
                (!usedIndices.has(i) || sortedTimePerspectives[i].minutes < remainingMinutes * 0.5 || usedIndices.size >= sortedTimePerspectives.length -1 )
                ) {

                // Prefer perspectives not used recently, otherwise take the largest fit
                 bestFitIndex = i;
                 break; // Take the largest possible fit that hasn't been just used
            }
        }

        // Fallback if no unused perspective fits (e.g., only very small items left)
        if (bestFitIndex === -1) {
             bestFitIndex = sortedTimePerspectives.findIndex(p => p.minutes <= remainingMinutes);
        }

        // If no perspective fits at all (remainingMinutes is too small), break the loop
        if (bestFitIndex === -1) {
            break;
        }

        const chosenPerspective = sortedTimePerspectives[bestFitIndex];

        // Calculate how many times this activity can be done
        const count = Math.max(1, Math.floor(remainingMinutes / chosenPerspective.minutes));

        // Add to the result list
        resultList.push({
            description: chosenPerspective.description,
            icon: chosenPerspective.icon,
            count: count,
        });

        // Update remaining minutes and mark index as used for the next iteration
        remainingMinutes -= chosenPerspective.minutes * count;
        usedIndices.add(bestFitIndex);
         // Optional: Clear usedIndices if we want to allow repetition after one round
         // if (usedIndices.size >= Math.min(5, sortedTimePerspectives.length)) { // Example: Reset after 5 unique items
         //     usedIndices.clear();
         // }
    }

    // If the list is empty after trying, return null
    if (resultList.length === 0) {
        // Try finding the single closest perspective (even if slightly over) as a fallback for small amounts
        const closest = timePerspectives.reduce((prev, curr) =>
            Math.abs(curr.minutes - totalMinutes) < Math.abs(prev.minutes - totalMinutes) ? curr : prev
        );
         if (closest && closest.minutes < totalMinutes * 2) { // Only if reasonably close
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


// Helper function to get an icon component based on name string
// This requires importing all icons or using a dynamic import strategy.
// For simplicity, we'll assume icons are imported in the component using this.
// Example (in component): const Icon = Icons[item.icon || 'HelpCircle'];
// import * as Icons from 'lucide-react';
// export const getIconComponent = (iconName?: string): React.ElementType => {
//   if (!iconName) return Icons['HelpCircle'];
//   return (Icons as any)[iconName] || Icons['HelpCircle'];
// };

// Example usage (for testing):
// console.log("5 minutes:", getTimePerspectiveText(5));
// console.log("70 minutes:", getTimePerspectiveText(70));
// console.log("300 minutes:", getTimePerspectiveText(300));
// console.log("1000 minutes:", getTimePerspectiveText(1000));
// console.log("5000 minutes:", getTimePerspectiveText(5000));

// console.log("5 minutes List:", generateCombinedPerspectiveList(5));
// console.log("70 minutes List:", generateCombinedPerspectiveList(70));
// console.log("300 minutes List:", generateCombinedPerspectiveList(300));
// console.log("1000 minutes List:", generateCombinedPerspectiveList(1000));
// console.log("5000 minutes List:", generateCombinedPerspectiveList(5000));
// console.log("0.5 minutes List:", generateCombinedPerspectiveList(0.5));
// console.log("1 minute List:", generateCombinedPerspectiveList(1));

    