from typing import Dict, List

def logistic_growth(confidence: float, study_hours: float, difficulty: float) -> float:
    """Simple logistic projection.
    confidence: current confidence 0-100
    study_hours: self‑reported weekly study time (hours)
    difficulty: difficulty constant (>=1). Higher = slower growth.
    Returns projected confidence after one time unit (e.g., 30 days).
    """
    # Normalize to 0-1
    c = confidence / 100.0
    # Scale factor from study hours (more study speeds up growth)
    k = 0.1 * study_hours / difficulty
    # Logistic step
    projected = 1 / (1 + ((1 - c) / c) * (2.71828 ** (-k)))
    return round(projected * 100, 1)

def compute_growth_projections(confidence: float, study_hours: float, difficulty: float) -> Dict[str, float]:
    """Return projected confidence at 30, 90, 180 days using repeated logistic steps."""
    day30 = logistic_growth(confidence, study_hours, difficulty)
    day90 = logistic_growth(day30, study_hours, difficulty)
    day180 = logistic_growth(day90, study_hours, difficulty)
    return {"30": day30, "90": day90, "180": day180}

def compute_employability(user_skills: List[str], roles: Dict) -> float:
    """Simple weighted employability.
    roles: dict mapping role name to dict with "required": [skill list], "weight": optional float.
    Returns % of matched required skills across all roles (averaged).
    """
    if not roles:
        return 0.0
    total_match = 0.0
    total_weight = 0.0
    for role, info in roles.items():
        required = set(info.get("required", []))
        weight = info.get("weight", 1.0)
        match = len(required.intersection(user_skills)) / max(len(required), 1)
        total_match += match * weight
        total_weight += weight
    return round((total_match / total_weight) * 100, 1)
