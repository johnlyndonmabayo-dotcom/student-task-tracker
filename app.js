const $ = (id) => document.getElementById(id);
let tasks = [];
const backdrop = $("modalBackdrop");
const form = $("taskForm");

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}
function notify(message, error = false) {
  $("notice").textContent = message;
  $("notice").style.color = error ? "#c45d59" : "#4778e6";
}
function updateStats() {
  $("totalTasks").textContent = tasks.length;
  $("pendingTasks").textContent = tasks.filter(t => t.status === "Pending").length;
  $("progressTasks").textContent = tasks.filter(t => t.status === "In Progress").length;
  $("completedTasks").textContent = tasks.filter(t => t.status === "Completed").length;
}
function formatDate(value) {
  if (!value) return "No due date";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "No due date" :
    date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function renderTasks() {
  const query = $("searchInput").value.trim().toLowerCase();
  const status = $("statusFilter").value;
  const priority = $("priorityFilter").value;
  const filtered = tasks.filter(task => {
    const matchesText = [task.title, task.description].some(v => String(v || "").toLowerCase().includes(query));
    return matchesText && (status === "All" || task.status === status) &&
      (priority === "All" || task.priority === priority);
  });
  $("taskList").innerHTML = filtered.length ? filtered.map(task => {
    const priorityClass = String(task.priority).toLowerCase();
    const statusClass = task.status === "Completed" ? "completed" : task.status === "In Progress" ? "progress" : "";
    return `<article class="task-card">
      <div>
        <div class="task-title-row"><span class="task-title">${escapeHtml(task.title)}</span>
          <span class="pill ${priorityClass}">${escapeHtml(task.priority)} priority</span>
          <span class="pill ${statusClass}">${escapeHtml(task.status)}</span>
        </div>
        ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ""}
        <div class="task-meta"><span>▣ ${escapeHtml(formatDate(task.due_date))}</span><span>Created ${escapeHtml(formatDate(task.created_at))}</span></div>
      </div>
      <div class="task-actions"><button class="action-btn" data-edit="${task.id}">Edit</button><button class="action-btn delete" data-delete="${task.id}">Delete</button></div>
    </article>`;
  }).join("") : `<div class="empty-state">${query || status !== "All" || priority !== "All" ? "No tasks match your filters." : "You have no tasks yet. Add your first task to get started."}</div>`;

  $("taskList").querySelectorAll("[data-edit]").forEach(btn =>
    btn.addEventListener("click", () => editTask(btn.dataset.edit))
  );
  $("taskList").querySelectorAll("[data-delete]").forEach(btn =>
    btn.addEventListener("click", () => deleteTask(btn.dataset.delete))
  );
  updateStats();
}
async function loadTasks() {
  try {
    const response = await fetch("/api/tasks");
    if (!response.ok) throw new Error("Unable to load tasks from the server.");
    tasks = await response.json();
    renderTasks();
  } catch (error) {
    $("taskList").innerHTML = `<div class="empty-state">Could not load tasks. Check the database connection and refresh.</div>`;
    notify(error.message, true);
  }
}
function openModal(task = null) {
  form.reset();
  $("taskDbId").value = task ? task.id : "";
  $("modalTitle").textContent = task ? "Edit task" : "Create a task";
  $("saveBtn").textContent = task ? "Update task" : "Save task";
  if (task) {
    $("taskTitle").value = task.title || "";
    $("taskDescription").value = task.description || "";
    $("dueDate").value = task.due_date ? String(task.due_date).slice(0, 10) : "";
    $("priority").value = task.priority || "Medium";
    $("taskStatus").value = task.status || "Pending";
  }
  backdrop.hidden = false;
  $("taskTitle").focus();
}
function closeModal() { backdrop.hidden = true; }
function editTask(id) {
  const task = tasks.find(item => String(item.id) === String(id));
  if (task) openModal(task);
}
async function deleteTask(id) {
  const task = tasks.find(item => String(item.id) === String(id));
  if (!task || !confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
  try {
    const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not delete task.");
    notify(data.message);
    await loadTasks();
  } catch (error) { notify(error.message, true); }
}
form.addEventListener("submit", async event => {
  event.preventDefault();
  const id = $("taskDbId").value;
  const payload = {
    title: $("taskTitle").value.trim(),
    description: $("taskDescription").value.trim(),
    due_date: $("dueDate").value || null,
    priority: $("priority").value,
    status: $("taskStatus").value
  };
  if (!payload.title) return notify("Please enter a task title.", true);
  const button = $("saveBtn");
  button.disabled = true;
  button.textContent = "Saving…";
  try {
    const response = await fetch(id ? `/api/tasks/${id}` : "/api/tasks", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not save task.");
    closeModal();
    notify(id ? "Task updated successfully." : "Task created successfully.");
    await loadTasks();
  } catch (error) { notify(error.message, true); }
  finally {
    button.disabled = false;
    button.textContent = id ? "Update task" : "Save task";
  }
});
$("addTaskBtn").addEventListener("click", () => openModal());
$("closeModal").addEventListener("click", closeModal);
$("cancelBtn").addEventListener("click", closeModal);
$("searchInput").addEventListener("input", renderTasks);
$("statusFilter").addEventListener("change", renderTasks);
$("priorityFilter").addEventListener("change", renderTasks);
backdrop.addEventListener("click", event => { if (event.target === backdrop) closeModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });
loadTasks();