# Rosaphone

Rosie's eye-gaze music machine — a looping band she plays by looking.

Seven instruments (drums, guitar, piano, bass, cello, trumpet and a singing
choir) each loop a part of the same four-bar groove. The instruments are
**real recordings** embedded in the file — multisampled grand piano, clean
electric guitar, fingered electric bass and trumpet (tonejs-instruments),
string ensemble and choir (FluidR3, MIT) and an acoustic drum kit — played
through a produced mix: sidechain pump, gated snare reverb, chorus,
tempo-synced echoes, tape saturation and hall reverb.

There are **five songs**. The big header button (a gaze target, like the
cards) opens a full-screen picker of five big song cards — she chooses by
looking:

- 🌙 **Night Drive** — driving 116 BPM synth-pop in A minor (four-on-the-floor,
  pumping bass, tight trumpet hook).
- ☀️ **Sunshine** — laid-back 96 BPM funk-pop in C major (swung feel,
  tambourine backbeat, funky guitar riff, horn stabs).
- 🌴 **Island Time** — 80 BPM reggae in G major (one-drop drums with nothing
  on beat one, skank chords on 2 &amp; 4, round melodic bass, lazy horn line).
- ✨ **Starlight** — 66 BPM lullaby in F major (music-box piano arpeggios,
  heartbeat drums, long warm pads, a hushed horn melody).
- 🐉 **Dragon March** — 100 BPM adventure march in D minor (staccato string
  ostinato, horn fanfare, driving bass, big choir, snare roll into the loop).

Both are original grooves written in the style of the records they nod to —
no copyrighted material. The instruments are rendered per-note from the
[GeneralUser GS](https://schristiancollins.com/generaluser.php) soundfont by
S. Christian Collins (free to use and redistribute) — every note the songs
need is baked in at its exact pitch, so nothing is pitch-shifted at playback. Looking at an instrument card for
the dwell time switches it on or off. Everything shares one clock, so whatever
combination she chooses always plays in time and in tune — every mix she makes
sounds like a song. Her mix is remembered between sessions.

It is a single `index.html` with no dependencies, no internet needed, and no
samples — every sound is synthesized live with the Web Audio API.

## Rosie records her own loop

The **Record** button in the header (and the teal **Rosie** card while it's
empty) records her voice into the band. It works like a pro looper set to
quantized recording: dwelling Record *arms* it, a soft count-in ticks, the
recording starts exactly on the next bar, captures a fixed number of bars,
then immediately loops in time with everything else — the same design as
Ableton-style loopers, where fixed, bar-quantized lengths are what keep
loops from ever drifting. If the band is silent, quiet ticks play during
recording so she still has the beat.

- **Loop length** (helper settings → *Rosie's loop length*): **1 bar**
  (≈1.8–2.9 s depending on song/speed) for instant call-and-response fun,
  **2 bars** (≈3.6–5.7 s, the default) for a phrase, or **4 bars**
  (≈7.3–11.4 s) for a take that spans the whole chord cycle.
- After recording, the **Rosie card** works exactly like the instrument
  cards — look to switch her loop on and off. Dwelling **Record** again
  takes a new take (the old one is replaced). Her take is saved on the
  device and comes back after a restart.
- If the tempo or song changes, her loop follows by speeding up or slowing
  down (the pitch bends with it — deliberately, it's fun).
- Recording uses the microphone with echo cancellation, so the band playing
  from the speakers is subtracted from what the mic captures.

**Microphone permission:** the first Record needs a helper to tap "Allow"
once. To remove even that on the Tobii: add
`--use-fake-ui-for-media-stream` to the kiosk shortcut (auto-accepts mic
prompts — fine on a dedicated device), or, when hosting Rosaphone at a URL,
set the `AudioCaptureAllowedUrls` browser policy to that URL so the mic is
granted with no prompt.

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
| `song` | `?song=sunny` | which song to open on: `night`, `sunny`, `island`, `star` or `dragon` |
| `mix` | `?mix=drums,bass,choir` | start with these instruments playing (`mix=clear` for silence) |
| `tempo` | `?tempo=slow` | groove speed: `slow`, `medium` or `fast` |
| `dwell` | `?dwell=1200` | look time in milliseconds (400–4000) |
| `loop` | `?loop=1` | Rosie's record length in bars: 1, 2 or 4 |

Example: `index.html?song=sunny&mix=piano,choir&tempo=slow` opens with a
gentle piano-and-choir bed already playing. Without parameters, Rosaphone restores
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
- **Groove speed** — slow / medium / fast (each song has its own three
  tempos, e.g. Night Drive 92/116/132, Starlight 58/66/74).
- **Volume** — master level (a limiter keeps it safe at any setting).

## Other access methods

- **Touch / mouse:** tap a card to toggle it.
- **Keyboard / switch:** `1`–`8` toggle instruments (8 = Rosie's loop),
  `R` record, `Space`/`0` stop all,
  `Tab`+`Enter` for switch scanning, `F` full screen. Cards are real buttons
  with `role="switch"`, so screen readers announce state.

## For future tinkering

Everything lives in `index.html`:

- `TRACKS` — names, colours, mix levels, reverb sends.
- The musical material lives in the `SONGS` object — one `build()` per song,
  patterns over 4 bars × 16 steps, melodic notes as
  `[bar, step, midi, length, velocity]`. Add another song by copying one
  (new pitches need re-rendering into the sample set).
- The whole engine is one block marked `ROSAPHONE ENGINE v3`, kept
  byte-identical in `index.html` and `soundcheck.html` — edit both together.
  The samples are embedded as base64 mp3 in the same block, rendered per-note
  from the GeneralUser GS soundfont (piano, clean electric guitar, fingered
  bass, string ensemble, trumpet, choir aahs, and the standard drum kit, with
  a synth sub layered under the kick).
- Production lives in `initAudio`: sidechain pump bus, gated snare reverb,
  per-track chorus, tempo-synced echoes, tape saturation and a safety
  limiter. Playback is `sPlay` (nearest sample + playback-rate pitch shift +
  envelope).

Ideas for later: more grooves/keys to pick from, per-instrument pattern
variations, recording her song to a file.
