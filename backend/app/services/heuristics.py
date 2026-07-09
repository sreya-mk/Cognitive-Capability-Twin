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


def recommend_next_steps(user_skills: List[str], roles: Dict, career_goal: str | None = None, current_role: str | None = None) -> Dict:
    """Return high-signal role matches and suggested skills for the next learning move."""
    if not roles:
        return {
            "focus_area": "Build a stronger skill foundation",
            "rationale": "Add a few distinctive capabilities to improve your market signal.",
            "recommended_roles": [],
            "suggested_skills": [],
        }

    skill_set = set(user_skills)
    ranked_roles = []
    goal_tokens = [token.lower() for token in (career_goal or "").split() if token]
    role_tokens = [token.lower() for token in (current_role or "").split() if token]

    for role, info in roles.items():
        required = set(info.get("required", []))
        matched = sorted(required & skill_set)
        missing = sorted(required - skill_set)
        match_pct = round(len(matched) / max(len(required), 1) * 100, 1)
        score = match_pct

        role_name = role.lower()
        if goal_tokens and any(token in role_name for token in goal_tokens):
            score += 10
        if role_tokens and any(token in role_name for token in role_tokens):
            score += 6

        ranked_roles.append({
            "role": role,
            "match_pct": match_pct,
            "matched": matched,
            "missing": missing,
            "score": round(score, 1),
        })

    ranked_roles.sort(key=lambda item: (-item["score"], -item["match_pct"], item["role"]))
    top_roles = ranked_roles[:3]

    suggested_skills = []
    seen = set()
    for role in top_roles:
        for skill_name in role["missing"]:
            if skill_name in seen or skill_name in skill_set:
                continue
            reason = f"Useful for {role['role']} and strengthens your adjacent opportunity path"
            suggested_skills.append({"name": skill_name, "reason": reason})
            seen.add(skill_name)
            if len(suggested_skills) >= 5:
                break
        if len(suggested_skills) >= 5:
            break

    if not suggested_skills:
        suggested_skills.append({
            "name": "Communication",
            "reason": "A high-leverage signal that improves your profile across technical and product roles",
        })

    if career_goal:
        focus_area = f"Advance toward {career_goal}"
        rationale = f"The strongest near-term opportunities point to a path that blends your current strengths with capabilities that {career_goal.lower()} roles commonly demand."
    elif current_role:
        focus_area = f"Strengthen your {current_role} profile"
        rationale = f"Your present profile suggests a move toward adjacent roles that amplify your current strengths without starting from zero."
    else:
        focus_area = "Expand into adjacent opportunities"
        rationale = "Your current profile already has momentum; the best next step is to layer in a few high-leverage capabilities."

    return {
        "focus_area": focus_area,
        "rationale": rationale,
        "recommended_roles": top_roles,
        "suggested_skills": suggested_skills,
    }
