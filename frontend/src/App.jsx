
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Brain,
  Check,
  ChevronDown,
  CircleHelp,
  Compass,
  Heart,
  Home,
  Leaf,
  LogOut,
  Menu,
  MessageCircle,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  X,
  BookOpen,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import AuthPage from "./components/auth/AuthPage.jsx";
import Companion from "./components/companion/Companion.jsx";
import AuthenticatedMoodTracker from "./components/mood/MoodTracker.jsx";
import Journal from "./components/journal/Journal.jsx";
import Habits from "./components/habit/Habits.jsx";
import Goals from "./components/goal/Goals.jsx";
import Insights from "./components/insight/Insights.jsx";
import SettingsPage from "./components/settings/Settings.jsx";
import { createMood, getMoods } from "./lib/moods.js";
import { getHabits, updateHabit } from "./lib/habits.js";
import { API_BASE_URL } from "./lib/api.js";

const TOKEN_KEY = "wavemind_access_token";

const navigation = [
  { label: "Overview", icon: Home },
  { label: "AI Companion", icon: MessageCircle },
  { label: "Mood Tracker", icon: Heart },
  { label: "Journal", icon: BookOpen },
  { label: "Habits", icon: Activity },
  { label: "Goals", icon: Target },
  { label: "Insights", icon: TrendingUp },
];

const moods = [
  { label: "Awful", emoji: "😞", color: "#FDE8E7", category: "sad", intensity: 2 },
  { label: "Low", emoji: "😕", color: "#FFF0D8", category: "anxious", intensity: 4 },
  { label: "Okay", emoji: "😐", color: "#F9F2CF", category: "neutral", intensity: 5 },
  { label: "Good", emoji: "🙂", color: "#DDF4E5", category: "happy", intensity: 7 },
  { label: "Great", emoji: "🤩", color: "#E5E1FF", category: "excited", intensity: 9 },
];

function buildWeeklyMoodData(entries) {
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - (6 - index));
    const dayEntries = entries.filter((entry) => {
      const createdAt = new Date(entry.created_at);
      return createdAt.toDateString() === date.toDateString();
    });
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      mood: dayEntries.length
        ? Number(
            (
              dayEntries.reduce((total, entry) => total + entry.intensity, 0) /
              dayEntries.length
            ).toFixed(1)
          )
        : null,
    };
  });
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [activePage, setActivePage] = useState("Overview");
  const [selectedMood, setSelectedMood] = useState(null);
  const [savedMood, setSavedMood] = useState(null);
  const [habits, setHabits] = useState([]);
  const [moodEntries, setMoodEntries] = useState([]);
  const [apiStatus, setApiStatus] = useState("checking");
  const [dashboardError, setDashboardError] = useState("");
  const [savingMood, setSavingMood] = useState(false);
  const [updatingHabitId, setUpdatingHabitId] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showMoodNote, setShowMoodNote] = useState(false);
  const [moodNote, setMoodNote] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle(
      "reduce-motion",
      localStorage.getItem("wavemind_reduce_motion") === "true"
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function checkBackend() {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) throw new Error("Backend unavailable");
        const data = await response.json();
        if (!cancelled) {
          setApiStatus(data.status === "healthy" ? "online" : "offline");
        }
      } catch {
        if (!cancelled) setApiStatus("offline");
      }
    }

    checkBackend();
    return () => {
      cancelled = true;
    };
  }, []);

  const completedHabits = habits.filter((habit) => habit.done).length;
  const progress = habits.length
    ? Math.round((completedHabits / habits.length) * 100)
    : 0;
  const weeklyMood = buildWeeklyMoodData(moodEntries);
  const weeklyMoodCount = weeklyMood.reduce(
    (count, entry) => count + (entry.mood === null ? 0 : 1),
    0
  );

  const handleLogin = useCallback((nextToken) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setSavedMood(null);
    setSelectedMood(null);
    setMoodNote("");
    setShowMoodNote(false);
    setActivePage("Overview");
    setMobileMenu(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      setDashboardError("");
      try {
        const [loadedMoods, loadedHabits] = await Promise.all([
          getMoods({ token }),
          getHabits(token),
        ]);
        if (!cancelled) {
          setMoodEntries(loadedMoods);
          setHabits(loadedHabits);
        }
      } catch (requestError) {
        if (requestError.status === 401) handleLogout();
        else if (!cancelled) setDashboardError(requestError.message);
      }
    }

    loadDashboardData();
    return () => {
      cancelled = true;
    };
  }, [handleLogout, token]);

  async function toggleHabit(habit) {
    setUpdatingHabitId(habit.id);
    setDashboardError("");
    try {
      const updated = await updateHabit(habit.id, !habit.done, token);
      setHabits((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (requestError) {
      if (requestError.status === 401) handleLogout();
      else setDashboardError(requestError.message);
    } finally {
      setUpdatingHabitId(null);
    }
  }

  async function saveMood() {
    if (selectedMood === null) return;
    setSavingMood(true);
    setDashboardError("");
    try {
      const selected = moods[selectedMood];
      const created = await createMood(
        {
          category: selected.category,
          intensity: selected.intensity,
          reflection: moodNote,
        },
        token
      );
      setMoodEntries((current) => [created, ...current]);
      setSavedMood({
        ...selected,
        note: moodNote.trim(),
        date: new Date().toLocaleDateString(),
      });
      setShowMoodNote(false);
      setMoodNote("");
    } catch (requestError) {
      if (requestError.status === 401) handleLogout();
      else setDashboardError(requestError.message);
    } finally {
      setSavingMood(false);
    }
  }

  function navigateTo(label) {
    setActivePage(label);
    setMobileMenu(false);
  }

  if (!token) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      {mobileMenu && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Brain size={23} /></div>
          <div>
            <div className="brand-name">wavemind<span>.</span></div>
            <div className="brand-tagline">YOUR SPACE TO GROW</div>
          </div>
          {dashboardError && (
            <div className="mood-tracker-error" role="alert">
              {dashboardError}
            </div>
          )}
          <button
            className="icon-button mobile-close"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activePage === label ? "nav-active" : ""}`}
              onClick={() => navigateTo(label)}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {label === "AI Companion" && <span className="nav-dot" />}
            </button>
          ))}
        </nav>

        <button className="nav-item settings-item" onClick={() => navigateTo("Settings")}>
          <Settings size={18} />
          <span>Settings</span>
        </button>
        <button className="nav-item logout-item" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu-button"
              aria-label="Open navigation"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={21} />
            </button>
            <div className="breadcrumb">Workspace <span>/</span> {activePage}</div>
          </div>
          <div className="topbar-right">
            <div className={`connection-pill ${apiStatus}`}>
              <span className="connection-dot" />
              {apiStatus === "checking"
                ? "Checking API"
                : apiStatus === "online"
                ? "API connected"
                : "API offline"}
            </div>
            <div className="date-chip">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </header>

        {activePage === "Overview" ? (
          <div className="dashboard-content">
            <section className="welcome-section">
              <div>
                <div className="eyebrow"><Sparkles size={14} /> YOUR PERSONAL GROWTH SPACE</div>
                <h1>Make room for <span>yourself.</span></h1>
                <p className="welcome-copy">
                  Every small step counts. Let's see how you're doing today.
                </p>
              </div>
              <div className="welcome-art" aria-hidden="true">
                <div className="art-orbit orbit-one" />
                <div className="art-orbit orbit-two" />
                <div className="art-sun"><Heart size={25} /></div>
                <div className="art-star star-one">✳</div>
                <div className="art-star star-two">✦</div>
                <div className="art-star star-three">·</div>
              </div>
            </section>

            <section className="stats-grid">
              <article className="stat-card">
                <div className="stat-top">
                  <span className="stat-icon lilac"><Heart size={19} /></span>
                  <span className="stat-caption">THIS WEEK</span>
                </div>
                <div className="stat-value">{weeklyMoodCount} <span>check-ins</span></div>
                <div className="stat-description">Your mood check-ins this week</div>
                <div className="stat-footer positive"><ArrowUpRight size={14} /> Keep showing up</div>
              </article>

              <article className="stat-card">
                <div className="stat-top">
                  <span className="stat-icon mint"><Check size={19} /></span>
                  <span className="stat-caption">DAILY HABITS</span>
                </div>
                <div className="stat-value">{completedHabits}<span>/{habits.length}</span></div>
                <div className="stat-description">Little things add up</div>
                <div className="mini-progress"><span style={{ width: `${progress}%` }} /></div>
              </article>

              <article className="stat-card">
                <div className="stat-top">
                  <span className="stat-icon peach"><Target size={19} /></span>
                  <span className="stat-caption">PERSONAL GROWTH</span>
                </div>
                <div className="stat-value">{progress}<span>%</span></div>
                <div className="stat-description">Today's habit completion</div>
                <div className="stat-footer neutral"><Leaf size={14} /> Progress over perfection</div>
              </article>
            </section>

            <section className="content-grid">
              <div className="left-column">
                <article className="panel mood-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="section-kicker">CHECK IN WITH YOURSELF</div>
                      <h2>How are you feeling?</h2>
                      <p className="panel-subtitle">There are no wrong answers here.</p>
                    </div>
                    <div className="heading-icon"><Heart size={20} /></div>
                  </div>

                  <div className="mood-options">
                    {moods.map((mood, index) => (
                      <button
                        key={mood.label}
                        className={`mood-option ${selectedMood === index ? "mood-selected" : ""}`}
                        onClick={() => setSelectedMood(index)}
                        aria-pressed={selectedMood === index}
                      >
                        <span className="mood-face" style={{ background: mood.color }}>
                          {mood.emoji}
                        </span>
                        <span className="mood-label">{mood.label}</span>
                      </button>
                    ))}
                  </div>

                  {savedMood && (
                    <div className="saved-mood-message">
                      <Check size={16} /> Check-in saved for this session: {savedMood.emoji} {savedMood.label}
                    </div>
                  )}

                  {showMoodNote && (
                    <div className="mood-note">
                      <label htmlFor="mood-note">Anything you'd like to add? (optional)</label>
                      <textarea
                        id="mood-note"
                        value={moodNote}
                        onChange={(event) => setMoodNote(event.target.value)}
                        placeholder="What's on your mind today?"
                        maxLength={500}
                      />
                      <div className="mood-note-actions">
                        <button className="text-button" onClick={() => setShowMoodNote(false)}>Cancel</button>
                        <button className="primary-button compact" onClick={saveMood} disabled={savingMood}>
                          {savingMood ? "Saving..." : "Save check-in"}
                        </button>
                      </div>
                    </div>
                  )}

                  {!showMoodNote && (
                    <button
                      className="primary-button mood-submit"
                      disabled={selectedMood === null}
                      onClick={() => setShowMoodNote(true)}
                    >
                      Continue check-in <ArrowRight size={16} />
                    </button>
                  )}
                  <p className="privacy-note"><ShieldCheck size={14} /> Your feelings deserve a safe space.</p>
                </article>

                <article className="panel chart-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="section-kicker">YOUR EMOTIONAL LANDSCAPE</div>
                      <h2>Mood through the week</h2>
                    </div>
                    <span className="chart-period">Last 7 days <ChevronDown size={14} /></span>
                  </div>
                  <div className="chart-legend">
                    <span className="legend-dot" /> Mood intensity
                  </div>
                  <div className="chart-wrap">
                    {moodEntries.length === 0 ? (
                      <p className="mood-tracker-state">Your saved mood check-ins will appear here.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyMood} margin={{ top: 12, right: 8, left: -24, bottom: 0 }}>
                        <defs>
                          <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#9587E8" stopOpacity={0.28} />
                            <stop offset="100%" stopColor="#9587E8" stopOpacity={0.015} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="#eeedf5" strokeDasharray="4 5" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#9290a6", fontSize: 12 }} dy={10} />
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: "1px solid #eeedf5", fontSize: 12 }}
                          formatter={(value) => [`${value}/10`, "Intensity"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="mood"
                          stroke="#8979DC"
                          strokeWidth={2.5}
                          fill="url(#moodFill)"
                          activeDot={{ r: 5, fill: "#8979DC", stroke: "#fff", strokeWidth: 2 }}
                          dot={{ r: 3, fill: "#fff", stroke: "#8979DC", strokeWidth: 2 }}
                        />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </article>
              </div>

              <div className="right-column">
                <article className="panel habits-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="section-kicker">SMALL STEPS, BIG FEELINGS</div>
                      <h2>Daily rituals</h2>
                    </div>
                    <button className="icon-button subtle-button" aria-label="Add habit" onClick={() => navigateTo("Habits")}>
                      <Plus size={19} />
                    </button>
                  </div>

                  <div className="habit-progress-row">
                    <div className="habit-progress-track">
                      <span style={{ width: `${progress}%` }} />
                    </div>
                    <span>{completedHabits}/{habits.length}</span>
                  </div>

                  <div className="habit-list">
                    {habits.map((habit) => (
                      <button
                        className={`habit-item ${habit.done ? "habit-done" : ""}`}
                        key={habit.id}
                        onClick={() => toggleHabit(habit)}
                        disabled={updatingHabitId === habit.id}
                        aria-pressed={habit.done}
                      >
                        <span className={`habit-checkbox ${habit.done ? "checked" : ""}`}>
                          {habit.done && <Check size={14} />}
                        </span>
                        <span className="habit-copy">
                          <strong>{habit.title}</strong>
                          <span>{habit.detail}</span>
                        </span>
                      </button>
                    ))}
                  </div>

                  <button className="secondary-button full-button" onClick={() => navigateTo("Habits")}>
                    View all habits <ArrowRight size={15} />
                  </button>
                </article>

                <article className="companion-card">
                  <div className="companion-glow" />
                  <div className="companion-top">
                    <span className="companion-icon"><Brain size={21} /></span>
                    <span className="companion-status"><span /> HERE FOR YOU</span>
                  </div>
                  <h2>A space to talk<br />it all out.</h2>
                  <p>Sometimes, getting things off your chest is the first step forward.</p>
                  <button className="companion-button" onClick={() => navigateTo("AI Companion")}>
                    Meet your companion <ArrowRight size={16} />
                  </button>
                  <div className="companion-decoration"><MessageCircle size={57} /></div>
                </article>

                <div className="gentle-note">
                  <div className="gentle-note-icon"><CircleHelp size={18} /></div>
                  <div>
                    <strong>A gentle reminder</strong>
                    <p>This space supports reflection and wellbeing; it isn't a substitute for professional care.</p>
                  </div>
                </div>
              </div>
            </section>

            <footer className="page-footer">
              <span>Made with care for your journey <Heart size={12} /></span>
              <span>WAVEMIND · PERSONAL GROWTH SPACE</span>
            </footer>
          </div>
        ) : activePage === "AI Companion" ? (
          <Companion token={token} onTokenInvalid={handleLogout} />
        ) : activePage === "Mood Tracker" ? (
          <AuthenticatedMoodTracker
            token={token}
            onTokenInvalid={handleLogout}
          />
        ) : activePage === "Journal" ? (
          <Journal token={token} onTokenInvalid={handleLogout} />
        ) : activePage === "Habits" ? (
          <Habits token={token} onTokenInvalid={handleLogout} />
        ) : activePage === "Goals" ? (
          <Goals token={token} onTokenInvalid={handleLogout} />
        ) : activePage === "Insights" ? (
          <Insights token={token} onTokenInvalid={handleLogout} />
        ) : activePage === "Settings" ? (
          <SettingsPage token={token} onTokenInvalid={handleLogout} />
        ) : (
          <section className="placeholder-page">
            <div className="placeholder-icon"><Compass size={30} /></div>
            <div className="eyebrow">YOUR GROWTH JOURNEY</div>
            <h1>{activePage}</h1>
            <p>
              {`The ${activePage.toLowerCase()} workspace is part of the WaveMind roadmap. We'll connect it to real API endpoints in the next development phases.`}
            </p>
            <button className="primary-button" onClick={() => navigateTo("Overview")}>
              <ArrowRight size={16} /> Back to overview
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;