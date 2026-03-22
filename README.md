# BadgerChat

BadgerChat is a small multi-room chat web app: browse themed chatrooms, read messages with pagination, and—when logged in—post and delete your own messages.

## Origin (course project)

This codebase **grew out of an original university assignment**, not a greenfield product:

- **Course:** **CS571 — Web Programming** at the **University of Wisconsin–Madison** (the starter and [LICENSE](LICENSE) line refer to **CS571, Fall 2024**).
- **Assignment:** **Homework 6 — “BadgerChat”**, a cumulative **React** exercise. The course provided a **Vite** starter (with Bootstrap and React Router already wired up) and a **hosted class API** at `cs571api.cs.wisc.edu` so every student used the same backend and shared chat data.
- **What students built:** The UI for chatrooms, message pagination, registration and login (7-digit PIN), session-style “logged in” behavior, creating posts, and deleting your own posts—matching the behaviors described in the old assignment handout and in `_figures/`.

**What changed in this repo:** The shared course server is **no longer used**. The React app has been pointed at a **local [Django REST Framework](https://www.django-rest-framework.org/)** backend with a **SQLite** database shipped in this repository (`backend/`). That way the app is self-contained for development and deployment; `API_DOCUMENTATION.md` still describes the **legacy course API** shape for reference, but **authoritative behavior** for this fork is implemented in `backend/api/`.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | [Vite](https://vitejs.dev/), React 18, [Bootstrap](https://getbootstrap.com/) / [react-bootstrap](https://react-bootstrap.netlify.app/), [React Router](https://reactrouter.com/) |
| Backend | [Django](https://www.djangoproject.com/) 4.2, [Django REST Framework](https://www.django-rest-framework.org/), token authentication |
| Database | SQLite (`backend/db.sqlite3`, created when you run migrations) |

## Prerequisites

- **Node.js** (for `npm`)
- **Python 3** with `pip` (for the backend virtual environment)

## Local setup

Run the **backend** and **frontend** in two terminals. The Vite dev server proxies `/api` to `http://127.0.0.1:8000`, so the UI talks to your Django app without extra CORS configuration during development.

### 1. Backend (Django)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Leave this running (default: `http://127.0.0.1:8000`).

Optional: create an admin user for the Django admin site:

```bash
python manage.py createsuperuser
```

Then open `http://127.0.0.1:8000/admin/`.

### 2. Frontend (Vite)

From the **repository root** (not `backend/`):

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in a browser. Do not open `index.html` as a static file; the app is a Vite/React SPA.

### What gets created locally

- `backend/db.sqlite3` — SQLite database (regenerated with `migrate`; typically not committed).
- `backend/.venv/` — Python environment (not committed).
- `node_modules/` — npm dependencies (not committed).

If you clone fresh, reinstall with `pip install -r requirements.txt` and `npm install` as above.

## Configuration

### API base URL

The client uses `VITE_API_BASE` from the environment, defaulting to `"/api"` (see `src/api.js`). That matches the Vite proxy in `vite.config.js`, which forwards `/api` to the Django server.

To point the frontend at a different backend (e.g. a deployed API), set `VITE_API_BASE` to that base URL (including path prefix if your API uses one) before building or running Vite.

### Authentication

The backend issues **DRF token** credentials. The React app sends `Authorization: Token <token>` on requests that need login (see `src/api.js`). Registration and login use a **7-digit PIN**, consistent with the original assignment behavior.

### Django settings

`backend/badgerchat/settings.py` is configured for local development (`DEBUG`, SQLite, CORS for `localhost:5173`). Before any real deployment, change `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, database, and security settings to match your environment.

## API overview

All routes below are served by Django under the `/api/` prefix. During local dev with the default setup, the frontend calls them as `/api/...`, which Vite proxies to `http://127.0.0.1:8000/api/...`.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/chatrooms/` | List chatroom names |
| `GET` | `/api/messages/?chatroom=NAME&page=1` | Paginated messages (pages 1–4) |
| `POST` | `/api/messages/?chatroom=NAME` | Create a message (auth required) |
| `DELETE` | `/api/messages/?id=ID` | Delete own message (auth required) |
| `POST` | `/api/register/` | Register |
| `POST` | `/api/login/` | Log in (returns token) |
| `POST` | `/api/logout/` | Log out |
| `GET` | `/api/whoami/` | Current user (auth required) |

For JSON bodies, send `Content-Type: application/json`. For authenticated routes, include the `Authorization` header as described above.

The file `API_DOCUMENTATION.md` was written for the **original course-hosted API** (different base URL and headers). The **route ideas** are similar, but this project’s real contract is the Django app in `backend/api/`—use that code as the source of truth if anything disagrees.

## Project layout

- `src/` — React UI (routes, chatrooms, auth, layout)
- `backend/` — Django project (`badgerchat`) and `api` app (models, views, serializers)
- `public/` — static assets for the Vite app
- `_figures/` — screenshots from the original course write-up (optional reference)

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## License

See [LICENSE](LICENSE).
