import json
from datetime import datetime
from database import save_intake
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage

gatekeeper_llm = ChatOllama(model="phi3", temperature=0)

def run_simulated_crawler(keyword):
    print(f"🚀 Scouting Simulated Reddit for: {keyword}...")
    with open('reddit_data.json', 'r') as f:
        all_posts = json.load(f)

    relevant_posts = [p for p in all_posts if keyword.lower() in p['drug'].lower()]

    for post in relevant_posts:
        text = post['text']
        # Requirements: Extract individual sentiment
        gate_prompt = f"Does this text describe a negative side effect? Answer YES or NO only. Text: {text}"
        gate_response = gatekeeper_llm.invoke([HumanMessage(content=gate_prompt)])
        
        if "YES" in gate_response.content.upper():
            print("🛑 Negative Signal Detected. Saving to Intake Vault.")
            save_intake(text, f"Reddit (r/{post['subreddit']})", keyword)
        else:
            print("✅ Neutral post. Skipping.")