<template>
  <div v-if="transaction" class="details-container">
    <div v-if="!isEditing">
      <h2>Transaction Details</h2>
      <p>Category: {{ transaction.category }}</p>
      <p>Amount: ${{ transaction.amount }}</p>
      
      <button @click="isEditing = true">Edit</button>
      <button @click="confirmDelete = true" class="delete-btn">Delete</button>
    </div>

    <div v-else>
      <input v-model="editForm.amount" type="number" />
      <input v-model="editForm.category" type="text" />
      <button @click="handleSave" :disabled="isProcessing">Save</button>
      <button @click="isEditing = false">Cancel</button>
    </div>

    <div v-if="confirmDelete" class="modal">
      <p>Are you sure you want to delete this record?</p>
      <button @click="handleDelete" :disabled="isProcessing">Confirm Delete</button>
      <button @click="confirmDelete = false">Cancel</button>
    </div>

    <p v-if="isProcessing">Updating records...</p>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ED } from '../services/editDelete.ts';

const props = defineProps(['transaction']);
const emit = defineEmits(['close']);

const isEditing = ref(false);
const confirmDelete = ref(false);
const isProcessing = ref(false);

const editForm = reactive({ ...props.transaction });

const handleSave = async () => {
  isProcessing.value = true;
  try {
    // Meets NF-01: Operation typically completes < 2s with Firestore
    await ED.updateTransaction(props.transaction.id, editForm);
    isEditing.value = false;
  } finally {
    isProcessing.value = false;
  }
};

const handleDelete = async () => {
  isProcessing = true;
  try {
    await ED.deleteTransaction(props.transaction.id);
    confirmDelete.value = false;
    emit('close'); // Return to list
  } finally {
    isProcessing = false;
  }
};
</script>
