#!/usr/bin/env python3
import json, os, sys, shutil, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1080, 1920
FPS = 30
Q_SECS, R_SECS = 8, 7
TOTAL = (Q_SECS + R_SECS) * FPS

BG        = (10, 10, 10)
AMBER_HI  = (239, 159, 39)
AMBER_MID = (186, 117, 23)
TEXT_WARM = (245, 240, 232)
DIFF_COL  = {"Easy": (93,202,165), "Medium": (239,159,39), "Hard": (226,75,74)}

def font(size, bold=False):
    for p in [
        f"/usr/share/fonts/truetype/dejavu/DejaVuSans{'-Bold' if bold else ''}.ttf",
        f"/usr/share/fonts/truetype/liberation/LiberationSans-{'Bold' if bold else 'Regular'}.ttf",
    ]:
        if os.path.exists(p): return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def wrap(draw, text, f, maxw):
    words, lines, line = text.split(), [], []
    for w in words:
        test = " ".join(line + [w])
        if draw.textbbox((0,0), test, font=f)[2] > maxw and line:
            lines.append(" ".join(line)); line = [w]
        else: line.append(w)
    if line: lines.append(" ".join(line))
    return lines

def centered(draw, text, f, color, cx, y, maxw, lh):
    for i, line in enumerate(wrap(draw, text, f, maxw)):
        bb = draw.textbbox((0,0), line, font=f)
        draw.text((cx-(bb[2]-bb[0])//2, y+i*lh), line, font=f, fill=color)
    return len(wrap(draw, text, f, maxw)) * lh

def load_bg(path):
    try:
        img = Image.open(path).convert("RGB")
        r = img.width/img.height; t = WIDTH/HEIGHT
        nw, nh = (WIDTH, int(WIDTH/r)) if r <= t else (int(HEIGHT*r), HEIGHT)
        img = img.resize((nw, nh), Image.LANCZOS)
        return img.crop(((nw-WIDTH)//2, (nh-HEIGHT)//2, (nw-WIDTH)//2+WIDTH, (nh-HEIGHT)//2+HEIGHT))
    except Exception as e:
        print(f"  BG warning: {e}"); return None

def draw_frame(puzzle, phase, progress, bg=None):
    base = bg.copy() if bg else Image.new("RGB", (WIDTH,HEIGHT), BG)
    ov = Image.new("RGBA", (WIDTH,HEIGHT), (0,0,0, 215 if phase=="reveal" else 188))
    frame = Image.alpha_composite(base.convert("RGBA"), ov)
    d = ImageDraw.Draw(frame)
    M, cx = 80, WIDTH//2

    d.text((M, 74), "Gata.", font=font(26,True), fill=AMBER_HI)
    diff = puzzle.get("difficulty","")
    dc = DIFF_COL.get(diff, AMBER_HI)
    bb = d.textbbox((0,0), diff, font=font(22))
    d.text((WIDTH-M-(bb[2]-bb[0]), 78), diff, font=font(22), fill=(*dc, 220))
    topic = puzzle.get("topic","").upper()
    bb2 = d.textbbox((0,0), topic, font=font(19))
    d.text((cx-(bb2[2]-bb2[0])//2, 116), topic, font=font(19), fill=(255,255,255,50))
    d.rectangle([M,152,WIDTH-M,153], fill=(*AMBER_MID,110))

    if phase == "question":
        centered(d, puzzle["question"], font(60,True), TEXT_WARM, cx, int(HEIGHT*0.30), WIDTH-M*2, 80)
        if progress > 0.35:
            a = min(255, int(255*(progress-0.35)/0.3))
            hint = "Think before you scroll..."
            hb = d.textbbox((0,0), hint, font=font(30))
            d.text((cx-(hb[2]-hb[0])//2, int(HEIGHT*0.74)), hint, font=font(30), fill=(255,255,255,a))
        by, bw = HEIGHT-96, WIDTH-M*2
        filled = int(bw*(1-progress))
        d.rectangle([M,by,M+bw,by+4], fill=(255,255,255,18))
        if filled > 0: d.rectangle([M,by,M+filled,by+4], fill=(*AMBER_MID,220))

    if phase == "reveal":
        centered(d, puzzle["question"], font(29), (255,255,255,70), cx, int(HEIGHT*0.20), WIDTH-M*2, 44)
        dy = int(HEIGHT*0.43)
        d.rectangle([M,dy,WIDTH-M,dy+1], fill=(*AMBER_MID,140))
        ra = min(255, int(255*min(1.0, progress*3)))
        centered(d, puzzle["answer"], font(68,True), (*TEXT_WARM,ra), cx, int(HEIGHT*0.49), WIDTH-M*2, 84)
        if progress > 0.5:
            ea = min(255, int(255*min(1.0,(progress-0.5)*4)))
            centered(d, puzzle["explanation"], font(34), (255,255,255,ea), cx, int(HEIGHT*0.75), WIDTH-M*2, 52)
        cta = "Subscribe - daily puzzle"
        cb = d.textbbox((0,0), cta, font=font(27,True))
        d.text((cx-(cb[2]-cb[0])//2, HEIGHT-106), cta, font=font(27,True), fill=(*AMBER_MID,180))

    return frame.convert("RGB")

def render_puzzle(puzzle, out_dir):
    pid = puzzle["id"]
    fd = Path(out_dir) / f"frames_{pid}"
    fd.mkdir(parents=True, exist_ok=True)
    bg = load_bg(puzzle.get("imagePath")) if puzzle.get("imagePath") else None
    print(f"  {'With image' if bg else 'No image'}: {puzzle.get('hook','')[:55]}")
    for f in range(TOTAL):
        t = f/FPS
        phase, prog = ("question", t/Q_SECS) if t < Q_SECS else ("reveal", (t-Q_SECS)/R_SECS)
        draw_frame(puzzle, phase, min(prog,1.0), bg).save(str(fd/f"frame_{f:05d}.png"))
    out = Path(out_dir) / f"{pid}.mp4"
    if shutil.which("ffmpeg"):
        try:
            subprocess.run(["ffmpeg","-y","-framerate",str(FPS),"-i",str(fd/"frame_%05d.png"),
                "-c:v","libx264","-pix_fmt","yuv420p","-crf","18","-preset","slow",str(out)],
                capture_output=True, check=True)
            shutil.rmtree(fd)
            print(f"  Video: {out}")
            return str(out)
        except subprocess.CalledProcessError as e:
            print(f"  ffmpeg error: {e.stderr.decode()[:100]}")
    print(f"  Frames at: {fd}")
    return str(fd)

def main():
    qp = Path("output/queue.json")
    if not qp.exists(): print("No queue.json."); return
    with open(qp) as f: queue = json.load(f)
    approved = [p for p in queue if p.get("status")=="approved" and not p.get("videoPath")]
    if not approved: print("No approved puzzles to render."); return
    Path("output/videos").mkdir(parents=True, exist_ok=True)
    print(f"Rendering {len(approved)} puzzles...\n")
    for puzzle in approved:
        puzzle["videoPath"] = render_puzzle(puzzle, "output/videos")
        puzzle["renderedAt"] = __import__("datetime").datetime.utcnow().isoformat()+"Z"
    pm = {p["id"]:p for p in approved}
    with open(qp,"w") as f: json.dump([pm.get(p["id"],p) for p in queue], f, indent=2)
    print(f"\nDone. {len(approved)} videos ready.")

if __name__ == "__main__": main()
