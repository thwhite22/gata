# Gata pipeline

Automated YouTube Shorts puzzle channel. Urnes Viking aesthetic. Obsidian visual system.

## First time setup

```bash
cp .env.example .env
# Fill in all keys in .env

npm install
sudo apt-get install -y ffmpeg
pip install numpy scipy pillow python-dotenv --break-system-packages

npm run setup
npm run audio
```

## Every week

```bash
npm run generate        # generate 7 puzzles
npm run dashboard       # open approval UI — approve text
npm run images          # generate Urnes-style images
npm run dashboard       # approve images
npm run render          # render videos
npm run upload          # upload to YouTube
```

## Shortcut — approve everything at once (for testing)

```bash
npm run approve-all
```

## Keys needed in .env

| Key | Where to get it |
|---|---|
| ANTHROPIC_API_KEY | console.anthropic.com |
| GEMINI_API_KEY | aistudio.google.com/app/apikey |
| YOUTUBE_CLIENT_ID | console.cloud.google.com → OAuth 2.0 |
| YOUTUBE_CLIENT_SECRET | same as above |
| ELEVENLABS_API_KEY | elevenlabs.io/app/settings/api-keys |
| ELEVENLABS_VOICE_ID | elevenlabs.io Voice Design or Library |

## YouTube OAuth setup

1. console.cloud.google.com
2. Enable YouTube Data API v3
3. Create credentials → OAuth client ID → Desktop app
4. Add your email as a test user
5. Copy Client ID and Secret to .env
6. Run dashboard and click Connect YouTube

## Voice setup (ElevenLabs)

Use Voice Design with this prompt:

> A calm, mid-tone female voice with a subtle Swedish accent. Measured cadence, minimal inflection, unhurried. Similar to Scandinavian automotive advertising. Ages 30 to 40. No breathy quality.

Save the voice and copy its ID to ELEVENLABS_VOICE_ID in .env.
