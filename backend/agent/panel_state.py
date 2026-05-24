from typing import TypedDict, List, Optional

class PanelState(TypedDict):
    resume_text: str
    job_description: str
    messages: List[dict]
    turn_count: int
    final_decision: Optional[str]
    confidence: Optional[int]
    error: Optional[str]
