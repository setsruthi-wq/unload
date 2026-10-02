# UNLOAD

> **Digital Guardian & Screen Addiction Prevention**  
> *"Unload gradually. Live freely."*  
> Developed by **Team Safesprout**

---

## Overview
UNLOAD does not simply block screen usage. It gradually reduces excessive screen usage through a Progressive Unloading approach and encourages healthy self-regulation.

---

## Project Structure

```text
unload/
├── client/          # Frontend (React, Vite, Tailwind CSS, React Router)
│   ├── src/
│   │   ├── pages/
│   │   │   └── LandingPage.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
└── server/          # Backend (Node.js, Express, MongoDB, Mongoose, JWT)
    ├── .env
    ├── .env.example
    ├── package.json
    └── server.js
```

---

## Quick Start Guide

### 1. Start the Backend Server
```bash
cd server
npm install
npm run dev
```
- Server will run on `http://localhost:5000`
- Health check route: `http://localhost:5000/api/health`

### 2. Start the Frontend Application
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```
- Vite dev server will run on `http://localhost:5173`
