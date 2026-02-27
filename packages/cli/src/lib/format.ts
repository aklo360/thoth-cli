/**
 * Output formatting utilities
 * 𓅝
 */

import chalk from 'chalk';

// Kabbalistic/Sephirotic color system
const COLORS = {
  // Planets (Sephirotic correspondences)
  sun: chalk.hex('#FFD700'),      // Gold - Tiphareth
  moon: chalk.hex('#C0C0C0'),     // Silver - Yesod
  mercury: chalk.hex('#FF8C00'),  // Orange - Hod
  venus: chalk.hex('#00FF7F'),    // Green - Netzach
  mars: chalk.hex('#FF0000'),     // Red - Geburah
  jupiter: chalk.hex('#4169E1'),  // Royal Blue - Chesed
  saturn: chalk.hex('#4B0082'),   // Indigo - Binah
  uranus: chalk.hex('#00FFFF'),   // Electric Cyan - Chokmah
  neptune: chalk.hex('#20B2AA'),  // Sea Green
  pluto: chalk.hex('#8B0000'),    // Dark Red
  chiron: chalk.hex('#9932CC'),   // Purple - wounded healer
  lilith: chalk.hex('#800020'),   // Burgundy - primal
  northNode: chalk.hex('#FFD700'), // Gold
  southNode: chalk.hex('#C0C0C0'), // Silver
};

// Get planet color
function getPlanetColor(name: string): typeof chalk {
  const colorMap: Record<string, typeof chalk> = {
    'sun': COLORS.sun,
    'moon': COLORS.moon,
    'mercury': COLORS.mercury,
    'venus': COLORS.venus,
    'mars': COLORS.mars,
    'jupiter': COLORS.jupiter,
    'saturn': COLORS.saturn,
    'uranus': COLORS.uranus,
    'neptune': COLORS.neptune,
    'pluto': COLORS.pluto,
    'chiron': COLORS.chiron,
    'mean_lilith': COLORS.lilith,
    'lilith': COLORS.lilith,
    'true_north_lunar_node': COLORS.northNode,
    'true_south_lunar_node': COLORS.southNode,
    'nn': COLORS.northNode,
    'sn': COLORS.southNode,
  };
  return colorMap[name.toLowerCase()] || chalk.white;
}

// Get zodiac color (by ruling planet)
function getZodiacColor(sign: string): typeof chalk {
  const colorMap: Record<string, typeof chalk> = {
    'Ari': COLORS.mars,
    'Tau': COLORS.venus,
    'Gem': COLORS.mercury,
    'Can': COLORS.moon,
    'Leo': COLORS.sun,
    'Vir': COLORS.mercury,
    'Lib': COLORS.venus,
    'Sco': COLORS.pluto,
    'Sag': COLORS.jupiter,
    'Cap': COLORS.saturn,
    'Aqu': COLORS.uranus,
    'Pis': COLORS.neptune,
  };
  return colorMap[sign] || chalk.white;
}

// Get aspect color (Sephirotic)
function getAspectColor(aspect: string): typeof chalk {
  const colorMap: Record<string, typeof chalk> = {
    'conjunction': COLORS.sun,     // Tiphareth
    'opposition': COLORS.moon,     // Yesod  
    'trine': COLORS.jupiter,       // Chesed
    'square': COLORS.mars,         // Geburah
    'sextile': COLORS.venus,       // Netzach
    'quintile': COLORS.mercury,    // Hod
    'quincunx': COLORS.uranus,
  };
  return colorMap[aspect] || chalk.white;
}
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
  
  // Angles (ASC = Mars/Aries energy, MC = Sun energy)
  lines.push(chalk.bold.cyan('── ANGLES ──'));
  if (result.ascendant.sign) {
    const zColor = getZodiacColor(result.ascendant.sign);
    lines.push(`   ${COLORS.mars('ASC')}  ${zColor(getZodiacSymbol(result.ascendant.sign) + ' ' + result.ascendant.sign)} ${chalk.white(formatDegrees(result.ascendant.position || 0))}`);
  }
  if (result.midheaven.sign) {
    const zColor = getZodiacColor(result.midheaven.sign);
    lines.push(`   ${COLORS.sun('MC')}   ${zColor(getZodiacSymbol(result.midheaven.sign) + ' ' + result.midheaven.sign)} ${chalk.white(formatDegrees(result.midheaven.position || 0))}`);
  }
  lines.push('');
  
  // Planets
  lines.push(chalk.bold.cyan('── PLANETS ──'));
  const planetOrder = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  
  for (const name of planetOrder) {
    const planet = result.planets[name];
    if (planet) {
      const pColor = getPlanetColor(name);
      const zColor = getZodiacColor(planet.sign);
      const symbol = getPlanetSymbol(name);
      const zodiac = getZodiacSymbol(planet.sign);
      const deg = formatDegrees(planet.position);
      const rx = planet.retrograde ? COLORS.mars(' ℞') : '';
      const house = planet.house ? chalk.dim(` (${planet.house})`) : '';
      lines.push(`   ${pColor(symbol)} ${name.padEnd(10)} ${zColor(zodiac + ' ' + planet.sign)} ${chalk.white(deg)}${rx}${house}`);
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
      const pColor = getPlanetColor(name);
      const zColor = getZodiacColor(planet.sign);
      const symbol = getPlanetSymbol(name);
      const displayName = pointNames[name] || name;
      const zodiac = getZodiacSymbol(planet.sign);
      const deg = formatDegrees(planet.position);
      const house = planet.house ? chalk.dim(` (${planet.house})`) : '';
      lines.push(`   ${pColor(symbol)} ${displayName.padEnd(10)} ${zColor(zodiac + ' ' + planet.sign)} ${chalk.white(deg)}${house}`);
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
  
  // Elements & Modes (using Sephirotic colors)
  if ((result as any).elements && (result as any).modes) {
    lines.push(chalk.bold.cyan('── BALANCE ──'));
    const elem = (result as any).elements;
    const mode = (result as any).modes;
    lines.push(`   ${COLORS.mars('🜂 Fire:')} ${elem.Fire}  ${COLORS.venus('🜃 Earth:')} ${elem.Earth}  ${COLORS.mercury('🜁 Air:')} ${elem.Air}  ${COLORS.moon('🜄 Water:')} ${elem.Water}`);
    lines.push(`   ${COLORS.mars('Cardinal:')} ${mode.Cardinal}  ${COLORS.sun('Fixed:')} ${mode.Fixed}  ${COLORS.mercury('Mutable:')} ${mode.Mutable}`);
    lines.push('');
  }
  
  // Natal Aspects (top 15 tightest)
  if ((result as any).aspects && (result as any).aspects.length > 0) {
    lines.push(chalk.bold.cyan('── ASPECTS ──'));
    const aspects = (result as any).aspects.slice(0, 15); // Top 15
    for (const asp of aspects) {
      const p1Name = asp.planet1.toLowerCase().replace(/ /g, '_');
      const p2Name = asp.planet2.toLowerCase().replace(/ /g, '_');
      const p1Color = getPlanetColor(p1Name);
      const p2Color = getPlanetColor(p2Name);
      const p1 = getPlanetSymbol(p1Name);
      const p2 = getPlanetSymbol(p2Name);
      const aspectSym = getAspectSymbol(asp.aspect);
      const aspectName = asp.aspect.charAt(0).toUpperCase() + asp.aspect.slice(1);
      const aColor = getAspectColor(asp.aspect);
      lines.push(`   ${p1Color(p1)} ${asp.planet1.padEnd(10)} ${aColor(aspectSym + ' ' + aspectName.padEnd(11))} ${p2Color(p2)} ${asp.planet2.padEnd(10)} ${chalk.dim(`${asp.orb}°`)}`);
    }
    lines.push('');
  }
  
  return lines.join('\n');
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
        const pColor = getPlanetColor(name);
        const zColor = getZodiacColor(planet.sign);
        const symbol = getPlanetSymbol(name);
        const zodiac = getZodiacSymbol(planet.sign);
        const deg = formatDegrees(planet.position);
        const rx = planet.retrograde ? COLORS.mars('℞') : ' ';
        const cH = planet.house ? planet.house.replace(/ house/i, '').replace(/first/i, '1').replace(/second/i, '2').replace(/third/i, '3').replace(/fourth/i, '4').replace(/fifth/i, '5').replace(/sixth/i, '6').replace(/seventh/i, '7').replace(/eighth/i, '8').replace(/ninth/i, '9').replace(/tenth/i, '10').replace(/eleventh/i, '11').replace(/twelfth/i, '12') : '?';
        lines.push(`   ${pColor(symbol)}  ${zColor(zodiac + ' ' + planet.sign)} ${chalk.white(deg)} ${rx} ${chalk.dim(`${cH}H`)}`);
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
        const tZColor = getZodiacColor(tH.sign);
        const nZColor = getZodiacColor(nH.sign);
        const tZodiac = getZodiacSymbol(tH.sign);
        const nZodiac = getZodiacSymbol(nH.sign);
        const tDeg = formatDegrees(tH.position);
        const nDeg = formatDegrees(nH.position);
        lines.push(`   ${chalk.white(label.padStart(3))}  ${tZColor(tZodiac + ' ' + tH.sign)} ${chalk.dim(tDeg)}  ${nZColor(nZodiac + ' ' + nH.sign)} ${chalk.dim(nDeg)}`);
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
      const tPlanet = aspect.transit_planet.toLowerCase().replace(/ /g, '_');
      const nPlanet = aspect.natal_planet.toLowerCase().replace(/ /g, '_');
      const tColor = getPlanetColor(tPlanet);
      const nColor = getPlanetColor(nPlanet);
      const tSym = getPlanetSymbol(tPlanet);
      const nSym = getPlanetSymbol(nPlanet);
      const tName = shortName(aspect.transit_planet);
      const nName = shortName(aspect.natal_planet);
      const aSym = getAspectSymbol(aspect.aspect);
      const aColor = getAspectColor(aspect.aspect);
      const aspectShort = aspect.aspect === 'conjunction' ? 'CNJ' :
                         aspect.aspect === 'opposition' ? 'OPP' :
                         aspect.aspect === 'trine' ? 'TRI' :
                         aspect.aspect === 'square' ? 'SQR' :
                         aspect.aspect === 'sextile' ? 'SXT' :
                         aspect.aspect === 'quintile' ? 'QNT' :
                         aspect.aspect === 'quincunx' ? 'QCX' : 
                         String(aspect.aspect).slice(0, 3).toUpperCase();
      
      // Houses: transit → natal
      const tH = (aspect as any).transit_house;
      const nH = (aspect as any).natal_house;
      const houses = `${tH || '?'}H→${nH || '?'}H`;
      
      // Format: sym NAME aspect sym NAME | orb | houses
      const orb = aspect.orb.toFixed(2).padStart(5);
      lines.push(`   ${tColor(tSym)} ${tName.padEnd(3)} ${aColor(aSym + ' ' + aspectShort)} ${nColor(nSym)} ${nName.padEnd(3)}  ${chalk.dim(orb + '°')}  ${chalk.dim(houses)}`);
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
  const zColor = getZodiacColor(result.moon.sign);
  
  lines.push(chalk.bold.white(`\n${moonEmoji} Moon Phase`));
  lines.push(chalk.dim(`   ${result.datetime}`));
  lines.push('');
  lines.push(`   ${COLORS.moon('☽')} ${chalk.white('Moon in')} ${zColor(result.moon.sign)} ${chalk.white(formatDegrees(result.moon.position))}`);
  lines.push(`   ${chalk.white('Phase:')} ${COLORS.moon(result.phase.name)}`);
  lines.push(`   ${chalk.white('Illumination:')} ${COLORS.moon(result.phase.illumination.toFixed(1) + '%')}`);
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Format ephemeris result
 */
export function formatEphemeris(result: EphemerisResult): string {
  const lines: string[] = [];
  
  const pColor = getPlanetColor(result.body);
  const zColor = getZodiacColor(result.sign);
  const symbol = getPlanetSymbol(result.body);
  const rx = result.retrograde ? COLORS.mars(' ℞') : '';
  
  lines.push(chalk.bold.white(`\n𓅝 Ephemeris: ${result.body}`));
  lines.push(chalk.dim(`   ${result.datetime}`));
  lines.push('');
  lines.push(`   ${pColor(symbol)} ${chalk.white(result.body)} in ${zColor(result.sign)} ${chalk.white(formatDegrees(result.position))}${rx}`);
  lines.push(`   ${chalk.dim(`Absolute: ${result.abs_position.toFixed(4)}°`)}`);
  lines.push('');
  
  return lines.join('\n');
}
