const mongoose = require("mongoose");

function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

function isObjectIdValid(id) {
  return mongoose.Types.ObjectId.isValid(id);
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

function validateAgentDelete(params) {
  const { id } = params;

  if (!isObjectIdValid(id)) {
    return "Invalid salesAgent ID";
  }
}

module.exports = { validateCreateAgent, validateAgentDelete };
