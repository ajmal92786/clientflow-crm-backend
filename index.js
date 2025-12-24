const express = require("express");
const mongoose = require("mongoose");
const { initializeDatabase } = require("./db/db.connect");
const LeadModel = require("./models/lead.model");
const SalesAgentModel = require("./models/salesAgent.model");

const app = express();
initializeDatabase();

app.use(express.json());

async function createNewLead(newLeadData) {
  const newLead = new LeadModel(newLeadData);
  const savedLead = await newLead.save();
  return savedLead;
  // return await LeadModel.create(newLeadData);
}

// Creates a new lead.
app.post("/leads", async (req, res) => {
  try {
    const { name, source, salesAgent, status, tags, timeToClose, priority } =
      req.body;

    // Validations
    if (!name || typeof name !== "string") {
      return res.status(400).json({
        error: "Invalid input: 'name' is required.",
      });
    }

    const allowedSources = [
      "Website",
      "Referral",
      "Cold Call",
      "Advertisement",
      "Email",
      "Other",
    ];

    if (!source || !allowedSources.includes(source)) {
      return res.status(400).json({
        error: "Invalid input: 'source' must be a valid value.",
      });
    }

    if (!salesAgent || !mongoose.Types.ObjectId.isValid(salesAgent)) {
      return res.status(400).json({ error: "Invalid salesAgent ID" });
    }

    const allowedStatuses = [
      "New",
      "Contacted",
      "Qualified",
      "Proposal Sent",
      "Closed",
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid input: 'status' is invalid.",
      });
    }

    if (!Number.isInteger(timeToClose) || timeToClose <= 0) {
      return res.status(400).json({
        error: "Invalid input: 'timeToClose' must be a positive integer.",
      });
    }

    const allowedPriorities = ["High", "Medium", "Low"];

    if (priority && !allowedPriorities.includes(priority)) {
      return res.status(400).json({
        error: "Invalid input: 'priority' must be High, Medium, or Low.",
      });
    }

    // Sales Agent Check
    const agent = await SalesAgentModel.findById(salesAgent);
    if (!agent) {
      return res.status(404).json({
        error: `Sales agent with ID '${salesAgent}' not found.`,
      });
    }

    // Create Lead
    const lead = await createNewLead({
      name,
      source,
      salesAgent,
      status,
      tags: Array.isArray(tags) ? tags : [],
      timeToClose,
      priority,
    });

    // Populate Agent
    await lead.populate("salesAgent", "name");

    return res.status(201).json({
      id: lead._id,
      name: lead.name,
      source: lead.source,
      salesAgent: {
        id: lead.salesAgent._id,
        name: lead.salesAgent.name,
      },
      status: lead.status,
      tags: lead.tags,
      timeToClose: lead.timeToClose,
      priority: lead.priority,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "Internal Server Error" });
  }
});

app.get("/", (req, res) => {
  res.send({ status: "ok", message: "Clientflow CRM backend running." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
