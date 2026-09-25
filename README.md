# PocketSmart AI – Smart Budget & Recommendation Assistant

A web-based personal budget management application with AI-powered
recommendations, built with FastAPI, SQLAlchemy, and Google's Gemini AI.

## Description

PocketSmart AI lets a user log income and categorized expenses, set a
monthly budget, see a live dashboard of their finances, and get
personalized AI budgeting tips based on their actual spending data.

## Problem Statement

Many people (especially students) don't track where their money goes
and don't get any actionable feedback on their spending habits until
it's too late in the month. Spreadsheets are tedious and give no
personalized advice.

## Objectives

- Provide a simple, working web app to log income and expenses.
- Let the user set and monitor a monthly budget.
- Visualize spending by category and budget usage.
- Use an AI model (Gemini) to turn raw numbers into plain-English
  saving suggestions.
- Keep the AI layer swappable (multi-provider architecture) so a
  different AI service could be plugged in later.

## Features

- Dashboard: total income, total expenses, remaining balance, current
  budget, recent transactions, category breakdown, budget-usage bar.
- Income management: add/view/delete income entries.
- Expense management: add/view/delete categorized expenses.
- Budget management: set a monthly budget, see usage %, get a warning
  near/over budget.
- AI recommendations: on-demand Gemini-powered budgeting tips based on
  the user's real data.
- Works fully (income/expense/budget features) even if the Gemini API
  key is missing or the API call fails — only the AI panel is affected.

## Technologies Used

- Python 3.13
- FastAPI
- Jinja2 templates
- HTML5 / CSS3 / vanilla JavaScript
- SQLite + SQLAlchemy
- HTTPX (async HTTP client)
- Google Gemini API
- python-dotenv for environment variables

## System Architecture

```
Browser (HTML/CSS/JS)
        │  HTTP requests (forms + fetch)
        ▼
FastAPI app (main.py)
   ├── Jinja2 templates  →  render HTML pages
   ├── SQLAlchemy ORM     →  SQLite database (income, expenses, budget)
   └── AIService           →  AIProvider interface
                                   └── GeminiProvider → Gemini API (httpx, async)
```

The AI layer is deliberately decoupled: `main.py` only calls
`AIService.get_budget_recommendation()`. `AIService` holds an
`AIProvider` (an abstract interface in `services/ai_base.py`).
`GeminiProvider` is the only implementation today, but a second
provider could be added as a new class implementing the same
interface, with zero changes to `main.py`.

## Folder Structure

```
pocketsmart/
│
├── main.py                  # FastAPI app + all routes
├── database.py               # SQLAlchemy engine/session setup
├── models.py                  # ORM models: Income, Expense, Budget
├── schemas.py                  # Pydantic schemas
├── requirements.txt
├── .env.example
├── .gitignore
├── README.md
├── DOCUMENTATION.md            # College report content
│
├── services/
│   ├── __init__.py
│   ├── ai_base.py             # Abstract AIProvider interface
│   ├── gemini_provider.py     # Gemini implementation (httpx async)
│   └── ai_service.py          # Provider-agnostic service main.py calls
│
├── templates/
│   ├── base.html
│   ├── index.html
│   ├── dashboard.html
│   ├── income.html
│   ├── expenses.html
│   ├── budget.html
│   └── recommendations.html
│
└── static/
    ├── css/style.css
    └── js/script.js
```

## Database Description

SQLite database file: `pocketsmart.db` (created automatically on first run).

**income**
| column      | type     | notes                  |
|-------------|----------|-------------------------|
| id          | Integer  | primary key             |
| source      | String   | e.g. "Salary"           |
| amount      | Float    | > 0                     |
| date        | Date     |                          |
| description | String   | optional                |
| created_at  | DateTime | auto-set                |

**expenses**
| column      | type     | notes                                   |
|-------------|----------|-------------------------------------------|
| id          | Integer  | primary key                               |
| category    | String   | one of the 8 fixed categories             |
| amount      | Float    | > 0                                       |
| date        | Date     |                                            |
| description | String   | optional                                  |
| created_at  | DateTime | auto-set                                  |

**budget**
| column         | type     | notes                                 |
|----------------|----------|------------------------------------------|
| id             | Integer  | primary key                              |
| monthly_budget | Float    | single current value, updated in place   |
| updated_at     | DateTime | auto-updated on change                   |

## API / Page Routes

| Method | Path                       | Purpose                                  |
|--------|----------------------------|--------------------------------------------|
| GET    | `/`                        | Landing page                                |
| GET    | `/dashboard`                | Dashboard with summary + recent activity    |
| GET    | `/income`                    | Income list + add form                     |
| POST   | `/income/add`                  | Add an income entry                       |
| POST   | `/income/delete/{income_id}`     | Delete an income entry                  |
| GET    | `/expenses`                        | Expense list + add form               |
| POST   | `/expenses/add`                      | Add an expense entry                 |
| POST   | `/expenses/delete/{expense_id}`        | Delete an expense entry           |
| GET    | `/budget`                                | View/set monthly budget         |
| POST   | `/budget/update`                           | Update monthly budget         |
| GET    | `/recommendations`                           | AI recommendations page     |
| POST   | `/api/recommendations`                         | JSON API: returns AI tips |

## Installation

### 1. Clone / copy the project
```bash
cd pocketsmart
```

### 2. Create a virtual environment
```bash
python3 -m venv .venv

# Activate it:
# macOS/Linux:
source .venv/bin/activate
# Windows:
.venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure your Gemini API key
```bash
cp .env.example .env        # Windows: copy .env.example .env
```
Then open `.env` and paste your real key:
```
GEMINI_API_KEY=your_actual_key_here
```

**Get a free Gemini API key:** go to https://aistudio.google.com/app/apikey,
sign in with a Google account, and click "Create API key".

### 5. Run the app
```bash
uvicorn main:app --reload
```
or simply:
```bash
python main.py
```

Then open **http://127.0.0.1:8000** in your browser. The SQLite
database file is created automatically on first run — no manual setup
needed.

## How to Use

1. Go to **Income** and add a few income entries.
2. Go to **Expenses** and log some categorized expenses.
3. Go to **Budget** and set a monthly budget amount.
4. Check the **Dashboard** for your totals, category breakdown, and
   budget-usage bar.
5. Go to **AI Insights** and click "Get AI Recommendation" for
   personalized tips (requires a valid `GEMINI_API_KEY`).

## Feature Test Checklist

- [ ] App starts with `uvicorn main:app --reload` with no errors
- [ ] `/` loads the landing page
- [ ] `/dashboard` loads and shows ₹0.00 everywhere on a fresh database
- [ ] Add an income entry → appears in income history, total updates
- [ ] Add an income entry with a negative/zero amount → rejected with an error message, nothing saved
- [ ] Delete an income entry → removed from the list
- [ ] Add an expense entry (each category) → appears in expense history, total updates
- [ ] Add an expense with an invalid category (via a raw request) → rejected
- [ ] Delete an expense entry → removed from the list
- [ ] Set a monthly budget → dashboard/budget page usage bar updates
- [ ] Spend past 80% of budget → warning banner appears
- [ ] Spend past 100% of budget → "exceeded" banner appears, bar turns red
- [ ] Dashboard category chart reflects expense categories correctly
- [ ] Click "Get AI Recommendation" with a valid key → tips appear
- [ ] Click "Get AI Recommendation" with **no** key set → friendly error shown, rest of app still works
- [ ] Resize the browser to mobile width → nav collapses into a toggle menu, layout stays usable

## Gemini API Configuration

1. Visit https://aistudio.google.com/app/apikey
2. Sign in and generate an API key
3. Put it in `.env` as `GEMINI_API_KEY=...`
4. Never commit `.env` — it's already in `.gitignore`
5. If the key is missing or invalid, the app still runs; only the
   `/recommendations` page shows an error instead of tips.

## GitHub Upload Steps

```bash
git init
git add .
git status              # confirm .env is NOT listed
git commit -m "PocketSmart AI - initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/pocketsmart-ai.git
git push -u origin main
```

Double-check before pushing: `.env` and `pocketsmart.db` should never
appear in `git status` — both are excluded by `.gitignore`.

## Screenshots

*(Add screenshots of the Dashboard, Income, Expenses, Budget, and AI
Recommendations pages here before submitting.)*

## Future Enhancements

- Multi-user accounts with login
- Recurring/monthly budget history instead of a single current value
- Export transactions to CSV/PDF
- A second AI provider (e.g. OpenAI) as a live fallback if Gemini fails
- Push/email notifications when nearing budget limit
- Real chart library (e.g. Chart.js) for richer visualizations
