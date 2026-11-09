const express = require("express");
const path = require("path");
const { pool, initializeDatabase } = require("./database/database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

// READ: return all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks ORDER BY created_at DESC, id DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET /api/tasks:", error);
    res.status(500).json({ error: "Unable to load tasks." });
  }
});

// CREATE: add a task
app.post("/api/tasks", async (req, res) => {
  const { title, description = "", due_date = null, priority = "Medium", status = "Pending" } = req.body;

  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "Task title is required." });
  }
  if (!["Low", "Medium", "High"].includes(priority)) {
    return res.status(400).json({ error: "Invalid priority." });
  }
  if (!["Pending", "In Progress", "Completed"].includes(status)) {
    return res.status(400).json({ error: "Invalid task status." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, due_date, priority, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [String(title).trim(), String(description).trim(), due_date || null, priority, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("POST /api/tasks:", error);
    res.status(500).json({ error: "Unable to create task." });
  }
});

// UPDATE: edit a task
app.put("/api/tasks/:id", async (req, res) => {
  const { title, description = "", due_date = null, priority, status } = req.body;

  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "Task title is required." });
  }
  if (!["Low", "Medium", "High"].includes(priority)) {
    return res.status(400).json({ error: "Invalid priority." });
  }
  if (!["Pending", "In Progress", "Completed"].includes(status)) {
    return res.status(400).json({ error: "Invalid task status." });
  }

  try {
    const result = await pool.query(
      `UPDATE tasks
       SET title=$1, description=$2, due_date=$3, priority=$4, status=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [String(title).trim(), String(description).trim(), due_date || null, priority, status, req.params.id]
    );
    if (!result.rowCount) return res.status(404).json({ error: "Task not found." });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("PUT /api/tasks/:id:", error);
    res.status(500).json({ error: "Unable to update task." });
  }
});

// DELETE: remove a task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id=$1 RETURNING id",
      [req.params.id]
    );
    if (!result.rowCount) return res.status(404).json({ error: "Task not found." });
    res.json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/tasks/:id:", error);
    res.status(500).json({ error: "Unable to delete task." });
  }
});

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Student Task Tracker running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Could not start Student Task Tracker:", error);
    process.exit(1);
  }
}

startServer();