// NexaPoint — Credit & Compliance Management Portal

const { useState, useEffect, useRef, useCallback } = React;

// ── Formatters ─────────────────────────────────────────────────────────────
const fmt = v => new Intl.NumberFormat("en-GB", { style:"currency", currency:"GBP", maximumFractionDigits:0 }).format(v||0);
const fmtDate = d => { if(!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}); } catch { return d; } };
const fmtTime = d => { if(!d) return "—"; try { return new Date(d).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}); } catch { return ""; } };

// ── Icons ──────────────────────────────────────────────────────────────────
const Ic = {
  Dashboard: ({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Queue:     ({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Check:     ({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  X:         ({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Warn:      ({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  AI:        ({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/><circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/></svg>,
  Approved:  ({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Declined:  ({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  Docs:      ({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  User:      ({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Logout:    ({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Search:    ({s=15})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Send:      ({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Eye:       ({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Clock:     ({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Shield:    ({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Refresh:   ({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Star:      ({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
};

// ── Status metadata ────────────────────────────────────────────────────────
const SM = {
  pending:    { label:"Pending",      color:"#b8935a", bg:"rgba(184,147,90,.12)" },
  ai_review:  { label:"AI Running",  color:"#16478f", bg:"rgba(22,71,143,.12)"  },
  ai_pass:    { label:"AI Approved", color:"#1b6b4a", bg:"rgba(27,107,74,.10)"  },
  ai_warn:    { label:"AI — Review",  color:"#8b6a3a", bg:"rgba(139,106,58,.12)" },
  ai_fail:    { label:"AI Declined", color:"#a3331f", bg:"rgba(163,51,31,.10)"  },
  approved:   { label:"Approved",    color:"#1b6b4a", bg:"rgba(27,107,74,.10)"  },
  declined:   { label:"Declined",    color:"#a3331f", bg:"rgba(163,51,31,.10)"  },
  docs_req:   { label:"Docs Needed", color:"#8b6a3a", bg:"rgba(139,106,58,.12)" },
  new:        { label:"New",          color:"#b8935a", bg:"rgba(184,147,90,.12)" },
};

const StatusBadge = ({ s }) => {
  const m = SM[s] || { label:s, color:"#666", bg:"#eee" };
  return <span className="cr-chip" style={{ color:m.color, background:m.bg }}>{m.label}</span>;
};

// ── AI check definitions ───────────────────────────────────────────────────
const AI_CHECKS = [
  { id:"identity",  label:"Identity Verification",  desc:"Cross-referencing full name and date of birth against HMRC, DWP, and government records",        duration:900  },
  { id:"document",  label:"Document Authenticity",  desc:"Analysing MRZ data, holograms, security features, NFC chip and digital watermarks",               duration:1200 },
  { id:"biometric", label:"Biometric Face Match",   desc:"Comparing live selfie against document photo using 3D facial geometry and liveness detection",     duration:1100 },
  { id:"address",   label:"Address Verification",   desc:"Validating address against Electoral Roll, Royal Mail PAF, Land Registry and HMRC PAYE data",     duration:800  },
  { id:"companies", label:"Companies House Check",  desc:"Verifying company registration number, directors, PSCs, filing history and active trading status",  duration:950  },
  { id:"aml",       label:"AML & PEP Screening",    desc:"Screening against OFAC, HM Treasury, EU/UN sanctions, Politically Exposed Persons and adverse media",duration:1050 },
  { id:"credit",    label:"Credit File Analysis",   desc:"Reviewing Experian, Equifax and TransUnion credit files — CCJs, defaults, and payment history",     duration:1300 },
  { id:"risk",      label:"Risk Score Calculation", desc:"Aggregating 47 risk signals into final composite risk profile and credit recommendation",            duration:700  },
];

// ── Demo application data ──────────────────────────────────────────────────
const APPS = [
  {
    id:"CRA-2026-001", propId:"NP-2026-48291",
    submitted:"2026-04-25T09:14:00Z",
    company:"Meridian Healthcare Group", contact:"Dr. Sarah Mitchell", role:"Chief Digital Officer",
    email:"s.mitchell@meridian.nhs.uk", phone:"+44 20 7946 0801",
    address:"14 Harley Street, London W1G 9PH", companyReg:"09281744", vat:"GB291 4472 31",
    director:"Dr. Sarah Elizabeth Mitchell", dob:"1978-03-12", dirAddress:"47 Kensington Park Rd, London W11 3BU",
    idType:"passport", idNumber:"GBR879341A",
    financeAmt:61300, term:36, monthlyPay:1958, annualRev:12000000, yearsTrading:18, ccjs:"none",
    deployment:"cloud", orderRef:"NP-2026-48291",
    docs:{ id:true, idBack:false, address:true, company:true, selfie:true },
    status:"approved", decision:"approved", decisionBy:"ai", decisionAt:"2026-04-25T09:21:00Z",
    decisionNote:"All verification checks passed. Strong credit profile — approved at full amount.",
    aiResults:{
      identity:  { result:"pass", confidence:98, note:"Name and DOB verified against HMRC records" },
      document:  { result:"pass", confidence:97, note:"Passport GBR879341A — authentic, no signs of tampering" },
      biometric: { result:"pass", confidence:96, note:"Facial match confirmed · Liveness check passed" },
      address:   { result:"pass", confidence:94, note:"Address verified on Electoral Roll and Land Registry" },
      companies: { result:"pass", confidence:100,note:"Registered 2006, 18 years active trading, no disqualified directors" },
      aml:       { result:"pass", confidence:100,note:"No matches on OFAC, HMT, EU/UN sanctions or PEP lists" },
      credit:    { result:"pass", confidence:92, note:"Credit score 82/100 · No defaults or CCJs · Clean payment history" },
      risk:      { result:"pass", confidence:96, note:"Low risk · Recommended limit £75,000" },
    },
    aiScore:96, aiRecommendation:"approve", creditLimit:75000,
  },
  {
    id:"CRA-2026-002", propId:"NP-2026-45590",
    submitted:"2026-04-15T14:30:00Z",
    company:"Sterling Finance Corp", contact:"Jonathan Park", role:"CTO",
    email:"j.park@sterling-finance.co.uk", phone:"+44 20 7946 0550",
    address:"50 Cannon Street, London EC4N 6JJ", companyReg:"04829103", vat:"GB482 9103 77",
    director:"Jonathan David Park", dob:"1972-11-04", dirAddress:"12 Cheyne Walk, London SW3 5RF",
    idType:"passport", idNumber:"GBR441829B",
    financeAmt:110900, term:36, monthlyPay:3543, annualRev:85000000, yearsTrading:32, ccjs:"none",
    deployment:"cloud", orderRef:"NP-2026-45590",
    docs:{ id:true, idBack:false, address:true, company:true, selfie:true },
    status:"approved", decision:"approved", decisionBy:"ai", decisionAt:"2026-04-15T14:38:00Z",
    decisionNote:"Exceptional credit profile. 91/100 score, 32 years trading, no adverse markers.",
    aiResults:{
      identity:  { result:"pass", confidence:99, note:"Name and DOB verified across multiple government databases" },
      document:  { result:"pass", confidence:98, note:"Passport authentic — chip data matches visual inspection" },
      biometric: { result:"pass", confidence:99, note:"Facial match confirmed with 99% confidence · Liveness passed" },
      address:   { result:"pass", confidence:97, note:"Address verified on Electoral Roll, Land Registry and credit file" },
      companies: { result:"pass", confidence:100,note:"Registered 1994, 32 years active, clean filing history, no disqualifications" },
      aml:       { result:"pass", confidence:100,note:"Clear across all 47 sanction and PEP lists" },
      credit:    { result:"pass", confidence:97, note:"Credit score 91/100 · Excellent payment history across all products" },
      risk:      { result:"pass", confidence:98, note:"Very low risk · Recommended limit £120,000" },
    },
    aiScore:98, aiRecommendation:"approve", creditLimit:120000,
  },
  {
    id:"CRA-2026-003", propId:"NP-2026-46872",
    submitted:"2026-04-18T11:05:00Z",
    company:"Arcadia Hospitality Ltd", contact:"Camille Dupont", role:"IT Director",
    email:"c.dupont@arcadia-hospitality.com", phone:"+44 20 7946 0392",
    address:"88 Piccadilly, London W1J 7PY", companyReg:"11340289", vat:"GB334 0289 45",
    director:"Camille Marie Dupont", dob:"1985-07-22", dirAddress:"14 Notting Hill Gate, London W11 3JA",
    idType:"drivers", idNumber:"DUPOM857222CM9TC",
    financeAmt:77200, term:36, monthlyPay:2464, annualRev:4200000, yearsTrading:7, ccjs:"1 satisfied",
    deployment:"cloud", orderRef:"NP-2026-46872",
    docs:{ id:true, idBack:true, address:true, company:false, selfie:true },
    status:"ai_warn", decision:null, decisionBy:null, decisionAt:null,
    decisionNote:"",
    aiResults:{
      identity:  { result:"pass", confidence:95, note:"Name and DOB verified — minor discrepancy on middle name resolved" },
      document:  { result:"pass", confidence:93, note:"Driving licence authentic — both sides verified" },
      biometric: { result:"pass", confidence:91, note:"Facial match confirmed · Lighting variation noted but within threshold" },
      address:   { result:"pass", confidence:88, note:"Address verified on Electoral Roll · Previous address mismatch resolved" },
      companies: { result:"warn", confidence:72, note:"Company registered 2017. 1 satisfied CCJ (2023, £4,200). Still trading." },
      aml:       { result:"pass", confidence:100,note:"No matches on sanctions or PEP lists" },
      credit:    { result:"warn", confidence:65, note:"Credit score 68/100 · 1 satisfied CCJ · Payment history mostly clean" },
      risk:      { result:"warn", confidence:68, note:"Medium risk. CCJ flag. Recommend manual review. Limit suggested: £35,000" },
    },
    aiScore:68, aiRecommendation:"manual_review", creditLimit:35000,
  },
  {
    id:"CRA-2026-004", propId:"NP-2026-43100",
    submitted:"2026-04-28T09:00:00Z",
    company:"Highfield Retail Group", contact:"Mark Stevens", role:"Finance Director",
    email:"m.stevens@highfield-retail.co.uk", phone:"+44 20 7946 0774",
    address:"22 Oxford Street, London W1C 1AX", companyReg:"07762911", vat:"GB776 2911 02",
    director:"Mark Anthony Stevens", dob:"1980-09-15", dirAddress:"6 Hampstead Lane, London N6 4RS",
    idType:"passport", idNumber:"GBR992156C",
    financeAmt:28900, term:24, monthlyPay:1371, annualRev:8000000, yearsTrading:11, ccjs:"none",
    deployment:"onprem", orderRef:"NP-2026-43100",
    docs:{ id:true, idBack:false, address:true, company:true, selfie:false },
    status:"docs_req", decision:null, decisionBy:null, decisionAt:null,
    decisionNote:"Selfie document missing. AI biometric check cannot proceed without facial image.",
    aiResults:{
      identity:  { result:"pass", confidence:96, note:"Name and DOB verified against HMRC records" },
      document:  { result:"pass", confidence:95, note:"Passport authentic — no signs of tampering" },
      biometric: { result:"fail", confidence:0,  note:"FAILED — Selfie not uploaded. Biometric check cannot proceed." },
      address:   { result:"pass", confidence:90, note:"Address verified on Electoral Roll" },
      companies: { result:"pass", confidence:100,note:"Registered 2015, 11 years trading, clean filing history" },
      aml:       { result:"pass", confidence:100,note:"No matches on any sanctions list" },
      credit:    { result:"pass", confidence:84, note:"Credit score 74/100 · Clean record, no CCJs" },
      risk:      { result:"fail", confidence:0,  note:"INCOMPLETE — Biometric verification required before risk scoring" },
    },
    aiScore:0, aiRecommendation:"docs_required", creditLimit:0,
  },
  {
    id:"CRA-2026-005", propId:"NP-2026-41880",
    submitted:"2026-03-28T15:20:00Z",
    company:"ClearPath Recruitment Ltd", contact:"Amy Holloway", role:"Managing Director",
    email:"a.holloway@clearpath-rec.co.uk", phone:"+44 20 7946 0112",
    address:"5 Fleet Street, London EC4Y 1AA", companyReg:"13991027", vat:"",
    director:"Amy Louise Holloway", dob:"1990-05-30", dirAddress:"32 Streatham High Rd, London SW16 1DA",
    idType:"national", idNumber:"GB-NI-HW901234",
    financeAmt:15500, term:24, monthlyPay:735, annualRev:1100000, yearsTrading:3, ccjs:"2 active",
    deployment:"cloud", orderRef:"NP-2026-41880",
    docs:{ id:true, idBack:true, address:true, company:true, selfie:true },
    status:"declined", decision:"declined", decisionBy:"ai", decisionAt:"2026-03-28T15:31:00Z",
    decisionNote:"AI declined: 2 active CCJs, low credit score (61/100), company less than 3 years old. Risk threshold exceeded.",
    aiResults:{
      identity:  { result:"pass", confidence:94, note:"Name and DOB verified" },
      document:  { result:"pass", confidence:91, note:"National ID card authentic — both sides verified" },
      biometric: { result:"pass", confidence:93, note:"Facial match confirmed" },
      address:   { result:"warn", confidence:72, note:"Address verified but registered for only 8 months" },
      companies: { result:"warn", confidence:61, note:"Registered 2023 — only 3 years trading. Below minimum threshold of 5 years." },
      aml:       { result:"pass", confidence:100,note:"No sanctions matches" },
      credit:    { result:"fail", confidence:38, note:"Credit score 61/100 · 2 ACTIVE CCJs (£3,100 + £1,850). High risk." },
      risk:      { result:"fail", confidence:32, note:"HIGH RISK. Active CCJs + young company + low revenue. Declined." },
    },
    aiScore:32, aiRecommendation:"decline", creditLimit:0,
  },
  {
    id:"CRA-2026-006", propId:"NP-2026-49501",
    submitted:"2026-05-01T10:45:00Z",
    company:"Pinnacle Construction PLC", contact:"David Okonkwo", role:"CEO",
    email:"d.okonkwo@pinnacle-construction.co.uk", phone:"+44 20 7946 0621",
    address:"200 Aldersgate Street, London EC1A 4HD", companyReg:"03451892", vat:"GB345 1892 88",
    director:"David Chukwuemeka Okonkwo", dob:"1968-12-08", dirAddress:"55 Bishops Avenue, London N2 0BA",
    idType:"passport", idNumber:"GBR771234D",
    financeAmt:88500, term:36, monthlyPay:2825, annualRev:24000000, yearsTrading:28, ccjs:"none",
    deployment:"cloud", orderRef:"NP-2026-49501",
    docs:{ id:true, idBack:false, address:true, company:true, selfie:true },
    status:"pending", decision:null, decisionBy:null, decisionAt:null,
    decisionNote:"",
    aiResults:null,
    aiScore:null, aiRecommendation:null, creditLimit:null,
  },
];

// ── Shared helpers ─────────────────────────────────────────────────────────
const ScoreRing = ({ score, size=70 }) => {
  if (score === null || score === undefined) return (
    <div className="score-ring" style={{ width:size, height:size, background:"var(--bg-alt)", border:"3px solid var(--line)" }}>
      <span style={{ fontSize:11, color:"var(--muted)" }}>N/A</span>
    </div>
  );
  const color = score>=85?"#1b6b4a":score>=65?"#b8935a":"#a3331f";
  const bg = score>=85?"rgba(27,107,74,.1)":score>=65?"rgba(184,147,90,.1)":"rgba(163,51,31,.1)";
  return (
    <div className="score-ring" style={{ width:size, height:size, background:bg, border:`3px solid ${color}` }}>
      <div style={{ fontFamily:"var(--serif)", fontSize:size*0.28, fontWeight:700, color, lineHeight:1 }}>{score}</div>
      <div style={{ fontSize:size*0.14, color, opacity:.75 }}>/100</div>
    </div>
  );
};

// ── Dashboard ──────────────────────────────────────────────────────────────
const Dashboard = ({ apps, onViewApp }) => {
  const pending = apps.filter(a=>a.status==="pending"||a.status==="ai_review").length;
  const needsReview = apps.filter(a=>a.status==="ai_warn"||a.status==="docs_req").length;
  const approved = apps.filter(a=>a.status==="approved").length;
  const declined = apps.filter(a=>a.status==="declined").length;
  const totalApproved = apps.filter(a=>a.status==="approved").reduce((s,a)=>s+a.financeAmt,0);
  const aiDecided = apps.filter(a=>a.decisionBy==="ai").length;

  const stats = [
    { label:"New / Pending",      val:pending,      sub:"Awaiting AI analysis",    col:"#b8935a" },
    { label:"Needs Human Review", val:needsReview,   sub:"AI flagged — manual action", col:"#8b6a3a", alert:needsReview>0 },
    { label:"Approved",           val:approved,      sub:`${fmt(totalApproved)} total finance`, col:"#1b6b4a" },
    { label:"Declined",           val:declined,      sub:"This period",             col:"#a3331f" },
    { label:"Total Applications", val:apps.length,   sub:"All time",                col:"#16478f" },
    { label:"AI Auto-Decisions",  val:aiDecided,     sub:`${Math.round(aiDecided/apps.length*100)}% automation rate`, col:"#0b2f6b" },
  ];

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:"var(--serif)", fontSize:28, marginBottom:4 }}>Credit &amp; Compliance Dashboard</h1>
        <p style={{ fontSize:13, color:"var(--muted)" }}>Real-time overview of all credit applications and AI verification status</p>
      </div>

      {needsReview > 0 && (
        <div style={{ padding:"14px 18px", background:"rgba(163,51,31,.07)", border:"1px solid rgba(163,51,31,.25)", borderRadius:"var(--radius)", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
          <Ic.Warn s={18} /><div style={{ fontSize:13, color:"#a3331f" }}><strong>{needsReview} application{needsReview>1?"s":""}</strong> flagged by AI require manual review.</div>
          <button className="btn btn-ghost" style={{ marginLeft:"auto", fontSize:12, padding:"5px 12px" }} onClick={()=>{}}>View Now</button>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14, marginBottom:28 }}>
        {stats.map(s=>(
          <div key={s.label} className="cr-stat" style={{ borderTopColor:s.col }}>
            <div style={{ fontSize:10.5, fontWeight:600, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>{s.label}</div>
            <div style={{ fontSize:32, fontWeight:700, fontFamily:"var(--serif)", color:s.col, lineHeight:1 }}>{s.val}</div>
            <div style={{ fontSize:11.5, color:"var(--muted)", marginTop:7 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* AI performance */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:22, marginBottom:22 }}>
        <div className="cr-card">
          <div style={{ fontFamily:"var(--serif)", fontSize:17, marginBottom:4 }}>AI Verification Engine</div>
          <div style={{ fontSize:12, color:"var(--muted)", marginBottom:18 }}>Performance statistics for NexaPoint AI v3.2</div>
          {[
            ["Average processing time","11.4 seconds"],
            ["AI auto-approve rate",`${Math.round(approved/apps.length*100)}%`],
            ["False positive rate","< 0.3%"],
            ["Identity match accuracy","97.4%"],
            ["Document fraud detection","99.1%"],
            ["Biometric liveness accuracy","98.8%"],
          ].map(([l,v])=>(
            <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid var(--line)", fontSize:13 }}>
              <span style={{ color:"var(--muted)" }}>{l}</span>
              <strong style={{ fontFamily:v.includes("%")||v.includes("s")?"var(--serif)":"var(--mono)", color:"#16478f" }}>{v}</strong>
            </div>
          ))}
        </div>
        <div className="cr-card">
          <div style={{ fontFamily:"var(--serif)", fontSize:17, marginBottom:16 }}>Recent Applications</div>
          {[...apps].sort((a,b)=>new Date(b.submitted)-new Date(a.submitted)).slice(0,5).map(a=>(
            <div key={a.id} onClick={()=>onViewApp(a)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid var(--line)", cursor:"pointer" }}>
              <div>
                <div style={{ fontWeight:600, fontSize:13 }}>{a.company.split(" ").slice(0,2).join(" ")}</div>
                <div style={{ fontSize:11, color:"var(--muted)" }}>{a.id} · {fmtDate(a.submitted.slice(0,10))}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontWeight:700, color:"#16478f", marginBottom:3 }}>{fmt(a.financeAmt)}</div>
                <StatusBadge s={a.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI decision breakdown */}
      <div className="cr-card">
        <div style={{ fontFamily:"var(--serif)", fontSize:17, marginBottom:18 }}>Application Status Breakdown</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
          {[
            { s:"approved",  label:"Approved",          n:approved,    col:"#1b6b4a" },
            { s:"ai_warn",   label:"AI — Review Needed",n:needsReview,  col:"#8b6a3a" },
            { s:"declined",  label:"Declined",           n:declined,    col:"#a3331f" },
            { s:"pending",   label:"Pending",            n:pending,     col:"#b8935a" },
          ].map(item=>(
            <div key={item.s} style={{ textAlign:"center", padding:"20px 14px", border:`1px solid ${item.col}22`, borderRadius:"var(--radius-sm)", background:`${item.col}08` }}>
              <div style={{ fontSize:36, fontWeight:700, fontFamily:"var(--serif)", color:item.col }}>{item.n}</div>
              <div style={{ fontSize:12, color:item.col, marginTop:6, fontWeight:500 }}>{item.label}</div>
              <div style={{ fontSize:11, color:"var(--muted)", marginTop:4 }}>{Math.round(item.n/apps.length*100)}% of total</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Application Queue ──────────────────────────────────────────────────────
const AppQueue = ({ apps, statusFilter, onView }) => {
  const [search, setSearch] = useState("");
  const [sf, setSf] = useState(statusFilter||"all");

  const FILTERS = [
    { k:"all",       label:"All"           },
    { k:"pending",   label:"Pending"       },
    { k:"ai_warn",   label:"Needs Review"  },
    { k:"docs_req",  label:"Docs Needed"   },
    { k:"approved",  label:"Approved"      },
    { k:"declined",  label:"Declined"      },
  ];

  const filtered = apps.filter(a => {
    if (sf!=="all" && a.status!==sf) return false;
    const q = search.toLowerCase();
    return !q || a.company.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.contact.toLowerCase().includes(q);
  });

  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontFamily:"var(--serif)", fontSize:26, marginBottom:4 }}>Application Queue</h1>
        <p style={{ fontSize:13, color:"var(--muted)" }}>{apps.length} total applications — click any row to review</p>
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <div className="search-bar"><Ic.Search /><input placeholder="Search company, contact, ID…" value={search} onChange={e=>setSearch(e.target.value)} /></div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {FILTERS.map(f=><button key={f.k} className={`chip-f${sf===f.k?" on":""}`} onClick={()=>setSf(f.k)}>{f.label}</button>)}
        </div>
      </div>
      <div className="cr-card" style={{ padding:0, overflow:"hidden" }}>
        <table className="cr-table">
          <thead><tr><th>App ID</th><th>Company</th><th>Contact</th><th>Submitted</th><th>Finance Amount</th><th>Term</th><th>AI Score</th><th>Verification By</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.length ? filtered.map(a=>(
              <tr key={a.id} onClick={()=>onView(a)}>
                <td><code style={{ fontSize:11, color:"var(--muted)" }}>{a.id}</code></td>
                <td>
                  <div style={{ fontWeight:600, fontSize:13 }}>{a.company}</div>
                  <div style={{ fontSize:11, color:"var(--muted)" }}>{a.companyReg}</div>
                </td>
                <td>
                  <div style={{ fontSize:13 }}>{a.contact}</div>
                  <div style={{ fontSize:11, color:"var(--muted)" }}>{a.role}</div>
                </td>
                <td style={{ color:"var(--muted)", fontSize:12 }}>
                  <div>{fmtDate(a.submitted.slice(0,10))}</div>
                  <div>{fmtTime(a.submitted)}</div>
                </td>
                <td style={{ fontWeight:700, color:"#16478f" }}>{fmt(a.financeAmt)}</td>
                <td style={{ color:"var(--muted)" }}>{a.term} mo</td>
                <td>
                  {a.aiScore !== null ? (
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <ScoreRing score={a.aiScore} size={36} />
                    </div>
                  ) : <span style={{ color:"var(--muted)", fontSize:12 }}>Pending</span>}
                </td>
                <td>
                  {a.decisionBy==="ai" ? (
                    <span className="cr-chip ai"><Ic.AI s={12} /> AI System</span>
                  ) : a.decisionBy ? (
                    <span className="cr-chip staff"><Ic.User s={12} /> Staff Review</span>
                  ) : a.aiResults ? (
                    <span className="cr-chip ai" style={{ opacity:.6 }}><Ic.AI s={12} /> Awaiting Decision</span>
                  ) : (
                    <span style={{ fontSize:11, color:"var(--muted)" }}>—</span>
                  )}
                </td>
                <td><StatusBadge s={a.status} /></td>
              </tr>
            )) : (
              <tr><td colSpan={9} style={{ padding:40, textAlign:"center", color:"var(--muted)" }}>No applications match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── AI Verification Engine ─────────────────────────────────────────────────
const AIEngine = ({ app, onComplete }) => {
  const [phase, setPhase] = useState("idle"); // idle | running | done
  const [progress, setProgress] = useState([]); // array of completed check ids
  const [current, setCurrent] = useState(null); // id of running check
  const timerRef = useRef([]);

  const run = useCallback(() => {
    if (!app.aiResults) return;
    setPhase("running"); setProgress([]); setCurrent(null);
    let delay = 400;
    AI_CHECKS.forEach((check, i) => {
      const t1 = setTimeout(() => setCurrent(check.id), delay);
      delay += check.duration;
      const t2 = setTimeout(() => {
        setProgress(p => [...p, check.id]);
        setCurrent(null);
      }, delay);
      timerRef.current.push(t1, t2);
      delay += 120;
    });
    const totalTime = delay + 300;
    const t3 = setTimeout(() => { setPhase("done"); if(onComplete) onComplete(); }, totalTime);
    timerRef.current.push(t3);
  }, [app, onComplete]);

  useEffect(() => { return () => timerRef.current.forEach(clearTimeout); }, []);

  const results = app.aiResults;

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:48, height:48, borderRadius:12, background:"rgba(22,71,143,.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Ic.AI s={24} />
          </div>
          <div>
            <div style={{ fontFamily:"var(--serif)", fontSize:18 }}>NexaPoint AI Verification Engine</div>
            <div style={{ fontSize:12, color:"var(--muted)" }}>v3.2 · 8-point identity &amp; eligibility check</div>
          </div>
        </div>
        {phase==="idle" && results && (
          <button className="btn btn-primary" onClick={run} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Ic.Refresh s={14} /> Run AI Analysis
          </button>
        )}
        {phase==="running" && (
          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#16478f", fontWeight:600 }}>
            <div className="ai-spinner" />Analysing…
          </div>
        )}
        {phase==="done" && (
          <button className="btn btn-ghost" onClick={run} style={{ display:"flex", alignItems:"center", gap:7, fontSize:13 }}>
            <Ic.Refresh s={13} /> Re-run
          </button>
        )}
      </div>

      {!results && (
        <div style={{ padding:"32px", textAlign:"center", background:"var(--bg-alt)", borderRadius:"var(--radius)", border:"1px dashed var(--line-2)" }}>
          <Ic.AI s={32} />
          <div style={{ fontFamily:"var(--serif)", fontSize:17, marginTop:12, marginBottom:6 }}>AI analysis not yet run</div>
          <p style={{ fontSize:13, color:"var(--muted)", maxWidth:360, margin:"0 auto" }}>Click "Run AI Analysis" above to start the automated verification process for this application.</p>
        </div>
      )}

      {results && (
        <>
          {/* Check list */}
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
            {AI_CHECKS.map(check => {
              const isDone = progress.includes(check.id);
              const isRunning = current === check.id;
              const isPending = !isDone && !isRunning && (phase!=="idle");
              const r = results[check.id];
              const showResult = isDone || phase==="idle";

              return (
                <div key={check.id} className={`ai-check-row${isRunning?" running":isDone&&r?(" "+r.result):isPending?" pending":""}`}>
                  {/* Status indicator */}
                  {isRunning ? (
                    <div className="ai-spinner" />
                  ) : showResult && r ? (
                    <div className={`ai-dot ${r.result}`}>
                      {r.result==="pass"?<Ic.Check s={10}/>:r.result==="warn"?<span style={{fontWeight:700,fontSize:10}}>!</span>:<Ic.X s={10}/>}
                    </div>
                  ) : (
                    <div className="ai-dot pending" />
                  )}

                  {/* Check info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                      <span style={{ fontWeight:600, fontSize:13 }}>{check.label}</span>
                      {showResult && r && (
                        <span style={{ fontSize:10, fontWeight:700, letterSpacing:".05em", textTransform:"uppercase",
                          color:r.result==="pass"?"#1b6b4a":r.result==="warn"?"#8b6a3a":"#a3331f" }}>
                          {r.result.toUpperCase()}
                        </span>
                      )}
                    </div>
                    {isRunning ? (
                      <div style={{ fontSize:12, color:"var(--muted)" }}>{check.desc}</div>
                    ) : showResult && r ? (
                      <div style={{ fontSize:12, color:"var(--muted)" }}>{r.note}</div>
                    ) : (
                      <div style={{ fontSize:12, color:"var(--muted)", opacity:.5 }}>{check.desc}</div>
                    )}
                  </div>

                  {/* Confidence bar */}
                  {showResult && r && r.confidence > 0 && (
                    <div style={{ width:140, flexShrink:0 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                        <span style={{ fontSize:10, color:"var(--muted)" }}>Confidence</span>
                        <span style={{ fontSize:10, fontWeight:700, color:r.confidence>=90?"#1b6b4a":r.confidence>=70?"#8b6a3a":"#a3331f" }}>{r.confidence}%</span>
                      </div>
                      <div className="ai-bar">
                        <div className="ai-bar-fill" style={{
                          width: (isDone||phase==="idle") ? `${r.confidence}%` : "0%",
                          background: r.confidence>=90?"#1b6b4a":r.confidence>=70?"#b8935a":"#a3331f",
                        }}/>
                      </div>
                    </div>
                  )}
                  {showResult && r && r.confidence===0 && (
                    <div style={{ width:140, flexShrink:0 }}>
                      <div className="ai-bar">
                        <div className="ai-bar-fill" style={{ width:"100%", background:"#a3331f22" }}/>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Result summary — shown after run or on idle */}
          {(phase==="done" || phase==="idle") && (
            <div style={{ borderRadius:"var(--radius)", border:"2px solid", padding:"20px 24px",
              borderColor: app.aiScore>=85?"#1b6b4a":app.aiScore>=65?"#b8935a":app.aiScore!==null&&app.aiScore>0?"#a3331f":"var(--line)",
              background: app.aiScore>=85?"rgba(27,107,74,.06)":app.aiScore>=65?"rgba(184,147,90,.06)":app.aiScore!==null&&app.aiScore>0?"rgba(163,51,31,.06)":"var(--bg-alt)",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:20 }}>
                <ScoreRing score={app.aiScore} size={80} />
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                    <div style={{ fontFamily:"var(--serif)", fontSize:20 }}>
                      {app.aiRecommendation==="approve"?"AI Recommendation: Approve":
                       app.aiRecommendation==="decline"?"AI Recommendation: Decline":
                       app.aiRecommendation==="manual_review"?"AI Recommendation: Manual Review Required":
                       app.aiRecommendation==="docs_required"?"AI Recommendation: Request Documents":
                       "AI Analysis Complete"}
                    </div>
                    <span className="cr-chip ai"><Ic.AI s={12} /> AI System</span>
                  </div>
                  <p style={{ fontSize:13, color:"var(--muted)", lineHeight:1.5, marginBottom:10 }}>
                    {app.aiScore>=85 && `Strong application — all ${AI_CHECKS.length} checks passed. Recommended credit limit: ${fmt(app.creditLimit)}.`}
                    {app.aiScore>=65&&app.aiScore<85 && `Moderate risk detected. Key flags raised during analysis. Manual review recommended before final decision. Suggested limit: ${fmt(app.creditLimit)}.`}
                    {app.aiScore>0&&app.aiScore<65 && `High risk profile detected. Multiple negative signals. AI recommends decline. No credit limit assigned.`}
                    {app.aiScore===0 && `Analysis incomplete — missing required documents. Request the outstanding documents before proceeding.`}
                  </p>
                  {app.creditLimit>0 && (
                    <div style={{ display:"flex", gap:20 }}>
                      <div><div style={{ fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".06em" }}>Suggested Limit</div><div style={{ fontWeight:700, fontSize:16 }}>{fmt(app.creditLimit)}</div></div>
                      <div><div style={{ fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".06em" }}>Monthly Payment</div><div style={{ fontWeight:700, fontSize:16 }}>{fmt(app.monthlyPay)}</div></div>
                      <div><div style={{ fontSize:10, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".06em" }}>Term</div><div style={{ fontWeight:700, fontSize:16 }}>{app.term} months</div></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Document Review ────────────────────────────────────────────────────────
const DocReview = ({ app }) => {
  const docs = [
    { key:"id",      label:"Photo ID (Front)",       icon:"🪪", hint:app.idType==="passport"?"Passport":"Driving Licence / National ID" },
    { key:"idBack",  label:"Photo ID (Back)",         icon:"🪪", hint:"Reverse side — required for non-passport ID" },
    { key:"address", label:"Proof of Address",        icon:"🏠", hint:"Utility bill or bank statement · within 90 days" },
    { key:"company", label:"Company Registration",    icon:"🏢", hint:"Companies House certificate or Articles" },
    { key:"selfie",  label:"Biometric Selfie",        icon:"🤳", hint:"Used for AI facial geometry comparison" },
  ];

  const required = ["id","address","selfie"];

  return (
    <div>
      <div style={{ padding:"12px 16px", background:"rgba(22,71,143,.06)", border:"1px solid rgba(22,71,143,.15)", borderRadius:"var(--radius-sm)", marginBottom:20, fontSize:13, lineHeight:1.5 }}>
        <strong>Document verification status</strong> — uploaded files are encrypted and stored with AES-256. Only authorised staff and the AI system can access them.
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:16 }}>
        {docs.map(doc => {
          const uploaded = app.docs[doc.key];
          const isReq = required.includes(doc.key);
          return (
            <div key={doc.key}>
              <div className={`doc-thumb ${uploaded?"uploaded":"missing"}`} style={{
                border:`1px solid ${uploaded?"#1b6b4a":"#a3331f"}33`,
                background: uploaded?"rgba(27,107,74,.05)":"rgba(163,51,31,.03)",
              }}>
                <div style={{ fontSize:36 }}>{doc.icon}</div>
                {uploaded ? (
                  <div style={{ textAlign:"center", padding:"0 10px" }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"#1b6b4a", marginBottom:2 }}>{doc.label}</div>
                    <div style={{ fontSize:10, color:"var(--muted)" }}>Uploaded · Encrypted</div>
                    <div style={{ fontSize:10, background:"rgba(27,107,74,.12)", color:"#1b6b4a", padding:"2px 8px", borderRadius:10, marginTop:6, display:"inline-block", fontWeight:600 }}>VERIFIED</div>
                  </div>
                ) : (
                  <div style={{ textAlign:"center", padding:"0 10px" }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"#a3331f", marginBottom:2 }}>{doc.label}</div>
                    <div style={{ fontSize:10, color:"var(--muted)" }}>{isReq?"Required — not uploaded":"Not provided"}</div>
                    <div style={{ fontSize:10, background:"rgba(163,51,31,.1)", color:"#a3331f", padding:"2px 8px", borderRadius:10, marginTop:6, display:"inline-block", fontWeight:600 }}>MISSING</div>
                  </div>
                )}
              </div>
              <div style={{ fontSize:11, color:"var(--muted)", marginTop:6, paddingLeft:2 }}>{doc.hint}{isReq&&<span style={{ color:"#a3331f" }}> · Required</span>}</div>
            </div>
          );
        })}
      </div>

      {Object.values(app.docs).some(v=>!v) && (
        <div style={{ marginTop:20, padding:"14px 16px", background:"rgba(163,51,31,.07)", border:"1px solid rgba(163,51,31,.2)", borderRadius:"var(--radius-sm)", fontSize:13 }}>
          <strong style={{ color:"#a3331f" }}>Missing documents</strong> — the applicant has not uploaded all required files. Use the Decision tab to request the outstanding documents.
        </div>
      )}
    </div>
  );
};

// ── Decision Panel ─────────────────────────────────────────────────────────
const DecisionPanel = ({ app, onDecide }) => {
  const [decision, setDecision] = useState(app.decision||null);
  const [note, setNote] = useState(app.decisionNote||"");
  const [by, setBy] = useState("staff");
  const [sent, setSent] = useState(!!app.decision);
  const [sending, setSending] = useState(false);

  const submit = () => {
    if (!decision) return;
    setSending(true);
    setTimeout(() => {
      setSent(true); setSending(false);
      onDecide({ decision, note, by });
    }, 1200);
  };

  if (sent && app.decision) {
    const isApproved = app.decision==="approved";
    const isDeclined = app.decision==="declined";
    const col = isApproved?"#1b6b4a":isDeclined?"#a3331f":"#8b6a3a";
    return (
      <div>
        <div style={{ padding:"24px", borderRadius:"var(--radius)", border:`2px solid ${col}33`, background:`${col}08`, textAlign:"center" }}>
          <div style={{ fontSize:42, marginBottom:10 }}>{isApproved?"✅":isDeclined?"❌":"📋"}</div>
          <div style={{ fontFamily:"var(--serif)", fontSize:22, color:col, marginBottom:8 }}>
            {isApproved?"Application Approved":isDeclined?"Application Declined":"Documents Requested"}
          </div>
          <p style={{ fontSize:13, color:"var(--muted)", maxWidth:400, margin:"0 auto 16px", lineHeight:1.5 }}>{app.decisionNote}</p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <div style={{ fontSize:12 }}><span style={{ color:"var(--muted)" }}>Decision by: </span>
              {app.decisionBy==="ai" ? <span className="cr-chip ai"><Ic.AI s={11}/> AI System</span> : <span className="cr-chip staff"><Ic.User s={11}/> Staff Member</span>}
            </div>
            {app.decisionAt && <div style={{ fontSize:12, color:"var(--muted)" }}><Ic.Clock s={12}/> {fmtDate(app.decisionAt.slice(0,10))} at {fmtTime(app.decisionAt)}</div>}
            {isApproved && app.creditLimit>0 && <div style={{ fontSize:12 }}><span style={{ color:"var(--muted)" }}>Limit: </span><strong>{fmt(app.creditLimit)}</strong></div>}
          </div>
        </div>
        {(app.status==="ai_warn"||app.status==="docs_req") && !app.decision && (
          <button className="btn btn-ghost" style={{ marginTop:14 }} onClick={()=>setSent(false)}>Override Decision</button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontFamily:"var(--serif)", fontSize:18, marginBottom:4 }}>Make a Decision</div>
        <p style={{ fontSize:13, color:"var(--muted)", lineHeight:1.5 }}>
          {app.aiRecommendation==="approve" && "AI recommends approval. You may confirm or override this recommendation."}
          {app.aiRecommendation==="decline" && "AI recommends decline. You may confirm or override this recommendation."}
          {app.aiRecommendation==="manual_review" && "AI has flagged this application for manual review. Please assess all checks before deciding."}
          {app.aiRecommendation==="docs_required" && "Required documents are missing. Request the outstanding documents or decline."}
          {!app.aiRecommendation && "AI analysis has not been run yet. You may still make a manual decision."}
        </p>
      </div>

      {/* AI recommendation banner */}
      {app.aiRecommendation && (
        <div style={{ padding:"12px 16px", borderRadius:"var(--radius-sm)", marginBottom:20, display:"flex", alignItems:"center", gap:12,
          background: app.aiRecommendation==="approve"?"rgba(27,107,74,.08)":app.aiRecommendation==="decline"?"rgba(163,51,31,.07)":"rgba(184,147,90,.08)",
          border: `1px solid ${app.aiRecommendation==="approve"?"rgba(27,107,74,.25)":app.aiRecommendation==="decline"?"rgba(163,51,31,.22)":"rgba(184,147,90,.3)"}`,
        }}>
          <Ic.AI s={18} />
          <div style={{ fontSize:13 }}>
            <strong>AI Recommendation: </strong>
            <span style={{ textTransform:"capitalize", fontWeight:600 }}>{app.aiRecommendation.replace(/_/g," ")}</span>
            {app.aiScore!==null&&<span style={{ color:"var(--muted)", marginLeft:8 }}>· Score {app.aiScore}/100</span>}
          </div>
        </div>
      )}

      {/* Decision buttons */}
      <div style={{ display:"flex", gap:12, marginBottom:20 }}>
        <button className={`decision-btn approve${decision==="approved"?" selected":""}`} onClick={()=>setDecision("approved")}>
          <span style={{ fontSize:24 }}>✅</span>
          <span>Approve</span>
          {app.creditLimit>0&&<span style={{ fontSize:11, opacity:.8 }}>{fmt(app.creditLimit)} limit</span>}
        </button>
        <button className={`decision-btn decline${decision==="declined"?" selected":""}`} onClick={()=>setDecision("declined")}>
          <span style={{ fontSize:24 }}>❌</span>
          <span>Decline</span>
          <span style={{ fontSize:11, opacity:.8 }}>No credit issued</span>
        </button>
        <button className={`decision-btn request${decision==="docs_req"?" selected":""}`} onClick={()=>setDecision("docs_req")}>
          <span style={{ fontSize:24 }}>📋</span>
          <span>Request Docs</span>
          <span style={{ fontSize:11, opacity:.8 }}>Email applicant</span>
        </button>
      </div>

      {/* Decision by */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:12, fontWeight:600, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:8 }}>Decision recorded by</div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={()=>setBy("staff")} style={{ flex:1, padding:"9px 14px", borderRadius:"var(--radius-sm)", border:`1px solid ${by==="staff"?"var(--ink)":"var(--line-2)"}`, background:by==="staff"?"var(--ink)":"var(--surface)", color:by==="staff"?"#fff":"var(--muted)", cursor:"pointer", fontSize:12, fontWeight:500, display:"flex", alignItems:"center", gap:7, justifyContent:"center" }}>
            <Ic.User s={13}/> Staff Member
          </button>
          <button onClick={()=>setBy("ai")} style={{ flex:1, padding:"9px 14px", borderRadius:"var(--radius-sm)", border:`1px solid ${by==="ai"?"#16478f":"var(--line-2)"}`, background:by==="ai"?"rgba(22,71,143,.1)":"var(--surface)", color:by==="ai"?"#16478f":"var(--muted)", cursor:"pointer", fontSize:12, fontWeight:500, display:"flex", alignItems:"center", gap:7, justifyContent:"center" }}>
            <Ic.AI s={13}/> AI System
          </button>
        </div>
      </div>

      {/* Notes */}
      <div style={{ marginBottom:20 }}>
        <label style={{ fontSize:12, fontWeight:600, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".05em", display:"block", marginBottom:6 }}>
          Decision notes {decision==="docs_req"&&<span style={{ color:"#8b6a3a" }}>— will be sent to applicant</span>}
        </label>
        <textarea
          value={note} onChange={e=>setNote(e.target.value)}
          placeholder={decision==="approved"?"e.g. All checks passed — approved at recommended limit.":decision==="declined"?"e.g. High risk profile — active CCJs exceed threshold.":decision==="docs_req"?"e.g. Please upload your selfie photo and company registration certificate.":"Add your decision rationale…"}
          rows={4}
          style={{ width:"100%", padding:"10px 12px", border:"1px solid var(--line-2)", borderRadius:"var(--radius-sm)", fontFamily:"var(--sans)", fontSize:13, resize:"vertical", background:"var(--surface)", color:"var(--ink)" }}
        />
      </div>

      <div style={{ display:"flex", gap:10 }}>
        <button className="btn btn-primary" onClick={submit} disabled={!decision||sending} style={{ display:"flex", alignItems:"center", gap:8, flex:1, justifyContent:"center" }}>
          {sending ? "Submitting…" : <><Ic.Send s={14}/> Confirm Decision</>}
        </button>
      </div>
      {!decision && <div style={{ fontSize:12, color:"var(--muted)", textAlign:"center", marginTop:8 }}>Select a decision above to proceed</div>}
    </div>
  );
};

// ── Application Detail Modal ───────────────────────────────────────────────
const AppDetail = ({ app: initApp, onClose, onUpdate }) => {
  const [app, setApp] = useState(initApp);
  const [tab, setTab] = useState("overview");
  const [aiDone, setAiDone] = useState(!!initApp.aiResults);

  const update = (changes) => {
    const updated = { ...app, ...changes };
    setApp(updated);
    onUpdate(updated);
  };

  const handleDecision = ({ decision, note, by }) => {
    const statusMap = { approved:"approved", declined:"declined", docs_req:"docs_req" };
    update({
      decision,
      decisionNote: note,
      decisionBy: by,
      decisionAt: new Date().toISOString(),
      status: statusMap[decision]||decision,
    });
  };

  const TABS = [
    { id:"overview",  label:"Overview"          },
    { id:"documents", label:"Documents"         },
    { id:"ai",        label:"AI Verification"   },
    { id:"decision",  label:"Decision"          },
  ];

  const riskColor = app.aiScore>=85?"#1b6b4a":app.aiScore>=65?"#b8935a":app.aiScore>0?"#a3331f":"#999";

  return (
    <div className="cr-modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="cr-modal">
        {/* Header */}
        <div className="cr-modal-head">
          <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
            <ScoreRing score={app.aiScore} size={56} />
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:2 }}>
                <h2 style={{ fontFamily:"var(--serif)", fontSize:22 }}>{app.company}</h2>
                <StatusBadge s={app.status} />
                {app.decisionBy==="ai"?<span className="cr-chip ai"><Ic.AI s={11}/> AI Verified</span>:app.decisionBy?<span className="cr-chip staff"><Ic.User s={11}/> Staff Verified</span>:null}
              </div>
              <div style={{ fontSize:12, color:"var(--muted)", display:"flex", gap:14 }}>
                <span>{app.id}</span><span>{app.contact} · {app.role}</span><span>Submitted {fmtDate(app.submitted.slice(0,10))}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ border:"1px solid var(--line-2)", borderRadius:"50%", width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", background:"var(--surface)", cursor:"pointer", color:"var(--muted)" }}><Ic.X s={14}/></button>
        </div>

        {/* Tabs */}
        <div className="cr-tabs">
          {TABS.map(t=>(
            <button key={t.id} className={`cr-tab${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>
              {t.label}
              {t.id==="ai"&&app.aiResults&&!aiDone&&<span style={{ marginLeft:6, width:7, height:7, borderRadius:"50%", background:"#b8935a", display:"inline-block" }}/>}
            </button>
          ))}
        </div>

        {/* Tab body */}
        <div className="cr-modal-body">
          <div className="cr-tab-body">
            {tab==="overview" && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:22 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:12 }}>Company Details</div>
                  {[
                    ["Company",app.company],["Company Reg",app.companyReg],["VAT Number",app.vat||"—"],
                    ["Address",app.address],["Annual Revenue",fmt(app.annualRev)],
                    ["Years Trading",app.yearsTrading+" years"],["CCJs",app.ccjs],
                  ].map(([l,v])=>(
                    <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid var(--line)", fontSize:13, gap:8 }}>
                      <span style={{ color:"var(--muted)", flexShrink:0 }}>{l}</span><strong style={{ textAlign:"right" }}>{v}</strong>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:12 }}>Director / Applicant</div>
                  {[
                    ["Full Name",app.director],["Date of Birth",fmtDate(app.dob)],
                    ["Home Address",app.dirAddress],["ID Type",app.idType],["ID Number",app.idNumber],
                    ["Email",app.email],["Phone",app.phone],
                  ].map(([l,v])=>(
                    <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid var(--line)", fontSize:13, gap:8 }}>
                      <span style={{ color:"var(--muted)", flexShrink:0 }}>{l}</span><strong style={{ textAlign:"right" }}>{v}</strong>
                    </div>
                  ))}
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:12 }}>Finance Terms</div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
                    {[["Finance Amount",fmt(app.financeAmt),"#16478f"],["Monthly Payment",fmt(app.monthlyPay)+"/mo","#0b2f6b"],["Term",app.term+" months","#8b6a3a"],["Proposal Ref",app.propId,"#555"]].map(([l,v,c])=>(
                      <div key={l} style={{ padding:"14px 16px", background:"var(--bg-alt)", borderRadius:"var(--radius-sm)", textAlign:"center" }}>
                        <div style={{ fontSize:11, color:"var(--muted)", marginBottom:6 }}>{l}</div>
                        <div style={{ fontWeight:700, fontSize:16, color:c, fontFamily:"var(--serif)" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {tab==="documents" && <DocReview app={app} />}
            {tab==="ai" && <AIEngine app={app} onComplete={()=>setAiDone(true)} />}
            {tab==="decision" && <DecisionPanel app={app} onDecide={handleDecision} />}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Admin Shell ────────────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard", label:"Dashboard",       Icon:Ic.Dashboard, badge:null    },
  { id:"queue",     label:"All Applications",Icon:Ic.Queue,     badge:"queue" },
  { id:"pending",   label:"Pending Review",  Icon:Ic.Clock,     badge:"warn"  },
  { id:"approved",  label:"Approved",        Icon:Ic.Approved,  badge:null    },
  { id:"declined",  label:"Declined",        Icon:Ic.Declined,  badge:null    },
];

function CreditApp() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [apps, setApps] = useState(APPS);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    const auth = sessionStorage.getItem("np_portal_auth");
    if (!auth) { window.location.href="index.html"; return; }
    const u = JSON.parse(auth);
    if (u.type !== "credit") { window.location.href="index.html"; return; }
    setUser(u);
  }, []);

  if (!user) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", fontFamily:"var(--sans)", color:"var(--muted)" }}>Verifying access…</div>;

  const logout = () => { sessionStorage.removeItem("np_portal_auth"); window.location.href="index.html"; };

  const updateApp = (updated) => {
    setApps(prev => prev.map(a => a.id===updated.id ? updated : a));
    if (detail?.id===updated.id) setDetail(updated);
  };

  const navBadge = (badge) => {
    if (badge==="queue") return apps.filter(a=>a.status==="pending"||a.status==="ai_review").length||null;
    if (badge==="warn")  return apps.filter(a=>a.status==="ai_warn"||a.status==="docs_req").length||null;
    return null;
  };

  const activeLabel = NAV.find(n=>n.id===view)?.label||"";

  let content;
  if (view==="dashboard") content = <Dashboard apps={apps} onViewApp={a=>{setDetail(a);}} />;
  else if (view==="queue")    content = <AppQueue apps={apps} onView={a=>setDetail(a)} />;
  else if (view==="pending")  content = <AppQueue apps={apps.filter(a=>a.status==="ai_warn"||a.status==="docs_req"||a.status==="pending")} onView={a=>setDetail(a)} statusFilter="all" />;
  else if (view==="approved") content = <AppQueue apps={apps.filter(a=>a.status==="approved")} onView={a=>setDetail(a)} statusFilter="all" />;
  else if (view==="declined") content = <AppQueue apps={apps.filter(a=>a.status==="declined")} onView={a=>setDetail(a)} statusFilter="all" />;

  return (
    <div className="cr-shell">
      {/* Sidebar */}
      <aside className="cr-sidebar">
        <div className="cr-logo">
          <div className="cr-logo-mark">N</div>
          <div>
            <div style={{ fontFamily:"var(--serif)", fontSize:14, color:"#f2eee3", lineHeight:1.1 }}>NexaPoint</div>
            <div style={{ fontSize:9, letterSpacing:".14em", textTransform:"uppercase", color:"rgba(255,255,255,.35)", fontWeight:600 }}>Credit Portal</div>
          </div>
        </div>
        <nav style={{ flex:1, padding:"10px 0" }}>
          <div className="cr-nav-section">Credit Management</div>
          {NAV.map(n=>{
            const count = navBadge(n.badge);
            return (
              <button key={n.id} className={`cr-nav-item${view===n.id?" active":""}`} onClick={()=>setView(n.id)}>
                <n.Icon s={15}/>{n.label}
                {count ? <span className="cr-badge">{count}</span> : null}
              </button>
            );
          })}
          <div className="cr-nav-section" style={{ marginTop:12 }}>AI System</div>
          <div style={{ padding:"10px 14px", margin:"2px 6px", borderRadius:7, background:"rgba(22,71,143,.15)", border:"1px solid rgba(22,71,143,.2)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#4ade80", animation:"pulse 2s infinite" }}/>
              <span style={{ fontSize:11, color:"#c8dff8", fontWeight:600 }}>AI Engine Active</span>
            </div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,.4)", lineHeight:1.5 }}>NexaPoint AI v3.2<br/>8-point verification<br/>~11 sec / application</div>
          </div>
        </nav>
        <div className="cr-user">
          <div className="cr-avatar">OR</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#f2eee3", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.name}</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,.38)" }}>{user.role}</div>
          </div>
          <button onClick={logout} title="Logout" style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,.3)", display:"flex", padding:4 }}>
            <Ic.Logout s={14}/>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="cr-main">
        <div className="cr-topbar">
          <Ic.Shield s={15}/>
          <span style={{ fontSize:13, color:"var(--muted)" }}>Credit &amp; Compliance</span>
          <span style={{ fontSize:13, color:"var(--muted)" }}>/</span>
          <span style={{ fontSize:13, fontWeight:600 }}>{activeLabel}</span>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:12, color:"var(--muted)" }}>{user.email}</span>
            <button className="btn btn-ghost" style={{ fontSize:12, padding:"5px 12px", display:"flex", alignItems:"center", gap:6 }} onClick={logout}>
              <Ic.Logout s={13}/> Sign out
            </button>
          </div>
        </div>
        <div className="cr-content">{content}</div>
      </main>

      {/* Detail modal */}
      {detail && <AppDetail app={detail} onClose={()=>setDetail(null)} onUpdate={updateApp} />}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<CreditApp/>);
