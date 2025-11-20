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
  orderBy,
  limit,
  startAfter,
  where,
  type DocumentData,
  type DocumentSnapshot,
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

  // ✅ Método para obtener items paginados
  static async getPaginated<T>(
    collectionName: string,
    pageSize: number = 9,
    lastDoc?: DocumentSnapshot | null,
    orderByField: string = "createdAt",
    orderDirection: "asc" | "desc" = "desc"
  ): Promise<{
    data: T[];
    lastVisible: DocumentSnapshot | null;
    hasMore: boolean;
  }> {
    try {
      const colRef = collection(db, collectionName);

      let q;
      if (lastDoc) {
        // Página siguiente
        q = query(
          colRef,
          orderBy(orderByField, orderDirection),
          startAfter(lastDoc),
          limit(pageSize + 1) // +1 para saber si hay más páginas
        );
      } else {
        // Primera página
        q = query(
          colRef,
          orderBy(orderByField, orderDirection),
          limit(pageSize + 1)
        );
      }

      const snapshot = await getDocs(q);
      const hasMore = snapshot.docs.length > pageSize;
      const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;

      const data = docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      const lastVisible = docs[docs.length - 1] || null;

      return { data, lastVisible, hasMore };
    } catch (error) {
      console.error("Error getting paginated data:", error);
      throw error;
    }
  }

  static async getPaginatedWithFilter<T>(
    collectionName: string,
    filterField: string,
    filterValue: any,
    pageSize: number = 9,
    lastDoc?: DocumentSnapshot | null,
    orderByField: string = "createdAt",
    orderDirection: "asc" | "desc" = "desc"
  ): Promise<{
    data: T[];
    lastVisible: DocumentSnapshot | null;
    hasMore: boolean;
  }> {
    try {
      const colRef = collection(db, collectionName);

      let q;
      if (lastDoc) {
        q = query(
          colRef,
          where(filterField, "==", filterValue),
          orderBy(orderByField, orderDirection),
          startAfter(lastDoc),
          limit(pageSize + 1)
        );
      } else {
        q = query(
          colRef,
          where(filterField, "==", filterValue),
          orderBy(orderByField, orderDirection),
          limit(pageSize + 1)
        );
      }

      const snapshot = await getDocs(q);
      const hasMore = snapshot.docs.length > pageSize;
      const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;

      const data = docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      const lastVisible = docs[docs.length - 1] || null;

      return { data, lastVisible, hasMore };
    } catch (error) {
      console.error("Error getting filtered paginated data:", error);
      throw error;
    }
  }
}
