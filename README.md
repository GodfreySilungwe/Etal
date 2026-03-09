# ETAL Enterprise - Project Skeleton

This repository contains a starter scaffold for the ETAL Enterprise website based on the provided SRS.

Overview
- Frontend: React (Vite)
- Backend: Node.js + Express
- Database: PostgreSQL

Quick start (local)

1) Backend

Create a Postgres database and set `DATABASE_URL` in `backend/.env` (or use the example):

```powershell
cd "c:\Users\PIU\Desktop\Personal Folder 23Oct2023\Quantic Work\ETAL Project\backend"
copy .env.example .env
# edit .env to set DATABASE_URL
npm install
npm run dev
```

The backend listens on port `4000` by default and will initialize required tables on first run.

2) Frontend

```powershell
cd "c:\Users\PIU\Desktop\Personal Folder 23Oct2023\Quantic Work\ETAL Project\frontend"
npm install
npm run dev
```

By default the frontend expects backend API at the same origin. For local development you can run the frontend with a proxy in `vite.config.js` or run both and use a browser with CORS allowed. The backend includes CORS by default.

Database notes
- The backend will create the tables described in the SRS if they do not exist. Adjust columns in `backend/src/dbInit.js` as required.

Next steps
- Implement admin UI and authentication
- Integrate payment gateway
- Add file upload for gallery images
- Harden input validation and security
