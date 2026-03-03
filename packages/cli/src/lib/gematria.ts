/**
 * Gematria computation engine
 * 𓅝
 */

// ═══════════════════════════════════════════════════════════════
// HEBREW GEMATRIA TABLES
// ═══════════════════════════════════════════════════════════════

const HEBREW_STANDARD: Record<string, number> = {
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5,
  'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9, 'י': 10,
  'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60,
  'ע': 70, 'פ': 80, 'צ': 90, 'ק': 100, 'ר': 200,
  'ש': 300, 'ת': 400,
  // Final forms (sofit) — same values
  'ך': 20, 'ם': 40, 'ן': 50, 'ף': 80, 'ץ': 90,
};

const HEBREW_ORDINAL: Record<string, number> = {
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5,
  'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9, 'י': 10,
  'כ': 11, 'ל': 12, 'מ': 13, 'נ': 14, 'ס': 15,
  'ע': 16, 'פ': 17, 'צ': 18, 'ק': 19, 'ר': 20,
  'ש': 21, 'ת': 22,
  'ך': 11, 'ם': 13, 'ן': 14, 'ף': 17, 'ץ': 18,
};

// ═══════════════════════════════════════════════════════════════
// GREEK ISOPSEPHY TABLE
// ═══════════════════════════════════════════════════════════════

const GREEK_ISOPSEPHY: Record<string, number> = {
  'α': 1, 'β': 2, 'γ': 3, 'δ': 4, 'ε': 5,
  'ζ': 7, 'η': 8, 'θ': 9,
  'ι': 10, 'κ': 20, 'λ': 30, 'μ': 40, 'ν': 50,
  'ξ': 60, 'ο': 70, 'π': 80,
  'ρ': 100, 'σ': 200, 'ς': 200, 'τ': 300, 'υ': 400,
  'φ': 500, 'χ': 600, 'ψ': 700, 'ω': 800,
};

// ═══════════════════════════════════════════════════════════════
// ENGLISH-TO-HEBREW TRANSLITERATION
// ═══════════════════════════════════════════════════════════════

// Digraphs must be checked before single letters
const TRANSLITERATION_DIGRAPHS: Array<[string, string]> = [
  ['sh', 'ש'], ['th', 'ת'], ['ch', 'ח'], ['tz', 'צ'], ['ts', 'צ'],
  ['ph', 'פ'],
];

const TRANSLITERATION_SINGLES: Record<string, string> = {
  'a': 'א', 'b': 'ב', 'c': 'כ', 'd': 'ד', 'e': 'ה',
  'f': 'פ', 'g': 'ג', 'h': 'ה', 'i': 'י', 'j': 'ג',
  'k': 'כ', 'l': 'ל', 'm': 'מ', 'n': 'נ', 'o': 'ע',
  'p': 'פ', 'q': 'ק', 'r': 'ר', 's': 'ס', 't': 'ט',
  'u': 'ו', 'v': 'ו', 'w': 'ו', 'x': 'צ', 'y': 'י',
  'z': 'ז',
};

// ═══════════════════════════════════════════════════════════════
// NOTABLE WORDS DICTIONARY
// ═══════════════════════════════════════════════════════════════

export interface NotableWord {
  word: string;
  transliteration: string;
  meaning: string;
  system: string;
}

const NOTABLE_WORDS: Record<number, NotableWord[]> = {
  1: [{ word: 'א', transliteration: 'Aleph', meaning: 'Ox, Breath, Spirit', system: 'hebrew' }],
  5: [{ word: 'ה', transliteration: 'He', meaning: 'Window, Breath', system: 'hebrew' }],
  10: [{ word: 'י', transliteration: 'Yod', meaning: 'Hand, Foundation', system: 'hebrew' }],
  13: [
    { word: 'אחד', transliteration: 'Echad', meaning: 'Unity, One', system: 'hebrew' },
    { word: 'אהבה', transliteration: 'Ahavah', meaning: 'Love', system: 'hebrew' },
  ],
  17: [{ word: 'טוב', transliteration: 'Tov', meaning: 'Good', system: 'hebrew' }],
  21: [{ word: 'אהיה', transliteration: 'Eheieh', meaning: 'I Am (Divine Name of Kether)', system: 'hebrew' }],
  26: [{ word: 'יהוה', transliteration: 'YHVH', meaning: 'Tetragrammaton', system: 'hebrew' }],
  31: [
    { word: 'אל', transliteration: 'El', meaning: 'God (Divine Name of Chesed)', system: 'hebrew' },
    { word: 'לא', transliteration: 'LA', meaning: 'Not, Naught', system: 'hebrew' },
  ],
  32: [{ word: 'לב', transliteration: 'Lev', meaning: 'Heart; 32 Paths of Wisdom', system: 'hebrew' }],
  42: [{ word: 'אלוה', transliteration: 'Eloah', meaning: 'God (singular)', system: 'hebrew' }],
  45: [
    { word: 'אדם', transliteration: 'Adam', meaning: 'Humanity, Red Earth', system: 'hebrew' },
    { word: 'מה', transliteration: 'Mah', meaning: 'What (secret of Tiphareth)', system: 'hebrew' },
  ],
  50: [{ word: 'כל', transliteration: 'Kol', meaning: 'All, Everything', system: 'hebrew' }],
  58: [{ word: 'חן', transliteration: 'Chen', meaning: 'Grace, Favor', system: 'hebrew' }],
  65: [
    { word: 'אדני', transliteration: 'Adonai', meaning: 'Lord (Divine Name of Malkuth)', system: 'hebrew' },
    { word: 'הלל', transliteration: 'Hallel', meaning: 'Praise', system: 'hebrew' },
  ],
  67: [{ word: 'בינה', transliteration: 'Binah', meaning: 'Understanding (3rd Sephirah)', system: 'hebrew' }],
  68: [{ word: 'חיים', transliteration: 'Chayyim', meaning: 'Life', system: 'hebrew' }],
  73: [{ word: 'חכמה', transliteration: 'Chokmah', meaning: 'Wisdom (2nd Sephirah)', system: 'hebrew' }],
  78: [{ word: 'מזלא', transliteration: 'Mezla', meaning: 'Influence (from above)', system: 'hebrew' }],
  80: [{ word: 'יסוד', transliteration: 'Yesod', meaning: 'Foundation (9th Sephirah)', system: 'hebrew' }],
  86: [{ word: 'אלהים', transliteration: 'Elohim', meaning: 'God/s (Divine Name of Binah)', system: 'hebrew' }],
  91: [{ word: 'אמן', transliteration: 'Amen', meaning: 'So be it; Truth', system: 'hebrew' }],
  93: [
    { word: 'θελημα', transliteration: 'Thelema', meaning: 'Will', system: 'greek' },
    { word: 'αγαπη', transliteration: 'Agape', meaning: 'Love', system: 'greek' },
  ],
  111: [{ word: 'אלף', transliteration: 'Aleph (spelled)', meaning: 'Aleph in full: Ox', system: 'hebrew' }],
  120: [{ word: 'סמך', transliteration: 'Samekh (spelled)', meaning: 'Prop, Support', system: 'hebrew' }],
  131: [{ word: 'סמאל', transliteration: 'Samael', meaning: 'Poison of God, Archangel of Geburah', system: 'hebrew' }],
  148: [{ word: 'נצח', transliteration: 'Netzach', meaning: 'Victory (7th Sephirah)', system: 'hebrew' }],
  156: [{ word: 'ציון', transliteration: 'Tzion', meaning: 'Zion; 6 x YHVH', system: 'hebrew' }],
  207: [
    { word: 'אין סוף', transliteration: 'Ain Soph', meaning: 'The Limitless', system: 'hebrew' },
    { word: 'אור', transliteration: 'Aur', meaning: 'Light', system: 'hebrew' },
  ],
  280: [{ word: 'ך ם ן ף ץ', transliteration: 'Five Finals', meaning: 'Severity, the 5 judgments', system: 'hebrew' }],
  300: [{ word: 'רוח אלהים', transliteration: 'Ruach Elohim', meaning: 'Spirit of God', system: 'hebrew' }],
  314: [{ word: 'שדי', transliteration: 'Shaddai', meaning: 'Almighty (= pi)', system: 'hebrew' }],
  345: [
    { word: 'משה', transliteration: 'Moshe', meaning: 'Moses', system: 'hebrew' },
    { word: 'אל שדי', transliteration: 'El Shaddai', meaning: 'God Almighty', system: 'hebrew' },
  ],
  358: [
    { word: 'משיח', transliteration: 'Mashiach', meaning: 'Messiah, Anointed One', system: 'hebrew' },
    { word: 'נחש', transliteration: 'Nachash', meaning: 'Serpent (= Messiah!)', system: 'hebrew' },
  ],
  400: [{ word: 'ת', transliteration: 'Tav', meaning: 'Cross, Mark, Completion', system: 'hebrew' }],
  418: [
    { word: 'חית', transliteration: 'Cheth (spelled)', meaning: 'Fence, Field; Abrahadabra', system: 'hebrew' },
  ],
  434: [{ word: 'דלת', transliteration: 'Daleth (spelled)', meaning: 'Door', system: 'hebrew' }],
  666: [{ word: 'סורת', transliteration: 'Sorath', meaning: 'Spirit of the Sun', system: 'hebrew' }],
  777: [{ word: 'עולם הקליפות', transliteration: 'Olam Ha-Qliphoth', meaning: 'World of Shells', system: 'hebrew' }],
  888: [{ word: 'Ιησους', transliteration: 'Iesous', meaning: 'Jesus (Greek)', system: 'greek' }],
};

// ═══════════════════════════════════════════════════════════════
// SCRIPT DETECTION
// ═══════════════════════════════════════════════════════════════

function hasHebrew(text: string): boolean {
  return /[\u0590-\u05FF]/.test(text);
}

function hasGreek(text: string): boolean {
  return /[\u0370-\u03FF\u1F00-\u1FFF]/.test(text);
}

function hasLatin(text: string): boolean {
  return /[a-zA-Z]/.test(text);
}

// ═══════════════════════════════════════════════════════════════
// DIGITAL ROOT (reduce to single digit)
// ═══════════════════════════════════════════════════════════════

function digitalRoot(n: number): number {
  while (n > 9) {
    n = String(n).split('').reduce((sum, d) => sum + Number(d), 0);
  }
  return n;
}

// ═══════════════════════════════════════════════════════════════
// TRANSLITERATION
// ═══════════════════════════════════════════════════════════════

export function transliterateToHebrew(text: string): string {
  const lower = text.toLowerCase();
  let result = '';
  let i = 0;

  while (i < lower.length) {
    // Skip non-alpha
    if (!/[a-z]/.test(lower[i])) {
      if (lower[i] === ' ') result += ' ';
      i++;
      continue;
    }

    // Try digraphs first
    let matched = false;
    if (i + 1 < lower.length) {
      const pair = lower.slice(i, i + 2);
      for (const [digraph, hebrew] of TRANSLITERATION_DIGRAPHS) {
        if (pair === digraph) {
          result += hebrew;
          i += 2;
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      result += TRANSLITERATION_SINGLES[lower[i]] || '';
      i++;
    }
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════
// COMPUTATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function computeHebrewStandard(text: string): number {
  let sum = 0;
  for (const ch of text) {
    sum += HEBREW_STANDARD[ch] || 0;
  }
  return sum;
}

function computeHebrewOrdinal(text: string): number {
  let sum = 0;
  for (const ch of text) {
    sum += HEBREW_ORDINAL[ch] || 0;
  }
  return sum;
}

function computeHebrewReduced(text: string): number {
  let sum = 0;
  for (const ch of text) {
    const val = HEBREW_STANDARD[ch];
    if (val) sum += digitalRoot(val);
  }
  return digitalRoot(sum);
}

function computeGreekIsopsephy(text: string): number {
  let sum = 0;
  const lower = text.toLowerCase();
  for (const ch of lower) {
    sum += GREEK_ISOPSEPHY[ch] || 0;
  }
  return sum;
}

function computeEnglishOrdinal(text: string): number {
  let sum = 0;
  const upper = text.toUpperCase();
  for (const ch of upper) {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      sum += code - 64; // A=1, B=2... Z=26
    }
  }
  return sum;
}

function computeEnglishReduced(text: string): number {
  let sum = 0;
  const upper = text.toUpperCase();
  for (const ch of upper) {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      sum += digitalRoot(code - 64);
    }
  }
  return digitalRoot(sum);
}

function computeEnglishSumerian(text: string): number {
  let sum = 0;
  const upper = text.toUpperCase();
  for (const ch of upper) {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      sum += (code - 64) * 6; // A=6, B=12... Z=156
    }
  }
  return sum;
}

function computeEnglishReverse(text: string): number {
  let sum = 0;
  const upper = text.toUpperCase();
  for (const ch of upper) {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      sum += 27 - (code - 64); // Z=1, Y=2... A=26
    }
  }
  return sum;
}

// ═══════════════════════════════════════════════════════════════
// RESULT TYPES
// ═══════════════════════════════════════════════════════════════

export interface GematriaSystemValue {
  name: string;
  value: number;
  key: string;
}

export interface GematriaResult {
  text: string;
  systems: GematriaSystemValue[];
  transliteration?: string;
  notable: Array<{ value: number; matches: NotableWord[] }>;
}

export interface GematriaCompareResult {
  text1: GematriaResult;
  text2: GematriaResult;
  shared_values: Array<{ system: string; value: number }>;
}

export interface GematriaLookupResult {
  number: number;
  system?: string;
  matches: NotableWord[];
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════

export function calculateGematria(text: string, systemFilter?: string): GematriaResult {
  const systems: GematriaSystemValue[] = [];
  let transliteration: string | undefined;

  const isHebrew = hasHebrew(text);
  const isGreek = hasGreek(text);
  const isLatin = hasLatin(text);

  // Hebrew systems
  if (isHebrew) {
    const std = computeHebrewStandard(text);
    const ord = computeHebrewOrdinal(text);
    const red = computeHebrewReduced(text);
    if (!systemFilter || systemFilter === 'hebrew-standard') systems.push({ name: 'Hebrew Standard', value: std, key: 'hebrew-standard' });
    if (!systemFilter || systemFilter === 'hebrew-ordinal') systems.push({ name: 'Hebrew Ordinal', value: ord, key: 'hebrew-ordinal' });
    if (!systemFilter || systemFilter === 'hebrew-reduced') systems.push({ name: 'Hebrew Reduced', value: red, key: 'hebrew-reduced' });
  } else if (isLatin) {
    // Transliterate Latin → Hebrew
    transliteration = transliterateToHebrew(text);
    if (transliteration.replace(/\s/g, '').length > 0) {
      const std = computeHebrewStandard(transliteration);
      const ord = computeHebrewOrdinal(transliteration);
      const red = computeHebrewReduced(transliteration);
      if (!systemFilter || systemFilter === 'hebrew-standard') systems.push({ name: 'Hebrew Standard', value: std, key: 'hebrew-standard' });
      if (!systemFilter || systemFilter === 'hebrew-ordinal') systems.push({ name: 'Hebrew Ordinal', value: ord, key: 'hebrew-ordinal' });
      if (!systemFilter || systemFilter === 'hebrew-reduced') systems.push({ name: 'Hebrew Reduced', value: red, key: 'hebrew-reduced' });
    }
  }

  // Greek isopsephy
  if (isGreek) {
    const val = computeGreekIsopsephy(text);
    if (!systemFilter || systemFilter === 'greek') systems.push({ name: 'Greek Isopsephy', value: val, key: 'greek' });
  }

  // English systems
  if (isLatin) {
    const ord = computeEnglishOrdinal(text);
    const red = computeEnglishReduced(text);
    const sum = computeEnglishSumerian(text);
    const rev = computeEnglishReverse(text);
    if (!systemFilter || systemFilter === 'english-ordinal') systems.push({ name: 'English Ordinal', value: ord, key: 'english-ordinal' });
    if (!systemFilter || systemFilter === 'english-reduced') systems.push({ name: 'English Reduced', value: red, key: 'english-reduced' });
    if (!systemFilter || systemFilter === 'english-sumerian') systems.push({ name: 'English Sumerian', value: sum, key: 'english-sumerian' });
    if (!systemFilter || systemFilter === 'english-reverse') systems.push({ name: 'English Reverse', value: rev, key: 'english-reverse' });
  }

  // Find notable matches
  const notable: Array<{ value: number; matches: NotableWord[] }> = [];
  const seenValues = new Set<number>();
  for (const sys of systems) {
    if (sys.value > 0 && !seenValues.has(sys.value) && NOTABLE_WORDS[sys.value]) {
      notable.push({ value: sys.value, matches: NOTABLE_WORDS[sys.value] });
      seenValues.add(sys.value);
    }
  }

  return { text, systems, transliteration, notable };
}

export function compareGematria(text1: string, text2: string, systemFilter?: string): GematriaCompareResult {
  const r1 = calculateGematria(text1, systemFilter);
  const r2 = calculateGematria(text2, systemFilter);

  const shared: Array<{ system: string; value: number }> = [];
  for (const s1 of r1.systems) {
    for (const s2 of r2.systems) {
      if (s1.key === s2.key && s1.value === s2.value && s1.value > 0) {
        shared.push({ system: s1.name, value: s1.value });
      }
    }
  }

  return { text1: r1, text2: r2, shared_values: shared };
}

export function lookupGematria(number: number, systemFilter?: string, limit?: number): GematriaLookupResult {
  let matches = NOTABLE_WORDS[number] || [];
  if (systemFilter) {
    matches = matches.filter(m => m.system === systemFilter);
  }
  if (limit && matches.length > limit) {
    matches = matches.slice(0, limit);
  }
  return { number, system: systemFilter, matches };
}
