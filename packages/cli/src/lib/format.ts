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
  'true_north_lunar_node': '☊',
  'true_south_lunar_node': '☋',
  'mean_lilith': '⚸',
  'medium_coeli': 'MC',
  'imum_coeli': 'IC',
  'ascendant': 'ASC',
  'descendant': 'DSC',
  // Short names from transit aspects
  'nn': '☊',
  'sn': '☋',
  'lilith': '⚸',
  'mc': 'MC',
  'ic': 'IC',
  'asc': 'ASC',
  'dsc': 'DSC',
};

// Aspect symbols
const ASPECT_SYMBOLS: Record<string, string> = {
  'conjunction': '☌',
  'opposition': '☍',
  'trine': '△',
  'square': '□',
  'sextile': '⚹',
  'quintile': '⍟',
  'quincunx': '⚻',
  'semi-sextile': '⚺',
  'semi-square': '∠',
  'sesquiquadrate': '⚼',
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
  
  // Header
  lines.push(chalk.bold.white(`\n𓅝 Natal Chart: ${result.name}`));
  const dateStr = `${result.datetime.year}-${String(result.datetime.month).padStart(2, '0')}-${String(result.datetime.day).padStart(2, '0')} ${String(result.datetime.hour).padStart(2, '0')}:${String(result.datetime.minute).padStart(2, '0')}`;
  lines.push(chalk.dim(`   ${dateStr}`));
  if ((result.location as any).city) {
    lines.push(chalk.dim(`   ${(result.location as any).city}`));
  } else {
    lines.push(chalk.dim(`   Lat: ${result.location.lat}, Lng: ${result.location.lng}`));
  }
  
  // Lunar phase at birth
  if ((result as any).lunar_phase) {
    lines.push(chalk.dim(`   Born during: ${(result as any).lunar_phase.emoji} ${(result as any).lunar_phase.name}`));
  }
  lines.push('');
  
  // Angles
  lines.push(chalk.bold.cyan('── ANGLES ──'));
  if (result.ascendant.sign) {
    lines.push(`   ${chalk.yellow('ASC')}  ${getZodiacSymbol(result.ascendant.sign)} ${result.ascendant.sign} ${formatDegrees(result.ascendant.position || 0)}`);
  }
  if (result.midheaven.sign) {
    lines.push(`   ${chalk.yellow('MC')}   ${getZodiacSymbol(result.midheaven.sign)} ${result.midheaven.sign} ${formatDegrees(result.midheaven.position || 0)}`);
  }
  lines.push('');
  
  // Planets
  lines.push(chalk.bold.cyan('── PLANETS ──'));
  const planetOrder = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  
  for (const name of planetOrder) {
    const planet = result.planets[name];
    if (planet) {
      const symbol = getPlanetSymbol(name);
      const zodiac = getZodiacSymbol(planet.sign);
      const deg = formatDegrees(planet.position);
      const rx = planet.retrograde ? chalk.red(' ℞') : '';
      const house = planet.house ? chalk.dim(` (${planet.house})`) : '';
      lines.push(`   ${chalk.yellow(symbol)} ${name.padEnd(10)} ${chalk.cyan(zodiac)} ${planet.sign} ${chalk.magenta(deg)}${rx}${house}`);
    }
  }
  lines.push('');
  
  // Points (Chiron, Lilith, Nodes)
  lines.push(chalk.bold.cyan('── POINTS ──'));
  const pointOrder = ['chiron', 'mean_lilith', 'true_north_lunar_node', 'true_south_lunar_node'];
  const pointNames: Record<string, string> = {
    'chiron': 'Chiron',
    'mean_lilith': 'Lilith',
    'true_north_lunar_node': 'North Node',
    'true_south_lunar_node': 'South Node',
  };
  
  for (const name of pointOrder) {
    const planet = result.planets[name];
    if (planet) {
      const symbol = getPlanetSymbol(name);
      const displayName = pointNames[name] || name;
      const zodiac = getZodiacSymbol(planet.sign);
      const deg = formatDegrees(planet.position);
      const house = planet.house ? chalk.dim(` (${planet.house})`) : '';
      lines.push(`   ${chalk.yellow(symbol)} ${displayName.padEnd(10)} ${chalk.cyan(zodiac)} ${planet.sign} ${chalk.magenta(deg)}${house}`);
    }
  }
  lines.push('');
  
  // Houses
  if (result.houses && Object.keys(result.houses).length > 0) {
    lines.push(chalk.bold.cyan('── HOUSES ──'));
    for (let i = 1; i <= 12; i++) {
      const house = result.houses[String(i)];
      if (house && house.sign) {
        const zodiac = getZodiacSymbol(house.sign);
        const deg = formatDegrees(house.position || 0);
        const label = i === 1 ? '(ASC)' : i === 4 ? '(IC)' : i === 7 ? '(DSC)' : i === 10 ? '(MC)' : '';
        lines.push(`   ${String(i).padStart(2)}  ${chalk.cyan(zodiac)} ${house.sign} ${chalk.dim(deg)} ${chalk.yellow(label)}`);
      }
    }
    lines.push('');
  }
  
  // Elements & Modes
  if ((result as any).elements && (result as any).modes) {
    lines.push(chalk.bold.cyan('── BALANCE ──'));
    const elem = (result as any).elements;
    const mode = (result as any).modes;
    lines.push(`   ${chalk.red('🜂 Fire:')} ${elem.Fire}  ${chalk.green('🜃 Earth:')} ${elem.Earth}  ${chalk.cyan('🜁 Air:')} ${elem.Air}  ${chalk.blue('🜄 Water:')} ${elem.Water}`);
    lines.push(`   ${chalk.yellow('Cardinal:')} ${mode.Cardinal}  ${chalk.magenta('Fixed:')} ${mode.Fixed}  ${chalk.white('Mutable:')} ${mode.Mutable}`);
    lines.push('');
  }
  
  // Natal Aspects (top 15 tightest)
  if ((result as any).aspects && (result as any).aspects.length > 0) {
    lines.push(chalk.bold.cyan('── ASPECTS ──'));
    const aspects = (result as any).aspects.slice(0, 15); // Top 15
    for (const asp of aspects) {
      const p1 = getPlanetSymbol(asp.planet1.toLowerCase().replace(/ /g, '_'));
      const p2 = getPlanetSymbol(asp.planet2.toLowerCase().replace(/ /g, '_'));
      const aspectSym = getAspectSymbol(asp.aspect);
      const aspectName = asp.aspect.charAt(0).toUpperCase() + asp.aspect.slice(1);
      // Hermetic color correspondences
      const aspectColor = asp.aspect === 'conjunction' ? chalk.yellow :
                         asp.aspect === 'opposition' ? chalk.magenta :
                         asp.aspect === 'trine' ? chalk.blue :
                         asp.aspect === 'square' ? chalk.red :
                         asp.aspect === 'sextile' ? chalk.green :
                         asp.aspect === 'quintile' ? chalk.hex('#FF8C00') : chalk.white;
      lines.push(`   ${p1} ${asp.planet1.padEnd(10)} ${aspectColor(aspectSym + ' ' + aspectName.padEnd(11))} ${p2} ${asp.planet2.padEnd(10)} ${chalk.dim(`${asp.orb}°`)}`);
    }
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * Format aspect with colors based on type
 */
function formatAspect(aspect: Aspect): string {
  const tSymbol = getPlanetSymbol(aspect.transit_planet);
  const nSymbol = getPlanetSymbol(aspect.natal_planet);
  const aSymbol = getAspectSymbol(aspect.aspect);
  
  // Hermetic color correspondences
  const aspectColors: Record<string, typeof chalk> = {
    'conjunction': chalk.yellow,    // Tiphareth/Sun
    'opposition': chalk.magenta,    // Yesod/Moon
    'trine': chalk.blue,            // Chesed/Jupiter
    'square': chalk.red,            // Geburah/Mars
    'sextile': chalk.green,         // Netzach/Venus
  };
  
  const color = aspectColors[aspect.aspect] || chalk.white;
  
  return `${chalk.cyan(tSymbol)} ${aspect.transit_planet.padEnd(10)} ${color(aSymbol)} ${chalk.magenta(nSymbol)} ${aspect.natal_planet.padEnd(10)} ${chalk.dim(`(${aspect.orb.toFixed(2)}°)`)}`;
}

/**
 * Format transits result
 */
export function formatTransits(result: TransitResult): string {
  const lines: string[] = [];
  
  // Header
  lines.push(chalk.bold.white(`\n𓅝 Transits`));
  if ((result.natal as any).name) {
    lines.push(chalk.dim(`   For: ${(result.natal as any).name}`));
  }
  if ((result.natal as any).city) {
    lines.push(chalk.dim(`   Natal: ${result.natal.datetime} · ${(result.natal as any).city}`));
  } else {
    lines.push(chalk.dim(`   Natal: ${result.natal.datetime}`));
  }
  lines.push(chalk.dim(`   Transit: ${result.transit.datetime}`));
  
  // Current lunar phase
  if ((result.transit as any).lunar_phase) {
    lines.push(chalk.dim(`   Moon: ${(result.transit as any).lunar_phase.emoji} ${(result.transit as any).lunar_phase.name}`));
  }
  lines.push('');
  
  // Current sky positions - just current, no natal
  if ((result.transit as any).planets) {
    lines.push(chalk.bold.cyan('── CURRENT SKY ──'));
    const planets = (result.transit as any).planets;
    for (const name of ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']) {
      const planet = planets[name];
      if (planet) {
        const symbol = getPlanetSymbol(name);
        const zodiac = getZodiacSymbol(planet.sign);
        const deg = formatDegrees(planet.position);
        const rx = planet.retrograde ? chalk.red('℞') : ' ';
        const cH = planet.house ? planet.house.replace(/ house/i, '').replace(/first/i, '1').replace(/second/i, '2').replace(/third/i, '3').replace(/fourth/i, '4').replace(/fifth/i, '5').replace(/sixth/i, '6').replace(/seventh/i, '7').replace(/eighth/i, '8').replace(/ninth/i, '9').replace(/tenth/i, '10').replace(/eleventh/i, '11').replace(/twelfth/i, '12') : '?';
        lines.push(`   ${chalk.yellow(symbol)}  ${chalk.cyan(zodiac)} ${planet.sign} ${chalk.magenta(deg)} ${rx} ${chalk.dim(`${cH}H`)}`);
      }
    }
    lines.push('');
  }
  
  // Houses comparison: Transit vs Natal - compact table
  const transitHouses = (result.transit as any).houses;
  const natalHouses = (result as any).natal_houses;
  if (transitHouses && natalHouses && Object.keys(transitHouses).length > 0) {
    lines.push(chalk.bold.cyan('── HOUSES ──'));
    lines.push(chalk.dim('       TRANSIT        NATAL'));
    for (let i = 1; i <= 12; i++) {
      const tH = transitHouses[String(i)];
      const nH = natalHouses[String(i)];
      if (tH && nH) {
        const label = i === 1 ? 'ASC' : i === 4 ? 'IC' : i === 7 ? 'DSC' : i === 10 ? 'MC' : `${i}`.padStart(2) + 'H';
        const tZodiac = getZodiacSymbol(tH.sign);
        const nZodiac = getZodiacSymbol(nH.sign);
        const tDeg = formatDegrees(tH.position);
        const nDeg = formatDegrees(nH.position);
        lines.push(`   ${chalk.yellow(label.padStart(3))}  ${tZodiac} ${tH.sign} ${chalk.dim(tDeg)}  ${nZodiac} ${nH.sign} ${chalk.dim(nDeg)}`);
      }
    }
    lines.push('');
  }
  
  // Transit aspects to natal - with short body names
  lines.push(chalk.bold.cyan('── TRANSITS TO NATAL ──'));
  if (result.aspects.length === 0) {
    lines.push(chalk.dim('   No aspects within orb'));
  } else {
    // Short planet names
    const shortName = (name: string): string => {
      const map: Record<string, string> = {
        'sun': 'SUN', 'moon': 'MOO', 'mercury': 'MER', 'venus': 'VEN', 'mars': 'MAR',
        'jupiter': 'JUP', 'saturn': 'SAT', 'uranus': 'URA', 'neptune': 'NEP', 'pluto': 'PLU',
        'chiron': 'CHI', 'nn': 'NN', 'sn': 'SN', 'lilith': 'LIL',
        'mc': 'MC', 'ic': 'IC', 'asc': 'ASC', 'dsc': 'DSC'
      };
      return map[name.toLowerCase()] || name.slice(0, 3).toUpperCase();
    };

    for (const aspect of result.aspects) {
      const tSym = getPlanetSymbol(aspect.transit_planet.toLowerCase().replace(/ /g, '_'));
      const nSym = getPlanetSymbol(aspect.natal_planet.toLowerCase().replace(/ /g, '_'));
      const tName = shortName(aspect.transit_planet);
      const nName = shortName(aspect.natal_planet);
      const aSym = getAspectSymbol(aspect.aspect);
      const aspectShort = aspect.aspect === 'conjunction' ? 'CNJ' :
                         aspect.aspect === 'opposition' ? 'OPP' :
                         aspect.aspect === 'trine' ? 'TRI' :
                         aspect.aspect === 'square' ? 'SQR' :
                         aspect.aspect === 'sextile' ? 'SXT' :
                         aspect.aspect === 'quintile' ? 'QNT' :
                         aspect.aspect === 'quincunx' ? 'QCX' : 
                         String(aspect.aspect).slice(0, 3).toUpperCase();
      
      // Hermetic color correspondences:
      // CNJ = Yellow (Tiphareth/Sun), OPP = Magenta (Yesod/Moon), TRI = Blue (Chesed/Jupiter)
      // SQR = Red (Geburah/Mars), SXT = Green (Netzach/Venus), QNT = Orange (Hod/Mercury)
      const aspectColor = aspect.aspect === 'conjunction' ? chalk.yellow :
                         aspect.aspect === 'opposition' ? chalk.magenta :
                         aspect.aspect === 'trine' ? chalk.blue :
                         aspect.aspect === 'square' ? chalk.red :
                         aspect.aspect === 'sextile' ? chalk.green :
                         aspect.aspect === 'quintile' ? chalk.hex('#FF8C00') :
                         aspect.aspect === 'quincunx' ? chalk.cyan : chalk.white;
      
      // Houses: transit → natal
      const tH = (aspect as any).transit_house;
      const nH = (aspect as any).natal_house;
      const houses = `${tH || '?'}H→${nH || '?'}H`;
      
      // Format: sym NAME aspect sym NAME | orb | houses
      const orb = aspect.orb.toFixed(2).padStart(5);
      lines.push(`   ${chalk.cyan(tSym)} ${tName.padEnd(3)} ${aspectColor(aSym + ' ' + aspectShort)} ${chalk.magenta(nSym)} ${nName.padEnd(3)}  ${chalk.dim(orb + '°')}  ${chalk.dim(houses)}`);
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
