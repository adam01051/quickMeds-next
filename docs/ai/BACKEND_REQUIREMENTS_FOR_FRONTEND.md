# Backend Requirements For The QuickMeds Frontend

## Purpose

This document records the backend work required to support the redesigned QuickMeds pharmacy-discovery frontend.

The backend must remain pharmacy-focused. Do not add medicine catalog, medicine inventory, prescription, or medicine price-comparison behavior.

## Current Backend Support

The current `getPharmacies(input: PharmaciesInquiry)` contract already supports the following frontend behavior:

| Frontend capability | Backend support | Notes |
| --- | --- | --- |
| Search by pharmacy name or address | Supported | `search.text` matches `pharmacyName`, `pharmacyAddress`, and `pharmacyDesc`. |
| Search by Uzbekistan region | Supported | `search.locationList` performs exact matching against `pharmacyLocation`. |
| Filter by pharmacy type | Supported | `search.typeList` performs exact matching against `pharmacyType`. |
| Filter by delivery support | Supported | `search.hasDelivery`. |
| Filter by insurance support | Supported | `search.acceptsInsurance`. |
| Filter by delivery-fee range | Supported | `search.deliveryFeeRange`. |
| Display verified status | Supported | A pharmacy is verified when `verifiedAt` is present. |
| Favorites and recently visited | Supported | Existing like and view services provide these lists. |

`All regions` must continue to omit `locationList`. No new backend value is required for it.

## Capability Status And Remaining Backend Additions

### P0: Uzbekistan Region Data Quality

The public region filter uses these exact `PharmacyLocation` values:

- `TASHKENT_CITY`
- `TASHKENT_REGION`
- `ANDIJAN`
- `BUKHARA`
- `FERGANA`
- `JIZZAKH`
- `KARAKALPAKSTAN`
- `KASHKADARYA`
- `KHOREZM`
- `NAMANGAN`
- `NAVOI`
- `SAMARKAND`
- `SIRDARYA`
- `SURKHANDARYA`

Requirements:

- Keep exact-match filtering through `PharmaciesInquiry.search.locationList`.
- Validate that every pharmacy has one valid region.
- Use `TASHKENT_CITY` only as the migration/default value, not as a permanent substitute for unknown regions.
- Allow Pharmacy Owners and admins to correct migrated region values.
- Preserve `pharmacyAddress` for human-readable district, street, landmark, and building information.

### P0: Verified Pharmacy Filtering

Verified status is currently displayable through `verifiedAt`, but public search cannot filter it.

Add to `PharmacyInquirySearch`:

```graphql
verifiedOnly: Boolean
```

Behavior:

- When `verifiedOnly: true`, match pharmacies where `verifiedAt` exists and is not null.
- When omitted or false, do not restrict results.
- Only admins may set or clear `verifiedAt`.
- Pharmacy Owners must not be able to self-verify.

### Implemented: Operating Hours, Open Now, And 24/7

`openedAt` is the pharmacy establishment/opening date. It must not be used to calculate whether a pharmacy is currently open.

Add a weekly operating-hours model:

```graphql
type PharmacyOperatingDay {
  dayOfWeek: Int!
  isClosed: Boolean!
  opensAt: String
  closesAt: String
}
```

Store:

- `pharmacyTimezone`, defaulting to `Asia/Tashkent`.
- `operatingHours`, containing one entry for each weekday.
- Optional holiday or exceptional closures in a later phase.

Add to `PharmacyInquirySearch`:

```graphql
openNow: Boolean
open24Hours: Boolean
```

Behavior:

- `openNow: true` returns pharmacies open at the server-evaluated current time in `pharmacyTimezone`.
- `open24Hours: true` returns pharmacies explicitly configured as continuously open every day.
- Overnight ranges such as `20:00` to `08:00` must be supported.
- Missing or incomplete operating hours must never be treated as open.
- Return a computed `isOpenNow` value and the next relevant opening/closing time for cards and detail pages.

### P1: Current Location And Distance Search

Coordinates already exist as separate latitude and longitude numbers, but the backend cannot perform efficient radius queries or return distances.

Add a GeoJSON field:

```graphql
type PharmacyGeoPoint {
  type: String!
  coordinates: [Float!]!
}
```

Database requirements:

- Store `pharmacyGeoLocation` as `{ type: "Point", coordinates: [longitude, latitude] }`.
- Add a MongoDB `2dsphere` index.
- Backfill `pharmacyGeoLocation` from existing valid latitude and longitude values.
- Reject invalid coordinates and do not treat `0,0` as a usable pharmacy location.

Add to `PharmacyInquirySearch`:

```graphql
near: PharmacyNearInput

input PharmacyNearInput {
  latitude: Float!
  longitude: Float!
  radiusKm: Float
}
```

Behavior:

- Default `radiusKm` to a documented safe value such as 10 km.
- Enforce a maximum radius to protect query performance.
- Return `distanceKm` when `near` is supplied.
- Allow distance sorting only when `near` is supplied.
- Current-location permission and coordinate acquisition remain frontend responsibilities.

### P1: District And Structured Address Search

Region-only filtering is too broad for pharmacy discovery inside large regions.

Add structured address fields without removing `pharmacyAddress`:

```graphql
pharmacyDistrict: String
pharmacyCity: String
pharmacyPostalCode: String
```

Requirements:

- Search text must continue matching `pharmacyName` and `pharmacyAddress`.
- Extend text search to city and district.
- Normalize values for search while preserving user-facing spelling.
- Do not create a district enum until an authoritative Uzbekistan district dataset is approved.

### P2: Search Quality And Sorting

Improve search without changing the existing `getPharmacies` operation:

- Escape or safely construct user text queries instead of directly creating an unrestricted regular expression.
- Normalize whitespace and case.
- Add indexes based on measured query patterns for region, type, verification, delivery, insurance, and status.
- Add only approved public sort keys.
- Keep ranking, views, and creation-date sorting.
- Add distance sorting only with `near`.
- Consider relevance sorting only after search behavior is measured.

## Proposed Pharmacy Search Contract

The public inquiry should evolve without renaming the existing operation or fields:

```graphql
input PharmacyInquirySearch {
  memberId: String
  locationList: [PharmacyLocation!]
  typeList: [PharmacyType!]
  acceptsInsurance: Boolean
  hasDelivery: Boolean
  deliveryFeeRange: DeliveryFeeRange
  periodsRange: PeriodsRange
  text: String
  verifiedOnly: Boolean
  openNow: Boolean
  open24Hours: Boolean
  near: PharmacyNearInput
}
```

The `Pharmacy` response should add:

```graphql
isOpenNow: Boolean
nextOpeningAt: DateTime
nextClosingAt: DateTime
distanceKm: Float
operatingHours: [PharmacyOperatingDay!]
pharmacyDistrict: String
pharmacyCity: String
pharmacyPostalCode: String
```

Computed fields such as `isOpenNow`, `nextOpeningAt`, `nextClosingAt`, and `distanceKm` must not be stored as permanent truth.

## Owner And Admin Requirements

Pharmacy Owner create/edit:

- Require a valid Uzbekistan region.
- Require a usable map coordinate before enabling distance search.
- Allow maintaining structured address and operating hours.
- Allow selecting delivery and insurance support.
- Do not expose `verifiedAt`.

Admin:

- Allow correcting region and structured address values.
- Allow verifying and un-verifying pharmacies.
- Display missing coordinates or operating hours as data-quality issues.
- Keep verification audit history in a later phase if required for production compliance.

## Data Migration Order

1. Back up the `pharmacies` collection.
2. Verify all legacy region values are removed and all records use valid Uzbekistan regions.
3. Add nullable structured-address, operating-hours, timezone, and GeoJSON fields.
4. Dry-run coordinate backfill and report invalid or `0,0` records.
5. Backfill valid GeoJSON points.
6. Add indexes after validating backfilled data.
7. Release backend fields and filters while the frontend controls remain disabled.
8. Test production-like queries and performance.
9. Enable frontend Open now, 24/7, current-location, and verified filters one capability at a time.

## Validation And Tests

Backend tests must cover:

- Region filtering for every supported Uzbekistan region.
- Empty `locationList` and omitted `locationList` returning all regions.
- Combined region, type, delivery, insurance, delivery-fee, verified, and text filters.
- Admin-only verification updates.
- Open-now calculations for normal, closed, overnight, 24/7, missing-hours, and timezone cases.
- Radius filtering, distance sorting, maximum-radius validation, and invalid coordinates.
- Structured city/district text search.
- Pagination and meta counters with all new filters.
- Existing favorites, visited, owner, and admin queries remaining functional.

Required validation commands:

- Focused pharmacy service tests.
- API and batch TypeScript checks.
- `npm run build`.
- `git diff --check`.

## Deferred Backend Work

## Implemented Delivery Fee And Operating Hours Contract

Implemented in June 2026:

- Delivery fees are persisted integer UZS values, not hardcoded UI values.
- New delivery-enabled pharmacies default to `3000 UZS`; owners may edit the fee or use `0` for free delivery.
- Disabling delivery normalizes the fee to `0`.
- The backend exposes `open24Hours`, `pharmacyTimezone`, `operatingHours`, `hoursConfigured`, `isOpenNow`, `nextOpeningAt`, and `nextClosingAt`.
- Public inquiries accept `openNow` and `open24Hours`.
- Weekly hours use Monday `1` through Sunday `7`, one interval per day, with overnight intervals supported.
- Missing hours display as `Hours not provided` and never imply Open now.
- `openedAt` remains the establishment date.

Run the idempotent backend migration with:

```bash
npm run migrate:pharmacy-hours -- --dry-run
npm run migrate:pharmacy-hours
```

The frontend now formats fees as `3 000 UZS` or `Free`, hides fees for pickup-only pharmacies, enables Open now/24/7 discovery filters, allows Pharmacy Owners to maintain schedules, shows public operating status and detail hours, and flags missing hours in admin. Current-location distance search remains deferred.

Validation completed: frontend typecheck, production build, and diff checks passed. The backend migration was executed and its verification dry-run reports zero missing timezone, 24/7, schedule, or delivery-fee normalization records.

Restart checkpoint note: the live catalog currently contains one legacy pharmacy with `pharmacyDeliveryFee: 3.5`. This violates the integer-UZS contract. Extend migration reporting to detect fractional values, then normalize that record before adding seed pharmacies.

## Demo Data Coverage

Five Tashkent demo pharmacies now exist in MongoDB and render through the existing Apollo-backed frontend. They provide visual coverage for 24/7, Open now, missing hours, closed-day, overnight, free-delivery, paid-delivery, pickup-only, and insurance states.

The legacy fractional fee was normalized to `3000 UZS`. Demo pharmacy details distinguish source-confirmed branch facts from demo-only service and fee values. The records remain unverified and must not be treated as production-confirmed listings.

The following remain outside this pharmacy-discovery backend phase:

- Medicine catalog and medicine search.
- Medicine inventory and price comparison.
- Prescription workflows.
- Chat redesign.
- Notification behavior.
- Localization of stored pharmacy content.

## June 14, 2026 Frontend Consumption Checkpoint

The frontend currently consumes the implemented backend contract for:

- Uzbekistan region filtering;
- persisted integer UZS delivery fees;
- delivery and insurance availability;
- explicit 24/7 status;
- computed Open-now status;
- configured, missing, closed-day, and overnight operating hours;
- `verifiedAt` display;
- favorites, comments, owner profiles, and nearby pharmacy queries.

The public catalog card now displays only these truthful backend fields and no longer displays medication count, rank, views, or likes. No backend contract change was required for the card migration.

Still required for future approved frontend capabilities:

- verified-only public inquiry filter;
- coordinate-radius/current-location search and distance;
- structured city/district/address search beyond current text and region behavior;
- production verification of demo pharmacy facts and replacement/removal of demo accounts before launch.

## One-To-One Messaging Contract

Frontend now consumes additive pharmacy-context messaging support:

```graphql
getMyMessageThreads(input: MessageThreadsInquiry!): MessageThreads!
getMessages(input: MessagesInquiry!): Messages!
getUnreadMessageCount: Int!
startPharmacyConversation(input: StartPharmacyConversationInput!): MessageThread
sendMessage(input: SendMessageInput!): Message
markMessageThreadRead(threadId: String!): MessageThread
```

Message threads are unique per `customerId + ownerId + pharmacyId`. A logged-in non-owner can start a conversation from `/pharmacies/detail?id=...`; the backend derives the Pharmacy Owner from the pharmacy record. Message images are uploaded through the existing GraphQL upload flow with `target: messages` and stored as paths under `uploads/messages`.

Raw WebSocket events used by the frontend:

- `message:new`
- `message:threadUpdated`
- `message:unreadCount`
- `message:read`

The existing global chat events remain separate and must not be repurposed. Delete/archive, blocking, typing indicators, chatbot integration, moderation tooling, and non-image attachments remain deferred.
