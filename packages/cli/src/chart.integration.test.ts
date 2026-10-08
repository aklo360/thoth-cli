import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Run after npm run build, with the development Python core installed.
const bin = fileURLToPath(new URL('../dist/bin.js', import.meta.url));
const base = ['chart', '--date', '2000-01-01', '--time', '12:00', '--name', 'Verification'];
function run(args: string[]) {
  return spawnSync(process.execPath, [bin, ...base, ...args], {
    encoding: 'utf8', timeout: 10000,
  });
}

describe('complete natal export', () => {
  it('exports parseable, precise offline data including zero coordinates', () => {
    const result = run(['--lat', '0', '--lng', '0', '--timezone', 'Etc/UTC', '--full']);
    expect(result.status, result.stderr).toBe(0);
    const data = JSON.parse(result.stdout);
    expect(data.full.subject.lat).toBe(0);
    expect(data.full.subject.lng).toBe(0);
    expect(data.full.subject.iso_formatted_utc_datetime).toBe('2000-01-01T12:00:00+00:00');
    expect(data.full.subject.houses_system_identifier).toBe('P');
    expect(Object.keys(data.houses)).toHaveLength(12);
    expect(Object.keys(data.planets)).toHaveLength(14);
    expect(data.full.subject.sun.declination).toBeTypeOf('number');
    expect(data.full.aspects.length).toBeGreaterThanOrEqual(data.aspects.length);
    expect(data.full.aspects[0].p1_abs_pos).toBeTypeOf('number');
    expect(data.full.aspects[0].aspect_movement).toBeTypeOf('string');
    expect(data.full.aspect_settings.active_aspects.length).toBeGreaterThan(0);
  });

  it('rejects a timezone without explicit coordinates', () => {
    const result = run(['--city', 'London', '--timezone', 'Etc/UTC', '--full']);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('--timezone requires both --lat and --lng');
  });

  it('rejects combining the complete data export with an SVG', () => {
    const result = run(['--lat', '0', '--lng', '0', '--timezone', 'Etc/UTC', '--full', '--svg']);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('--full cannot be combined with --svg');
  });
});
