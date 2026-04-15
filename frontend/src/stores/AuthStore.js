// stores/AuthStore.js
import { defineStore } from 'pinia';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isInitialised: false
  }),
  getters: {
    currentUserId: (state) => state.user?.uid || null,
    currentUserEmail: (state) => state.user?.email || null,
    isAuthenticated: (state) => !!state.user
  },
  actions: {
    initializeAuth() {
      const auth = getAuth();
      return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
          this.user = user;
          this.isInitialised = true;
          resolve(user);
        });
      });
    }
  }
});
