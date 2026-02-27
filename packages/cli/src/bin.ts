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

// Key command - symbol reference
program
  .command('key')
  .description('Symbol reference guide')
  .action(() => {
    console.log(chalk.bold.white('\n𓅝 THOTH KEY — Symbol Reference\n'));
    
    // Zodiac Signs
    console.log(chalk.bold.cyan('── ZODIAC SIGNS ──'));
    console.log('   ♈ Ari  Aries        ♎ Lib  Libra');
    console.log('   ♉ Tau  Taurus       ♏ Sco  Scorpio');
    console.log('   ♊ Gem  Gemini       ♐ Sag  Sagittarius');
    console.log('   ♋ Can  Cancer       ♑ Cap  Capricorn');
    console.log('   ♌ Leo  Leo          ♒ Aqu  Aquarius');
    console.log('   ♍ Vir  Virgo        ♓ Pis  Pisces');
    console.log('');
    
    // Planets
    console.log(chalk.bold.cyan('── PLANETS ──'));
    console.log('   ☉ SUN  Sun          ♄ SAT  Saturn');
    console.log('   ☽ MOO  Moon         ♅ URA  Uranus');
    console.log('   ☿ MER  Mercury      ♆ NEP  Neptune');
    console.log('   ♀ VEN  Venus        ♇ PLU  Pluto');
    console.log('   ♂ MAR  Mars');
    console.log('   ♃ JUP  Jupiter');
    console.log('');
    
    // Points
    console.log(chalk.bold.cyan('── POINTS ──'));
    console.log('   ⚷ CHI  Chiron       Wounded healer');
    console.log('   ⚸ LIL  Lilith       Black Moon (primal/hidden)');
    console.log('   ☊ NN   North Node   Karmic direction');
    console.log('   ☋ SN   South Node   Karmic past');
    console.log('');
    
    // Angles
    console.log(chalk.bold.cyan('── ANGLES ──'));
    console.log('   ASC    Ascendant    Rising sign (1H cusp)');
    console.log('   IC     Imum Coeli   Roots, foundation (4H cusp)');
    console.log('   DSC    Descendant   Partnerships (7H cusp)');
    console.log('   MC     Medium Coeli Public self, career (10H cusp)');
    console.log('');
    
    // Aspects with Hermetic colors
    console.log(chalk.bold.cyan('── ASPECTS ──'));
    console.log(`   ${chalk.yellow('☌ CNJ')}  Conjunction   0°   Union, fusion ${chalk.dim('(Tiphareth/☉)')}`);
    console.log(`   ${chalk.magenta('☍ OPP')}  Opposition  180°   Polarity, awareness ${chalk.dim('(Yesod/☽)')}`);
    console.log(`   ${chalk.blue('△ TRI')}  Trine       120°   Grace, flow ${chalk.dim('(Chesed/♃)')}`);
    console.log(`   ${chalk.red('□ SQR')}  Square       90°   Challenge, growth ${chalk.dim('(Geburah/♂)')}`);
    console.log(`   ${chalk.green('⚹ SXT')}  Sextile      60°   Opportunity ${chalk.dim('(Netzach/♀)')}`);
    console.log(`   ${chalk.hex('#FF8C00')('⍟ QNT')}  Quintile     72°   Genius, creativity ${chalk.dim('(Hod/☿)')}`);
    console.log(`   ${chalk.cyan('⚻ QCX')}  Quincunx    150°   Adjustment, tension`);
    console.log('');
    
    // Elements
    console.log(chalk.bold.cyan('── ELEMENTS ──'));
    console.log(`   ${chalk.red('🜂 Fire')}    Aries, Leo, Sagittarius      ${chalk.dim('Spirit, will, action')}`);
    console.log(`   ${chalk.green('🜃 Earth')}   Taurus, Virgo, Capricorn     ${chalk.dim('Matter, form, stability')}`);
    console.log(`   ${chalk.cyan('🜁 Air')}     Gemini, Libra, Aquarius      ${chalk.dim('Mind, communication')}`);
    console.log(`   ${chalk.blue('🜄 Water')}   Cancer, Scorpio, Pisces      ${chalk.dim('Emotion, intuition')}`);
    console.log('');
    
    // Modalities
    console.log(chalk.bold.cyan('── MODALITIES ──'));
    console.log('   Cardinal   Initiating    Ari, Can, Lib, Cap');
    console.log('   Fixed      Stabilizing   Tau, Leo, Sco, Aqu');
    console.log('   Mutable    Adapting      Gem, Vir, Sag, Pis');
    console.log('');
    
    // Other symbols
    console.log(chalk.bold.cyan('── OTHER ──'));
    console.log(`   ${chalk.red('℞')}  Retrograde    Planet appears to move backward`);
    console.log('   H  House         e.g., 4H = Fourth House');
    console.log('   →  Flow          e.g., 2H→4H (transit H → natal H)');
    console.log('');
  });

// Banner
console.log(chalk.dim(''));
console.log(chalk.yellow('  𓅝') + chalk.dim(' thoth-cli'));
console.log(chalk.dim(''));

program.parse();
