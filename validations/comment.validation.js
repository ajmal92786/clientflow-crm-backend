const mongoose = require("mongoose");

function isObjectIdValid(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function validateCreateComment(leadId, commentText) {
  if (!isObjectIdValid(leadId)) {
    return "Lead ID must be a valid ObjectId.";
  }

  if (!commentText || typeof commentText !== "string") {
    return "Comment Text is required and must be a string.";
  }
}

function validateGetComments(leadId) {
  if (!isObjectIdValid(leadId)) {
    return "Lead ID must be a valid ObjectId.";
  }
}

module.exports = { validateCreateComment, validateGetComments };
