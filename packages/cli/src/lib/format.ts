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
import type { 
  ChartResult, TransitResult, MoonResult, EphemerisResult, Aspect,
  SolarReturnResult, LunarReturnResult, SynastryResult, ProgressionsResult, EphemerisRangeResult,
  CompositeResult, SolarArcResult, HoraryResult
} from '../types.js';

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

/**
 * Format solar return result
 */
export function formatSolarReturn(result: SolarReturnResult): string {
  const lines: string[] = [];
  
  lines.push(chalk.bold.white(`\n☉ Solar Return ${result.return_year}`));
  lines.push(chalk.dim(`   Natal: ${result.natal_date}`));
  lines.push(chalk.dim(`   Exact: ${result.exact_datetime}`));
  if (result.location.city) {
    lines.push(chalk.dim(`   Location: ${result.location.city}`));
  }
  if (result.lunar_phase) {
    lines.push(chalk.dim(`   Moon Phase: ${result.lunar_phase.emoji} ${result.lunar_phase.name}`));
  }
  lines.push('');
  
  // Angles
  lines.push(chalk.bold.cyan('── ANGLES ──'));
  const ascColor = getZodiacColor(result.ascendant.sign);
  const mcColor = getZodiacColor(result.midheaven.sign);
  lines.push(`   ${COLORS.mars('ASC')}  ${ascColor(getZodiacSymbol(result.ascendant.sign) + ' ' + result.ascendant.sign)} ${chalk.white(formatDegrees(result.ascendant.position))}`);
  lines.push(`   ${COLORS.sun('MC')}   ${mcColor(getZodiacSymbol(result.midheaven.sign) + ' ' + result.midheaven.sign)} ${chalk.white(formatDegrees(result.midheaven.position))}`);
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
  
  return lines.join('\n');
}

/**
 * Format lunar return result
 */
export function formatLunarReturn(result: LunarReturnResult): string {
  const lines: string[] = [];
  
  lines.push(chalk.bold.white(`\n☽ Lunar Return`));
  lines.push(chalk.dim(`   Natal: ${result.natal_date}`));
  lines.push(chalk.dim(`   Natal Moon: ${getZodiacSymbol(result.natal_moon.sign)} ${result.natal_moon.sign} ${formatDegrees(result.natal_moon.position)}`));
  lines.push(chalk.dim(`   Search from: ${result.search_from}`));
  lines.push(chalk.green(`   Exact: ${result.exact_datetime}`));
  if (result.location.city) {
    lines.push(chalk.dim(`   Location: ${result.location.city}`));
  }
  lines.push('');
  
  // Angles
  lines.push(chalk.bold.cyan('── ANGLES ──'));
  const ascColor = getZodiacColor(result.ascendant.sign);
  const mcColor = getZodiacColor(result.midheaven.sign);
  lines.push(`   ${COLORS.mars('ASC')}  ${ascColor(getZodiacSymbol(result.ascendant.sign) + ' ' + result.ascendant.sign)} ${chalk.white(formatDegrees(result.ascendant.position))}`);
  lines.push(`   ${COLORS.sun('MC')}   ${mcColor(getZodiacSymbol(result.midheaven.sign) + ' ' + result.midheaven.sign)} ${chalk.white(formatDegrees(result.midheaven.position))}`);
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
  
  return lines.join('\n');
}

/**
 * Format synastry result
 */
export function formatSynastry(result: SynastryResult): string {
  const lines: string[] = [];
  
  lines.push(chalk.bold.white(`\n💑 Synastry`));
  lines.push(chalk.dim(`   ${result.person1.name} (${result.person1.date})`));
  lines.push(chalk.dim(`   ${result.person2.name} (${result.person2.date})`));
  lines.push(chalk.dim(`   Aspects found: ${result.aspect_count}`));
  lines.push('');
  
  // Key planetary positions comparison
  lines.push(chalk.bold.cyan('── KEY POSITIONS ──'));
  lines.push(chalk.dim(`       ${result.person1.name.slice(0, 10).padEnd(12)}  ${result.person2.name.slice(0, 10).padEnd(12)}`));
  
  const planetOrder = ['sun', 'moon', 'mercury', 'venus', 'mars'];
  for (const name of planetOrder) {
    const p1 = result.person1.planets[name];
    const p2 = result.person2.planets[name];
    if (p1 && p2) {
      const pColor = getPlanetColor(name);
      const symbol = getPlanetSymbol(name);
      const z1Color = getZodiacColor(p1.sign);
      const z2Color = getZodiacColor(p2.sign);
      lines.push(`   ${pColor(symbol)}  ${z1Color(p1.sign)} ${formatDegrees(p1.position).padEnd(7)}  ${z2Color(p2.sign)} ${formatDegrees(p2.position)}`);
    }
  }
  lines.push('');
  
  // Inter-chart aspects
  lines.push(chalk.bold.cyan('── SYNASTRY ASPECTS ──'));
  if (result.aspects.length === 0) {
    lines.push(chalk.dim('   No aspects within orb'));
  } else {
    for (const asp of result.aspects.slice(0, 20)) {
      const p1Name = asp.planet1.toLowerCase().replace(/ /g, '_');
      const p2Name = asp.planet2.toLowerCase().replace(/ /g, '_');
      const p1Color = getPlanetColor(p1Name);
      const p2Color = getPlanetColor(p2Name);
      const p1Sym = getPlanetSymbol(p1Name);
      const p2Sym = getPlanetSymbol(p2Name);
      const aSym = getAspectSymbol(asp.aspect);
      const aColor = getAspectColor(asp.aspect);
      const aspectName = asp.aspect.charAt(0).toUpperCase() + asp.aspect.slice(1);
      lines.push(`   ${p1Color(p1Sym)} ${asp.planet1.slice(0, 8).padEnd(8)} ${aColor(aSym)} ${aColor(aspectName.slice(0, 6).padEnd(6))} ${p2Color(p2Sym)} ${asp.planet2.slice(0, 8).padEnd(8)} ${chalk.dim(asp.orb.toFixed(2) + '°')}`);
    }
  }
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Format progressions result
 */
export function formatProgressions(result: ProgressionsResult): string {
  const lines: string[] = [];
  
  lines.push(chalk.bold.white(`\n🌙 Secondary Progressions`));
  lines.push(chalk.dim(`   Method: ${result.method}`));
  lines.push(chalk.dim(`   Natal: ${result.natal_date}`));
  lines.push(chalk.dim(`   Target: ${result.target_date} (age ${result.age_at_target})`));
  lines.push(chalk.dim(`   Progressed date: ${result.progressed_date}`));
  lines.push('');
  
  // Progressed Angles
  lines.push(chalk.bold.cyan('── PROGRESSED ANGLES ──'));
  const ascColor = getZodiacColor(result.progressed_ascendant.sign);
  const mcColor = getZodiacColor(result.progressed_midheaven.sign);
  lines.push(`   ${COLORS.mars('ASC')}  ${ascColor(getZodiacSymbol(result.progressed_ascendant.sign) + ' ' + result.progressed_ascendant.sign)} ${chalk.white(formatDegrees(result.progressed_ascendant.position))}`);
  lines.push(`   ${COLORS.sun('MC')}   ${mcColor(getZodiacSymbol(result.progressed_midheaven.sign) + ' ' + result.progressed_midheaven.sign)} ${chalk.white(formatDegrees(result.progressed_midheaven.position))}`);
  lines.push('');
  
  // Progressed planets comparison
  lines.push(chalk.bold.cyan('── PROGRESSED vs NATAL ──'));
  lines.push(chalk.dim('       PROGRESSED      NATAL'));
  
  const planetOrder = ['sun', 'moon', 'mercury', 'venus', 'mars'];
  for (const name of planetOrder) {
    const prog = result.progressed_planets[name];
    const natal = result.natal_planets[name];
    if (prog && natal) {
      const pColor = getPlanetColor(name);
      const symbol = getPlanetSymbol(name);
      const pZColor = getZodiacColor(prog.sign);
      const nZColor = getZodiacColor(natal.sign);
      const rx = prog.retrograde ? COLORS.mars('℞') : ' ';
      lines.push(`   ${pColor(symbol)}  ${pZColor(prog.sign)} ${formatDegrees(prog.position).padEnd(7)}${rx} ${nZColor(natal.sign)} ${formatDegrees(natal.position)}`);
    }
  }
  lines.push('');
  
  // Progressed-to-natal aspects
  if (result.progressed_to_natal_aspects.length > 0) {
    lines.push(chalk.bold.cyan('── PROGRESSED → NATAL ASPECTS ──'));
    for (const asp of result.progressed_to_natal_aspects.slice(0, 10)) {
      const pName = asp.progressed.toLowerCase().replace(/ /g, '_');
      const nName = asp.natal.toLowerCase().replace(/ /g, '_');
      const pColor = getPlanetColor(pName);
      const nColor = getPlanetColor(nName);
      const pSym = getPlanetSymbol(pName);
      const nSym = getPlanetSymbol(nName);
      const aSym = getAspectSymbol(asp.aspect);
      const aColor = getAspectColor(asp.aspect);
      lines.push(`   ${pColor(pSym)} ${asp.progressed.slice(0, 8).padEnd(8)} ${aColor(aSym)} ${nColor(nSym)} ${asp.natal.slice(0, 8).padEnd(8)} ${chalk.dim(asp.orb.toFixed(2) + '°')}`);
    }
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * Format ephemeris range result
 */
export function formatEphemerisRange(result: EphemerisRangeResult): string {
  const lines: string[] = [];
  
  const pColor = getPlanetColor(result.body);
  const symbol = getPlanetSymbol(result.body);
  
  lines.push(chalk.bold.white(`\n${pColor(symbol)} ${result.body.charAt(0).toUpperCase() + result.body.slice(1)} Ephemeris`));
  lines.push(chalk.dim(`   ${result.range.start} → ${result.range.end} (${result.range.step})`));
  lines.push('');
  
  // Sign changes
  if (result.sign_changes.length > 0) {
    lines.push(chalk.bold.cyan('── SIGN CHANGES ──'));
    for (const change of result.sign_changes) {
      const fromColor = getZodiacColor(change.from);
      const toColor = getZodiacColor(change.to);
      lines.push(`   ${chalk.white(change.date)}  ${fromColor(getZodiacSymbol(change.from) + ' ' + change.from)} → ${toColor(getZodiacSymbol(change.to) + ' ' + change.to)}`);
    }
    lines.push('');
  }
  
  // Retrograde stations
  if (result.retrograde_stations.length > 0) {
    lines.push(chalk.bold.cyan('── RETROGRADE STATIONS ──'));
    for (const station of result.retrograde_stations) {
      const zColor = getZodiacColor(station.sign);
      const stationType = station.station === 'retrograde' ? COLORS.mars('℞ RETRO') : COLORS.jupiter('⮕ DIRECT');
      lines.push(`   ${chalk.white(station.date)}  ${stationType}  ${zColor(station.sign)} ${formatDegrees(station.position)}`);
    }
    lines.push('');
  }
  
  // Positions (condensed)
  lines.push(chalk.bold.cyan('── POSITIONS ──'));
  for (const pos of result.positions) {
    const zColor = getZodiacColor(pos.sign);
    const rx = pos.retrograde ? COLORS.mars(' ℞') : '';
    lines.push(`   ${chalk.dim(pos.date)}  ${zColor(getZodiacSymbol(pos.sign) + ' ' + pos.sign)} ${chalk.white(formatDegrees(pos.position))}${rx}`);
  }
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Format composite chart result
 */
export function formatComposite(result: CompositeResult): string {
  const lines: string[] = [];
  
  lines.push(chalk.bold.white(`\n🔮 Composite Chart`));
  lines.push(chalk.dim(`   ${result.person1.name} + ${result.person2.name}`));
  lines.push(chalk.dim(`   Method: ${result.method}`));
  lines.push('');
  
  // Angles
  lines.push(chalk.bold.cyan('── COMPOSITE ANGLES ──'));
  const ascColor = getZodiacColor(result.ascendant.sign);
  const mcColor = getZodiacColor(result.midheaven.sign);
  lines.push(`   ${COLORS.mars('ASC')}  ${ascColor(getZodiacSymbol(result.ascendant.sign) + ' ' + result.ascendant.sign)} ${chalk.white(formatDegrees(result.ascendant.position))}`);
  lines.push(`   ${COLORS.sun('MC')}   ${mcColor(getZodiacSymbol(result.midheaven.sign) + ' ' + result.midheaven.sign)} ${chalk.white(formatDegrees(result.midheaven.position))}`);
  lines.push('');
  
  // Planets
  lines.push(chalk.bold.cyan('── COMPOSITE PLANETS ──'));
  const planetOrder = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  for (const name of planetOrder) {
    const planet = result.planets[name];
    if (planet) {
      const pColor = getPlanetColor(name);
      const zColor = getZodiacColor(planet.sign);
      const symbol = getPlanetSymbol(name);
      const zodiac = getZodiacSymbol(planet.sign);
      const deg = formatDegrees(planet.position);
      const house = planet.house ? chalk.dim(` (${planet.house})`) : '';
      lines.push(`   ${pColor(symbol)} ${name.padEnd(10)} ${zColor(zodiac + ' ' + planet.sign)} ${chalk.white(deg)}${house}`);
    }
  }
  lines.push('');
  
  lines.push(chalk.dim('   The composite chart represents the relationship as its own entity.'));
  lines.push(chalk.dim('   Each planet is the midpoint between both individuals\' placements.'));
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Format solar arc directions result
 */
export function formatSolarArc(result: SolarArcResult): string {
  const lines: string[] = [];
  
  lines.push(chalk.bold.white(`\n☀️ Solar Arc Directions`));
  lines.push(chalk.dim(`   Method: ${result.method}`));
  lines.push(chalk.dim(`   Natal: ${result.natal_date}`));
  lines.push(chalk.dim(`   Target: ${result.target_date} (age ${result.age_at_target})`));
  lines.push(chalk.green(`   Solar Arc: ${result.solar_arc.toFixed(2)}°`));
  lines.push('');
  
  // Directed Angles
  lines.push(chalk.bold.cyan('── DIRECTED ANGLES ──'));
  const ascColor = getZodiacColor(result.directed_ascendant.sign);
  const mcColor = getZodiacColor(result.directed_midheaven.sign);
  lines.push(`   ${COLORS.mars('ASC')}  ${ascColor(getZodiacSymbol(result.directed_ascendant.sign) + ' ' + result.directed_ascendant.sign)} ${chalk.white(formatDegrees(result.directed_ascendant.position))} ${chalk.dim(`← ${result.directed_ascendant.natal_sign} ${formatDegrees(result.directed_ascendant.natal_position)}`)}`);
  lines.push(`   ${COLORS.sun('MC')}   ${mcColor(getZodiacSymbol(result.directed_midheaven.sign) + ' ' + result.directed_midheaven.sign)} ${chalk.white(formatDegrees(result.directed_midheaven.position))} ${chalk.dim(`← ${result.directed_midheaven.natal_sign} ${formatDegrees(result.directed_midheaven.natal_position)}`)}`);
  lines.push('');
  
  // Directed planets
  lines.push(chalk.bold.cyan('── DIRECTED PLANETS ──'));
  lines.push(chalk.dim('       DIRECTED        ← NATAL'));
  
  const planetOrder = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  for (const name of planetOrder) {
    const planet = result.directed_planets[name];
    if (planet) {
      const pColor = getPlanetColor(name);
      const symbol = getPlanetSymbol(name);
      const dZColor = getZodiacColor(planet.sign);
      const nZColor = getZodiacColor(planet.natal_sign);
      lines.push(`   ${pColor(symbol)}  ${dZColor(planet.sign)} ${formatDegrees(planet.position).padEnd(7)} ← ${nZColor(planet.natal_sign)} ${formatDegrees(planet.natal_position)}`);
    }
  }
  lines.push('');
  
  // Directed-to-natal aspects
  if (result.directed_to_natal_aspects.length > 0) {
    lines.push(chalk.bold.cyan('── DIRECTED → NATAL ASPECTS ──'));
    for (const asp of result.directed_to_natal_aspects.slice(0, 15)) {
      const dName = asp.directed.toLowerCase();
      const nName = asp.natal.toLowerCase();
      const dColor = getPlanetColor(dName);
      const nColor = getPlanetColor(nName);
      const dSym = getPlanetSymbol(dName);
      const nSym = getPlanetSymbol(nName);
      const aSym = getAspectSymbol(asp.aspect);
      const aColor = getAspectColor(asp.aspect);
      lines.push(`   ${dColor(dSym)} ${asp.directed.slice(0, 7).padEnd(7)} ${aColor(aSym)} ${nColor(nSym)} ${asp.natal.slice(0, 7).padEnd(7)} ${chalk.dim(asp.orb.toFixed(2) + '°')}`);
    }
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * Format horary chart result
 */
export function formatHorary(result: HoraryResult): string {
  const lines: string[] = [];
  
  lines.push(chalk.bold.white(`\n🔮 HORARY CHART`));
  lines.push(chalk.bold.yellow(`   "${result.question}"`));
  lines.push('');
  lines.push(chalk.dim(`   Cast: ${result.cast_time.datetime}`));
  if (result.cast_time.city) {
    lines.push(chalk.dim(`   Location: ${result.cast_time.city}`));
  }
  lines.push(chalk.dim(`   Planetary Hour: ${result.planetary_hour} | Day Ruler: ${result.day_ruler}`));
  lines.push('');
  
  // Strictures (warnings)
  if (result.strictures.length > 0) {
    lines.push(chalk.bold.red('⚠️  STRICTURES AGAINST JUDGMENT'));
    for (const stricture of result.strictures) {
      lines.push(chalk.red(`   • ${stricture}`));
    }
    lines.push('');
  }
  
  // Querent (1st house ruler)
  lines.push(chalk.bold.cyan('── THE QUERENT ──'));
  const qRuler = result.querent.ruler.toLowerCase();
  const qColor = getPlanetColor(qRuler);
  const qZColor = getZodiacColor(result.querent.sign);
  const qPosZColor = getZodiacColor(result.querent.ruler_position.sign);
  lines.push(`   Ascendant: ${qZColor(getZodiacSymbol(result.querent.sign) + ' ' + result.querent.sign)} ${formatDegrees(result.ascendant.position)}`);
  lines.push(`   You are signified by: ${qColor(getPlanetSymbol(qRuler) + ' ' + result.querent.ruler)}`);
  const rx = result.querent.ruler_position.retrograde ? COLORS.mars(' ℞') : '';
  lines.push(`   ${result.querent.ruler} is in: ${qPosZColor(result.querent.ruler_position.sign)} ${formatDegrees(result.querent.ruler_position.position)}${rx}`);
  if (result.querent.ruler_position.house) {
    lines.push(`   ${result.querent.ruler} is in: ${chalk.white(result.querent.ruler_position.house)}`);
  }
  lines.push('');
  
  // Moon (co-significator and key to events)
  lines.push(chalk.bold.cyan('── THE MOON ──'));
  const moonZColor = getZodiacColor(result.moon.sign);
  lines.push(`   ${COLORS.moon('☽')} Moon in ${moonZColor(getZodiacSymbol(result.moon.sign) + ' ' + result.moon.sign)} ${formatDegrees(result.moon.position)}`);
  if (result.moon.house) {
    lines.push(`   House: ${chalk.white(result.moon.house)}`);
  }
  
  if (result.moon.void_of_course) {
    lines.push(`   ${chalk.red('⚠️  VOID OF COURSE')} — ${chalk.dim(`${result.moon.degrees_until_sign_change.toFixed(1)}° until sign change`)}`);
    lines.push(chalk.dim('   (Nothing may come of the matter, or outcome is already fated)'));
  } else {
    lines.push(`   ${chalk.green('Moon is active')} — ${chalk.dim(`${result.moon.degrees_until_sign_change.toFixed(1)}° until sign change`)}`);
  }
  
  // Moon aspects
  if (result.moon.aspects.length > 0) {
    lines.push('');
    lines.push(chalk.dim('   Moon aspects:'));
    for (const asp of result.moon.aspects.slice(0, 5)) {
      const pColor = getPlanetColor(asp.planet.toLowerCase());
      const aSym = getAspectSymbol(asp.aspect);
      const applying = asp.applying ? chalk.green('→ applying') : chalk.dim('← separating');
      lines.push(`   ${COLORS.moon('☽')} ${aSym} ${pColor(asp.planet.padEnd(8))} ${chalk.dim(asp.orb.toFixed(2) + '°')} ${applying}`);
    }
  }
  lines.push('');
  
  // Houses table (key for identifying quesited)
  lines.push(chalk.bold.cyan('── HOUSES ──'));
  lines.push(chalk.dim('   Use these to identify the quesited (thing asked about):'));
  lines.push('');
  
  const importantHouses = ['1', '2', '5', '7', '10', '11'];
  for (const num of importantHouses) {
    const house = result.houses[num];
    if (house) {
      const hZColor = getZodiacColor(house.sign);
      const ruler = house.ruler.toLowerCase();
      const rColor = getPlanetColor(ruler);
      lines.push(`   ${chalk.bold(num.padStart(2))}H  ${hZColor(getZodiacSymbol(house.sign))} ${house.sign.padEnd(3)} → ${rColor(house.ruler.padEnd(7))}  ${chalk.dim(house.topic)}`);
    }
  }
  lines.push(chalk.dim('   ... (other houses available in JSON output)'));
  lines.push('');
  
  // Key planets
  lines.push(chalk.bold.cyan('── KEY PLANETS ──'));
  const keyPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  for (const name of keyPlanets) {
    const planet = result.planets[name];
    if (planet) {
      const pColor = getPlanetColor(name);
      const zColor = getZodiacColor(planet.sign);
      const symbol = getPlanetSymbol(name);
      const deg = formatDegrees(planet.position);
      const rx = planet.retrograde ? COLORS.mars(' ℞') : '';
      const house = planet.house ? chalk.dim(` (${planet.house})`) : '';
      lines.push(`   ${pColor(symbol)} ${name.padEnd(8)} ${zColor(planet.sign)} ${deg}${rx}${house}`);
    }
  }
  lines.push('');
  
  // Interpretation guidance
  lines.push(chalk.bold.cyan('── HOW TO READ ──'));
  lines.push(chalk.dim('   1. Identify the quesited\'s house (what you\'re asking about)'));
  lines.push(chalk.dim('   2. Find that house\'s ruler (the significator)'));
  lines.push(chalk.dim('   3. Look for aspects between querent\'s ruler and quesited\'s ruler'));
  lines.push(chalk.dim('   4. Applying aspects = future contact; Separating = past'));
  lines.push(chalk.dim('   5. Moon\'s next aspect often shows the outcome'));
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Format relationship compatibility score
 */
export function formatScore(result: any): string {
  const lines: string[] = [];
  
  lines.push('');
  lines.push(chalk.bold.magenta('💕 Relationship Compatibility Score'));
  lines.push('');
  
  // Score display
  const scoreValue = result.score.value;
  const scoreDesc = result.score.description;
  const scoreColor = scoreValue >= 15 ? chalk.green : scoreValue >= 8 ? chalk.yellow : chalk.red;
  
  lines.push(`   ${chalk.bold('Score:')} ${scoreColor(scoreValue)} / 20 (${scoreDesc})`);
  if (result.score.is_destiny_sign) {
    lines.push(`   ${chalk.magenta('✨ Destiny Sign Connection!')}`);
  }
  lines.push('');
  
  // People summary
  lines.push(chalk.bold.cyan('── COMPARISON ──'));
  const p1 = result.person1;
  const p2 = result.person2;
  lines.push(`   ${chalk.bold(p1.name)}: ${getZodiacSymbol(p1.sun)} ${p1.sun} Sun, ${getZodiacSymbol(p1.moon)} ${p1.moon} Moon`);
  lines.push(`   ${chalk.bold(p2.name)}: ${getZodiacSymbol(p2.sun)} ${p2.sun} Sun, ${getZodiacSymbol(p2.moon)} ${p2.moon} Moon`);
  lines.push('');
  
  // Score breakdown
  if (result.breakdown && result.breakdown.length > 0) {
    lines.push(chalk.bold.cyan('── SCORE BREAKDOWN ──'));
    for (const b of result.breakdown) {
      const pointColor = b.points > 0 ? chalk.green : chalk.red;
      lines.push(`   ${pointColor(`+${b.points}`)} ${b.description}`);
      lines.push(chalk.dim(`      ${b.details}`));
    }
    lines.push('');
  }
  
  // Key aspects
  if (result.aspects && result.aspects.length > 0) {
    lines.push(chalk.bold.cyan('── KEY ASPECTS ──'));
    for (const asp of result.aspects.slice(0, 10)) {
      const aspSymbol = getAspectSymbol(asp.aspect);
      lines.push(`   ${asp.planet1} ${aspSymbol} ${asp.aspect} ${asp.planet2}  ${chalk.dim(`(orb: ${asp.orb}°)`)}`);
    }
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * Format extended moon data
 */
export function formatMoonExtended(result: any): string {
  const lines: string[] = [];
  
  lines.push('');
  lines.push(chalk.bold.hex('#C0C0C0')(`🌙 Moon Extended — ${result.datetime}`));
  lines.push(`   Location: ${result.location.lat}°, ${result.location.lng}° (${result.location.timezone})`);
  lines.push('');
  
  // Moon phase
  const moon = result.moon;
  const moonColor = COLORS.moon;
  lines.push(chalk.bold.cyan('── MOON ──'));
  lines.push(`   ${moon.emoji} ${chalk.bold(moon.phase_name)} (${moon.stage})`);
  lines.push(`   ${moonColor(getZodiacSymbol(moon.sign))} Moon in ${moon.sign}`);
  lines.push(`   Illumination: ${moon.illumination}`);
  lines.push(`   Age: ${moon.age_days} days`);
  lines.push('');
  
  // Sun data
  const sun = result.sun;
  lines.push(chalk.bold.cyan('── SUN ──'));
  lines.push(`   ☀️ Sunrise: ${sun.sunrise}  |  Sunset: ${sun.sunset}`);
  lines.push(`   Solar noon: ${sun.solar_noon}  |  Day length: ${sun.day_length}`);
  lines.push('');
  
  // Eclipses
  lines.push(chalk.bold.cyan('── ECLIPSES ──'));
  if (moon.next_lunar_eclipse) {
    lines.push(`   🌑 Next Lunar Eclipse: ${moon.next_lunar_eclipse.date}`);
    lines.push(`      Type: ${moon.next_lunar_eclipse.type}`);
  }
  if (sun.next_solar_eclipse) {
    lines.push(`   ☀️ Next Solar Eclipse: ${sun.next_solar_eclipse.date}`);
    lines.push(`      Type: ${sun.next_solar_eclipse.type}`);
  }
  lines.push('');
  
  // Upcoming phases
  if (result.upcoming_phases) {
    lines.push(chalk.bold.cyan('── UPCOMING PHASES ──'));
    const phases = ['new_moon', 'first_quarter', 'full_moon', 'last_quarter'];
    const phaseEmojis: Record<string, string> = {
      'new_moon': '🌑', 'first_quarter': '🌓', 'full_moon': '🌕', 'last_quarter': '🌗'
    };
    for (const phase of phases) {
      const data = result.upcoming_phases[phase];
      if (data && data.next) {
        const emoji = phaseEmojis[phase] || '🌙';
        const name = phase.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
        lines.push(`   ${emoji} ${name}: ${data.next} ${chalk.dim(`(${data.days_until_next} days)`)}`);
      }
    }
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * Format transit scan results
 */
export function formatTransitScan(result: any): string {
  const lines: string[] = [];
  
  lines.push('');
  lines.push(chalk.bold.blue('🔭 Transit Scan'));
  lines.push(`   Natal: ${result.natal.date}`);
  lines.push(`   Range: ${result.scan_range.start} to ${result.scan_range.end}`);
  lines.push(`   Step: ${result.scan_range.step}  |  Orb: ${result.scan_range.orb}°`);
  lines.push(`   Found: ${result.total_hits} transit hits`);
  lines.push('');
  
  if (result.hits && result.hits.length > 0) {
    lines.push(chalk.bold.cyan('── TRANSIT HITS ──'));
    
    // Group by date
    let currentDate = '';
    for (const hit of result.hits) {
      if (hit.date !== currentDate) {
        currentDate = hit.date;
        lines.push('');
        lines.push(chalk.bold(`   📅 ${hit.date}`));
      }
      
      const tColor = getPlanetColor(hit.transit_planet.toLowerCase());
      const nColor = getPlanetColor(hit.natal_planet.toLowerCase());
      const aspSymbol = getAspectSymbol(hit.aspect);
      
      lines.push(`      ${tColor(hit.transit_planet)} ${aspSymbol} ${hit.aspect.slice(0,4)} ${nColor(hit.natal_planet)}  ${chalk.dim(`(${hit.orb.toFixed(2)}°)`)}`);
    }
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * Format multi-body ephemeris
 */
export function formatEphemerisMulti(result: any): string {
  const lines: string[] = [];
  
  lines.push('');
  lines.push(chalk.bold.cyan('📊 Multi-Body Ephemeris'));
  lines.push(`   Bodies: ${result.bodies.join(', ')}`);
  lines.push(`   Range: ${result.range.start} to ${result.range.end}`);
  lines.push(`   Step: ${result.range.step}  |  Points: ${result.total_points}`);
  lines.push('');
  
  lines.push(chalk.bold.cyan('── POSITIONS ──'));
  
  // Header
  const bodyHeaders = result.bodies.map((b: string) => b.slice(0, 6).padEnd(8)).join('');
  lines.push(`   ${chalk.dim('Date'.padEnd(12))}${bodyHeaders}`);
  lines.push(chalk.dim('   ' + '─'.repeat(12 + result.bodies.length * 8)));
  
  // Data rows
  for (const pos of result.positions.slice(0, 30)) { // Limit to first 30
    const date = pos.datetime.slice(0, 10);
    let row = `   ${date}  `;
    
    for (const body of result.bodies) {
      const data = pos[body];
      if (data && typeof data === 'object') {
        const sign = data.sign.slice(0, 3);
        const deg = Math.floor(data.position);
        const color = getZodiacColor(sign);
        row += color(`${sign}${deg}°`.padEnd(8));
      } else {
        row += ''.padEnd(8);
      }
    }
    lines.push(row);
  }
  
  if (result.positions.length > 30) {
    lines.push(chalk.dim(`   ... and ${result.positions.length - 30} more rows (use --json for full data)`));
  }
  lines.push('');
  
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// TAROT FORMATTERS
// ═══════════════════════════════════════════════════════════════

const TAROT_COLORS = {
  major: chalk.hex('#FFD700'),     // Gold for Major Arcana
  wands: chalk.hex('#FF4500'),     // Fire - Orange Red
  cups: chalk.hex('#4169E1'),      // Water - Royal Blue
  swords: chalk.hex('#E0E0E0'),    // Air - Silver
  pentacles: chalk.hex('#228B22'), // Earth - Forest Green
};

function getTarotColor(card: any): typeof chalk {
  if (card.arcana === 'major') return TAROT_COLORS.major;
  return TAROT_COLORS[card.suit as keyof typeof TAROT_COLORS] || chalk.white;
}

function getSuitSymbol(suit: string): string {
  const symbols: Record<string, string> = {
    wands: '🜂',      // Fire alchemical symbol
    cups: '🜄',       // Water alchemical symbol
    swords: '🜁',     // Air alchemical symbol
    pentacles: '🜃',  // Earth alchemical symbol
  };
  return symbols[suit] || '';
}

/**
 * Format a tarot draw result
 */
export function formatTarotDraw(result: any): string {
  const lines: string[] = [];
  
  lines.push('');
  lines.push(chalk.bold.hex('#9932CC')('🎴 TAROT READING'));
  lines.push(`   ${chalk.dim('Spread:')} ${result.spread_name}`);
  if (result.question) {
    lines.push(`   ${chalk.dim('Question:')} "${result.question}"`);
  }
  lines.push(`   ${chalk.dim('Entropy:')} ${result.entropy_source}`);
  lines.push(`   ${chalk.dim('Time:')} ${result.timestamp}`);
  lines.push('');
  
  lines.push(chalk.bold.cyan('── THE CARDS ──'));
  lines.push('');
  
  for (const card of result.cards) {
    const color = getTarotColor(card);
    const reversed = card.reversed ? chalk.red(' ℞ REVERSED') : '';
    const suitSymbol = card.suit ? ` ${getSuitSymbol(card.suit)}` : '';
    
    // Card header
    lines.push(`   ${chalk.bold.white(`[${card.position}] ${card.position_name}`)}`);
    lines.push(`   ${color(card.name)}${suitSymbol}${reversed}`);
    
    // Card details
    if (card.arcana === 'major') {
      const details = [];
      if (card.hebrew) details.push(card.hebrew);
      if (card.planet) details.push(`☉ ${card.planet}`);
      if (card.zodiac) details.push(`♈ ${card.zodiac}`);
      if (card.element) details.push(`△ ${card.element}`);
      if (details.length > 0) {
        lines.push(`   ${chalk.dim(details.join(' | '))}`);
      }
    } else {
      const details = [];
      if (card.element) details.push(`${card.element}`);
      if (card.sephira) details.push(card.sephira);
      if (card.theme) details.push(card.theme);
      if (details.length > 0) {
        lines.push(`   ${chalk.dim(details.join(' | '))}`);
      }
    }
    
    // Keywords
    const keywords = card.reversed ? card.keywords_reversed : card.keywords_upright;
    if (keywords && keywords.length > 0) {
      const keywordStr = keywords.slice(0, 5).join(', ');
      lines.push(`   ${chalk.italic(keywordStr)}`);
    }
    
    lines.push('');
  }
  
  lines.push(chalk.dim('─'.repeat(60)));
  lines.push(chalk.dim('   The cards are cast. The interpretation is yours.'));
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Format a single tarot card lookup
 */
export function formatTarotCard(card: any): string {
  const lines: string[] = [];
  const color = getTarotColor(card);
  
  lines.push('');
  lines.push(color(`🎴 ${card.name}`));
  lines.push(`   ${chalk.dim('Number:')} ${card.number} | ${chalk.dim('Arcana:')} ${card.arcana}`);
  
  if (card.arcana === 'major') {
    if (card.hebrew) lines.push(`   ${chalk.dim('Hebrew:')} ${card.hebrew} | ${chalk.dim('Path:')} ${card.path}`);
    if (card.planet) lines.push(`   ${chalk.dim('Planet:')} ${card.planet}`);
    if (card.zodiac) lines.push(`   ${chalk.dim('Zodiac:')} ${card.zodiac}`);
    if (card.element) lines.push(`   ${chalk.dim('Element:')} ${card.element}`);
  } else {
    lines.push(`   ${chalk.dim('Suit:')} ${card.suit} (${card.element})`);
    lines.push(`   ${chalk.dim('Rank:')} ${card.rank} | ${chalk.dim('Sephira:')} ${card.sephira}`);
    lines.push(`   ${chalk.dim('Theme:')} ${card.theme}`);
  }
  
  lines.push('');
  lines.push(chalk.bold.green('   Upright:'));
  lines.push(`   ${card.keywords_upright.join(', ')}`);
  lines.push('');
  lines.push(chalk.bold.red('   Reversed:'));
  lines.push(`   ${card.keywords_reversed.join(', ')}`);
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Format tarot deck listing
 */
export function formatTarotDeck(result: any): string {
  const lines: string[] = [];
  
  lines.push('');
  lines.push(chalk.bold.hex('#9932CC')(`🎴 TAROT DECK (${result.count} cards)`));
  if (result.filter) {
    lines.push(`   Filter: ${result.filter}`);
  }
  lines.push('');
  
  // Group by arcana/suit
  const majors = result.cards.filter((c: any) => c.arcana === 'major');
  const wands = result.cards.filter((c: any) => c.suit === 'wands');
  const cups = result.cards.filter((c: any) => c.suit === 'cups');
  const swords = result.cards.filter((c: any) => c.suit === 'swords');
  const pentacles = result.cards.filter((c: any) => c.suit === 'pentacles');
  
  if (majors.length > 0) {
    lines.push(TAROT_COLORS.major('── MAJOR ARCANA ──'));
    for (const card of majors) {
      lines.push(`   ${String(card.number).padStart(2)}. ${card.name}`);
    }
    lines.push('');
  }
  
  const suits = [
    { name: 'WANDS', cards: wands, color: TAROT_COLORS.wands, symbol: '🜂' },
    { name: 'CUPS', cards: cups, color: TAROT_COLORS.cups, symbol: '🜄' },
    { name: 'SWORDS', cards: swords, color: TAROT_COLORS.swords, symbol: '🜁' },
    { name: 'PENTACLES', cards: pentacles, color: TAROT_COLORS.pentacles, symbol: '🜃' },
  ];
  
  for (const suit of suits) {
    if (suit.cards.length > 0) {
      lines.push(suit.color(`── ${suit.symbol} ${suit.name} ──`));
      for (const card of suit.cards) {
        lines.push(`   ${String(card.number).padStart(2)}. ${card.name}`);
      }
      lines.push('');
    }
  }
  
  return lines.join('\n');
}

/**
 * Format available spreads
 */
export function formatTarotSpreads(result: any): string {
  const lines: string[] = [];
  
  lines.push('');
  lines.push(chalk.bold.hex('#9932CC')('🎴 AVAILABLE SPREADS'));
  lines.push('');
  
  for (const spread of result.spreads) {
    lines.push(chalk.bold(`   ${spread.name} (${spread.id})`));
    lines.push(`   ${chalk.dim(spread.description)}`);
    lines.push(`   Cards: ${spread.count} — ${spread.positions.join(' → ')}`);
    lines.push('');
  }
  
  return lines.join('\n');
}
