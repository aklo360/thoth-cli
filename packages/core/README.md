# thoth-core

Astrological calculation engine built on Swiss Ephemeris.

## Complete natal exports

Use `thoth chart --full` to export the normal chart plus the complete engine
subject, unrounded aspect records, active aspect settings, and engine versions.
The export includes the configured engine's available points, houses, speeds,
declinations, lunar phase, and calculation conventions. It does not imply every
possible asteroid or aspect system was enabled.

For a reproducible offline calculation, provide coordinates and an IANA timezone:

```sh
thoth chart --date 2000-01-01 --time 12:00 --lat 0 --lng 0 --timezone Etc/UTC --full
```

`--timezone` requires both coordinates. `--full` emits JSON and cannot be combined
with `--svg`. Keep the complete result and reuse it while the birth inputs and
calculation conventions are unchanged.
