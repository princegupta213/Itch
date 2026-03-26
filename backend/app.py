from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn
from pathlib import Path

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI(title="Fix My Itch AI", description="AI-powered problem-solving platform", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

problems = []
solutions = []
static_dir = Path(__file__).resolve().parent / "static"
index_path = static_dir / "index.html"


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "Fix My Itch AI", "timestamp": datetime.now().isoformat()}


@app.get("/")
async def root():
    # If frontend is bundled into the container, serve it at `/`.
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"message": "Welcome to Fix My Itch AI", "version": "1.0.0", "docs": "/docs"}


@app.post("/api/itches/")
async def create_itch(title: str, description: str, category: str = "general"):
    itch = {
        "id": len(problems) + 1,
        "title": title,
        "description": description,
        "category": category,
        "status": "open",
        "votes": 0,
        "created_at": datetime.now().isoformat(),
    }
    problems.append(itch)
    return itch


@app.get("/api/itches/")
async def list_itches(skip: int = 0, limit: int = 20):
    return {"total": len(problems), "items": problems[skip : skip + limit]}


@app.get("/api/itches/{itch_id}")
async def get_itch(itch_id: int):
    for itch in problems:
        if itch["id"] == itch_id:
            return itch
    raise HTTPException(status_code=404, detail="Problem not found")


@app.post("/api/ai/classify")
async def classify(text: str):
    categories = {"bus": "transportation", "sick": "health", "money": "finance", "learn": "education"}
    detected = "general"
    for keyword, category in categories.items():
        if keyword.lower() in text.lower():
            detected = category
            break
    return {"text": text, "category": detected, "confidence": 0.85}


@app.post("/api/ai/generate-solution")
async def generate_solution(title: str, description: str):
    solution = {
        "title": f"Solution for {title}",
        "steps": ["Identify cause", "Plan", "Act", "Monitor"],
        "effort": "medium",
    }
    solutions.append(solution)
    return solution


@app.get("/metrics")
async def metrics():
    return {"total_problems": len(problems), "total_solutions": len(solutions)}


if static_dir.exists():
    # Serve the built SPA assets (js/css) from `backend/static`.
    # API routes are defined before this mount, so `/api/...` continues to work.
    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="frontend")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
