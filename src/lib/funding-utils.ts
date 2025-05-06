
/**
 * @fileOverview Utility functions for mapping between slider values (0-100)
 * and funding levels (-2 to 2) used in the email customization modal.
 */

/**
 * Maps a slider value (0-100) to a funding level value (-2 to 2).
 * Defines ranges for each level.
 *
 * @param sliderValue The value from the slider (0-100).
 * @returns The corresponding funding level (-2, -1, 0, 1, 2).
 */
export const mapSliderToFundingLevel = (sliderValue: number): number => {
    if (sliderValue <= 10) return -2; // 0-10 -> Slash Heavily
    if (sliderValue <= 35) return -1; // 11-35 -> Cut Significantly
    if (sliderValue <= 65) return 0;  // 36-65 -> Improve Efficiency
    if (sliderValue <= 90) return 1;  // 66-90 -> Fund
    return 2;                       // 91-100 -> Fund More
};

/**
 * Maps a funding level value (-2 to 2) back to an approximate slider value (0-100).
 * Uses the midpoint of the defined ranges for mapping.
 *
 * @param fundingLevel The funding level value (-2, -1, 0, 1, 2).
 * @returns The approximate corresponding slider value (0-100).
 */
export const mapFundingLevelToSlider = (fundingLevel: number): number => {
    switch (fundingLevel) {
        case -2: return 5;   // Midpoint of 0-10
        case -1: return 23;  // Midpoint of 11-35 is 23
        case 0:  return 50;  // Midpoint of 36-65 is 50.5, round to 50
        case 1:  return 78;  // Midpoint of 66-90 is 78
        case 2:  return 95;  // Midpoint of 91-100 is 95.5, round to 95
        default: return 50; // Default to middle ('Improve Efficiency')
    }
};
