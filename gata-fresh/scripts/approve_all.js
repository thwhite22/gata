import fs from "fs/promises";
import path from "path";

const queuePath = path.join(process.cwd(), "output", "queue.json");

async function run() {
  const queue = JSON.parse(await fs.readFile(queuePath, "utf8"));
  const now = new Date().toISOString();
  let textCount = 0, imageCount = 0;

  queue.forEach(p => {
    if (p.status === "pending") {
      p.status = "text_approved";
      p.textApprovedAt = now;
      textCount++;
    }
    if (p.status === "image_review" && p.imagePath) {
      p.status = "approved";
      p.imageApprovedAt = now;
      imageCount++;
    }
  });

  await fs.writeFile(queuePath, JSON.stringify(queue, null, 2));
  console.log(`Approved ${textCount} text, ${imageCount} images.`);
  console.log("Run: npm run render");
}

run().catch(console.error);
