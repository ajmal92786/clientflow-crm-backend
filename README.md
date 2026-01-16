# ClientFlow CRM ⚡

ClientFlow CRM is a **full‑stack Customer Relationship Management (CRM) backend application** designed to manage sales leads, sales agents, lead comments, and analytical reports.

This backend powers the ClientFlow CRM frontend by providing **clean REST APIs**, strong validations, and structured business logic for real‑world CRM workflows.

---

## 🌐 Live API

🔗 [Backend Base URL](https://clientflow-crm-backend.vercel.app/)

---

## 🚀 Features

### 🧩 Lead Management

- Create, update, fetch, and delete leads
- Assign leads to sales agents
- Track lead status, priority, tags, and time to close
- Automatically manage lead closure timestamps

### 👤 Sales Agent Management

- Create and delete sales agents
- Fetch all sales agents
- Prevent duplicate agents by email

### 💬 Lead Comments

- Add comments to leads
- Fetch all comments for a lead
- Associate comments with sales agents

### 📊 Reports & Analytics

- Leads closed in the last 7 days
- Total leads in pipeline vs closed leads
- Leads closed by each sales agent

### 🛡️ Validation & Reliability

- Centralized request validations
- Proper error handling with meaningful messages
- CORS enabled for secure frontend access

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- CORS

---

## 📁 Project Structure

```
clientflow-crm-backend/
├── db/
│   └── db.connect.js        # MongoDB connection logic
├── models/
│   ├── lead.model.js        # Lead schema
│   ├── salesAgent.model.js # Sales agent schema
│   └── comment.model.js    # Lead comments schema
├── validations/
│   ├── lead.validation.js
│   ├── agent.validation.js
│   └── comment.validation.js
├── index.js                 # Express server entry point
├── package.json
├── package-lock.json
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
```

---

## 💻 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/ajmalbly27/clientflow-crm-backend.git
cd clientflow-crm-backend
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Start the Server

```bash
npm start
```

Server runs on:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔗 API Endpoints

### 🧩 Leads

| Method | Endpoint   | Description                         |
| ------ | ---------- | ----------------------------------- |
| POST   | /leads     | Create a new lead                   |
| GET    | /leads     | Fetch all leads (filters supported) |
| GET    | /leads/:id | Fetch lead by ID                    |
| PUT    | /leads/:id | Update lead                         |
| DELETE | /leads/:id | Delete lead                         |

---

### 👤 Sales Agents

| Method | Endpoint    | Description            |
| ------ | ----------- | ---------------------- |
| POST   | /agents     | Create a sales agent   |
| GET    | /agents     | Fetch all sales agents |
| DELETE | /agents/:id | Delete a sales agent   |

---

### 💬 Comments

| Method | Endpoint            | Description               |
| ------ | ------------------- | ------------------------- |
| POST   | /leads/:id/comments | Add comment to a lead     |
| GET    | /leads/:id/comments | Fetch comments for a lead |

---

### 📊 Reports

| Method | Endpoint                | Description                 |
| ------ | ----------------------- | --------------------------- |
| GET    | /report/last-week       | Leads closed in last 7 days |
| GET    | /report/pipeline        | Pipeline vs closed leads    |
| GET    | /report/closed-by-agent | Leads closed per agent      |

---

## API Reference

### 🧲 Leads APIs

#### 🔹 Create a Lead

`POST /leads`

**Request**

```http
POST /leads
Content-Type: application/json
```

```json
{
  "name": "Acme Corp",
  "source": "Website",
  "salesAgent": "65ab12f3e1",
  "status": "New",
  "tags": ["enterprise", "hot"],
  "timeToClose": 14,
  "priority": "High"
}
```

**Success Response (201)**

```json
{
  "id": "65bc91aa12",
  "name": "Acme Corp",
  "source": "Website",
  "salesAgent": {
    "id": "65ab12f3e1",
    "name": "Rahul Sharma"
  },
  "status": "New",
  "tags": ["enterprise", "hot"],
  "timeToClose": 14,
  "priority": "High",
  "createdAt": "2026-01-15T10:20:30.000Z",
  "updatedAt": "2026-01-15T10:20:30.000Z"
}
```

---

#### 🔹 Get All Leads

`GET /leads`

**Query Params (optional)**
`salesAgent`, `status`, `source`, `priority`, `tags`, `sortBy=timeToClose`, `order=asc|desc`

**Request**

```http
GET /leads?status=New&priority=High
```

**Success Response (200)**

```json
[
  {
    "id": "65bc91aa12",
    "name": "Acme Corp",
    "source": "Website",
    "salesAgent": {
      "id": "65ab12f3e1",
      "name": "Rahul Sharma"
    },
    "status": "New",
    "tags": ["enterprise"],
    "timeToClose": 14,
    "priority": "High",
    "createdAt": "2026-01-15T10:20:30.000Z"
  }
]
```

---

####🔹 Get Lead by ID

`GET /leads/:id`

**Request**

```http
GET /leads/65bc91aa12
```

**Success Response (200)**

```json
{
  "id": "65bc91aa12",
  "name": "Acme Corp",
  "source": "Website",
  "salesAgent": {
    "id": "65ab12f3e1",
    "name": "Rahul Sharma"
  },
  "status": "Closed",
  "tags": ["enterprise"],
  "timeToClose": 14,
  "priority": "High",
  "createdAt": "2026-01-10T08:00:00.000Z",
  "updatedAt": "2026-01-15T10:20:30.000Z",
  "closedAt": "2026-01-15T10:20:30.000Z"
}
```

---

#### 🔹 Update Lead

`PUT /leads/:id`

**Request**

```http
PUT /leads/65bc91aa12
Content-Type: application/json
```

```json
{
  "status": "Closed",
  "salesAgent": "65ab12f3e1",
  "priority": "Medium"
}
```

**Success Response (200)**

```json
{
  "id": "65bc91aa12",
  "name": "Acme Corp",
  "source": "Website",
  "salesAgent": {
    "id": "65ab12f3e1",
    "name": "Rahul Sharma"
  },
  "status": "Closed",
  "tags": ["enterprise"],
  "timeToClose": 14,
  "priority": "Medium",
  "createdAt": "2026-01-10T08:00:00.000Z",
  "updatedAt": "2026-01-15T10:20:30.000Z",
  "closedAt": "2026-01-15T10:20:30.000Z"
}
```

---

#### 🔹 Delete Lead

`DELETE /leads/:id`

**Request**

```http
DELETE /leads/65bc91aa12
```

**Response (200)**

```json
{
  "message": "Lead deleted successfully."
}
```

---

### 🧑‍💼 Sales Agents APIs

#### 🔹 Create Sales Agent

`POST /agents`

**Request**

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@clientflow.com"
}
```

**Response (201)**

```json
{
  "id": "65ab12f3e1",
  "name": "Rahul Sharma",
  "email": "rahul@clientflow.com",
  "createdAt": "2026-01-12T09:30:00.000Z"
}
```

---

#### 🔹 Get All Sales Agents

`GET /agents`

```json
[
  {
    "id": "65ab12f3e1",
    "name": "Rahul Sharma",
    "email": "rahul@clientflow.com"
  }
]
```

---

### 💬 Comments APIs

#### 🔹 Add Comment to Lead

`POST /leads/:id/comments`

**Request**

```json
{
  "commentText": "Follow-up scheduled for next week",
  "salesAgent": "65ab12f3e1"
}
```

**Response (201)**

```json
{
  "id": "75cd91bb21",
  "commentText": "Follow-up scheduled for next week",
  "author": "Rahul Sharma",
  "createdAt": "2026-01-15T12:10:00.000Z"
}
```

---

#### 🔹 Get Lead Comments

`GET /leads/:id/comments`

```json
[
  {
    "id": "75cd91bb21",
    "commentText": "Follow-up scheduled for next week",
    "author": "Rahul Sharma",
    "createdAt": "2026-01-15T12:10:00.000Z"
  }
]
```

---

### 📊 Reports APIs

#### 🔹 Leads Closed Last Week

`GET /report/last-week`

```json
[
  {
    "id": "65bc91aa12",
    "name": "Acme Corp",
    "salesAgent": "Rahul Sharma",
    "closedAt": "2026-01-14T10:00:00.000Z"
  }
]
```

---

#### 🔹 Pipeline Summary

`GET /report/pipeline`

```json
{
  "totalLeadsInPipeline": 18,
  "totalClosedLeads": 7
}
```

---

#### 🔹 Closed Leads by Agent

`GET /report/closed-by-agent`

```json
[
  {
    "salesAgentId": "65ab12f3e1",
    "salesAgentName": "Rahul Sharma",
    "closedLeadsCount": 5
  }
]
```

---

## 🔄 Frontend Integration

This backend serves the **ClientFlow CRM frontend**:

🔗 Frontend URL: [https://clientflow-crm-frontend.vercel.app](https://clientflow-crm-frontend.vercel.app)

The frontend consumes these APIs to display dashboards, lead lists, reports, and comments.

---

## 📈 Key Learnings

- Designing RESTful APIs for CRM systems
- Managing relational data using MongoDB references
- Writing reusable validation logic
- Implementing analytics endpoints
- Structuring scalable Express applications

---

## 📬 Contact

For bugs or feature requests:

📧 **[ajmalbly27@gmail.com](mailto:ajmalbly27@gmail.com)**
