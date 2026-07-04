import { useState, useEffect, useRef } from "react";
const TABS = ["My Career", "My Projects", "My Personal Life"];
import { T, ROLES, RECOMMENDATIONS, BUILD_TILES, STATS } from "./cvData";
function useInView(ref, threshold = 0.1) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return inView;
}
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}
function AnimNum({ value, suffix, prefix, delay }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref);
  const done = useRef(false);
  useEffect(() => {
    if (!inView || done.current) return;
    done.current = true;
    const start = performance.now();
    setTimeout(() => {
      const tick = (now) => {
        const t = Math.min((now - start - delay) / 1000, 1);
        if (t < 0) { requestAnimationFrame(tick); return; }
        setCount(Math.round(value * (1 - Math.pow(1 - t, 3))));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
  }, [inView, value, delay]);
  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}
function SeriesAnim({ value, delay }) {
  const letters = ["A", "B", "C", "D", "E", "F"];
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref);
  const started = useRef(false);
  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        if (i >= letters.length) { clearInterval(interval); setDone(true); return; }
        setIndex(i);
      }, 180);
    }, delay);
    return () => clearTimeout(timer);
  }, [inView, delay]);
  return <span ref={ref}>{done ? value : `Series ${letters[index]}`}</span>;
}
function RoleCard({ role, index, isLast, isMobile }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref);
  return (
    <div style={{ position: "relative" }}>
      {/* Card */}
      <div ref={ref} onClick={() => setOpen(!open)}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{
        position: "relative", cursor: "pointer",
        borderRadius: 10,
        border: `1px solid ${open ? T.accentBorder : hovered ? T.accent + "40" : T.cardBorder}`,
        transition: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease ${index * 60}ms, transform 0.4s ease ${index * 60}ms`,
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(18px)",
        boxShadow: open ? "0 4px 16px rgba(196,112,75,0.12)" : hovered ? "0 2px 8px rgba(196,112,75,0.1)" : "0 1px 4px rgba(0,0,0,0.03)",
      }}>
        {/* Grey header */}
        <div style={{ background: hovered && !open ? "#ECEAE6" : T.tagBg, padding: isMobile ? "12px 14px" : "12px 22px", display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 4 : 12, flexWrap: "wrap", transition: "background 0.3s ease", borderRadius: "10px 10px 0 0" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: T.text, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>{role.title} <span style={{ color: T.textLight, fontWeight: 500 }}>@</span> <span style={{ color: T.textMid, fontWeight: 600 }}>{role.company}</span></h3>
          <div style={{ flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: T.textMid, whiteSpace: "nowrap" }}>
              {role.period}{role.duration && <span style={{ color: T.textLight }}> ({role.duration})</span>}
            </span>
          </div>
        </div>
        {/* White body */}
        <div style={{ background: hovered && !open ? "#F9F8F6" : T.card, padding: isMobile ? "12px 14px 12px" : "14px 22px 14px", position: "relative", borderRadius: "0 0 10px 10px", transition: "background 0.3s ease" }}>
          {role.companyPills && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
              {role.companyPills.map((pill, i) => (
                <span key={"c" + i} style={{ fontSize: 10, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", padding: "3px 7px", background: T.tagBg, color: T.textLight, borderRadius: 6, border: `1px solid ${T.cardBorder}`, whiteSpace: "nowrap" }}>{pill}</span>
              ))}
            </div>
          )}
          {role.roleContext && <p style={{ fontSize: 13, color: T.textMid, margin: 0, lineHeight: 1.6 }}><span style={{ fontSize: 13, color: T.accent, fontWeight: 700 }}>My role: </span>{role.roleContext}</p>}
          {/* Expanded content */}
          <div style={{ maxHeight: open ? 800 : 0, overflow: "hidden", transition: "max-height 0.5s ease, opacity 0.35s ease", opacity: open ? 1 : 0 }}>
            <div style={{ paddingTop: 6, marginTop: 6 }}>
              <h4 style={{ fontSize: 10, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: T.accent, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>Achievements</h4>
              {role.highlights.map((h, i) => (
                <div key={i} style={{ fontSize: 13, color: T.textMid, lineHeight: 1.65, marginBottom: 8, paddingLeft: 14, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, top: 9, width: 5, height: 5, borderRadius: "50%", background: role.color, opacity: 0.45 }} />
                  {h}
                </div>
              ))}
              {role.clients && (
                <div style={{ marginTop: 10, padding: "8px 12px", background: T.tagBg, borderRadius: 10, fontSize: 11, color: T.textLight }}>
                  <span style={{ color: T.textFaint, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.5px" }}>Clients: </span>{role.clients}
                </div>
              )}
              {role.progression && (
                <div style={{ fontSize: 13, color: T.textMid, lineHeight: 1.65, marginBottom: 8, paddingLeft: 14, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, top: 9, width: 5, height: 5, borderRadius: "50%", background: role.color, opacity: 0.45 }} />
                  <span style={{ fontWeight: 700, color: T.text }}>{role.progression.count}x promotion{role.progression.count > 1 ? "s" : ""}:</span> {role.progression.path}
                </div>
              )}
              {role.leaving && (
                <div style={{ marginTop: 10, fontSize: 11, color: T.textLight, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}><span style={{ color: T.textMid, fontWeight: 600 }}>Reason for leaving:</span> {role.leaving}</div>
              )}
            </div>
          </div>
          {/* Tap hint */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 8 }}>
            <span style={{ fontSize: 10, color: T.textLight, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>{open ? "Close" : "Press to see achievements"}</span>
            <span style={{ display: "inline-flex", alignItems: "center", transition: "transform 0.3s ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke={T.textLight} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </div>
        </div>
      </div>
      {/* Connector */}
      {!isLast && (
        <div style={{ display: "flex", justifyContent: "center", height: 28, margin: "4px 0" }}>
          <div style={{ width: 1, height: "100%", background: T.cardBorder }} />
        </div>
      )}
    </div>
  );
}
function SheetsModal({ onClose, isMobile }) {
  const steps = [
    {
      num: "01",
      title: "The Problem",
      body: "Hiring managers forget to submit interview feedback. Recruiters waste hours chasing scorecards - checking the ATS, pinging on Slack, following up two days later. Candidates sit in limbo and time-to-hire creeps up.",
      color: T.red,
    },
    {
      num: "02",
      title: "The Automation",
      body: "A Zapier workflow that runs every morning at 9am. Pulls recent interviews from Greenhouse via the Harvest API, checks whether each interviewer has submitted their scorecard, and cross-references a \"Last Chased\" custom field to avoid double-messaging.",
      color: T.blue,
    },
    {
      num: "03",
      title: "How It Works",
      body: "For each missing scorecard, Zapier sends a Slack DM to the hiring manager with the candidate name, role, interview date, and a direct link to submit. It then stamps the \"Last Chased\" field so the same person doesn't get chased again the next day.",
      color: T.green,
    },
    {
      num: "04",
      title: "Escalation Logic",
      body: "First chase is a gentle nudge at 48 hours. If still no feedback after 72 hours, a second message goes out with the recruiter CC'd. After 96 hours, the hiring manager's manager gets a summary of all outstanding scorecards. All configurable per team using Zapier filters.",
      color: T.amber,
    },
    {
      num: "05",
      title: "The Impact",
      body: "Scorecard completion jumped from 64% to 95% within the first month. Recruiters reclaimed 3-4 hours a week previously spent on manual chasing. Average time from interview to decision dropped by 1.5 days.",
      color: T.purple,
    },
  ];
  const results = [
    { stat: "95%", label: "scorecard completion rate (up from 64%)" },
    { stat: "3-4 hrs", label: "saved per recruiter per week" },
    { stat: "1.5 days", label: "faster interview-to-decision time" },
  ];
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.bg, borderRadius: 10, maxWidth: 640, width: "100%",
        maxHeight: "85vh", overflowY: "auto", padding: isMobile ? "20px 16px" : "32px 28px",
        border: `1px solid ${T.cardBorder}`, boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>⚡</span>
              <span style={{ fontSize: 9, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", padding: "3px 8px", background: T.green + "12", color: T.green, borderRadius: 6, letterSpacing: "0.5px", textTransform: "uppercase", fontWeight: 600 }}>Automation</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>Feedback Chaser Automation</h2>
            <p style={{ fontSize: 12, color: T.textLight, marginTop: 4, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>Greenhouse + Slack Integration</p>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 10, border: `1px solid ${T.cardBorder}`,
            background: T.card, color: T.textLight, fontSize: 16, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>
        {/* Result stats */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
          {results.map((r, i) => (
            <div key={i} style={{ textAlign: "center", padding: "12px 8px", background: T.card, borderRadius: 10, border: `1px solid ${T.cardBorder}` }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: T.accent, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>{r.stat}</div>
              <div style={{ fontSize: 9, color: T.textLight, marginTop: 2, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", textTransform: "uppercase", letterSpacing: "0.3px", lineHeight: 1.3 }}>{r.label}</div>
            </div>
          ))}
        </div>
        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              padding: "16px 18px", background: T.card, border: `1px solid ${T.cardBorder}`,
              borderRadius: 10, borderLeft: `3px solid ${step.color}`,
              boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: step.color, fontWeight: 700 }}>{step.num}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{step.title}</span>
              </div>
              <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.65, margin: 0 }}>{step.body}</p>
            </div>
          ))}
        </div>
        {/* Skills */}
        <div style={{ marginTop: 16, padding: "12px 16px", background: T.tagBg, borderRadius: 10 }}>
          <div style={{ fontSize: 9, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: T.textFaint, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Skills used</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {["Zapier", "Greenhouse Harvest API", "Slack", "Custom Fields", "Escalation Logic", "Process Automation"].map(s => (
              <span key={s} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10, background: T.card, color: T.textMid, border: `1px solid ${T.cardBorder}` }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function RecOpsModal({ onClose, isMobile }) {
  const steps = [
    {
      num: "01",
      title: "The Problem",
      body: "Recruiters are closest to the process but rarely get asked what's broken. Pain points go unreported, workarounds become habits, and leadership makes decisions on metrics alone - missing the context behind the numbers.",
      color: T.red,
    },
    {
      num: "02",
      title: "The Survey",
      body: "Built a quarterly anonymous survey sent to every recruiter and coordinator. Covered the full hiring lifecycle: intake quality, interviewer reliability, offer approval speed, ATS friction, and hiring manager responsiveness. Simple 1-5 scoring with free-text follow-ups.",
      color: T.blue,
    },
    {
      num: "03",
      title: "The Analysis",
      body: "Aggregated scores by theme and tracked trends quarter-over-quarter. Highlighted the top 3 pain points each cycle and paired them with recruiter quotes to give leadership the full picture - not just a number, but the story behind it.",
      color: T.green,
    },
    {
      num: "04",
      title: "The Action",
      body: "Each quarter, picked the highest-impact issue and fixed it. One cycle it was intake quality - we rebuilt the kickoff template. Another it was interview no-shows - we added calendar holds and reminders. Small, targeted changes driven by the people doing the work.",
      color: T.amber,
    },
    {
      num: "05",
      title: "The Impact",
      body: "Recruiter satisfaction went from 3.1 to 4.4 within three cycles. Time-to-hire dropped as bottlenecks were systematically removed. The survey became the team's favourite feedback channel - they finally felt heard.",
      color: T.purple,
    },
  ];
  const results = [
    { stat: "3.1→4.4", label: "recruiter satisfaction score" },
    { stat: "12", label: "process improvements shipped" },
    { stat: "100%", label: "team participation rate" },
  ];
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.bg, borderRadius: 10, maxWidth: 640, width: "100%",
        maxHeight: "85vh", overflowY: "auto", padding: isMobile ? "20px 16px" : "32px 28px",
        border: `1px solid ${T.cardBorder}`, boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>📋</span>
              <span style={{ fontSize: 9, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", padding: "3px 8px", background: T.accent + "12", color: T.accent, borderRadius: 6, letterSpacing: "0.5px", textTransform: "uppercase", fontWeight: 600 }}>RecOps</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>Recruiter Process Survey</h2>
            <p style={{ fontSize: 12, color: T.textLight, marginTop: 4, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>Quarterly Feedback Loop</p>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 10, border: `1px solid ${T.cardBorder}`,
            background: T.card, color: T.textLight, fontSize: 16, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>
        {/* Result stats */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
          {results.map((r, i) => (
            <div key={i} style={{ textAlign: "center", padding: "12px 8px", background: T.card, borderRadius: 10, border: `1px solid ${T.cardBorder}` }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: T.accent, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>{r.stat}</div>
              <div style={{ fontSize: 9, color: T.textLight, marginTop: 2, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", textTransform: "uppercase", letterSpacing: "0.3px", lineHeight: 1.3 }}>{r.label}</div>
            </div>
          ))}
        </div>
        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              padding: "16px 18px", background: T.card, border: `1px solid ${T.cardBorder}`,
              borderRadius: 10, borderLeft: `3px solid ${step.color}`,
              boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: step.color, fontWeight: 700 }}>{step.num}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{step.title}</span>
              </div>
              <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.65, margin: 0 }}>{step.body}</p>
            </div>
          ))}
        </div>
        {/* Skills */}
        <div style={{ marginTop: 16, padding: "12px 16px", background: T.tagBg, borderRadius: 10 }}>
          <div style={{ fontSize: 9, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: T.textFaint, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Skills used</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {["RecOps", "Google Forms", "Data Analysis", "Stakeholder Management", "Process Design", "Change Management"].map(s => (
              <span key={s} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10, background: T.card, color: T.textMid, border: `1px solid ${T.cardBorder}` }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function ProspectModal({ onClose, isMobile }) {
  const steps = [
    {
      num: "01",
      title: "The Problem",
      body: "Every quarter, the same question: how many people do we need to hire, when, and how? Building a plan means pulling data from the ATS, finance, and hiring managers - then stitching it into a spreadsheet that's outdated the moment it's shared. Takes days, never quite right.",
      color: T.red,
    },
    {
      num: "02",
      title: "The Agent",
      body: "An AI agent that takes a headcount target, team structure, and budget - then generates a phased hiring plan. Calculates recruiter capacity, suggests sourcing mix (direct vs agency vs referral), sets realistic timelines per role type, and flags risks like competing offers or market scarcity.",
      color: T.blue,
    },
    {
      num: "03",
      title: "How It Works",
      body: "Feed it your inputs: target headcount, departments, seniority split, budget, and timeline. It models hiring velocity based on typical conversion rates (applications → screens → onsites → offers → hires), calculates recruiter capacity at each phase, and produces a week-by-week plan with milestones.",
      color: T.green,
    },
    {
      num: "04",
      title: "What It Returns",
      body: "A structured hiring plan broken down by department and quarter. Recruiter capacity model showing when to scale the team. Sourcing strategy per role type. Budget allocation across channels. Risk flags for hard-to-fill roles. Everything you'd spend a week building in a spreadsheet.",
      color: T.amber,
    },
    {
      num: "05",
      title: "The Impact",
      body: "What used to take 3-5 days now takes under 10 minutes. Plans are more consistent, more defensible in leadership meetings, and easier to update when priorities shift. It doesn't replace your judgement - it gives you a first draft worth editing instead of a blank sheet worth dreading.",
      color: T.accent,
    },
  ];
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.bg, borderRadius: 10, maxWidth: 640, width: "100%",
        maxHeight: "85vh", overflowY: "auto", padding: isMobile ? "20px 16px" : "32px 28px",
        border: `1px solid ${T.cardBorder}`, boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>📋</span>
              <span style={{ fontSize: 9, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", padding: "3px 8px", background: T.blue + "12", color: T.blue, borderRadius: 6, letterSpacing: "0.5px", textTransform: "uppercase", fontWeight: 600 }}>AI Agent</span>
              <span style={{ fontSize: 9, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", padding: "3px 8px", background: T.amber + "12", color: T.amber, borderRadius: 6, letterSpacing: "0.5px", textTransform: "uppercase", fontWeight: 600 }}>Coming Soon</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>Hiring Plan Agent</h2>
            <p style={{ fontSize: 12, color: T.textLight, marginTop: 4, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>From headcount target to phased plan in minutes</p>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 10, border: `1px solid ${T.cardBorder}`,
            background: T.card, color: T.textLight, fontSize: 16, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>
        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              padding: "16px 18px", background: T.card, border: `1px solid ${T.cardBorder}`,
              borderRadius: 10, borderLeft: `3px solid ${step.color}`,
              boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: step.color, fontWeight: 700 }}>{step.num}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{step.title}</span>
              </div>
              <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.65, margin: 0 }}>{step.body}</p>
            </div>
          ))}
        </div>
        {/* Skills */}
        <div style={{ marginTop: 16, padding: "12px 16px", background: T.tagBg, borderRadius: 10 }}>
          <div style={{ fontSize: 9, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: T.textFaint, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Tech stack</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {["Claude Code", "Claude API", "Node.js", "Vercel"].map(s => (
              <span key={s} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10, background: T.card, color: T.textMid, border: `1px solid ${T.cardBorder}` }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function BuildTile({ build, index, onModalOpen, isMobile }) {
  const isModal = build.modal;
  const Tag = isModal ? "div" : "a";
  const linkProps = isModal ? { onClick: () => onModalOpen && onModalOpen(build.modal) } : { href: build.url, target: "_blank", rel: "noopener noreferrer" };
  return (
    <Tag {...linkProps} style={{
      display: "flex", flexDirection: "column", textDecoration: "none", color: "inherit", cursor: "pointer",
      background: `linear-gradient(135deg, ${build.color}06 0%, ${T.card} 60%)`, border: `1px solid ${T.cardBorder}`,
      borderRadius: 10, padding: isMobile ? "18px 16px 16px" : "24px 24px 20px",
      position: "relative", overflow: "hidden", height: "100%",
      boxShadow: "0 1px 6px rgba(0,0,0,0.03)",
      transition: "box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease",
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 24px ${build.color}15`; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = build.color + "35"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.03)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = T.cardBorder; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: build.color + "10", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{build.icon}</div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: T.text, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>{build.title}</h3>
            <span style={{ fontSize: 9, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: build.color, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>{build.type}</span>
          </div>
      </div>
      <p style={{ fontSize: 13, color: T.textLight, lineHeight: 1.6, margin: "0 0 12px", flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{build.desc}</p>
      {build.tags && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14 }}>
          {build.tags.map(tag => (
            <span key={tag} style={{ padding: "3px 7px", borderRadius: 6, fontSize: 10, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", background: build.color + "10", color: build.color, border: `1px solid ${build.color}20`, letterSpacing: "0.2px" }}>{tag}</span>
          ))}
        </div>
      )}
    </Tag>
  );
}
function RecCard({ rec, index }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  return (
    <div ref={ref} style={{
      padding: "20px 22px", background: T.card, border: `1px solid ${T.cardBorder}`,
      borderRadius: 10, boxShadow: "0 1px 6px rgba(0,0,0,0.02)",
      transition: `all 0.5s ease ${index * 80}ms`,
      opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(14px)",
      position: "relative",
    }}>
      <div style={{ fontSize: 13, color: T.textMid, lineHeight: 1.7, marginBottom: 14, fontStyle: "italic", position: "relative", zIndex: 1 }}>"{rec.text}"</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Avatar circle */}
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${T.warm1}, ${T.accentLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: T.accent }}>{rec.name.split(" ").map(n => n[0]).join("")}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{rec.name}</div>
          <div style={{ fontSize: 11, color: T.textLight }}>{rec.role}</div>
        </div>
      </div>
      <div style={{ marginTop: 8 }}>
        <span style={{ fontSize: 10, color: T.textLight, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", padding: "3px 7px", background: T.tagBg, borderRadius: 6, border: `1px solid ${T.cardBorder}`, whiteSpace: "nowrap" }}>{rec.relation}</span>
      </div>
    </div>
  );
}
export default function RecruiterCV() {
  const isMobile = useIsMobile(640);
  const [tab, setTab] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [modal, setModal] = useState(null);
  const [containerH, setContainerH] = useState("auto");
  const [recIdx, setRecIdx] = useState(0);
  const [recSlide, setRecSlide] = useState("in"); // "in", "out-left", "out-right"
  const [recPaused, setRecPaused] = useState(false);
  const recTransitioning = useRef(false);
  const goToRec = (nextIdx, direction) => {
    if (recTransitioning.current) return;
    recTransitioning.current = true;
    setRecSlide(direction === "left" ? "out-left" : "out-right");
    setTimeout(() => {
      setRecIdx(nextIdx);
      setRecSlide(direction === "left" ? "enter-right" : "enter-left");
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setRecSlide("in");
        recTransitioning.current = false;
      }));
    }, 350);
  };
  useEffect(() => {
    if (recPaused) return;
    const id = setInterval(() => {
      if (recTransitioning.current) return;
      goToRec((recIdx + 1) % RECOMMENDATIONS.length, "right");
    }, 6000);
    return () => clearInterval(id);
  }, [recPaused, recIdx]);
  const panelRefs = [useRef(null), useRef(null), useRef(null)];
  useEffect(() => { setLoaded(true); }, []);
  useEffect(() => {
    const el = panelRefs[tab]?.current;
    if (el) {
      const update = () => setContainerH(el.scrollHeight);
      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, [tab]);
  return (
    <div style={{ background: "#E8E4DE", color: T.text, minHeight: "100vh", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", overflowX: "hidden", position: "relative", padding: isMobile ? "16px 8px" : "40px 24px" }}>

      {/* CV Paper Container */}
      <div style={{
        position: "relative", maxWidth: 960, margin: "0 auto",
        background: T.bg, borderRadius: 16,
        border: `1px solid ${T.cardBorder}`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        padding: isMobile ? "0 16px 24px" : "0 40px 40px",
        minHeight: 0,
      }}>
        {/* Subtle warm radial glow behind header */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${T.accentBg} 0%, transparent 70%)`, opacity: 0.4, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 200, left: -100, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${T.warm1}40 0%, transparent 70%)`, opacity: 0.3, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 2 }}>
        {/* HEADER */}
        <header style={{
          paddingTop: 0, paddingBottom: 0,
          opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.7s ease", position: "relative",
        }}>
          {/* Tabs - flush at top of card */}
          <div style={{ display: "flex", gap: 3, background: T.tagBg, borderRadius: "15px 15px 0 0", padding: 4, margin: isMobile ? "0 -16px" : "0 -40px", position: "relative" }}>
            {/* Sliding pill background */}
            <div style={{
              position: "absolute", top: 4, bottom: 4, borderRadius: 10,
              background: T.card, boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              width: `calc((100% - ${4 * 2 + (TABS.length - 1) * 3}px) / ${TABS.length})`,
              left: `calc(4px + ${tab} * (100% - ${2 * 4 - 3}px) / ${TABS.length})`,
              transition: "left 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)",
              zIndex: 0,
            }} />
            {TABS.map((t, i) => (
              <button key={t} onClick={() => { setTab(i); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              onMouseEnter={e => { if (tab !== i) { e.currentTarget.style.color = T.text; e.currentTarget.style.fontWeight = "700"; e.currentTarget.style.letterSpacing = "0.3px"; } }}
              onMouseLeave={e => { if (tab !== i) { e.currentTarget.style.color = T.textLight; e.currentTarget.style.fontWeight = "500"; e.currentTarget.style.letterSpacing = "0px"; } }}
              style={{
                flex: 1, padding: isMobile ? "9px 6px" : "10px 14px", borderRadius: 10, border: "none",
                background: "transparent",
                color: tab === i ? T.accent : T.textLight,
                fontSize: isMobile ? 12 : 13, fontWeight: tab === i ? 700 : 500,
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", cursor: "pointer",
                transition: "color 0.2s ease, font-weight 0.2s ease, letter-spacing 0.2s ease",
                position: "relative", zIndex: 1,
                letterSpacing: "0px",
              }}>{t}</button>
            ))}
          </div>
          {/* Name + Title + Icons */}
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: isMobile ? "center" : "space-between", alignItems: "center", marginTop: isMobile ? 16 : 20, marginBottom: 14, gap: isMobile ? 8 : 0 }}>
            <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, margin: 0, lineHeight: 1, letterSpacing: "-1px", color: T.text, flex: "0 0 auto" }}>Phil Role</h1>
            <p style={{ fontSize: isMobile ? 16 : 24, fontWeight: 800, margin: 0, lineHeight: 1, letterSpacing: "-1px", color: T.accent, textAlign: "center", flex: isMobile ? "0 0 auto" : "1 1 auto" }}>Head of Talent Acquisition</p>
            <div style={{ display: "flex", gap: 8, flex: "0 0 auto" }}>
            {[
              { href: "https://www.linkedin.com/in/jamiejaylyons/", label: "LinkedIn", svg: <svg width="16" height="16" viewBox="0 0 24 24" fill={T.text}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
              { href: "mailto:jamie@firststage.co", label: "Email", svg: <svg width="16" height="16" viewBox="0 0 24 24" fill={T.text}><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg> },
              { href: "tel:+447700000000", label: "Phone", svg: <svg width="16" height="16" viewBox="0 0 24 24" fill={T.text}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg> },
              { href: "https://calendly.com", label: "Book a meeting", svg: <svg width="16" height="16" viewBox="0 0 24 24" fill={T.text}><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/></svg> },
            ].map(item => (
              <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined} aria-label={item.label} style={{
                width: 32, height: 32, borderRadius: 10,
                background: T.card, border: `1px solid ${T.cardBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                textDecoration: "none", transition: "all 0.2s ease",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.boxShadow = "0 2px 8px rgba(196,112,75,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.cardBorder; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}
              >{item.svg}</a>
            ))}
            </div>
          </div>
        </header>
        {/* ===== TAB CONTENT SLIDER ===== */}
        <div style={{ overflow: "hidden", height: containerH !== "auto" ? containerH : "auto", transition: "height 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)" }}>
          <div style={{
            display: "flex", width: "300%", alignItems: "flex-start",
            transform: `translateX(-${tab * (100 / 3)}%)`,
            transition: "transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)",
          }}>

        {/* ===== Tab 0: MY CAREER ===== */}
        <div ref={panelRefs[0]} style={{ width: `${100 / 3}%`, flexShrink: 0, padding: 0 }}>
            <p style={{ fontSize: 12, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: T.accent + "CC", letterSpacing: "0.3px", margin: "0 0 10px 2px", fontWeight: 700 }}>Work summary</p>
            <p style={{ fontSize: 14, color: T.textMid, lineHeight: 1.75, margin: "0 0 8px" }}>
              8 years in recruitment. Started in high-volume agency, moved into embedded RPO across VC-backed startups,
              then went in-house at a £4.5bn fintech hiring 95 engineers with zero agency spend. Now at an early-stage
              AI recruitment start-up as the first non-technical hire, shaping the product and go-to-market as a practitioner-turned-operator. Promoted at every company.
            </p>
            <p style={{ fontSize: 14, color: T.textMid, lineHeight: 1.75, margin: "0 0 8px" }}>
              Looking for my next role as first or early TA hire at a Series A/B company. Own the hiring plan, shape how the team scales.
            </p>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 8, marginBottom: 22 }}>
              {STATS.map((s, i) => (
                <div key={s.label} className="stat-hover" style={{
                  textAlign: "center", padding: "14px 6px 12px",
                  background: T.card, borderRadius: 10,
                  border: `1px solid ${T.cardBorder}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  transition: `all 0.3s ease, opacity 0.5s ease ${i * 100}ms, transform 0.5s ease ${i * 100}ms`,
                  opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(12px)",
                  cursor: "default",
                }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: T.accent, letterSpacing: "-0.5px", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                    {s.isText ? <SeriesAnim value={s.value} delay={i * 100} /> : <AnimNum {...s} delay={i * 100} />}
                  </div>
                  <div style={{ fontSize: 9, color: T.textLight, marginTop: 3, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", textTransform: "uppercase", letterSpacing: "0.3px" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: T.accent + "CC", letterSpacing: "0.3px", margin: "0 0 10px 2px", fontWeight: 700 }}>Work experience</p>
            {ROLES.map((role, i) => <RoleCard key={i} role={role} index={i} isLast={i === ROLES.length - 1} isMobile={isMobile} />)}
            {/* Education */}
            <div style={{ marginTop: 22, marginBottom: 24 }}>
              <p style={{ fontSize: 12, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: T.accent + "CC", letterSpacing: "0.3px", margin: "0 0 10px 2px", fontWeight: 700 }}>Education</p>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 10 }}>
                <div style={{ padding: "14px 16px", background: T.card, borderRadius: 10, border: `1px solid ${T.cardBorder}`, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                  <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>BA (Hons) Business Management</div>
                  <div style={{ fontSize: 11, color: T.textLight, marginTop: 4 }}>University of Leeds · 2:1</div>
                </div>
                <div style={{ padding: "14px 16px", background: T.card, borderRadius: 10, border: `1px solid ${T.cardBorder}`, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                  <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>First Certified</div>
                  <div style={{ fontSize: 11, color: T.textLight, marginTop: 4 }}>CV Sifting Process Enhancement</div>
                </div>
                <div style={{ padding: "14px 16px", background: T.card, borderRadius: 10, border: `1px solid ${T.cardBorder}`, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                  <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>LinkedIn Certified</div>
                  <div style={{ fontSize: 11, color: T.textLight, marginTop: 4 }}>Recruiter Certification</div>
                </div>
              </div>
            </div>
            {/* Recommendations */}
            <div style={{ marginTop: 22 }}>
              <p style={{ fontSize: 12, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: T.accent + "CC", letterSpacing: "0.3px", margin: "0 0 16px 2px", fontWeight: 700 }}>What people say about my work</p>
              <div>
                {/* Recommendation card */}
                <div onMouseEnter={() => setRecPaused(true)} onMouseLeave={() => setRecPaused(false)} style={{ padding: isMobile ? "20px 18px 16px" : "32px 36px 24px", background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 10, boxShadow: "0 1px 6px rgba(0,0,0,0.02)", position: "relative", overflow: "hidden" }}>
                  {/* Big decorative quote mark */}
                  <div style={{ position: "absolute", top: 10, right: 20, fontSize: 64, color: T.accent + "12", fontFamily: "Georgia, serif", lineHeight: 1, pointerEvents: "none" }}>{"\u201C"}</div>
                  <div style={{
                    opacity: recSlide === "in" ? 1 : 0,
                    transform: recSlide === "in" ? "translateX(0)" : recSlide === "out-left" ? "translateX(-40px)" : recSlide === "out-right" ? "translateX(40px)" : recSlide === "enter-right" ? "translateX(40px)" : "translateX(-40px)",
                    transition: recSlide === "in" || recSlide.startsWith("out") ? "opacity 0.35s ease, transform 0.35s ease" : "none",
                    minHeight: 60,
                  }}>
                  <div style={{ fontSize: 13, color: T.textMid, lineHeight: 1.7, marginBottom: 0, fontStyle: "italic" }}>"{RECOMMENDATIONS[recIdx].text}"</div>
                  </div>{/* end slide wrapper */}
                  {/* Name, dots, relationship row */}
                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: isMobile ? 8 : 0 }}>
                      <div style={{
                        opacity: recSlide === "in" ? 1 : 0,
                        transform: recSlide === "in" ? "translateX(0)" : recSlide === "out-left" ? "translateX(-40px)" : recSlide === "out-right" ? "translateX(40px)" : recSlide === "enter-right" ? "translateX(40px)" : "translateX(-40px)",
                        transition: recSlide === "in" || recSlide.startsWith("out") ? "opacity 0.35s ease, transform 0.35s ease" : "none",
                        display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: isMobile ? undefined : 1,
                      }}>
                        <div style={{ width: 32, height: 32, flexShrink: 0, borderRadius: "50%", background: `linear-gradient(135deg, ${T.warm1}, ${T.accentLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: T.accent }}>{RECOMMENDATIONS[recIdx].name.split(" ").map(n => n[0]).join("")}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, whiteSpace: "nowrap" }}>{RECOMMENDATIONS[recIdx].name}</div>
                          <div style={{ fontSize: 11, color: T.textLight, whiteSpace: "nowrap" }}>{RECOMMENDATIONS[recIdx].role}</div>
                        </div>
                      </div>
                      {isMobile && <div style={{
                        opacity: recSlide === "in" ? 1 : 0,
                        transition: recSlide === "in" || recSlide.startsWith("out") ? "opacity 0.35s ease" : "none",
                        marginLeft: 42,
                      }}>
                        <span style={{ fontSize: 10, color: T.textLight, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", padding: "3px 7px", background: T.tagBg, borderRadius: 6, border: `1px solid ${T.cardBorder}`, whiteSpace: "nowrap" }}>{RECOMMENDATIONS[recIdx].relation}</span>
                      </div>}
                      {!isMobile && <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        {RECOMMENDATIONS.map((_, i) => (
                          <div key={i} onClick={() => { if (i !== recIdx) goToRec(i, i > recIdx ? "right" : "left"); }} style={{ width: 6, height: 6, borderRadius: "50%", background: i === recIdx && recSlide === "in" ? T.accent : T.cardBorder, cursor: "pointer", transition: "background 0.35s ease" }} />
                        ))}
                      </div>}
                      {!isMobile && <div style={{
                        opacity: recSlide === "in" ? 1 : 0,
                        transform: recSlide === "in" ? "translateX(0)" : recSlide === "out-left" ? "translateX(-40px)" : recSlide === "out-right" ? "translateX(40px)" : recSlide === "enter-right" ? "translateX(40px)" : "translateX(-40px)",
                        transition: recSlide === "in" || recSlide.startsWith("out") ? "opacity 0.35s ease, transform 0.35s ease" : "none",
                        flex: 1, display: "flex", justifyContent: "flex-end", minWidth: 0, overflow: "hidden",
                      }}>
                        <span style={{ fontSize: 10, color: T.textLight, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", padding: "3px 7px", background: T.tagBg, borderRadius: 6, border: `1px solid ${T.cardBorder}`, whiteSpace: "nowrap" }}>{RECOMMENDATIONS[recIdx].relation}</span>
                      </div>}
                    </div>
                    {isMobile && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 10 }}>
                      {RECOMMENDATIONS.map((_, i) => (
                        <div key={i} onClick={() => { if (i !== recIdx) goToRec(i, i > recIdx ? "right" : "left"); }} style={{ width: 6, height: 6, borderRadius: "50%", background: i === recIdx && recSlide === "in" ? T.accent : T.cardBorder, cursor: "pointer", transition: "background 0.35s ease" }} />
                      ))}
                    </div>}
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* ===== Tab 1: MY PROJECTS ===== */}
        <div ref={panelRefs[1]} style={{ width: `${100 / 3}%`, flexShrink: 0, padding: 0, display: "flex", flexDirection: "column", gap: 28 }}>
            {["Agents & Builds", "Automation & Process Improvement", "Content & Community"].map(cat => {
              const tiles = BUILD_TILES.filter(b => b.category === cat);
              if (!tiles.length) return null;
              return (
                <div key={cat}>
                  <p style={{ fontSize: 12, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: T.accent + "CC", letterSpacing: "0.3px", margin: "0 0 10px 2px", fontWeight: 700 }}>{cat}</p>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: isMobile ? 10 : 14 }}>
                    {tiles.map((build, i) => <BuildTile key={i} build={build} index={i} onModalOpen={setModal} isMobile={isMobile} />)}
                  </div>
                </div>
              );
            })}
        </div>

        {/* ===== Tab 2: MY PERSONAL LIFE ===== */}
        <div ref={panelRefs[2]} style={{ width: `${100 / 3}%`, flexShrink: 0, padding: 0, display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <p style={{ fontSize: 12, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: T.accent + "CC", letterSpacing: "0.3px", margin: "0 0 10px 2px", fontWeight: 700 }}>A bit about me</p>
              <p style={{ fontSize: 14, color: T.textMid, lineHeight: 1.65, marginBottom: 16 }}>(Ideal spot for an intro video, but I'm going to be cheeky and slip in a video breaking down how we're helping teams manage application volume with First! :D)</p>
              <div style={{
                width: isMobile ? "100%" : "80%", aspectRatio: "16/9", borderRadius: 10, margin: "0 auto",
                overflow: "hidden", border: `1px solid ${T.cardBorder}`,
                marginBottom: 8,
              }}>
                <iframe
                  src="https://www.youtube.com/embed/rkenwB12R-o"
                  style={{ width: "100%", height: "100%", border: "none" }}
                  title="6-Min Demo of First"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>
            <div>
              <p style={{ fontSize: 12, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: T.accent + "CC", letterSpacing: "0.3px", margin: "0 0 10px 2px", fontWeight: 700 }}>When I'm not recruiting</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
                {[
                  { emoji: "\u26BD", label: "Football", text: "Lifelong Crystal Palace fan. Yes, I know. No, I can't explain it either. Season ticket holder. The highs are rare but they're worth it." },
                  { emoji: "\uD83C\uDFC3", label: "Running", text: "5k most mornings around Brockwell Park. Slow but consistent. It's the best way to start the day and I'm genuinely unbearable without it.", hideOnMobile: true },
                  { emoji: "\uD83C\uDF73", label: "Cooking", text: "I make everything from scratch. Current obsession is getting the perfect crispy chilli oil. My mates say I should start a food account. I won't." },
                  { emoji: "\uD83D\uDC36", label: "Mabel", text: "One-year-old cockapoo. Joins me on my 5k runs. She's the real influencer in the house." },
                  { emoji: "\uD83D\uDCDA", label: "Reading", text: "Mostly non-fiction. Thinking Fast and Slow changed how I interview. Currently enjoying Robot-Proof Recruiter, highly recommend." },
                  { emoji: "\u2708\uFE0F", label: "Travel", text: "Spent 3 months in Southeast Asia between jobs. Best decision I ever made. Worst sunburn I ever got. Both in Thailand.", hideOnMobile: true },
                ].filter(item => !isMobile || !item.hideOnMobile).map((item, i) => (
                  <div key={i} style={{
                    padding: isMobile ? "14px 14px" : "16px 18px", background: T.card, border: `1px solid ${T.cardBorder}`,
                    borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 18 }}>{item.emoji}</span>
                      <span style={{ fontSize: 10, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: T.accent, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>{item.label}</span>
                    </div>
                    <div style={{ fontSize: 13, color: T.textMid, lineHeight: 1.65 }}>{item.text}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 12, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: T.accent + "CC", letterSpacing: "0.3px", margin: "0 0 10px 2px", fontWeight: 700 }}>My operating system</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
                {[
                  { emoji: "\uD83D\uDCAC", label: "Honesty over polish", text: "I'd rather someone tell me I'm wrong than agree with me to be polite. Directness builds trust faster than anything." },
                  { emoji: "\uD83D\uDCAA", label: "Doing the work", text: "I'll always be the person who actually followed up. Consistency and reliability compound over time." },
                  { emoji: "\uD83C\uDF1F", label: "Generosity", text: "I share what I know, help where I can, and trust that it comes back around. Karma compounds." },
                ].map((t, i) => (
                  <div key={i} style={{
                    padding: isMobile ? "14px 14px" : "16px 18px", background: T.card,
                    border: `1px solid ${T.cardBorder}`,
                    borderRadius: 10,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>{t.emoji}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{t.label}</span>
                    </div>
                    <div style={{ fontSize: 13, color: T.textMid, lineHeight: 1.65 }}>{t.text}</div>
                  </div>
                ))}
              </div>
            </div>
        </div>

          </div>{/* end flex track */}
        </div>{/* end overflow hidden */}
        {/* Sheets Modal */}
        {modal === "sheets" && <SheetsModal onClose={() => setModal(null)} isMobile={isMobile} />}
        {modal === "prospect" && <ProspectModal onClose={() => setModal(null)} isMobile={isMobile} />}
        {modal === "recops" && <RecOpsModal onClose={() => setModal(null)} isMobile={isMobile} />}
        </div>
      </div>
      {/* FOOTER - outside card, on raw background */}
      <footer style={{ padding: isMobile ? "28px 16px 36px" : "40px 0 48px", textAlign: "center", maxWidth: 960, margin: "0 auto" }}>
        <p style={{ fontSize: isMobile ? 15 : 18, fontWeight: 400, color: T.text, marginBottom: 24, letterSpacing: "-0.3px" }}>
          Built by a recruiter, for recruiters, because we deserve better than a Word doc.
        </p>
        <div style={{ display: "inline-flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="https://calendly.com/" target="_blank" rel="noopener noreferrer" style={{
            padding: isMobile ? "13px 32px" : "11px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: T.accent, color: "#fff", textDecoration: "none",
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", transition: "all 0.25s ease",
            boxShadow: "0 2px 8px rgba(196,112,75,0.2)",
          }}
          onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 6px 20px rgba(196,112,75,0.3)"; }}
          onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 2px 8px rgba(196,112,75,0.2)"; }}
          >Book a time to talk</a>
        </div>
        <p style={{ fontSize: 11, color: T.textFaint, marginTop: 20, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>A template built by <a href="https://www.linkedin.com/in/jamiejaylyons/" target="_blank" rel="noopener noreferrer" style={{ color: T.textFaint, textDecoration: 'underline' }}>Jamie Lyons</a></p>
      </footer>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .stat-hover:hover { transform: translateY(-5px) !important; box-shadow: 0 10px 24px rgba(196,112,75,0.2) !important; border-color: rgba(196,112,75,0.4) !important; background: linear-gradient(135deg, #FFFAF6, #FFF5EE) !important; }
        * { box-sizing: border-box; margin: 0; }
        html { scroll-behavior: smooth; }
        body { background: #E8E4DE; }
        ::selection { background: ${T.accentBg}; color: ${T.accent}; }
        button:hover { opacity: 0.92; }
      `}</style>
    </div>
  );
}
