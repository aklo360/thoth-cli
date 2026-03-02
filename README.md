# 𓅝 thoth-cli

**Hermetic astrology from the command line.**

A powerful astrological calculation CLI built on [Kerykeion](https://github.com/g-battaglia/kerykeion) and Swiss Ephemeris. Designed for AI agents, developers, and modern practitioners who need precise calculations with clean output.

## Features

- **Natal Charts** — Full birth charts with planets, houses, aspects, and balances
- **Transits** — Current planetary positions relative to your natal chart
- **Solar Returns** — Annual return charts for year-ahead forecasting
- **Lunar Returns** — Monthly return charts for emotional weather
- **Synastry** — Relationship compatibility aspects between two charts
- **Progressions** — Secondary progressions (day-for-a-year method)
- **Ephemeris Range** — Track planetary positions over time with ingresses and stations
- **Moon Phases** — Current lunar phase and position
- **Ephemeris** — Position of any celestial body on any date
- **SVG Charts** — Beautiful wheel charts for all chart types
- **Symbol Reference** — Complete guide to astrological symbols and meanings
- **Kabbalistic Colors** — Sephirotic color correspondences throughout
- **JSON Output** — Machine-readable output for AI/automation
- **City Geocoding** — Use city names instead of coordinates

## Installation

```bash
npm install -g thoth-cli
```

**Requirements:**
- Node.js 18+
- Python 3.10+

The Python core (Kerykeion) installs automatically.

## Quick Start

```bash
# Calculate a natal chart
thoth chart --date 1879-03-14 --time 11:30 --city "Ulm" --nation "DE" --name "Einstein"

# Get current transits to a natal chart
thoth transit --natal-date 1879-03-14 --natal-time 11:30 --city "Ulm" --nation "DE"

# Current moon phase
thoth moon

# Where is Pluto right now?
thoth ephemeris --body pluto

# Symbol reference guide
thoth key
```

## Commands

### `thoth chart`

Calculate a natal chart.

```bash
thoth chart --date 1879-03-14 --time 11:30 --city "Ulm" --nation "DE" --name "Einstein"
```

**Options:**
| Flag | Description | Required |
|------|-------------|----------|
| `--date` | Birth date (YYYY-MM-DD) | Yes |
| `--time` | Birth time (HH:MM) | Yes |
| `--city` | City name | Yes* |
| `--nation` | Country code (US, UK, DE, etc.) | No (default: US) |
| `--lat` | Latitude | Yes* |
| `--lng` | Longitude | Yes* |
| `--name` | Name for the chart | No |
| `--json` | Output raw JSON | No |

*Either `--city` or both `--lat` and `--lng` required.

**Output includes:**
- Ascendant and Midheaven
- All 10 planets + Chiron, Lilith, Nodes
- House placements
- All 12 house cusps
- Element balance (Fire/Earth/Air/Water)
- Modality balance (Cardinal/Fixed/Mutable)
- Top 15 natal aspects
- Lunar phase at birth

---

### `thoth transit`

Calculate current transits to a natal chart.

```bash
thoth transit --natal-date 1879-03-14 --natal-time 11:30 --city "Ulm" --nation "DE"
thoth transit --natal-date 1879-03-14 --natal-time 11:30 --city "Ulm" --nation "DE" --orb 1
thoth transit --natal-date 1879-03-14 --natal-time 11:30 --city "Ulm" --nation "DE" --transit-date 2027-01-15
```

**Options:**
| Flag | Description | Required |
|------|-------------|----------|
| `--natal-date` | Birth date (YYYY-MM-DD) | Yes |
| `--natal-time` | Birth time (HH:MM) | Yes |
| `--city` | City name | Yes* |
| `--nation` | Country code | No (default: US) |
| `--lat` / `--lng` | Coordinates | Yes* |
| `--transit-date` | Transit date (default: today) | No |
| `--orb` | Aspect orb in degrees (default: 3) | No |
| `--json` | Output raw JSON | No |

**Output includes:**
- Current sky (all planets with signs, degrees, houses)
- Side-by-side house comparison (transit vs natal)
- Transit-to-natal aspects with orbs
- House flow notation (e.g., 2H→4H)
- Current lunar phase
- Retrograde indicators

---

### `thoth moon`

Get current moon phase and position.

```bash
thoth moon
thoth moon --date 2026-03-14
```

**Options:**
| Flag | Description |
|------|-------------|
| `--date` | Date (default: today) |
| `--json` | Output raw JSON |

---

### `thoth ephemeris`

Get the position of any celestial body.

```bash
thoth ephemeris --body pluto
thoth ephemeris --body saturn --date 2027-01-15
```

**Options:**
| Flag | Description | Required |
|------|-------------|----------|
| `--body` | Celestial body (sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto) | Yes |
| `--date` | Date (default: today) | No |
| `--json` | Output raw JSON | No |

---

### `thoth solar-return`

Calculate annual solar return chart.

```bash
thoth solar-return --natal-date 1879-03-14 --natal-time 11:30 --city "Ulm" --nation "DE" --year 2026
thoth solar-return --natal-date 1879-03-14 --natal-time 11:30 --city "Ulm" --nation "DE" --year 2026 --svg-file chart.svg
```

**Options:**
| Flag | Description | Required |
|------|-------------|----------|
| `--natal-date` | Birth date (YYYY-MM-DD) | Yes |
| `--natal-time` | Birth time (HH:MM) | Yes |
| `--year` | Return year | Yes |
| `--city` | Natal city | Yes* |
| `--nation` | Country code | No (default: US) |
| `--return-city` | Location for return (default: natal) | No |
| `--svg` | Output SVG chart | No |
| `--svg-file` | Save SVG to file | No |
| `--json` | Output raw JSON | No |

---

### `thoth lunar-return`

Calculate next lunar return from a date.

```bash
thoth lunar-return --natal-date 1879-03-14 --natal-time 11:30 --city "Ulm" --nation "DE" --from 2026-03-01
```

**Options:**
| Flag | Description | Required |
|------|-------------|----------|
| `--natal-date` | Birth date (YYYY-MM-DD) | Yes |
| `--natal-time` | Birth time (HH:MM) | Yes |
| `--from` | Search from date (YYYY-MM-DD) | Yes |
| `--city` | Natal city | Yes* |
| `--nation` | Country code | No (default: US) |
| `--return-city` | Location for return | No |
| `--svg` / `--svg-file` | SVG output | No |
| `--json` | Output raw JSON | No |

---

### `thoth synastry`

Calculate relationship aspects between two charts.

```bash
thoth synastry \
  --date1 1879-03-14 --time1 11:30 --city1 "Ulm" --nation1 "DE" --name1 "Einstein" \
  --date2 1876-01-01 --time2 12:00 --city2 "Berlin" --nation2 "DE" --name2 "Mileva"
```

**Options:**
| Flag | Description | Required |
|------|-------------|----------|
| `--date1` | Person 1 birth date | Yes |
| `--time1` | Person 1 birth time | Yes |
| `--city1` | Person 1 city | Yes* |
| `--name1` | Person 1 name | No |
| `--date2` | Person 2 birth date | Yes |
| `--time2` | Person 2 birth time | Yes |
| `--city2` | Person 2 city | Yes* |
| `--name2` | Person 2 name | No |
| `--orb` | Aspect orb (default: 6) | No |
| `--svg` / `--svg-file` | SVG bi-wheel | No |
| `--json` | Output raw JSON | No |

---

### `thoth progressions`

Calculate secondary progressions (day-for-a-year method).

```bash
thoth progressions --natal-date 1879-03-14 --natal-time 11:30 --city "Ulm" --nation "DE" --target-date 1915-11-25
```

**Options:**
| Flag | Description | Required |
|------|-------------|----------|
| `--natal-date` | Birth date (YYYY-MM-DD) | Yes |
| `--natal-time` | Birth time (HH:MM) | Yes |
| `--target-date` | Target date for progressions | Yes |
| `--city` | Natal city | Yes* |
| `--nation` | Country code | No (default: US) |
| `--svg` / `--svg-file` | SVG output | No |
| `--json` | Output raw JSON | No |

**Output includes:**
- Progressed angles (ASC, MC)
- Progressed vs natal planet positions
- Progressed-to-natal aspects (tight orb)
- Age at target date

---

### `thoth ephemeris-range`

Track planetary positions over a date range.

```bash
thoth ephemeris-range --body pluto --from 2024-01-01 --to 2030-12-31 --step month
thoth ephemeris-range --body saturn --from 2025-01-01 --to 2027-12-31 --step week
```

**Options:**
| Flag | Description | Required |
|------|-------------|----------|
| `--body` | Celestial body | Yes |
| `--from` | Start date (YYYY-MM-DD) | Yes |
| `--to` | End date (YYYY-MM-DD) | Yes |
| `--step` | Step: day, week, month (default: month) | No |
| `--json` | Output raw JSON | No |

**Output includes:**
- All positions at each step
- **Sign changes** — When the planet enters a new sign
- **Retrograde stations** — When the planet stations Rx or direct

---

### `thoth key`

Display the complete symbol reference guide.

```bash
thoth key
```

Includes:
- **Planets** — Meanings, rulerships, Sephirotic correspondences
- **Points** — Chiron, Lilith, Nodes
- **Zodiac Signs** — Element, modality, ruler, mantra
- **Houses** — Life areas for all 12 houses
- **Aspects** — Degrees, meanings, Hermetic colors
- **Elements** — Signs, temperaments, Jungian functions
- **Modalities** — Cardinal, Fixed, Mutable
- **Dignities** — Domicile, Exaltation, Detriment, Fall

---

## SVG Chart Generation

All chart commands support SVG output:

```bash
# Output SVG to stdout (as JSON)
thoth chart --date 1879-03-14 --time 11:30 --city "Ulm" --nation "DE" --svg

# Save SVG to file
thoth chart --date 1879-03-14 --time 11:30 --city "Ulm" --nation "DE" --svg-file einstein.svg

# Synastry bi-wheel
thoth synastry --date1 1879-03-14 --time1 11:30 --city1 "Ulm" --date2 1876-01-01 --time2 12:00 --city2 "Berlin" --svg-file synastry.svg
```

Charts are rendered using Kerykeion's SVG engine.

---

## Color System

thoth-cli uses a **Kabbalistic color system** based on Sephirotic correspondences:

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

Zodiac signs inherit their ruling planet's color. Aspects inherit their corresponding Sephira's color.

---

## JSON Output

All commands support `--json` for programmatic use:

```bash
thoth chart --date 1879-03-14 --time 11:30 --city "Ulm" --nation "DE" --json
```

Perfect for AI agents, automation, and integration with other tools.

---

## Examples

### Famous Charts

```bash
# Albert Einstein — Pisces Sun, Sagittarius Moon
thoth chart --date 1879-03-14 --time 11:30 --city "Ulm" --nation "DE" --name "Einstein"

# Carl Jung — Leo Sun, Taurus Moon  
thoth chart --date 1875-07-26 --time 19:29 --city "Kesswil" --nation "CH" --name "Jung"

# Nikola Tesla — Cancer Sun, Libra Moon
thoth chart --date 1856-07-10 --time 00:00 --city "Smiljan" --nation "HR" --name "Tesla"
```

### Transit Analysis

```bash
# Current transits with tight orb
thoth transit --natal-date 1879-03-14 --natal-time 11:30 --city "Ulm" --nation "DE" --orb 1

# Future transits
thoth transit --natal-date 1879-03-14 --natal-time 11:30 --city "Ulm" --nation "DE" --transit-date 2027-01-15
```

---

## Architecture

```
thoth-cli/
├── packages/
│   ├── core/           # Python calculations (Kerykeion + Swiss Ephemeris)
│   │   ├── thoth_core/
│   │   │   ├── __init__.py
│   │   │   └── cli.py
│   │   └── pyproject.toml
│   └── cli/            # TypeScript CLI (Commander.js)
│       ├── src/
│       │   ├── bin.ts
│       │   └── lib/
│       │       ├── core.ts
│       │       └── format.ts
│       └── package.json
├── CHANGELOG.md
└── README.md
```

---

## Development

```bash
# Clone
git clone https://github.com/aklo360/thoth-cli.git
cd thoth-cli

# Install Python dependencies
cd packages/core
pip install -e .

# Install TypeScript dependencies and build
cd ../cli
npm install
npm run build

# Run locally
node dist/bin.js chart --date 1879-03-14 --time 11:30 --city "Ulm" --nation "DE"
```

---

## Credits

- [Kerykeion](https://github.com/g-battaglia/kerykeion) — Python astrology library
- [Swiss Ephemeris](https://www.astro.com/swisseph/) — Precise planetary calculations
- [Commander.js](https://github.com/tj/commander.js) — CLI framework

---

## Privacy

**thoth-cli collects no data. Ever.**

- ✅ All calculations run locally on your machine
- ✅ No analytics, no telemetry, no tracking
- ✅ No network requests except geocoding (via Geonames)
- ✅ Your birth data stays on your computer

The oracle sees but does not record.

---

## License

**MIT** — Use it for anything. Free forever.

---

*"As above, so below; as the universe, so the soul."*

𓅝
