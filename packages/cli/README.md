# 𓅝 thoth-cli

**Hermetic astrology from the command line.**

A powerful astrological calculation CLI built on [Kerykeion](https://github.com/g-battaglia/kerykeion) and Swiss Ephemeris. Designed for AI agents, developers, and modern practitioners who need precise calculations with clean output.

## Features

- **Natal Charts** — Full birth charts with planets, houses, aspects, and balances
- **Transits** — Current planetary positions relative to your natal chart
- **Solar Returns** — Annual birthday charts for year-ahead themes
- **Lunar Returns** — Monthly emotional cycle charts
- **Synastry** — Relationship compatibility between two charts
- **Composite Charts** — Merged relationship chart (midpoint method)
- **Progressions** — Secondary progressions (day-for-a-year)
- **Solar Arc** — Solar arc directions for timing
- **Horary** — Question-based divination charts with traditional rules
- **Ephemeris** — Position of any celestial body on any date
- **Ephemeris Range** — Track a planet through signs over time
- **Moon Phases** — Current lunar phase and position
- **Symbol Reference** — Complete guide to astrological symbols and meanings
- **Sephirotic Colors** — Kabbalistic color correspondences throughout
- **JSON Output** — Machine-readable output for AI/automation

## Installation

```bash
npm install -g thoth-cli
```

The binary downloads automatically on first install (~18MB).

## Quick Start

```bash
# Natal chart
thoth chart --date 1991-07-08 --time 14:06 --city "New York"

# Current transits
thoth transit --natal-date 1991-07-08 --natal-time 14:06 --city "New York"

# Solar return for 2026
thoth solar-return --natal-date 1991-07-08 --natal-time 14:06 --city "New York" --year 2026

# Horary divination
thoth horary --question "Should I take the job?" --city "New York"

# Relationship synastry
thoth synastry --date1 1991-07-08 --time1 14:06 --city1 "NYC" \
               --date2 1990-03-15 --time2 09:30 --city2 "LA"

# Moon phase
thoth moon

# Where is Pluto?
thoth ephemeris --body pluto

# Symbol reference
thoth key
```

---

## Commands

### `thoth chart` — Natal Chart

Calculate a complete birth chart.

```bash
thoth chart --date 1991-07-08 --time 14:06 --city "New York"
thoth chart --date 1991-07-08 --time 14:06 --lat 40.7128 --lng -74.0060
thoth chart --date 1991-07-08 --time 14:06 --city "New York" --svg-file chart.svg
```

| Flag | Description | Required |
|------|-------------|----------|
| `--date` | Birth date (YYYY-MM-DD) | Yes |
| `--time` | Birth time (HH:MM) | Yes |
| `--city` | City name | Yes* |
| `--nation` | Country code (default: US) | No |
| `--lat` / `--lng` | Coordinates | Yes* |
| `--name` | Name for the chart | No |
| `--svg` | Output SVG chart | No |
| `--svg-file` | Save SVG to file | No |
| `--json` | Output raw JSON | No |

*Either `--city` or both `--lat` and `--lng` required.

---

### `thoth transit` — Current Transits

Calculate transits to a natal chart.

```bash
thoth transit --natal-date 1991-07-08 --natal-time 14:06 --city "New York"
thoth transit --natal-date 1991-07-08 --natal-time 14:06 --city "NYC" --orb 1
```

| Flag | Description | Required |
|------|-------------|----------|
| `--natal-date` | Birth date | Yes |
| `--natal-time` | Birth time | Yes |
| `--city` | City name | Yes* |
| `--lat` / `--lng` | Coordinates | Yes* |
| `--transit-date` | Transit date (default: today) | No |
| `--orb` | Aspect orb in degrees (default: 3) | No |
| `--json` | Output raw JSON | No |

---

### `thoth solar-return` — Annual Chart

Calculate solar return chart for a specific year.

```bash
thoth solar-return --natal-date 1991-07-08 --natal-time 14:06 --city "NYC" --year 2026
```

| Flag | Description | Required |
|------|-------------|----------|
| `--natal-date` | Birth date | Yes |
| `--natal-time` | Birth time | Yes |
| `--city` | City name | Yes |
| `--year` | Return year | Yes |
| `--json` | Output raw JSON | No |

---

### `thoth lunar-return` — Monthly Chart

Calculate next lunar return from a given date.

```bash
thoth lunar-return --natal-date 1991-07-08 --natal-time 14:06 --city "NYC" --from 2026-03-01
```

| Flag | Description | Required |
|------|-------------|----------|
| `--natal-date` | Birth date | Yes |
| `--natal-time` | Birth time | Yes |
| `--city` | City name | Yes |
| `--from` | Date to search from | Yes |
| `--json` | Output raw JSON | No |

---

### `thoth synastry` — Relationship Aspects

Calculate synastry aspects between two charts.

```bash
thoth synastry --date1 1991-07-08 --time1 14:06 --city1 "NYC" \
               --date2 1990-03-15 --time2 09:30 --city2 "LA"
```

| Flag | Description | Required |
|------|-------------|----------|
| `--date1` / `--time1` | Person 1 birth data | Yes |
| `--city1` or `--lat1/--lng1` | Person 1 location | Yes |
| `--date2` / `--time2` | Person 2 birth data | Yes |
| `--city2` or `--lat2/--lng2` | Person 2 location | Yes |
| `--orb` | Aspect orb (default: 6) | No |
| `--json` | Output raw JSON | No |

---

### `thoth composite` — Relationship Chart

Calculate composite (midpoint) chart for a relationship.

```bash
thoth composite --date1 1991-07-08 --time1 14:06 --city1 "NYC" \
                --date2 1990-03-15 --time2 09:30 --city2 "LA"
```

Same options as synastry. Creates a merged chart representing the relationship itself.

---

### `thoth progressions` — Secondary Progressions

Calculate secondary progressions (day-for-a-year method).

```bash
thoth progressions --natal-date 1991-07-08 --natal-time 14:06 --city "NYC" \
                   --target-date 2026-03-01
```

| Flag | Description | Required |
|------|-------------|----------|
| `--natal-date` | Birth date | Yes |
| `--natal-time` | Birth time | Yes |
| `--city` or `--lat/--lng` | Birth location | Yes |
| `--target-date` | Progression target date | Yes |
| `--json` | Output raw JSON | No |

---

### `thoth solar-arc` — Solar Arc Directions

Calculate solar arc directions (all planets advance by Sun's arc).

```bash
thoth solar-arc --natal-date 1991-07-08 --natal-time 14:06 --city "NYC" \
                --target-date 2026-03-01
```

Same options as progressions. Shows directed positions and aspects to natal.

---

### `thoth horary` — Question Divination

Cast a horary chart for yes/no or situational questions.

```bash
thoth horary --question "Should I take the job?" --city "New York"
thoth horary --question "Will we reconcile?" --lat 40.7128 --lng -74.0060
```

| Flag | Description | Required |
|------|-------------|----------|
| `--question` | Your question | Yes |
| `--city` or `--lat/--lng` | Your current location | Yes |
| `--json` | Output raw JSON | No |

**Output includes:**
- Planetary hour and day ruler
- Strictures against judgment (void of course, etc.)
- Querent significator (1st house ruler)
- Quesited significator (relevant house ruler)
- Moon's last and next aspects
- Reception and dignity analysis

---

### `thoth moon` — Lunar Phase

Get current moon phase and position.

```bash
thoth moon
thoth moon --date 2026-03-14
```

---

### `thoth ephemeris` — Planet Position

Get the position of any celestial body.

```bash
thoth ephemeris --body pluto
thoth ephemeris --body saturn --date 2027-01-15
```

**Bodies:** sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto

---

### `thoth ephemeris-range` — Track Planet Over Time

Get ephemeris positions over a date range.

```bash
thoth ephemeris-range --body pluto --from 2024-01-01 --to 2030-01-01 --step month
```

| Flag | Description | Required |
|------|-------------|----------|
| `--body` | Celestial body | Yes |
| `--from` | Start date | Yes |
| `--to` | End date | Yes |
| `--step` | Interval: day, week, month | No (default: month) |

---

### `thoth key` — Symbol Reference

Display the complete astrological symbol reference.

```bash
thoth key
```

**Includes:**
- Planets — meanings, rulerships, Sephirotic correspondences
- Points — Chiron, Lilith, Nodes
- Zodiac Signs — element, modality, ruler, "I AM" mantras
- Houses — all 12 life areas
- Aspects — degrees, meanings, orbs
- Elements & Modalities
- Dignities — domicile, exaltation, detriment, fall

---

## Color System

thoth-cli uses **Sephirotic colors** based on Kabbalistic correspondences:

| Planet | Sephira | Color |
|--------|---------|-------|
| ☉ Sun | Tiphareth | Gold |
| ☽ Moon | Yesod | Silver |
| ☿ Mercury | Hod | Orange |
| ♀ Venus | Netzach | Green |
| ♂ Mars | Geburah | Red |
| ♃ Jupiter | Chesed | Royal Blue |
| ♄ Saturn | Binah | Indigo |
| ♅ Uranus | Chokmah | Cyan |
| ♆ Neptune | — | Sea Green |
| ♇ Pluto | — | Dark Red |

---

## JSON Output

All commands support `--json` for programmatic use:

```bash
thoth chart --date 1991-07-08 --time 14:06 --city "NYC" --json
thoth horary --question "Test" --city "NYC" --json
```

Perfect for AI agents, automation, and integration.

---

## Privacy

**thoth-cli collects no data. Ever.**

- ✅ All calculations run locally
- ✅ No analytics, no telemetry, no tracking
- ✅ No network requests except city geocoding (via GeoNames)
- ✅ Your birth data stays on your machine

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `KERYKEION_GEONAMES_USERNAME` | Custom GeoNames username for geocoding (optional, avoids rate limits) |

Get a free username at [geonames.org/login](https://www.geonames.org/login)

---

## Development

```bash
git clone https://github.com/aklo360/thoth-cli.git
cd thoth-cli

# Python core
cd packages/core
python -m venv .venv
source .venv/bin/activate
pip install -e .

# TypeScript CLI
cd ../cli
npm install
npm run build

# Test
node dist/bin.js chart --date 1991-07-08 --time 14:06 --city "New York"
```

---

## Credits

- [Kerykeion](https://github.com/g-battaglia/kerykeion) — Python astrology library
- [Swiss Ephemeris](https://www.astro.com/swisseph/) — Precise planetary calculations
- [Commander.js](https://github.com/tj/commander.js) — CLI framework

---

## License

**MIT** — Use it for anything. Free forever.

---

*"As above, so below; as the universe, so the soul."*

𓅝
