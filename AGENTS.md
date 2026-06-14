# quickMeds FrontEnd Agent Instruction


QuickMeds is NestJS GraphQL monorepo migrated from real estate platform into a Pharmacy shop platform  

## Rules

- Preserve current project architecture
- Keep GraphQL/Apollo integration
- Do not rewrite the whole app
- Improve UI incrementally

## Backend Context

Before making any changes, read:

- docs/ai/BACKEND_MIGRATION.md
- docs/ai/DECISIONS.md
- docs/ai/FRONTEND_MIGRATION.md
- and other relevant files inside `docs/ai` in both repositories

## Workflow

1. Analyze before editing.
2. Backend is running on port http://localhost:3007/graphql now.
3. Make small incremental changes.
4. Run typecheck after each phase.
5. Do not remove working logic unless replaced safely.
6. Record every meaningful implementation, migration, validation result, decision, and remaining limitation in the existing `docs/ai` files before finishing the task.
7. Update `docs/ai/COMPLETED_TASKS.md` for completed work and validation, `docs/ai/DECISIONS.md` for durable decisions, `docs/ai/NEXT_STEPS.md` for deferred work, and the relevant migration document for rollout details.
8. When a change affects backend contracts or migration behavior, update the corresponding existing `docs/ai` files in the backend repository as well.
9. Do not create a new documentation file when an existing `docs/ai` tracking file covers the subject.



##  Package Manager


- use Yarn for all frontend commands
- do not use npm or pnpm
- install dependencies with:
```` bash
yarn install
````
