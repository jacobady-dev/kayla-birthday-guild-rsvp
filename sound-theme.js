(() => {
  function cardFlickSound() {
    if (typeof soundEnabled !== 'undefined' && !soundEnabled) return;

    const ctx = typeof getAudioContext === 'function' ? getAudioContext() : null;
    if (!ctx) return;

    const start = ctx.currentTime;
    const duration = 0.22;

    // Soft paper/card movement made from a short filtered noise burst.
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      const envelope = Math.pow(1 - i / data.length, 2.4);
      data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(620, start);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(4200, start);
    lowpass.frequency.exponentialRampToValueAtTime(1500, start + duration);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, start);
    noiseGain.gain.exponentialRampToValueAtTime(0.045, start + 0.018);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    source.connect(highpass).connect(lowpass).connect(noiseGain).connect(ctx.destination);
    source.start(start);
    source.stop(start + duration + 0.02);

    // Small glass-like bell tail, intentionally quiet and brief.
    const bell = ctx.createOscillator();
    const bellGain = ctx.createGain();
    bell.type = 'sine';
    bell.frequency.setValueAtTime(880, start + 0.055);
    bell.frequency.exponentialRampToValueAtTime(760, start + 0.34);
    bellGain.gain.setValueAtTime(0.0001, start + 0.055);
    bellGain.gain.exponentialRampToValueAtTime(0.018, start + 0.075);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.34);
    bell.connect(bellGain).connect(ctx.destination);
    bell.start(start + 0.055);
    bell.stop(start + 0.36);
  }

  // Replace the previous view-change sound while preserving awaken, seal,
  // error, and selection cues.
  window.pageSound = cardFlickSound;
  try { pageSound = cardFlickSound; } catch {}
})();
