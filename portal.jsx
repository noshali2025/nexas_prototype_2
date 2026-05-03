// NexaPoint — Software Installation & Proposal Preview Portal (Internal)

const { useState, useEffect } = React;

// ─── Utilities ──────────────────────────────────────────────────────────────
const fmtMoney = (v, cur = "GBP") =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(v || 0);

const fmtDate = (d) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return String(d); }
};

const STATUS_META = {
  new:           { label: "New",           color: "#b8935a", bg: "rgba(184,147,90,.12)"  },
  review:        { label: "Under Review",  color: "#16478f", bg: "rgba(22,71,143,.10)"   },
  approved:      { label: "Approved",      color: "#1b6b4a", bg: "rgba(27,107,74,.10)"   },
  scheduled:     { label: "Scheduled",     color: "#0b2f6b", bg: "rgba(11,47,107,.10)"   },
  "in-progress": { label: "In Progress",   color: "#8b6a3a", bg: "rgba(139,106,58,.12)"  },
  completed:     { label: "Completed",     color: "#5b6b86", bg: "rgba(91,107,134,.10)"  },
  rejected:      { label: "Rejected",      color: "#a3331f", bg: "rgba(163,51,31,.10)"   },
};

// ─── Icons ──────────────────────────────────────────────────────────────────
const I = {
  Check:  ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Back:   ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Arrow:  ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Inbox:  ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  Cal:    ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Team:   ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Flag:   ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  X:      ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Plus:   ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Logout: ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Send:   ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
};

// ─── Static Data ─────────────────────────────────────────────────────────────
const TEAM_MEMBERS = [
  { id: "t1", name: "Sarah Chen",     role: "Lead Impl. Engineer",    rate: 650, avatar: "SC", color: "#0b2f6b" },
  { id: "t2", name: "Mark O'Brien",   role: "Solutions Architect",    rate: 750, avatar: "MO", color: "#16478f" },
  { id: "t3", name: "Priya Patel",    role: "ERP Consultant",         rate: 550, avatar: "PP", color: "#b8935a" },
  { id: "t4", name: "James Wilson",   role: "Data Migration Spec.",   rate: 580, avatar: "JW", color: "#1b6b4a" },
  { id: "t5", name: "Emma Clarke",    role: "Training Lead",          rate: 480, avatar: "EC", color: "#8b6a3a" },
  { id: "t6", name: "Raj Kumar",      role: "DevOps & Infrastructure",rate: 600, avatar: "RK", color: "#a3331f" },
  { id: "t7", name: "Lisa Thompson",  role: "Project Manager",        rate: 520, avatar: "LT", color: "#5b6b86" },
];

const DEMO_PROPOSALS = [
  {
    id: "NP-2026-48291", date: "2026-04-25T09:14:00Z",
    client: { company: "Meridian Healthcare Group", contact: "Dr. Sarah Mitchell", role: "Chief Digital Officer", email: "s.mitchell@meridian.nhs.uk", address: "14 Harley Street", city: "London", postal: "W1G 9PH", country: "United Kingdom" },
    deployment: "cloud", payment: "wire", signature: "Sarah Mitchell", signDate: "2026-04-25",
    items: [{ name: "Healthcare Operations Bundle", device: "MacBook Pro M4 × 8", software: ["Clinical Records", "HR & Payroll", "Finance Suite"], sim: "5G Pro × 8" }],
    totals: { oneTime: 28000, monthly: 2400, impl: 4500, year1: 61300 },
    status: "new", priority: "high", notes: "", reviewer: null, schedule: null, team: [],
  },
  {
    id: "NP-2026-48288", date: "2026-04-23T14:30:00Z",
    client: { company: "TechFlow Solutions Ltd", contact: "Alexander Hughes", role: "COO", email: "a.hughes@techflow.com", address: "30 City Road", city: "London", postal: "EC1Y 2AB", country: "United Kingdom" },
    deployment: "cloud", payment: "card", signature: "Alexander Hughes", signDate: "2026-04-23",
    items: [{ name: "Corporate Productivity Bundle", device: "iMac M4 × 15", software: ["Finance Suite", "CRM & Sales", "Project Management"], sim: null }],
    totals: { oneTime: 22500, monthly: 1800, impl: 3900, year1: 48000 },
    status: "review", priority: "normal", notes: "Checking Sage integration compatibility.", reviewer: "t7", schedule: null, team: [],
  },
  {
    id: "NP-2026-48285", date: "2026-04-21T11:00:00Z",
    client: { company: "Harrow Medical Group", contact: "Dr. Emily Patel", role: "IT Director", email: "e.patel@harrowmed.co.uk", address: "Pinner Road", city: "Harrow", postal: "HA1 4HZ", country: "United Kingdom" },
    deployment: "onprem", payment: "po", signature: "Emily Patel", signDate: "2026-04-21",
    items: [{ name: "Medical Enterprise Bundle", device: "MacBook Pro M4 × 12, iPhone 15 Pro × 12", software: ["Clinical Records", "Finance Suite", "HR & Payroll", "CRM & Sales"], sim: "5G Pro × 12" }],
    totals: { oneTime: 52000, monthly: 3600, impl: 7800, year1: 103000 },
    status: "approved", priority: "high", notes: "Approved. On-prem infra review required before scheduling.", reviewer: "t2", schedule: null, team: ["t2", "t4", "t6"],
  },
  {
    id: "NP-2026-48283", date: "2026-04-18T10:15:00Z",
    client: { company: "Riverside Logistics PLC", contact: "Marcus Webb", role: "Operations Director", email: "m.webb@riverside-logistics.com", address: "Portside Business Park", city: "Bristol", postal: "BS11 9HT", country: "United Kingdom" },
    deployment: "cloud", payment: "card", signature: "Marcus Webb", signDate: "2026-04-18",
    items: [{ name: "Field Operations Bundle", device: "iPhone 15 Pro × 20, Android Pro × 10", software: ["Inventory & Logistics", "CRM & Sales"], sim: "4G Business × 30" }],
    totals: { oneTime: 18500, monthly: 1200, impl: 2700, year1: 35600 },
    status: "scheduled", priority: "normal", notes: "Approved. Kickoff May 12th.", reviewer: "t1",
    schedule: { start: "2026-05-12", goLive: "2026-06-23", notes: "Remote install + 2 on-site days in Bristol" },
    team: ["t1", "t3", "t5"],
  },
  {
    id: "NP-2026-48280", date: "2026-04-14T09:00:00Z",
    client: { company: "Baker & Kohl LLP", contact: "Victoria Stern", role: "Managing Partner", email: "v.stern@bakerkohl.co.uk", address: "1 New Change", city: "London", postal: "EC4M 9AF", country: "United Kingdom" },
    deployment: "cloud", payment: "wire", signature: "Victoria Stern", signDate: "2026-04-14",
    items: [{ name: "Legal Practice Bundle", device: "MacBook Pro M4 × 6", software: ["Finance Suite", "Document Management", "CRM & Sales"], sim: null }],
    totals: { oneTime: 10500, monthly: 960, impl: 2700, year1: 24720 },
    status: "in-progress", priority: "normal", notes: "Week 3 of 6. Data migration underway.", reviewer: "t7",
    schedule: { start: "2026-04-20", goLive: "2026-05-30", notes: "Hybrid remote/on-site" },
    team: ["t3", "t4", "t7"],
  },
  {
    id: "NP-2026-48275", date: "2026-04-05T08:30:00Z",
    client: { company: "Delta Foods International", contact: "James Thornton", role: "CFO", email: "j.thornton@deltafoods.com", address: "Unit 4, Greenway Industrial Est.", city: "Birmingham", postal: "B11 2RH", country: "United Kingdom" },
    deployment: "cloud", payment: "po", signature: "James Thornton", signDate: "2026-04-05",
    items: [{ name: "Enterprise Full Suite", device: "iMac M4 × 20, iPhone 15 Pro × 20", software: ["Finance Suite", "HR & Payroll", "Inventory & Logistics", "CRM & Sales"], sim: "5G Pro × 20" }],
    totals: { oneTime: 68000, monthly: 4800, impl: 8100, year1: 134700 },
    status: "completed", priority: "normal", notes: "Go-live confirmed. Post-launch review 5 May.", reviewer: "t1",
    schedule: { start: "2026-04-06", goLive: "2026-04-30", notes: "Completed on schedule." },
    team: ["t1", "t2", "t3", "t4", "t5", "t7"],
  },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.new;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
      color: m.color, background: m.bg, letterSpacing: ".04em", whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color, flexShrink: 0 }}/>
      {m.label}
    </span>
  );
};

// ─── Portal Nav ───────────────────────────────────────────────────────────────
const PortalNav = ({ user, onLogout, activeView, onNav, newCount }) => (
  <div className="portal-nav">
    <div
      onClick={() => onNav("dashboard")}
      style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 36, cursor: "pointer", flexShrink: 0 }}
    >
      <div style={{
        width: 26, height: 26, borderRadius: 6, position: "relative",
        background: "linear-gradient(135deg,#4a7fd6,#6a98e3)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,.15)",
      }}>
        <div style={{ position: "absolute", inset: 6, borderRadius: 3, background: "#d4ad72", transform: "rotate(45deg)" }}/>
      </div>
      <span style={{ fontFamily: "var(--serif)", fontSize: 18, color: "#f2eee3", letterSpacing: "-.01em" }}>NexaPoint</span>
      <span style={{ fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(255,255,255,.35)", fontWeight: 600, marginLeft: 2 }}>Internal</span>
    </div>

    {[
      { id: "dashboard", label: "Proposal Inbox", icon: <I.Inbox s={13}/> },
      { id: "calendar",  label: "Schedule",       icon: <I.Cal  s={13}/> },
      { id: "team",      label: "Engineering",    icon: <I.Team s={13}/> },
    ].map(item => (
      <button
        key={item.id}
        className={"p-nav-item" + (activeView === item.id ? " active" : "")}
        onClick={() => onNav(item.id)}
      >
        {item.icon} {item.label}
        {item.id === "dashboard" && newCount > 0 && (
          <span style={{ fontSize: 10, background: "#b8935a", color: "#fff", borderRadius: 999, padding: "2px 7px", fontWeight: 700, marginLeft: 2 }}>{newCount}</span>
        )}
      </button>
    ))}

    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
      <a
        href="index.html"
        style={{ fontSize: 12, color: "rgba(255,255,255,.38)", textDecoration: "none", padding: "6px 12px", borderRadius: 999, border: "1px solid rgba(255,255,255,.1)", transition: "color .15s" }}
        onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,.7)"}
        onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.38)"}
      >
        ← Prototype
      </a>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#b8935a", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11, color: "#fff", flexShrink: 0 }}>
          {(user?.name || "OP").split(" ").map(w => w[0]).join("").slice(0, 2)}
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#f2eee3", fontWeight: 500, lineHeight: 1.2 }}>{user?.name || "Ops User"}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.38)" }}>{user?.role || "Operations"}</div>
        </div>
      </div>
      <button
        onClick={onLogout}
        title="Logout"
        style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(255,255,255,.14)", background: "transparent", display: "grid", placeItems: "center", cursor: "pointer", color: "rgba(255,255,255,.38)", transition: "all .15s" }}
        onMouseEnter={e => { e.currentTarget.style.color = "#f2eee3"; e.currentTarget.style.borderColor = "rgba(255,255,255,.4)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,.38)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.14)"; }}
      >
        <I.Logout s={14}/>
      </button>
    </div>
  </div>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = ({ proposals, onSelect }) => {
  const [filter, setFilter] = useState("all");

  const stats = {
    new:       proposals.filter(p => p.status === "new").length,
    review:    proposals.filter(p => p.status === "review").length,
    approved:  proposals.filter(p => p.status === "approved").length,
    scheduled: proposals.filter(p => p.status === "scheduled").length,
    active:    proposals.filter(p => p.status === "in-progress").length,
    pipeline:  proposals.reduce((a, p) => a + (p.totals?.year1 || 0), 0),
  };

  const filtered = filter === "all" ? proposals : proposals.filter(p => p.status === filter);

  return (
    <div className="page portal-enter" style={{ maxWidth: 1280 }}>
      <div style={{ marginBottom: 28 }}>
        <div className="eyebrow">Software Installation & Proposal Preview</div>
        <h1 style={{ marginTop: 10 }}>Proposal <em style={{ fontStyle: "italic", color: "var(--accent-2)" }}>Inbox</em></h1>
        <p style={{ marginTop: 8 }}>Review signed proposals, approve for engineering, schedule installations and assign teams.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "New",          value: stats.new,                        color: "#b8935a", top: "#b8935a" },
          { label: "Under Review", value: stats.review,                     color: "#16478f", top: "#16478f" },
          { label: "Approved",     value: stats.approved,                   color: "#1b6b4a", top: "#1b6b4a" },
          { label: "Scheduled",    value: stats.scheduled,                  color: "#0b2f6b", top: "#0b2f6b" },
          { label: "In Progress",  value: stats.active,                     color: "#8b6a3a", top: "#8b6a3a" },
          { label: "Pipeline",     value: fmtMoney(stats.pipeline, "GBP"),  color: "var(--ink)", top: "var(--ink)", large: true },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.top}` }}>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: s.large ? 18 : 28, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "var(--muted)", marginRight: 4 }}>Filter</span>
        {[
          { id: "all", label: "All" },
          { id: "new", label: "New" },
          { id: "review", label: "Under Review" },
          { id: "approved", label: "Approved" },
          { id: "scheduled", label: "Scheduled" },
          { id: "in-progress", label: "In Progress" },
          { id: "completed", label: "Completed" },
        ].map(f => (
          <button key={f.id} className={"chip" + (filter === f.id ? " active" : "")} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>{filtered.length} proposal{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-alt)" }}>
              {["Reference", "Client", "Proposal", "Year 1 Value", "Received", "Status", ""].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "12px 20px", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr
                key={p.id}
                className="proposal-row"
                style={{ background: p.status === "new" ? "color-mix(in srgb,#b8935a 4%,var(--surface))" : "var(--surface)" }}
                onClick={() => onSelect(p)}
              >
                <td style={{ padding: "16px 20px", fontFamily: "var(--mono)", fontSize: 12, whiteSpace: "nowrap" }}>
                  {p.id}
                  {p.priority === "high" && (
                    <span style={{ marginLeft: 7, fontSize: 9, padding: "2px 6px", borderRadius: 999, background: "#a3331f", color: "#fff", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>High</span>
                  )}
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 15 }}>{p.client.company}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{p.client.contact} · {p.client.role}</div>
                </td>
                <td style={{ padding: "16px 20px", fontSize: 12, color: "var(--muted)", maxWidth: 200 }}>
                  {p.items.map(it => it.name).join(", ")}
                </td>
                <td style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 15 }}>{fmtMoney(p.totals.year1, "GBP")}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>{fmtMoney(p.totals.monthly, "GBP")}/mo recurring</div>
                </td>
                <td style={{ padding: "16px 20px", fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>{fmtDate(p.date)}</td>
                <td style={{ padding: "16px 20px" }}><StatusBadge status={p.status}/></td>
                <td style={{ padding: "16px 20px" }}>
                  <button className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: 12 }}>
                    Review <I.Arrow s={12}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>No proposals in this category.</div>
        )}
      </div>
    </div>
  );
};

// ─── Proposal Detail ──────────────────────────────────────────────────────────
const ProposalDetail = ({ proposal: propIn, onBack, onUpdate }) => {
  const [proposal, setProposal] = useState(propIn);
  const [tab, setTab] = useState("proposal");
  const [reviewNote, setReviewNote] = useState(propIn.notes || "");
  const [reviewerSel, setReviewerSel] = useState(propIn.reviewer || "");
  const [scheduleDraft, setScheduleDraft] = useState(propIn.schedule || { start: "", goLive: "", notes: "" });
  const [teamDraft, setTeamDraft] = useState(propIn.team || []);
  const [teamDays, setTeamDays] = useState({});
  const [saved, setSaved] = useState(false);

  const canSchedule = ["approved", "scheduled", "in-progress", "completed"].includes(proposal.status);

  const save = (updates) => {
    const updated = { ...proposal, ...updates };
    setProposal(updated);
    onUpdate(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const approve = () => {
    save({ status: "approved", notes: reviewNote, reviewer: reviewerSel });
    setTab("schedule");
  };

  const flagReview = () => save({ status: "review", notes: reviewNote, reviewer: reviewerSel });

  const reject = () => {
    if (!window.confirm("Reject this proposal? This will be logged.")) return;
    save({ status: "rejected", notes: reviewNote });
  };

  const confirmSchedule = () => {
    if (!scheduleDraft.start || !scheduleDraft.goLive) {
      alert("Please set both start and go-live dates.");
      return;
    }
    save({ status: "scheduled", schedule: scheduleDraft, team: teamDraft });
  };

  const markInProgress = () => save({ status: "in-progress" });

  const totalTeamCost = teamDraft.reduce((a, tid) => {
    const m = TEAM_MEMBERS.find(t => t.id === tid);
    return m ? a + m.rate * (teamDays[tid] || 10) : a;
  }, 0);

  const implRevenue = proposal.totals?.impl || 0;
  const margin = implRevenue - totalTeamCost;
  const marginPct = implRevenue > 0 ? Math.round(margin / implRevenue * 100) : 0;

  return (
    <div className="page portal-enter" style={{ maxWidth: 1280 }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <button className="btn btn-ghost" onClick={onBack}><I.Back/> Back to inbox</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {saved && <span style={{ fontSize: 12, color: "var(--success)", fontWeight: 500 }}>✓ Saved</span>}
          <StatusBadge status={proposal.status}/>
        </div>
      </div>

      {/* Header card */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: "24px 32px", marginBottom: 20, display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start" }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Proposal · {proposal.id}</div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 26 }}>{proposal.client.company}</h2>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 5 }}>
            {proposal.client.contact} · {proposal.client.role} · <a href={`mailto:${proposal.client.email}`} style={{ color: "var(--brand)" }}>{proposal.client.email}</a>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 12, fontSize: 12, color: "var(--ink-2)" }}>
            <span>Received: <strong>{fmtDate(proposal.date)}</strong></span>
            <span>Deployment: <strong style={{ textTransform: "capitalize" }}>{proposal.deployment}</strong></span>
            <span>Payment: <strong style={{ textTransform: "capitalize" }}>{proposal.payment}</strong></span>
            <span>Signed by: <strong>{proposal.signature}</strong> on <strong>{fmtDate(proposal.signDate)}</strong></span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: ".1em", textTransform: "uppercase" }}>Year 1 Value</div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 32, color: "var(--ink)" }}>{fmtMoney(proposal.totals.year1, "GBP")}</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            {fmtMoney(proposal.totals.monthly, "GBP")}/mo · {fmtMoney(proposal.totals.impl, "GBP")} impl.
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--line)", marginBottom: 24 }}>
        {[
          { id: "proposal", label: "Signed Proposal",  dot: false, disabled: false },
          { id: "review",   label: "Internal Review",  dot: proposal.status === "new", disabled: false },
          { id: "schedule", label: "Schedule & Team",  dot: false, disabled: !canSchedule },
        ].map(t => (
          <button
            key={t.id}
            className={"tab-btn" + (tab === t.id ? " active" : "") + (t.disabled ? " disabled" : "")}
            onClick={() => !t.disabled && setTab(t.id)}
          >
            {t.label}
            {t.dot && <span style={{ marginLeft: 6, width: 7, height: 7, borderRadius: "50%", background: "#b8935a", display: "inline-block", verticalAlign: "middle" }}/>}
            {t.disabled && <span style={{ marginLeft: 6, fontSize: 9, color: "var(--muted)", letterSpacing: ".06em" }}>LOCKED</span>}
          </button>
        ))}
      </div>

      {/* TAB: Signed Proposal */}
      {tab === "proposal" && (
        <div className="proposal" style={{ maxWidth: "100%" }}>
          <div className="proposal-head">
            <div>
              <div className="ref" style={{ marginBottom: 8 }}>Proposal · {proposal.id}</div>
              <h1 style={{ fontSize: 34 }}>Commercial <em style={{ fontStyle: "italic", color: "var(--accent-2)" }}>Proposal</em></h1>
              <p style={{ marginTop: 8, fontSize: 13 }}>
                Prepared by NexaPoint ERP Ltd. · Signed by {proposal.signature} on {fmtDate(proposal.signDate)}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{
                width: 40, height: 40, borderRadius: 9, marginLeft: "auto",
                background: "linear-gradient(135deg,var(--brand),var(--brand-2))", position: "relative",
              }}>
                <div style={{ position: "absolute", inset: 10, borderRadius: 3, background: "var(--accent)", transform: "rotate(45deg)" }}/>
              </div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 18, marginTop: 10 }}>NexaPoint</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>ERP Ltd.</div>
            </div>
          </div>

          <div className="proposal-meta">
            <div><div className="m-label">Client</div><div className="m-val">{proposal.client.company}</div></div>
            <div><div className="m-label">Contact</div><div className="m-val">{proposal.client.contact}</div></div>
            <div><div className="m-label">Deployment</div><div className="m-val" style={{ textTransform: "capitalize" }}>{proposal.deployment}</div></div>
            <div><div className="m-label">Issued</div><div className="m-val">{fmtDate(proposal.date)}</div></div>
          </div>

          <div className="proposal-section">
            <h2><span className="num">01</span> Scope of order</h2>
            {proposal.items.map((item, i) => (
              <div key={i} style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 17, marginBottom: 12, color: "var(--ink)" }}>{item.name}</div>
                <div className="feat-list">
                  <div className="feat"><div className="feat-dot"/><div><strong>Hardware</strong><span>{item.device}</span></div></div>
                  {item.sim && <div className="feat"><div className="feat-dot"/><div><strong>Connectivity</strong><span>{item.sim}</span></div></div>}
                  {(item.software || []).map(sw => (
                    <div key={sw} className="feat"><div className="feat-dot"/><div><strong>{sw}</strong><span>12-month subscription · {proposal.deployment === "cloud" ? "Cloud-hosted" : "On-premise"}</span></div></div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="proposal-section">
            <h2><span className="num">02</span> Implementation timeline</h2>
            <div className="timeline">
              <div className="tl-step"><div className="tl-week">W 1–2</div><div className="tl-title">Discovery</div><div className="tl-desc">Process mapping, data audit, user interviews</div></div>
              <div className="tl-step"><div className="tl-week">W 3–5</div><div className="tl-title">Configure</div><div className="tl-desc">Modules tailored to workflows, integrations scoped</div></div>
              <div className="tl-step"><div className="tl-week">W 6–8</div><div className="tl-title">Migrate & train</div><div className="tl-desc">Historical data, role-based training, UAT</div></div>
              <div className="tl-step"><div className="tl-week">W 9–10</div><div className="tl-title">Go-live</div><div className="tl-desc">Cutover, hypercare, post-launch review</div></div>
            </div>
          </div>

          <div className="proposal-section">
            <h2><span className="num">03</span> Commercial summary</h2>
            <table className="cost-table">
              <thead><tr><th>Item</th><th className="num">Amount</th></tr></thead>
              <tbody>
                <tr><td>Hardware (one-off)</td><td className="num">{fmtMoney(proposal.totals.oneTime, "GBP")}</td></tr>
                <tr><td>Annual software subscriptions (12 months)</td><td className="num">{fmtMoney(proposal.totals.monthly * 12, "GBP")}</td></tr>
                <tr><td>Implementation & onboarding</td><td className="num">{fmtMoney(proposal.totals.impl, "GBP")}</td></tr>
                <tr className="row-total"><td>Year 1 total (ex. tax)</td><td className="num">{fmtMoney(proposal.totals.year1, "GBP")}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="proposal-foot" style={{ borderTop: "1px solid var(--line)", paddingTop: 28, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>Electronic Signature</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 30, fontStyle: "italic", color: "var(--ink)", borderBottom: "1px solid var(--ink)", paddingBottom: 4, paddingRight: 60, display: "inline-block" }}>
                {proposal.signature}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
                Signed by {proposal.client.contact} · {fmtDate(proposal.signDate)} · Audit ID NP-SIG-{proposal.id.split("-").pop()}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost btn-lg" onClick={() => window.print()}>Print Proposal</button>
              {proposal.status === "new" && (
                <button className="btn btn-primary btn-lg" onClick={() => setTab("review")}>
                  Review Internally <I.Arrow/>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Internal Review */}
      {tab === "review" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Notes */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: 28 }}>
              <h3 style={{ marginBottom: 14 }}>Internal Notes</h3>
              <textarea
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                rows={5}
                placeholder="Add concerns, conditions for approval, or notes to engineering…"
                style={{
                  width: "100%", background: "var(--surface-2)", border: "1px solid var(--line)",
                  borderRadius: "var(--radius-sm)", padding: "13px 14px", fontSize: 14, color: "var(--ink)",
                  fontFamily: "var(--sans)", resize: "vertical", boxSizing: "border-box",
                }}
                onFocus={e => { e.target.style.borderColor = "var(--brand)"; e.target.style.outline = "none"; e.target.style.boxShadow = "0 0 0 3px color-mix(in srgb,var(--brand) 12%,transparent)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--line)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Assign reviewer */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: 28 }}>
              <h3 style={{ marginBottom: 14 }}>Assign Reviewer</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {TEAM_MEMBERS.filter(t => ["t1","t2","t7"].includes(t.id)).map(m => (
                  <div
                    key={m.id}
                    onClick={() => setReviewerSel(m.id)}
                    style={{
                      padding: "14px 16px", borderRadius: "var(--radius-sm)", cursor: "pointer",
                      border: `1.5px solid ${reviewerSel === m.id ? "var(--ink)" : "var(--line)"}`,
                      background: reviewerSel === m.id ? "var(--bg-alt)" : "var(--surface)",
                      display: "flex", alignItems: "center", gap: 10, transition: "all .15s",
                    }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: m.color, color: "#fff", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{m.avatar}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{m.role}</div>
                    </div>
                    {reviewerSel === m.id && (
                      <div style={{ marginLeft: "auto", color: "var(--success)" }}><I.Check s={14}/></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Decision panel */}
          <div style={{ position: "sticky", top: 76 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: 24 }}>
              <h3 style={{ marginBottom: 6 }}>Decision</h3>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
                Current: <StatusBadge status={proposal.status}/>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  className="btn btn-primary btn-block btn-lg"
                  onClick={approve}
                  disabled={["completed","rejected"].includes(proposal.status)}
                >
                  <I.Check s={16}/> Approve & Schedule
                </button>
                <button
                  className="btn btn-ghost btn-block"
                  onClick={flagReview}
                  disabled={["completed","rejected"].includes(proposal.status)}
                  style={{ borderColor: "#b8935a", color: "#b8935a" }}
                >
                  <I.Flag s={14}/> Flag for Review
                </button>
                <button
                  className="btn btn-ghost btn-block"
                  onClick={reject}
                  disabled={["completed","rejected","in-progress"].includes(proposal.status)}
                  style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
                >
                  <I.X s={14}/> Reject Proposal
                </button>
                <button className="btn btn-ghost btn-block" onClick={() => save({ notes: reviewNote, reviewer: reviewerSel })}>
                  Save Notes
                </button>
              </div>
              <div style={{ marginTop: 18, padding: 13, background: "var(--bg-alt)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
                <strong style={{ color: "var(--ink)" }}>Approving</strong> moves the proposal to <em>Scheduled</em> and unlocks the Schedule & Team tab to notify engineering.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Schedule & Team */}
      {tab === "schedule" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Schedule */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: 28 }}>
              <h3 style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}><I.Cal s={16}/> Installation Schedule</h3>
              <div className="field-grid" style={{ marginBottom: 14 }}>
                <div className="field">
                  <label>Installation Start Date</label>
                  <input type="date" value={scheduleDraft.start} onChange={e => setScheduleDraft(s => ({ ...s, start: e.target.value }))}/>
                </div>
                <div className="field">
                  <label>Expected Go-Live Date</label>
                  <input type="date" value={scheduleDraft.goLive} onChange={e => setScheduleDraft(s => ({ ...s, goLive: e.target.value }))}/>
                </div>
              </div>
              <div className="field">
                <label>Scheduling Notes</label>
                <textarea
                  rows={3} value={scheduleDraft.notes}
                  onChange={e => setScheduleDraft(s => ({ ...s, notes: e.target.value }))}
                  placeholder="Remote install, on-site days, access requirements…"
                  style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--line)", padding: "13px 14px", borderRadius: "var(--radius-sm)", fontSize: 14, color: "var(--ink)", fontFamily: "var(--sans)", resize: "vertical", boxSizing: "border-box" }}
                />
              </div>
              {scheduleDraft.start && scheduleDraft.goLive && (() => {
                const days = Math.round((new Date(scheduleDraft.goLive) - new Date(scheduleDraft.start)) / 86400000);
                return (
                  <div style={{ marginTop: 16, padding: 16, background: "color-mix(in srgb,var(--brand) 6%,var(--surface))", borderRadius: "var(--radius-sm)", border: "1px solid color-mix(in srgb,var(--brand) 20%,var(--line))", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    {[{ l: "Start", v: fmtDate(scheduleDraft.start) }, { l: "Go-Live", v: fmtDate(scheduleDraft.goLive) }, { l: "Duration", v: `${days} days` }].map(x => (
                      <div key={x.l}>
                        <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em" }}>{x.l}</div>
                        <div style={{ fontFamily: "var(--serif)", fontSize: 15, marginTop: 4 }}>{x.v}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Team */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: 28 }}>
              <h3 style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}><I.Team s={16}/> Engineering Team</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                {TEAM_MEMBERS.map(m => {
                  const assigned = teamDraft.includes(m.id);
                  const days = teamDays[m.id] || 10;
                  return (
                    <div key={m.id} className={"team-member-row" + (assigned ? " assigned" : "")}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: m.color, color: "#fff", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{m.avatar}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</div>
                        <div style={{ fontSize: 10, color: "var(--muted)" }}>{m.role}</div>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>{fmtMoney(m.rate, "GBP")}/day</div>
                      {assigned && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <label style={{ fontSize: 10, color: "var(--muted)" }}>Days</label>
                          <input
                            type="number" min="1" max="120" value={days}
                            onClick={e => e.stopPropagation()}
                            onChange={e => setTeamDays(d => ({ ...d, [m.id]: Math.max(1, +e.target.value || 1) }))}
                            style={{ width: 44, border: "1px solid var(--line)", borderRadius: 4, padding: "3px 4px", fontSize: 11, background: "var(--surface)", color: "var(--ink)", fontFamily: "var(--sans)", textAlign: "center" }}
                          />
                        </div>
                      )}
                      <button
                        onClick={() => setTeamDraft(t => assigned ? t.filter(x => x !== m.id) : [...t, m.id])}
                        style={{
                          width: 26, height: 26, borderRadius: "50%",
                          background: assigned ? "var(--ink)" : "var(--surface)",
                          border: `1px solid ${assigned ? "var(--ink)" : "var(--line-2)"}`,
                          color: assigned ? "var(--bg)" : "var(--muted)",
                          display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0,
                        }}
                      >
                        {assigned ? <I.Check s={11}/> : <I.Plus s={11}/>}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Cost breakdown */}
              {teamDraft.length > 0 && (
                <div style={{ background: "var(--bg-alt)", borderRadius: "var(--radius-sm)", padding: "14px 16px" }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)", marginBottom: 10 }}>Internal Cost Breakdown</div>
                  {teamDraft.map(tid => {
                    const m = TEAM_MEMBERS.find(t => t.id === tid);
                    if (!m) return null;
                    const d = teamDays[tid] || 10;
                    return (
                      <div key={tid} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", borderBottom: "1px dashed var(--line)" }}>
                        <span style={{ color: "var(--muted)" }}>{m.name} × {d} days</span>
                        <span style={{ fontWeight: 500 }}>{fmtMoney(m.rate * d, "GBP")}</span>
                      </div>
                    );
                  })}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 10, paddingTop: 8, borderTop: "2px solid var(--ink)", fontWeight: 600 }}>
                    <span>Total team cost</span>
                    <span style={{ fontFamily: "var(--serif)", fontSize: 16 }}>{fmtMoney(totalTeamCost, "GBP")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 6 }}>
                    <span style={{ color: "var(--muted)" }}>Impl. revenue</span>
                    <span>{fmtMoney(implRevenue, "GBP")}</span>
                  </div>
                  <div style={{
                    display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 4, fontWeight: 700,
                    color: margin >= 0 ? "var(--success)" : "var(--danger)",
                  }}>
                    <span>Margin ({marginPct}%)</span>
                    <span>{fmtMoney(margin, "GBP")}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, flexWrap: "wrap" }}>
            {["approved", "scheduled"].includes(proposal.status) && (
              <button className="btn btn-ghost btn-lg" onClick={() => save({ schedule: scheduleDraft, team: teamDraft })}>
                Save Draft
              </button>
            )}
            {proposal.status === "approved" && (
              <button className="btn btn-primary btn-lg" onClick={confirmSchedule}>
                <I.Send s={15}/> Confirm & Notify Engineering
              </button>
            )}
            {proposal.status === "scheduled" && (
              <button className="btn btn-accent btn-lg" onClick={markInProgress}>
                Mark as In Progress <I.Arrow/>
              </button>
            )}
            {proposal.status === "in-progress" && (
              <button className="btn btn-primary btn-lg" onClick={() => save({ status: "completed" })}>
                <I.Check s={15}/> Mark Complete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Calendar View ─────────────────────────────────────────────────────────────
const CalendarView = ({ proposals }) => {
  const scheduled = proposals.filter(p => p.schedule?.start);
  const today = new Date();

  return (
    <div className="page portal-enter" style={{ maxWidth: 1280 }}>
      <div style={{ marginBottom: 28 }}>
        <div className="eyebrow">Engineering Schedule</div>
        <h1 style={{ marginTop: 10 }}>Installation <em style={{ fontStyle: "italic", color: "var(--accent-2)" }}>Calendar</em></h1>
        <p style={{ marginTop: 8 }}>Scheduled and active installations across all clients.</p>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: 32 }}>
        <h3 style={{ marginBottom: 24 }}>Active & Upcoming Installations</h3>
        {scheduled.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>No scheduled installations yet. Approve a proposal to schedule one.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {scheduled.map(p => {
              const start = new Date(p.schedule.start);
              const end = new Date(p.schedule.goLive);
              const total = Math.max(end - start, 1);
              const elapsed = today - start;
              const pct = Math.max(0, Math.min(100, (elapsed / total) * 100));
              const team = (p.team || []).map(id => TEAM_MEMBERS.find(t => t.id === id)).filter(Boolean);

              return (
                <div key={p.id} style={{ background: "var(--bg-alt)", borderRadius: "var(--radius)", padding: "18px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontFamily: "var(--serif)", fontSize: 16 }}>{p.client.company}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{p.id} · {p.items.map(i => i.name).join(", ")}</div>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <StatusBadge status={p.status}/>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{fmtDate(p.schedule.start)} → {fmtDate(p.schedule.goLive)}</span>
                    </div>
                  </div>
                  <div className="progress-bar-bg" style={{ marginBottom: 10 }}>
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pct >= 100 ? "var(--success)" : "var(--brand)" }}/>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex" }}>
                      {team.map((m, i) => (
                        <div key={m.id} title={m.name} style={{
                          width: 26, height: 26, borderRadius: "50%", background: m.color, color: "#fff",
                          display: "grid", placeItems: "center", fontSize: 9, fontWeight: 700,
                          border: "2px solid var(--bg-alt)", marginLeft: i > 0 ? -6 : 0, position: "relative", zIndex: team.length - i,
                        }}>{m.avatar}</div>
                      ))}
                      {team.length === 0 && <span style={{ fontSize: 12, color: "var(--muted)" }}>No team assigned</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      {pct >= 100 ? "Complete" : `${Math.round(pct)}% complete`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Team View ────────────────────────────────────────────────────────────────
const TeamView = ({ proposals }) => {
  return (
    <div className="page portal-enter" style={{ maxWidth: 1280 }}>
      <div style={{ marginBottom: 28 }}>
        <div className="eyebrow">Engineering & Implementation</div>
        <h1 style={{ marginTop: 10 }}>Team <em style={{ fontStyle: "italic", color: "var(--accent-2)" }}>Capacity</em></h1>
        <p style={{ marginTop: 8 }}>Current allocation and daily rates across the engineering team.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
        {TEAM_MEMBERS.map(m => {
          const active = proposals.filter(p =>
            (p.status === "in-progress" || p.status === "scheduled") && (p.team || []).includes(m.id)
          );
          return (
            <div key={m.id} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: 24, borderTop: `3px solid ${m.color}` }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: m.color, color: "#fff", display: "grid", placeItems: "center", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>{m.avatar}</div>
                <div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 17 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{m.role}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div style={{ padding: "10px 12px", background: "var(--bg-alt)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em" }}>Day Rate</div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 2 }}>{fmtMoney(m.rate, "GBP")}</div>
                </div>
                <div style={{ padding: "10px 12px", background: "var(--bg-alt)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em" }}>Active Jobs</div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 2, color: active.length > 0 ? m.color : "var(--ink)" }}>{active.length}</div>
                </div>
              </div>
              {active.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>Current</div>
                  {active.map(p => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: "5px 0", borderBottom: "1px dashed var(--line)" }}>
                      <span style={{ color: "var(--ink-2)", fontFamily: "var(--serif)", fontSize: 13 }}>{p.client.company}</span>
                      <StatusBadge status={p.status}/>
                    </div>
                  ))}
                </div>
              )}
              {active.length === 0 && (
                <div style={{ padding: "10px 12px", background: "var(--bg-alt)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--muted)", textAlign: "center" }}>Available</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
function PortalApp() {
  const [user, setUser] = useState(null);
  const [authed, setAuthed] = useState(false);
  const [view, setView] = useState("dashboard");
  const [proposals, setProposals] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const auth = sessionStorage.getItem("np_portal_auth");
    if (!auth) { window.location.href = "index.html"; return; }
    try { setUser(JSON.parse(auth)); } catch { setUser({ name: "Operations Manager", role: "Ops Manager" }); }
    setAuthed(true);

    // Build proposal list: saved state → demo + any order from prototype
    const saved = localStorage.getItem("np_portal_proposals");
    let base = saved ? JSON.parse(saved) : [...DEMO_PROPOSALS];

    const lastOrder = localStorage.getItem("np_last_order");
    if (lastOrder) {
      try {
        const ord = JSON.parse(lastOrder);
        if (!base.find(p => p.id === ord.orderRef)) {
          const items = (ord.cart || []).map(item => ({
            name: item.bundleName || "Custom Order",
            device: (item.devices || []).map(l => `${(l.deviceId || "").replace(/-/g, " ")} ×${l.qty}`).join(", ") || "—",
            software: item.softwareIds || [],
            sim: item.simId ? `${item.simId} ×${item.simQty || 1}` : null,
          }));
          base = [{
            id: ord.orderRef,
            date: ord.orderDate || new Date().toISOString(),
            client: {
              company: ord.form?.company || "Unknown Client",
              contact: ord.form?.contact || "",
              role: ord.form?.role || "",
              email: ord.form?.email || "",
              address: ord.form?.address || "",
              city: ord.form?.city || "",
              postal: ord.form?.postal || "",
              country: ord.form?.country || "United Kingdom",
            },
            deployment: ord.form?.deployment || "cloud",
            payment: ord.form?.payment || "card",
            signature: ord.form?.signature || ord.form?.contact || "",
            signDate: ord.form?.signDate || new Date(ord.orderDate).toISOString().slice(0, 10),
            items: items.length > 0 ? items : [{ name: "Custom Order", device: "—", software: [], sim: null }],
            totals: ord.totals || { oneTime: 0, monthly: 0, impl: 0, year1: 0 },
            status: "new", priority: "high", notes: "", reviewer: null, schedule: null, team: [],
          }, ...base];
        }
      } catch (_) { /* ignore malformed data */ }
    }

    setProposals(base);
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

  const updateProposal = (updated) => {
    setProposals(ps => {
      const next = ps.map(p => p.id === updated.id ? updated : p);
      localStorage.setItem("np_portal_proposals", JSON.stringify(next));
      return next;
    });
    setSelected(updated);
  };

  const logout = () => {
    sessionStorage.removeItem("np_portal_auth");
    window.location.href = "index.html";
  };

  const navigate = (v) => { setView(v); setSelected(null); };

  if (!authed) return null;

  const newCount = proposals.filter(p => p.status === "new").length;

  return (
    <div className="app-shell">
      <PortalNav user={user} onLogout={logout} activeView={view} onNav={navigate} newCount={newCount}/>
      {view === "dashboard" && !selected && (
        <Dashboard proposals={proposals} onSelect={p => setSelected(p)}/>
      )}
      {view === "dashboard" && selected && (
        <ProposalDetail proposal={selected} onBack={() => setSelected(null)} onUpdate={updateProposal}/>
      )}
      {view === "calendar" && <CalendarView proposals={proposals}/>}
      {view === "team" && <TeamView proposals={proposals}/>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<PortalApp/>);
