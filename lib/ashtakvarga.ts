/**
 * Ashtakvarga — Classical Bhinnashtakvarga benefic-place computation
 * -------------------------------------------------------------------
 * Compact implementation of the traditional bindu (benefic point) tables
 * for the 7 grahas (Sun…Saturn), used by the branded PDF export (Page 4).
 *
 * Each planet contributes bindus to a house when its sign lord / occupant
 * relationships match the classical rule table. We implement the standard
 * "from-planet" rules keyed by the sign occupied by each contributing planet.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlanetPosition {
  /** English planet key: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn */
  planet: string;
  /** Sign number 1–12 */
  sign: number;
}

/** Per-house benefic bindus (1–8) contributed by one planet. Index 0 = House 1. */
export type BinduRow = number[];

export interface AshtakvargaResult {
  /** Bhinnashtakvarga rows per planet, in Sun→Saturn order. */
  bhinnashtakvarga: Record<string, BinduRow>;
  /** Sarvashtakvarga totals per house (sum of all planets). Index 0 = House 1. */
  sarvashtakvarga: BinduRow;
}

/**
 * Full rule matrix: for each TARGET planet, the list of CONTRIBUTING planets
 * and their from-signs. This is the classical 8-fold reference (self + 7).
 */
const RULE_MATRIX: Record<
  string,
  { contributor: string; fromSigns: number[] }[]
> = {
  // --- Sun's Ashtakvarga ---
  Sun: [
    { contributor: 'Sun', fromSigns: [1] },
    { contributor: 'Moon', fromSigns: [3, 6, 10, 11] },
    { contributor: 'Mars', fromSigns: [2, 3, 5, 6, 9, 10, 11, 12] },
    { contributor: 'Mercury', fromSigns: [3, 5, 6, 9, 10, 11, 12] },
    { contributor: 'Jupiter', fromSigns: [5, 6, 9, 11] },
    { contributor: 'Venus', fromSigns: [6, 7, 12] },
    { contributor: 'Saturn', fromSigns: [1, 2, 4, 7, 8, 9, 10, 11] },
    { contributor: 'ASC', fromSigns: [1, 2, 4, 7, 8, 9, 10, 11] },
  ],
  // --- Moon's Ashtakvarga ---
  Moon: [
    { contributor: 'Sun', fromSigns: [3, 6, 7, 8, 10, 11] },
    { contributor: 'Moon', fromSigns: [1, 3, 6, 7, 10, 11] },
    { contributor: 'Mars', fromSigns: [2, 3, 5, 6, 9, 10, 11, 12] },
    { contributor: 'Mercury', fromSigns: [1, 3, 4, 5, 7, 8, 10, 11] },
    { contributor: 'Jupiter', fromSigns: [1, 4, 7, 8, 10, 11, 12] },
    { contributor: 'Venus', fromSigns: [3, 4, 5, 7, 9, 10, 11] },
    { contributor: 'Saturn', fromSigns: [3, 5, 6, 11] },
    { contributor: 'ASC', fromSigns: [3, 6, 10, 11] },
  ],
  // --- Mars' Ashtakvarga ---
  Mars: [
    { contributor: 'Sun', fromSigns: [3, 5, 6, 10, 11] },
    { contributor: 'Moon', fromSigns: [3, 6, 11] },
    { contributor: 'Mars', fromSigns: [1, 2, 4, 7, 8, 10, 11] },
    { contributor: 'Mercury', fromSigns: [3, 5, 6, 11] },
    { contributor: 'Jupiter', fromSigns: [1, 2, 4, 7, 8, 10, 11] },
    { contributor: 'Venus', fromSigns: [3, 5, 6, 9, 11, 12] },
    { contributor: 'Saturn', fromSigns: [1, 4, 7, 8, 9, 10, 11] },
    { contributor: 'ASC', fromSigns: [1, 3, 5, 6, 10, 11, 12] },
  ],
  // --- Mercury's Ashtakvarga ---
  Mercury: [
    { contributor: 'Sun', fromSigns: [5, 6, 9, 11, 12] },
    { contributor: 'Moon', fromSigns: [2, 4, 6, 8, 10, 11] },
    { contributor: 'Mars', fromSigns: [1, 2, 4, 7, 8, 9, 10, 11] },
    { contributor: 'Mercury', fromSigns: [1, 3, 5, 6, 9, 10, 11, 12] },
    { contributor: 'Jupiter', fromSigns: [1, 2, 4, 5, 6, 9, 10, 11] },
    { contributor: 'Venus', fromSigns: [1, 2, 3, 4, 5, 8, 9, 11] },
    { contributor: 'Saturn', fromSigns: [1, 2, 4, 7, 8, 9, 10, 11] },
    { contributor: 'ASC', fromSigns: [1, 2, 4, 6, 8, 10, 11] },
  ],
  // --- Jupiter's Ashtakvarga ---
  Jupiter: [
    { contributor: 'Sun', fromSigns: [1, 2, 3, 4, 7, 8, 9, 11] },
    { contributor: 'Moon', fromSigns: [2, 5, 7, 9, 11] },
    { contributor: 'Mars', fromSigns: [1, 2, 4, 7, 8, 10, 11] },
    { contributor: 'Mercury', fromSigns: [1, 2, 4, 5, 6, 9, 10, 11] },
    { contributor: 'Jupiter', fromSigns: [1, 2, 3, 4, 7, 8, 10, 11] },
    { contributor: 'Venus', fromSigns: [2, 5, 6, 9, 10, 11] },
    { contributor: 'Saturn', fromSigns: [3, 5, 6, 12] },
    { contributor: 'ASC', fromSigns: [1, 2, 4, 5, 6, 7, 9, 10, 11] },
  ],
  // --- Venus' Ashtakvarga ---
  Venus: [
    { contributor: 'Sun', fromSigns: [6, 7, 12] },
    { contributor: 'Moon', fromSigns: [1, 2, 3, 4, 5, 8, 9, 11] },
    { contributor: 'Mars', fromSigns: [3, 5, 6, 9, 11, 12] },
    { contributor: 'Mercury', fromSigns: [3, 5, 6, 9, 11] },
    { contributor: 'Jupiter', fromSigns: [5, 8, 9, 10, 11] },
    { contributor: 'Venus', fromSigns: [1, 2, 3, 4, 5, 8, 9, 10, 11] },
    { contributor: 'Saturn', fromSigns: [1, 2, 3, 4, 5, 8, 9, 10, 11] },
    { contributor: 'ASC', fromSigns: [1, 2, 3, 4, 5, 8, 9, 11] },
  ],
  // --- Saturn's Ashtakvarga ---
  Saturn: [
    { contributor: 'Sun', fromSigns: [1, 2, 4, 7, 8, 10, 11] },
    { contributor: 'Moon', fromSigns: [3, 6, 11] },
    { contributor: 'Mars', fromSigns: [3, 5, 6, 10, 11, 12] },
    { contributor: 'Mercury', fromSigns: [6, 8, 9, 10, 11, 12] },
    { contributor: 'Jupiter', fromSigns: [5, 6, 11, 12] },
    { contributor: 'Venus', fromSigns: [6, 7, 12] },
    { contributor: 'Saturn', fromSigns: [3, 5, 6, 11] },
    { contributor: 'ASC', fromSigns: [1, 3, 4, 6, 10, 11] },
  ],
};

const PLANET_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

// ---------------------------------------------------------------------------
// Computation
// ---------------------------------------------------------------------------

/**
 * Compute Bhinnashtakvarga + Sarvashtakvarga bindus per HOUSE (1–12),
 * anchored to the ascendant sign so houses map to zodiacal positions.
 *
 * @param ascendantSign Ascendant sign number (1–12)
 * @param planets       Positions of the 7 grahas (sign numbers)
 */
export function computeAshtakvarga(
  ascendantSign: number,
  planets: PlanetPosition[]
): AshtakvargaResult {
  const positionMap = new Map(planets.map((p) => [p.planet, p.sign]));
  const bhinnashtakvarga: Record<string, BinduRow> = {};
  const sarvashtakvarga: BinduRow = new Array(12).fill(0);

  for (const target of PLANET_ORDER) {
    const row: BinduRow = new Array(12).fill(0);

    const rules = RULE_MATRIX[target] ?? [];
    for (const { contributor, fromSigns } of rules) {
      let contributorSign: number | undefined;
      if (contributor === 'ASC') {
        contributorSign = ascendantSign;
      } else {
        contributorSign = positionMap.get(contributor);
      }
      if (!contributorSign) continue;

      for (const from of fromSigns) {
        // Zodiacal sign reached counting `from` inclusive from contributor
        const signNum = ((contributorSign - 1 + from - 1) % 12) + 1;
        // Map zodiacal sign → house relative to ascendant
        const house = ((signNum - ascendantSign + 12) % 12) + 1;
        if (!row[house - 1]) row[house - 1] = 0;
        row[house - 1] += 1;
      }
    }

    bhinnashtakvarga[target] = row;
    for (let h = 0; h < 12; h++) sarvashtakvarga[h] += row[h];
  }

  return { bhinnashtakvarga, sarvashtakvarga };
}