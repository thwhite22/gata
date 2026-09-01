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

## Starting with no helper (important)

Browsers refuse to make sound until they see one real click or tap — that is
the only reason the start screen exists. Do ANY one of these once, and
Rosaphone detects that sound is already allowed and skips the start screen
entirely: Rosie opens it and plays by gaze alone.

1. **Her gaze system clicks for her.** If the Tobii is in a mode that sends a
   click after a dwell (Windows Control click mode), her gaze IS the tap —
   nothing to configure. (Set **Gaze dwell → Off** in the gear menu with this
   mode, so the two dwells can't double-fire.)

2. **Launch shortcut with an autoplay flag** (no admin rights needed). Point
   the desktop or kiosk shortcut at:

   ```
   msedge --kiosk "C:\path\to\index.html" --edge-kiosk-type=fullscreen --autoplay-policy=no-user-gesture-required
   ```

   (`chrome.exe` takes the same `--autoplay-policy` flag.)

3. **Device policy — works however the browser gets opened** (best when
   another app will launch Rosaphone). In an admin command prompt:

   ```
   reg add HKLM\SOFTWARE\Policies\Microsoft\Edge /v AutoplayAllowed /t REG_DWORD /d 1
   reg add HKLM\SOFTWARE\Policies\Google\Chrome /v AutoplayAllowed /t REG_DWORD /d 1
   ```

   This sets the browser's media-autoplay setting to Allow for every page.
   To scope it to specific pages instead, use the `AutoplayAllowlist` policy
   at the same registry paths.

Chrome also tends to let local `file://` pages start audio on their own, and
Rosaphone quietly retries for ~20 seconds after opening — so in any
environment where audio is allowed, it starts with no interaction at all.
Where it is still locked, the start screen stays up and ANY tap, click, or
gaze-click **anywhere on the page** unlocks it — it doesn't have to hit the
button.

## Launching from another app (e.g. Rosie's Rosetta Stone)

Have the app open the file path or hosted URL; with setup 2 or 3 above,
Rosaphone starts by itself. Optional URL parameters let the launcher
preconfigure it:

| Parameter | Example | Meaning |
|---|---|---|
| `mix` | `?mix=drums,bass,choir` | start with these instruments playing (`mix=clear` for silence) |
| `tempo` | `?tempo=80` | groove speed: 80, 100 or 120 |
| `dwell` | `?dwell=1200` | look time in milliseconds (400–4000) |

Example: `index.html?mix=piano,choir&tempo=80` opens with a gentle
piano-and-choir bed already playing. Without parameters, Rosaphone restores
whatever mix Rosie last built.

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

On a device without the no-helper setup above, the start screen needs one tap
from anyone, anywhere on the page, the first time it opens. With that setup
done once, gaze alone is enough from the moment it opens.

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
