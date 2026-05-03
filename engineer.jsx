// NexaPoint — Engineering Provisioning System
// Where engineers receive, deploy and sign off on approved proposals.

const { useState, useEffect } = React;

// ─── Utilities ────────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return String(d); }
};

const fmtMoney = (v, cur = "GBP") =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(v || 0);

const pct = (tasks) => {
  if (!tasks?.length) return 0;
  return Math.round(tasks.filter(t => t.status === "done").length / tasks.length * 100);
};

const catStats = (tasks, catId) => {
  const ct = tasks.filter(t => t.category === catId);
  if (!ct.length) return null;
  return {
    total:   ct.length,
    done:    ct.filter(t => t.status === "done").length,
    blocked: ct.filter(t => t.status === "blocked").length,
    allDone: ct.every(t => t.status === "done"),
  };
};

// ─── Static constants ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "pre-deploy",    label: "Pre-Deployment",         icon: "📋" },
  { id: "hardware",      label: "Hardware Provisioning",  icon: "🖥️" },
  { id: "software",      label: "Software Deployment",    icon: "⚙️"  },
  { id: "connectivity",  label: "Network & Connectivity", icon: "📡" },
  { id: "config",        label: "Configuration",          icon: "🔧" },
  { id: "testing",       label: "Testing & QA",           icon: "🧪" },
  { id: "handover",      label: "Client Handover",        icon: "🤝" },
];

const TEAM_MEMBERS = [
  { id: "t1", name: "Sarah Chen",    role: "Lead Impl. Engineer",     avatar: "SC", color: "#0b2f6b" },
  { id: "t2", name: "Mark O'Brien",  role: "Solutions Architect",     avatar: "MO", color: "#16478f" },
  { id: "t3", name: "Priya Patel",   role: "ERP Consultant",          avatar: "PP", color: "#b8935a" },
  { id: "t4", name: "James Wilson",  role: "Data Migration Spec.",    avatar: "JW", color: "#1b6b4a" },
  { id: "t5", name: "Emma Clarke",   role: "Training Lead",           avatar: "EC", color: "#8b6a3a" },
  { id: "t6", name: "Raj Kumar",     role: "DevOps & Infrastructure", avatar: "RK", color: "#a3331f" },
  { id: "t7", name: "Lisa Thompson", role: "Project Manager",         avatar: "LT", color: "#5b6b86" },
];

// Demo jobs (mirrors ops-portal proposals for engineers)
const DEMO_JOBS = [
  {
    id: "NP-2026-48283", date: "2026-04-18T10:15:00Z",
    client: { company: "Riverside Logistics PLC", contact: "Marcus Webb", role: "Operations Director", email: "m.webb@riverside-logistics.com", city: "Bristol", country: "United Kingdom" },
    deployment: "cloud",
    items: [{ name: "Field Operations Bundle", device: "iPhone 15 Pro × 20, Android Pro × 10", software: ["Inventory & Logistics", "CRM & Sales"], sim: "4G Business × 30" }],
    totals: { oneTime: 18500, monthly: 1200, impl: 2700, year1: 35600 },
    status: "scheduled",
    schedule: { start: "2026-05-12", goLive: "2026-06-23", notes: "Remote install + 2 on-site days in Bristol" },
    team: ["t1", "t3", "t5"],
  },
  {
    id: "NP-2026-48280", date: "2026-04-14T09:00:00Z",
    client: { company: "Baker & Kohl LLP", contact: "Victoria Stern", role: "Managing Partner", email: "v.stern@bakerkohl.co.uk", city: "London", country: "United Kingdom" },
    deployment: "cloud",
    items: [{ name: "Legal Practice Bundle", device: "MacBook Pro M4 × 6", software: ["Finance Suite", "Document Management", "CRM & Sales"], sim: null }],
    totals: { oneTime: 10500, monthly: 960, impl: 2700, year1: 24720 },
    status: "in-progress",
    schedule: { start: "2026-04-20", goLive: "2026-05-30", notes: "Hybrid remote/on-site" },
    team: ["t3", "t4", "t7"],
  },
  {
    id: "NP-2026-48285", date: "2026-04-21T11:00:00Z",
    client: { company: "Harrow Medical Group", contact: "Dr. Emily Patel", role: "IT Director", email: "e.patel@harrowmed.co.uk", city: "Harrow", country: "United Kingdom" },
    deployment: "onprem",
    items: [{ name: "Medical Enterprise Bundle", device: "MacBook Pro M4 × 12, iPhone 15 Pro × 12", software: ["Clinical Records", "Finance Suite", "HR & Payroll", "CRM & Sales"], sim: "5G Pro × 12" }],
    totals: { oneTime: 52000, monthly: 3600, impl: 7800, year1: 103000 },
    status: "approved",
    schedule: null,
    team: ["t2", "t4", "t6"],
  },
  {
    id: "NP-2026-48291", date: "2026-04-25T09:14:00Z",
    client: { company: "Meridian Healthcare Group", contact: "Dr. Sarah Mitchell", role: "Chief Digital Officer", email: "s.mitchell@meridian.nhs.uk", city: "London", country: "United Kingdom" },
    deployment: "cloud",
    items: [{ name: "Healthcare Operations Bundle", device: "MacBook Pro M4 × 8", software: ["Clinical Records", "HR & Payroll", "Finance Suite"], sim: "5G Pro × 8" }],
    totals: { oneTime: 28000, monthly: 2400, impl: 4500, year1: 61300 },
    status: "approved",
    schedule: null,
    team: ["t1", "t3"],
  },
];

// ─── Task Generation ──────────────────────────────────────────────────────────
function buildTasks(job) {
  const saved = localStorage.getItem(`np_tasks_${job.id}`);
  if (saved) { try { return JSON.parse(saved); } catch { /* rebuild below */ } }

  const tasks = [];
  let seq = 0;
  const mk = (category, title, desc, priority = "normal") => ({
    id: `${category}-${++seq}`, category, title, desc, priority,
    status: "pending", notes: "", completedAt: null,
  });

  const co  = job.client?.company   || "the client";
  const con = job.client?.contact   || "client";
  const dep = job.deployment        || "cloud";
  const allDevices  = (job.items || []).map(i => i.device).filter(Boolean).filter(d => d !== "—").join(", ");
  const allSoftware = [...new Set((job.items || []).flatMap(i => i.software || []))];
  const allSims     = (job.items || []).map(i => i.sim).filter(Boolean).join(", ");

  // Pre-deployment (always)
  tasks.push(
    mk("pre-deploy", "Review signed proposal & scope of work",
       "Read the signed proposal thoroughly. Note any special client requirements, data migration complexity, and integration dependencies."),
    mk("pre-deploy", `Confirm on-site contact & access — ${co}`,
       `Primary contact: ${con} (${job.client?.email || "—"}). Confirm site access, parking, Wi-Fi credentials, and server room access if required.`),
    mk("pre-deploy", "Hardware inventory audit",
       `Cross-reference all received hardware against the order: ${allDevices || "as per proposal"}. Record serial numbers; flag shortages to Ops.`, "high"),
    mk("pre-deploy", "Create project workspace",
       `Open Jira ticket for ${job.id}. Create project folder in DMS. Set up dedicated Slack channel. Share kick-off agenda with ${con}.`),
  );
  if (dep === "cloud") {
    tasks.push(mk("pre-deploy", "Configure secure remote access",
      "Generate VPN credentials for client environment. Test connectivity. Document access details in password vault."));
  } else {
    tasks.push(mk("pre-deploy", "On-premise server readiness check",
      "Audit server specs against minimum requirements for on-prem deployment. Confirm OS version, storage, and network config.", "high"));
  }

  // Hardware (if devices present)
  if (allDevices) {
    tasks.push(
      mk("hardware", "Unbox devices & log serial numbers",
         `Unbox: ${allDevices}. Record every serial number in the asset register. Photograph packaging for any damage claims.`, "high"),
      mk("hardware", "Apply firmware & OS updates",
         "Update all devices to the latest approved OS version before any configuration begins. Do not skip — ensures security baseline."),
      mk("hardware", "Enrol in MDM (Mobile Device Management)",
         "Enrol every device in the NexaPoint MDM platform. Apply baseline policy: encryption, screensaver lock, app catalogue."),
      mk("hardware", "Push NexaPoint base configuration profile",
         "Deploy base config profile: NexaPoint app, VPN profile, Wi-Fi settings, DNS over HTTPS, and corporate wallpaper."),
      mk("hardware", "Run hardware diagnostics & burn-in test",
         "Execute full hardware diagnostic on each device. Document results. Quarantine any failing unit for warranty replacement."),
    );
  }

  // Software (one install + one configure task per module)
  allSoftware.forEach(sw => {
    tasks.push(
      mk("software", `Install & license — ${sw}`,
         `Install ${sw} module on all applicable devices/servers. Apply client license key. Confirm activation status in NexaPoint admin portal.`, "high"),
      mk("software", `Configure ${sw} for ${co}`,
         `Configure data structures, workflows, and settings for ${sw} specific to ${co}'s requirements as per proposal.`),
    );
  });
  if (allSoftware.length > 0) {
    tasks.push(
      mk("software", "Data migration & historical import",
         `Import historical records, chart of accounts, and opening balances into NexaPoint. Validate record counts against source system.`, "high"),
      mk("software", "Third-party integrations & API setup",
         "Configure any scoped integrations (accounting, HR, CRM, etc.). Test each API connection. Document credentials in vault."),
    );
  }

  // Connectivity / SIMs
  if (allSims) {
    tasks.push(
      mk("connectivity", "Activate SIM cards",
         `Activate all SIMs: ${allSims}. Confirm activation status in NexaPoint MVNO portal for each ICCID.`, "high"),
      mk("connectivity", "Configure APN & network settings",
         "Set correct APN, roaming policy, and data caps on each activated SIM via MDM profile push."),
      mk("connectivity", "Test mobile data on all devices",
         "Verify data connectivity on every SIM-enabled device. Run speed test and record results. Flag any connectivity failures."),
      mk("connectivity", "Apply mobile security profiles",
         "Push VPN-enforced security profile to all SIM devices. Verify split-tunnelling and MAM policies are active."),
    );
  }

  // Configuration
  tasks.push(
    mk("config", `Create user accounts — ${co}`,
       `Set up all user accounts per the agreed user list from ${con}. Apply correct roles: Super Admin, Manager, Standard User, Read-Only.`),
    mk("config", "Configure role-based permissions & approval matrix",
       "Implement the agreed permission matrix. Test each role by logging in as a test user. Document final permissions map."),
    mk("config", "Apply client branding & regional preferences",
       "Upload company logo, set primary colour palette. Configure locale: currency, date format, tax codes, and language."),
    mk("config", "Set up automated workflows & notification rules",
       "Build approval workflows, escalation rules, and automated notifications as specified in the scope of work."),
    mk("config", "Verify backup schedule & data retention policy",
       "Confirm nightly automated backups are running. Validate retention policy (90-day default). Run a test restore.", "high"),
  );

  // Testing
  tasks.push(
    mk("testing", "End-to-end functional test — all modules",
       "Execute the full functional test plan across every installed module. Log pass/fail per test case in the test register.", "high"),
    mk("testing", `User acceptance testing (UAT) with ${con}`,
       `Walk ${con} through all key business scenarios. Obtain signed UAT sign-off sheet before proceeding to go-live.`, "high"),
    mk("testing", "Performance & load test",
       "Simulate expected concurrent user load. Confirm all response times are within agreed SLAs. Document results."),
    mk("testing", "Security configuration audit",
       "Verify: MFA enforced for all users, data encrypted at rest & in transit, audit logging active, no default/shared passwords remain."),
    mk("testing", "Disaster recovery drill",
       "Restore backup to test environment. Verify data integrity. Document achieved RTO and RPO. Share results with Ops."),
  );

  // Handover
  tasks.push(
    mk("handover", "Deliver key-user training",
       `Train ${co} key users (admins & power users) per the agreed training plan. Record session for future onboarding.`, "high"),
    mk("handover", "Deliver end-user training sessions",
       "Run group training sessions for standard end users. Provide user quick-start guide. Log attendees."),
    mk("handover", "Hand over documentation package",
       "Deliver: System User Guide, Admin Guide, Data Dictionary, Integration Runbook, Emergency Contacts, and Support SLA."),
    mk("handover", "Execute go-live cutover",
       `Switch ${co} to NexaPoint production. Freeze legacy system writes. Confirm all users successfully logged in.`, "high"),
    mk("handover", "Hypercare support — first 5 business days",
       "Provide dedicated hypercare: 2-hour response SLA on all issues. Daily check-in call with primary contact."),
    mk("handover", "Project close-out & support handover",
       `Complete project closure report. Hand over to support team. Obtain client satisfaction score from ${con}. Archive all project assets.`, "high"),
  );

  return tasks;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const I = {
  Check:    ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Back:     ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Arrow:    ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Flag:     ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  X:        ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Logout:   ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Play:     ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Clock:    ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Wrench:   ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  ChevronR: ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Star:     ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Send:     ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Inbox:    ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
};

// ─── Task badge ───────────────────────────────────────────────────────────────
const TaskBadge = ({ status }) => {
  const m = {
    pending:      { label: "Pending",      color: "#5b6b86", bg: "rgba(91,107,134,.08)" },
    "in-progress":{ label: "In Progress",  color: "#16478f", bg: "rgba(22,71,143,.10)" },
    done:         { label: "Done",         color: "#1b6b4a", bg: "rgba(27,107,74,.10)" },
    blocked:      { label: "Blocked",      color: "#a3331f", bg: "rgba(163,51,31,.10)" },
  }[status] || { label: status, color: "var(--muted)", bg: "var(--bg-alt)" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: ".06em", color: m.color, background: m.bg, whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.color }}/>
      {m.label}
    </span>
  );
};

// ─── Job status badge ─────────────────────────────────────────────────────────
const JobBadge = ({ status }) => {
  const m = {
    approved:     { label: "Ready to Start", color: "#16478f", bg: "rgba(22,71,143,.10)" },
    scheduled:    { label: "Scheduled",      color: "#0b2f6b", bg: "rgba(11,47,107,.10)" },
    "in-progress":{ label: "In Progress",    color: "#8b6a3a", bg: "rgba(139,106,58,.12)" },
    completed:    { label: "Completed",      color: "#1b6b4a", bg: "rgba(27,107,74,.10)" },
  }[status] || { label: status, color: "var(--muted)", bg: "var(--bg-alt)" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: ".04em", color: m.color, background: m.bg, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color }}/>
      {m.label}
    </span>
  );
};

// ─── Engineer Nav ─────────────────────────────────────────────────────────────
const EngineerNav = ({ user }) => (
  <div className="eng-nav">
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 28, flexShrink: 0 }}>
      <div style={{ width: 26, height: 26, borderRadius: 6, position: "relative", background: "linear-gradient(135deg,#1a6b3a,#2d9c5a)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.15)" }}>
        <div style={{ position: "absolute", inset: 6, borderRadius: 3, background: "#7dce9a", transform: "rotate(45deg)" }}/>
      </div>
      <span style={{ fontFamily: "var(--serif)", fontSize: 17, color: "#e8f5ee", letterSpacing: "-.01em" }}>NexaPoint</span>
      <span style={{ fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(255,255,255,.35)", fontWeight: 600, marginLeft: 2 }}>Engineering</span>
    </div>

    <div className="eng-nav-item" style={{ pointerEvents: "none", color: "#7dce9a", gap: 6 }}>
      <I.Wrench s={13}/> Provisioning System
    </div>

    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
      <a href="index.html" style={{ fontSize: 12, color: "rgba(255,255,255,.35)", textDecoration: "none", padding: "6px 12px", borderRadius: 999, border: "1px solid rgba(255,255,255,.1)", transition: "color .15s" }}
        onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,.7)"}
        onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.35)"}
      >← Prototype</a>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#1a6b3a", color: "#7dce9a", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11, flexShrink: 0, border: "1px solid rgba(125,206,154,.3)" }}>
          {(user?.name || "ENG").split(" ").map(w => w[0]).join("").slice(0, 2)}
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#e8f5ee", fontWeight: 500, lineHeight: 1.2 }}>{user?.name || "Engineer"}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>{user?.role || "Implementation Engineer"}</div>
        </div>
      </div>
      <button onClick={() => { sessionStorage.removeItem("np_portal_auth"); window.location.href = "index.html"; }}
        title="Logout"
        style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(255,255,255,.12)", background: "transparent", display: "grid", placeItems: "center", cursor: "pointer", color: "rgba(255,255,255,.35)", transition: "all .15s" }}
        onMouseEnter={e => { e.currentTarget.style.color = "#e8f5ee"; e.currentTarget.style.borderColor = "rgba(255,255,255,.4)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,.35)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.12)"; }}
      ><I.Logout s={14}/></button>
    </div>
  </div>
);

// ─── Job Card ─────────────────────────────────────────────────────────────────
const JobCard = ({ job, tasks, onClick }) => {
  const progress = pct(tasks);
  const blocked  = tasks.filter(t => t.status === "blocked").length;
  const team = (job.team || []).map(id => TEAM_MEMBERS.find(t => t.id === id)).filter(Boolean);

  return (
    <div className="job-card eng-enter" onClick={onClick} style={{ borderTop: `3px solid ${job.status === "in-progress" ? "#8b6a3a" : job.status === "approved" ? "#16478f" : "#0b2f6b"}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12, gap: 8 }}>
        <div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 18 }}>{job.client.company}</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{job.id}</div>
        </div>
        <JobBadge status={job.status}/>
      </div>

      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12, lineHeight: 1.5 }}>
        {(job.items || []).map(i => [i.device, ...(i.software || []), i.sim].filter(Boolean).join(" · ")).join(" | ")}
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginBottom: 5 }}>
          <span>{tasks.filter(t => t.status === "done").length}/{tasks.length} tasks complete</span>
          <span style={{ fontWeight: 600, color: progress === 100 ? "#1b6b4a" : "var(--ink)" }}>{progress}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%`, background: progress === 100 ? "#1b6b4a" : blocked > 0 ? "#a3331f" : "#16478f" }}/>
        </div>
      </div>

      {blocked > 0 && (
        <div style={{ fontSize: 11, color: "#a3331f", fontWeight: 600, marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
          <I.Flag s={11}/> {blocked} blocked task{blocked > 1 ? "s" : ""}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex" }}>
          {team.map((m, i) => (
            <div key={m.id} title={m.name} style={{ width: 26, height: 26, borderRadius: "50%", background: m.color, color: "#fff", display: "grid", placeItems: "center", fontSize: 9, fontWeight: 700, border: "2px solid var(--surface)", marginLeft: i > 0 ? -6 : 0, position: "relative", zIndex: team.length - i }}>{m.avatar}</div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)" }}>
          {job.schedule?.start ? `${fmtDate(job.schedule.start)} → ${fmtDate(job.schedule.goLive)}` : "Awaiting schedule"}
        </div>
      </div>
    </div>
  );
};

// ─── Job Queue ────────────────────────────────────────────────────────────────
const JobQueue = ({ jobs, taskData, onOpenJob }) => {
  const [filter, setFilter] = useState("all");

  const stats = {
    total:    jobs.length,
    ready:    jobs.filter(j => j.status === "approved" || j.status === "scheduled").length,
    active:   jobs.filter(j => j.status === "in-progress").length,
    blocked:  Object.values(taskData).flat().filter(t => t.status === "blocked").length,
    done:     Object.values(taskData).flat().filter(t => t.status === "done").length,
    total_tasks: Object.values(taskData).flat().length,
  };

  const filtered = filter === "all" ? jobs : jobs.filter(j => j.status === filter);

  return (
    <div className="page eng-enter" style={{ maxWidth: 1280 }}>
      <div style={{ marginBottom: 28 }}>
        <div className="eyebrow" style={{ color: "#1a6b3a" }}>Engineering · Provisioning System</div>
        <h1 style={{ marginTop: 10 }}>My <em style={{ fontStyle: "italic", color: "#1a6b3a" }}>Job Queue</em></h1>
        <p style={{ marginTop: 8 }}>All proposals assigned to engineering. Work through the provisioning checklist for each job.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Assigned Jobs",   value: stats.total,                                     top: "#16478f" },
          { label: "Ready to Start",  value: stats.ready,                                     top: "#0b2f6b" },
          { label: "In Progress",     value: stats.active,                                     top: "#8b6a3a" },
          { label: "Blocked Tasks",   value: stats.blocked,                                    top: "#a3331f" },
          { label: "Tasks Complete",  value: `${stats.done}/${stats.total_tasks}`,             top: "#1b6b4a" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: "18px 20px", borderTop: `3px solid ${s.top}` }}>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 26, color: s.top }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "var(--muted)", marginRight: 4 }}>Show</span>
        {[
          { id: "all",          label: "All Jobs"     },
          { id: "approved",     label: "Ready to Start" },
          { id: "scheduled",    label: "Scheduled"    },
          { id: "in-progress",  label: "In Progress"  },
        ].map(f => (
          <button key={f.id} className={"chip" + (filter === f.id ? " active" : "")} onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>{filtered.length} job{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: "60px 24px", textAlign: "center", color: "var(--muted)" }}>
          No jobs in this category.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
          {filtered.map(job => (
            <JobCard key={job.id} job={job} tasks={taskData[job.id] || []} onClick={() => onOpenJob(job)}/>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Individual Task Row ──────────────────────────────────────────────────────
const TaskRow = ({ task, onUpdate, isLast }) => {
  const [showNotes, setShowNotes] = useState(task.status === "blocked" || !!task.notes);
  const [notes, setNotes] = useState(task.notes || "");

  const saveNotes = () => onUpdate({ ...task, notes });
  const toggle = () => {
    if (task.status === "done") { onUpdate({ ...task, status: "pending", completedAt: null }); }
    else { onUpdate({ ...task, status: "done", completedAt: new Date().toISOString() }); }
  };
  const setStatus = (s) => {
    onUpdate({ ...task, status: s, notes: s === "blocked" ? (notes || task.notes) : task.notes });
    if (s === "blocked") setShowNotes(true);
  };

  const isDone    = task.status === "done";
  const isBlocked = task.status === "blocked";
  const isActive  = task.status === "in-progress";

  return (
    <div className="task-row" style={{ borderBottom: isLast ? "none" : "1px solid var(--line)" }}>
      <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
        {/* Checkbox */}
        <div
          className={`task-check ${isDone ? "done" : isBlocked ? "blocked" : isActive ? "in-progress" : ""}`}
          style={{ marginTop: 2, placeItems: "center" }}
          onClick={toggle}
          title={isDone ? "Click to reopen" : "Click to mark done"}
        >
          {isDone && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
          {isBlocked && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
          {isActive && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#16478f", animation: "pulse 2s infinite" }}/>}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "start", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: isDone ? "var(--muted)" : "var(--ink)", textDecoration: isDone ? "line-through" : "none", lineHeight: 1.3 }}>
                {task.priority === "high" && !isDone && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#a3331f", marginRight: 6, verticalAlign: "middle", marginBottom: 1 }}/>}
                {task.title}
              </div>
              {!isDone && (
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3, lineHeight: 1.45 }}>{task.desc}</div>
              )}
            </div>

            {/* Status badge + action buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
              <TaskBadge status={task.status}/>
              {!isDone && (
                <>
                  {task.status !== "in-progress" && (
                    <button onClick={() => setStatus("in-progress")}
                      style={{ fontSize: 10, padding: "3px 9px", borderRadius: 999, border: "1px solid rgba(22,71,143,.3)", background: "rgba(22,71,143,.06)", color: "#16478f", cursor: "pointer", fontWeight: 600, letterSpacing: ".04em" }}>
                      Start
                    </button>
                  )}
                  {task.status !== "blocked" && (
                    <button onClick={() => setStatus("blocked")}
                      style={{ fontSize: 10, padding: "3px 9px", borderRadius: 999, border: "1px solid rgba(163,51,31,.3)", background: "rgba(163,51,31,.06)", color: "#a3331f", cursor: "pointer", fontWeight: 600, letterSpacing: ".04em" }}>
                      Block
                    </button>
                  )}
                  {task.status === "blocked" && (
                    <button onClick={() => { setStatus("pending"); }}
                      style={{ fontSize: 10, padding: "3px 9px", borderRadius: 999, border: "1px solid var(--line-2)", background: "var(--bg-alt)", color: "var(--muted)", cursor: "pointer", fontWeight: 600 }}>
                      Unblock
                    </button>
                  )}
                </>
              )}
              <button onClick={() => setShowNotes(n => !n)}
                style={{ fontSize: 10, padding: "3px 9px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--muted)", cursor: "pointer" }}>
                {showNotes ? "Hide notes" : "Notes"}
              </button>
            </div>
          </div>

          {/* Notes area */}
          {showNotes && (
            <div style={{ marginTop: 10 }}>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                onBlur={saveNotes}
                rows={isBlocked ? 3 : 2}
                placeholder={isBlocked ? "Describe the blocker and what's needed to resolve it…" : "Add notes for this task…"}
                style={{
                  width: "100%", background: isBlocked ? "color-mix(in srgb,#a3331f 5%,var(--surface-2))" : "var(--surface-2)",
                  border: `1px solid ${isBlocked ? "color-mix(in srgb,#a3331f 30%,var(--line))" : "var(--line)"}`,
                  borderRadius: "var(--radius-sm)", padding: "10px 12px", fontSize: 12, color: "var(--ink)",
                  fontFamily: "var(--sans)", resize: "vertical", boxSizing: "border-box",
                }}
                onFocus={e => { e.target.style.borderColor = isBlocked ? "#a3331f" : "var(--brand)"; e.target.style.outline = "none"; }}
                onBlur2={e => { e.target.style.borderColor = isBlocked ? "color-mix(in srgb,#a3331f 30%,var(--line))" : "var(--line)"; }}
              />
              {task.completedAt && (
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>
                  Completed {fmtDate(task.completedAt)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: "@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }" }}/>
    </div>
  );
};

// ─── Job Detail ───────────────────────────────────────────────────────────────
const JobDetail = ({ job, tasks, onBack, onUpdateTasks, onUpdateJob }) => {
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].id);
  const [showSignOff, setShowSignOff] = useState(false);
  const [signoffName, setSignoffName] = useState("");
  const [signoffNote, setSignoffNote] = useState("");

  const progress = pct(tasks);
  const allDone  = progress === 100;
  const blocked  = tasks.filter(t => t.status === "blocked").length;

  const updateTask = (updated) => {
    const next = tasks.map(t => t.id === updated.id ? updated : t);
    onUpdateTasks(next);
  };

  const startJob = () => onUpdateJob({ status: "in-progress" });

  const submitSignOff = () => {
    if (!signoffName.trim()) { alert("Please type your name to sign off."); return; }
    onUpdateJob({ status: "completed" });
    onBack();
  };

  const activeCatTasks = tasks.filter(t => t.category === activeCat);
  const team = (job.team || []).map(id => TEAM_MEMBERS.find(t => t.id === id)).filter(Boolean);

  // Which categories have tasks (not all proposals have SIMs, etc.)
  const visibleCats = CATEGORIES.filter(c => tasks.some(t => t.category === c.id));

  return (
    <div className="page eng-enter" style={{ maxWidth: 1280, paddingTop: 28 }}>
      {/* Back + header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <button className="btn btn-ghost" onClick={onBack}><I.Back/> Back to jobs</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {blocked > 0 && (
            <span style={{ fontSize: 12, color: "#a3331f", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
              <I.Flag s={12}/> {blocked} blocked
            </span>
          )}
          <JobBadge status={job.status}/>
          {(job.status === "approved" || job.status === "scheduled") && (
            <button className="btn btn-primary" onClick={startJob} style={{ gap: 7 }}>
              <I.Play s={13}/> Start Provisioning
            </button>
          )}
        </div>
      </div>

      {/* Job header card */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: "22px 28px", marginBottom: 20, display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "start" }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8, color: "#1a6b3a" }}>Installation Job · {job.id}</div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 24 }}>{job.client.company}</h2>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 5 }}>
            {job.client.contact} · {job.client.role} ·{" "}
            <a href={`mailto:${job.client.email}`} style={{ color: "var(--brand)" }}>{job.client.email}</a>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 12, fontSize: 12, color: "var(--ink-2)" }}>
            <span>Deployment: <strong style={{ textTransform: "capitalize" }}>{job.deployment}</strong></span>
            {job.schedule?.start && <span>Start: <strong>{fmtDate(job.schedule.start)}</strong></span>}
            {job.schedule?.goLive && <span>Go-live: <strong>{fmtDate(job.schedule.goLive)}</strong></span>}
            {job.schedule?.notes && <span style={{ color: "var(--muted)" }}>{job.schedule.notes}</span>}
          </div>
          {team.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>Team:</span>
              <div style={{ display: "flex" }}>
                {team.map((m, i) => (
                  <div key={m.id} title={`${m.name} — ${m.role}`} style={{ width: 26, height: 26, borderRadius: "50%", background: m.color, color: "#fff", display: "grid", placeItems: "center", fontSize: 9, fontWeight: 700, border: "2px solid var(--surface)", marginLeft: i > 0 ? -6 : 0, position: "relative", zIndex: team.length - i }}>{m.avatar}</div>
                ))}
              </div>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>{team.map(m => m.name).join(", ")}</span>
            </div>
          )}
        </div>
        {/* Overall progress */}
        <div style={{ textAlign: "right", minWidth: 140 }}>
          <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 6 }}>Overall Progress</div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 40, color: allDone ? "#1b6b4a" : "var(--ink)", lineHeight: 1 }}>{progress}%</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            {tasks.filter(t => t.status === "done").length} of {tasks.length} tasks done
          </div>
          <div className="progress-track" style={{ marginTop: 10, height: 8 }}>
            <div className="progress-fill" style={{ width: `${progress}%`, background: allDone ? "#1b6b4a" : blocked > 0 ? "#a3331f" : "#16478f" }}/>
          </div>
        </div>
      </div>

      {/* Main layout: sidebar + task list */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, alignItems: "start" }}>
        {/* Category sidebar */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: 12, position: "sticky", top: 76 }}>
          <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", padding: "4px 8px 10px", fontWeight: 600 }}>Provisioning Steps</div>
          {visibleCats.map(cat => {
            const s = catStats(tasks, cat.id);
            if (!s) return null;
            const isActive = activeCat === cat.id;
            return (
              <button
                key={cat.id}
                className={"cat-btn" + (isActive ? " active" : "")}
                onClick={() => setActiveCat(cat.id)}
              >
                <span style={{ fontSize: 14, flexShrink: 0 }}>{cat.icon}</span>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>{cat.label}</span>
                <span style={{
                  fontSize: 10, padding: "2px 7px", borderRadius: 999, fontWeight: 700,
                  background: isActive ? "rgba(255,255,255,.15)" : s.allDone ? "rgba(27,107,74,.12)" : s.blocked > 0 ? "rgba(163,51,31,.12)" : "var(--bg-alt)",
                  color: isActive ? "rgba(255,255,255,.9)" : s.allDone ? "#1b6b4a" : s.blocked > 0 ? "#a3331f" : "var(--muted)",
                }}>
                  {s.done}/{s.total}
                </span>
                {s.allDone && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1b6b4a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                {!s.allDone && s.blocked > 0 && <I.Flag s={11}/>}
              </button>
            );
          })}

          {/* Sign-off button */}
          {allDone && (
            <button
              onClick={() => setShowSignOff(true)}
              className="btn btn-primary btn-block"
              style={{ marginTop: 16, fontSize: 12, padding: "10px 14px", background: "#1b6b4a", gap: 6 }}
            >
              <I.Send s={13}/> Sign Off Job
            </button>
          )}
        </div>

        {/* Task list for active category */}
        <div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: "20px 24px" }}>
            {(() => {
              const cat = CATEGORIES.find(c => c.id === activeCat);
              const s = catStats(tasks, activeCat);
              return (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{cat?.icon}</span>
                      <div>
                        <h3 style={{ fontFamily: "var(--serif)", fontSize: 20 }}>{cat?.label}</h3>
                        {s && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{s.done} of {s.total} tasks complete{s.blocked > 0 ? ` · ${s.blocked} blocked` : ""}</div>}
                      </div>
                    </div>
                    {s?.allDone && (
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#1b6b4a" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1b6b4a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Category complete
                      </span>
                    )}
                  </div>
                  <div>
                    {activeCatTasks.length === 0 ? (
                      <div style={{ padding: "32px 12px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>No tasks in this category.</div>
                    ) : (
                      activeCatTasks.map((task, i) => (
                        <TaskRow key={task.id} task={task} onUpdate={updateTask} isLast={i === activeCatTasks.length - 1}/>
                      ))
                    )}
                  </div>
                </>
              );
            })()}
          </div>

          {/* Blocked tasks summary */}
          {tasks.filter(t => t.status === "blocked").length > 0 && (
            <div style={{ marginTop: 16, background: "color-mix(in srgb,#a3331f 5%,var(--surface))", border: "1px solid color-mix(in srgb,#a3331f 25%,var(--line))", borderRadius: "var(--radius)", padding: "16px 20px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#a3331f", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <I.Flag s={13}/> Blocked Tasks — Needs Resolution
              </div>
              {tasks.filter(t => t.status === "blocked").map(t => (
                <div key={t.id} style={{ fontSize: 12, padding: "6px 0", borderBottom: "1px dashed var(--line)", color: "var(--ink-2)" }}>
                  <strong style={{ color: "#a3331f" }}>{t.title}</strong>
                  {t.notes && <span style={{ color: "var(--muted)" }}> — {t.notes}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Sign-off panel */}
          {showSignOff && (
            <div className="sign-off-panel" style={{ marginTop: 20 }}>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 20, marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
                <I.Star s={18}/> Installation Sign-Off
              </h3>
              <p style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 20, lineHeight: 1.5 }}>
                All {tasks.length} provisioning tasks are complete. By signing off you confirm that <strong>{job.client.company}</strong> is fully provisioned, tested, and handed over per the proposal scope.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div className="field">
                  <label>Your full name (to sign off)</label>
                  <input value={signoffName} onChange={e => setSignoffName(e.target.value)} placeholder="e.g. Sarah Chen"
                    style={{ background: "var(--surface)", border: "1px solid var(--line)", padding: "13px 14px", borderRadius: "var(--radius-sm)", fontSize: 14, color: "var(--ink)", fontFamily: "var(--sans)" }}
                  />
                </div>
                <div className="field">
                  <label>Completion notes (optional)</label>
                  <input value={signoffNote} onChange={e => setSignoffNote(e.target.value)} placeholder="Any post-launch notes…"
                    style={{ background: "var(--surface)", border: "1px solid var(--line)", padding: "13px 14px", borderRadius: "var(--radius-sm)", fontSize: 14, color: "var(--ink)", fontFamily: "var(--sans)" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <button className="btn btn-primary btn-lg" onClick={submitSignOff} style={{ background: "#1b6b4a", gap: 8 }}>
                  <I.Send s={15}/> Submit Sign-Off & Close Job
                </button>
                <button className="btn btn-ghost" onClick={() => setShowSignOff(false)}>Cancel</button>
                <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 8 }}>
                  This will update the job status to Completed in the Operations Portal.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
function EngineerApp() {
  const [user, setUser]           = useState(null);
  const [authed, setAuthed]       = useState(false);
  const [jobs, setJobs]           = useState([]);
  const [taskData, setTaskData]   = useState({});
  const [selected, setSelected]   = useState(null);

  useEffect(() => {
    const auth = sessionStorage.getItem("np_portal_auth");
    if (!auth) { window.location.href = "index.html"; return; }
    let u;
    try { u = JSON.parse(auth); } catch { window.location.href = "index.html"; return; }
    if (u.type !== "engineer") { window.location.href = "index.html"; return; }
    setUser(u);
    setAuthed(true);
    document.documentElement.setAttribute("data-theme", "light");

    // Load jobs: pull from ops portal localStorage, filter to engineering-visible statuses
    const rawProposals = localStorage.getItem("np_portal_proposals");
    let allProposals = rawProposals ? JSON.parse(rawProposals) : [];
    let engJobs = allProposals.filter(p => ["approved", "scheduled", "in-progress"].includes(p.status));

    // Merge with demo jobs (add any demo job whose ID isn't already in the list)
    DEMO_JOBS.forEach(d => {
      if (!engJobs.find(j => j.id === d.id)) engJobs.push(d);
    });

    setJobs(engJobs);

    // Load or generate tasks for each job
    const td = {};
    engJobs.forEach(j => {
      const saved = localStorage.getItem(`np_tasks_${j.id}`);
      td[j.id] = saved ? (() => { try { return JSON.parse(saved); } catch { return buildTasks(j); } })() : buildTasks(j);
    });
    setTaskData(td);
  }, []);

  const updateTasks = (jobId, tasks) => {
    setTaskData(d => ({ ...d, [jobId]: tasks }));
    localStorage.setItem(`np_tasks_${jobId}`, JSON.stringify(tasks));
    // Keep selected in sync
    if (selected?.id === jobId) setSelected(j => j);
  };

  const updateJob = (jobId, updates) => {
    setJobs(prev => {
      const next = prev.map(j => j.id === jobId ? { ...j, ...updates } : j);
      // Also persist back to ops portal proposals if they exist there
      const raw = localStorage.getItem("np_portal_proposals");
      if (raw) {
        try {
          const ops = JSON.parse(raw);
          const updated = ops.map(p => p.id === jobId ? { ...p, ...updates } : p);
          localStorage.setItem("np_portal_proposals", JSON.stringify(updated));
        } catch { /* ignore */ }
      }
      return next;
    });
    if (selected?.id === jobId) setSelected(j => ({ ...j, ...updates }));
  };

  if (!authed) return null;

  return (
    <div className="app-shell">
      <EngineerNav user={user}/>
      {selected ? (
        <JobDetail
          job={selected}
          tasks={taskData[selected.id] || buildTasks(selected)}
          onBack={() => setSelected(null)}
          onUpdateTasks={(tasks) => updateTasks(selected.id, tasks)}
          onUpdateJob={(updates) => updateJob(selected.id, updates)}
        />
      ) : (
        <JobQueue jobs={jobs} taskData={taskData} onOpenJob={setSelected}/>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<EngineerApp/>);
