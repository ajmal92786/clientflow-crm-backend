const express = require("express");
const { initializeDatabase } = require("./db/db.connect");
const LeadModel = require("./models/lead.model");
const SalesAgentModel = require("./models/salesAgent.model");
const {
  validateCreateLead,
  validateLeadQuery,
  validateUpdateLead,
} = require("./validations/lead.validation");

const app = express();
initializeDatabase();

app.use(express.json());

async function createNewLead(newLeadData) {
  const newLead = new LeadModel(newLeadData);
  const savedLead = await newLead.save();
  return savedLead;
}

// Creates a new lead.
app.post("/leads", async (req, res) => {
  try {
    const { name, source, salesAgent, status, tags, timeToClose, priority } =
      req.body;

    // Validations
    const validationError = validateCreateLead(req.body);

    if (validationError) {
      return res.status(400).json({ error: validationError });
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

async function getAllLeads(filters) {
  return await LeadModel.find(filters).populate("salesAgent", "name");
}

// Fetches all leads with optional filtering.
app.get("/leads", async (req, res) => {
  try {
    const { salesAgent, status, tags, source } = req.query;

    // Validations
    const validationError = validateLeadQuery(req.query);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Sales Agent Check
    if (salesAgent) {
      const agent = await SalesAgentModel.findById(salesAgent);
      if (!agent) {
        return res.status(404).json({
          error: `Sales agent with ID '${salesAgent}' not found.`,
        });
      }
    }

    const filters = {};

    if (salesAgent) filters.salesAgent = salesAgent;
    if (source) filters.source = source;
    if (status) filters.status = status;
    if (tags) filters.tags = tags;

    const leads = await getAllLeads(filters);

    const formattedLeads = leads.map((lead) => ({
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
    }));

    return res.status(200).json(formattedLeads);
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "Internal Server Error" });
  }
});

async function updateLeadById(leadId, dataToUpdate) {
  return await LeadModel.findByIdAndUpdate(leadId, dataToUpdate, {
    new: true,
  }).populate("salesAgent", "name");
}

// Updates a lead with new information.
app.put("/leads/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { name, source, salesAgent, status, tags, timeToClose, priority } =
      req.body;

    // Validations
    const validationError = validateUpdateLead(req.params, req.body);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Check Lead existance
    const existingLead = await LeadModel.findById(id);
    if (!existingLead) {
      return res.status(404).json({
        error: `Lead with ID '${id}' not found.`,
      });
    }

    // Check sales agent existance
    const agent = await SalesAgentModel.findById(salesAgent);
    if (!agent) {
      return res.status(404).json({
        error: `Sales agent with ID '${salesAgent}' not found.`,
      });
    }

    const updatedLead = await updateLeadById(id, {
      name,
      source,
      salesAgent,
      status,
      tags: Array.isArray(tags) ? tags : [],
      timeToClose,
      priority,
    });

    return res.status(200).json({
      id: updatedLead._id,
      name: updatedLead.name,
      source: updatedLead.source,
      salesAgent: {
        id: updatedLead.salesAgent._id,
        name: updatedLead.salesAgent.name,
      },
      status: updatedLead.status,
      tags: updatedLead.tags,
      timeToClose: updatedLead.timeToClose,
      priority: updatedLead.priority,
      updatedAt: updatedLead.updatedAt,
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
