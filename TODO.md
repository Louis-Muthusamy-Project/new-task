# TODO

## Fix backend/ frontend response correctness (304 + stale editor)
- [x] Update `backend/src/controllers/pageController.js` to disable caching for `getPagesByWebsite`.
- [ ] Re-test: `GET /api/website-builder/websites/:id/pages` should return 200 (no 304) and Grapes editor should load correct page content.


