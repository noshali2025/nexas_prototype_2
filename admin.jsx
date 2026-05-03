// NexaPoint — System Administrator Portal

const { useState, useEffect, useRef } = React;

// ── Formatters ─────────────────────────────────────────────────────────────
const fmt = (v) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v || 0);
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); } catch { return d; } };
const fmtK = (v) => v >= 1000 ? `£${(v/1000).toFixed(0)}k` : fmt(v);
const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();

// ── Icons ──────────────────────────────────────────────────────────────────
const Ic = {
  Dashboard: ({s=18}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Proposals: ({s=18}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Credit:    ({s=18}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Hardware:  ({s=18}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  Software:  ({s=18}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  Sim:       ({s=18}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M15 2v5H9V2"/></svg>,
  Staff:     ({s=18}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Payroll:   ({s=18}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Reports:   ({s=18}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Plus:      ({s=15}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Edit:      ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:     ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  X:         ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check:     ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Logout:    ({s=16}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Eye:       ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Search:    ({s=15}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Download:  ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Shield:    ({s=18}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

// ── Status meta ────────────────────────────────────────────────────────────
const SM = {
  active:       { label:"Active",       color:"#1b6b4a", bg:"rgba(27,107,74,.10)" },
  inactive:     { label:"Inactive",     color:"#a3331f", bg:"rgba(163,51,31,.10)" },
  approved:     { label:"Approved",     color:"#1b6b4a", bg:"rgba(27,107,74,.10)" },
  pending:      { label:"Pending",      color:"#b8935a", bg:"rgba(184,147,90,.12)" },
  review:       { label:"Review",       color:"#16478f", bg:"rgba(22,71,143,.10)" },
  declined:     { label:"Declined",     color:"#a3331f", bg:"rgba(163,51,31,.10)" },
  new:          { label:"New",          color:"#b8935a", bg:"rgba(184,147,90,.12)" },
  scheduled:    { label:"Scheduled",    color:"#0b2f6b", bg:"rgba(11,47,107,.10)" },
  "in-progress":{ label:"In Progress",  color:"#8b6a3a", bg:"rgba(139,106,58,.12)" },
  completed:    { label:"Completed",    color:"#5b6b86", bg:"rgba(91,107,134,.10)" },
  rejected:     { label:"Rejected",     color:"#a3331f", bg:"rgba(163,51,31,.10)" },
};

const Badge = ({ s }) => {
  const m = SM[s] || { label: s, color:"#666", bg:"#eee" };
  return <span className="badge" style={{ color: m.color, background: m.bg }}>{m.label}</span>;
};

// ── Seed Data ──────────────────────────────────────────────────────────────
const INIT_HARDWARE = [
  { id:"hw1",  name:'MacBook Pro M4 14"',      cat:"Laptop",  price:1999, qty:48, sku:"MB-M4-14-1TB",  status:"active" },
  { id:"hw2",  name:'MacBook Pro M4 16"',      cat:"Laptop",  price:2799, qty:22, sku:"MB-M4-16-2TB",  status:"active" },
  { id:"hw3",  name:'MacBook Air M4 15"',      cat:"Laptop",  price:1299, qty:35, sku:"MBA-M4-15-512", status:"active" },
  { id:"hw4",  name:'iMac M4 24"',             cat:"Desktop", price:1599, qty:31, sku:"IM-M4-24-512",  status:"active" },
  { id:"hw5",  name:"iPhone 16 Pro 256GB",     cat:"Phone",   price:1099, qty:85, sku:"IP-16P-256",    status:"active" },
  { id:"hw6",  name:"iPhone 16 128GB",         cat:"Phone",   price:799,  qty:120,sku:"IP-16-128",     status:"active" },
  { id:"hw7",  name:"Samsung Galaxy S25 Ultra",cat:"Phone",   price:1299, qty:38, sku:"SS-S25U-256",   status:"active" },
  { id:"hw8",  name:"Samsung Galaxy S25",      cat:"Phone",   price:899,  qty:62, sku:"SS-S25-128",    status:"active" },
  { id:"hw9",  name:'iPad Pro M4 11"',         cat:"Tablet",  price:1199, qty:55, sku:"IPADP-M4-11",   status:"active" },
  { id:"hw10", name:"iPad Air M3",             cat:"Tablet",  price:799,  qty:43, sku:"IPAD-AIR-M3",   status:"active" },
  { id:"hw11", name:"Zebra MC9300 Scanner",    cat:"Other",   price:2450, qty:18, sku:"ZB-MC9300",     status:"active" },
  { id:"hw12", name:"Epson TM-T88VII Receipt", cat:"Other",   price:320,  qty:35, sku:"EP-T88VII",     status:"active" },
];

const INIT_SOFTWARE = [
  { id:"sw1",  name:"NexaPoint ERP Suite",        cat:"ERP",        monthly:249, setup:4500, status:"active", tag:"ERP"       },
  { id:"sw2",  name:"Business Management System", cat:"Operations", monthly:149, setup:2200, status:"active", tag:"BMS"       },
  { id:"sw3",  name:"CRM Enterprise",             cat:"Sales",      monthly:129, setup:1800, status:"active", tag:"CRM"       },
  { id:"sw4",  name:"Inventory & Warehouse",       cat:"Supply",     monthly:119, setup:2000, status:"active", tag:"INV"       },
  { id:"sw5",  name:"Accounting & Finance",        cat:"Finance",    monthly:99,  setup:1500, status:"active", tag:"ACC"       },
  { id:"sw6",  name:"HR & Payroll",               cat:"HR",         monthly:89,  setup:1200, status:"active", tag:"HR"        },
  { id:"sw7",  name:"Field Service Manager",      cat:"Operations", monthly:79,  setup:1100, status:"active", tag:"FSM"       },
  { id:"sw8",  name:"Analytics & BI Platform",    cat:"Analytics",  monthly:119, setup:2400, status:"active", tag:"BI"        },
  { id:"sw9",  name:"Document Management",        cat:"Admin",      monthly:45,  setup:600,  status:"active", tag:"DMS"       },
  { id:"sw10", name:"Training & LMS",             cat:"HR",         monthly:59,  setup:900,  status:"active", tag:"LMS"       },
];

const INIT_SIMS = [
  { id:"sim1", name:"5G Pro Unlimited",    network:"EE",       monthly:35, data:"Unlimited", calls:"Unlimited", status:"active" },
  { id:"sim2", name:"5G Business 100GB",  network:"Vodafone", monthly:25, data:"100 GB",    calls:"Unlimited", status:"active" },
  { id:"sim3", name:"4G Standard 20GB",   network:"O2",       monthly:15, data:"20 GB",     calls:"1,000 min", status:"active" },
  { id:"sim4", name:"5G IoT Connect",     network:"Three",    monthly:12, data:"5 GB",      calls:"Data only", status:"active" },
  { id:"sim5", name:"Global Roaming Pro", network:"EE",       monthly:45, data:"50 GB roam",calls:"Unlimited", status:"active" },
  { id:"sim6", name:"M2M Data SIM",       network:"Vodafone", monthly:8,  data:"1 GB",      calls:"Data only", status:"active" },
];

const INIT_STAFF = [
  { id:"s1",  name:"Sarah Chen",      email:"s.chen@nexapoint.io",      phone:"+44 7700 900001", dept:"Engineering",  type:"engineer",     role:"Lead Implementation Engineer", salary:85000, dailyRate:650, start:"2022-03-15", status:"active", avatar:"SC", ac:"#0b2f6b" },
  { id:"s2",  name:"Mark O'Brien",    email:"m.obrien@nexapoint.io",    phone:"+44 7700 900002", dept:"Engineering",  type:"engineer",     role:"Solutions Architect",           salary:95000, dailyRate:750, start:"2021-07-01", status:"active", avatar:"MO", ac:"#16478f" },
  { id:"s3",  name:"Priya Patel",     email:"p.patel@nexapoint.io",     phone:"+44 7700 900003", dept:"Engineering",  type:"engineer",     role:"ERP Consultant",                salary:72000, dailyRate:550, start:"2023-01-09", status:"active", avatar:"PP", ac:"#b8935a" },
  { id:"s4",  name:"James Wilson",    email:"j.wilson@nexapoint.io",    phone:"+44 7700 900004", dept:"Engineering",  type:"engineer",     role:"Data Migration Specialist",     salary:76000, dailyRate:580, start:"2022-09-19", status:"active", avatar:"JW", ac:"#1b6b4a" },
  { id:"s5",  name:"Emma Clarke",     email:"e.clarke@nexapoint.io",    phone:"+44 7700 900005", dept:"Engineering",  type:"engineer",     role:"Training Lead",                 salary:65000, dailyRate:480, start:"2023-04-03", status:"active", avatar:"EC", ac:"#8b6a3a" },
  { id:"s6",  name:"Raj Kumar",       email:"r.kumar@nexapoint.io",     phone:"+44 7700 900006", dept:"Engineering",  type:"engineer",     role:"DevOps & Infrastructure",       salary:82000, dailyRate:600, start:"2021-11-22", status:"active", avatar:"RK", ac:"#a3331f" },
  { id:"s7",  name:"Lisa Thompson",   email:"l.thompson@nexapoint.io",  phone:"+44 7700 900007", dept:"Engineering",  type:"engineer",     role:"Project Manager",               salary:70000, dailyRate:520, start:"2022-06-13", status:"active", avatar:"LT", ac:"#5b6b86" },
  { id:"s8",  name:"Tom Bradley",     email:"t.bradley@nexapoint.io",   phone:"+44 7700 900008", dept:"Sales",        type:"installation", role:"Senior Sales Executive",        salary:55000, dailyRate:420, start:"2022-08-01", status:"active", avatar:"TB", ac:"#0b5b3a" },
  { id:"s9",  name:"Nadia Hassan",    email:"n.hassan@nexapoint.io",    phone:"+44 7700 900009", dept:"Proposals",    type:"proposal",     role:"Proposal Manager",              salary:62000, dailyRate:480, start:"2023-02-14", status:"active", avatar:"NH", ac:"#6b0b6b" },
  { id:"s10", name:"Chris Watts",     email:"c.watts@nexapoint.io",     phone:"+44 7700 900010", dept:"Installation", type:"installation", role:"Installation Coordinator",      salary:48000, dailyRate:350, start:"2023-06-19", status:"active", avatar:"CW", ac:"#3a5b6b" },
  { id:"s11", name:"Sophie Lau",      email:"s.lau@nexapoint.io",       phone:"+44 7700 900011", dept:"Sales",        type:"installation", role:"Pre-Sales Engineer",            salary:68000, dailyRate:520, start:"2022-04-25", status:"active", avatar:"SL", ac:"#6b4a0b" },
  { id:"s12", name:"Daniel Foster",   email:"d.foster@nexapoint.io",    phone:"+44 7700 900012", dept:"Sales",        type:"installation", role:"Account Manager",               salary:52000, dailyRate:390, start:"2023-09-04", status:"active", avatar:"DF", ac:"#0b6b4a" },
  { id:"s13", name:"Hannah White",    email:"h.white@nexapoint.io",     phone:"+44 7700 900013", dept:"Operations",   type:"portal",       role:"Operations Manager",            salary:78000, dailyRate:580, start:"2021-05-17", status:"active", avatar:"HW", ac:"#6b1b3a" },
  { id:"s14", name:"Alex Rodriguez",  email:"a.rodriguez@nexapoint.io", phone:"+44 7700 900014", dept:"Installation", type:"installation", role:"Field Installation Technician", salary:44000, dailyRate:320, start:"2024-01-08", status:"active", avatar:"AR", ac:"#3a6b1b" },
];

const DEMO_PROPOSALS = [
  { id:"NP-2026-48291", date:"2026-04-25", client:{ company:"Meridian Healthcare Group", contact:"Dr. Sarah Mitchell", role:"Chief Digital Officer", email:"s.mitchell@meridian.nhs.uk" }, totals:{ oneTime:28000, monthly:2400, impl:4500, year1:61300 }, payment:"creditsafe", status:"approved",     priority:"high",   items:"Healthcare Ops Bundle — MacBook Pro M4 ×8, Clinical Records, 5G Pro ×8" },
  { id:"NP-2026-47103", date:"2026-04-22", client:{ company:"Vertex Logistics PLC",      contact:"Marcus Chambers",    role:"Head of IT",            email:"m.chambers@vertex.co.uk"   }, totals:{ oneTime:19500, monthly:1650, impl:3200, year1:42500 }, payment:"wire",       status:"scheduled",   priority:"normal", items:"Logistics Bundle — Galaxy S25 ×12, Field Service, 5G Business ×12" },
  { id:"NP-2026-46872", date:"2026-04-18", client:{ company:"Arcadia Hospitality Ltd",   contact:"Camille Dupont",     role:"IT Director",           email:"c.dupont@arcadia.com"      }, totals:{ oneTime:34000, monthly:3100, impl:6000, year1:77200 }, payment:"creditsafe", status:"review",      priority:"high",   items:"Hospitality Tech — iPhone 16 Pro ×20, POS & Inventory, CRM, 5G Pro ×20" },
  { id:"NP-2026-45590", date:"2026-04-15", client:{ company:"Sterling Finance Corp",      contact:"Jonathan Park",      role:"CTO",                   email:"j.park@sterling.co.uk"     }, totals:{ oneTime:52000, monthly:4200, impl:8500, year1:110900}, payment:"creditsafe", status:"in-progress", priority:"high",   items:"Finance Ops Bundle — MacBook Pro ×15, iMac ×6, Finance Suite, CRM, BI" },
  { id:"NP-2026-44218", date:"2026-04-10", client:{ company:"Bloom Education Trust",      contact:"Rachel Greene",      role:"Head of Digital",       email:"r.greene@bloom-edu.org.uk" }, totals:{ oneTime:16000, monthly:1200, impl:2800, year1:33200 }, payment:"po",         status:"completed",   priority:"normal", items:"Education Bundle — iPad Pro ×30, Training & LMS, Document Management" },
];

const CREDIT_APPS = [
  { id:"CA-001", propId:"NP-2026-48291", company:"Meridian Healthcare Group", contact:"Dr. Sarah Mitchell", date:"2026-04-25", financeAmt:61300, term:36, monthly:1958, score:82, limit:75000,  status:"approved", annualRev:"£12M",  years:18, ccjs:"None"        },
  { id:"CA-002", propId:"NP-2026-45590", company:"Sterling Finance Corp",      contact:"Jonathan Park",       date:"2026-04-15", financeAmt:110900,term:36, monthly:3543, score:91, limit:120000, status:"approved", annualRev:"£85M",  years:32, ccjs:"None"        },
  { id:"CA-003", propId:"NP-2026-46872", company:"Arcadia Hospitality Ltd",   contact:"Camille Dupont",      date:"2026-04-18", financeAmt:77200, term:36, monthly:2464, score:68, limit:35000,  status:"review",   annualRev:"£4.2M", years:7,  ccjs:"1 satisfied" },
  { id:"CA-004", propId:"NP-2026-43100", company:"Highfield Retail Group",    contact:"Mark Stevens",        date:"2026-04-05", financeAmt:28900, term:24, monthly:1371, score:74, limit:30000,  status:"pending",  annualRev:"£8M",   years:11, ccjs:"None"        },
  { id:"CA-005", propId:"NP-2026-41880", company:"ClearPath Recruitment",     contact:"Amy Holloway",        date:"2026-03-28", financeAmt:15500, term:24, monthly:735,  score:61, limit:0,      status:"declined", annualRev:"£1.1M", years:3,  ccjs:"2 active"    },
];

const REV_MONTHS = [
  { month:"Nov '25", hw:42000, sw:28500, impl:12000 },
  { month:"Dec '25", hw:38000, sw:31000, impl:9500  },
  { month:"Jan '26", hw:55000, sw:34000, impl:18000 },
  { month:"Feb '26", hw:61000, sw:38000, impl:22000 },
  { month:"Mar '26", hw:48000, sw:35500, impl:15000 },
  { month:"Apr '26", hw:133500,sw:47000, impl:25000 },
];

// ── Confirm modal ──────────────────────────────────────────────────────────
const Confirm = ({ msg, onOk, onCancel }) => (
  <div className="admin-modal-bg" onClick={e => e.target === e.currentTarget && onCancel()}>
    <div className="admin-modal" style={{ maxWidth: 380 }}>
      <div className="admin-modal-body" style={{ textAlign:"center", padding:"32px 24px" }}>
        <div style={{ width:48, height:48, borderRadius:"50%", background:"rgba(163,51,31,.1)", color:"#a3331f", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}><Ic.Trash s={22} /></div>
        <p style={{ fontSize:15, lineHeight:1.5, marginBottom:24 }}>{msg}</p>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn" style={{ background:"#a3331f", color:"#fff" }} onClick={onOk}>Delete</button>
        </div>
      </div>
    </div>
  </div>
);

// ── Dashboard ──────────────────────────────────────────────────────────────
const Dashboard = ({ staff, hardware, software, sims, creditApps }) => {
  const totalYTD = REV_MONTHS.reduce((a,m) => a+m.hw+m.sw+m.impl, 0);
  const activeProps = DEMO_PROPOSALS.filter(p => !["completed","rejected"].includes(p.status)).length;
  const pendingCredit = creditApps.filter(c => c.status==="pending"||c.status==="review").length;
  const hwValue = hardware.reduce((a,h) => a+h.price*h.qty, 0);
  const maxRev = Math.max(...REV_MONTHS.map(m=>m.hw+m.sw+m.impl));

  const stats = [
    { label:"Revenue YTD",          val:fmt(totalYTD),        sub:"Last 6 months",          col:"#0b2f6b" },
    { label:"Active Proposals",     val:activeProps,           sub:`${DEMO_PROPOSALS.length} total`,  col:"#1b6b4a" },
    { label:"Active Staff",         val:staff.filter(s=>s.status==="active").length, sub:`${staff.length} headcount`, col:"#b8935a" },
    { label:"Credit Applications",  val:creditApps.length,    sub:`${pendingCredit} need review`,     col:"#a3331f" },
    { label:"Hardware Inventory",   val:fmt(hwValue),          sub:`${hardware.length} product lines`, col:"#16478f" },
    { label:"Software Modules",     val:software.length,       sub:"Active listings",        col:"#8b6a3a" },
  ];

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:"var(--serif)", fontSize:28, marginBottom:4 }}>Admin Dashboard</h1>
        <p style={{ fontSize:13, color:"var(--muted)" }}>System-wide overview — NexaPoint operations</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:16, marginBottom:28 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card-admin" style={{ borderTopColor: s.col }}>
            <div style={{ fontSize:11, fontWeight:600, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>{s.label}</div>
            <div style={{ fontSize:30, fontWeight:700, fontFamily:"var(--serif)", color:s.col, lineHeight:1 }}>{s.val}</div>
            <div style={{ fontSize:12, color:"var(--muted)", marginTop:7 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:22, marginBottom:22 }}>
        {/* Revenue chart */}
        <div className="admin-card">
          <div style={{ fontFamily:"var(--serif)", fontSize:17, marginBottom:6 }}>Monthly Revenue</div>
          <div style={{ fontSize:12, color:"var(--muted)", marginBottom:18 }}>Hardware · Software · Implementation</div>
          <div className="rev-bar-wrap">
            {REV_MONTHS.map(m => {
              const total = m.hw+m.sw+m.impl;
              const scale = total/maxRev;
              return (
                <div key={m.month} className="rev-bar-group">
                  <div style={{ fontSize:10, color:"var(--muted)", fontWeight:600, marginBottom:4 }}>{fmtK(total)}</div>
                  <div className="rev-bar-stack">
                    <div style={{ display:"flex", flexDirection:"column", borderRadius:4, overflow:"hidden", height: `${scale*140}px` }}>
                      <div style={{ flex: m.impl/total, background:"#8b6a3a" }} title={`Impl: ${fmt(m.impl)}`} />
                      <div style={{ flex: m.sw/total,   background:"#b8935a" }} title={`SW: ${fmt(m.sw)}`} />
                      <div style={{ flex: m.hw/total,   background:"#0b2f6b" }} title={`HW: ${fmt(m.hw)}`} />
                    </div>
                  </div>
                  <div style={{ fontSize:10, color:"var(--muted)", marginTop:5 }}>{m.month.slice(0,3)}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display:"flex", gap:16, marginTop:14 }}>
            {[["Hardware","#0b2f6b"],["Software","#b8935a"],["Implementation","#8b6a3a"]].map(([l,c]) => (
              <div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"var(--muted)" }}>
                <div style={{ width:9, height:9, borderRadius:2, background:c }} />{l}
              </div>
            ))}
          </div>
        </div>

        {/* Recent proposals */}
        <div className="admin-card">
          <div style={{ fontFamily:"var(--serif)", fontSize:17, marginBottom:16 }}>Recent Proposals</div>
          <div style={{ display:"flex", flexDirection:"column" }}>
            {DEMO_PROPOSALS.map(p => (
              <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid var(--line)" }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:13 }}>{p.client.company.split(" ").slice(0,2).join(" ")}</div>
                  <div style={{ fontSize:11, color:"var(--muted)" }}>{p.id}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontWeight:700, fontSize:13, color:"#0b2f6b", marginBottom:3 }}>{fmt(p.totals.year1)}</div>
                  <Badge s={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:22 }}>
        <div className="admin-card">
          <div style={{ fontFamily:"var(--serif)", fontSize:16, marginBottom:14 }}>Staff by Department</div>
          {Object.entries(staff.reduce((a,s) => { a[s.dept]=(a[s.dept]||0)+1; return a; }, {})).map(([d,n]) => (
            <div key={d} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid var(--line)", fontSize:13 }}>
              <span style={{ color:"var(--muted)" }}>{d}</span><strong>{n}</strong>
            </div>
          ))}
        </div>
        <div className="admin-card">
          <div style={{ fontFamily:"var(--serif)", fontSize:16, marginBottom:14 }}>Credit Application Status</div>
          {[["approved","Approved"],["review","Review"],["pending","Pending"],["declined","Declined"]].map(([s,l]) => (
            <div key={s} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid var(--line)" }}>
              <Badge s={s} /><strong style={{ fontSize:14 }}>{creditApps.filter(c=>c.status===s).length}</strong>
            </div>
          ))}
        </div>
        <div className="admin-card">
          <div style={{ fontFamily:"var(--serif)", fontSize:16, marginBottom:14 }}>Top Clients by Value</div>
          {[...DEMO_PROPOSALS].sort((a,b)=>b.totals.year1-a.totals.year1).slice(0,4).map((p,i) => (
            <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid var(--line)", fontSize:12 }}>
              <div style={{ display:"flex", gap:8 }}>
                <span style={{ color:"var(--muted)", fontWeight:600, width:16 }}>#{i+1}</span>
                <span>{p.client.company.split(" ").slice(0,2).join(" ")}</span>
              </div>
              <strong style={{ color:"#0b2f6b" }}>{fmtK(p.totals.year1)}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Generic CRUD List ──────────────────────────────────────────────────────
const CrudList = ({ title, subtitle, items, cols, renderRow, onAdd, search, setSearch, filter, children }) => (
  <div>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
      <div>
        <h1 style={{ fontFamily:"var(--serif)", fontSize:26, marginBottom:4 }}>{title}</h1>
        <p style={{ fontSize:13, color:"var(--muted)" }}>{subtitle}</p>
      </div>
      {onAdd && (
        <button className="btn btn-primary" onClick={onAdd} style={{ display:"flex", alignItems:"center", gap:7 }}>
          <Ic.Plus /> Add New
        </button>
      )}
    </div>
    <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
      <div className="admin-search">
        <Ic.Search s={15} /><input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} />
      </div>
      {filter}
    </div>
    {children}
    <div className="admin-card" style={{ padding:0, overflow:"hidden" }}>
      <div style={{ overflowX:"auto" }}>
        <table className="admin-table">
          <thead><tr>{cols.map(c=><th key={c}>{c}</th>)}</tr></thead>
          <tbody>{renderRow()}</tbody>
        </table>
      </div>
    </div>
  </div>
);

// ── Hardware Management ────────────────────────────────────────────────────
const HardwareView = ({ items, setItems }) => {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const CATS = ["All","Laptop","Desktop","Phone","Tablet","Other"];
  const EMPTY = { id:"", name:"", cat:"Laptop", price:"", qty:"", sku:"", status:"active" };

  const filtered = items.filter(h =>
    (catFilter==="All" || h.cat===catFilter) &&
    (h.name.toLowerCase().includes(search.toLowerCase()) || h.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const save = (form) => {
    if (form.id) {
      setItems(prev => prev.map(h => h.id===form.id ? {...form, price:+form.price, qty:+form.qty} : h));
    } else {
      setItems(prev => [...prev, {...form, id:"hw-"+uid(), price:+form.price, qty:+form.qty}]);
    }
    setModal(null);
  };

  const del = (id) => { setItems(prev=>prev.filter(h=>h.id!==id)); setConfirm(null); };

  return (
    <>
      <CrudList title="Hardware" subtitle={`${items.length} product lines in catalogue`}
        items={items} cols={["SKU","Product","Category","Unit Price","Stock Qty","Inventory Value","Status","Actions"]}
        search={search} setSearch={setSearch} onAdd={() => setModal({...EMPTY})}
        filter={<div style={{ display:"flex", gap:6 }}>
          {CATS.map(c=><button key={c} className={`chip-filter${catFilter===c?" active":""}`} onClick={()=>setCatFilter(c)}>{c}</button>)}
        </div>}
        renderRow={() => filtered.length ? filtered.map(h => (
          <tr key={h.id}>
            <td><code style={{ fontSize:11, color:"var(--muted)" }}>{h.sku}</code></td>
            <td><strong>{h.name}</strong></td>
            <td>{h.cat}</td>
            <td>{fmt(h.price)}</td>
            <td>{h.qty}</td>
            <td style={{ fontWeight:600, color:"#0b2f6b" }}>{fmt(h.price*h.qty)}</td>
            <td><Badge s={h.status} /></td>
            <td>
              <div style={{ display:"flex", gap:6 }}>
                <button className="btn btn-ghost" style={{ padding:"4px 10px", fontSize:12 }} onClick={()=>setModal(h)}><Ic.Edit /></button>
                <button className="btn btn-ghost" style={{ padding:"4px 10px", fontSize:12, color:"#a3331f" }} onClick={()=>setConfirm(h.id)}><Ic.Trash /></button>
              </div>
            </td>
          </tr>
        )) : <tr><td colSpan={8} style={{ padding:32, textAlign:"center", color:"var(--muted)" }}>No hardware found.</td></tr>}
      />
      {modal && <HWModal item={modal} onSave={save} onClose={()=>setModal(null)} />}
      {confirm && <Confirm msg="Delete this hardware item?" onOk={()=>del(confirm)} onCancel={()=>setConfirm(null)} />}
    </>
  );
};

const HWModal = ({ item, onSave, onClose }) => {
  const [f, setF] = useState(item);
  const set = k => v => setF(p=>({...p,[k]:v}));
  return (
    <div className="admin-modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="admin-modal">
        <div className="admin-modal-head">
          <h3 style={{ fontFamily:"var(--serif)", fontSize:18 }}>{f.id?"Edit Hardware":"Add Hardware"}</h3>
          <button className="btn btn-ghost" style={{ padding:"4px 8px" }} onClick={onClose}><Ic.X /></button>
        </div>
        <div className="admin-modal-body">
          <div className="form-grid">
            <div className="field full"><label>Product Name</label><input value={f.name} onChange={e=>set("name")(e.target.value)} /></div>
            <div className="field half"><label>SKU</label><input value={f.sku} onChange={e=>set("sku")(e.target.value)} /></div>
            <div className="field half"><label>Category</label>
              <select value={f.cat} onChange={e=>set("cat")(e.target.value)}>
                {["Laptop","Desktop","Phone","Tablet","Other"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field half"><label>Unit Price (£)</label><input type="number" value={f.price} onChange={e=>set("price")(e.target.value)} /></div>
            <div className="field half"><label>Stock Quantity</label><input type="number" value={f.qty} onChange={e=>set("qty")(e.target.value)} /></div>
            <div className="field half"><label>Status</label>
              <select value={f.status} onChange={e=>set("status")(e.target.value)}>
                <option value="active">Active</option><option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
        <div className="admin-modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>onSave(f)}>Save Hardware</button>
        </div>
      </div>
    </div>
  );
};

// ── Software Management ────────────────────────────────────────────────────
const SoftwareView = ({ items, setItems }) => {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const EMPTY = { id:"", name:"", cat:"", monthly:"", setup:"", tag:"", status:"active" };

  const filtered = items.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.cat.toLowerCase().includes(search.toLowerCase())
  );

  const save = (f) => {
    if (f.id) setItems(prev=>prev.map(s=>s.id===f.id?{...f,monthly:+f.monthly,setup:+f.setup}:s));
    else setItems(prev=>[...prev,{...f,id:"sw-"+uid(),monthly:+f.monthly,setup:+f.setup}]);
    setModal(null);
  };

  return (
    <>
      <CrudList title="Software" subtitle={`${items.length} software modules listed`}
        cols={["Tag","Product Name","Category","Monthly","Setup Fee","Status","Actions"]}
        search={search} setSearch={setSearch} onAdd={()=>setModal({...EMPTY})}
        renderRow={()=>filtered.length?filtered.map(s=>(
          <tr key={s.id}>
            <td><code style={{ fontSize:11, background:"var(--bg-alt)", padding:"2px 7px", borderRadius:4 }}>{s.tag}</code></td>
            <td><strong>{s.name}</strong></td>
            <td style={{ color:"var(--muted)" }}>{s.cat}</td>
            <td style={{ fontWeight:600 }}>{fmt(s.monthly)}<span style={{ fontWeight:400, color:"var(--muted)", fontSize:11 }}>/mo</span></td>
            <td>{fmt(s.setup)}</td>
            <td><Badge s={s.status} /></td>
            <td><div style={{ display:"flex", gap:6 }}>
              <button className="btn btn-ghost" style={{ padding:"4px 10px" }} onClick={()=>setModal(s)}><Ic.Edit /></button>
              <button className="btn btn-ghost" style={{ padding:"4px 10px", color:"#a3331f" }} onClick={()=>setConfirm(s.id)}><Ic.Trash /></button>
            </div></td>
          </tr>
        )):<tr><td colSpan={7} style={{ padding:32, textAlign:"center", color:"var(--muted)" }}>No software found.</td></tr>}
      />
      {modal && (
        <div className="admin-modal-bg" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="admin-modal">
            <div className="admin-modal-head">
              <h3 style={{ fontFamily:"var(--serif)", fontSize:18 }}>{modal.id?"Edit Software":"Add Software"}</h3>
              <button className="btn btn-ghost" style={{ padding:"4px 8px" }} onClick={()=>setModal(null)}><Ic.X /></button>
            </div>
            <div className="admin-modal-body">
              <div className="form-grid">
                <div className="field full"><label>Product Name</label><input value={modal.name} onChange={e=>setModal(p=>({...p,name:e.target.value}))} /></div>
                <div className="field half"><label>Tag (short code)</label><input value={modal.tag} onChange={e=>setModal(p=>({...p,tag:e.target.value}))} /></div>
                <div className="field half"><label>Category</label><input value={modal.cat} onChange={e=>setModal(p=>({...p,cat:e.target.value}))} /></div>
                <div className="field half"><label>Monthly Fee (£)</label><input type="number" value={modal.monthly} onChange={e=>setModal(p=>({...p,monthly:e.target.value}))} /></div>
                <div className="field half"><label>Setup Fee (£)</label><input type="number" value={modal.setup} onChange={e=>setModal(p=>({...p,setup:e.target.value}))} /></div>
                <div className="field half"><label>Status</label>
                  <select value={modal.status} onChange={e=>setModal(p=>({...p,status:e.target.value}))}>
                    <option value="active">Active</option><option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="admin-modal-foot">
              <button className="btn btn-ghost" onClick={()=>setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={()=>save(modal)}>Save Software</button>
            </div>
          </div>
        </div>
      )}
      {confirm && <Confirm msg="Delete this software module?" onOk={()=>{setItems(p=>p.filter(s=>s.id!==confirm));setConfirm(null);}} onCancel={()=>setConfirm(null)} />}
    </>
  );
};

// ── SIM Management ─────────────────────────────────────────────────────────
const SimsView = ({ items, setItems }) => {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const EMPTY = { id:"", name:"", network:"EE", monthly:"", data:"", calls:"Unlimited", status:"active" };

  const filtered = items.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.network.toLowerCase().includes(search.toLowerCase())
  );

  const save = (f) => {
    if (f.id) setItems(prev=>prev.map(s=>s.id===f.id?{...f,monthly:+f.monthly}:s));
    else setItems(prev=>[...prev,{...f,id:"sim-"+uid(),monthly:+f.monthly}]);
    setModal(null);
  };

  return (
    <>
      <CrudList title="SIM Plans" subtitle={`${items.length} SIM plans configured`}
        cols={["Plan Name","Network","Monthly","Data","Calls","Status","Actions"]}
        search={search} setSearch={setSearch} onAdd={()=>setModal({...EMPTY})}
        renderRow={()=>filtered.length?filtered.map(s=>(
          <tr key={s.id}>
            <td><strong>{s.name}</strong></td>
            <td><span style={{ fontSize:11, background:"var(--bg-alt)", padding:"2px 8px", borderRadius:4 }}>{s.network}</span></td>
            <td style={{ fontWeight:600 }}>{fmt(s.monthly)}<span style={{ fontWeight:400, color:"var(--muted)", fontSize:11 }}>/mo</span></td>
            <td>{s.data}</td>
            <td style={{ color:"var(--muted)" }}>{s.calls}</td>
            <td><Badge s={s.status} /></td>
            <td><div style={{ display:"flex", gap:6 }}>
              <button className="btn btn-ghost" style={{ padding:"4px 10px" }} onClick={()=>setModal(s)}><Ic.Edit /></button>
              <button className="btn btn-ghost" style={{ padding:"4px 10px", color:"#a3331f" }} onClick={()=>setConfirm(s.id)}><Ic.Trash /></button>
            </div></td>
          </tr>
        )):<tr><td colSpan={7} style={{ padding:32, textAlign:"center", color:"var(--muted)" }}>No SIM plans found.</td></tr>}
      />
      {modal && (
        <div className="admin-modal-bg" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="admin-modal">
            <div className="admin-modal-head">
              <h3 style={{ fontFamily:"var(--serif)", fontSize:18 }}>{modal.id?"Edit SIM Plan":"Add SIM Plan"}</h3>
              <button className="btn btn-ghost" style={{ padding:"4px 8px" }} onClick={()=>setModal(null)}><Ic.X /></button>
            </div>
            <div className="admin-modal-body">
              <div className="form-grid">
                <div className="field full"><label>Plan Name</label><input value={modal.name} onChange={e=>setModal(p=>({...p,name:e.target.value}))} /></div>
                <div className="field half"><label>Network</label>
                  <select value={modal.network} onChange={e=>setModal(p=>({...p,network:e.target.value}))}>
                    {["EE","Vodafone","O2","Three"].map(n=><option key={n}>{n}</option>)}
                  </select>
                </div>
                <div className="field half"><label>Monthly Cost (£)</label><input type="number" value={modal.monthly} onChange={e=>setModal(p=>({...p,monthly:e.target.value}))} /></div>
                <div className="field half"><label>Data Allowance</label><input value={modal.data} onChange={e=>setModal(p=>({...p,data:e.target.value}))} /></div>
                <div className="field half"><label>Calls</label><input value={modal.calls} onChange={e=>setModal(p=>({...p,calls:e.target.value}))} /></div>
                <div className="field half"><label>Status</label>
                  <select value={modal.status} onChange={e=>setModal(p=>({...p,status:e.target.value}))}>
                    <option value="active">Active</option><option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="admin-modal-foot">
              <button className="btn btn-ghost" onClick={()=>setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={()=>save(modal)}>Save SIM Plan</button>
            </div>
          </div>
        </div>
      )}
      {confirm && <Confirm msg="Delete this SIM plan?" onOk={()=>{setItems(p=>p.filter(s=>s.id!==confirm));setConfirm(null);}} onCancel={()=>setConfirm(null)} />}
    </>
  );
};

// ── Staff / HR ─────────────────────────────────────────────────────────────
const StaffView = ({ staff, setStaff }) => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const EMPTY = { id:"", name:"", email:"", phone:"", dept:"Engineering", type:"engineer", role:"", salary:"", dailyRate:"", start:"", status:"active", avatar:"", ac:"#0b2f6b" };
  const TYPES = ["All","engineer","installation","proposal","portal"];
  const TYPE_LABELS = { engineer:"Engineer", installation:"Installation", proposal:"Proposal", portal:"Operations" };

  const filtered = staff.filter(s =>
    (typeFilter==="All" || s.type===typeFilter) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()))
  );

  const save = (f) => {
    const item = {...f, salary:+f.salary, dailyRate:+f.dailyRate, avatar:f.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()};
    if (f.id) setStaff(prev=>prev.map(s=>s.id===f.id?item:s));
    else setStaff(prev=>[...prev,{...item,id:"s-"+uid()}]);
    setModal(null);
  };

  return (
    <>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
        <div>
          <h1 style={{ fontFamily:"var(--serif)", fontSize:26, marginBottom:4 }}>Staff & HR</h1>
          <p style={{ fontSize:13, color:"var(--muted)" }}>{staff.length} total staff — Engineers, Installation &amp; Proposal teams</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setModal({...EMPTY})} style={{ display:"flex", alignItems:"center", gap:7 }}>
          <Ic.Plus /> Add Staff
        </button>
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <div className="admin-search"><Ic.Search /><input placeholder="Search name, role, email…" value={search} onChange={e=>setSearch(e.target.value)} /></div>
        <div style={{ display:"flex", gap:6 }}>
          {TYPES.map(t=><button key={t} className={`chip-filter${typeFilter===t?" active":""}`} onClick={()=>setTypeFilter(t)}>{t==="All"?"All":TYPE_LABELS[t]}</button>)}
        </div>
      </div>
      <div className="admin-card" style={{ padding:0, overflow:"hidden" }}>
        <table className="admin-table">
          <thead><tr><th>Staff Member</th><th>Role</th><th>Department</th><th>Type</th><th>Annual Salary</th><th>Day Rate</th><th>Start Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length ? filtered.map(s => (
              <tr key={s.id}>
                <td>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div className="staff-avatar" style={{ background:s.ac }}>{s.avatar}</div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:13 }}>{s.name}</div>
                      <div style={{ fontSize:11, color:"var(--muted)" }}>{s.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize:12 }}>{s.role}</td>
                <td style={{ color:"var(--muted)", fontSize:12 }}>{s.dept}</td>
                <td><span style={{ fontSize:11, background:"var(--bg-alt)", padding:"2px 8px", borderRadius:4, textTransform:"capitalize" }}>{TYPE_LABELS[s.type]||s.type}</span></td>
                <td style={{ fontWeight:600 }}>{fmt(s.salary)}</td>
                <td style={{ color:"var(--muted)" }}>{fmt(s.dailyRate)}/day</td>
                <td style={{ color:"var(--muted)", fontSize:12 }}>{fmtDate(s.start)}</td>
                <td><Badge s={s.status} /></td>
                <td>
                  <div style={{ display:"flex", gap:5 }}>
                    <button className="btn btn-ghost" style={{ padding:"4px 9px", fontSize:11 }} onClick={()=>setDetail(s)}><Ic.Eye /></button>
                    <button className="btn btn-ghost" style={{ padding:"4px 9px", fontSize:11 }} onClick={()=>setModal(s)}><Ic.Edit /></button>
                    <button className="btn btn-ghost" style={{ padding:"4px 9px", fontSize:11, color:"#a3331f" }} onClick={()=>setConfirm(s.id)}><Ic.Trash /></button>
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan={9} style={{ padding:32, textAlign:"center", color:"var(--muted)" }}>No staff found.</td></tr>}
          </tbody>
        </table>
      </div>
      {modal && <StaffModal item={modal} onSave={save} onClose={()=>setModal(null)} />}
      {detail && <StaffDetail s={detail} onClose={()=>setDetail(null)} onEdit={()=>{setModal(detail);setDetail(null);}} />}
      {confirm && <Confirm msg="Remove this staff member?" onOk={()=>{setStaff(p=>p.filter(s=>s.id!==confirm));setConfirm(null);}} onCancel={()=>setConfirm(null)} />}
    </>
  );
};

const StaffModal = ({ item, onSave, onClose }) => {
  const [f, setF] = useState(item);
  const set = k => e => setF(p=>({...p,[k]:e.target.value}));
  return (
    <div className="admin-modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="admin-modal-lg">
        <div className="admin-modal-head">
          <h3 style={{ fontFamily:"var(--serif)", fontSize:18 }}>{f.id?"Edit Staff Member":"Add Staff Member"}</h3>
          <button className="btn btn-ghost" style={{ padding:"4px 8px" }} onClick={onClose}><Ic.X /></button>
        </div>
        <div className="admin-modal-body">
          <div className="form-grid">
            <div className="field half"><label>Full Name</label><input value={f.name} onChange={set("name")} /></div>
            <div className="field half"><label>Email</label><input type="email" value={f.email} onChange={set("email")} /></div>
            <div className="field half"><label>Phone</label><input value={f.phone} onChange={set("phone")} /></div>
            <div className="field half"><label>Role / Job Title</label><input value={f.role} onChange={set("role")} /></div>
            <div className="field third"><label>Department</label><input value={f.dept} onChange={set("dept")} /></div>
            <div className="field third"><label>Staff Type</label>
              <select value={f.type} onChange={set("type")}>
                <option value="engineer">Engineer</option>
                <option value="installation">Installation</option>
                <option value="proposal">Proposal</option>
                <option value="portal">Operations</option>
              </select>
            </div>
            <div className="field third"><label>Status</label>
              <select value={f.status} onChange={set("status")}>
                <option value="active">Active</option><option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="field third"><label>Annual Salary (£)</label><input type="number" value={f.salary} onChange={set("salary")} /></div>
            <div className="field third"><label>Day Rate (£)</label><input type="number" value={f.dailyRate} onChange={set("dailyRate")} /></div>
            <div className="field third"><label>Start Date</label><input type="date" value={f.start} onChange={set("start")} /></div>
            <div className="field half"><label>Avatar Colour</label><input type="color" value={f.ac} onChange={set("ac")} style={{ height:38, cursor:"pointer" }} /></div>
          </div>
        </div>
        <div className="admin-modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>onSave(f)}>Save Staff Member</button>
        </div>
      </div>
    </div>
  );
};

const StaffDetail = ({ s, onClose, onEdit }) => {
  const monthlySalary = s.salary/12;
  const niEE = monthlySalary * 0.08;
  const niER = monthlySalary * 0.138;
  const pension = monthlySalary * 0.05;
  const net = monthlySalary - niEE - pension;
  return (
    <div className="admin-modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="admin-modal-lg">
        <div className="admin-modal-head">
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div className="staff-avatar" style={{ background:s.ac, width:40, height:40, fontSize:14, borderRadius:10 }}>{s.avatar}</div>
            <div>
              <h3 style={{ fontFamily:"var(--serif)", fontSize:18 }}>{s.name}</h3>
              <p style={{ fontSize:12, color:"var(--muted)" }}>{s.role} · {s.dept}</p>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn btn-ghost" style={{ fontSize:13 }} onClick={onEdit}>Edit</button>
            <button className="btn btn-ghost" style={{ padding:"4px 8px" }} onClick={onClose}><Ic.X /></button>
          </div>
        </div>
        <div className="admin-modal-body">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:22 }}>
            <div>
              <div style={{ fontWeight:600, fontSize:12, textTransform:"uppercase", letterSpacing:".06em", color:"var(--muted)", marginBottom:12 }}>Contact</div>
              {[["Email",s.email],["Phone",s.phone],["Start Date",fmtDate(s.start)],["Status",<Badge s={s.status}/>]].map(([l,v])=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid var(--line)", fontSize:13 }}>
                  <span style={{ color:"var(--muted)" }}>{l}</span><span>{v}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontWeight:600, fontSize:12, textTransform:"uppercase", letterSpacing:".06em", color:"var(--muted)", marginBottom:12 }}>Compensation</div>
              {[["Annual Salary",fmt(s.salary)],["Monthly Gross",fmt(monthlySalary)],["Day Rate",fmt(s.dailyRate)+"/day"],["NI (Employee 8%)",fmt(niEE)+"/mo"],["Pension (5%)",fmt(pension)+"/mo"],["NI (Employer 13.8%)",fmt(niER)+"/mo"],["Est. Net Pay",fmt(net)+"/mo"]].map(([l,v])=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid var(--line)", fontSize:13 }}>
                  <span style={{ color:"var(--muted)" }}>{l}</span><span style={{ fontWeight:l.startsWith("Est")?700:400 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Payroll ────────────────────────────────────────────────────────────────
const PayrollView = ({ staff }) => {
  const MONTHS = ["January 2026","February 2026","March 2026","April 2026","May 2026"];
  const [month, setMonth] = useState("April 2026");
  const [payslip, setPayslip] = useState(null);

  const active = staff.filter(s=>s.status==="active");
  const rows = active.map(s => {
    const gross = s.salary/12;
    const niEE  = gross * 0.08;
    const pension= gross * 0.05;
    const niER  = gross * 0.138;
    const net   = gross - niEE - pension;
    return { ...s, gross, niEE, pension, niER, net };
  });

  const totals = rows.reduce((a,r)=>({
    gross: a.gross+r.gross, niEE: a.niEE+r.niEE, pension: a.pension+r.pension, niER: a.niER+r.niER, net: a.net+r.net
  }), { gross:0, niEE:0, pension:0, niER:0, net:0 });

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
        <div>
          <h1 style={{ fontFamily:"var(--serif)", fontSize:26, marginBottom:4 }}>Payroll</h1>
          <p style={{ fontSize:13, color:"var(--muted)" }}>Monthly payroll run — {active.length} active staff members</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <select value={month} onChange={e=>setMonth(e.target.value)} style={{ padding:"8px 12px", border:"1px solid var(--line-2)", borderRadius:"var(--radius-sm)", fontSize:13, background:"var(--surface)" }}>
            {MONTHS.map(m=><option key={m}>{m}</option>)}
          </select>
          <button className="btn btn-primary" style={{ display:"flex", alignItems:"center", gap:7 }}><Ic.Download s={14} /> Export</button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14, marginBottom:24 }}>
        {[
          ["Total Gross",fmt(totals.gross),"#0b2f6b"],
          ["NI (Employee)",fmt(totals.niEE),"#a3331f"],
          ["Pension (5%)",fmt(totals.pension),"#8b6a3a"],
          ["NI (Employer)",fmt(totals.niER),"#16478f"],
          ["Total Net Pay",fmt(totals.net),"#1b6b4a"],
        ].map(([l,v,c])=>(
          <div key={l} className="admin-card" style={{ borderTop:`3px solid ${c}`, padding:"16px 18px" }}>
            <div style={{ fontSize:11, fontWeight:600, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>{l}</div>
            <div style={{ fontSize:22, fontWeight:700, color:c, fontFamily:"var(--serif)" }}>{v}</div>
          </div>
        ))}
      </div>

      <div className="admin-card" style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <strong style={{ fontFamily:"var(--serif)", fontSize:16 }}>Payroll Run — {month}</strong>
          <span style={{ fontSize:12, color:"var(--muted)" }}>{active.length} employees</span>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table className="admin-table">
            <thead><tr><th>Employee</th><th>Department</th><th>Gross</th><th>NI (EE)</th><th>Pension</th><th>Net Pay</th><th>Employer NI</th><th>Payslip</th></tr></thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id}>
                  <td><div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <div className="staff-avatar" style={{ background:r.ac, width:28, height:28, fontSize:10 }}>{r.avatar}</div>
                    <div><div style={{ fontWeight:600, fontSize:13 }}>{r.name}</div><div style={{ fontSize:11, color:"var(--muted)" }}>{r.role}</div></div>
                  </div></td>
                  <td style={{ color:"var(--muted)", fontSize:12 }}>{r.dept}</td>
                  <td style={{ fontWeight:600 }}>{fmt(r.gross)}</td>
                  <td style={{ color:"#a3331f" }}>-{fmt(r.niEE)}</td>
                  <td style={{ color:"#8b6a3a" }}>-{fmt(r.pension)}</td>
                  <td style={{ fontWeight:700, color:"#1b6b4a" }}>{fmt(r.net)}</td>
                  <td style={{ color:"var(--muted)", fontSize:12 }}>{fmt(r.niER)}</td>
                  <td><button className="btn btn-ghost" style={{ fontSize:12, padding:"4px 10px" }} onClick={()=>setPayslip({...r,month})}>View</button></td>
                </tr>
              ))}
              <tr style={{ background:"var(--bg-alt)", fontWeight:700 }}>
                <td colSpan={2} style={{ padding:"12px 14px" }}>TOTALS</td>
                <td style={{ padding:"12px 14px" }}>{fmt(totals.gross)}</td>
                <td style={{ padding:"12px 14px", color:"#a3331f" }}>-{fmt(totals.niEE)}</td>
                <td style={{ padding:"12px 14px", color:"#8b6a3a" }}>-{fmt(totals.pension)}</td>
                <td style={{ padding:"12px 14px", color:"#1b6b4a" }}>{fmt(totals.net)}</td>
                <td style={{ padding:"12px 14px", color:"var(--muted)" }}>{fmt(totals.niER)}</td>
                <td style={{ padding:"12px 14px" }}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {payslip && <PayslipModal p={payslip} onClose={()=>setPayslip(null)} />}
    </div>
  );
};

const PayslipModal = ({ p, onClose }) => (
  <div className="admin-modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div className="admin-modal">
      <div className="admin-modal-head">
        <h3 style={{ fontFamily:"var(--serif)", fontSize:18 }}>Payslip — {p.month}</h3>
        <button className="btn btn-ghost" style={{ padding:"4px 8px" }} onClick={onClose}><Ic.X /></button>
      </div>
      <div className="admin-modal-body">
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, padding:"14px 16px", background:"var(--bg-alt)", borderRadius:"var(--radius-sm)" }}>
          <div className="staff-avatar" style={{ background:p.ac, width:40, height:40, fontSize:14, borderRadius:10 }}>{p.avatar}</div>
          <div>
            <div style={{ fontWeight:700, fontSize:15 }}>{p.name}</div>
            <div style={{ fontSize:12, color:"var(--muted)" }}>{p.role} · {p.dept}</div>
          </div>
          <div style={{ marginLeft:"auto", textAlign:"right" }}>
            <div style={{ fontSize:11, color:"var(--muted)" }}>Pay Period</div>
            <div style={{ fontWeight:600 }}>{p.month}</div>
          </div>
        </div>
        <div className="payslip-row"><span>Basic Salary (Annual)</span><span style={{ fontWeight:600 }}>{fmt(p.salary)}</span></div>
        <div className="payslip-row"><span>Gross Monthly Pay</span><span style={{ fontWeight:600 }}>{fmt(p.gross)}</span></div>
        <div style={{ height:12 }} />
        <div className="payslip-row" style={{ color:"#a3331f" }}><span>National Insurance (Employee, 8%)</span><span>-{fmt(p.niEE)}</span></div>
        <div className="payslip-row" style={{ color:"#8b6a3a" }}><span>Pension Contribution (5%)</span><span>-{fmt(p.pension)}</span></div>
        <div style={{ height:12 }} />
        <div className="payslip-total-row" style={{ borderTop:"2px solid var(--ink)", paddingTop:14, marginTop:4 }}>
          <span>NET PAY</span><span style={{ color:"#1b6b4a", fontSize:18 }}>{fmt(p.net)}</span>
        </div>
        <div style={{ marginTop:16, padding:"12px 14px", background:"rgba(22,71,143,.06)", borderRadius:"var(--radius-sm)", fontSize:12, color:"var(--muted)" }}>
          Employer NI contribution (13.8%): {fmt(p.niER)} · Total employer cost: {fmt(p.gross+p.niER)}
        </div>
      </div>
      <div className="admin-modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>Close</button>
        <button className="btn btn-primary" style={{ display:"flex", alignItems:"center", gap:7 }}><Ic.Download s={14} /> Download PDF</button>
      </div>
    </div>
  </div>
);

// ── Revenue & Reports ──────────────────────────────────────────────────────
const ReportsView = () => {
  const [period, setPeriod] = useState("6M");
  const months = period==="3M" ? REV_MONTHS.slice(-3) : REV_MONTHS;
  const totals = months.reduce((a,m)=>({ hw:a.hw+m.hw, sw:a.sw+m.sw, impl:a.impl+m.impl }), {hw:0,sw:0,impl:0});
  const grand = totals.hw+totals.sw+totals.impl;
  const maxRev = Math.max(...REV_MONTHS.map(m=>m.hw+m.sw+m.impl));

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
        <div>
          <h1 style={{ fontFamily:"var(--serif)", fontSize:26, marginBottom:4 }}>Revenue & Reports</h1>
          <p style={{ fontSize:13, color:"var(--muted)" }}>Financial performance across all revenue streams</p>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {["3M","6M"].map(p=><button key={p} className={`chip-filter${period===p?" active":""}`} onClick={()=>setPeriod(p)}>{p}</button>)}
          <button className="btn btn-ghost" style={{ display:"flex", alignItems:"center", gap:6, fontSize:13 }}><Ic.Download s={14} /> Export</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {[
          ["Total Revenue",fmt(grand),"#0b2f6b","All streams"],
          ["Hardware",fmt(totals.hw),"#16478f",`${((totals.hw/grand)*100).toFixed(0)}% of revenue`],
          ["Software",fmt(totals.sw),"#b8935a",`${((totals.sw/grand)*100).toFixed(0)}% of revenue`],
          ["Implementation",fmt(totals.impl),"#8b6a3a",`${((totals.impl/grand)*100).toFixed(0)}% of revenue`],
        ].map(([l,v,c,s])=>(
          <div key={l} className="admin-card" style={{ borderTop:`3px solid ${c}` }}>
            <div style={{ fontSize:11, fontWeight:600, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>{l}</div>
            <div style={{ fontSize:26, fontWeight:700, color:c, fontFamily:"var(--serif)" }}>{v}</div>
            <div style={{ fontSize:12, color:"var(--muted)", marginTop:6 }}>{s}</div>
          </div>
        ))}
      </div>

      {/* Large chart */}
      <div className="admin-card" style={{ marginBottom:22 }}>
        <div style={{ fontFamily:"var(--serif)", fontSize:17, marginBottom:4 }}>Monthly Revenue Breakdown</div>
        <div style={{ fontSize:12, color:"var(--muted)", marginBottom:24 }}>Hardware · Software · Implementation fees</div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:16, height:220 }}>
          {months.map(m=>{
            const total=m.hw+m.sw+m.impl;
            const scale=total/maxRev;
            return (
              <div key={m.month} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6, height:"100%" }}>
                <div style={{ fontSize:11, color:"var(--muted)", fontWeight:600 }}>{fmtK(total)}</div>
                <div style={{ flex:1, width:"100%", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
                  <div style={{ display:"flex", flexDirection:"column", borderRadius:6, overflow:"hidden", height:`${scale*180}px` }}>
                    <div style={{ flex:m.impl/total, background:"#8b6a3a" }} />
                    <div style={{ flex:m.sw/total,   background:"#b8935a" }} />
                    <div style={{ flex:m.hw/total,   background:"#0b2f6b" }} />
                  </div>
                </div>
                <div style={{ fontSize:11, color:"var(--muted)" }}>{m.month}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:20, marginTop:16 }}>
          {[["Hardware","#0b2f6b"],["Software","#b8935a"],["Implementation","#8b6a3a"]].map(([l,c])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--muted)" }}>
              <div style={{ width:12, height:12, borderRadius:2, background:c }} />{l}
            </div>
          ))}
        </div>
      </div>

      {/* Monthly breakdown table */}
      <div className="admin-card" style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--line)" }}>
          <strong style={{ fontFamily:"var(--serif)", fontSize:16 }}>Monthly Detail</strong>
        </div>
        <table className="admin-table">
          <thead><tr><th>Month</th><th>Hardware</th><th>Software</th><th>Implementation</th><th>Total</th><th>vs Prior Month</th></tr></thead>
          <tbody>
            {months.map((m,i)=>{
              const total=m.hw+m.sw+m.impl;
              const prev=months[i-1];
              const prevTotal=prev?(prev.hw+prev.sw+prev.impl):null;
              const chg=prevTotal?((total-prevTotal)/prevTotal*100):null;
              return (
                <tr key={m.month}>
                  <td style={{ fontWeight:600 }}>{m.month}</td>
                  <td>{fmt(m.hw)}</td>
                  <td>{fmt(m.sw)}</td>
                  <td>{fmt(m.impl)}</td>
                  <td style={{ fontWeight:700, color:"#0b2f6b" }}>{fmt(total)}</td>
                  <td>{chg!==null?<span style={{ color:chg>=0?"#1b6b4a":"#a3331f", fontWeight:600 }}>{chg>=0?"+":""}{chg.toFixed(1)}%</span>:"—"}</td>
                </tr>
              );
            })}
            <tr style={{ background:"var(--bg-alt)", fontWeight:700 }}>
              <td style={{ padding:"12px 14px" }}>TOTAL</td>
              <td style={{ padding:"12px 14px" }}>{fmt(totals.hw)}</td>
              <td style={{ padding:"12px 14px" }}>{fmt(totals.sw)}</td>
              <td style={{ padding:"12px 14px" }}>{fmt(totals.impl)}</td>
              <td style={{ padding:"12px 14px", color:"#0b2f6b" }}>{fmt(grand)}</td>
              <td style={{ padding:"12px 14px" }}>—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Credit Applications ────────────────────────────────────────────────────
const CreditView = ({ apps, setApps }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [detail, setDetail] = useState(null);
  const STATUSES = ["All","approved","review","pending","declined"];

  const filtered = apps.filter(a =>
    (statusFilter==="All" || a.status===statusFilter) &&
    (a.company.toLowerCase().includes(search.toLowerCase()) || a.contact.toLowerCase().includes(search.toLowerCase()))
  );

  const updateStatus = (id, status) => {
    setApps(prev=>prev.map(a=>a.id===id?{...a,status}:a));
    if (detail?.id===id) setDetail(prev=>({...prev,status}));
  };

  return (
    <>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
        <div>
          <h1 style={{ fontFamily:"var(--serif)", fontSize:26, marginBottom:4 }}>Credit Applications</h1>
          <p style={{ fontSize:13, color:"var(--muted)" }}>All CreditSafe finance applications — {apps.length} total</p>
        </div>
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <div className="admin-search"><Ic.Search /><input placeholder="Search company or contact…" value={search} onChange={e=>setSearch(e.target.value)} /></div>
        <div style={{ display:"flex", gap:6 }}>
          {STATUSES.map(s=><button key={s} className={`chip-filter${statusFilter===s?" active":""}`} onClick={()=>setStatusFilter(s)} style={{ textTransform:"capitalize" }}>{s==="All"?"All":s}</button>)}
        </div>
      </div>
      <div className="admin-card" style={{ padding:0, overflow:"hidden" }}>
        <table className="admin-table">
          <thead><tr><th>Application</th><th>Company</th><th>Contact</th><th>Date</th><th>Finance Amt</th><th>Term</th><th>Monthly Pay</th><th>Credit Score</th><th>Limit</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length ? filtered.map(a=>(
              <tr key={a.id}>
                <td><code style={{ fontSize:11 }}>{a.id}</code></td>
                <td><strong style={{ fontSize:13 }}>{a.company}</strong></td>
                <td style={{ color:"var(--muted)", fontSize:12 }}>{a.contact}</td>
                <td style={{ color:"var(--muted)", fontSize:12 }}>{fmtDate(a.date)}</td>
                <td style={{ fontWeight:600 }}>{fmt(a.financeAmt)}</td>
                <td style={{ color:"var(--muted)" }}>{a.term} mo</td>
                <td>{fmt(a.monthly)}/mo</td>
                <td>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, background:a.score>=80?"rgba(27,107,74,.12)":a.score>=65?"rgba(184,147,90,.12)":"rgba(163,51,31,.12)", color:a.score>=80?"#1b6b4a":a.score>=65?"#8b6a3a":"#a3331f" }}>{a.score}</div>
                  </div>
                </td>
                <td style={{ fontWeight:600, color:a.limit>0?"#1b6b4a":"#a3331f" }}>{a.limit>0?fmt(a.limit):"Declined"}</td>
                <td><Badge s={a.status} /></td>
                <td><button className="btn btn-ghost" style={{ fontSize:12, padding:"4px 10px" }} onClick={()=>setDetail(a)}><Ic.Eye /></button></td>
              </tr>
            )) : <tr><td colSpan={11} style={{ padding:32, textAlign:"center", color:"var(--muted)" }}>No applications found.</td></tr>}
          </tbody>
        </table>
      </div>
      {detail && (
        <div className="admin-modal-bg" onClick={e=>e.target===e.currentTarget&&setDetail(null)}>
          <div className="admin-modal-lg">
            <div className="admin-modal-head">
              <div>
                <h3 style={{ fontFamily:"var(--serif)", fontSize:18 }}>{detail.company}</h3>
                <p style={{ fontSize:12, color:"var(--muted)" }}>Credit Application {detail.id} · {fmtDate(detail.date)}</p>
              </div>
              <button className="btn btn-ghost" style={{ padding:"4px 8px" }} onClick={()=>setDetail(null)}><Ic.X /></button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:22 }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:12 }}>Company Details</div>
                  {[["Contact",detail.contact],["Annual Revenue",detail.annualRev],["Years Trading",detail.years],["CCJs",detail.ccjs],["Proposal Ref",detail.propId]].map(([l,v])=>(
                    <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid var(--line)", fontSize:13 }}>
                      <span style={{ color:"var(--muted)" }}>{l}</span><strong>{v}</strong>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:12 }}>Finance Terms</div>
                  {[["Finance Amount",fmt(detail.financeAmt)],["Term",detail.term+" months"],["Monthly Payment",fmt(detail.monthly)+"/mo"],["Credit Score",detail.score+"/100"],["Credit Limit",detail.limit>0?fmt(detail.limit):"N/A"],["Status",<Badge s={detail.status}/>]].map(([l,v])=>(
                    <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid var(--line)", fontSize:13 }}>
                      <span style={{ color:"var(--muted)" }}>{l}</span><strong>{v}</strong>
                    </div>
                  ))}
                </div>
              </div>
              {detail.status==="review"||detail.status==="pending" ? (
                <div style={{ marginTop:20, padding:"16px", background:"var(--bg-alt)", borderRadius:"var(--radius-sm)" }}>
                  <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>Review Decision</div>
                  <div style={{ display:"flex", gap:10 }}>
                    <button className="btn" style={{ background:"#1b6b4a", color:"#fff", flex:1 }} onClick={()=>updateStatus(detail.id,"approved")}>Approve</button>
                    <button className="btn" style={{ background:"#a3331f", color:"#fff", flex:1 }} onClick={()=>updateStatus(detail.id,"declined")}>Decline</button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── Proposals View ─────────────────────────────────────────────────────────
const ProposalsView = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [detail, setDetail] = useState(null);
  const STATUSES = ["All","new","review","approved","scheduled","in-progress","completed","rejected"];

  const filtered = DEMO_PROPOSALS.filter(p =>
    (statusFilter==="All"||p.status===statusFilter) &&
    (p.client.company.toLowerCase().includes(search.toLowerCase())||p.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
        <div>
          <h1 style={{ fontFamily:"var(--serif)", fontSize:26, marginBottom:4 }}>Proposals</h1>
          <p style={{ fontSize:13, color:"var(--muted)" }}>All customer proposals — {DEMO_PROPOSALS.length} total</p>
        </div>
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <div className="admin-search"><Ic.Search /><input placeholder="Search company or ID…" value={search} onChange={e=>setSearch(e.target.value)} /></div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {STATUSES.map(s=><button key={s} className={`chip-filter${statusFilter===s?" active":""}`} onClick={()=>setStatusFilter(s)} style={{ textTransform:"capitalize" }}>{s==="All"?"All":s.replace("-"," ")}</button>)}
        </div>
      </div>
      <div className="admin-card" style={{ padding:0, overflow:"hidden" }}>
        <table className="admin-table">
          <thead><tr><th>Proposal ID</th><th>Company</th><th>Contact</th><th>Date</th><th>Payment</th><th>Year 1 Value</th><th>Monthly</th><th>Priority</th><th>Status</th><th>View</th></tr></thead>
          <tbody>
            {filtered.length ? filtered.map(p=>(
              <tr key={p.id}>
                <td><code style={{ fontSize:11, color:"var(--muted)" }}>{p.id}</code></td>
                <td><strong>{p.client.company}</strong></td>
                <td><div style={{ fontSize:12 }}>{p.client.contact}</div><div style={{ fontSize:11, color:"var(--muted)" }}>{p.client.role}</div></td>
                <td style={{ color:"var(--muted)", fontSize:12 }}>{fmtDate(p.date)}</td>
                <td><span style={{ fontSize:11, background:"var(--bg-alt)", padding:"2px 8px", borderRadius:4, textTransform:"uppercase" }}>{p.payment}</span></td>
                <td style={{ fontWeight:700, color:"#0b2f6b" }}>{fmt(p.totals.year1)}</td>
                <td style={{ color:"var(--muted)" }}>{fmt(p.totals.monthly)}/mo</td>
                <td>{p.priority==="high"?<span style={{ fontSize:11, fontWeight:700, color:"#a3331f" }}>HIGH</span>:<span style={{ fontSize:11, color:"var(--muted)" }}>Normal</span>}</td>
                <td><Badge s={p.status} /></td>
                <td><button className="btn btn-ghost" style={{ fontSize:12, padding:"4px 10px" }} onClick={()=>setDetail(p)}><Ic.Eye /></button></td>
              </tr>
            )) : <tr><td colSpan={10} style={{ padding:32, textAlign:"center", color:"var(--muted)" }}>No proposals found.</td></tr>}
          </tbody>
        </table>
      </div>
      {detail && (
        <div className="admin-modal-bg" onClick={e=>e.target===e.currentTarget&&setDetail(null)}>
          <div className="admin-modal-lg">
            <div className="admin-modal-head">
              <div>
                <h3 style={{ fontFamily:"var(--serif)", fontSize:18 }}>{detail.client.company}</h3>
                <p style={{ fontSize:12, color:"var(--muted)" }}>{detail.id} · {fmtDate(detail.date)}</p>
              </div>
              <button className="btn btn-ghost" style={{ padding:"4px 8px" }} onClick={()=>setDetail(null)}><Ic.X /></button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:22, marginBottom:20 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:10 }}>Client</div>
                  {[["Company",detail.client.company],["Contact",detail.client.contact],["Role",detail.client.role],["Email",detail.client.email]].map(([l,v])=>(
                    <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid var(--line)", fontSize:13 }}>
                      <span style={{ color:"var(--muted)" }}>{l}</span><span>{v}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:10 }}>Financials</div>
                  {[["One-Time",fmt(detail.totals.oneTime)],["Monthly",fmt(detail.totals.monthly)+"/mo"],["Implementation",fmt(detail.totals.impl)],["Year 1 Total",fmt(detail.totals.year1)],["Payment",detail.payment.toUpperCase()],["Status",<Badge s={detail.status}/>]].map(([l,v])=>(
                    <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid var(--line)", fontSize:13 }}>
                      <span style={{ color:"var(--muted)" }}>{l}</span><strong>{v}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding:"14px 16px", background:"var(--bg-alt)", borderRadius:"var(--radius-sm)", fontSize:13 }}>
                <div style={{ fontSize:11, fontWeight:600, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>Bundle / Items</div>
                {detail.items}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── Admin Shell ────────────────────────────────────────────────────────────
const NAV = [
  { section: null },
  { id:"dashboard", label:"Dashboard",            Icon:Ic.Dashboard },
  { section:"Catalogue" },
  { id:"hardware",  label:"Hardware",             Icon:Ic.Hardware  },
  { id:"software",  label:"Software",             Icon:Ic.Software  },
  { id:"sims",      label:"SIM Plans",            Icon:Ic.Sim       },
  { section:"People" },
  { id:"staff",     label:"Staff & HR",           Icon:Ic.Staff     },
  { id:"payroll",   label:"Payroll",              Icon:Ic.Payroll   },
  { section:"Business" },
  { id:"proposals", label:"Proposals",            Icon:Ic.Proposals },
  { id:"credit",    label:"Credit Applications",  Icon:Ic.Credit    },
  { id:"reports",   label:"Revenue & Reports",    Icon:Ic.Reports   },
];

function AdminApp() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [hardware, setHardware] = useState(INIT_HARDWARE);
  const [software, setSoftware] = useState(INIT_SOFTWARE);
  const [sims, setSims] = useState(INIT_SIMS);
  const [staff, setStaff] = useState(INIT_STAFF);
  const [creditApps, setCreditApps] = useState(CREDIT_APPS);

  useEffect(() => {
    const auth = sessionStorage.getItem("np_portal_auth");
    if (!auth) { window.location.href = "index.html"; return; }
    const u = JSON.parse(auth);
    if (u.type !== "admin") { window.location.href = "index.html"; return; }
    setUser(u);
  }, []);

  if (!user) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", fontFamily:"var(--sans)", color:"var(--muted)" }}>
      Verifying access…
    </div>
  );

  const logout = () => { sessionStorage.removeItem("np_portal_auth"); window.location.href = "index.html"; };

  const activeLabel = NAV.find(n=>n.id===view)?.label || "";

  let content;
  if (view==="dashboard") content = <Dashboard staff={staff} hardware={hardware} software={software} sims={sims} creditApps={creditApps} />;
  else if (view==="hardware")  content = <HardwareView items={hardware} setItems={setHardware} />;
  else if (view==="software")  content = <SoftwareView items={software} setItems={setSoftware} />;
  else if (view==="sims")      content = <SimsView     items={sims}     setItems={setSims}     />;
  else if (view==="staff")     content = <StaffView    staff={staff}    setStaff={setStaff}    />;
  else if (view==="payroll")   content = <PayrollView  staff={staff}                           />;
  else if (view==="reports")   content = <ReportsView                                          />;
  else if (view==="credit")    content = <CreditView   apps={creditApps} setApps={setCreditApps} />;
  else if (view==="proposals") content = <ProposalsView                                        />;

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-mark">N</div>
          <div>
            <div style={{ fontFamily:"var(--serif)", fontSize:15, color:"#f2eee3", lineHeight:1.1 }}>NexaPoint</div>
            <div style={{ fontSize:9, letterSpacing:".14em", textTransform:"uppercase", color:"rgba(255,255,255,.4)", fontWeight:600 }}>Admin Portal</div>
          </div>
        </div>
        <nav style={{ flex:1, padding:"8px 0" }}>
          {NAV.map((n, i) => {
            if (n.section !== undefined && !n.id) {
              return n.section ? (
                <div key={i} className="admin-nav-section">{n.section}</div>
              ) : <div key={i} style={{ height:8 }} />;
            }
            return (
              <button key={n.id} className={`admin-nav-item${view===n.id?" active":""}`} onClick={()=>setView(n.id)}>
                <n.Icon s={16} />{n.label}
              </button>
            );
          })}
        </nav>
        <div className="admin-user-block">
          <div className="admin-user-avatar">SA</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#f2eee3", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.name}</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,.4)" }}>{user.role}</div>
          </div>
          <button onClick={logout} title="Logout" style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,.35)", padding:4, display:"flex", alignItems:"center" }}>
            <Ic.Logout s={15} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
            <Ic.Shield s={16} />
            <span style={{ fontSize:13, color:"var(--muted)" }}>Admin</span>
            <span style={{ fontSize:13, color:"var(--muted)" }}>/</span>
            <span style={{ fontSize:13, fontWeight:600 }}>{activeLabel}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:12, color:"var(--muted)" }}>{user.email}</span>
            <button className="btn btn-ghost" style={{ fontSize:12, padding:"5px 12px", display:"flex", alignItems:"center", gap:6 }} onClick={logout}>
              <Ic.Logout s={13} /> Sign out
            </button>
          </div>
        </div>
        <div className="admin-content">
          {content}
        </div>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<AdminApp />);
