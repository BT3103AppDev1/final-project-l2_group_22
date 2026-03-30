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
    findDuplicate: (state) => (newGoal) => {
    return state.goals.find(g => {
      if (newGoal.type === 'Monthly Category Spending Cap') {
        return g.type === newGoal.type && g.category === newGoal.category;
      }
    return g.type === newGoal.type;
  });
}
  },

  actions: {
    /**
     * Starts the real-time listener for goals.
     */
    init(userId) {
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
