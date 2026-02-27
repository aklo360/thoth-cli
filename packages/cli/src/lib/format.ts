/**
 * Output formatting utilities
 * 𓅝
 */

import chalk from 'chalk';
import type { ChartResult, TransitResult, MoonResult, EphemerisResult, Aspect } from '../types.js';

// Zodiac symbols
const ZODIAC_SYMBOLS: Record<string, string> = {
  'Ari': '♈',
  'Tau': '♉',
  'Gem': '♊',
  'Can': '♋',
  'Leo': '♌',
  'Vir': '♍',
  'Lib': '♎',
  'Sco': '♏',
  'Sag': '♐',
  'Cap': '♑',
  'Aqu': '♒',
  'Pis': '♓',
};

// Planet symbols
const PLANET_SYMBOLS: Record<string, string> = {
  'sun': '☉',
  'moon': '☽',
  'mercury': '☿',
  'venus': '♀',
  'mars': '♂',
  'jupiter': '♃',
  'saturn': '♄',
  'uranus': '♅',
  'neptune': '♆',
  'pluto': '♇',
  'chiron': '⚷',
  'north_node': '☊',
  'south_node': '☋',
};

// Aspect symbols
const ASPECT_SYMBOLS: Record<string, string> = {
  'conjunction': '☌',
  'opposition': '☍',
  'trine': '△',
  'square': '□',
  'sextile': '⚹',
};

/**
 * Get zodiac symbol
 */
export function getZodiacSymbol(sign: string): string {
  const key = sign.slice(0, 3);
  return ZODIAC_SYMBOLS[key] || sign;
}

/**
 * Get planet symbol
 */
export function getPlanetSymbol(planet: string): string {
  return PLANET_SYMBOLS[planet.toLowerCase()] || planet;
}

/**
 * Get aspect symbol
 */
export function getAspectSymbol(aspect: string): string {
  return ASPECT_SYMBOLS[aspect.toLowerCase()] || aspect;
}

/**
 * Format degrees to degrees, minutes, seconds
 */
export function formatDegrees(degrees: number): string {
  const d = Math.floor(degrees);
  const m = Math.floor((degrees - d) * 60);
  return `${d}°${m.toString().padStart(2, '0')}'`;
}

/**
 * Format a planet position
 */
export function formatPlanetPosition(
  name: string,
  sign: string,
  position: number,
  retrograde: boolean = false
): string {
  const symbol = getPlanetSymbol(name);
  const zodiac = getZodiacSymbol(sign);
  const deg = formatDegrees(position);
  const rx = retrograde ? chalk.red(' ℞') : '';
  
  return `${chalk.yellow(symbol)} ${chalk.white(name.padEnd(12))} ${chalk.cyan(zodiac)} ${chalk.magenta(deg)}${rx}`;
}

/**
 * Format a chart result
 */
export function formatChart(result: ChartResult): string {
  const lines: string[] = [];
  
  lines.push(chalk.bold.white(`\n𓅝 Natal Chart: ${result.name}`));
  lines.push(chalk.dim(`   ${result.datetime.year}-${String(result.datetime.month).padStart(2, '0')}-${String(result.datetime.day).padStart(2, '0')} ${String(result.datetime.hour).padStart(2, '0')}:${String(result.datetime.minute).padStart(2, '0')}`));
  lines.push(chalk.dim(`   Lat: ${result.location.lat}, Lng: ${result.location.lng}`));
  lines.push('');
  
  // Ascendant and Midheaven
  if (result.ascendant.sign) {
    lines.push(formatPlanetPosition('Ascendant', result.ascendant.sign, result.ascendant.position || 0));
  }
  if (result.midheaven.sign) {
    lines.push(formatPlanetPosition('Midheaven', result.midheaven.sign, result.midheaven.position || 0));
  }
  lines.push('');
  
  // Planets
  const planetOrder = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'north_node'];
  
  for (const name of planetOrder) {
    const planet = result.planets[name];
    if (planet) {
      lines.push(formatPlanetPosition(name, planet.sign, planet.position, planet.retrograde));
    }
  }
  
  lines.push('');
  return lines.join('\n');
}

/**
 * Format aspect with colors based on type
 */
function formatAspect(aspect: Aspect): string {
  const tSymbol = getPlanetSymbol(aspect.transit_planet);
  const nSymbol = getPlanetSymbol(aspect.natal_planet);
  const aSymbol = getAspectSymbol(aspect.aspect);
  
  // Color based on aspect type
  const aspectColors: Record<string, typeof chalk> = {
    'conjunction': chalk.yellow,
    'opposition': chalk.red,
    'trine': chalk.green,
    'square': chalk.red,
    'sextile': chalk.blue,
  };
  
  const color = aspectColors[aspect.aspect] || chalk.white;
  
  return `${chalk.cyan(tSymbol)} ${aspect.transit_planet.padEnd(10)} ${color(aSymbol)} ${chalk.magenta(nSymbol)} ${aspect.natal_planet.padEnd(10)} ${chalk.dim(`(${aspect.orb.toFixed(2)}°)`)}`;
}

/**
 * Format transits result
 */
export function formatTransits(result: TransitResult): string {
  const lines: string[] = [];
  
  lines.push(chalk.bold.white(`\n𓅝 Transits`));
  lines.push(chalk.dim(`   Natal: ${result.natal.datetime}`));
  lines.push(chalk.dim(`   Transit: ${result.transit.datetime}`));
  lines.push('');
  
  if (result.aspects.length === 0) {
    lines.push(chalk.dim('   No aspects within orb'));
  } else {
    for (const aspect of result.aspects) {
      lines.push('   ' + formatAspect(aspect));
    }
  }
  
  lines.push('');
  return lines.join('\n');
}

/**
 * Format moon result
 */
export function formatMoon(result: MoonResult): string {
  const lines: string[] = [];
  
  const moonEmoji = result.phase.illumination > 50 ? '🌕' : '🌑';
  
  lines.push(chalk.bold.white(`\n${moonEmoji} Moon Phase`));
  lines.push(chalk.dim(`   ${result.datetime}`));
  lines.push('');
  lines.push(`   ${chalk.cyan('☽')} ${chalk.white('Moon in')} ${chalk.magenta(result.moon.sign)} ${chalk.dim(formatDegrees(result.moon.position))}`);
  lines.push(`   ${chalk.white('Phase:')} ${chalk.yellow(result.phase.name)}`);
  lines.push(`   ${chalk.white('Illumination:')} ${chalk.cyan(result.phase.illumination.toFixed(1) + '%')}`);
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Format ephemeris result
 */
export function formatEphemeris(result: EphemerisResult): string {
  const lines: string[] = [];
  
  const symbol = getPlanetSymbol(result.body);
  const rx = result.retrograde ? chalk.red(' ℞') : '';
  
  lines.push(chalk.bold.white(`\n𓅝 Ephemeris: ${result.body}`));
  lines.push(chalk.dim(`   ${result.datetime}`));
  lines.push('');
  lines.push(`   ${chalk.yellow(symbol)} ${chalk.white(result.body)} in ${chalk.magenta(result.sign)} ${chalk.dim(formatDegrees(result.position))}${rx}`);
  lines.push(`   ${chalk.dim(`Absolute: ${result.abs_position.toFixed(4)}°`)}`);
  lines.push('');
  
  return lines.join('\n');
}
