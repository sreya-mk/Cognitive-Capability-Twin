import os
import json
import httpx
from typing import List, Dict

# Determine which provider to use based on env vars
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# Prompt that asks LLM to return JSON list of skills
PROMPT_TEMPLATE = """
You are given a free‑text description of a person's background (resume, project summaries, personal notes). Extract a **list of skills** mentioned. Return **exact JSON** in the following format:

[{{
  "name": "Skill name",
  "category": "technical" | "soft",
  "confidence": <0‑100 confidence score based on how strongly the skill is described>
}}]

Only output the JSON array, nothing else.
"""

def _call_openai(content: str) -> List[Dict]:
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
    data = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": PROMPT_TEMPLATE + "\n\n" + content}],
        "temperature": 0,
        "max_tokens": 500,
    }
    response = httpx.post("https://api.openai.com/v1/chat/completions", json=data, headers=headers, timeout=30)
    response.raise_for_status()
    choice = response.json()["choices"][0]["message"]["content"]
    return json.loads(choice)

def _call_anthropic(content: str) -> List[Dict]:
    headers = {"x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01"}
    data = {
        "model": "claude-3-5-sonnet-20240620",
        "max_tokens": 1024,
        "temperature": 0,
        "system": PROMPT_TEMPLATE,
        "messages": [{"role": "user", "content": content}],
    }
    response = httpx.post("https://api.anthropic.com/v1/messages", json=data, headers=headers, timeout=30)
    response.raise_for_status()
    msg = response.json()["content"][0]["text"]
    return json.loads(msg)

def extract_skills_from_text(text: str) -> List[Dict]:
    """If no LLM API key is configured, return a static demo skill set.
    This enables the demo to run without external API access.
    """
    if not (OPENAI_API_KEY or ANTHROPIC_API_KEY):
        # Simple hard‑coded demo response matching the expected schema
        return [
            {"name": "Python", "category": "technical", "confidence": 95},
            {"name": "Machine Learning", "category": "technical", "confidence": 80},
            {"name": "Data Analysis", "category": "technical", "confidence": 70},
            {"name": "Communication", "category": "soft", "confidence": 85},
        ]
    if OPENAI_API_KEY:
        return _call_openai(text)
    if ANTHROPIC_API_KEY:
        return _call_anthropic(text)
    raise RuntimeError("No LLM API key configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY in the environment.")
    """Send *text* to the configured LLM and return a list of skill dicts.
    The function raises a RuntimeError if neither API key is supplied.
    """
    if OPENAI_API_KEY:
        return _call_openai(text)
    if ANTHROPIC_API_KEY:
        return _call_anthropic(text)
    raise RuntimeError("No LLM API key configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY in the environment.")
