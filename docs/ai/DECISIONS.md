# Architectural Decisions

## Decisions

| Decision | Why | Risks | Alternatives |
| --- | --- | --- | --- |
| Complete a breaking `Property` to `Pharmacy` backend rename. | The requested backend target is a pharmacy marketplace and old property APIs no longer match the domain. | Existing clients using `Property*` GraphQL operations will break until updated. | Keep compatibility aliases temporarily, rejected for this phase. |
| Keep `MemberType.USER`, `MemberType.AGENT`, and `MemberType.ADMIN`. | The user explicitly requested member types remain unchanged. | `AGENT` now semantically means pharmacy owner, which can be confusing. | Add `PHARMACY_OWNER`, rejected for this phase. |
| Rename `memberProperties` to `memberPharmacies`. | Owner counters and ranking should match the pharmacy domain. | Existing member documents need backfill if old counts must be preserved. | Expose both fields temporarily, rejected for this phase. |
| Use `pharmacies` as the canonical collection. | The backend model and collection should match the ER model and GraphQL domain. | Existing `properties` collection data is not read by the new API. | Keep old collection name internally, rejected for this phase. |
| Replace shared `PROPERTY` social groups with `PHARMACY`. | Likes, views, comments, and notifications now target pharmacies. | Existing social documents with `PROPERTY` group need migration if retained. | Support both groups, rejected for this phase. |
| Keep board article/member shared modules reusable. | The migration is scoped to property-to-pharmacy behavior. | Article naming remains separate from the ER model's health article wording. | Rename board articles now, deferred. |

## Remaining Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| No MongoDB backfill has been implemented. | Old `properties`, `PROPERTY` social rows, and `memberProperties` counts will not appear in the new API. | Plan and run a data migration before production rollout. |
| Frontend GraphQL operations are now stale. | The Next.js app must update to `Pharmacy*` types and operations. | Inventory frontend GraphQL documents and regenerate types. |
| `MemberType.AGENT` is domain-ambiguous. | Future maintainers may mistake pharmacy owners for real estate agents. | Document the semantic meaning until a later role migration is approved. |
| Lint uses `--fix`. | Running lint may rewrite unrelated files. | Prefer TypeScript/build checks unless rewriting is acceptable. |
# Delivery Fees And Hours

- Display pharmacy delivery fees only in UZS; 0 means Free and pickup-only pharmacies hide the fee.
- Public Open now and 24/7 controls use backend-computed truth. Missing schedules display Hours not provided.

# Demo Pharmacy Data

- Demo pharmacies are real MongoDB records created through normal backend logic, never hardcoded frontend data.
- Real-source facts and demo-only delivery, insurance, fee, or unpublished-hours values are distinguished in each pharmacy description.
- Demo records remain unverified and must be replaced or confirmed before production.

# June 14, 2026 Frontend Decisions

- Use one compact warm-white navbar treatment across public desktop routes. Keep mobile and admin navigation separate until their approved redesign phases.
- Keep existing public route banners temporarily, but place them below the fixed navbar.
- Replace visible Nestar presentation incrementally. The catalog card is migrated independently from the catalog banner, sidebar, Favorites, Recently Visited, owner, and admin surfaces.
- Public catalog cards show only real pharmacy discovery data: operating status, verified status when present, address, type, delivery, insurance, favorite action, and detail navigation.
- Medication count remains outside approved public product scope and must not be displayed on redesigned public cards/details.
- Legacy internal Property/Agent names remain compatibility debt and are not renamed as part of visual micro-phases.
- Local development must run only one `next dev` process per `.next` directory to prevent stale or missing chunk responses.

## Pharmacy Detail Feedback Decisions

- Pharmacy comments are presented as truthful community feedback, not ratings or reviews.
- Display the actual comment creation date with `Commented`; do not fabricate unsupported last-visited dates.
- Preserve comment creation and member-profile navigation while keeping the default feedback section compact through a collapsed `Write a comment` form.
- Use incremental Load More pagination on the detail page instead of numbered comment pages.
- Record every meaningful implementation and validation result in the existing `docs/ai` tracking files before completing a development task.
- Treat the successful `CREATE_COMMENT` mutation response as immediately visible truth; later list reconciliation must never remove it.
- Use the optional `CommentsInquiry.search.commentGroup` filter for pharmacy-detail feedback while preserving compatibility for existing comment callers.

## Pharmacy Catalog Header Decisions

- The pharmacy catalog prioritizes discovery controls and results over decorative hero imagery.
- `/pharmacies` owns its compact directory header and live result count; shared `LayoutBasic` banners remain for other routes.
- Do not duplicate catalog search controls in the header because the existing sidebar remains the functional search and filter surface.
# Public Page Header Decision

- Public `LayoutBasic` routes no longer use shared photographic heroes or generic route welcome copy.
- Pages should own their context through an existing content heading, profile identity, or form identity.
- Add a compact route introduction only when removing the shared hero would leave the page without a clear title; currently this applies to Pharmacy Owners and My Page.
- Mobile remains independent and must not inherit desktop-only route header changes.

# Public Accent Palette Decision

- QuickMeds public interfaces use deep emerald `#08634f` as the primary interactive accent and dark emerald `#064e3b` for stronger emphasis.
- Legacy Nestar coral, red, orange, purple, and unrelated neon-green decorative accents must not be used for public navigation, tabs, buttons, favorites, cards, or active states.
- Red remains reserved for truthful errors, destructive warnings, and validation states.
- The shared MUI primary and secondary palettes use QuickMeds emerald values so Material controls do not reintroduce the legacy red/blue palette.

# Admin Member Query Decision

- Keep `GET_ALL_MEMBERS_BY_ADMIN` as a GraphQL query. The backend resolver now correctly exposes the read operation under `Query`.
- Do not add a frontend mutation workaround for member-list reads. `updateMemberByAdmin` remains the mutation used for admin member changes.

# Admin Workspace Redesign Decisions

- The admin panel is a light-theme desktop and tablet operations workspace using the Warm Civic Pharmacy palette.
- `/_admin` is a real overview using existing member, pharmacy, pending-pharmacy, and Community article meta counters.
- Support remains visible but is marked Coming soon until real backend contracts replace the current prototype screens.
- Phone-sized admin access presents a desktop-required message while preserving administrator logout.

# One-To-One Messaging Decisions

- Pharmacy messaging is pharmacy-context customer-to-Pharmacy-Owner messaging, not generic member-to-member chat.
- The existing raw WebSocket connection is reused for message update events; the current global chat component remains available for future chatbot/global-chat work.
- GraphQL remains the source of truth for thread creation, message persistence, unread counts, read state, and image paths.
- Message image uploads use the existing GraphQL upload flow with `target: messages`; the backend stores paths under `uploads/messages`.
- Header messaging appears only for authenticated users and links to `/mypage?category=messages`.
- My Page owns the first inbox UI; `?threadId=...` opens a specific conversation.
- Pharmacy detail now offers real messaging for logged-in non-owner users, login guidance for guests, and a non-sendable owner notice for owners viewing their own pharmacy.
- Delete, archive, blocking, typing indicators, moderation, chatbot integration, and non-image attachments remain deferred.

# Homepage Trending Decision

- The active homepage `Popular choices` surface now represents `Trending pharmacies` and sorts by `pharmacyLikes DESC`.
- Trending cards may show community-like counts as a discovery signal, but must not introduce unsupported ratings, medicine inventory, prescriptions, or product pricing.
- The large-left/compact-right interaction is a frontend presentation change only; it does not require backend contract changes.

# Community Mobile Navigation And Resilience Decision

- Community list and detail routes use the shared mobile top-navbar shell on initial render, matching the public mobile navigation direction and avoiding desktop-navbar flashes on phone routes.
- Community route category compatibility remains `FREE`, `RECOMMEND`, `NEWS`, and `HUMOR`; invalid or missing category query values resolve back to `FREE`.
- Community UI should present backend/network failures as retryable API availability issues instead of hiding them behind generic copy.
- Community list and detail surfaces must tolerate missing article/member/date data because older or migrated board records may be incomplete.
- Responsive route shells must render the same tree on the server and first client pass; device-specific mobile shells activate after hydration to avoid React hydration failures.

# My Page Mobile Menu Decision

- Mobile My Page section navigation uses a left-side modal sheet, not a native select.
- `myProfile` remains the default My Page section for missing, invalid, or legacy category queries.
- The mobile sheet reuses the same route categories and visibility rules as the desktop sidebar so mobile and desktop stay contract-compatible.
- Mobile My Page drawer styling follows the desktop sidebar palette and active-row language, while using a left-slide modal interaction on phone widths.
- Mobile My Profile must render the same editable account form as desktop; phone styling adapts spacing and controls, but does not create a separate mobile-only contract or placeholder surface.
- Profile updates are change-based on the frontend: the button enables when any editable profile field differs from current account data, and optional empty fields such as address or profile image must not block submission.
- On mobile, the My Page section trigger belongs in the account identity row so section navigation stays close to the user context without adding a second header row.
- Mobile My Page sections should reuse the same working desktop data and action contracts, then adapt layout with responsive CSS instead of adding placeholder-only mobile branches.
- My Page menu arrows are reserved for links that navigate away from `/mypage?category=...`; in-section category links continue to use active-row and checkmark language.
- A member listed under the signed-in user's own Followings is already followed, even if the optional `meFollowed` aggregation is missing or stale; render Unfollow there to avoid duplicate subscribe mutations.
- Follower lists remain relationship-based because a follower is not necessarily followed back by the signed-in user.

# Pharmacy Owner Detail Decision

- `/agent/detail?agentId=...` remains the compatibility route for Pharmacy Owner detail until a coordinated route migration is approved.
- Pharmacy Owner detail uses the same public owner-directory emerald/mint visual system and avoids legacy property-era cards on this route.
- Owner-detail comments are member-profile comments using the existing `CommentGroup.MEMBER` contract; no ratings, scores, credentials, specialties, or unsupported professional claims are added.
