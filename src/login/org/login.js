const form = document.getElementById("form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("error-message");

const allInputs = [emailInput, passwordInput].filter(Boolean);

if (form) {
  form.addEventListener("submit", (event) => {
    // Keep user on the same page while showing validation feedback.
    event.preventDefault();

    const errors = getLoginFormErrors(
      emailInput ? emailInput.value : "",
      passwordInput ? passwordInput.value : "",
    );

    if (errorMessage) {
      errorMessage.textContent = errors.join("\n");
    }
  });
}

function getLoginFormErrors(emailValue, passwordValue) {
  const errors = [];

  allInputs.forEach((input) => {
    input.parentElement.classList.remove("error");
  });

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
    input.parentElement.classList.remove("error");
    if (errorMessage) {
      errorMessage.textContent = "";
    }
  });
});
