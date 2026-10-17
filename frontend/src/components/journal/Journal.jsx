import { useEffect, useState } from "react";
import { AlertCircle, BookOpen, Check, Trash2 } from "lucide-react";
import {
  createJournalEntry,
  deleteJournalEntry,
  getJournalEntries,
} from "../../lib/journals.js";

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

export default function Journal({ token, onTokenInvalid }) {
  const [entries, setEntries] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadEntries() {
      setLoading(true);
      setError("");
      try {
        const loadedEntries = await getJournalEntries(token);
        if (!cancelled) setEntries(loadedEntries);
      } catch (requestError) {
        if (requestError.status === 401) onTokenInvalid();
        else if (!cancelled) setError(requestError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadEntries();
    return () => {
      cancelled = true;
    };
  }, [onTokenInvalid, token]);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError("Write something before saving your entry.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const created = await createJournalEntry(trimmedContent, token);
      setEntries((current) => [created, ...current]);
      setContent("");
      setSuccess("Your journal entry was saved.");
    } catch (requestError) {
      if (requestError.status === 401) onTokenInvalid();
      else setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    setError("");
    setSuccess("");
    try {
      await deleteJournalEntry(id, token);
      setEntries((current) => current.filter((entry) => entry.id !== id));
      setSuccess("Journal entry deleted.");
    } catch (requestError) {
      if (requestError.status === 401) onTokenInvalid();
      else setError(requestError.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="journal-content">
      <section className="journal-header">
        <div>
          <div className="eyebrow"><BookOpen size={14} /> MAKE SPACE TO REFLECT</div>
          <h1>Your journal.</h1>
          <p>A private place to put today into words.</p>
        </div>
        <div className="journal-header-icon"><BookOpen size={26} /></div>
      </section>

      <div className="journal-grid">
        <form className="panel journal-editor" onSubmit={handleSubmit}>
          <div className="section-kicker">NEW ENTRY</div>
          <h2>What is on your mind?</h2>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write freely. There is no right way to reflect."
            maxLength={10000}
            aria-label="Journal entry"
          />
          <div className="journal-editor-footer">
            <span>{content.length}/10000</span>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save entry"} <Check size={15} />
            </button>
          </div>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && (
            <div className="mood-tracker-success" role="status">
              <Check size={16} /> {success}
            </div>
          )}
        </form>

        <section className="panel journal-history">
          <div className="panel-heading">
            <div>
              <div className="section-kicker">YOUR REFLECTIONS</div>
              <h2>Recent entries</h2>
            </div>
            <BookOpen size={20} className="history-icon" />
          </div>
          {loading ? (
            <p className="mood-tracker-state">Loading your journal...</p>
          ) : entries.length === 0 ? (
            <p className="mood-tracker-state">
              Your saved reflections will appear here.
            </p>
          ) : (
            <div className="journal-entry-list">
              {entries.map((entry) => (
                <article className="journal-entry" key={entry.id}>
                  <div className="journal-entry-meta">
                    <time dateTime={entry.updated_at}>{formatDate(entry.updated_at)}</time>
                    <button
                      className="icon-button delete-mood-button"
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      aria-label="Delete journal entry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p>{entry.content}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
