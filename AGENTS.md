# AGENTS.md 

## Project identity

Rafeeq Care is a **small, self-hostable MVP** with two features: an attendant directory and a shared expense tracker. It is not, and should not silently become, a medical records system, a multi-tenant SaaS, or an enterprise platform.

## Hard rules

1. **No medical/health data.** Never add fields, tables, or forms for diagnoses, medications, symptoms, or clinical notes. If a task seems to require this, stop and flag it to a human instead of implementing it — see LEGAL.md for why.
2. **No custom cryptography.** Do not write encryption, hashing, or "blind index" code. Rely on Supabase's built-in encryption at rest/in transit and Row Level Security. If a task seems to need field-level encryption, that's a sign the data doesn't belong in this app yet (see rule 1).
3. **No compliance claims.** Never add text claiming OWASP, HIPAA, VAPT, SAST/DAST, or any other compliance/certification status in code, comments, README, or UI — unless a real audit has actually happened and a human explicitly tells you to.
4. **No new state-management library.** Use Angular signals and plain injectable services. Don't introduce NgRx, Redux, or similar without an explicit human request.
5. **No new backend.** All data access goes through the Supabase JS client. Don't scaffold a custom API server, microservice, or additional database.
6. **Don't auto-commit or auto-push.** Make changes, run the build, and stop for human review. Never run `git push` autonomously.
7. **Keep it a static site.** The deployable output is a static Angular build for GitHub Pages. Don't introduce SSR, a Node server, or anything needing a host beyond static file serving, without an explicit request.

## When adding a feature

1. Check it fits one of the two existing feature areas (directory, expenses) or is explicitly requested as new scope.
2. Keep new tables/RLS policies in `supabase-schema.sql`, with comments explaining the access rule in plain English.
3. Prefer editing an existing component over introducing a new architectural layer.
4. Design mobile-first: assume the person using this is stressed, possibly on an old phone, possibly with shaky hands — large tap targets, high contrast, minimal steps per task.
5. Update `README.md` if setup steps change.

## Code conventions

- Angular standalone components; `inject()` over constructor injection where natural.
- Signals for local/component state; a plain injectable service for shared state — no global store library.
- Tailwind utility classes; no custom design system or component library.
- Hash-based routing (`withHashLocation()`) — this must keep working on GitHub Pages without server-side rewrites.

## If a request conflicts with this file

Say so explicitly and ask the human to confirm before proceeding. Don't silently reinterpret the request to fit these rules, and don't silently violate them either.
