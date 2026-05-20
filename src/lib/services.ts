import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  type Unsubscribe 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { type Lead, type LeadStatus } from '../types';

const LEADS_COLLECTION = 'leads';

/**
 * Creates a new lead in the firestore 'leads' collection.
 */
export async function createLead(leadInput: Omit<Lead, 'id' | 'status' | 'createdAt'>): Promise<string> {
  const leadsRef = collection(db, LEADS_COLLECTION);
  const newDocRef = doc(leadsRef);
  const leadId = newDocRef.id;

  const payload = {
    ...leadInput,
    status: 'Novos' as LeadStatus,
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(newDocRef, payload);
    return leadId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${LEADS_COLLECTION}/${leadId}`);
    throw error;
  }
}

/**
 * Subscribes to real-time updates of all leads sorted by creation date descending.
 */
export function subscribeToLeads(
  onUpdate: (leads: Lead[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const leadsRef = collection(db, LEADS_COLLECTION);
  const q = query(leadsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const leads: Lead[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        leads.push({
          id: doc.id,
          ...data,
          // Handle cases where createdAt is a Firestore timestamp
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        } as Lead);
      });
      onUpdate(leads);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, LEADS_COLLECTION);
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  );
}

/**
 * Updates the status of an existing lead.
 */
export async function updateLeadStatus(leadId: string, newStatus: LeadStatus): Promise<void> {
  const docRef = doc(db, LEADS_COLLECTION, leadId);
  try {
    await updateDoc(docRef, {
      status: newStatus,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${LEADS_COLLECTION}/${leadId}`);
    throw error;
  }
}

/**
 * Updates an entire lead document (all allowed fields).
 */
export async function updateLead(leadId: string, updatedFields: Partial<Lead>): Promise<void> {
  const docRef = doc(db, LEADS_COLLECTION, leadId);
  try {
    const { id, createdAt, ...fieldsToUpdate } = updatedFields;
    await updateDoc(docRef, fieldsToUpdate);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${LEADS_COLLECTION}/${leadId}`);
    throw error;
  }
}

/**
 * Deletes a lead document from the database.
 */
export async function deleteLead(leadId: string): Promise<void> {
  const docRef = doc(db, LEADS_COLLECTION, leadId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${LEADS_COLLECTION}/${leadId}`);
    throw error;
  }
}
