import { defineStore } from "pinia";
import { db, firebaseConfigError } from "@/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  addDoc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";

export const useCategoriesStore = defineStore("categories", {
  state: () => ({
    categories: [],
    loading: false,
    error: null,
  }),

  actions: {
    // Function that reads categories data for a user from Firestore
    async fetchCategories(userId) {
      console.log("userId in fetchCategories:", userId);

      if (firebaseConfigError) {
        this.error = firebaseConfigError;
        console.error("Firebase config error:", firebaseConfigError);
        return;
      }

      if (!userId) {
        console.log("No user ID error");
        this.categories = [];
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const querydata = query(
          collection(db, "categories"),
          where("userId", "==", userId),
          orderBy("type", "asc"),
          orderBy("name", "asc"),
        );
        const querySnapshot = await getDocs(querydata);
        this.categories = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched categories:", this.categories);
      } catch (error) {
        this.error = error.message;
        console.error("Error fetching categories:", error);
      } finally {
        this.loading = false;
      }
    },

    // Function that writes a new category to Firestore
    async addCategory(payload) {
      if (firebaseConfigError) {
        this.error = firebaseConfigError;
        throw new Error(firebaseConfigError);
      }

      const categoryData = {
        name: payload.name.trim(),
        type: payload.type,
        userId: payload.userId,
        defaultKey: null,
        isDefault: false,
        createdAt: serverTimestamp(),
      };

      try {
        const docRef = await addDoc(collection(db, "categories"), categoryData);

        const newCategory = { id: docRef.id, ...categoryData };

        this.categories.push(newCategory);

        return newCategory;
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },
  },
});
