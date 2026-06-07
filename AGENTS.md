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
- docs/ai/DECIONS.md
- docs/ai/FRONTEND_MIGRATION.md
- and etc inside of petoria/docs/ai

## Workflow

1. Analyze before editing.
2. Backend is running on port http://localhost:3007/graphql now.
3. Make small incremental changes.
4. Run typecheck after each phase.
5. Do not remove working logic unless replaced safely.
6. Update quickMeds/docs/ai/COMPLETED_TASKS.md after major changes.