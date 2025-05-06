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
    { minutes: 5, description: "send a quick thank-you email", icon: "Mail" },

    // Short (6-15 mins)
    { minutes: 6, description: "quickly scan news headlines", icon: "Newspaper" },
    { minutes: 7, description: "check and reply to a couple of emails", icon: "Mail" },
    { minutes: 8, description: "water a few houseplants", icon: "Sprout" },
    { minutes: 9, description: "walk to the end of the street and back", icon: "Footprints" },
    { minutes: 10, description: "listen to 2-3 average pop songs", icon: "Music" },
    { minutes: 10, description: "perform a short guided meditation", icon: "BrainCircuit" },
    { minutes: 12, description: "read a short online news article", icon: "BookOpen" },
    { minutes: 13, description: "fold a small basket of laundry", icon: "WashingMachine" },
    { minutes: 14, description: "brainstorm ideas for a creative project", icon: "NotebookPen" },
    { minutes: 15, description: "take a brisk walk around the block", icon: "Footprints" },
    { minutes: 15, description: "listen to a short daily podcast", icon: "Podcast" },
    { minutes: 15, description: "learn a new magic trick", icon: "Sparkles" },


    // Medium-Short (16-30 mins)
    { minutes: 17, description: "solve an easy Sudoku puzzle", icon: "Puzzle" },
    { minutes: 18, description: "unload the dishwasher", icon: "Sparkles" },
    { minutes: 20, description: "read a chapter of a novel", icon: "BookOpen" },
    { minutes: 20, description: "write a short journal entry", icon: "NotebookPen" },
    { minutes: 22, description: "watch a typical YouTube video essay", icon: "Youtube" },
    { minutes: 25, description: "do a quick tidy-up of one room", icon: "SprayCan" },
    { minutes: 25, description: "call a friend or family member to chat", icon: "Phone" }, // Assuming Phone icon exists
    { minutes: 28, description: "play a few levels of a mobile game", icon: "Gamepad2" },
    { minutes: 30, description: "watch an episode of a standard sitcom", icon: "Tv" },
    { minutes: 30, description: "practice mindfulness or meditate", icon: "BrainCircuit" },
    { minutes: 30, description: "follow an online drawing tutorial", icon: "PenTool" },


    // Medium (31-60 mins)
    { minutes: 33, description: "cook a simple breakfast from scratch", icon: "EggFried" },
    { minutes: 35, description: "make and eat a sandwich lunch", icon: "Sandwich" },
    { minutes: 40, description: "make a quick grocery run for essentials", icon: "ShoppingCart" },
    { minutes: 40, description: "practice a musical instrument", icon: "Music" },
    { minutes: 45, description: "do a short yoga or HIIT workout video", icon: "Dumbbell" },
    { minutes: 50, description: "plan your meals for the next few days", icon: "NotebookPen" },
    { minutes: 50, description: "take a scenic power walk", icon: "Footprints" },
    { minutes: 55, description: "learn a few useful phrases in a new language", icon: "Languages" },
    { minutes: 60, description: "prepare and eat a standard dinner", icon: "Utensils" }, // 1 hour
    { minutes: 60, description: "attend a typical team meeting", icon: "Users" },
    { minutes: 60, description: "participate in an online webinar", icon: "Presentation" },


    // Medium-Long (61-120 mins / 1-2 hours)
    { minutes: 65, description: "go for a focused jog or run", icon: "Footprints" },
    { minutes: 70, description: "watch a documentary episode", icon: "Film" },
    { minutes: 75, description: "do a full load of laundry (wash & dry)", icon: "WashingMachine" },
    { minutes: 75, description: "deep-condition your hair and relax", icon: "Wind" }, // Using Wind as 'relax'
    { minutes: 80, description: "play a competitive online game match", icon: "Gamepad2" },
    { minutes: 90, description: "watch a shorter feature film", icon: "Film" }, // 1.5 hours
    { minutes: 90, description: "write a blog post or short story", icon: "NotebookPen" },
    { minutes: 100, description: "bake a batch of cookies or muffins", icon: "Cookie" },
    { minutes: 110, description: "spend some quality time at a local park", icon: "Trees" },
    { minutes: 120, description: "watch an average-length movie", icon: "Clapperboard" }, // 2 hours
    { minutes: 120, description: "have a relaxed dinner with conversation", icon: "Pizza" },
    { minutes: 120, description: "do a detailed car wash and interior clean", icon: "Car" },


    // Long (121-240 mins / 2-4 hours)
    { minutes: 135, description: "assemble a small piece of IKEA furniture", icon: "Hammer" },
    { minutes: 150, description: "visit a local farmer's market and browse", icon: "ShoppingBasket" }, // 2.5 hours
    { minutes: 150, description: "attend a live local band performance", icon: "Music2" },
    { minutes: 165, description: "learn and play a new board game", icon: "Dice5" },
    { minutes: 180, description: "attend a local community festival or event", icon: "Building" }, // 3 hours
    { minutes: 180, description: "prepare and host a simple dinner party", icon: "ChefHat" },
    { minutes: 180, description: "go for a long, leisurely bike ride", icon: "Bike" },
    { minutes: 200, description: "go on a bike ride on a local trail", icon: "Bike" },
    { minutes: 210, description: "visit a local museum or small art gallery", icon: "Landmark" }, // 3.5 hours
    { minutes: 240, description: "take a scenic drive to a nearby viewpoint", icon: "MapIcon" }, // 4 hours
    { minutes: 240, description: "watch two full movies back-to-back", icon: "Clapperboard"},
    { minutes: 240, description: "complete a challenging jigsaw puzzle", icon: "Puzzle" },


    // Very Long (241-600 mins / 4-10 hours)
    { minutes: 270, description: "attend a half-day professional workshop", icon: "Presentation" }, // 4.5 hours
    { minutes: 300, description: "deep clean your kitchen or bathroom", icon: "Sparkles" }, // 5 hours
    { minutes: 300, description: "spend an afternoon fishing or kayaking", icon: "Fish" }, // Assuming Fish icon exists
    { minutes: 330, description: "plant some flowers or start a small garden bed", icon: "Flower2" },
    { minutes: 360, description: "attend a live music concert (including travel)", icon: "Music" }, // 6 hours
    { minutes: 360, description: "read a substantial non-fiction book", icon: "BookOpen" },
    { minutes: 390, description: "spend an afternoon volunteering for a cause", icon: "HandHeart" },
    { minutes: 420, description: "paint an accent wall in a room", icon: "PaintRoller" }, // 7 hours
    { minutes: 450, description: "binge-watch half a season of a TV show", icon: "Tv" },
    { minutes: 480, description: "go on a moderate day hike in the mountains", icon: "MountainSnow" }, // 8 hours
    { minutes: 480, description: "attend a full day of a local sports tournament", icon: "Trophy" },
    { minutes: 540, description: "fly one-way Chicago to NYC (incl. airport time)", icon: "PlaneTakeoff" }, // 9 hours
    { minutes: 600, description: "attend a full-day conference or training seminar", icon: "ClipboardCheck" }, // 10 hours
    { minutes: 600, description: "complete a short online coding bootcamp module", icon: "Laptop" },


    // Extended (601-3000 mins / 10-50 hours)
    { minutes: 660, description: "drive from Boston to Washington D.C.", icon: "Car"},
    { minutes: 720, description: "drive from Los Angeles to San Francisco", icon: "Navigation" }, // 12 hours
    { minutes: 720, description: "create a detailed travel itinerary for a week-long trip", icon: "MapPinned" },
    { minutes: 840, description: "binge-watch an entire short TV series season", icon: "Youtube" }, // 14 hours
    { minutes: 960, description: "complete a significant weekend home DIY project", icon: "Wrench" }, // 16 hours
    { minutes: 960, description: "learn to cook a multi-course gourmet meal", icon: "ChefHat" },
    { minutes: 1140, description: "take a long weekend road trip adventure", icon: "MapPinned" }, // 19 hours
    { minutes: 1440, description: "spend a full day thoroughly exploring a new city", icon: "Building2" }, // 24 hours / 1 day
    { minutes: 1440, description: "write and record a short song", icon: "Music2" },
    { minutes: 1800, description: "learn the absolute basics of knitting or crochet", icon: "BrainCircuit" }, // 30 hours
    { minutes: 2160, description: "take a relaxing 3-day weekend getaway", icon: "Luggage" }, // 36 hours
    { minutes: 2160, description: "build a complex LEGO model", icon: "Puzzle" },
    { minutes: 2400, description: "complete a substantial online course module", icon: "GraduationCap" }, // 40 hours
    { minutes: 2700, description: "drive from New York City to Miami", icon: "Car" }, // ~45 hours driving
    { minutes: 3000, description: "fly round-trip NYC to London (incl. airport/travel time)", icon: "Globe" }, // ~50 hours (MAX LIMIT)
    { minutes: 3000, description: "write the first draft of a short novel (NaNoWriMo pace)", icon: "NotebookPen" },
];


/**
 * Generates a list of relatable time perspective activities that sum up to (or close to) the total minutes
 * using a randomized selection process. Aims to cover at least 98% of the total time.
 *
 * @param totalMinutes The total number of minutes worked.
 * @param maxItemsToShow The maximum number of distinct activity items to include in the list.
 * @returns An array of objects, each containing the activity description, icon, and the number of times it was done, or null if totalMinutes is too low.
 */
export interface CombinedPerspective {
    description: string;
    icon?: string;
    count: number;
}

export function generateCombinedPerspectiveList(
    totalMinutes: number,
    maxItemsToShow: number = 10 // Max distinct items to show
): CombinedPerspective[] | null {
    if (isNaN(totalMinutes) || totalMinutes < 1) {
        return null;
    }

    let remainingMinutes = totalMinutes;
    const minTargetCoverage = totalMinutes * 0.98; // Target 98% coverage
    let accumulatedMinutes = 0;

    const activityCounts = new Map<string, { icon?: string; count: number; totalItemMinutes: number }>();
    const MIN_TIME_THRESHOLD = 1; // Smallest activity to consider
    let iterations = 0;
    const MAX_ITERATIONS = 500; // Increased iterations for potentially more items

    while (remainingMinutes >= MIN_TIME_THRESHOLD && accumulatedMinutes < minTargetCoverage && iterations < MAX_ITERATIONS) {
        iterations++;
        const availablePerspectives = timePerspectives.filter(p => p.minutes <= remainingMinutes && p.minutes > 0);

        if (availablePerspectives.length === 0) {
            break;
        }

        const chosenPerspective = sample(availablePerspectives);
        if (!chosenPerspective) break;

        const current = activityCounts.get(chosenPerspective.description);
        activityCounts.set(chosenPerspective.description, {
            icon: chosenPerspective.icon,
            count: (current?.count || 0) + 1,
            totalItemMinutes: (current?.totalItemMinutes || 0) + chosenPerspective.minutes,
        });

        remainingMinutes -= chosenPerspective.minutes;
        accumulatedMinutes += chosenPerspective.minutes;
    }

    let resultList: CombinedPerspective[] = Array.from(activityCounts.entries()).map(
        ([description, { icon, count }]) => ({
            description,
            icon,
            count,
        })
    );

    // Sort by total time contributed by each activity type (descending) then by count
     resultList.sort((a, b) => {
        const totalMinutesA = activityCounts.get(a.description)?.totalItemMinutes || 0;
        const totalMinutesB = activityCounts.get(b.description)?.totalItemMinutes || 0;
        if (totalMinutesB !== totalMinutesA) {
            return totalMinutesB - totalMinutesA;
        }
        return (activityCounts.get(b.description)?.count || 0) - (activityCounts.get(a.description)?.count || 0);
    });


    // Limit the number of *distinct* items shown
    if (resultList.length > maxItemsToShow) {
        resultList.length = maxItemsToShow;
    }
    
    // Fallback: if still not enough coverage or list is too short, try to add one significant item.
    if (resultList.length === 0 || (resultList.length < Math.min(3, maxItemsToShow) && accumulatedMinutes < minTargetCoverage)) {
        const significantRemaining = totalMinutes - accumulatedMinutes;
        if (significantRemaining > 5) { // Only add fallback if there's a reasonable chunk of time left
             const closestLarger = timePerspectives
                .filter(p => p.minutes > 0 && p.minutes <= significantRemaining * 1.2) // Allow slightly larger
                .sort((a,b) => b.minutes - a.minutes); // Get largest suitable

            if (closestLarger.length > 0 && !resultList.find(item => item.description === closestLarger[0].description)) {
                 resultList.push({ description: closestLarger[0].description, icon: closestLarger[0].icon, count: 1 });
                 accumulatedMinutes += closestLarger[0].minutes;
            }
        }
    }


    // Final fallback if list is still empty
    if (resultList.length === 0) {
        const closest = timePerspectives
            .filter(p => p.minutes > 0)
            .reduce((prev, curr) =>
                (Math.abs(curr.minutes - totalMinutes) < Math.abs(prev.minutes - totalMinutes)) ? curr : prev,
                { minutes: Infinity, description: '', icon: undefined }
            );
        if (closest.minutes <= totalMinutes * 1.5 && closest.minutes >= 1) {
            return [{ description: closest.description, icon: closest.icon, count: 1 }];
        }
        return null;
    }
    
    // Recalculate total represented time by the chosen items if list was trimmed or fallback added
    const finalAccumulatedMinutes = resultList.reduce((sum, item) => {
        const originalItem = timePerspectives.find(p => p.description === item.description);
        return sum + (originalItem ? originalItem.minutes * item.count : 0);
    }, 0);

    // If final list doesn't meet minimum coverage after all attempts, return null (or just the list)
    // This check might be too strict if maxItemsToShow is very low
    if (finalAccumulatedMinutes < totalMinutes * 0.90 && totalMinutes > 30) { // More lenient final check
       // console.log("Final list for time did not meet 90% coverage:", finalAccumulatedMinutes, totalMinutes);
       // return null; // Option to return null if not enough coverage
    }


    return resultList;
}
