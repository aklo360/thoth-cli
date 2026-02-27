#!/usr/bin/env python3
"""
Thoth Core CLI - JSON output for TypeScript wrapper
All commands output JSON to stdout for consumption by thoth-cli
"""

import typer
import json
import sys
from typing import Optional
from datetime import datetime

app = typer.Typer(
    name="thoth-core",
    help="Astrological calculation engine. Outputs JSON.",
    add_completion=False,
)


def output_json(data: dict) -> None:
    """Output JSON to stdout."""
    print(json.dumps(data, indent=2, default=str))


def output_error(message: str, code: int = 1) -> None:
    """Output error as JSON and exit."""
    print(json.dumps({"error": message}), file=sys.stderr)
    raise typer.Exit(code)


@app.command()
def chart(
    year: int = typer.Option(..., help="Birth year"),
    month: int = typer.Option(..., help="Birth month"),
    day: int = typer.Option(..., help="Birth day"),
    hour: int = typer.Option(12, help="Birth hour (24h)"),
    minute: int = typer.Option(0, help="Birth minute"),
    lat: Optional[float] = typer.Option(None, help="Latitude"),
    lng: Optional[float] = typer.Option(None, help="Longitude"),
    city: Optional[str] = typer.Option(None, help="City name (e.g., 'New York')"),
    nation: str = typer.Option("US", help="Country code (e.g., 'US', 'UK', 'BR')"),
    name: str = typer.Option("Subject", help="Subject name"),
):
    """Calculate natal chart."""
    try:
        from kerykeion import AstrologicalSubject
        
        # Use city/nation if provided, otherwise use lat/lng
        if city:
            subject = AstrologicalSubject(
                name,
                year, month, day,
                hour, minute,
                city=city,
                nation=nation,
            )
        elif lat is not None and lng is not None:
            subject = AstrologicalSubject(
                name,
                year, month, day,
                hour, minute,
                lat=lat,
                lng=lng,
            )
        else:
            output_error("Must provide either --city or both --lat and --lng")
        
        # Build planet data
        planets = {}
        planet_names = [
            'sun', 'moon', 'mercury', 'venus', 'mars', 
            'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
            'chiron', 'mean_lilith', 'true_north_lunar_node', 'true_south_lunar_node'
        ]
        for planet_name in planet_names:
            planet = getattr(subject, planet_name, None)
            if planet:
                # Clean up house name
                house_str = None
                if hasattr(planet, 'house') and planet.house:
                    house_str = planet.house.replace('_', ' ').title()
                
                planets[planet_name] = {
                    "sign": planet.sign,
                    "position": round(planet.position, 4),
                    "abs_position": round(planet.abs_pos, 4),
                    "house": house_str,
                    "retrograde": planet.retrograde if hasattr(planet, 'retrograde') else False,
                }
        
        # Houses (all 12)
        house_names = [
            'first_house', 'second_house', 'third_house', 'fourth_house',
            'fifth_house', 'sixth_house', 'seventh_house', 'eighth_house',
            'ninth_house', 'tenth_house', 'eleventh_house', 'twelfth_house'
        ]
        houses = {}
        for i, house_name in enumerate(house_names, 1):
            house = getattr(subject, house_name, None)
            if house:
                houses[str(i)] = {
                    "sign": house.sign,
                    "position": round(house.position, 4),
                }
        
        # Natal Aspects
        from kerykeion import NatalAspects
        natal_aspects = NatalAspects(subject)
        aspects = []
        for asp in natal_aspects.all_aspects:
            # Only include major aspects with orb <= 8
            if asp['orbit'] <= 8:
                aspects.append({
                    "planet1": asp['p1_name'],
                    "planet2": asp['p2_name'],
                    "aspect": asp['aspect'],
                    "orb": round(asp['orbit'], 2),
                })
        
        # Element and Modality balance
        element_map = {
            'Ari': 'Fire', 'Tau': 'Earth', 'Gem': 'Air', 'Can': 'Water',
            'Leo': 'Fire', 'Vir': 'Earth', 'Lib': 'Air', 'Sco': 'Water',
            'Sag': 'Fire', 'Cap': 'Earth', 'Aqu': 'Air', 'Pis': 'Water'
        }
        mode_map = {
            'Ari': 'Cardinal', 'Tau': 'Fixed', 'Gem': 'Mutable', 'Can': 'Cardinal',
            'Leo': 'Fixed', 'Vir': 'Mutable', 'Lib': 'Cardinal', 'Sco': 'Fixed',
            'Sag': 'Mutable', 'Cap': 'Cardinal', 'Aqu': 'Fixed', 'Pis': 'Mutable'
        }
        elements = {"Fire": 0, "Earth": 0, "Air": 0, "Water": 0}
        modes = {"Cardinal": 0, "Fixed": 0, "Mutable": 0}
        
        for p in ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn']:
            planet = getattr(subject, p, None)
            if planet:
                elements[element_map[planet.sign]] += 1
                modes[mode_map[planet.sign]] += 1
        
        # Lunar phase at birth
        lunar_phase = None
        if hasattr(subject, 'lunar_phase') and subject.lunar_phase:
            lunar_phase = {
                "name": subject.lunar_phase.moon_phase_name,
                "emoji": subject.lunar_phase.moon_emoji,
            }
        
        output_json({
            "name": name,
            "datetime": {
                "year": year,
                "month": month,
                "day": day,
                "hour": hour,
                "minute": minute,
            },
            "location": {
                "lat": subject.lat if hasattr(subject, 'lat') else lat,
                "lng": subject.lng if hasattr(subject, 'lng') else lng,
                "city": subject.city if hasattr(subject, 'city') else None,
            },
            "planets": planets,
            "houses": houses,
            "aspects": aspects,
            "elements": elements,
            "modes": modes,
            "lunar_phase": lunar_phase,
            "ascendant": {
                "sign": subject.first_house.sign if hasattr(subject, 'first_house') else None,
                "position": round(subject.first_house.position, 4) if hasattr(subject, 'first_house') else None,
            },
            "midheaven": {
                "sign": subject.tenth_house.sign if hasattr(subject, 'tenth_house') else None,
                "position": round(subject.tenth_house.position, 4) if hasattr(subject, 'tenth_house') else None,
            },
        })
        
    except Exception as e:
        output_error(str(e))


@app.command()
def transit(
    natal_year: int = typer.Option(..., help="Natal year"),
    natal_month: int = typer.Option(..., help="Natal month"),
    natal_day: int = typer.Option(..., help="Natal day"),
    natal_hour: int = typer.Option(12, help="Natal hour"),
    natal_minute: int = typer.Option(0, help="Natal minute"),
    natal_lat: Optional[float] = typer.Option(None, help="Natal latitude"),
    natal_lng: Optional[float] = typer.Option(None, help="Natal longitude"),
    natal_city: Optional[str] = typer.Option(None, help="Natal city (e.g., 'New York')"),
    nation: str = typer.Option("US", help="Country code (e.g., 'US', 'UK')"),
    transit_year: Optional[int] = typer.Option(None, help="Transit year (default: now)"),
    transit_month: Optional[int] = typer.Option(None, help="Transit month"),
    transit_day: Optional[int] = typer.Option(None, help="Transit day"),
    orb: float = typer.Option(3.0, help="Orb for aspects in degrees"),
):
    """Calculate transits to natal chart."""
    try:
        from kerykeion import AstrologicalSubject
        
        # Create natal subject
        if natal_city:
            natal = AstrologicalSubject(
                "Natal",
                natal_year, natal_month, natal_day,
                natal_hour, natal_minute,
                city=natal_city,
                nation=nation,
            )
        elif natal_lat is not None and natal_lng is not None:
            natal = AstrologicalSubject(
                "Natal",
                natal_year, natal_month, natal_day,
                natal_hour, natal_minute,
                lat=natal_lat,
                lng=natal_lng,
            )
        else:
            output_error("Must provide either --natal-city or both --natal-lat and --natal-lng")
            return
        
        # Create transit subject (default to now)
        now = datetime.now()
        transit_subj = AstrologicalSubject(
            "Transit",
            transit_year or now.year,
            transit_month or now.month,
            transit_day or now.day,
            now.hour, now.minute,
            city=natal_city if natal_city else None,
            nation=nation if natal_city else None,
            lat=natal_lat if natal_lat else None,
            lng=natal_lng if natal_lng else None,
        )
        
        # Get transit aspects using Kerykeion's SynastryAspects
        from kerykeion import SynastryAspects
        synastry = SynastryAspects(transit_subj, natal)
        
        # Build lookups for planet houses
        # Short name mapping
        short_names = {
            'True_North_Lunar_Node': 'NN',
            'True_South_Lunar_Node': 'SN', 
            'Mean_Lilith': 'Lilith',
            'Medium_Coeli': 'MC',
            'Imum_Coeli': 'IC',
            'Ascendant': 'ASC',
            'Descendant': 'DSC',
        }
        
        def get_short_name(name):
            return short_names.get(name, name)
        
        # House name to number mapping
        def house_to_num(house_str):
            if not house_str:
                return None
            house_str = house_str.lower().replace('_', ' ')
            house_map = {
                'first house': 1, 'second house': 2, 'third house': 3, 'fourth house': 4,
                'fifth house': 5, 'sixth house': 6, 'seventh house': 7, 'eighth house': 8,
                'ninth house': 9, 'tenth house': 10, 'eleventh house': 11, 'twelfth house': 12
            }
            return house_map.get(house_str, None)
        
        # Natal planet houses
        natal_planet_houses = {}
        for p in ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 
                  'uranus', 'neptune', 'pluto', 'chiron', 'mean_lilith',
                  'true_north_lunar_node', 'true_south_lunar_node']:
            planet = getattr(natal, p, None)
            if planet and hasattr(planet, 'house') and planet.house:
                name_map = {
                    'true_north_lunar_node': 'True_North_Lunar_Node',
                    'true_south_lunar_node': 'True_South_Lunar_Node',
                    'mean_lilith': 'Mean_Lilith',
                }
                key = name_map.get(p, p.capitalize())
                natal_planet_houses[key] = house_to_num(planet.house)
        
        # Transit planet houses
        transit_planet_houses = {}
        for p in ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 
                  'uranus', 'neptune', 'pluto', 'chiron', 'mean_lilith',
                  'true_north_lunar_node', 'true_south_lunar_node']:
            planet = getattr(transit_subj, p, None)
            if planet and hasattr(planet, 'house') and planet.house:
                name_map = {
                    'true_north_lunar_node': 'True_North_Lunar_Node',
                    'true_south_lunar_node': 'True_South_Lunar_Node',
                    'mean_lilith': 'Mean_Lilith',
                }
                key = name_map.get(p, p.capitalize())
                transit_planet_houses[key] = house_to_num(planet.house)
        
        aspects = []
        for asp in synastry.all_aspects:
            if asp['orbit'] <= orb:
                aspects.append({
                    "transit_planet": get_short_name(asp['p1_name']),
                    "natal_planet": get_short_name(asp['p2_name']),
                    "aspect": asp['aspect'],
                    "orb": round(asp['orbit'], 2),
                    "transit_house": transit_planet_houses.get(asp['p1_name'], None),
                    "natal_house": natal_planet_houses.get(asp['p2_name'], None),
                })
        
        # Sort by orb (tightest first)
        aspects.sort(key=lambda x: x['orb'])
        
        # Get natal house cusps for house calculations
        natal_houses = []
        for house_name in ['first_house', 'second_house', 'third_house', 'fourth_house',
                          'fifth_house', 'sixth_house', 'seventh_house', 'eighth_house',
                          'ninth_house', 'tenth_house', 'eleventh_house', 'twelfth_house']:
            house = getattr(natal, house_name, None)
            if house:
                natal_houses.append(house.abs_pos)
        
        def get_natal_house(abs_pos):
            """Determine which natal house a transiting planet is in"""
            if len(natal_houses) < 12:
                return None
            for i in range(12):
                next_i = (i + 1) % 12
                cusp = natal_houses[i]
                next_cusp = natal_houses[next_i]
                
                # Handle wrap around 360°
                if next_cusp < cusp:  # Crosses 0° Aries
                    if abs_pos >= cusp or abs_pos < next_cusp:
                        return i + 1
                else:
                    if cusp <= abs_pos < next_cusp:
                        return i + 1
            return 1  # Default to 1st house
        
        # Current transiting planets with BOTH current house and natal house
        transit_planets_data = {}
        for p in ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']:
            planet = getattr(transit_subj, p, None)
            if planet:
                # Current house (from transit chart)
                current_house = None
                if hasattr(planet, 'house') and planet.house:
                    current_house = planet.house.replace('_', ' ').title()
                
                # Natal house (where this transit activates in natal chart)
                natal_house = get_natal_house(planet.abs_pos)
                
                transit_planets_data[p] = {
                    "sign": planet.sign,
                    "position": round(planet.position, 2),
                    "retrograde": planet.retrograde if hasattr(planet, 'retrograde') else False,
                    "house": current_house,
                    "natal_house": natal_house,
                }
        
        # Current lunar phase
        lunar_phase = None
        if hasattr(transit_subj, 'lunar_phase') and transit_subj.lunar_phase:
            lunar_phase = {
                "name": transit_subj.lunar_phase.moon_phase_name,
                "emoji": transit_subj.lunar_phase.moon_emoji,
            }
        
        # Transit chart houses (current sky houses)
        transit_houses = {}
        for i, house_name in enumerate(['first_house', 'second_house', 'third_house', 'fourth_house',
                                        'fifth_house', 'sixth_house', 'seventh_house', 'eighth_house',
                                        'ninth_house', 'tenth_house', 'eleventh_house', 'twelfth_house'], 1):
            house = getattr(transit_subj, house_name, None)
            if house:
                transit_houses[str(i)] = {
                    "sign": house.sign,
                    "position": round(house.position, 2),
                }
        
        # Natal chart houses for comparison
        natal_houses_data = {}
        for i, house_name in enumerate(['first_house', 'second_house', 'third_house', 'fourth_house',
                                        'fifth_house', 'sixth_house', 'seventh_house', 'eighth_house',
                                        'ninth_house', 'tenth_house', 'eleventh_house', 'twelfth_house'], 1):
            house = getattr(natal, house_name, None)
            if house:
                natal_houses_data[str(i)] = {
                    "sign": house.sign,
                    "position": round(house.position, 2),
                }
        
        output_json({
            "natal": {
                "name": natal.name if hasattr(natal, 'name') else "Natal",
                "datetime": f"{natal_year}-{natal_month:02d}-{natal_day:02d}",
                "city": natal.city if hasattr(natal, 'city') else None,
            },
            "transit": {
                "datetime": f"{transit_year or now.year}-{(transit_month or now.month):02d}-{(transit_day or now.day):02d}",
                "planets": transit_planets_data,
                "houses": transit_houses,
                "lunar_phase": lunar_phase,
            },
            "natal_houses": natal_houses_data,
            "aspects": aspects,
        })
        
    except Exception as e:
        output_error(str(e))


@app.command()
def moon(
    year: Optional[int] = typer.Option(None, help="Year (default: now)"),
    month: Optional[int] = typer.Option(None, help="Month"),
    day: Optional[int] = typer.Option(None, help="Day"),
    lat: float = typer.Option(40.7128, help="Latitude"),
    lng: float = typer.Option(-74.0060, help="Longitude"),
):
    """Get moon phase and position."""
    try:
        from kerykeion import AstrologicalSubject
        
        now = datetime.now()
        subject = AstrologicalSubject(
            "Moon",
            year or now.year,
            month or now.month,
            day or now.day,
            now.hour, now.minute,
            lat=lat,
            lng=lng,
        )
        
        # Calculate moon phase (simplified)
        sun_pos = subject.sun.abs_pos
        moon_pos = subject.moon.abs_pos
        phase_angle = (moon_pos - sun_pos) % 360
        
        if phase_angle < 45:
            phase_name = "New Moon"
        elif phase_angle < 90:
            phase_name = "Waxing Crescent"
        elif phase_angle < 135:
            phase_name = "First Quarter"
        elif phase_angle < 180:
            phase_name = "Waxing Gibbous"
        elif phase_angle < 225:
            phase_name = "Full Moon"
        elif phase_angle < 270:
            phase_name = "Waning Gibbous"
        elif phase_angle < 315:
            phase_name = "Last Quarter"
        else:
            phase_name = "Waning Crescent"
        
        output_json({
            "datetime": f"{year or now.year}-{(month or now.month):02d}-{(day or now.day):02d}",
            "moon": {
                "sign": subject.moon.sign,
                "position": round(subject.moon.position, 4),
                "abs_position": round(subject.moon.abs_pos, 4),
            },
            "phase": {
                "name": phase_name,
                "angle": round(phase_angle, 2),
                "illumination": round(abs(180 - phase_angle) / 180 * 100, 1),
            },
        })
        
    except Exception as e:
        output_error(str(e))


@app.command()
def ephemeris(
    body: str = typer.Option(..., help="Celestial body (sun, moon, mars, etc.)"),
    year: Optional[int] = typer.Option(None, help="Year (default: now)"),
    month: Optional[int] = typer.Option(None, help="Month"),
    day: Optional[int] = typer.Option(None, help="Day"),
):
    """Get ephemeris position for a celestial body."""
    try:
        from kerykeion import AstrologicalSubject
        
        now = datetime.now()
        subject = AstrologicalSubject(
            "Ephemeris",
            year or now.year,
            month or now.month,
            day or now.day,
            now.hour, now.minute,
            lat=0, lng=0,
        )
        
        planet = getattr(subject, body.lower(), None)
        if not planet:
            output_error(f"Unknown body: {body}")
            return
        
        output_json({
            "body": body.lower(),
            "datetime": f"{year or now.year}-{(month or now.month):02d}-{(day or now.day):02d}",
            "sign": planet.sign,
            "position": round(planet.position, 4),
            "abs_position": round(planet.abs_pos, 4),
            "retrograde": planet.retrograde if hasattr(planet, 'retrograde') else False,
        })
        
    except Exception as e:
        output_error(str(e))


@app.command()
def version():
    """Show version."""
    from . import __version__
    output_json({"version": __version__})


if __name__ == "__main__":
    app()
