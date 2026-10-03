---
doc: checklist
status: draft
build_mode: fast
---

# TechTriage AI build checklist

- [x] Approved scope and PRD decisions incorporated.
- [x] Technical plan written for the single-scenario proof of concept.
- [x] Guided intake, deterministic checks, evidence history, and report coded.
- [x] Optional structured Gemini evidence highlighting and labeled fallback coded.
- [x] Branch unit tests pass in the current workspace.
- [x] Install packages, pass branch tests, and pass a production Next.js build in GitHub Actions.
- [x] Pass a production server smoke test for the page and report API in GitHub Actions.
- [x] Upgrade dependencies and pass an audit with no reported vulnerabilities in GitHub Actions.
- [ ] Run the app in a browser and review responsive screens, copy behavior, and all paths.
- [ ] Configure a live Gemini key/model and verify AI-assisted output; keep the key private.
- [ ] Sync the fuller locally approved scope and PRD files.
- [ ] Record and publish a public demonstration video under three minutes.
- [ ] Submit the GitHub URL and learner-written entry on Devpost.

## Code Tour and App Map

- `devpost/app-map.html`: offline take-home map with a concrete answer-to-report path.
- `src/app/page.tsx`: user interface and session state.
- `src/lib/flow.ts`: safe deterministic questions, transitions, evidence, and report.
- `src/app/api/highlights/route.ts`: optional Gemini call with schema and ID validation.
- Practice: follow the “Neither device works” answer from the UI through `submitAnswer` to the final report.
