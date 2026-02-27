/**
 * Thoth CLI Types
 * 𓅝
 */

export interface Planet {
  sign: string;
  position: number;
  abs_position: number;
  house?: number | null;
  retrograde: boolean;
}

export interface House {
  sign: string | null;
  position: number | null;
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
  };
  planets: Record<string, Planet>;
  houses: Record<string, House>;
  ascendant: {
    sign: string | null;
    position: number | null;
  };
  midheaven: {
    sign: string | null;
    position: number | null;
  };
}

export interface Aspect {
  transit_planet: string;
  natal_planet: string;
  aspect: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
  orb: number;
  transit_position: number;
  natal_position: number;
  applying: boolean;
}

export interface TransitResult {
  natal: {
    datetime: string;
  };
  transit: {
    datetime: string;
  };
  aspects: Aspect[];
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
}

export interface MoonOptions {
  year?: number;
  month?: number;
  day?: number;
  lat?: number;
  lng?: number;
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
