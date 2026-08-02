import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvasHost = document.querySelector('#dice-canvas');
const rollButton = document.querySelector('#roll-button');
const resultBox = document.querySelector('#roll-result');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(0, 0.3, 5.2);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
canvasHost.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffe0a8, 0x0c1820, 2.4));
const key = new THREE.DirectionalLight(0xffb75f, 4.3);
key.position.set(3, 4, 5);
scene.add(key);
const runeLight = new THREE.PointLight(0x62ffd0, 4.5, 8);
runeLight.position.set(-3, 0.5, 2);
scene.add(runeLight);

const geometry = new THREE.IcosahedronGeometry(1.18, 0);
const material = new THREE.MeshStandardMaterial({
  color: 0x7b2030,
  roughness: 0.43,
  metalness: 0.14,
  flatShading: true,
  emissive: 0x22050c,
  emissiveIntensity: 0.45
});
const die = new THREE.Mesh(geometry, material);
scene.add(die);

const wire = new THREE.LineSegments(
  new THREE.EdgesGeometry(geometry),
  new THREE.LineBasicMaterial({ color: 0xe8c26e, transparent: true, opacity: 0.78 })
);
die.add(wire);

const platform = new THREE.Mesh(
  new THREE.CylinderGeometry(1.75, 2.05, 0.32, 48),
  new THREE.MeshStandardMaterial({ color: 0x222321, roughness: 0.9, metalness: 0.05 })
);
platform.position.y = -1.5;
scene.add(platform);

let rolling = false;
let velocity = new THREE.Vector3(0.01, 0.015, 0.008);
let jump = 0;
let jumpVelocity = 0;
let settleTimer = 0;

const messages = {
  1: 'Natural 1. You trip over the guild threshold. The commission remains open.',
  20: 'Natural 20. The guildmaster personally opens the ledger for you.'
};

function genericMessage(value) {
  if (value >= 16) return `${value}. A strong opening. Several guild members pretend not to be impressed.`;
  if (value >= 11) return `${value}. Respectable. The quartermaster gives a solemn nod.`;
  if (value >= 6) return `${value}. Adequate. No property was damaged.`;
  return `${value}. The die has concerns, but the guild does not.`;
}

function resizeRenderer() {
  const { clientWidth, clientHeight } = canvasHost;
  renderer.setSize(clientWidth, clientHeight, false);
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
}

new ResizeObserver(resizeRenderer).observe(canvasHost);

function animate() {
  requestAnimationFrame(animate);

  if (!rolling) {
    die.rotation.x += 0.0025;
    die.rotation.y += 0.004;
    die.position.y = Math.sin(performance.now() * 0.0014) * 0.05;
  } else {
    die.rotation.x += velocity.x;
    die.rotation.y += velocity.y;
    die.rotation.z += velocity.z;

    jumpVelocity -= 0.0028;
    jump += jumpVelocity;
    if (jump <= 0) {
      jump = 0;
      jumpVelocity *= -0.52;
      velocity.multiplyScalar(0.79);
    }
    die.position.y = jump;

    settleTimer -= 1;
    if (settleTimer <= 0) finishRoll();
  }

  renderer.render(scene, camera);
}

function startRoll() {
  if (rolling) return;
  rolling = true;
  rollButton.disabled = true;
  resultBox.textContent = 'The die tumbles across the stone…';
  velocity.set(
    0.14 + Math.random() * 0.09,
    0.18 + Math.random() * 0.11,
    0.11 + Math.random() * 0.08
  );
  jump = 0.1;
  jumpVelocity = 0.105;
  settleTimer = 125 + Math.floor(Math.random() * 45);
}

function finishRoll() {
  const roll = Math.floor(Math.random() * 20) + 1;
  rolling = false;
  rollButton.disabled = false;
  die.position.y = 0;
  resultBox.textContent = messages[roll] || genericMessage(roll);

  document.querySelector('#contract').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

rollButton.addEventListener('click', startRoll);
canvasHost.addEventListener('click', startRoll);

const form = document.querySelector('#rsvp-form');
const errorBox = document.querySelector('#form-error');
const confirmation = document.querySelector('#confirmation');
const confirmationTitle = document.querySelector('#confirmation-title');
const confirmationCopy = document.querySelector('#confirmation-copy');
const resetButton = document.querySelector('#reset-button');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  errorBox.textContent = '';

  const data = new FormData(form);
  const name = String(data.get('name') || '').trim();
  const attendance = data.get('attendance');
  const message = String(data.get('message') || '').trim();

  if (!name || !attendance) {
    errorBox.textContent = 'The ledger requires both a name and an answer.';
    return;
  }

  const response = {
    name,
    attendance,
    message,
    submittedAt: new Date().toISOString()
  };

  localStorage.setItem('guild-rsvp-demo', JSON.stringify(response));

  confirmationTitle.textContent = attendance === 'attending'
    ? `The commission is accepted, ${name}.`
    : `Your absence has been recorded, ${name}.`;

  confirmationCopy.textContent = attendance === 'attending'
    ? 'A place will be prepared at the guild table. Watch for further instructions by courier.'
    : 'The guildmaster accepts your regrets and wishes you safe travels.';

  document.querySelector('.ledger-section').hidden = true;
  confirmation.hidden = false;
  confirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

resetButton.addEventListener('click', () => {
  localStorage.removeItem('guild-rsvp-demo');
  confirmation.hidden = true;
  document.querySelector('.ledger-section').hidden = false;
  form.reset();
  document.querySelector('.ledger-section').scrollIntoView({ behavior: 'smooth' });
});

animate();
