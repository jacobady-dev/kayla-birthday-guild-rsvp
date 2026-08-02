const fairyField = document.createElement('div');
fairyField.className = 'fairy-field';
fairyField.setAttribute('aria-hidden', 'true');
document.body.prepend(fairyField);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function createFairy(index) {
  const mote = document.createElement('i');
  mote.className = 'fairy';
  const startX = Math.random() * 100;
  const startY = 45 + Math.random() * 60;
  const driftX = startX + (Math.random() * 34 - 17);
  const driftY = -10 - Math.random() * 75;
  mote.style.left = `${startX}vw`;
  mote.style.top = `${startY}vh`;
  mote.style.setProperty('--x0', '0px');
  mote.style.setProperty('--y0', '0px');
  mote.style.setProperty('--x1', `${(driftX - startX) * window.innerWidth / 100}px`);
  mote.style.setProperty('--y1', `${(driftY - startY) * window.innerHeight / 100}px`);
  mote.style.setProperty('--duration', `${8 + Math.random() * 11}s`);
  mote.style.setProperty('--delay', `${-Math.random() * 16}s`);
  mote.style.setProperty('--twinkle', `${1.6 + Math.random() * 2.6}s`);
  mote.dataset.fairy = index;
  fairyField.appendChild(mote);
}

if (!reducedMotion) {
  const moteCount = Math.min(42, Math.max(24, Math.floor(window.innerWidth / 24)));
  for (let i = 0; i < moteCount; i += 1) createFairy(i);
}

function spawnTrail(x, y, intense = false) {
  if (reducedMotion) return;
  const count = intense ? 8 : 3;
  for (let i = 0; i < count; i += 1) {
    const spark = document.createElement('i');
    spark.className = 'touch-spark';
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.setProperty('--tx', `${(Math.random() - 0.5) * (intense ? 120 : 45)}px`);
    spark.style.setProperty('--ty', `${-18 - Math.random() * (intense ? 90 : 38)}px`);
    spark.style.setProperty('--size', `${1.5 + Math.random() * (intense ? 5 : 2.5)}px`);
    spark.style.setProperty('--delay', `${Math.random() * 90}ms`);
    document.body.appendChild(spark);
    spark.addEventListener('animationend', () => spark.remove(), { once: true });
  }
}

let lastTrail = 0;
window.addEventListener('pointermove', (event) => {
  const now = performance.now();
  if (now - lastTrail < 65) return;
  lastTrail = now;
  spawnTrail(event.clientX, event.clientY);
}, { passive: true });

window.addEventListener('pointerdown', (event) => {
  spawnTrail(event.clientX, event.clientY, true);
}, { passive: true });

const tablet = document.querySelector('#tablet');
if (tablet && !reducedMotion) {
  window.setInterval(() => {
    if (!tablet.classList.contains('awake')) return;
    const rect = tablet.getBoundingClientRect();
    const side = Math.floor(Math.random() * 4);
    let x;
    let y;
    if (side === 0) { x = rect.left + Math.random() * rect.width; y = rect.top; }
    else if (side === 1) { x = rect.right; y = rect.top + Math.random() * rect.height; }
    else if (side === 2) { x = rect.left + Math.random() * rect.width; y = rect.bottom; }
    else { x = rect.left; y = rect.top + Math.random() * rect.height; }
    spawnTrail(x, y, true);
  }, 2100);
}
