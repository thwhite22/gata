# Rosaphone

Rosie's eye-gaze music machine — a looping band she plays by looking.

Seven instruments (drums, guitar, piano, bass, cello, trumpet and a singing
choir) each loop a part of the same four-bar groove (C major, C–Am–F–G). Looking at an instrument card for
the dwell time switches it on or off. Everything shares one clock, so whatever
combination she chooses always plays in time and in tune — every mix she makes
sounds like a song. Her mix is remembered between sessions.

It is a single `index.html` with no dependencies, no internet needed, and no
samples — every sound is synthesized live with the Web Audio API.

## Testing the audio first (no gaze needed)

Open **`soundcheck.html`** on any device — phone, laptop, or the Tobii — and
tap. It's a tap-only test bench for the same synth voices: a "Hear it" button
per instrument (one sound, instantly), loop toggles, master volume, and a live
output meter — if the meter moves but you hear nothing, the device is muted,
not broken. It also shows the audio engine state, sample rate, and output
latency.

## Loading it onto the Tobii

**Option A — copy the file (works offline)**
1. Copy `index.html` onto the device (USB stick, OneDrive, email to yourself).
2. Double-click it — it opens in Edge. Press `F` or the corner button for full
   screen.
3. Optional kiosk mode so nothing else can be reached:
   `msedge --kiosk "C:\path\to\index.html" --edge-kiosk-type=fullscreen`

**Option B — host it** (e.g. GitHub Pages on this repo) and bookmark the URL in
Edge on the device.

## Tobii setup

The app expects gaze to move the mouse pointer:

- In **TD Control / Windows Control / Computer Control**, use the mode where
  gaze moves the cursor continuously (mouse emulation).
- The app does its own dwell: rest gaze on a card and a ring fills; when it
  completes, the instrument toggles. After it fires, Rosie must look away
  before that card can fire again — staring can never rapid-toggle.
- If the Tobii is instead set to **click after a dwell** (dwell-click mode),
  open the gear ⚙ and set **Gaze dwell → Off** so only the Tobii's click
  toggles (otherwise both would fire).

A helper must tap the screen once on the start screen — browsers only unlock
sound after a real touch/click. After that one tap, gaze alone is enough.

## Helper settings (gear ⚙, tap only — gaze can't open it)

- **Look time** — 0.6 s to 2.5 s dwell before a card fires (default 0.9 s).
- **Gaze dwell** — on (hover switches) / off (click or tap only).
- **Groove speed** — slow (80), medium (100), fast (120) BPM.
- **Volume** — master level (a limiter keeps it safe at any setting).

## Other access methods

- **Touch / mouse:** tap a card to toggle it.
- **Keyboard / switch:** `1`–`7` toggle instruments, `Space`/`0` stop all,
  `Tab`+`Enter` for switch scanning, `F` full screen. Cards are real buttons
  with `role="switch"`, so screen readers announce state.

## For future tinkering

Everything lives in `index.html`:

- `TRACKS` — names, colours, mix levels, reverb sends.
- `DRUM_PAT`, `BASS_NOTES`, `GTR_CHORDS`, `PNO_CHORDS`, `CELLO_NOTES`,
  `TPT_NOTES`, `CHOIR_NOTES` — the musical material, as
  `[bar, step, midi, length, velocity]` over 4 bars × 16 steps. Change these
  to write Rosie a new groove.
- Synth voices are small functions (`kick`, `snare`, `pluck`, `celloNote`,
  `choirVoice`, …) — tweak filters and envelopes to taste. The choir is
  formant synthesis: detuned sawtooths with slow vibrato through fixed
  "ah"-vowel bandpass filters.

Ideas for later: more grooves/keys to pick from, per-instrument pattern
variations, recording her song to a file.
