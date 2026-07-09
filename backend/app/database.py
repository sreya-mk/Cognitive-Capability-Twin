import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, ForeignKey, Table
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

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
    # One-to-many relationship to skills via foreign key not needed; we query skills separately.

def init_db():
    Base.metadata.create_all(bind=engine)
