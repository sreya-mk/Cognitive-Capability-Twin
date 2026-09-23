import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, ForeignKey, Table, DateTime
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from datetime import datetime

# SQLite database path (project root)
DB_PATH = os.getenv("DB_PATH", "app.db")
engine = create_engine(f"sqlite:///{DB_PATH}", echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

# Association table for skill relationships (related_to)
skill_relationship = Table(
    "skill_relationship",
    Base.metadata,
    Column("parent_id", Integer, ForeignKey("skills.id"), primary_key=True),
    Column("child_id", Integer, ForeignKey("skills.id"), primary_key=True),
)

class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False)  # "technical" or "soft"
    confidence = Column(Float, nullable=False)  # 0-100 from LLM
    difficulty = Column(Float, nullable=False, default=1.0)  # lookup constant
    # Relationships
    parents = relationship(
        "Skill",
        secondary=skill_relationship,
        primaryjoin=id == skill_relationship.c.child_id,
        secondaryjoin=id == skill_relationship.c.parent_id,
        backref="children",
    )

class UserProfile(Base):
    __tablename__ = "user_profile"
    id = Column(Integer, primary_key=True)
    raw_text = Column(String, nullable=False)
    study_hours_per_week = Column(Float, nullable=False, default=0)
    current_role = Column(String, nullable=True)
    career_goal = Column(String, nullable=True)
    full_name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    location = Column(String, nullable=True)
    years_experience = Column(Float, nullable=True)
    education = Column(String, nullable=True)
    industries = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    preferred_work_mode = Column(String, nullable=True)
    availability = Column(String, nullable=True)
    target_company = Column(String, nullable=True)
    # One-to-many relationship to skills via foreign key not needed; we query skills separately.

class InsightRecord(Base):
    __tablename__ = "insight_records"
    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    focus_area = Column(String, nullable=False)
    rationale = Column(String, nullable=False)
    recommended_roles_json = Column(String, nullable=False)  # JSON string
    suggested_skills_json = Column(String, nullable=False)  # JSON string
    current_role = Column(String, nullable=True)
    career_goal = Column(String, nullable=True)

def init_db():
    Base.metadata.create_all(bind=engine)
    # Keep local demo databases created by older versions usable after schema growth.
    columns = {
        "full_name": "VARCHAR", "email": "VARCHAR", "location": "VARCHAR",
        "years_experience": "FLOAT", "education": "VARCHAR", "industries": "VARCHAR",
        "github_url": "VARCHAR", "linkedin_url": "VARCHAR", "portfolio_url": "VARCHAR",
        "preferred_work_mode": "VARCHAR", "availability": "VARCHAR", "target_company": "VARCHAR",
    }
    with engine.begin() as connection:
        existing = {row[1] for row in connection.exec_driver_sql("PRAGMA table_info(user_profile)")}
        for name, data_type in columns.items():
            if name not in existing:
                connection.exec_driver_sql(f"ALTER TABLE user_profile ADD COLUMN {name} {data_type}")
