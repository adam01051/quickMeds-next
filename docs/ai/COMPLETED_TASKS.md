# Completed Tasks

## Session Summary

This session completed the repository audit and safe rename layer for the Nestar to quickMeds migration. The work intentionally avoided business-domain changes, GraphQL contract changes, MongoDB collection changes, and schema migrations.

## Completed Refactors

| Task | Status | Notes |
| --- | --- | --- |
| Repository migration audit | Completed | Identified real-estate-specific backend modules, DTOs, enums, GraphQL surfaces, Mongo schemas, and labels. |
| Safe rename plan | Completed | Defined project/app rename scope and explicit non-changes. |
| Package rename | Completed | `package.json` and `package-lock.json` use `quickmeds`. |
| Nest app folder rename | Completed | `apps/nestar-api` -> `apps/quickmeds-api`; `apps/nestar-batch` -> `apps/quickmeds-batch`. |
| Nest project key rename | Completed | `nest-cli.json` uses `quickmeds-api` and `quickmeds-batch`. |
| Build output path update | Completed | App `tsconfig.app.json` files output to `dist/apps/quickmeds-*`. |
| Script path update | Completed | npm scripts now reference quickMeds app paths/project keys. |
| Absolute import update | Completed | Imports from `apps/nestar-api/...` were updated to `apps/quickmeds-api/...`. |
| Runtime label update | Completed | API and batch welcome strings now say quickMeds. |
| Environment app label update | Completed | `.env` Mongo URI `appName` label changed to `quickMeds`; host/path unchanged. |
| Lint-only cleanup | Completed | Removed one unused import and one unused method parameter surfaced by lint. |
| Full property-to-pharmacy backend migration | Completed | Replaced Property APIs, DTOs, schema, model, collection, shared social groups, member counter, and batch ranking with Pharmacy terminology. |

## Changed Areas

| Area | Files/modules |
| --- | --- |
| Package metadata | `package.json`, `package-lock.json` |
| Nest workspace config | `nest-cli.json` |
| API app | `apps/quickmeds-api` |
| Batch app | `apps/quickmeds-batch` |
| Runtime labels | `app.resolver.ts`, `app.service.ts`, `batch.service.ts` |
| Cross-app imports | Batch module/service imports and auth guard absolute imports |
| Environment label | `.env` |
| Lint cleanup | `Notice.model.ts`, `socket.gateway.ts` |
| Pharmacy domain migration | `PharmacyModule`, `PharmacyService`, `PharmacyResolver`, pharmacy DTOs/enums/schema, social modules, member counter, batch app |

## Validation Status

| Validation | Command | Result |
| --- | --- | --- |
| Old-name source scan | `rg -n -i "nestar|Nestar" --hidden --glob '!node_modules/**' --glob '!dist/**' --glob '!.git/**' .` | Passed after safe rename. |
| Lint | `npm run lint` | Passed. |
| Main build/typecheck | `npm run build` | Passed. |
| API project build | `npx nest build quickmeds-api` | Passed. |
| Batch project build | `npx nest build quickmeds-batch` | Passed. |
| Pharmacy API typecheck | `npx tsc -p apps/quickmeds-api/tsconfig.app.json --noEmit` | Passed. |
| Pharmacy batch typecheck | `npx tsc -p apps/quickmeds-batch/tsconfig.app.json --noEmit` | Passed. |
| Pharmacy service focused spec | `npx jest apps/quickmeds-api/src/components/pharmacy/pharmacy.service.spec.ts --runInBand` | Passed. |
| Full build after pharmacy migration | `npm run build` | Passed. |

## Explicitly Not Changed

| Not changed | Reason |
| --- | --- |
| `MemberType.USER`, `MemberType.AGENT`, `MemberType.ADMIN` | User requested member types remain unchanged. |
| Existing MongoDB data backfill | Requires a separate production migration plan. |
| Board article to health article rename | Outside this property-to-pharmacy phase. |

## Frontend Pharmacy Migration

The `quickMeds-next` frontend was migrated from the removed property GraphQL contract to the current pharmacy backend contract while preserving the existing Pages Router, Apollo integration, routes, and SCSS architecture.

| Task | Status | Notes |
| --- | --- | --- |
| Frontend pharmacy GraphQL migration | Completed | Replaced property operations and member property counters with pharmacy operations and `memberPharmacies`. |
| Pharmacy frontend types and enums | Completed | Added backend-aligned pharmacy types, statuses, locations, filters, inputs, and updates. |
| Public pharmacy catalog | Completed | Migrated catalog, detail, favorites, visited, homepage cards, likes, comments, and filters to pharmacy fields. |
| Pharmacy owner workflows | Completed | Kept `MemberType.AGENT` internally and changed visible terminology to Pharmacy Owner. |
| Owner pharmacy management | Completed | Migrated create, edit, status, image upload, and owner pharmacy list workflows. |
| Admin pharmacy management | Completed | Migrated admin queries, mutations, filters, statuses, and table content. |
| Branding and UI terminology | Completed | Updated visible Nestar and real-estate copy to quickMeds/pharmacy terminology while preserving route and SCSS compatibility. |
| Assets and layout cleanup | Completed | Removed the floor-plan UI and replaced obvious property fact icons with neutral catalog/service icons. |

## Frontend Validation

| Validation | Command | Result |
| --- | --- | --- |
| Frontend typecheck | `yarn typecheck --pretty false` | Passed. |
| Frontend production build | `yarn build` | Passed; all 73 static pages generated. |
| Live backend schema check | GraphQL introspection at `http://localhost:3007/graphql` | Passed; pharmacy query and mutation operations confirmed. |
| Live pharmacy catalog smoke query | `getPharmacies` with current pharmacy/member fields | Passed; returned an active pharmacy. |
| Served frontend smoke check | `http://localhost:3000/property` | Passed; returned quickMeds Pharmacy Search and pharmacy catalog content. |
| Stale GraphQL contract scan | Search for removed property operations, fields, and `PROPERTY` social groups | Passed. |
| Frontend lint | `yarn lint` | Blocked because the repository has no ESLint configuration and Next.js opens an interactive setup prompt. |
| In-app browser smoke test | In-app Browser connection | Blocked because no in-app browser session was available; HTTP smoke checks passed instead. |

## Frontend Original-Style Restoration

The original Nestar desktop visual structure was restored without reverting the quickMeds pharmacy contract, branding, routes, or neutral assets.

| Task | Status | Notes |
| --- | --- | --- |
| Homepage search restoration | Completed | Restored the original search bar, dropdown panels, advanced-filter modal, and circular search action with pharmacy filters. |
| Catalog sidebar restoration | Completed | Restored the original nested filter layout with pharmacy location, type, delivery, insurance, delivery fee, search, and reset controls. |
| Pharmacy editor restoration | Completed | Restored the original form rows, styled controls, upload panel, gallery, and save action around current pharmacy fields. |
| Cross-page visual cleanup | Completed | Restored wordmark sizing and replaced duplicated pharmacy facts with distinct medication, type, and location details. |
| SCSS compatibility | Completed | Preserved existing class names and SCSS architecture, adding only narrow pharmacy-specific adapters. |
| Pharmacy logic audit | Completed | Confirmed restored components contain no removed property GraphQL operations or property-only fields. |

## Frontend Style Restoration Validation

| Validation | Command | Result |
| --- | --- | --- |
| Frontend typecheck | `yarn typecheck --pretty false` | Passed. |
| Frontend production build | `yarn build` | Passed; all 73 static pages generated. |
| Diff whitespace check | `git diff --check` | Passed. |
| Served route checks | `/`, `/property`, `/mypage`, `/_admin/properties` | Passed; each returned HTTP 200. |
| Restored layout hook check | Served HTML and SCSS selector inspection | Passed; original search, filter, form, and wordmark hooks are present. |
| Property logic regression scan | Search for removed property operations and fields in restored components | Passed. |
| In-app visual browser | In-app Browser connection | Blocked because no in-app browser session was available; served route and layout-hook checks passed instead. |

## Canonical Public Pharmacy Routes

The public pharmacy catalog now uses pharmacy terminology in its canonical URLs while preserving old bookmarks.

| Task | Status | Notes |
| --- | --- | --- |
| Public catalog route | Completed | Moved the pharmacy catalog from `/property` to `/pharmacies`. |
| Public detail route | Completed | Moved pharmacy details from `/property/detail` to `/pharmacies/detail`. |
| Legacy compatibility | Completed | Added permanent redirects from both old routes and preserved query parameters. |
| Route consumers | Completed | Updated navigation, homepage search, filters, cards, favorites, owner pages, and admin detail links. |
| Deferred internal cleanup | Documented | Legacy component, type, SCSS, admin-route, and owner-category names remain for a separate incremental migration. |
# Delivery Fees And Operating Hours

- Added shared UZS formatting, owner delivery/hour controls, Open now/24/7 filters, operating badges, detail schedules, and admin missing-hours visibility.

## Restart Stabilization Checkpoint

- Frontend production build generated all 73 pages.
- Live backend schema matches the frontend Pharmacy, operating-hours, and inquiry fields.
- Public homepage, login, catalog, missing-detail, and mypage routes returned HTTP 200.
- Invalid-login behavior returned the expected current backend message without changing data.
- Live catalog smoke testing found one legacy fractional delivery fee (`3.5`) that must be normalized before seed work.

## Five Tashkent Demo Pharmacies

- Created five Pharmacy Owner accounts and five active Tashkent pharmacies through the live GraphQL API.
- Covered 24/7, missing, standard, closed-day, and overnight operating-hour states.
- Covered free delivery, paid delivery, pickup-only, and varied insurance support.
- Verified all five records render on the catalog; homepage and detail surfaces render representative demo records and related pharmacies.
- Verified the fallback pharmacy image, UZS fee display, Open-now filter, 24/7 filter, and idempotent seed behavior.

## June 14, 2026 Frontend Production Checkpoint

- Fixed the local runtime collision by leaving one healthy backend on `3007` and one frontend development server on `3000`; conflicting Next.js servers had shared `.next` and caused development-chunk 404 responses.
- Migrated every public desktop navbar to the compact Warm Civic Pharmacy treatment while preserving links, authentication, notifications, language behavior, routes, mobile navigation, and admin navigation.
- Added separate Login and Register actions across public desktop routes and positioned legacy `LayoutBasic` banners below the fixed navbar.
- Replaced the public pharmacy detail placeholder and property-era presentation with responsive pharmacy information, truthful services/hours, coordinate map fallback, owner/contact information, comments, nearby pharmacies, loading, error, and empty states.
- Stabilized login failures so GraphQL/network errors display meaningful messages without reloading or clearing an existing session.
- Added frontend support for integer UZS delivery fees, owner-defined weekly hours, explicit 24/7 status, Open-now filters, public status badges, and detail schedules.
- Replaced the desktop catalog’s visible Nestar property card with a catalog-only pharmacy-service card. Removed medication count, rank badge, floating price overlay, property-fact icons, views, likes, and disabled service labels from this surface.
- Added catalog loading skeletons, query-error recovery, improved empty state, resilient image fallback, semantic favorite/detail controls, and a contained two-column result grid at `1024px`.
- Preserved the legacy catalog banner/sidebar, mobile catalog placeholder, Favorites card, Recently Visited card, owner/admin presentation, and internal Property/Agent compatibility names for later phases.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- `git diff --check` passed.
- Homepage, catalog, pharmacy detail, Pharmacy Owners, community, account, My Page, CS, member, and About route checks returned HTTP 200.
- Referenced Next.js development assets returned HTTP 200 after the runtime cleanup.
- Catalog cards were visually checked at `1440px` and `1024px`.

## Pharmacy Detail Community Feedback Redesign

- Replaced the centered divider-based pharmacy comments presentation with compact, left-aligned bordered feedback cards.
- Feedback cards now show the real member avatar fallback, member nickname, profile navigation, truthful `Commented` date from `createdAt`, and comment content.
- Replaced numbered comment pagination with a full-width Load More interaction that appends pages and prevents duplicate comments.
- Added comment loading skeletons, query-error recovery, improved empty state, and mutation loading feedback.
- Moved comment submission behind an accessible `Write a comment` disclosure while preserving authentication and `CREATE_COMMENT` behavior.
- Added scoped desktop and mobile feedback styles without changing other pharmacy-detail sections or backend contracts.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- `git diff --check` passed.
- The detail route compiled successfully in the development server.
- Final visual verification of a valid pharmacy record remains pending because the available screenshot attempt was not completed.

## Pharmacy Comment Persistence Fix

- Replaced competing Apollo comment-list state writers with explicit network-only first-page and append operations.
- Successfully created comments are inserted immediately, remain visible during reconciliation, and are deduplicated against refreshed results.
- Comment drafts clear only after successful creation and remain available when creation fails.
- Load More remains append-only and cannot replace the newest first-page comments.
- Pharmacy detail comment inquiries now send the optional `CommentGroup.PHARMACY` filter.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- Backend focused comment and pharmacy tests passed: `7/7`.
- Backend API and batch TypeScript checks passed.
- Frontend and backend `git diff --check` passed.

## Pharmacy Catalog Hero Replacement

- Removed the large Nestar house-image banner and generic welcome copy from the desktop `/pharmacies` route only.
- Added a compact Warm Civic Pharmacy directory header with truthful catalog guidance, live result count, and the existing sorting control.
- Preserved all other `LayoutBasic` route banners without visual or behavioral changes.
- Reduced the gap before catalog filters and results while preserving filters, cards, pagination, query behavior, and the mobile placeholder.
- Added contained desktop behavior and a stacked utility layout at `1024px`.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- `git diff --check` passed.
- `/pharmacies` returned HTTP 200 and was visually verified at `1440px`, `1280px`, and `1024px`.

## Public LayoutBasic Hero Removal

- Removed the remaining large desktop image heroes and route-specific banner copy inherited from Nestar.
- Added a consistent fixed-navbar content offset to public `LayoutBasic` routes while leaving mobile rendering unchanged.
- Added compact Warm Civic Pharmacy introductions to the Pharmacy Owners directory and My Page.
- Reduced hero-compensating top spacing on Pharmacy Owner detail, Community list/detail, CS, Login/Signup, Member, and About pages.
- Preserved the existing pharmacy catalog directory header and all route, authentication, GraphQL, chat, footer, and page-business behavior.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- `git diff --check` passed.
- Headless browser verification was blocked by the existing local Next.js development runtime returning `missing required error components, refreshing...`; the production build confirms the affected routes compile.

## Public Accent Palette Migration

- Replaced remaining public legacy coral, orange, purple, red, and neon-green decorative accents with the QuickMeds emerald and mint palette.
- Updated the shared MUI theme so Material primary and secondary controls no longer reintroduce the old red and blue colors.
- Normalized visible active tabs, actions, favorites, owner/member controls, cards, About surfaces, and the brand-mark accent.
- Preserved red for semantic errors and destructive warnings.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- `git diff --check` passed.
- The known legacy public accent tokens no longer appear outside intentionally excluded admin styling.

## Community List And Detail Editorial Redesign

- Replaced the legacy Community sidebar/card-grid presentation with a Stitch-guided editorial article feed.
- Added truthful category labels, supported sorting, result totals, pagination, optional real article images, content excerpts, real engagement data, and authenticated article-writing actions.
- Added Community-specific loading skeletons, retryable error states, category empty states, and accessible like feedback without changing shared member/My Page cards.
- Rebuilt Community detail with a readable article column, real metadata, optional article image, semantic like control, responsive comments, comment editing/deletion, and unavailable/no-comment states.
- Replaced the Community list and detail mobile placeholders with responsive page layouts while preserving the existing global mobile navigation.
- Kept all backend, GraphQL, enum, route, authentication, editor, navbar, footer, and admin contracts unchanged.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- `git diff --check` passed.
- Community list and unavailable-detail states were visually checked in headless Chromium at desktop and narrow viewport sizes.
- Live article rows and valid article-detail content could not be visually confirmed because the current Community query remained in its loading state during the local screenshot window.

## Community Detail Reference-Match Refinement

- Matched the approved Stitch detail composition with a centered `820px` article panel, compact category/title/author/engagement hierarchy, optional real image, contained article body, and centered emerald like action.
- Scoped Toast UI viewer spacing and typography to Community detail without changing shared viewer behavior.
- Removed the detail-page Write an article link and restyled comments as compact individual bordered cards.
- Preserved real category labels, exact article dates, relative comment dates, likes, comments, author links, edit/delete behavior, pagination, and all existing states.

## Pharmacy Owner Directory Redesign

- Rebuilt the public `/agent` directory as a responsive Warm Civic Pharmacy Owner directory while preserving the legacy route and backend `Agent` compatibility terminology.
- Added a dedicated Pharmacy Owner card using real owner image, name, address, pharmacy count, views, likes, like state, and profile navigation.
- Corrected owner profile links to pass each real owner ID instead of the previous hardcoded value.
- Added explicit owner search, Enter-key search, supported recent/oldest/most-liked/most-viewed sorting, page-one reset after filter changes, and serialized query-state persistence.
- Preserved `GET_AGENTS` and `LIKE_TARGET_MEMBER`; likes now refetch with the active directory inquiry instead of resetting search and sort state.
- Replaced the mobile placeholder with the complete responsive directory and added loading skeletons, retryable error state, no-results state, accessible controls, image fallback, and reduced-motion handling.
- Left `/agent/detail`, My Page owner tools, admin owner pages, shared navbar, footer, backend contracts, and internal legacy names unchanged.

Validation completed:

- Live `getAgents` GraphQL checks returned six Pharmacy Owners and confirmed text search plus recent, oldest, most-liked, and most-viewed sorting.
- `/agent`, malformed `/agent?input=not-json`, and a real `/agent/detail?agentId=...` request returned HTTP 200.
- Desktop and mobile directory shells were visually checked in headless Chromium.
- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- `git diff --check` passed.

Remaining verification limitations:

- Authenticated like mutation behavior was not browser-tested because no authenticated browser session was available; unauthenticated protection and active-query refetch behavior were verified in code.
- Headless Chromium remained on the Apollo loading skeleton during the screenshot window even though direct live GraphQL requests succeeded.
- Pagination interaction could not be exercised with the current six-owner dataset and page limit of nine.
- The existing global mobile navbar clipping and Pharmacy Owner detail redesign remain separate phases.

## Login And Registration Warm Civic Redesign

- Rebuilt `/account/join` as one responsive login and registration experience instead of separate desktop behavior and a `LOGIN MOBILE` placeholder.
- Replaced the inherited real-estate city-tower visual with the existing realistic QuickMeds pharmacy image and truthful pharmacy-discovery guidance.
- Preserved the existing `LOGIN`, `SIGN_UP`, authentication helpers, access-token storage, automatic login after signup, normalized backend errors, and post-authentication redirect behavior.
- Added URL-synchronized Login and Register modes through `/account/join` and `/account/join?mode=signup`.
- Replaced input-level Enter handlers with a semantic form submission flow and prevented repeated submissions while authentication is pending.
- Removed unsupported Remember me and Lost your password controls.
- Replaced mutually exclusive role checkboxes with accessible User and Pharmacy Owner radio-card choices.
- Added inline authentication errors, safe internal-referrer handling, password visibility control, correct autocomplete values, phone input semantics, visible focus states, and complete mobile form presentation.
- Scoped the account page to the established Geist, Source Serif 4, off-white, emerald, mint, restrained-border, and limited-shadow visual language.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- `git diff --check` passed.
- Login, registration, and narrow mobile account layouts were visually checked in headless Chromium.
- The existing global mobile-navbar clipping remains visible at narrow widths and is deferred to the separate mobile-navigation phase.

## Admin Member Query Contract Alignment

- Confirmed the frontend already calls `getAllMembersByAdmin` with the correct GraphQL query operation; no frontend source workaround was added.
- Coordinated the backend resolver correction so the Admin Users request now validates against the live schema.

Validation completed:

- Live schema introspection lists `getAllMembersByAdmin` under `Query`, not `Mutation`.
- A live unauthenticated Admin Users query reaches the expected authorization guard instead of returning `Cannot query field`.
- `yarn typecheck --pretty false` and frontend `git diff --check` passed.

Validation limitations:

- `yarn build` compiled but could not complete while the active `next dev` process on port `3000` was using the shared `.next` directory; the missing vendor-chunk error is unrelated to this backend contract correction.
- Authenticated Admin Users interactions require an available admin browser session.

## Admin Redesign A1 — Shell And Real Overview

- Rebuilt the shared admin shell with a pale-blue navigation sidebar, warm off-white workspace, compact top bar, clear administrator identity, accessible logout, and active-route states.
- Added tablet drawer navigation and an honest phone-sized desktop-required state.
- Renamed visible `Cs` navigation to Support and marked it Coming soon without changing existing routes.
- Replaced the `/_admin` Users redirect with a real overview using existing admin query meta counters for users, pharmacies, pending pharmacy reviews, and Community articles.
- Preserved admin authorization, Apollo operations, backend contracts, legacy `/_admin/properties`, and all existing module behavior.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- `git diff --check` passed.

Validation limitations:

- The in-app browser tool was unavailable, so authenticated desktop and tablet visual checks remain pending.

## Admin Redesign A2 — Users Management

- Rebuilt `/_admin/users` as a Warm Civic admin table with a `USER MANAGEMENT` header, real result count, clear status tabs, nickname search, visible Search/Clear controls, and a member-type filter.
- Preserved `GET_ALL_MEMBERS_BY_ADMIN`, `UPDATE_MEMBER_BY_ADMIN`, `MembersInquiry` pagination/filter shape, profile links, admin authorization, and the shared admin shell.
- Replaced visible legacy labels such as `MB ID`, `NICK NAME`, `PHONE NUM`, `BLOCK CRIMES`, and `STATE` with User, Phone, Role, Warnings, Blocks, Status, Joined, and Actions.
- Displayed internal `AGENT` accounts as `Pharmacy Owner` while keeping the backend enum unchanged.
- Replaced ambiguous badge buttons with explicit Change role and Change status menus, mutation loading labels, and active-query refetch after updates.
- Added skeleton rows, retryable query-error state, no-results state, focus-visible controls, semantic status tabs, default avatar fallback, and tablet-friendly toolbar wrapping.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- `git diff --check` passed.

Validation limitations:

- Authenticated browser smoke checks for live role/status mutations, pagination, and filters remain pending because no authenticated admin browser session was available during this phase.

## Admin Redesign A3/A4 — Pharmacies And Community Styling Alignment

- Restyled `/_admin/properties` and `/_admin/community` to use the same Warm Civic management structure introduced on Users.
- Added matching page headers, real result counts, status tabs, restrained toolbar filters, bordered table panels, status chips, action menus, skeleton rows, retryable error states, and empty states.
- Replaced visible pharmacy table terminology with Pharmacy, Delivery & Hours, Pharmacy Owner, Region, Type, Status, and Actions while preserving the legacy `/_admin/properties` route and pharmacy GraphQL operations.
- Replaced visible Community table terminology with Article, Category, Author, Views, Likes, Published, Status, and Actions.
- Mapped Community categories without changing backend enums: `FREE` as Discussions, `RECOMMEND` as Recommendations, `NEWS` as News, and `HUMOR` as Community Corner.
- Removed local debug logging from the Community admin page and preserved existing pagination, filters, status updates, removal flows, and detail/profile links.

Validation completed:

- `yarn typecheck --pretty false` passed.

## Community Useful Content Seed

- Created eight active Community articles through Adam's normal authenticated `CREATE_BOARD_ARTICLE` workflow.
- Added exactly two useful public articles to each existing category: Discussions, Recommendations, News, and Community Corner.
- News posts describe live QuickMeds region-search and operating-hours capabilities rather than publishing unverified external health claims.
- Retired Adam's previous `asdasdasd` placeholder article through the normal article update mutation.
- No fake images, medical diagnoses, treatment instructions, direct database inserts, or source-code content records were added.

Created article IDs:

- Discussions: `6a2fef8b3929a3871d1ce3ac`, `6a2fef8b3929a3871d1ce3af`
- Recommendations: `6a2fef8b3929a3871d1ce3b2`, `6a2fef8b3929a3871d1ce3b5`
- News: `6a2fef8b3929a3871d1ce3b8`, `6a2fef8b3929a3871d1ce3bb`
- Community Corner: `6a2fef8b3929a3871d1ce3be`, `6a2fef8c3929a3871d1ce3c1`

Validation completed:

- Public GraphQL queries return exactly two active Adam-authored articles in every category.
- All eight article-detail queries return active records authored by `adam`.
- Every title and content body remains within the backend validation limits.
- Adam's `memberArticles` counter remains `9`; the existing article-retirement path does not decrement this counter correctly and requires separate backend correction.

## My Profile Avatar Sizing

- Reduced the profile editor image preview from a large rectangular panel to a compact circular avatar.
- Tightened upload-control spacing and added a narrow-workspace stacked layout.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- `git diff --check` passed.

Validation limitations:

- Authenticated profile-page visual verification was unavailable because the isolated headless session redirected to the signed-out homepage.

## Pharmacy Owner Card Fallback Polish

- Replaced the stretched full-card default owner image on `/agent` with a compact centered default profile avatar inside a restrained mint identity panel.
- Preserved real owner photos, owner likes, pharmacy-count badges, profile links, search, sorting, pagination, and all existing `GET_AGENTS` / `LIKE_TARGET_MEMBER` behavior.
- Kept the fallback truthful and avoided fake verification, ratings, specialties, or stock imagery.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages on retry after an initial stale `.next` page-module collection error.
- `git diff --check` passed.

## One-To-One Pharmacy Messaging Frontend

- Added Apollo operations and TypeScript models for message threads, message history, unread counts, sending messages, starting pharmacy conversations, and marking threads read.
- Added an authenticated header Messages icon with unread badge before the account avatar.
- Added My Page `Messages` under Connections and implemented a responsive inbox with thread list, selected history, text composer, image attachments, read-state clearing, `?threadId=...` support, and loading/error/empty states.
- Refined the desktop inbox to match the approved integrated workspace direction: no separate chat bubble, searchable thread list, unread summary, selected conversation header, optional call action, View pharmacy action, and contained composer.
- Replaced the pharmacy-detail disabled contact card with a real customer-to-owner message form for logged-in non-owner users, including image upload through the existing GraphQL upload endpoint with `target: messages`.
- Preserved unauthenticated login guidance and owner self-message protection on pharmacy detail.
- Updated the existing global raw chat to use event listeners so future chatbot/global-chat behavior can coexist with message WebSocket events.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- Backend `npm run build`, API TypeScript, batch TypeScript, and Jest service tests passed.

## Homepage Interactive Trending Pharmacies

- Replaced the active homepage `Popular choices` section with a Framer Motion-powered `Trending pharmacies` section sorted by pharmacy likes.
- Added a large selected pharmacy card with a compact right-side selection grid; selecting a compact card swaps it into the featured position while the previous feature returns to the compact set.
- Preserved the existing `GET_PHARMACIES`, `LIKE_TARGET_PHARMACY`, favorite refetch, SweetAlert error/success handling, and `/pharmacies/detail?id=...` navigation behavior.
- Used only supported pharmacy-discovery fields: name, address, image, type, delivery fee, delivery, insurance, verified status, open status, and likes.
- Added desktop, tablet, mobile, loading, error, empty, focus, and reduced-motion styles in the existing homepage SCSS.
- Refined the interaction after visual QA: UI copy now uses likes instead of saves, card dimensions are fixed across swaps, the desktop section height is reduced to fit the viewport better, and Framer Motion animates the selected-card change without morphing the compact grid container size.
- Upgraded the interaction to a shared-layout pharmacy handoff: card and image `layoutId`s now move the selected compact pharmacy into the featured container, feature details fade in after the movement begins, hover states lift/zoom cards calmly, and every compact card includes a real `View pharmacy` detail link.
- Removed the featured signal boxes and changed compact-card rendering to a direct Framer layout list so the right grid packs without leaving an empty slot during selection.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- `git diff --check` passed.
- Hydrated local homepage DOM confirmed `Trending pharmacies`, `home-trending-feature`, and compact card markup while `Popular choices` was absent.
- Raw headless Chrome screenshot capture was attempted, but the local Next dev FOUC-hiding style produced blank screenshots; DOM validation and production build passed.

## Homepage Pharmacy Owner CTA Spotlight

- Replaced the thin homepage `For Pharmacy Owners` row with a two-column image-led owner acquisition CTA.
- Added a new generated pharmacy interior asset at `public/img/homepage/owner-pharmacy-spotlight.webp`.
- Updated CTA copy around joining the QuickMeds pharmacy network, boosting local discovery, and building patient trust without product, inventory, rating, prescription, price-comparison, or guaranteed-sales claims.
- Preserved route behavior with `Become a Pharmacy Owner` linking to `/account/join?mode=signup` and `Explore Pharmacy Owners` linking to `/agent`.
- Added desktop, tablet, and mobile responsive styles in the existing homepage SCSS.
- Added restrained Framer Motion entrance, hover, and tap interactions for the image card, stat badge, benefit rows, and CTA buttons, with reduced-motion fallbacks.
- Removed the `Owner spotlight` overlay label from the image card.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages after clearing the stale generated `.next` cache from the earlier page-module error.
- `git diff --check` passed.
- Local served homepage HTML confirmed the owner CTA copy, `Become a Pharmacy Owner` route, and `owner-pharmacy-spotlight.webp` image reference; `Owner spotlight` text is absent.

## Homepage Supporting Motion And My Page Footer Cleanup

- Added restrained Framer Motion scroll-in and hover interactions to the homepage `Why QuickMeds` and `Explore supported areas` sections.
- Kept supported-area links as real pharmacy-search links while adding motion wrappers and focus-visible styling that preserve the existing grid layout.
- Removed the shared footer from `/mypage` on both desktop and mobile layouts while keeping the footer on other `LayoutBasic` routes.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- `git diff --check` passed.
- Served homepage HTML confirmed `Why QuickMeds`, `Know the essentials before you choose a pharmacy`, and `Explore supported areas` remain present.
- Served `/mypage` HTML confirmed the route rendered while shared footer markers were absent.

## Homepage Owner CTA Button Visibility Fix

- Corrected the `Become a Pharmacy Owner` primary CTA styling in the homepage owner section so its text remains white on the emerald button.
- Increased selector specificity for the primary CTA state without changing the route, copy, layout, or secondary `Explore Pharmacy Owners` button.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `git diff --check` passed.

## Mobile Homepage Trending, Community, And Footer Refinement

- Updated the mobile homepage so `Trending pharmacies` uses the same vertical pharmacy-card treatment as `Featured pharmacies`.
- Preserved the desktop trending large-feature/shared-layout interaction and existing pharmacy query, favorite, refetch, and detail-link behavior.
- Added mobile-only Framer Motion reveal/tap polish to homepage pharmacy cards and the compact homepage footer with reduced-motion fallbacks.
- Replaced the bulky shared mobile footer on the homepage with a compact homepage-only footer that clears the fixed bottom tab bar.
- Restored `Community health reading` on mobile as compact article cards backed by the existing `GET_BOARD_ARTICLES` query and `/community/detail` routes.
- Kept the mobile Pharmacy Owner CTA as the image-led card with a visible `Join as a pharmacy owner` button, avoiding loose desktop action links in the mobile layout.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- `git diff --check` passed.
- Mobile screenshots at 390px and 430px confirmed Featured and Trending share the same mobile card style.
- A tall 390px mobile screenshot confirmed `Community health reading` appears after `Why QuickMeds`, the owner CTA renders as the mobile image card, and the compact footer stays above the fixed bottom tab bar.

## Mobile Pharmacy Directory Redesign

- Replaced the `/pharmacies` mobile placeholder with a real mobile pharmacy directory using the existing `GET_PHARMACIES` query, `LIKE_TARGET_PHARMACY` mutation, serialized inquiry routing, and `/pharmacies/detail?id=...` links.
- Added the mobile catalog structure from the approved reference: compact catalog top bar, directory heading, search row, active filter chips, stacked pharmacy cards, filter bottom sheet, bottom tabs, and logged-in messaging entry points.
- Added mobile-only Framer Motion interactions for card reveal, tap feedback, bottom tabs, and filter sheet/backdrop transitions with reduced-motion fallbacks.
- Added a `/pharmacies` mobile top-bar branch that shows guest login/profile access for guests and messages, notifications, avatar, and logout menu for logged-in users.
- Added a catalog-specific initial mobile render path so phone-width users do not see the desktop catalog sidebar/filter layout while hydration catches up.
- Kept the desktop `/pharmacies` catalog route and shared desktop navbar behavior unchanged after desktop device detection.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- `git diff --check` passed.
- Production `/pharmacies` HTML contains `quickmeds-catalog` and `catalog-mobile-page`, and no longer contains the desktop `property-list-page` or `filter-main` markers on the initial route markup.
- Production 390px mobile screenshot confirmed the app-style catalog, search, chips, stacked pharmacy cards, and bottom tabs render without the desktop sidebar/filter block.

Validation limitations:

- Automated click validation for the filter bottom sheet was not run because Playwright is not installed in this workspace; the sheet is wired through the mobile filter button and covered by typecheck/build validation.

## Navigation And Pharmacy Owner Placement Fix

- Removed `Pharmacy Owners` from the public desktop navbar and generic mobile public nav.
- Added a mobile `/pharmacies` header menu sheet so users can navigate to Home, Pharmacies, Community, CS, and My Page/Login from the catalog header.
- Preserved logged-in catalog header actions for Messages, Notifications, avatar, and logout.
- Removed the homepage mobile Owners bottom tab and footer shortcut, replacing the bottom tab with Messages and the footer link with Community.
- Moved owner actions into My Page as the final `For Pharmacy Owners` group.
- Normal users now get `Become a Pharmacy Owner` and `Explore Pharmacy Owners`; pharmacy-owner accounts get `My Pharmacies`, `Add Pharmacy`, and `Explore Pharmacy Owners`.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- `git diff --check` passed.
- Source scan confirmed public `Top.tsx` and homepage mobile tabs/footer no longer expose `/agent`; `/agent` remains only in the My Page `For Pharmacy Owners` action group.

## Community Mobile Error And Layout Fix

- Added safer Community category routing so invalid or missing `articleCategory` values normalize back to `FREE` without stale state.
- Improved Community article-list error copy so API/network failures tell maintainers to verify the backend on port `3007` and remain retryable.
- Hardened Community list and detail rendering for missing article titles, content, member links, dates, category labels, and metric counts.
- Routed Community list and detail through the shared mobile top-navbar shell so phone users get the same compact top navigation as the rest of the mobile public app.
- Tightened the Community mobile layout with fixed-top spacing, smaller balanced intro typography, scrollable category tabs, full-width sort control, compact article rows, and stronger mobile empty/error states.
- Corrected the device-detection first render so server and client HTML match during hydration, then switch to the actual mobile shell after mount.

Validation completed:

- Local GraphQL health check on `http://127.0.0.1:3007/graphql` returned `{"data":{"__typename":"Query"}}`.
- Local Community article query returned two `FREE` records, including `6a2fef8b3929a3871d1ce3af`.
- Local Next dev route checks returned `200` for `/community?articleCategory=FREE`, `/community?articleCategory=NEWS`, and `/community/detail?id=6a2fef8b3929a3871d1ce3af&articleCategory=FREE`.
- Served HTML confirmed Community list and detail render under `mobile-wrap quickmeds-community` with the shared `catalog-mobile-top` navbar.
- After the hydration correction, the served Community HTML no longer contains the Next.js hydration error overlay markers.
- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- `git diff --check` passed.

Validation limitations:

- Headless Chrome screenshot and DOM-dump capture crashed locally with `Trace/BPT trap`; validation used direct backend probes, served HTML markers, typecheck, and production build instead.

## My Page Mobile Left Menu Redesign

- Replaced the mobile My Page section `<select>` with a left-side modal sheet opened from a compact My Page menu trigger.
- Kept `myProfile` as the default section when no valid `category` query is present.
- Reused the existing My Page navigation groups, links, owner/admin visibility rules, logout behavior, route aliases, and query-driven section rendering.
- Added active-section checkmark treatment, backdrop close, close button, route-change close behavior, and body-scroll locking while the mobile sheet is open.
- Preserved the desktop My Page sidebar and existing section routes.
- Refined the mobile sheet into a desktop-aligned light sidebar drawer with grouped labels, visible icons, emerald active rows, Framer Motion left-slide animation, dim backdrop, and Escape-key close.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- `git diff --check` passed.
- Source scan confirmed the old `my-page-menu__mobile-select` and `my-page-section` select control are removed from `MyMenu`.

Validation limitations:

- Authenticated mobile visual QA was not completed in-browser during this pass; `/mypage` redirects without a signed-in session.

## My Page Mobile Profile Form Fix

- Removed the mobile-only `MY PROFILE PAGE MOBILE` placeholder and render the real My Profile form on mobile and desktop.
- Preserved the existing profile image upload, username, phone, address, `UPDATE_MEMBER`, JWT refresh, and success/error alerts.
- Fixed the Update Profile button so it enables when any profile field changes, without forcing empty optional fields such as address or profile image to be filled.
- Hardened profile state updates to avoid direct mutation during image upload and keep user data synced from `userVar`.
- Extended the desktop My Profile card styling to `#mobile-wrap`, with phone-sized avatar/upload layout, one-column fields, emerald focus states, and a full-width mobile update button.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- `git diff --check` passed.

Validation limitations:

- Authenticated 390px/430px visual QA and live profile update/upload checks remain pending because this pass did not use a signed-in browser session.

## My Page Mobile Trigger Placement Fix

- Moved the mobile My Page section trigger into the user identity row so the active section control appears beside the avatar/account details instead of as a separate full-width row.
- Preserved the existing left-side modal, route-driven categories, active label, owner/admin visibility, backdrop close, Escape close, route-change close, and desktop sidebar behavior.
- Tightened the mobile trigger into a compact pill with a 42px tap target and ellipsis handling for long section labels.

Validation completed:

- `yarn typecheck --pretty false` passed.

## My Page Mobile Sections Fix

- Removed mobile placeholder branches from Followers, Followings, My Articles, Write Article, and the shared Community card so mobile My Page now reuses the same working desktop functionality.
- Preserved existing follower/following queries, follow/unfollow actions, member likes, profile navigation, article query, article likes, detail navigation, pagination, and the Toast UI write-article flow.
- Added phone-specific card/layout styling for follower rows, following rows, My Articles cards, empty states, pagination, and the write-article editor surface.
- Added arrow indicators to My Page menu items that leave the section flow, including `Become a Pharmacy Owner` and `Explore Pharmacy Owners`, while keeping active checkmarks only on category section links.
- Kept backend contracts, GraphQL operations, routes, owner/admin visibility rules, and desktop section rendering unchanged.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- `git diff --check` passed.

Validation limitations:

- Authenticated 390px/430px browser QA remains pending for this pass.

## My Page Follow State Logic Fix

- Fixed My Page Followings so rows in the signed-in user's own followings list always render as `Following` with an `Unfollow` action.
- Kept Followers relationship-based, so follower rows still show Follow or Unfollow depending on whether the signed-in user follows that member back.
- Hardened follow-state checks in Followers, Followings, and member profile menu to use `meFollowed.some(...)` instead of trusting the first aggregation row.
- Added missing-id guards before member follow, unfollow, like, and profile-navigation actions fire from follow rows.
- Preserved existing member-like, article-like, favorite-pharmacy, article-detail, and comment-detail contracts.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- `git diff --check` passed.

Validation limitations:

- Authenticated follow/unfollow browser QA remains pending for this pass.

## Pharmacy Owner Detail Redesign

- Replaced the legacy `/agent/detail?agentId=...` desktop/mobile split with one responsive Pharmacy Owner detail page.
- Removed this route's dependency on legacy `PropertyBigCard` and `ReviewCard`, so the page no longer falls back to `PHARMACY OWNER DETAIL MOBILE`, `PHARMACY CARD`, or `REVIEW CARD` placeholders.
- Preserved existing `agentId`, `GET_MEMBER`, `GET_PHARMACIES`, `GET_COMMENTS`, `LIKE_TARGET_PHARMACY`, and `CREATE_COMMENT` contracts.
- Added loading, missing-owner, owner-load-error, pharmacy-load-error, comments-load-error, empty-pharmacies, and empty-comments states.
- Added a redesigned owner profile header, modern owner pharmacy cards, real comment cards, pagination, and signed-in/self-comment guards.
- Replaced the old owner-detail SCSS with a responsive emerald/mint page system for desktop and mobile.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 73 pages.
- `git diff --check` passed.
- Source scan confirmed `/agent/detail` no longer contains the old mobile placeholder, `agent-detail-page`, `PropertyBigCard`, or `ReviewCard`.

Validation limitations:

- Local HTTP route probes could not connect to the existing port `3000` listener, and backend `3007` was unreachable from this shell during validation.
- Authenticated owner-detail interaction QA remains pending for pharmacy likes, detail links, and comment submission.

## Messages Fixed Chat Layout And Scroll Behavior

- Refined `MyMessages` so the Messages workspace uses a bounded full-height chat structure instead of allowing the whole page to grow with message history.
- The desktop inbox now has independent scroll ownership: the conversation list scrolls inside the left column, and the active conversation history scrolls inside the chat column.
- The active chat header and composer remain non-scrolling flex children while message history is the only vertical scroll area inside the conversation.
- Added near-bottom tracking so sent or received messages auto-scroll only when the user is already near the latest message.
- Added a `New messages` scroll-to-bottom control for messages received while the user is reading older content.
- Added message scroll/composer/send/new-message `data-testid` hooks.
- Preserved existing GraphQL queries and mutations, image upload flow, socket event handling, unread marking, pharmacy links, and message ordering.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 70 current pages.
- `/mypage?category=messages` returned HTTP 200 from the local Next.js server when probed with localhost access.
- Source scan confirmed the required Messages `data-testid` hooks and scroll-layout CSS hooks are present.

Validation limitations:

- Authenticated inbox interaction QA remains pending for live send/receive, scroll-position preservation while reading older messages, the new-message indicator click path, and 390px/430px keyboard behavior because this pass did not use a signed-in browser session.

## Shared Public Footer Standardization

- Replaced the split desktop/mobile `Footer` rendering with one shared professional QuickMeds footer used by public layouts.
- Updated the footer copy, contact formatting, navigation columns, region links, social icon treatment, copyright line, and responsive spacing to remove the legacy real-estate-era labels.
- Removed the homepage-only mobile footer component from `LayoutHome`, so desktop and mobile homepage rendering now use the same shared footer component as other public pages.
- Added unified desktop and mobile footer styles with an emerald surface, accessible link/focus states, responsive columns, and safe-area-aware mobile bottom padding.
- Kept `/mypage` footer omission unchanged because that route intentionally uses the account workspace layout.

Validation completed:

- Source scan confirmed stale footer labels and the old `.home-mobile-footer` selector are no longer present in `libs` or `scss`.
- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 70 current pages.
- `git diff --check` passed.

Validation limitations:

- Manual browser visual QA across every public route remains pending for authenticated and localized states.

## Mobile Messages Telegram-Style Navigation

- Redesigned mobile `/mypage?category=messages` navigation so the initial phone view shows only the conversation list.
- Added state-driven mobile chat opening: selecting a row pushes `threadId`, opens a full Messages-area overlay, and browser/back-button navigation returns to the list by removing the selected thread.
- Added a dedicated mobile chat header with back button, avatar, participant name, pharmacy context, compact call action, and compact View pharmacy action.
- Kept the existing shared GraphQL queries, mutations, image upload, socket refresh, unread marking, message ordering, and desktop chat layout.
- Hid the My Page sidebar only for mobile Messages, leaving other My Page sections and desktop Messages unchanged.
- Added mobile-specific layout rules below 767px: conversation list owns the list scroll, the chat overlay slides in from the right and covers the list completely, and only message history scrolls inside the active chat.
- Added the requested test hooks for conversation list rows, mobile overlay, mobile back button, message history, composer, send button, scroll-to-latest button, and View pharmacy action.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 70 current pages.
- `git diff --check` passed.
- `/mypage?category=messages` returned HTTP 200 from the local Next.js server when probed with localhost access.
- Source scan confirmed the mobile overlay, slide transforms, breakpoint scoping, page-level messages class, and requested test hooks are present.

Validation limitations:

- Authenticated browser interaction QA remains pending for 320px, 375px, iPhone 14 Pro Max, tablet, and desktop because this shell did not have an authenticated inbox session or browser automation package available.

## Messages Navigation And Composer Follow-up

- Added a compact mobile My Page section switcher to the Messages list title row using the same rounded trigger and navigation sheet behavior as the main My Page mobile menu.
- Removed the extra right-side View pharmacy button from the active chat header.
- Made the chat header identity area clickable when a pharmacy is available, so the avatar/name area opens `/pharmacies/detail?id=...` and carries the existing `view-pharmacy-action` test hook.
- Reworked the desktop composer so the textarea comes first and the Attach/Send controls sit directly after the input area.
- Added desktop Enter-to-send behavior while preserving Shift+Enter line breaks and mobile multiline keyboard behavior.
- Preserved all existing message queries, mutations, image upload, sockets, unread marking, thread routing, and scroll-to-latest behavior.

## Mobile Messages Menu Trigger Correction

- Replaced the horizontal Messages shortcut chip row with a single rounded mobile menu trigger in the right side of the Messages title row.
- Extracted the My Page mobile navigation trigger/sheet into a reusable component so the main My Page sidebar and mobile Messages list open the same section menu.
- Rendered the shared mobile menu sheet/backdrop through a portal to `document.body`, preventing Messages thread button styles from leaking into the sheet.
- Kept the Messages list-first mobile flow, full-screen chat overlay, clickable pharmacy identity, desktop composer placement, and desktop Enter-to-send behavior unchanged.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 70 current pages.
- `git diff --check` passed.

Validation limitations:

- Authenticated browser QA remains pending for the shared mobile menu trigger/sheet from Messages, clickable chat identity, desktop Enter-to-send, and attachment/send controls.

## My Page Mobile Menu Portal Style Fix

- Fixed the shared mobile My Page menu sheet after its portal move by adding mobile-scoped global styles for the portaled backdrop and sheet under `document.body`.
- The root cause was that the original sheet styles were nested under `#my-page`; after rendering through a portal, those selectors no longer matched, so the menu appeared as unstyled raw content at the bottom of mobile pages.
- Kept the shared `MyPageMobileMenu` component, existing menu groups, route categories, active states, logout/admin behavior, Messages trigger placement, and chat behavior unchanged.
- Added token fallbacks directly on the portaled sheet so it no longer depends on CSS variables inherited from the My Page route wrapper.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 70 current pages.

## Messages Mobile Entry State Fix

- Fixed the mobile route-entry race where Messages could briefly inherit the desktop device default and auto-select the first conversation when navigating in from another My Page section.
- Desktop still auto-selects the first thread for the two-pane chat workspace, but only after device detection is ready and the viewport is wider than the mobile breakpoint.
- Added the shared mobile My Page menu trigger to Messages loading, error, and empty states so mobile users are not trapped on `/mypage?category=messages` while the normal My Page sidebar is intentionally hidden.
- Kept existing message queries, thread routing, send/upload behavior, socket refresh, unread marking, desktop composer behavior, and the full-screen mobile chat overlay unchanged.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 70 current pages.

## Mobile Followers And Followings Card Redesign

- Redesigned only the mobile `/mypage?category=followers` and `/mypage?category=followings` presentation from the raw table-style layout into compact QuickMeds member cards.
- Mobile follow cards now hide the desktop `Name / Details / Subscription` header row, constrain avatars to a fixed circular size, present member stats as compact chips, and keep Follow/Unfollow actions aligned inside the card.
- Preserved existing GraphQL queries, follow/unfollow handlers, member-like handler, profile navigation, empty states, and own-Followings duplicate-follow protection.
- Restored the desktop Followers/Followings JSX to the previous working structure after the mobile pass; the remaining follow-list redesign is isolated to `max-width: 767px` SCSS.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` initially compiled and generated pages but hit a transient `.next` file-move error; rerunning `yarn build` passed and generated all 70 current pages.

## Desktop Followers And Followings Restore

- Restored `MemberFollowers` and `MemberFollowings` markup to the previous desktop structure, removing mobile-only helper markup that had affected desktop rendering.
- Kept the mobile-only SCSS card layout below `767px`, now based on the original desktop-compatible markup.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 70 current pages.

## Desktop Community Layout Overflow Fix

- Fixed desktop-only horizontal overflow in the homepage Community health reading section by allowing article grid tracks and card children to shrink within the homepage shell.
- Added desktop-only overflow safeguards to the `/community` article list so footer actions and metrics wrap inside their row instead of widening the page.
- Scoped the changes to `min-width: 768px` desktop selectors so the existing mobile Community and homepage article layouts remain controlled by their mobile rules.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 70 current pages.

## Desktop Followers And Followings Layout Fix

- Fixed the remaining desktop `/mypage?category=followers` and `/mypage?category=followings` rendering problem after the JSX restore.
- Root cause: the original-compatible `MemberFollowers` and `MemberFollowings` markup was restored, but the desktop SCSS for the restored classes was missing, so the page rendered as raw stacked content.
- Added desktop-only `min-width: 768px` styles for the existing follows markup: header row, three-column rows, fixed circular avatars, stat cards, aligned Follow/Unfollow actions, empty state, and centered pagination.
- Kept the mobile Followers/Followings card presentation isolated to the existing `max-width: 767px` styles and did not change GraphQL, follow/unfollow, like, pagination, or profile-navigation logic.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 70 current pages.
- `git diff --check` passed.

## My Pharmacies Mobile Section

- Renamed the owner pharmacy section component from `MyProperties` to `MyPharmacies` and the My Page owner card from `PropertyCard` to `MyPharmacyCard`.
- Kept `/mypage?category=myPharmacies` and the existing desktop `#my-property-page` / `property-card-box` structure intact so the current desktop style remains unchanged.
- Replaced the mobile placeholders with a real My Pharmacies mobile presentation: status summary, status filters, loading skeletons, retryable error state, empty state, mobile pharmacy cards, pagination, and View/Edit/More actions.
- Mobile cards now show pharmacy image, status, open/hours state, address, pharmacy type, delivery, insurance, views, published date, and a More menu for close/delete actions.
- Preserved `GET_AGENT_PHARMACIES`, `UPDATE_PHARMACY`, status filtering, edit navigation to `addPharmacy`, close action, delete-as-`DELETE`, and pagination contracts.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` initially compiled but hit a transient `.next` page-module error for `/about`; rerunning `yarn build` passed and generated all 70 current pages.
- `git diff --check` passed.

## Mobile Add Pharmacy Section

- Added a real mobile render path to `AddNewProperty.tsx` while preserving the existing desktop JSX branch and `scss/pc/mypage/addNewProperty.scss` styling.
- Mobile Add Pharmacy now uses grouped cards for basics, services, location, working hours, photos, and description, plus a safe-area-aware sticky Save pharmacy bar.
- Reused the same `form` state, `update`, `uploadImages`, `removeImage`, and `submit` handlers so create, edit, image upload, and return-to-My-Pharmacies behavior stay contract-compatible.
- Preserved `CREATE_PHARMACY`, `UPDATE_PHARMACY`, `GET_PHARMACY`, `imagesUploader(target: "pharmacy")`, `pharmacyId`/legacy `propertyId` edit hydration, and `/mypage?category=myPharmacies` post-save routing.
- Mobile controls now keep delivery fee disabled when delivery is off, hide day-by-day hours when Open 24/7 is enabled, preview uploaded images, and keep Save disabled until name, address, and at least one image are present.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 70 current pages.
- `git diff --check` passed.

## Mobile My Page Typography Normalization

- Tightened mobile-only typography for My Page section headers, Followers, Followings, and Add Pharmacy so the newer mobile sections match the compact QuickMeds account workspace style.
- Reduced oversized Add Pharmacy mobile summary/card headings, field labels, inputs, toggle labels, upload copy, and sticky Save button text without changing form structure or behavior.
- Reduced Followers/Followings mobile member names, stat number sizing, stat chip height/padding, and action text while keeping touch targets usable.
- Kept desktop Followers/Followings and desktop Add Pharmacy styles unchanged.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 70 current pages.
- `git diff --check` passed.

## Pharmacy Detail Mobile Card Width Fix

- Fixed mobile `/pharmacies/detail` owner and contact cards shrinking to their content width after the detail layout switches from desktop grid to mobile flex column.
- Set the mobile detail layout to stretch its children and gave the owner/contact cards full-width border-box sizing, preserving the existing desktop pharmacy detail layout and behavior.
- Kept nearby pharmacy cards, main detail sections, comments, messaging/upload logic, and GraphQL contracts unchanged.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 70 current pages.
- `git diff --check` passed.

## Mobile Navigation Outside-Tap Close And Uzbek Locale

- Reworked the public mobile navigation sheet and My Page mobile section sheet so each uses a full-screen overlay that closes on outside pointer press while preserving the existing X close, route-change close, and body scroll lock behavior.
- Kept desktop navigation structure unchanged; the only desktop-facing change is adding Uzbek to the existing language dropdown.
- Added `uz` to the `next-i18next` locale list, created the Uzbek common translation namespace, added an Uzbek flag asset, and hardened stored locale handling so stale language values fall back to English.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 90 current locale-expanded pages.
- `git diff --check` passed.

## Mobile CS Page

- Replaced the mobile `/cs`, Notice, and FAQ placeholders with the real shared CS content so the mobile route now exposes the same Notice and FAQ behavior as desktop.
- Added mobile-only CS styling under `#mobile-wrap`, including a compact support header, segmented Notice/FAQ tabs, stacked notice cards, scrollable FAQ category chips, and wrapping mobile-safe accordions.
- Cleaned visible CS copy away from legacy real-estate wording toward QuickMeds pharmacy discovery and Pharmacy Owner terminology while preserving local component data and route query behavior.
- Kept the existing desktop `#pc-wrap .cs-page` stylesheet unchanged.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 90 current locale-expanded pages.
- `git diff --check` passed.

## CS FAQ Content Upgrade

- Made public `/cs` FAQ-first by default while keeping `/cs?tab=notice` route-compatible.
- Removed fake promotional/news-style Notice rows and replaced them with an honest empty platform-notice state.
- Replaced the old noisy FAQ data with 18 practical QuickMeds support answers across Getting Started, Pharmacy Search, Messaging, Account, and Pharmacy Owners.
- Preserved the existing local FAQ accordion behavior, CS routes, admin CS pages, backend contracts, and GraphQL contracts.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 90 current locale-expanded pages.
- `git diff --check` passed.

## Desktop Typography Normalization

- Increased desktop public navbar route and auth labels to 14px so top navigation matches the My Page sidebar navigation scale without changing navbar layout, routes, icons, language controls, or spacing.
- Tightened desktop My Page header scale more noticeably by reducing the section title clamp, description size, and eyebrow size/letter spacing.
- Reduced legacy desktop My Page section titles from 30px to 22px where those older `.main-title` styles remain, using desktop-only overrides for shared desktop/mobile files.
- Reduced desktop Followers/Followings table headers, member names, and stat numbers while preserving restored row layout, follow/unfollow, likes, pagination, and profile navigation behavior.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` initially compiled but hit a transient Next page-module lookup error for `/_document`; rerunning `yarn build` passed and generated all 90 current locale-expanded pages.
- `git diff --check` passed.

## Member Follow Count Cleanup

- Removed the visible parentheses around Followers, Followings, and Likes counts in the My Page Followers/Followings rows so the stat cards render plain numbers.
- Preserved the existing follow/unfollow, member like, pagination, profile navigation, GraphQL, and mobile/desktop layout behavior.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 90 current locale-expanded pages.
- `git diff --check` passed.

## Messages Sent-Message Rendering Fix

- Added local reconciliation for successful `SEND_MESSAGE` results so newly sent messages render immediately in the active My Page chat history while `GET_MESSAGES` remains the server source of truth.
- Merged server messages and pending sent messages by message id, sorted them by creation time, and removed pending entries once the server message list includes the same id.
- Stabilized the active message inquiry and preserved existing message send, upload, socket refresh, unread marking, desktop Enter-to-send, mobile overlay, thread preview, and scroll behavior.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 90 current locale-expanded pages.
- `git diff --check` passed.

## Messages Receiver Real-Time Delivery Fix

- Updated My Page Messages to consume complete raw WebSocket `message:new` payloads and merge received messages into local chat state immediately instead of waiting on a successful message-history refetch.
- Added local thread-preview reconciliation so incoming messages update the conversation list preview, timestamp, ordering, and unread count while GraphQL remains the source of truth.
- Enabled raw WebSocket reconnect in the existing Apollo WebSocket setup and kept Socket.IO, polling, duplicate sockets, uploads, unread marking, and responsive chat layout unchanged.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 90 current locale-expanded pages.
- `git diff --check` passed.

## QuickMeds Assistant Chatbot Frontend

- Replaced the reserved floating global `Online Chat` UI with an isolated QuickMeds Assistant launcher and panel while keeping My Page pharmacy Messages separate.
- Integrated `@assistant-ui/react@0.8.20` with `useExternalStoreRuntime`, pinned to the older Assistant UI line because the current release requires TypeScript syntax newer than this repo's 4.6 compiler.
- Added a desktop right-bottom assistant panel and mobile full-screen overlay using the existing emerald/mint SCSS language, suggested prompts, loading state, retryable error copy, route action buttons, and safe-area-aware composer.
- The assistant calls `POST /api/v1/chatbot/message` on the QuickMeds backend through `REACT_APP_API_URL`; no AI provider key is exposed to the frontend.
- Fixed assistant CSS scoping so desktop uses the right-bottom `#pc-wrap` panel while mobile uses the full-screen `#mobile-wrap` overlay; mobile rules no longer override desktop due import order.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 90 current locale-expanded pages.

Remaining verification:

- Browser visual QA and live provider QA remain pending until the backend is restarted with the new endpoint and assistant provider env is configured.

## QuickMeds Assistant Launcher Overlap Fix

- Removed the open-state bottom-right assistant launcher so it no longer turns into a floating `X` over the composer/send area.
- Kept the desktop header close button and mobile back/close controls as the open-state close affordances.
- Added defensive desktop and mobile CSS guards that hide the launcher whenever the assistant root is open.
- Reduced the desktop assistant panel from the previous oversized dimensions to a more compact right-bottom panel while keeping the mobile assistant full-screen.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 90 current locale-expanded pages.
- `git diff --check` passed.

Remaining verification:

- Browser visual QA for the compact desktop panel and composer send-button click path remains pending.

## Homepage Desktop Featured Pharmacies Disable

- Added a `mobileOnly` option to the homepage pharmacy section so the existing Featured pharmacies surface can remain available on mobile while being disabled on desktop.
- Marked the homepage Featured pharmacies section as mobile-only; desktop now skips rendering the section and skips its pharmacy query, so Trending pharmacies follows the hero/search area without an empty gap.
- Preserved the mobile Featured pharmacies query, cards, favorite behavior, loading/error/empty states, and motion behavior.

Validation completed:

- `yarn typecheck --pretty false` passed.
- `yarn build` passed and generated all 90 current locale-expanded pages.
- `git diff --check` passed.

Remaining verification:

- Browser visual QA remains pending for desktop homepage spacing and mobile Featured pharmacies visibility at 390px and 430px.

## QuickMeds Assistant Gemini Integration

- Kept the existing Assistant UI visual shell and frontend REST transport while updating status handling for Gemini-backed `unavailable` and `rate_limited` responses.
- Backend provider was migrated from OpenAI-compatible env names to Google Gemini API through Google AI Studio with the official `@google/genai` SDK.
- Selected backend default model: `gemini-3.1-flash-lite`, a Free Tier eligible Flash-Lite model suited to small text-only QuickMeds platform-support answers.
- Required backend env: `GEMINI_API_KEY`; optional backend env: `GEMINI_MODEL`. No Gemini key is exposed through frontend env, browser code, logs, or request payloads.
- Endpoint contract remains `POST /api/v1/chatbot/message` with `{ message, history?, locale? }` and `{ message, actions?, status }`.
- Supported assistant topics remain limited to verified QuickMeds platform help: pharmacy search, filters, profiles, contact/messages, account tools, Pharmacy Owner listing tools, comments, support, and FAQ.

Validation completed:

- Frontend `yarn typecheck --pretty false` passed.
- Frontend `yarn build` passed and generated all 90 current locale-expanded pages.
- Frontend `git diff --check` passed.
- Backend `npx tsc -p apps/quickmeds-api/tsconfig.app.json --noEmit` passed.
- Backend `npx tsc -p apps/quickmeds-batch/tsconfig.app.json --noEmit` passed.
- Backend `npm run build` passed.
- Backend local `ChatbotService` smoke verified missing-provider `not_configured`, exact medical refusal text, and 11th same-client request `rate_limited`.
- Backend `git diff --check` passed.

Remaining verification:

- Live browser and POST QA with a real `GEMINI_API_KEY` remain pending, including quota/rate-limit behavior from Google AI Studio.

## QuickMeds Assistant Natural Responses And Links

- Extended the assistant frontend types to accept backend-approved `links` separately from direct `actions`.
- Rendered assistant links as compact page-name controls inside assistant replies, so visible response text no longer needs raw route paths.
- Kept the existing Assistant UI shell, desktop/mobile panel layout, send behavior, status handling, and My Page human Messages isolation unchanged.
- Backend assistant responses now return natural plain text plus whitelisted page links only: Pharmacy, Messages, My Page, Become a Pharmacy Owner, Contact Support, and FAQ.
- Backend deterministic assistant replies now cover stable common intents for greetings, pharmacy search, contacting pharmacies, owner registration, support, FAQ/account guidance, unknown prompts, and malicious raw-route prompts.
- Backend Gemini prompting now asks for structured JSON and forbids visible raw routes, API paths, component names, or implementation details; model output is parsed, sanitized, and filtered against the whitelist before returning.
- The exact medical/medicine refusal remains unchanged and still skips provider execution.

Validation completed:

- Backend local `ChatbotService` smoke verified `hello`, pharmacy search, contact pharmacy, add pharmacy, contact QuickMeds, unknown prompt, exact medical refusal, and a raw-route prompt. Visible assistant messages contained no raw route paths.
- Frontend `yarn typecheck --pretty false` passed.
- Frontend `yarn build` passed and generated all 90 current locale-expanded pages.
- Backend `npx tsc -p apps/quickmeds-api/tsconfig.app.json --noEmit` passed.
- Backend `npx tsc -p apps/quickmeds-batch/tsconfig.app.json --noEmit` passed.
- Backend `npm run build` passed.
- Frontend and backend `git diff --check` passed.

Remaining verification:

- Live Gemini/browser QA remains pending until the backend runs with `GEMINI_API_KEY`; the backend docs update for this natural-link contract was blocked by the tool approval layer during this pass.
