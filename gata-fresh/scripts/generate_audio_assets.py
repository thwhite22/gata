#!/usr/bin/env python3
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
from pathlib import Path

SR = 44100
OUT = Path(__file__).parent.parent / "assets" / "audio"
OUT.mkdir(parents=True, exist_ok=True)

def bp(data, lo, hi, order=4):
    nyq = SR / 2
    sos = butter(order, [lo/nyq, hi/nyq], btype='bandpass', output='sos')
    return sosfilt(sos, data)

def save(path, sig):
    wavfile.write(str(path), SR, (np.clip(sig,-1,1)*32767).astype(np.int16))
    print(f"  {path.name} ({len(sig)/SR:.1f}s)")

def norm(s, pk=0.85):
    m = np.max(np.abs(s)); return s/m*pk if m > 0 else s

print("Generating heartbeat...")
bpm = 72
cn = int(SR*60/bpm)
beat = np.zeros(cn)

def thump(fh, fl, dur, amp):
    t = np.linspace(0, dur, int(SR*dur), endpoint=False)
    e = np.exp(-t*55)
    return bp((np.sin(2*np.pi*fh*t)+np.sin(2*np.pi*fl*t)*0.7)*e*amp, 28, 190)

lub = thump(62,38,0.09,0.75); dub = thump(55,33,0.11,1.0); gap = int(SR*0.18)
beat[:len(lub)] += lub; beat[gap:gap+len(dub)] += dub
beat = norm(beat, 0.82)
n = int(np.ceil(8*SR/cn))+1
hb = np.tile(beat,n)[:8*SR]
fi, fo = int(SR*0.15), int(SR*0.40)
hb[:fi] *= np.linspace(0,1,fi); hb[-fo:] *= np.linspace(1,0,fo)
save(OUT/"heartbeat.wav", hb)

print("Generating chime...")
dur = 2.4; n = int(SR*dur); t = np.linspace(0,dur,n,endpoint=False)
freqs = [440.0,659.3,880.0,1108.7,1318.5]; amps = [1.0,0.55,0.4,0.28,0.18]
sig = np.zeros(n)
for f,a in zip(freqs,amps):
    decay = np.exp(-t*(1.8+f/800))
    atk = np.ones(n); atk[:int(SR*0.012)] = np.linspace(0,1,int(SR*0.012))**0.5
    sig += np.sin(2*np.pi*f*t)*decay*atk*a
sig = bp(sig, 180, 12000)
freqs2=[523.3,783.9,1046.5]; sig2=np.zeros(n)
for f,a in zip(freqs2,[0.4,0.22,0.14]):
    sig2 += np.sin(2*np.pi*f*t)*np.exp(-t*(1.8+f/800))*a*0.35
s2s = np.zeros(n); pad = int(SR*0.3); s2s[pad:] = sig2[:n-pad]
save(OUT/"chime.wav", norm(sig+s2s, 0.78))

print("\nAudio assets ready.")
