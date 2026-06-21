from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import json

app = FastAPI(title="AI Code Reviewer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_URL = "https://api.groq.com/openai/v1/chat/completions"
API_KEY = "your_groq_api_key_here"
MODEL = "llama-3.3-70b-versatile"

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

class ReviewRequest(BaseModel):
    code: str
    language: str
    focus: str = "all"

@app.get("/")
async def health_check():
    return {"status": "ok", "message": "AI Code Reviewer API is running"}

@app.post("/api/review")
async def review_code(request: ReviewRequest):
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")

    focus_note = f"Focus especially on: {request.focus} issues." if request.focus != "all" else ""

    prompt = f"""You are an expert code reviewer. Review the following {request.language} code.
{focus_note}
Respond ONLY with valid JSON — no markdown fences, no explanation outside the JSON.

JSON schema:
{{
  "score": <integer 0-100>,
  "summary": "<one sentence overall assessment>",
  "issues": [
    {{
      "category": "<bug|security|performance|style|suggestion>",
      "severity": "<high|medium|low>",
      "title": "<short issue title>",
      "description": "<clear explanation of the problem and why it matters>",
      "fix": "<corrected code snippet, or empty string if not applicable>"
    }}
  ],
  "improved_code": "<complete improved version of the code>"
}}

Code to review:
```{request.language}
{request.code}
```"""

    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 2048,
        "temperature": 0.3
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(API_URL, json=payload, headers=HEADERS)

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail=f"API error {response.status_code}: {response.text}")

    data = response.json()

    try:
        raw_text = data["choices"][0]["message"]["content"]
        clean_text = raw_text.replace("```json", "").replace("```", "").strip()
        review_result = json.loads(clean_text)
    except (KeyError, json.JSONDecodeError) as e:
        raise HTTPException(status_code=502, detail=f"Failed to parse response: {str(e)}")

    return review_result


@app.post("/api/improve")
async def improve_code(request: ReviewRequest):
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")

    prompt = f"""You are an expert {request.language} developer.
Rewrite the following code with all improvements — better structure, security, performance, and clean style.
Return ONLY the improved code, no explanation.

Original code:
```{request.language}
{request.code}
```"""

    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 2048,
        "temperature": 0.2
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(API_URL, json=payload, headers=HEADERS)

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail=f"API error: {response.text}")

    data = response.json()
    improved = data["choices"][0]["message"]["content"]
    clean = improved.replace(f"```{request.language}", "").replace("```", "").strip()

    return {"improved_code": clean}
