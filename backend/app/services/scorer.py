def score_resume(resume_text: str) -> dict:
    """
    Very basic MVP scoring simulating ATS:
    - Keywords: 40% (assume we have a list of common keywords)
    - Skills section: 20%
    - Experience: 20%
    - Formatting: 10%
    - Education: 10%
    """
    resume_lower = resume_text.lower()
    
    # Mock analysis:
    has_skills = "skills" in resume_lower
    has_experience = "experience" in resume_lower or "employment" in resume_lower or "work history" in resume_lower
    has_education = "education" in resume_lower or "university" in resume_lower or "college" in resume_lower
    
    # Random realistic keywords check for demo
    keywords = ["python", "react", "fastapi", "sql", "api", "git", "aws", "docker"]
    found_keywords = [kw for kw in keywords if kw in resume_lower]
    keyword_score_part = int(len(found_keywords) / len(keywords) * 40)
    
    skills_score = 20 if has_skills else 5
    experience_score = 20 if has_experience else 5
    education_score = 10 if has_education else 0
    formatting_score = 10 if len(resume_text.strip()) > 200 else 5 # check minimum length
    
    overall_score = keyword_score_part + skills_score + experience_score + education_score + formatting_score
    
    breakdown = {
        "keywords": keyword_score_part,
        "skills": skills_score,
        "experience": experience_score,
        "education": education_score,
        "formatting": formatting_score
    }
    
    suggestions = []
    if not has_skills:
        suggestions.append("Add a dedicated 'Skills' section.")
    if not has_experience:
        suggestions.append("Ensure your work 'Experience' is clearly labeled.")
    if not has_education:
        suggestions.append("Include an 'Education' section.")
    if len(found_keywords) < 3:
        suggestions.append("Consider adding more industry-relevant keywords.")
        
    return {
        "overall_score": overall_score,
        "breakdown": breakdown,
        "suggestions": suggestions,
        "keyword_matches": found_keywords
    }
