"use client";

import { useEffect, useState } from "react";
import {
  SAMPLE_ISSUE, formatReport, getStep, outcomes, startSession, stopSession, submitAnswer,
  type Session
} from "@/lib/flow";

type View = "intake" | "confirm" | "unsupported" | "diagnose" | "report";
type Highlights = { source: "ai" | "standard"; evidenceIds: string[] };

function intakeClassification(value: string): "supported" | "unsupported" | "ambiguous" {
  const text = value.toLowerCase();
  const clearOther = /printer|blue screen|bsod|display|keyboard|battery|linux|windows server/.test(text) && !/wi-?fi|wireless/.test(text);
  if (clearOther) return "unsupported";
  const os = /windows\s*11|win\s*11/.test(text);
  const wifi = /wi-?fi|wireless/.test(text);
  const wake = /sleep|wake|waking|resume/.test(text);
  return os && wifi && wake ? "supported" : "ambiguous";
}

export default function Home() {
  const [view, setView] = useState<View>("intake");
  const [issue, setIssue] = useState("");
  const [sample, setSample] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [choice, setChoice] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [highlights, setHighlights] = useState<Highlights | null>(null);

  useEffect(() => {
    if (view !== "report" || !session?.outcome) return;
    let live = true;
    const fallback: Highlights = { source: "standard", evidenceIds: session.evidence.slice(0, 3).map(item => item.id) };
    setHighlights(null);
    fetch("/api/highlights", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        issue: session.issue, outcome: session.outcome,
        evidence: session.evidence.map(item => ({ id: item.id, text: `${item.question}: ${item.answer}${item.note ? `; ${item.note}` : ""}` }))
      })
    }).then(async response => response.ok ? await response.json() as Highlights : fallback)
      .then(data => { if (live) setHighlights(data?.evidenceIds ? data : fallback); })
      .catch(() => { if (live) setHighlights(fallback); });
    return () => { live = false; };
  }, [view, session]);

  function begin() {
    if (!issue.trim() || issue.length > 1200) { setError("Describe the issue in 1–1200 characters."); return; }
    setError("");
    const classification = intakeClassification(issue);
    if (classification === "unsupported") setView("unsupported");
    else if (classification === "ambiguous") setView("confirm");
    else launch();
  }

  function launch() {
    setSession(startSession(issue, sample));
    setChoice(""); setNote(""); setError("");
    setView("diagnose");
  }

  function record() {
    if (!session || !choice) { setError("Choose a result to continue."); return; }
    try {
      const next = submitAnswer(session, choice, note);
      setSession(next); setChoice(""); setNote(""); setError("");
      if (next.outcome) setView("report");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not record that result."); }
  }

  function finishEarly() {
    if (!session || !window.confirm("Stop the checks and create a report with the evidence recorded so far?")) return;
    setSession(stopSession(session)); setView("report");
  }

  async function copyReport() {
    if (!session) return;
    try { await navigator.clipboard.writeText(formatReport(session)); setCopied(true); }
    catch { setError("Copy failed. Select the report below to copy it manually."); }
  }

  function reset() {
    setView("intake"); setSession(null); setIssue(""); setSample(false);
    setChoice(""); setNote(""); setError(""); setHighlights(null); setCopied(false);
  }

  const step = session ? getStep(session) : null;
  const report = session?.outcome ? formatReport(session) : "";

  return <main className="shell">
    <header className="topbar">
      <div className="brand"><span className="brandMark" aria-hidden="true">✳</span><span>TechTriage <b>AI</b></span></div>
      <span className="edition">WINDOWS 11 WI-FI PROTOTYPE</span>
    </header>

    <div className="pageGrid">
      <div className="mainColumn">
        {view === "intake" && <section className="hero card">
          <div className="eyebrow"><span className="pulse" /> EVIDENCE FIRST TROUBLESHOOTING</div>
          <h1>Wi-Fi trouble after sleep?<br /><span>Let’s investigate.</span></h1>
          <p className="lead">Answer a few questions, perform safe checks, and get a report you can share with IT support.</p>
          <div className="scope"><b>Supported case</b><span>Windows 11 laptop Wi-Fi stops working or loses internet after waking from sleep.</span></div>
          <label htmlFor="issue" className="fieldLabel">Describe what happened</label>
          <textarea id="issue" maxLength={1200} rows={5} value={issue} onChange={event => { setIssue(event.target.value); setSample(false); setError(""); }} placeholder="Example: My Windows 11 laptop loses Wi-Fi when I wake it from sleep…" />
          {sample && <div className="sampleLabel">Sample input — you can edit it</div>}
          {error && <p className="formError" role="alert">{error}</p>}
          <div className="actions"><button className="primary" onClick={begin}>Start troubleshooting <span aria-hidden="true">→</span></button><button className="secondary" onClick={() => { setIssue(SAMPLE_ISSUE); setSample(true); setError(""); }}>Use sample issue</button></div>
          <p className="finePrint">You perform the checks yourself. This app cannot inspect or change your device. Do not enter passwords or sensitive information.</p>
        </section>}

        {view === "confirm" && <section className="card contentCard">
          <div className="eyebrow">ONE QUICK CLARIFICATION</div>
          <h1>Is this the supported issue?</h1>
          <p>Is this a Windows 11 laptop whose Wi-Fi stops working or loses internet access after it wakes from sleep?</p>
          <div className="actions"><button className="primary" onClick={launch}>Yes, start checks</button><button className="secondary" onClick={() => setView("unsupported")}>No</button><button className="secondary" onClick={() => setView("unsupported")}>Not sure</button></div>
          <button className="textButton" onClick={() => setView("intake")}>← Edit issue</button>
        </section>}

        {view === "unsupported" && <section className="card contentCard">
          <div className="eyebrow">PROTOTYPE LIMIT</div>
          <h1>This case is outside the current guide.</h1>
          <p>TechTriage AI currently supports Windows 11 laptop Wi-Fi problems after waking from sleep. For other issues, contact your IT support team.</p>
          <div className="actions"><button className="primary" onClick={() => setView("intake")}>Edit issue</button><button className="secondary" onClick={() => { setIssue(SAMPLE_ISSUE); setSample(true); setView("intake"); }}>Try sample scenario</button></div>
        </section>}

        {view === "diagnose" && step && <section className="card contentCard">
          <div className="eyebrow">GUIDED CHECK · {session!.evidence.length + 1}</div>
          <h1>{step.title}</h1>
          <p className="purpose"><b>Why this matters</b><br />{step.purpose}</p>
          <p className="instructions">{step.instructions}</p>
          <fieldset><legend>What did you observe?</legend>
            <div className="optionList">{step.choices.map(option => <label className={`option ${choice === option.value ? "selected" : ""}`} key={option.value}><input type="radio" name="result" value={option.value} checked={choice === option.value} onChange={() => { setChoice(option.value); setError(""); }} /><span>{option.label}</span></label>)}</div>
          </fieldset>
          <label className="fieldLabel" htmlFor="note">Additional observations <span className="muted">(optional)</span></label>
          <textarea id="note" rows={3} maxLength={400} value={note} onChange={event => setNote(event.target.value)} placeholder="Add anything useful you noticed. Do not enter passwords." />
          {error && <p className="formError" role="alert">{error}</p>}
          <div className="actions"><button className="primary" onClick={record}>Continue <span aria-hidden="true">→</span></button><button className="secondary" onClick={finishEarly}>Stop and create report</button></div>
        </section>}

        {view === "report" && session?.outcome && <section className="card contentCard">
          <div className="eyebrow">TROUBLESHOOTING REPORT</div>
          <h1>{outcomes[session.outcome].title}</h1>
          <p className="lead">{outcomes[session.outcome].conclusion}</p>
          <div className="reportBlock"><h2>Recommended next action</h2><p>{outcomes[session.outcome].nextAction}</p></div>
          <div className="reportBlock"><h2>Evidence highlights <span className="sourceBadge">{highlights?.source === "ai" ? "AI-assisted" : "Standard guidance"}</span></h2>
            {!highlights ? <p>Preparing highlights…</p> : highlights.evidenceIds.length ? <ul>{highlights.evidenceIds.map(id => {
              const item = session.evidence.find(entry => entry.id === id);
              return item ? <li key={id}>{item.answer}{item.validity === "invalid" ? " — invalid comparison" : ""}</li> : null;
            })}</ul> : <p>No checks completed.</p>}
          </div>
          <label htmlFor="report" className="fieldLabel">Full report</label>
          <textarea id="report" className="reportText" readOnly value={report} rows={15} onFocus={event => event.currentTarget.select()} />
          {error && <p className="formError" role="alert">{error}</p>}
          <div className="actions"><button className="primary" onClick={copyReport}>{copied ? "Copied!" : "Copy report"}</button><button className="secondary" onClick={reset}>Start a new session</button></div>
          <p className="finePrint">Highlights may be selected by Gemini using your description and observations. The original evidence and outcome remain controlled by this app.</p>
        </section>}
      </div>

      <aside className="sidebar card" aria-label="Session evidence">
        <div className="sidebarHeader"><div className="eyebrow">CASE FILE</div><h2>What we know</h2></div>
        {session ? <>
          <div className="evidenceItem"><span className="evidenceNum">01</span><div><b>Original issue</b><p>{session.issue}</p>{session.sample && <small>Sample input</small>}</div></div>
          {session.evidence.map((item, index) => <div className="evidenceItem" key={item.id}><span className="evidenceNum">{String(index + 2).padStart(2, "0")}</span><div><b>{item.question}</b><p>{item.answer}</p>{item.note && <small>Note: {item.note}</small>}{item.validity === "invalid" && <small className="invalid">Invalid comparison: different networks</small>}</div></div>)}
          {session.evidence.length === 0 && <p className="asideHint">Your observations will appear here as you complete checks.</p>}
        </> : <p className="asideHint">A clear record makes it easier to share the issue with IT support. Your answers stay in this browser tab.</p>}
        <div className="asideFooter"><span className="statusDot" /> No device access or automatic changes</div>
      </aside>
    </div>
    <footer className="footer"><span>TechTriage AI · Hackathon proof of concept</span><span>Observe → Test → Record → Report</span></footer>
  </main>;
}
