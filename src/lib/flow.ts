/** The application owns the diagnostic path. Model output never enters this module. */
export type StepId =
  | "comparison" | "sameNetwork" | "status" | "statusHelp" | "ssid"
  | "reconnect" | "officeNetwork" | "switchNetwork" | "websites"
  | "recurrence" | "repeatWake";

export type Outcome = "working" | "escalate" | "inconclusive" | "stopped";
export type Choice = { value: string; label: string };
export type Step = {
  id: StepId;
  title: string;
  purpose: string;
  instructions: string;
  choices: Choice[];
};
export type Evidence = {
  id: string;
  step: StepId;
  question: string;
  answer: string;
  note: string;
  validity: "reported" | "invalid";
};
export type Session = {
  issue: string;
  sample: boolean;
  step: StepId | null;
  outcome: Outcome | null;
  evidence: Evidence[];
  comparisonRetries: number;
};

export const SAMPLE_ISSUE = "My Windows 11 laptop loses Wi-Fi after it wakes from sleep, but it works when I first turn it on.";

const steps: Record<StepId, Step> = {
  comparison: {
    id: "comparison", title: "Compare another device on the same Wi-Fi",
    purpose: "This helps distinguish a laptop symptom from a shared connection problem.",
    instructions: "While the laptop has the problem, try opening two unrelated websites on another device connected to the same Wi-Fi. On a phone, temporarily turn off mobile data, then turn it back on afterward.",
    choices: [
      { value: "otherWorks", label: "Other device works; laptop does not" },
      { value: "neither", label: "Neither device works" },
      { value: "unknown", label: "Could not test / not sure" }
    ]
  },
  sameNetwork: {
    id: "sameNetwork", title: "Confirm the network comparison",
    purpose: "A comparison across different networks cannot show whether the office connection is shared.",
    instructions: "Were both devices connected to the same office Wi-Fi while the problem was happening?",
    choices: [
      { value: "yes", label: "Yes, same Wi-Fi" },
      { value: "no", label: "No, different networks" },
      { value: "unknown", label: "Not sure" }
    ]
  },
  status: {
    id: "status", title: "Check what Windows shows after waking",
    purpose: "The connection status helps choose a relevant, safe next check.",
    instructions: "Look at the Wi-Fi icon in the Windows 11 taskbar after the problem occurs. What does it show?",
    choices: [
      { value: "disconnected", label: "Disconnected from Wi-Fi" },
      { value: "noInternet", label: "Connected, no internet" },
      { value: "online", label: "Connected with internet" },
      { value: "unknown", label: "Not sure" }
    ]
  },
  statusHelp: {
    id: "statusHelp", title: "Find the Wi-Fi status",
    purpose: "A clearer observation may let us continue without guessing.",
    instructions: "Select the network icon in the taskbar to open Quick Settings. Check whether Wi-Fi is connected and whether Windows says it has internet access.",
    choices: [
      { value: "disconnected", label: "Disconnected from Wi-Fi" },
      { value: "noInternet", label: "Connected, no internet" },
      { value: "online", label: "Connected with internet" },
      { value: "unknown", label: "Still not sure" }
    ]
  },
  ssid: {
    id: "ssid", title: "Look for the usual office Wi-Fi",
    purpose: "We need to know whether the expected network is available before suggesting a reconnection.",
    instructions: "Open the available Wi-Fi networks list in Windows. Is your usual office network listed?",
    choices: [
      { value: "visible", label: "Yes, it is listed" },
      { value: "missing", label: "No, it is missing" },
      { value: "unknown", label: "Could not tell" }
    ]
  },
  reconnect: {
    id: "reconnect", title: "Try reconnecting",
    purpose: "A manual reconnection is a reversible way to check whether access returns.",
    instructions: "Select the usual office Wi-Fi and reconnect if you already have its credentials. Never enter your Wi-Fi password in this app. Does internet access return?",
    choices: [
      { value: "works", label: "Internet works now" },
      { value: "fails", label: "Still disconnected or no internet" },
      { value: "unknown", label: "Could not reconnect / not sure" }
    ]
  },
  officeNetwork: {
    id: "officeNetwork", title: "Confirm the intended Wi-Fi",
    purpose: "Being on a different network makes the earlier device comparison unreliable.",
    instructions: "Is the laptop connected to the same intended office Wi-Fi used for the comparison?",
    choices: [
      { value: "yes", label: "Yes, intended office Wi-Fi" },
      { value: "no", label: "No, a different network" },
      { value: "unknown", label: "Not sure" }
    ]
  },
  switchNetwork: {
    id: "switchNetwork", title: "Switch to the intended network",
    purpose: "A fresh result on the intended network is useful evidence; the earlier comparison remains invalid.",
    instructions: "If you already have access, connect to the intended office Wi-Fi. Do not type credentials in this app. Can you test the connection on that network?",
    choices: [
      { value: "switched", label: "Yes, connected to the intended Wi-Fi" },
      { value: "cannot", label: "Could not switch or test" }
    ]
  },
  websites: {
    id: "websites", title: "Check two websites on the laptop",
    purpose: "This checks whether the symptom affects general internet access.",
    instructions: "On the intended Wi-Fi, open two unrelated websites on the laptop. What happens?",
    choices: [
      { value: "bothFail", label: "Both fail" },
      { value: "oneFails", label: "Only one fails" },
      { value: "bothWork", label: "Both work" },
      { value: "unknown", label: "Could not test / not sure" }
    ]
  },
  recurrence: {
    id: "recurrence", title: "Check whether the shared interruption continues",
    purpose: "A past interruption that has cleared may be intermittent.",
    instructions: "Were both devices on the same office Wi-Fi, and is the connection problem still happening now?",
    choices: [
      { value: "happening", label: "Yes, it is still happening" },
      { value: "stopped", label: "No, both devices work now" },
      { value: "unknown", label: "Could not confirm" }
    ]
  },
  repeatWake: {
    id: "repeatWake", title: "Repeat the sleep and wake check",
    purpose: "Current internet access alone does not test the reported recurring symptom.",
    instructions: "If it is safe to pause your work, put the laptop to sleep, wake it once, and check internet access again. Save open work first.",
    choices: [
      { value: "works", label: "Internet still works after waking" },
      { value: "recurs", label: "The problem happens again" },
      { value: "unknown", label: "Could not repeat the check" }
    ]
  }
};

export function getStep(session: Session): Step | null {
  return session.step ? steps[session.step] : null;
}

export function startSession(issue: string, sample = false): Session {
  if (!issue.trim() || issue.length > 1200) throw new Error("Describe the issue in 1–1200 characters.");
  return { issue: issue.trim(), sample, step: "comparison", outcome: null, evidence: [], comparisonRetries: 0 };
}

function statusRoute(value: string): StepId | null {
  if (value === "disconnected") return "ssid";
  if (value === "noInternet") return "officeNetwork";
  if (value === "online") return "repeatWake";
  if (value === "unknown") return "statusHelp";
  return null;
}

/** Appends evidence, then moves to exactly one next step or terminal outcome. */
export function submitAnswer(session: Session, value: string, note = ""): Session {
  const step = getStep(session);
  if (!step) throw new Error("This session is finished.");
  const choice = step.choices.find(item => item.value === value);
  if (!choice) throw new Error("Choose a valid result.");
  if (note.length > 400) throw new Error("Keep the note under 400 characters.");

  let evidence = [...session.evidence];
  let comparisonRetries = session.comparisonRetries;
  let next: StepId | null = null;
  let outcome: Outcome | null = null;

  switch (step.id) {
    case "comparison":
      next = value === "otherWorks" ? "status" : value === "neither" ? "sameNetwork" : "status";
      break;
    case "sameNetwork":
      if (value === "yes") next = "recurrence";
      else if (value === "no") {
        evidence = evidence.map(item => item.step === "comparison" && item.validity === "reported" ? { ...item, validity: "invalid" as const } : item);
        if (comparisonRetries < 1) { comparisonRetries++; next = "comparison"; }
        else outcome = "inconclusive";
      } else outcome = "inconclusive";
      break;
    case "status":
    case "statusHelp":
      if (value === "unknown" && step.id === "statusHelp") outcome = "inconclusive";
      else next = statusRoute(value);
      break;
    case "ssid":
      if (value === "visible") next = "reconnect";
      else outcome = value === "missing" ? "escalate" : "inconclusive";
      break;
    case "reconnect":
      if (value === "works") next = "repeatWake";
      else outcome = value === "fails" ? "escalate" : "inconclusive";
      break;
    case "officeNetwork":
      if (value === "yes") next = "websites";
      else if (value === "no") {
        evidence = evidence.map(item => item.step === "comparison" && item.validity === "reported" ? { ...item, validity: "invalid" as const } : item);
        next = "switchNetwork";
      } else outcome = "inconclusive";
      break;
    case "switchNetwork":
      if (value === "switched") next = "websites";
      else outcome = "inconclusive";
      break;
    case "websites":
      if (value === "bothWork") next = "repeatWake";
      else outcome = value === "bothFail" ? "escalate" : "inconclusive";
      break;
    case "recurrence":
      if (value === "stopped") next = "repeatWake";
      else outcome = value === "happening" ? "escalate" : "inconclusive";
      break;
    case "repeatWake":
      outcome = value === "works" ? "working" : value === "recurs" ? "escalate" : "inconclusive";
      break;
  }

  evidence.push({ id: `e${evidence.length + 1}`, step: step.id, question: step.title, answer: choice.label, note: note.trim(), validity: "reported" });
  return { ...session, evidence, comparisonRetries, step: next, outcome };
}

export function stopSession(session: Session): Session {
  if (!session.step) return session;
  return { ...session, step: null, outcome: "stopped" };
}

export const outcomes: Record<Outcome, { title: string; conclusion: string; nextAction: string }> = {
  working: {
    title: "Working in this test",
    conclusion: "The user reported internet access after one repeat sleep/wake check. The earlier interruption's cause remains unknown.",
    nextAction: "Monitor for recurrence. If it happens again, share this report with IT support."
  },
  escalate: {
    title: "Needs IT follow-up",
    conclusion: "The reported checks did not establish a confirmed root cause or repair.",
    nextAction: "Share the recorded observations with the office IT team or network owner."
  },
  inconclusive: {
    title: "Inconclusive",
    conclusion: "Available observations are insufficient to establish the cause.",
    nextAction: "Share this report with IT support and repeat unavailable checks when possible."
  },
  stopped: {
    title: "Stopped early / needs follow-up",
    conclusion: "The user ended the checks before a supported outcome was established.",
    nextAction: "Share the observations recorded so far with IT support."
  }
};

export function formatReport(session: Session): string {
  if (!session.outcome) throw new Error("Finish the session first.");
  const result = outcomes[session.outcome];
  const observations = session.evidence.length
    ? session.evidence.map((item, index) => `${index + 1}. ${item.question}: ${item.answer}${item.validity === "invalid" ? " [invalid comparison: different networks]" : ""}${item.note ? ` — Note: ${item.note}` : ""}`).join("\n")
    : "No checks completed.";
  return `TechTriage AI — Troubleshooting report\n\nStatus: ${result.title}\nIssue (user reported): ${session.issue}${session.sample ? " [sample input]" : ""}\n\nReported checks and observations:\n${observations}\n\nInterpretation: ${result.conclusion}\nRecommended next action: ${result.nextAction}\n\nThis report records user-provided information. The app did not inspect or repair a device.`;
}
