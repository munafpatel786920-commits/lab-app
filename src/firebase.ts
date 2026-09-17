import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use named database if specified, or default
const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';
export const db = getFirestore(app, databaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
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
  return errInfo;
}

// Test connection to Firestore
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'check'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// Ensure user is authenticated anonymously if auth is required
export async function initFirebaseAuth() {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
  } catch (error) {
    console.warn('Firebase anonymous auth warning:', error);
  }
}

// Firestore Collection Helpers
export function subscribeCollection<T>(
  collectionName: string,
  onData: (items: T[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as any;
        if (data) {
          // If we are in specific collections, make sure the ID fields are populated correctly with the Firestore document ID (d.id)
          if (collectionName === 'reports') {
            if (!data.reportNo) data.reportNo = d.id;
          } else if (collectionName === 'invoices') {
            if (!data.invoiceNo) data.invoiceNo = d.id;
          } else {
            if (!data.id) data.id = d.id;
          }
          items.push(data as T);
        }
      });
      onData(items);
    },
    (error) => {
      console.error(`Error subscribing to ${collectionName}:`, error);
      handleFirestoreError(error, OperationType.GET, collectionName);
      if (onError) onError(error);
    }
  );
}

export async function saveDocument<T extends { [key: string]: any }>(
  collectionName: string,
  docId: string,
  data: T
) {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error(`Error saving document to ${collectionName}/${docId}:`, error);
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${docId}`);
    throw error;
  }
}

export async function removeDocument(collectionName: string, docId: string) {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}/${docId}:`, error);
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${docId}`);
    throw error;
  }
}

export async function clearDocumentsBatch(itemsToDelete: { collectionName: string; id: string }[]) {
  if (itemsToDelete.length === 0) return;
  
  try {
    // Firestore write batch allows up to 500 writes
    // We can chunk our deletions into groups of 400 to be extremely safe
    const chunkSize = 400;
    for (let i = 0; i < itemsToDelete.length; i += chunkSize) {
      const chunk = itemsToDelete.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach((item) => {
        if (item.collectionName && item.id) {
          const docRef = doc(db, item.collectionName, item.id);
          batch.delete(docRef);
        }
      });
      await batch.commit();
    }
    console.log(`Successfully batch-deleted ${itemsToDelete.length} documents from Firestore.`);
  } catch (error) {
    console.error("Error in batch deleting documents:", error);
    handleFirestoreError(error, OperationType.DELETE, 'batch_delete');
    throw error;
  }
}

// Seed initial data if collection is completely empty in Firestore
export async function seedIfEmpty<T extends { id?: string; reportNo?: string; invoiceNo?: string; labName?: string }>(
  collectionName: string,
  initialData: T[],
  idKey: keyof T
) {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty && initialData.length > 0) {
      const batch = writeBatch(db);
      initialData.forEach((item) => {
        const docId = String(item[idKey] || item.id);
        if (docId) {
          const docRef = doc(db, collectionName, docId);
          batch.set(docRef, item);
        }
      });
      await batch.commit();
      console.log(`Seeded ${initialData.length} items to Firestore collection '${collectionName}'`);
    }
  } catch (error) {
    console.warn(`Failed to seed ${collectionName} in Firestore:`, error);
    handleFirestoreError(error, OperationType.GET, collectionName);
  }
}
