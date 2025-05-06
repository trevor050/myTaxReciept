
/**
 * @fileOverview Utility to guess the state from a US zip code prefix.
 * This is a simplified approximation and may not be accurate for all zip codes,
 * especially those near state borders or special cases.
 */

/**
 * Guesses the US state based on the first digit of a zip code.
 * Returns null if the prefix is invalid or doesn't map to a common region.
 * Source for prefixes: https://en.wikipedia.org/wiki/List_of_ZIP_Code_prefixes
 *
 * @param zipCode The full zip code string or just the prefix.
 * @returns The guessed state's 2-letter abbreviation (e.g., "NY", "CA") or null.
 */
export function guessStateFromZip(zipCode: string): string | null {
  if (!zipCode || typeof zipCode !== 'string') {
    return null;
  }

  const prefix = zipCode.trim().charAt(0);

  switch (prefix) {
    case '0':
      // CT, MA, ME, NH, NJ, NY (part, e.g., Fishers Island), PR, RI, VT, VI (Virgin Islands)
      // Returning a major state for simplicity
      if (zipCode.startsWith('06')) return 'CT';
      if (zipCode.startsWith('01') || zipCode.startsWith('02') || zipCode.startsWith('055')) return 'MA'; // 055 is special for MA
      if (zipCode.startsWith('039') || zipCode.startsWith('04')) return 'ME';
      if (zipCode.startsWith('03')) return 'NH';
      if (zipCode.startsWith('07') || zipCode.startsWith('08')) return 'NJ';
       // Prioritize NY for 0 prefix if not caught by others
      return 'NY';
    case '1':
      // DE, NY, PA
      if (zipCode.startsWith('197') || zipCode.startsWith('198') || zipCode.startsWith('199')) return 'DE';
      if (zipCode.startsWith('15') || zipCode.startsWith('16') || zipCode.startsWith('17') || zipCode.startsWith('18') || zipCode.startsWith('190') || zipCode.startsWith('191') || zipCode.startsWith('195') || zipCode.startsWith('196')) return 'PA';
      // Assume NY otherwise
      return 'NY';
    case '2':
      // DC, MD, NC, SC, VA, WV
      if (zipCode.startsWith('20')) return 'DC'; // DC specifically
      if (zipCode.startsWith('206') || zipCode.startsWith('207') || zipCode.startsWith('208') || zipCode.startsWith('209') || zipCode.startsWith('21')) return 'MD';
      if (zipCode.startsWith('27') || zipCode.startsWith('28')) return 'NC';
      if (zipCode.startsWith('29')) return 'SC';
      if (zipCode.startsWith('201') || zipCode.startsWith('22') || zipCode.startsWith('23') || zipCode.startsWith('240') || zipCode.startsWith('241') || zipCode.startsWith('242') || zipCode.startsWith('243') || zipCode.startsWith('244') || zipCode.startsWith('245') || zipCode.startsWith('246')) return 'VA';
      if (zipCode.startsWith('247') || zipCode.startsWith('248') || zipCode.startsWith('249') || zipCode.startsWith('25') || zipCode.startsWith('26')) return 'WV';
      return 'VA'; // Default guess for region
    case '3':
      // AL, FL, GA, MS, TN
       if (zipCode.startsWith('35') || zipCode.startsWith('36')) return 'AL';
       if (zipCode.startsWith('32') || zipCode.startsWith('33') || zipCode.startsWith('34')) return 'FL';
       if (zipCode.startsWith('30') || zipCode.startsWith('31') || zipCode.startsWith('398') || zipCode.startsWith('399')) return 'GA';
       if (zipCode.startsWith('386') || zipCode.startsWith('387') || zipCode.startsWith('388') || zipCode.startsWith('389') || zipCode.startsWith('39')) return 'MS';
       if (zipCode.startsWith('37') || zipCode.startsWith('380') || zipCode.startsWith('381') || zipCode.startsWith('382') || zipCode.startsWith('383') || zipCode.startsWith('384') || zipCode.startsWith('385')) return 'TN';
      return 'GA'; // Default guess for region
    case '4':
      // IN, KY, MI, OH
      if (zipCode.startsWith('46') || zipCode.startsWith('47')) return 'IN';
      if (zipCode.startsWith('40') || zipCode.startsWith('41') || zipCode.startsWith('42')) return 'KY';
      if (zipCode.startsWith('48') || zipCode.startsWith('49')) return 'MI';
      if (zipCode.startsWith('43') || zipCode.startsWith('44') || zipCode.startsWith('45')) return 'OH';
      return 'OH'; // Default guess
    case '5':
      // IA, MN, MT, ND, SD, WI
       if (zipCode.startsWith('50') || zipCode.startsWith('51') || zipCode.startsWith('52')) return 'IA';
       if (zipCode.startsWith('55') || zipCode.startsWith('56')) return 'MN';
       if (zipCode.startsWith('59')) return 'MT';
       if (zipCode.startsWith('58')) return 'ND';
       if (zipCode.startsWith('57')) return 'SD';
       if (zipCode.startsWith('53') || zipCode.startsWith('54')) return 'WI';
      return 'MN'; // Default guess
    case '6':
      // IL, KS, MO, NE
      if (zipCode.startsWith('60') || zipCode.startsWith('61') || zipCode.startsWith('62')) return 'IL';
      if (zipCode.startsWith('66') || zipCode.startsWith('67')) return 'KS';
      if (zipCode.startsWith('63') || zipCode.startsWith('64') || zipCode.startsWith('65')) return 'MO';
      if (zipCode.startsWith('68') || zipCode.startsWith('69')) return 'NE';
      return 'IL'; // Default guess
    case '7':
      // AR, LA, OK, TX
       if (zipCode.startsWith('716') || zipCode.startsWith('717') || zipCode.startsWith('718') || zipCode.startsWith('719') || zipCode.startsWith('72')) return 'AR';
       if (zipCode.startsWith('70') || zipCode.startsWith('710') || zipCode.startsWith('711') || zipCode.startsWith('712') || zipCode.startsWith('713') || zipCode.startsWith('714')) return 'LA';
       if (zipCode.startsWith('73') || zipCode.startsWith('74')) return 'OK';
       // Assume TX otherwise (large state)
       return 'TX';
    case '8':
      // AZ, CO, ID, NV, NM, UT, WY
       if (zipCode.startsWith('85') || zipCode.startsWith('86')) return 'AZ';
       if (zipCode.startsWith('80') || zipCode.startsWith('81')) return 'CO';
       if (zipCode.startsWith('83')) return 'ID';
       if (zipCode.startsWith('889') || zipCode.startsWith('89')) return 'NV';
       if (zipCode.startsWith('87') || zipCode.startsWith('880') || zipCode.startsWith('881') || zipCode.startsWith('882') || zipCode.startsWith('883') || zipCode.startsWith('884')) return 'NM';
       if (zipCode.startsWith('84')) return 'UT';
       if (zipCode.startsWith('82') || zipCode.startsWith('830') || zipCode.startsWith('831')) return 'WY'; // 830/831 are exceptions shared with ID
      return 'CO'; // Default guess
    case '9':
      // AK, CA, HI, OR, WA, AS (American Samoa), GU (Guam), MP (Northern Mariana Islands)
       if (zipCode.startsWith('995') || zipCode.startsWith('996') || zipCode.startsWith('997') || zipCode.startsWith('998') || zipCode.startsWith('999')) return 'AK';
       if (zipCode.startsWith('967') || zipCode.startsWith('968')) return 'HI';
       if (zipCode.startsWith('97')) return 'OR';
       if (zipCode.startsWith('98') || zipCode.startsWith('990') || zipCode.startsWith('991') || zipCode.startsWith('992') || zipCode.startsWith('993') || zipCode.startsWith('994')) return 'WA';
       // Assume CA otherwise (very large state)
      return 'CA';
    default:
      return null; // Invalid prefix
  }
}

/**
 * Gets the average federal tax amount for a given state abbreviation.
 * Uses the data provided in the prompt. Returns national average if state not found.
 *
 * @param stateAbbr The 2-letter state abbreviation (e.g., "NY", "CA"). Case-insensitive.
 * @returns The average tax amount for that state, or the national average.
 */
export function getAverageTaxForState(stateAbbr: string | null): number {
    const nationalAverage = 17766;
    if (!stateAbbr) return nationalAverage;

    const upperState = stateAbbr.toUpperCase();

    // Data from prompt
    const stateAverages: Record<string, number> = {
        "DC": 31757, "CT": 26597, "MA": 25217, "NY": 23821, "PR": 22469,
        "NJ": 22302, "FL": 22144, "WY": 21987, "WA": 20960, "CA": 20582,
        "NH": 19543, "IL": 18834, "CO": 18783, "NV": 18553, "VA": 18451,
        "TX": 18436, "MD": 18044, "MN": 16044, "PA": 15998, "UT": 15762,
        "ND": 15194, "MT": 15186, "RI": 15144, "GA": 15123, "TN": 15049,
        "AZ": 14951, "SD": 14919, "AK": 14763, "NC": 14569, "HI": 14560,
        "DE": 14472, "OR": 14334, "KS": 14295, "WI": 14249, "MI": 14092,
        "NE": 14046, "VT": 13958, "MO": 13654, "ID": 13466, "IA": 13293,
        "OH": 13242, "LA": 13154, "IN": 13013, "SC": 13009, "AR": 12515,
        "OK": 12451, "ME": 12394, "AL": 12253, "KY": 11571, "NM": 10831,
        "MS": 10478, "WV": 10382
    };

    return stateAverages[upperState] ?? nationalAverage;
}
