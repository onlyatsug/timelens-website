/// <reference types="vite/client" /> 

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

// debug: indicar a falta de alguma váriavel .env
const required_vars = Object.entries(firebaseConfig)
const missing_vars = required_vars.filter(([required_vars, value]) => !value).map(([key]) => key)

if (missing_vars.length > 0) {
  console.error('Missing Firebase environment variables:', missing_vars);
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);