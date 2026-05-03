import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { ICustomers, ICustomersDoc } from '../schemas/customers';
import type { IMetaData } from '../schemas/meta';

const CUSTOMERS_COL = 'customers';
const metaDocRef = () => doc(db, 'meta', 'runningNumber');

export async function getCustomers(): Promise<ICustomers[]> {
  const snap = await getDocs(collection(db, CUSTOMERS_COL));
  return snap.docs.map((d) => ({
    docId: d.id,
    ...(d.data() as ICustomersDoc),
  }));
}

export async function saveCustomer(data: ICustomersDoc): Promise<void> {
  await addDoc(collection(db, CUSTOMERS_COL), data);
}

export async function updateCustomer(docId: string, data: ICustomersDoc): Promise<void> {
  await updateDoc(doc(db, CUSTOMERS_COL, docId), data as unknown as Record<string, unknown>);
}

export async function deleteCustomer(docId: string): Promise<void> {
  await deleteDoc(doc(db, CUSTOMERS_COL, docId));
}

export async function getMeta(): Promise<IMetaData | null> {
  const snap = await getDoc(metaDocRef());
  return snap.exists() ? (snap.data() as IMetaData) : null;
}

// Uses setDoc with merge:true to handle both creation and update safely.
// If the meta document does not yet exist, this creates it. Never use updateDoc here.
export async function updateMeta(data: Partial<IMetaData>): Promise<void> {
  await setDoc(metaDocRef(), data, { merge: true });
}
