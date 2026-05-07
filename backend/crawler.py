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


# ============================================================
# LIVE AGENTIC CRAWLER — Real URL scraping with self-healing
# ============================================================

# Known CSS selectors per domain pattern (config registry)
SELECTOR_REGISTRY = {
    "reddit.com":        {"body": ".md", "title": "h1._eYtD2XCVieq6emjKBH3m"},
    "drugs.com":         {"body": ".ddc-post-content", "title": "h1.drug-name"},
    "patient.info":      {"body": ".ddc-card-body", "title": "h1"},
    "medscape.com":      {"body": ".article-section", "title": "h1.article-title"},
    "healthunlocked.com":{"body": ".post-content",  "title": "h1.post-title"},
    "_default":          {"body": "article, .post-content, .thread-body, .content, main p", "title": "h1"},
}

# Heuristic candidate selectors for self-healing
CANDIDATE_SELECTORS = [
    "article", ".post", ".post-content", ".thread-body", ".content",
    "main p", ".message-content", ".comment-body", ".reply-body",
    ".forum-post", ".discussion-body", ".user-post", ".entry-content",
    "div[class*='post']", "div[class*='content']", "div[class*='thread']",
    "div[class*='message']", "div[class*='body']",
]


def _get_selectors_for_url(url: str) -> dict:
    """Return the known selectors for a domain, or the defaults."""
    for domain, sels in SELECTOR_REGISTRY.items():
        if domain in url:
            return sels
    return SELECTOR_REGISTRY["_default"]


def _try_selector(soup, css_selector: str):
    """Try a BeautifulSoup CSS selector and return matched text blocks."""
    try:
        from bs4 import BeautifulSoup
        elements = soup.select(css_selector)
        return [el.get_text(separator=" ", strip=True) for el in elements if el.get_text(strip=True)]
    except Exception:
        return []


def _self_heal_selector(soup) -> tuple:
    """
    Agentic self-healing: scan DOM heuristically to find the best content selector.
    Returns (selector_str, extracted_texts, confidence_pct).
    """
    best_selector = None
    best_texts = []
    best_score = 0

    for sel in CANDIDATE_SELECTORS:
        texts = _try_selector(soup, sel)
        # Score = number of elements × avg text length (prefers rich content blocks)
        if texts:
            score = len(texts) * (sum(len(t) for t in texts) / len(texts))
            if score > best_score:
                best_score = score
                best_selector = sel
                best_texts = texts

    confidence = min(96, int(40 + best_score / 500)) if best_selector else 0
    return best_selector, best_texts, confidence


def run_live_agentic_crawler(url: str, keyword: str) -> list:
    """
    Live agentic crawler with self-healing CSS selectors.

    Flow:
      1. Fetch HTML from the target URL
      2. Try known selectors from the registry
      3. If they fail → trigger self-healing (heuristic DOM scan)
      4. Filter text blocks containing the keyword
      5. Mask PII before returning
    Returns a list of record dicts.
    """
    import requests
    from bs4 import BeautifulSoup

    print(f"\n🌐 [LiveCrawler] Fetching: {url}")

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        )
    }

    response = requests.get(url, headers=headers, timeout=20)
    response.raise_for_status()
    html = response.text
    soup = BeautifulSoup(html, "html.parser")
    print(f"   ✅ DOM fetched: {len(html):,} bytes")

    # ── Step 2: Try known selectors ────────────────────────────
    known = _get_selectors_for_url(url)
    body_sel = known.get("body", "article")
    texts = _try_selector(soup, body_sel)

    healed = False
    final_selector = body_sel

    if not texts:
        # ── Step 3: Self-heal ───────────────────────────────────
        print(f"   ⚠️ Selector '{body_sel}' returned 0 elements. Initiating self-healing...")
        new_sel, texts, confidence = _self_heal_selector(soup)
        if new_sel:
            print(f"   🤖 Self-healed! New selector: '{new_sel}' (confidence: {confidence}%)")
            # Update registry for this domain
            for domain in SELECTOR_REGISTRY:
                if domain in url:
                    SELECTOR_REGISTRY[domain]["body"] = new_sel
                    break
            else:
                SELECTOR_REGISTRY["_default"]["body"] = new_sel
            final_selector = new_sel
            healed = True
        else:
            # Final fallback — grab all paragraph text
            texts = [p.get_text(separator=" ", strip=True) for p in soup.find_all("p") if len(p.get_text(strip=True)) > 40]
            final_selector = "p"
            healed = True
            print(f"   ↩️ Fallback: using raw <p> tags ({len(texts)} blocks)")

    # ── Step 4: Keyword filter ─────────────────────────────────
    kw = keyword.lower()
    matched = [t for t in texts if kw in t.lower()]
    print(f"   🔍 '{keyword}' matched {len(matched)} / {len(texts)} text blocks")

    # ── Step 5: PII masking ────────────────────────────────────
    records = []
    for i, text in enumerate(matched[:20]):   # cap at 20 records
        masked_text, vault_map = pii_vault.mask(text)
        records.append({
            "id": i + 1,
            "text": masked_text[:400],
            "keyword": keyword,
            "selector_used": final_selector,
            "self_healed": healed,
            "pii_masked": len(vault_map),
            "source_url": url,
        })
        # Also save to intake DB
        try:
            from urllib.parse import urlparse
            domain = urlparse(url).netloc or url
            pii_map_json = json.dumps(vault_map) if vault_map else "{}"
            save_intake(masked_text[:400], f"Web ({domain})", keyword, pii_map=pii_map_json)
        except Exception:
            pass

    print(f"   📦 Returning {len(records)} records (healed={healed})")
    return records