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
  composite, solarArc, horary
} from './lib/core.js';
import { 
  formatChart, formatTransits, formatMoon, formatEphemeris,
  formatSolarReturn, formatLunarReturn, formatSynastry, 
  formatProgressions, formatEphemerisRange,
  formatComposite, formatSolarArc, formatHorary
} from './lib/format.js';
import { isError } from './types.js';

const program = new Command();

program
  .name('thoth')
  .description(`𓅝 Astrological calculations from the command line

Examples:
  thoth chart --date 1991-07-08 --time 14:06 --city "New York"
  thoth transit --natal-date 1991-07-08 --natal-time 14:06 --city "New York"
  thoth solar-return --natal-date 1991-07-08 --natal-time 14:06 --city "New York" --year 2026
  thoth synastry --date1 1991-07-08 --time1 14:06 --city1 "New York" --date2 2026-02-26 --time2 04:35 --city2 "New York"
  thoth progressions --natal-date 1991-07-08 --natal-time 14:06 --city "New York" --target-date 2026-03-01
  thoth moon
  thoth ephemeris --body pluto`)
  .version('0.2.9');

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
    
    console.log(chalk.bold.cyan('══ PLANETS ══'));
    console.log(`   ${sun('☉ Sun')}       Identity, vitality, ego, life force`);
    console.log(`   ${moon('☽ Moon')}      Emotions, instincts, the unconscious`);
    console.log(`   ${mercury('☿ Mercury')}   Mind, communication, learning`);
    console.log(`   ${venus('♀ Venus')}     Love, beauty, values, attraction`);
    console.log(`   ${mars('♂ Mars')}      Action, desire, aggression, drive`);
    console.log(`   ${jupiter('♃ Jupiter')}   Expansion, luck, wisdom, abundance`);
    console.log(`   ${saturn('♄ Saturn')}    Structure, limits, time, karma`);
    console.log(`   ${uranus('♅ Uranus')}    Revolution, awakening, innovation`);
    console.log(`   ${neptune('♆ Neptune')}   Dreams, illusion, spirituality`);
    console.log(`   ${pluto('♇ Pluto')}     Transformation, death/rebirth, power`);
    console.log('');
    
    console.log(chalk.bold.cyan('══ POINTS ══'));
    console.log(`   ${chiron('⚷ Chiron')}      Wound & gift of healing`);
    console.log(`   ${lilith('⚸ Lilith')}      Primal feminine, shadow`);
    console.log(`   ${northNode('☊ North Node')}  Soul's direction`);
    console.log(`   ${southNode('☋ South Node')}  Past karma`);
    console.log('');
    
    console.log(chalk.bold.cyan('══ ASPECTS ══'));
    console.log(`   ${sun('☌')} Conjunction 0°   Fusion, intensification`);
    console.log(`   ${moon('☍')} Opposition 180°  Tension, awareness`);
    console.log(`   ${jupiter('△')} Trine     120°  Harmony, ease`);
    console.log(`   ${mars('□')} Square     90°  Challenge, growth`);
    console.log(`   ${venus('⚹')} Sextile    60°  Opportunity`);
    console.log('');
    
    console.log(chalk.bold.cyan('══ ELEMENTS ══'));
    console.log(`   ${mars('🜂 Fire')}   Spirit, will, action`);
    console.log(`   ${venus('🜃 Earth')}  Matter, stability`);
    console.log(`   ${mercury('🜁 Air')}    Mind, communication`);
    console.log(`   ${moon('🜄 Water')}  Emotion, intuition`);
    console.log('');
    
    console.log(chalk.bold.cyan('══ OTHER ══'));
    console.log(`   ℞  Retrograde — Planet appears to move backward`);
    console.log('');
  });

// Banner
console.log(chalk.dim(''));
console.log(chalk.yellow('  𓅝') + chalk.dim(' thoth-cli v0.2.9'));
console.log(chalk.dim(''));

program.parse();
