# 🎮 Esports Team Management System

**Student:** Ilhamuddin | **ID:** f2024408176  
**Course:** OSSD – Y9 | **University:** University of Management and Technology  
**Project Type:** Full-Stack Web Application (Phase 2 – Code Submission)

---

## 📌 Project Overview

The **Esports Team Management System** is a complete full-stack web application that helps esports organizations manage players, teams, tournaments, matches, and training sessions through a centralized platform.

---

## 🗂️ Project Structure

```
EsportsTeamMS/
├── frontend/
│   ├── index.html          ← Home Page
│   ├── about.html          ← About Page
│   ├── login.html          ← Login / Register Page
│   ├── dashboard.html      ← Dashboard Page
│   ├── manage.html         ← Manage Data Page (Teams, Players, etc.)
│   └── style.css           ← Global Stylesheet
│
├── backend/
│   ├── main.py             ← FastAPI app + all 20+ API endpoints
│   ├── models.py           ← SQLAlchemy ORM models (6 tables)
│   ├── schemas.py          ← Pydantic request/response schemas
│   ├── database.py         ← Supabase PostgreSQL connection
│   ├── requirements.txt    ← Python dependencies
│   └── .env.example        ← Environment variables template
│
├── screenshots/            ← Project screenshots
└── README.md               ← This file
```

---

## 🛠️ Technology Stack

| Layer       | Technology               |
|-------------|--------------------------|
| Frontend    | HTML5, CSS3, JavaScript  |
| Backend     | Python, FastAPI          |
| Database    | PostgreSQL (Supabase)    |
| ORM         | SQLAlchemy               |
| Auth        | JWT (PyJWT + bcrypt)     |
| Hosting     | Render (backend)         |
| Frontend    | Netlify                  |
| DB Hosting  | Supabase                 |

---

## 🗄️ Database Schema (6 Tables)

| Table             | Primary Key       | Foreign Key          |
|-------------------|-------------------|----------------------|
| users             | user_id (PK)      | —                    |
| teams             | team_id (PK)      | —                    |
| players           | player_id (PK)    | team_id → teams      |
| tournaments       | tournament_id (PK)| —                    |
| matches           | match_id (PK)     | team_id → teams      |
| training_sessions | session_id (PK)   | team_id → teams      |

---

## 🚀 API Endpoints (20+ Total)

### Authentication
| Method | Endpoint   | Description        |
|--------|------------|--------------------|
| POST   | /register  | Register new user  |
| POST   | /login     | User login (JWT)   |

### Teams (CRUD)
| Method | Endpoint         | Description     |
|--------|------------------|-----------------|
| POST   | /teams           | Create team     |
| GET    | /teams           | Get all teams   |
| GET    | /teams/{id}      | Get single team |
| PUT    | /teams/{id}      | Update team     |
| DELETE | /teams/{id}      | Delete team     |

### Players (CRUD)
| Method | Endpoint         | Description      |
|--------|------------------|------------------|
| POST   | /players         | Add player       |
| GET    | /players         | Get all players  |
| GET    | /players/{id}    | Get player       |
| PUT    | /players/{id}    | Update player    |
| DELETE | /players/{id}    | Remove player    |

### Tournaments (CRUD)
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| POST   | /tournaments          | Create tournament    |
| GET    | /tournaments          | Get all tournaments  |
| PUT    | /tournaments/{id}     | Update tournament    |
| DELETE | /tournaments/{id}     | Delete tournament    |

### Matches (CRUD)
| Method | Endpoint         | Description       |
|--------|------------------|-------------------|
| POST   | /matches         | Schedule match    |
| GET    | /matches         | Get all matches   |
| GET    | /matches/{id}    | Get single match  |
| PUT    | /matches/{id}    | Update result     |
| DELETE | /matches/{id}    | Delete match      |

### Training Sessions (CRUD)
| Method | Endpoint           | Description       |
|--------|--------------------|-------------------|
| POST   | /training          | Create session    |
| GET    | /training          | Get all sessions  |
| PUT    | /training/{id}     | Update session    |
| DELETE | /training/{id}     | Delete session    |

### Analytics
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | /dashboard/stats      | Dashboard statistics     |
| GET    | /players/search       | Search players (q=name)  |
| GET    | /matches/filter       | Filter by result/team    |
| GET    | /teams/rankings       | Teams ranked by win rate |

---

## 🖥️ Frontend Pages (5+)

1. **index.html** – Home Page (hero, features, tech stack)
2. **about.html** – About Page (project info, DB schema, developer)
3. **login.html** – Login / Register (JWT auth, tabs)
4. **dashboard.html** – Dashboard (stats, charts, recent matches)
5. **manage.html** – Manage Data (Teams, Players, Tournaments, Matches, Training – all with full CRUD)

---

## ⚙️ Local Setup Instructions

### Backend

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
# Edit .env and add your Supabase DATABASE_URL

# 5. Run the API server
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
# Simply open index.html in your browser
# Or use Live Server in VS Code
# Update the API variable in each HTML file to your backend URL
```

### API Documentation

Once the backend is running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:**      http://localhost:8000/redoc

---

## ☁️ Deployment

### Backend → Render
1. Push code to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Set Build Command: `pip install -r requirements.txt`
4. Set Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable: `DATABASE_URL` = your Supabase URL

### Frontend → Netlify
1. Push frontend folder to GitHub
2. Connect repo on [netlify.com](https://netlify.com)
3. Set publish directory to `frontend/`
4. Deploy

### Database → Supabase
1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings → Database → Connection String
3. Copy the URI and add to Render environment variables
4. Tables are auto-created by SQLAlchemy on first run

---

## 📋 Submission Checklist

- [x] Documentation complete (Phase 1)
- [x] Frontend has 5+ pages
- [x] Backend has 20+ API endpoints
- [x] All 6 database tables defined
- [x] Full CRUD on all entities
- [x] JWT Authentication implemented
- [x] Search and Filter APIs
- [x] Dashboard/Statistics API
- [x] Supabase PostgreSQL integration
- [x] Deployment ready (Render + Netlify)
- [x] README with setup instructions
- [x] Code properly organized

---

## 🔮 Future Enhancements

- Discord Integration
- Tournament Bracket Visualization
- Live Match Tracking
- Team Recruitment Module
- Sponsorship Management
- AI-Based Performance Analysis
- Mobile Application Support
- Real-Time Notifications (WebSockets)
- Multi-Game Support

---

*© 2026 Esports Team Management System | Ilhamuddin (f2024408176) | OSSD – Y9 | UMT*
