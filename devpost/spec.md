---
doc: spec
status: approved
---

# TechTriage AI technical specification

## Goal and boundary

Implement the approved single-scenario proof of concept: a non-technical employee's Windows 11 laptop loses Wi-Fi or internet after sleep. The application records reported evidence, offers one safe check at a time, and ends in a copyable report. It does not inspect or repair a device.

## Stack

- Next.js App Router, React, TypeScript, Tailwind CSS, Zod.
- One server route for optional Gemini Developer API evidence highlighting; the API key stays on the server.
- React session state in the open browser tab. No accounts, database, remote commands, or persistent case history.

## Data and routing

`src/lib/flow.mjs` is a deterministic transition function. It defines the permitted step IDs, choices, single retry limits, safe check text, and terminal outcomes. Each answer is appended to an evidence log. A network mismatch marks the earlier cross-device comparison invalid, while preserving the original answer. No AI output can change a step or outcome.

The intake requires a non-empty description and explicit user confirmation that the issue matches the supported scenario. The diagnostic flow starts with a cross-device comparison. Subsequent checks depend on the result and can end as `working`, `escalate`, `inconclusive`, or `stopped`. Working requires a successful repeated sleep/wake check. The report includes the original issue, every reported observation, interpretation with uncertainty, and next action.

## AI contribution

At report time, the browser can POST bounded evidence items and a deterministic outcome to `/api/highlights`. The server validates input with Zod, calls Gemini with structured JSON output, and accepts only IDs present in the evidence list. It renders the original evidence text in the model-selected order; free-form model claims are never rendered. Gemini therefore helps select salient highlights while the application controls every factual statement. A missing key, timeout, invalid response, or rate limit yields a labeled standard selection. The report works without AI.

Use the official `@google/genai` SDK. Set `GEMINI_API_KEY` and a model with structured output support in `GEMINI_MODEL`. Verify the selected model in Google AI Studio when configuring a live demo. Do not place keys or raw exception details in responses or logs. User-entered descriptions and evidence are sent to Gemini only when this optional report call is made; the UI discloses this.

## Verification

- Exercise the three cross-device outcomes, unsupported and ambiguous intake, invalid comparison and one retry, status paths, stop early, and copy report.
- Assert that missing/invalid AI output falls back to standard guidance; unknown evidence IDs are rejected.
- Run `npm test`, `npm run build`, and a manual browser walkthrough when dependencies are available.

## Tradeoffs

The narrow deterministic checks make the prototype safe and demonstrable. AI selection of evidence is intentionally modest. It shows a real structured model call without allowing an unverified model sentence to become a claimed diagnosis. The app does not persist a session after closing the tab.
