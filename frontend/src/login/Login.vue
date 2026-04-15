<template>
  <main class="page">
    <section class="auth-card" aria-labelledby="sign-in-title">
      <header class="brand-header">
        <div class="brand-icon" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M7 15h-3a1 1 0 0 1 -1 -1v-8a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v3"
            />
            <path
              d="M7 9m0 1a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1z"
            />
            <path d="M12 14a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
          </svg>
        </div>
        <h1>CashSight</h1>
      </header>

      <div class="auth-copy">
        <h2 id="sign-in-title">Sign in to your account</h2>
        <p>Welcome back. Enter your email and password to continue.</p>
      </div>
      <p id="error-message">{{ errorMessage }}</p>
      <form @submit.prevent="handleSubmit" class="auth-form" novalidate>
        <div class="field-group" :class="{ error: emailError }">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            @input="clearFieldError('email')"
            name="email"
            type="email"
            required
          />
        </div>
        <div class="field-group" :class="{ error: passwordError }">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            @input="clearFieldError('password')"
            name="password"
            type="password"
            required
          />
        </div>

        <label for="rememberMe" class="remember-me">
          <span class="remember-me__copy">
            <span class="remember-me__title">Remember Me</span>
            <span class="remember-me__hint">Stay signed in on this device</span>
          </span>
          <input
            id="rememberMe"
            v-model="rememberMe"
            type="checkbox"
            class="remember-me__checkbox"
          />
        </label>

        <button type="submit" class="submit-button">Sign In</button>
      </form>

      <div id="google-signin">
        <button @click="googleSignIn" class="google-btn" type="button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="20px"
            height="20px"
          >
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            />
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            />
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            />
          </svg>
          <span>Sign in with Google</span>
        </button>
      </div>

      <p class="signin-copy">
        Do not have an account?
        <router-link to="/register">Create one.</router-link>
      </p>

      <p class="signin-copy">
        Forgot your password?
        <router-link to="/reset-password">Reset it here.</router-link>
      </p>
    </section>
  </main>
</template>

<script>
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
  deleteUser,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import firebaseApp, { firebaseConfigError } from "../firebase";
import { setRememberMeCookie, getRememberMeCookie } from "@/utils/rememberMe";
import {
  collection,
  getDocs,
  query,
  where,
  writeBatch,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/constants/categories";

export default {
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
      emailError: false,
      passwordError: false,
      rememberMe: false,
    };
  },
  mounted() {
    this.rememberMe = getRememberMeCookie();
  },
  methods: {
    async handleSubmit() {
      const errors = this.getLoginFormErrors(this.email, this.password);
      this.errorMessage = errors.join("\n");

      if (errors.length > 0) return;

      if (!firebaseApp) {
        this.errorMessage = firebaseConfigError || "Firebase is not configured";
        return;
      }

      const auth = getAuth(firebaseApp);
      await setPersistence(
        auth,
        this.rememberMe ? browserLocalPersistence : browserSessionPersistence,
      );
      setRememberMeCookie(this.rememberMe);

      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          this.email,
          this.password,
        );
        const user = userCredential.user;

        if (!user.emailVerified) {
          this.errorMessage =
            "Please verify your email before signing in. Check your inbox for the link.";
          await signOut(auth);
          return;
        }

        await user.reload();
        await this.ensureDefaultCategories(user.uid);
        this.errorMessage = "";
        this.$router.push("/dashboard");
      } catch (error) {
        const errorCode = error.code;
        this.errorMessage = this.mapFirebaseAuthError(errorCode);
      }
    },
    // When a user logs in, check if they have the default transaction categories written into their Firebase.
    // If not, write default transaction categories into the categories document of Firebase, else do nothing
    async ensureDefaultCategories(userId) {
      if (!userId) return;

      const categoriesRef = collection(db, "categories");
      const existingQuery = query(categoriesRef, where("userId", "==", userId));
      const existingSnapshot = await getDocs(existingQuery);

      const existingCategories = new Set(
        existingSnapshot.docs
          .map((doc) => {
            const data = doc.data();
            if (!data.defaultKey) return null;
            return `${data.type}-${data.defaultKey}`;
          })
          .filter(Boolean),
      );

      const defaultCategories = [
        ...EXPENSE_CATEGORIES.map((name) => ({
          type: "expense",
          name,
          defaultKey: name.toLowerCase().replace(/[^a-z0-9]/g, ""),
        })),
        ...INCOME_CATEGORIES.map((name) => ({
          type: "income",
          name,
          defaultKey: name.toLowerCase().replace(/[^a-z0-9]/g, ""),
        })),
      ];

      const missingDefaultCategories = defaultCategories.filter(
        (category) =>
          !existingCategories.has(`${category.type}-${category.defaultKey}`),
      );

      if (missingDefaultCategories.length === 0) return;

      const batch = writeBatch(db);

      missingDefaultCategories.forEach((category) => {
        const newDocRef = doc(categoriesRef);
        batch.set(newDocRef, {
          userId,
          type: category.type,
          name: category.name,
          defaultKey: category.defaultKey,
          isDefault: true,
          createdAt: new Date(),
        });
      });

      await batch.commit();
    },
    getLoginFormErrors(emailValue, passwordValue) {
      const errors = [];

      this.emailError = false;
      this.passwordError = false;

      if (!emailValue) {
        errors.push("Email is required");
        this.emailError = true;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        errors.push("Please enter a valid email address");
        this.emailError = true;
      }

      if (!passwordValue) {
        errors.push("Password is required");
        this.passwordError = true;
      }

      return errors;
    },
    clearFieldError(field) {
      if (field === "email") {
        this.emailError = false;
      }

      if (field === "password") {
        this.passwordError = false;
      }

      this.errorMessage = "";
    },
    mapFirebaseAuthError(errorCode) {
      const errorMap = {
        "auth/invalid-credential": "Invalid email or password",
        "auth/user-disabled": "This account has been disabled",
        "auth/too-many-requests": "Too many attempts. Please try again later",
        "auth/network-request-failed":
          "Network error. Please check your connection",
        "auth/popup-closed-by-user": "Google sign-in was cancelled",
        "auth/account-exists-with-different-credential":
          "This email already exists with a different sign-in method. Use your email/password account instead.",
      };

      return errorMap[errorCode] || "Unable to sign in. Please try again";
    },

    async googleSignIn() {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(firebaseApp || undefined);
      await setPersistence(
        auth,
        this.rememberMe ? browserLocalPersistence : browserSessionPersistence,
      );
      setRememberMeCookie(this.rememberMe);

      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const additionalUserInfo = getAdditionalUserInfo(result);

        // Block automatic account creation via Google so old emails cannot re-enter as a new user.
        if (additionalUserInfo?.isNewUser) {
          try {
            await deleteUser(user);
          } catch (deleteError) {
            console.warn(
              "Could not remove newly created Google account:",
              deleteError,
            );
          }

          await signOut(auth);
          this.errorMessage =
            "This Google account is not linked to an existing CashSight account. Please sign in with your current account email first.";
          return;
        }

        this.errorMessage = "";
        await this.ensureDefaultCategories(user.uid);
        this.$router.push("/dashboard");
      } catch (error) {
        const errorCode = error.code;
        this.errorMessage = this.mapFirebaseAuthError(errorCode);
      }
    },
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");

:root {
  --bg: #f4f6f5;
  --card: #ffffff;
  --text-900: #24302c;
  --text-700: #5e6c66;
  --text-500: #8d9893;
  --brand: #5e9486;
  --border: #dfe6e3;
  --focus: #87b5a8;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: "Plus Jakarta Sans", sans-serif;
  background: linear-gradient(180deg, #f8faf9 0%, var(--bg) 100%);
  color: var(--text-900);
}

.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.auth-card {
  width: min(100%, 480px);
  background: var(--card);
  border: 1px solid #e8eeeb;
  border-radius: 12px;
  box-shadow: 0 14px 34px rgba(15, 29, 23, 0.08);
  padding: 40px 32px;
}

.brand-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 18px;
}

.brand-header h1 {
  margin: 0;
  font-size: 34px;
  color: var(--brand);
}

.brand-icon {
  width: 34px;
  height: 34px;
  color: var(--brand);
  display: grid;
  place-items: center;
}

.brand-icon svg {
  width: 100%;
  height: 100%;
}

.auth-copy {
  text-align: center;
  margin-bottom: 32px;
}

.auth-copy h2 {
  margin: 0 0 6px;
  font-size: 19px;
  font-weight: 700;
}

.auth-copy p {
  margin: 0;
  color: var(--text-700);
  font-size: 13px;
}

.field-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #33423d;
  margin-bottom: 8px;
}

input {
  width: 100%;
  height: 42px;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  transition: all 120ms ease;
}

input:focus {
  border-color: var(--focus);
  box-shadow: 0 0 0 3px rgba(135, 181, 168, 0.18);
}

.submit-button {
  width: 100%;
  height: 42px;
  border: 0;
  border-radius: 8px;
  margin-top: 10px;
  background: var(--brand);
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.submit-button:hover {
  opacity: 0.9;
}

.signin-copy {
  margin-top: 24px;
  text-align: center;
  font-size: 13px;
  color: #7a8782;
}

.signin-copy a {
  color: var(--brand);
  text-decoration: none;
  font-weight: 700;
}

.field-group.error input {
  border-color: #d9534f;
}

.remember-me {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: -4px;
  margin-bottom: 12px;
  padding: 10px 12px;
  border: 1px solid #d7e2de;
  border-radius: 10px;
  background: #f8fbf9;
  cursor: pointer;
}

.remember-me__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.remember-me__title {
  font-size: 13px;
  font-weight: 700;
  color: #2f3c37;
  line-height: 1.2;
}

.remember-me__hint {
  margin-top: 2px;
  font-size: 12px;
  color: #72817a;
  line-height: 1.2;
}

.remember-me__checkbox {
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: var(--brand);
  cursor: pointer;
  flex-shrink: 0;
}

#error-message {
  margin-top: 12px;
  color: #d9534f;
  font-size: 13px;
  text-align: center;
  margin-bottom: 16px;
  white-space: pre-line;
}

#google-signin {
  margin-top: 20px;
  margin-bottom: 20px;
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 42px;
  background: white;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-900);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s,
    box-shadow 0.2s;
}

.google-btn:hover {
  background-color: #f8f9fa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.google-btn svg {
  flex-shrink: 0;
}
</style>
