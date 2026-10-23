import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const cfg = JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG || '{}');
const app = getApps().length ? getApps()[0] : initializeApp(cfg);
export const auth = getAuth(app);
