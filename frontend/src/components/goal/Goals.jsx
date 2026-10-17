import { useEffect, useState } from "react";
import { AlertCircle, Check, Target, Trash2 } from "lucide-react";
import { createGoal, deleteGoal, getGoals, updateGoal } from "../../lib/goals.js";

function ErrorMessage({ children }) {
  return <div className="mood-tracker-error" role="alert"><AlertCircle size={16} /><span>{children}</span></div>;
}

export default function Goals({ token, onTokenInvalid }) {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getGoals(token).then(setGoals).catch((e) => e.status === 401 ? onTokenInvalid() : setError(e.message)).finally(() => setLoading(false));
  }, [onTokenInvalid, token]);

  async function submit(event) {
    event.preventDefault();
    if (!title.trim()) return setError("Give your goal a title.");
    setSaving(true); setError(""); setSuccess("");
    try {
      const goal = await createGoal({ title, description }, token);
      setGoals((current) => [goal, ...current]); setTitle(""); setDescription(""); setSuccess("Goal added.");
    } catch (e) { if (e.status === 401) onTokenInvalid(); else setError(e.message); }
    finally { setSaving(false); }
  }

  async function changeProgress(goal, value) {
    try {
      const updated = await updateGoal(goal.id, value, token);
      setGoals((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (e) { if (e.status === 401) onTokenInvalid(); else setError(e.message); }
  }

  async function remove(id) {
    try { await deleteGoal(id, token); setGoals((current) => current.filter((goal) => goal.id !== id)); setSuccess("Goal deleted."); }
    catch (e) { if (e.status === 401) onTokenInvalid(); else setError(e.message); }
  }

  return <div className="goals-content">
    <section className="goals-header"><div><div className="eyebrow"><Target size={14} /> MOVE TOWARD WHAT MATTERS</div><h1>Your goals.</h1><p>Turn meaningful intentions into visible progress.</p></div><div className="goals-header-icon"><Target size={26} /></div></section>
    <div className="goals-grid">
      <form className="panel goal-create-panel" onSubmit={submit}><div className="section-kicker">NEW GOAL</div><h2>What are you working toward?</h2><label>Goal title<input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} required /></label><label>Description <span>Optional</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} /></label><button className="primary-button full-button" disabled={saving}>{saving ? "Adding..." : "Add goal"} <Check size={15} /></button>{error && <ErrorMessage>{error}</ErrorMessage>}{success && <div className="mood-tracker-success" role="status"><Check size={16} /> {success}</div>}</form>
      <section className="panel goals-list-panel"><div className="panel-heading"><div><div className="section-kicker">YOUR DIRECTION</div><h2>Active goals</h2></div><Target size={20} className="history-icon" /></div>{loading ? <p className="mood-tracker-state">Loading your goals...</p> : goals.length === 0 ? <p className="mood-tracker-state">No goals yet. Add one to begin.</p> : <div className="goals-list">{goals.map((goal) => <article className="goal-item" key={goal.id}><div className="goal-item-top"><strong>{goal.title}</strong><button className="icon-button delete-mood-button" onClick={() => remove(goal.id)} aria-label={`Delete ${goal.title}`}><Trash2 size={16} /></button></div>{goal.description && <p>{goal.description}</p>}<div className="goal-progress-label"><span>Progress</span><strong>{goal.progress}%</strong></div><input type="range" min="0" max="100" value={goal.progress} onChange={(e) => changeProgress(goal, e.target.value)} aria-label={`Progress for ${goal.title}`} /></article>)}</div>}</section>
    </div>
  </div>;
}
