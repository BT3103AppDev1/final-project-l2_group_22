<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="sheet" role="dialog" aria-modal="true" :aria-labelledby="titleId">
      <div class="sheet-header">
        <h2 :id="titleId">{{ title }}</h2>
        <button class="close-btn" type="button" @click="$emit('close')">Close</button>
      </div>

      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: "InsightExplanationSheet",
  emits: ["close"],
  props: {
    title: {
      type: String,
      required: true
    },
    titleId: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 100;
}

.sheet {
  width: min(640px, 100%);
  max-height: 88vh;
  overflow-y: auto;
  background: #ffffff;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 18px;
  box-shadow: 0 -10px 28px rgba(15, 23, 42, 0.2);
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.sheet-header h2 {
  margin: 0;
  font-size: 18px;
  color: #111827;
}

.close-btn {
  border: none;
  background: #f3f4f6;
  color: #374151;
  padding: 8px 12px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}
</style>
