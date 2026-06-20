# Edit Plan: Fix Website Builder backend auth assumptions

## Information Gathered
- `backend/src/controllers/pageController.js`
  - Has `findOwnedWebsite(req, websiteId)` but called as `findOwnedWebsite(websiteId, req)` → parameter order bug.
  - Already has null-safe fallback: if no ownerId, it does `Website.findById(websiteId)`.
- `backend/src/controllers/websiteController.js`
  - `buildOwnershipFilter(req)` partially uses optional chaining, but returns `{ ownerId: null }` when unauthenticated.
  - `createWebsite` uses `req.user?.id` for `ownerId` but `Website.create` is called without actually setting owner/team fields (still safe, but ownership queries fail).
  - `getWebsiteById` / list / update / delete use `buildOwnershipFilter(req)` which can produce null-scoped filters.
- `backend/src/controllers/mediaController.js`
  - Multiple unsafe destructuring: `const { id: ownerId } = req.user;` and `req.user` assumed present.
- `backend/src/controllers/domainController.js`
  - `buildOwnershipFilter` and `findOwnedWebsite` rely on `req.user` destructuring (unsafe).
  - `createDomain` / `deleteDomain` destructure `const { id: ownerId } = req.user;` (unsafe).
- `backend/src/controllers/publishController.js`
  - `findOwnedWebsite` destructures `const { id: ownerId, teamId } = req.user;` (unsafe).
  - `publishWebsite` destructures `const { id: triggeredBy } = req.user;` (unsafe).
- `backend/src/services/publishService.js`
  - Uses `triggeredBy` only for saving publish history; does not read `req.user`.

## Plan
1. Add shared null-safe helper patterns inside each controller (no cross-file coupling required):
   - Create a `getUserIdentifiers(req)` inside each file to extract `ownerId` / `teamId` safely.
2. `websiteController.js`
   - Update `buildOwnershipFilter(req)` to:
     - If no authenticated user info exists, return `{}` (no ownership scoping) so `_id` lookup works.
     - If auth exists, return ownership/team scoping as before.
   - Update `createWebsite` / `updateWebsite` to avoid crashing and to preserve future JWT compatibility.
3. `pageController.js`
   - Fix helper signature/call so parameters match:
     - Ensure helper is `findOwnedWebsite(req, websiteId)` and called with `(req, websiteId)`.
   - Keep null-safe fallback: if no ownerId, allow lookup by `Website.findById(websiteId)`.
4. `mediaController.js`
   - Change all `req.user` destructuring to null-safe:
     - If no ownerId, either:
       - allow listing/upload without crashing but return empty lists / avoid owner scoping, OR
       - only scope by `websiteId/type` and omit `ownerId` filter.
   - For upload/create, if no ownerId, set `ownerId: null` only if schema allows; otherwise omit field.
5. `domainController.js`
   - Update `buildOwnershipFilter(req)` / `findOwnedWebsite(websiteId, req)` to be null-safe.
   - Remove `const { id: ownerId } = req.user;` and use safe fallback (ownerId/team filtering only when available).
   - For domain delete/create, avoid crashing when unauthenticated.
6. `publishController.js`
   - Update `findOwnedWebsite` to not destructure req.user; when no user, just `Website.findOne({_id, isDeleted:false})`.
   - Update `publishWebsite` to set `triggeredBy` as `req.user?.id || req.user?._id || null`.
7. Confirm no remaining direct usages of `req.user` destructuring in these controllers.

## Dependent Files to be edited
- `backend/src/controllers/websiteController.js`
- `backend/src/controllers/pageController.js`
- `backend/src/controllers/mediaController.js`
- `backend/src/controllers/domainController.js`
- `backend/src/controllers/publishController.js`

## Followup steps
- Run `npm test` or `npm run lint` (if present) in `backend/`.
- Run a quick `node -c`-style syntax check by running `node -e "require('./src/controllers/websiteController')"` etc.

<ask_followup_question>
Proceed with editing these five controller files exactly per this plan (including fixing the pageController helper parameter order and making all req.user access null-safe while still scoping by ownership when JWT is present)?
</ask_followup_question>

