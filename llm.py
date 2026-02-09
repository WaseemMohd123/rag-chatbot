from openai import OpenAI
from retrival import retrieve_from_chroma
from dotenv import load_dotenv
from typing import List
import os, re, logging
import csv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load API key from environment variable
api_key = os.getenv("OPENAI_API_KEY")
try:
    if api_key:
        client = OpenAI(api_key=api_key)
    else:
        client = None
        logger.warning("OPENAI_API_KEY not found. LLM features will be disabled.")
except Exception as e:
    client = None
    logger.error(f"Failed to initialize OpenAI client: {e}")

# ---------- Utility Functions ----------

# Clean up retrieved text
def clean_context(context_text: str) -> str:
    if not context_text:
        return ""
    lines = [line.strip() for line in context_text.splitlines() if line.strip()]
    return "\n".join(
        [line for line in lines if not re.fullmatch(r"vector_\d+", line) and len(line) > 5]
    )

# Build context from retriever results
def _build_context_from_results(results: dict) -> str:
    docs = results.get("documents", [])
    if docs and isinstance(docs[0], list):
        return "\n\n".join(docs[0])
    metas = results.get("metadatas", [])
    if metas and isinstance(metas[0], list):
        return "\n\n".join(
            " ".join(str(v) for v in m.values()) if isinstance(m, dict) else str(m)
            for m in metas[0]
        )
    return ""


# ---------- LLM Answer Function ----------
def is_greeting_or_casual(text: str) -> bool:
    text = text.lower()
    greeting_keywords = [
        "hello", "hi", "hey", "good morning", "good evening",
        "aslamwalekum", "salam", "salaam", "namaste",
        "kaise ho", "how are you", "what's up", "kya haal hai"
    ]
    return any(keyword in text for keyword in greeting_keywords)


def generate_answer(question: str, context: str = None, persist_dir: str = "chroma_db", top_k: int = 3) -> str:
    q_lower = question.strip().lower()
    # ✅ Detect greetings/casual chats
    if is_greeting_or_casual(q_lower):
        context_text = ""   # don’t do RAG at all
        use_rag = False
    else:
        use_rag = True
        if context is None:
            results = retrieve_from_chroma(question, persist_dir=persist_dir, top_k=top_k)
            context_text = _build_context_from_results(results)
        else:
            context_text = context
        context_text = clean_context(context_text)

    # ✅ If no RAG and not a casual → return fallback
    if use_rag and not context_text.strip():
        return "Sorry, that's not in our knowledge base."

    # System rules
    system_prompt = """
You are an advanced, enterprise-grade AI assistant created by Waseem.
Your goal is to provide professional, structured, and easy-to-read responses.

### 🌟 Core Identity & Behavior
- **Creator**: If asked about your creator/owner, reply exactly: "Waseem is my creator." (Translate if needed).
- **Tone**: Professional, helpful, concise, and polite.
- **Language**: Strictly follow the user's language (English, Hindi, Hinglish, etc.).

### 📝 Formatting Rules (CRITICAL)
1. **Structure is Key**:
   - Use clear **Paragraphs** for explanations.
   - Use **Bullet Points** (•) for lists to improve readability.
   - Use **Bold** text for key terms or headings (e.g., **Experience**, **Skills**).
2. **Avoid Walls of Text**: Break long responses into smaller, digestible chunks.
3. **No Raw JSON**: Do NOT output raw JSON unless the user explicitly requests "raw data" or "JSON format".
4. **Tables**: If the user asks for data comparisons or lists that fit well in a table, use Markdown tables.

### 🚫 Constraints
- Do NOT hallucinate. If the answer is not in the context, say "I don't know" or "This information is not available in the documents."
- Do NOT mix languages unless the user does.

### ✅ Example Response Structure
**Summary of the Document:**
• **Key Point 1**: Explanation...
• **Key Point 2**: Explanation...

**Detailed Data:**
• **Name**: John Doe
• **Role**: Software Engineer
"""
    # ✅ Build prompt
    prompt = f"""
Context:
{context_text if use_rag else "(no context, casual chat)"}

Question: {question}

Answer:
"""

    if client is None:
        return "LLM API key is missing. Please set OPENROUTER_API_KEY environment variable."

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.exception("LLM response parsing failed: %s", e)
        return "An error occurred while getting an answer from the LLM."


# ---------- Query Expansion ----------
def expand_query(question: str, num_variations: int = 2) -> List[str]:
    """
    Generate query variations to improve retrieval coverage
    
    Args:
        question: Original user question
        num_variations: Number of variations to generate (default 2)
    
    Returns:
        List of query variations including the original
    """
    if client is None:
        logger.warning("Cannot expand query, LLM client not available")
        return [question]  # Return original query only
    
    expansion_prompt = f"""Given the following question, generate {num_variations} alternative ways to ask the same question.
These variations should help retrieve relevant information from a document database.
Keep variations concise and focused on the same intent.

Original Question: {question}

Generate exactly {num_variations} variations, one per line, without numbering or bullets:"""
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": expansion_prompt}],
            temperature=0.7,
            max_tokens=150
        )
        
        variations_text = response.choices[0].message.content.strip()
        variations = [v.strip() for v in variations_text.split('\n') if v.strip()]
        
        # Add original question at the beginning
        all_queries = [question] + variations[:num_variations]
        
        logger.info(f"Expanded query into {len(all_queries)} variations")
        return all_queries
        
    except Exception as e:
        logger.error(f"Query expansion failed: {e}")
        return [question]  # Return original on error
