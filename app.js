/**
 * TYPING SPEED RACER - CYBERPUNK ARCADE MOTORSPORTS
 * Core Architecture:
 * 1. AudioSynthesizer (Web Audio API mechanical switch & synth generation)
 * 2. PassageManager (Curated 18+ quotes database & randomizer)
 * 3. RaceEngine (State machine, typing input, character DOM, WPM/Acc formulas)
 * 4. BotRacer (Smooth requestAnimationFrame ghost car pacing)
 * 5. Storage & History Manager (localStorage persistence & records)
 */

'use strict';

/* ==========================================================================
   1. AUDIO SYNTHESIZER (Pure Web Audio API - Zero External Audio Files)
   ========================================================================== */
class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('typing_racer_muted') === 'true';
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    localStorage.setItem('typing_racer_muted', muted ? 'true' : 'false');
  }

  // Crisp mechanical switch click (dual-stage tactile click)
  playKeyClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Stage 1: High frequency snap transient
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Mechanical click pitch drop (1800Hz -> 300Hz in 0.025s)
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1600 + Math.random() * 300, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.025);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);

    // Stage 2: Short subtle noise buffer click
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.015);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2400;
      filter.Q.value = 3.0;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.018);
    } catch (e) {
      // Noise buffer fallback if restricted
    }
  }

  // Low-frequency dull thud on typos (140Hz -> 45Hz pitch drop)
  playTypo() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, now);
    filter.frequency.linearRampToValueAtTime(90, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Upbeat synth chord arpeggio for victory (C5 - E5 - G5 - C6)
  playVictory() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const startTime = this.ctx.currentTime;

    chord.forEach((freq, idx) => {
      const noteTime = startTime + idx * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.2, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.65);
    });
  }

  // Defeat / Time Expired Synth Tone (Descending Retro Fade)
  playDefeat() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [440, 370, 311, 261];
    const startTime = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const noteTime = startTime + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.15, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.28);
    });
  }
}

/* ==========================================================================
   2. PASSAGES DATABASE (18 Curated Quotes: Software, Hackathons, Sci-Fi)
   ========================================================================== */
const PASSAGES = [
  {
    category: "SOFTWARE ENGINEERING",
    author: "Linus Torvalds",
    text: "Talk is cheap. Show me the code. Bad programmers worry about the code. Good programmers worry about data structures and their relationships."
  },
  {
    category: "CLEAN CODE",
    author: "Martin Fowler",
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. Refactoring is a controlled technique for improving design."
  },
  {
    category: "COMPUTER SCIENCE",
    author: "Edsger W. Dijkstra",
    text: "Simplicity is prerequisite for reliability. If debugging is the process of removing software bugs, then programming must be the process of putting them in."
  },
  {
    category: "HACKATHON CULTURE",
    author: "Arena Terminal at 03:00 AM",
    text: "It is three in the morning in the hackathon arena. The caffeine has transformed into raw adrenaline, git conflicts are resolved with sheer willpower, and the demo is running."
  },
  {
    category: "SCI-FI & CYBERPUNK",
    author: "William Gibson (Neuromancer)",
    text: "The sky above the port was the color of television, tuned to a dead channel. Cyberspace was a consensual hallucination experienced daily by billions of legitimate operators."
  },
  {
    category: "SCI-FI CLASSIC",
    author: "Blade Runner (Roy Batty)",
    text: "I have seen things you people would not believe. Attack ships on fire off the shoulder of Orion. All those moments will be lost in time, like tears in rain."
  },
  {
    category: "CYBERPUNK CINEMA",
    author: "The Matrix (Morpheus)",
    text: "The Matrix is everywhere. It is all around us. Even now, in this very room. You have to let it all go, Neo. Fear, doubt, and disbelief. Free your mind."
  },
  {
    category: "SOFTWARE ARCHITECTURE",
    author: "Robert C. Martin",
    text: "Clean code is simple and direct. Clean code reads like well-written prose. It never obscures the designer intent, but rather is full of crisp abstractions."
  },
  {
    category: "COMPUTING PIONEERS",
    author: "Grace Hopper",
    text: "The most dangerous phrase in the language is, we have always done it this way. A ship in port is safe, but that is not what ships are built for."
  },
  {
    category: "CYBERPUNK ARCADE",
    author: "Night City Grid Dispatch",
    text: "Wake up, samurai. We have a city to burn. The neon lights flicker against chrome skyscrapers as neural interfaces sync with the high-speed data stream."
  },
  {
    category: "UNIX PHILOSOPHY",
    author: "Doug McIlroy",
    text: "Write programs that do one thing and do it well. Write programs to work together. Write programs to handle text streams, because that is a universal interface."
  },
  {
    category: "ALGORITHMS",
    author: "Donald Knuth",
    text: "Premature optimization is the root of all evil in programming. We should forget about small efficiencies, say about ninety-seven percent of the time."
  },
  {
    category: "ARTIFICIAL INTELLIGENCE",
    author: "Alan Turing",
    text: "We can only see a short distance ahead, but we can see plenty there that needs to be done. A computer would deserve to be called intelligent if it could deceive a human."
  },
  {
    category: "STARTUP CULTURE",
    author: "Silicon Hacker Manifesto",
    text: "Ship fast, break limits, and iterate without fear. The difference between an abstract idea and reality is sixty seconds of courage and a thousand lines of clean syntax."
  },
  {
    category: "SCI-FI REALMS",
    author: "Tron (Kevin Flynn)",
    text: "The Grid. A digital frontier. I tried to picture clusters of information as they moved through the computer. Ships, motorcycles, with the circuits glittering like freeways."
  },
  {
    category: "EXTREME PROGRAMMING",
    author: "Kent Beck",
    text: "Make it work, make it right, make it fast. Optimism is an occupational hazard of programming; automated feedback is the only reliable treatment."
  },
  {
    category: "APOLLO MISSIONS",
    author: "Margaret Hamilton",
    text: "There was no second chance. We had to find a way to make software that was completely reliable, error-tolerant, and capable of landing humans on the moon."
  },
  {
    category: "CYBERNETIC PHILOSOPHY",
    author: "Ghost in the Shell (Major)",
    text: "There are countless ingredients that make up the human body and mind, like all the components that make up me as an individual with my own personality."
  }
];

/* ==========================================================================
   3. STORAGE & HISTORY MANAGER
   ========================================================================== */
class StorageManager {
  static getBestWPM() {
    return parseInt(localStorage.getItem('typing_racer_best_wpm') || '0', 10);
  }

  static setBestWPM(wpm) {
    localStorage.setItem('typing_racer_best_wpm', wpm.toString());
  }

  static getRaceHistory() {
    try {
      const data = localStorage.getItem('typing_racer_history');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static saveRaceRecord(record) {
    const history = StorageManager.getRaceHistory();
    history.unshift(record);
    if (history.length > 50) history.pop();
    localStorage.setItem('typing_racer_history', JSON.stringify(history));
  }

  static clearHistory() {
    localStorage.removeItem('typing_racer_history');
  }
}

/* ==========================================================================
   4. BOT RACER (Smooth requestAnimationFrame Ghost Pacing)
   ========================================================================== */
class BotRacer {
  constructor(domElement, badgeElement, progressPctElement) {
    this.domElement = domElement;
    this.badgeElement = badgeElement;
    this.progressPctElement = progressPctElement;
    this.targetWpm = 60;
    this.progress = 0; // 0 to 100
    this.animFrameId = null;
    this.startTime = null;
    this.durationMs = 0;
  }

  setSpeed(wpm) {
    this.targetWpm = wpm;
    if (this.badgeElement) {
      this.badgeElement.textContent = `${wpm} WPM`;
    }
  }

  start(totalChars, modeDurationSec = null) {
    this.reset();
    
    // Calculate total time bot needs to finish
    if (modeDurationSec) {
      // In timed mode, bot travels at targetWpm relative to expected chars
      // Expected chars for bot in modeDurationSec = (targetWpm * 5 * modeDurationSec) / 60
      this.durationMs = modeDurationSec * 1000;
    } else {
      // Passage mode: Time = (totalChars / (targetWpm * 5)) * 60 seconds
      const charsPerSec = (this.targetWpm * 5) / 60;
      const totalSec = totalChars / charsPerSec;
      this.durationMs = totalSec * 1000;
    }

    this.startTime = performance.now();
    this.tick = this.tick.bind(this);
    this.animFrameId = requestAnimationFrame(this.tick);
  }

  tick(now) {
    if (!this.startTime) return;
    const elapsed = now - this.startTime;
    this.progress = Math.min(100, (elapsed / this.durationMs) * 100);

    this.render();

    if (this.progress < 100) {
      this.animFrameId = requestAnimationFrame(this.tick);
    }
  }

  render() {
    if (!this.domElement) return;

    const parent = this.domElement.parentElement;
    const trackWidth = parent ? parent.clientWidth : 800;
    // Travel from start line (left: 45px) to finish line (right: 50px) with 90px car width
    const maxTravel = Math.max(100, trackWidth - 185);
    const posX = (this.progress / 100) * maxTravel;

    this.domElement.style.left = '45px';
    this.domElement.style.transform = `translateX(${posX}px)`;

    if (this.progressPctElement) {
      this.progressPctElement.textContent = `${Math.round(this.progress)}%`;
    }
  }

  stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  reset() {
    this.stop();
    this.progress = 0;
    this.startTime = null;
    if (this.domElement) {
      this.domElement.style.left = '45px';
      this.domElement.style.transform = 'translateX(0px)';
    }
    if (this.progressPctElement) {
      this.progressPctElement.textContent = '0%';
    }
  }
}

/* ==========================================================================
   5. CORE TYPING RACE ENGINE
   ========================================================================== */
class TypingSpeedRacer {
  constructor() {
    // Sub-systems
    this.audio = new AudioSynthesizer();
    
    // DOM Elements Cache
    this.elements = {
      // Header controls
      soundToggleBtn: document.getElementById('sound-toggle-btn'),
      soundIconOn: document.getElementById('sound-icon-on'),
      soundIconOff: document.getElementById('sound-icon-off'),
      soundStatusText: document.getElementById('sound-status-text'),
      historyModalBtn: document.getElementById('history-modal-btn'),
      quickRestartBtn: document.getElementById('quick-restart-btn'),

      // Config Selectors
      modeSelector: document.getElementById('mode-selector'),
      botSpeedSelector: document.getElementById('bot-speed-selector'),

      // Track elements
      raceTrackContainer: document.getElementById('race-track-container'),
      trackStatusText: document.getElementById('track-status-text'),
      playerCar: document.getElementById('player-car'),
      playerBadgeWpm: document.getElementById('player-badge-wpm'),
      playerProgressPct: document.getElementById('player-progress-pct'),
      botCar: document.getElementById('bot-car'),
      botBadgeWpm: document.getElementById('bot-badge-wpm'),
      botProgressPct: document.getElementById('bot-progress-pct'),

      // Telemetry HUD
      hudWpm: document.getElementById('hud-wpm'),
      hudWpmBar: document.getElementById('hud-wpm-bar'),
      hudAccuracy: document.getElementById('hud-accuracy'),
      hudAccBar: document.getElementById('hud-acc-bar'),
      hudTimerLabel: document.getElementById('hud-timer-label'),
      hudTimer: document.getElementById('hud-timer'),
      hudTimerBar: document.getElementById('hud-timer-bar'),
      hudStreak: document.getElementById('hud-streak'),
      hudStreakBar: document.getElementById('hud-streak-bar'),
      hudErrorsLabel: document.getElementById('hud-errors-label'),
      hudBestWpm: document.getElementById('hud-best-wpm'),

      // Typing Arena
      arenaCard: document.getElementById('arena-card'),
      typingInput: document.getElementById('typing-input'),
      passageContainer: document.getElementById('passage-container'),
      passageCategory: document.getElementById('quote-category'),
      passageAuthor: document.getElementById('quote-author'),
      charProgressCounter: document.getElementById('char-progress-counter'),
      rawCpmCounter: document.getElementById('raw-cpm-counter'),
      capsLockWarning: document.getElementById('caps-lock-warning'),
      arenaFocusText: document.getElementById('arena-focus-text'),

      // Results Modal
      resultsModal: document.getElementById('results-modal'),
      modalBannerPill: document.getElementById('modal-banner-pill'),
      modalResultBadge: document.getElementById('modal-result-badge'),
      modalResultTitle: document.getElementById('modal-result-title'),
      modalResultSubtitle: document.getElementById('modal-result-subtitle'),
      newHighScoreBanner: document.getElementById('new-high-score-banner'),
      modalWpm: document.getElementById('modal-wpm'),
      modalRawWpm: document.getElementById('modal-raw-wpm'),
      modalAccuracy: document.getElementById('modal-accuracy'),
      modalErrorCount: document.getElementById('modal-error-count'),
      modalTime: document.getElementById('modal-time'),
      modalModeLabel: document.getElementById('modal-mode-label'),
      modalGhostWpm: document.getElementById('modal-ghost-wpm'),
      modalMarginLabel: document.getElementById('modal-margin-label'),
      modalRestartBtn: document.getElementById('modal-restart-btn'),
      modalCloseBtn: document.getElementById('modal-close-btn'),

      // History Modal
      historyModal: document.getElementById('history-modal'),
      histTotalRaces: document.getElementById('hist-total-races'),
      histBestWpm: document.getElementById('hist-best-wpm'),
      histAvgAcc: document.getElementById('hist-avg-acc'),
      clearHistoryBtn: document.getElementById('clear-history-btn'),
      historyTableBody: document.getElementById('history-table-body'),
      historyEmptyMessage: document.getElementById('history-empty-message'),
      historyCloseBtn: document.getElementById('history-close-btn')
    };

    // Bot Racer instance
    this.bot = new BotRacer(
      this.elements.botCar,
      this.elements.botBadgeWpm,
      this.elements.botProgressPct
    );

    // Game Configuration State
    this.mode = 'passage'; // 'passage' | '15' | '30' | '60'
    this.botSpeed = 60; // 40, 60, 80, 100

    // Race Runtime State
    this.currentQuote = null;
    this.charSpans = [];
    this.currentIndex = 0;
    this.charStates = []; // 'untyped' | 'correct' | 'incorrect'
    this.totalKeystrokes = 0;
    this.mistakesCount = 0;
    this.correctCharsCount = 0;
    this.currentStreak = 0;
    this.maxStreak = 0;
    this.startTime = null;
    this.isActive = false;
    this.isFinished = false;
    this.hudInterval = null;
    this.timedCountdown = null;
    this.tabPressed = false;

    this.init();
  }

  init() {
    this.updateSoundUI();
    this.updateBestWpmUI();
    this.setupEventListeners();
    this.startNewRace();
  }

  // ================= Event Listeners =================
  setupEventListeners() {
    // 1. Keyboard Input Handling
    this.lastKeyDownTime = 0;
    window.addEventListener('keydown', (e) => this.handleGlobalKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleGlobalKeyUp(e));

    // Hidden input synchronization (for mobile virtual keyboards)
    this.elements.typingInput.addEventListener('input', (e) => {
      // Ignore input event if keydown already processed this stroke within 80ms
      if (performance.now() - this.lastKeyDownTime < 80) {
        this.elements.typingInput.value = '';
        return;
      }

      if (e.inputType === 'insertText' && e.data) {
        this.processCharInput(e.data);
      } else if (e.inputType === 'deleteContentBackward') {
        this.processBackspace();
      }
      this.elements.typingInput.value = '';
    });

    // 2. Click on arena to focus
    this.elements.arenaCard.addEventListener('click', () => {
      this.focusInput();
    });

    this.elements.typingInput.addEventListener('focus', () => {
      this.elements.arenaCard.classList.add('arena-focused');
      this.elements.arenaFocusText.textContent = 'ARENA ACTIVE • TYPE FREELY';
    });

    this.elements.typingInput.addEventListener('blur', () => {
      this.elements.arenaCard.classList.remove('arena-focused');
      this.elements.arenaFocusText.textContent = 'CLICK ARENA TO FOCUS';
    });

    // 3. Sound Toggle Button
    this.elements.soundToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleSound();
    });

    // 4. Quick Restart Button
    this.elements.quickRestartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.startNewRace();
    });

    // 5. Mode Selector Buttons
    this.elements.modeSelector.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mode = btn.getAttribute('data-mode');
        this.setMode(mode);
      });
    });

    // 6. Bot Speed Selector Buttons
    this.elements.botSpeedSelector.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const speed = parseInt(btn.getAttribute('data-speed'), 10);
        this.setBotSpeed(speed);
      });
    });

    // 7. Results Modal Buttons
    this.elements.modalRestartBtn.addEventListener('click', () => {
      this.hideModal(this.elements.resultsModal);
      this.startNewRace();
    });

    this.elements.modalCloseBtn.addEventListener('click', () => {
      this.hideModal(this.elements.resultsModal);
      this.focusInput();
    });

    // 8. History Modal Buttons
    this.elements.historyModalBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showHistoryModal();
    });

    this.elements.historyCloseBtn.addEventListener('click', () => {
      this.hideModal(this.elements.historyModal);
      this.focusInput();
    });

    this.elements.clearHistoryBtn.addEventListener('click', () => {
      if (confirm('Reset and clear all saved race logs from local storage?')) {
        StorageManager.clearHistory();
        this.renderHistoryTable();
      }
    });

    // 9. Window resize listener to keep cars positioned accurately
    window.addEventListener('resize', () => {
      this.bot.render();
      const totalChars = this.currentQuote ? this.currentQuote.text.length : 1;
      const progress = this.mode === 'passage' 
        ? Math.min(100, (this.correctCharsCount / totalChars) * 100)
        : Math.min(100, (this.correctCharsCount / ((this.botSpeed * 5 * parseInt(this.mode, 10)) / 60)) * 100);
      const { netWpm } = this.calculateMetrics();
      this.updatePlayerCar(progress, netWpm);
    });

    // Close modals on clicking overlay backdrop
    [this.elements.resultsModal, this.elements.historyModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideModal(modal);
          this.focusInput();
        }
      });
    });
  }

  focusInput() {
    this.elements.typingInput.focus({ preventScroll: true });
  }

  // ================= Game Setup & Reset =================
  startNewRace() {
    // 1. Reset state
    this.stopHudLoop();
    this.bot.reset();
    this.isActive = false;
    this.isFinished = false;
    this.startTime = null;
    this.currentIndex = 0;
    this.totalKeystrokes = 0;
    this.mistakesCount = 0;
    this.correctCharsCount = 0;
    this.currentStreak = 0;
    this.maxStreak = 0;
    this.elements.typingInput.value = '';

    // 2. Hide any open modals
    this.hideModal(this.elements.resultsModal);
    this.hideModal(this.elements.historyModal);

    // 3. Select random quote (different from current if possible)
    let nextQuote = PASSAGES[Math.floor(Math.random() * PASSAGES.length)];
    if (this.currentQuote && PASSAGES.length > 1) {
      while (nextQuote.text === this.currentQuote.text) {
        nextQuote = PASSAGES[Math.floor(Math.random() * PASSAGES.length)];
      }
    }
    this.currentQuote = nextQuote;

    // 4. Update Quote Meta Info
    this.elements.passageCategory.textContent = `CATEGORY: ${this.currentQuote.category}`;
    this.elements.passageAuthor.textContent = this.currentQuote.author;

    // 5. Render Spans for Target Passage
    this.renderPassageSpans();

    // 6. Reset Player Car Position & Track UI
    this.updatePlayerCar(0, 0);
    this.elements.trackStatusText.textContent = 'GRID READY • TYPE FIRST CHAR TO ACCELERATE';

    // 7. Reset HUD Metrics
    this.elements.hudWpm.textContent = '0';
    this.elements.hudWpmBar.style.width = '0%';
    this.elements.hudAccuracy.textContent = '100';
    this.elements.hudAccBar.style.width = '100%';
    this.elements.hudStreak.textContent = '0';
    this.elements.hudStreakBar.style.width = '0%';
    this.elements.hudErrorsLabel.textContent = '(0 err)';
    this.elements.charProgressCounter.textContent = `0 / ${this.currentQuote.text.length}`;
    this.elements.rawCpmCounter.textContent = '0';

    if (this.mode === 'passage') {
      this.elements.hudTimerLabel.textContent = 'TIME ELAPSED';
      this.elements.hudTimer.textContent = '0.0';
      this.elements.hudTimerBar.style.width = '0%';
    } else {
      const duration = parseInt(this.mode, 10);
      this.elements.hudTimerLabel.textContent = 'TIME REMAINING';
      this.elements.hudTimer.textContent = `${duration}.0`;
      this.elements.hudTimerBar.style.width = '100%';
    }

    this.updateBestWpmUI();
    this.focusInput();
  }

  renderPassageSpans() {
    this.elements.passageContainer.innerHTML = '';
    this.charSpans = [];
    this.charStates = [];

    const text = this.currentQuote.text;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const span = document.createElement('span');
      span.className = 'char untyped';
      if (char === ' ') {
        span.classList.add('space-char');
        span.innerHTML = '&nbsp;';
      } else {
        span.textContent = char;
      }
      this.elements.passageContainer.appendChild(span);
      this.charSpans.push(span);
      this.charStates.push('untyped');
    }

    // Set active cursor on first char
    if (this.charSpans.length > 0) {
      this.charSpans[0].classList.add('active-cursor');
    }
  }

  // ================= Typing Input Engine =================
  handleGlobalKeyDown(e) {
    // Check Caps Lock state
    if (e.getModifierState) {
      const capsOn = e.getModifierState('CapsLock');
      this.elements.capsLockWarning.classList.toggle('hidden', !capsOn);
    }

    // Quick Restart Shortcut: Tab + Enter or dedicated Escape
    if (e.key === 'Tab') {
      this.tabPressed = true;
      // Prevent tabbing out of the game
      e.preventDefault();
      return;
    }

    if (e.key === 'Enter' && this.tabPressed) {
      e.preventDefault();
      this.startNewRace();
      return;
    }

    if (e.key === 'Escape') {
      if (!this.elements.resultsModal.classList.contains('hidden')) {
        this.hideModal(this.elements.resultsModal);
        this.focusInput();
        return;
      }
      if (!this.elements.historyModal.classList.contains('hidden')) {
        this.hideModal(this.elements.historyModal);
        this.focusInput();
        return;
      }
      // If racing, Escape quick restarts
      this.startNewRace();
      return;
    }

    // If modal is open, ignore game typing
    if (!this.elements.resultsModal.classList.contains('hidden') || 
        !this.elements.historyModal.classList.contains('hidden')) {
      return;
    }

    // Ignore modifier combinations (Ctrl+C, Ctrl+R, Alt+Tab, etc.)
    if (e.ctrlKey || e.altKey || e.metaKey) {
      return;
    }

    // Backspace handling
    if (e.key === 'Backspace') {
      e.preventDefault();
      this.processBackspace();
      return;
    }

    // Printable character handling
    if (e.key.length === 1) {
      e.preventDefault();
      this.lastKeyDownTime = performance.now();
      this.processCharInput(e.key);
    }
  }

  handleGlobalKeyUp(e) {
    if (e.key === 'Tab') {
      this.tabPressed = false;
    }
  }

  startRaceIfPending() {
    if (!this.isActive && !this.isFinished) {
      this.isActive = true;
      this.startTime = performance.now();
      this.audio.init();

      this.elements.trackStatusText.textContent = 'RACE IN PROGRESS • FULL THROTTLE';

      // Start Bot Racer
      const modeDuration = this.mode === 'passage' ? null : parseInt(this.mode, 10);
      this.bot.start(this.currentQuote.text.length, modeDuration);

      // Start Live HUD Interval (every 200ms)
      this.startHudLoop();
    }
  }

  processCharInput(char) {
    if (this.isFinished) return;

    const targetChar = this.currentQuote.text[this.currentIndex];
    if (targetChar === undefined) return;

    // Case-tolerant matching so lowercase and uppercase both match accurately
    const isMatch = (char === targetChar) || (char.toLowerCase() === targetChar.toLowerCase());

    // Strict start rule: Timer and bot start strictly on the first valid keystroke
    if (!this.isActive) {
      if (!isMatch) {
        // Do not penalize or start race on invalid pre-race keystroke
        return;
      }
      this.startRaceIfPending();
    }

    this.totalKeystrokes++;
    const currentSpan = this.charSpans[this.currentIndex];

    // Remove active cursor from current
    currentSpan.classList.remove('active-cursor');

    if (isMatch) {
      this.charStates[this.currentIndex] = 'correct';
      currentSpan.className = `char correct ${targetChar === ' ' ? 'space-char' : ''}`;
      this.correctCharsCount++;
      this.currentStreak++;
      if (this.currentStreak > this.maxStreak) {
        this.maxStreak = this.currentStreak;
      }
      this.audio.playKeyClick();
    } else {
      this.charStates[this.currentIndex] = 'incorrect';
      currentSpan.className = `char incorrect ${targetChar === ' ' ? 'space-char' : ''}`;
      this.mistakesCount++;
      this.currentStreak = 0;
      this.audio.playTypo();
    }

    this.currentIndex++;

    // Advance cursor to next character
    if (this.currentIndex < this.charSpans.length) {
      this.charSpans[this.currentIndex].classList.add('active-cursor');
      this.scrollActiveCharIntoView(this.charSpans[this.currentIndex]);
    }

    // Immediate HUD & Car position update
    this.updateLiveMetrics();

    // Check Victory Condition
    if (this.currentIndex >= this.currentQuote.text.length) {
      this.finishRace(true);
    }
  }

  processBackspace() {
    if (this.isFinished || this.currentIndex === 0) return;

    // Remove cursor from current position
    if (this.currentIndex < this.charSpans.length) {
      this.charSpans[this.currentIndex].classList.remove('active-cursor');
    }

    this.currentIndex--;

    // Revert state of previous character
    const prevSpan = this.charSpans[this.currentIndex];
    const prevChar = this.currentQuote.text[this.currentIndex];

    if (this.charStates[this.currentIndex] === 'correct') {
      this.correctCharsCount = Math.max(0, this.correctCharsCount - 1);
    }

    this.charStates[this.currentIndex] = 'untyped';
    prevSpan.className = `char untyped ${prevChar === ' ' ? 'space-char' : ''} active-cursor`;

    this.scrollActiveCharIntoView(prevSpan);
    this.updateLiveMetrics();
  }

  scrollActiveCharIntoView(charElement) {
    if (!charElement) return;
    const container = this.elements.passageContainer;
    const containerRect = container.getBoundingClientRect();
    const charRect = charElement.getBoundingClientRect();

    if (charRect.bottom > containerRect.bottom - 20) {
      container.scrollTop += (charRect.bottom - containerRect.bottom + 40);
    } else if (charRect.top < containerRect.top + 20) {
      container.scrollTop -= (containerRect.top - charRect.top + 40);
    }
  }

  // ================= Formulas & HUD Telemetry =================
  startHudLoop() {
    this.stopHudLoop();
    this.hudInterval = setInterval(() => {
      this.updateLiveMetrics();
      this.checkTimedModeExpiry();
    }, 200);
  }

  stopHudLoop() {
    if (this.hudInterval) {
      clearInterval(this.hudInterval);
      this.hudInterval = null;
    }
  }

  checkTimedModeExpiry() {
    if (this.mode !== 'passage' && this.isActive && !this.isFinished) {
      const duration = parseInt(this.mode, 10);
      const elapsedSec = (performance.now() - this.startTime) / 1000;
      if (elapsedSec >= duration) {
        this.finishRace(false); // Time expired
      }
    }
  }

  calculateMetrics() {
    if (!this.startTime) {
      return { netWpm: 0, rawWpm: 0, accuracy: 100, elapsedSec: 0, rawCpm: 0 };
    }

    const elapsedMs = performance.now() - this.startTime;
    const elapsedMinutes = elapsedMs / 60000;
    const elapsedSec = elapsedMs / 1000;

    // Standard Typing Formulas:
    // Net WPM = ((Correct Characters / 5) / Elapsed Minutes)
    let netWpm = 0;
    let rawWpm = 0;
    let rawCpm = 0;

    if (elapsedMinutes > 0.015) { // Prevent division spikes in first ~1s
      netWpm = Math.max(0, Math.round((this.correctCharsCount / 5) / elapsedMinutes));
      rawWpm = Math.max(0, Math.round((this.totalKeystrokes / 5) / elapsedMinutes));
      rawCpm = Math.max(0, Math.round(this.correctCharsCount / elapsedMinutes));
    }

    // Accuracy % = ((Total Keystrokes - Mistakes) / Total Keystrokes) * 100
    let accuracy = 100;
    if (this.totalKeystrokes > 0) {
      const accurateStrokes = Math.max(0, this.totalKeystrokes - this.mistakesCount);
      accuracy = Math.max(0, Math.min(100, Math.round((accurateStrokes / this.totalKeystrokes) * 100)));
    }

    return { netWpm, rawWpm, accuracy, elapsedSec, rawCpm };
  }

  updateLiveMetrics() {
    const { netWpm, rawWpm, accuracy, elapsedSec, rawCpm } = this.calculateMetrics();

    // 1. WPM Displays
    this.elements.hudWpm.textContent = netWpm.toString();
    this.elements.hudWpmBar.style.width = `${Math.min(100, (netWpm / 140) * 100)}%`;

    // 2. Accuracy Displays
    this.elements.hudAccuracy.textContent = accuracy.toString();
    this.elements.hudAccBar.style.width = `${accuracy}%`;

    // 3. Timer Displays
    if (this.mode === 'passage') {
      this.elements.hudTimer.textContent = elapsedSec.toFixed(1);
      // Progress bar reflects chars finished
      const pct = (this.correctCharsCount / this.currentQuote.text.length) * 100;
      this.elements.hudTimerBar.style.width = `${pct}%`;
    } else {
      const duration = parseInt(this.mode, 10);
      const remaining = Math.max(0, duration - elapsedSec);
      this.elements.hudTimer.textContent = remaining.toFixed(1);
      const remainingPct = (remaining / duration) * 100;
      this.elements.hudTimerBar.style.width = `${remainingPct}%`;
    }

    // 4. Streak & Mistakes
    this.elements.hudStreak.textContent = this.currentStreak.toString();
    this.elements.hudStreakBar.style.width = `${Math.min(100, (this.currentStreak / 40) * 100)}%`;
    this.elements.hudErrorsLabel.textContent = `(${this.mistakesCount} err)`;

    // 5. Counters
    this.elements.charProgressCounter.textContent = `${this.currentIndex} / ${this.currentQuote.text.length}`;
    this.elements.rawCpmCounter.textContent = rawCpm.toString();

    // 6. Player Car Movement along Track
    const totalChars = this.currentQuote.text.length;
    let playerProgress = 0;
    if (this.mode === 'passage') {
      playerProgress = Math.min(100, (this.correctCharsCount / totalChars) * 100);
    } else {
      // In timed mode, player moves proportionally to target pace or chars
      const duration = parseInt(this.mode, 10);
      const targetCharsAtGhostPace = (this.botSpeed * 5 * duration) / 60;
      playerProgress = Math.min(100, (this.correctCharsCount / targetCharsAtGhostPace) * 100);
    }

    this.updatePlayerCar(playerProgress, netWpm);
  }

  updatePlayerCar(progressPct, wpm) {
    if (this.elements.playerCar) {
      const parent = this.elements.playerCar.parentElement;
      const trackWidth = parent ? parent.clientWidth : 800;
      const maxTravel = Math.max(100, trackWidth - 185);
      const posX = (progressPct / 100) * maxTravel;
      this.elements.playerCar.style.left = '45px';
      this.elements.playerCar.style.transform = `translateX(${posX}px)`;
    }
    if (this.elements.playerBadgeWpm) {
      this.elements.playerBadgeWpm.textContent = `${wpm} WPM`;
    }
    if (this.elements.playerProgressPct) {
      this.elements.playerProgressPct.textContent = `${Math.round(progressPct)}%`;
    }
  }

  // ================= Race Finish & Results =================
  finishRace(completedPassage) {
    if (this.isFinished) return;
    this.isFinished = true;
    this.isActive = false;
    this.stopHudLoop();
    this.bot.stop();

    const { netWpm, rawWpm, accuracy, elapsedSec } = this.calculateMetrics();

    // Determine Victory vs Bot
    const botProgress = this.bot.progress;
    const playerWon = (netWpm >= this.botSpeed) || (completedPassage && botProgress < 100);

    // Play synthesized celebratory or defeat audio
    if (playerWon) {
      this.audio.playVictory();
    } else {
      this.audio.playDefeat();
    }

    // High Score check
    const previousBest = StorageManager.getBestWPM();
    const isNewHigh = netWpm > previousBest && netWpm > 0;
    if (isNewHigh) {
      StorageManager.setBestWPM(netWpm);
      this.updateBestWpmUI();
    }

    // Save record to localStorage
    const record = {
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      mode: this.mode === 'passage' ? 'Passage' : `${this.mode}s Timed`,
      wpm: netWpm,
      accuracy: accuracy,
      botSpeed: `${this.botSpeed} WPM`,
      result: playerWon ? 'WIN' : 'LOSS'
    };
    StorageManager.saveRaceRecord(record);

    // Update and display Results Modal
    this.showResultsModal({
      playerWon,
      netWpm,
      rawWpm,
      accuracy,
      elapsedSec,
      isNewHigh
    });
  }

  showResultsModal({ playerWon, netWpm, rawWpm, accuracy, elapsedSec, isNewHigh }) {
    if (playerWon) {
      this.elements.modalBannerPill.className = 'modal-banner';
      this.elements.modalResultBadge.textContent = 'VICTORY';
      this.elements.modalResultTitle.textContent = 'PILOT OUTPACES CYBER GHOST!';
      this.elements.modalResultSubtitle.textContent = `You dominated the circuit at ${netWpm} WPM versus the ${this.botSpeed} WPM ghost.`;
    } else {
      this.elements.modalBannerPill.className = 'modal-banner loss-banner';
      this.elements.modalResultBadge.textContent = 'RACE FINISHED';
      this.elements.modalResultTitle.textContent = 'GHOST BOT TOOK THE CHECKERED FLAG';
      this.elements.modalResultSubtitle.textContent = `The ghost held ${this.botSpeed} WPM. Tune your rhythm and race again!`;
    }

    this.elements.newHighScoreBanner.classList.toggle('hidden', !isNewHigh);

    this.elements.modalWpm.textContent = netWpm.toString();
    this.elements.modalRawWpm.textContent = `${rawWpm} Raw WPM`;
    this.elements.modalAccuracy.textContent = `${accuracy}%`;
    this.elements.modalErrorCount.textContent = `${this.mistakesCount} Mistakes`;
    this.elements.modalTime.textContent = `${elapsedSec.toFixed(1)}s`;
    this.elements.modalModeLabel.textContent = this.mode === 'passage' ? 'Passage Mode' : `${this.mode}s Timed`;
    this.elements.modalGhostWpm.textContent = `${this.botSpeed} WPM`;

    const margin = netWpm - this.botSpeed;
    this.elements.modalMarginLabel.textContent = margin >= 0 ? `+${margin} WPM Ahead` : `${margin} WPM Behind`;

    this.showModal(this.elements.resultsModal);
  }

  // ================= History & Records Drawer =================
  showHistoryModal() {
    this.renderHistoryTable();
    this.showModal(this.elements.historyModal);
  }

  renderHistoryTable() {
    const history = StorageManager.getRaceHistory();
    const tbody = this.elements.historyTableBody;
    tbody.innerHTML = '';

    if (history.length === 0) {
      this.elements.historyEmptyMessage.classList.remove('hidden');
      this.elements.histTotalRaces.textContent = '0';
      this.elements.histBestWpm.textContent = `${StorageManager.getBestWPM()} WPM`;
      this.elements.histAvgAcc.textContent = '100%';
      return;
    }

    this.elements.historyEmptyMessage.classList.add('hidden');

    let totalAcc = 0;
    history.forEach(item => {
      totalAcc += item.accuracy;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.date}</td>
        <td>${item.mode}</td>
        <td><strong style="color: var(--neon-green)">${item.wpm} WPM</strong></td>
        <td>${item.accuracy}%</td>
        <td>${item.botSpeed}</td>
        <td><span class="result-tag ${item.result.toLowerCase()}">${item.result}</span></td>
      `;
      tbody.appendChild(row);
    });

    this.elements.histTotalRaces.textContent = history.length.toString();
    this.elements.histBestWpm.textContent = `${StorageManager.getBestWPM()} WPM`;
    this.elements.histAvgAcc.textContent = `${Math.round(totalAcc / history.length)}%`;
  }

  // ================= UI Helpers & Selectors =================
  setMode(mode) {
    if (this.mode === mode) return;
    this.mode = mode;

    this.elements.modeSelector.querySelectorAll('.pill-btn').forEach(btn => {
      const active = btn.getAttribute('data-mode') === mode;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-checked', active ? 'true' : 'false');
    });

    this.startNewRace();
  }

  setBotSpeed(speed) {
    this.botSpeed = speed;
    this.bot.setSpeed(speed);

    this.elements.botSpeedSelector.querySelectorAll('.pill-btn').forEach(btn => {
      const active = parseInt(btn.getAttribute('data-speed'), 10) === speed;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-checked', active ? 'true' : 'false');
    });

    this.startNewRace();
  }

  toggleSound() {
    const muted = !this.audio.isMuted;
    this.audio.setMuted(muted);
    this.updateSoundUI();
  }

  updateSoundUI() {
    const isMuted = this.audio.isMuted;
    this.elements.soundIconOn.classList.toggle('hidden', isMuted);
    this.elements.soundIconOff.classList.toggle('hidden', !isMuted);
    this.elements.soundStatusText.textContent = isMuted ? 'MUTED' : 'ON';
  }

  updateBestWpmUI() {
    const best = StorageManager.getBestWPM();
    this.elements.hudBestWpm.textContent = best.toString();
  }

  showModal(modalElement) {
    modalElement.classList.remove('hidden');
  }

  hideModal(modalElement) {
    modalElement.classList.add('hidden');
  }
}

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  window.typingSpeedRacer = new TypingSpeedRacer();
});
