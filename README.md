# AI Code Reviewer 

A full-stack AI-powered code review platform built with **FastAPI** + **React 18** + **Google Gemini API**.

## Features
- ✅ 7 programming languages (Python, JavaScript, TypeScript, Java, C++, Go, Rust)
- ✅ 5 issue categories (Bugs, Security, Performance, Style, Suggestions)
- ✅ 3-level severity ratings (High / Medium / Low)
- ✅ 0–100 quality score with animated ring
- ✅ AI-generated improved code
- ✅ 2 REST API endpoints

---

## Project Structure

```
ai-code-reviewer/
├── backend/
│   ├── main.py              ← FastAPI app
│   ├── requirements.txt     ← Python dependencies
│   ├── .env.example         ← Copy to .env and add your key
│   └── .env                 ← Your actual API key (gitignored)
│
└── frontend/
    ├── src/
    │   ├── App.jsx          ← Main React component
    │   ├── App.css          ← Styles
    │   └── main.jsx         ← Entry point
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Setup Instructions

### Step 1 — Get Your Gemini API Key
1. Go to [https://aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Click **"Get API Key"** → **"Create API key"**
4. Copy the key

### Step 2 — Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Open .env and paste your API key:
# GEMINI_API_KEY=your_actual_key_here

# Run the server
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### Step 3 — Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:3000

---

## API Endpoints

### POST /api/review
Reviews code and returns structured feedback.

**Request Body:**
```json
{
  "code": "def add(a, b): return a+b",
  "language": "python",
  "focus": "all"
}
```

**Response:**
```json
{
  "score": 72,
  "summary": "Code is functional but lacks type hints and docstrings.",
  "issues": [
    {
      "category": "style",
      "severity": "low",
      "title": "Missing type hints",
      "description": "Function parameters have no type annotations.",
      "fix": "def add(a: int, b: int) -> int: return a + b"
    }
  ],
  "improved_code": "def add(a: int, b: int) -> int:\n    ..."
}
```

### POST /api/improve
Returns only the improved version of the code.

---

## Tech Stack
- **Backend:** FastAPI, Python, httpx, python-dotenv
- **Frontend:** React 18, Vite, CSS
- **AI:** Google Gemini 2.0 Flash API
