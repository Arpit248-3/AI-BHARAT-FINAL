import sqlite3
import re
from datetime import datetime

def init_db():
    conn = sqlite3.connect('signalrx.db')
    c = conn.cursor()
    # Stores raw text and metadata
    c.execute('''CREATE TABLE IF NOT EXISTS intake_vault 
                 (id INTEGER PRIMARY KEY, raw_text TEXT, platform TEXT, created_at TIMESTAMP, drug_keyword TEXT, status TEXT)''')
                 
    # UPDATED: Added columns for Explainability, Traceability, and Confidence
    c.execute('''CREATE TABLE IF NOT EXISTS intelligence_vault 
                 (id INTEGER PRIMARY KEY, intake_id INTEGER, sentiment TEXT, drug TEXT, event TEXT, causality TEXT,
                  confidence TEXT, reasoning TEXT, pubmed_link TEXT)''')
    conn.commit()
    conn.close()

def save_intake(text, platform, drug):
    conn = sqlite3.connect('signalrx.db')
    c = conn.cursor()
    c.execute("INSERT INTO intake_vault (raw_text, platform, created_at, drug_keyword, status) VALUES (?, ?, ?, ?, ?)",
              (text, platform, datetime.now(), drug, 'pending'))
    conn.commit()
    conn.close()

def get_pending_cases():
    conn = sqlite3.connect('signalrx.db')
    c = conn.cursor()
    c.execute("SELECT id, raw_text FROM intake_vault WHERE status = 'pending'")
    results = c.fetchall()
    conn.close()
    return results

def save_intelligence(intake_id, result):
    """
    Saves the AI results, prioritizing MedDRA standardization and 
    capturing the Doctor Agent's explainability data safely.
    """
    conn = sqlite3.connect('signalrx.db')
    c = conn.cursor()
    
    # Helper to DESTROY nested dictionaries and force text
    def _flatten(val):
        if isinstance(val, dict):
            # If AI nested it, grab the first value inside
            for k, v in val.items():
                if isinstance(v, str): return v
            return str(val)
        if isinstance(val, list) and len(val) > 0:
            return str(val[0])
        return str(val) if val is not None else "Unknown"

    # 1. Safely handle the AI output
    analysis = result.get('extracted_data', {})
    if isinstance(analysis, str):
        try:
            import json
            analysis = json.loads(analysis)
        except:
            analysis = {}

    analysis_full_text = str(result).lower()
    raw_text_lower = str(result.get('raw_text', '')).lower()

    # --- DRUG RECOVERY ---
    drug = _flatten(analysis.get('suspect_drug') or analysis.get('drug'))
    if drug == "Unknown":
        if "lisinopril" in analysis_full_text or "lisinopril" in raw_text_lower:
            drug = "Lisinopril"
        elif "metformin" in analysis_full_text or "metformin" in raw_text_lower:
            drug = "Metformin"

    # --- EVENT RECOVERY ---
    event = _flatten(analysis.get('meddra_term') or analysis.get('adverse_event') or analysis.get('event'))
    if event == "Unknown":
        if "swelling" in analysis_full_text:
            event = "Angioedema"
        elif "nausea" in analysis_full_text:
            event = "Nausea"
        elif "dizzy" in analysis_full_text:
            event = "Dizziness"

    # --- DOCTOR VERDICT EXTRACTION ---
    doctor_data = result.get('doctor_verdict', {})
    if isinstance(doctor_data, str):
        try:
            import json
            doctor_data = json.loads(doctor_data)
        except:
            doctor_data = {}

    causality = _flatten(doctor_data.get('causality_score') or analysis.get('causality_score') or "Pending")
    confidence = _flatten(doctor_data.get('confidence_score') or "Unknown")
    reasoning = _flatten(doctor_data.get('reasoning') or "AI assessment pending.")
    pubmed_link = _flatten(doctor_data.get('pubmed_search_link') or "N/A")
    sentiment = _flatten(analysis.get('sentiment') or "Negative")

    print(f"\n✅ DATA SAVED TO VAULT")
    print(f"   💊 Drug/Event: {drug} -> {event}")
    print(f"   🧠 Reasoning: {reasoning}")
    print(f"   🔗 Traceability: {pubmed_link}\n")

    c.execute("""INSERT INTO intelligence_vault 
                 (intake_id, sentiment, drug, event, causality, confidence, reasoning, pubmed_link) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
              (intake_id, sentiment, drug, event, causality, confidence, reasoning, pubmed_link))
    conn.commit()
    conn.close()
    
def update_status(intake_id, status):
    conn = sqlite3.connect('signalrx.db')
    c = conn.cursor()
    c.execute("UPDATE intake_vault SET status = ? WHERE id = ?", (status, intake_id))
    conn.commit()
    conn.close()