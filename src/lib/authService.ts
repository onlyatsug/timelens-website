import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebase';

const ALLOWED_DOMAINS = ['sou.ufmt.br'];

export class AuthDomainError extends Error {
  constructor() {
    super('Use um e-mail institucional (@sou.ufmt.br) para continuar.');
    this.name = 'AuthDomainError';
  }
}

function isAllowedEmail(email: string | null): boolean {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return ALLOWED_DOMAINS.includes(domain);
}

async function enforceDomainOrSignOut(user: FirebaseUser) {
  if (!isAllowedEmail(user.email)) {
    await firebaseSignOut(auth);
    throw new AuthDomainError();
  }
}

export async function registerWithEmail(name: string, email: string, password: string) {
  if (!isAllowedEmail(email)) throw new AuthDomainError();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  return cred.user;
}

export async function loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await enforceDomainOrSignOut(cred.user);
  return cred.user;
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ hd: 'sou.ufmt.br' });
  const cred = await signInWithPopup(auth, provider);
  await enforceDomainOrSignOut(cred.user);
  return cred.user;
}

export async function logout() {
  await firebaseSignOut(auth);
}

export function watchAuthState(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getIdToken(): Promise<string | null> {
  return auth.currentUser ? auth.currentUser.getIdToken() : null;
}