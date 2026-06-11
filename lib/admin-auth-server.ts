// SERVER-SIDE ONLY — uses Firebase Admin SDK, never bundle this for the browser
import { adminDb } from './firebase-admin';
import bcrypt from 'bcryptjs';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export async function createAdminServer(
  email: string,
  name: string,
  password: string,
): Promise<string> {
  const passwordHash = await bcrypt.hash(password, 10);
  const ref = await adminDb.collection('admins').add({
    email: email.toLowerCase().trim(),
    name: name.trim(),
    passwordHash,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function verifyAdminServer(
  email: string,
  password: string,
): Promise<AdminUser | null> {
  const snap = await adminDb
    .collection('admins')
    .where('email', '==', email.toLowerCase().trim())
    .get();

  if (snap.empty) return null;

  const d = snap.docs[0];
  const data = d.data();
  const valid = await bcrypt.compare(password, data.passwordHash as string);
  if (!valid) return null;

  return {
    id: d.id,
    email: data.email as string,
    name: data.name as string,
    createdAt: data.createdAt as string,
  };
}

export async function getAllAdminsServer(): Promise<AdminUser[]> {
  const snap = await adminDb.collection('admins').get();
  return snap.docs.map(d => ({
    id: d.id,
    email: d.data().email as string,
    name: d.data().name as string,
    createdAt: d.data().createdAt as string,
  }));
}

export async function deleteAdminServer(adminId: string): Promise<void> {
  await adminDb.collection('admins').doc(adminId).delete();
}

export async function countAdminsServer(): Promise<number> {
  const snap = await adminDb.collection('admins').get();
  return snap.size;
}
