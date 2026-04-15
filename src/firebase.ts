import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, getDocFromServer, doc } from 'firebase/firestore';

// Use import.meta.glob to optionally load the local config file without breaking the Vercel build
const localConfigs = import.meta.glob('../firebase-applet-config.json', { eager: true });
const localConfigModule = localConfigs['../firebase-applet-config.json'] as any;

let firebaseConfig: any = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)'
};

// If environment variables are missing, try to use the local JSON file
if (!firebaseConfig.apiKey && localConfigModule) {
  firebaseConfig = localConfigModule.default || localConfigModule;
}

// Prevent app crash if config is completely missing (e.g., forgot to set env vars in Vercel)
const isConfigValid = !!firebaseConfig.apiKey;
if (!isConfigValid) {
  console.error("🚨 FIREBASE CONFIGURATION MISSING! 🚨");
  console.error("If you are on Vercel, make sure you added all VITE_FIREBASE_* environment variables AND triggered a new deployment.");
  
  // Provide dummy config so the app doesn't white-screen, it just won't load data
  firebaseConfig = { apiKey: 'missing-api-key', projectId: 'missing-project-id', appId: 'missing-app-id' };
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// Test connection
async function testConnection() {
  if (!isConfigValid) return;
  
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
