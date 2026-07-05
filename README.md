# Digital Manufacturing Academy (DMA-LMS)

A full-stack Learning Management System built for the **Digital Manufacturing Academy** — a British Council–funded TNE (Transnational Education) partnership between **Birmingham City University (BCU)** and **AIUB Bangladesh**.

Repo: https://github.com/myname71/DMA-LMS

## Overview

DMA-LMS lets students enroll in manufacturing/Industry 4.0 courses, work through video/PDF/PPTX lessons, take quizzes, submit assignments, and earn certificates — while instructors and admins manage curricula, users, payouts, and platform content.

**Tech stack**
- **Frontend:** React 19 + Vite 6 + Tailwind CSS 4
- **Backend:** Express 4 (TypeScript, run via `tsx`)
- **Database:** MySQL via Prisma ORM (falls back to a flat-file JSON store if no DB is configured)
- **Auth:** JWT (`jsonwebtoken`) in an HTTP-only cookie, passwords hashed with `bcryptjs`
- **Email:** Nodemailer via Hostinger SMTP
- **AI Tutor:** Google Gemini (`@google/genai`) — optional, runs in demo/mock mode without a key

**Core data model** (see the included SQL dump): `roles`, `users`, `categories`, `courses`, `lessons`, `quizzes`/`quiz_questions`/`quiz_attempts`, `assignments`/`assignment_submissions`, `enrollments`/`lesson_progress`, `messages`, `certificates`, `activity_logs`, `bank_accounts`/`withdrawal_requests` (instructor payouts), `invites`, `custom_roles`, `cms_content`, `theme_settings`, `learning_paths`, `events`, and `media_items`.

Four role tiers: `student` → `instructor` → `admin` → `super_admin`.

## Project Structure

```
DMA-LMS/
├── config/          # App configuration
├── controllers/     # Express route controllers
├── lib/             # Shared utilities
├── middleware/      # Auth/role middleware, error handling
├── prisma/          # Prisma schema & migrations
├── public/          # Static assets
├── routes/          # Express route definitions
├── src/             # React frontend (Vite)
├── server.ts        # Express server entry point
├── db.ts            # Database connection layer
├── vite.config.ts
├── prisma.config.ts
├── package.json
└── .env.example
```

## Prerequisites

- **Node.js** ≥ 20.0.0
- **npm** ≥ 10.0.0
- A **MySQL database** (e.g. Hostinger, PlanetScale, RDS) — optional, falls back to local JSON storage if omitted

## 1. Local Setup

```bash
# Clone the repo
git clone https://github.com/myname71/DMA-LMS.git
cd DMA-LMS

# Install dependencies (also runs `prisma generate`)
npm install

# Copy the environment template and fill in real values
cp .env.example .env
```

Edit `.env` with at least:

```bash
JWT_SECRET=your-long-random-secret          # node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
NODE_ENV=development
PORT=5000
MYSQL_DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DATABASE
```

Import the database schema (the SQL dump included in this project — `u858137765_DMA.sql`):

```bash
mysql -u <db_user> -p <db_name> < u858137765_DMA.sql
```

> All seeded demo accounts use the password `Dmamfg.2026`.

Generate the Prisma client (if not run automatically by `postinstall`):

```bash
npx prisma generate
```

Run the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5000` (or the `PORT` you set).

## 2. NPM Scripts

| Script          | Command                                                                                     | Purpose                                   |
|-----------------|----------------------------------------------------------------------------------------------|--------------------------------------------|
| `npm install`   | installs dependencies + runs `prisma generate`                                              | Install & prep Prisma client               |
| `npm run dev`   | `tsx server.ts`                                                                              | Start the dev server (TS, hot-reload)      |
| `npm run build` | `vite build && esbuild server.ts --bundle --platform=node --format=cjs ... --outfile=dist/server.cjs` | Build frontend + bundle backend for prod |
| `npm start`     | `node dist/server.cjs`                                                                       | Run the production build                   |
| `npm run lint`  | `tsc --noEmit`                                                                                | Type-check without emitting files          |
| `npm run clean` | `rm -rf dist`                                                                                | Remove build output                        |

## 3. Deploying to a Cloud Server

These steps apply to any Linux VPS/cloud server (Hostinger VPS, DigitalOcean, AWS EC2, etc.) with SSH access and Node.js support.

### Step 1 — Connect and install Node.js
```bash
ssh user@your-server-ip

# Install Node 20+ (NodeSource example)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # should be >= 20.0.0
```

### Step 2 — Get the code onto the server
```bash
git clone https://github.com/myname71/DMA-LMS.git
cd DMA-LMS
```

### Step 3 — Configure environment
```bash
cp .env.example .env
nano .env
```
Set production values — in particular:
```bash
NODE_ENV=production
PORT=5000
JWT_SECRET=<long-random-string>
MYSQL_DATABASE_URL=mysql://u858137765_DMA:YOUR_DB_PASSWORD@srv.hostinger.com:3306/u858137765_DMA
SMTP_USER=info@digitalmanufacturing.academy
SMTP_PASS=YOUR_EMAIL_PASSWORD_HERE
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
EMAIL_FROM_NAME=DMA Academy
# GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE   (optional — AI tutor runs in demo mode without it)
```

### Step 4 — Install dependencies and import the database
```bash
npm install
mysql -u u858137765_DMA -p u858137765_DMA < u858137765_DMA.sql
```

### Step 5 — Build for production
```bash
npm run build
```

### Step 6 — Run it
```bash
# Quick foreground test
npm start

# Recommended: run persistently with PM2
npm install -g pm2
pm2 start dist/server.cjs --name dma-lms
pm2 save
pm2 startup      # follow the printed instructions to enable boot-start
```

### Step 7 — Put it behind a reverse proxy (Nginx) + HTTPS
```nginx
server {
    listen 80;
    server_name digitalmanufacturing.academy;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Then enable HTTPS with Certbot:
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d digitalmanufacturing.academy
```

### Redeploying after future updates
```bash
cd DMA-LMS
git pull
npm install
npm run build
pm2 restart dma-lms
```

## Security Notes

- **Never commit `.env`** — it's already covered by `.gitignore`.
- Rotate `JWT_SECRET`, DB credentials, and SMTP password before going live; the values in the sample SQL dump/`.env.example` are for local/demo use only.
- Change all seeded demo account passwords (`Dmamfg.2026`) immediately in a production deployment.

## License

UNLICENSED — private project for Digital Manufacturing Academy (BCU / AIUB partnership).
