"""
Esports Team Management System – FastAPI Backend
Author  : Ilhamuddin
Student : f2024408176
Course  : OSSD – Y9 | University of Management and Technology
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import jwt, bcrypt

from database import get_db, engine
import models, schemas

# -------------------------------------------------------
# App Setup
# -------------------------------------------------------
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Esports Team Management System API",
    description="Full-stack OSSD project API | Ilhamuddin (f2024408176) | UMT",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Replace with your Netlify URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------
# JWT Config
# -------------------------------------------------------
SECRET_KEY    = "esportsms-secret-key-umt-ossd-2026"  # Move to .env in production
ALGORITHM     = "HS256"
ACCESS_EXPIRE = 60  # minutes

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=ACCESS_EXPIRE)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# =======================================================
# ROOT
# =======================================================
@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Esports Team Management System API",
        "version": "1.0.0",
        "student": "Ilhamuddin – f2024408176",
        "course": "OSSD – Y9 | UMT",
        "docs": "/docs",
    }


# =======================================================
# AUTH ENDPOINTS  (2 endpoints)
# =======================================================

# POST /register  – Create user
@app.post("/register", response_model=schemas.UserOut, status_code=201, tags=["Authentication"])
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user (manager / coach / owner)."""
    if db.query(models.User).filter(models.User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(models.User).filter(models.User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = models.User(
        username   = user_data.username,
        email      = user_data.email,
        password   = hash_password(user_data.password),
        role       = user_data.role,
        created_at = datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# POST /login  – Authenticate user, return JWT
@app.post("/login", tags=["Authentication"])
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login with email + password, returns JWT access token."""
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token({"user_id": user.user_id, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"user_id": user.user_id, "username": user.username, "role": user.role},
    }


# =======================================================
# TEAM ENDPOINTS  (5 endpoints)
# =======================================================

# POST /teams  – Create team
@app.post("/teams", response_model=schemas.TeamOut, status_code=201, tags=["Teams"])
def create_team(
    team: schemas.TeamCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a new esports team."""
    db_team = models.Team(**team.dict())
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team


# GET /teams  – View all teams
@app.get("/teams", response_model=List[schemas.TeamOut], tags=["Teams"])
def get_teams(db: Session = Depends(get_db)):
    """Retrieve all teams."""
    return db.query(models.Team).all()


# GET /teams/{id}  – View single team
@app.get("/teams/{team_id}", response_model=schemas.TeamOut, tags=["Teams"])
def get_team(team_id: int, db: Session = Depends(get_db)):
    """Get a single team by ID."""
    team = db.query(models.Team).filter(models.Team.team_id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team


# PUT /teams/{id}  – Update team
@app.put("/teams/{team_id}", response_model=schemas.TeamOut, tags=["Teams"])
def update_team(
    team_id: int,
    team_data: schemas.TeamCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update team details."""
    team = db.query(models.Team).filter(models.Team.team_id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    for key, val in team_data.dict().items():
        setattr(team, key, val)
    db.commit()
    db.refresh(team)
    return team


# DELETE /teams/{id}  – Delete team
@app.delete("/teams/{team_id}", tags=["Teams"])
def delete_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Delete a team."""
    team = db.query(models.Team).filter(models.Team.team_id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    db.delete(team)
    db.commit()
    return {"message": f"Team {team_id} deleted successfully"}


# =======================================================
# PLAYER ENDPOINTS  (5 endpoints)
# =======================================================

# POST /players  – Add player
@app.post("/players", response_model=schemas.PlayerOut, status_code=201, tags=["Players"])
def create_player(
    player: schemas.PlayerCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Add a new player."""
    team = db.query(models.Team).filter(models.Team.team_id == player.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    db_player = models.Player(**player.dict())
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player


# GET /players  – View all players
@app.get("/players", response_model=List[schemas.PlayerOut], tags=["Players"])
def get_players(db: Session = Depends(get_db)):
    """Retrieve all players."""
    return db.query(models.Player).all()


# GET /players/{id}  – View player
@app.get("/players/{player_id}", response_model=schemas.PlayerOut, tags=["Players"])
def get_player(player_id: int, db: Session = Depends(get_db)):
    """Get a single player by ID."""
    player = db.query(models.Player).filter(models.Player.player_id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player


# PUT /players/{id}  – Update player
@app.put("/players/{player_id}", response_model=schemas.PlayerOut, tags=["Players"])
def update_player(
    player_id: int,
    player_data: schemas.PlayerCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update player profile."""
    player = db.query(models.Player).filter(models.Player.player_id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    for key, val in player_data.dict().items():
        setattr(player, key, val)
    db.commit()
    db.refresh(player)
    return player


# DELETE /players/{id}  – Remove player
@app.delete("/players/{player_id}", tags=["Players"])
def delete_player(
    player_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Remove a player."""
    player = db.query(models.Player).filter(models.Player.player_id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    db.delete(player)
    db.commit()
    return {"message": f"Player {player_id} removed successfully"}


# =======================================================
# TOURNAMENT ENDPOINTS  (4 endpoints)
# =======================================================

# POST /tournaments  – Create tournament
@app.post("/tournaments", response_model=schemas.TournamentOut, status_code=201, tags=["Tournaments"])
def create_tournament(
    tournament: schemas.TournamentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a new tournament."""
    db_tour = models.Tournament(**tournament.dict())
    db.add(db_tour)
    db.commit()
    db.refresh(db_tour)
    return db_tour


# GET /tournaments  – View all tournaments
@app.get("/tournaments", response_model=List[schemas.TournamentOut], tags=["Tournaments"])
def get_tournaments(db: Session = Depends(get_db)):
    """Retrieve all tournaments."""
    return db.query(models.Tournament).all()


# PUT /tournaments/{id}  – Update tournament
@app.put("/tournaments/{tournament_id}", response_model=schemas.TournamentOut, tags=["Tournaments"])
def update_tournament(
    tournament_id: int,
    tour_data: schemas.TournamentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update tournament details."""
    tour = db.query(models.Tournament).filter(models.Tournament.tournament_id == tournament_id).first()
    if not tour:
        raise HTTPException(status_code=404, detail="Tournament not found")
    for key, val in tour_data.dict().items():
        setattr(tour, key, val)
    db.commit()
    db.refresh(tour)
    return tour


# DELETE /tournaments/{id}  – Delete tournament
@app.delete("/tournaments/{tournament_id}", tags=["Tournaments"])
def delete_tournament(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Delete a tournament."""
    tour = db.query(models.Tournament).filter(models.Tournament.tournament_id == tournament_id).first()
    if not tour:
        raise HTTPException(status_code=404, detail="Tournament not found")
    db.delete(tour)
    db.commit()
    return {"message": f"Tournament {tournament_id} deleted"}


# =======================================================
# MATCH ENDPOINTS  (5 endpoints)
# =======================================================

# POST /matches  – Schedule match
@app.post("/matches", response_model=schemas.MatchOut, status_code=201, tags=["Matches"])
def create_match(
    match: schemas.MatchCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Schedule a new match."""
    db_match = models.Match(**match.dict())
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match


# GET /matches  – View all matches
@app.get("/matches", response_model=List[schemas.MatchOut], tags=["Matches"])
def get_matches(db: Session = Depends(get_db)):
    """Retrieve all matches."""
    return db.query(models.Match).all()


# GET /matches/{id}  – View single match
@app.get("/matches/{match_id}", response_model=schemas.MatchOut, tags=["Matches"])
def get_match(match_id: int, db: Session = Depends(get_db)):
    """Get a single match by ID."""
    match = db.query(models.Match).filter(models.Match.match_id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match


# PUT /matches/{id}  – Update match result
@app.put("/matches/{match_id}", response_model=schemas.MatchOut, tags=["Matches"])
def update_match(
    match_id: int,
    match_data: schemas.MatchCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update match result."""
    match = db.query(models.Match).filter(models.Match.match_id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    for key, val in match_data.dict().items():
        setattr(match, key, val)
    db.commit()
    db.refresh(match)
    return match


# DELETE /matches/{id}  – Delete match
@app.delete("/matches/{match_id}", tags=["Matches"])
def delete_match(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Delete a match record."""
    match = db.query(models.Match).filter(models.Match.match_id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    db.delete(match)
    db.commit()
    return {"message": f"Match {match_id} deleted"}


# =======================================================
# TRAINING SESSION ENDPOINTS  (4 endpoints)
# =======================================================

# POST /training  – Create session
@app.post("/training", response_model=schemas.TrainingOut, status_code=201, tags=["Training"])
def create_session(
    session: schemas.TrainingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a new training session."""
    db_session = models.TrainingSession(**session.dict())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session


# GET /training  – View all sessions
@app.get("/training", response_model=List[schemas.TrainingOut], tags=["Training"])
def get_sessions(db: Session = Depends(get_db)):
    """Retrieve all training sessions."""
    return db.query(models.TrainingSession).all()


# PUT /training/{id}  – Update session
@app.put("/training/{session_id}", response_model=schemas.TrainingOut, tags=["Training"])
def update_session(
    session_id: int,
    session_data: schemas.TrainingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update a training session."""
    session = db.query(models.TrainingSession).filter(models.TrainingSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    for key, val in session_data.dict().items():
        setattr(session, key, val)
    db.commit()
    db.refresh(session)
    return session


# DELETE /training/{id}  – Delete session
@app.delete("/training/{session_id}", tags=["Training"])
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Delete a training session."""
    session = db.query(models.TrainingSession).filter(models.TrainingSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
    return {"message": f"Training session {session_id} deleted"}


# =======================================================
# ANALYTICS ENDPOINTS  (4 endpoints)
# =======================================================

# GET /dashboard/stats  – Team statistics
@app.get("/dashboard/stats", tags=["Analytics"])
def dashboard_stats(db: Session = Depends(get_db)):
    """Return overall dashboard statistics."""
    total_teams       = db.query(models.Team).count()
    total_players     = db.query(models.Player).count()
    total_matches     = db.query(models.Match).count()
    total_tournaments = db.query(models.Tournament).count()
    total_sessions    = db.query(models.TrainingSession).count()
    wins  = db.query(models.Match).filter(models.Match.result == "Win").count()
    losses= db.query(models.Match).filter(models.Match.result == "Loss").count()
    draws = db.query(models.Match).filter(models.Match.result == "Draw").count()
    win_rate = round((wins / total_matches * 100), 1) if total_matches else 0

    return {
        "teams": total_teams,
        "players": total_players,
        "matches": total_matches,
        "tournaments": total_tournaments,
        "sessions": total_sessions,
        "wins": wins,
        "losses": losses,
        "draws": draws,
        "win_rate": win_rate,
    }


# GET /players/search  – Search players
@app.get("/players/search", response_model=List[schemas.PlayerOut], tags=["Analytics"])
def search_players(q: Optional[str] = None, db: Session = Depends(get_db)):
    """Search players by name or gamer tag."""
    if not q:
        return db.query(models.Player).all()
    return db.query(models.Player).filter(
        models.Player.player_name.ilike(f"%{q}%") |
        models.Player.gamer_tag.ilike(f"%{q}%")
    ).all()


# GET /matches/filter  – Filter matches by result
@app.get("/matches/filter", response_model=List[schemas.MatchOut], tags=["Analytics"])
def filter_matches(result: Optional[str] = None, team_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Filter matches by result (Win/Loss/Draw) and/or team ID."""
    query = db.query(models.Match)
    if result:
        query = query.filter(models.Match.result == result)
    if team_id:
        query = query.filter(models.Match.team_id == team_id)
    return query.all()


# GET /teams/rankings  – Team rankings by win rate
@app.get("/teams/rankings", tags=["Analytics"])
def team_rankings(db: Session = Depends(get_db)):
    """Return teams ranked by win rate."""
    teams = db.query(models.Team).all()
    rankings = []
    for team in teams:
        matches = db.query(models.Match).filter(models.Match.team_id == team.team_id).all()
        total = len(matches)
        wins  = sum(1 for m in matches if m.result == "Win")
        wr    = round((wins / total * 100), 1) if total else 0
        players_count = db.query(models.Player).filter(models.Player.team_id == team.team_id).count()
        rankings.append({
            "team_id":     team.team_id,
            "team_name":   team.team_name,
            "game_title":  team.game_title,
            "coach_name":  team.coach_name,
            "total_matches": total,
            "wins":        wins,
            "losses":      sum(1 for m in matches if m.result == "Loss"),
            "draws":       sum(1 for m in matches if m.result == "Draw"),
            "win_rate":    wr,
            "players":     players_count,
        })
    rankings.sort(key=lambda x: x["win_rate"], reverse=True)
    return rankings
