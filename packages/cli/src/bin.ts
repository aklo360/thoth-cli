#!/usr/bin/env node
/**
 * Thoth CLI - Entry Point
 * 𓅝
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { writeFileSync } from 'fs';
import { 
  chart, transit, moon, ephemeris, version,
  solarReturn, lunarReturn, synastry, progressions, ephemerisRange,
  composite, solarArc, horary, score, moonExtended, transitScan, ephemerisMulti,
  tarotDraw, tarotCard, tarotDeck, tarotSpreads
} from './lib/core.js';
import {
  formatChart, formatTransits, formatMoon, formatEphemeris,
  formatSolarReturn, formatLunarReturn, formatSynastry,
  formatProgressions, formatEphemerisRange,
  formatComposite, formatSolarArc, formatHorary,
  formatScore, formatMoonExtended, formatTransitScan, formatEphemerisMulti,
  formatTarotDraw, formatTarotCard, formatTarotDeck, formatTarotSpreads,
  formatGematria, formatGematriaCompare, formatGematriaLookup,
  formatNumerology, formatNumerologyYear,
} from './lib/format.js';
import { calculateGematria, compareGematria, lookupGematria } from './lib/gematria.js';
import { calculateNumerology, calculatePersonalCycle } from './lib/numerology.js';
import { isError } from './types.js';

const program = new Command();

program
  .name('thoth')
  .description(`𓅝 Astrological calculations from the command line

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NATAL CHARTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  thoth chart --date 1991-07-08 --time 14:06 --city "New York"
  thoth chart --date 1991-07-08 --time 14:06 --lat 40.7128 --lng -74.0060
  thoth chart --date 1991-07-08 --time 14:06 --city "New York" --svg-file chart.svg

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRANSITS (current planets → natal)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  thoth transit --natal-date 1991-07-08 --natal-time 14:06 --city "New York"
  thoth transit --natal-date 1991-07-08 --natal-time 14:06 --city "NYC" --orb 1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RETURNS (Solar & Lunar)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  thoth solar-return --natal-date 1991-07-08 --natal-time 14:06 --city "NYC" --year 2026
  thoth lunar-return --natal-date 1991-07-08 --natal-time 14:06 --city "NYC"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RELATIONSHIP (Synastry & Composite)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  thoth synastry --date1 1991-07-08 --time1 14:06 --city1 "NYC" \\
                 --date2 1990-03-15 --time2 09:30 --city2 "LA"
  thoth composite --date1 1991-07-08 --time1 14:06 --city1 "NYC" \\
                  --date2 1990-03-15 --time2 09:30 --city2 "LA"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROGRESSIONS & DIRECTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  thoth progressions --natal-date 1991-07-08 --natal-time 14:06 --city "NYC" \\
                     --target-date 2026-03-01
  thoth solar-arc --natal-date 1991-07-08 --natal-time 14:06 --city "NYC" \\
                  --target-date 2026-03-01

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HORARY (question-based divination)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  thoth horary --question "Should I take the job?" --city "New York"
  thoth horary --question "Will we reconcile?" --lat 40.7128 --lng -74.0060

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EPHEMERIS & MOON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  thoth moon                                          # current moon phase
  thoth ephemeris --body pluto                        # where is pluto now?
  thoth ephemeris --body saturn --date 2027-01-15    # saturn on specific date
  thoth ephemeris-range --body pluto --from 2024-01-01 --to 2030-01-01 --step month

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GEMATRIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  thoth gematria "AKLO"                               # all systems
  thoth gematria "אהבה"                                # Hebrew text
  thoth gematria "Love" --compare "Will"              # compare two words
  thoth gematria-lookup 93                             # find words matching number

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NUMEROLOGY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  thoth numerology --name "John Doe" --date 1991-07-08 # full profile
  thoth numerology-year --date 1991-07-08              # personal year cycles

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  thoth key                                           # full symbol reference`)
  .version('0.2.21');

// Chart command
program
  .command('chart')
  .description('Calculate a natal chart')
  .requiredOption('--date <date>', 'Birth date (YYYY-MM-DD)')
  .requiredOption('--time <time>', 'Birth time (HH:MM)')
  .option('--lat <lat>', 'Latitude', parseFloat)
  .option('--lng <lng>', 'Longitude', parseFloat)
  .option('--city <city>', 'City name')
  .option('--nation <nation>', 'Country code', 'US')
  .option('--name <name>', 'Name', 'Subject')
  .option('--json', 'Output raw JSON')
  .option('--svg', 'Output SVG chart')
  .option('--svg-file <path>', 'Save SVG to file')
  .action(async (options) => {
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
      svg: options.svg || options.svgFile,
    });
    
    spinner.stop();
    
    if (isError(result)) {
      console.error(chalk.red(`Error: ${result.error}`));
      process.exit(1);
    }
    
    if (result.svg && options.svgFile) {
      writeFileSync(options.svgFile, result.svg);
      console.log(chalk.green(`✓ SVG saved to ${options.svgFile}`));
    } else if (options.json || result.svg) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatChart(result));
    }
  });

// Transit command
program
  .command('transit')
  .description('Calculate transits to a natal chart')
  .requiredOption('--natal-date <date>', 'Natal date (YYYY-MM-DD)')
  .requiredOption('--natal-time <time>', 'Natal time (HH:MM)')
  .option('--lat <lat>', 'Latitude', parseFloat)
  .option('--lng <lng>', 'Longitude', parseFloat)
  .option('--city <city>', 'City name')
  .option('--nation <nation>', 'Country code', 'US')
  .option('--transit-date <date>', 'Transit date (default: today)')
  .option('--orb <degrees>', 'Orb in degrees', parseFloat, 3)
  .option('--json', 'Output raw JSON')
  .option('--svg', 'Output SVG bi-wheel')
  .option('--svg-file <path>', 'Save SVG to file')
  .action(async (options) => {
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
      svg: options.svg || options.svgFile,
    });
    
    spinner.stop();
    
    if (isError(result)) {
      console.error(chalk.red(`Error: ${result.error}`));
      process.exit(1);
    }
    
    if (result.svg && options.svgFile) {
      writeFileSync(options.svgFile, result.svg);
      console.log(chalk.green(`✓ SVG saved to ${options.svgFile}`));
    } else if (options.json || result.svg) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatTransits(result));
    }
  });

// Solar Return command
program
  .command('solar-return')
  .description('Calculate solar return chart for a year')
  .requiredOption('--natal-date <date>', 'Natal date (YYYY-MM-DD)')
  .requiredOption('--natal-time <time>', 'Natal time (HH:MM)')
  .requiredOption('--year <year>', 'Return year', parseInt)
  .option('--city <city>', 'Natal city')
  .option('--nation <nation>', 'Country code', 'US')
  .option('--lat <lat>', 'Latitude', parseFloat)
  .option('--lng <lng>', 'Longitude', parseFloat)
  .option('--return-city <city>', 'Location for return (default: natal)')
  .option('--json', 'Output raw JSON')
  .option('--svg', 'Output SVG chart')
  .option('--svg-file <path>', 'Save SVG to file')
  .action(async (options) => {
    if (!options.city && (!options.lat || !options.lng)) {
      console.error(chalk.red('Error: Must provide either --city or both --lat and --lng'));
      process.exit(1);
    }
    
    const spinner = ora(`Calculating ${options.year} solar return...`).start();
    
    const [natalYear, natalMonth, natalDay] = options.natalDate.split('-').map(Number);
    const [natalHour, natalMinute] = options.natalTime.split(':').map(Number);
    
    const result = await solarReturn({
      natalYear, natalMonth, natalDay, natalHour, natalMinute,
      natalLat: options.lat,
      natalLng: options.lng,
      natalCity: options.city,
      nation: options.nation,
      returnYear: options.year,
      returnCity: options.returnCity,
      svg: options.svg || options.svgFile,
    });
    
    spinner.stop();
    
    if (isError(result)) {
      console.error(chalk.red(`Error: ${result.error}`));
      process.exit(1);
    }
    
    if (result.svg && options.svgFile) {
      writeFileSync(options.svgFile, result.svg);
      console.log(chalk.green(`✓ SVG saved to ${options.svgFile}`));
    } else if (options.json || result.svg) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatSolarReturn(result));
    }
  });

// Lunar Return command
program
  .command('lunar-return')
  .description('Calculate next lunar return from a date')
  .requiredOption('--natal-date <date>', 'Natal date (YYYY-MM-DD)')
  .requiredOption('--natal-time <time>', 'Natal time (HH:MM)')
  .requiredOption('--from <date>', 'Search from date (YYYY-MM-DD)')
  .option('--city <city>', 'Natal city')
  .option('--nation <nation>', 'Country code', 'US')
  .option('--lat <lat>', 'Latitude', parseFloat)
  .option('--lng <lng>', 'Longitude', parseFloat)
  .option('--return-city <city>', 'Location for return')
  .option('--json', 'Output raw JSON')
  .option('--svg', 'Output SVG chart')
  .option('--svg-file <path>', 'Save SVG to file')
  .action(async (options) => {
    if (!options.city && (!options.lat || !options.lng)) {
      console.error(chalk.red('Error: Must provide either --city or both --lat and --lng'));
      process.exit(1);
    }
    
    const spinner = ora('Calculating lunar return...').start();
    
    const [natalYear, natalMonth, natalDay] = options.natalDate.split('-').map(Number);
    const [natalHour, natalMinute] = options.natalTime.split(':').map(Number);
    const [fromYear, fromMonth, fromDay] = options.from.split('-').map(Number);
    
    const result = await lunarReturn({
      natalYear, natalMonth, natalDay, natalHour, natalMinute,
      natalLat: options.lat,
      natalLng: options.lng,
      natalCity: options.city,
      nation: options.nation,
      fromYear, fromMonth, fromDay,
      returnCity: options.returnCity,
      svg: options.svg || options.svgFile,
    });
    
    spinner.stop();
    
    if (isError(result)) {
      console.error(chalk.red(`Error: ${result.error}`));
      process.exit(1);
    }
    
    if (result.svg && options.svgFile) {
      writeFileSync(options.svgFile, result.svg);
      console.log(chalk.green(`✓ SVG saved to ${options.svgFile}`));
    } else if (options.json || result.svg) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatLunarReturn(result));
    }
  });

// Synastry command
program
  .command('synastry')
  .description('Calculate synastry between two charts')
  .requiredOption('--date1 <date>', 'Person 1 birth date (YYYY-MM-DD)')
  .requiredOption('--time1 <time>', 'Person 1 birth time (HH:MM)')
  .requiredOption('--date2 <date>', 'Person 2 birth date (YYYY-MM-DD)')
  .requiredOption('--time2 <time>', 'Person 2 birth time (HH:MM)')
  .option('--city1 <city>', 'Person 1 city')
  .option('--nation1 <nation>', 'Person 1 country', 'US')
  .option('--lat1 <lat>', 'Person 1 latitude', parseFloat)
  .option('--lng1 <lng>', 'Person 1 longitude', parseFloat)
  .option('--name1 <name>', 'Person 1 name', 'Person 1')
  .option('--city2 <city>', 'Person 2 city')
  .option('--nation2 <nation>', 'Person 2 country', 'US')
  .option('--lat2 <lat>', 'Person 2 latitude', parseFloat)
  .option('--lng2 <lng>', 'Person 2 longitude', parseFloat)
  .option('--name2 <name>', 'Person 2 name', 'Person 2')
  .option('--orb <degrees>', 'Orb in degrees', parseFloat, 6)
  .option('--json', 'Output raw JSON')
  .option('--svg', 'Output SVG bi-wheel')
  .option('--svg-file <path>', 'Save SVG to file')
  .action(async (options) => {
    if (!options.city1 && (!options.lat1 || !options.lng1)) {
      console.error(chalk.red('Error: Must provide either --city1 or both --lat1 and --lng1'));
      process.exit(1);
    }
    if (!options.city2 && (!options.lat2 || !options.lng2)) {
      console.error(chalk.red('Error: Must provide either --city2 or both --lat2 and --lng2'));
      process.exit(1);
    }
    
    const spinner = ora('Calculating synastry...').start();
    
    const [year1, month1, day1] = options.date1.split('-').map(Number);
    const [hour1, minute1] = options.time1.split(':').map(Number);
    const [year2, month2, day2] = options.date2.split('-').map(Number);
    const [hour2, minute2] = options.time2.split(':').map(Number);
    
    const result = await synastry({
      year1, month1, day1, hour1, minute1,
      lat1: options.lat1, lng1: options.lng1,
      city1: options.city1, nation1: options.nation1,
      name1: options.name1,
      year2, month2, day2, hour2, minute2,
      lat2: options.lat2, lng2: options.lng2,
      city2: options.city2, nation2: options.nation2,
      name2: options.name2,
      orb: options.orb,
      svg: options.svg || options.svgFile,
    });
    
    spinner.stop();
    
    if (isError(result)) {
      console.error(chalk.red(`Error: ${result.error}`));
      process.exit(1);
    }
    
    if (result.svg && options.svgFile) {
      writeFileSync(options.svgFile, result.svg);
      console.log(chalk.green(`✓ SVG saved to ${options.svgFile}`));
    } else if (options.json || result.svg) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatSynastry(result));
    }
  });

// Composite command
program
  .command('composite')
  .description('Calculate composite (midpoint) chart for a relationship')
  .requiredOption('--date1 <date>', 'Person 1 birth date (YYYY-MM-DD)')
  .requiredOption('--time1 <time>', 'Person 1 birth time (HH:MM)')
  .requiredOption('--date2 <date>', 'Person 2 birth date (YYYY-MM-DD)')
  .requiredOption('--time2 <time>', 'Person 2 birth time (HH:MM)')
  .option('--city1 <city>', 'Person 1 city')
  .option('--nation1 <nation>', 'Person 1 country', 'US')
  .option('--lat1 <lat>', 'Person 1 latitude', parseFloat)
  .option('--lng1 <lng>', 'Person 1 longitude', parseFloat)
  .option('--name1 <name>', 'Person 1 name', 'Person 1')
  .option('--city2 <city>', 'Person 2 city')
  .option('--nation2 <nation>', 'Person 2 country', 'US')
  .option('--lat2 <lat>', 'Person 2 latitude', parseFloat)
  .option('--lng2 <lng>', 'Person 2 longitude', parseFloat)
  .option('--name2 <name>', 'Person 2 name', 'Person 2')
  .option('--json', 'Output raw JSON')
  .option('--svg', 'Output SVG chart')
  .option('--svg-file <path>', 'Save SVG to file')
  .action(async (options) => {
    if (!options.city1 && (!options.lat1 || !options.lng1)) {
      console.error(chalk.red('Error: Must provide either --city1 or both --lat1 and --lng1'));
      process.exit(1);
    }
    if (!options.city2 && (!options.lat2 || !options.lng2)) {
      console.error(chalk.red('Error: Must provide either --city2 or both --lat2 and --lng2'));
      process.exit(1);
    }
    
    const spinner = ora('Calculating composite chart...').start();
    
    const [year1, month1, day1] = options.date1.split('-').map(Number);
    const [hour1, minute1] = options.time1.split(':').map(Number);
    const [year2, month2, day2] = options.date2.split('-').map(Number);
    const [hour2, minute2] = options.time2.split(':').map(Number);
    
    const result = await composite({
      year1, month1, day1, hour1, minute1,
      lat1: options.lat1, lng1: options.lng1,
      city1: options.city1, nation1: options.nation1,
      name1: options.name1,
      year2, month2, day2, hour2, minute2,
      lat2: options.lat2, lng2: options.lng2,
      city2: options.city2, nation2: options.nation2,
      name2: options.name2,
      svg: options.svg || options.svgFile,
    });
    
    spinner.stop();
    
    if (isError(result)) {
      console.error(chalk.red(`Error: ${result.error}`));
      process.exit(1);
    }
    
    if (result.svg && options.svgFile) {
      writeFileSync(options.svgFile, result.svg);
      console.log(chalk.green(`✓ SVG saved to ${options.svgFile}`));
    } else if (options.json || result.svg) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatComposite(result));
    }
  });

// Solar Arc command
program
  .command('solar-arc')
  .description('Calculate solar arc directions (all planets move by Sun\'s arc)')
  .requiredOption('--natal-date <date>', 'Natal date (YYYY-MM-DD)')
  .requiredOption('--natal-time <time>', 'Natal time (HH:MM)')
  .requiredOption('--target-date <date>', 'Target date for directions (YYYY-MM-DD)')
  .option('--city <city>', 'Natal city')
  .option('--nation <nation>', 'Country code', 'US')
  .option('--lat <lat>', 'Latitude', parseFloat)
  .option('--lng <lng>', 'Longitude', parseFloat)
  .option('--json', 'Output raw JSON')
  .action(async (options) => {
    if (!options.city && (!options.lat || !options.lng)) {
      console.error(chalk.red('Error: Must provide either --city or both --lat and --lng'));
      process.exit(1);
    }
    
    const spinner = ora('Calculating solar arc directions...').start();
    
    const [natalYear, natalMonth, natalDay] = options.natalDate.split('-').map(Number);
    const [natalHour, natalMinute] = options.natalTime.split(':').map(Number);
    const [targetYear, targetMonth, targetDay] = options.targetDate.split('-').map(Number);
    
    const result = await solarArc({
      natalYear, natalMonth, natalDay, natalHour, natalMinute,
      natalLat: options.lat,
      natalLng: options.lng,
      natalCity: options.city,
      nation: options.nation,
      targetYear, targetMonth, targetDay,
    });
    
    spinner.stop();
    
    if (isError(result)) {
      console.error(chalk.red(`Error: ${result.error}`));
      process.exit(1);
    }
    
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatSolarArc(result));
    }
  });

// Progressions command
program
  .command('progressions')
  .description('Calculate secondary progressions (day-for-a-year)')
  .requiredOption('--natal-date <date>', 'Natal date (YYYY-MM-DD)')
  .requiredOption('--natal-time <time>', 'Natal time (HH:MM)')
  .requiredOption('--target-date <date>', 'Target date for progressions (YYYY-MM-DD)')
  .option('--city <city>', 'Natal city')
  .option('--nation <nation>', 'Country code', 'US')
  .option('--lat <lat>', 'Latitude', parseFloat)
  .option('--lng <lng>', 'Longitude', parseFloat)
  .option('--json', 'Output raw JSON')
  .option('--svg', 'Output SVG chart')
  .option('--svg-file <path>', 'Save SVG to file')
  .action(async (options) => {
    if (!options.city && (!options.lat || !options.lng)) {
      console.error(chalk.red('Error: Must provide either --city or both --lat and --lng'));
      process.exit(1);
    }
    
    const spinner = ora('Calculating progressions...').start();
    
    const [natalYear, natalMonth, natalDay] = options.natalDate.split('-').map(Number);
    const [natalHour, natalMinute] = options.natalTime.split(':').map(Number);
    const [targetYear, targetMonth, targetDay] = options.targetDate.split('-').map(Number);
    
    const result = await progressions({
      natalYear, natalMonth, natalDay, natalHour, natalMinute,
      natalLat: options.lat,
      natalLng: options.lng,
      natalCity: options.city,
      nation: options.nation,
      targetYear, targetMonth, targetDay,
      svg: options.svg || options.svgFile,
    });
    
    spinner.stop();
    
    if (isError(result)) {
      console.error(chalk.red(`Error: ${result.error}`));
      process.exit(1);
    }
    
    if (result.svg && options.svgFile) {
      writeFileSync(options.svgFile, result.svg);
      console.log(chalk.green(`✓ SVG saved to ${options.svgFile}`));
    } else if (options.json || result.svg) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatProgressions(result));
    }
  });

// Ephemeris Range command
program
  .command('ephemeris-range')
  .description('Get ephemeris positions over a date range')
  .requiredOption('--body <body>', 'Celestial body (sun, moon, mars, etc.)')
  .requiredOption('--from <date>', 'Start date (YYYY-MM-DD)')
  .requiredOption('--to <date>', 'End date (YYYY-MM-DD)')
  .option('--step <step>', 'Step: day, week, month', 'month')
  .option('--json', 'Output raw JSON')
  .action(async (options) => {
    const spinner = ora(`Getting ${options.body} positions...`).start();
    
    const [startYear, startMonth, startDay] = options.from.split('-').map(Number);
    const [endYear, endMonth, endDay] = options.to.split('-').map(Number);
    
    const result = await ephemerisRange({
      body: options.body,
      startYear, startMonth, startDay,
      endYear, endMonth, endDay,
      step: options.step as 'day' | 'week' | 'month',
    });
    
    spinner.stop();
    
    if (isError(result)) {
      console.error(chalk.red(`Error: ${result.error}`));
      process.exit(1);
    }
    
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatEphemerisRange(result));
    }
  });

// Horary command
program
  .command('horary')
  .description('Cast a horary chart for divination (like tarot for astrology)')
  .requiredOption('--question <question>', 'The question being asked')
  .option('--date <date>', 'Date (YYYY-MM-DD, default: now)')
  .option('--time <time>', 'Time (HH:MM, default: now)')
  .option('--city <city>', 'City where question is asked')
  .option('--nation <nation>', 'Country code', 'US')
  .option('--lat <lat>', 'Latitude', parseFloat)
  .option('--lng <lng>', 'Longitude', parseFloat)
  .option('--json', 'Output raw JSON')
  .action(async (options) => {
    const spinner = ora('Casting horary chart...').start();
    
    let year, month, day, hour, minute;
    if (options.date) {
      [year, month, day] = options.date.split('-').map(Number);
    }
    if (options.time) {
      [hour, minute] = options.time.split(':').map(Number);
    }
    
    const result = await horary({
      question: options.question,
      year, month, day, hour, minute,
      lat: options.lat,
      lng: options.lng,
      city: options.city,
      nation: options.nation,
    });
    
    spinner.stop();
    
    if (isError(result)) {
      console.error(chalk.red(`Error: ${result.error}`));
      process.exit(1);
    }
    
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatHorary(result));
    }
  });

// Moon command
program
  .command('moon')
  .description('Get moon phase and position')
  .option('--date <date>', 'Date (YYYY-MM-DD, default: today)')
  .option('--lat <lat>', 'Latitude', parseFloat, 40.7128)
  .option('--lng <lng>', 'Longitude', parseFloat, -74.0060)
  .option('--tz <tz>', 'Timezone (for --extended)', 'America/New_York')
  .option('-e, --extended', 'Show eclipses, sunrise/sunset, upcoming phases')
  .option('--json', 'Output raw JSON')
  .action(async (options) => {
    let year, month, day;
    if (options.date) {
      [year, month, day] = options.date.split('-').map(Number);
    }
    
    if (options.extended) {
      const spinner = ora('Getting moon details...').start();
      const result = await moonExtended({
        year, month, day,
        lat: options.lat, lng: options.lng, tz: options.tz,
      });
      spinner.stop();
      
      if (isError(result)) {
        console.error(chalk.red(`Error: ${result.error}`));
        process.exit(1);
      }
      
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(formatMoonExtended(result));
      }
      return;
    }
    
    const spinner = ora('Getting moon phase...').start();
    const result = await moon({
      year, month, day,
      lat: options.lat, lng: options.lng,
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

// Key command - comprehensive symbol reference with Kabbalistic colors
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
    
    console.log(chalk.bold.white('\n𓅝 THOTH KEY — Complete Reference\n'));
    
    // ═══════════════════════════════════════════════════════════════
    // PLANETS
    // ═══════════════════════════════════════════════════════════════
    console.log(chalk.bold.cyan('══ PLANETS ══'));
    console.log(`   ${sun('☉ Sun')}       Identity, vitality, ego, life force`);
    console.log(`               ${chalk.dim('Rules:')} ${sun('Leo')}  ${chalk.dim('Sephira:')} Tiphareth`);
    console.log(`   ${moon('☽ Moon')}      Emotions, instincts, the unconscious, mother`);
    console.log(`               ${chalk.dim('Rules:')} ${moon('Cancer')}  ${chalk.dim('Sephira:')} Yesod`);
    console.log(`   ${mercury('☿ Mercury')}   Mind, communication, learning, commerce`);
    console.log(`               ${chalk.dim('Rules:')} ${mercury('Gemini, Virgo')}  ${chalk.dim('Sephira:')} Hod`);
    console.log(`   ${venus('♀ Venus')}     Love, beauty, values, attraction, harmony`);
    console.log(`               ${chalk.dim('Rules:')} ${venus('Taurus, Libra')}  ${chalk.dim('Sephira:')} Netzach`);
    console.log(`   ${mars('♂ Mars')}      Action, desire, aggression, courage, drive`);
    console.log(`               ${chalk.dim('Rules:')} ${mars('Aries')}  ${chalk.dim('Sephira:')} Geburah`);
    console.log(`   ${jupiter('♃ Jupiter')}   Expansion, luck, wisdom, abundance, faith`);
    console.log(`               ${chalk.dim('Rules:')} ${jupiter('Sagittarius')}  ${chalk.dim('Sephira:')} Chesed`);
    console.log(`   ${saturn('♄ Saturn')}    Structure, limits, time, karma, discipline`);
    console.log(`               ${chalk.dim('Rules:')} ${saturn('Capricorn')}  ${chalk.dim('Sephira:')} Binah`);
    console.log(`   ${uranus('♅ Uranus')}    Revolution, awakening, innovation, freedom`);
    console.log(`               ${chalk.dim('Rules:')} ${uranus('Aquarius')}  ${chalk.dim('Sephira:')} Chokmah`);
    console.log(`   ${neptune('♆ Neptune')}   Dreams, illusion, spirituality, dissolution`);
    console.log(`               ${chalk.dim('Rules:')} ${neptune('Pisces')}`);
    console.log(`   ${pluto('♇ Pluto')}     Transformation, death/rebirth, power, shadow`);
    console.log(`               ${chalk.dim('Rules:')} ${pluto('Scorpio')}`);
    console.log('');
    
    // ═══════════════════════════════════════════════════════════════
    // POINTS
    // ═══════════════════════════════════════════════════════════════
    console.log(chalk.bold.cyan('══ POINTS ══'));
    console.log(`   ${chiron('⚷ Chiron')}      The wounded healer. Core wound & gift of healing.`);
    console.log(`   ${lilith('⚸ Lilith')}      Black Moon. Primal feminine, shadow, rejection.`);
    console.log(`   ${northNode('☊ North Node')}  Soul's direction. Growth edge. Future karma.`);
    console.log(`   ${southNode('☋ South Node')}  Past life gifts. Comfort zone. Past karma.`);
    console.log('');
    
    // ═══════════════════════════════════════════════════════════════
    // ZODIAC SIGNS
    // ═══════════════════════════════════════════════════════════════
    console.log(chalk.bold.cyan('══ ZODIAC SIGNS ══'));
    console.log(`   ${mars('♈ Aries')}        ${chalk.dim('Cardinal Fire')}   Initiative, courage, impatience`);
    console.log(`                    ${chalk.dim('Ruler:')} ${mars('Mars')}  ${chalk.dim('"I AM"')}`);
    console.log(`   ${venus('♉ Taurus')}       ${chalk.dim('Fixed Earth')}     Stability, sensuality, stubborn`);
    console.log(`                    ${chalk.dim('Ruler:')} ${venus('Venus')}  ${chalk.dim('"I HAVE"')}`);
    console.log(`   ${mercury('♊ Gemini')}       ${chalk.dim('Mutable Air')}     Curiosity, duality, scattered`);
    console.log(`                    ${chalk.dim('Ruler:')} ${mercury('Mercury')}  ${chalk.dim('"I THINK"')}`);
    console.log(`   ${moon('♋ Cancer')}       ${chalk.dim('Cardinal Water')}  Nurturing, protective, moody`);
    console.log(`                    ${chalk.dim('Ruler:')} ${moon('Moon')}  ${chalk.dim('"I FEEL"')}`);
    console.log(`   ${sun('♌ Leo')}          ${chalk.dim('Fixed Fire')}      Creative, proud, dramatic`);
    console.log(`                    ${chalk.dim('Ruler:')} ${sun('Sun')}  ${chalk.dim('"I WILL"')}`);
    console.log(`   ${mercury('♍ Virgo')}        ${chalk.dim('Mutable Earth')}   Analytical, service, critical`);
    console.log(`                    ${chalk.dim('Ruler:')} ${mercury('Mercury')}  ${chalk.dim('"I ANALYZE"')}`);
    console.log(`   ${venus('♎ Libra')}        ${chalk.dim('Cardinal Air')}    Balance, partnership, indecisive`);
    console.log(`                    ${chalk.dim('Ruler:')} ${venus('Venus')}  ${chalk.dim('"I BALANCE"')}`);
    console.log(`   ${pluto('♏ Scorpio')}      ${chalk.dim('Fixed Water')}     Intensity, depth, secretive`);
    console.log(`                    ${chalk.dim('Ruler:')} ${pluto('Pluto')}  ${chalk.dim('"I DESIRE"')}`);
    console.log(`   ${jupiter('♐ Sagittarius')}  ${chalk.dim('Mutable Fire')}    Adventure, truth, reckless`);
    console.log(`                    ${chalk.dim('Ruler:')} ${jupiter('Jupiter')}  ${chalk.dim('"I SEE"')}`);
    console.log(`   ${saturn('♑ Capricorn')}    ${chalk.dim('Cardinal Earth')}  Ambition, mastery, cold`);
    console.log(`                    ${chalk.dim('Ruler:')} ${saturn('Saturn')}  ${chalk.dim('"I USE"')}`);
    console.log(`   ${uranus('♒ Aquarius')}     ${chalk.dim('Fixed Air')}       Humanitarian, eccentric, detached`);
    console.log(`                    ${chalk.dim('Ruler:')} ${uranus('Uranus')}  ${chalk.dim('"I KNOW"')}`);
    console.log(`   ${neptune('♓ Pisces')}       ${chalk.dim('Mutable Water')}   Compassion, dreams, escapist`);
    console.log(`                    ${chalk.dim('Ruler:')} ${neptune('Neptune')}  ${chalk.dim('"I BELIEVE"')}`);
    console.log('');
    
    // ═══════════════════════════════════════════════════════════════
    // HOUSES
    // ═══════════════════════════════════════════════════════════════
    console.log(chalk.bold.cyan('══ HOUSES ══'));
    console.log(`   ${chalk.bold('1st House')}   ${mars('Ascendant')}   Self, identity, appearance, first impressions`);
    console.log(`   ${chalk.bold('2nd House')}               Money, possessions, values, self-worth`);
    console.log(`   ${chalk.bold('3rd House')}               Communication, siblings, short travel, learning`);
    console.log(`   ${chalk.bold('4th House')}   ${saturn('IC')}          Home, family, roots, private self, mother`);
    console.log(`   ${chalk.bold('5th House')}               Creativity, romance, children, pleasure, play`);
    console.log(`   ${chalk.bold('6th House')}               Health, work, service, daily routines, pets`);
    console.log(`   ${chalk.bold('7th House')}   ${chalk.white('Descendant')}  Partnerships, marriage, open enemies, others`);
    console.log(`   ${chalk.bold('8th House')}               Death, sex, shared resources, transformation`);
    console.log(`   ${chalk.bold('9th House')}               Philosophy, long travel, higher education, beliefs`);
    console.log(`   ${chalk.bold('10th House')}  ${sun('MC')}          Career, reputation, public self, father`);
    console.log(`   ${chalk.bold('11th House')}              Friends, groups, hopes, wishes, humanity`);
    console.log(`   ${chalk.bold('12th House')}              Unconscious, isolation, secrets, karma, dreams`);
    console.log('');
    
    // ═══════════════════════════════════════════════════════════════
    // ASPECTS
    // ═══════════════════════════════════════════════════════════════
    console.log(chalk.bold.cyan('══ ASPECTS ══'));
    console.log(`   ${sun('☌ Conjunction')}    0°   Fusion, intensification, new cycle`);
    console.log(`                       ${chalk.dim('Sephira: Tiphareth (Sun) — creative union')}`);
    console.log(`   ${moon('☍ Opposition')}   180°   Awareness, tension, projection`);
    console.log(`                       ${chalk.dim('Sephira: Yesod (Moon) — polarity, reflection')}`);
    console.log(`   ${jupiter('△ Trine')}        120°   Harmony, ease, natural talent`);
    console.log(`                       ${chalk.dim('Sephira: Chesed (Jupiter) — grace, flow')}`);
    console.log(`   ${mars('□ Square')}        90°   Friction, challenge, forced growth`);
    console.log(`                       ${chalk.dim('Sephira: Geburah (Mars) — strength through struggle')}`);
    console.log(`   ${venus('⚹ Sextile')}       60°   Opportunity, cooperation, ease`);
    console.log(`                       ${chalk.dim('Sephira: Netzach (Venus) — gentle harmony')}`);
    console.log(`   ${mercury('⍟ Quintile')}      72°   Creativity, talent, genius`);
    console.log(`                       ${chalk.dim('Sephira: Hod (Mercury) — mental brilliance')}`);
    console.log(`   ${uranus('⚻ Quincunx')}     150°   Adjustment, awkwardness, recalibration`);
    console.log('');
    
    // ═══════════════════════════════════════════════════════════════
    // ELEMENTS
    // ═══════════════════════════════════════════════════════════════
    console.log(chalk.bold.cyan('══ ELEMENTS ══'));
    console.log(`   ${mars('🜂 Fire')}     ${mars('Aries, Leo, Sagittarius')}`);
    console.log(`             Spirit, will, action, enthusiasm`);
    console.log(`             ${chalk.dim('Hot & Dry — Choleric — Intuitive function')}`);
    console.log(`   ${venus('🜃 Earth')}    ${venus('Taurus, Virgo, Capricorn')}`);
    console.log(`             Matter, stability, practicality, form`);
    console.log(`             ${chalk.dim('Cold & Dry — Melancholic — Sensation function')}`);
    console.log(`   ${mercury('🜁 Air')}      ${mercury('Gemini, Libra, Aquarius')}`);
    console.log(`             Mind, communication, connection, ideas`);
    console.log(`             ${chalk.dim('Hot & Wet — Sanguine — Thinking function')}`);
    console.log(`   ${jupiter('🜄 Water')}    ${moon('Cancer, Scorpio, Pisces')}`);
    console.log(`             Emotion, intuition, the unconscious, soul`);
    console.log(`             ${chalk.dim('Cold & Wet — Phlegmatic — Feeling function')}`);
    console.log('');
    
    // ═══════════════════════════════════════════════════════════════
    // MODALITIES
    // ═══════════════════════════════════════════════════════════════
    console.log(chalk.bold.cyan('══ MODALITIES ══'));
    console.log(`   ${chalk.bold('Cardinal')}   ${mars('Aries')}, ${moon('Cancer')}, ${venus('Libra')}, ${saturn('Capricorn')}`);
    console.log(`             Initiating, leadership, action`);
    console.log(`             ${chalk.dim('The spark. Begins seasons. "I start."')}`);
    console.log(`   ${chalk.bold('Fixed')}      ${venus('Taurus')}, ${sun('Leo')}, ${pluto('Scorpio')}, ${uranus('Aquarius')}`);
    console.log(`             Stabilizing, persistence, stubborn`);
    console.log(`             ${chalk.dim('The sustainer. Mid-season. "I maintain."')}`);
    console.log(`   ${chalk.bold('Mutable')}    ${mercury('Gemini')}, ${mercury('Virgo')}, ${jupiter('Sagittarius')}, ${neptune('Pisces')}`);
    console.log(`             Adapting, flexible, changeable`);
    console.log(`             ${chalk.dim('The dissolver. End of season. "I change."')}`);
    console.log('');
    
    // ═══════════════════════════════════════════════════════════════
    // OTHER SYMBOLS
    // ═══════════════════════════════════════════════════════════════
    console.log(chalk.bold.cyan('══ OTHER ══'));
    console.log(`   ${mars('℞')}  Retrograde    Planet appears to move backward. Internalized energy.`);
    console.log(`   H  House         Area of life. e.g., 4H = home, roots, private self`);
    console.log(`   →  Flow          Direction. e.g., 2H→4H (transit house → natal house)`);
    console.log('');
    
    // ═══════════════════════════════════════════════════════════════
    // DIGNITIES
    // ═══════════════════════════════════════════════════════════════
    console.log(chalk.bold.cyan('══ DIGNITIES ══'));
    console.log(`   ${chalk.bold('Domicile')}    Planet in sign it rules. Full power. ${chalk.dim('e.g., ♂ in Aries')}`);
    console.log(`   ${chalk.bold('Exaltation')}  Planet in sign of peak expression. ${chalk.dim('e.g., ☉ in Aries')}`);
    console.log(`   ${chalk.bold('Detriment')}   Planet opposite its home. Challenged. ${chalk.dim('e.g., ♂ in Libra')}`);
    console.log(`   ${chalk.bold('Fall')}        Planet opposite exaltation. Weakened. ${chalk.dim('e.g., ☉ in Libra')}`);
    console.log('');
  });

// Score command - relationship compatibility
program
  .command('score')
  .description('Calculate relationship compatibility score')
  .requiredOption('--date1 <date>', 'Person 1 birth date (YYYY-MM-DD)')
  .requiredOption('--time1 <time>', 'Person 1 birth time (HH:MM)')
  .option('--city1 <city>', 'Person 1 city')
  .option('--nation1 <nation>', 'Person 1 country code', 'US')
  .option('--lat1 <lat>', 'Person 1 latitude', parseFloat)
  .option('--lng1 <lng>', 'Person 1 longitude', parseFloat)
  .option('--name1 <name>', 'Person 1 name', 'Person 1')
  .requiredOption('--date2 <date>', 'Person 2 birth date (YYYY-MM-DD)')
  .requiredOption('--time2 <time>', 'Person 2 birth time (HH:MM)')
  .option('--city2 <city>', 'Person 2 city')
  .option('--nation2 <nation>', 'Person 2 country code', 'US')
  .option('--lat2 <lat>', 'Person 2 latitude', parseFloat)
  .option('--lng2 <lng>', 'Person 2 longitude', parseFloat)
  .option('--name2 <name>', 'Person 2 name', 'Person 2')
  .option('--json', 'Output raw JSON')
  .action(async (options) => {
    const [year1, month1, day1] = options.date1.split('-').map(Number);
    const [hour1, minute1] = options.time1.split(':').map(Number);
    const [year2, month2, day2] = options.date2.split('-').map(Number);
    const [hour2, minute2] = options.time2.split(':').map(Number);
    
    const spinner = ora('Calculating compatibility...').start();
    
    const result = await score({
      year1, month1, day1, hour1, minute1,
      city1: options.city1, nation1: options.nation1,
      lat1: options.lat1, lng1: options.lng1, name1: options.name1,
      year2, month2, day2, hour2, minute2,
      city2: options.city2, nation2: options.nation2,
      lat2: options.lat2, lng2: options.lng2, name2: options.name2,
    });
    
    spinner.stop();
    
    if (isError(result)) {
      console.error(chalk.red('Error: ' + result.error));
      process.exit(1);
    }
    
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatScore(result));
    }
  });

// Transit scan command
program
  .command('transit-scan')
  .description('Scan for transit aspects over a date range')
  .requiredOption('--natal-date <date>', 'Natal birth date (YYYY-MM-DD)')
  .requiredOption('--natal-time <time>', 'Natal birth time (HH:MM)')
  .option('--city <city>', 'Natal city')
  .option('--nation <nation>', 'Country code', 'US')
  .option('--lat <lat>', 'Natal latitude', parseFloat)
  .option('--lng <lng>', 'Natal longitude', parseFloat)
  .requiredOption('--from <date>', 'Start date (YYYY-MM-DD)')
  .requiredOption('--to <date>', 'End date (YYYY-MM-DD)')
  .option('--orb <orb>', 'Aspect orb in degrees', parseFloat, 1)
  .option('--step <step>', 'Step: day or week', 'day')
  .option('--json', 'Output raw JSON')
  .action(async (options) => {
    const [natalYear, natalMonth, natalDay] = options.natalDate.split('-').map(Number);
    const [natalHour, natalMinute] = options.natalTime.split(':').map(Number);
    const [startYear, startMonth, startDay] = options.from.split('-').map(Number);
    const [endYear, endMonth, endDay] = options.to.split('-').map(Number);
    
    const spinner = ora('Scanning transits...').start();
    
    const result = await transitScan({
      natalYear, natalMonth, natalDay, natalHour, natalMinute,
      natalCity: options.city, nation: options.nation,
      natalLat: options.lat, natalLng: options.lng,
      startYear, startMonth, startDay,
      endYear, endMonth, endDay,
      orb: options.orb, step: options.step,
    });
    
    spinner.stop();
    
    if (isError(result)) {
      console.error(chalk.red('Error: ' + result.error));
      process.exit(1);
    }
    
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatTransitScan(result));
    }
  });

// Ephemeris multi command
program
  .command('ephemeris-multi')
  .description('Get ephemeris for multiple bodies over a date range')
  .option('--bodies <bodies>', 'Comma-separated bodies', 'sun,moon,mercury,venus,mars,jupiter,saturn')
  .requiredOption('--from <date>', 'Start date (YYYY-MM-DD)')
  .requiredOption('--to <date>', 'End date (YYYY-MM-DD)')
  .option('--step <step>', 'Step: hour, day, week, month', 'day')
  .option('--lat <lat>', 'Latitude', parseFloat)
  .option('--lng <lng>', 'Longitude', parseFloat)
  .option('--json', 'Output raw JSON')
  .action(async (options) => {
    const [startYear, startMonth, startDay] = options.from.split('-').map(Number);
    const [endYear, endMonth, endDay] = options.to.split('-').map(Number);
    
    const spinner = ora('Getting ephemeris data...').start();
    
    const result = await ephemerisMulti({
      bodies: options.bodies,
      startYear, startMonth, startDay,
      endYear, endMonth, endDay,
      step: options.step,
      lat: options.lat, lng: options.lng,
    });
    
    spinner.stop();
    
    if (isError(result)) {
      console.error(chalk.red('Error: ' + result.error));
      process.exit(1);
    }
    
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatEphemerisMulti(result));
    }
  });

// ═══════════════════════════════════════════════════════════════
// TAROT COMMANDS
// ═══════════════════════════════════════════════════════════════

// Tarot draw command
program
  .command('tarot')
  .alias('draw')
  .description('Draw tarot cards (cryptographic randomness)')
  .option('-s, --spread <spread>', 'Spread: single, 3-card, celtic, horseshoe, relationship, decision', 'single')
  .option('-q, --question <question>', 'Question for the reading')
  .option('-n, --count <count>', 'Number of cards (for custom spread)', parseInt)
  .option('--no-reversals', 'Disable reversed cards')
  .option('--json', 'Output raw JSON')
  .action(async (options) => {
    const spinner = ora('Shuffling the deck...').start();
    
    const result = await tarotDraw({
      spread: options.spread,
      question: options.question,
      count: options.count,
      reversals: options.reversals,
    });
    
    spinner.stop();
    
    if (isError(result)) {
      console.error(chalk.red('Error: ' + result.error));
      process.exit(1);
    }
    
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatTarotDraw(result));
    }
  });

// Tarot card lookup
program
  .command('tarot-card <card>')
  .alias('card')
  .description('Look up a tarot card by name or number')
  .option('--json', 'Output raw JSON')
  .action(async (card, options) => {
    const result = await tarotCard(card);
    
    if (isError(result)) {
      console.error(chalk.red('Error: ' + result.error));
      process.exit(1);
    }
    
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatTarotCard(result));
    }
  });

// Tarot deck listing
program
  .command('tarot-deck')
  .alias('deck')
  .description('List tarot cards')
  .option('-f, --filter <filter>', 'Filter: major, minor, wands, cups, swords, pentacles')
  .option('--json', 'Output raw JSON')
  .action(async (options) => {
    const result = await tarotDeck(options.filter);
    
    if (isError(result)) {
      console.error(chalk.red('Error: ' + result.error));
      process.exit(1);
    }
    
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatTarotDeck(result));
    }
  });

// Tarot spreads listing
program
  .command('tarot-spreads')
  .alias('spreads')
  .description('List available tarot spreads')
  .option('--json', 'Output raw JSON')
  .action(async (options) => {
    const result = await tarotSpreads();
    
    if (isError(result)) {
      console.error(chalk.red('Error: ' + result.error));
      process.exit(1);
    }
    
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatTarotSpreads(result));
    }
  });

// ═══════════════════════════════════════════════════════════════
// GEMATRIA COMMANDS
// ═══════════════════════════════════════════════════════════════

program
  .command('gematria <text>')
  .description('Calculate gematria values for text')
  .option('-s, --system <system>', 'Only show specific system (hebrew-standard, hebrew-ordinal, hebrew-reduced, greek, english-ordinal, english-reduced, english-sumerian, english-reverse)')
  .option('-c, --compare <text2>', 'Compare with another word/phrase')
  .option('--json', 'Output raw JSON')
  .action(async (text, options) => {
    if (options.compare) {
      const result = compareGematria(text, options.compare, options.system);
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(formatGematriaCompare(result));
      }
    } else {
      const result = calculateGematria(text, options.system);
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(formatGematria(result));
      }
    }
  });

program
  .command('gematria-lookup <number>')
  .description('Find words/concepts matching a gematria value')
  .option('-s, --system <system>', 'Filter by system (hebrew, greek, english)')
  .option('-l, --limit <n>', 'Maximum results', parseInt)
  .option('--json', 'Output raw JSON')
  .action(async (number, options) => {
    const num = parseInt(number, 10);
    if (isNaN(num)) {
      console.error(chalk.red('Error: Please provide a valid number'));
      process.exit(1);
    }
    const result = lookupGematria(num, options.system, options.limit);
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatGematriaLookup(result));
    }
  });

// ═══════════════════════════════════════════════════════════════
// NUMEROLOGY COMMANDS
// ═══════════════════════════════════════════════════════════════

program
  .command('numerology [input]')
  .description('Calculate core numerology numbers')
  .option('-d, --date <date>', 'Birth date (YYYY-MM-DD)')
  .option('-n, --name <name>', 'Full birth name')
  .option('--json', 'Output raw JSON')
  .action(async (input, options) => {
    let name = options.name;
    let date = options.date;

    // Auto-detect positional input
    if (input) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
        date = date || input;
      } else {
        name = name || input;
      }
    }

    if (!name && !date) {
      console.error(chalk.red('Error: Provide --name and/or --date, or a positional argument'));
      process.exit(1);
    }

    const result = calculateNumerology({ name, date });

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatNumerology(result));
    }
  });

program
  .command('numerology-year')
  .description('Calculate Personal Year, Month, and Day numbers')
  .requiredOption('-d, --date <date>', 'Birth date (YYYY-MM-DD)')
  .option('-t, --target-date <date>', 'Target date (YYYY-MM-DD, default: today)')
  .option('--json', 'Output raw JSON')
  .action(async (options) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(options.date)) {
      console.error(chalk.red('Error: Date must be in YYYY-MM-DD format'));
      process.exit(1);
    }

    const result = calculatePersonalCycle(options.date, options.targetDate);

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatNumerologyYear(result));
    }
  });

// ═══════════════════════════════════════════════════════════════
// ELECTIONAL ASTROLOGY COMMAND
// ═══════════════════════════════════════════════════════════════

program
  .command('electional')
  .description('Scan a date range for electional astrology data (moon phases, retrogrades, aspects)')
  .requiredOption('--start <date>', 'Start date (YYYY-MM-DD)')
  .requiredOption('--end <date>', 'End date (YYYY-MM-DD)')
  .option('--city <city>', 'City for local times', 'New York')
  .option('--nation <nation>', 'Country code', 'US')
  .option('--json', 'Output raw JSON')
  .action(async (options) => {
    const spinner = ora('Scanning date range for electional data...').start();
    
    const startDate = new Date(options.start);
    const endDate = new Date(options.end);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      spinner.stop();
      console.error(chalk.red('Error: Invalid date format. Use YYYY-MM-DD'));
      process.exit(1);
    }
    
    if (endDate <= startDate) {
      spinner.stop();
      console.error(chalk.red('Error: End date must be after start date'));
      process.exit(1);
    }
    
    const electionalData: {
      range: { start: string; end: string; days: number };
      moonPhases: Array<{ date: string; phase: string; sign: string; illumination: number }>;
      retrogrades: Array<{ planet: string; status: string; sign: string; dates?: string }>;
      planetaryPositions: Array<{ date: string; planets: Record<string, { sign: string; degree: number; retrograde: boolean }> }>;
      keyDates: Array<{ date: string; event: string; quality: string }>;
    } = {
      range: {
        start: options.start,
        end: options.end,
        days: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      },
      moonPhases: [],
      retrogrades: [],
      planetaryPositions: [],
      keyDates: [],
    };
    
    // Scan moon phases weekly through the range
    const currentDate = new Date(startDate);
    const moonDates: string[] = [];
    while (currentDate <= endDate) {
      moonDates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 3); // Every 3 days for moon
    }
    
    // Get moon data for each sample date
    for (const dateStr of moonDates) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const moonResult = await moon({ year, month, day });
      if (!isError(moonResult)) {
        electionalData.moonPhases.push({
          date: dateStr,
          phase: moonResult.phase?.name || 'Unknown',
          sign: moonResult.moon?.sign || 'Unknown',
          illumination: moonResult.phase?.illumination || 0,
        });
        
        // Mark new/full moons as key dates
        const phaseName = moonResult.phase?.name?.toLowerCase() || '';
        if (phaseName.includes('new moon')) {
          electionalData.keyDates.push({
            date: dateStr,
            event: `New Moon in ${moonResult.moon?.sign}`,
            quality: 'beginnings',
          });
        } else if (phaseName.includes('full moon')) {
          electionalData.keyDates.push({
            date: dateStr,
            event: `Full Moon in ${moonResult.moon?.sign}`,
            quality: 'culmination',
          });
        }
      }
    }
    
    // Get planetary positions at start, middle, and end
    const sampleDates = [
      options.start,
      new Date((startDate.getTime() + endDate.getTime()) / 2).toISOString().split('T')[0],
      options.end,
    ];
    
    const planets = ['mercury', 'venus', 'mars', 'jupiter', 'saturn'];
    
    for (const dateStr of sampleDates) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const positions: Record<string, { sign: string; degree: number; retrograde: boolean }> = {};
      
      for (const body of planets) {
        const ephResult = await ephemeris({ body, year, month, day });
        if (!isError(ephResult)) {
          positions[body] = {
            sign: ephResult.sign || 'Unknown',
            degree: ephResult.position || 0,
            retrograde: ephResult.retrograde || false,
          };
          
          // Track retrogrades
          if (ephResult.retrograde && dateStr === options.start) {
            electionalData.retrogrades.push({
              planet: body.charAt(0).toUpperCase() + body.slice(1),
              status: 'Retrograde',
              sign: ephResult.sign || 'Unknown',
            });
          }
        }
      }
      
      electionalData.planetaryPositions.push({
        date: dateStr,
        planets: positions,
      });
    }
    
    // Check Mercury specifically for retrograde (critical for electional)
    const mercuryStart = electionalData.planetaryPositions[0]?.planets?.mercury;
    const mercuryEnd = electionalData.planetaryPositions[2]?.planets?.mercury;
    if (mercuryStart?.retrograde || mercuryEnd?.retrograde) {
      electionalData.keyDates.push({
        date: mercuryStart?.retrograde ? options.start : options.end,
        event: 'Mercury Retrograde Active',
        quality: 'caution',
      });
    }
    
    spinner.stop();
    
    if (options.json) {
      console.log(JSON.stringify(electionalData, null, 2));
    } else {
      // Formatted output
      console.log(chalk.yellow('\n𓅝') + chalk.dim(' Electional Scan'));
      console.log(chalk.dim(`   ${electionalData.range.start} to ${electionalData.range.end} (${electionalData.range.days} days)\n`));
      
      // Moon Phases
      console.log(chalk.dim('── MOON PHASES ──'));
      for (const mp of electionalData.moonPhases) {
        const phaseIcon = mp.phase.toLowerCase().includes('new') ? '🌑' :
                          mp.phase.toLowerCase().includes('full') ? '🌕' :
                          mp.phase.toLowerCase().includes('first') ? '🌓' :
                          mp.phase.toLowerCase().includes('last') ? '🌗' :
                          mp.phase.toLowerCase().includes('waxing') ? '🌒' : '🌘';
        console.log(`   ${mp.date}  ${phaseIcon} ${mp.phase} in ${mp.sign} (${Math.round(mp.illumination)}%)`);
      }
      
      // Retrogrades
      if (electionalData.retrogrades.length > 0) {
        console.log(chalk.dim('\n── RETROGRADES ──'));
        for (const rx of electionalData.retrogrades) {
          console.log(chalk.red(`   ℞ ${rx.planet} in ${rx.sign}`));
        }
      } else {
        console.log(chalk.dim('\n── RETROGRADES ──'));
        console.log(chalk.green('   No major retrogrades at range start'));
      }
      
      // Planetary Positions
      console.log(chalk.dim('\n── PLANETARY POSITIONS ──'));
      for (const pos of electionalData.planetaryPositions) {
        console.log(chalk.dim(`   ${pos.date}:`));
        for (const [planet, data] of Object.entries(pos.planets)) {
          const rx = data.retrograde ? chalk.red(' ℞') : '';
          console.log(`     ${planet.charAt(0).toUpperCase() + planet.slice(1)}: ${data.sign} ${data.degree.toFixed(1)}°${rx}`);
        }
      }
      
      // Key Dates
      if (electionalData.keyDates.length > 0) {
        console.log(chalk.dim('\n── KEY DATES ──'));
        for (const kd of electionalData.keyDates) {
          const icon = kd.quality === 'beginnings' ? '🌑' :
                       kd.quality === 'culmination' ? '🌕' :
                       kd.quality === 'caution' ? '⚠️' : '✨';
          const color = kd.quality === 'caution' ? chalk.yellow : chalk.white;
          console.log(color(`   ${kd.date}  ${icon} ${kd.event}`));
        }
      }
      
      console.log('');
    }
  });

// Banner
console.log(chalk.dim(''));
console.log(chalk.yellow('  𓅝') + chalk.dim(' thoth-cli v0.2.24'));
console.log(chalk.dim(''));

program.parse();
