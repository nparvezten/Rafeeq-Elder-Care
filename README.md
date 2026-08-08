# Rafeeq Care (رفيق) — MVP

**Open-source eldercare coordination app — attendant directory & shared expense tracker. Angular + Supabase, self-hostable on GitHub Pages.**

> A companion, not a diagnosis. Rafeeq Care is a small, free, open-source tool that helps families coordinate home-visit care attendants and split care-related expenses — built out of one family's experience caring for a parent through late-stage illness.

## What this is (and isn't)

This is a **deliberately small MVP** with two features:
- **Attendant Directory** — a list of home-visit nurses, doctors, and attendants your family has vetted, with contact info and rates.
- **Shared Expense Tracker** — log care-related expenses and see who owes whom, so cost-sharing among siblings/family doesn't become its own source of stress.

This is **not** a medical records system. It intentionally stores no diagnoses, medication logs, or patient health data — see [LEGAL.md](./LEGAL.md) for why, and what to do if you need that later.

## Tech stack

- Angular 18+ (standalone components, signals, no NgRx)
- Supabase (Postgres + Auth + Row Level Security) — free tier
- Tailwind CSS
- Hosted as a static site on GitHub Pages

No custom backend server, no Docker, no cloud infrastructure to manage.

## Use it yourself (fork & run)

Designed so any family can fork it and run their own private copy in under 20 minutes, with their own data, on their own free Supabase project.

### 1. Fork & clone repo
```bash
git clone https://github.com/<your-username>/Rafeeq-Elder-Care.git
cd Rafeeq-Elder-Care
npm install
```

### 2. Create your own Supabase project (free)
1. Go to supabase.com → New Project (free tier is enough).
2. In the SQL editor, run `supabase-schema.sql` from this repo.
3. Copy your Project URL and anon public key from Settings → API.

### 3. Configure environment
Edit `src/environments/environment.ts` (and `src/environments/environment.prod.ts`) with your Supabase URL and anon key:
```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseAnonKey: 'your-anon-public-key'
};
```

### 4. Run locally
```bash
npx ng serve
```
Visit `http://localhost:4200`.

## Deploy to GitHub Pages

To build and publish this static Angular app directly to the `gh-pages` branch on GitHub Pages:

```bash
# 1. Build the production static app with your repository base-href
npx ng build --base-href "/Rafeeq-Elder-Care/"

# 2. Deploy the built static output to gh-pages branch
npx angular-cli-ghpages --dir=dist/rafeeq-care-mvp
```

After running these commands, go to your GitHub repository settings → **Pages**, select Source as **Deploy from a branch**, and choose the `gh-pages` branch.

## Project docs

- [AGENTS.md](./AGENTS.md) — instructions for AI coding agents working in this repo
- [CONTRIBUTING.md](./CONTRIBUTING.md) — how to contribute
- [LEGAL.md](./LEGAL.md) — disclaimers, data/privacy notes
- [LICENSE.md](./LICENSE.md) — MIT

## Why "Rafeeq"?

رفيق (Rafeeq) means companion — someone who walks with you gently through a hard journey. That's the intent here: a small companion tool, not an enterprise platform.