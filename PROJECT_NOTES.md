# WaveMind: Project Specifications & Architectural Reference Document

> **Document Status**: Authoritative Baseline  
> **Last Updated**: October 13, 2026  
> **Repository Root**: `/`  
> **Target System**: WaveMind (AI-Powered Emotional Companion & Personal Growth Platform)

---

## 1. Project Identity

- **Project Title**: AI-Powered Emotional Companion and Personal Growth Platform `[CONFIRMED]`
- **Product Name**: WaveMind `[CONFIRMED]`
- **Project Category**: AI-powered personal growth, emotional reflection, and long-term personalized conversational assistance `[CONFIRMED]`
- **Academic Context**: Undergraduate Mini Project (Semester 5 / Mini Project) designed to be engineered into a technically substantial, fully demonstrable working application and accompanied by a research paper examining the integration of multi-faceted personal context into conversational AI `[CONFIRMED]`
- **Current Development Status**: Phase 0 — Repository Foundation & Skeleton Completed `[NOT YET IMPLEMENTED: Application Code]`

---

## 2. Executive Summary

WaveMind is an intelligent personal growth and emotional companion platform designed to bridge the context gap in existing conversational AI systems. Standard conversational assistants typically treat dialogue sessions in isolation or rely on transient conversational buffers, causing interactions to feel disjointed, forgetful, and impersonal.

WaveMind integrates:
1. Structured user-generated personal data (mood tracking, reflective journaling, daily habit completions, and personal goals).
2. Episodic semantic memory persistence backed by vector similarity retrieval.
3. Lightweight real-time emotion signal extraction.
4. Retrieval-Augmented Generation (RAG) coupled with large language model generation (Google Gemini API).

The system generates context-aware, empathetic, and constructive conversational responses and actionable self-improvement insights while enforcing strict user-data privacy and tenant isolation.

---

## 3. Problem Statement

### 3.1 The Problem Being Investigated
Contemporary conversational AI platforms frequently exhibit:
- **Context Amnesia**: Failure to retain and synthesize meaningful historical patterns across distinct user sessions.
- **Siloed Self-Tracking**: Conventional self-tracking applications (mood trackers, habit trackers, journaling apps) maintain isolated metrics without synthesizing them into conversational context.
- **Superficial Personalization**: Responses generated without awareness of user milestones, ongoing struggles, emotional trajectories, or active aspirations.

### 3.2 Motivation
A human being's psychological well-being, routines, habits, and long-term aspirations evolve continuously. Integrating structured self-tracking signals with semantic episodic memory allows conversational agents to provide nuanced, reflective, and tailored encouragement rather than generic boilerplate advice.

### 3.3 Intended Beneficiaries
- Students and professionals seeking a private, reflective space for journaling, habit consistency, and goal setting.
- Individuals seeking an intelligent, empathetic conversational sounding board for day-to-day reflections.
- Academic researchers investigating memory-augmented architectures and personal context retrieval.

---

## 4. Project Objectives

### 4.1 Main Objective
Design, implement, and rigorously evaluate an end-to-end, functional, web-based platform that unifies structured personal records (moods, habits, goals, journals) with long-term semantic memory and emotion signals to deliver personalized conversational interactions and actionable insights.

### 4.2 Supporting Objectives
1. **Mood & Reflection Tracking**: Enable structured logging of emotional states, valence, and reflections over time.
2. **Journaling & Self-Expression**: Provide a rich journaling experience capable of feeding episodic memory extraction.
3. **Habit & Goal Orchestration**: Track atomic habits and multi-category goals (career, wellness, learning, personal).
4. **Episodic Long-Term Memory**: Extract, embed, persist, and retrieve user-isolated memories via vector search.
5. **Emotion Signal Extraction**: Detect emotional valence/category from incoming messages using pretrained Transformer models.
6. **Context-Aware Prompt Construction & Generation**: Assemble structured context, episodic memories, and recent messages into prompt structures for Gemini API generation.
7. **Pattern Insights Engine**: Synthesize correlations between mood fluctuations, habit adherence, and goal momentum.
8. **Empirical Evaluation**: Benchmark emotion classification, retrieval precision/recall, response personalization, and end-to-end system latency.
9. **Zero Data Leakage**: Maintain absolute cryptographic and relational isolation between distinct user accounts.

### 4.3 Measurable Development Goals
- Sub-500ms API response latency for structured data endpoints.
- Sub-2000ms end-to-end latency for the full RAG chat pipeline (emotion inference + embedding + vector retrieval + Gemini generation).
- 100% test coverage for tenant isolation filters in database queries and vector searches.

---

## 5. Scope

### 5.1 Initial Implementation Scope `[CONFIRMED]`
- Single-page React application with modular dashboards, tracking views, and chat interface.
- FastAPI backend exposing RESTful endpoints for CRUD operations and AI orchestration.
- PostgreSQL database with `pgvector` for relational data and vector embeddings.
- Pretrained emotion classification and text embedding inference.
- Retrieval-Augmented Generation using the Gemini API.
- Comprehensive automated test suite (unit, integration, and evaluation suites).

### 5.2 Planned Capabilities `[PROPOSED]`
- Automatic memory condensation and consolidation.
- Dynamic streak and habit health scoring.
- Contextual weekly reflection summaries.

### 5.3 Explicitly Excluded Capabilities `[EXCLUDED]`
- **No Clinical Diagnostics**: WaveMind is NOT a clinical, medical, or psychiatric diagnostic tool. It does not provide medical therapy, diagnostic prescriptions, or crisis intervention services.
- **No Autonomous Agents**: The system does not take external actions (e.g., booking calendar events, sending emails, external web browsing).
- **No Complex Multi-Tenant Cloud Infrastructure**: No Kubernetes, Kafka, or microservice meshes; the system is designed as a maintainable modular monolith.
- **No Secondary Vector Databases**: ChromaDB, Pinecone, Weaviate, and Milvus are strictly excluded; PostgreSQL + `pgvector` serves as the sole data store.

### 5.4 Potential Future Extensions `[FUTURE SCOPE]`
- Native mobile application clients (iOS/Android).
- Speech-to-text voice journaling.
- Multi-modal image reflection input.
- Local on-device LLM inference (e.g., via Ollama/ONNX).

---

## 6. Functional Requirements

### 6.1 User Authentication & Management `[NOT YET IMPLEMENTED]`
- Secure user registration with email and password hashing (Argon2 / Bcrypt).
- Stateless JWT issuance (access and refresh token mechanisms).
- Granular authorization middleware ensuring all requests resolve strictly to the authenticated `user_id`.

### 6.2 Personal Dashboard `[NOT YET IMPLEMENTED]`
- Unified dashboard aggregating recent mood trends, daily habit completion rates, active goal milestones, and conversational highlights.
- Interactive data visualizations powered by Recharts.

### 6.3 Mood Tracking `[NOT YET IMPLEMENTED]`
- Capture timestamped mood entries with mood labels (e.g., Joy, Sadness, Anxiety, Calm, Frustration), intensity scores (1-10), and optional reflective notes.
- Historical mood filtering, timeline views, and aggregate distribution charts.

### 6.4 Journaling `[NOT YET IMPLEMENTED]`
- Rich-text / Markdown journal entry creation, editing, and deletion.
- Association of journal entries with tags, mood references, and timestamps.
- Eligibility flag for downstream semantic memory extraction.

### 6.5 Habit Management `[NOT YET IMPLEMENTED]`
- Habit creation with customizable frequencies (daily, weekly, specific days).
- One-click daily completion logging and streak calculation.
- Completion history and streak adherence analytics.

### 6.6 Goal Management `[NOT YET IMPLEMENTED]`
- Creation and tracking of personal goals with target deadlines, progress percentages (0-100%), and categories (learning, career, wellness, personal).
- Associating sub-tasks or milestones with parent goals.

### 6.7 Conversational AI Interface `[NOT YET IMPLEMENTED]`
- Real-time conversational interface with streaming message display.
- Integration with emotion detection, semantic memory retrieval, and structured context injection.
- Full session and message persistence with chronological ordering.

### 6.8 Long-Term Semantic Memory `[NOT YET IMPLEMENTED]`
- Heuristic or LLM-assisted memory extraction from user dialogues and journal entries.
- Vector embedding generation for extracted memory propositions.
- Cosine similarity search filtered strictly by `user_id`.
- Memory deduplication, importance decay, and manual memory deletion/management interface.

### 6.9 Personalized Insights `[NOT YET IMPLEMENTED]`
- Correlation analysis between habits completed and recorded mood states.
- Goal progression trajectory summaries.
- Proactive reflective prompts based on historical data patterns.

### 6.10 Experimental Evaluation Engine `[NOT YET IMPLEMENTED]`
- Automated evaluation runner for emotion classification accuracy/F1-score.
- Vector retrieval Precision@K and Recall@K benchmarks on standardized evaluation splits.
- Latency profiling across each pipeline stage.

---

## 7. Non-Functional Requirements

### 7.1 Security `[CONFIRMED]`
- Passwords hashed using industry-standard salted hashing algorithms.
- JWT tokens signed with secure keys; expiration strictly enforced.
- All secrets and API credentials loaded exclusively from environment variables.
- Input validation and schema enforcement on every endpoint via Pydantic.

### 7.2 Privacy & Tenant Isolation `[CONFIRMED]`
- Strict row-level multi-tenancy enforcement: every database query and vector similarity search MUST include `WHERE user_id = :current_user_id`.
- Explicit transparency regarding data sent to the external LLM provider (Google Gemini API).

### 7.3 Maintainability `[CONFIRMED]`
- Modular monolith design with distinct separation between routing, business logic (CRUD/Services), AI subsystems, and persistence layers.
- Full type annotations in Python (type hints) and clean component boundaries in React.

### 7.4 Reliability & Resilience `[CONFIRMED]`
- Graceful degradation: if the emotion model or vector retrieval fails or times out, the chat pipeline falls back to conversational history without crashing.
- Structured exception handling and uniform API error responses.

### 7.5 Performance `[CONFIRMED]`
- Database indexing on foreign keys (`user_id`), timestamps, and vector columns (HNSW / IVFFlat indexing in `pgvector`).
- Caching of model weights in memory upon application startup to prevent cold-start penalties during inference.

### 7.6 Testability `[CONFIRMED]`
- Decoupled architecture allowing complete unit testing with mock services and integration testing with test databases.

---

## 8. Technology Stack

### 8.1 Frontend `[CONFIRMED]`
- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v6+)
- **Data Visualization**: Recharts
- **HTTP Client**: Axios / Fetch API

### 8.2 Backend `[CONFIRMED]`
- **Language**: Python 3.11+
- **Framework**: FastAPI (high-performance asynchronous REST API)
- **Validation**: Pydantic v2
- **ASGI Server**: Uvicorn

### 8.3 Persistence & Migrations `[CONFIRMED]`
- **Database Engine**: PostgreSQL 15+
- **Vector Extension**: `pgvector` (vector similarity search via cosine distance)
- **ORM**: SQLAlchemy 2.0 (declarative mapped models)
- **Migrations**: Alembic

### 8.4 AI & Machine Learning `[CONFIRMED & PENDING SELECTION]`
- **Emotion Classification**: Hugging Face Transformers `[PENDING MODEL SELECTION]`
- **Embedding Generation**: Sentence Transformers `[PENDING MODEL SELECTION]`
- **Language Model**: Google Gemini API (via official SDK / google-genai) `[PENDING MODEL SELECTION]`
- **Vector Search**: PostgreSQL `pgvector` native cosine distance (`<=>` operator) `[CONFIRMED]`

### 8.5 Authentication & Tooling `[CONFIRMED]`
- **Auth**: PyJWT / python-jose, Passlib (bcrypt/argon2)
- **Testing**: Pytest, Pytest-asyncio, HTTPX
- **Version Control**: Git & GitHub

---

## 9. Architecture

### 9.1 Component Overview
WaveMind is architected as a clean, cohesive modular monolith consisting of:
1. **Frontend Client Layer**: Single Page Application (SPA) rendering views, handling user inputs, and communicating with the REST API.
2. **API & Routing Layer**: FastAPI controllers enforcing authentication and request validation.
3. **Domain Business Logic (CRUD & Services)**: Pure Python service modules managing entity lifecycles.
4. **AI & Intelligence Pipeline**:
   - `Emotion Engine`: Extracts emotional signals from messages.
   - `Embedding Engine`: Computes normalized vector embeddings.
   - `Memory Subsystem`: Extracts, stores, and retrieves semantic memories.
   - `Context Builder`: Assembles structured personal records and memories into an optimized prompt.
   - `LLM Client`: Interfaces with Google Gemini API for response generation.
   - `Insights Engine`: Aggregates trends across habits, moods, and goals.
5. **Persistence Layer**: PostgreSQL with `pgvector` tables for relational data and high-dimensional vectors.

### 9.2 Planned Data Flow (Conversational Pipeline)
```
[User Message] 
       │
       ▼
1. FastAPI Endpoint (Auth & Validation)
       │
       ├──► 2. Emotion Classifier (Infers emotion category/score)
       │
       ├──► 3. Embedding Generator (Computes query vector)
       │         │
       │         ▼
       │    4. pgvector Memory Retrieval (Cosine similarity WHERE user_id = :uid)
       │
       ├──► 5. Structured Data Retrieval (Active goals, recent moods, today's habits)
       │
       ▼
6. Context Builder (Combines History + Memories + Emotion + Structured Data)
       │
       ▼
7. Gemini API Client (Generates empathetic, context-grounded response)
       │
       ├──► 8. Store User & Assistant Messages in PostgreSQL
       │
       ├──► 9. Memory Extractor (Identifies new long-term facts/insights to embed & persist)
       │
       ▼
[Response Payload to Frontend Client]
```

### 9.3 Architectural Decision Log & Rationale
| Decision | Choice | Alternatives Considered | Rationale |
|---|---|---|---|
| Vector Store | PostgreSQL + `pgvector` | ChromaDB, Pinecone, Qdrant | Single source of truth; atomic transactions; zero synchronization overhead between relational user records and vectors; eliminates multi-database operational complexity. |
| Backend Framework | FastAPI | Django, Flask, Express | Native asynchronous support, high throughput, automatic OpenAPI documentation, and robust Pydantic data validation. |
| Frontend Stack | React + Vite | Next.js, Vue | Lightweight, ultra-fast HMR with Vite, modular component ecosystem, standard industry alignment for client-side SPAs. |
| LLM Provider | Google Gemini API | OpenAI GPT-4, Anthropic Claude | Favorable performance, cost efficiency, structured prompting capabilities, and official Python SDK support. |

---

## 10. Database Design Plan

### 10.1 Expected Entities & Schemas `[PROPOSED]`
1. `users`:
   - `id` (UUID / Integer, Primary Key)
   - `email` (String, Unique, Indexed)
   - `hashed_password` (String)
   - `full_name` (String)
   - `created_at`, `updated_at` (Timestamps)
2. `mood_records`:
   - `id` (PK), `user_id` (FK -> users.id, Indexed)
   - `mood_category` (String: Joy, Sadness, Anxiety, Anger, Calm, etc.)
   - `intensity` (Integer 1-10)
   - `reflection_note` (Text, Optional)
   - `created_at` (Timestamp, Indexed)
3. `journal_entries`:
   - `id` (PK), `user_id` (FK -> users.id, Indexed)
   - `title` (String), `content` (Text)
   - `tags` (Array/JSONB)
   - `is_memory_eligible` (Boolean, default True)
   - `created_at`, `updated_at` (Timestamps)
4. `habits`:
   - `id` (PK), `user_id` (FK -> users.id, Indexed)
   - `name` (String), `description` (Text, Optional)
   - `frequency` (String: daily, weekly)
   - `is_active` (Boolean, default True)
   - `created_at` (Timestamp)
5. `habit_logs`:
   - `id` (PK), `habit_id` (FK -> habits.id, Indexed), `user_id` (FK -> users.id, Indexed)
   - `completed_at` (Date / Timestamp, Indexed)
   - `notes` (String, Optional)
6. `goals`:
   - `id` (PK), `user_id` (FK -> users.id, Indexed)
   - `title` (String), `description` (Text)
   - `category` (String: career, fitness, learning, personal)
   - `target_date` (Date, Optional)
   - `progress_percentage` (Integer, 0-100)
   - `status` (String: in_progress, completed, abandoned)
   - `created_at`, `updated_at` (Timestamps)
7. `conversations`:
   - `id` (PK), `user_id` (FK -> users.id, Indexed)
   - `title` (String, Optional)
   - `created_at`, `updated_at` (Timestamps)
8. `messages`:
   - `id` (PK), `conversation_id` (FK -> conversations.id, Indexed), `user_id` (FK -> users.id)
   - `sender` (String: 'user' or 'assistant')
   - `content` (Text)
   - `detected_emotion` (String, Optional)
   - `emotion_confidence` (Float, Optional)
   - `created_at` (Timestamp, Indexed)
9. `memories`:
   - `id` (PK), `user_id` (FK -> users.id, Indexed)
   - `content` (Text) — the extracted factual/emotional memory proposition
   - `source_type` (String: 'conversation', 'journal', 'manual')
   - `source_id` (UUID / Integer, Optional)
   - `embedding` (`vector(dim)` — dimension to match selected model, e.g., 384)
   - `importance_score` (Float, 0.0 - 1.0)
   - `created_at`, `updated_at` (Timestamps)

### 10.2 Pending Schema Decisions `[PENDING VERIFICATION]`
- Exact embedding vector dimensionality (depends on embedding model selection; e.g., 384 for `all-MiniLM-L6-v2`, 768 for larger embeddings).
- Choice between IVFFlat and HNSW indexing for `pgvector` memory retrieval.

---

## 11. AI Model Registry

> **Critical Notice**: Model selections listed below represent active candidates under technical evaluation. Exact model weights, dimensions, and versions will be confirmed and benchmarked during Phase 5.

### 11.1 Emotion Classification Model `[PENDING SELECTION & VERIFICATION]`
- **Status**: Candidate Evaluation Stage
- **Candidate 1**: `j-hartmann/emotion-english-distilroberta-base` (Hugging Face)
  - Intended Task: Multi-class emotion classification (joy, sadness, anger, fear, surprise, disgust, neutral).
  - Architecture: DistilRoBERTa.
  - License: Apache 2.0 / Open Source.
  - Source: Hugging Face Model Hub (official documentation to be verified during Phase 5).
  - Limitations: English text only; short context window; sensitive to colloquialisms and informal syntax.
- **Candidate 2**: `bhadresh-ps/roberta-base-go_emotions`
  - Intended Task: Fine-grained emotion classification across 28 GoEmotions categories.
  - Source: Hugging Face Model Hub.
  - Status: Under architectural comparison.

### 11.2 Text Embedding Model `[PENDING SELECTION & VERIFICATION]`
- **Status**: Candidate Evaluation Stage
- **Candidate 1**: `sentence-transformers/all-MiniLM-L6-v2`
  - Intended Task: Dense semantic sentence embedding for vector similarity search.
  - Vector Dimension: 384 dimensions.
  - Source: Sentence-Transformers official documentation.
  - Selection Rationale: High inference speed, low memory footprint, strong benchmark performance on semantic textual similarity (STS).
  - Limitations: Truncation at 256 tokens; optimal for concise memory propositions.
- **Candidate 2**: `BAAI/bge-small-en-v1.5`
  - Vector Dimension: 384 dimensions.
  - Status: Secondary candidate for benchmarking retrieval recall.

### 11.3 Large Language Model (Generation) `[PENDING SELECTION & VERIFICATION]`
- **Status**: Candidate Evaluation Stage
- **Candidate 1**: Google Gemini 1.5 Flash (`gemini-1.5-flash`)
  - Provider: Google DeepMind / Google AI Studio.
  - Selection Rationale: High throughput, low latency, extensive context window, cost-effective for conversational companions.
  - Official Source: Google AI Documentation.
  - Data Handling Terms: Must review applicable terms of service regarding input retention and training data policies before deployment.
- **Candidate 2**: Google Gemini 1.5 Pro (`gemini-1.5-pro`)
  - Status: Considered for complex weekly insight synthesis if higher reasoning capability is required.

---

## 12. Data Management

### 12.1 Categorization of Data Assets
1. **User-Generated Data**:
   - Private personal records: journal entries, mood logs, habit completions, goal definitions, conversation messages.
   - Highly sensitive; strictly confidential; isolated by user ID; never shared across users.
2. **Pretrained Model Training Data**:
   - Datasets utilized by upstream creators to train base models (e.g., GoEmotions, Common Crawl, BookCorpus).
   - Upstream datasets will be cited strictly based on verified official model cards and documentation.
3. **Embedding Data**:
   - Vector representations computed from extracted memory propositions and journal excerpts.
   - Kept in `pgvector` alongside relational records.
4. **Retrieved Context**:
   - Transient in-memory assemblies of recent messages, relevant memories, and user state assembled for prompt generation.
5. **Evaluation Data**:
   - Standardized evaluation datasets (e.g., public benchmark splits for emotion detection and synthetic retrieval evaluation pairs).
   - Public evaluation sets will be strictly segregated from user production data.

### 12.2 External Model Provider Data Governance
- Gemini API interactions must adhere to data minimization principles: only the necessary context required to produce an empathetic, informed response is transmitted.
- Personally identifiable credentials (passwords, email addresses, real names if unnecessary) are stripped before prompt transmission.

---

## 13. Emotion Detection

- **Intended Responsibility**: Infer the underlying emotional tone (e.g., sadness, joy, anxiety, neutral) and a confidence score from the user's incoming message to modulate the conversational tone of the assistant.
- **Expected Inputs**: Raw text of the user's latest message (string).
- **Expected Outputs**: Primary emotion label (string) and confidence score (float, 0.0 - 1.0).
- **Architectural Placement**: `backend/app/ai/emotion/classifier.py`.
- **System Behavior on Failure**: If inference fails or model fails to load, gracefully default to `neutral` emotion with `0.0` confidence and proceed with generation.
- **Strict Limitation**: Emotion detection is an approximate stylistic guide, NOT a psychiatric diagnosis. Responses must never claim clinical diagnosis.

---

## 14. Embeddings and Semantic Retrieval

- **Intended Responsibility**: Convert textual memory propositions into dense numerical vectors and execute fast nearest-neighbor searches in PostgreSQL using cosine distance.
- **Vector Representation**: Dense floating-point vectors normalized for cosine similarity.
- **Architectural Placement**: 
  - Generator: `backend/app/ai/embeddings/generator.py`.
  - Retriever: `backend/app/ai/memory/retriever.py`.
- **Query Strategy**:
  ```sql
  SELECT id, content, importance_score, 1 - (embedding <=> :query_vector) AS similarity
  FROM memories
  WHERE user_id = :current_user_id
  ORDER BY embedding <=> :query_vector ASC
  LIMIT :top_k;
  ```
- **Evaluation Requirements**: Retrieval precision and recall must be benchmarked against a curated test suite of query-memory pairs.

---

## 15. Long-Term Memory

### 15.1 Candidate Memory Information
Information eligible to become a long-term memory includes:
- User preferences, values, and coping mechanisms.
- Recurrent challenges, life stressors, and emotional triggers.
- Significant milestones, achievements, and goal updates.
- Recurring relational or professional circumstances.
- Transient conversational filler (e.g., "Hello", "How are you?") is explicitly excluded.

### 15.2 Memory Extraction & Lifecycle
1. **Extraction**: Following a conversation or journal entry, the memory manager evaluates whether substantive personal facts or reflections were expressed.
2. **Persistence**: Extracted facts are embedded via the embedding model and written to the `memories` table with an associated `importance_score`.
3. **Retrieval**: During active chat interactions, the user's current message query retrieves the Top-K semantically relevant memories.
4. **Maintenance & Hygiene**: Users retain full visibility and capability to review, edit, or delete any stored memory record via the UI.

---

## 16. RAG and Response Generation

### 16.1 Context Construction Pipeline
The context builder (`backend/app/ai/rag/context_builder.py`) constructs a structured prompt payload:
1. **System Persona**: Empathetic, supportive, growth-oriented companion (non-clinical, thoughtful, constructive).
2. **Current Emotional Signal**: Inferred emotion and confidence from the latest message.
3. **Structured User Snapshot**:
   - Active goals (titles and progress %).
   - Today's habit completions and active streaks.
   - Most recent mood entry and reflection.
4. **Relevant Long-Term Memories**: Top-K retrieved memories formatted as concise bullet points.
5. **Recent Dialogue History**: Last N conversational exchanges (user & assistant).
6. **Current User Prompt**: The incoming message.

### 16.2 LLM Integration & Error Handling
- Handled by `backend/app/ai/gemini/client.py`.
- Enforces timeout limits (e.g., 8 seconds) and automated retry with exponential backoff on rate-limit errors.
- Provides fallback response generation if external API connectivity is interrupted.

---

## 17. Personalization and Recommendations

- **Context Integration**: Recommendations are grounded directly in user data:
  - If a user reports high anxiety and has an active goal of "Daily Mindfulness", the assistant gently references their goal.
  - If a habit streak is broken, the assistant emphasizes self-compassion and small actionable restarts rather than guilt.
- **Limitations**: Recommendations must remain suggestions for reflection and personal agency; the system must not dictate lifestyle actions or provide clinical advice.

---

## 18. API Design Plan

### 18.1 Route Groupings
All endpoints are versioned under `/api/v1`:
- `/api/v1/auth`:
  - `POST /register`: Create account.
  - `POST /login`: Authenticate and issue JWT.
  - `GET /me`: Fetch authenticated user profile.
  - `PATCH /me`: Update the authenticated user's name or email. Email changes require the current password.
  - `PATCH /me/password`: Change the authenticated user's password with current-password verification.
- `/api/v1/chat`:
  - `GET /conversations`: List the authenticated user's conversations.
  - `POST /conversations`: Start a new conversation.
  - `GET /conversations/{id}/messages`: Restore a user-owned conversation in timestamp order.
- `/api/v1/companion/chat`:
  - `POST /chat`: Persist a user message and generated companion response with idempotent retry support.
- `/api/v1/moods`:
  - `GET /`: List historical mood logs (paginated, date filters).
  - `POST /`: Record a new mood entry.
  - `DELETE /{id}`: Remove a mood record.
- `/api/v1/journals`:
  - `GET /`: List journal entries.
  - `POST /`: Create journal entry.
  - `GET /{id}`: Retrieve entry details.
  - `PUT /{id}`: Update journal entry.
  - `DELETE /{id}`: Delete journal entry.
- `/api/v1/habits`:
  - `GET /`: List active habits and current streaks.
  - `POST /`: Create new habit.
  - `POST /{id}/log`: Log today's completion.
  - `DELETE /{id}`: Archive/delete habit.
- `/api/v1/goals`:
  - `GET /`: List goals and progress.
  - `POST /`: Create goal.
  - `PATCH /{id}`: Update goal progress or status.
  - `DELETE /{id}`: Delete goal.
- `/api/v1/chat`:
  - `GET /conversations`: List user conversations.
  - `POST /conversations`: Create new conversation thread.
  - `GET /conversations/{id}/messages`: Fetch dialogue history.
  - `POST /conversations/{id}/messages`: Submit message, trigger RAG pipeline, and receive assistant response.
- `/api/v1/memories`:
  - `GET /`: List stored long-term memories.
  - `DELETE /{id}`: Remove specific memory.
- `/api/v1/insights`:
  - `GET /summary`: Fetch aggregated mood/habit/goal analytics.

---

## 19. Frontend Design Plan

### 19.1 Application Areas & Views `[PROPOSED]`
1. **Authentication Views**: Clean, accessible Login and Registration interfaces with client-side validation.
2. **Executive Dashboard (`/dashboard`)**:
   - Quick mood check-in widget.
   - Habit completion checklist for today.
   - Active goal progress bars.
   - Recent mood trajectory chart (Recharts).
3. **Mood Tracking Center (`/moods`)**:
   - Visual mood logger (valence, intensity slider, note field).
   - Interactive calendar and historical distribution graph.
4. **Journal Studio (`/journal`)**:
   - Distraction-free writing interface with Markdown support.
   - Searchable timeline of past entries.
5. **Habits & Goals Hub (`/habits`, `/goals`)**:
   - Habit streak cards, completion toggle, and weekly heatmaps.
   - Goal categorization cards with milestone checklists.
6. **Companion Chat Studio (`/chat`)**:
   - Responsive conversational UI with message bubbles, detected emotional indicators, streaming responses, and context transparency drawer.
7. **Memory & Privacy Vault (`/memories`)**:
   - Transparent list of all extracted memories about the user, with one-click deletion to give users complete control over their personal data.

---

## 20. Privacy and Security

### 20.1 Core Privacy Pillars
- **Zero Cross-User Contamination**: Enforced through foreign key constraints, index filtering, and service-level assertions on `current_user.id`.
- **Safe Secret Handling**: No secrets, database passwords, or API tokens committed to version control. Configuration handled strictly via environment variables.
- **Data Minimization**: Only essential conversational and factual context is transmitted to external model APIs.
- **Right to Erasure**: Full cascading deletion: deleting an account completely removes all relational logs, journal records, conversation history, and vector memories.
- **Non-Clinical Boundary Notice**: The platform prominently displays disclaimers that it is an academic project for personal growth reflection and not a certified mental health service.

---

## 21. Testing Strategy

### 21.1 Testing Layers
1. **Unit Testing (`tests/unit/`)**:
   - Password hashing and JWT generation verification.
   - CRUD logic with transactional rollbacks.
   - AI component isolation (mocking Hugging Face models and Gemini API).
2. **Integration Testing (`tests/integration/`)**:
   - End-to-end API route testing via HTTPX and TestClient.
   - `pgvector` similarity search execution and tenant isolation verification.
   - Multi-user isolation tests ensuring User A cannot read or retrieve User B's memories or records.
3. **Evaluation Suite (`tests/evaluation/`)**:
   - Emotion classification accuracy checks against validation samples.
   - Retrieval metric benchmarking (Precision@K, Recall@K).
   - Latency profiling across network and inference hops.

---

## 22. Experimental Evaluation

### 22.1 Planned Evaluation Dimensions `[PROPOSED]`
1. **Emotion Classification Performance**:
   - Benchmark: Accuracy, Macro F1-score across emotion classes.
   - Dataset: Public emotional evaluation benchmark (e.g., GoEmotions test split).
2. **Memory Retrieval Effectiveness**:
   - Metrics: Precision@K, Recall@K, Mean Reciprocal Rank (MRR) for K in {1, 3, 5}.
   - Evaluation Method: Synthetic query-memory relevance pairs curated for personal growth dialogue.
3. **Response Quality & Personalization**:
   - Evaluation Method: Comparative ablation study:
     - Baseline A: Standard Gemini generation with no memory or structured context.
     - Baseline B: Gemini generation with conversation history only.
     - WaveMind: Full RAG pipeline (History + Memories + Structured Context + Emotion Signal).
   - Evaluated on relevance, empathy, context utilization, and absence of hallucination.
4. **Latency Profile**:
   - Wall-clock measurement of: (a) Emotion inference, (b) Embedding generation, (c) Vector retrieval, (d) Gemini LLM response generation, and (e) End-to-end pipeline.

---

## 23. Research Direction

### 23.1 Central Research Question
> *"Can the integration of structured long-term emotional and behavioral context with semantic memory retrieval improve the relevance and personalization of AI-generated interactions and recommendations?"*

### 23.2 Proposed Contribution
The novelty of WaveMind does NOT claim invention of vector search, Transformers, RAG, or Large Language Models. Rather, the academic contribution lies in:
1. The unified domain architecture synthesizing four disjoint data streams (mood logs, habits, goals, journals) with vector memory into an actionable conversational assistant.
2. The empirical ablation study quantifying the specific value added by long-term episodic retrieval and behavioral context in personal growth dialogues.

### 23.3 Claims Integrity
- No claims of empirical superiority will be made prior to running genuine, reproducible benchmark evaluations.
- All evaluation results will document trade-offs, failure modes, and hardware configurations honestly.

---

## 24. Literature Review

### 24.1 Key Research Areas `[CONFIRMED]`
- **Retrieval-Augmented Generation (RAG)**: Grounding generative models on external knowledge and user-specific corpora.
- **Long-Term Memory in Conversational Agents**: Episodic memory consolidation, vector indexing, and memory retrieval mechanisms.
- **Emotion Recognition in Natural Language**: Transformer-based text classification of sentiment and multi-class emotions.
- **Personalized Conversational Systems**: User modeling, behavioral tracking, and context-aware recommendation systems.

### 24.2 Literature Sources & Citations `[PENDING VERIFICATION]`
- Formal citations, DOIs, and academic paper references will be verified and compiled in `research/literature/` during Phase 1.

---

## 25. Team Responsibilities

The WaveMind development team consists of three members:

### 25.1 Developer 1: Primary AI & Database Developer (Matam Akshith)
- **Ownership Scope**:
  - PostgreSQL database architecture and schema modeling.
  - SQLAlchemy 2.0 ORM models and Alembic migration scripts.
  - `pgvector` configuration, indexing, and vector similarity retrieval logic.
  - Emotion classification model integration and inference pipeline.
  - Text embedding model integration and memory vectorization.
  - Episodic memory subsystem (extraction, consolidation, retrieval).
  - RAG prompt construction and Google Gemini API client integration.
  - Personalization and insights calculation engines.
  - Experimental evaluation suite and quantitative benchmarking.
- **Branch**: Dedicated personal development branch (branch name to be specified by the developer).

### 25.2 Developer 2: Application Developer
- **Ownership Scope**:
  - FastAPI application structure, core middleware, and configuration.
  - User authentication and authorization endpoints (JWT).
  - Domain CRUD API endpoints (users, moods, journals, habits, goals, chat).
  - React frontend architecture (Vite, Tailwind CSS, React Router).
  - Frontend dashboard, tracking views, and chat UI implementation.
  - Frontend-to-backend API client integration.
  - Application-level end-to-end validation and demo preparation.
- **Branch**: Dedicated personal development branch (separate from Developer 1).

### 25.3 Team Member 3: Non-Coding Support
- **Ownership Scope**:
  - Literature review collection and DOI verification.
  - Project documentation, academic report writing, and presentation assets.
  - Demonstration scenario planning and qualitative test cases.
  - Manual testing, bug reporting, and usability feedback.
  - Non-coding research support.

---

## 26. Git Workflow

### 26.1 Branching Strategy
- **`main` Branch Policy**:
  - `main` serves as the protected, stable baseline representing reviewed skeletons and released milestones.
  - **ABSOLUTE RULE**: Never develop application functionality directly on `main`. Never push unreviewed code directly to `main`.
- **Development Branches**:
  - Developers work strictly on their designated feature or developer branches.
  - Developer 1 works on their own branch; Developer 2 works on their own branch.
  - Branch merges into `main` are performed manually after comprehensive code review and automated test passage.

### 26.2 Commit & Hygiene Policy
- Commits must be atomic, descriptive, and reference completed phases or components.
- No secrets (`.env`), build artifacts (`node_modules/`, `__pycache__/`, `.venv/`), or large model binaries committed to Git.
- Force pushes (`git push -f`) and history rewriting are strictly prohibited.

---

## 27. Implementation Roadmap

| Phase | Title | Objectives | Exit Criteria |
|---|---|---|---|
| **Phase 0** | **Repository Foundation** | Establish directory skeleton, empty module files, and comprehensive PROJECT_NOTES.md. | Clean working tree; empty source files; complete project notes. `[COMPLETED]` |
| **Phase 1** | **Architecture Finalization** | Finalize API schemas, DB relationships, select AI models, verify sources. | Written technical contract; verified model cards. `[NEXT PHASE]` |
| **Phase 2** | **Application Foundation** | Initialize FastAPI backend, React frontend, setup dependencies and linting. | Backend `/health` returns 200; frontend loads Vite welcome page. |
| **Phase 3** | **Database & Authentication** | Implement SQLAlchemy models, Alembic migrations, JWT registration/login, user isolation. | Auth unit & integration tests pass; isolated user records verified. |
| **Phase 4** | **Core Personal Data Features** | CRUD endpoints and models for moods, journals, habits, and goals. | Full CRUD test coverage for all personal data domains. |
| **Phase 5** | **AI Model Integration** | Emotion classifier and sentence transformer embedding pipelines in FastAPI. | Component tests pass; inference latency benchmarked. |
| **Phase 6** | **Long-Term Memory** | `pgvector` memory storage, vector search, user-isolated retrieval, memory update logic. | Vector retrieval integration tests pass with 100% tenant isolation. |
| **Phase 7** | **Context-Aware Response Generation** | Context builder, RAG pipeline, Gemini API integration, streaming responses. | End-to-end conversational turn operates with context injection. |
| **Phase 8** | **Personalized Insights** | Trend analysis algorithms synthesizing moods, habits, and goals. | Analytical insight engine tests pass. |
| **Phase 9** | **Frontend & System Integration** | Build React views (Dashboard, Chat, Tracker, Journal) and integrate with backend APIs. | Seamless user flow through UI across all features. |
| **Phase 10** | **Testing & Evaluation** | Complete test suites; benchmark emotion accuracy, retrieval metrics, and latency. | Documented empirical results and benchmark tables. |
| **Phase 11** | **Finalization & Academic Defense** | Bug fixes, security audit, user documentation, academic paper reconciliation. | Deployable demonstration build; completed project report. |

---

## 28. Current Status

- **Current Phase**: Phase 0 (Repository Foundation) `[COMPLETED]`
- **Repository Skeleton**: Created with full modular structure across backend, frontend, tests, docs, and research directories.
- **Application Code**: None written (0 bytes in all source files) `[NOT YET IMPLEMENTED]`.
- **Dependencies**: None installed `[NOT YET IMPLEMENTED]`.
- **Decisions Pending**:
  - Exact emotion classification model selection.
  - Exact sentence embedding model selection and vector dimension.
  - Specific Gemini model variant (`gemini-1.5-flash` vs `gemini-1.5-pro`).
  - Personal Git branch names for Developer 1 and Developer 2.

---

## 29. Definition of Done

A development phase or feature is considered **Done** only when all following criteria are satisfied:
1. **Functional Completion**: All code meets the requirements defined in the phase specification.
2. **Quality & Formatting**: Adheres to project design guidelines, type hints, and clean coding standards.
3. **Automated Testing**: Relevant unit and integration tests written and passing without errors or skips.
4. **Tenant Isolation**: Explicitly verified that queries and operations cannot access another user's records.
5. **Documentation**: Code comments, docstrings, and `PROJECT_NOTES.md` updated to reflect any architectural shifts.
6. **Git Compliance**: Changes committed with a clear message and pushed to the designated development branch (not `main`).

---

## 30. Instructions for Future AI Coding Sessions

Any AI coding assistant operating on this repository in future sessions MUST adhere to the following mandatory guidelines:

1. **Read `PROJECT_NOTES.md` First**: Before inspecting code or making changes, read this document to understand architectural decisions, phase status, and design constraints.
2. **Verify the Current Git Branch**:
   - Check `git branch` and `git status` immediately upon session start.
   - If the current branch is `main`, **STOP IMMEDIATELY** and ask the user which development branch should be used.
   - NEVER implement application features directly on `main`.
3. **Respect Established Technology Decisions**:
   - Do NOT introduce alternative databases (ChromaDB, MongoDB, SQLite). The confirmed database is PostgreSQL + `pgvector`.
   - Do NOT introduce complex orchestration (Kubernetes, Kafka, Redis, microservices) without explicit architectural authorization.
   - Do NOT replace FastAPI or React without explicit user instruction.
4. **Never Fabricate Data or Results**:
   - Never generate fictional benchmark numbers, accuracy percentages, or evaluation metrics.
   - Never claim an uncompleted phase or feature is implemented.
   - Use explicit status tags (`[CONFIRMED]`, `[PROPOSED]`, `[PENDING VERIFICATION]`, `[NOT YET IMPLEMENTED]`, `[FUTURE SCOPE]`).
5. **Maintain Tenant Isolation**:
   - In all backend query implementations, ensure `user_id = current_user.id` is explicitly enforced.
6. **Update Documentation Continuously**:
   - When an approved architectural decision changes or an implementation phase is completed, update `PROJECT_NOTES.md` to keep documentation synchronized with the codebase.

---

## 31. Implemented Application Features

- **Authentication** `[IMPLEMENTED]`: React login and registration use
  `/api/v1/auth/login` and `/api/v1/auth/register`; authenticated sessions use
  the `wavemind_access_token` local-storage key.
- **Mood Tracking** `[IMPLEMENTED]`: Authenticated mood creation, listing, and
  deletion use `/api/v1/moods` with user-isolated database queries.
- **AI Companion** `[IMPLEMENTED]`: Authenticated chat uses
  `/api/v1/companion/chat`, with explicit provider and safety error handling.
- **Journal** `[IMPLEMENTED]`: Authenticated journal creation, listing, and
  deletion use `/api/v1/journals`. The `journal_entries` table is created by
  Alembic revision `5b1e2c7d8f90`.
- **Habits** `[IMPLEMENTED]`: Authenticated habit creation, listing, completion
  toggling, and deletion use `/api/v1/habits`. The `habits` table is created by
  Alembic revision `6c2d3e8f901a`.
- **Goals** `[IMPLEMENTED]`: Authenticated goal creation, listing, progress
  updates, and deletion use `/api/v1/goals`. The `goals` table is created by
  Alembic revision `7d3e4f901a2b`.
- **Insights** `[IMPLEMENTED]`: Authenticated read-only summaries use
  `/api/v1/insights/summary` and aggregate only the current user's mood and
  habit records; no separate insights table is used.
- **Validation** `[CONFIRMED]`: Frontend production build, backend compilation,
  Alembic head verification, and the available backend test suite have been
  run. Live PostgreSQL migration and end-to-end journal API tests remain
  environment-dependent.
