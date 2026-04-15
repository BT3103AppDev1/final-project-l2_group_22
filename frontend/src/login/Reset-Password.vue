<template>
  <main class="page">
    <section class="auth-card" aria-labelledby="reset-password-title">
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
            <path d="M7 15h-3a1 1 0 0 1 -1 -1v-8a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v3" />
            <path
              d="M7 9m0 1a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1z"
            />
            <path d="M12 14a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
          </svg>
        </div>
        <h1>CashSight</h1>
      </header>

      <div class="auth-copy">
        <h2 id="reset-password-title">Reset your password</h2>
        <p>Enter your email and we will send you a password reset link.</p>
      </div>

      <p id="error-message">{{ errorMessage }}</p>
      <p v-if="successMessage" id="success-message">{{ successMessage }}</p>

      <form class="auth-form" novalidate @submit.prevent="handleSubmit">
        <div class="field-group" :class="{ error: emailError }">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            name="email"
            type="email"
            required
            @input="clearFieldError"
          />
        </div>

        <button type="submit" class="submit-button">Send Reset Link</button>
      </form>

      <p class="signin-copy">
        Remember your password?
        <router-link to="/login">Back to sign in.</router-link>
      </p>
    </section>
  </main>
</template>

<script>
import { getAuth, fetchSignInMethodsForEmail, sendPasswordResetEmail } from "firebase/auth";
import firebaseApp, { firebaseConfigError } from "../firebase";

export default {
  data() {
    return {
      email: "",
      errorMessage: "",
      successMessage: "",
      emailError: false,
    };
  },
  methods: {
    async handleSubmit() {
      const normalizedEmail = this.email.trim();
      const errors = this.getResetFormErrors(normalizedEmail);
      this.errorMessage = errors.join("\n");
      this.successMessage = "";

      if (errors.length > 0) {
        return;
      }

      if (!firebaseApp) {
        this.errorMessage = firebaseConfigError || "Firebase is not configured";
        return;
      }

      const auth = getAuth(firebaseApp);

      try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, normalizedEmail);

        if (!signInMethods || signInMethods.length === 0) {
          this.errorMessage = this.mapFirebaseAuthError("auth/user-not-found");
          return;
        }

        await sendPasswordResetEmail(auth, normalizedEmail);
        this.errorMessage = "";
        this.successMessage = "Password reset email sent. Please check your inbox.";
      } catch (error) {
        this.errorMessage = this.mapFirebaseAuthError(error?.code);
      }
    },
    getResetFormErrors(emailValue) {
      const errors = [];
      this.emailError = false;

      if (!emailValue) {
        errors.push("Email is required");
        this.emailError = true;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        errors.push("Please enter a valid email address");
        this.emailError = true;
      }

      return errors;
    },
    clearFieldError() {
      this.emailError = false;
      this.errorMessage = "";
      this.successMessage = "";
    },
    mapFirebaseAuthError(errorCode) {
      const errorMap = {
        "auth/invalid-email": "Please enter a valid email address",
        "auth/user-not-found": "No account found for this email",
        "auth/too-many-requests": "Too many attempts. Please try again later",
        "auth/network-request-failed": "Network error. Please check your connection",
      };

      return errorMap[errorCode] || "Unable to send reset email. Please try again";
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

#error-message {
  margin-top: 12px;
  color: #d9534f;
  font-size: 13px;
  text-align: center;
  white-space: pre-line;
}

#success-message {
  margin-top: 12px;
  color: #2d8a4f;
  font-size: 13px;
  text-align: center;
}
</style>
