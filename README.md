# Hairdrama Task Management App

A full-stack task management application built for the Hairdrama Tech Internship assignment. It features Google OAuth, task tracking, assignment capabilities, and Gmail email notifications.

## Architecture & Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React, TypeScript
- Custom CSS (No Tailwind)

**Backend:**
- Flask (Python)
- PyJWT for token verification
- Supabase Python Client

**Database & Services:**
- Supabase (PostgreSQL)
- Google OAuth 2.0 (via Supabase Auth)
- Gmail SMTP (for email notifications)

## Setup Instructions

### 1. Database (Supabase) Setup
1. Create a new project on Supabase.
2. Run the SQL scripts found in `backend/migrations/` in the Supabase SQL Editor in order:
   - `001_create_users.sql`
   - `002_create_tasks.sql`
   - `003_add_rls_policies.sql`
3. Go to Authentication > Providers, enable Google, and configure your Google Cloud OAuth Client ID and Secret.

### 2. Backend Setup
Navigate to the `backend` directory and set up the Python environment:
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```
Copy `.env.example` to `.env` and fill in your Supabase credentials, Gmail App Password, and Flask secret key.

Run the development server:
```bash
python run.py
```

### 3. Frontend Setup
Navigate to the `frontend` directory and install dependencies:
```bash
cd frontend
npm install
```
Copy `.env.example` to `.env.local` and fill in your Supabase URL and Anon Key.

Run the dev server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## Deployment
- The frontend is designed to be deployed on Vercel.
- The backend can be deployed on Render or Railway using the provided `Procfile`.
