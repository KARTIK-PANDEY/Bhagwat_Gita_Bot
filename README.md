# Gita Guide – Bhagavad Gita Chatbot (Web)

A beautiful, lightweight web chatbot that offers guidance from the Bhagavad Gita. It blends:
- Relevant Gita verses with English translations (local dataset)
- Optional external API advice (OpenAI-compatible chat endpoint, e.g., Groq)

## 🌿 Overview

**Bhagavad Gita Chatbot** is a **web-based conversational assistant** inspired by the timeless wisdom of the *Bhagavad Gita*.  
It allows users to interact, ask questions about life, duty, peace, and spirituality — and receive verses, translations, and insights directly from the Gita.  
The chatbot is designed to bring spiritual calmness and ancient wisdom into modern conversations.


## Features
- Attractive, responsive chat UI (dark/light theme)
- Bhagavad Gita quotes with English translations
- External API integration (Bearer token, OpenAI chat format)
- Typing indicator, copy response, auto-scroll, local persistence
- Settings modal to manage API base URL, key, and model


## Project Structure
```
Bhagvat_Gita_ChatBot/
├─ index.html
├─ assets/
│  ├─ styles.css
│  ├─ app.js
│  └─ gita.json
└─ README.md
```


## 🧠 Tech Stack

| Layer | Technology |
|-------|-------------|
| 💬 Chat Logic | JavaScript (Intent + Keyword Matching) |
| 🧾 Data Source | `gita_dataset.json` (custom structured JSON) |
| 🌐 Frontend | HTML, CSS, JS |
| 🎨 UI Styling | TailwindCSS / Custom minimal design |
| 🕉️ Content | Bhagavad Gita Verses & Translations |



## Prerequisites
- Any static server (no backend required). Options:
  - Python 3 (built-in `http.server`)
  - Node.js (using `npx serve`)

## Run Locally (Windows PowerShell)
1) Python 3
```powershell
cd C:\Users\karti\Bhagvat_Gita_ChatBot
python -m http.server 5500
```
Open: `http://localhost:5500/`

2) Node.js (npx)
```powershell
cd C:\Users\karti\Bhagvat_Gita_ChatBot
npx --yes serve -l 5500
```
Open: `http://localhost:5500/`

## API Integration
This app can call an external API for advice and blend it with a relevant verse.

- Default (preconfigured):
  - Base URL: `https://api.groq.com/openai/v1/chat/completions`
  - Model: `llama-3.1-70b-versatile`
  - Authorization: `Bearer <API_KEY>`
- The UI includes a Settings modal to enable/disable API, change Base URL/Key/Model, and save to `localStorage`.

Request (OpenAI Chat format):
```json
{
  "model": "llama-3.1-70b-versatile",
  "temperature": 0.3,
  "messages": [
    { "role": "system", "content": "You are a compassionate advisor..." },
    { "role": "system", "content": "Relevant verse context ..." },
    { "role": "user", "content": "<your question>" }
  ]
}
```

Response parsing tries common shapes, e.g. `choices[0].message.content`, `answer`, `text`, etc. If the API fails, the app gracefully falls back to verse-only guidance.

### CORS
If you see CORS errors in the browser console, enable CORS on your API server (Access-Control-Allow-Origin) or proxy the request through a server you control.

## Customize
- Add verses: edit `assets/gita.json` and append objects with fields:
  - `chapter` (number), `verse` (number), `sanskrit` (string), `translation_en` (string)
  - optional: `keywords` (string), `tags` (array)
- Update theme/colors: edit CSS variables at the top of `assets/styles.css`.
- Change starter prompts: edit `STARTER_EXAMPLES` in `assets/app.js`.

## Publish to GitHub
Initialize a new repo and push (replace placeholders):
```powershell
cd C:\Users\karti\Bhagvat_Gita_ChatBot
git init
git add .
git commit -m "Initial commit: Gita Guide chatbot"
# Create a repo on GitHub first (e.g., via the website) named: Bhagvat_Gita_ChatBot
git remote add origin https://github.com/<your-username>/Bhagvat_Gita_ChatBot.git
git branch -M main
git push -u origin main
```

## Deploy with GitHub Pages
Option A: Deploy from `main` (root)
1. In your GitHub repo: Settings → Pages
2. Source: `Deploy from a branch`
3. Branch: `main`, Folder: `/root`
4. Save. Your site will be available at the Pages URL shown.

Option B: `docs/` folder
1. Create `docs/` and move files there, or set Pages to serve `/docs`.
2. Settings → Pages: Source `main`, Folder `/docs`.

Note: Some APIs block browser calls or require CORS; Pages hosting works for static files only.

## Security Note
Do not commit sensitive API keys to a public repository. Use the Settings modal to store keys locally in your browser, or configure a server-side proxy that injects the key.

