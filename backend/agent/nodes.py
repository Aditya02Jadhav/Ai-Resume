import json
import re
import os
import google.generativeai as genai
from groq import Groq
from .state import AgentState

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "your_gemini_api_key_here")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "your_groq_api_key_here")

genai.configure(api_key=GEMINI_API_KEY)
# Using gemini-1.5-flash as the current API version 
gemini_model = genai.GenerativeModel("gemini-2.5-flash")
groq_client = Groq(api_key=GROQ_API_KEY)


def _call_gemini(prompt: str) -> dict:
    """Call Gemini API with fallback to Groq on quota limit"""
    try:
        response = gemini_model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )
        text = response.text.strip()
        
        # Clean up response - handle markdown code blocks
        if text.startswith("```json"):
            text = text[7:]  # Remove ```json
            if text.endswith("```"):
                text = text[:-3]  # Remove trailing ```
        elif text.startswith("```"):
            text = text[3:]  # Remove ```
            if text.startswith("json"):
                text = text[4:]  # Remove json
            if text.endswith("```"):
                text = text[:-3]  # Remove trailing ```
        
        text = text.strip()
        return json.loads(text)
    except Exception as e:
        # Check if error is quota/rate limit related
        error_msg = str(e).lower()
        if "quota" in error_msg or "rate_limit" in error_msg or "429" in error_msg or "quota exceeded" in error_msg or "resource_exhausted" in error_msg:
            print(f"⚠️ Gemini quota limit reached, falling back to Groq API...")
            return _call_groq(prompt)
        else:
            raise


def _call_groq(prompt: str, default_keys: list = None) -> dict:
    """Call Groq API as fallback with robust JSON extraction"""
    try:
        # Truncate prompt to avoid overflowing context
        truncated = prompt[:6000] + ("\n...[truncated]" if len(prompt) > 6000 else "")
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a JSON-only response assistant. You MUST respond with ONLY a valid JSON object. No explanations, no markdown, no extra text."},
                {"role": "user", "content": truncated}
            ],
            temperature=0.2,
            max_tokens=1024,
        )
        text = response.choices[0].message.content.strip()
        
        # Strip markdown code fences if present
        text = re.sub(r'^```(?:json)?\s*', '', text, flags=re.MULTILINE)
        text = re.sub(r'\s*```$', '', text, flags=re.MULTILINE)
        text = text.strip()
        
        if not text:
            raise ValueError("Empty response from Groq")
        
        # Try direct parse first
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Try extracting first JSON object with regex
            match = re.search(r'\{[\s\S]*\}', text)
            if match:
                try:
                    return json.loads(match.group())
                except json.JSONDecodeError:
                    pass
            
            # Give up - return a safe fallback dict
            print(f"⚠️ Could not parse Groq response as JSON, using fallback. Raw: {text[:100]}")
            fallback = {"response": "I need a moment to gather my thoughts.", "thinking": "Processing..."}
            if default_keys:
                for k in default_keys:
                    if k not in fallback:
                        fallback[k] = ""
            return fallback

    except Exception as e:
        print(f"❌ Error calling Groq API: {e}")
        return {"response": "Technical difficulty — standing by.", "thinking": "Reconnecting..."}


def parser_node(state: AgentState) -> AgentState:
    # First validate that the uploaded document is actually a resume
    validation_prompt = f"""You are a document classifier. Determine if the following document text is a RESUME/CV or something else (e.g. a job description, article, contract, college notice, website content, etc.)

DOCUMENT TEXT (first 2000 chars):
{state["resume_text"][:2000]}

Return ONLY a JSON object:
{{
  "is_resume": true or false,
  "document_type": "brief description of what this document appears to be",
  "reason": "one sentence explanation"
}}"""
    
    try:
        validation = _call_gemini(validation_prompt)
        if not validation.get("is_resume", True):
            doc_type = validation.get("document_type", "unknown document")
            reason = validation.get("reason", "")
            error_msg = f"⚠️ This does not appear to be a resume. Detected: '{doc_type}'. {reason} Please upload a valid resume or CV."
            return {**state, "parsed_resume": {"_error": error_msg}, "current_node": "parser_node", "error": error_msg}
    except Exception:
        pass  # If validation fails, proceed normally

    prompt = f"""You are a resume parser. Extract structured information from the resume text below.
Return a JSON object with these exact keys:
{{
  "name": "full name",
  "email": "email address or null",
  "phone": "phone number or null",
  "location": "city/country or null",
  "linkedin": "linkedin URL or null",
  "summary": "professional summary paragraph or null",
  "skills": ["skill1", "skill2", ...],
  "experience": [
    {{
      "title": "job title",
      "company": "company name",
      "duration": "start - end",
      "bullets": ["achievement1", "achievement2"]
    }}
  ],
  "education": [
    {{
      "degree": "degree name",
      "institution": "school name",
      "year": "graduation year or range"
    }}
  ],
  "certifications": ["cert1", "cert2"],
  "languages": ["lang1", "lang2"],
  "total_years_experience": <number or null>
}}

RESUME TEXT:
{state["resume_text"]}
"""
    parsed = _call_gemini(prompt)
    return {**state, "parsed_resume": parsed, "current_node": "parser_node"}


def scoring_node(state: AgentState) -> AgentState:
    prompt = f"""You are an expert ATS and resume scoring system. Score the resume against the job description below.
Return a JSON object with:
{{
  "ats_compatibility": <0-100, how well formatted for ATS parsing>,
  "keyword_match": <0-100, overlap between resume skills/terms and JD requirements>,
  "experience_relevance": <0-100, how relevant experience is to the role>,
  "format_quality": <0-100, clarity, structure, use of bullet points, quantification>,
  "overall_fit": <0-100, holistic fit for the role>,
  "matched_keywords": ["keyword1", "keyword2", ...],
  "missing_keywords": ["keyword1", "keyword2", ...],
  "scoring_rationale": "2-3 sentence explanation of the scores"
}}

PARSED RESUME:
{json.dumps(state["parsed_resume"], indent=2)}

JOB DESCRIPTION:
{state["job_description"]}
"""
    scores = _call_gemini(prompt)
    return {**state, "scores": scores, "current_node": "scoring_node"}


def critique_node(state: AgentState) -> AgentState:
    prompt = f"""You are a professional resume coach and AI-writing detector. Analyze the resume for weaknesses.
Return a JSON object with:
{{
  "semantic_gaps": [
    {{"gap": "description of gap", "severity": "high|medium|low", "suggestion": "how to fix it"}}
  ],
  "ai_phrasing_flags": [
    {{"phrase": "exact phrase from resume", "reason": "why it sounds AI-generated", "replacement": "human alternative"}}
  ],
  "weak_verbs": [
    {{"original": "was responsible for", "replacement": "led / managed / drove"}}
  ],
  "quantification_gaps": [
    {{"bullet": "original bullet point", "suggestion": "add metrics: X% improvement, $Y saved, N users"}}
  ],
  "top_improvements": [
    {{"priority": 1, "action": "concrete action to take", "impact": "why this matters"}}
  ],
  "overall_critique": "2-3 sentence overall assessment"
}}

RESUME TEXT (original):
{state["resume_text"]}

PARSED RESUME:
{json.dumps(state["parsed_resume"], indent=2)}

JOB DESCRIPTION:
{state["job_description"]}
"""
    critique = _call_gemini(prompt)
    return {**state, "critique": critique, "current_node": "critique_node"}


def finalizer_node(state: AgentState) -> AgentState:
    scores = state.get("scores", {})
    overall = scores.get("overall_fit", 0)

    if overall >= 85:
        grade = "A"
    elif overall >= 70:
        grade = "B"
    elif overall >= 55:
        grade = "C"
    elif overall >= 40:
        grade = "D"
    else:
        grade = "F"

    prompt = f"""You are a career advisor. Based on the full analysis below, write a concise executive summary.
Return a JSON with:
{{
  "executive_summary": "3-4 sentence narrative summary of this resume's strengths and key areas to improve",
  "hire_likelihood": "<percentage>% match for this role",
  "top_strength": "single strongest aspect of this resume",
  "critical_fix": "single most important thing to fix immediately"
}}

SCORES: {json.dumps(scores)}
CRITIQUE SUMMARY: {state.get("critique", {}).get("overall_critique", "")}
TOP IMPROVEMENTS: {json.dumps(state.get("critique", {}).get("top_improvements", [])[:3])}
"""
    narrative = _call_gemini(prompt)

    final_report = {
        "candidate": state.get("parsed_resume", {}).get("name", "Candidate"),
        "grade": grade,
        "overall_score": overall,
        "scores": scores,
        "parsed_resume": state.get("parsed_resume", {}),
        "critique": state.get("critique", {}),
        "executive_summary": narrative.get("executive_summary", ""),
        "hire_likelihood": narrative.get("hire_likelihood", ""),
        "top_strength": narrative.get("top_strength", ""),
        "critical_fix": narrative.get("critical_fix", ""),
    }

    return {**state, "final_report": final_report, "current_node": "finalizer_node"}
