---
doc: prd
status: approved
---

# TechTriage AI product requirements

This compact copy records decisions approved in the Devpost Learn `3-prd` interview on October 3, 2026. The fuller local interview artifact should replace this synchronized copy if available.

## Start screen

Display the supported case, an editable issue description, a sample issue button, and Start troubleshooting. Empty descriptions receive an inline error. Explain that checks are performed manually and that users must not enter passwords or sensitive data. Clear unsupported issues show the limitation, with Edit issue and Try sample scenario. Ambiguous text receives one explicit Windows 11 Wi-Fi-after-sleep confirmation.

## Guided checks

Display one explained check and its result choices at a time, with an optional observation. The original issue and all answered checks stay visible in the case file. Require a selected result before continuing. The first check compares another device on the same Wi-Fi. Its results route to laptop status, a shared-network confirmation, or an inconclusive laptop status path.

For a laptop symptom, ask Windows status. Disconnected leads to checking whether the office network appears and optionally reconnecting. Connected without internet leads to verifying the intended Wi-Fi and checking two unrelated sites. Not sure receives one Quick Settings explanation. Current internet access requires one repeat sleep/wake check before the “Working in this test” outcome.

For a shared symptom, verify that both devices used the same Wi-Fi and whether the issue continues. Different networks invalidate the prior comparison and permit one retry. A cleared interruption gets one repeat wake check. Persistent shared failures go to IT or network-owner follow-up. If the laptop is on the wrong office network, offer one safe manual switch and retest. Preserve the invalid earlier observation.

Allow Stop and create report at every supported diagnostic step, with confirmation. Never claim a permanent fix or confirmed root cause. The report includes original issue, all reported checks and notes, invalid/inconclusive evidence labels, tentative interpretation, remaining uncertainty, and recommended next action. Copy failure leaves selectable text for manual copying. Show AI-assisted labels only for actual model output, and Standard guidance for fallback selection.

## Visual and accessibility direction

Calm operations-tool appearance, readable neutral palette with blue accents, responsive layout, explicit labels, keyboard-operable choices, and plain-language guidance. No fixed completion percentage because paths vary.

## Acceptance paths

- Other device works → laptop checks → repeat wake → “Working in this test” only after user confirmation.
- Neither works → same-network confirmation → shared follow-up or one invalid-comparison retry.
- Unable to compare → status check with uncertainty retained.
- Unsupported, ambiguous, empty, early stop, copy failure, and AI failure have clear outcomes.
