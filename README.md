# Re:LiFE

This project now runs with a small local backend proxy so your Groq API key is not exposed in frontend code.

## Setup

1. Copy `.env.example` to `.env`.
2. Put your real key in `.env`:
   - `GROQ_API_KEY=...`
3. Start the app:
   - `node server.js`
4. Open:
   - `http://localhost:3000`

## Notes

- Do not open `index.html` directly with `file://`.
- AI features (`ARCHITECT`, planner suggestions, anti-cheat prompts) go through `POST /api/architect`.
- Health check endpoint:
  - `GET /api/health`
