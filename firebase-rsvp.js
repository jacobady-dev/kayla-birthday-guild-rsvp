import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyB7PawzdOs_GRcz3N33wBYgshx-dn5J7xg',
  authDomain: 'kayla-birthday-rsvp.firebaseapp.com',
  projectId: 'kayla-birthday-rsvp',
  storageBucket: 'kayla-birthday-rsvp.firebasestorage.app',
  messagingSenderId: '552783128914',
  appId: '1:552783128914:web:0acecb0eb99ce22cff328b',
  measurementId: 'G-MVHJMV52MD'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.saveRsvpToFirestore = async ({ name, attendance }) => {
  const cleanName = String(name || '').trim();

  if (!cleanName || !['attending', 'declining'].includes(attendance)) {
    throw new Error('Invalid RSVP submission.');
  }

  await addDoc(collection(db, 'rsvps'), {
    name: cleanName,
    attendance,
    submittedAt: serverTimestamp()
  });
};

window.dispatchEvent(new Event('firebase-rsvp-ready'));
