# Contributing to Rafeeq Care

Thanks for wanting to help. This project intentionally stays small — please read the scope note below before opening a PR.

## Scope — please read first

This project deliberately does **not** include:
- Medical/health data of any kind (diagnoses, medications, clinical notes)
- Custom encryption or "compliance-grade" security claims
- NgRx or another state-management library
- A custom backend server (everything goes through Supabase)

PRs adding any of the above will likely be declined, or asked to be scoped as a separate opt-in module. If you think the project needs to grow past this scope, please open an issue to discuss first rather than sending a large PR.

## Getting set up

```bash
git clone https://github.com/<org>/rafeeq-care.git
cd rafeeq-care
npm install
cp src/environments/environment.example.ts src/environments/environment.ts
# fill in your own Supabase test project URL + anon key
ng serve
```

## Making a change

1. Fork the repo and create a branch: `git checkout -b feature/short-description`
2. Keep PRs small and focused — one feature or fix per PR.
3. If you touch `supabase-schema.sql`, explain the RLS policy change in plain English in the PR description.
4. Run `ng build` locally and make sure it succeeds with no errors before opening the PR.
5. Describe what you tested manually (see "Testing" below).

## Testing

There's no full automated test suite yet. At minimum, before opening a PR:
- `ng build` succeeds
- You've manually clicked through the feature you changed
- If you're comfortable with it, a unit test for new logic (e.g. the expense-splitting calculation) is very welcome

## Code style

Angular standalone components, signals for state, Tailwind for styling — see [AGENTS.md](./AGENTS.md) for the full conventions list (these apply to human contributors too). Keep components small and readable over clever.

## Reporting bugs / requesting features

Open a GitHub issue. For anything involving how family or expense data is stored or accessed, please describe the access-control implication too (who should and shouldn't be able to see what).

## Code of conduct

Be kind. Everyone using or building this is likely dealing with a hard family situation — extend patience accordingly, in issues and PR reviews alike.
