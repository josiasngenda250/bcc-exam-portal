import { collection, doc, deleteDoc, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from './firebase';
import bcrypt from 'bcryptjs';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export async function createAdmin(
  email: string,
  name: string,
  password: string,
): Promise<string> {
  const passwordHash = await bcrypt.hash(password, 10);
  const ref = await addDoc(collection(db, 'admins'), {
    email: email.toLowerCase().trim(),
    name: name.trim(),
    passwordHash,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function verifyAdmin(
  email: string,
  password: string,
): Promise<AdminUser | null> {
  const snap = await getDocs(
    query(collection(db, 'admins'), where('email', '==', email.toLowerCase().trim()))
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  const data = d.data();
  const valid = await bcrypt.compare(password, data.passwordHash as string);
  if (!valid) return null;
  return { id: d.id, email: data.email as string, name: data.name as string, createdAt: data.createdAt as string };
}

export async function getAllAdmins(): Promise<AdminUser[]> {
  const snap = await getDocs(collection(db, 'admins'));
  return snap.docs.map(d => ({
    id: d.id,
    email: d.data().email as string,
    name: d.data().name as string,
    createdAt: d.data().createdAt as string,
  }));
}

export async function deleteAdmin(adminId: string): Promise<void> {
  await deleteDoc(doc(db, 'admins', adminId));
}

export async function countAdmins(): Promise<number> {
  const snap = await getDocs(collection(db, 'admins'));
  return snap.size;
}
