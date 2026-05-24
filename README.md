# Resume Builder & Score Checker

A premium, modern full-stack web application designed to help users score their resumes against ATS (Applicant Tracking Systems) standards and seamlessly build modern resumes.

## Features Built
- **Glassmorphism UI**: High-end modern UI built with React, TailwindCSS, and Lucide Icons.
- **ATS Resume Scoring Engine**: Analyzes PDFs and DOCX files for keywords, formatting, missing sections, and word count.
- **Dynamic Suggestions**: Visually highlights skills to add or formatting warnings.
- **Live Form Builder**: Edit your resume on the fly and see a live preview.
- **Authentication**: JWT-based login and registration.
- **Tiered Usage & Limits**:
  - Unauthenticated guests can analyze exactly ONE resume (tracked by IP address).
  - Authenticated users get varying limits based on Mock Subscription tiers.
- **Future Ready**: Code structurally anticipates straightforward insertion of OpenAI/GPT hooks.

## Project Structure
This repository contains two independently manageable services:
- `/frontend` - React + Vite application
- `/backend` - FastAPI Python Server using SQLite architecture

## Setup Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the development server (runs by default on `http://127.0.0.1:8000`):
   ```bash
   uvicorn app.main:app --reload
   ```
   *Note: Database tables will be generated automatically via SQLAlchemy on standard SQLite setup.*

### 2. Frontend Setup
1. Open a *new* terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install NodeJS dependencies (ensure you have NodeJS v18+ installed):
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the localhost url provided by Vite (usually `http://localhost:5173`).

### 3. Usage & Testing
- Go to the homepage and click **Score My Resume**.
- Upload any sample PDF or DOCX file (guest users get 1 free try).
- If you're blocked due to limits, go to `/register` and create an account, then `/login`.
- Try out the **Builder** page for real-time live preview of resume edits.

## Architecture Highlights
- Uses **PyMuPDF** (`fitz`) and `python-docx` for reliable textual extraction on the backend.
- Uses **SQLAlchemy ORM** to manage data interactions cleanly without inline SQL.
- Adheres to standard REST principles with **FastAPI**.
- Styled explicitly with **TailwindCSS**, utilizing a dark grid / glassmorphism scheme for an ultra-premium look.
=======
# Resume Analyser

A full-stack Agentic AI application that analyzes resumes against job descriptions using LangGraph and the Gemini API.

## Architecture

```
Frontend (Next.js 15)  ←→  Backend (FastAPI + LangGraph + Gemini)
```

## Quick Start

### 1. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Add your Gemini API key to `backend/.env`:
```
GEMINI_API_KEY=your_key_here
```

Start the backend:
```bash
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## LangGraph Pipeline

```
START → parser_node → scoring_node → critique_node → finalizer_node → END
```

| Node | Purpose |
|------|---------|
| `parser_node` | Extracts structured data (name, skills, experience, education) |
| `scoring_node` | Scores resume vs JD on 5 axes (ATS, keywords, experience, format, overall fit) |
| `critique_node` | Identifies semantic gaps, AI-generated phrasing, weak verbs, missing quantification |
| `finalizer_node` | Compiles executive summary, grade (A-F), hire likelihood |

## Features

- 🤖 Real-time LangGraph node visualization with SSE streaming
- 📄 PDF or text resume upload
- 📊 Radar chart + score bars for 5 evaluation dimensions
- 🔍 Actionable critique with severity ratings
- 🔑 Keyword match/miss analysis
- 📝 Full history in sidebar
>>>>>>> origin/feature/resume-analyser
