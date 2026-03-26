// src/services/TransactionService.js
import { db } from '../firebaseConfig';
import { 
  collection, 
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

const transactionsRef = collection(db, 'transactions');

export const TransactionService = {
  // Real-time listener for the list
  subscribeToTransactions(userId, callback) {
    const q = query(
      transactionsRef, 
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(transactions);
    });
  },

  async updateTransaction(id, updatedData) {
    const transactionDoc = doc(db, 'transactions', id);
    return await updateDoc(transactionDoc, updatedData);
  },

  async deleteTransaction(id) {
    const transactionDoc = doc(db, 'transactions', id);
    return await deleteDoc(transactionDoc);
  }
};
