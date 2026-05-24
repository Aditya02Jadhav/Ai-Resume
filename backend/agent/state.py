from typing import TypedDict, Optional


class AgentState(TypedDict):
    resume_text: str
    job_description: str
    parsed_resume: dict
    scores: dict
    critique: dict
    final_report: dict
    current_node: str
    error: Optional[str]
