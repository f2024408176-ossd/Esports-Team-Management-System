/**
 * Esports Team Management System – Frontend JavaScript
 * Author: Ilhamuddin | f2024408176
 * All API calls and functionality
 */

// =====================================
// CONFIG & GLOBALS
// =====================================
const API_URL = "http://localhost:8000"; // Change to deployed URL in production
let currentToken = localStorage.getItem("token");
let currentUser = JSON.parse(localStorage.getItem("user")) || {};

// =====================================
// UTILITY FUNCTIONS
// =====================================
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; padding: 1rem 1.5rem;
    background: ${
      type === "success"
        ? "var(--success)"
        : type === "error"
          ? "var(--danger)"
          : "var(--warning)"
    };
    color: white; border-radius: var(--radius); z-index: 9999;
    font-weight: 500; animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

function isAuthenticated() {
  return !!currentToken;
}

function toggleNav() {
  const navLinks = document.getElementById("navLinks");
  if (navLinks) navLinks.classList.toggle("active");
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.classList.toggle("open");
}

// =====================================
// AUTH FUNCTIONS
// =====================================
async function doRegister() {
  const username = document.getElementById("regUsername")?.value;
  const email = document.getElementById("regEmail")?.value;
  const password = document.getElementById("regPassword")?.value;
  const confirm = document.getElementById("regConfirm")?.value;
  const role = document.getElementById("regRole")?.value;

  if (!username || !email || !password || !confirm || !role) {
    showNotification("All fields are required", "error");
    return;
  }

  if (password !== confirm) {
    showNotification("Passwords do not match", "error");
    return;
  }

  if (password.length < 6) {
    showNotification("Password must be at least 6 characters", "error");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, role }),
    });

    if (response.ok) {
      showNotification("Account created successfully! Please login.");
      setTimeout(() => switchTab("login"), 1500);
    } else {
      const error = await response.json();
      showNotification(error.detail || "Registration failed", "error");
    }
  } catch (err) {
    showNotification("Error: " + err.message, "error");
  }
}

async function doLogin() {
  const email = document.getElementById("loginEmail")?.value;
  const password = document.getElementById("loginPassword")?.value;

  if (!email || !password) {
    showNotification("Email and password are required", "error");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      currentToken = data.access_token;
      currentUser = data.user;
      localStorage.setItem("token", currentToken);
      localStorage.setItem("user", JSON.stringify(currentUser));
      showNotification("Login successful! Redirecting...");
      setTimeout(() => (window.location.href = "dashboard.html"), 1500);
    } else {
      showNotification("Invalid email or password", "error");
    }
  } catch (err) {
    showNotification("Error: " + err.message, "error");
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  currentToken = null;
  currentUser = {};
  showNotification("Logged out successfully");
  setTimeout(() => (window.location.href = "index.html"), 1000);
}

function switchTab(tab) {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");

  if (tab === "login") {
    if (loginForm) loginForm.style.display = "block";
    if (registerForm) registerForm.style.display = "none";
    if (loginTab) loginTab.classList.add("active");
    if (registerTab) registerTab.classList.remove("active");
  } else {
    if (loginForm) loginForm.style.display = "none";
    if (registerForm) registerForm.style.display = "block";
    if (loginTab) loginTab.classList.remove("active");
    if (registerTab) registerTab.classList.add("active");
  }
}

// =====================================
// API FUNCTIONS
// =====================================
async function apiCall(endpoint, method = "GET", data = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (currentToken) {
    options.headers.Authorization = `Bearer ${currentToken}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);
  if (response.status === 401) {
    logout();
    return null;
  }
  return response;
}

// =====================================
// DASHBOARD FUNCTIONS
// =====================================
async function loadDashboardStats() {
  try {
    const response = await apiCall("/dashboard/stats");
    if (!response.ok) throw new Error("Failed to load stats");
    const stats = await response.json();

    if (document.getElementById("totalTeams"))
      document.getElementById("totalTeams").textContent = stats.teams || 0;
    if (document.getElementById("totalPlayers"))
      document.getElementById("totalPlayers").textContent = stats.players || 0;
    if (document.getElementById("totalMatches"))
      document.getElementById("totalMatches").textContent = stats.matches || 0;
    if (document.getElementById("totalTournaments"))
      document.getElementById("totalTournaments").textContent =
        stats.tournaments || 0;
    if (document.getElementById("totalSessions"))
      document.getElementById("totalSessions").textContent =
        stats.sessions || 0;

    // Update donut chart
    if (stats.matches > 0) {
      const winPercent = Math.round((stats.wins / stats.matches) * 100);
      const lossPercent = Math.round((stats.losses / stats.matches) * 100);
      const drawPercent = Math.round((stats.draws / stats.matches) * 100);

      const donutLabels = document.querySelectorAll(".donut-label");
      if (donutLabels[0])
        donutLabels[0].innerHTML = `<div class="dot" style="background:var(--success)"></div> Wins (${winPercent}%)`;
      if (donutLabels[1])
        donutLabels[1].innerHTML = `<div class="dot" style="background:var(--danger)"></div> Losses (${lossPercent}%)`;
      if (donutLabels[2])
        donutLabels[2].innerHTML = `<div class="dot" style="background:var(--warning)"></div> Draws (${drawPercent}%)`;
    }
  } catch (err) {
    console.error("Error loading stats:", err);
  }
}

// =====================================
// TEAM FUNCTIONS
// =====================================
async function loadTeams() {
  try {
    const response = await apiCall("/teams");
    if (!response.ok) throw new Error("Failed to load teams");
    const teams = await response.json();

    const tbody = document.getElementById("teamsBody");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (teams.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:2rem;">No teams yet. Create one!</td></tr>';
      return;
    }

    teams.forEach((team) => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${team.team_name}</td>
        <td>${team.game_title}</td>
        <td>${team.coach_name}</td>
        <td>${team.created_date || "—"}</td>
        <td>
          <button class="action-btn edit" onclick="editTeam(${team.team_id})">✏️ Edit</button>
          <button class="action-btn delete" onclick="deleteTeam(${team.team_id})">🗑️ Delete</button>
        </td>
      `;
    });
  } catch (err) {
    console.error("Error loading teams:", err);
  }
}

async function saveTeam() {
  const teamId = document.getElementById("editTeamId")?.value;
  const teamName = document.getElementById("teamName")?.value;
  const teamGame = document.getElementById("teamGame")?.value;
  const teamCoach = document.getElementById("teamCoach")?.value;
  const teamDate = document.getElementById("teamDate")?.value;

  if (!teamName || !teamGame || !teamCoach) {
    showNotification("All fields are required", "error");
    return;
  }

  const data = {
    team_name: teamName,
    game_title: teamGame,
    coach_name: teamCoach,
    created_date: teamDate || null,
  };

  try {
    let response;
    if (teamId) {
      response = await apiCall(`/teams/${teamId}`, "PUT", data);
    } else {
      response = await apiCall("/teams", "POST", data);
    }

    if (!response.ok) throw new Error("Failed to save team");
    showNotification(teamId ? "Team updated!" : "Team created!");
    clearTeamForm();
    loadTeams();
  } catch (err) {
    showNotification("Error: " + err.message, "error");
  }
}

async function editTeam(id) {
  try {
    const response = await apiCall(`/teams/${id}`);
    if (!response.ok) throw new Error("Failed to load team");
    const team = await response.json();

    document.getElementById("editTeamId").value = id;
    document.getElementById("teamName").value = team.team_name;
    document.getElementById("teamGame").value = team.game_title;
    document.getElementById("teamCoach").value = team.coach_name;
    document.getElementById("teamDate").value = team.created_date;
    document.getElementById("teamFormTitle").textContent = "✏️ Edit Team";
  } catch (err) {
    showNotification("Error: " + err.message, "error");
  }
}

async function deleteTeam(id) {
  if (!confirm("Are you sure you want to delete this team?")) return;

  try {
    const response = await apiCall(`/teams/${id}`, "DELETE");
    if (!response.ok) throw new Error("Failed to delete team");
    showNotification("Team deleted!");
    loadTeams();
  } catch (err) {
    showNotification("Error: " + err.message, "error");
  }
}

function clearTeamForm() {
  document.getElementById("editTeamId").value = "";
  document.getElementById("teamName").value = "";
  document.getElementById("teamGame").value = "";
  document.getElementById("teamCoach").value = "";
  document.getElementById("teamDate").value = "";
  document.getElementById("teamFormTitle").textContent = "➕ Add New Team";
}

// =====================================
// PLAYER FUNCTIONS
// =====================================
async function loadPlayers() {
  try {
    const response = await apiCall("/players");
    if (!response.ok) throw new Error("Failed to load players");
    const players = await response.json();

    const tbody = document.getElementById("playersBody");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (players.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:2rem;">No players yet. Add one!</td></tr>';
      return;
    }

    players.forEach((player) => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${player.player_name}</td>
        <td>${player.gamer_tag}</td>
        <td>${player.role}</td>
        <td>${player.age || "—"}</td>
        <td>${player.join_date || "—"}</td>
        <td>
          <button class="action-btn edit" onclick="editPlayer(${player.player_id})">✏️ Edit</button>
          <button class="action-btn delete" onclick="deletePlayer(${player.player_id})">🗑️ Delete</button>
        </td>
      `;
    });
  } catch (err) {
    console.error("Error loading players:", err);
  }
}

async function savePlayer() {
  const playerId = document.getElementById("editPlayerId")?.value;
  const teamId = document.getElementById("playerTeam")?.value;
  const playerName = document.getElementById("playerName")?.value;
  const gamerTag = document.getElementById("playerTag")?.value;
  const role = document.getElementById("playerRole")?.value;
  const age = document.getElementById("playerAge")?.value;
  const joinDateInput = document.getElementById("playerJoinDate") || document.getElementById("playerJoin");
  const joinDate = joinDateInput?.value;

  if (!teamId || !playerName || !gamerTag || !role) {
    showNotification("Required fields are missing", "error");
    return;
  }

  const data = {
    team_id: parseInt(teamId),
    player_name: playerName,
    gamer_tag: gamerTag,
    role,
    age: age ? parseInt(age) : null,
    join_date: joinDate || null,
  };

  try {
    let response;
    if (playerId) {
      response = await apiCall(`/players/${playerId}`, "PUT", data);
    } else {
      response = await apiCall("/players", "POST", data);
    }

    if (!response.ok) throw new Error("Failed to save player");
    showNotification(playerId ? "Player updated!" : "Player created!");
    clearPlayerForm();
    loadPlayers();
  } catch (err) {
    showNotification("Error: " + err.message, "error");
  }
}

async function editPlayer(id) {
  try {
    const response = await apiCall(`/players/${id}`);
    if (!response.ok) throw new Error("Failed to load player");
    const player = await response.json();

    document.getElementById("editPlayerId").value = id;
    document.getElementById("playerTeam").value = player.team_id;
    document.getElementById("playerName").value = player.player_name;
    document.getElementById("playerTag").value = player.gamer_tag;
    document.getElementById("playerRole").value = player.role;
    document.getElementById("playerAge").value = player.age;
    const joinDateInput = document.getElementById("playerJoinDate") || document.getElementById("playerJoin");
    if (joinDateInput) joinDateInput.value = player.join_date;
    document.getElementById("playerFormTitle").textContent = "✏️ Edit Player";
  } catch (err) {
    showNotification("Error: " + err.message, "error");
  }
}

async function deletePlayer(id) {
  if (!confirm("Are you sure you want to remove this player?")) return;

  try {
    const response = await apiCall(`/players/${id}`, "DELETE");
    if (!response.ok) throw new Error("Failed to delete player");
    showNotification("Player removed!");
    loadPlayers();
  } catch (err) {
    showNotification("Error: " + err.message, "error");
  }
}

function clearPlayerForm() {
  document.getElementById("editPlayerId").value = "";
  document.getElementById("playerTeam").value = "";
  document.getElementById("playerName").value = "";
  document.getElementById("playerTag").value = "";
  document.getElementById("playerRole").value = "";
  document.getElementById("playerAge").value = "";
  const joinDateInput = document.getElementById("playerJoinDate") || document.getElementById("playerJoin");
  if (joinDateInput) joinDateInput.value = "";
  document.getElementById("playerFormTitle").textContent = "➕ Add New Player";
}

// =====================================
// TOURNAMENT FUNCTIONS
// =====================================
async function loadTournaments() {
  try {
    const response = await apiCall("/tournaments");
    if (!response.ok) throw new Error("Failed to load tournaments");
    const tournaments = await response.json();

    const tbody = document.getElementById("tournamentsBody");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (tournaments.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:2rem;">No tournaments yet.</td></tr>';
      return;
    }

    tournaments.forEach((t) => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${t.tournament_name}</td>
        <td>${t.location}</td>
        <td>${t.start_date || "—"}</td>
        <td>$${(t.prize_pool || 0).toLocaleString()}</td>
        <td>
          <button class="action-btn edit" onclick="editTournament(${t.tournament_id})">✏️ Edit</button>
          <button class="action-btn delete" onclick="deleteTournament(${t.tournament_id})">🗑️ Delete</button>
        </td>
      `;
    });
  } catch (err) {
    console.error("Error loading tournaments:", err);
  }
}

async function saveTournament() {
  const tourId = document.getElementById("editTournamentId")?.value;
  const tourName = document.getElementById("tourName")?.value;
  const location = document.getElementById("tourLocation")?.value;
  const startDate = document.getElementById("tourStart")?.value;
  const endDate = document.getElementById("tourEnd")?.value;
  const prizePool = document.getElementById("tourPrize")?.value;

  if (!tourName || !location) {
    showNotification("Tournament name and location are required", "error");
    return;
  }

  const data = {
    tournament_name: tourName,
    location,
    start_date: startDate || null,
    end_date: endDate || null,
    prize_pool: prizePool ? parseFloat(prizePool) : 0,
  };

  try {
    let response;
    if (tourId) {
      response = await apiCall(`/tournaments/${tourId}`, "PUT", data);
    } else {
      response = await apiCall("/tournaments", "POST", data);
    }

    if (!response.ok) throw new Error("Failed to save tournament");
    showNotification(tourId ? "Tournament updated!" : "Tournament created!");
    clearTournamentForm();
    loadTournaments();
  } catch (err) {
    showNotification("Error: " + err.message, "error");
  }
}

async function editTournament(id) {
  try {
    const response = await apiCall(`/tournaments/${id}`);
    if (!response.ok) throw new Error("Failed to load tournament");
    const t = await response.json();

    document.getElementById("editTournamentId").value = id;
    document.getElementById("tourName").value = t.tournament_name;
    document.getElementById("tourLocation").value = t.location;
    document.getElementById("tourStart").value = t.start_date;
    document.getElementById("tourEnd").value = t.end_date;
    document.getElementById("tourPrize").value = t.prize_pool;
    document.getElementById("tourFormTitle").textContent = "✏️ Edit Tournament";
  } catch (err) {
    showNotification("Error: " + err.message, "error");
  }
}

async function deleteTournament(id) {
  if (!confirm("Are you sure you want to delete this tournament?")) return;

  try {
    const response = await apiCall(`/tournaments/${id}`, "DELETE");
    if (!response.ok) throw new Error("Failed to delete tournament");
    showNotification("Tournament deleted!");
    loadTournaments();
  } catch (err) {
    showNotification("Error: " + err.message, "error");
  }
}

function clearTournamentForm() {
  document.getElementById("editTournamentId").value = "";
  document.getElementById("tourName").value = "";
  document.getElementById("tourLocation").value = "";
  document.getElementById("tourStart").value = "";
  document.getElementById("tourEnd").value = "";
  document.getElementById("tourPrize").value = "";
  document.getElementById("tourFormTitle").textContent = "➕ Add Tournament";
}

// =====================================
// MATCH FUNCTIONS
// =====================================
async function loadMatches() {
  try {
    const response = await apiCall("/matches");
    if (!response.ok) throw new Error("Failed to load matches");
    const matches = await response.json();

    const tbody = document.getElementById("matchesBody");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (matches.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:2rem;">No matches scheduled.</td></tr>';
      return;
    }

    matches.forEach((m) => {
      const resultColor =
        m.result === "Win"
          ? "var(--success)"
          : m.result === "Loss"
            ? "var(--danger)"
            : "var(--warning)";
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>Match #${m.match_id}</td>
        <td>${m.opponent_team}</td>
        <td>${m.match_date || "—"}</td>
        <td>${m.score || "—"}</td>
        <td><span style="color:${resultColor};font-weight:bold;">${m.result || "Pending"}</span></td>
        <td>
          <button class="action-btn edit" onclick="editMatch(${m.match_id})">✏️ Edit</button>
          <button class="action-btn delete" onclick="deleteMatch(${m.match_id})">🗑️ Delete</button>
        </td>
      `;
    });
  } catch (err) {
    console.error("Error loading matches:", err);
  }
}

async function saveMatch() {
  const matchId = document.getElementById("editMatchId")?.value;
  const teamId = document.getElementById("matchTeam")?.value;
  const opponent = document.getElementById("matchOpponent")?.value;
  const matchDate = document.getElementById("matchDate")?.value;
  const score = document.getElementById("matchScore")?.value;
  const result = document.getElementById("matchResult")?.value;

  if (!teamId || !opponent) {
    showNotification("Team and opponent are required", "error");
    return;
  }

  const data = {
    team_id: parseInt(teamId),
    opponent_team: opponent,
    match_date: matchDate || null,
    score: score || null,
    result: result || null,
  };

  try {
    let response;
    if (matchId) {
      response = await apiCall(`/matches/${matchId}`, "PUT", data);
    } else {
      response = await apiCall("/matches", "POST", data);
    }

    if (!response.ok) throw new Error("Failed to save match");
    showNotification(matchId ? "Match updated!" : "Match scheduled!");
    clearMatchForm();
    loadMatches();
  } catch (err) {
    showNotification("Error: " + err.message, "error");
  }
}

async function editMatch(id) {
  try {
    const response = await apiCall(`/matches/${id}`);
    if (!response.ok) throw new Error("Failed to load match");
    const m = await response.json();

    document.getElementById("editMatchId").value = id;
    document.getElementById("matchTeam").value = m.team_id;
    document.getElementById("matchOpponent").value = m.opponent_team;
    document.getElementById("matchDate").value = m.match_date;
    document.getElementById("matchScore").value = m.score;
    document.getElementById("matchResult").value = m.result;
    document.getElementById("matchFormTitle").textContent = "✏️ Edit Match";
  } catch (err) {
    showNotification("Error: " + err.message, "error");
  }
}

async function deleteMatch(id) {
  if (!confirm("Are you sure you want to delete this match?")) return;

  try {
    const response = await apiCall(`/matches/${id}`, "DELETE");
    if (!response.ok) throw new Error("Failed to delete match");
    showNotification("Match deleted!");
    loadMatches();
  } catch (err) {
    showNotification("Error: " + err.message, "error");
  }
}

function clearMatchForm() {
  document.getElementById("editMatchId").value = "";
  document.getElementById("matchTeam").value = "";
  document.getElementById("matchOpponent").value = "";
  document.getElementById("matchDate").value = "";
  document.getElementById("matchScore").value = "";
  document.getElementById("matchResult").value = "";
  document.getElementById("matchFormTitle").textContent = "➕ Schedule Match";
}

// =====================================
// TRAINING FUNCTIONS
// =====================================
async function loadTrainingSessions() {
  try {
    const response = await apiCall("/training");
    if (!response.ok) throw new Error("Failed to load sessions");
    const sessions = await response.json();

    const tbody = document.getElementById("trainingBody");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (sessions.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:2rem;">No training sessions yet.</td></tr>';
      return;
    }

    sessions.forEach((s) => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>Session #${s.session_id}</td>
        <td>${s.session_date || "—"}</td>
        <td>${s.duration_hours || "—"} hrs</td>
        <td>${s.focus_area || "—"}</td>
        <td>
          <button class="action-btn edit" onclick="editTraining(${s.session_id})">✏️ Edit</button>
          <button class="action-btn delete" onclick="deleteTraining(${s.session_id})">🗑️ Delete</button>
        </td>
      `;
    });
  } catch (err) {
    console.error("Error loading training sessions:", err);
  }
}

async function saveTrainingSession() {
  const sessionId = document.getElementById("editTrainingId") ? document.getElementById("editTrainingId").value : document.getElementById("editSessionId")?.value;
  const teamId = document.getElementById("trainingTeam") ? document.getElementById("trainingTeam").value : document.getElementById("sessionTeam")?.value;
  const sessionDate = document.getElementById("trainingDate") ? document.getElementById("trainingDate").value : document.getElementById("sessionDate")?.value;
  const duration = document.getElementById("trainingDuration") ? document.getElementById("trainingDuration").value : document.getElementById("sessionHours")?.value;
  const focusArea = document.getElementById("trainingFocus") ? document.getElementById("trainingFocus").value : document.getElementById("sessionFocus")?.value;

  if (!teamId) {
    showNotification("Team is required", "error");
    return;
  }

  const data = {
    team_id: parseInt(teamId),
    session_date: sessionDate || null,
    duration_hours: duration ? parseInt(duration) : null,
    focus_area: focusArea || null,
  };

  try {
    let response;
    if (sessionId) {
      response = await apiCall(`/training/${sessionId}`, "PUT", data);
    } else {
      response = await apiCall("/training", "POST", data);
    }

    if (!response.ok) throw new Error("Failed to save session");
    showNotification(sessionId ? "Session updated!" : "Session created!");
    clearTrainingForm();
    loadTrainingSessions();
  } catch (err) {
    showNotification("Error: " + err.message, "error");
  }
}

async function editTraining(id) {
  try {
    const response = await apiCall(`/training/${id}`);
    if (!response.ok) throw new Error("Failed to load session");
    const s = await response.json();

    const editIdEl = document.getElementById("editTrainingId") || document.getElementById("editSessionId");
    if (editIdEl) editIdEl.value = id;
    const teamEl = document.getElementById("trainingTeam") || document.getElementById("sessionTeam");
    if (teamEl) teamEl.value = s.team_id;
    const dateEl = document.getElementById("trainingDate") || document.getElementById("sessionDate");
    if (dateEl) dateEl.value = s.session_date;
    const durationEl = document.getElementById("trainingDuration") || document.getElementById("sessionHours");
    if (durationEl) durationEl.value = s.duration_hours;
    const focusEl = document.getElementById("trainingFocus") || document.getElementById("sessionFocus");
    if (focusEl) focusEl.value = s.focus_area;
    const formTitleEl = document.getElementById("trainingFormTitle");
    if (formTitleEl) formTitleEl.textContent = "✏️ Edit Session";
  } catch (err) {
    showNotification("Error: " + err.message, "error");
  }
}

async function deleteTraining(id) {
  if (!confirm("Are you sure you want to delete this training session?"))
    return;

  try {
    const response = await apiCall(`/training/${id}`, "DELETE");
    if (!response.ok) throw new Error("Failed to delete session");
    showNotification("Session deleted!");
    loadTrainingSessions();
  } catch (err) {
    showNotification("Error: " + err.message, "error");
  }
}

function clearTrainingForm() {
  const editIdEl = document.getElementById("editTrainingId") || document.getElementById("editSessionId");
  if (editIdEl) editIdEl.value = "";
  const teamEl = document.getElementById("trainingTeam") || document.getElementById("sessionTeam");
  if (teamEl) teamEl.value = "";
  const dateEl = document.getElementById("trainingDate") || document.getElementById("sessionDate");
  if (dateEl) dateEl.value = "";
  const durationEl = document.getElementById("trainingDuration") || document.getElementById("sessionHours");
  if (durationEl) durationEl.value = "";
  const focusEl = document.getElementById("trainingFocus") || document.getElementById("sessionFocus");
  if (focusEl) focusEl.value = "";
  const formTitleEl = document.getElementById("trainingFormTitle");
  if (formTitleEl) formTitleEl.textContent = "➕ New Session";
}

// =====================================
// MANAGE PAGE TAB SWITCHING
// =====================================
function showTab(tab) {
  const tabs = ["teams", "players", "tournaments", "matches", "training"];
  const sidebarLinks = [
    "sl-teams",
    "sl-players",
    "sl-tournaments",
    "sl-matches",
    "sl-training",
  ];

  tabs.forEach((t) => {
    const elem = document.getElementById(`tab-${t}`);
    if (elem) elem.style.display = tab === t ? "block" : "none";
  });

  sidebarLinks.forEach((link) => {
    const elem = document.getElementById(link);
    if (elem)
      elem.classList.toggle("active", link === `sl-${tab}`);
  });

  if (tab === "teams") loadTeams();
  if (tab === "players") loadPlayers();
  if (tab === "tournaments") loadTournaments();
  if (tab === "matches") loadMatches();
  if (tab === "training") loadTrainingSessions();
}

// =====================================
// TABLE FILTER
// =====================================
function filterTable(tableBodyId, searchText) {
  const tbody = document.getElementById(tableBodyId);
  if (!tbody) return;

  const rows = tbody.getElementsByTagName("tr");
  searchText = searchText.toLowerCase();

  Array.from(rows).forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchText) ? "" : "none";
  });
}

// =====================================
// PAGE INITIALIZATION
// =====================================
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in for protected pages
  const protectedPages = ["dashboard.html", "manage.html"];
  const currentPage = window.location.pathname.split("/").pop();

  if (
    protectedPages.some((p) => currentPage.includes(p)) &&
    !isAuthenticated()
  ) {
    window.location.href = "login.html";
    return;
  }

  // Load data for dashboard
  if (currentPage.includes("dashboard")) {
    loadDashboardStats();
  }

  // Load initial data for manage page
  if (currentPage.includes("manage")) {
    showTab("teams");
  }

  // Populate team dropdowns
  const teamSelects = document.querySelectorAll("#playerTeam, #matchTeam, #trainingTeam, #sessionTeam");
  teamSelects.forEach(async (select) => {
    try {
      const response = await apiCall("/teams");
      if (!response.ok) return;
      const teams = await response.json();
      teams.forEach((team) => {
        const option = document.createElement("option");
        option.value = team.team_id;
        option.textContent = team.team_name;
        select.appendChild(option);
      });
    } catch (err) {
      console.error("Error loading teams:", err);
    }
  });
});
