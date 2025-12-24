const mongoose = require("mongoose");

const allowedSources = [
  "Website",
  "Referral",
  "Cold Call",
  "Advertisement",
  "Email",
  "Other",
];

const allowedStatuses = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Closed",
];

const allowedPriorities = ["High", "Medium", "Low"];

function validateCreateLead(body) {
  const { name, source, salesAgent, status, timeToClose, priority } = body;

  if (!name || typeof name !== "string") {
    return "Invalid input: 'name' is required.";
  }

  if (!source || !allowedSources.includes(source)) {
    return "Invalid input: 'source' must be a valid value.";
  }

  if (!salesAgent || !mongoose.Types.ObjectId.isValid(salesAgent)) {
    return "Invalid salesAgent ID";
  }

  if (status && !allowedStatuses.includes(status)) {
    return "Invalid input: 'status' is invalid.";
  }

  if (!Number.isInteger(timeToClose) || timeToClose <= 0) {
    return "Invalid input: 'timeToClose' must be a positive integer.";
  }

  if (priority && !allowedPriorities.includes(priority)) {
    return "Invalid input: 'priority' must be High, Medium, or Low.";
  }
}

module.exports = { validateCreateLead };
