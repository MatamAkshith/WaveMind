import { useEffect, useState } from "react";
import { AlertCircle, Heart, Sparkles, Target } from "lucide-react";
import { getInsights } from "../../lib/insights.js";

export default function Insights({ token, onTokenInvalid }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    getInsights(token).then(setData).catch((e) => e.status === 401 ? onTokenInvalid() : setError(e.message));
  }, [onTokenInvalid, token]);
  return <div className="insights-content"><section className="insights-header"><div><div className="eyebrow"><Sparkles size={14} /> YOUR PERSONAL PATTERNS</div><h1>Insights for your journey.</h1><p>A gentle snapshot from the check-ins and habits you choose to track.</p></div><div className="insights-header-icon"><Sparkles size={26} /></div></section>{error && <div className="mood-tracker-error" role="alert"><AlertCircle size={16} /> {error}</div>}{!data && !error ? <p className="mood-tracker-state">Gathering your insights...</p> : data && <><div className="insight-cards"><article className="panel insight-card"><Heart size={20} /><strong>{data.mood_count}</strong><span>Mood check-ins</span></article><article className="panel insight-card"><Target size={20} /><strong>{data.habit_completion_percent}%</strong><span>Habit completion</span></article><article className="panel insight-card"><Sparkles size={20} /><strong>{data.top_mood || "—"}</strong><span>Most recorded mood</span></article></div><section className="panel insight-message"><div className="section-kicker">A NOTE FOR YOU</div><h2>{data.message}</h2><p>{data.average_mood_intensity ? `Average mood intensity: ${data.average_mood_intensity}/10.` : "Keep checking in to reveal more of your personal pattern."}</p></section></>}</div>;
}
