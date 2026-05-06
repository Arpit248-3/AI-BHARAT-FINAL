from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import json

# Import your custom modules
from ai_engine import ayu_scout_ai
from database import init_db, get_pending_cases, update_status, save_intelligence
from crawler import run_simulated_crawler

app = FastAPI(title="SignalRx V2 Command Center API")

# Allow your React frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---
class CaseReport(BaseModel):
    text: str

class ScoutRequest(BaseModel):
    keyword: str

# --- STARTUP EVENT ---
@app.on_event("startup")
async def startup_event():
    print("📊 Initializing SignalRx Intelligence Database...")
    init_db()

# --- ENDPOINT 1: MANUAL ANALYSIS (Ad-hoc) ---
@app.post("/api/analyze-case")
async def analyze_case(report: CaseReport):
    initial_state = {
        "raw_text": report.text,
        "clean_text": "",
        "extracted_data": {},
        "extraction_attempts": 0,
        "critic_feedback": "",
        "causality_score": "Pending",
        "requires_human": False
    }
    
    print(f"\n--- [MANUAL CASE RECEIVED] ---")
    result = ayu_scout_ai.invoke(initial_state)
    
    # Format JSON safely
    extracted_json = result.get("extracted_data", {})
    if isinstance(extracted_json, str):
        try:
            extracted_json = json.loads(extracted_json)
        except:
            extracted_json = {"error": "Failed to parse final JSON"}

    return {
        "status": "success",
        "clean_text": result["clean_text"],
        "clinical_data": extracted_json,
        "causality": result["causality_score"],
        "human_review_flag": result["requires_human"]
    }

# --- ENDPOINT 2: DEPLOY SCOUT CRAWLER (Parallel/Background) ---
@app.post("/api/run-scout")
async def trigger_scout(request: ScoutRequest, background_tasks: BackgroundTasks):
    print(f"\n📡 Deploying Scout Agent for: {request.keyword}")
    # background_tasks.add_task runs the crawler without making the UI wait
    background_tasks.add_task(run_simulated_crawler, request.keyword)
    return {"status": "Scout Agent Deployed", "drug": request.keyword}

# --- ENDPOINT 3: PROCESS THE INTAKE VAULT (Batch Analysis) ---
@app.get("/api/process-vault")
async def process_vault():
    print(f"\n📂 Processing pending signals in the Intake Vault...")
    pending = get_pending_cases()
    processed_results = []
    
    for case_id, text in pending:
        # Re-use your High-Intensity Agentic Brain
        initial_state = {
            "raw_text": text,
            "clean_text": "",
            "extracted_data": {},
            "extraction_attempts": 0,
            "critic_feedback": "",
            "causality_score": "Pending",
            "requires_human": False
        }
        
        result = ayu_scout_ai.invoke(initial_state)
        
        # Save intelligence back to the database
        save_intelligence(case_id, result)
        update_status(case_id, 'analyzed')
        processed_results.append(result.get("causality_score"))

    return {
        "status": "Batch Analysis Complete",
        "total_processed": len(processed_results),
        "signals": processed_results
    }

if __name__ == "__main__":
    import uvicorn
    # Runs the server on port 8080
    uvicorn.run("server:app", host="0.0.0.0", port=8080, reload=True)