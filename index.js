const express = require("express");
const cors = require("cors");
const { initializeDatabase } = require("./db/db.connect");
const LeadModel = require("./models/lead.model");
const SalesAgentModel = require("./models/salesAgent.model");
const CommitModel = require("./models/comment.model");
const {
  validateCreateLead,
  validateLeadQuery,
  validateUpdateLead,
  validateDeleteLead,
} = require("./validations/lead.validation");
const { validateCreateAgent } = require("./validations/agent.validation");
const {
  validateCreateComment,
  validateGetComments,
} = require("./validations/comment.validation");

const app = express();
initializeDatabase();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173/",
    credentials: true,
  })
);

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

    // Check Lead existence
    const existingLead = await LeadModel.findById(id);
    if (!existingLead) {
      return res.status(404).json({
        error: `Lead with ID '${id}' not found.`,
      });
    }

    // Check sales agent existence
    const agent = await SalesAgentModel.findById(salesAgent);
    if (!agent) {
      return res.status(404).json({
        error: `Sales agent with ID '${salesAgent}' not found.`,
      });
    }

    // Handle closedAt logic
    let closedAt = existingLead.closedAt;
    // If moving to Closed for the first time
    if (status === "Closed" && !closedAt) {
      closedAt = new Date();
    }
    // If the lead is no longer Closed (reopened)
    if (status !== "Closed") {
      closedAt = null;
    }

    const updatedLead = await updateLeadById(id, {
      name,
      source,
      salesAgent,
      status,
      tags: Array.isArray(tags) ? tags : [],
      timeToClose,
      priority,
      closedAt,
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

async function deleteLeadById(id) {
  return await LeadModel.findByIdAndDelete(id);
}

// Deletes a specific lead by its ID.
app.delete("/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // validations
    const validationError = validateDeleteLead(req.params);
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

    await deleteLeadById(id);

    return res.status(200).json({ message: "Lead deleted successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "Internal Server Error" });
  }
});

async function createNewSalesAgent(name, email) {
  return await SalesAgentModel.create({ name, email });
}

// Create a New Sales Agent
app.post("/agents", async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validations
    const validationError = validateCreateAgent(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const existingAgentWithEmail = await SalesAgentModel.findOne({ email });
    if (existingAgentWithEmail) {
      return res.status(409).json({
        error: `Sales agent with email '${email}' already exists.`,
      });
    }

    const agent = await createNewSalesAgent(name, email);

    return res.status(201).json({
      id: agent._id,
      name: agent.name,
      email: agent.email,
      createdAt: agent.createdAt,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "Internal Server Error" });
  }
});

async function getAllAgents() {
  return await SalesAgentModel.find();
}

// Fetches all sales agents.
app.get("/agents", async (req, res) => {
  try {
    const agents = await getAllAgents();

    const formattedAgents = agents.map((agent) => ({
      id: agent._id,
      name: agent.name,
      email: agent.email,
    }));

    return res.status(200).json(formattedAgents);
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "Internal Server Error" });
  }
});

async function createNewCommit(commitData) {
  return (await CommitModel.create(commitData)).populate("author", "name");
}

// Adds a new comment to a specific lead.
app.post("/leads/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;
    const { commentText } = req.body;

    // Validations
    const validationError = validateCreateComment(id, commentText);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Check Lead existance
    const existingLead = await LeadModel.findById(id);
    if (!existingLead) {
      return res.status(404).json({ error: `Lead with ID '${id}' not found.` });
    }

    // Create commit
    const commit = await createNewCommit({
      lead: id,
      author: existingLead.salesAgent,
      commentText,
    });

    return res.status(201).json({
      id: commit._id,
      commentText: commit.commentText,
      author: commit.author.name,
      createdAt: commit.createdAt,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "Internal Server Error" });
  }
});

async function getCommentsByLeadID(leadId) {
  return await CommitModel.find({ lead: leadId }).populate("author", "name");
}

// Get All Comments for a Lead
app.get("/leads/:id/comments", async (req, res) => {
  try {
    const leadId = req.params.id;

    // Validations
    const validationError = validateGetComments(leadId);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const comments = await getCommentsByLeadID(leadId);

    const formattedComments = comments.map((comment) => ({
      id: comment._id,
      commentText: comment.commentText,
      author: comment.author.name,
      createdAt: comment.createdAt,
    }));

    return res.status(200).json(formattedComments);
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "Internal Server Error" });
  }
});

async function getLeadsClosedLastWeek() {
  const savenDaysAgo = new Date();
  savenDaysAgo.setDate(savenDaysAgo.getDate() - 7);

  return await LeadModel.find({
    status: "Closed",
    updatedAt: { $gte: savenDaysAgo },
  }).populate("salesAgent", "name");
}

// Get Leads Closed Last Week
app.get("/report/last-week", async (req, res) => {
  try {
    const closedLeads = await getLeadsClosedLastWeek();

    const formattedClosedLeads = closedLeads.map((lead) => ({
      id: lead._id,
      name: lead.name,
      salesAgent: lead.salesAgent.name,
      closedAt: lead.closedAt,
    }));

    return res.status(200).json(formattedClosedLeads);
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "Internal Server Error" });
  }
});

async function getTotalLeadsInPipeline() {
  return await LeadModel.countDocuments({ status: { $ne: "Closed" } });
}

// Get Total Leads in Pipeline
app.get("/report/pipeline", async (req, res) => {
  try {
    const totalLeadsInPipeline = await getTotalLeadsInPipeline();

    return res.status(200).json({ totalLeadsInPipeline });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "Internal Server Error" });
  }
});

async function getClosedLeadsByAgent() {
  const leads = await LeadModel.find({ status: "Closed" }).populate(
    "salesAgent",
    "name"
  );

  const result = {};

  leads.forEach((lead) => {
    const agentId = lead.salesAgent._id;
    const agentName = lead.salesAgent.name;

    if (!result[agentId]) {
      result[agentId] = {
        salesAgentId: agentId,
        salesAgentName: agentName,
        closedLeadsCount: 0,
      };
    }

    result[agentId].closedLeadsCount++;
  });

  return Object.values(result);
}

// Fetch the number of leads closed by each sales agent.
app.get("/report/closed-by-agent", async (req, res) => {
  try {
    const closedLeadsByAgent = await getClosedLeadsByAgent();

    return res.status(200).json(closedLeadsByAgent);
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
