# Frontend Migration Plan

## Current Authority

QuickMeds is a pharmacy-discovery platform. The public catalog entity is a Pharmacy, not a medicine or generic Product. Medicine catalog, inventory, prescription, and price-comparison workflows are out of scope.

The historical compatibility plan below is retained only as migration context. Its proposed Product/medicine terminology and stale Property GraphQL operations are superseded by the implemented Pharmacy contract, canonical `/pharmacies` routes, and current frontend source.

## Context

No Next.js frontend source was inspected in this backend repo. This plan maps the known Nestar backend concepts and likely frontend surfaces to quickMeds pharmacy marketplace concepts. Treat it as the starting checklist for the actual frontend repository audit.

## Step-By-Step Plan

| Step | Task | Output |
| --- | --- | --- |
| 1 | Inventory routes, page files, shared components, GraphQL documents, and UI copy in the Next.js repo. | Exact list of Nestar frontend surfaces. |
| 2 | Add a temporary terminology map so UI labels can change before backend API names change. | UI can say quickMeds/product/pharmacy while still calling current GraphQL operations. |
| 3 | Introduce GraphQL client aliases or adapter functions for property operations. | Frontend code can use product-oriented names without breaking backend compatibility. |
| 4 | Migrate listing/detail/admin pages from property terminology to product terminology. | User-facing experience reflects pharmacy marketplace. |
| 5 | Migrate agent-facing pages to pharmacy/vendor terminology. | Seller workflows match quickMeds domain. |
| 6 | Update filters, forms, validation messages, and empty states. | Real-estate fields are removed from visible UI once backend supports replacements. |
| 7 | Run frontend typecheck, lint, build, and smoke tests. | Verified frontend migration. |

## Route And Component Mapping

| Old Nestar frontend concept | quickMeds target | Notes |
| --- | --- | --- |
| Home page real-estate hero/listings | Pharmacy marketplace home/catalog entry | Replace listing language with medicine/product discovery. |
| Property listing page | Product catalog page | Filters should move from location/type/beds/rooms/square to category/brand/form/stock/prescription. |
| Property detail page | Product detail page | Replace property facts with dosage/form/package/stock/pharmacy data. |
| Agent list page | Pharmacy/vendor list page | `Agent` remains backend terminology for now; UI should use pharmacy/vendor labels. |
| Agent profile page | Pharmacy/vendor profile page | Show store/pharmacy details instead of real-estate agent profile. |
| Favorite properties | Saved products | Backend may still call `getFavorites`. |
| Visited properties | Recently viewed products | Backend may still call `getVisited`. |
| Admin property management | Admin product inventory | Product schema migration required before full replacement. |
| Property create/edit form | Product create/edit form | Backend currently requires real-estate fields, so this needs backend phase 2. |

## GraphQL Query And Mutation Rename Plan

During the compatibility phase, keep backend GraphQL operations unchanged and rename only frontend-local symbols.

| Current backend operation/type | Frontend alias now | Future backend target |
| --- | --- | --- |
| `getProperties` | `getProducts` | `getProducts` |
| `getProperty` | `getProduct` | `getProduct` |
| `createProperty` | `createProduct` | `createProduct` |
| `updateProperty` | `updateProduct` | `updateProduct` |
| `removePropertyByAdmin` | `removeProductByAdmin` | `removeProductByAdmin` |
| `getAllPropertiesByAdmin` | `getAllProductsByAdmin` | `getAllProductsByAdmin` |
| `getAgentProperties` | `getVendorProducts` | `getVendorProducts` |
| `likeTargetProperty` | `saveProduct` or `toggleSavedProduct` | `toggleSavedProduct` |
| `Property` | `Product` | `Product` |
| `PropertiesInquiry` | `ProductsInquiry` | `ProductsInquiry` |

## UI Terminology Changes

| Nestar term | quickMeds term | Migration note |
| --- | --- | --- |
| Property | Product or medicine | Use `Product` for catalog entities. |
| Properties | Products | Use in list headings and admin UI. |
| Agent | Pharmacy, vendor, or seller | Pick one after role model decision. |
| Listing | Product listing | Acceptable during transition. |
| Property type | Product category | Replace apartment/villa/house with medicine categories. |
| Property location | Pharmacy location or service area | Decide whether products or pharmacies own location. |
| Beds | Dosage, strength, or package count | Requires backend schema decision. |
| Rooms | Form, quantity, or package size | Requires backend schema decision. |
| Square | Package size or volume | Do not reuse square-foot UI. |
| Rent | Subscription, delivery option, or remove | Likely remove unless business requires subscription. |
| Barter | Promotion or negotiable flag, or remove | Pharmacy marketplace likely should remove. |
| Sold | Out of stock or discontinued | Map only after inventory lifecycle is defined. |
| constructedAt | Manufactured date or expiration date | Expiration is likely more relevant. |

## Frontend Compatibility Notes

- UI copy can be migrated before backend GraphQL names if the client uses aliases/adapters.
- Do not change backend operation names from the frontend repo without a backend compatibility phase.
- Avoid exposing real-estate field labels to users once quickMeds branding is visible.
- Keep a temporary compatibility layer small and easy to delete after backend GraphQL migration.
# Delivery And Hours Rollout

- Pharmacy Owner forms maintain delivery fees, explicit 24/7 status, and optional weekly hours.
- Homepage/catalog filters and public pharmacy surfaces consume the additive operating-hours contract.
- Delivery fees are displayed as integer UZS amounts; pickup-only pharmacies hide the fee and `0` means Free.
- Current-location distance search and verified-only filtering remain deferred.

## June 14, 2026 Incremental Visual Migration

Completed public frontend migrations:

- Homepage discovery composition, search, pharmacy sections, supporting sections, and Pharmacy Owner CTA use the Warm Civic Pharmacy direction.
- Public desktop navigation now shares one compact warm-white treatment across homepage, catalog, detail, Pharmacy Owners, community, account, My Page, CS, member, and About routes.
- Pharmacy detail now uses responsive pharmacy-specific information and states instead of the property-era presentation.
- The desktop catalog uses a dedicated pharmacy-service card and no longer exposes property-card hierarchy or public medication counts.

Intentionally deferred Nestar surfaces:

- catalog route banner and sidebar/filter shell;
- Favorites and Recently Visited shared cards;
- Pharmacy Owner and admin presentation;
- mobile navigation and mobile catalog;
- footer location/contact replacement;
- internal Property/Agent file, class, route, and type names.

## Pharmacy Detail Community Feedback Migration

- The pharmacy-detail comment surface now uses compact pharmacy-specific feedback cards instead of the centered legacy review presentation.
- Existing `GET_COMMENTS`, `CREATE_COMMENT`, authentication, comment ordering, and member-profile routes remain unchanged.
- Detail-page pagination now appends comments through Load More and deduplicates records by comment ID.
- The submission form is collapsed by default, includes logged-out guidance, and reports mutation loading state.
- The optional additive `CommentsInquiry.search.commentGroup` filter is now used to isolate pharmacy feedback from other comment groups.
- Comment creation inserts the mutation result immediately and reconciles it with a network-only first-page query without allowing stale results to erase it.
- Mobile pharmacy detail owner and contact cards now stretch to the same content width as the surrounding detail cards after the layout switches to the phone flex column.

## Pharmacy Catalog Header Migration

- The legacy shared image banner is omitted only for `/pharmacies`.
- The catalog page now owns a compact directory header containing truthful guidance, result count, and sorting.
- Existing Pharmacy Owners, community, account, My Page, CS, and member banners remain unchanged.
- Catalog sidebar/filter-shell redesign and mobile catalog remain separate future phases.

## Shared Public Hero Removal

- The legacy `LayoutBasic` image-banner mechanism has been removed from all public desktop routes.
- `/pharmacies` retains its page-owned compact directory header.
- `/agent` and `/mypage` now own compact route introductions.
- Pharmacy Owner detail, Community, CS, Login/Signup, Member, and About rely on their existing page-owned context with reduced route-level top spacing.
- Internal page redesigns, mobile pages, admin pages, and footer migration remain separate phases.

## Public Accent Palette Migration

- Migrated remaining public Nestar coral, orange, purple, red, and neon-green decorative accents to the QuickMeds emerald palette.
- Updated Community, CS, account, Pharmacy Owner, My Page, older shared cards, About surfaces, member Follow controls, and the shared brand mark accent.
- Updated the shared MUI primary and secondary colors so pagination, favorites, selected controls, and other Material components use emerald.
- Semantic validation and error colors remain red.

## Community Editorial Migration

- `/community` now uses a full-width editorial feed instead of the legacy sidebar and image-card grid.
- Existing `FREE`, `RECOMMEND`, `NEWS`, and `HUMOR` values remain unchanged and are presented as Discussions, Recommendations, News, and Community Corner.
- Public sorting uses only supported backend fields: newest, most viewed, and most liked.
- Article rows use real category, date, title, content excerpt, author, views, likes, comments, and optional article-image data.
- `/community/detail` now uses a responsive publication layout while preserving article likes, author links, rendered content, and the complete comment lifecycle.
- Article bookmarks, tags, ratings, nested replies, provider verification, and backend category changes remain intentionally unsupported.
- Community detail was refined to the approved Stitch reference with a centered bordered article panel, compact real metadata, page-scoped Toast UI spacing, a centered like action, and separate compact comment cards.
- The detail-page Write an article action was removed; article creation remains available from Community and My Page.

## Pharmacy Owner Directory Migration

- `/agent` remains the compatibility route, while all visible directory terminology now uses Pharmacy Owner.
- The directory now has a page-specific responsive presentation and no longer uses the shared legacy Agent card or mobile placeholder.
- Existing `GET_AGENTS`, `LIKE_TARGET_MEMBER`, serialized `AgentsInquiry`, pagination, and `/agent/detail?agentId=...` contracts remain unchanged.
- Owner profile navigation now uses the real member ID.
- Search and supported sorting persist through the serialized `input` query and reset pagination to page one when changed.
- Like reconciliation refetches the active inquiry so current search, sorting, and pagination state are retained.
- Missing owner images use the existing default-user asset as a compact centered fallback inside the owner-card media area; no fake roles, verification, ratings, reviews, specialties, or professional claims were added.

Deferred compatibility work:

- Keep internal Agent names and the legacy `/agent` route until a coordinated route and contract migration is approved.
- Complete authenticated browser checks for owner likes and pagination with a dataset larger than one page.
- Resolve the shared global mobile-navbar clipping in the future mobile-navigation phase.

## Pharmacy Owner Detail Migration

- `/agent/detail?agentId=...` now renders a responsive Pharmacy Owner profile instead of legacy agent-detail desktop markup and mobile placeholders.
- Existing owner, pharmacy, comment, like, and create-comment GraphQL contracts remain unchanged.
- Owner pharmacies now use page-scoped pharmacy cards with real detail links and favorite behavior instead of the legacy `PropertyBigCard`.
- Owner comments now use page-scoped comment cards with real member avatars, dates, and content instead of the legacy `ReviewCard`.
- The page includes loading, not-selected, not-found, query-error, empty-pharmacy, and empty-comment states.

## Account Access Migration

- `/account/join` now uses one responsive Warm Civic Pharmacy account-access presentation for login and registration.
- Existing `LOGIN`, `SIGN_UP`, token storage, normalized authentication errors, session updates, and backend contracts remain unchanged.
- Login remains canonical at `/account/join`; registration remains directly addressable at `/account/join?mode=signup`.
- In-page mode changes update the URL while preserving a safe internal referrer.
- Unsupported password recovery and Remember me controls were removed instead of being presented as functional.
- Registration continues to support only the existing `USER` and internal `AGENT` member types; visible `AGENT` terminology is Pharmacy Owner.
- The old city-building account image and mobile placeholder were removed from the active account flow.
- Global mobile navigation remains a separate migration and is not changed by the account page.

## Admin Member Query Alignment

- The existing frontend `GET_ALL_MEMBERS_BY_ADMIN` operation remains a GraphQL query.
- The backend resolver now exposes `getAllMembersByAdmin` under `Query`, removing the Admin Users schema-validation error without a frontend source workaround.
- Admin member updates continue through the existing mutation contract.

## Admin Workspace Migration

- The shared admin shell now uses the QuickMeds Warm Civic Pharmacy visual language with a tablet drawer, clear administrator identity, accessible navigation, and honest Support Coming soon labeling.
- `/_admin` no longer redirects to Users; it displays real overview totals from existing admin queries and links into each management module.
- `/_admin/users` now has a Warm Civic management table with real result count, status tabs, nickname search, member-type filter, explicit role/status action menus, loading/error/empty states, and visible `Pharmacy Owner` terminology for internal `AGENT` records.
- `/_admin/properties` now shares the same management-table foundation, using pharmacy-specific labels, delivery/hours data, region labels, status chips, and explicit status actions while preserving the legacy route and admin pharmacy contracts.
- `/_admin/community` now shares the same management-table foundation, using public Community category labels, article metadata, status chips, and explicit status actions while preserving existing board-article contracts.
- Support page-content redesign remains a separate incremental phase.

## One-To-One Messaging Migration

- Added frontend GraphQL operations for message threads, message history, unread count, start conversation, send message, and mark thread read.
- Added `libs/types/message` models matching the additive backend message contract.
- Added an authenticated header Messages icon with unread badge before the account avatar; guests do not see the badge.
- Added My Page `Messages` under Connections after Followers and Followings.
- Added the first responsive `MyMessages` panel with thread list, selected conversation, text composer, image attachments, unread clearing, empty/loading/error states, and `?threadId=...` support.
- Refined desktop Messages into an integrated two-pane workspace with a searchable conversation list, unread summary, active-thread state, participant/pharmacy header, optional call action, View pharmacy action, conversation history, and contained composer.
- Hid the old floating global chat while viewing `/mypage?category=messages` so one-to-one messaging is not confused with the future chatbot/global-chat surface.
- Replaced the disabled pharmacy-detail contact card with a real logged-in customer message form using text and image attachments.
- Preserved current global raw chat behavior while changing it to `addEventListener` so it no longer overrides other WebSocket consumers.
- Preserved existing Apollo setup, routes, authentication, pharmacy detail behavior, global chat, footer, and unrelated panels.
- Messages now uses a fixed-height chat workspace: the thread list owns left-column scrolling, message history owns active-conversation scrolling, and the conversation header/composer remain fixed within the chat column.
- New-message scroll behavior now respects user intent: the history auto-scrolls only when the user is near the bottom, otherwise a `New messages` control appears and scrolls to the latest message on demand.
- The fixed chat layout uses viewport-height and safe-area-aware mobile styles while preserving existing message APIs, uploads, socket refreshes, unread marking, and pharmacy links.
- Mobile Messages now follows a Telegram-style navigation structure below 767px: the list view is the initial screen, selecting a conversation opens a full-width chat overlay sliding in from the right, and the My Page sidebar is hidden for this mobile Messages flow only.
- The mobile chat overlay keeps the QuickMeds visual system, fixed header, scroll-owned message history, safe-area-aware composer, compact back/call/View pharmacy actions, and route-backed `threadId` state so browser back can return to the list.
- The mobile list view now exposes the shared rounded My Page menu trigger in the Messages title row, opening the same portaled section sheet used by the main My Page mobile menu.
- The active chat pharmacy detail affordance now lives on the clickable header identity area instead of a separate right-side View pharmacy button.
- Desktop composer controls now sit after the textarea, and desktop Enter submits while Shift+Enter continues to add a new line; mobile keeps normal multiline keyboard behavior.

## Homepage Interactive Trending Migration

- The desktop homepage no longer renders the Featured pharmacies section; Trending pharmacies now follows the hero/search area on desktop.
- Featured pharmacies remains available on the mobile homepage through a mobile-only section render that preserves the existing pharmacy query, cards, favorite behavior, and loading/error/empty states.
- The currently rendered homepage `Popular choices` section has been replaced by `Trending pharmacies`.
- Trending uses the existing `getPharmacies` query with `pharmacyLikes DESC` and no backend contract changes.
- The section uses Framer Motion layout transitions: the selected pharmacy appears as the large feature card, and compact cards swap into that featured position when selected.
- Existing favorite mutation/refetch behavior, detail-route navigation, homepage hero, Featured pharmacies section, supporting sections, and Apollo setup remain unchanged.
- The design uses QuickMeds Warm Civic pharmacy styling and avoids unsupported product, prescription, inventory, rating, or price-comparison claims.
- Trending copy uses like terminology, and the Framer Motion implementation keeps card containers at stable sizes while animating the selected feature-card change.
- The latest interaction uses shared card/media `layoutId`s for the compact-to-feature pharmacy transition, content-only `AnimatePresence` for detail reveals, reduced-motion opacity fallback, and real `View pharmacy` links on all cards.
- Compact cards now render as a direct Framer layout list, avoiding exit placeholders that left empty grid slots, and the previous featured signal-box detail row was removed.

## Homepage Pharmacy Owner CTA Migration

- The homepage `For Pharmacy Owners` strip now uses an image-led spotlight layout with a generated pharmacy interior asset.
- CTA copy invites pharmacy owners to join QuickMeds, boost local discovery, and maintain a trusted searchable pharmacy profile.
- Existing `/agent` directory behavior is unchanged; the new primary owner signup CTA links to `/account/join?mode=signup`.
- The section avoids unsupported product, medicine inventory, prescription, rating, price-comparison, and guaranteed-sales claims.
- The CTA now includes restrained Framer Motion entrance, hover, and tap interactions, and the image overlay keeps only the pharmacy-focused headline and supporting copy.

## Homepage Supporting Motion And My Page Footer Migration

- The homepage `Why QuickMeds` and `Explore supported areas` sections now use restrained Framer Motion entrance and hover interactions with reduced-motion fallbacks.
- Supported-area links keep their existing `/pharmacies?input=...` filter behavior and accessible link semantics.
- `LayoutBasic` now omits the shared footer only on `/mypage`, preserving it on the rest of the public/basic layout routes.

## Homepage Owner CTA Visibility Fix

- The homepage owner-acquisition primary CTA now explicitly applies its white text color at the button-link specificity level so `Become a Pharmacy Owner` remains visible on the emerald background.
- No route, GraphQL, copy, or layout behavior changed.

## Mobile Homepage Refinement

- The homepage mobile branch now uses the same vertical pharmacy-card presentation for `Featured pharmacies` and `Trending pharmacies`; the desktop trending shared-layout interaction remains unchanged.
- Mobile homepage sections use restrained Framer Motion reveal/tap motion with reduced-motion fallbacks.
- The mobile homepage footer later moved back onto the shared public footer component so public pages use one consistent footer system across desktop and mobile.
- `Community health reading` is visible again on the mobile homepage as compact article cards using the existing Community article query and real detail links.

## Shared Public Footer Migration

- Public layouts now use a single shared `Footer` component for desktop and mobile instead of branching into separate footer markup.
- `LayoutHome` no longer renders a homepage-only mobile footer; the homepage uses the same shared footer as other public pages.
- The shared footer uses pharmacy-specific QuickMeds copy, structured Discover/Quick links/Regions navigation, normalized customer-care formatting, and a professional dark emerald visual treatment.
- Footer styles are centralized around the shared `.footer-container` structure in the main desktop/mobile stylesheets, with responsive columns and safe-area-aware mobile padding.
- `/mypage` remains excluded from the shared footer because it is an account workspace, not a public marketing/content route.

## Mobile Pharmacy Directory Migration

- The `/pharmacies` mobile placeholder has been replaced with a mobile directory using the existing pharmacy query, favorite mutation, serialized inquiry routing, and real detail links.
- The mobile directory uses a page-scoped `quickmeds-catalog` shell with compact top bar, search, filter chips, stacked pharmacy cards, filter bottom sheet, bottom tabs, and logged-in messaging entry points.
- The mobile catalog initial render is forced into the mobile shell on `/pharmacies` so phone-width users do not see the desktop sidebar/filter layout while hydration catches up.
- Desktop `/pharmacies` remains on the existing catalog layout after client device detection confirms desktop.

## Navigation And Pharmacy Owner Placement Migration

- Removed the public `Pharmacy Owners` navigation entry from the desktop navbar and generic mobile public nav.
- Added a `/pharmacies` mobile header menu sheet for primary navigation across Home, Pharmacies, Community, CS, and My Page/Login while preserving logged-in messages, notifications, avatar, and logout actions.
- Public mobile navigation and the My Page mobile section sheet now close reliably from outside-sheet taps through full-screen overlay handling.
- Removed the homepage mobile Owners bottom-tab/footer shortcuts; bottom tabs now stay focused on Explore, Search, Messages, and Profile.
- Moved owner-oriented account actions into the final My Page navigation group, `For Pharmacy Owners`.
- Normal users now see `Become a Pharmacy Owner` and `Explore Pharmacy Owners` from My Page; pharmacy-owner accounts see `My Pharmacies`, `Add Pharmacy`, and `Explore Pharmacy Owners`.
- `/agent` remains a valid route but is no longer promoted through public top navigation.

## Community Mobile Error And Layout Migration

- `/community` and `/community/detail` now opt into the shared mobile public top-navbar shell so phone-width users do not receive the desktop navbar during the initial route render.
- Community category routing still uses the existing `articleCategory` query values, but invalid or missing values now normalize to `FREE` without changing the GraphQL contract.
- Community article list errors now surface a clear retryable API/backend-unreachable message while preserving the existing `GET_BOARD_ARTICLES` query.
- Community list and detail presentation now tolerate incomplete article/member/date data instead of crashing on missing labels, invalid dates, or absent member IDs.
- Mobile Community layout keeps the editorial desktop direction but uses tighter phone typography, scrollable tabs, full-width sorting, compact rows, and mobile-aligned empty/error states.
- Device detection now starts from the same desktop-safe value on server and first client render, then updates after mount; this avoids React hydration mismatches while preserving mobile-specific layouts after hydration.
- Desktop Community/homepage article layouts now include desktop-only shrink and wrapping safeguards to prevent article cards, metrics, or read links from creating right-side page overflow.

## My Page Mobile Menu Migration

- Mobile `/mypage` now uses a left-side modal section menu instead of the previous native select control.
- The menu keeps the existing query-driven `category` contract and still defaults to `myProfile` when the query is missing, invalid, or uses an older alias.
- Existing My Page sections, owner-only items, non-owner owner-signup item, admin shortcut, logout flow, and desktop sidebar remain unchanged.
- The mobile sheet closes on backdrop, close button, or route change and locks background scrolling while open.
- The mobile sheet now visually follows the desktop sidebar with grouped labels, icons, emerald active row styling, a left-slide motion transition, and Escape-key close.
- Mobile My Profile now reuses the real desktop profile-edit form instead of a placeholder, preserving the existing member update and image upload contracts while using mobile-sized My Page card, field, and button styling.
- The mobile My Page section trigger now sits in the user identity row as a compact active-section pill, removing the separate full-width selector row while keeping the same modal navigation behavior.
- Mobile Followers, Followings, My Articles, and Write Article now reuse their real desktop data/action contracts instead of mobile placeholders, with phone-specific My Page card, list, pagination, and editor styling.
- My Page drawer links that navigate outside the section flow now show an arrow affordance; category links keep the active checkmark behavior.
- My Page Followings now treats the signed-in user's own followings list as authoritative, so those rows expose Unfollow instead of attempting a duplicate Follow mutation.
- Followers and other member-profile follow controls still use the backend `meFollowed` relationship state, hardened with order-independent checks.
- The shared mobile My Page menu sheet/backdrop styles now also target the portaled `document.body` rendering path, so the same menu remains styled when opened from My Profile, Messages, or any future mobile My Page section trigger.
- Mobile Messages entry now waits for resolved device state before desktop-only first-thread selection, preserving the list-first Messages view when users switch into Messages from another mobile My Page section.
- Mobile Followers and Followings now use CSS-only card-based member rows with compact avatars, stat chips, and mobile-safe pagination while the desktop Followers/Followings component markup remains restored to the previous working structure.
- Desktop Followers and Followings now have a dedicated `min-width: 768px` SCSS layer for the restored member-follow markup, keeping the desktop table/card row presentation separate from the mobile `max-width: 767px` card presentation.
- My Page owner pharmacy management now uses `MyPharmacies` and `MyPharmacyCard` component names while preserving the existing desktop layout classes; the mobile My Pharmacies placeholder has been replaced with real owner pharmacy cards, status filters, pagination, and owner actions using the existing pharmacy contracts.
- Mobile Add Pharmacy now reuses the existing create/update/upload/edit contracts in a grouped phone layout with safe-area sticky save controls, while the current desktop Add Pharmacy form and stylesheet remain unchanged.
- Mobile My Page typography has been normalized across section headers, Followers/Followings cards, and Add Pharmacy grouped cards so account sections use the same compact text scale without changing desktop layouts or data contracts.

## Uzbek Locale Migration

- Added `uz` to the `next-i18next` locale list and shared language selector.
- Added the Uzbek common translation namespace and Uzbek flag asset while preserving the existing English, Korean, and Russian locale contracts.
- Stored locale values are normalized against the supported language list before routing, preventing stale values from creating missing flag paths.

## Mobile CS Page Migration

- Mobile `/cs` now reuses the same Notice and FAQ route structure as desktop instead of returning placeholder mobile text.
- The mobile CS presentation is isolated in `scss/mobile/main.scss` under `#mobile-wrap .cs-page`, preserving the existing desktop support-center stylesheet.
- Notice content becomes stacked mobile cards, while FAQ categories become horizontal chips and accordion answers wrap safely on phone widths.
- No backend, GraphQL, route, or admin support-management contracts changed.

## CS FAQ Content Migration

- Public `/cs` now defaults to FAQ content instead of showing notice/news content first.
- The public Notice tab remains available but shows a truthful empty state when there are no platform notices.
- FAQ content now focuses on real QuickMeds user questions about pharmacy search, open status, delivery, insurance, messaging, account actions, comments, and Pharmacy Owner listing management.
- Admin CS management and backend support contracts remain unchanged.

## Desktop Typography Normalization

- Desktop public navbar route/auth labels were increased to 14px so navigation reads more clearly and aligns with the My Page sidebar label scale.
- Desktop My Page section headers, legacy section titles, and Followers/Followings stat rows were tightened further to reduce oversized typography and better match the account workspace scale.
- My Page Followers/Followings stat counts now render as plain numeric values without parentheses, matching the cleaner desktop account-table presentation.
- Mobile My Page typography and navigation behavior remain unchanged.

## Messages Sent-Message Reconciliation

- My Page Messages now merges successful `SEND_MESSAGE` mutation results into the active chat history immediately, then removes the local pending copy once `GET_MESSAGES` returns the same message id.
- This keeps the left thread preview and active conversation in sync without changing message GraphQL contracts, uploads, socket events, unread marking, or responsive chat layout.
- Receiver-side real-time delivery now uses complete raw WebSocket `message:new` payloads to update the active chat and conversation list immediately, with `GET_MESSAGES` and `GET_MY_MESSAGE_THREADS` kept as reconciliation sources.

## QuickMeds Assistant Frontend Integration

- The reserved floating global chat has been converted into the QuickMeds Assistant surface; human pharmacy Messages remain isolated under `/mypage?category=messages`.
- Detected integration shape: Next.js Pages Router, Yarn frontend, SCSS design system, no Tailwind/shadcn `components.json`, and NestJS backend.
- Assistant UI is integrated manually through `@assistant-ui/react@0.8.20` and `useExternalStoreRuntime`; `assistant-ui init`, Assistant Cloud, and generated App Router `/api/chat` routes are not used.
- The assistant sends non-streaming requests to the backend REST endpoint at `${REACT_APP_API_URL}/api/v1/chatbot/message`, preserving backend-owned Gemini provider credentials.
- The frontend now handles `unavailable` and `rate_limited` assistant statuses from the Gemini-backed endpoint with FAQ/pharmacy route actions.
- Desktop uses a fixed right-bottom support panel; mobile uses a full-screen assistant overlay with a back control and safe-area-aware composer.
- Assistant CSS is shell-scoped: desktop rules live under `#pc-wrap`, mobile rules under `#mobile-wrap`, preventing mobile import order from overriding desktop placement.
- The open assistant no longer keeps the floating launcher visible, preventing the bottom-right close button from overlapping the composer send control; the desktop panel was also tightened to a smaller right-bottom size while mobile remains full-screen.
- Assistant responses now treat backend-approved `links` as page-name navigation controls separate from direct `actions`.
- Visible assistant copy should remain natural and should not expose raw route paths, API paths, component names, or implementation details.
- Approved assistant link labels/routes are Pharmacy, Messages, My Page, Become a Pharmacy Owner, Contact Support, and FAQ; the frontend renders only the label and navigates to the backend-approved href.

## Pharmacy Owner Location Picker Migration

- Owner Add/Edit Pharmacy now replaces manual latitude/longitude entry with a reusable `PharmacyLocationPicker`.
- The picker uses OSM/Leaflet for map pin selection and Nominatim for address search/reverse geocoding while preserving the current GraphQL scalar coordinate payload.
- Coordinates remain hidden in form state and are submitted only after the owner confirms a valid nonzero map pin.
- Edit mode hydrates the existing address, region, latitude, and longitude into the picker and marks the location confirmed until the pin changes.
- Structured city/district/street/landmark persistence, GeoJSON, radius search, and distance sorting remain deferred backend-contract work.

## Pharmacy Map And My Page Language Migration

- Public pharmacy detail now renders saved coordinates with the shared Leaflet/OpenStreetMap map instead of a Google Maps iframe.
- The owner location picker now reuses the same shared map component for editable map-click and marker-drag behavior.
- Map visibility on pharmacy detail uses the shared coordinate helper, preserving the nonzero valid-coordinate rule.
- Header language state now resolves from `router.locale` before local storage so the default route remains English and route language changes are reflected in UI state.
- My Page shell/menu, My Pharmacies management, Add Pharmacy location/save copy, the location picker, and pharmacy detail location labels now use `next-i18next` keys.
- Korean touched pharmacy labels were corrected from property/agent wording to pharmacy/owner wording; Uzbek includes localized new keys and Russian touched pharmacy labels were corrected, while some new Russian/Korean nested owner-copy keys intentionally fall back to English text until a full translation pass.

## Telegram Login Frontend Migration

- Added a Telegram login action to `/account/join` without changing the existing nickname/password login, registration, GraphQL `LOGIN`, or GraphQL `SIGN_UP` flows.
- The Telegram action redirects to `${REACT_APP_API_URL}/auth/telegram/start` with a safe relative `returnTo` value.
- Added `/auth/telegram/complete` to exchange the backend-issued one-time ticket for the existing QuickMeds access token, then reuse `updateStorage` and `updateUserInfo`.
- The completion route shows a compact retryable error state when the ticket is missing, expired, reused, or rejected.
- The frontend does not receive Telegram client secrets, Telegram ID tokens, or QuickMeds JWTs through URL query strings.

## Account Login Redirect Stabilization

- Successful account login still uses the existing GraphQL `LOGIN` mutation, localStorage access token, and Apollo reactive user hydration.
- The safe return-path helper now rejects `/account/join`, `/auth`, `/api`, and `/_next` paths before redirecting, preventing self-return and internal development asset URLs from becoming post-login destinations.
- Telegram completion uses the same return-path policy so the new social-login bridge and the existing nickname/password login stay aligned.
