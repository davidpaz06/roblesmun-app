import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  QueryConstraint,
  query,
  type DocumentData,
} from "firebase/firestore";

export class FirestoreService {
  static async add<T>(collectionName: string, data: T) {
    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, data as DocumentData);
    return docRef.id;
  }

  static async getAll<T>(
    collectionName: string,
    constraints: QueryConstraint[] = []
  ) {
    const colRef = collection(db, collectionName);
    const q = constraints.length ? query(colRef, ...constraints) : colRef;
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as T[];
  }

  static async getById<T>(collectionName: string, id: string) {
    const docRef = doc(db, collectionName, id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists()
      ? ({ id: snapshot.id, ...snapshot.data() } as T)
      : null;
  }

  static async update<T>(collectionName: string, id: string, data: Partial<T>) {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data as DocumentData);
  }

  static async delete(collectionName: string, id: string) {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  }

  static async set<T>(collectionName: string, id: string, data: T) {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, data as DocumentData);
  }
}
