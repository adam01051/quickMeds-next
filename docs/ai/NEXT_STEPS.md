# Next Steps

## Current Priority

1. Continue frontend redesign one approved micro-phase at a time using the five demo pharmacies for visual validation.
2. Complete authenticated smoke checks for owner create/edit, favorites, and recently visited.
3. Replace or remove demo records before production and verify real-world facts with operators.
4. Keep current-location distance search and verified-only filtering deferred.

Pharmacy discovery is authoritative. Do not introduce medicine catalog, inventory, prescription, or price-comparison features.

## Priority Order

1. Plan MongoDB data migration from old property-era documents to pharmacy-era documents if existing data must be preserved.
2. Inventory the Next.js frontend repo and update GraphQL operations to the new pharmacy API.
3. Add focused GraphQL smoke tests for pharmacy create/search/update/like/favorites/visited.
4. Decide whether board articles should become health articles in a later phase.

## Backend Cleanup

| Priority | Task | Notes |
| --- | --- | --- |
| P0 | Add pharmacy smoke tests | Cover `createPharmacy`, `getPharmacy`, `getPharmacies`, `updatePharmacy`, `likeTargetPharmacy`, favorites, and visited. |
| P0 | Plan MongoDB backfill | Map `properties` to `pharmacies`, `memberProperties` to `memberPharmacies`, and social `PROPERTY` groups to `PHARMACY`. |
| P1 | Add migration runbook | Include backup, dry-run, backfill, rollback, and verification queries. |
| P1 | Review pharmacy filters | Confirm `pharmacyLocation`, delivery, insurance, and text filters match frontend requirements. |
| P2 | Consider health article migration | ER model includes health articles, while backend still has board articles. |

## Frontend Migration

| Priority | Task | Notes |
| --- | --- | --- |
| P0 | Replace old Property GraphQL calls | Use `createPharmacy`, `getPharmacy`, `getPharmacies`, `getAgentPharmacies`, and admin pharmacy operations. |
| P0 | Regenerate GraphQL types | Old `Property*` types are removed by the breaking backend rename. |
| P1 | Migrate route labels and navigation | Replace property/agent language with pharmacy owner/pharmacy terminology. |
| P1 | Migrate pharmacy cards/detail forms | Use pharmacy name, address, type, delivery fee, medication count, insurance, delivery, images, and description. |

## Validation

| Priority | Task | Notes |
| --- | --- | --- |
| P0 | Keep TypeScript checks in migration checklist | `npx tsc -p apps/quickmeds-api/tsconfig.app.json --noEmit` and batch equivalent. |
| P0 | Keep build check | Run `npm run build` after implementation work. |
| P1 | Add e2e smoke tests | Cover pharmacy catalog, pharmacy detail, saved pharmacies, and owner pharmacy pages. |
# Delivery And Hours Follow-up

- Monitor owner completion of missing hours and polish remaining legacy owner/admin presentation incrementally.
- Current-location distance search remains deferred.

## Next Frontend Micro-Phases After June 14 Checkpoint

1. Replace the public catalog’s legacy Nestar house banner and generic subtitle with pharmacy-discovery content.
2. Redesign the catalog filter/sorting shell while preserving the current `PharmaciesInquiry` behavior.
3. Migrate Favorites and Recently Visited from the shared legacy `PropertyCard` to an approved pharmacy card presentation.
4. Audit Pharmacy Owner pages and remove remaining visible real-estate imagery/copy without renaming compatibility internals.
5. Redesign mobile navigation and mobile catalog in separate approved phases.
6. Replace Korean footer regions/phone content later; preserve it until that phase.
7. Keep verified-only filtering and current-location distance search deferred until backend contracts are approved.
