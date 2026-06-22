# 🚀 Esports Team Management System – Setup & Deployment Guide

**Student:** Ilhamuddin | **ID:** f2024408176  
**Course:** OSSD – Y9 | **University:** University of Management and Technology

---

## 📋 Quick Start (Local Development)

### Prerequisites
- Python 3.8+
- Node.js (optional, for live server)
- Git
- VS Code or any text editor
- A browser (Chrome, Firefox, Safari)

---

## 🔧 Backend Setup (FastAPI)

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Set Up Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env file (optional for local dev with SQLite)
# For Supabase PostgreSQL:
# DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

### Step 5: Run the FastAPI Server
```bash
uvicorn main:app --reload --port 8000
```

**Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### Access API Documentation
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Root API:** http://localhost:8000/

---

## 🎨 Frontend Setup (HTML/CSS/JavaScript)

### Option 1: Using VS Code Live Server
1. Open the `frontend/` folder in VS Code
2. Right-click on `index.html`
3. Select **"Open with Live Server"**
4. Browser opens at `http://localhost:5500/`

### Option 2: Python Simple HTTP Server
```bash
cd frontend
python -m http.server 8080
# Visit http://localhost:8080/
```

### Option 3: Direct File Opening
- Simply open `frontend/index.html` in your browser
- **Note:** Some features may not work without a local server

---

## 🧪 Testing the Application

### 1. Home Page
- **URL:** http://localhost:5500/index.html
- **Test:** Click on navigation links and hero buttons
- **Expected:** Smooth navigation, proper styling

### 2. Login/Register
- **URL:** http://localhost:5500/login.html
- **Test Register:**
  - Username: `testuser`
  - Email: `test@esports.com`
  - Password: `password123`
  - Role: `Team Manager`
  - Click: "✅ Create Account"
- **Test Login:**
  - Email: `test@esports.com`
  - Password: `password123`
  - Click: "🚀 Login to Dashboard"

### 3. Dashboard
- **URL:** http://localhost:5500/dashboard.html (redirects to login if not authenticated)
- **Features to Test:**
  - Statistics cards load (teams, players, matches, etc.)
  - Charts display match results
  - Recent matches table shows data
  - All sidebar links work

### 4. Manage Page
- **URL:** http://localhost:5500/manage.html
- **Test Each Tab:**

#### Teams Tab
- Fill form: Team Name, Game, Coach, Date
- Click "💾 Save Team"
- Verify team appears in table
- Click "✏️ Edit" to modify
- Click "🗑️ Delete" to remove

#### Players Tab
- Select team from dropdown
- Fill: Player Name, Gamer Tag, Role, Age, Join Date
- Save and verify in table

#### Tournaments Tab
- Add tournament with name, location, dates, prize pool
- Verify filtering and editing

#### Matches Tab
- Schedule match with team, opponent, date, score, result
- Use filter buttons (Wins/Losses/All)
- Test edit and delete

#### Training Tab
- Add training session with team, date, focus area
- Verify in table

### 5. About Page
- **URL:** http://localhost:5500/about.html
- **Test:** Verify content displays, links work

---

## 🔌 API Testing with Postman

### 1. Start Backend
```bash
uvicorn main:app --reload --port 8000
```

### 2. Import to Postman
- Open Postman
- Go to **File → Import**
- Enter: `http://localhost:8000/openapi.json`
- All endpoints will be imported

### 3. Test Key Endpoints

#### Register
```
POST http://localhost:8000/register
Body (JSON):
{
  "username": "ilham_gamer",
  "email": "ilham@esports.com",
  "password": "password123",
  "role": "manager"
}
```

#### Login
```
POST http://localhost:8000/login
Body (Form-Data):
- username: ilham@esports.com
- password: password123
```

**Response:** You'll get an `access_token`. Copy it.

#### Create Team (with Authorization)
```
POST http://localhost:8000/teams
Headers:
- Authorization: Bearer [YOUR_ACCESS_TOKEN]

Body (JSON):
{
  "team_name": "Alpha Wolves",
  "game_title": "Valorant",
  "coach_name": "Coach Ali",
  "created_date": "2026-06-15"
}
```

#### Get All Teams
```
GET http://localhost:8000/teams
```

#### Get Dashboard Stats
```
GET http://localhost:8000/dashboard/stats
```

---

## 📊 Database Setup (Supabase)

### 1. Create Supabase Account
- Go to https://supabase.com
- Sign up with GitHub or email
- Create a new project

### 2. Get Connection String
- Go to **Settings → Database → Connection String**
- Copy the PostgreSQL connection string
- Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`

### 3. Add to .env
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

### 4. Run Backend
- Tables will auto-create when you run the FastAPI server
- Check Supabase Dashboard to verify tables were created

---

## ☁️ Deploy to Production

### Backend → Render

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "OSSD Phase 2 Submission"
   git push origin main
   ```

2. **Create Render Service**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Set:
     - **Build Command:** `pip install -r requirements.txt`
     - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Add Environment Variables:
     - `DATABASE_URL`: Your Supabase connection string

3. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete
   - Copy the deployment URL (e.g., `https://esportsms.onrender.com`)

### Frontend → Netlify

1. **Push Frontend to GitHub**
   ```bash
   git add frontend/
   git commit -m "Frontend: Phase 2"
   git push origin main
   ```

2. **Update API URL**
   - Open `frontend/script.js`
   - Find: `const API_URL = "http://localhost:8000"`
   - Change to: `const API_URL = "https://esportsms.onrender.com"`
   - Push changes

3. **Deploy on Netlify**
   - Go to https://netlify.com
   - Connect GitHub repo
   - Set Publish Directory: `frontend/`
   - Click "Deploy"
   - Get live URL (e.g., `https://esportsms.netlify.app`)

---

## ✅ Phase 2 Submission Checklist

- [x] **Frontend**
  - [x] 5+ pages (index, about, login, dashboard, manage)
  - [x] User authentication (login/register)
  - [x] Responsive design
  - [x] All CRUD interfaces

- [x] **Backend**
  - [x] 20+ API endpoints
  - [x] JWT authentication
  - [x] CRUD operations for all entities
  - [x] Search and filter APIs
  - [x] Analytics endpoints

- [x] **Database**
  - [x] 6 tables (Users, Teams, Players, Tournaments, Matches, Training)
  - [x] Proper relationships (Foreign Keys)
  - [x] Supabase PostgreSQL integration

- [x] **Documentation**
  - [x] README.md (setup instructions)
  - [x] API documentation (Swagger/ReDoc)
  - [x] Database schema
  - [x] Deployment guide

- [x] **Code Quality**
  - [x] Proper project structure
  - [x] Error handling
  - [x] Input validation
  - [x] Clean code

---

## 🐛 Troubleshooting

### Issue: "Cannot GET /dashboard.html"
**Solution:** Use a local server (Live Server, Python HTTP Server)

### Issue: "CORS error"
**Solution:** Make sure backend is running with CORS middleware

### Issue: "401 Unauthorized"
**Solution:** 
- Clear browser localStorage: `localStorage.clear()`
- Reload login page
- Login again

### Issue: "Database connection failed"
**Solution:**
- Check DATABASE_URL in .env
- Verify Supabase project is active
- Test connection string in DBeaver

### Issue: "Frontend can't reach backend"
**Solution:**
- Check `API_URL` in `script.js`
- Ensure backend is running on correct port
- Check browser console for errors (F12)

---

## 📱 Responsive Testing

Test on different screen sizes:
```
- Desktop: 1920x1080
- Tablet: 768x1024
- Mobile: 375x667
```

Use browser DevTools (F12) → Toggle Device Toolbar

---

## 🎓 Project Viva Preparation

### Key Questions You Should Be Ready to Answer

1. **Problem Statement:** What problem does EsportsMS solve?
2. **Features:** Which 3 features are most important?
3. **Database Design:** Explain the relationship between Teams, Players, and Matches
4. **API Design:** How does JWT authentication work?
5. **CRUD Example:** Walk through creating a player
6. **Deployment:** What are the advantages of Supabase over local SQLite?
7. **Challenges:** What was the most difficult part of the project?
8. **Future Improvements:** What would you add next?

---

## 📚 Additional Resources

- **FastAPI Docs:** https://fastapi.tiangolo.com
- **SQLAlchemy:** https://www.sqlalchemy.org
- **Supabase:** https://supabase.com/docs
- **Render Deployment:** https://render.com/docs
- **Netlify:** https://docs.netlify.com

---

*Last Updated: June 22, 2026*  
*For questions or issues, refer to the GitHub repository*
