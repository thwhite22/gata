import { google } from "googleapis";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import "dotenv/config";

const TOKEN_PATH = path.join(process.cwd(), ".youtube_token.json");

function getOAuth() {
  return new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI || "http://localhost:3000/oauth2callback"
  );
}

export function getAuthUrl() {
  return getOAuth().generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/youtube.upload"],
    prompt: "consent",
  });
}

export async function exchangeCode(code) {
  const oauth2 = getOAuth();
  const { tokens } = await oauth2.getToken(code);
  oauth2.setCredentials(tokens);
  await fsp.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  return oauth2;
}

export async function getAuth() {
  const oauth2 = getOAuth();
  try {
    const token = JSON.parse(await fsp.readFile(TOKEN_PATH, "utf8"));
    oauth2.setCredentials(token);
    oauth2.on("tokens", async (tokens) => {
      if (tokens.refresh_token) {
        await fsp.writeFile(TOKEN_PATH, JSON.stringify({ ...token, ...tokens }, null, 2));
      }
    });
    return oauth2;
  } catch {
    throw new Error("YouTube not authenticated. Connect via dashboard first.");
  }
}

async function uploadVideo(puzzle, auth) {
  if (!puzzle.videoPath || !fs.existsSync(puzzle.videoPath)) {
    throw new Error(`Video not found: ${puzzle.videoPath}`);
  }
  const youtube = google.youtube({ version: "v3", auth });
  const d = new Date();
  d.setHours(parseInt(process.env.SCHEDULE_HOUR || "15"), 0, 0, 0);
  const response = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title: puzzle.title,
        description: puzzle.description + "\n\n#puzzle #brainteaser #shorts #gata",
        tags: puzzle.tags || [],
        categoryId: "27",
      },
      status: {
        privacyStatus: "private",
        publishAt: d.toISOString(),
        selfDeclaredMadeForKids: false,
      },
    },
    media: { body: fs.createReadStream(puzzle.videoPath) },
  });
  return {
    youtubeId: response.data.id,
    youtubeUrl: `https://www.youtube.com/shorts/${response.data.id}`,
    uploadedAt: new Date().toISOString(),
  };
}

async function run() {
  const queuePath = path.join(process.cwd(), "output", "queue.json");
  const queue = JSON.parse(await fsp.readFile(queuePath, "utf8"));
  const ready = queue.filter(p => p.status === "approved" && p.videoPath && !p.youtubeId);
  if (!ready.length) { console.log("No videos ready to upload."); return; }
  let auth;
  try { auth = await getAuth(); } catch (e) { console.error(e.message); return; }
  console.log(`Uploading ${ready.length} videos...`);
  for (let i = 0; i < ready.length; i++) {
    try {
      const result = await uploadVideo(ready[i], auth);
      Object.assign(ready[i], result);
      ready[i].status = "uploaded";
      console.log(`  Uploaded: ${result.youtubeUrl}`);
    } catch (e) { console.error(`  Failed: ${e.message}`); }
  }
  const pm = Object.fromEntries(ready.map(p => [p.id, p]));
  await fsp.writeFile(queuePath, JSON.stringify(queue.map(p => pm[p.id] || p), null, 2));
  console.log("Upload complete.");
}

run().catch(console.error);
