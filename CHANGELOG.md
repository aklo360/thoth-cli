# Changelog

All notable changes to thoth-cli will be documented in this file.

## [0.1.0] - 2026-02-27

### 🌟 Initial Release

The first public release of thoth-cli — a Hermetic astrology CLI built on Kerykeion and Swiss Ephemeris.

### Features

#### Commands
- **`thoth chart`** — Calculate comprehensive natal charts
  - All 10 planets + Chiron, Lilith, North/South Nodes
  - All 12 houses (Placidus)
  - Natal aspects between all bodies
  - Element balance (Fire/Earth/Air/Water)
  - Modality balance (Cardinal/Fixed/Mutable)
  - Lunar phase at birth
  - City geocoding (no coordinates needed)

- **`thoth transit`** — Calculate transits to natal chart
  - Current sky positions with house placements
  - Transit-to-natal aspects with configurable orb
  - Side-by-side house comparison (transit vs natal)
  - Current lunar phase
  - Retrograde indicators

- **`thoth moon`** — Current moon phase and position
  - Phase name and illumination percentage
  - Sign and degree

- **`thoth ephemeris`** — Ephemeris for any body
  - Position by sign and degree
  - Absolute zodiacal position
  - Retrograde status

- **`thoth key`** — Complete symbol reference guide
  - All planets with meanings, rulerships, and Sephirotic correspondences
  - All zodiac signs with element, modality, ruler, and mantra
  - All 12 houses with life areas
  - All aspects with degrees and Hermetic interpretations
  - Elements with temperaments and Jungian functions
  - Modalities with seasonal correspondences
  - Dignities (Domicile, Exaltation, Detriment, Fall)

#### Design
- **Kabbalistic color system** — Colors mapped to Sephirotic correspondences:
  - ☉ Sun = Gold (Tiphareth)
  - ☽ Moon = Silver (Yesod)
  - ☿ Mercury = Orange (Hod)
  - ♀ Venus = Green (Netzach)
  - ♂ Mars = Red (Geburah)
  - ♃ Jupiter = Royal Blue (Chesed)
  - ♄ Saturn = Indigo (Binah)
  - ♅ Uranus = Cyan (Chokmah)
  - ♆ Neptune = Sea Green
  - ♇ Pluto = Dark Red

- **Consistent notation throughout**
  - Zodiac: ♈♉♊♋♌♍♎♏♐♑♒♓
  - Planets: ☉☽☿♀♂♃♄♅♆♇
  - Points: ⚷ (Chiron), ⚸ (Lilith), ☊☋ (Nodes)
  - Aspects: ☌ (CNJ), ☍ (OPP), △ (TRI), □ (SQR), ⚹ (SXT), ⍟ (QNT), ⚻ (QCX)
  - Elements: 🜂 (Fire), 🜃 (Earth), 🜁 (Air), 🜄 (Water)

- **Clean, lean output** — Information-dense without clutter
- **JSON output** — `--json` flag for programmatic use

#### Technical
- Python core using Kerykeion + Swiss Ephemeris
- TypeScript CLI wrapper with Commander.js
- City geocoding via Geonames (built into Kerykeion)
- Cross-platform: macOS, Linux, Windows

### Architecture

```
thoth-cli/
├── packages/
│   ├── core/          # Python (Kerykeion calculations)
│   │   └── thoth_core/
│   │       └── cli.py
│   └── cli/           # TypeScript (user interface)
│       └── src/
│           ├── bin.ts
│           └── lib/
│               ├── core.ts
│               └── format.ts
```

---

### Privacy

**No data collection. Ever.** All calculations run locally. No analytics, no telemetry, no tracking.

### License

MIT — Free for any use.

---

*"As above, so below; as the universe, so the soul."*
