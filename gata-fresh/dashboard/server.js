import express from "express";
import fs from "fs/promises";
import path from "path";
import open from "open";
import "dotenv/config";
import { getAuthUrl, exchangeCode } from "../src/upload.js";

const app = express();
const PORT = parseInt(process.env.APPROVAL_PORT || "3000");
const QUEUE = path.join(process.cwd(), "output", "queue.json");

app.use(express.json());

async function rq() {
  try { return JSON.parse(await fs.readFile(QUEUE, "utf8")); } catch { return []; }
}
async function wq(q) { await fs.writeFile(QUEUE, JSON.stringify(q, null, 2)); }

app.get("/api/queue", async (req, res) => {
  const q = await rq();
  res.json({
    puzzles: q,
    stats: {
      pending:       q.filter(p => p.status === "pending").length,
      text_approved: q.filter(p => p.status === "text_approved").length,
      image_review:  q.filter(p => p.status === "image_review").length,
      approved:      q.filter(p => p.status === "approved").length,
      uploaded:      q.filter(p => p.status === "uploaded").length,
      rejected:      q.filter(p => p.status === "rejected").length,
    }
  });
});

app.post("/api/approve-text/:id", async (req, res) => {
  const q = await rq();
  const p = q.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "not found" });
  p.status = "text_approved"; p.textApprovedAt = new Date().toISOString();
  await wq(q); res.json({ ok: true });
});

app.post("/api/approve-image/:id", async (req, res) => {
  const q = await rq();
  const p = q.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "not found" });
  p.status = "approved"; p.imageApprovedAt = new Date().toISOString();
  await wq(q); res.json({ ok: true });
});

app.post("/api/reject-image/:id", async (req, res) => {
  const q = await rq();
  const p = q.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "not found" });
  p.status = "text_approved"; p.imagePath = null;
  await wq(q); res.json({ ok: true });
});

app.post("/api/reject/:id", async (req, res) => {
  const q = await rq();
  const p = q.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "not found" });
  p.status = "rejected"; p.rejectedAt = new Date().toISOString();
  await wq(q); res.json({ ok: true });
});

app.patch("/api/puzzle/:id", async (req, res) => {
  const q = await rq();
  const i = q.findIndex(x => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "not found" });
  ["question","answer","explanation","hook","imagePrompt"].forEach(k => {
    if (req.body[k] !== undefined) q[i][k] = req.body[k];
  });
  await wq(q); res.json({ ok: true });
});

app.post("/api/approve-all-text", async (req, res) => {
  const q = await rq();
  const now = new Date().toISOString();
  q.forEach(p => { if (p.status === "pending") { p.status = "text_approved"; p.textApprovedAt = now; } });
  await wq(q); res.json({ ok: true });
});

app.post("/api/approve-all-images", async (req, res) => {
  const q = await rq();
  const now = new Date().toISOString();
  q.forEach(p => { if (p.status === "image_review") { p.status = "approved"; p.imageApprovedAt = now; } });
  await wq(q); res.json({ ok: true });
});

app.get("/api/image/:id", async (req, res) => {
  try {
    const q = await rq();
    const p = q.find(x => x.id === req.params.id);
    if (!p || !p.imagePath) return res.status(404).send("no image");
    const data = await fs.readFile(p.imagePath);
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "no-cache");
    res.send(data);
  } catch (e) {
    res.status(500).send("Error: " + e.message);
  }
});

app.get("/api/youtube/auth-url", (req, res) => res.json({ url: getAuthUrl() }));

app.get("/oauth2callback", async (req, res) => {
  try {
    await exchangeCode(req.query.code);
    res.send("<html><body style='background:#0a0a0a;color:#fff;font-family:sans-serif;padding:2rem'><h2>YouTube connected.</h2><script>setTimeout(()=>window.close(),2000)</script></body></html>");
  } catch (e) { res.send("Error: " + e.message); }
});

app.get("/", (req, res) => res.send(html()));

function e(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function html() {
  return [
    "<!DOCTYPE html><html><head><meta charset=UTF-8>",
    "<meta name=viewport content='width=device-width,initial-scale=1'>",
    "<title>Gata</title>",
    "<style>",
    "*{box-sizing:border-box;margin:0;padding:0}",
    "body{background:#0a0a0a;color:#f0ede8;font-family:-apple-system,sans-serif;font-size:14px;line-height:1.6}",
    ".hdr{padding:18px 28px;border-bottom:0.5px solid rgba(255,255,255,0.07);display:flex;justify-content:space-between;align-items:center}",
    ".wm{font-size:18px;font-weight:500;letter-spacing:-0.01em}",
    ".stats{display:flex;gap:20px}",
    ".stat{text-align:center}",
    ".sn{font-size:20px;font-weight:500}",
    ".sl{font-size:10px;color:rgba(255,255,255,0.25);letter-spacing:0.07em;text-transform:uppercase}",
    ".tb{padding:12px 28px;border-bottom:0.5px solid rgba(255,255,255,0.07);display:flex;gap:8px;flex-wrap:wrap;align-items:center}",
    ".btn{padding:6px 16px;border-radius:20px;cursor:pointer;font-size:12px;border:0.5px solid rgba(255,255,255,0.15);background:transparent;color:#f0ede8}",
    ".btn-white{background:#f0ede8;color:#0a0a0a;border:none;font-weight:500}",
    ".btn-purple{border-color:#7f77dd;color:#7f77dd}",
    ".btn-green{border-color:#5dcaa5;color:#5dcaa5}",
    ".btn-red{border-color:#e24b4a;color:#e24b4a}",
    ".pills{display:flex;gap:6px;margin-left:auto;flex-wrap:wrap}",
    ".pill{padding:4px 12px;border-radius:20px;border:0.5px solid rgba(255,255,255,0.07);font-size:11px;cursor:pointer;color:rgba(255,255,255,0.4)}",
    ".pill.on{background:#1a1a1a;border-color:rgba(255,255,255,0.18);color:#f0ede8}",
    ".main{padding:20px 28px;max-width:860px}",
    ".card{background:#111;border:0.5px solid rgba(255,255,255,0.07);border-radius:10px;overflow:hidden;margin-bottom:12px}",
    ".ct{padding:18px 20px}",
    ".hook{font-size:15px;font-weight:500;margin-bottom:5px}",
    ".qtext{font-size:13px;color:rgba(255,255,255,0.45);margin-bottom:10px}",
    ".acts{display:flex;gap:6px;flex-wrap:wrap}",
    ".ans{padding:10px 20px;border-top:0.5px solid rgba(255,255,255,0.07);background:#0a0a0a}",
    ".albl{font-size:10px;color:rgba(255,255,255,0.2);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px}",
    ".atxt{font-size:13px;color:#f0ede8}",
    ".etxt{font-size:12px;color:rgba(255,255,255,0.35);margin-top:2px}",
    ".imgrow{border-top:0.5px solid rgba(255,255,255,0.07);display:flex}",
    ".imgbox{width:120px;flex-shrink:0;background:#1a1a1a}",
    ".imgbox img{width:100%;height:120px;object-fit:cover;display:block}",
    ".imgno{width:100%;height:120px;display:flex;align-items:center;justify-content:center;font-size:11px;color:rgba(255,255,255,0.2)}",
    ".imginfo{flex:1;padding:12px 16px}",
    ".iprompt{font-size:11px;color:rgba(255,255,255,0.35);font-style:italic;margin-bottom:8px}",
    ".ep{padding:12px 20px;border-top:0.5px solid rgba(255,255,255,0.07);background:#0a0a0a;display:none}",
    "textarea{width:100%;background:#111;border:0.5px solid rgba(255,255,255,0.1);border-radius:6px;color:#f0ede8;font-size:13px;padding:8px;resize:vertical;font-family:inherit;margin-bottom:6px}",
    ".empty{padding:48px;text-align:center;color:rgba(255,255,255,0.2)}",
    "</style></head><body>",
    "<div class=hdr>",
    "<span class=wm>Gata.</span>",
    "<div class=stats id=stats></div>",
    "</div>",
    "<div class=tb>",
    "<button class='btn btn-white' onclick=approveAllText()>Approve all text</button>",
    "<button class='btn btn-purple' onclick=approveAllImages()>Approve all images</button>",
    "<div class=pills id=pills>",
    "<span class='pill on' onclick=\"setFilter('all',this)\">All</span>",
    "<span class=pill onclick=\"setFilter('pending',this)\">Pending</span>",
    "<span class=pill onclick=\"setFilter('text_approved',this)\">Text OK</span>",
    "<span class=pill onclick=\"setFilter('image_review',this)\">Image review</span>",
    "<span class=pill onclick=\"setFilter('approved',this)\">Ready</span>",
    "<span class=pill onclick=\"setFilter('uploaded',this)\">Live</span>",
    "<span class=pill onclick=\"setFilter('rejected',this)\">Rejected</span>",
    "</div></div>",
    "<div class=main id=main></div>",
    "<script>",
    "var all=[],filt='all';",
    "async function load(){",
    "var r=await fetch('/api/queue'),d=await r.json();all=d.puzzles;",
    "var s=d.stats;",
    "document.getElementById('stats').innerHTML=stat(s.pending,'rgba(255,255,255,0.45)','Pending')+stat(s.text_approved,'#ef9f27','Text OK')+stat(s.image_review,'#7f77dd','Image review')+stat(s.approved,'#5dcaa5','Ready')+stat(s.uploaded,'#378ADD','Live');",
    "render();}",
    "function stat(n,c,l){return '<div class=stat><div class=sn style=\"color:'+c+'\">'+n+'</div><div class=sl>'+l+'</div></div>';}",
    "function setFilter(f,el){filt=f;document.querySelectorAll('.pill').forEach(function(p){p.classList.remove('on')});el.classList.add('on');render();}",
    "function render(){",
    "var list=filt==='all'?all:all.filter(function(p){return p.status===filt});",
    "var m=document.getElementById('main');",
    "if(!list.length){m.innerHTML='<div class=empty>Nothing here.</div>';return;}",
    "m.innerHTML=list.map(card).join('');}",
    "function card(p){",
    "var acts='';",
    "if(p.status==='pending'){acts='<button class=\"btn btn-green\" onclick=\"approveText(\\\"'+p.id+'\\\")\">Approve text</button> <button class=\"btn btn-red\" onclick=\"reject(\\\"'+p.id+'\\\")\">Reject</button> <button class=btn onclick=\"toggleEdit(\\\"'+p.id+'\\\")\">Edit</button>';}",
    "var imgacts='';",
    "if(p.status==='image_review'){imgacts='<button class=\"btn btn-green\" onclick=\"approveImage(\\\"'+p.id+'\\\")\">Approve image</button> <button class=\"btn btn-red\" onclick=\"rejectImage(\\\"'+p.id+'\\\")\">Regenerate</button>';}",
    "var imghtml='';",
    "if(p.imagePath||p.status==='image_review'||p.status==='approved'||p.status==='uploaded'){",
    "var imgel=p.imagePath?'<img src=\"/api/image/'+p.id+'\" loading=lazy>':'<div class=imgno>Generating...</div>';",
    "imghtml='<div class=imgrow><div class=imgbox>'+imgel+'</div><div class=imginfo><div class=iprompt>'+(p.imagePrompt||'').slice(0,120)+'...</div>'+imgacts+'</div></div>';}",
    "return '<div class=card id=\"c'+p.id+'\">'",
    "+'<div class=ct><div class=hook>'+p.hook+'</div><div class=qtext>'+p.question+'</div><div class=acts>'+acts+'</div></div>'",
    "+'<div class=ans><div class=albl>Answer</div><div class=atxt>'+p.answer+'</div><div class=etxt>'+p.explanation+'</div></div>'",
    "+imghtml",
    "+'<div class=ep id=\"ep'+p.id+'\">'",
    "+'<textarea id=\"eq'+p.id+'\" rows=2>'+p.question+'</textarea>'",
    "+'<textarea id=\"ea'+p.id+'\" rows=2>'+p.answer+'</textarea>'",
    "+'<button class=\"btn btn-white\" onclick=\"saveEdit(\\\"'+p.id+'\\\")\">Save</button>'",
    "+'</div></div>';}",
    "function toggleEdit(id){var el=document.getElementById('ep'+id);el.style.display=el.style.display==='block'?'none':'block';}",
    "async function approveText(id){await fetch('/api/approve-text/'+id,{method:'POST'});load();}",
    "async function approveImage(id){await fetch('/api/approve-image/'+id,{method:'POST'});load();}",
    "async function rejectImage(id){await fetch('/api/reject-image/'+id,{method:'POST'});load();}",
    "async function reject(id){await fetch('/api/reject/'+id,{method:'POST'});load();}",
    "async function saveEdit(id){",
    "var q=document.getElementById('eq'+id).value,a=document.getElementById('ea'+id).value;",
    "await fetch('/api/puzzle/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,answer:a})});",
    "load();}",
    "async function approveAllText(){await fetch('/api/approve-all-text',{method:'POST'});load();}",
    "async function approveAllImages(){await fetch('/api/approve-all-images',{method:'POST'});load();}",
    "load();setInterval(load,15000);",
    "</script></body></html>",
  ].join("\n");
}

app.listen(PORT, async () => {
  console.log("\nGata dashboard: http://localhost:" + PORT);
  try { await open("http://localhost:" + PORT); } catch {}
});
