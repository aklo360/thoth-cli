# thoth-cli

Divination tools for the terminal. Swiss Ephemeris for astrology, cryptographic randomness for tarot, classical gematria, Pythagorean numerology.

## Installation

```bash
npm install -g thoth-cli
```

## ⚖️ GOLDEN RULE

**NEVER fabricate planetary positions, card draws, or gematria values. ALWAYS run the CLI first, then interpret.**

The CLI provides the DATA. You provide the INTERPRETATION.

---

## Astrology

Swiss Ephemeris calculations — same engine NASA uses. Accurate to the arcminute.

### Natal Chart

```bash
thoth chart --date 1991-07-08 --time 14:06 --city "New York" --nation US --name "Person"
```

### Current Transits

```bash
thoth transit --natal-date 1991-07-08 --natal-time 14:06 --city "New York" --nation US
# Add --orb 1 for tight orbs only
```

### Future Transits

```bash
thoth transit --natal-date 1991-07-08 --natal-time 14:06 --city "New York" --nation US --transit-date 2027-01-15
```

### Solar Return (Annual)

```bash
thoth solar-return --natal-date 1991-07-08 --natal-time 14:06 --city "New York" --nation US --year 2026
```

### Lunar Return (Monthly)

```bash
thoth lunar-return --natal-date 1991-07-08 --natal-time 14:06 --city "New York" --nation US --year 2026 --month 3
```

### Synastry (Relationship)

```bash
thoth synastry --date1 1991-07-08 --time1 14:06 --city1 "New York" --nation1 US \
               --date2 1990-01-15 --time2 09:30 --city2 "Los Angeles" --nation2 US
```

### Composite Chart

```bash
thoth composite --date1 1991-07-08 --time1 14:06 --city1 "New York" --nation1 US \
                --date2 1990-01-15 --time2 09:30 --city2 "Los Angeles" --nation2 US
```

### Compatibility Score

```bash
thoth score --date1 1991-07-08 --time1 14:06 --city1 "New York" --nation1 US \
            --date2 1990-01-15 --time2 09:30 --city2 "Los Angeles" --nation2 US
```

### Progressions

```bash
thoth progressions --natal-date 1991-07-08 --natal-time 14:06 --city "New York" --nation US --prog-year 2026
```

### Solar Arc

```bash
thoth solar-arc --natal-date 1991-07-08 --natal-time 14:06 --city "New York" --nation US --arc-year 2026
```

### Horary

```bash
thoth horary --question "Should I take the job?" --city "New York" --nation US
```

### Moon Phase

```bash
thoth moon              # Current phase
thoth moon -e           # Extended (eclipses, sunrise/sunset)
thoth moon --date 2026-03-14
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
thoth transit-scan --natal-date 1991-07-08 --natal-time 14:06 --city "New York" --nation US \
                   --start-year 2026 --end-year 2027 --orb 1
```

### Symbol Key

```bash
thoth key
```

---

## Tarot

Cryptographic randomness via `secrets.SystemRandom`. The CLI draws cards — you interpret.

### Draw Cards

```bash
thoth tarot                          # Single card
thoth tarot -s 3-card                # Past/Present/Future
thoth tarot -s celtic                # Celtic Cross (10 cards)
thoth tarot -s horseshoe             # Horseshoe (7 cards)
thoth tarot -s relationship          # Relationship (6 cards)
thoth tarot -s decision              # Decision (5 cards)
thoth tarot -q "My question?"        # With question
thoth tarot --no-reversals           # Upright only
thoth tarot --json                   # Raw JSON
```

### Card Lookup

```bash
thoth tarot-card "The Tower"
thoth tarot-card "death"
thoth tarot-card 13                  # By number
thoth tarot-card "ace of cups"
```

### List Cards

```bash
thoth tarot-deck                     # All 78 cards
thoth tarot-deck -f major            # Major Arcana only
thoth tarot-deck -f cups             # Cups suit only
```

### List Spreads

```bash
thoth tarot-spreads
```

---

## Gematria

Classical Hebrew, Greek, and English letter-number systems.

### Calculate

```bash
thoth gematria "AKLO"                    # All systems
thoth gematria "אהבה"                     # Hebrew input
thoth gematria "Love" --compare "Will"   # Compare words
thoth gematria "Thelema" --system hebrew-standard
thoth gematria "AKLO" --json
```

### Lookup by Value

```bash
thoth gematria-lookup 93              # Find words = 93
thoth gematria-lookup 418 --limit 10
```

### Systems

| System | Key |
|--------|-----|
| Hebrew Standard | `hebrew-standard` |
| Hebrew Ordinal | `hebrew-ordinal` |
| Hebrew Reduced | `hebrew-reduced` |
| Greek Isopsephy | `greek` |
| English Ordinal | `english-ordinal` |
| English Reduced | `english-reduced` |
| English Sumerian | `english-sumerian` |
| English Reverse | `english-reverse` |

---

## Numerology

Pythagorean system. Master numbers (11, 22, 33) preserved.

### Full Profile

```bash
thoth numerology --date 1991-07-08 --name "John Smith"
```

### Life Path Only

```bash
thoth numerology --date 1991-07-08
```

### Name Numbers Only

```bash
thoth numerology --name "John Smith"
```

### Personal Cycles

```bash
thoth numerology-year --date 1991-07-08                    # Current cycles
thoth numerology-year --date 1991-07-08 --target-date 2026-06-15
```

### Core Numbers

| Number | Calculated From |
|--------|-----------------|
| Life Path | Birth date reduced |
| Expression | Full name letters |
| Soul Urge | Vowels only |
| Personality | Consonants only |
| Personal Year | Birth month + day + current year |

---

## Interpretation Guidelines

1. **Run the CLI first** — get the raw data
2. **Note ALL positions/cards/numbers** — don't cherry-pick
3. **Identify dominant patterns** — tightest aspects, repeated themes
4. **Synthesize holistically** — the whole picture matters
5. **Ground in tradition** — Hermetic, Kabbalistic, classical systems
6. **Acknowledge uncertainty** — divination reveals pattern, not fate
