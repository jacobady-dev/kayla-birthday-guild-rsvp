(() => {
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  if (!isTouchDevice) return;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const music = document.querySelector('#background-music');
  const awakenButton = document.querySelector('#awaken-button');
  const soundToggle = document.querySelector('#sound-toggle');

  let context = null;
  let unlocked = false;
  let enabled = soundToggle?.getAttribute('aria-pressed') !== 'false';

  function getContext() {
    if (!context && AudioContextClass) context = new AudioContextClass();
    return context;
  }

  function unlockWebAudio() {
    const ctx = getContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    // A one-sample silent buffer forces iOS Safari to activate the output route.
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    unlocked = true;
  }

  function unlockMusicElement() {
    if (!music || !enabled || !music.paused) return;

    const previousMuted = music.muted;
    const previousVolume = music.volume;
    music.muted = true;
    music.volume = 0;

    const playAttempt = music.play();
    if (playAttempt?.then) {
      playAttempt.then(() => {
        music.pause();
        music.currentTime = 0;
        music.muted = previousMuted;
        music.volume = previousVolume;
      }).catch(() => {
        music.muted = previousMuted;
        music.volume = previousVolume;
      });
    }
  }

  function unlockAll() {
    if (!unlocked) unlockWebAudio();
    unlockMusicElement();
  }

  function cardSound() {
    if (!enabled) return;
    unlockWebAudio();

    const ctx = getContext();
    if (!ctx || ctx.state !== 'running') return;

    const start = ctx.currentTime + 0.006;
    const duration = 0.18;
    const frameCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < frameCount; index += 1) {
      const progress = index / frameCount;
      const envelope = Math.pow(1 - progress, 2.8);
      data[index] = (Math.random() * 2 - 1) * envelope;
    }

    const source = ctx.createBufferSource();
    const highpass = ctx.createBiquadFilter();
    const lowpass = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    source.buffer = buffer;
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(700, start);
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(3900, start);
    lowpass.frequency.exponentialRampToValueAtTime(1450, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.035, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    source.connect(highpass).connect(lowpass).connect(gain).connect(ctx.destination);
    source.start(start);
    source.stop(start + duration + 0.02);

    const bell = ctx.createOscillator();
    const bellGain = ctx.createGain();
    bell.type = 'sine';
    bell.frequency.setValueAtTime(930, start + 0.035);
    bell.frequency.exponentialRampToValueAtTime(790, start + 0.26);
    bellGain.gain.setValueAtTime(0.0001, start + 0.035);
    bellGain.gain.exponentialRampToValueAtTime(0.012, start + 0.052);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.26);
    bell.connect(bellGain).connect(ctx.destination);
    bell.start(start + 0.035);
    bell.stop(start + 0.28);
  }

  document.addEventListener('pointerdown', unlockAll, { capture: true, once: true, passive: true });
  document.addEventListener('touchend', unlockAll, { capture: true, once: true, passive: true });

  awakenButton?.addEventListener('pointerdown', unlockAll, { capture: true, passive: true });

  document.querySelectorAll('.glyph-button:not(#awaken-button)').forEach((button) => {
    button.addEventListener('pointerdown', cardSound, { capture: true, passive: true });
  });

  document.querySelectorAll('.rune-choice').forEach((choice) => {
    choice.addEventListener('pointerdown', cardSound, { capture: true, passive: true });
  });

  soundToggle?.addEventListener('click', () => {
    enabled = soundToggle.getAttribute('aria-pressed') === 'true';
    if (enabled) unlockAll();
  });
})();
