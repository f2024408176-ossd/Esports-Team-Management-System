"""
schemas.py – Pydantic Request/Response Schemas
Esports Team Management System
Author: Ilhamuddin | f2024408176
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime


# -------------------------------------------------------
# USER SCHEMAS
# -------------------------------------------------------
class UserCreate(BaseModel):
    username : str
    email    : EmailStr
    password : str
    role     : Optional[str] = "manager"


class UserOut(BaseModel):
    user_id    : int
    username   : str
    email      : str
    role       : str
    created_at : Optional[datetime]

    class Config:
        from_attributes = True


# -------------------------------------------------------
# TEAM SCHEMAS
# -------------------------------------------------------
class TeamCreate(BaseModel):
    team_name    : str
    game_title   : str
    coach_name   : str
    created_date : Optional[date] = None


class TeamOut(TeamCreate):
    team_id : int

    class Config:
        from_attributes = True


# -------------------------------------------------------
# PLAYER SCHEMAS
# -------------------------------------------------------
class PlayerCreate(BaseModel):
    team_id     : int
    player_name : str
    gamer_tag   : str
    role        : str
    age         : Optional[int]  = None
    join_date   : Optional[date] = None


class PlayerOut(PlayerCreate):
    player_id : int

    class Config:
        from_attributes = True


# -------------------------------------------------------
# TOURNAMENT SCHEMAS
# -------------------------------------------------------
class TournamentCreate(BaseModel):
    tournament_name : str
    location        : str
    start_date      : Optional[date]  = None
    end_date        : Optional[date]  = None
    prize_pool      : Optional[float] = 0.0


class TournamentOut(TournamentCreate):
    tournament_id : int

    class Config:
        from_attributes = True


# -------------------------------------------------------
# MATCH SCHEMAS
# -------------------------------------------------------
class MatchCreate(BaseModel):
    team_id       : int
    opponent_team : str
    match_date    : Optional[date] = None
    result        : Optional[str]  = None   # Win / Loss / Draw
    score         : Optional[str]  = None


class MatchOut(MatchCreate):
    match_id : int

    class Config:
        from_attributes = True


# -------------------------------------------------------
# TRAINING SESSION SCHEMAS
# -------------------------------------------------------
class TrainingCreate(BaseModel):
    team_id        : int
    session_date   : Optional[date] = None
    duration_hours : Optional[int]  = None
    focus_area     : Optional[str]  = None


class TrainingOut(TrainingCreate):
    session_id : int

    class Config:
        from_attributes = True
