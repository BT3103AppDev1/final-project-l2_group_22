import { defineStore } from 'pinia';
import { GoalService } from '../services/GoalService';



export const useGoalStore = defineStore('goals', {
  state: () => ({
    goals: [],
    loading: false,
    stopReading: null
  }),

  getters: {
    /**
     * Requirement: Goal Card shows goal name (type + category if applicable).
     * This getter returns the goals with a pre-formatted 'displayName'.
     */
    formattedGoals: (state) => {
      return state.goals.map(goal => ({
        ...goal,
        displayName: goal.type === 'Monthly Category Spending Cap' 
          ? `${goal.category} Cap` 
          : goal.type
      }));
    },
    findDuplicate: (state) => (newGoal, currentId = null) => {
  return state.goals.find(g => {
    // 1. Skip the goal we are currently editing (by ID)
    if (currentId && g.id === currentId) return false;

    // 2. Check for matching type and category
    if (newGoal.type === 'Monthly Category Spending Cap') {
      return g.type === newGoal.type && g.category === newGoal.category;
    }
    return g.type === newGoal.type;
  });
},

    /**
     * Computes the current amount toward a goal given an array of transactions.
     * Spending caps measure expenses, while savings targets measure net savings.
     */
    goalActual: (state) => (goal, transactions) => {
      if (goal.type === 'Monthly Total Spending Cap') {
        return transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + (t.amount || 0), 0);
      } else if (goal.type === 'Monthly Category Spending Cap') {
        return transactions
          .filter(t => t.type === 'expense' && t.category === goal.category)
          .reduce((sum, t) => sum + (t.amount || 0), 0);
      } else if (goal.type === 'Monthly Savings Target') {
        const income = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        const expenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        return Math.max(income - expenses, 0);
      }
      return 0;
    },

    /**
     * Computes the status of a goal based on actual vs target spending.
     * 'Exceeded' if actual >= target,
     * 'At risk' if actual >= target * 0.8,
     * 'On track' otherwise.
     */
    goalStatus: (state) => (actual, target) => {
      if (actual >= target) return 'Exceeded';
      if (actual >= target * 0.8) return 'At risk';
      return 'On track';
    }
  },

  actions: {
    /**
     * Starts the real-time listener for goals.
     */
    async init(userId) {
      if (!userId) return;
      if (this.stopReading) this.stopReading();

      this.loading = true;
      this.stopReading = GoalService.readingGoals(userId, (data) => {
        this.goals = data;
        this.loading = false;
      });
    },

    /**
     * Adds a new goal to Firestore.
     */
    async addGoal(goalData) {
      try {
        await GoalService.addGoal(goalData);
      } catch (error) {
        console.error("Error adding goal:", error);
        throw error;
      }
    },

    /**
     * Updates an existing goal (Target Amount/Category).
     */
    async updateGoal(id, updatedData) {
      try {
        await GoalService.updateGoal(id, updatedData);
      } catch (error) {
        console.error("Error updating goal:", error);
        throw error;
      }
    },

    /**
     * Removes a goal from Firestore.
     */
    async deleteGoal(id) {
      try {
        await GoalService.deleteGoal(id);
      } catch (error) {
        console.error("Error deleting goal:", error);
        throw error;
      }
    },

    /**
     * Stops the Firestore listener to save memory.
     */
    cleanup() {
      if (this.stopReading) {
        this.stopReading();
        this.stopReading = null;
      }
    }
  }
});
