function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

function validateCreateAgent(body) {
  const { name, email } = body;

  if (!name || typeof name !== "string") {
    return "Invalid input: 'name' is required.";
  }

  if (!isValidEmail(email)) {
    return "Invalid input: 'email' must be a valid email address.";
  }
}

module.exports = { validateCreateAgent };
