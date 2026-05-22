import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateImage(puzzle, imageDir) {
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-image-preview" });

  const prompt = `${puzzle.imagePrompt}

Style reinforcement: Urnes Viking Age aesthetic. Dark carved timber, aged bronze, bone, antler, iron, serpentine interlaced creatures. Single warm light source. Deep shadow. Near-black background. Archaeological texture and intimacy. Photorealistic, not illustrated. Vertical 9:16 for mobile. No text, no watermarks, no human faces. Image will sit behind a dark semi-transparent overlay so rich midtones and deep blacks are essential.`;

  console.log(`  Generating: ${puzzle.hook.slice(0, 55)}`);

  const result = await genAI.getGenerativeModel({ model: "gemini-3.1-flash-image-preview" })
    .generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
    });

  const parts = result.response.candidates[0].content.parts;
  const imagePart = parts.find((p) => p.inlineData?.mimeType?.startsWith("image/"));
  if (!imagePart) throw new Error("No image returned from Gemini");

  const ext = imagePart.inlineData.mimeType.split("/")[1] || "png";
  const imagePath = path.join(imageDir, `${puzzle.id}.${ext}`);
  await fs.writeFile(imagePath, Buffer.from(imagePart.inlineData.data, "base64"));
  console.log(`  Saved: ${path.basename(imagePath)}`);
  return imagePath;
}

async function run() {
  const queuePath = path.join(process.cwd(), "output", "queue.json");
  const queue = JSON.parse(await fs.readFile(queuePath, "utf8"));
  const needsImage = queue.filter(p => p.status === "text_approved" && !p.imagePath);

  if (!needsImage.length) {
    console.log("No text-approved puzzles awaiting images.");
    return;
  }

  const imageDir = path.join(process.cwd(), "output", "images");
  await fs.mkdir(imageDir, { recursive: true });
  console.log(`Generating ${needsImage.length} images...\n`);

  for (const puzzle of needsImage) {
    puzzle.status = "imaging";
    await fs.writeFile(queuePath, JSON.stringify(queue, null, 2));
    try {
      puzzle.imagePath = await generateImage(puzzle, imageDir);
      puzzle.status = "image_review";
      puzzle.imageGeneratedAt = new Date().toISOString();
    } catch (e) {
      console.error(`  Failed: ${e.message}`);
      puzzle.status = "text_approved";
    }
    await fs.writeFile(queuePath, JSON.stringify(queue, null, 2));
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log("\nDone. Open dashboard to review images.");
}

run().catch(console.error);
export { generateImage };
