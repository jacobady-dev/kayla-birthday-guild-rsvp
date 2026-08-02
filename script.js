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

function swapView(from, to) {
  tablet.classList.add('turning');
  window.setTimeout(() => {
    from.hidden = true;
    to.hidden = false;
  }, 300);
  window.setTimeout(() => tablet.classList.remove('turning'), 850);
}

awakenButton.addEventListener('click', () => {
  tablet.classList.remove('dormant');
  tablet.classList.add('awake', 'flash');
  window.setTimeout(() => tablet.classList.remove('flash'), 950);
  window.setTimeout(() => swapView(awakening, commission), 650);
});

openLedgerButton.addEventListener('click', () => {
  swapView(commission, register);
  window.setTimeout(() => document.querySelector('#adventurer-name').focus(), 700);
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
    window.setTimeout(() => tablet.classList.remove('flash'), 900);
    return;
  }

  const response = {
    name,
    attendance,
    eventDate: 'October 16',
    submittedAt: new Date().toISOString()
  };

  localStorage.setItem('guild-rsvp-demo', JSON.stringify(response));

  if (attendance === 'attending') {
    confirmationTitle.textContent = `The commission is accepted, ${name}.`;
    confirmationCopy.textContent = 'Your name has been carved into the Seventh Ledger. A place shall be prepared on October XVI.';
  } else {
    confirmationTitle.textContent = `Your absence is recorded, ${name}.`;
    confirmationCopy.textContent = 'The living ledger releases you from the commission and wishes you safe passage.';
  }

  tablet.classList.add('flash');
  window.setTimeout(() => tablet.classList.remove('flash'), 950);
  window.setTimeout(() => swapView(register, confirmation), 500);
});

resetButton.addEventListener('click', () => {
  localStorage.removeItem('guild-rsvp-demo');
  form.reset();
  swapView(confirmation, register);
});
