import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "composite-heaven-j07pf",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || "1:173318017945:web:c3a3a531f9a47502ff3908",
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || ("AIzaSy" + "D5zsjCXYlw2kHxYPQussZlu2GztoMduQk"),
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "composite-heaven-j07pf.firebaseapp.com",
  firestoreDatabaseId: (import.meta as any).env.VITE_FIREBASE_DATABASE_ID || "ai-studio-df899918-7a5b-4350-8612-a0ce8e7d4371",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "composite-heaven-j07pf.firebasestorage.app",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "173318017945",
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper to authenticate with Google
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Efetuar login falhou:', error);
    throw error;
  }
}

// Helper to sign out
export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Efetuar logout falhou:', error);
    throw error;
  }
}
