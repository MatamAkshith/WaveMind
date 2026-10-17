import { useEffect, useState } from "react";
import { Activity, AlertCircle, Check, Plus, Trash2 } from "lucide-react";
import {
  createHabit,
  deleteHabit,
  getHabits,
  updateHabit,
} from "../../lib/habits.js";

function ErrorMessage({ children }) {
  return (
    <div className="mood-tracker-error" role="alert">
      <AlertCircle size={16} />
      <span>{children}</span>
    </div>
  );
}

export default function Habits({ token, onTokenInvalid }) {
  const [habits, setHabits] = useState([]);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadHabits() {
      setLoading(true);
      setError("");
      try {
        const loadedHabits = await getHabits(token);
        if (!cancelled) setHabits(loadedHabits);
      } catch (requestError) {
        if (requestError.status === 401) onTokenInvalid();
        else if (!cancelled) setError(requestError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHabits();
    return () => {
      cancelled = true;
    };
  }, [onTokenInvalid, token]);

  async function handleCreate(event) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Give your habit a title before saving.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const created = await createHabit({ title, detail }, token);
      setHabits((current) => [...current, created]);
      setTitle("");
      setDetail("");
      setSuccess("Habit added.");
    } catch (requestError) {
      if (requestError.status === 401) onTokenInvalid();
      else setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(habit) {
    setUpdatingId(habit.id);
    setError("");
    try {
      const updated = await updateHabit(habit.id, !habit.done, token);
      setHabits((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (requestError) {
      if (requestError.status === 401) onTokenInvalid();
      else setError(requestError.message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    setError("");
    setSuccess("");
    try {
      await deleteHabit(id, token);
      setHabits((current) => current.filter((habit) => habit.id !== id));
      setSuccess("Habit deleted.");
    } catch (requestError) {
      if (requestError.status === 401) onTokenInvalid();
      else setError(requestError.message);
    } finally {
      setDeletingId(null);
    }
  }

  const completed = habits.filter((habit) => habit.done).length;
  const progress = habits.length ? Math.round((completed / habits.length) * 100) : 0;

  return (
    <div className="habits-content">
      <section className="habits-header">
        <div>
          <div className="eyebrow"><Activity size={14} /> SMALL STEPS, BIG FEELINGS</div>
          <h1>Your daily rituals.</h1>
          <p>Build momentum through small actions that support you.</p>
        </div>
        <div className="habits-header-icon"><Activity size={26} /></div>
      </section>

      <div className="habits-grid">
        <form className="panel habit-create-panel" onSubmit={handleCreate}>
          <div className="section-kicker">ADD A HABIT</div>
          <h2>What would you like to practice?</h2>
          <label>
            Habit title
            <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required />
          </label>
          <label>
            Short reminder <span>Optional</span>
            <input value={detail} onChange={(event) => setDetail(event.target.value)} maxLength={255} />
          </label>
          <button className="primary-button full-button" type="submit" disabled={saving}>
            {saving ? "Adding..." : "Add habit"} <Plus size={15} />
          </button>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <div className="mood-tracker-success" role="status"><Check size={16} /> {success}</div>}
        </form>

        <section className="panel habits-list-panel">
          <div className="panel-heading">
            <div>
              <div className="section-kicker">YOUR ROUTINE</div>
              <h2>{completed}/{habits.length} complete today</h2>
            </div>
            <strong className="habit-progress-percent">{progress}%</strong>
          </div>
          <div className="habit-progress-track full-progress"><span style={{ width: `${progress}%` }} /></div>
          {loading ? (
            <p className="mood-tracker-state">Loading your habits...</p>
          ) : habits.length === 0 ? (
            <p className="mood-tracker-state">No habits yet. Add one to get started.</p>
          ) : (
            <div className="full-habit-list">
              {habits.map((habit) => (
                <div className={`full-habit-item ${habit.done ? "habit-done" : ""}`} key={habit.id}>
                  <button
                    className="habit-item-toggle"
                    type="button"
                    onClick={() => handleToggle(habit)}
                    disabled={updatingId === habit.id}
                    aria-pressed={habit.done}
                  >
                    <span className={`habit-checkbox ${habit.done ? "checked" : ""}`}>
                      {habit.done && <Check size={14} />}
                    </span>
                    <span className="habit-copy">
                      <strong>{habit.title}</strong>
                      {habit.detail && <span>{habit.detail}</span>}
                    </span>
                  </button>
                  <button
                    className="icon-button delete-mood-button"
                    type="button"
                    onClick={() => handleDelete(habit.id)}
                    disabled={deletingId === habit.id}
                    aria-label={`Delete ${habit.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
