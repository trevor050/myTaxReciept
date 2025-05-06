/**
 * @fileOverview Generates relatable text snippets comparing work time to everyday activities.
 */

interface TimePerspective {
    minutes: number;
    description: string;
}

// Ordered list of activities and their approximate durations in minutes
const timePerspectives: TimePerspective[] = [
    { minutes: 1, description: "scroll through social media for a minute" },
    { minutes: 5, description: "make a cup of coffee" },
    { minutes: 10, description: "listen to a couple of songs" },
    { minutes: 15, description: "take a short walk around the block" },
    { minutes: 30, description: "watch an episode of a sitcom" },
    { minutes: 45, description: "do a quick workout" },
    { minutes: 60, description: "prepare and eat a simple meal" },
    { minutes: 90, description: "watch a short movie" },
    { minutes: 120, description: "watch an average-length movie" }, // 2 hours
    { minutes: 180, description: "take a scenic drive" }, // 3 hours
    { minutes: 240, description: "binge-watch several episodes of a show" }, // 4 hours
    { minutes: 300, description: "attend a concert or sports game" }, // 5 hours
    { minutes: 360, description: "deep clean a room in your house" }, // 6 hours
    { minutes: 480, description: "work a full standard shift" }, // 8 hours
    { minutes: 720, description: "fly from New York to London" }, // 12 hours (approx flight time)
    { minutes: 1440, description: "spend an entire day doing something you love" }, // 24 hours
    { minutes: 2880, description: "take a weekend getaway trip" }, // 2 days
    { minutes: 10080, description: "take a full week of vacation" }, // 7 days
    { minutes: 20160, description: "go on a two-week international trip" }, // 14 days
    { minutes: 43200, description: "take a month off work" }, // 30 days (approx)
    { minutes: 129600, description: "spend a whole season enjoying the outdoors" }, // 3 months (approx)
    { minutes: 259200, description: "take a six-month sabbatical" }, // 6 months (approx)
    { minutes: 525600, description: "take an entire year off" }, // 1 year
];

/**
 * Finds the most relatable time perspective description for a given duration.
 *
 * @param totalMinutes The total number of minutes worked.
 * @returns A string describing a relatable activity, or null if no suitable perspective found.
 */
export function getTimePerspectiveText(totalMinutes: number): string | null {
    if (isNaN(totalMinutes) || totalMinutes <= 0) {
        return null;
    }

    // Find the closest perspective without going over, or the smallest if totalMinutes is very small
    let bestMatch: TimePerspective | null = null;
    for (let i = timePerspectives.length - 1; i >= 0; i--) {
        if (totalMinutes >= timePerspectives[i].minutes) {
            bestMatch = timePerspectives[i];
            break;
        }
    }

     // If no match found (i.e., totalMinutes is less than the smallest perspective), use the smallest one.
     if (!bestMatch && timePerspectives.length > 0) {
        bestMatch = timePerspectives[0];
    }


    if (bestMatch) {
        // Add slight variations for phrasing
        const prefixes = ["You could have...", "That's enough time to...", "In that time, you could..."];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        return `${prefix} ${bestMatch.description}.`;
    }

    return null; // Fallback if something unexpected happens
}
