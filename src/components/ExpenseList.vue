// Assuming the structure is:
// users (collection) -> {userID} (document) -> Transactions (document) -> Expenses (subcollection)


<template>
  <div class="expenses-container">
    <div v-if="loading">Loading...</div>

    <div v-else-if="expenses.length === 0" class="empty-state">
      <p>No expenses yet</p>
      <router-link to="/add-transaction">
        <button class="btn-primary">Add expense</button>
      </router-link>
    </div>

    <div v-else>
      <ul>
        <li v-for="expense in expenses" :key="expense.id">
          {{ expense.name }} - ${{ expense.amount }}
        </li>
      </ul>
      <router-link to="/add-transaction">
        <button class="btn-secondary">Add another</button>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase'; // Ensure your firebase.js exports 'db' (getFirestore)

const expenses = ref([]);
const loading = ref(true);

const fetchExpenses = async () => {
  const user = auth.currentUser;
  
  if (user) {
    try {
      // Path: users/{userId}/Transactions/Expenses
      // Note: 'Transactions' is treated here as a Document ID 
      // which contains the 'Expenses' subcollection.
      const expensesRef = collection(db, 'users', user.uid, 'Transactions', 'Expenses');
      const querySnapshot = await getDocs(expensesRef);
      
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      
      expenses.value = results;
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      loading.value = false;
    }
  }
};

onMounted(() => {
  fetchExpenses();
});
</script>
