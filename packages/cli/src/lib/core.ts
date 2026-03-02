/**
 * Core wrapper for thoth-core binary
 * 𓅝
 */

import { execa } from 'execa';
import { getCommand } from './binary.js';
import type {
  ChartResult,
  TransitResult,
  MoonResult,
  EphemerisResult,
  SolarReturnResult,
  LunarReturnResult,
  SynastryResult,
  ProgressionsResult,
  EphemerisRangeResult,
  CompositeResult,
  SolarArcResult,
  HoraryResult,
  ScoreResult,
  MoonExtendedResult,
  TransitScanResult,
  EphemerisMultiResult,
  ChartOptions,
  TransitOptions,
  MoonOptions,
  EphemerisOptions,
  SolarReturnOptions,
  LunarReturnOptions,
  SynastryOptions,
  ProgressionsOptions,
  EphemerisRangeOptions,
  CompositeOptions,
  SolarArcOptions,
  HoraryOptions,
  ScoreOptions,
  MoonExtendedOptions,
  TransitScanOptions,
  EphemerisMultiOptions,
  ThothResult,
} from '../types.js';

/**
 * Execute a thoth-core command and parse JSON result
 */
async function execute<T>(subcommand: string, args: string[]): Promise<ThothResult<T>> {
  const { command, args: baseArgs } = getCommand();
  
  try {
    const result = await execa(command, [...baseArgs, subcommand, ...args], {
      encoding: 'utf8',
      reject: false,
    });
    
    if (result.exitCode !== 0) {
      const error = result.stderr || result.stdout;
      try {
        return JSON.parse(error) as ThothResult<T>;
      } catch {
        return { error: error || 'Unknown error' };
      }
    }
    
    return JSON.parse(result.stdout) as T;
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Calculate a natal chart
 */
export async function chart(options: ChartOptions): Promise<ThothResult<ChartResult>> {
  const args = [
    '--year', String(options.year),
    '--month', String(options.month),
    '--day', String(options.day),
    '--hour', String(options.hour ?? 12),
    '--minute', String(options.minute ?? 0),
    '--name', options.name ?? 'Subject',
  ];
  
  if (options.city) {
    args.push('--city', options.city);
    args.push('--nation', options.nation ?? 'US');
  } else if (options.lat !== undefined && options.lng !== undefined) {
    args.push('--lat', String(options.lat));
    args.push('--lng', String(options.lng));
  }
  
  if (options.svg) {
    args.push('--svg');
  }
  
  return execute<ChartResult>('chart', args);
}

/**
 * Calculate transits to a natal chart
 */
export async function transit(options: TransitOptions): Promise<ThothResult<TransitResult>> {
  const args = [
    '--natal-year', String(options.natalYear),
    '--natal-month', String(options.natalMonth),
    '--natal-day', String(options.natalDay),
    '--natal-hour', String(options.natalHour ?? 12),
    '--natal-minute', String(options.natalMinute ?? 0),
    '--orb', String(options.orb ?? 3),
  ];
  
  if (options.natalCity) {
    args.push('--natal-city', options.natalCity);
    args.push('--nation', options.nation ?? 'US');
  } else if (options.natalLat !== undefined && options.natalLng !== undefined) {
    args.push('--natal-lat', String(options.natalLat));
    args.push('--natal-lng', String(options.natalLng));
  }
  
  if (options.transitYear) args.push('--transit-year', String(options.transitYear));
  if (options.transitMonth) args.push('--transit-month', String(options.transitMonth));
  if (options.transitDay) args.push('--transit-day', String(options.transitDay));
  if (options.svg) args.push('--svg');
  
  return execute<TransitResult>('transit', args);
}

/**
 * Calculate solar return chart
 */
export async function solarReturn(options: SolarReturnOptions): Promise<ThothResult<SolarReturnResult>> {
  const args = [
    '--natal-year', String(options.natalYear),
    '--natal-month', String(options.natalMonth),
    '--natal-day', String(options.natalDay),
    '--natal-hour', String(options.natalHour ?? 12),
    '--natal-minute', String(options.natalMinute ?? 0),
    '--return-year', String(options.returnYear),
  ];
  
  if (options.natalCity) {
    args.push('--natal-city', options.natalCity);
    args.push('--nation', options.nation ?? 'US');
  } else if (options.natalLat !== undefined && options.natalLng !== undefined) {
    args.push('--natal-lat', String(options.natalLat));
    args.push('--natal-lng', String(options.natalLng));
  }
  
  if (options.returnCity) args.push('--return-city', options.returnCity);
  if (options.svg) args.push('--svg');
  
  return execute<SolarReturnResult>('solar-return', args);
}

/**
 * Calculate lunar return chart
 */
export async function lunarReturn(options: LunarReturnOptions): Promise<ThothResult<LunarReturnResult>> {
  const args = [
    '--natal-year', String(options.natalYear),
    '--natal-month', String(options.natalMonth),
    '--natal-day', String(options.natalDay),
    '--natal-hour', String(options.natalHour ?? 12),
    '--natal-minute', String(options.natalMinute ?? 0),
    '--from-year', String(options.fromYear),
    '--from-month', String(options.fromMonth),
    '--from-day', String(options.fromDay ?? 1),
  ];
  
  if (options.natalCity) {
    args.push('--natal-city', options.natalCity);
    args.push('--nation', options.nation ?? 'US');
  } else if (options.natalLat !== undefined && options.natalLng !== undefined) {
    args.push('--natal-lat', String(options.natalLat));
    args.push('--natal-lng', String(options.natalLng));
  }
  
  if (options.returnCity) args.push('--return-city', options.returnCity);
  if (options.svg) args.push('--svg');
  
  return execute<LunarReturnResult>('lunar-return', args);
}

/**
 * Calculate synastry between two charts
 */
export async function synastry(options: SynastryOptions): Promise<ThothResult<SynastryResult>> {
  const args = [
    '--year1', String(options.year1),
    '--month1', String(options.month1),
    '--day1', String(options.day1),
    '--hour1', String(options.hour1 ?? 12),
    '--minute1', String(options.minute1 ?? 0),
    '--name1', options.name1 ?? 'Person 1',
    '--year2', String(options.year2),
    '--month2', String(options.month2),
    '--day2', String(options.day2),
    '--hour2', String(options.hour2 ?? 12),
    '--minute2', String(options.minute2 ?? 0),
    '--name2', options.name2 ?? 'Person 2',
    '--orb', String(options.orb ?? 6),
  ];
  
  if (options.city1) {
    args.push('--city1', options.city1);
    args.push('--nation1', options.nation1 ?? 'US');
  } else if (options.lat1 !== undefined && options.lng1 !== undefined) {
    args.push('--lat1', String(options.lat1));
    args.push('--lng1', String(options.lng1));
  }
  
  if (options.city2) {
    args.push('--city2', options.city2);
    args.push('--nation2', options.nation2 ?? 'US');
  } else if (options.lat2 !== undefined && options.lng2 !== undefined) {
    args.push('--lat2', String(options.lat2));
    args.push('--lng2', String(options.lng2));
  }
  
  if (options.svg) args.push('--svg');
  
  return execute<SynastryResult>('synastry', args);
}

/**
 * Calculate secondary progressions
 */
export async function progressions(options: ProgressionsOptions): Promise<ThothResult<ProgressionsResult>> {
  const args = [
    '--natal-year', String(options.natalYear),
    '--natal-month', String(options.natalMonth),
    '--natal-day', String(options.natalDay),
    '--natal-hour', String(options.natalHour ?? 12),
    '--natal-minute', String(options.natalMinute ?? 0),
    '--target-year', String(options.targetYear),
    '--target-month', String(options.targetMonth ?? 1),
    '--target-day', String(options.targetDay ?? 1),
  ];
  
  if (options.natalCity) {
    args.push('--natal-city', options.natalCity);
    args.push('--nation', options.nation ?? 'US');
  } else if (options.natalLat !== undefined && options.natalLng !== undefined) {
    args.push('--natal-lat', String(options.natalLat));
    args.push('--natal-lng', String(options.natalLng));
  }
  
  if (options.svg) args.push('--svg');
  
  return execute<ProgressionsResult>('progressions', args);
}

/**
 * Get ephemeris positions over a date range
 */
export async function ephemerisRange(options: EphemerisRangeOptions): Promise<ThothResult<EphemerisRangeResult>> {
  const args = [
    '--body', options.body,
    '--start-year', String(options.startYear),
    '--start-month', String(options.startMonth ?? 1),
    '--start-day', String(options.startDay ?? 1),
    '--end-year', String(options.endYear),
    '--end-month', String(options.endMonth ?? 12),
    '--end-day', String(options.endDay ?? 28),
    '--step', options.step ?? 'month',
  ];
  
  return execute<EphemerisRangeResult>('ephemeris-range', args);
}

/**
 * Get moon phase and position
 */
export async function moon(options: MoonOptions = {}): Promise<ThothResult<MoonResult>> {
  const args: string[] = [];
  
  if (options.year) args.push('--year', String(options.year));
  if (options.month) args.push('--month', String(options.month));
  if (options.day) args.push('--day', String(options.day));
  if (options.lat) args.push('--lat', String(options.lat));
  if (options.lng) args.push('--lng', String(options.lng));
  
  return execute<MoonResult>('moon', args);
}

/**
 * Get ephemeris position for a celestial body
 */
export async function ephemeris(options: EphemerisOptions): Promise<ThothResult<EphemerisResult>> {
  const args = ['--body', options.body];
  
  if (options.year) args.push('--year', String(options.year));
  if (options.month) args.push('--month', String(options.month));
  if (options.day) args.push('--day', String(options.day));
  
  return execute<EphemerisResult>('ephemeris', args);
}

/**
 * Calculate composite chart
 */
export async function composite(options: CompositeOptions): Promise<ThothResult<CompositeResult>> {
  const args = [
    '--year1', String(options.year1),
    '--month1', String(options.month1),
    '--day1', String(options.day1),
    '--hour1', String(options.hour1 ?? 12),
    '--minute1', String(options.minute1 ?? 0),
    '--name1', options.name1 ?? 'Person 1',
    '--year2', String(options.year2),
    '--month2', String(options.month2),
    '--day2', String(options.day2),
    '--hour2', String(options.hour2 ?? 12),
    '--minute2', String(options.minute2 ?? 0),
    '--name2', options.name2 ?? 'Person 2',
  ];
  
  if (options.city1) {
    args.push('--city1', options.city1);
    args.push('--nation1', options.nation1 ?? 'US');
  } else if (options.lat1 !== undefined && options.lng1 !== undefined) {
    args.push('--lat1', String(options.lat1));
    args.push('--lng1', String(options.lng1));
  }
  
  if (options.city2) {
    args.push('--city2', options.city2);
    args.push('--nation2', options.nation2 ?? 'US');
  } else if (options.lat2 !== undefined && options.lng2 !== undefined) {
    args.push('--lat2', String(options.lat2));
    args.push('--lng2', String(options.lng2));
  }
  
  if (options.svg) args.push('--svg');
  
  return execute<CompositeResult>('composite', args);
}

/**
 * Calculate solar arc directions
 */
export async function solarArc(options: SolarArcOptions): Promise<ThothResult<SolarArcResult>> {
  const args = [
    '--natal-year', String(options.natalYear),
    '--natal-month', String(options.natalMonth),
    '--natal-day', String(options.natalDay),
    '--natal-hour', String(options.natalHour ?? 12),
    '--natal-minute', String(options.natalMinute ?? 0),
    '--target-year', String(options.targetYear),
    '--target-month', String(options.targetMonth ?? 1),
    '--target-day', String(options.targetDay ?? 1),
  ];
  
  if (options.natalCity) {
    args.push('--natal-city', options.natalCity);
    args.push('--nation', options.nation ?? 'US');
  } else if (options.natalLat !== undefined && options.natalLng !== undefined) {
    args.push('--natal-lat', String(options.natalLat));
    args.push('--natal-lng', String(options.natalLng));
  }
  
  return execute<SolarArcResult>('solar-arc', args);
}

/**
 * Cast a horary chart
 */
export async function horary(options: HoraryOptions): Promise<ThothResult<HoraryResult>> {
  const args = [
    '--question', options.question,
  ];
  
  if (options.year) args.push('--year', String(options.year));
  if (options.month) args.push('--month', String(options.month));
  if (options.day) args.push('--day', String(options.day));
  if (options.hour !== undefined) args.push('--hour', String(options.hour));
  if (options.minute !== undefined) args.push('--minute', String(options.minute));
  
  if (options.city) {
    args.push('--city', options.city);
    args.push('--nation', options.nation ?? 'US');
  } else if (options.lat !== undefined && options.lng !== undefined) {
    args.push('--lat', String(options.lat));
    args.push('--lng', String(options.lng));
  }
  
  return execute<HoraryResult>('horary', args);
}

/**
 * Get version
 */
export async function version(): Promise<ThothResult<{ version: string }>> {
  return execute<{ version: string }>('version', []);
}

/**
 * Calculate relationship compatibility score
 */
export async function score(options: ScoreOptions): Promise<ThothResult<ScoreResult>> {
  const args = [
    '--year1', String(options.year1),
    '--month1', String(options.month1),
    '--day1', String(options.day1),
    '--hour1', String(options.hour1 ?? 12),
    '--minute1', String(options.minute1 ?? 0),
    '--name1', options.name1 ?? 'Person 1',
    '--year2', String(options.year2),
    '--month2', String(options.month2),
    '--day2', String(options.day2),
    '--hour2', String(options.hour2 ?? 12),
    '--minute2', String(options.minute2 ?? 0),
    '--name2', options.name2 ?? 'Person 2',
  ];
  
  if (options.city1) {
    args.push('--city1', options.city1);
    args.push('--nation1', options.nation1 ?? 'US');
  } else if (options.lat1 !== undefined && options.lng1 !== undefined) {
    args.push('--lat1', String(options.lat1));
    args.push('--lng1', String(options.lng1));
  }
  
  if (options.city2) {
    args.push('--city2', options.city2);
    args.push('--nation2', options.nation2 ?? 'US');
  } else if (options.lat2 !== undefined && options.lng2 !== undefined) {
    args.push('--lat2', String(options.lat2));
    args.push('--lng2', String(options.lng2));
  }
  
  return execute<ScoreResult>('score', args);
}

/**
 * Get extended moon data with eclipses
 */
export async function moonExtended(options: MoonExtendedOptions): Promise<ThothResult<MoonExtendedResult>> {
  const args: string[] = [];
  
  if (options.year) args.push('--year', String(options.year));
  if (options.month) args.push('--month', String(options.month));
  if (options.day) args.push('--day', String(options.day));
  if (options.lat !== undefined) args.push('--lat', String(options.lat));
  if (options.lng !== undefined) args.push('--lng', String(options.lng));
  if (options.tz) args.push('--tz', options.tz);
  
  return execute<MoonExtendedResult>('moon-extended', args);
}

/**
 * Scan for transits over a date range
 */
export async function transitScan(options: TransitScanOptions): Promise<ThothResult<TransitScanResult>> {
  const args = [
    '--natal-year', String(options.natalYear),
    '--natal-month', String(options.natalMonth),
    '--natal-day', String(options.natalDay),
    '--natal-hour', String(options.natalHour ?? 12),
    '--natal-minute', String(options.natalMinute ?? 0),
    '--start-year', String(options.startYear),
    '--start-month', String(options.startMonth ?? 1),
    '--start-day', String(options.startDay ?? 1),
    '--end-year', String(options.endYear),
    '--end-month', String(options.endMonth ?? 12),
    '--end-day', String(options.endDay ?? 28),
    '--orb', String(options.orb ?? 1),
    '--step', options.step ?? 'day',
  ];
  
  if (options.natalCity) {
    args.push('--natal-city', options.natalCity);
    args.push('--nation', options.nation ?? 'US');
  } else if (options.natalLat !== undefined && options.natalLng !== undefined) {
    args.push('--natal-lat', String(options.natalLat));
    args.push('--natal-lng', String(options.natalLng));
  }
  
  return execute<TransitScanResult>('transit-scan', args);
}

/**
 * Get multi-body ephemeris over a date range
 */
export async function ephemerisMulti(options: EphemerisMultiOptions): Promise<ThothResult<EphemerisMultiResult>> {
  const args = [
    '--bodies', options.bodies ?? 'sun,moon,mercury,venus,mars,jupiter,saturn',
    '--start-year', String(options.startYear),
    '--start-month', String(options.startMonth ?? 1),
    '--start-day', String(options.startDay ?? 1),
    '--end-year', String(options.endYear),
    '--end-month', String(options.endMonth ?? 12),
    '--end-day', String(options.endDay ?? 28),
    '--step', options.step ?? 'day',
  ];
  
  if (options.lat !== undefined) args.push('--lat', String(options.lat));
  if (options.lng !== undefined) args.push('--lng', String(options.lng));
  
  return execute<EphemerisMultiResult>('ephemeris-multi', args);
}
