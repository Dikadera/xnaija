import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function app() {
  if (getApps().length) return getApps()[0];
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (sa) return initializeApp({ credential: cert(JSON.parse(sa)) });
  const cfg = JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG || '{}');
  return initializeApp({ projectId: cfg.projectId });
}

export const adminAuth = () => getAuth(app());
export const db = () => getFirestore(app(), process.env.FIRESTORE_DB_ID || '(default)');
