# ZIP import pipeline fix (websiteTemplateController)

- [ ] Update plan-based edits: remove DOMParser usage and implement server-safe CSS extraction.
- [ ] Refactor convertAssetsInHtml to avoid async replace callback bug; use await + string reconstruction so replacements actually happen.
- [ ] Ensure page content stored as { html: bodyOnly, css: extractedCss, sourcePath }.
- [ ] Verify inline CSS from ZIP files is preserved during inlining + extraction; fix any missing steps.
- [ ] Add detailed logs for extractedCss length, bodyHtml length, finalHtml length, page slug, page id.
- [ ] Run backend lint/tests (or start server) to confirm no syntax/runtime errors.

