const form = document.querySelector('#rsvp-form');
const errorBox = document.querySelector('#form-error');
const confirmation = document.querySelector('#confirmation');
const confirmationTitle = document.querySelector('#confirmation-title');
const confirmationCopy = document.querySelector('#confirmation-copy');
const resetButton = document.querySelector('#reset-button');
const registerPanel = document.querySelector('#register');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  errorBox.textContent = '';

  const data = new FormData(form);
  const name = String(data.get('name') || '').trim();
  const attendance = data.get('attendance');

  if (!name || !attendance) {
    errorBox.textContent = 'The ledger requires both a name and an answer.';
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
    confirmationCopy.textContent = 'A place shall be prepared at the guild table on October 16. Further instructions will arrive by courier.';
  } else {
    confirmationTitle.textContent = `Your absence has been recorded, ${name}.`;
    confirmationCopy.textContent = 'The guildmaster accepts your regrets and wishes you safe travels.';
  }

  registerPanel.hidden = true;
  confirmation.hidden = false;
  confirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

resetButton.addEventListener('click', () => {
  localStorage.removeItem('guild-rsvp-demo');
  confirmation.hidden = true;
  registerPanel.hidden = false;
  form.reset();
  registerPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
