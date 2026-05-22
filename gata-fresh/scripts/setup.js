import fs from "fs/promises";
import { execSync } from "child_process";

console.log("\nGata setup check\n");

const checks = [
  {
    label: ".env file",
    pass: async () => { try { await fs.access(".env"); return true; } catch { return false; } },
    fix: "cp .env.example .env  then fill in your keys",
  },
  {
    label: "ANTHROPIC_API_KEY",
    pass: async () => !!process.env.ANTHROPIC_API_KEY,
    fix: "Add ANTHROPIC_API_KEY to .env",
  },
  {
    label: "GEMINI_API_KEY",
    pass: async () => !!process.env.GEMINI_API_KEY,
    fix: "Add GEMINI_API_KEY to .env",
  },
  {
    label: "YOUTUBE_CLIENT_ID",
    pass: async () => !!process.env.YOUTUBE_CLIENT_ID,
    fix: "Add YouTube OAuth credentials from console.cloud.google.com",
  },
  {
    label: "ffmpeg",
    pass: async () => { try { execSync("ffmpeg -version", { stdio: "pipe" }); return true; } catch { return false; } },
    fix: "Run: sudo apt-get install -y ffmpeg",
  },
  {
    label: "output/ directory",
    pass: async () => { await fs.mkdir("output/images", { recursive: true }); return true; },
    fix: "Run: mkdir -p output/images output/videos output/voices",
  },
];

let allOk = true;
for (const c of checks) {
  const ok = await c.pass();
  console.log(`  [${ok ? "ok" : "MISSING"}] ${c.label}`);
  if (!ok) { console.log(`         Fix: ${c.fix}`); allOk = false; }
}

console.log(allOk ? "\nAll checks passed. Run: npm run generate\n" : "\nFix the above then run: npm run setup\n");
