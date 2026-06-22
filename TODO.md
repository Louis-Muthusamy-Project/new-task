# Upload-template investigation & fix

## Step 1: Instrument logging + error handling
- [x] Inspect request flow for upload-template (frontend → /api/website/upload-template → multer → controller → Cloudinary → Mongo)
- [x] Add detailed logging in:
  - backend/src/controllers/websiteTemplateController.js
  - backend/src/middlewares/errorMiddleware.js
  - backend/src/config/cloudinary.js
- [x] Make controller return meaningful JSON errors (try/catch, validate env + uploadResult)


## Step 2: Reproduce & capture root cause
- [ ] Run backend and perform 2+ uploads
- [ ] Capture server console output + exact error stack on the *second* request

## Step 3: Fix root cause
- [ ] Based on captured stack, implement functional fix (DB constraint handling, request parsing, Cloudinary env, etc.)
- [ ] Add/adjust frontend validation if field names mismatch

## Step 4: Verify
- [ ] Confirm multiple uploads succeed without HTTP 500

