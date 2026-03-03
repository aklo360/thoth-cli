---
name: thoth-cli
description: "Divination tools: astrology (natal charts, transits, synastry, returns), tarot (cryptographic shuffling), gematria (Hebrew/Greek/English), numerology (Pythagorean). Use when asked about planetary positions, birth charts, card readings, letter-number values, life path numbers, or any divination/occult question. ALWAYS run CLI first—never fabricate positions or draws."
---

# thoth-cli — Hermetic Divination Tools

Swiss Ephemeris for astrology. `secrets.SystemRandom` for tarot. Classical gematria. Pythagorean numerology.

## ⚖️ GOLDEN RULE

**NEVER fabricate planetary positions, card draws, or calculated values. Run the CLI first, then interpret.**

```
PHASE 1: DATA (CLI)          PHASE 2: INTERPRETATION (You)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLI generates objective      You interpret the results
empirical data               using Hermetic-Kabbalistic tradition

⛔ No guessing               ✅ Ground in tradition
⛔ No fabricating            ✅ Synthesize holistically
```

## Installation

```bash
npm install -g thoth-cli
```

---

## Astrology

### Natal Chart
```bash
thoth chart --date 1879-03-14 --time 11:30 --city "New York" --nation US
```

### Transits (Current)
```bash
thoth transit --natal-date 1879-03-14 --natal-time 11:30 --city "New York" --nation US --orb 1
```

### Transits (Future Date)
```bash
thoth transit --natal-date 1879-03-14 --natal-time 11:30 --city "New York" --nation US --transit-date 2027-01-15
```

### Solar Return
```bash
thoth solar-return --natal-date 1879-03-14 --natal-time 11:30 --city "New York" --nation US --year 2026
```

### Lunar Return
```bash
thoth lunar-return --natal-date 1879-03-14 --natal-time 11:30 --city "New York" --nation US --year 2026 --month 3
```

### Synastry
```bash
thoth synastry --date1 1879-03-14 --time1 11:30 --city1 "New York" --nation1 US \
               --date2 1990-01-15 --time2 09:30 --city2 "Los Angeles" --nation2 US
```

### Composite
```bash
thoth composite --date1 1879-03-14 --time1 11:30 --city1 "New York" --nation1 US \
                --date2 1990-01-15 --time2 09:30 --city2 "Los Angeles" --nation2 US
```

### Compatibility Score
```bash
thoth score --date1 1879-03-14 --time1 11:30 --city1 "New York" --nation1 US \
            --date2 1990-01-15 --time2 09:30 --city2 "Los Angeles" --nation2 US
```

### Progressions
```bash
thoth progressions --natal-date 1879-03-14 --natal-time 11:30 --city "New York" --nation US --prog-year 2026
```

### Solar Arc
```bash
thoth solar-arc --natal-date 1879-03-14 --natal-time 11:30 --city "New York" --nation US --arc-year 2026
```

### Horary
```bash
thoth horary --question "Should I take the job?" --city "New York" --nation US
```

### Moon Phase
```bash
thoth moon                    # Current
thoth moon -e                 # Extended
thoth moon --date 2026-03-14  # Specific date
```

### Ephemeris
```bash
thoth ephemeris --body pluto
thoth ephemeris --body saturn --date 2027-01-15
thoth ephemeris-range --body pluto --start-year 2024 --end-year 2030 --step month
thoth ephemeris-multi --bodies sun,moon,mars --start-year 2026 --end-year 2026 --step month
```

### Transit Scan
```bash
thoth transit-scan --natal-date 1879-03-14 --natal-time 11:30 --city "New York" --nation US \
                   --start-year 2026 --end-year 2027 --orb 1
```

### Symbol Key
```bash
thoth key
```

---

## Tarot

Uses `secrets.SystemRandom` — true cryptographic entropy.

### Draw Cards
```bash
thoth tarot                   # Single card
thoth tarot -s 3-card         # Past/Present/Future
thoth tarot -s celtic         # Celtic Cross (10)
thoth tarot -s horseshoe      # Horseshoe (7)
thoth tarot -s relationship   # Relationship (6)
thoth tarot -s decision       # Decision (5)
thoth tarot -q "Question?"    # With question
thoth tarot --no-reversals    # Upright only
thoth tarot --json            # Raw JSON
```

### Card Lookup
```bash
thoth tarot-card "The Tower"
thoth tarot-card "ace of cups"
thoth tarot-card 13           # By number
```

### List Cards/Spreads
```bash
thoth tarot-deck              # All 78
thoth tarot-deck -f major     # Majors only
thoth tarot-spreads           # Available spreads
```

---

## Gematria

Classical Hebrew, Greek, English letter-number systems.

### Calculate
```bash
thoth gematria "Word"                      # All systems
thoth gematria "Love" --compare "Will"     # Compare
thoth gematria "Word" --system hebrew-standard
```

### Lookup by Value
```bash
thoth gematria-lookup 93                   # Find words = 93
thoth gematria-lookup 418 --limit 10
```

### Systems
- `hebrew-standard` — Traditional (א=1...ת=400)
- `hebrew-ordinal` — Position (א=1...ת=22)
- `hebrew-reduced` — Digital root
- `greek` — Isopsephy
- `english-ordinal` — A=1...Z=26
- `english-reduced` — Digital root
- `english-sumerian` — A=6...Z=156
- `english-reverse` — Z=1...A=26

---

## Numerology

Pythagorean system. Master numbers (11, 22, 33) preserved.

### Full Profile
```bash
thoth numerology --date 1879-03-14 --name "Full Name"
```

### Life Path Only
```bash
thoth numerology --date 1879-03-14
```

### Name Numbers Only
```bash
thoth numerology --name "Full Name"
```

### Personal Cycles
```bash
thoth numerology-year --date 1879-03-14
thoth numerology-year --date 1879-03-14 --target-date 2026-06-15
```

### Core Numbers
| Number | Source |
|--------|--------|
| Life Path | Birth date |
| Expression | Full name |
| Soul Urge | Vowels |
| Personality | Consonants |
| Personal Year | Birth M+D + current year |

---

## Interpretation Protocol

1. Run CLI → get raw data
2. Note ALL positions/cards/values
3. Identify dominant patterns
4. Synthesize holistically
5. Ground in Hermetic-Kabbalistic tradition
6. Acknowledge uncertainty — pattern, not fate
