# TechTriage AI

An evidence-first troubleshooting proof of concept for one scenario: a Windows 11 laptop loses Wi-Fi or internet after waking from sleep. It asks a short sequence of safe checks, records what the user actually observed, and creates a report for IT support.

Built for [Devpost Build With AI: Basics](https://learn-ai-basics.devpost.com/). Planning documents are in `devpost/`. The synchronized scope and PRD summarize the approved local Devpost Skill Pack interviews; replace them with their fuller local originals when available.

## What it does

1. Enter an issue or use the editable sample.
2. Confirm the supported scenario if the description is ambiguous.
3. Compare another device on the same Wi-Fi, then follow the relevant safe checks.
4. See every reported result in the case file; invalid or unavailable comparisons retain their uncertainty.
5. Copy a report with the issue, tests, observations, interpretation, and next action.

No account, database, remote inspection, or automatic repair is involved. The app never presents a suspected driver, router, or DNS cause as confirmed.

## Run locally

Requires Node.js 20 or newer and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The full guided flow and report work without an AI key. To enable Gemini evidence highlights, set `GEMINI_API_KEY` and `GEMINI_MODEL` in `.env.local`, using a model available to your Google AI Studio account that supports structured output. Restart the development server. Never commit `.env.local`.

```bash
npm test
npm run build
```

The AI receives the issue and recorded observations only when the final report opens. It returns evidence IDs; the server rejects IDs outside the current case. The UI displays only the original evidence text, in the selected order. If Gemini is unavailable, standard guidance selects the first recorded items. The source is labeled in the report. User descriptions may be processed under the Gemini API terms when this feature is enabled; use synthetic examples for the demo and do not enter secrets.

## Stack and structure

Next.js App Router, React, TypeScript, Tailwind CSS, Zod, and the Google GenAI SDK. `src/lib/flow.ts` contains deterministic routing and report generation. `src/app/page.tsx` contains the responsive UI. `src/app/api/highlights/route.ts` protects the Gemini key and validates the optional model result. `tests/flow.test.mjs` covers the significant branches.

## Limits

The prototype supports a single Windows 11 issue pattern. Its findings are based on user-reported observations; it cannot diagnose hardware automatically or guarantee a lasting fix. The case exists only in the current browser tab. A live Gemini test requires the user's API key and an available model.

## Third-party code and services

Next.js/React, Tailwind CSS, Zod, and Google's GenAI SDK are installed from npm. Gemini Developer API is optional. No pre-existing application code was incorporated; the project was started during the hackathon submission period.
