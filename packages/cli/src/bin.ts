#!/usr/bin/env node
/**
 * Thoth CLI - Entry Point
 * 𓅝
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { chart, transit, moon, ephemeris, version } from './lib/core.js';
import { formatChart, formatTransits, formatMoon, formatEphemeris } from './lib/format.js';
import { isError } from './types.js';

const program = new Command();

program
  .name('thoth')
  .description(`𓅝 Astrological calculations from the command line

Examples:
  thoth chart --date 1991-07-08 --time 14:06 --city "New York"
  thoth transit --natal-date 1991-07-08 --natal-time 14:06 --city "New York"
  thoth moon
  thoth ephemeris --body pluto`)
  .version('0.1.0');

// Chart command
program
  .command('chart')
  .description(`Calculate a natal chart

  Examples:
    thoth chart --date 1991-07-08 --time 14:06 --city "New York" --name "AKLO"
    thoth chart --date 1986-07-29 --time 12:00 --lat 40.7128 --lng -74.0060`)
  .requiredOption('--date <date>', 'Birth date (YYYY-MM-DD)')
  .requiredOption('--time <time>', 'Birth time (HH:MM)')
  .option('--lat <lat>', 'Latitude', parseFloat)
  .option('--lng <lng>', 'Longitude', parseFloat)
  .option('--city <city>', 'City name (e.g., "New York")')
  .option('--nation <nation>', 'Country code (e.g., US, UK)', 'US')
  .option('--name <name>', 'Name', 'Subject')
  .option('--json', 'Output raw JSON')
  .action(async (options) => {
    // Validate: need either city or lat/lng
    if (!options.city && (!options.lat || !options.lng)) {
      console.error(chalk.red('Error: Must provide either --city or both --lat and --lng'));
      process.exit(1);
    }
    
    const spinner = ora('Calculating chart...').start();
    
    const [year, month, day] = options.date.split('-').map(Number);
    const [hour, minute] = options.time.split(':').map(Number);
    
    const result = await chart({
      year, month, day, hour, minute,
      lat: options.lat,
      lng: options.lng,
      city: options.city,
      nation: options.nation,
      name: options.name,
    });
    
    spinner.stop();
    
    if (isError(result)) {
      console.error(chalk.red(`Error: ${result.error}`));
      process.exit(1);
    }
    
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatChart(result));
    }
  });

// Transit command
program
  .command('transit')
  .description(`Calculate transits to a natal chart

  Examples:
    thoth transit --natal-date 1991-07-08 --natal-time 14:06 --city "New York"
    thoth transit --natal-date 1991-07-08 --natal-time 14:06 --city "New York" --orb 1`)
  .requiredOption('--natal-date <date>', 'Natal date (YYYY-MM-DD)')
  .requiredOption('--natal-time <time>', 'Natal time (HH:MM)')
  .option('--lat <lat>', 'Latitude', parseFloat)
  .option('--lng <lng>', 'Longitude', parseFloat)
  .option('--city <city>', 'City name (e.g., "New York")')
  .option('--nation <nation>', 'Country code (e.g., US, UK)', 'US')
  .option('--transit-date <date>', 'Transit date (YYYY-MM-DD, default: today)')
  .option('--orb <degrees>', 'Orb in degrees', parseFloat, 3)
  .option('--json', 'Output raw JSON')
  .action(async (options) => {
    // Validate: need either city or lat/lng
    if (!options.city && (!options.lat || !options.lng)) {
      console.error(chalk.red('Error: Must provide either --city or both --lat and --lng'));
      process.exit(1);
    }
    
    const spinner = ora('Calculating transits...').start();
    
    const [natalYear, natalMonth, natalDay] = options.natalDate.split('-').map(Number);
    const [natalHour, natalMinute] = options.natalTime.split(':').map(Number);
    
    let transitYear, transitMonth, transitDay;
    if (options.transitDate) {
      [transitYear, transitMonth, transitDay] = options.transitDate.split('-').map(Number);
    }
    
    const result = await transit({
      natalYear, natalMonth, natalDay, natalHour, natalMinute,
      natalLat: options.lat,
      natalLng: options.lng,
      natalCity: options.city,
      nation: options.nation,
      transitYear, transitMonth, transitDay,
      orb: options.orb,
    });
    
    spinner.stop();
    
    if (isError(result)) {
      console.error(chalk.red(`Error: ${result.error}`));
      process.exit(1);
    }
    
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatTransits(result));
    }
  });

// Moon command
program
  .command('moon')
  .description('Get current moon phase and position')
  .option('--date <date>', 'Date (YYYY-MM-DD, default: today)')
  .option('--lat <lat>', 'Latitude', parseFloat, 40.7128)
  .option('--lng <lng>', 'Longitude', parseFloat, -74.0060)
  .option('--json', 'Output raw JSON')
  .action(async (options) => {
    const spinner = ora('Getting moon phase...').start();
    
    let year, month, day;
    if (options.date) {
      [year, month, day] = options.date.split('-').map(Number);
    }
    
    const result = await moon({
      year, month, day,
      lat: options.lat,
      lng: options.lng,
    });
    
    spinner.stop();
    
    if (isError(result)) {
      console.error(chalk.red(`Error: ${result.error}`));
      process.exit(1);
    }
    
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatMoon(result));
    }
  });

// Ephemeris command
program
  .command('ephemeris')
  .description('Get ephemeris position for a celestial body')
  .requiredOption('--body <body>', 'Celestial body (sun, moon, mars, etc.)')
  .option('--date <date>', 'Date (YYYY-MM-DD, default: today)')
  .option('--json', 'Output raw JSON')
  .action(async (options) => {
    const spinner = ora(`Getting ${options.body} position...`).start();
    
    let year, month, day;
    if (options.date) {
      [year, month, day] = options.date.split('-').map(Number);
    }
    
    const result = await ephemeris({
      body: options.body,
      year, month, day,
    });
    
    spinner.stop();
    
    if (isError(result)) {
      console.error(chalk.red(`Error: ${result.error}`));
      process.exit(1);
    }
    
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatEphemeris(result));
    }
  });

// Version command (from core)
program
  .command('core-version')
  .description('Show thoth-core version')
  .action(async () => {
    const result = await version();
    
    if (isError(result)) {
      console.error(chalk.red(`Error: ${result.error}`));
      process.exit(1);
    }
    
    console.log(chalk.cyan(`thoth-core v${result.version}`));
  });

// Key command - symbol reference with Kabbalistic colors
program
  .command('key')
  .description('Symbol reference guide')
  .action(() => {
    // Planetary colors (Sephirotic correspondences)
    const sun = chalk.hex('#FFD700');      // Gold - Tiphareth
    const moon = chalk.hex('#C0C0C0');     // Silver - Yesod
    const mercury = chalk.hex('#FF8C00');  // Orange - Hod
    const venus = chalk.hex('#00FF7F');    // Green - Netzach
    const mars = chalk.hex('#FF0000');     // Red - Geburah
    const jupiter = chalk.hex('#4169E1');  // Royal Blue - Chesed
    const saturn = chalk.hex('#4B0082');   // Indigo - Binah
    const uranus = chalk.hex('#00FFFF');   // Electric Cyan - Chokmah
    const neptune = chalk.hex('#20B2AA');  // Sea Green
    const pluto = chalk.hex('#8B0000');    // Dark Red - transformation
    const chiron = chalk.hex('#9932CC');   // Purple - wounded healer
    const lilith = chalk.hex('#800020');   // Burgundy - primal
    const northNode = chalk.hex('#FFD700'); // Gold - future
    const southNode = chalk.hex('#C0C0C0'); // Silver - past
    
    console.log(chalk.bold.white('\n𓅝 THOTH KEY — Symbol Reference\n'));
    
    // Zodiac Signs (colored by ruling planet)
    console.log(chalk.bold.cyan('── ZODIAC SIGNS ──'));
    console.log(`   ${mars('♈ Ari')}  Aries        ${venus('♎ Lib')}  Libra`);
    console.log(`   ${venus('♉ Tau')}  Taurus       ${pluto('♏ Sco')}  Scorpio`);
    console.log(`   ${mercury('♊ Gem')}  Gemini       ${jupiter('♐ Sag')}  Sagittarius`);
    console.log(`   ${moon('♋ Can')}  Cancer       ${saturn('♑ Cap')}  Capricorn`);
    console.log(`   ${sun('♌ Leo')}  Leo          ${uranus('♒ Aqu')}  Aquarius`);
    console.log(`   ${mercury('♍ Vir')}  Virgo        ${neptune('♓ Pis')}  Pisces`);
    console.log('');
    
    // Planets (Sephirotic colors)
    console.log(chalk.bold.cyan('── PLANETS ──'));
    console.log(`   ${sun('☉ SUN')}  Sun ${chalk.dim('Tiphareth')}     ${saturn('♄ SAT')}  Saturn ${chalk.dim('Binah')}`);
    console.log(`   ${moon('☽ MOO')}  Moon ${chalk.dim('Yesod')}       ${uranus('♅ URA')}  Uranus ${chalk.dim('Chokmah')}`);
    console.log(`   ${mercury('☿ MER')}  Mercury ${chalk.dim('Hod')}     ${neptune('♆ NEP')}  Neptune`);
    console.log(`   ${venus('♀ VEN')}  Venus ${chalk.dim('Netzach')}    ${pluto('♇ PLU')}  Pluto`);
    console.log(`   ${mars('♂ MAR')}  Mars ${chalk.dim('Geburah')}`);
    console.log(`   ${jupiter('♃ JUP')}  Jupiter ${chalk.dim('Chesed')}`);
    console.log('');
    
    // Points
    console.log(chalk.bold.cyan('── POINTS ──'));
    console.log(`   ${chiron('⚷ CHI')}  Chiron       ${chalk.dim('Wounded healer')}`);
    console.log(`   ${lilith('⚸ LIL')}  Lilith       ${chalk.dim('Black Moon, primal shadow')}`);
    console.log(`   ${northNode('☊ NN')}   North Node   ${chalk.dim('Karmic direction')}`);
    console.log(`   ${southNode('☋ SN')}   South Node   ${chalk.dim('Karmic past')}`);
    console.log('');
    
    // Angles
    console.log(chalk.bold.cyan('── ANGLES ──'));
    console.log(`   ${chalk.white('ASC')}    Ascendant    ${chalk.dim('Rising sign (1H cusp)')}`);
    console.log(`   ${saturn('IC')}     Imum Coeli   ${chalk.dim('Roots, foundation (4H cusp)')}`);
    console.log(`   ${chalk.white('DSC')}    Descendant   ${chalk.dim('Partnerships (7H cusp)')}`);
    console.log(`   ${sun('MC')}     Medium Coeli ${chalk.dim('Public self (10H cusp)')}`);
    console.log('');
    
    // Aspects (Sephirotic colors)
    console.log(chalk.bold.cyan('── ASPECTS ──'));
    console.log(`   ${sun('☌ CNJ')}  Conjunction   0°   ${chalk.dim('Union, fusion')} ${chalk.dim('(Tiphareth/☉)')}`);
    console.log(`   ${moon('☍ OPP')}  Opposition  180°   ${chalk.dim('Polarity, awareness')} ${chalk.dim('(Yesod/☽)')}`);
    console.log(`   ${jupiter('△ TRI')}  Trine       120°   ${chalk.dim('Grace, flow')} ${chalk.dim('(Chesed/♃)')}`);
    console.log(`   ${mars('□ SQR')}  Square       90°   ${chalk.dim('Challenge, growth')} ${chalk.dim('(Geburah/♂)')}`);
    console.log(`   ${venus('⚹ SXT')}  Sextile      60°   ${chalk.dim('Opportunity')} ${chalk.dim('(Netzach/♀)')}`);
    console.log(`   ${mercury('⍟ QNT')}  Quintile     72°   ${chalk.dim('Genius, creativity')} ${chalk.dim('(Hod/☿)')}`);
    console.log(`   ${uranus('⚻ QCX')}  Quincunx    150°   ${chalk.dim('Adjustment, tension')}`);
    console.log('');
    
    // Elements
    console.log(chalk.bold.cyan('── ELEMENTS ──'));
    console.log(`   ${mars('🜂 Fire')}    ${mars('Ari, Leo, Sag')}     ${chalk.dim('Spirit, will, action')}`);
    console.log(`   ${venus('🜃 Earth')}   ${venus('Tau, Vir, Cap')}     ${chalk.dim('Matter, form, stability')}`);
    console.log(`   ${mercury('🜁 Air')}     ${mercury('Gem, Lib, Aqu')}     ${chalk.dim('Mind, communication')}`);
    console.log(`   ${jupiter('🜄 Water')}   ${moon('Can, Sco, Pis')}     ${chalk.dim('Emotion, intuition')}`);
    console.log('');
    
    // Modalities
    console.log(chalk.bold.cyan('── MODALITIES ──'));
    console.log(`   ${chalk.bold('Cardinal')}   Initiating    ${mars('Ari')}, ${moon('Can')}, ${venus('Lib')}, ${saturn('Cap')}`);
    console.log(`   ${chalk.bold('Fixed')}      Stabilizing   ${venus('Tau')}, ${sun('Leo')}, ${pluto('Sco')}, ${uranus('Aqu')}`);
    console.log(`   ${chalk.bold('Mutable')}    Adapting      ${mercury('Gem')}, ${mercury('Vir')}, ${jupiter('Sag')}, ${neptune('Pis')}`);
    console.log('');
    
    // Other symbols
    console.log(chalk.bold.cyan('── OTHER ──'));
    console.log(`   ${mars('℞')}  Retrograde    ${chalk.dim('Planet appears to move backward')}`);
    console.log(`   H  House         ${chalk.dim('e.g., 4H = Fourth House')}`);
    console.log(`   →  Flow          ${chalk.dim('e.g., 2H→4H (transit H → natal H)')}`);
    console.log('');
  });

// Banner
console.log(chalk.dim(''));
console.log(chalk.yellow('  𓅝') + chalk.dim(' thoth-cli'));
console.log(chalk.dim(''));

program.parse();
