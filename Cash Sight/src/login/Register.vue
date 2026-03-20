<template>
	<main class="page">
		<section class="auth-card" aria-labelledby="create-account-title">
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
				<h2 id="create-account-title">Create your account</h2>
				<p>Get started with CashSight by creating your free account</p>
			</div>
			<p id="error-message">{{ errorMessage }}</p>

			<form class="auth-form" novalidate @submit.prevent="handleSubmit">
				<div class="field-group" :class="{ error: firstNameError }">
					<label for="first-name">First Name</label>
					<input
						id="first-name"
						v-model="firstName"
						name="first-name"
						type="text"
						required
						@input="clearFieldError('firstName')"
					/>
				</div>

				<div class="field-group" :class="{ error: lastNameError }">
					<label for="last-name">Last Name</label>
					<input
						id="last-name"
						v-model="lastName"
						name="last-name"
						type="text"
						required
						@input="clearFieldError('lastName')"
					/>
				</div>

				<div class="field-group" :class="{ error: emailError }">
					<label for="email">Email</label>
					<input
						id="email"
						v-model="email"
						name="email"
						type="email"
						required
						@input="clearFieldError('email')"
					/>
				</div>

				<div class="field-group" :class="{ error: passwordError }">
					<label for="password">Password</label>
					<input
						id="password"
						v-model="password"
						name="password"
						type="password"
						required
						@input="clearFieldError('password')"
					/>
				</div>

				<div class="field-group" :class="{ error: repeatPasswordError }">
					<label for="confirm-password">Confirm Password</label>
					<input
						id="confirm-password"
						v-model="repeatPassword"
						name="confirm-password"
						type="password"
						required
						@input="clearFieldError('repeatPassword')"
					/>
				</div>

				<button type="submit" class="submit-button">Create Account</button>
			</form>

			<p class="signin-copy">
				Already have an account?
				<router-link to="/login">Sign in here.</router-link>
			</p>
		</section>
	</main>
</template>

<script>
import {
	createUserWithEmailAndPassword,
	getAuth,
	updateProfile,
	validatePassword,
} from "firebase/auth";
import firebaseApp, { firebaseConfigError } from "../firebase";

export default {
	data() {
		return {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			repeatPassword: "",
			errorMessage: "",
			firstNameError: false,
			lastNameError: false,
			emailError: false,
			passwordError: false,
			repeatPasswordError: false,
		};
	},
	methods: {
		async handleSubmit() {
			const errors = this.getSignupFormErrors(
				this.firstName,
				this.lastName,
				this.email,
				this.password,
				this.repeatPassword,
			);

			this.errorMessage = errors.join("\n");

			if (errors.length > 0) {
				return;
			}

			if (!firebaseApp) {
				this.errorMessage = firebaseConfigError || "Firebase is not configured";
				return;
			}

			const auth = getAuth(firebaseApp);
			const status = await validatePassword(auth, this.password);
			if (!status.isValid) {
				this.passwordError = true;
				this.repeatPasswordError = true;
				this.errorMessage = this.mapPasswordPolicyStatus(status).join("\n");
				return;
			}

			createUserWithEmailAndPassword(auth, this.email, this.password)
				.then(async (userCredential) => {
					const user = userCredential.user;
					await updateProfile(user, {
						displayName: `${this.firstName} ${this.lastName}`.trim(),
					});
					this.errorMessage = "";
					this.$router.push("/login");
				})
				.catch((error) => {
					const errorCode = error.code;
					this.errorMessage = this.mapFirebaseAuthError(errorCode);
				});
		},
		resetErrorFlags() {
			this.firstNameError = false;
			this.lastNameError = false;
			this.emailError = false;
			this.passwordError = false;
			this.repeatPasswordError = false;
		},
		getSignupFormErrors(
			firstNameValue,
			lastNameValue,
			emailValue,
			passwordValue,
			repeatPasswordValue,
		) {
			const errors = [];
			this.resetErrorFlags();

			if (firstNameValue === "" || firstNameValue == null) {
				errors.push("First name is required");
				this.firstNameError = true;
			}

			if (lastNameValue === "" || lastNameValue == null) {
				errors.push("Last name is required");
				this.lastNameError = true;
			}

			if (emailValue === "" || emailValue == null) {
				errors.push("Email is required");
				this.emailError = true;
			}

			if (passwordValue === "" || passwordValue == null) {
				errors.push("Password is required");
				this.passwordError = true;
			}

			if (repeatPasswordValue === "" || repeatPasswordValue == null) {
				errors.push("Please confirm your password");
				this.repeatPasswordError = true;
			}

			if (passwordValue !== repeatPasswordValue) {
				errors.push("Passwords do not match");
				this.passwordError = true;
				this.repeatPasswordError = true;
			}

			if (passwordValue && passwordValue.length < 8) {
				errors.push("Password must be at least 8 characters long");
				this.passwordError = true;
			}

			if (passwordValue && !/[A-Z]/.test(passwordValue)) {
				errors.push("Password must contain at least one uppercase letter");
				this.passwordError = true;
			}

			if (passwordValue && !/[a-z]/.test(passwordValue)) {
				errors.push("Password must contain at least one lowercase letter");
				this.passwordError = true;
			}

			if (passwordValue && !/[0-9]/.test(passwordValue)) {
				errors.push("Password must contain at least one digit");
				this.passwordError = true;
			}

			if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
				errors.push("Please enter a valid email address");
				this.emailError = true;
			}

			return errors;
		},
		clearFieldError(field) {
			if (field === "firstName") {
				this.firstNameError = false;
			}

			if (field === "lastName") {
				this.lastNameError = false;
			}

			if (field === "email") {
				this.emailError = false;
			}

			if (field === "password") {
				this.passwordError = false;
			}

			if (field === "repeatPassword") {
				this.repeatPasswordError = false;
			}

			this.errorMessage = "";
		},
		mapFirebaseAuthError(errorCode) {
			const errorMap = {
				"auth/email-already-in-use": "This email is already in use",
				"auth/invalid-email": "Please enter a valid email address",
				"auth/weak-password": "Password is too weak",
				"auth/network-request-failed": "Network error. Please check your connection",
			};

			return errorMap[errorCode] || "Unable to create account. Please try again";
		},
		mapPasswordPolicyStatus(status) {
			const messages = [];

			if (status.containsLowercaseLetter !== undefined && status.containsLowercaseLetter !== true) {
				messages.push("Password must contain at least one lowercase letter");
			}

			if (status.containsUppercaseLetter !== undefined && status.containsUppercaseLetter !== true) {
				messages.push("Password must contain at least one uppercase letter");
			}

			if (status.containsNumericCharacter !== undefined && status.containsNumericCharacter !== true) {
				messages.push("Password must contain at least one digit");
			}

			if (
				status.containsNonAlphanumericCharacter !== undefined &&
				status.containsNonAlphanumericCharacter !== true
			) {
				messages.push("Password must contain at least one special character");
			}

			if (status.meetsMinPasswordLength !== undefined && status.meetsMinPasswordLength !== true) {
				messages.push("Password does not meet the minimum length requirement");
			}

			if (messages.length === 0) {
				messages.push("Password does not satisfy Firebase password policy");
			}

			return messages;
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

.field-hint {
	margin-top: 6px;
	color: var(--text-500);
	font-size: 11px;
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
</style>
