---
doc: scope
status: approved
---

# TechTriage AI scope

This document captures the scope approved during the Devpost Learn `2-scope` interview on October 2, 2026. The fuller local interview artifact should replace this synchronized copy if available.

## Target user and problem

A non-technical employee in a small office uses a Windows 11 laptop. Its Wi-Fi disconnects or shows “connected, no internet” after waking from sleep. They need a structured way to collect observations and distinguish a laptop symptom from a shared network problem.

## One useful function

Describe the issue → confirm the supported case → perform a safe cross-device check → report its result → follow an appropriate short branch → produce a copyable evidence report. The app never assumes a particular root cause or claims it repaired a device.

## Proof

The three cross-device outcomes (other device works, neither works, unable to test) lead to different appropriate next steps. An inconclusive result remains inconclusive. A user can finish one path and copy the report in a short demo. Unsupported input receives a clear limitation message.

## Boundaries

One Windows 11 Wi-Fi-after-sleep scenario, a few manual safe checks, visible user-reported evidence, and a report. No accounts, database, remote device inspection, automatic commands, admin panel, or generic troubleshooting outside this case.
