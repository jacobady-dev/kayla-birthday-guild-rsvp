const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

function spawnTrail(x, y, intense = false) {
  if (reducedMotion) return;

  const count = intense
    ? (coarsePointer ? 5 : 8)
    : (coarsePointer ? 1 : 3);

  for (let i = 0; i < count; i += 1) {
    const spark = document.createElement('i');
    spark.className = 'touch-spark';
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.setProperty('--tx', `${(Math.random() - 0.5) * (intense ? 110 : 42)}px`);
    spark.style.setProperty('--ty', `${-18 - Math.random() * (intense ? 78 : 34)}px`);
    spark.style.setProperty('--size', `${1.5 + Math.random() * (intense ? 4 : 2.2)}px`);
    spark.style.setProperty('--delay', `${Math.random() * 75}ms`);
    document.body.appendChild(spark);
    spark.addEventListener('animationend', () => spark.remove(), { once: true });
  }
}

let lastTrail = 0;
if (!coarsePointer) {
  window.addEventListener('pointermove', (event) => {
    const now = performance.now();
    if (now - lastTrail < 90) return;
    lastTrail = now;
    spawnTrail(event.clientX, event.clientY);
  }, { passive: true });
}

window.addEventListener('pointerdown', (event) => {
  spawnTrail(event.clientX, event.clientY, true);
}, { passive: true });

const tablet = document.querySelector('#tablet');
if (tablet && !reducedMotion) {
  const interval = coarsePointer ? 3600 : 2600;
  window.setInterval(() => {
    if (!tablet.classList.contains('awake') || document.hidden) return;

    const rect = tablet.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    const side = Math.floor(Math.random() * 4);
    let x;
    let y;

    if (side === 0) {
      x = rect.left + Math.random() * rect.width;
      y = rect.top;
    } else if (side === 1) {
      x = rect.right;
      y = rect.top + Math.random() * rect.height;
    } else if (side === 2) {
      x = rect.left + Math.random() * rect.width;
      y = rect.bottom;
    } else {
      x = rect.left;
      y = rect.top + Math.random() * rect.height;
    }

    spawnTrail(x, y, true);
  }, interval);
}
