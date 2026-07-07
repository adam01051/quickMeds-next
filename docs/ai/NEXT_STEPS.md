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
3. Complete authenticated browser QA for redesigned `/agent/detail`, including pharmacy likes, pharmacy detail links, comment submission, and signed-out/self-comment blocking.
4. Continue authenticated browser smoke checks for the shared mobile top navbar, catalog, Community, and account states.
5. Keep verified-only filtering and current-location distance search deferred until backend contracts are approved.

## Pharmacy Owner Directory Follow-up

1. Complete an authenticated browser smoke test for like and unlike behavior while a search or non-default sort is active.
2. Verify pagination interaction after the owner dataset exceeds the current nine-owner page limit.
3. Investigate why local headless Chromium remains on the Apollo loading skeleton even though direct live GraphQL requests succeed.
4. Complete 390px/430px mobile visual QA for `/agent/detail` and verify no horizontal overflow.
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
5. Complete authenticated browser QA for the fixed Messages real-time behavior and mobile overlay navigation: User B receiving messages instantly without refresh, conversation-list preview/unread updates while chat is closed, immediate sent-message rendering in the active chat, entering Messages from other My Page sections, near-bottom auto-scroll, reading-old-messages no-force-scroll, `New messages` button, independent desktop thread/history scrolling, shared mobile menu trigger/sheet, clickable pharmacy header identity, desktop Enter-to-send, 320px/375px/iPhone 14 Pro Max/tablet/desktop responsive states, reconnect behavior, and mobile keyboard/safe-area behavior.
6. Add focused backend service tests for message authorization, thread reuse, unread counters, image-path validation, and self-message rejection.
7. Keep delete/archive, blocking, typing indicators, chatbot integration, moderation, and non-image attachments deferred.

## Homepage Trending Follow-up

1. Re-run visual screenshot QA for the interactive Trending pharmacies section in a browser session that does not retain the local Next.js FOUC-hiding style in screenshots.
2. Manually exercise compact-card swap, keyboard selection, and favorite click behavior in an authenticated browser session.
3. Verify desktop homepage no longer shows Featured pharmacies and mobile 390px/430px still shows the Featured pharmacies card list.

## Community Follow-up

1. Re-run 390px and 430px mobile screenshot QA for Community list/detail after the local headless Chrome crash is resolved.
2. Manually exercise Community category tabs, sort changes, article likes, and comment submission in an authenticated browser session.
3. Keep the existing board-article categories and routes until a backend health-article migration is approved.

## CS Mobile Follow-up

1. Complete mobile browser QA for `/cs` and `/cs?tab=faq` at 320px, 390px, and 430px, including Notice/FAQ tab switching, FAQ category scrolling, accordion expansion, footer visibility, and horizontal-overflow checks.

## My Page Mobile Follow-up

1. Complete authenticated 390px and 430px visual QA for the user-row My Page trigger, left-side My Page mobile menu, real mobile My Profile form, Followers, Followings, My Pharmacies, Add Pharmacy, My Articles, and Write Article.
2. Smoke test each mobile My Page menu item, owner/non-owner visibility, admin shortcut visibility, profile image upload, profile update, My Pharmacies status filters, My Pharmacies View/Edit/Close/Delete actions, Add Pharmacy create/edit/image upload/save behavior, own-Followings unfollow, Followers follow-back/unfollow, member likes, article likes, article detail navigation, write-article submission, external owner-link arrows, and logout from a signed-in browser session.
3. Manually verify outside-tap close for the public mobile navigation sheet and My Page mobile section sheet on 320px, 390px, and 430px devices, including Uzbek language selection persistence.

## My Page Desktop Follow-up

1. Complete authenticated desktop visual QA for `/mypage?category=followers` and `/mypage?category=followings`, including follow/unfollow, member-like, pagination, and profile navigation on restored desktop rows.
2. Visually verify the desktop typography normalization across the public navbar and My Page sections: My Profile, My Favorites, My Pharmacies, Add Pharmacy, My Articles, Write Article, Followers, and Followings.

## QuickMeds Assistant Follow-up

1. Restart the backend on port `3007` so `POST /api/v1/chatbot/message` is available in the live dev server.
2. Configure backend-only `GEMINI_API_KEY` and optional `GEMINI_MODEL`, then smoke test platform-support questions through the floating assistant.
3. Browser-check desktop and mobile assistant open/close, compact desktop panel sizing, composer send-button access, suggested prompts, page-name links, action links, missing-provider state, Gemini unavailable/rate-limited states, and exact medical-advice refusal text.
4. Confirm `/mypage?category=messages` remains unaffected by the assistant launcher and no raw WebSocket human-message state is reused.
5. With a live Gemini key, verify assistant copy still avoids visible raw route paths and that only the approved page-name links are returned for navigation.

## Pharmacy Owner Location Picker Follow-up

1. Complete authenticated browser QA for Add Pharmacy and Edit Pharmacy on desktop and mobile, including address search, map click, marker drag, current-location success/denial, reverse-geocode failure, pin reconfirmation after movement, save success, and detail-page map rendering.
2. Review Nominatim public API usage before production; replace with a dedicated provider or self-hosted geocoder if expected traffic exceeds public usage limits.
3. Keep structured city/district/street persistence, duplicate-near-coordinate detection, GeoJSON `Point`, `2dsphere` indexing, radius search, and returned distance deferred until the backend distance-search phase is approved.

## Pharmacy Map And Language Follow-up

1. Complete authenticated My Page browser QA for English-to-Korean-to-English switching on `/mypage?category=myPharmacies` and `/mypage?category=addPharmacy`, including the My Page sidebar, mobile sheet, owner cards, location picker, and save/validation messages.
2. Complete full Russian and Korean translation review for the new nested My Page/location keys; temporary English fallback copy is present where accurate translation was not verified in this pass.
3. Re-check pharmacy detail and owner Add/Edit map rendering after any future map-provider or geocoding-provider change to ensure Google iframe usage is not reintroduced accidentally.

## Telegram Login Follow-up

1. Register production and development HTTPS callback URLs in BotFather Web Login, then configure backend-only `TELEGRAM_OIDC_CLIENT_ID`, `TELEGRAM_OIDC_CLIENT_SECRET`, and `TELEGRAM_OIDC_REDIRECT_URI`.
2. Smoke test the live Telegram flow from `/account/join` through `/auth/telegram/complete`, including expired/reused tickets, safe `returnTo`, and existing-header authenticated state.
3. Design optional logged-in account linking, phone scope, bot direct-message access, and a future HttpOnly-cookie auth migration as separate approved phases.

## Account Login Follow-up

1. Smoke test a real successful nickname/password login from a fresh browser tab and confirm it lands on `/` when no safe referrer is present.
2. Verify login from a protected user-facing page still returns to that page when it passes the internal return-path guard.
3. Use `http://localhost:3001` for QuickMeds while `/Users/adam/Desktop/Reja` owns port `3000`.
4. If a browser tab still requests an old `/_next/static/webpack/*.hot-update.json` hash after this source fix, close that tab or clear the tab's site data because the request is retained by the browser's stale Next.js dev client session.

## Docker Compose Follow-up

1. If the first Docker Compose startup is still killed during `yarn install` with exit code `137`, increase Docker Desktop memory or move to a cached Dockerfile build so dependency installation does not run under the one-shot Compose startup command.
2. If install/build remains too slow for local use, introduce a small Dockerfile with cached dependency and build layers as a separate approved phase.

## Full App Translation Follow-up

1. Sweep the remaining public and account routes for hardcoded UI copy beyond the homepage, including pharmacy catalog/detail, Community, CS, account auth, My Page subsections, owner flows, admin-visible public labels, and legacy unused homepage components.
2. Complete native-speaker review for Russian, Uzbek, and Korean homepage copy before treating translations as production final.
3. Decide whether to split translations into route namespaces after the next translation phase; homepage v1 intentionally remains in nested `common.json`.
4. Add automated locale parity checking to the regular validation workflow so future keys stay aligned across `en`, `ru`, `uz`, and `kr`.
5. Continue the remaining full-app sweep for member profile pages, message fallbacks, CS/admin support screens, owner Add/Edit pharmacy form leftovers, and auth/account surfaces not covered by the Pharmacies/Community pass.
6. Smoke test localized pharmacy and Community detail pages with real backend records, including comments, likes, owner messaging, image attachments, and localized operating-hour states.
