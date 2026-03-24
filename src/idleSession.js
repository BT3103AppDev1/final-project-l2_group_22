import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref } from "vue";
import { auth } from "./firebase";

const IDLE_TIMEOUT_MS = 1 * 60 * 1000;
const IDLE_CHECK_INTERVAL_MS = 1000;
const ACTIVITY_THROTTLE_MS = 1000;
const PUBLIC_ROUTES = new Set(["/login", "/register", "/reset-password"]);

export const idleTimeoutMs = IDLE_TIMEOUT_MS;
export const remainingIdleMs = ref(0);

function isPublicRoute(path) {
  return PUBLIC_ROUTES.has(path);
}

export function startIdleSessionManager(router) {
  if (!auth || !router) {
    return () => {};
  }

  let hasResolvedInitialAuthState = false;
  let resolveInitialAuthState;
  const initialAuthStateReady = new Promise((resolve) => {
    resolveInitialAuthState = resolve;
  });

  let idleIntervalId = null;
  let lastActivityAt = Date.now();
  let lastActivityEventAt = 0;
  let activityListenersAttached = false;
  let isLoggingOut = false;

  const updateRemainingIdleTime = () => {
    if (!auth.currentUser) {
      remainingIdleMs.value = 0;
      return;
    }

    const idleDuration = Date.now() - lastActivityAt;
    remainingIdleMs.value = Math.max(IDLE_TIMEOUT_MS - idleDuration, 0);
  };

  const activityEvents = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "focus"];

  const updateActivity = (force = false) => {
    if (!auth.currentUser) {
      return;
    }

    const now = Date.now();
    if (!force && now - lastActivityEventAt < ACTIVITY_THROTTLE_MS) {
      return;
    }

    lastActivityEventAt = now;
    lastActivityAt = now;
    remainingIdleMs.value = IDLE_TIMEOUT_MS;
  };

  const handleActivity = () => {
    updateActivity(false);
  };

  const addActivityListeners = () => {
    if (activityListenersAttached) {
      return;
    }

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    document.addEventListener("visibilitychange", handleActivity);
    activityListenersAttached = true;
  };

  const removeActivityListeners = () => {
    if (!activityListenersAttached) {
      return;
    }

    activityEvents.forEach((eventName) => {
      window.removeEventListener(eventName, handleActivity);
    });

    document.removeEventListener("visibilitychange", handleActivity);
    activityListenersAttached = false;
  };

  const stopIdleInterval = () => {
    if (!idleIntervalId) {
      return;
    }

    window.clearInterval(idleIntervalId);
    idleIntervalId = null;
  };

  const redirectToLogin = () => {
    const currentPath = router.currentRoute.value.path;
    if (!isPublicRoute(currentPath)) {
      router.push("/login");
    }
  };

  const startIdleInterval = () => {
    stopIdleInterval();

    idleIntervalId = window.setInterval(async () => {
      if (!auth.currentUser || isLoggingOut) {
        return;
      }

      updateRemainingIdleTime();
      if (remainingIdleMs.value > 0) {
        return;
      }

      isLoggingOut = true;
      try {
        await signOut(auth);
      } finally {
        isLoggingOut = false;
        removeActivityListeners();
        stopIdleInterval();
        redirectToLogin();
      }
    }, IDLE_CHECK_INTERVAL_MS);
  };

  const unregisterRouteGuard = router.beforeEach(async (to) => {
    if (!hasResolvedInitialAuthState) {
      await initialAuthStateReady;
    }

    if (auth.currentUser) {
      updateActivity(true);
      return true;
    }

    if (!isPublicRoute(to.path)) {
      return "/login";
    }

    return true;
  });

  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (!hasResolvedInitialAuthState) {
      hasResolvedInitialAuthState = true;
      resolveInitialAuthState();
    }

    if (user) {
      updateActivity(true);
      updateRemainingIdleTime();
      addActivityListeners();
      startIdleInterval();
      return;
    }

    remainingIdleMs.value = 0;
    removeActivityListeners();
    stopIdleInterval();
    redirectToLogin();
  });

  return () => {
    removeActivityListeners();
    stopIdleInterval();
    unsubscribeAuth();
    unregisterRouteGuard();
  };
}
