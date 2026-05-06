from typing import TypedDict, Optional, List
from pydantic import BaseModel, Field
from langchain_ollama import ChatOllama
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.output_parsers import JsonOutputParser
from langgraph.graph import StateGraph, END
import json

# --- 1. THE STATE ---
class GraphState(TypedDict):
    raw_text: str
    clean_text: str
    extracted_data: Optional[dict]
    extraction_attempts: int
    critic_feedback: str
    doctor_verdict: Optional[dict] # Updated to hold complex explainability data

# --- 2. THE SCHEMAS ---
class ClinicalData(BaseModel):
    suspect_drug: str
    concomitant_drugs: List[str]
    adverse_event: str
    meddra_term: str = Field(description="The formal MedDRA standardized medical term for the adverse event")
    time_to_onset: str

class DoctorVerdict(BaseModel):
    causality_score: str = Field(description="Certain, Probable, Possible, Unlikely, or Unassessable")
    confidence_score: str = Field(description="Percentage from 0% to 100%")
    reasoning: str = Field(description="One sentence explaining the causality decision")
    pubmed_search_link: str = Field(description="A PubMed URL to verify this drug-event relationship")

# --- 3. INITIALIZE OLLAMA MODELS ---
fast_local_llm = ChatOllama(model="phi3", temperature=0)
# We use Mistral for both Generator and Doctor now, as both need to output strict JSON
json_local_llm = ChatOllama(model="mistral", temperature=0.2, format="json") 

# --- NODE 1: The Guard (Surgical Masking) ---
def guard_node(state: GraphState):
    print("🛡️ Guard Agent: Masking PII (Protecting Medical Terms)...")
    prompt = f"""
    ROLE: Clinical Data Privacy Officer.
    TASK: Redact human names and contact details ONLY.
    STRICT RULES:
    1. Replace human names with [NAME].
    2. Replace ages or phone numbers with [REDACTED].
    3. !!! DO NOT redact medical terms like "Lisinopril" or "Rash" !!!
    
    TEXT: {state['raw_text']}
    """
    response = fast_local_llm.invoke([HumanMessage(content=prompt)])
    return {"clean_text": response.content.strip(), "extraction_attempts": 0, "critic_feedback": ""}

# --- NODE 2A: The Generator (Extraction + MedDRA) ---
def generator_node(state: GraphState):
    print(f"✍️ Generator Agent (Attempt {state['extraction_attempts'] + 1}): Extracting & Standardizing Data...")
    parser = JsonOutputParser(pydantic_object=ClinicalData)
    
    system_instr = f"""
    You are a precise clinical data extractor. 
    Convert the raw text into structured JSON. 
    CRITICAL: Map the 'adverse_event' to the closest formal 'meddra_term' (e.g., 'face swelling' -> 'Angioedema').
    
    {parser.get_format_instructions()}
    """
    
    feedback_block = ""
    if state['extraction_attempts'] > 0 and state['critic_feedback'] != "PASS":
        print("   -> 🧠 Activating Failure Memory: Forcing correction of prior mistakes...")
        feedback_block = f"""
        ### 🛑 STOP! PREVIOUS ATTEMPT FAILED QA AUDIT 🛑
        THE AUDITOR'S CRITICISM: "{state['critic_feedback']}"
        
        INSTRUCTIONS TO FIX:
        1. Read the "Original Text" again carefully.
        2. Fix the error mentioned by the auditor. Do not ignore it.
        """

    full_prompt = f"{system_instr}\n\nOriginal Text: {state['clean_text']}\n\n{feedback_block}"
    response = json_local_llm.invoke([HumanMessage(content=full_prompt)])
    
    try:
        data = json.loads(response.content) if isinstance(response.content, str) else response.content
    except:
        data = {"suspect_drug": "Unknown", "adverse_event": "Unknown", "meddra_term": "Unknown", "error": "JSON Parse Failure"}

    return {
        "extracted_data": data, 
        "extraction_attempts": state['extraction_attempts'] + 1
    }

# --- NODE 2B: The Critic (Verification) ---
def critic_node(state: GraphState):
    print("🧐 Critic Agent: Verifying extracted data...")
    
    prompt = f"""
    ROLE: Lead Pharmacovigilance QA Auditor.
    Original Text: {state['clean_text']}
    Extracted JSON: {state['extracted_data']}

    EVALUATION RUBRIC:
    1. Omission Check: Did the JSON miss any symptoms mentioned in the text?
    2. MedDRA Check: Does the 'meddra_term' sound like a professional medical term?
    
    OUTPUT:
    - If perfect, output: PASS
    - If failed, output: FAIL | [Exact reason]
    """
    
    response = fast_local_llm.invoke([SystemMessage(content=prompt)])
    result = response.content.strip()
    
    if "PASS" in result.upper()[:10]:
        print("✅ Critic Approved!")
        return {"critic_feedback": "PASS"}
    else:
        print(f"❌ Critic Rejected: {result}")
        return {"critic_feedback": result}

# --- NODE 3: The Doctor (Explainability & PubMed) ---
# --- NODE 3: The Doctor (Explainability & PubMed) ---
# --- NODE 3: The Doctor (Explainability & PubMed) ---
def doctor_node(state: GraphState):
    print("🩺 Doctor Agent: Assessing Causality & Explainability...")
    
    data = state.get('extracted_data', {})
    
    # Safely extract raw values, handling accidental dictionaries from the Generator
    def get_string_value(val):
        if isinstance(val, dict):
            return str(next(iter(val.values()), "Unknown"))
        return str(val)

    raw_drug = get_string_value(data.get('suspect_drug', 'Unknown'))
    raw_event = get_string_value(data.get('meddra_term') or data.get('adverse_event') or 'Unknown')
    
    # FORCE them to be strings before replacing spaces
    drug = raw_drug.replace(" ", "+")
    event = raw_event.replace(" ", "+")
    
    pubmed_url = f"https://pubmed.ncbi.nlm.nih.gov/?term={drug}+{event}"
    
    parser = JsonOutputParser(pydantic_object=DoctorVerdict)
    
    prompt = f"""
    ROLE: Senior Drug Safety Physician.
    TASK: Evaluate WHO-UMC causality based on this data: {data}
    
    STRICT FORMATTING RULES:
    1. Every single value in your JSON output MUST be a flat string. 
    2. DO NOT use nested dictionaries or arrays.
    3. Assign a causality_score (Certain, Probable, Possible, Unlikely, Unassessable).
    4. Assign a confidence_score (e.g., "85%").
    5. Write a 1-sentence reasoning for your decision.
    6. Set the pubmed_search_link to EXACTLY this string: {pubmed_url}
    
    {parser.get_format_instructions()}
    """
    
    response = json_local_llm.invoke([SystemMessage(content=prompt)])
    
    try:
        verdict = json.loads(response.content) if isinstance(response.content, str) else response.content
    except:
        verdict = {
            "causality_score": "Unassessable", 
            "confidence_score": "0%", 
            "reasoning": "Fallback due to processing error.",
            "pubmed_search_link": pubmed_url
        }
    
    return {"doctor_verdict": verdict}

    
# --- CONDITIONAL ROUTING ---
def verify_router(state: GraphState):
    if state['critic_feedback'] == "PASS":
        return "doctor"
    elif state['extraction_attempts'] >= 3: # Reduced to 3 to prevent "getting stuck"
        print("⚠️ Max attempts reached. Forcing final assessment to ensure pipeline stability.")
        return "doctor"
    else:
        return "generator"

# --- BUILD THE GRAPH ---
workflow = StateGraph(GraphState)

workflow.add_node("guard", guard_node)
workflow.add_node("generator", generator_node)
workflow.add_node("critic", critic_node)
workflow.add_node("doctor", doctor_node)

workflow.set_entry_point("guard")
workflow.add_edge("guard", "generator")
workflow.add_edge("generator", "critic")

workflow.add_conditional_edges(
    "critic",
    verify_router,
    {
        "doctor": "doctor",
        "generator": "generator"
    }
)

workflow.add_edge("doctor", END)

ayu_scout_ai = workflow.compile()