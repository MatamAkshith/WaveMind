import { useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  Clock3,
  Heart,
  Trash2,
} from "lucide-react";
import {
  createMood,
  deleteMood,
  getMoods,
} from "../../lib/moods.js";

const moodOptions = [
  { value: "happy", label: "Happy", emoji: "😊", color: "#DDF4E5" },
  { value: "calm", label: "Calm", emoji: "😌", color: "#DDF2F4" },
  { value: "neutral", label: "Neutral", emoji: "😐", color: "#F9F2CF" },
  { value: "sad", label: "Sad", emoji: "😔", color: "#E8EEFA" },
  { value: "anxious", label: "Anxious", emoji: "😟", color: "#FFF0D8" },
  { value: "angry", label: "Angry", emoji: "😠", color: "#FDE8E7" },
  { value: "stressed", label: "Stressed", emoji: "😣", color: "#FFE8DC" },
  { value: "excited", label: "Excited", emoji: "🤩", color: "#E5E1FF" },
  { value: "tired", label: "Tired", emoji: "😴", color: "#EEEAF8" },
];

const initialForm = {
  category: "neutral",
  intensity: 5,
  reflection: "",
};

function getMoodOption(category) {
  return moodOptions.find((mood) => mood.value === category);
}

function formatDate(value) {
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function ErrorMessage({ children }) {
  return (
    <div className="mood-tracker-error" role="alert">
      <AlertCircle size={16} />
      <span>{children}</span>
    </div>
  );
}

function MoodTracker({ token, onTokenInvalid }) {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMoods() {
      setLoading(true);
      setError("");
      try {
        const moods = await getMoods({ token });
        if (!cancelled) setEntries(moods);
      } catch (requestError) {
        if (requestError.status === 401) {
          onTokenInvalid();
        } else if (!cancelled) {
          setError(requestError.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMoods();
    return () => {
      cancelled = true;
    };
  }, [onTokenInvalid, token]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const created = await createMood(form, token);
      setEntries((current) => [created, ...current]);
      setForm(initialForm);
      setSuccess("Your mood check-in was saved.");
    } catch (requestError) {
      if (requestError.status === 401) {
        onTokenInvalid();
      } else {
        setError(requestError.message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    setError("");
    setSuccess("");
    try {
      await deleteMood(id, token);
      setEntries((current) => current.filter((entry) => entry.id !== id));
      setSuccess("Mood entry deleted.");
    } catch (requestError) {
      if (requestError.status === 401) {
        onTokenInvalid();
      } else {
        setError(requestError.message);
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mood-tracker-content">
      <section className="mood-tracker-header">
        <div>
          <div className="eyebrow"><Heart size={14} /> YOUR EMOTIONAL LANDSCAPE</div>
          <h1>Track how you&apos;re feeling.</h1>
          <p>Notice the patterns, without judging the moment.</p>
        </div>
        <div className="mood-tracker-header-icon"><Heart size={26} /></div>
      </section>

      <div className="mood-tracker-grid">
        <form className="panel mood-entry-panel" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <div>
              <div className="section-kicker">NEW CHECK-IN</div>
              <h2>How are you feeling right now?</h2>
            </div>
          </div>

          <div className="tracker-mood-options">
            {moodOptions.map((mood) => (
              <button
                type="button"
                key={mood.value}
                className={`tracker-mood-option ${
                  form.category === mood.value ? "selected" : ""
                }`}
                onClick={() => setForm({ ...form, category: mood.value })}
                aria-pressed={form.category === mood.value}
              >
                <span style={{ background: mood.color }}>{mood.emoji}</span>
                {mood.label}
              </button>
            ))}
          </div>

          <label className="intensity-label" htmlFor="mood-intensity">
            Intensity <strong>{form.intensity}/10</strong>
          </label>
          <input
            id="mood-intensity"
            className="intensity-slider"
            type="range"
            min="1"
            max="10"
            value={form.intensity}
            onChange={(event) =>
              setForm({ ...form, intensity: Number(event.target.value) })
            }
          />
          <div className="intensity-scale"><span>Gentle</span><span>Strong</span></div>

          <label className="reflection-label" htmlFor="mood-reflection">
            Reflection <span>Optional</span>
          </label>
          <textarea
            id="mood-reflection"
            value={form.reflection}
            onChange={(event) =>
              setForm({ ...form, reflection: event.target.value })
            }
            maxLength={2000}
            placeholder="What is this feeling telling you?"
          />
          <div className="character-count">{form.reflection.length}/2000</div>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <div className="mood-tracker-success"><Check size={16} /> {success}</div>}
          <button className="primary-button full-button" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save check-in"} <Check size={15} />
          </button>
        </form>

        <section className="panel mood-history-panel">
          <div className="panel-heading">
            <div>
              <div className="section-kicker">YOUR HISTORY</div>
              <h2>Recent mood entries</h2>
            </div>
            <Clock3 size={20} className="history-icon" />
          </div>
          {loading ? (
            <p className="mood-tracker-state">Loading your mood history...</p>
          ) : entries.length === 0 ? (
            <p className="mood-tracker-state">No mood entries yet. Your first check-in will appear here.</p>
          ) : (
            <div className="mood-history-list">
              {entries.map((entry) => {
                const mood = getMoodOption(entry.category);
                return (
                  <article className="mood-history-entry" key={entry.id}>
                    <div className="history-entry-icon" style={{ background: mood?.color }}>
                      {mood?.emoji}
                    </div>
                    <div className="history-entry-copy">
                      <div className="history-entry-title">
                        <strong>{mood?.label || entry.category}</strong>
                        <span>{entry.intensity}/10</span>
                      </div>
                      <time dateTime={entry.created_at}>{formatDate(entry.created_at)}</time>
                      {entry.reflection && <p>{entry.reflection}</p>}
                    </div>
                    <button
                      className="icon-button delete-mood-button"
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      aria-label={`Delete ${mood?.label || "mood"} entry`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function AuthenticatedMoodTracker({ token, onTokenInvalid }) {
  return <MoodTracker token={token} onTokenInvalid={onTokenInvalid} />;
}
