import os
import json
from typing import List, Dict
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..database import SessionLocal, Skill, UserProfile, InsightRecord
from ..services.llm import extract_skills_from_text
from ..services.heuristics import compute_growth_projections, compute_employability, recommend_next_steps

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
    full_name: str | None = None
    email: str | None = None
    location: str | None = None
    years_experience: float | None = Field(default=None, ge=0, le=80)
    education: str | None = None
    industries: str | None = None
    github_url: str | None = None
    linkedin_url: str | None = None
    portfolio_url: str | None = None
    preferred_work_mode: str | None = None
    availability: str | None = None
    target_company: str | None = None

class ProfileResponse(ProfileInput):
    id: int
    updated_at: str | None = None

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

class InsightRequest(BaseModel):
    career_goal: str | None = None
    current_role: str | None = None

class InsightSkill(BaseModel):
    name: str
    reason: str

class InsightResponse(BaseModel):
    focus_area: str
    rationale: str
    recommended_roles: List[RoleMatchDetail]
    suggested_skills: List[InsightSkill]

class SavedInsightRecord(BaseModel):
    id: int
    created_at: str
    focus_area: str
    rationale: str
    recommended_roles: List[RoleMatchDetail]
    suggested_skills: List[InsightSkill]

class CopilotAction(BaseModel):
    period: str
    title: str
    action: str
    outcome: str

class CopilotResponse(BaseModel):
    headline: str
    summary: str
    strengths: List[str]
    focus_areas: List[str]
    action_plan: List[CopilotAction]
    mode: str

class InterviewQuestion(BaseModel):
    question: str
    intent: str
    answer_framework: str
    evidence_prompt: str

class InterviewResponse(BaseModel):
    role: str
    intro: str
    questions: List[InterviewQuestion]
    mode: str

# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/profile", response_model=ProfileResponse | None, summary="Get the latest saved profile")
def get_profile():
    db = SessionLocal()
    try:
        profile = db.query(UserProfile).order_by(UserProfile.id.desc()).first()
        if not profile:
            return None
        return ProfileResponse(
            id=profile.id,
            raw_text=profile.raw_text,
            study_hours_per_week=profile.study_hours_per_week,
            current_role=profile.current_role,
            career_goal=profile.career_goal,
            full_name=profile.full_name,
            email=profile.email,
            location=profile.location,
            years_experience=profile.years_experience,
            education=profile.education,
            industries=profile.industries,
            github_url=profile.github_url,
            linkedin_url=profile.linkedin_url,
            portfolio_url=profile.portfolio_url,
            preferred_work_mode=profile.preferred_work_mode,
            availability=profile.availability,
            target_company=profile.target_company,
            updated_at=None,
        )
    finally:
        db.close()


@router.post("/profile", response_model=ProfileResponse, summary="Submit profile details and store extracted skills")
def submit_profile(payload: ProfileInput):
    db = SessionLocal()
    response: ProfileResponse | None = None
    try:
        profile = db.query(UserProfile).order_by(UserProfile.id.desc()).first()
        if profile is None:
            profile = UserProfile()
            db.add(profile)
        for field, value in payload.model_dump().items():
            setattr(profile, field, value)
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
        response = ProfileResponse(
            id=profile.id,
            **payload.model_dump(),
            updated_at=None,
        )
    finally:
        db.close()
    return response


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


@router.post("/copilot", response_model=CopilotResponse, summary="Generate an AI-assisted career action plan")
def generate_copilot_plan():
    db = SessionLocal()
    try:
        profile = db.query(UserProfile).order_by(UserProfile.id.desc()).first()
        skills = sorted(db.query(Skill).all(), key=lambda skill: skill.confidence, reverse=True)
        roles = _load_roles()
        skill_names = [skill.name for skill in skills]
        career_goal = profile.career_goal if profile and profile.career_goal else "your target role"
        current_role = profile.current_role if profile and profile.current_role else "your current role"
        insight_data = recommend_next_steps(skill_names, roles, career_goal=career_goal, current_role=current_role)
        recommended_roles = insight_data["recommended_roles"]

        strengths = [skill.name for skill in skills[:4]] or ["Your professional foundation"]
        focus_areas = [skill["name"] for skill in insight_data["suggested_skills"][:4]]
        if not focus_areas:
            focus_areas = ["Build a visible project", "Practice role-specific communication"]
        best_role = recommended_roles[0]["role"] if recommended_roles else career_goal
        summary = (
            f"You are building from {current_role} toward {career_goal}. "
            f"Your strongest current signals are {', '.join(strengths[:3])}. "
            f"The clearest next move is to turn one capability gap into visible proof for {best_role}."
        )
        action_plan = [
            CopilotAction(
                period="Days 1–7",
                title="Choose one leverage gap",
                action=f"Prioritize {focus_areas[0]} and define one measurable learning target for this week.",
                outcome="A focused target instead of a scattered study list.",
            ),
            CopilotAction(
                period="Days 8–14",
                title="Build a proof artifact",
                action=f"Create a small project that combines {strengths[0]} with {focus_areas[0]}.",
                outcome="A concrete repository, demo, or case study you can show.",
            ),
            CopilotAction(
                period="Days 15–21",
                title="Make the signal legible",
                action="Write a concise project README and explain the decision, trade-off, and result in plain language.",
                outcome="Evidence that communicates both technical depth and judgment.",
            ),
            CopilotAction(
                period="Days 22–30",
                title="Convert proof into opportunity",
                action=f"Share the artifact with three relevant people or teams aligned with {best_role}.",
                outcome="Feedback, referrals, or a clearer next opportunity signal.",
            ),
        ]
        return CopilotResponse(
            headline=f"Your next 30 days toward {career_goal}",
            summary=summary,
            strengths=strengths,
            focus_areas=focus_areas,
            action_plan=action_plan,
            mode="AI-assisted heuristic plan",
        )
    finally:
        db.close()


@router.post("/interview", response_model=InterviewResponse, summary="Generate an AI-assisted interview practice set")
def generate_interview_set():
    db = SessionLocal()
    try:
        profile = db.query(UserProfile).order_by(UserProfile.id.desc()).first()
        skills = sorted(db.query(Skill).all(), key=lambda skill: skill.confidence, reverse=True)
        role = profile.career_goal if profile and profile.career_goal else "your target role"
        strengths = [skill.name for skill in skills[:3]] or ["your strongest capability"]
        focus = " and ".join([skill.name for skill in skills[-2:]]) if len(skills) >= 2 else "a capability gap"
        questions = [
            InterviewQuestion(
                question=f"Walk me through a project where you used {strengths[0]} to create a measurable result.",
                intent="Tests ownership, practical depth, and whether your work created impact.",
                answer_framework="Context → your decision → implementation → measurable result → lesson.",
                evidence_prompt="Name the scale, constraint, trade-off, and one metric that changed.",
            ),
            InterviewQuestion(
                question=f"How would you approach building a reliable system in a {role} context?",
                intent="Tests systems thinking and engineering judgment beyond tool familiarity.",
                answer_framework="Clarify requirements → propose a simple design → discuss failure modes → define observability.",
                evidence_prompt=f"Connect the answer to your experience with {', '.join(strengths)}.",
            ),
            InterviewQuestion(
                question=f"What is your current development gap around {focus}, and how are you closing it?",
                intent="Tests self-awareness, learning velocity, and honesty about the gap.",
                answer_framework="Name the gap → explain why it matters → show your learning loop → share proof so far.",
                evidence_prompt="Bring one artifact, experiment, course outcome, or feedback loop.",
            ),
            InterviewQuestion(
                question="Tell me about a time a technical decision did not work as expected.",
                intent="Tests resilience, communication, and ability to learn without hiding the failure.",
                answer_framework="Situation → failed assumption → recovery → what you changed permanently.",
                evidence_prompt="Avoid blame; quantify the impact and describe the corrective action.",
            ),
            InterviewQuestion(
                question=f"Why is this {role} move the right next step for you now?",
                intent="Tests motivation and whether your career story is coherent.",
                answer_framework="Current foundation → specific pull toward the role → proof of preparation → next contribution.",
                evidence_prompt=f"Tie your motivation to {strengths[0]} and a concrete problem you want to solve.",
            ),
        ]
        return InterviewResponse(
            role=role,
            intro=f"Practice the questions most likely to reveal your readiness for {role}. Use your own project evidence rather than memorized answers.",
            questions=questions,
            mode="AI-assisted practice set",
        )
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


@router.post("/insights", response_model=InsightResponse, summary="Recommend next skills and best-matching roles")
def get_insights(payload: InsightRequest):
    db = SessionLocal()
    try:
        profile = db.query(UserProfile).order_by(UserProfile.id.desc()).first()
        career_goal = payload.career_goal or (profile.career_goal if profile else None)
        current_role = payload.current_role or (profile.current_role if profile else None)
        roles = _load_roles()
        current_skills = [s.name for s in db.query(Skill).all()]

        insight_data = recommend_next_steps(current_skills, roles, career_goal=career_goal, current_role=current_role)
        role_matches = [
            RoleMatchDetail(
                role=item["role"],
                match_pct=item["match_pct"],
                matched=item["matched"],
                missing=item["missing"],
            )
            for item in insight_data["recommended_roles"]
        ]
        suggested_skills = [InsightSkill(**item) for item in insight_data["suggested_skills"]]

        return InsightResponse(
            focus_area=insight_data["focus_area"],
            rationale=insight_data["rationale"],
            recommended_roles=role_matches,
            suggested_skills=suggested_skills,
        )
    finally:
        db.close()


@router.post("/insights/save", summary="Save current insight to history")
def save_insight(payload: InsightResponse):
    db = SessionLocal()
    try:
        profile = db.query(UserProfile).order_by(UserProfile.id.desc()).first()
        current_role = profile.current_role if profile else None
        career_goal = profile.career_goal if profile else None

        roles_json = json.dumps([
            {"role": r.role, "match_pct": r.match_pct, "matched": r.matched, "missing": r.missing}
            for r in payload.recommended_roles
        ])
        skills_json = json.dumps([
            {"name": s.name, "reason": s.reason}
            for s in payload.suggested_skills
        ])

        record = InsightRecord(
            focus_area=payload.focus_area,
            rationale=payload.rationale,
            recommended_roles_json=roles_json,
            suggested_skills_json=skills_json,
            current_role=current_role,
            career_goal=career_goal,
        )
        db.add(record)
        db.commit()
        return {"message": "Insight saved", "id": record.id}
    finally:
        db.close()


@router.get("/insights/history", response_model=List[SavedInsightRecord], summary="Get insights history")
def get_insights_history():
    db = SessionLocal()
    try:
        records = db.query(InsightRecord).order_by(InsightRecord.created_at.desc()).limit(10).all()
        result = []
        for r in records:
            roles = json.loads(r.recommended_roles_json)
            skills = json.loads(r.suggested_skills_json)
            role_matches = [
                RoleMatchDetail(**item) for item in roles
            ]
            suggested_skills = [
                InsightSkill(**item) for item in skills
            ]
            result.append(SavedInsightRecord(
                id=r.id,
                created_at=r.created_at.isoformat() if r.created_at else "",
                focus_area=r.focus_area,
                rationale=r.rationale,
                recommended_roles=role_matches,
                suggested_skills=suggested_skills,
            ))
        return result
    finally:
        db.close()
