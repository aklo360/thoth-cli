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
    lat: float = typer.Option(..., help="Latitude"),
    lng: float = typer.Option(..., help="Longitude"),
    name: str = typer.Option("Subject", help="Subject name"),
):
    """Calculate natal chart."""
    try:
        from kerykeion import AstrologicalSubject
        
        subject = AstrologicalSubject(
            name,
            year, month, day,
            hour, minute,
            lat=lat,
            lng=lng,
        )
        
        # Build chart data
        planets = {}
        for planet_name in ['sun', 'moon', 'mercury', 'venus', 'mars', 
                           'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
                           'chiron', 'north_node', 'south_node']:
            planet = getattr(subject, planet_name, None)
            if planet:
                planets[planet_name] = {
                    "sign": planet.sign,
                    "position": round(planet.position, 4),
                    "abs_position": round(planet.abs_pos, 4),
                    "house": planet.house if hasattr(planet, 'house') else None,
                    "retrograde": planet.retrograde if hasattr(planet, 'retrograde') else False,
                }
        
        # Houses
        houses = {}
        for i in range(1, 13):
            house = getattr(subject, f'house_{i}', None) or getattr(subject, f'first_house', None)
            if hasattr(subject, 'houses_list') and len(subject.houses_list) >= i:
                house_data = subject.houses_list[i-1]
                houses[str(i)] = {
                    "sign": house_data.sign if hasattr(house_data, 'sign') else None,
                    "position": round(house_data.position, 4) if hasattr(house_data, 'position') else None,
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
                "lat": lat,
                "lng": lng,
            },
            "planets": planets,
            "houses": houses,
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
    natal_lat: float = typer.Option(..., help="Natal latitude"),
    natal_lng: float = typer.Option(..., help="Natal longitude"),
    transit_year: Optional[int] = typer.Option(None, help="Transit year (default: now)"),
    transit_month: Optional[int] = typer.Option(None, help="Transit month"),
    transit_day: Optional[int] = typer.Option(None, help="Transit day"),
    orb: float = typer.Option(3.0, help="Orb for aspects in degrees"),
):
    """Calculate transits to natal chart."""
    try:
        from kerykeion import AstrologicalSubject
        
        # Create natal subject
        natal = AstrologicalSubject(
            "Natal",
            natal_year, natal_month, natal_day,
            natal_hour, natal_minute,
            lat=natal_lat,
            lng=natal_lng,
        )
        
        # Create transit subject (default to now)
        now = datetime.now()
        transit_subj = AstrologicalSubject(
            "Transit",
            transit_year or now.year,
            transit_month or now.month,
            transit_day or now.day,
            now.hour, now.minute,
            lat=natal_lat,
            lng=natal_lng,
        )
        
        # Calculate aspects between transit and natal planets
        aspects = []
        aspect_types = [
            ("conjunction", 0, orb),
            ("opposition", 180, orb),
            ("trine", 120, orb),
            ("square", 90, orb),
            ("sextile", 60, orb),
        ]
        
        transit_planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 
                          'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']
        natal_planets = transit_planets + ['chiron', 'north_node']
        
        for t_name in transit_planets:
            t_planet = getattr(transit_subj, t_name, None)
            if not t_planet:
                continue
                
            for n_name in natal_planets:
                n_planet = getattr(natal, n_name, None)
                if not n_planet:
                    continue
                
                # Calculate angular difference
                diff = abs(t_planet.abs_pos - n_planet.abs_pos)
                if diff > 180:
                    diff = 360 - diff
                
                # Check each aspect type
                for aspect_name, angle, aspect_orb in aspect_types:
                    orb_diff = abs(diff - angle)
                    if orb_diff <= aspect_orb:
                        aspects.append({
                            "transit_planet": t_name,
                            "natal_planet": n_name,
                            "aspect": aspect_name,
                            "orb": round(orb_diff, 2),
                            "transit_position": round(t_planet.abs_pos, 2),
                            "natal_position": round(n_planet.abs_pos, 2),
                            "applying": t_planet.abs_pos < n_planet.abs_pos,  # simplified
                        })
        
        # Sort by orb (tightest first)
        aspects.sort(key=lambda x: x['orb'])
        
        output_json({
            "natal": {
                "datetime": f"{natal_year}-{natal_month:02d}-{natal_day:02d}",
            },
            "transit": {
                "datetime": f"{transit_year or now.year}-{(transit_month or now.month):02d}-{(transit_day or now.day):02d}",
            },
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
