const tablet = document.querySelector('#tablet');
const awakening = document.querySelector('#awakening');
const commission = document.querySelector('#commission');
const register = document.querySelector('#register');
const confirmation = document.querySelector('#confirmation');
const awakenButton = document.querySelector('#awaken-button');
const openLedgerButton = document.querySelector('#open-ledger');
const form = document.querySelector('#rsvp-form');
const errorBox = document.querySelector('#form-error');
const confirmationTitle = document.querySelector('#confirmation-title');
const confirmationCopy = document.querySelector('#confirmation-copy');
const resetButton = document.querySelector('#reset-button');
const sparkField = document.querySelector('#spark-field');
const fairyField = document.querySelector('#fairy-field');
const soundToggle = document.querySelector('#sound-toggle');
const soundLabel = soundToggle.querySelector('.sound-label');
const backgroundMusic = document.querySelector('#background-music');

let audioContext;
let soundEnabled = true;
let transitioning = false;
let musicStarted = false;
let musicFadeFrame;

backgroundMusic.volume = 0;

function getAudioContext() {
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioContext = new AudioContext();
  }
  if (audioContext?.state === 'suspended') audioContext.resume();
  return audioContext;
}

function tone({ frequency = 220, endFrequency = frequency, duration = 0.5, type = 'sine', volume = 0.08, delay = 0 }) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

function fadeMusic(targetVolume, duration = 1800) {
  cancelAnimationFrame(musicFadeFrame);
  const startVolume = backgroundMusic.volume;
  const startedAt = performance.now();

  function step(now) {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    backgroundMusic.volume = startVolume + (targetVolume - startVolume) * eased;
    if (progress < 1) musicFadeFrame = requestAnimationFrame(step);
  }

  musicFadeFrame = requestAnimationFrame(step);
}

async function startBackgroundMusic() {
  if (musicStarted || !soundEnabled) return;
  try {
    await backgroundMusic.play();
    musicStarted = true;
    fadeMusic(0.18, 2600);
  } catch {
    // The audio file may not yet exist or the browser may require another tap.
  }
}

function awakenSound() {
  tone({ frequency: 72, endFrequency: 42, duration: 1.25, type: 'sine', volume: 0.15 });
  tone({ frequency: 220, endFrequency: 660, duration: 1.1, type: 'triangle', volume: 0.045, delay: 0.18 });
  tone({ frequency: 330, endFrequency: 990, duration: 0.9, type: 'sine', volume: 0.035, delay: 0.36 });
}

function pageSound() {
  tone({ frequency: 120, endFrequency: 75, duration: 0.65, type: 'triangle', volume: 0.055 });
  tone({ frequency: 420, endFrequency: 620, duration: 0.55, type: 'sine', volume: 0.025, delay: 0.13 });
}

function sealSound() {
  tone({ frequency: 95, endFrequency: 52, duration: 0.9, type: 'sine', volume: 0.13 });
  tone({ frequency: 523, endFrequency: 1046, duration: 0.85, type: 'triangle', volume: 0.05, delay: 0.12 });
  tone({ frequency: 784, endFrequency: 1175, duration: 0.75, type: 'sine', volume: 0.035, delay: 0.3 });
}

function errorSound() {
  tone({ frequency: 150, endFrequency: 105, duration: 0.35, type: 'sawtooth', volume: 0.035 });
}

function createSparkBurst(count = 26, spread = 300) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;
  for (let i = 0; i < count; i += 1) {
    const spark = document.createElement('i');
    spark.className = 'spark';
    const angle = Math.random() * Math.PI * 2;
    const distance = spread * (0.35 + Math.random() * 0.65);
    spark.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
    spark.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
    spark.style.setProperty('--duration', `${1 + Math.random() * 0.9}s`);
    spark.style.setProperty('--delay', `${Math.random() * 0.15}s`);
    spark.style.width = spark.style.height = `${2 + Math.random() * 4}px`;
    sparkField.appendChild(spark);
    spark.addEventListener('animationend', () => spark.remove(), { once: true });
  }
}

function seedFairies(count = 34) {
  if (!fairyField || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  fairyField.replaceChildren();

  for (let i = 0; i < count; i += 1) {
    const fairy = document.createElement('i');
    fairy.className = 'fairy';
    const startX = Math.random() * 100;
    const startY = 12 + Math.random() * 82;
    const driftX = (Math.random() - 0.5) * 34;
    const driftY = -18 - Math.random() * 42;
    fairy.style.left = `${startX}%`;
    fairy.style.top = `${startY}%`;
    fairy.style.setProperty('--x0', `${(Math.random() - 0.5) * 16}px`);
    fairy.style.setProperty('--y0', `${Math.random() * 16}px`);
    fairy.style.setProperty('--x1', `${driftX}vw`);
    fairy.style.setProperty('--y1', `${driftY}vh`);
    fairy.style.setProperty('--duration', `${7 + Math.random() * 9}s`);
    fairy.style.setProperty('--delay', `${-Math.random() * 12}s`);
    fairyField.appendChild(fairy);
  }
}

function swapView(from, to, { sound = true } = {}) {
  if (transitioning) return;
  transitioning = true;
  tablet.classList.add('turning');
  from.classList.remove('active-view');
  from.classList.add('view-exit');
  if (sound) pageSound();

  window.setTimeout(() => {
    from.hidden = true;
    from.classList.remove('view-exit');
    to.hidden = false;
    requestAnimationFrame(() => to.classList.add('active-view'));
    createSparkBurst(18, 220);
  }, 560);

  window.setTimeout(() => {
    tablet.classList.remove('turning');
    transitioning = false;
  }, 1180);
}

soundToggle.addEventListener('click', async () => {
  soundEnabled = !soundEnabled;
  soundToggle.setAttribute('aria-pressed', String(soundEnabled));
  soundToggle.setAttribute('aria-label', soundEnabled ? 'Mute magical sound effects and music' : 'Enable magical sound effects and music');
  soundLabel.textContent = soundEnabled ? 'Sound on' : 'Sound off';

  if (soundEnabled) {
    tone({ frequency: 440, endFrequency: 660, duration: 0.35, volume: 0.035 });
    if (musicStarted) {
      await backgroundMusic.play().catch(() => {});
      fadeMusic(0.18, 900);
    } else {
      startBackgroundMusic();
    }
  } else {
    fadeMusic(0, 500);
    window.setTimeout(() => backgroundMusic.pause(), 520);
  }
});

awakenButton.addEventListener('click', () => {
  if (transitioning) return;
  startBackgroundMusic();
  awakenSound();
  tablet.classList.remove('dormant');
  tablet.classList.add('awake', 'flash');
  createSparkBurst(58, 410);
  window.setTimeout(() => tablet.classList.remove('flash'), 1250);
  window.setTimeout(() => swapView(awakening, commission, { sound: false }), 760);
});

openLedgerButton.addEventListener('click', () => {
  swapView(commission, register);
  window.setTimeout(() => document.querySelector('#adventurer-name').focus(), 900);
});

document.querySelectorAll('input[type="radio"]').forEach((input) => {
  input.addEventListener('change', () => {
    tone({ frequency: 360, endFrequency: 520, duration: 0.28, type: 'sine', volume: 0.025 });
    createSparkBurst(10, 105);
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  errorBox.textContent = '';
  const data = new FormData(form);
  const name = String(data.get('name') || '').trim();
  const attendance = data.get('attendance');

  if (!name || !attendance) {
    errorBox.textContent = 'The stone requires both a name and an answer.';
    tablet.classList.add('flash');
    errorSound();
    window.setTimeout(() => tablet.classList.remove('flash'), 900);
    return;
  }

  localStorage.setItem('guild-rsvp-demo', JSON.stringify({ name, attendance, eventDate: 'October 16', submittedAt: new Date().toISOString() }));

  if (attendance === 'attending') {
    confirmationTitle.textContent = `The commission is accepted, ${name}.`;
    confirmationCopy.textContent = 'Your name has been carved into the Seventh Ledger. A place shall be prepared on October XVI.';
  } else {
    confirmationTitle.textContent = `Your absence is recorded, ${name}.`;
    confirmationCopy.textContent = 'The living ledger releases you from the commission and wishes you safe passage.';
  }

  sealSound();
  tablet.classList.add('flash');
  createSparkBurst(72, 450);
  window.setTimeout(() => tablet.classList.remove('flash'), 1250);
  window.setTimeout(() => swapView(register, confirmation, { sound: false }), 680);
});

resetButton.addEventListener('click', () => {
  localStorage.removeItem('guild-rsvp-demo');
  form.reset();
  swapView(confirmation, register);
});

backgroundMusic.addEventListener('error', () => {
  musicStarted = false;
});

seedFairies();
window.addEventListener('resize', () => seedFairies(window.innerWidth < 600 ? 24 : 34));
