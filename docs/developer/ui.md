# UI Developer Guide

Run dev server:

npm ci
npm run dev:ui

Dev server listens on port 5174 by default (vite.config). Open http://localhost:5174

Build for production:

npm run build:ui

Notes:
- The UI loads question bank from /specs/questions/ipip_50_respondent.txt
- Profile is stored to localStorage key `pctx_profile` for review/export flows
- Export buttons download JSON and a pbtxt fallback (protobuf text-format to be implemented)
