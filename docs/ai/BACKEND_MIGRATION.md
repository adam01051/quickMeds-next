# Backend Migration

## Current Project Summary

QuickMeds is a NestJS GraphQL monorepo migrated from the original Nestar real-estate platform into a pharmacy marketplace backend. The safe project rename is complete, and the backend catalog ownership domain has now been migrated from real-estate `Property` terminology to pharmacy terminology.

| App | Purpose |
| --- | --- |
| `quickmeds-api` | Main GraphQL/API application |
| `quickmeds-batch` | Scheduled batch/ranking application |

## Completed Backend Domain Migration

| Area | Before | After | Status |
| --- | --- | --- | --- |
| Main catalog module | `PropertyModule` | `PharmacyModule` | Completed |
| Main catalog service/resolver | `PropertyService`, `PropertyResolver` | `PharmacyService`, `PharmacyResolver` | Completed |
| Main catalog DTOs | `Property`, `Properties`, `PropertyInput`, `PropertyUpdate` | `Pharmacy`, `Pharmacies`, `PharmacyInput`, `PharmacyUpdate` | Completed |
| Main catalog enums | `PropertyType`, `PropertyStatus`, `PropertyLocation` | `PharmacyType`, `PharmacyStatus`, `PharmacyLocation` | Completed |
| Mongoose model/collection | `Property`, `properties` | `Pharmacy`, `pharmacies` | Completed |
| Owner counter | `memberProperties` | `memberPharmacies` | Completed |
| Shared social groups | `PROPERTY` | `PHARMACY` | Completed |
| Batch ranking | top properties | top pharmacies | Completed |

## GraphQL Changes

This phase is a breaking API rename. Old `Property*` GraphQL types and operations were intentionally removed instead of kept as compatibility aliases.

| Removed | Current |
| --- | --- |
| `createProperty` | `createPharmacy` |
| `getProperty` | `getPharmacy` |
| `getProperties` | `getPharmacies` |
| `getAgentProperties` | `getAgentPharmacies` |
| `getAllPropertiesByAdmin` | `getAllPharmaciesByAdmin` |
| `updateProperty` | `updatePharmacy` |
| `updatePropertyByAdmin` | `updatePharmacyByAdmin` |
| `removePropertyByAdmin` | `removePharmacyByAdmin` |
| `likeTargetProperty` | `likeTargetPharmacy` |

## Pharmacy Model

The pharmacy schema follows the ER model fields:

- `pharmacyType`: `RETAIL`, `HOSPITAL`, `COMPOUNDING`, `ONLINE`
- `pharmacyStatus`: `HOLD`, `ACTIVE`, `CLOSED`, `DELETE`
- `pharmacyLocation`, `pharmacyAddress`, `pharmacyName`
- `pharmacyDeliveryFee`, `pharmacyLatitude`, `pharmacyLongitude`, `pharmacyMedicationCount`
- `pharmacyViews`, `pharmacyLikes`, `pharmacyComments`, `pharmacyRank`
- `pharmacyImages`, `pharmacyDesc`, `acceptsInsurance`, `hasDelivery`
- `memberId`, `verifiedAt`, `deletedAt`, `openedAt`

## Compatibility Notes

- `MemberType.USER`, `MemberType.AGENT`, and `MemberType.ADMIN` remain unchanged.
- `MemberType.AGENT` is still the pharmacy owner role.
- Existing MongoDB `properties` documents are not automatically migrated into `pharmacies`; production rollout needs a separate data migration/backfill plan if old data must be preserved.
- Frontend and external clients must update GraphQL calls to the new pharmacy API names.

## Tashkent Demo Data Procedure

- Five demo Pharmacy Owners and pharmacies were created through backend `signup` and authenticated `createPharmacy` operations.
- Pharmacy images use the backend-hosted `uploads/pharmacy/default-pharmacy.webp` fallback.
- Stable owner nicknames and pharmacy name/address pairs prevent duplicate seed records.
- Replace or remove all demo records before production.
## One-To-One Messaging Backend Dependency

- The frontend messaging UI depends on the additive backend `message` module and a regenerated GraphQL schema.
- Required live backend restart target: `http://localhost:3007/graphql`.
- Required collections: `message_threads` and `messages`.
- Required upload target: `uploads/messages` via the existing GraphQL upload flow.
- Existing global raw chat events remain separate; message events use the `message:*` namespace.
- After restart, verify `getMyMessageThreads`, `getMessages`, `getUnreadMessageCount`, `startPharmacyConversation`, `sendMessage`, and `markMessageThreadRead` are available in the live schema.
