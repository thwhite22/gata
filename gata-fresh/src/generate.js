import Anthropic from "@anthropic-ai/sdk";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const WEEKLY_ROTATION = [
  { topic: "Logic & Lateral Thinking", tag: "logic", affiliateCategory: "critical-thinking" },
  { topic: "Finance & Economics",       tag: "finance", affiliateCategory: "investing" },
  { topic: "Science & Nature",          tag: "science", affiliateCategory: "science-books" },
  { topic: "History & Culture",         tag: "history", affiliateCategory: "history-books" },
  { topic: "Mathematics & Patterns",    tag: "maths",   affiliateCategory: "maths-education" },
  { topic: "Language & Wordplay",       tag: "wordplay", affiliateCategory: "books" },
  { topic: "Psychology & Behaviour",    tag: "psychology", affiliateCategory: "psychology-books" },
];

function getWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
}

function getTopicForWeek() {
  return WEEKLY_ROTATION[getWeekNumber() % WEEKLY_ROTATION.length];
}

async function generatePuzzles(count = 7, topic = null) {
  const weekTopic = topic || getTopicForWeek();
  console.log(`\nGenerating ${count} puzzles — topic: ${weekTopic.topic}\n`);

  const prompt = `You are generating ${count} short-form video puzzles for Gata, a YouTube Shorts and Instagram Reels puzzle channel with a Nordic Viking aesthetic.

Topic this week: ${weekTopic.topic}

For each puzzle produce exactly this JSON structure:
{
  "id": "uuid-placeholder",
  "topic": "${weekTopic.topic}",
  "tag": "${weekTopic.tag}",
  "difficulty": "Easy",
  "hook": "Opening line, maximum 8 words, must be a question or provocative statement.",
  "question": "The full puzzle question. Maximum 35 words. Clear and self-contained.",
  "answer": "The correct answer. 1-3 sentences maximum.",
  "explanation": "Why this is correct or surprising. 2-3 sentences.",
  "imagePrompt": "A highly specific photorealistic image prompt inspired by the Urnes style — the final and most sophisticated Viking Age art form, late 11th to mid-12th century. Features slender serpentine creatures entwined in figure eights, carved dark timber, aged bronze, bone, antler, iron. Named after Urnes Stave Church Norway. Describe: (1) the puzzle subject placed within or made from Urnes-era materials — dark carved oak, aged bronze, bone, antler, iron, worn stone, (2) Urnes interlaced serpentine detail visible in the frame as carved surface or border, (3) single light source — candle, torch, or narrow Nordic winter light, warm amber against deep black, (4) 85mm macro lens f/2, shallow depth of field, (5) colour palette — near-black, deep walnut, aged verdigris, bone white, amber candlelight, iron grey. Vertical 9:16. No text, no logos, no human faces. Example: 'A single iron key on aged dark oak carved with Urnes-style serpentine creatures, single candle from upper right, 85mm macro f/2, warm amber and deep shadow, near-black background, photorealistic'",
  "title": "YouTube title, 60 characters max.",
  "description": "YouTube description. 3 sentences.",
  "tags": ["puzzle", "brainteaser", "shorts", "riddle", "logic"],
  "thumbnailText": "3-5 word question for thumbnail",
  "estimatedDwellSeconds": 20
}

Rules:
- Each puzzle must be genuinely surprising or counterintuitive
- Distribute difficulties across the batch
- No pop culture references
- Every hook must work as spoken audio

Return a valid JSON array of ${count} objects. No preamble. No markdown. Raw JSON only.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.content[0].text.trim();
  let puzzles;
  try {
    puzzles = JSON.parse(raw);
  } catch {
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("Claude did not return valid JSON");
    puzzles = JSON.parse(match[0]);
  }

  return puzzles.map((p) => ({
    ...p,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    status: "pending",
    weekNumber: getWeekNumber(),
    affiliateCategory: weekTopic.affiliateCategory,
  }));
}

async function savePuzzles(puzzles) {
  const queuePath = path.join(process.cwd(), "output", "queue.json");
  await fs.mkdir(path.dirname(queuePath), { recursive: true });
  let existing = [];
  try { existing = JSON.parse(await fs.readFile(queuePath, "utf8")); } catch {}
  const updated = [...existing, ...puzzles];
  await fs.writeFile(queuePath, JSON.stringify(updated, null, 2));
  console.log(`Saved ${puzzles.length} puzzles. Total in queue: ${updated.length}`);
  return queuePath;
}

async function run() {
  const count = parseInt(process.env.PUZZLES_PER_WEEK || "7");
  const puzzles = await generatePuzzles(count);
  await savePuzzles(puzzles);
  console.log("\nGenerated:");
  puzzles.forEach((p, i) => console.log(`  ${i + 1}. [${p.difficulty}] ${p.hook}`));
  console.log("\nNext: npm run dashboard");
}

run().catch(console.error);
export { generatePuzzles, savePuzzles, getTopicForWeek, getWeekNumber };
