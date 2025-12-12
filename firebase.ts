
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDI62KXjWK8TITbMZWfgc25ksZVM3pGbjs",
  authDomain: "podmayak-ai.firebaseapp.com",
  projectId: "podmayak-ai",
  storageBucket: "podmayak-ai.firebasestorage.app",
  messagingSenderId: "585770460780",
  appId: "1:585770460780:web:1297ad9d9bdf0b6e8d1a49",
  measurementId: "G-FDZDX73WFM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Explicitly set persistence to local to avoid session drops, wrapped in try-catch for safety
try {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.warn("Auth persistence warning:", error);
  });
} catch (e) {
  console.warn("Auth persistence setup failed:", e);
}

// Initialize Firestore with settings to avoid connection issues (unavailable error)
// experimentalForceLongPolling fixes issues where WebSockets are blocked/unstable
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

// Safe analytics initialization
let analyticsInstance = null;
try {
  if (typeof window !== 'undefined') {
    analyticsInstance = getAnalytics(app);
  }
} catch (e) {
  console.warn("Analytics failed to initialize:", e);
}
export const analytics = analyticsInstance;
