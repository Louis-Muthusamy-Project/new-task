# TODO

- [x] Update websiteController.js: make ownership helpers null-safe; allow lookups without req.user.
- [x] Update pageController.js: fix helper signature/call and ensure website lookup does not crash when req.user missing.
- [x] Update mediaController.js: remove unsafe destructuring from req.user; allow requests to work without JWT by not crashing.
- [x] Update domainController.js: make buildOwnershipFilter/findOwnedWebsite null-safe; remove unsafe req.user destructuring.
- [x] Update publishController.js: make findOwnedWebsite and triggeredBy null-safe; prevent crash when req.user missing.
- [ ] Review websiteController.js for any remaining unsafe req.user usage.
- [ ] Review remaining controllers/routes for req.user destructuring in Website Builder backend auth.
- [ ] Run backend syntax check / tests.

