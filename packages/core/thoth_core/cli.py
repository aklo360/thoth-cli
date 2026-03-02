#!/usr/bin/env python3
"""
Thoth Core CLI - JSON output for TypeScript wrapper
All commands output JSON to stdout for consumption by thoth-cli
"""

import typer
import json
import sys
from typing import Optional, List
from datetime import datetime, timedelta

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


def create_subject(name: str, year: int, month: int, day: int, hour: int, minute: int,
                   city: Optional[str] = None, nation: str = "US",
                   lat: Optional[float] = None, lng: Optional[float] = None):
    """Helper to create an AstrologicalSubject."""
    from kerykeion import AstrologicalSubject
    
    if city:
        return AstrologicalSubject(name, year, month, day, hour, minute, city=city, nation=nation)
    elif lat is not None and lng is not None:
        return AstrologicalSubject(name, year, month, day, hour, minute, lat=lat, lng=lng)
    else:
        output_error("Must provide either --city or both --lat and --lng")


def extract_planet_data(subject, planet_name: str) -> Optional[dict]:
    """Extract planet data from a subject."""
    planet = getattr(subject, planet_name, None)
    if not planet:
        return None
    
    house_str = None
    if hasattr(planet, 'house') and planet.house:
        house_str = planet.house.replace('_', ' ').title()
    
    return {
        "sign": planet.sign,
        "position": round(planet.position, 4),
        "abs_position": round(planet.abs_pos, 4),
        "house": house_str,
        "retrograde": planet.retrograde if hasattr(planet, 'retrograde') else False,
    }


def extract_all_planets(subject) -> dict:
    """Extract all planet data from a subject."""
    planets = {}
    planet_names = [
        'sun', 'moon', 'mercury', 'venus', 'mars', 
        'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
        'chiron', 'mean_lilith', 'true_north_lunar_node', 'true_south_lunar_node'
    ]
    for name in planet_names:
        data = extract_planet_data(subject, name)
        if data:
            planets[name] = data
    return planets


def extract_houses(subject) -> dict:
    """Extract house data from a subject."""
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
    return houses


def extract_lunar_phase(subject) -> Optional[dict]:
    """Extract lunar phase from a subject."""
    if hasattr(subject, 'lunar_phase') and subject.lunar_phase:
        return {
            "name": subject.lunar_phase.moon_phase_name,
            "emoji": subject.lunar_phase.moon_emoji,
        }
    return None


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
    svg: bool = typer.Option(False, help="Output SVG chart instead of JSON"),
    svg_type: str = typer.Option("Natal", help="SVG chart type: Natal, Transit, Synastry"),
):
    """Calculate natal chart."""
    try:
        subject = create_subject(name, year, month, day, hour, minute, city, nation, lat, lng)
        
        # If SVG requested, generate and output
        if svg:
            from kerykeion import KerykeionChartSVG
            chart_svg = KerykeionChartSVG(subject, chart_type=svg_type)
            svg_string = chart_svg.makeTemplate()
            output_json({"svg": svg_string, "type": svg_type})
            return
        
        # Build planet data
        planets = extract_all_planets(subject)
        houses = extract_houses(subject)
        
        # Natal Aspects
        from kerykeion import NatalAspects
        natal_aspects = NatalAspects(subject)
        aspects = []
        for asp in natal_aspects.all_aspects:
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
        
        lunar_phase = extract_lunar_phase(subject)
        
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
    svg: bool = typer.Option(False, help="Output SVG bi-wheel chart"),
):
    """Calculate transits to natal chart."""
    try:
        natal = create_subject("Natal", natal_year, natal_month, natal_day, natal_hour, natal_minute,
                               natal_city, nation, natal_lat, natal_lng)
        
        now = datetime.now()
        transit_subj = create_subject(
            "Transit",
            transit_year or now.year,
            transit_month or now.month,
            transit_day or now.day,
            now.hour, now.minute,
            natal_city, nation, natal_lat, natal_lng
        )
        
        # If SVG requested
        if svg:
            from kerykeion import KerykeionChartSVG
            chart_svg = KerykeionChartSVG(natal, chart_type="Transit", second_obj=transit_subj)
            svg_string = chart_svg.makeTemplate()
            output_json({"svg": svg_string, "type": "Transit"})
            return
        
        # Get transit aspects
        from kerykeion import SynastryAspects
        synastry = SynastryAspects(transit_subj, natal)
        
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
        
        aspects = []
        for asp in synastry.all_aspects:
            if asp['orbit'] <= orb:
                aspects.append({
                    "transit_planet": get_short_name(asp['p1_name']),
                    "natal_planet": get_short_name(asp['p2_name']),
                    "aspect": asp['aspect'],
                    "orb": round(asp['orbit'], 2),
                })
        aspects.sort(key=lambda x: x['orb'])
        
        # Transit planets
        transit_planets_data = {}
        for p in ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']:
            data = extract_planet_data(transit_subj, p)
            if data:
                transit_planets_data[p] = data
        
        output_json({
            "natal": {
                "datetime": f"{natal_year}-{natal_month:02d}-{natal_day:02d}",
                "city": natal.city if hasattr(natal, 'city') else None,
            },
            "transit": {
                "datetime": f"{transit_year or now.year}-{(transit_month or now.month):02d}-{(transit_day or now.day):02d}",
                "planets": transit_planets_data,
                "lunar_phase": extract_lunar_phase(transit_subj),
            },
            "aspects": aspects,
        })
        
    except Exception as e:
        output_error(str(e))


@app.command("solar-return")
def solar_return(
    natal_year: int = typer.Option(..., help="Natal year"),
    natal_month: int = typer.Option(..., help="Natal month"),
    natal_day: int = typer.Option(..., help="Natal day"),
    natal_hour: int = typer.Option(12, help="Natal hour"),
    natal_minute: int = typer.Option(0, help="Natal minute"),
    natal_city: Optional[str] = typer.Option(None, help="Natal city"),
    nation: str = typer.Option("US", help="Country code"),
    natal_lat: Optional[float] = typer.Option(None, help="Natal latitude"),
    natal_lng: Optional[float] = typer.Option(None, help="Natal longitude"),
    return_year: int = typer.Option(..., help="Year for solar return"),
    return_city: Optional[str] = typer.Option(None, help="Location for solar return (default: natal city)"),
    svg: bool = typer.Option(False, help="Output SVG chart"),
):
    """Calculate solar return chart for a given year."""
    try:
        from kerykeion import PlanetaryReturnFactory
        
        natal = create_subject("Natal", natal_year, natal_month, natal_day, natal_hour, natal_minute,
                               natal_city, nation, natal_lat, natal_lng)
        
        # Create return factory
        prf = PlanetaryReturnFactory(
            natal,
            city=return_city or natal_city,
            nation=nation,
            lat=natal_lat if not (return_city or natal_city) else None,
            lng=natal_lng if not (return_city or natal_city) else None,
        )
        
        # Get solar return
        sr = prf.next_return_from_date(return_year, 1, 1, return_type="Solar")
        
        if svg:
            from kerykeion import KerykeionChartSVG
            chart_svg = KerykeionChartSVG(sr, chart_type="Natal")
            svg_string = chart_svg.makeTemplate()
            output_json({"svg": svg_string, "type": "Solar Return", "year": return_year})
            return
        
        # Extract data from solar return chart
        planets = {}
        for p in ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron']:
            planet = getattr(sr, p, None)
            if planet:
                planets[p] = {
                    "sign": planet.sign,
                    "position": round(planet.position, 4),
                    "house": planet.house.replace('_', ' ').title() if planet.house else None,
                    "retrograde": planet.retrograde if hasattr(planet, 'retrograde') else False,
                }
        
        houses = {}
        for i in range(1, 13):
            house_name = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth',
                          'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'][i-1] + '_house'
            house = getattr(sr, house_name, None)
            if house:
                houses[str(i)] = {"sign": house.sign, "position": round(house.position, 4)}
        
        output_json({
            "type": "Solar Return",
            "natal_date": f"{natal_year}-{natal_month:02d}-{natal_day:02d}",
            "return_year": return_year,
            "exact_datetime": sr.iso_formatted_local_datetime,
            "location": {
                "city": sr.city if hasattr(sr, 'city') else None,
                "lat": sr.lat if hasattr(sr, 'lat') else None,
                "lng": sr.lng if hasattr(sr, 'lng') else None,
            },
            "planets": planets,
            "houses": houses,
            "ascendant": {"sign": sr.ascendant.sign, "position": round(sr.ascendant.position, 4)},
            "midheaven": {"sign": sr.medium_coeli.sign, "position": round(sr.medium_coeli.position, 4)},
            "lunar_phase": {
                "name": sr.lunar_phase.moon_phase_name,
                "emoji": sr.lunar_phase.moon_emoji,
            } if sr.lunar_phase else None,
        })
        
    except Exception as e:
        output_error(str(e))


@app.command("lunar-return")
def lunar_return(
    natal_year: int = typer.Option(..., help="Natal year"),
    natal_month: int = typer.Option(..., help="Natal month"),
    natal_day: int = typer.Option(..., help="Natal day"),
    natal_hour: int = typer.Option(12, help="Natal hour"),
    natal_minute: int = typer.Option(0, help="Natal minute"),
    natal_city: Optional[str] = typer.Option(None, help="Natal city"),
    nation: str = typer.Option("US", help="Country code"),
    natal_lat: Optional[float] = typer.Option(None, help="Natal latitude"),
    natal_lng: Optional[float] = typer.Option(None, help="Natal longitude"),
    from_year: int = typer.Option(..., help="Year to search from"),
    from_month: int = typer.Option(..., help="Month to search from"),
    from_day: int = typer.Option(1, help="Day to search from"),
    return_city: Optional[str] = typer.Option(None, help="Location for lunar return"),
    svg: bool = typer.Option(False, help="Output SVG chart"),
):
    """Calculate next lunar return from a given date."""
    try:
        from kerykeion import PlanetaryReturnFactory
        
        natal = create_subject("Natal", natal_year, natal_month, natal_day, natal_hour, natal_minute,
                               natal_city, nation, natal_lat, natal_lng)
        
        prf = PlanetaryReturnFactory(
            natal,
            city=return_city or natal_city,
            nation=nation,
            lat=natal_lat if not (return_city or natal_city) else None,
            lng=natal_lng if not (return_city or natal_city) else None,
        )
        
        lr = prf.next_return_from_date(from_year, from_month, from_day, return_type="Lunar")
        
        if svg:
            from kerykeion import KerykeionChartSVG
            chart_svg = KerykeionChartSVG(lr, chart_type="Natal")
            svg_string = chart_svg.makeTemplate()
            output_json({"svg": svg_string, "type": "Lunar Return"})
            return
        
        planets = {}
        for p in ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']:
            planet = getattr(lr, p, None)
            if planet:
                planets[p] = {
                    "sign": planet.sign,
                    "position": round(planet.position, 4),
                    "house": planet.house.replace('_', ' ').title() if planet.house else None,
                    "retrograde": planet.retrograde if hasattr(planet, 'retrograde') else False,
                }
        
        houses = {}
        for i in range(1, 13):
            house_name = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth',
                          'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'][i-1] + '_house'
            house = getattr(lr, house_name, None)
            if house:
                houses[str(i)] = {"sign": house.sign, "position": round(house.position, 4)}
        
        output_json({
            "type": "Lunar Return",
            "natal_date": f"{natal_year}-{natal_month:02d}-{natal_day:02d}",
            "natal_moon": {"sign": natal.moon.sign, "position": round(natal.moon.position, 4)},
            "search_from": f"{from_year}-{from_month:02d}-{from_day:02d}",
            "exact_datetime": lr.iso_formatted_local_datetime,
            "location": {
                "city": lr.city if hasattr(lr, 'city') else None,
            },
            "planets": planets,
            "houses": houses,
            "ascendant": {"sign": lr.ascendant.sign, "position": round(lr.ascendant.position, 4)},
            "midheaven": {"sign": lr.medium_coeli.sign, "position": round(lr.medium_coeli.position, 4)},
        })
        
    except Exception as e:
        output_error(str(e))


@app.command()
def synastry(
    year1: int = typer.Option(..., help="Person 1 birth year"),
    month1: int = typer.Option(..., help="Person 1 birth month"),
    day1: int = typer.Option(..., help="Person 1 birth day"),
    hour1: int = typer.Option(12, help="Person 1 birth hour"),
    minute1: int = typer.Option(0, help="Person 1 birth minute"),
    city1: Optional[str] = typer.Option(None, help="Person 1 city"),
    nation1: str = typer.Option("US", help="Person 1 nation"),
    lat1: Optional[float] = typer.Option(None, help="Person 1 latitude"),
    lng1: Optional[float] = typer.Option(None, help="Person 1 longitude"),
    name1: str = typer.Option("Person 1", help="Person 1 name"),
    year2: int = typer.Option(..., help="Person 2 birth year"),
    month2: int = typer.Option(..., help="Person 2 birth month"),
    day2: int = typer.Option(..., help="Person 2 birth day"),
    hour2: int = typer.Option(12, help="Person 2 birth hour"),
    minute2: int = typer.Option(0, help="Person 2 birth minute"),
    city2: Optional[str] = typer.Option(None, help="Person 2 city"),
    nation2: str = typer.Option("US", help="Person 2 nation"),
    lat2: Optional[float] = typer.Option(None, help="Person 2 latitude"),
    lng2: Optional[float] = typer.Option(None, help="Person 2 longitude"),
    name2: str = typer.Option("Person 2", help="Person 2 name"),
    orb: float = typer.Option(6.0, help="Orb for aspects"),
    svg: bool = typer.Option(False, help="Output SVG bi-wheel chart"),
):
    """Calculate synastry aspects between two charts."""
    try:
        from kerykeion import SynastryAspects
        
        person1 = create_subject(name1, year1, month1, day1, hour1, minute1, city1, nation1, lat1, lng1)
        person2 = create_subject(name2, year2, month2, day2, hour2, minute2, city2, nation2, lat2, lng2)
        
        if svg:
            from kerykeion import KerykeionChartSVG
            chart_svg = KerykeionChartSVG(person1, chart_type="Synastry", second_obj=person2)
            svg_string = chart_svg.makeTemplate()
            output_json({"svg": svg_string, "type": "Synastry"})
            return
        
        synastry = SynastryAspects(person1, person2)
        
        aspects = []
        for asp in synastry.all_aspects:
            if asp['orbit'] <= orb:
                aspects.append({
                    "planet1": asp['p1_name'],
                    "planet2": asp['p2_name'],
                    "aspect": asp['aspect'],
                    "orb": round(asp['orbit'], 2),
                })
        aspects.sort(key=lambda x: x['orb'])
        
        output_json({
            "type": "Synastry",
            "person1": {
                "name": name1,
                "date": f"{year1}-{month1:02d}-{day1:02d}",
                "planets": extract_all_planets(person1),
            },
            "person2": {
                "name": name2,
                "date": f"{year2}-{month2:02d}-{day2:02d}",
                "planets": extract_all_planets(person2),
            },
            "aspects": aspects,
            "aspect_count": len(aspects),
        })
        
    except Exception as e:
        output_error(str(e))


@app.command()
def progressions(
    natal_year: int = typer.Option(..., help="Natal year"),
    natal_month: int = typer.Option(..., help="Natal month"),
    natal_day: int = typer.Option(..., help="Natal day"),
    natal_hour: int = typer.Option(12, help="Natal hour"),
    natal_minute: int = typer.Option(0, help="Natal minute"),
    natal_city: Optional[str] = typer.Option(None, help="Natal city"),
    nation: str = typer.Option("US", help="Country code"),
    natal_lat: Optional[float] = typer.Option(None, help="Natal latitude"),
    natal_lng: Optional[float] = typer.Option(None, help="Natal longitude"),
    target_year: int = typer.Option(..., help="Target year for progressions"),
    target_month: int = typer.Option(1, help="Target month"),
    target_day: int = typer.Option(1, help="Target day"),
    svg: bool = typer.Option(False, help="Output SVG chart"),
):
    """Calculate secondary progressions (day-for-a-year method)."""
    try:
        # Calculate progressed date
        birth_date = datetime(natal_year, natal_month, natal_day, natal_hour, natal_minute)
        target_date = datetime(target_year, target_month, target_day)
        
        # Days since birth = years of life (day-for-a-year)
        days_since_birth = (target_date - birth_date).days
        years_of_life = days_since_birth / 365.25
        
        # Progressed date = birth date + (years as days)
        progressed_date = birth_date + timedelta(days=years_of_life)
        
        # Create progressed chart
        progressed = create_subject(
            "Progressed",
            progressed_date.year,
            progressed_date.month,
            progressed_date.day,
            progressed_date.hour,
            progressed_date.minute,
            natal_city, nation, natal_lat, natal_lng
        )
        
        # Also get natal chart for comparison
        natal = create_subject("Natal", natal_year, natal_month, natal_day, natal_hour, natal_minute,
                               natal_city, nation, natal_lat, natal_lng)
        
        if svg:
            from kerykeion import KerykeionChartSVG
            chart_svg = KerykeionChartSVG(progressed, chart_type="Natal")
            svg_string = chart_svg.makeTemplate()
            output_json({"svg": svg_string, "type": "Secondary Progressions", "target_date": str(target_date.date())})
            return
        
        # Calculate progressed-to-natal aspects
        from kerykeion import SynastryAspects
        prog_aspects = SynastryAspects(progressed, natal)
        
        aspects = []
        for asp in prog_aspects.all_aspects:
            if asp['orbit'] <= 2.0:  # Tight orb for progressions
                aspects.append({
                    "progressed": asp['p1_name'],
                    "natal": asp['p2_name'],
                    "aspect": asp['aspect'],
                    "orb": round(asp['orbit'], 2),
                })
        aspects.sort(key=lambda x: x['orb'])
        
        output_json({
            "type": "Secondary Progressions",
            "method": "day-for-a-year",
            "natal_date": f"{natal_year}-{natal_month:02d}-{natal_day:02d}",
            "target_date": f"{target_year}-{target_month:02d}-{target_day:02d}",
            "age_at_target": round(years_of_life, 2),
            "progressed_date": str(progressed_date.date()),
            "progressed_planets": extract_all_planets(progressed),
            "natal_planets": extract_all_planets(natal),
            "progressed_to_natal_aspects": aspects,
            "progressed_ascendant": {
                "sign": progressed.first_house.sign,
                "position": round(progressed.first_house.position, 4),
            },
            "progressed_midheaven": {
                "sign": progressed.tenth_house.sign,
                "position": round(progressed.tenth_house.position, 4),
            },
        })
        
    except Exception as e:
        output_error(str(e))


@app.command("ephemeris-range")
def ephemeris_range(
    body: str = typer.Option(..., help="Celestial body (sun, moon, mars, etc.)"),
    start_year: int = typer.Option(..., help="Start year"),
    start_month: int = typer.Option(1, help="Start month"),
    start_day: int = typer.Option(1, help="Start day"),
    end_year: int = typer.Option(..., help="End year"),
    end_month: int = typer.Option(12, help="End month"),
    end_day: int = typer.Option(31, help="End day"),
    step: str = typer.Option("month", help="Step: day, week, month"),
):
    """Get ephemeris positions over a date range."""
    try:
        from kerykeion import AstrologicalSubject
        
        start = datetime(start_year, start_month, start_day)
        end = datetime(end_year, end_month, min(end_day, 28))  # Safe day
        
        step_delta = {
            "day": timedelta(days=1),
            "week": timedelta(weeks=1),
            "month": timedelta(days=30),
        }.get(step, timedelta(days=30))
        
        positions = []
        current = start
        
        while current <= end:
            subject = AstrologicalSubject(
                "Ephemeris",
                current.year, current.month, current.day,
                12, 0,
                lat=0, lng=0,
            )
            
            planet = getattr(subject, body.lower(), None)
            if planet:
                positions.append({
                    "date": str(current.date()),
                    "sign": planet.sign,
                    "position": round(planet.position, 4),
                    "abs_position": round(planet.abs_pos, 4),
                    "retrograde": planet.retrograde if hasattr(planet, 'retrograde') else False,
                })
            
            current += step_delta
        
        # Find sign changes
        sign_changes = []
        for i in range(1, len(positions)):
            if positions[i]['sign'] != positions[i-1]['sign']:
                sign_changes.append({
                    "date": positions[i]['date'],
                    "from": positions[i-1]['sign'],
                    "to": positions[i]['sign'],
                })
        
        # Find retrograde stations
        retrograde_changes = []
        for i in range(1, len(positions)):
            if positions[i]['retrograde'] != positions[i-1]['retrograde']:
                retrograde_changes.append({
                    "date": positions[i]['date'],
                    "station": "retrograde" if positions[i]['retrograde'] else "direct",
                    "sign": positions[i]['sign'],
                    "position": positions[i]['position'],
                })
        
        output_json({
            "body": body.lower(),
            "range": {
                "start": str(start.date()),
                "end": str(end.date()),
                "step": step,
            },
            "positions": positions,
            "sign_changes": sign_changes,
            "retrograde_stations": retrograde_changes,
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
def composite(
    year1: int = typer.Option(..., help="Person 1 birth year"),
    month1: int = typer.Option(..., help="Person 1 birth month"),
    day1: int = typer.Option(..., help="Person 1 birth day"),
    hour1: int = typer.Option(12, help="Person 1 birth hour"),
    minute1: int = typer.Option(0, help="Person 1 birth minute"),
    city1: Optional[str] = typer.Option(None, help="Person 1 city"),
    nation1: str = typer.Option("US", help="Person 1 nation"),
    lat1: Optional[float] = typer.Option(None, help="Person 1 latitude"),
    lng1: Optional[float] = typer.Option(None, help="Person 1 longitude"),
    name1: str = typer.Option("Person 1", help="Person 1 name"),
    year2: int = typer.Option(..., help="Person 2 birth year"),
    month2: int = typer.Option(..., help="Person 2 birth month"),
    day2: int = typer.Option(..., help="Person 2 birth day"),
    hour2: int = typer.Option(12, help="Person 2 birth hour"),
    minute2: int = typer.Option(0, help="Person 2 birth minute"),
    city2: Optional[str] = typer.Option(None, help="Person 2 city"),
    nation2: str = typer.Option("US", help="Person 2 nation"),
    lat2: Optional[float] = typer.Option(None, help="Person 2 latitude"),
    lng2: Optional[float] = typer.Option(None, help="Person 2 longitude"),
    name2: str = typer.Option("Person 2", help="Person 2 name"),
    svg: bool = typer.Option(False, help="Output SVG chart"),
):
    """Calculate composite (midpoint) chart for a relationship."""
    try:
        from kerykeion import CompositeSubjectFactory, KerykeionChartSVG
        from kerykeion.schemas.kr_models import AstrologicalSubjectModel
        
        person1 = create_subject(name1, year1, month1, day1, hour1, minute1, city1, nation1, lat1, lng1)
        person2 = create_subject(name2, year2, month2, day2, hour2, minute2, city2, nation2, lat2, lng2)
        
        # Convert to models for CompositeSubjectFactory
        p1_model = AstrologicalSubjectModel(**person1.model_dump())
        p2_model = AstrologicalSubjectModel(**person2.model_dump())
        
        # Create composite
        factory = CompositeSubjectFactory(p1_model, p2_model, chart_name=f"{name1} + {name2}")
        composite_chart = factory.get_midpoint_composite_subject_model()
        
        if svg:
            chart_svg = KerykeionChartSVG(composite_chart, chart_type="Natal")
            svg_string = chart_svg.makeTemplate()
            output_json({"svg": svg_string, "type": "Composite"})
            return
        
        # Extract planet data
        planets = {}
        for p in ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron']:
            planet = getattr(composite_chart, p, None)
            if planet:
                planets[p] = {
                    "sign": planet.sign,
                    "position": round(planet.position, 4),
                    "abs_position": round(planet.abs_pos, 4),
                    "house": planet.house.replace('_', ' ').title() if planet.house else None,
                }
        
        houses = {}
        for i in range(1, 13):
            house_name = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth',
                          'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'][i-1] + '_house'
            house = getattr(composite_chart, house_name, None)
            if house:
                houses[str(i)] = {"sign": house.sign, "position": round(house.position, 4)}
        
        output_json({
            "type": "Composite",
            "method": "midpoint",
            "person1": {"name": name1, "date": f"{year1}-{month1:02d}-{day1:02d}"},
            "person2": {"name": name2, "date": f"{year2}-{month2:02d}-{day2:02d}"},
            "name": f"{name1} + {name2}",
            "planets": planets,
            "houses": houses,
            "ascendant": {
                "sign": composite_chart.first_house.sign,
                "position": round(composite_chart.first_house.position, 4),
            },
            "midheaven": {
                "sign": composite_chart.tenth_house.sign,
                "position": round(composite_chart.tenth_house.position, 4),
            },
        })
        
    except Exception as e:
        output_error(str(e))


@app.command("solar-arc")
def solar_arc(
    natal_year: int = typer.Option(..., help="Natal year"),
    natal_month: int = typer.Option(..., help="Natal month"),
    natal_day: int = typer.Option(..., help="Natal day"),
    natal_hour: int = typer.Option(12, help="Natal hour"),
    natal_minute: int = typer.Option(0, help="Natal minute"),
    natal_city: Optional[str] = typer.Option(None, help="Natal city"),
    nation: str = typer.Option("US", help="Country code"),
    natal_lat: Optional[float] = typer.Option(None, help="Natal latitude"),
    natal_lng: Optional[float] = typer.Option(None, help="Natal longitude"),
    target_year: int = typer.Option(..., help="Target year"),
    target_month: int = typer.Option(1, help="Target month"),
    target_day: int = typer.Option(1, help="Target day"),
):
    """Calculate solar arc directions (all planets move by Sun's arc)."""
    try:
        # Get natal chart
        natal = create_subject("Natal", natal_year, natal_month, natal_day, natal_hour, natal_minute,
                               natal_city, nation, natal_lat, natal_lng)
        
        # Calculate the arc: current Sun position - natal Sun position
        # For solar arc, we calculate the progressed Sun position using secondary progression
        # Then apply that arc to ALL planets
        
        birth_date = datetime(natal_year, natal_month, natal_day, natal_hour, natal_minute)
        target_date = datetime(target_year, target_month, target_day)
        
        # Days since birth = years of life (for secondary progression of Sun)
        days_since_birth = (target_date - birth_date).days
        years_of_life = days_since_birth / 365.25
        
        # The solar arc is approximately 1° per year (Sun moves ~1° per day in secondary progressions)
        # More precisely, we calculate the progressed Sun position
        progressed_date = birth_date + timedelta(days=years_of_life)
        progressed = create_subject(
            "Progressed",
            progressed_date.year, progressed_date.month, progressed_date.day,
            progressed_date.hour, progressed_date.minute,
            natal_city, nation, natal_lat, natal_lng
        )
        
        # Solar arc = progressed Sun position - natal Sun position
        natal_sun_pos = natal.sun.abs_pos
        progressed_sun_pos = progressed.sun.abs_pos
        solar_arc_degrees = (progressed_sun_pos - natal_sun_pos) % 360
        
        # If arc is > 180, it went backwards (shouldn't happen normally)
        if solar_arc_degrees > 180:
            solar_arc_degrees = solar_arc_degrees - 360
        
        # Apply solar arc to all natal planets
        def apply_arc(planet, arc):
            new_abs_pos = (planet.abs_pos + arc) % 360
            # Determine sign from absolute position
            sign_num = int(new_abs_pos // 30)
            sign_names = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis']
            new_sign = sign_names[sign_num]
            new_position = new_abs_pos % 30
            return {
                "sign": new_sign,
                "position": round(new_position, 4),
                "abs_position": round(new_abs_pos, 4),
                "natal_sign": planet.sign,
                "natal_position": round(planet.position, 4),
            }
        
        directed_planets = {}
        for p in ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron']:
            planet = getattr(natal, p, None)
            if planet:
                directed_planets[p] = apply_arc(planet, solar_arc_degrees)
        
        # Also direct the angles
        directed_asc = apply_arc(natal.first_house, solar_arc_degrees)
        directed_mc = apply_arc(natal.tenth_house, solar_arc_degrees)
        
        # Calculate directed-to-natal aspects
        from kerykeion import SynastryAspects
        
        # We need to create a "fake" chart with directed positions for aspect calculation
        # For now, let's calculate aspects manually
        aspects = []
        natal_planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']
        aspect_types = [
            ('conjunction', 0, 2),
            ('opposition', 180, 2),
            ('trine', 120, 2),
            ('square', 90, 2),
            ('sextile', 60, 1.5),
        ]
        
        for d_name in natal_planets:
            d_planet = directed_planets.get(d_name)
            if not d_planet:
                continue
            d_pos = d_planet['abs_position']
            
            for n_name in natal_planets:
                n_planet = getattr(natal, n_name, None)
                if not n_planet:
                    continue
                n_pos = n_planet.abs_pos
                
                # Calculate angle between directed and natal
                angle = abs(d_pos - n_pos)
                if angle > 180:
                    angle = 360 - angle
                
                for asp_name, asp_angle, orb in aspect_types:
                    diff = abs(angle - asp_angle)
                    if diff <= orb:
                        aspects.append({
                            "directed": d_name.capitalize(),
                            "natal": n_name.capitalize(),
                            "aspect": asp_name,
                            "orb": round(diff, 2),
                        })
        
        # Sort by orb
        aspects.sort(key=lambda x: x['orb'])
        
        output_json({
            "type": "Solar Arc Directions",
            "method": "Naibod (1°/year)",
            "natal_date": f"{natal_year}-{natal_month:02d}-{natal_day:02d}",
            "target_date": f"{target_year}-{target_month:02d}-{target_day:02d}",
            "age_at_target": round(years_of_life, 2),
            "solar_arc": round(solar_arc_degrees, 4),
            "directed_planets": directed_planets,
            "directed_ascendant": directed_asc,
            "directed_midheaven": directed_mc,
            "directed_to_natal_aspects": aspects[:20],  # Top 20
        })
        
    except Exception as e:
        output_error(str(e))


@app.command()
def horary(
    question: str = typer.Option(..., help="The question being asked"),
    year: Optional[int] = typer.Option(None, help="Year (default: now)"),
    month: Optional[int] = typer.Option(None, help="Month"),
    day: Optional[int] = typer.Option(None, help="Day"),
    hour: Optional[int] = typer.Option(None, help="Hour"),
    minute: Optional[int] = typer.Option(None, help="Minute"),
    city: Optional[str] = typer.Option(None, help="City where question is asked"),
    nation: str = typer.Option("US", help="Country code"),
    lat: Optional[float] = typer.Option(None, help="Latitude"),
    lng: Optional[float] = typer.Option(None, help="Longitude"),
):
    """Cast a horary chart for divination. 
    
    Horary astrology answers specific questions by casting a chart 
    for the moment the question is asked (or understood by the astrologer).
    """
    try:
        from kerykeion import AstrologicalSubject, NatalAspects
        
        # Use current time if not specified
        now = datetime.now()
        chart_year = year or now.year
        chart_month = month or now.month
        chart_day = day or now.day
        chart_hour = hour if hour is not None else now.hour
        chart_minute = minute if minute is not None else now.minute
        
        # Create the horary chart
        if city:
            chart = AstrologicalSubject(
                "Horary",
                chart_year, chart_month, chart_day,
                chart_hour, chart_minute,
                city=city, nation=nation,
            )
        elif lat is not None and lng is not None:
            chart = AstrologicalSubject(
                "Horary",
                chart_year, chart_month, chart_day,
                chart_hour, chart_minute,
                lat=lat, lng=lng,
            )
        else:
            # Default to NYC if no location specified
            chart = AstrologicalSubject(
                "Horary",
                chart_year, chart_month, chart_day,
                chart_hour, chart_minute,
                city="New York", nation="US",
            )
        
        # Traditional rulers for horary
        traditional_rulers = {
            'Ari': 'Mars', 'Tau': 'Venus', 'Gem': 'Mercury', 'Can': 'Moon',
            'Leo': 'Sun', 'Vir': 'Mercury', 'Lib': 'Venus', 'Sco': 'Mars',
            'Sag': 'Jupiter', 'Cap': 'Saturn', 'Aqu': 'Saturn', 'Pis': 'Jupiter'
        }
        
        # Modern rulers (for reference)
        modern_rulers = {
            'Ari': 'Mars', 'Tau': 'Venus', 'Gem': 'Mercury', 'Can': 'Moon',
            'Leo': 'Sun', 'Vir': 'Mercury', 'Lib': 'Venus', 'Sco': 'Pluto',
            'Sag': 'Jupiter', 'Cap': 'Saturn', 'Aqu': 'Uranus', 'Pis': 'Neptune'
        }
        
        # Get ASC sign and its ruler (the querent's significator)
        asc_sign = chart.first_house.sign
        querent_ruler = traditional_rulers[asc_sign]
        
        # House meanings for common questions
        house_topics = {
            1: "Self, body, the querent",
            2: "Money, possessions, values",
            3: "Siblings, short trips, communication",
            4: "Home, father, real estate, endings",
            5: "Children, creativity, romance, gambling",
            6: "Health, work, employees, pets",
            7: "Partner, marriage, open enemies, others",
            8: "Death, inheritance, other's money, transformation",
            9: "Travel, education, law, philosophy",
            10: "Career, mother, reputation, authority",
            11: "Friends, hopes, groups, social",
            12: "Hidden enemies, secrets, self-undoing, hospitals"
        }
        
        # Calculate planetary hour
        # (simplified - proper calculation needs sunrise/sunset)
        planetary_hour_sequence = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon']
        day_of_week = datetime(chart_year, chart_month, chart_day, chart_hour, chart_minute).weekday()
        # Day rulers: Mon=Moon, Tue=Mars, Wed=Mercury, Thu=Jupiter, Fri=Venus, Sat=Saturn, Sun=Sun
        day_rulers = ['Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Sun']
        day_ruler = day_rulers[day_of_week]
        
        # Approximate planetary hour (simplified)
        hour_index = (planetary_hour_sequence.index(day_ruler) + chart_hour) % 7
        planetary_hour = planetary_hour_sequence[hour_index]
        
        # Get Moon data - crucial for horary
        moon = chart.moon
        moon_sign = moon.sign
        moon_pos = moon.abs_pos
        
        # Calculate Moon aspects for void of course detection
        moon_aspects = []
        planet_names = ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn']
        
        for p_name in planet_names:
            planet = getattr(chart, p_name, None)
            if planet:
                p_pos = planet.abs_pos
                angle = abs(moon_pos - p_pos)
                if angle > 180:
                    angle = 360 - angle
                
                # Check major aspects
                aspects_to_check = [
                    ('conjunction', 0, 8),
                    ('sextile', 60, 6),
                    ('square', 90, 8),
                    ('trine', 120, 8),
                    ('opposition', 180, 8),
                ]
                
                for asp_name, asp_angle, orb in aspects_to_check:
                    diff = abs(angle - asp_angle)
                    if diff <= orb:
                        # Determine if applying or separating
                        # Simplified: if moon is behind in zodiac, it's applying
                        is_applying = (moon_pos < p_pos) if (p_pos - moon_pos) % 360 < 180 else (moon_pos > p_pos)
                        
                        moon_aspects.append({
                            "planet": p_name.capitalize(),
                            "aspect": asp_name,
                            "orb": round(diff, 2),
                            "applying": is_applying,
                        })
        
        # Sort by orb
        moon_aspects.sort(key=lambda x: x['orb'])
        
        # Check for void of course Moon
        # Moon is void of course if it makes no more applying aspects before leaving its sign
        moon_in_sign_degrees = moon.position
        degrees_until_sign_change = 30 - moon_in_sign_degrees
        applying_aspects = [a for a in moon_aspects if a['applying']]
        void_of_course = len(applying_aspects) == 0
        
        # Extract planet positions
        planets = {}
        for p in ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']:
            planet = getattr(chart, p, None)
            if planet:
                house_str = None
                if hasattr(planet, 'house') and planet.house:
                    house_str = planet.house.replace('_', ' ').title()
                planets[p] = {
                    "sign": planet.sign,
                    "position": round(planet.position, 4),
                    "house": house_str,
                    "retrograde": planet.retrograde if hasattr(planet, 'retrograde') else False,
                }
        
        # Houses with signs
        houses = {}
        house_names = ['first_house', 'second_house', 'third_house', 'fourth_house',
                       'fifth_house', 'sixth_house', 'seventh_house', 'eighth_house',
                       'ninth_house', 'tenth_house', 'eleventh_house', 'twelfth_house']
        
        for i, house_name in enumerate(house_names, 1):
            house = getattr(chart, house_name, None)
            if house:
                houses[str(i)] = {
                    "sign": house.sign,
                    "position": round(house.position, 4),
                    "ruler": traditional_rulers[house.sign],
                    "topic": house_topics[i],
                }
        
        # Strictures against judgment (traditional warnings)
        strictures = []
        
        # 1. Early ASC (first 3°)
        if chart.first_house.position < 3:
            strictures.append("Early Ascendant (< 3°) — Question may be premature or poorly formulated")
        
        # 2. Late ASC (last 3°, > 27°)
        if chart.first_house.position > 27:
            strictures.append("Late Ascendant (> 27°) — The matter may be already decided or too late")
        
        # 3. Moon void of course
        if void_of_course:
            strictures.append("Moon void of course — Nothing may come of the matter (or: outcome already fated)")
        
        # 4. Saturn in 7th house (astrologer's house)
        if planets.get('saturn', {}).get('house') == 'Seventh House':
            strictures.append("Saturn in 7th — Difficulty for the astrologer; possible error in judgment")
        
        # 5. Saturn in 1st house
        if planets.get('saturn', {}).get('house') == 'First House':
            strictures.append("Saturn in 1st — The querent may be fearful, depressed, or asking in bad faith")
        
        # 6. Moon in Via Combusta (15° Libra to 15° Scorpio)
        if (195 <= moon.abs_pos <= 225):
            strictures.append("Moon in Via Combusta (15° Lib - 15° Sco) — Danger, unpredictability")
        
        output_json({
            "type": "Horary Chart",
            "question": question,
            "cast_time": {
                "datetime": f"{chart_year}-{chart_month:02d}-{chart_day:02d} {chart_hour:02d}:{chart_minute:02d}",
                "city": chart.city if hasattr(chart, 'city') else None,
            },
            "planetary_hour": planetary_hour,
            "day_ruler": day_ruler,
            "querent": {
                "house": 1,
                "sign": asc_sign,
                "ruler": querent_ruler,
                "ruler_position": planets.get(querent_ruler.lower(), {}),
            },
            "moon": {
                "sign": moon_sign,
                "position": round(moon.position, 4),
                "house": moon.house.replace('_', ' ').title() if moon.house else None,
                "void_of_course": void_of_course,
                "degrees_until_sign_change": round(degrees_until_sign_change, 2),
                "aspects": moon_aspects[:10],  # Top 10 tightest
            },
            "strictures": strictures,
            "houses": houses,
            "planets": planets,
            "ascendant": {
                "sign": chart.first_house.sign,
                "position": round(chart.first_house.position, 4),
            },
            "midheaven": {
                "sign": chart.tenth_house.sign,
                "position": round(chart.tenth_house.position, 4),
            },
        })
        
    except Exception as e:
        output_error(str(e))


@app.command()
def score(
    year1: int = typer.Option(..., help="Person 1 birth year"),
    month1: int = typer.Option(..., help="Person 1 birth month"),
    day1: int = typer.Option(..., help="Person 1 birth day"),
    hour1: int = typer.Option(12, help="Person 1 birth hour"),
    minute1: int = typer.Option(0, help="Person 1 birth minute"),
    city1: Optional[str] = typer.Option(None, help="Person 1 city"),
    nation1: str = typer.Option("US", help="Person 1 country code"),
    lat1: Optional[float] = typer.Option(None, help="Person 1 latitude"),
    lng1: Optional[float] = typer.Option(None, help="Person 1 longitude"),
    year2: int = typer.Option(..., help="Person 2 birth year"),
    month2: int = typer.Option(..., help="Person 2 birth month"),
    day2: int = typer.Option(..., help="Person 2 birth day"),
    hour2: int = typer.Option(12, help="Person 2 birth hour"),
    minute2: int = typer.Option(0, help="Person 2 birth minute"),
    city2: Optional[str] = typer.Option(None, help="Person 2 city"),
    nation2: str = typer.Option("US", help="Person 2 country code"),
    lat2: Optional[float] = typer.Option(None, help="Person 2 latitude"),
    lng2: Optional[float] = typer.Option(None, help="Person 2 longitude"),
    name1: str = typer.Option("Person 1", help="Person 1 name"),
    name2: str = typer.Option("Person 2", help="Person 2 name"),
):
    """Calculate relationship compatibility score."""
    try:
        from kerykeion import AstrologicalSubjectFactory, RelationshipScoreFactory
        
        p1 = AstrologicalSubjectFactory.from_birth_data(
            name1, year1, month1, day1, hour1, minute1,
            city=city1 if city1 else None,
            nation=nation1,
            lat=lat1 if lat1 else 51.4769,
            lng=lng1 if lng1 else 0.0005,
            tz_str="UTC",
            online=bool(city1),
        )
        
        p2 = AstrologicalSubjectFactory.from_birth_data(
            name2, year2, month2, day2, hour2, minute2,
            city=city2 if city2 else None,
            nation=nation2,
            lat=lat2 if lat2 else 51.4769,
            lng=lng2 if lng2 else 0.0005,
            tz_str="UTC",
            online=bool(city2),
        )
        
        factory = RelationshipScoreFactory(p1, p2)
        result = factory.get_relationship_score()
        
        output_json({
            "type": "Relationship Score",
            "person1": {
                "name": name1,
                "date": f"{year1}-{month1:02d}-{day1:02d}",
                "sun": p1.sun.sign,
                "moon": p1.moon.sign,
                "ascendant": p1.ascendant.sign if hasattr(p1, 'ascendant') else None,
            },
            "person2": {
                "name": name2,
                "date": f"{year2}-{month2:02d}-{day2:02d}",
                "sun": p2.sun.sign,
                "moon": p2.moon.sign,
                "ascendant": p2.ascendant.sign if hasattr(p2, 'ascendant') else None,
            },
            "score": {
                "value": result.score_value,
                "description": result.score_description,
                "is_destiny_sign": result.is_destiny_sign,
            },
            "breakdown": [
                {
                    "rule": b.rule,
                    "description": b.description,
                    "points": b.points,
                    "details": b.details,
                }
                for b in result.score_breakdown
            ],
            "aspects": [
                {
                    "planet1": a.p1_name,
                    "planet2": a.p2_name,
                    "aspect": a.aspect,
                    "orb": round(a.orbit, 2),
                }
                for a in result.aspects
            ],
        })
        
    except Exception as e:
        output_error(str(e))


@app.command("moon-extended")
def moon_extended(
    year: Optional[int] = typer.Option(None, help="Year (default: now)"),
    month: Optional[int] = typer.Option(None, help="Month"),
    day: Optional[int] = typer.Option(None, help="Day"),
    lat: float = typer.Option(40.7128, help="Latitude"),
    lng: float = typer.Option(-74.0060, help="Longitude"),
    tz: str = typer.Option("UTC", help="Timezone string (e.g., 'America/New_York')"),
):
    """Get detailed moon data with eclipses and astronomical events."""
    try:
        from kerykeion import AstrologicalSubjectFactory, MoonPhaseDetailsFactory
        
        now = datetime.now()
        y = year or now.year
        m = month or now.month
        d = day or now.day
        
        subject = AstrologicalSubjectFactory.from_birth_data(
            "Moon", y, m, d, now.hour, now.minute,
            lat=lat, lng=lng, tz_str=tz, online=False
        )
        
        moon_details = MoonPhaseDetailsFactory.from_subject(subject)
        data = moon_details.model_dump()
        
        output_json({
            "type": "Moon Extended",
            "datetime": f"{y}-{m:02d}-{d:02d}",
            "location": {
                "lat": lat,
                "lng": lng,
                "timezone": tz,
            },
            "sun": {
                "sunrise": data['sun']['sunrise_timestamp'],
                "sunset": data['sun']['sunset_timestamp'],
                "solar_noon": data['sun']['solar_noon'],
                "day_length": data['sun']['day_length'],
                "next_solar_eclipse": {
                    "date": data['sun']['next_solar_eclipse']['datestamp'] if data['sun']['next_solar_eclipse'] else None,
                    "type": data['sun']['next_solar_eclipse']['type'] if data['sun']['next_solar_eclipse'] else None,
                } if data['sun'].get('next_solar_eclipse') else None,
            },
            "moon": {
                "sign": data['moon']['zodiac']['moon_sign'],
                "phase_name": data['moon']['phase_name'],
                "major_phase": data['moon']['major_phase'],
                "stage": data['moon']['stage'],
                "illumination": data['moon']['illumination'],
                "age_days": data['moon']['age_days'],
                "emoji": data['moon']['emoji'],
                "moonrise": data['moon'].get('moonrise_timestamp'),
                "moonset": data['moon'].get('moonset_timestamp'),
                "next_lunar_eclipse": {
                    "date": data['moon']['next_lunar_eclipse']['datestamp'] if data['moon']['next_lunar_eclipse'] else None,
                    "type": data['moon']['next_lunar_eclipse']['type'] if data['moon']['next_lunar_eclipse'] else None,
                } if data['moon'].get('next_lunar_eclipse') else None,
            },
            "upcoming_phases": {
                phase: {
                    "last": phases['last']['datestamp'] if phases.get('last') else None,
                    "next": phases['next']['datestamp'] if phases.get('next') else None,
                    "days_until_next": phases['next']['days_ahead'] if phases.get('next') else None,
                }
                for phase, phases in data['moon']['detailed']['upcoming_phases'].items()
            } if data['moon'].get('detailed', {}).get('upcoming_phases') else None,
        })
        
    except Exception as e:
        output_error(str(e))


@app.command("transit-scan")
def transit_scan(
    natal_year: int = typer.Option(..., help="Natal year"),
    natal_month: int = typer.Option(..., help="Natal month"),
    natal_day: int = typer.Option(..., help="Natal day"),
    natal_hour: int = typer.Option(12, help="Natal hour"),
    natal_minute: int = typer.Option(0, help="Natal minute"),
    natal_city: Optional[str] = typer.Option(None, help="Natal city"),
    nation: str = typer.Option("US", help="Country code"),
    natal_lat: Optional[float] = typer.Option(None, help="Natal latitude"),
    natal_lng: Optional[float] = typer.Option(None, help="Natal longitude"),
    start_year: int = typer.Option(..., help="Start year"),
    start_month: int = typer.Option(1, help="Start month"),
    start_day: int = typer.Option(1, help="Start day"),
    end_year: int = typer.Option(..., help="End year"),
    end_month: int = typer.Option(12, help="End month"),
    end_day: int = typer.Option(28, help="End day"),
    orb: float = typer.Option(1.0, help="Orb for aspects (tighter = more precise)"),
    step: str = typer.Option("day", help="Step: day, week"),
):
    """Scan for transit aspects over a date range."""
    try:
        natal = create_subject("Natal", natal_year, natal_month, natal_day, natal_hour, natal_minute,
                               natal_city, nation, natal_lat, natal_lng)
        
        from kerykeion import SynastryAspects
        
        start = datetime(start_year, start_month, start_day)
        end = datetime(end_year, end_month, end_day)
        
        step_days = 7 if step == "week" else 1
        current = start
        
        transit_hits = []
        seen_aspects = set()
        
        while current <= end:
            transit_subj = create_subject(
                "Transit",
                current.year, current.month, current.day, 12, 0,
                natal_city, nation, natal_lat, natal_lng
            )
            
            synastry = SynastryAspects(transit_subj, natal)
            
            for asp in synastry.all_aspects:
                if asp['orbit'] <= orb:
                    # Create unique key for this aspect
                    key = f"{asp['p1_name']}-{asp['aspect']}-{asp['p2_name']}"
                    
                    # Only record if we haven't seen it recently (within 7 days)
                    if key not in seen_aspects:
                        transit_hits.append({
                            "date": str(current.date()),
                            "transit_planet": asp['p1_name'],
                            "aspect": asp['aspect'],
                            "natal_planet": asp['p2_name'],
                            "orb": round(asp['orbit'], 3),
                        })
                        seen_aspects.add(key)
            
            # Clear seen aspects after 14 days to allow re-hits
            if len(seen_aspects) > 100:
                seen_aspects.clear()
            
            current += timedelta(days=step_days)
        
        output_json({
            "type": "Transit Scan",
            "natal": {
                "date": f"{natal_year}-{natal_month:02d}-{natal_day:02d}",
            },
            "scan_range": {
                "start": str(start.date()),
                "end": str(end.date()),
                "step": step,
                "orb": orb,
            },
            "hits": transit_hits,
            "total_hits": len(transit_hits),
        })
        
    except Exception as e:
        output_error(str(e))


@app.command("ephemeris-multi")
def ephemeris_multi(
    bodies: str = typer.Option("sun,moon,mercury,venus,mars,jupiter,saturn", help="Comma-separated bodies"),
    start_year: int = typer.Option(..., help="Start year"),
    start_month: int = typer.Option(1, help="Start month"),
    start_day: int = typer.Option(1, help="Start day"),
    end_year: int = typer.Option(..., help="End year"),
    end_month: int = typer.Option(12, help="End month"),
    end_day: int = typer.Option(28, help="End day"),
    step: str = typer.Option("day", help="Step: hour, day, week, month"),
    lat: float = typer.Option(51.4769, help="Latitude"),
    lng: float = typer.Option(0.0005, help="Longitude"),
):
    """Get ephemeris for multiple bodies over a date range."""
    try:
        from kerykeion import EphemerisDataFactory
        
        start = datetime(start_year, start_month, start_day)
        end = datetime(end_year, end_month, end_day)
        
        # Map step to factory parameters
        step_type = "days"
        step_value = 1
        if step == "hour":
            step_type = "hours"
            step_value = 1
        elif step == "week":
            step_type = "days"
            step_value = 7
        elif step == "month":
            step_type = "days"
            step_value = 30
        
        factory = EphemerisDataFactory(
            start_datetime=start,
            end_datetime=end,
            step_type=step_type,
            step=step_value,
            lat=lat,
            lng=lng,
        )
        
        body_list = [b.strip().lower() for b in bodies.split(",")]
        ephemeris_data = factory.get_ephemeris_data_as_astrological_subjects()
        
        positions = []
        for data_point in ephemeris_data:
            point = {
                "datetime": data_point.iso_formatted_utc_datetime,
            }
            for body in body_list:
                planet = getattr(data_point, body, None)
                if planet:
                    point[body] = {
                        "sign": planet.sign,
                        "position": round(planet.position, 4),
                        "abs_position": round(planet.abs_pos, 4),
                        "retrograde": planet.retrograde if hasattr(planet, 'retrograde') else False,
                    }
            positions.append(point)
        
        output_json({
            "type": "Multi-Body Ephemeris",
            "bodies": body_list,
            "range": {
                "start": str(start.date()),
                "end": str(end.date()),
                "step": step,
            },
            "positions": positions,
            "total_points": len(positions),
        })
        
    except Exception as e:
        output_error(str(e))


# ═══════════════════════════════════════════════════════════════
# TAROT COMMANDS
# ═══════════════════════════════════════════════════════════════

@app.command("tarot-draw")
def tarot_draw(
    count: int = typer.Option(1, help="Number of cards to draw"),
    spread: str = typer.Option("single", help="Spread type: single, 3-card, celtic, horseshoe, relationship, decision"),
    question: Optional[str] = typer.Option(None, help="Question for the reading"),
    no_reversals: bool = typer.Option(False, help="Disable reversed cards"),
):
    """Draw tarot cards with true randomness (cryptographic entropy)."""
    try:
        from .tarot import draw_cards, SPREADS
        
        # If spread specified, use its count
        if spread in SPREADS:
            count = SPREADS[spread]["count"]
        
        result = draw_cards(
            count=count,
            reversals=not no_reversals,
            question=question,
            spread=spread,
        )
        output_json(result)
        
    except Exception as e:
        output_error(str(e))


@app.command("tarot-card")
def tarot_card(
    identifier: str = typer.Argument(..., help="Card name or number (0-77)"),
):
    """Look up a specific tarot card."""
    try:
        from .tarot import get_card
        
        card = get_card(identifier)
        if card is None:
            output_error(f"Card not found: {identifier}")
            return
        
        output_json(card)
        
    except Exception as e:
        output_error(str(e))


@app.command("tarot-deck")
def tarot_deck(
    filter_type: Optional[str] = typer.Option(None, "--filter", "-f", help="Filter: major, minor, wands, cups, swords, pentacles"),
):
    """List tarot cards."""
    try:
        from .tarot import get_deck
        
        cards = get_deck(filter_type)
        output_json({
            "type": "Tarot Deck",
            "filter": filter_type,
            "count": len(cards),
            "cards": cards,
        })
        
    except Exception as e:
        output_error(str(e))


@app.command("tarot-spreads")
def tarot_spreads():
    """List available tarot spreads."""
    try:
        from .tarot import SPREADS
        
        spreads = []
        for key, spread in SPREADS.items():
            spreads.append({
                "id": key,
                "name": spread["name"],
                "count": spread["count"],
                "positions": spread["positions"],
                "description": spread["description"],
            })
        
        output_json({
            "type": "Tarot Spreads",
            "spreads": spreads,
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
