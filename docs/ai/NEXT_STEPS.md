# Next Steps

## Current Priority

1. Continue frontend redesign one approved micro-phase at a time using the five demo pharmacies for visual validation.
2. Complete authenticated smoke checks for owner create/edit, Pharmacy Owner directory likes, favorites, and recently visited.
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

1. Redesign the catalog filter shell while preserving the current `PharmaciesInquiry` behavior.
2. Migrate Favorites and Recently Visited from the shared legacy `PropertyCard` to an approved pharmacy card presentation.
3. Redesign Pharmacy Owner detail at `/agent/detail`; the public directory is complete and compatibility internals remain intentionally unchanged.
4. Redesign mobile navigation and mobile catalog in separate approved phases.
5. Replace Korean footer regions/phone content later; preserve it until that phase.
6. Keep verified-only filtering and current-location distance search deferred until backend contracts are approved.

## Pharmacy Owner Directory Follow-up

1. Complete an authenticated browser smoke test for like and unlike behavior while a search or non-default sort is active.
2. Verify pagination interaction after the owner dataset exceeds the current nine-owner page limit.
3. Investigate why local headless Chromium remains on the Apollo loading skeleton even though direct live GraphQL requests succeed.
4. Redesign `/agent/detail` as its own approved micro-phase.
5. Correct the shared global mobile-navbar clipping during the separate mobile-navigation phase.

## Account Access Follow-up

1. Complete authenticated browser smoke checks for successful login, User signup, and Pharmacy Owner signup with disposable test accounts.
2. Verify normalized wrong-nickname, wrong-password, blocked-account, and unavailable-backend messages in the rendered inline error state.
3. Keep password recovery, social login, email authentication, and email verification out of the interface until backend contracts are approved.
4. Correct the shared global mobile-navbar clipping during the separate mobile-navigation phase.

## Admin Users Follow-up

1. Complete an authenticated Admin Users smoke check covering member loading, search, type/status filters, pagination, and member updates.
2. Complete authenticated Admin Pharmacies and Community smoke checks covering filters, pagination, status changes, and removal flows.
3. Continue the approved admin redesign with honest Support Coming soon pages before adding unsupported support-management behavior.

## Pharmacy Detail Feedback Follow-up

1. Visually verify the Community Feedback section with a valid pharmacy record containing more than five comments.
2. Verify authenticated comment submission, unauthenticated messaging, Load More completion, and member-profile navigation in the browser.
3. Keep ratings, visit dates, and review scores out of the interface unless real backend contracts are approved later.
4. Complete an authenticated browser smoke test proving a submitted comment remains after reconciliation and page reload.
# After Public Hero Removal

- Visually verify all affected public desktop routes with representative authenticated and unauthenticated states.
- Migrate remaining property-era internal page presentation incrementally; do not reintroduce generic shared route banners.
- Redesign mobile route content separately because the desktop shared hero removal intentionally does not change mobile rendering.

# After Public Accent Palette Migration

- Visually audit public routes for imagery or icon assets that contain baked-in legacy colors.
- Continue replacing remaining property-era layout patterns incrementally without introducing new accent colors.

## Messaging Follow-up

1. Restart the backend on port `3007` and verify the live GraphQL schema exposes the new message queries and mutations.
2. Smoke test an authenticated customer sending a text message, image message, and text-plus-image message from `/pharmacies/detail`.
3. Smoke test a Pharmacy Owner receiving the thread in `/mypage?category=messages`, unread badge updates, mark-read behavior, and a reply.
4. Verify WebSocket updates reach only the sender and receiver.
5. Design the dedicated mobile Messages flow as thread-list first, then conversation detail with a clear back path.
6. Add focused backend service tests for message authorization, thread reuse, unread counters, image-path validation, and self-message rejection.
7. Keep delete/archive, blocking, typing indicators, chatbot integration, moderation, and non-image attachments deferred.

## Homepage Trending Follow-up

1. Re-run visual screenshot QA for the interactive Trending pharmacies section in a browser session that does not retain the local Next.js FOUC-hiding style in screenshots.
2. Manually exercise compact-card swap, keyboard selection, and favorite click behavior in an authenticated browser session.
