"""
Thoth Tarot Module
𓅝 True randomness via cryptographic entropy

The LLM never picks cards — only interprets what entropy selects.
"""

import secrets
from datetime import datetime
from typing import Optional, List

# The 78 Cards of the Tarot
# Structure: Major Arcana (0-21), then Minors by suit (Wands, Cups, Swords, Pentacles)

MAJOR_ARCANA = [
    {
        "number": 0, "name": "The Fool", "arcana": "major",
        "hebrew": "א (Aleph)", "path": 11, "element": "Air",
        "keywords_upright": ["beginnings", "innocence", "spontaneity", "free spirit", "leap of faith"],
        "keywords_reversed": ["recklessness", "risk-taking", "holding back", "foolishness"],
    },
    {
        "number": 1, "name": "The Magician", "arcana": "major",
        "hebrew": "ב (Beth)", "path": 12, "planet": "Mercury",
        "keywords_upright": ["manifestation", "willpower", "skill", "resourcefulness", "power"],
        "keywords_reversed": ["manipulation", "poor planning", "untapped talents", "trickery"],
    },
    {
        "number": 2, "name": "The High Priestess", "arcana": "major",
        "hebrew": "ג (Gimel)", "path": 13, "planet": "Moon",
        "keywords_upright": ["intuition", "mystery", "unconscious", "inner voice", "divine feminine"],
        "keywords_reversed": ["secrets", "withdrawal", "silence", "blocked intuition"],
    },
    {
        "number": 3, "name": "The Empress", "arcana": "major",
        "hebrew": "ד (Daleth)", "path": 14, "planet": "Venus",
        "keywords_upright": ["fertility", "abundance", "nature", "nurturing", "sensuality"],
        "keywords_reversed": ["creative block", "dependence", "emptiness", "smothering"],
    },
    {
        "number": 4, "name": "The Emperor", "arcana": "major",
        "hebrew": "ה (Heh)", "path": 15, "zodiac": "Aries",
        "keywords_upright": ["authority", "structure", "control", "fatherhood", "stability"],
        "keywords_reversed": ["domination", "rigidity", "lack of discipline", "tyranny"],
    },
    {
        "number": 5, "name": "The Hierophant", "arcana": "major",
        "hebrew": "ו (Vav)", "path": 16, "zodiac": "Taurus",
        "keywords_upright": ["tradition", "conformity", "teaching", "institution", "spiritual wisdom"],
        "keywords_reversed": ["rebellion", "subversion", "new approaches", "freedom"],
    },
    {
        "number": 6, "name": "The Lovers", "arcana": "major",
        "hebrew": "ז (Zayin)", "path": 17, "zodiac": "Gemini",
        "keywords_upright": ["love", "harmony", "relationships", "choices", "alignment"],
        "keywords_reversed": ["disharmony", "imbalance", "misalignment", "bad choices"],
    },
    {
        "number": 7, "name": "The Chariot", "arcana": "major",
        "hebrew": "ח (Cheth)", "path": 18, "zodiac": "Cancer",
        "keywords_upright": ["control", "willpower", "victory", "determination", "direction"],
        "keywords_reversed": ["lack of control", "opposition", "aggression", "no direction"],
    },
    {
        "number": 8, "name": "Strength", "arcana": "major",
        "hebrew": "ט (Teth)", "path": 19, "zodiac": "Leo",
        "keywords_upright": ["courage", "patience", "inner strength", "compassion", "influence"],
        "keywords_reversed": ["self-doubt", "weakness", "insecurity", "raw emotion"],
    },
    {
        "number": 9, "name": "The Hermit", "arcana": "major",
        "hebrew": "י (Yod)", "path": 20, "zodiac": "Virgo",
        "keywords_upright": ["soul-searching", "introspection", "inner guidance", "solitude", "wisdom"],
        "keywords_reversed": ["isolation", "loneliness", "withdrawal", "lost"],
    },
    {
        "number": 10, "name": "Wheel of Fortune", "arcana": "major",
        "hebrew": "כ (Kaph)", "path": 21, "planet": "Jupiter",
        "keywords_upright": ["change", "cycles", "fate", "destiny", "turning point", "luck"],
        "keywords_reversed": ["bad luck", "resistance to change", "breaking cycles"],
    },
    {
        "number": 11, "name": "Justice", "arcana": "major",
        "hebrew": "ל (Lamed)", "path": 22, "zodiac": "Libra",
        "keywords_upright": ["fairness", "truth", "cause and effect", "law", "clarity"],
        "keywords_reversed": ["unfairness", "dishonesty", "lack of accountability"],
    },
    {
        "number": 12, "name": "The Hanged Man", "arcana": "major",
        "hebrew": "מ (Mem)", "path": 23, "element": "Water",
        "keywords_upright": ["pause", "surrender", "new perspective", "letting go", "sacrifice"],
        "keywords_reversed": ["delays", "resistance", "stalling", "indecision"],
    },
    {
        "number": 13, "name": "Death", "arcana": "major",
        "hebrew": "נ (Nun)", "path": 24, "zodiac": "Scorpio",
        "keywords_upright": ["endings", "change", "transformation", "transition", "release"],
        "keywords_reversed": ["resistance to change", "inability to move on", "stagnation"],
    },
    {
        "number": 14, "name": "Temperance", "arcana": "major",
        "hebrew": "ס (Samekh)", "path": 25, "zodiac": "Sagittarius",
        "keywords_upright": ["balance", "moderation", "patience", "purpose", "alchemy"],
        "keywords_reversed": ["imbalance", "excess", "lack of long-term vision"],
    },
    {
        "number": 15, "name": "The Devil", "arcana": "major",
        "hebrew": "ע (Ayin)", "path": 26, "zodiac": "Capricorn",
        "keywords_upright": ["shadow self", "attachment", "addiction", "materialism", "bondage"],
        "keywords_reversed": ["releasing limiting beliefs", "breaking free", "detachment"],
    },
    {
        "number": 16, "name": "The Tower", "arcana": "major",
        "hebrew": "פ (Peh)", "path": 27, "planet": "Mars",
        "keywords_upright": ["sudden change", "upheaval", "revelation", "chaos", "awakening"],
        "keywords_reversed": ["fear of change", "avoiding disaster", "delaying inevitable"],
    },
    {
        "number": 17, "name": "The Star", "arcana": "major",
        "hebrew": "צ (Tzaddi)", "path": 28, "zodiac": "Aquarius",
        "keywords_upright": ["hope", "faith", "renewal", "serenity", "inspiration", "healing"],
        "keywords_reversed": ["lack of faith", "despair", "disconnection"],
    },
    {
        "number": 18, "name": "The Moon", "arcana": "major",
        "hebrew": "ק (Qoph)", "path": 29, "zodiac": "Pisces",
        "keywords_upright": ["illusion", "fear", "anxiety", "intuition", "unconscious", "dreams"],
        "keywords_reversed": ["release of fear", "repressed emotion", "clarity"],
    },
    {
        "number": 19, "name": "The Sun", "arcana": "major",
        "hebrew": "ר (Resh)", "path": 30, "planet": "Sun",
        "keywords_upright": ["joy", "success", "positivity", "vitality", "celebration", "truth"],
        "keywords_reversed": ["inner child", "sadness", "overly optimistic"],
    },
    {
        "number": 20, "name": "Judgement", "arcana": "major",
        "hebrew": "ש (Shin)", "path": 31, "element": "Fire",
        "keywords_upright": ["reflection", "reckoning", "awakening", "rebirth", "calling"],
        "keywords_reversed": ["self-doubt", "refusal of self-examination", "ignoring call"],
    },
    {
        "number": 21, "name": "The World", "arcana": "major",
        "hebrew": "ת (Tau)", "path": 32, "planet": "Saturn",
        "keywords_upright": ["completion", "integration", "accomplishment", "travel", "wholeness"],
        "keywords_reversed": ["lack of completion", "lack of closure", "stagnation"],
    },
]

# Minor Arcana by suit
SUITS = {
    "wands": {"element": "Fire", "domain": "will, creativity, passion, enterprise"},
    "cups": {"element": "Water", "domain": "emotions, relationships, intuition"},
    "swords": {"element": "Air", "domain": "thought, conflict, truth, intellect"},
    "pentacles": {"element": "Earth", "domain": "material, work, body, resources"},
}

RANKS = [
    {"rank": "ace", "sephira": "Kether", "theme": "source, potential, seed"},
    {"rank": "two", "sephira": "Chokmah", "theme": "duality, balance, choice"},
    {"rank": "three", "sephira": "Binah", "theme": "growth, creativity, expression"},
    {"rank": "four", "sephira": "Chesed", "theme": "stability, foundation, structure"},
    {"rank": "five", "sephira": "Geburah", "theme": "conflict, loss, challenge"},
    {"rank": "six", "sephira": "Tiphareth", "theme": "harmony, success, balance"},
    {"rank": "seven", "sephira": "Netzach", "theme": "assessment, reflection, perseverance"},
    {"rank": "eight", "sephira": "Hod", "theme": "movement, speed, change"},
    {"rank": "nine", "sephira": "Yesod", "theme": "fruition, attainment, near-completion"},
    {"rank": "ten", "sephira": "Malkuth", "theme": "completion, ending, manifestation"},
    {"rank": "page", "court": True, "theme": "student, message, new energy"},
    {"rank": "knight", "court": True, "theme": "action, movement, quest"},
    {"rank": "queen", "court": True, "theme": "mastery, nurturing, inward"},
    {"rank": "king", "court": True, "theme": "authority, command, outward"},
]

# Minor Arcana keywords by suit and rank
MINOR_KEYWORDS = {
    "wands": {
        "ace": (["inspiration", "new opportunity", "potential", "power"], ["delays", "lack of motivation"]),
        "two": (["planning", "decisions", "discovery", "progress"], ["fear of unknown", "lack of planning"]),
        "three": (["expansion", "foresight", "enterprise", "growth"], ["obstacles", "delays", "frustration"]),
        "four": (["celebration", "harmony", "homecoming", "prosperity"], ["lack of support", "transience"]),
        "five": (["competition", "conflict", "tension", "diversity"], ["avoiding conflict", "inner conflict"]),
        "six": (["victory", "recognition", "success", "pride"], ["fall from grace", "ego"]),
        "seven": (["defense", "perseverance", "standing ground"], ["giving up", "overwhelmed"]),
        "eight": (["speed", "movement", "swift action", "travel"], ["delays", "frustration", "waiting"]),
        "nine": (["resilience", "persistence", "last stand", "boundaries"], ["exhaustion", "paranoia"]),
        "ten": (["burden", "responsibility", "hard work", "completion"], ["carrying too much", "breakdown"]),
        "page": (["enthusiasm", "exploration", "discovery", "potential"], ["lack of direction", "procrastination"]),
        "knight": (["energy", "passion", "adventure", "impulsiveness"], ["haste", "scattered energy"]),
        "queen": (["courage", "confidence", "determination", "independence"], ["jealousy", "selfishness"]),
        "king": (["leadership", "vision", "entrepreneur", "honor"], ["impulsiveness", "ruthlessness"]),
    },
    "cups": {
        "ace": (["new love", "compassion", "creativity", "emotion"], ["blocked emotions", "emptiness"]),
        "two": (["partnership", "unity", "attraction", "connection"], ["imbalance", "broken communication"]),
        "three": (["celebration", "friendship", "creativity", "community"], ["overindulgence", "gossip"]),
        "four": (["apathy", "contemplation", "disconnection", "meditation"], ["retreat", "depression"]),
        "five": (["loss", "grief", "disappointment", "regret"], ["acceptance", "moving on"]),
        "six": (["nostalgia", "memories", "childhood", "innocence"], ["living in past", "unrealistic"]),
        "seven": (["illusion", "choices", "fantasy", "wishful thinking"], ["clarity", "reality check"]),
        "eight": (["abandonment", "walking away", "seeking truth"], ["fear of change", "stagnation"]),
        "nine": (["contentment", "satisfaction", "wish fulfilled", "gratitude"], ["dissatisfaction", "greed"]),
        "ten": (["harmony", "family", "fulfillment", "alignment"], ["dysfunction", "broken home"]),
        "page": (["creative opportunity", "curiosity", "intuition"], ["emotional immaturity", "escapism"]),
        "knight": (["romance", "imagination", "charm", "idealism"], ["moodiness", "unrealistic"]),
        "queen": (["compassion", "calm", "comfort", "intuitive"], ["insecurity", "dependence"]),
        "king": (["emotional balance", "diplomacy", "devotion"], ["manipulation", "moodiness"]),
    },
    "swords": {
        "ace": (["clarity", "breakthrough", "new idea", "truth"], ["confusion", "chaos", "brutality"]),
        "two": (["difficult decision", "stalemate", "denial", "blocked"], ["indecision", "information overload"]),
        "three": (["heartbreak", "sorrow", "grief", "separation"], ["recovery", "forgiveness"]),
        "four": (["rest", "recovery", "contemplation", "restoration"], ["restlessness", "burnout"]),
        "five": (["conflict", "defeat", "hostility", "tension"], ["reconciliation", "moving on"]),
        "six": (["transition", "leaving behind", "moving on", "travel"], ["resistance", "unfinished business"]),
        "seven": (["deception", "strategy", "resourcefulness", "cunning"], ["confession", "conscience"]),
        "eight": (["restriction", "imprisonment", "victim mentality"], ["freedom", "release", "new perspective"]),
        "nine": (["anxiety", "worry", "fear", "nightmares", "despair"], ["hope", "reaching out"]),
        "ten": (["painful ending", "betrayal", "crisis", "rock bottom"], ["recovery", "regeneration"]),
        "page": (["curiosity", "new ideas", "thirst for knowledge"], ["scattered thoughts", "cynicism"]),
        "knight": (["ambition", "action", "drive", "fast thinking"], ["impatience", "recklessness"]),
        "queen": (["independence", "perception", "clear boundaries"], ["cold", "bitter", "cruel"]),
        "king": (["intellectual power", "authority", "truth", "ethics"], ["manipulation", "tyranny"]),
    },
    "pentacles": {
        "ace": (["opportunity", "prosperity", "new venture", "manifestation"], ["lost opportunity", "scarcity"]),
        "two": (["balance", "adaptability", "time management", "juggling"], ["imbalance", "disorganization"]),
        "three": (["teamwork", "collaboration", "learning", "building"], ["lack of teamwork", "mediocrity"]),
        "four": (["security", "conservation", "control", "stability"], ["greed", "materialism", "possessiveness"]),
        "five": (["hardship", "loss", "isolation", "worry", "poverty"], ["recovery", "improvement"]),
        "six": (["generosity", "giving", "sharing", "charity", "prosperity"], ["debt", "selfishness"]),
        "seven": (["patience", "investment", "perseverance", "reward"], ["impatience", "lack of reward"]),
        "eight": (["skill", "craftsmanship", "diligence", "mastery"], ["perfectionism", "lack of ambition"]),
        "nine": (["luxury", "self-sufficiency", "abundance", "discipline"], ["overindulgence", "superficiality"]),
        "ten": (["wealth", "inheritance", "family", "legacy", "establishment"], ["financial failure", "loss"]),
        "page": (["manifestation", "new skill", "scholarship"], ["lack of progress", "procrastination"]),
        "knight": (["hard work", "productivity", "routine", "efficiency"], ["boredom", "laziness"]),
        "queen": (["practicality", "nurturing", "financial security"], ["self-centeredness", "jealousy"]),
        "king": (["abundance", "security", "discipline", "leadership"], ["greed", "materialism"]),
    },
}


def build_deck() -> List[dict]:
    """Build the full 78-card deck."""
    deck = []
    
    # Add Major Arcana
    for card in MAJOR_ARCANA:
        deck.append(card)
    
    # Add Minor Arcana
    card_num = 22
    for suit_name, suit_info in SUITS.items():
        for rank_info in RANKS:
            rank = rank_info["rank"]
            keywords = MINOR_KEYWORDS[suit_name][rank]
            
            card = {
                "number": card_num,
                "name": f"{rank.title()} of {suit_name.title()}",
                "arcana": "minor",
                "suit": suit_name,
                "rank": rank,
                "element": suit_info["element"],
                "domain": suit_info["domain"],
                "sephira": rank_info.get("sephira"),
                "theme": rank_info["theme"],
                "keywords_upright": keywords[0],
                "keywords_reversed": keywords[1],
            }
            deck.append(card)
            card_num += 1
    
    return deck


# Build deck once at module load
DECK = build_deck()


def draw_cards(count: int = 1, reversals: bool = True, question: str = None, spread: str = "single") -> dict:
    """
    Draw cards using cryptographically secure randomness.
    
    The entropy comes from secrets.SystemRandom which uses /dev/urandom
    on Unix systems - true randomness from system entropy pool.
    """
    rng = secrets.SystemRandom()
    
    # Shuffle deck indices
    indices = list(range(78))
    rng.shuffle(indices)
    
    # Get spread positions
    positions = SPREADS.get(spread, {}).get("positions", [f"Card {i+1}" for i in range(count)])
    
    # Draw cards
    cards = []
    for i in range(min(count, 78)):
        card = DECK[indices[i]].copy()
        card["reversed"] = rng.choice([True, False]) if reversals else False
        card["position"] = i + 1
        card["position_name"] = positions[i] if i < len(positions) else f"Card {i+1}"
        cards.append(card)
    
    return {
        "type": "Tarot Draw",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "entropy_source": "secrets.SystemRandom",
        "question": question,
        "spread": spread,
        "spread_name": SPREADS.get(spread, {}).get("name", spread),
        "cards": cards,
        "total_cards": len(cards),
    }


def get_card(identifier: str) -> dict:
    """Look up a card by name or number."""
    # Try as number
    try:
        num = int(identifier)
        if 0 <= num < 78:
            return DECK[num]
    except ValueError:
        pass
    
    # Try as name (case insensitive)
    identifier_lower = identifier.lower()
    for card in DECK:
        if card["name"].lower() == identifier_lower:
            return card
        # Also match partial (e.g., "tower" matches "The Tower")
        if identifier_lower in card["name"].lower():
            return card
    
    return None


def get_deck(filter_type: str = None) -> List[dict]:
    """Get the full deck or filtered subset."""
    if filter_type is None:
        return DECK
    
    filter_lower = filter_type.lower()
    
    if filter_lower in ("major", "majors", "major arcana"):
        return [c for c in DECK if c["arcana"] == "major"]
    elif filter_lower in ("minor", "minors", "minor arcana"):
        return [c for c in DECK if c["arcana"] == "minor"]
    elif filter_lower in SUITS:
        return [c for c in DECK if c.get("suit") == filter_lower]
    
    return DECK


# Spread definitions
SPREADS = {
    "single": {
        "name": "Single Card",
        "count": 1,
        "positions": ["The Card"],
        "description": "A single card for quick insight or daily guidance.",
    },
    "3-card": {
        "name": "Three Card Spread",
        "count": 3,
        "positions": ["Past", "Present", "Future"],
        "description": "Past influences, present situation, future direction.",
    },
    "celtic": {
        "name": "Celtic Cross",
        "count": 10,
        "positions": [
            "Significator (Present)",
            "Crossing (Challenge)",
            "Foundation (Root)",
            "Recent Past",
            "Crown (Potential)",
            "Near Future",
            "Self (Attitude)",
            "Environment",
            "Hopes & Fears",
            "Outcome",
        ],
        "description": "The classic comprehensive spread for deep questions.",
    },
    "horseshoe": {
        "name": "Horseshoe Spread",
        "count": 7,
        "positions": [
            "Past",
            "Present",
            "Hidden Influences",
            "Obstacles",
            "External Influences",
            "Advice",
            "Outcome",
        ],
        "description": "A versatile spread for situation analysis.",
    },
    "relationship": {
        "name": "Relationship Spread",
        "count": 6,
        "positions": [
            "You",
            "The Other",
            "The Connection",
            "Challenges",
            "Strengths",
            "Potential",
        ],
        "description": "Insight into a relationship dynamic.",
    },
    "decision": {
        "name": "Decision Spread",
        "count": 5,
        "positions": [
            "The Situation",
            "Option A",
            "Option B",
            "What You Need to Know",
            "Advice",
        ],
        "description": "Help with a choice between two paths.",
    },
}
