import { db } from '../firebaseConfig';
import { 
  collection, 
  addDoc,
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';

const goalsRef = collection(db, 'goals');

export const GoalService = {
  /**
   * Real-time listener for the user's goals.
   * Keeps the Goal Cards updated instantly.
   */
  readingGoals(userId, callback) {
    const q = query(
      goalsRef, 
      where('userId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const goals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(goals);
    });
  },

  /**
   * Adds a new goal.
   * goalData should include: userId, type, targetAmount, and category (if applicable).
   */
  async addGoal(goalData) {
    return await addDoc(goalsRef, {
      ...goalData,
      createdAt: serverTimestamp()
    });
  },

  /**
   * Updates an existing Goal's Target Amount or Category.
   */
  async updateGoal(id, updatedData) {
    const goalDoc = doc(db, 'goals', id);
    return await updateDoc(goalDoc, updatedData);
  },

  /**
   * Permanently removes a goal after user confirms the delete modal.
   */
  async deleteGoal(id) {
    const goalDoc = doc(db, 'goals', id);
    return await deleteDoc(goalDoc);
  }
};
