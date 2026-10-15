# 🏎️ Typing Speed Racer — Cyberpunk Arcade

A high-octane, cyberpunk-themed typing racer web game built purely with **Vanilla HTML5, CSS3, and ES6 JavaScript**. Zero external frameworks, zero libraries, zero external image/audio files.

![Typing Speed Racer Preview](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20ES6%20JavaScript-00ff88?style=for-the-badge)
![Audio Engine](https://img.shields.io/badge/Audio-Web%20Audio%20API%20Synthesizer-00d4ff?style=for-the-badge)
![Deployment](https://img.shields.io/badge/Deploy-Vercel%20Ready-ff3366?style=for-the-badge)

---

## ⚡ Live Demo
Deploy directly to Vercel or GitHub Pages in one click! No build step needed.

---

## 🚀 Key Features

### 1. 🏁 Dual-Lane SVG Cyber Track
- **Player Car (Neon Green `#00ff88`):** Moves from `0%` to `100%` across the track proportionally to your accurately typed characters.
- **Cyber Ghost Bot (Electric Blue `#00d4ff`):** Smoothly navigates the track at a configurable target speed (40, 60, 80, 100 WPM) powered by `requestAnimationFrame`.
- Start line, distance hash marks (25%, 50%, 75%), and checkered finish line with neon underglow and particle speed trails.

### 2. ⌨️ Core Typing Engine
- Rendered as discrete `<span>` elements for each character with distinct visual states:
  - **Untyped:** Muted gray (`#4b5563`).
  - **Active Cursor:** Glowing electric blue underline with breathing pulse animation.
  - **Correct:** Vibrant neon green (`#00ff88`).
  - **Mistake:** High-contrast crimson red (`#ff3366`) with translucent red backdrop.
- Seamless input capture without requiring clicking into an input box (global key listener + mobile fallback input).
- Full backspace correction support.
- Non-collapsing space bar handling (`&nbsp;` with custom min-width).

### 3. 🔊 Pure Web Audio API Sound Synthesizer
*Zero external MP3/WAV files! Every sound is generated in real-time by math and oscillators:*
- **Mechanical Switch Click:** Dual-stage snap transient with frequency drop and bandpass filtered noise burst for authentic tactile feedback.
- **Typo Thud:** Low-frequency pitch bend (140Hz &rarr; 45Hz) with lowpass filtering.
- **Victory Fanfare:** Upbeat polyphonic major chord arpeggio (C5 &rarr; E5 &rarr; G5 &rarr; C6) with linear attack and exponential decay.
- **Defeat Tone:** Descending retro synth fade.
- **Sound Mute Toggle:** Instant audio muting with state saved to `localStorage`.

### 4. 📊 Real-Time Telemetry & HUD (200ms tick)
- **Net WPM:** `((Correct Characters / 5) / Elapsed Minutes)`
- **Raw WPM:** `((Total Keystrokes / 5) / Elapsed Minutes)`
- **Accuracy %:** `((Total Keystrokes - Mistakes) / Total Keystrokes) * 100`
- **Race Modes:**
  - *Passage Mode:* Race to the quote's finish line.
  - *Timed Mode:* 15s / 30s / 60s countdown blitz.
- **Combo & Streak:** Consecutive keystroke counter with error count.
- **Persistent Storage:** All-Time Best WPM and 50-race history drawer saved in `localStorage`.

### 5. 📜 Curated Quote Library (18 Passages)
A rich built-in library spanning:
- Software Engineering & Clean Code (*Linus Torvalds, Martin Fowler, Edsger Dijkstra, Margaret Hamilton, Robert C. Martin*)
- Cyberpunk & Sci-Fi Classics (*Neuromancer, Blade Runner, The Matrix, Tron, Ghost in the Shell*)
- Hackathon & Startup Culture (*3:00 AM coffee-to-code, rapid shipping*)

---

## 🎮 Shortcuts & Controls

| Shortcut | Action |
| :--- | :--- |
| `Any key` | Immediately starts the race on the first keystroke |
| `Tab + Enter` | Quick Restart with a new passage |
| `Esc` | Close modal or quick restart |
| `Backspace` | Erase previous character and correct typos |

---

## 🛠️ Project Structure

```text
Typing-Speed-Racer/
├── index.html        # Semantic HTML5 layout, HUD, SVG race track, typing arena, modals
├── style.css         # Cyberpunk dark mode (#0b0f19), neon accents, glassmorphism, responsive
├── app.js            # Modular state machine, typing engine, bot pacing, Web Audio API
├── .gitignore        # Clean repo hygiene
└── README.md         # Documentation & guide
```

---

## 🚢 Deploying to Vercel

Because this is built with pure standard web technologies without bundlers or package managers:

### Option A: Via GitHub (Recommended)
1. Commit and push your code to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: complete typing speed racer game"
   git branch -M main
   git remote add origin https://github.com/<your-username>/Typing-Speed-Racer.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `Typing-Speed-Racer` repository.
4. Leave all build settings as default (Framework Preset: **Other**, Build Command: empty, Output Directory: empty).
5. Click **Deploy** — your site will be live in 10 seconds!

### Option B: Via Vercel CLI
```bash
npx vercel
```

---

## 📄 License
MIT License &mdash; Free to customize, share, and race!
