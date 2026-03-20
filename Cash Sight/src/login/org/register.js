const form = document.getElementById("form");
const firstNameInput = document.getElementById("first-name");
const lastNameInput = document.getElementById("last-name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const repeatPasswordInput = document.getElementById("confirm-password");
const errorMessage = document.getElementById("error-message");
const allInputs = [
  firstNameInput,
  lastNameInput,
  emailInput,
  passwordInput,
  repeatPasswordInput,
].filter(Boolean);

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const errors = getSignupFormErrors(
      firstNameInput ? firstNameInput.value : "",
      lastNameInput ? lastNameInput.value : "",
      emailInput ? emailInput.value : "",
      passwordInput ? passwordInput.value : "",
      repeatPasswordInput ? repeatPasswordInput.value : "",
    );

    if (!errorMessage) {
      return;
    }

    errorMessage.textContent = errors.join("\n");
  });
}

function getSignupFormErrors(
  firstNameValue,
  lastNameValue,
  emailValue,
  passwordValue,
  repeatPasswordValue,
) {
  const errors = [];

  allInputs.forEach((input) => {
    if (input) {
      input.parentElement.classList.remove("error");
    }
  });

  // Required field validation
  if (firstNameValue === "" || firstNameValue == null) {
    errors.push("First name is required");
    if (firstNameInput) {
      firstNameInput.parentElement.classList.add("error");
    }
  }

  if (lastNameValue === "" || lastNameValue == null) {
    errors.push("Last name is required");
    if (lastNameInput) {
      lastNameInput.parentElement.classList.add("error");
    }
  }
  if (emailValue === "" || emailValue == null) {
    errors.push("Email is required");
    if (emailInput) {
      emailInput.parentElement.classList.add("error");
    }
  }
  if (passwordValue === "" || passwordValue == null) {
    errors.push("Password is required");
    if (passwordInput) {
      passwordInput.parentElement.classList.add("error");
    }
  }
  if (repeatPasswordValue === "" || repeatPasswordValue == null) {
    errors.push("Please confirm your password");
    if (repeatPasswordInput) {
      repeatPasswordInput.parentElement.classList.add("error");
    }
  }

  // password and repeat password logic

  if (passwordValue !== repeatPasswordValue) {
    errors.push("Passwords do not match");
    if (passwordInput) {
      passwordInput.parentElement.classList.add("error");
    }
    if (repeatPasswordInput) {
      repeatPasswordInput.parentElement.classList.add("error");
    }
  }

  if (passwordValue && passwordValue.length < 8) {
    errors.push("Password must be at least 8 characters long");
    if (passwordInput) {
      passwordInput.parentElement.classList.add("error");
    }
  }

  if (passwordValue && !/[A-Z]/.test(passwordValue)) {
    errors.push("Password must contain at least one uppercase letter");
    if (passwordInput) {
      passwordInput.parentElement.classList.add("error");
    }
  }

  if (passwordValue && !/[a-z]/.test(passwordValue)) {
    errors.push("Password must contain at least one lowercase letter");
    if (passwordInput) {
      passwordInput.parentElement.classList.add("error");
    }
  }

  if (passwordValue && !/[0-9]/.test(passwordValue)) {
    errors.push("Password must contain at least one digit");
    if (passwordInput) {
      passwordInput.parentElement.classList.add("error");
    }
  }

  // Email logic

  if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    errors.push("Please enter a valid email address");
    if (emailInput) {
      emailInput.parentElement.classList.add("error");
    }
  }

  return errors;
}

allInputs.forEach((input) => {
  input.addEventListener("input", () => {
    if (input.parentElement.classList.contains("error")) {
      input.parentElement.classList.remove("error");
      if (errorMessage) {
        errorMessage.innerText = "";
      }
    }
  });
});