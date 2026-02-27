# 𓅝 thoth-cli

Astrological calculations from the command line.

Built on the Swiss Ephemeris for astronomical precision.

## Installation

```bash
npm install -g thoth-cli
```

## Usage

### Calculate a natal chart

```bash
thoth chart --date 1991-07-08 --time 14:06 --lat 40.7128 --lng -74.0060 --name "AKLO"
```

Output:
```
𓅝 Natal Chart: AKLO
   1991-07-08 14:06
   Lat: 40.7128, Lng: -74.006

☉ Sun          ♋ 16°04'
☽ Moon         ♊ 3°17'
☿ Mercury      ♌ 7°33'
♀ Venus        ♌ 28°25'
♂ Mars         ♌ 25°51'
♃ Jupiter      ♌ 15°55'
♄ Saturn       ♒ 4°49' ℞
♅ Uranus       ♑ 11°38' ℞
♆ Neptune      ♑ 15°21' ℞
♇ Pluto        ♏ 17°40' ℞
⚷ Chiron       ♋ 28°30'
☊ North Node   ♑ 18°56'
```

### Calculate transits

```bash
thoth transit --natal-date 1991-07-08 --natal-time 14:06 --lat 40.7128 --lng -74.0060 --orb 3
```

### Get moon phase

```bash
thoth moon
```

Output:
```
🌕 Moon Phase
   2026-02-27

   ☽ Moon in Virgo 15°23'
   Phase: Waxing Gibbous
   Illumination: 78.5%
```

### Get ephemeris position

```bash
thoth ephemeris --body pluto --date 2026-02-27
```

## JSON Output

Add `--json` to any command for machine-readable output:

```bash
thoth chart --date 1991-07-08 --time 14:06 --lat 40.7128 --lng -74.0060 --json
```

## Agent Integration

`thoth-cli` is designed to be called by AI agents (OpenClaw, Claude Code, etc.):

```typescript
// Agent calls thoth via exec
const result = await exec('thoth transit --natal-date 1991-07-08 --natal-time 14:06 --lat 40.7128 --lng -74.0060 --json');
const transits = JSON.parse(result.stdout);

// Agent can now reason about the transits
for (const aspect of transits.aspects) {
  if (aspect.aspect === 'conjunction' && aspect.orb < 1) {
    // Exact transit detected!
  }
}
```

Sharp CLI tools for sharp agents. Unix philosophy meets AI.

## Programmatic Usage

```typescript
import { chart, transit, moon } from 'thoth-cli';

const result = await chart({
  year: 1991,
  month: 7,
  day: 8,
  hour: 14,
  minute: 6,
  lat: 40.7128,
  lng: -74.0060,
  name: 'AKLO',
});

console.log(result.planets.sun.sign); // "Can"
console.log(result.planets.sun.position); // 16.0667
```

## Architecture

```
┌─────────────────────────────────────┐
│      thoth-cli (TypeScript/npm)     │
│                                     │
│  • Beautiful terminal output        │
│  • Full TypeScript types            │
│  • Programmatic API                 │
└──────────────┬──────────────────────┘
               │
               │ JSON over subprocess
               ▼
┌─────────────────────────────────────┐
│    thoth-core (Python binary)       │
│                                     │
│  • Swiss Ephemeris (Kerykeion)      │
│  • All astronomical calculations    │
│  • Compiled with PyInstaller        │
└─────────────────────────────────────┘
```

## Development

### Setup

```bash
# Clone the repo
git clone https://github.com/aklo/thoth-cli.git
cd thoth-cli

# Install Python core
cd packages/core
pip install -e .

# Install TypeScript CLI
cd ../cli
npm install
npm run build
```

### Run locally

```bash
# From packages/cli
npm run dev
node dist/bin.js chart --date 1991-07-08 --time 14:06 --lat 40.7128 --lng -74.0060
```

## License

MIT

---

*𓅝 As above, so below. 𓅝*
