# TODO

- [ ] Update `frontend/src/pages/WebsiteBuilder/tabs/WebsiteEditPage.jsx`:
  - [ ] Add `useEffect`-based `fetchPages()` calling `websiteWizardApi.listPagesByWebsite(websiteDbId)`.
  - [ ] Normalize slugs (convert `/about` -> `about`, `/` -> `home`).
  - [ ] Update `website.pages` with fetched pages so ZIP-imported pages render immediately.
  - [ ] Add debug logs for websiteId + raw pages response.
  - [ ] Ensure preview logic uses normalized slugs.
- [ ] Run frontend build/dev check (optional) / verify no runtime errors.

