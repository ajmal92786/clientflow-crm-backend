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

function isObjectIdValid(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function validateCreateLead(body) {
  const { name, source, salesAgent, status, timeToClose, priority } = body;

  if (!name || typeof name !== "string") {
    return "Invalid input: 'name' is required.";
  }

  if (!source || !allowedSources.includes(source)) {
    return "Invalid input: 'source' must be a valid value.";
  }

  if (!salesAgent || !isObjectIdValid(salesAgent)) {
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

  return null;
}

function validateLeadQuery(query) {
  const { salesAgent, status, source, priority, sortBy, order } = query;

  if (salesAgent && !isObjectIdValid(salesAgent)) {
    return "Invalid salesAgent ID ";
  }

  if (status && !allowedStatuses.includes(status)) {
    return "Invalid input: 'status' must be one of ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed'].";
  }

  if (source && !allowedSources.includes(source)) {
    return "Invalid input: 'source' must be one of ['Website', 'Referral', 'Cold Call', 'Advertisement', 'Email', 'Other'].";
  }

  if (priority && !allowedPriorities.includes(priority)) {
    return "Invalid input: 'priority' must be one of ['High', 'Medium', 'Low'].";
  }

  if (sortBy && sortBy !== "timeToClose") {
    return "Invalid input: 'sortBy' must be timeToClose.";
  }

  if (order && !["asc", "desc"].includes(order)) {
    return "Invalid input: 'order' must be one of ['asc', 'desc'].";
  }

  return null;
}

function validateLeadById(params) {
  const { id } = params;
  if (!id || !isObjectIdValid(id)) {
    return "Invalid lead ID";
  }

  return null;
}

function validateUpdateLead(params, body) {
  const { id } = params;

  if (!isObjectIdValid(id)) {
    return "Invalid lead ID";
  }

  return validateCreateLead(body);
}

function validateDeleteLead(params) {
  const { id } = params;

  if (!isObjectIdValid(id)) {
    return "Invalid lead ID";
  }
}

module.exports = {
  validateCreateLead,
  validateLeadQuery,
  validateLeadById,
  validateUpdateLead,
  validateDeleteLead,
};
