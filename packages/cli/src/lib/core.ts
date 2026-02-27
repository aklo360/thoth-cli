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
  ChartOptions,
  TransitOptions,
  MoonOptions,
  EphemerisOptions,
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
  
  return execute<TransitResult>('transit', args);
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
 * Get version
 */
export async function version(): Promise<ThothResult<{ version: string }>> {
  return execute<{ version: string }>('version', []);
}
