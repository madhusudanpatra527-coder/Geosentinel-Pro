/* ═══════════════════════════════════════════════════════════════
   GeoSentinel Pro — Siren Engine
   Pure Web Audio API. No audio files, no external dependencies.
   Critical = two-tone sawtooth "wee-woo" siren.
   Warning  = descending sine pulse tone.
   ═══════════════════════════════════════════════════════════════ */

const Siren = (() => {
  let ac = null, nodes = [], running = false, muted = false;

  const ctx = () => {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    return ac;
  };

  function stopAll() {
    running = false;
    nodes.forEach(n => { try { n.stop(); } catch (e) {} });
    nodes = [];
  }

  function critLoop() {
    if (!running || muted) return;
    const a = ctx(), t = a.currentTime;
    [[1150, 850, 0, 0.42], [850, 1150, 0.44, 0.86]].forEach(([f1, f2, s, e]) => {
      const o = a.createOscillator(), g = a.createGain();
      o.connect(g); g.connect(a.destination); o.type = 'sawtooth';
      o.frequency.setValueAtTime(f1, t + s);
      o.frequency.linearRampToValueAtTime(f2, t + e);
      g.gain.setValueAtTime(0, t + s);
      g.gain.linearRampToValueAtTime(0.15, t + s + 0.04);
      g.gain.linearRampToValueAtTime(0.15, t + e - 0.04);
      g.gain.linearRampToValueAtTime(0, t + e);
      o.start(t + s); o.stop(t + e + 0.02);
      nodes.push(o);
    });
    setTimeout(() => { if (running) critLoop(); }, 900);
  }

  function warnLoop() {
    if (!running || muted) return;
    const a = ctx(), t = a.currentTime;
    const o = a.createOscillator(), g = a.createGain();
    o.connect(g); g.connect(a.destination); o.type = 'sine';
    o.frequency.setValueAtTime(880, t);
    o.frequency.linearRampToValueAtTime(660, t + 0.3);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.12, t + 0.04);
    g.gain.linearRampToValueAtTime(0.12, t + 0.26);
    g.gain.linearRampToValueAtTime(0, t + 0.32);
    o.start(t); o.stop(t + 0.35);
    nodes.push(o);
    setTimeout(() => { if (running) warnLoop(); }, 1100);
  }

  return {
    playCrit() { stopAll(); running = true; critLoop(); },
    playWarn() { stopAll(); running = true; warnLoop(); },
    stop: stopAll,
    toggle() { muted = !muted; if (muted) stopAll(); return muted; },
    isMuted() { return muted; }
  };
})();
