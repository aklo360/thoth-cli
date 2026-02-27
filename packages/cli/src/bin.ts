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
    console.log(`   ${chalk.bold('Domicile')}    Planet in sign it rules. Full power. ${chalk.dim('e.g., ♂ in Ari')}`);
    console.log(`   ${chalk.bold('Exaltation')} Planet in sign of peak expression. ${chalk.dim('e.g., ☉ in Ari')}`);
    console.log(`   ${chalk.bold('Detriment')}  Planet opposite its home. Challenged. ${chalk.dim('e.g., ♂ in Lib')}`);
    console.log(`   ${chalk.bold('Fall')}       Planet opposite exaltation. Weakened. ${chalk.dim('e.g., ☉ in Lib')}`);
    console.log('');
  });

// Banner
console.log(chalk.dim(''));
console.log(chalk.yellow('  𓅝') + chalk.dim(' thoth-cli'));
console.log(chalk.dim(''));

program.parse();
