/**
 * @fileOverview Generates relatable text snippets comparing work time to everyday activities.
 */

interface TimePerspective {
    minutes: number;
    description: string;
    // Optional: Add icon names if desired, e.g., icon?: string (from lucide-react)
}

// Ordered list of activities and their approximate durations in minutes (Expanded & Sorted Ascending)
const timePerspectives: TimePerspective[] = [
    { minutes: 1, description: "take a few deep breaths" },
    { minutes: 2, description: "listen to a short song intro" },
    { minutes: 5, description: "make a cup of coffee or tea" },
    { minutes: 10, description: "listen to 2-3 average songs" },
    { minutes: 15, description: "take a short walk around the block" },
    { minutes: 20, description: "read a chapter of a book" },
    { minutes: 30, description: "watch an episode of a sitcom" },
    { minutes: 45, description: "do a quick home workout" },
    { minutes: 60, description: "prepare and eat a simple meal" }, // 1 hour
    { minutes: 90, description: "watch a short feature film" }, // 1.5 hours
    { minutes: 120, description: "watch an average-length movie" }, // 2 hours
    { minutes: 180, description: "attend a local sports game" }, // 3 hours
    { minutes: 240, description: "take a scenic drive and stop for lunch" }, // 4 hours
    { minutes: 300, description: "deep clean a couple of rooms" }, // 5 hours
    { minutes: 360, description: "attend a live concert" }, // 6 hours
    { minutes: 480, description: "work a full standard shift" }, // 8 hours
    { minutes: 600, description: "fly from Chicago to New York" }, // 10 hours (incl. airport time)
    { minutes: 720, description: "drive from Los Angeles to San Francisco" }, // 12 hours
    { minutes: 960, description: "binge-watch an entire season of a TV show" }, // 16 hours
    { minutes: 1440, description: "spend an entire day exploring a new city" }, // 24 hours / 1 day
    { minutes: 2880, description: "take a relaxing weekend getaway trip" }, // 2 days
    { minutes: 4320, description: "go on a long weekend camping trip" }, // 3 days
    { minutes: 5760, description: "work a standard work week" }, // 4 days (approx 32-40 hours)
    { minutes: 10080, description: "take a full week of vacation" }, // 7 days
    { minutes: 20160, description: "go on a two-week international trip" }, // 14 days
    { minutes: 30240, description: "complete a challenging online course" }, // 3 weeks
    { minutes: 43200, description: "take a month off work for a sabbatical" }, // 30 days (approx 1 month)
    { minutes: 86400, description: "learn the basics of a new language" }, // 2 months
    { minutes: 129600, description: "spend a whole season enjoying the outdoors" }, // 3 months
    { minutes: 259200, description: "write the first draft of a novel" }, // 6 months
    { minutes: 388800, description: "plan and execute a major home renovation" }, // 9 months
    { minutes: 525600, description: "take an entire year off to travel the world" }, // 1 year
    { minutes: 1051200, description: "complete a two-year degree program" }, // 2 years
    { minutes: 2628000, description: "earn a bachelor's degree (approx. dedicated time)" }, // 5 years
];

// Sort descending for the combination algorithm
const sortedTimePerspectives = [...timePerspectives].sort((a, b) => b.minutes - a.minutes);

/**
 * Generates a relatable time perspective description, potentially combining activities.
 *
 * @param totalMinutes The total number of minutes worked.
 * @returns A string describing relatable activities, or null if no suitable perspective found.
 */
export function getTimePerspectiveText(totalMinutes: number): string | null {
    if (isNaN(totalMinutes) || totalMinutes < 1) {
        return null; // Don't show for less than a minute
    }

    let remainingMinutes = totalMinutes;
    const selectedDescriptions: string[] = [];

    // Find the single largest perspective that fits
    const largestFit = sortedTimePerspectives.find(p => p.minutes <= remainingMinutes);

    if (!largestFit) {
        // If totalMinutes is very small, find the smallest perspective
        const smallest = timePerspectives[0];
        if (smallest) {
             return `In the time you worked just for this, you could have ${smallest.description}.`;
        }
        return null;
    }

    const count1 = Math.floor(remainingMinutes / largestFit.minutes);
    remainingMinutes %= largestFit.minutes;

    // Format the largest perspective
    selectedDescriptions.push(`${largestFit.description}${count1 > 1 ? ` ${count1} times` : ''}`);

    // Find the largest perspective that fits the remainder (if significant)
    const remainderThreshold = Math.max(5, largestFit.minutes * 0.1); // Only add remainder if > 5 min or 10% of the main item
    if (remainingMinutes >= remainderThreshold) {
        const secondFit = sortedTimePerspectives.find(p => p.minutes <= remainingMinutes);
        if (secondFit) {
            const count2 = Math.floor(remainingMinutes / secondFit.minutes);
            selectedDescriptions.push(`${secondFit.description}${count2 > 1 ? ` ${count2} times` : ''}`);
        }
    }

    // Construct the final sentence
    if (selectedDescriptions.length === 0) {
        return null;
    }

    let output = "In the time you worked for this, you could have ";
    if (selectedDescriptions.length === 1) {
        output += selectedDescriptions[0];
    } else {
        // Join with "and also" or similar connector
        const connectors = ["and also", "plus", "along with"];
        const connector = connectors[Math.floor(Math.random() * connectors.length)];
        output += `${selectedDescriptions[0]} ${connector} ${selectedDescriptions[1]}`;
    }

    return output + '.';
}
