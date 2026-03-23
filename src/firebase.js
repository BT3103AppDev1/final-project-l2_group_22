import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredFirebaseKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const missingFirebaseKeys = requiredFirebaseKeys.filter(
  (key) => !import.meta.env[key],
);

const firebaseConfigError =
  missingFirebaseKeys.length > 0
    ? `Missing Firebase environment variables: ${missingFirebaseKeys.join(', ')}`
    : '';

const firebaseApp = firebaseConfigError ? null : initializeApp(firebaseConfig);
const auth = firebaseApp ? getAuth(firebaseApp) : null;

export default firebaseApp;
export { auth };
export { firebaseConfigError };
