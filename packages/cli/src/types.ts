/**
 * Thoth CLI Types
 * 𓅝
 */

export interface Planet {
  sign: string;
  position: number;
  abs_position: number;
  house?: string | null;
  retrograde: boolean;
}

export interface House {
  sign: string | null;
  position: number | null;
}

export interface LunarPhase {
  name: string;
  emoji: string;
}

export interface ChartResult {
  name: string;
  datetime: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
  location: {
    lat: number;
    lng: number;
    city?: string;
  };
  planets: Record<string, Planet>;
  houses: Record<string, House>;
  aspects: Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
  }>;
  elements: Record<string, number>;
  modes: Record<string, number>;
  lunar_phase?: LunarPhase;
  ascendant: {
    sign: string | null;
    position: number | null;
  };
  midheaven: {
    sign: string | null;
    position: number | null;
  };
  // SVG output
  svg?: string;
  type?: string;
}

export interface Aspect {
  transit_planet: string;
  natal_planet: string;
  aspect: string;
  orb: number;
  transit_house?: number;
  natal_house?: number;
}

export interface TransitResult {
  natal: {
    datetime: string;
    city?: string;
  };
  transit: {
    datetime: string;
    planets?: Record<string, Planet>;
    lunar_phase?: LunarPhase;
  };
  aspects: Aspect[];
  // SVG output
  svg?: string;
  type?: string;
}

export interface MoonResult {
  datetime: string;
  moon: {
    sign: string;
    position: number;
    abs_position: number;
  };
  phase: {
    name: string;
    angle: number;
    illumination: number;
  };
}

export interface EphemerisResult {
  body: string;
  datetime: string;
  sign: string;
  position: number;
  abs_position: number;
  retrograde: boolean;
}

// Solar Return types
export interface SolarReturnResult {
  type: string;
  natal_date: string;
  return_year: number;
  exact_datetime: string;
  location: {
    city?: string;
    lat?: number;
    lng?: number;
  };
  planets: Record<string, Planet>;
  houses: Record<string, House>;
  ascendant: { sign: string; position: number };
  midheaven: { sign: string; position: number };
  lunar_phase?: LunarPhase;
  // SVG output
  svg?: string;
}

// Lunar Return types
export interface LunarReturnResult {
  type: string;
  natal_date: string;
  natal_moon: { sign: string; position: number };
  search_from: string;
  exact_datetime: string;
  location: {
    city?: string;
  };
  planets: Record<string, Planet>;
  houses: Record<string, House>;
  ascendant: { sign: string; position: number };
  midheaven: { sign: string; position: number };
  // SVG output
  svg?: string;
}

// Synastry types
export interface SynastryResult {
  type: string;
  person1: {
    name: string;
    date: string;
    planets: Record<string, Planet>;
  };
  person2: {
    name: string;
    date: string;
    planets: Record<string, Planet>;
  };
  aspects: Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
  }>;
  aspect_count: number;
  // SVG output
  svg?: string;
}

// Progressions types
export interface ProgressionsResult {
  type: string;
  method: string;
  natal_date: string;
  target_date: string;
  age_at_target: number;
  progressed_date: string;
  progressed_planets: Record<string, Planet>;
  natal_planets: Record<string, Planet>;
  progressed_to_natal_aspects: Array<{
    progressed: string;
    natal: string;
    aspect: string;
    orb: number;
  }>;
  progressed_ascendant: { sign: string; position: number };
  progressed_midheaven: { sign: string; position: number };
  // SVG output
  svg?: string;
}

// Ephemeris Range types
export interface EphemerisPosition {
  date: string;
  sign: string;
  position: number;
  abs_position: number;
  retrograde: boolean;
}

export interface SignChange {
  date: string;
  from: string;
  to: string;
}

export interface RetrogradeStation {
  date: string;
  station: 'retrograde' | 'direct';
  sign: string;
  position: number;
}

export interface EphemerisRangeResult {
  body: string;
  range: {
    start: string;
    end: string;
    step: string;
  };
  positions: EphemerisPosition[];
  sign_changes: SignChange[];
  retrograde_stations: RetrogradeStation[];
}

// Options types
export interface ChartOptions {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  lat?: number;
  lng?: number;
  city?: string;
  nation?: string;
  name?: string;
  svg?: boolean;
}

export interface TransitOptions {
  natalYear: number;
  natalMonth: number;
  natalDay: number;
  natalHour?: number;
  natalMinute?: number;
  natalLat?: number;
  natalLng?: number;
  natalCity?: string;
  nation?: string;
  transitYear?: number;
  transitMonth?: number;
  transitDay?: number;
  orb?: number;
  svg?: boolean;
}

export interface SolarReturnOptions {
  natalYear: number;
  natalMonth: number;
  natalDay: number;
  natalHour?: number;
  natalMinute?: number;
  natalLat?: number;
  natalLng?: number;
  natalCity?: string;
  nation?: string;
  returnYear: number;
  returnCity?: string;
  svg?: boolean;
}

export interface LunarReturnOptions {
  natalYear: number;
  natalMonth: number;
  natalDay: number;
  natalHour?: number;
  natalMinute?: number;
  natalLat?: number;
  natalLng?: number;
  natalCity?: string;
  nation?: string;
  fromYear: number;
  fromMonth: number;
  fromDay?: number;
  returnCity?: string;
  svg?: boolean;
}

export interface SynastryOptions {
  year1: number;
  month1: number;
  day1: number;
  hour1?: number;
  minute1?: number;
  lat1?: number;
  lng1?: number;
  city1?: string;
  nation1?: string;
  name1?: string;
  year2: number;
  month2: number;
  day2: number;
  hour2?: number;
  minute2?: number;
  lat2?: number;
  lng2?: number;
  city2?: string;
  nation2?: string;
  name2?: string;
  orb?: number;
  svg?: boolean;
}

export interface ProgressionsOptions {
  natalYear: number;
  natalMonth: number;
  natalDay: number;
  natalHour?: number;
  natalMinute?: number;
  natalLat?: number;
  natalLng?: number;
  natalCity?: string;
  nation?: string;
  targetYear: number;
  targetMonth?: number;
  targetDay?: number;
  svg?: boolean;
}

export interface EphemerisRangeOptions {
  body: string;
  startYear: number;
  startMonth?: number;
  startDay?: number;
  endYear: number;
  endMonth?: number;
  endDay?: number;
  step?: 'day' | 'week' | 'month';
}

export interface MoonOptions {
  year?: number;
  month?: number;
  day?: number;
  lat?: number;
  lng?: number;
}

// Composite chart types
export interface CompositeResult {
  type: string;
  method: string;
  person1: { name: string; date: string };
  person2: { name: string; date: string };
  name: string;
  planets: Record<string, {
    sign: string;
    position: number;
    abs_position: number;
    house?: string;
  }>;
  houses: Record<string, House>;
  ascendant: { sign: string; position: number };
  midheaven: { sign: string; position: number };
  svg?: string;
}

export interface CompositeOptions {
  year1: number;
  month1: number;
  day1: number;
  hour1?: number;
  minute1?: number;
  lat1?: number;
  lng1?: number;
  city1?: string;
  nation1?: string;
  name1?: string;
  year2: number;
  month2: number;
  day2: number;
  hour2?: number;
  minute2?: number;
  lat2?: number;
  lng2?: number;
  city2?: string;
  nation2?: string;
  name2?: string;
  svg?: boolean;
}

// Solar Arc types
export interface DirectedPlanet {
  sign: string;
  position: number;
  abs_position: number;
  natal_sign: string;
  natal_position: number;
}

export interface SolarArcResult {
  type: string;
  method: string;
  natal_date: string;
  target_date: string;
  age_at_target: number;
  solar_arc: number;
  directed_planets: Record<string, DirectedPlanet>;
  directed_ascendant: DirectedPlanet;
  directed_midheaven: DirectedPlanet;
  directed_to_natal_aspects: Array<{
    directed: string;
    natal: string;
    aspect: string;
    orb: number;
  }>;
}

export interface SolarArcOptions {
  natalYear: number;
  natalMonth: number;
  natalDay: number;
  natalHour?: number;
  natalMinute?: number;
  natalLat?: number;
  natalLng?: number;
  natalCity?: string;
  nation?: string;
  targetYear: number;
  targetMonth?: number;
  targetDay?: number;
}

// Horary types
export interface MoonAspect {
  planet: string;
  aspect: string;
  orb: number;
  applying: boolean;
}

export interface HoraryHouse {
  sign: string;
  position: number;
  ruler: string;
  topic: string;
}

export interface HoraryResult {
  type: string;
  question: string;
  cast_time: {
    datetime: string;
    city?: string;
  };
  planetary_hour: string;
  day_ruler: string;
  querent: {
    house: number;
    sign: string;
    ruler: string;
    ruler_position: {
      sign: string;
      position: number;
      house?: string;
      retrograde: boolean;
    };
  };
  moon: {
    sign: string;
    position: number;
    house?: string;
    void_of_course: boolean;
    degrees_until_sign_change: number;
    aspects: MoonAspect[];
  };
  strictures: string[];
  houses: Record<string, HoraryHouse>;
  planets: Record<string, Planet>;
  ascendant: { sign: string; position: number };
  midheaven: { sign: string; position: number };
}

export interface HoraryOptions {
  question: string;
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  lat?: number;
  lng?: number;
  city?: string;
  nation?: string;
}

export interface EphemerisOptions {
  body: string;
  year?: number;
  month?: number;
  day?: number;
}

export interface ThothError {
  error: string;
}

export type ThothResult<T> = T | ThothError;

export function isError<T extends object>(result: ThothResult<T>): result is ThothError {
  return 'error' in result;
}

// Score (Relationship Compatibility)
export interface ScoreOptions {
  year1: number;
  month1: number;
  day1: number;
  hour1?: number;
  minute1?: number;
  city1?: string;
  nation1?: string;
  lat1?: number;
  lng1?: number;
  name1?: string;
  year2: number;
  month2: number;
  day2: number;
  hour2?: number;
  minute2?: number;
  city2?: string;
  nation2?: string;
  lat2?: number;
  lng2?: number;
  name2?: string;
}

export interface ScoreResult {
  type: string;
  person1: {
    name: string;
    date: string;
    sun: string;
    moon: string;
    ascendant?: string;
  };
  person2: {
    name: string;
    date: string;
    sun: string;
    moon: string;
    ascendant?: string;
  };
  score: {
    value: number;
    description: string;
    is_destiny_sign: boolean;
  };
  breakdown: Array<{
    rule: string;
    description: string;
    points: number;
    details: string;
  }>;
  aspects: Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
  }>;
}

// Moon Extended
export interface MoonExtendedOptions {
  year?: number;
  month?: number;
  day?: number;
  lat?: number;
  lng?: number;
  tz?: string;
}

export interface MoonExtendedResult {
  type: string;
  datetime: string;
  location: {
    lat: number;
    lng: number;
    timezone: string;
  };
  sun: {
    sunrise: string;
    sunset: string;
    solar_noon: string;
    day_length: string;
    next_solar_eclipse?: {
      date: string;
      type: string;
    };
  };
  moon: {
    sign: string;
    phase_name: string;
    major_phase: string;
    stage: string;
    illumination: string;
    age_days: number;
    emoji: string;
    moonrise?: string;
    moonset?: string;
    next_lunar_eclipse?: {
      date: string;
      type: string;
    };
  };
  upcoming_phases?: Record<string, {
    last?: string;
    next?: string;
    days_until_next?: number;
  }>;
}

// Transit Scan
export interface TransitScanOptions {
  natalYear: number;
  natalMonth: number;
  natalDay: number;
  natalHour?: number;
  natalMinute?: number;
  natalCity?: string;
  nation?: string;
  natalLat?: number;
  natalLng?: number;
  startYear: number;
  startMonth?: number;
  startDay?: number;
  endYear: number;
  endMonth?: number;
  endDay?: number;
  orb?: number;
  step?: 'day' | 'week';
}

export interface TransitScanResult {
  type: string;
  natal: {
    date: string;
  };
  scan_range: {
    start: string;
    end: string;
    step: string;
    orb: number;
  };
  hits: Array<{
    date: string;
    transit_planet: string;
    aspect: string;
    natal_planet: string;
    orb: number;
  }>;
  total_hits: number;
}

// Ephemeris Multi
export interface EphemerisMultiOptions {
  bodies?: string;
  startYear: number;
  startMonth?: number;
  startDay?: number;
  endYear: number;
  endMonth?: number;
  endDay?: number;
  step?: 'hour' | 'day' | 'week' | 'month';
  lat?: number;
  lng?: number;
}

export interface EphemerisMultiResult {
  type: string;
  bodies: string[];
  range: {
    start: string;
    end: string;
    step: string;
  };
  positions: Array<{
    datetime: string;
    [body: string]: {
      sign: string;
      position: number;
      abs_position: number;
      retrograde: boolean;
    } | string;
  }>;
  total_points: number;
}
