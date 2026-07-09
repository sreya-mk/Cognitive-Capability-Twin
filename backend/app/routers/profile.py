import os
import json
from typing import List, Dict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..database import SessionLocal, Skill, UserProfile
from ..services.llm import extract_skills_from_text
from ..services.heuristics import compute_growth_projections, compute_employability

router = APIRouter(prefix="/api", tags=["profile"])

# ─── Config helpers ──────────────────────────────────────────────────────────

CONFIG_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "config")

def _load_taxonomy() -> Dict:
    with open(os.path.join(CONFIG_DIR, "skill_taxonomy.json"), encoding="utf-8") as f:
        return json.load(f)

def _load_roles() -> Dict:
    with open(os.path.join(CONFIG_DIR, "role_requirements.json"), encoding="utf-8") as f:
        return json.load(f)

# ─── Pydantic models ──────────────────────────────────────────────────────────

class ProfileInput(BaseModel):
    raw_text: str = Field(..., description="Resume, GitHub description, and about me text")
    study_hours_per_week: float = Field(..., ge=0, le=168)
    current_role: str | None = None
    career_goal: str | None = None

class SkillResponse(BaseModel):
    name: str
    category: str
    confidence: float
    difficulty: float
    growth: dict

class SimulateInput(BaseModel):
    new_skill: str

class RoleMatchDetail(BaseModel):
    role: str
    match_pct: float
    matched: List[str]
    missing: List[str]

class SimulateResponse(BaseModel):
    employability_before: float
    employability_after: float
    explanation: str
    roles_before: List[RoleMatchDetail]
    roles_after: List[RoleMatchDetail]
    new_roles_unlocked: List[str]

# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.post("/profile", summary="Submit raw profile text and store extracted skills")
def submit_profile(payload: ProfileInput):
    db = SessionLocal()
    try:
        profile = UserProfile(
            raw_text=payload.raw_text,
            study_hours_per_week=payload.study_hours_per_week,
            current_role=payload.current_role,
            career_goal=payload.career_goal,
        )
        db.add(profile)
        db.commit()

        try:
            extracted = extract_skills_from_text(payload.raw_text)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

        taxonomy = _load_taxonomy()

        # Difficulty lookup — skills higher in the hierarchy are harder
        DIFFICULTY = {
            "Deep Learning": 2.0, "NLP": 2.5, "Computer Vision": 2.5,
            "MLOps": 2.0, "Machine Learning": 1.8, "Kubernetes": 1.8,
            "Terraform": 1.5, "Spark": 1.8, "Kafka": 1.6, "Rust": 2.0,
        }

        for item in extracted:
            # Skip duplicate skill names
            existing = db.query(Skill).filter(Skill.name == item["name"]).first()
            if existing:
                # Update confidence if the new value is higher
                if item["confidence"] > existing.confidence:
                    existing.confidence = item["confidence"]
                continue

            skill = Skill(
                name=item["name"],
                category=item["category"],
                confidence=item["confidence"],
                difficulty=DIFFICULTY.get(item["name"], item.get("difficulty", 1.0)),
            )
            db.add(skill)
            db.flush()
            # Link parent relationships from taxonomy
            for parent_name in taxonomy.get(item["name"], []):
                parent = db.query(Skill).filter(Skill.name == parent_name).first()
                if parent:
                    skill.parents.append(parent)

        db.commit()
    finally:
        db.close()
    return {"message": "Profile processed and skills stored"}


@router.get("/skills", response_model=List[SkillResponse], summary="Get stored skills with growth projections")
def get_skills():
    db = SessionLocal()
    try:
        # Use the latest profile's study hours if available
        profile = db.query(UserProfile).order_by(UserProfile.id.desc()).first()
        study_hours = profile.study_hours_per_week if profile else 5.0

        skills = db.query(Skill).all()
        result: List[SkillResponse] = []
        for s in skills:
            growth = compute_growth_projections(
                confidence=s.confidence,
                study_hours=study_hours,
                difficulty=s.difficulty,
            )
            result.append(SkillResponse(
                name=s.name,
                category=s.category,
                confidence=s.confidence,
                difficulty=s.difficulty,
                growth=growth,
            ))
        return result
    finally:
        db.close()


def _role_details(skill_list: List[str], roles: Dict) -> List[RoleMatchDetail]:
    details = []
    skill_set = set(skill_list)
    for role, info in roles.items():
        required = set(info.get("required", []))
        matched = sorted(required & skill_set)
        missing = sorted(required - skill_set)
        match_pct = round(len(matched) / max(len(required), 1) * 100, 1)
        details.append(RoleMatchDetail(
            role=role,
            match_pct=match_pct,
            matched=matched,
            missing=missing,
        ))
    return sorted(details, key=lambda x: -x.match_pct)


@router.post("/simulate", response_model=SimulateResponse, summary="Simulate adding a new skill")
def simulate(payload: SimulateInput):
    db = SessionLocal()
    try:
        roles = _load_roles()
        current_skills = [s.name for s in db.query(Skill).all()]
        extended_skills = current_skills + [payload.new_skill]

        before = compute_employability(current_skills, roles)
        after = compute_employability(extended_skills, roles)

        roles_before = _role_details(current_skills, roles)
        roles_after = _role_details(extended_skills, roles)

        # Roles that cross 50% match only after adding the new skill
        before_set = {r.role for r in roles_before if r.match_pct >= 50}
        after_set = {r.role for r in roles_after if r.match_pct >= 50}
        new_unlocked = sorted(after_set - before_set)

        if new_unlocked:
            explanation = (
                f"Adding '{payload.new_skill}' raises your employability from {before:.1f}% to {after:.1f}% "
                f"(+{after - before:.1f}%). It unlocks {len(new_unlocked)} new role(s): "
                f"{', '.join(new_unlocked)}."
            )
        elif after > before:
            explanation = (
                f"Adding '{payload.new_skill}' increases your employability from {before:.1f}% to {after:.1f}% "
                f"(+{after - before:.1f}%) by satisfying additional requirements across matched roles."
            )
        else:
            explanation = (
                f"'{payload.new_skill}' doesn't appear in the current role templates, "
                f"so your employability score stays at {before:.1f}%. Consider skills like Deep Learning, "
                f"MLOps, or TypeScript which appear in many templates."
            )

        return SimulateResponse(
            employability_before=before,
            employability_after=after,
            explanation=explanation,
            roles_before=roles_before,
            roles_after=roles_after,
            new_roles_unlocked=new_unlocked,
        )
    finally:
        db.close()
