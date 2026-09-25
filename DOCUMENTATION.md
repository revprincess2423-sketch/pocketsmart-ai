# PocketSmart AI – College Project Documentation

## Abstract

PocketSmart AI is a web-based personal finance management system that
helps users track income and expenses, set and monitor a monthly
budget, and receive AI-generated, personalized saving recommendations.
Built using FastAPI (Python), SQLite/SQLAlchemy, and Google's Gemini
AI, the system demonstrates a clean, modular architecture where the
core budgeting features function independently of the AI layer, and
the AI layer itself is built behind an abstract provider interface so
additional AI services can be integrated without modifying the main
application.

## Introduction

Personal financial management is a life skill that many people,
especially students, never formally learn. Manual tracking through
notebooks or spreadsheets is tedious, error-prone, and gives no
feedback beyond raw numbers. PocketSmart AI addresses this by
combining simple, structured expense/income tracking with an AI
assistant that interprets the data and gives concrete, personalized
suggestions — turning a static ledger into an active budgeting coach.

## Problem Statement

Users lack an accessible tool that both records their financial
activity and interprets it. Existing spreadsheet-based tracking
requires manual analysis and offers no personalized guidance, which
means people often only notice overspending after the fact, if at
all.

## Existing System

Most existing solutions fall into two categories:
1. Manual tools (spreadsheets, notebooks) — flexible but require
   manual computation and offer no insight generation.
2. Commercial budgeting apps — often require bank account linking,
   subscriptions, or collect sensitive financial data with limited
   transparency into how recommendations are generated.

## Proposed System

PocketSmart AI is a self-hosted, lightweight web application that:
- Stores all data locally in a SQLite database (no third-party data
  sharing beyond the optional Gemini AI call, which only sends
  aggregated numeric summaries, not raw personal identifiers).
- Provides real-time dashboard summaries and category breakdowns.
- Sends a numeric summary of the user's finances to Gemini AI on
  request, and displays the returned suggestions.
- Remains fully functional for tracking even if the AI service is
  unavailable.

## Objectives

- Build a working budget tracker (income, expenses, budget) with
  persistent storage.
- Visualize spending by category and against the set budget.
- Generate personalized AI budgeting tips from the user's actual data.
- Design the AI integration as a swappable, provider-agnostic layer.
- Handle errors gracefully at every layer (input validation, database,
  network/AI failures).

## Scope

In scope: single-user local budget tracking, categorized expenses,
budget threshold warnings, on-demand AI recommendations.
Out of scope (see Future Enhancements): multi-user accounts,
authentication, recurring budget history, data export.

## Functional Requirements

- FR1: User can add an income entry (source, amount, date, description).
- FR2: User can add an expense entry (category, amount, date, description).
- FR3: User can view, and delete, income and expense history.
- FR4: User can set a monthly budget.
- FR5: System calculates total income, total expenses, remaining
  balance, and budget usage percentage.
- FR6: System displays a warning when spending nears or exceeds budget.
- FR7: User can request an AI-generated budgeting recommendation.
- FR8: System validates all form input and rejects invalid data with
  a clear error message.

## Non-Functional Requirements

- Usability: clean, responsive UI usable on mobile and desktop.
- Reliability: core budgeting features work even if the AI API is
  down or unconfigured.
- Security: API keys are never hard-coded; they're loaded from a
  local `.env` file excluded from version control.
- Maintainability: modular file structure separating routes, models,
  schemas, and AI services.
- Performance: async I/O for the AI API call so the request doesn't
  block the server.

## Hardware Requirements

- Any computer capable of running Python 3.13 (minimum 4GB RAM
  recommended for comfortable development).
- Internet connection (only required for the AI recommendation
  feature; all other features run fully offline/local).

## Software Requirements

- Python 3.13
- pip (Python package manager)
- A modern web browser (Chrome, Firefox, Edge, Safari)
- A free Google account for a Gemini API key (optional, for AI features)

## System Architecture Explanation

The system follows a layered architecture:
1. **Presentation layer** — Jinja2-rendered HTML templates, styled
   with a single responsive stylesheet, enhanced with a small amount
   of vanilla JavaScript for the mobile nav and the AI fetch call.
2. **Application layer** — FastAPI routes in `main.py` handle HTTP
   requests, validate form input, and orchestrate calls to the data
   and AI layers.
3. **Data layer** — SQLAlchemy ORM models (`models.py`) map to a
   local SQLite database, accessed through a per-request session
   (`database.py`).
4. **AI layer** — An abstract `AIProvider` interface
   (`services/ai_base.py`) is implemented by `GeminiProvider`
   (`services/gemini_provider.py`), which is wrapped by `AIService`
   (`services/ai_service.py`). `main.py` only depends on `AIService`,
   never on Gemini directly, so a different provider can be swapped
   in without touching route logic.

## Module Description

- **main.py** — Application entry point; defines all page and API
  routes, request validation, and summary calculations.
- **database.py** — Database engine/session configuration.
- **models.py** — ORM table definitions: Income, Expense, Budget.
- **schemas.py** — Pydantic models for structured data validation/output.
- **services/ai_base.py** — Abstract interface all AI providers implement.
- **services/gemini_provider.py** — Gemini-specific implementation
  using an async HTTPX client.
- **services/ai_service.py** — Provider-agnostic service layer with
  error handling, used by the routes.
- **templates/** — Jinja2 HTML templates for each page.
- **static/** — CSS and JavaScript assets.

## Database Design

Three tables: `income`, `expenses`, and `budget` (see README.md for
full column listings). `income` and `expenses` are independent
transaction logs; `budget` holds a single current value rather than a
full historical record, keeping the schema simple for a first version.
No foreign keys are required since the current design targets a
single implicit user; a `user_id` foreign key on all three tables
would be the natural extension for multi-user support.

## ER Diagram Description

Conceptually:
- **Income** (id, source, amount, date, description, created_at) — standalone entity.
- **Expense** (id, category, amount, date, description, created_at) — standalone entity.
- **Budget** (id, monthly_budget, updated_at) — standalone entity, single row.

There are no direct foreign-key relationships between the three
tables in the current single-user design; they are related logically
(all three feed into the dashboard's computed summary) rather than
structurally. In a multi-user extension, all three would have a
`user_id` foreign key referencing a `users` table.

## Data Flow Diagram Description

**Level 0 (Context):** User ⇄ PocketSmart AI System ⇄ Gemini AI API

**Level 1:**
1. User submits income/expense/budget form → FastAPI validates input
   → SQLAlchemy writes to SQLite → redirect back to the page with
   updated data.
2. User requests dashboard → FastAPI queries SQLite → aggregates
   totals/category breakdown → renders template.
3. User requests AI recommendation → FastAPI aggregates current
   financial summary → AIService sends it to Gemini API via HTTPX →
   Gemini responds with text → FastAPI returns it as JSON → JavaScript
   displays it on the page.

## Use Case Diagram Description

**Actor:** User

**Use cases:**
- Add Income
- Delete Income
- Add Expense
- Delete Expense
- Set Budget
- View Dashboard
- Request AI Recommendation

All use cases are performed directly by the single user actor; there
is no separate admin actor in the current scope.

## Technologies Used

See README.md → "Technologies Used" for the full list (FastAPI,
SQLAlchemy, SQLite, Jinja2, HTTPX, Gemini AI, HTML/CSS/JS).

## Testing

Manual testing was performed against the checklist in README.md,
covering: valid and invalid form submissions for income, expenses,
and budget; deletion flows; budget-threshold warning states (under
80%, 80–99%, 100%+); AI recommendation success and failure paths
(including a missing API key); and responsive layout behavior at
mobile widths. Python source files were also verified to compile
without syntax errors, and every route, form action, and template
variable was cross-checked against its handler in `main.py`.

## Expected Results

- All CRUD operations for income and expenses complete successfully
  and are immediately reflected in the dashboard and history tables.
- Budget warnings appear at the correct thresholds.
- AI recommendations are generated and displayed when a valid API key
  is configured, and a clear, non-blocking error is shown otherwise.

## Advantages

- Fully self-hosted; user data stays in a local SQLite file.
- Works without the AI feature if needed (graceful degradation).
- Clean, swappable AI provider architecture for future extension.
- Simple enough to explain module-by-module in a viva.

## Limitations

- Single-user only; no authentication or multi-user isolation.
- Budget is a single current value, not tracked per month historically.
- No data export (CSV/PDF) in the current version.
- AI recommendations depend on an external API and internet access.

## Future Enhancements

See README.md → "Future Enhancements" (multi-user accounts, monthly
budget history, CSV/PDF export, a second AI provider as fallback,
notifications, richer charting).

## Conclusion

PocketSmart AI demonstrates a complete, working full-stack budgeting
application with a clean separation between its data layer and its AI
layer. It satisfies the core requirement of a real, functioning
application — not a static prototype — while remaining simple enough
to serve as a clear, explainable college project.

## References

- FastAPI documentation — https://fastapi.tiangolo.com/
- SQLAlchemy documentation — https://docs.sqlalchemy.org/
- Jinja2 documentation — https://jinja.palletsprojects.com/
- HTTPX documentation — https://www.python-httpx.org/
- Google Gemini API documentation — https://ai.google.dev/gemini-api/docs
