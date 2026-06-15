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
- Missing owner images use the existing default-user asset; no fake roles, verification, ratings, reviews, specialties, or professional claims were added.

Deferred compatibility work:

- Redesign `/agent/detail` separately while preserving its existing GraphQL behavior.
- Keep internal Agent names and the legacy `/agent` route until a coordinated route and contract migration is approved.
- Complete authenticated browser checks for owner likes and pagination with a dataset larger than one page.
- Resolve the shared global mobile-navbar clipping in the future mobile-navigation phase.

## Account Access Migration

- `/account/join` now uses one responsive Warm Civic Pharmacy account-access presentation for login and registration.
- Existing `LOGIN`, `SIGN_UP`, token storage, normalized authentication errors, session updates, and backend contracts remain unchanged.
- Login remains canonical at `/account/join`; registration remains directly addressable at `/account/join?mode=signup`.
- In-page mode changes update the URL while preserving a safe internal referrer.
- Unsupported password recovery and Remember me controls were removed instead of being presented as functional.
- Registration continues to support only the existing `USER` and internal `AGENT` member types; visible `AGENT` terminology is Pharmacy Owner.
- The old city-building account image and mobile placeholder were removed from the active account flow.
- Global mobile navigation remains a separate migration and is not changed by the account page.
