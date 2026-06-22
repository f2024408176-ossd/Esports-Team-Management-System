"""
models.py – SQLAlchemy ORM Models
Esports Team Management System
Author: Ilhamuddin | f2024408176
"""

from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    user_id    = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username   = Column(String(100), unique=True, nullable=False)
    email      = Column(String(200), unique=True, nullable=False, index=True)
    password   = Column(String(255), nullable=False)
    role       = Column(String(50), default="manager")
    created_at = Column(DateTime, default=datetime.utcnow)


class Team(Base):
    __tablename__ = "teams"

    team_id      = Column(Integer, primary_key=True, index=True, autoincrement=True)
    team_name    = Column(String(150), nullable=False)
    game_title   = Column(String(100), nullable=False)
    coach_name   = Column(String(150), nullable=False)
    created_date = Column(Date, nullable=True)

    # Relationships
    players          = relationship("Player",          back_populates="team", cascade="all, delete")
    matches          = relationship("Match",           back_populates="team", cascade="all, delete")
    training_sessions= relationship("TrainingSession", back_populates="team", cascade="all, delete")


class Player(Base):
    __tablename__ = "players"

    player_id   = Column(Integer, primary_key=True, index=True, autoincrement=True)
    team_id     = Column(Integer, ForeignKey("teams.team_id", ondelete="CASCADE"), nullable=False)
    player_name = Column(String(150), nullable=False)
    gamer_tag   = Column(String(100), nullable=False)
    role        = Column(String(100), nullable=False)
    age         = Column(Integer, nullable=True)
    join_date   = Column(Date, nullable=True)

    team = relationship("Team", back_populates="players")


class Tournament(Base):
    __tablename__ = "tournaments"

    tournament_id   = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tournament_name = Column(String(200), nullable=False)
    location        = Column(String(200), nullable=False)
    start_date      = Column(Date, nullable=True)
    end_date        = Column(Date, nullable=True)
    prize_pool      = Column(Float, default=0.0)


class Match(Base):
    __tablename__ = "matches"

    match_id      = Column(Integer, primary_key=True, index=True, autoincrement=True)
    team_id       = Column(Integer, ForeignKey("teams.team_id", ondelete="CASCADE"), nullable=False)
    opponent_team = Column(String(150), nullable=False)
    match_date    = Column(Date, nullable=True)
    result        = Column(String(20), nullable=True)   # Win / Loss / Draw
    score         = Column(String(20), nullable=True)   # e.g. "13-7"

    team = relationship("Team", back_populates="matches")


class TrainingSession(Base):
    __tablename__ = "training_sessions"

    session_id     = Column(Integer, primary_key=True, index=True, autoincrement=True)
    team_id        = Column(Integer, ForeignKey("teams.team_id", ondelete="CASCADE"), nullable=False)
    session_date   = Column(Date, nullable=True)
    duration_hours = Column(Integer, nullable=True)
    focus_area     = Column(String(200), nullable=True)

    team = relationship("Team", back_populates="training_sessions")
