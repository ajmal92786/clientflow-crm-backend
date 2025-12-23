const express = require("express");
const { initializeDatabase } = require("./db/db.connect");

const app = express();
initializeDatabase();

app.use(express.json());

app.get("/", (req, res) => {
  res.send({ status: "ok", message: "Clientflow CRM backend running." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
