# Student Task Tracker

A responsive task tracker for students. It uses Express.js, PostgreSQL, HTML, CSS, and browser JavaScript.

## Features
- Create, view, update, and delete tasks (CRUD)
- Task title and description
- Due dates
- Low, Medium, and High priorities
- Pending, In Progress, and Completed statuses
- Search tasks and filter by status or priority
- Dashboard counts for total, pending, in-progress, and completed tasks
- PostgreSQL database; the tasks table is created automatically
- Render deployment configuration included

## Run locally
1. Install Node.js 18+ and PostgreSQL.
2. Create a PostgreSQL database named `student_task_tracker`.
3. Copy `.env.example` to `.env` and set `DATABASE_URL` to your PostgreSQL connection string.
4. Install dependencies:

   ```bash
   npm install
   ```

5. Start the application:

   ```bash
   npm start
   ```

6. Visit `http://localhost:3000`.

## Deploy to Render (Blueprint)
1. Push the contents of this project to a GitHub repository.
2. Sign in to Render and choose **New + → Blueprint**.
3. Connect the GitHub repository containing this project.
4. Render reads `render.yaml` and configures the Node web service and PostgreSQL database.
5. Confirm the resources and deploy. Open the generated `onrender.com` URL after deployment.

## Deploy to Render (manual)
1. Create a PostgreSQL database in Render.
2. Copy the database's **Internal Database URL**.
3. Create a Render **Web Service** connected to this GitHub repository.
4. Set Build Command to `npm install` and Start Command to `npm start`.
5. Add an environment variable named `DATABASE_URL` and paste the Internal Database URL.
6. Deploy the service.

## Important
- Do not commit `.env` or database credentials. `.gitignore` excludes `.env`.
- This version uses PostgreSQL instead of local SQLite/sql.js, which is suitable for a hosted app when paired with a persistent hosted database.
- The app creates the `tasks` table automatically at startup. The SQL is also provided in `database/schema.sql`.
- The free-plan availability and limits of hosting/database services can change. Check Render's current plan details.
- Health endpoint: `/api/health`. Tasks API: `/api/tasks`.

## Project structure

```text
student-task-tracker/
├── database/
│   ├── database.js
│   └── schema.sql
├── public/
│   ├── app.js
│   ├── index.html
│   └── style.css
├── .env.example
├── .gitignore
├── package.json
├── render.yaml
├── README.md
└── server.js
```
