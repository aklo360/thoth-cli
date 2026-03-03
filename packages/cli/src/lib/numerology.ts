/**
 * Numerology computation engine
 * 𓅝
 */

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const MASTER_NUMBERS = [11, 22, 33];

// Pythagorean letter-to-number mapping: A=1...I=9, J=1...R=9, S=1...Z=8
const LETTER_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

// ═══════════════════════════════════════════════════════════════
// REDUCTION
// ═══════════════════════════════════════════════════════════════

function reduceToSingleDigit(n: number, keepMasters = true): number {
  while (n > 9) {
    if (keepMasters && MASTER_NUMBERS.includes(n)) break;
    n = String(n).split('').reduce((sum, d) => sum + Number(d), 0);
  }
  return n;
}

function sumDigits(n: number): number {
  return String(n).split('').reduce((sum, d) => sum + Number(d), 0);
}

// ═══════════════════════════════════════════════════════════════
// NAME ANALYSIS
// ═══════════════════════════════════════════════════════════════

interface LetterBreakdown {
  letter: string;
  value: number;
  type: 'vowel' | 'consonant';
}

function analyzeLetters(name: string): LetterBreakdown[] {
  const breakdown: LetterBreakdown[] = [];
  const upper = name.toUpperCase();
  for (const ch of upper) {
    const val = LETTER_VALUES[ch];
    if (val !== undefined) {
      breakdown.push({
        letter: ch,
        value: val,
        type: VOWELS.has(ch) ? 'vowel' : 'consonant',
      });
    }
  }
  return breakdown;
}

function computeFromLetters(letters: LetterBreakdown[]): number {
  const sum = letters.reduce((s, l) => s + l.value, 0);
  return reduceToSingleDigit(sum);
}

export interface NameNumerology {
  name: string;
  letters: LetterBreakdown[];
  expression: { sum: number; reduced: number; steps: string };
  soul_urge: { sum: number; reduced: number; steps: string };
  personality: { sum: number; reduced: number; steps: string };
}

function formatSteps(letters: LetterBreakdown[], filter?: 'vowel' | 'consonant'): string {
  const filtered = filter ? letters.filter(l => l.type === filter) : letters;
  const parts = filtered.map(l => `${l.letter}=${l.value}`);
  const sum = filtered.reduce((s, l) => s + l.value, 0);
  const reduced = reduceToSingleDigit(sum);
  if (sum === reduced) {
    return `${parts.join(' + ')} = ${sum}`;
  }
  return `${parts.join(' + ')} = ${sum} → ${reduced}`;
}

export function calculateNameNumerology(name: string): NameNumerology {
  const letters = analyzeLetters(name);
  const vowels = letters.filter(l => l.type === 'vowel');
  const consonants = letters.filter(l => l.type === 'consonant');

  const expressionSum = letters.reduce((s, l) => s + l.value, 0);
  const soulSum = vowels.reduce((s, l) => s + l.value, 0);
  const personalitySum = consonants.reduce((s, l) => s + l.value, 0);

  return {
    name,
    letters,
    expression: {
      sum: expressionSum,
      reduced: reduceToSingleDigit(expressionSum),
      steps: formatSteps(letters),
    },
    soul_urge: {
      sum: soulSum,
      reduced: reduceToSingleDigit(soulSum),
      steps: formatSteps(letters, 'vowel'),
    },
    personality: {
      sum: personalitySum,
      reduced: reduceToSingleDigit(personalitySum),
      steps: formatSteps(letters, 'consonant'),
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// LIFE PATH
// ═══════════════════════════════════════════════════════════════

export interface LifePath {
  date: string;
  month: { value: number; reduced: number };
  day: { value: number; reduced: number };
  year: { value: number; reduced: number };
  life_path: number;
  steps: string;
}

export function calculateLifePath(year: number, month: number, day: number): LifePath {
  // Reduce each component separately (preserving master numbers)
  const mReduced = reduceToSingleDigit(month);
  const dReduced = reduceToSingleDigit(day);
  const yReduced = reduceToSingleDigit(sumDigits(year));

  // Sum the reduced components
  const total = mReduced + dReduced + yReduced;
  const lifePath = reduceToSingleDigit(total);

  const steps = `Month: ${month} → ${mReduced}, Day: ${day} → ${dReduced}, Year: ${year} → ${yReduced} | ${mReduced} + ${dReduced} + ${yReduced} = ${total}` +
    (total !== lifePath ? ` → ${lifePath}` : '');

  return {
    date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    month: { value: month, reduced: mReduced },
    day: { value: day, reduced: dReduced },
    year: { value: year, reduced: yReduced },
    life_path: lifePath,
    steps,
  };
}

// ═══════════════════════════════════════════════════════════════
// FULL NUMEROLOGY PROFILE
// ═══════════════════════════════════════════════════════════════

export interface NumerologyResult {
  name_analysis?: NameNumerology;
  life_path?: LifePath;
}

export function calculateNumerology(options: { name?: string; date?: string }): NumerologyResult {
  const result: NumerologyResult = {};

  if (options.name) {
    result.name_analysis = calculateNameNumerology(options.name);
  }

  if (options.date) {
    const [year, month, day] = options.date.split('-').map(Number);
    if (year && month && day) {
      result.life_path = calculateLifePath(year, month, day);
    }
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════
// PERSONAL YEAR / MONTH / DAY
// ═══════════════════════════════════════════════════════════════

export interface PersonalCycle {
  birth_date: string;
  target_date: string;
  personal_year: { value: number; steps: string };
  personal_month: { value: number; steps: string };
  personal_day: { value: number; steps: string };
}

export function calculatePersonalCycle(birthDate: string, targetDate?: string): PersonalCycle {
  const [bYear, bMonth, bDay] = birthDate.split('-').map(Number);
  const now = targetDate ? targetDate.split('-').map(Number) : (() => {
    const d = new Date();
    return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
  })();
  const [tYear, tMonth, tDay] = now;

  // Personal Year = birth month + birth day + current year, reduced
  const pySum = reduceToSingleDigit(bMonth) + reduceToSingleDigit(bDay) + reduceToSingleDigit(sumDigits(tYear));
  const personalYear = reduceToSingleDigit(pySum);
  const pySteps = `Birth Month (${bMonth}) + Birth Day (${bDay}) + Year (${tYear}) → ${reduceToSingleDigit(bMonth)} + ${reduceToSingleDigit(bDay)} + ${reduceToSingleDigit(sumDigits(tYear))} = ${pySum}` +
    (pySum !== personalYear ? ` → ${personalYear}` : '');

  // Personal Month = personal year + calendar month, reduced
  const pmSum = personalYear + reduceToSingleDigit(tMonth);
  const personalMonth = reduceToSingleDigit(pmSum);
  const pmSteps = `Personal Year (${personalYear}) + Month (${tMonth}) → ${personalYear} + ${reduceToSingleDigit(tMonth)} = ${pmSum}` +
    (pmSum !== personalMonth ? ` → ${personalMonth}` : '');

  // Personal Day = personal month + calendar day, reduced
  const pdSum = personalMonth + reduceToSingleDigit(tDay);
  const personalDay = reduceToSingleDigit(pdSum);
  const pdSteps = `Personal Month (${personalMonth}) + Day (${tDay}) → ${personalMonth} + ${reduceToSingleDigit(tDay)} = ${pdSum}` +
    (pdSum !== personalDay ? ` → ${personalDay}` : '');

  return {
    birth_date: birthDate,
    target_date: `${tYear}-${String(tMonth).padStart(2, '0')}-${String(tDay).padStart(2, '0')}`,
    personal_year: { value: personalYear, steps: pySteps },
    personal_month: { value: personalMonth, steps: pmSteps },
    personal_day: { value: personalDay, steps: pdSteps },
  };
}

// ═══════════════════════════════════════════════════════════════
// NUMBER MEANINGS
// ═══════════════════════════════════════════════════════════════

export function getNumberMeaning(n: number): string {
  const meanings: Record<number, string> = {
    1: 'The Leader — Independence, originality, ambition, drive',
    2: 'The Mediator — Cooperation, sensitivity, balance, diplomacy',
    3: 'The Communicator — Expression, creativity, joy, inspiration',
    4: 'The Builder — Stability, discipline, hard work, foundation',
    5: 'The Adventurer — Freedom, change, versatility, experience',
    6: 'The Nurturer — Responsibility, love, harmony, service',
    7: 'The Seeker — Spirituality, analysis, wisdom, introspection',
    8: 'The Powerhouse — Authority, abundance, karma, manifestation',
    9: 'The Humanitarian — Compassion, completion, universal love',
    11: 'Master Illuminator — Intuition, spiritual insight, visionary',
    22: 'Master Builder — Practical idealism, large-scale creation',
    33: 'Master Teacher — Selfless service, spiritual upliftment',
  };
  return meanings[n] || '';
}
