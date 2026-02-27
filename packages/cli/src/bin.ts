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
    console.log(`   ${sun('☉ SUN')}     Identity, vitality, ego, life force`);
    console.log(`             ${chalk.dim('Rules:')} ${sun('Leo')}  ${chalk.dim('Sephira:')} Tiphareth`);
    console.log(`   ${moon('☽ MOO')}     Emotions, instincts, the unconscious, mother`);
    console.log(`             ${chalk.dim('Rules:')} ${moon('Can')}  ${chalk.dim('Sephira:')} Yesod`);
    console.log(`   ${mercury('☿ MER')}     Mind, communication, learning, commerce`);
    console.log(`             ${chalk.dim('Rules:')} ${mercury('Gem, Vir')}  ${chalk.dim('Sephira:')} Hod`);
    console.log(`   ${venus('♀ VEN')}     Love, beauty, values, attraction, harmony`);
    console.log(`             ${chalk.dim('Rules:')} ${venus('Tau, Lib')}  ${chalk.dim('Sephira:')} Netzach`);
    console.log(`   ${mars('♂ MAR')}     Action, desire, aggression, courage, drive`);
    console.log(`             ${chalk.dim('Rules:')} ${mars('Ari')}  ${chalk.dim('Sephira:')} Geburah`);
    console.log(`   ${jupiter('♃ JUP')}     Expansion, luck, wisdom, abundance, faith`);
    console.log(`             ${chalk.dim('Rules:')} ${jupiter('Sag')}  ${chalk.dim('Sephira:')} Chesed`);
    console.log(`   ${saturn('♄ SAT')}     Structure, limits, time, karma, discipline`);
    console.log(`             ${chalk.dim('Rules:')} ${saturn('Cap')}  ${chalk.dim('Sephira:')} Binah`);
    console.log(`   ${uranus('♅ URA')}     Revolution, awakening, innovation, freedom`);
    console.log(`             ${chalk.dim('Rules:')} ${uranus('Aqu')}  ${chalk.dim('Sephira:')} Chokmah`);
    console.log(`   ${neptune('♆ NEP')}     Dreams, illusion, spirituality, dissolution`);
    console.log(`             ${chalk.dim('Rules:')} ${neptune('Pis')}`);
    console.log(`   ${pluto('♇ PLU')}     Transformation, death/rebirth, power, shadow`);
    console.log(`             ${chalk.dim('Rules:')} ${pluto('Sco')}`);
    console.log('');
    
    // ═══════════════════════════════════════════════════════════════
    // POINTS
    // ═══════════════════════════════════════════════════════════════
    console.log(chalk.bold.cyan('══ POINTS ══'));
    console.log(`   ${chiron('⚷ CHI')}     The wounded healer. Core wound & gift of healing.`);
    console.log(`   ${lilith('⚸ LIL')}     Black Moon. Primal feminine, shadow, rejection.`);
    console.log(`   ${northNode('☊ NN')}      North Node. Soul's direction. Growth edge.`);
    console.log(`   ${southNode('☋ SN')}      South Node. Past life gifts. Comfort zone.`);
    console.log('');
    
    // ═══════════════════════════════════════════════════════════════
    // ZODIAC SIGNS
    // ═══════════════════════════════════════════════════════════════
    console.log(chalk.bold.cyan('══ ZODIAC SIGNS ══'));
    console.log(`   ${mars('♈ Ari')}  Aries      ${chalk.dim('Cardinal Fire')}   Initiative, courage, impatience`);
    console.log(`                      ${chalk.dim('Ruler:')} ${mars('♂')}  ${chalk.dim('I AM')}`);
    console.log(`   ${venus('♉ Tau')}  Taurus     ${chalk.dim('Fixed Earth')}     Stability, sensuality, stubborn`);
    console.log(`                      ${chalk.dim('Ruler:')} ${venus('♀')}  ${chalk.dim('I HAVE')}`);
    console.log(`   ${mercury('♊ Gem')}  Gemini     ${chalk.dim('Mutable Air')}     Curiosity, duality, scattered`);
    console.log(`                      ${chalk.dim('Ruler:')} ${mercury('☿')}  ${chalk.dim('I THINK')}`);
    console.log(`   ${moon('♋ Can')}  Cancer     ${chalk.dim('Cardinal Water')}  Nurturing, protective, moody`);
    console.log(`                      ${chalk.dim('Ruler:')} ${moon('☽')}  ${chalk.dim('I FEEL')}`);
    console.log(`   ${sun('♌ Leo')}  Leo        ${chalk.dim('Fixed Fire')}      Creative, proud, dramatic`);
    console.log(`                      ${chalk.dim('Ruler:')} ${sun('☉')}  ${chalk.dim('I WILL')}`);
    console.log(`   ${mercury('♍ Vir')}  Virgo      ${chalk.dim('Mutable Earth')}   Analytical, service, critical`);
    console.log(`                      ${chalk.dim('Ruler:')} ${mercury('☿')}  ${chalk.dim('I ANALYZE')}`);
    console.log(`   ${venus('♎ Lib')}  Libra      ${chalk.dim('Cardinal Air')}    Balance, partnership, indecisive`);
    console.log(`                      ${chalk.dim('Ruler:')} ${venus('♀')}  ${chalk.dim('I BALANCE')}`);
    console.log(`   ${pluto('♏ Sco')}  Scorpio    ${chalk.dim('Fixed Water')}     Intensity, depth, secretive`);
    console.log(`                      ${chalk.dim('Ruler:')} ${pluto('♇')}  ${chalk.dim('I DESIRE')}`);
    console.log(`   ${jupiter('♐ Sag')}  Sagittarius ${chalk.dim('Mutable Fire')}   Adventure, truth, reckless`);
    console.log(`                      ${chalk.dim('Ruler:')} ${jupiter('♃')}  ${chalk.dim('I SEE')}`);
    console.log(`   ${saturn('♑ Cap')}  Capricorn  ${chalk.dim('Cardinal Earth')}  Ambition, mastery, cold`);
    console.log(`                      ${chalk.dim('Ruler:')} ${saturn('♄')}  ${chalk.dim('I USE')}`);
    console.log(`   ${uranus('♒ Aqu')}  Aquarius   ${chalk.dim('Fixed Air')}       Humanitarian, eccentric, detached`);
    console.log(`                      ${chalk.dim('Ruler:')} ${uranus('♅')}  ${chalk.dim('I KNOW')}`);
    console.log(`   ${neptune('♓ Pis')}  Pisces     ${chalk.dim('Mutable Water')}   Compassion, dreams, escapist`);
    console.log(`                      ${chalk.dim('Ruler:')} ${neptune('♆')}  ${chalk.dim('I BELIEVE')}`);
    console.log('');
    
    // ═══════════════════════════════════════════════════════════════
    // HOUSES
    // ═══════════════════════════════════════════════════════════════
    console.log(chalk.bold.cyan('══ HOUSES ══'));
    console.log(`   ${chalk.bold('1H')}  ${mars('ASC')}   Self, identity, appearance, first impressions`);
    console.log(`   ${chalk.bold('2H')}        Money, possessions, values, self-worth`);
    console.log(`   ${chalk.bold('3H')}        Communication, siblings, local travel, learning`);
    console.log(`   ${chalk.bold('4H')}  ${saturn('IC')}    Home, family, roots, private self, mother`);
    console.log(`   ${chalk.bold('5H')}        Creativity, romance, children, pleasure, play`);
    console.log(`   ${chalk.bold('6H')}        Health, work, service, daily routines, pets`);
    console.log(`   ${chalk.bold('7H')}  ${chalk.white('DSC')}   Partnerships, marriage, open enemies, others`);
    console.log(`   ${chalk.bold('8H')}        Death, sex, shared resources, transformation`);
    console.log(`   ${chalk.bold('9H')}        Philosophy, travel, higher education, beliefs`);
    console.log(`   ${chalk.bold('10H')} ${sun('MC')}    Career, reputation, public self, father`);
    console.log(`   ${chalk.bold('11H')}       Friends, groups, hopes, wishes, humanity`);
    console.log(`   ${chalk.bold('12H')}       Unconscious, isolation, secrets, karma, dreams`);
    console.log('');
    
    // ═══════════════════════════════════════════════════════════════
    // ASPECTS
    // ═══════════════════════════════════════════════════════════════
    console.log(chalk.bold.cyan('══ ASPECTS ══'));
    console.log(`   ${sun('☌ CNJ')}  Conjunction   0°   Fusion, intensification, new cycle`);
    console.log(`                         ${chalk.dim('Sephira: Tiphareth (☉) — creative union')}`);
    console.log(`   ${moon('☍ OPP')}  Opposition  180°   Awareness, tension, projection`);
    console.log(`                         ${chalk.dim('Sephira: Yesod (☽) — polarity, reflection')}`);
    console.log(`   ${jupiter('△ TRI')}  Trine       120°   Harmony, ease, natural talent`);
    console.log(`                         ${chalk.dim('Sephira: Chesed (♃) — grace, flow')}`);
    console.log(`   ${mars('□ SQR')}  Square       90°   Friction, challenge, forced growth`);
    console.log(`                         ${chalk.dim('Sephira: Geburah (♂) — strength through struggle')}`);
    console.log(`   ${venus('⚹ SXT')}  Sextile      60°   Opportunity, cooperation, ease`);
    console.log(`                         ${chalk.dim('Sephira: Netzach (♀) — gentle harmony')}`);
    console.log(`   ${mercury('⍟ QNT')}  Quintile     72°   Creativity, talent, genius`);
    console.log(`                         ${chalk.dim('Sephira: Hod (☿) — mental brilliance')}`);
    console.log(`   ${uranus('⚻ QCX')}  Quincunx    150°   Adjustment, awkwardness, recalibration`);
    console.log('');
    
    // ═══════════════════════════════════════════════════════════════
    // ELEMENTS
    // ═══════════════════════════════════════════════════════════════
    console.log(chalk.bold.cyan('══ ELEMENTS ══'));
    console.log(`   ${mars('🜂 FIRE')}    ${mars('Ari Leo Sag')}    Spirit, will, action, enthusiasm`);
    console.log(`             ${chalk.dim('Hot & Dry — Choleric — Intuitive')}`);
    console.log(`   ${venus('🜃 EARTH')}   ${venus('Tau Vir Cap')}    Matter, stability, practicality`);
    console.log(`             ${chalk.dim('Cold & Dry — Melancholic — Sensation')}`);
    console.log(`   ${mercury('🜁 AIR')}     ${mercury('Gem Lib Aqu')}    Mind, communication, connection`);
    console.log(`             ${chalk.dim('Hot & Wet — Sanguine — Thinking')}`);
    console.log(`   ${jupiter('🜄 WATER')}   ${moon('Can Sco Pis')}    Emotion, intuition, the unconscious`);
    console.log(`             ${chalk.dim('Cold & Wet — Phlegmatic — Feeling')}`);
    console.log('');
    
    // ═══════════════════════════════════════════════════════════════
    // MODALITIES
    // ═══════════════════════════════════════════════════════════════
    console.log(chalk.bold.cyan('══ MODALITIES ══'));
    console.log(`   ${chalk.bold('CARDINAL')}   ${mars('Ari')} ${moon('Can')} ${venus('Lib')} ${saturn('Cap')}    Initiating, leadership, action`);
    console.log(`             ${chalk.dim('The spark. Begins seasons. "I start."')}`);
    console.log(`   ${chalk.bold('FIXED')}      ${venus('Tau')} ${sun('Leo')} ${pluto('Sco')} ${uranus('Aqu')}    Stabilizing, persistence, stubborn`);
    console.log(`             ${chalk.dim('The sustainer. Mid-season. "I maintain."')}`);
    console.log(`   ${chalk.bold('MUTABLE')}    ${mercury('Gem')} ${mercury('Vir')} ${jupiter('Sag')} ${neptune('Pis')}    Adapting, flexible, changeable`);
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
