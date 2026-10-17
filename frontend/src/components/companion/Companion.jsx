import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Bot,
  ChevronLeft,
  Heart,
  MessageSquarePlus,
  RefreshCw,
  Send,
  User,
} from "lucide-react";
import {
  getConversationMessages,
  listConversations,
  sendCompanionMessageWithOptions,
} from "../../lib/companion.js";

function timestamp(value) {
  return new Date(value || Date.now()).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function companionErrorMessage(requestError) {
  if (requestError.status === 429) {
    return "The AI provider has reached its usage limit. Please try again later or configure a Gemini API key with available quota.";
  }
  if (requestError.status === 502 || requestError.status === 503) {
    return "The AI provider is temporarily unavailable. Please try again shortly.";
  }
  return requestError.message || "The companion could not respond.";
}

export default function Companion({ token, onTokenInvalid }) {
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState("");
  const lastMessage = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingHistory(true);
    listConversations(token)
      .then(async (items) => {
        if (cancelled) return;
        setConversations(items);
        if (items.length > 0) {
          setConversationId(items[0].id);
          const restored = await getConversationMessages(items[0].id, token);
          if (!cancelled) setMessages(restored.map((message) => ({
            id: String(message.id),
            role: message.role,
            text: message.content,
            time: timestamp(message.created_at),
          })));
        }
      })
      .catch((requestError) => {
        if (requestError.status === 401) onTokenInvalid();
        else if (!cancelled) setError(requestError.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });
    return () => {
      cancelled = true;
    };
  }, [onTokenInvalid, token]);

  async function selectConversation(id) {
    if (pending || id === conversationId) return;
    setError("");
    setLoadingHistory(true);
    try {
      const restored = await getConversationMessages(id, token);
      setConversationId(id);
      setMessages(restored.map((message) => ({
        id: String(message.id),
        role: message.role,
        text: message.content,
        time: timestamp(message.created_at),
      })));
    } catch (requestError) {
      if (requestError.status === 401) onTokenInvalid();
      else setError(requestError.message);
    } finally {
      setLoadingHistory(false);
    }
  }

  function startNewConversation() {
    if (pending) return;
    setConversationId(null);
    setMessages([]);
    setDraft("");
    setError("");
    lastMessage.current = null;
  }

  async function sendMessage(event, retry = false) {
    event?.preventDefault();
    const payload = lastMessage.current;
    const message = (retry ? payload?.text : draft).trim();
    if (!message || pending) return;
    const clientMessageId = retry
      ? payload.clientMessageId
      : crypto.randomUUID();
    setPending(true);
    setError("");
    lastMessage.current = {
      text: message,
      clientMessageId,
      conversationId,
    };
    if (!retry) {
      setMessages((current) => [
        ...current,
        {
          id: clientMessageId,
          role: "user",
          text: message,
          time: timestamp(),
        },
      ]);
    }
    try {
      const response = await sendCompanionMessageWithOptions(
        message,
        {
          conversation_id: retry ? payload.conversationId : conversationId,
          client_message_id: clientMessageId,
        },
        token
      );
      setConversationId(response.conversation_id);
      setDraft("");
      setMessages((current) => [
        ...current,
        {
          id: String(response.assistant_message_id),
          role: "assistant",
          text: response.reply,
          time: timestamp(),
          safety: response.safety_intervention,
        },
      ]);
      try {
        const updatedConversations = await listConversations(token);
        setConversations(updatedConversations);
      } catch {
        setError("Your response was saved, but chat history could not refresh.");
      }
      lastMessage.current = null;
    } catch (requestError) {
      if (requestError.status === 401) onTokenInvalid();
      else {
        setDraft(message);
        setError(companionErrorMessage(requestError));
      }
    } finally {
      setPending(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(event);
    }
  }

  return (
    <div className="companion-page">
      <section className="companion-header">
        <div>
          <div className="eyebrow"><Heart size={14} /> YOUR AI EMOTIONAL COMPANION</div>
          <h1>A space to talk it all out.</h1>
          <p>Share what is on your mind. I&apos;ll meet you with care, without judgment.</p>
        </div>
        <div className="companion-header-icon"><Bot size={27} /></div>
      </section>

      <section className="companion-workspace">
        <aside className="companion-history panel">
          <div className="companion-history-heading">
            <div>
              <div className="section-kicker">YOUR SPACE</div>
              <h2>Conversations</h2>
            </div>
            <button type="button" className="history-new-button" onClick={startNewConversation} disabled={pending} aria-label="Start new conversation">
              <MessageSquarePlus size={17} />
            </button>
          </div>
          <button type="button" className="new-conversation-button" onClick={startNewConversation} disabled={pending}>
            <MessageSquarePlus size={15} /> New conversation
          </button>
          <div className="companion-history-list">
            {loadingHistory && <p className="companion-history-state">Loading history...</p>}
            {!loadingHistory && conversations.length === 0 && (
              <p className="companion-history-state">Your saved conversations will appear here.</p>
            )}
            {conversations.map((conversation) => (
              <button
                type="button"
                key={conversation.id}
                className={`conversation-item ${conversation.id === conversationId ? "active" : ""}`}
                onClick={() => selectConversation(conversation.id)}
                disabled={pending}
              >
                <MessageSquarePlus size={15} />
                <span>{conversation.title}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="companion-chat panel">
          <div className="companion-chat-bar">
            <div className="companion-avatar"><Bot size={18} /></div>
            <div><strong>WaveMind companion</strong><span>Private session · here to listen</span></div>
            {conversationId && <span className="companion-history-label"><ChevronLeft size={13} /> Saved</span>}
          </div>
          <div className="companion-messages" aria-live="polite">
            {loadingHistory && <div className="companion-empty"><p>Restoring your conversation...</p></div>}
            {!loadingHistory && messages.length === 0 && (
              <div className="companion-empty">
                <div className="companion-empty-icon"><Heart size={24} /></div>
                <h2>Start wherever you are.</h2>
                <p>You can talk about your day, a feeling, or something you&apos;re working through.</p>
              </div>
            )}
            {!loadingHistory && messages.map((message) => (
              <div className={`companion-message-row ${message.role}`} key={message.id}>
                <div className="message-avatar">{message.role === "assistant" ? <Bot size={15} /> : <User size={15} />}</div>
                <div className={`companion-message ${message.safety ? "safety-message" : ""}`}>
                  <p>{message.text}</p>
                  <time>{message.time}</time>
                </div>
              </div>
            ))}
            {pending && (
              <div className="companion-message-row assistant">
                <div className="message-avatar"><Bot size={15} /></div>
                <div className="companion-message typing-message" aria-label="Companion is responding"><span /><span /><span /></div>
              </div>
            )}
          </div>
          {error && (
            <div className="companion-error" role="alert">
              <AlertCircle size={16} /><span>{error}</span>
              <button type="button" onClick={() => sendMessage(null, true)} disabled={pending || !lastMessage.current}><RefreshCw size={14} /> Retry</button>
            </div>
          )}
          <form className="companion-composer" onSubmit={sendMessage}>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What would you like to talk about?"
              maxLength={4000}
              rows={2}
              disabled={pending || loadingHistory}
              aria-label="Message the WaveMind companion"
            />
            <div className="composer-footer">
              <span>Enter to send · Shift + Enter for a new line</span>
              <button className="primary-button" type="submit" disabled={!draft.trim() || pending || loadingHistory}>
                {pending ? "Thinking..." : "Send"} <Send size={15} />
              </button>
            </div>
          </form>
        </section>
      </section>
      <p className="companion-disclaimer">WaveMind supports reflection and wellbeing; it is not a substitute for professional care.</p>
    </div>
  );
}
