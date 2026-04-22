# ⟡ SkillBarter v3 — Fully Functional

Real auth · Real database · Real-time chat · Connect with actual people

## ⚡ Run Instantly (Demo Mode — no setup needed)

```powershell
cd skillbarter_v3\frontend
npm install
npm run dev
```
Open → **http://localhost:5173**

Works immediately with mock data. Sign in with any email/password.

---

## 🌐 Go Live (Connect Real People)

To make it fully functional with real accounts and real-time messaging,
you need a **free Supabase account** (takes ~5 minutes).

### Step 1 — Create Supabase project

1. Go to **https://supabase.com** → Sign up free
2. Click **"New Project"** → give it a name → set a password → Create
3. Wait ~2 minutes for it to initialize

### Step 2 — Run the database schema

1. In Supabase dashboard → click **"SQL Editor"** (left sidebar)
2. Click **"New Query"**
3. Open `supabase_schema.sql` from this folder
4. Copy ALL the contents → paste into SQL Editor → click **"Run"**

### Step 3 — Get your API keys

1. In Supabase dashboard → **Settings** (gear icon) → **API**
2. Copy:
   - **Project URL** (looks like `https://abcxyz.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 4 — Add keys to the app

In the `frontend/` folder, create a file called `.env`:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 5 — Run!

```powershell
cd frontend
npm install
npm run dev
```

Now anyone with the URL can sign up and connect with each other! 🎉

---

## 📁 File Structure

```
skillbarter_v3/
├── supabase_schema.sql    ← Run this in Supabase SQL Editor
└── frontend/
    ├── src/
    │   ├── App.jsx        ← Complete React app
    │   └── main.jsx       ← Entry point
    ├── .env.example       ← Copy to .env and add your keys
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ✅ Features

| Feature | Demo Mode | With Supabase |
|---------|-----------|---------------|
| Browse mock users & skills | ✓ | ✓ |
| Sign up / Sign in | Mock | Real accounts |
| Send barter requests | Mock | Stored in DB |
| Real-time chat | Mock | Live WebSocket |
| Profile editing | Temporary | Persists |
| Smart matching | ✓ | ✓ |
| Admin panel | ✓ | ✓ |

---

## 🚀 Deploy Free (Share with others)

**Vercel (easiest):**
1. Go to **https://vercel.com** → Sign up with GitHub
2. Import your project
3. Add environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON`)
4. Deploy → get a live URL to share!

**Netlify:**
1. Go to **https://netlify.com** → New site from Git
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add env vars in Site Settings

---

## ❓ Troubleshooting

| Problem | Fix |
|---------|-----|
| `npm` not found | Install Node.js from https://nodejs.org (LTS version) |
| `npm run dev` fails | Make sure you're in the `frontend/` folder |
| Supabase auth not working | Check your `.env` values are correct, no extra spaces |
| Messages not real-time | Enable Realtime in Supabase: Database → Replication → messages table |
