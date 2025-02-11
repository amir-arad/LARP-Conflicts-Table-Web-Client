export const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID!;
export const apiKey = import.meta.env.VITE_GOOGLE_API_KEY!;
export const sheetId = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID!;
export const ROLES_CONFLICT_SHEET_ID = import.meta.env.VITE_ROLES_CONFLICT_SHEET_ID!;

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY!,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN!,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL!,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID!,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID!,
  appId: import.meta.env.VITE_FIREBASE_APP_ID!,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID!,
};

if (!clientId) {
  throw new Error("GOOGLE_CLIENT_ID not set in environment");
}
if (!apiKey) {
  throw new Error("GOOGLE_API_KEY not set in environment");
}
if (!sheetId) {
  throw new Error("GOOGLE_SPREADSHEET_ID not set in environment");
}
if (!ROLES_CONFLICT_SHEET_ID) {
  throw new Error("ROLES_CONFLICT_SHEET_ID not set in environment");
}
// Validation for Firebase config
if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  throw new Error("FIREBASE_API_KEY not set in environment");
}
if (!import.meta.env.VITE_FIREBASE_DATABASE_URL) {
  throw new Error("FIREBASE_DATABASE_URL not set in environment");
}
if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) {
  throw new Error("FIREBASE_PROJECT_ID not set in environment");
}
