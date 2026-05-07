"""
AyuScout V2 — Simulated Social Media Crawler
=============================================
Scans simulated Reddit data for adverse drug event signals.
All incoming data passes through the PII Vault before storage.
"""

import json
from datetime import datetime
from database import save_intake
from core.pii_vault import PIIVault

# Initialize PII Vault
pii_vault = PIIVault()

# Try to load Ollama gatekeeper, fallback to keyword-based gating for demo safety
try:
    from langchain_ollama import ChatOllama
    from langchain_core.messages import HumanMessage
    gatekeeper_llm = ChatOllama(model="phi3", temperature=0)
    USE_LLM_GATE = True
    print("✅ Crawler: Ollama gatekeeper loaded (phi3)")
except Exception as e:
    USE_LLM_GATE = False
    print(f"⚠️ Crawler: Ollama unavailable ({e}). Using keyword-based gating for demo.")


# Keyword-based fallback gate
NEGATIVE_KEYWORDS = [
    "side effect", "adverse", "reaction", "dizzy", "nausea", "swelling",
    "pain", "rash", "vomiting", "headache", "trouble", "severe", "worse",
    "bad", "horrible", "terrible", "allergic", "emergency", "hospital",
    "metallic taste", "difficulty", "breathing", "blurred", "fatigue"
]


def _keyword_gate(text: str) -> bool:
    """Fallback: Check if text contains negative health signal keywords."""
    text_lower = text.lower()
    return any(kw in text_lower for kw in NEGATIVE_KEYWORDS)


def run_simulated_crawler(keyword):
    """
    Scan simulated Reddit data for adverse drug events.
    PII is masked before any data reaches the database.
    """
    print(f"\n🚀 Scouting Simulated Reddit for: {keyword}...")
    
    try:
        with open('reddit_data.json', 'r') as f:
            all_posts = json.load(f)
    except FileNotFoundError:
        print("❌ reddit_data.json not found!")
        return

    relevant_posts = [p for p in all_posts if keyword.lower() in p['drug'].lower()]
    print(f"   📄 Found {len(relevant_posts)} relevant posts for '{keyword}'")

    for post in relevant_posts:
        text = post['text']
        
        # --- Gate: Is this a negative signal? ---
        is_negative = False
        if USE_LLM_GATE:
            try:
                gate_prompt = f"Does this text describe a negative side effect? Answer YES or NO only. Text: {text}"
                gate_response = gatekeeper_llm.invoke([HumanMessage(content=gate_prompt)])
                is_negative = "YES" in gate_response.content.upper()
            except Exception:
                # Fallback to keyword gate if LLM fails mid-run
                is_negative = _keyword_gate(text)
        else:
            is_negative = _keyword_gate(text)
        
        if is_negative:
            print("🛑 Negative Signal Detected. Masking PII & Saving to Intake Vault.")
            
            # === PII VAULT INTERCEPT ===
            masked_text, vault_map = pii_vault.mask(text)
            pii_map_json = json.dumps(vault_map) if vault_map else "{}"
            
            if vault_map:
                print(f"   🔒 PII Vault: Masked {len(vault_map)} entities")
            else:
                print(f"   🔒 PII Vault: No PII detected (clean text)")
            
            save_intake(masked_text, f"Reddit (r/{post['subreddit']})", keyword, pii_map=pii_map_json)
        else:
            print("✅ Neutral post. Skipping.")