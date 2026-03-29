import { ref } from "vue";
export const idleTimeoutMs = 0;
export const remainingIdleMs = ref(0);

export function startIdleSessionManager() {
  return () => {};
}
