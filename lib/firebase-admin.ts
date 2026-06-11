// SERVER-SIDE ONLY — never import this from client components or pages
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function initAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!key) throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY env var is not set');
  return initializeApp({ credential: cert(JSON.parse(key)) });
}

export const adminDb = getFirestore(initAdminApp());
