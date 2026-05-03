// NexaPoint — Super Administrator Portal

const { useState, useEffect, useRef } = React;

const fmt  = v => new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",maximumFractionDigits:0}).format(v||0);
const fmtK = v => v>=1000?`£${(v/1000).toFixed(0)}k`:fmt(v);
const fmtDate = d => { if(!d) return "—"; try{return new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});}catch{return d;} };
const fmtTime = d => { if(!d) return "—"; try{return new Date(d).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});}catch{return d;} };

// ── Icons ─────────────────────────────────────────────────────────────────────
const Ic = {
  Dashboard:    ({s=18})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Tenants:      ({s=18})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Users:        ({s=18})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Shield:       ({s=18})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Billing:      ({s=18})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Audit:        ({s=18})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Integrations: ({s=18})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  Config:       ({s=18})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M20 12h2M2 12h2M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41"/></svg>,
  Roles:        ({s=18})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Plus:         ({s=15})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Edit:         ({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:        ({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  X:            ({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check:        ({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Logout:       ({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Eye:          ({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff:       ({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  Search:       ({s=15})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Download:     ({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Alert:        ({s=18})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Clock:        ({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Activity:     ({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Globe:        ({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  TrendUp:      ({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Zap:          ({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Server:       ({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>,
  ChevRight:    ({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Mail:         ({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Key:          ({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
  Refresh:      ({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-5.02"/></svg>,
};

// ── Status helpers ────────────────────────────────────────────────────────────
const PLAN = {
  enterprise: { label:"Enterprise", color:"#b8935a", bg:"rgba(184,147,90,.12)" },
  business:   { label:"Business",   color:"#16478f", bg:"rgba(22,71,143,.10)"  },
  starter:    { label:"Starter",    color:"#5b6b86", bg:"rgba(91,107,134,.10)" },
  trial:      { label:"Trial",      color:"#8b6a3a", bg:"rgba(139,106,58,.12)" },
};
const STAT = {
  active:    { label:"Active",    color:"#1b6b4a", bg:"rgba(27,107,74,.10)"   },
  suspended: { label:"Suspended", color:"#a3331f", bg:"rgba(163,51,31,.10)"   },
  pending:   { label:"Pending",   color:"#b8935a", bg:"rgba(184,147,90,.12)"  },
  inactive:  { label:"Inactive",  color:"#5b6b86", bg:"rgba(91,107,134,.10)"  },
  connected: { label:"Connected", color:"#1b6b4a", bg:"rgba(27,107,74,.10)"   },
  error:     { label:"Error",     color:"#a3331f", bg:"rgba(163,51,31,.10)"   },
  disconnected:{ label:"Disconnected",color:"#5b6b86",bg:"rgba(91,107,134,.10)"},
};
const SaBadge = ({ type, map }) => {
  const m = (map||STAT)[type] || { label: type, color:"#666", bg:"#eee" };
  return <span className="sa-badge" style={{ color:m.color, background:m.bg }}>{m.label}</span>;
};

// ── Seed Data ─────────────────────────────────────────────────────────────────
const INIT_TENANTS = [
  { id:"tn1",  name:"Meridian Healthcare Group",  industry:"Healthcare",    plan:"enterprise", mrr:8500,  users:24, status:"active",    created:"2023-03-15", city:"London",     adminEmail:"s.mitchell@meridian.nhs.uk",  domain:"meridian.nhs.uk"        },
  { id:"tn2",  name:"TechFlow Solutions Ltd",     industry:"Technology",    plan:"business",   mrr:3200,  users:11, status:"active",    created:"2023-07-22", city:"Manchester", adminEmail:"a.hughes@techflow.com",        domain:"techflow.com"           },
  { id:"tn3",  name:"Sterling Finance Corp",      industry:"Finance",       plan:"enterprise", mrr:12400, users:38, status:"active",    created:"2022-11-08", city:"London",     adminEmail:"j.park@sterling.co.uk",       domain:"sterling.co.uk"         },
  { id:"tn4",  name:"Arcadia Hospitality Ltd",    industry:"Hospitality",   plan:"business",   mrr:4100,  users:16, status:"active",    created:"2024-01-20", city:"Edinburgh",  adminEmail:"c.dupont@arcadia.com",        domain:"arcadia.com"            },
  { id:"tn5",  name:"Riverside Logistics PLC",    industry:"Logistics",     plan:"enterprise", mrr:7800,  users:29, status:"active",    created:"2023-05-11", city:"Bristol",    adminEmail:"m.webb@riverside-logistics.com",domain:"riverside-logistics.com"},
  { id:"tn6",  name:"Bloom Education Trust",      industry:"Education",     plan:"business",   mrr:2400,  users:8,  status:"active",    created:"2024-03-04", city:"Leeds",      adminEmail:"r.greene@bloom-edu.org.uk",   domain:"bloom-edu.org.uk"       },
  { id:"tn7",  name:"Highfield Retail Group",     industry:"Retail",        plan:"starter",    mrr:980,   users:5,  status:"active",    created:"2024-05-17", city:"Birmingham", adminEmail:"m.stevens@highfield.co.uk",   domain:"highfield.co.uk"        },
  { id:"tn8",  name:"Vertex Logistics PLC",       industry:"Logistics",     plan:"business",   mrr:3600,  users:14, status:"active",    created:"2023-09-30", city:"Liverpool",  adminEmail:"m.chambers@vertex.co.uk",     domain:"vertex.co.uk"           },
  { id:"tn9",  name:"ClearPath Recruitment",      industry:"Recruitment",   plan:"starter",    mrr:650,   users:3,  status:"suspended", created:"2024-02-14", city:"London",     adminEmail:"a.holloway@clearpath.co.uk",  domain:"clearpath.co.uk"        },
  { id:"tn10", name:"Harrow Medical Group",       industry:"Healthcare",    plan:"enterprise", mrr:9200,  users:32, status:"active",    created:"2022-08-19", city:"London",     adminEmail:"e.patel@harrowmed.co.uk",     domain:"harrowmed.co.uk"        },
  { id:"tn11", name:"Zenith Capital Partners",    industry:"Finance",       plan:"business",   mrr:4800,  users:18, status:"active",    created:"2023-12-01", city:"London",     adminEmail:"r.davison@zenith.co.uk",      domain:"zenith.co.uk"           },
  { id:"tn12", name:"NovaTech Manufacturing",     industry:"Manufacturing", plan:"trial",      mrr:0,     users:2,  status:"pending",   created:"2026-04-28", city:"Sheffield",  adminEmail:"d.morris@novatech.co.uk",     domain:"novatech.co.uk"         },
];

const INIT_USERS = [
  { id:"u1",  name:"Dr. Sarah Mitchell",  email:"s.mitchell@meridian.nhs.uk",       tenantId:"tn1",  role:"tenant_admin", status:"active",    lastLogin:"2026-05-02T14:20:00Z", mfa:true,  created:"2023-03-15" },
  { id:"u2",  name:"Jonathan Park",       email:"j.park@sterling.co.uk",            tenantId:"tn3",  role:"tenant_admin", status:"active",    lastLogin:"2026-05-02T11:10:00Z", mfa:true,  created:"2022-11-08" },
  { id:"u3",  name:"Alexander Hughes",    email:"a.hughes@techflow.com",            tenantId:"tn2",  role:"tenant_admin", status:"active",    lastLogin:"2026-05-01T09:45:00Z", mfa:false, created:"2023-07-22" },
  { id:"u4",  name:"Marcus Webb",         email:"m.webb@riverside-logistics.com",   tenantId:"tn5",  role:"tenant_admin", status:"active",    lastLogin:"2026-04-30T16:30:00Z", mfa:true,  created:"2023-05-11" },
  { id:"u5",  name:"Camille Dupont",      email:"c.dupont@arcadia.com",             tenantId:"tn4",  role:"tenant_admin", status:"active",    lastLogin:"2026-04-29T10:20:00Z", mfa:false, created:"2024-01-20" },
  { id:"u6",  name:"Rachel Greene",       email:"r.greene@bloom-edu.org.uk",        tenantId:"tn6",  role:"tenant_admin", status:"active",    lastLogin:"2026-04-28T08:55:00Z", mfa:false, created:"2024-03-04" },
  { id:"u7",  name:"Mark Stevens",        email:"m.stevens@highfield.co.uk",        tenantId:"tn7",  role:"tenant_admin", status:"active",    lastLogin:"2026-04-25T13:40:00Z", mfa:false, created:"2024-05-17" },
  { id:"u8",  name:"Marcus Chambers",     email:"m.chambers@vertex.co.uk",          tenantId:"tn8",  role:"tenant_admin", status:"active",    lastLogin:"2026-04-27T11:15:00Z", mfa:true,  created:"2023-09-30" },
  { id:"u9",  name:"Amy Holloway",        email:"a.holloway@clearpath.co.uk",       tenantId:"tn9",  role:"tenant_admin", status:"suspended", lastLogin:"2026-03-10T09:00:00Z", mfa:false, created:"2024-02-14" },
  { id:"u10", name:"Dr. Emily Patel",     email:"e.patel@harrowmed.co.uk",          tenantId:"tn10", role:"tenant_admin", status:"active",    lastLogin:"2026-05-01T15:50:00Z", mfa:true,  created:"2022-08-19" },
  { id:"u11", name:"Rebecca Davison",     email:"r.davison@zenith.co.uk",           tenantId:"tn11", role:"tenant_admin", status:"active",    lastLogin:"2026-04-26T12:00:00Z", mfa:true,  created:"2023-12-01" },
  { id:"u12", name:"Daniel Morris",       email:"d.morris@novatech.co.uk",          tenantId:"tn12", role:"tenant_admin", status:"pending",   lastLogin:null,                   mfa:false, created:"2026-04-28" },
  { id:"u13", name:"James Chen",          email:"j.chen@meridian.nhs.uk",           tenantId:"tn1",  role:"user",         status:"active",    lastLogin:"2026-05-01T14:10:00Z", mfa:false, created:"2023-04-01" },
  { id:"u14", name:"Priya Nair",          email:"p.nair@sterling.co.uk",            tenantId:"tn3",  role:"manager",      status:"active",    lastLogin:"2026-05-02T09:30:00Z", mfa:true,  created:"2022-12-01" },
  { id:"u15", name:"Tom Fletcher",        email:"t.fletcher@riverside-logistics.com",tenantId:"tn5", role:"user",         status:"active",    lastLogin:"2026-04-29T17:45:00Z", mfa:false, created:"2023-06-15" },
];

const REV_MONTHS = [
  { month:"Nov '25", mrr:38500, new:4200, churn:1200 },
  { month:"Dec '25", mrr:42000, new:5100, churn:800  },
  { month:"Jan '26", mrr:46500, new:6300, churn:1100 },
  { month:"Feb '26", mrr:51000, new:5900, churn:900  },
  { month:"Mar '26", mrr:55200, new:5600, churn:1400 },
  { month:"Apr '26", mrr:57600, new:4800, churn:600  },
];

const INIT_AUDIT = [
  { id:"a1",  ts:"2026-05-02T14:32:00Z", actor:"superadmin@nexapoint.io",          action:"tenant.suspended",   target:"ClearPath Recruitment",        sev:"warning", ip:"10.0.1.1"     },
  { id:"a2",  ts:"2026-05-02T11:15:00Z", actor:"j.park@sterling.co.uk",            action:"user.login",          target:"j.park@sterling.co.uk",        sev:"info",    ip:"82.45.11.93"  },
  { id:"a3",  ts:"2026-05-02T09:44:00Z", actor:"superadmin@nexapoint.io",          action:"user.created",         target:"d.morris@novatech.co.uk",      sev:"success", ip:"10.0.1.1"     },
  { id:"a4",  ts:"2026-05-01T17:22:00Z", actor:"s.mitchell@meridian.nhs.uk",      action:"role.changed",         target:"j.chen → Manager",             sev:"info",    ip:"90.12.34.56"  },
  { id:"a5",  ts:"2026-05-01T15:08:00Z", actor:"superadmin@nexapoint.io",          action:"feature.toggled",     target:"bulk_export → enabled",        sev:"info",    ip:"10.0.1.1"     },
  { id:"a6",  ts:"2026-05-01T12:33:00Z", actor:"system",                           action:"backup.completed",    target:"daily-backup-2026-05-01",      sev:"success", ip:"internal"     },
  { id:"a7",  ts:"2026-05-01T10:55:00Z", actor:"a.holloway@clearpath.co.uk",       action:"login.failed",        target:"3 failed attempts",            sev:"danger",  ip:"45.33.88.21"  },
  { id:"a8",  ts:"2026-04-30T16:40:00Z", actor:"superadmin@nexapoint.io",          action:"plan.upgraded",       target:"Bloom Education → Enterprise", sev:"success", ip:"10.0.1.1"     },
  { id:"a9",  ts:"2026-04-30T14:12:00Z", actor:"system",                           action:"cert.renewed",        target:"*.nexapoint.io SSL",           sev:"success", ip:"internal"     },
  { id:"a10", ts:"2026-04-29T09:30:00Z", actor:"superadmin@nexapoint.io",          action:"tenant.created",      target:"NovaTech Manufacturing",       sev:"success", ip:"10.0.1.1"     },
  { id:"a11", ts:"2026-04-28T18:55:00Z", actor:"m.webb@riverside-logistics.com",   action:"data.exported",       target:"invoice_history_2026.csv",     sev:"warning", ip:"195.44.23.11" },
  { id:"a12", ts:"2026-04-28T11:00:00Z", actor:"system",                           action:"alert.triggered",     target:"Memory usage > 85% eu-west-1", sev:"danger",  ip:"internal"     },
];

const INIT_INTEGRATIONS = [
  { id:"i1",  name:"Stripe",         cat:"Payments",      status:"connected",    icon:"💳", lastSync:"2026-05-02T14:00:00Z" },
  { id:"i2",  name:"SendGrid",       cat:"Email",         status:"connected",    icon:"✉️", lastSync:"2026-05-02T13:45:00Z" },
  { id:"i3",  name:"Twilio",         cat:"SMS",           status:"connected",    icon:"📱", lastSync:"2026-05-02T12:00:00Z" },
  { id:"i4",  name:"CreditSafe",     cat:"Credit Checks", status:"connected",    icon:"🛡️", lastSync:"2026-05-02T10:30:00Z" },
  { id:"i5",  name:"Companies House",cat:"KYB",           status:"connected",    icon:"🏛️", lastSync:"2026-05-01T18:00:00Z" },
  { id:"i6",  name:"AWS S3",         cat:"Storage",       status:"connected",    icon:"☁️", lastSync:"2026-05-02T14:10:00Z" },
  { id:"i7",  name:"PagerDuty",      cat:"Monitoring",    status:"connected",    icon:"🔔", lastSync:"2026-05-02T14:00:00Z" },
  { id:"i8",  name:"Datadog",        cat:"Monitoring",    status:"error",        icon:"📊", lastSync:"2026-05-01T09:00:00Z" },
  { id:"i9",  name:"Slack",          cat:"Notifications", status:"connected",    icon:"💬", lastSync:"2026-05-02T14:05:00Z" },
  { id:"i10", name:"DocuSign",       cat:"E-Signature",   status:"disconnected", icon:"✍️", lastSync:null                   },
  { id:"i11", name:"Xero",           cat:"Accounting",    status:"disconnected", icon:"📒", lastSync:null                   },
];

const INIT_FLAGS = [
  { id:"f1",  key:"bulk_export",        label:"Bulk Data Export",           enabled:true,  scope:"tenant",  desc:"Allow tenants to export data in bulk CSV"         },
  { id:"f2",  key:"mfa_required",       label:"Force MFA on All Accounts",  enabled:false, scope:"global",  desc:"Require 2FA for every user login"                 },
  { id:"f3",  key:"ai_assistant",       label:"AI Proposal Assistant",      enabled:true,  scope:"tenant",  desc:"In-app AI for proposal drafting & analysis"       },
  { id:"f4",  key:"credit_auto",        label:"Auto Credit Checks",         enabled:true,  scope:"global",  desc:"Trigger CreditSafe check automatically on checkout"},
  { id:"f5",  key:"dark_mode",          label:"Dark Mode UI",               enabled:true,  scope:"tenant",  desc:"Allow users to toggle dark/light theme"           },
  { id:"f6",  key:"api_access",         label:"REST API Access",            enabled:false, scope:"tenant",  desc:"Expose REST API endpoints to tenant developers"    },
  { id:"f7",  key:"advanced_reports",   label:"Advanced Reporting",         enabled:true,  scope:"tenant",  desc:"BI dashboard and export-grade reporting"          },
  { id:"f8",  key:"two_way_sms",        label:"Two-Way SMS",                enabled:false, scope:"tenant",  desc:"Enable inbound SMS for Twilio integration"        },
  { id:"f9",  key:"maintenance_mode",   label:"Maintenance Mode",           enabled:false, scope:"global",  desc:"Show maintenance page to all non-superadmin users"},
  { id:"f10", key:"beta_features",      label:"Beta Features",              enabled:false, scope:"tenant",  desc:"Grant selected tenants access to unreleased features"},
];

const PERMISSIONS_MATRIX = [
  { perm:"View Tenants",        superAdmin:true,  admin:true,  tenantAdmin:true,  manager:false, user:false },
  { perm:"Create Tenants",      superAdmin:true,  admin:true,  tenantAdmin:false, manager:false, user:false },
  { perm:"Suspend Tenants",     superAdmin:true,  admin:false, tenantAdmin:false, manager:false, user:false },
  { perm:"View All Users",      superAdmin:true,  admin:true,  tenantAdmin:true,  manager:false, user:false },
  { perm:"Create Users",        superAdmin:true,  admin:true,  tenantAdmin:true,  manager:false, user:false },
  { perm:"Edit Users",          superAdmin:true,  admin:true,  tenantAdmin:true,  manager:true,  user:false },
  { perm:"Delete Users",        superAdmin:true,  admin:true,  tenantAdmin:false, manager:false, user:false },
  { perm:"View Billing",        superAdmin:true,  admin:true,  tenantAdmin:true,  manager:false, user:false },
  { perm:"Edit Billing",        superAdmin:true,  admin:false, tenantAdmin:false, manager:false, user:false },
  { perm:"View Audit Logs",     superAdmin:true,  admin:true,  tenantAdmin:false, manager:false, user:false },
  { perm:"Edit System Config",  superAdmin:true,  admin:false, tenantAdmin:false, manager:false, user:false },
  { perm:"Manage Integrations", superAdmin:true,  admin:false, tenantAdmin:false, manager:false, user:false },
  { perm:"View Reports",        superAdmin:true,  admin:true,  tenantAdmin:true,  manager:true,  user:true  },
  { perm:"Export Data",         superAdmin:true,  admin:true,  tenantAdmin:true,  manager:false, user:false },
  { perm:"Toggle Feature Flags",superAdmin:true,  admin:false, tenantAdmin:false, manager:false, user:false },
];

// ── Confirm Dialog ────────────────────────────────────────────────────────────
const Confirm = ({ title, msg, okLabel="Confirm", danger=true, onOk, onCancel }) => (
  <div className="sa-confirm-bg" onClick={e=>e.target===e.currentTarget&&onCancel()}>
    <div className="sa-confirm">
      <div style={{ width:46,height:46,borderRadius:"50%",background:danger?"rgba(163,51,31,.1)":"rgba(27,107,74,.1)",color:danger?"#a3331f":"#1b6b4a",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
        {danger?<Ic.Trash s={20}/>:<Ic.Check s={20}/>}
      </div>
      <div style={{ fontFamily:"var(--serif)",fontSize:17,marginBottom:8 }}>{title}</div>
      <p style={{ fontSize:13,color:"var(--muted)",marginBottom:24,lineHeight:1.5 }}>{msg}</p>
      <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn" style={{ background:danger?"#a3331f":"#1b6b4a",color:"#fff",borderRadius:999 }} onClick={onOk}>{okLabel}</button>
      </div>
    </div>
  </div>
);

// ── Login Screen ──────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail]     = useState("superadmin@nexapoint.io");
  const [pw, setPw]           = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handle = () => {
    setError("");
    if (!email.trim() || !pw) { setError("Please enter your email and password."); return; }
    if (email.trim() === "superadmin@nexapoint.io" && pw === "super123") {
      setLoading(true);
      setTimeout(() => {
        const u = { email: email.trim(), name: "System Super Admin", role: "Super Administrator", type: "superadmin" };
        sessionStorage.setItem("np_portal_auth", JSON.stringify(u));
        onLogin(u);
      }, 900);
    } else {
      setError("Invalid credentials. Please check your email and password.");
    }
  };

  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(160deg,#03080f 0%,#0b1e3a 55%,#1a0f06 100%)",fontFamily:"var(--sans)",padding:20,position:"relative",overflow:"hidden" }}>
      <div style={{ position:"fixed",inset:0,backgroundImage:"radial-gradient(rgba(184,147,90,.05) 1px,transparent 1px)",backgroundSize:"28px 28px",pointerEvents:"none" }}/>
      <div style={{ width:"min(420px,100%)",position:"relative",zIndex:1 }}>
        <div style={{ textAlign:"center",marginBottom:32 }}>
          <div style={{ width:54,height:54,borderRadius:14,margin:"0 auto 14px",background:"linear-gradient(135deg,#b8935a 0%,#8b6a3a 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:23,fontFamily:"var(--serif)",color:"#fff",fontWeight:700,boxShadow:"0 8px 28px rgba(184,147,90,.4)" }}>N</div>
          <div style={{ fontFamily:"var(--serif)",fontSize:22,color:"#f5f0e8",marginBottom:4 }}>NexaPoint</div>
          <div style={{ fontSize:10,letterSpacing:".2em",textTransform:"uppercase",color:"#b8935a",fontWeight:700 }}>Super Admin Portal</div>
        </div>

        <div style={{ background:"rgba(255,255,255,.04)",backdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,.08)",borderRadius:20,padding:"32px 28px" }}>
          <h2 style={{ fontSize:20,fontFamily:"var(--serif)",color:"#f5f0e8",margin:"0 0 5px" }}>Sign in to continue</h2>
          <p style={{ fontSize:13,color:"rgba(255,255,255,.38)",margin:"0 0 28px" }}>Restricted access — authorised personnel only</p>

          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".07em",display:"block",marginBottom:6 }}>Email address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()}
                style={{ width:"100%",padding:"10px 12px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:8,color:"#f5f0e8",fontSize:14,fontFamily:"var(--sans)",outline:"none" }}/>
            </div>
            <div>
              <label style={{ fontSize:11,fontWeight:600,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".07em",display:"block",marginBottom:6 }}>Password</label>
              <div style={{ position:"relative" }}>
                <input type={showPw?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()}
                  style={{ width:"100%",padding:"10px 40px 10px 12px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:8,color:"#f5f0e8",fontSize:14,fontFamily:"var(--sans)",outline:"none" }}/>
                <button onClick={()=>setShowPw(v=>!v)} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,.35)",padding:0,display:"flex",alignItems:"center" }}>
                  {showPw?<Ic.EyeOff s={14}/>:<Ic.Eye s={14}/>}
                </button>
              </div>
            </div>
          </div>

          {error && <div style={{ marginTop:14,padding:"9px 12px",background:"rgba(163,51,31,.18)",border:"1px solid rgba(163,51,31,.3)",borderRadius:8,fontSize:13,color:"#f08070" }}>{error}</div>}

          <button onClick={handle} disabled={loading} style={{ width:"100%",marginTop:22,padding:"11px",background:loading?"rgba(184,147,90,.45)":"linear-gradient(135deg,#b8935a,#8b6a3a)",border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:600,cursor:loading?"not-allowed":"pointer",fontFamily:"var(--sans)",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
            {loading?<><div style={{ width:14,height:14,border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"saSpinL .7s linear infinite" }}/>Signing in…</>:"Sign in"}
          </button>

          <div style={{ marginTop:20,padding:"11px 14px",background:"rgba(255,255,255,.03)",borderRadius:9,border:"1px solid rgba(255,255,255,.06)" }}>
            <div style={{ fontSize:11,color:"rgba(255,255,255,.3)",marginBottom:5,fontWeight:600,textTransform:"uppercase",letterSpacing:".07em" }}>Demo credentials</div>
            <div style={{ fontSize:12,color:"rgba(255,255,255,.5)",fontFamily:"var(--mono)" }}>superadmin@nexapoint.io · super123</div>
          </div>
        </div>
      </div>
      <style>{`@keyframes saSpinL{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = ({ tenants, users, audit }) => {
  const totalMRR   = tenants.reduce((a,t)=>a+t.mrr,0);
  const activeT    = tenants.filter(t=>t.status==="active").length;
  const activeU    = users.filter(u=>u.status==="active").length;
  const newThisMonth = tenants.filter(t=>t.created>="2026-04-01").length;
  const maxMrr = Math.max(...REV_MONTHS.map(m=>m.mrr));

  const topTenants = [...tenants].sort((a,b)=>b.mrr-a.mrr).slice(0,6);

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:"var(--serif)",fontSize:28,marginBottom:4 }}>System Overview</h1>
        <p style={{ fontSize:13,color:"var(--muted)" }}>NexaPoint platform — all tenants, users and revenue</p>
      </div>

      {/* Stat cards */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:16,marginBottom:28 }}>
        {[
          { label:"Total MRR",       val:fmt(totalMRR), sub:`${fmt(totalMRR*12)} ARR`,           col:"#b8935a" },
          { label:"Active Tenants",  val:activeT,        sub:`${tenants.length} total`,           col:"#0b2f6b" },
          { label:"Active Users",    val:activeU,        sub:`${users.length} total accounts`,   col:"#1b6b4a" },
          { label:"New This Month",  val:newThisMonth,   sub:"Tenant onboards Apr '26",           col:"#16478f" },
          { label:"MRR Growth",      val:"+5.8%",        sub:"vs. previous month",                col:"#1b6b4a" },
          { label:"Churn Rate",      val:"1.0%",         sub:"Apr '26 — improving",              col:"#8b6a3a" },
        ].map(s=>(
          <div key={s.label} className="sa-stat" style={{ borderLeftColor:s.col }}>
            <div style={{ fontSize:11,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8 }}>{s.label}</div>
            <div style={{ fontSize:28,fontWeight:700,fontFamily:"var(--serif)",color:s.col,lineHeight:1 }}>{s.val}</div>
            <div style={{ fontSize:12,color:"var(--muted)",marginTop:7 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:22,marginBottom:22 }}>
        {/* MRR chart */}
        <div className="sa-card">
          <div style={{ fontFamily:"var(--serif)",fontSize:17,marginBottom:4 }}>Monthly Recurring Revenue</div>
          <div style={{ fontSize:12,color:"var(--muted)",marginBottom:18 }}>6-month MRR trend</div>
          <div style={{ display:"flex",alignItems:"flex-end",gap:10,height:160 }}>
            {REV_MONTHS.map(m=>{
              const scale = m.mrr/maxMrr;
              return (
                <div key={m.month} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5,height:"100%" }}>
                  <div style={{ fontSize:10,color:"var(--muted)",fontWeight:600 }}>{fmtK(m.mrr)}</div>
                  <div style={{ flex:1,width:"100%",display:"flex",flexDirection:"column",justifyContent:"flex-end" }}>
                    <div title={fmt(m.mrr)} style={{ width:"100%",background:"linear-gradient(to top,#b8935a,#d4ad72)",borderRadius:"4px 4px 0 0",height:`${scale*120}px`,transition:"height .4s" }}/>
                  </div>
                  <div style={{ fontSize:10,color:"var(--muted)",whiteSpace:"nowrap" }}>{m.month}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top tenants */}
        <div className="sa-card">
          <div style={{ fontFamily:"var(--serif)",fontSize:17,marginBottom:16 }}>Top Tenants by MRR</div>
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {topTenants.map((t,i)=>(
              <div key={t.id} style={{ display:"flex",alignItems:"center",gap:10 }}>
                <div style={{ fontSize:11,fontWeight:700,color:"var(--muted)",width:16,flexShrink:0 }}>{i+1}</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:12,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{t.name}</div>
                  <div style={{ marginTop:4,height:4,background:"var(--bg-alt)",borderRadius:2 }}>
                    <div style={{ height:4,background:"#b8935a",borderRadius:2,width:`${(t.mrr/topTenants[0].mrr)*100}%`,transition:"width .4s" }}/>
                  </div>
                </div>
                <div style={{ fontSize:12,fontWeight:700,color:"var(--ink)",whiteSpace:"nowrap" }}>{fmt(t.mrr)}<span style={{ fontSize:10,fontWeight:400,color:"var(--muted)" }}>/mo</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent audit */}
      <div className="sa-card">
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
          <div style={{ fontFamily:"var(--serif)",fontSize:17 }}>Recent Activity</div>
          <span style={{ fontSize:12,color:"var(--muted)" }}>Last 12 events</span>
        </div>
        <table className="sa-tbl">
          <thead><tr>
            <th>Time</th><th>Actor</th><th>Action</th><th>Target</th><th>Severity</th>
          </tr></thead>
          <tbody>
            {audit.slice(0,7).map(e=>(
              <tr key={e.id}>
                <td style={{ fontSize:12,color:"var(--muted)",whiteSpace:"nowrap",fontFamily:"var(--mono)" }}>{fmtTime(e.ts)}</td>
                <td style={{ fontSize:12,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{e.actor}</td>
                <td style={{ fontFamily:"var(--mono)",fontSize:11,color:"var(--ink-2)" }}>{e.action}</td>
                <td style={{ fontSize:12,color:"var(--muted)",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{e.target}</td>
                <td><span className={`sa-badge sev-${e.sev}`}>{e.sev}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Tenant Add / Edit Modal ───────────────────────────────────────────────────
const TenantModal = ({ tenant, onSave, onClose }) => {
  const isNew = !tenant;
  const [form, setForm] = useState(tenant || { name:"",industry:"Technology",plan:"starter",adminEmail:"",domain:"",city:"London",status:"active" });
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  return (
    <div className="sa-modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sa-modal">
        <div className="sa-modal-head">
          <div style={{ fontFamily:"var(--serif)",fontSize:17 }}>{isNew?"New Tenant":"Edit Tenant"}</div>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--muted)",display:"flex" }}><Ic.X s={16}/></button>
        </div>
        <div className="sa-modal-body" style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div className="sa-grid-2">
            <div className="sa-field"><label>Organisation Name</label><input value={form.name} onChange={set("name")} placeholder="Acme Corp Ltd"/></div>
            <div className="sa-field"><label>Industry</label>
              <select value={form.industry} onChange={set("industry")}>
                {["Technology","Healthcare","Finance","Logistics","Retail","Education","Hospitality","Manufacturing","Recruitment","Other"].map(v=><option key={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="sa-grid-2">
            <div className="sa-field"><label>Plan</label>
              <select value={form.plan} onChange={set("plan")}>
                <option value="trial">Trial</option><option value="starter">Starter</option><option value="business">Business</option><option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="sa-field"><label>City</label><input value={form.city} onChange={set("city")} placeholder="London"/></div>
          </div>
          <div className="sa-field"><label>Admin Email</label><input type="email" value={form.adminEmail} onChange={set("adminEmail")} placeholder="admin@company.com"/></div>
          <div className="sa-field"><label>Domain</label><input value={form.domain} onChange={set("domain")} placeholder="company.com"/></div>
          <div className="sa-field"><label>Status</label>
            <select value={form.status} onChange={set("status")}>
              <option value="active">Active</option><option value="pending">Pending</option><option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
        <div className="sa-modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn" style={{ background:"#03080f",color:"#f5f0e8",borderRadius:999 }} onClick={()=>onSave(form)}>{isNew?"Create Tenant":"Save Changes"}</button>
        </div>
      </div>
    </div>
  );
};

// ── Tenant Detail (Drawer) ────────────────────────────────────────────────────
const TenantDetail = ({ tenant, allUsers, onClose, onEdit, onSuspend }) => {
  const [tab, setTab] = useState("overview");
  const tUsers = allUsers.filter(u=>u.tenantId===tenant.id);
  const plan = PLAN[tenant.plan]||PLAN.starter;
  return (
    <div className="sa-modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="sa-modal-xl">
        <div className="sa-modal-head">
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:40,height:40,borderRadius:10,background:"#b8935a",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--serif)",fontWeight:700,fontSize:17 }}>{tenant.name[0]}</div>
            <div>
              <div style={{ fontFamily:"var(--serif)",fontSize:18,fontWeight:600 }}>{tenant.name}</div>
              <div style={{ fontSize:12,color:"var(--muted)" }}>{tenant.domain} · {tenant.city}</div>
            </div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <button className="btn btn-ghost" style={{ fontSize:12,padding:"6px 14px",borderRadius:999 }} onClick={()=>onEdit(tenant)}>Edit</button>
            <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--muted)",display:"flex" }}><Ic.X s={16}/></button>
          </div>
        </div>

        <div className="sa-tabs">
          {["overview","users","billing"].map(t=>(
            <button key={t} className={`sa-tab${tab===t?" on":""}`} onClick={()=>setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}{t==="users"?` (${tUsers.length})`:""}
            </button>
          ))}
        </div>

        <div className="sa-modal-scroll" style={{ padding:24 }}>
          {tab==="overview" && (
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>
              <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
                {[
                  ["Plan",      <span className="sa-badge" style={{ color:plan.color,background:plan.bg }}>{plan.label}</span>],
                  ["Status",    <SaBadge type={tenant.status}/>],
                  ["Industry",  tenant.industry],
                  ["City",      tenant.city],
                  ["Created",   fmtDate(tenant.created)],
                  ["Domain",    tenant.domain],
                  ["Admin",     tenant.adminEmail],
                ].map(([l,v])=>(
                  <div key={l}>
                    <div style={{ fontSize:11,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:4 }}>{l}</div>
                    <div style={{ fontSize:13 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                {[
                  { label:"Monthly Revenue", val:fmt(tenant.mrr), col:"#b8935a" },
                  { label:"Annual Value",    val:fmt(tenant.mrr*12), col:"#0b2f6b" },
                  { label:"User Count",      val:tenant.users, col:"#1b6b4a" },
                ].map(s=>(
                  <div key={s.label} className="sa-stat" style={{ borderLeftColor:s.col }}>
                    <div style={{ fontSize:10,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:6 }}>{s.label}</div>
                    <div style={{ fontSize:26,fontWeight:700,fontFamily:"var(--serif)",color:s.col }}>{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==="users" && (
            <table className="sa-tbl">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th>MFA</th></tr></thead>
              <tbody>
                {tUsers.length ? tUsers.map(u=>(
                  <tr key={u.id}>
                    <td style={{ fontWeight:500 }}>{u.name}</td>
                    <td style={{ fontSize:12,color:"var(--muted)" }}>{u.email}</td>
                    <td><span className="sa-badge" style={{ background:"var(--bg-alt)",color:"var(--ink)" }}>{u.role.replace("_"," ")}</span></td>
                    <td><SaBadge type={u.status}/></td>
                    <td style={{ fontSize:12,color:"var(--muted)" }}>{fmtTime(u.lastLogin)}</td>
                    <td>{u.mfa?<span style={{ color:"#1b6b4a",fontSize:12,fontWeight:600 }}>✓ On</span>:<span style={{ color:"var(--muted)",fontSize:12 }}>Off</span>}</td>
                  </tr>
                )) : <tr><td colSpan={6} style={{ textAlign:"center",color:"var(--muted)",padding:"32px 0" }}>No users found for this tenant.</td></tr>}
              </tbody>
            </table>
          )}

          {tab==="billing" && (
            <div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:22 }}>
                {[
                  { label:"MRR",  val:fmt(tenant.mrr),      col:"#b8935a" },
                  { label:"ARR",  val:fmt(tenant.mrr*12),   col:"#0b2f6b" },
                  { label:"Plan", val:plan.label,           col:plan.color },
                ].map(s=>(
                  <div key={s.label} className="sa-stat" style={{ borderLeftColor:s.col }}>
                    <div style={{ fontSize:10,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:6 }}>{s.label}</div>
                    <div style={{ fontSize:22,fontWeight:700,fontFamily:"var(--serif)",color:s.col }}>{s.val}</div>
                  </div>
                ))}
              </div>
              <table className="sa-tbl">
                <thead><tr><th>Invoice</th><th>Period</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {["Apr 2026","Mar 2026","Feb 2026","Jan 2026"].map((mo,i)=>(
                    <tr key={mo}>
                      <td style={{ fontFamily:"var(--mono)",fontSize:12 }}>INV-{tenant.id.toUpperCase()}-{2026040-i*100}</td>
                      <td style={{ fontSize:12 }}>{mo}</td>
                      <td style={{ fontWeight:600 }}>{fmt(tenant.mrr)}</td>
                      <td><span className="sa-badge sev-success">Paid</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="sa-modal-foot">
          {tenant.status==="active"
            ? <button className="btn btn-ghost" style={{ color:"#a3331f",marginRight:"auto" }} onClick={()=>onSuspend(tenant.id)}>Suspend Tenant</button>
            : <button className="btn btn-ghost" style={{ color:"#1b6b4a",marginRight:"auto" }} onClick={()=>onSuspend(tenant.id)}>Reinstate Tenant</button>
          }
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

// ── Tenants View ──────────────────────────────────────────────────────────────
const TenantsView = ({ tenants, setTenants, users }) => {
  const [q, setQ]           = useState("");
  const [filter, setFilter] = useState("all");
  const [modal, setModal]   = useState(null); // "add" | tenant-obj (edit) | null
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const filtered = tenants.filter(t=>{
    if (filter!=="all" && t.status!==filter && t.plan!==filter) return false;
    if (q && !t.name.toLowerCase().includes(q.toLowerCase()) && !t.domain.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const save = (form) => {
    if (!form.id) {
      setTenants(prev=>[...prev,{...form,id:"tn"+(prev.length+1),mrr:0,users:0,created:new Date().toISOString().slice(0,10)}]);
    } else {
      setTenants(prev=>prev.map(t=>t.id===form.id?{...t,...form}:t));
    }
    setModal(null);
  };

  const toggleSuspend = (id) => {
    setTenants(prev=>prev.map(t=>t.id===id?{...t,status:t.status==="suspended"?"active":"suspended"}:t));
    setDetail(null); setConfirm(null);
  };

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--serif)",fontSize:26,marginBottom:3 }}>Tenants</h1>
          <p style={{ fontSize:13,color:"var(--muted)" }}>{tenants.length} organisations · {tenants.filter(t=>t.status==="active").length} active</p>
        </div>
        <button className="btn" style={{ background:"#03080f",color:"#f5f0e8",borderRadius:999,fontSize:13,padding:"9px 18px",display:"flex",alignItems:"center",gap:7 }} onClick={()=>setModal({})}>
          <Ic.Plus s={13}/> New Tenant
        </button>
      </div>

      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:18,flexWrap:"wrap" }}>
        <div className="sa-search">
          <Ic.Search s={14}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search tenants…"/>
        </div>
        {["all","active","suspended","enterprise","business","starter","trial"].map(f=>(
          <button key={f} className={`sa-chip-filter${filter===f?" on":""}`} onClick={()=>setFilter(f)}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      <div className="sa-card" style={{ padding:0,overflow:"hidden" }}>
        <table className="sa-tbl">
          <thead><tr><th>Organisation</th><th>Industry</th><th>Plan</th><th>Users</th><th>MRR</th><th>Status</th><th>Created</th><th></th></tr></thead>
          <tbody>
            {filtered.map(t=>{
              const plan = PLAN[t.plan]||PLAN.starter;
              return (
                <tr key={t.id} className="clickable" onClick={()=>setDetail(t)}>
                  <td>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <div style={{ width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#b8935a,#8b6a3a)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,flexShrink:0 }}>{t.name[0]}</div>
                      <div>
                        <div style={{ fontWeight:600,fontSize:13 }}>{t.name}</div>
                        <div style={{ fontSize:11,color:"var(--muted)" }}>{t.domain}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize:12,color:"var(--muted)" }}>{t.industry}</td>
                  <td><span className="sa-badge" style={{ color:plan.color,background:plan.bg }}>{plan.label}</span></td>
                  <td style={{ fontSize:13,fontWeight:500 }}>{t.users}</td>
                  <td style={{ fontSize:13,fontWeight:600 }}>{t.mrr?fmt(t.mrr):"—"}</td>
                  <td><SaBadge type={t.status}/></td>
                  <td style={{ fontSize:12,color:"var(--muted)" }}>{fmtDate(t.created)}</td>
                  <td onClick={e=>e.stopPropagation()}>
                    <div style={{ display:"flex",gap:6 }}>
                      <button title="Edit" onClick={()=>setModal(t)} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--muted)",padding:5,borderRadius:6,display:"flex",alignItems:"center" }}><Ic.Edit s={13}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!filtered.length && <tr><td colSpan={8} style={{ textAlign:"center",padding:"40px 0",color:"var(--muted)" }}>No tenants match your filter.</td></tr>}
          </tbody>
        </table>
      </div>

      {modal!==null && <TenantModal tenant={modal.id?modal:null} onSave={save} onClose={()=>setModal(null)}/>}
      {detail && <TenantDetail tenant={detail} allUsers={users} onClose={()=>setDetail(null)} onEdit={t=>{setDetail(null);setModal(t);}} onSuspend={id=>setConfirm({id,action:detail.status==="suspended"?"reinstate":"suspend"})}/>}
      {confirm && <Confirm
        title={confirm.action==="suspend"?"Suspend tenant?":"Reinstate tenant?"}
        msg={confirm.action==="suspend"?"This will lock out all users of this tenant.":"This will restore access for all tenant users."}
        okLabel={confirm.action==="suspend"?"Suspend":"Reinstate"}
        danger={confirm.action==="suspend"}
        onOk={()=>toggleSuspend(confirm.id)}
        onCancel={()=>setConfirm(null)}
      />}
    </div>
  );
};

// ── Users View ────────────────────────────────────────────────────────────────
const UsersView = ({ users, setUsers, tenants }) => {
  const [q, setQ]           = useState("");
  const [tFilter, setTFilter] = useState("all");
  const [rFilter, setRFilter] = useState("all");
  const [modal, setModal]   = useState(null);
  const [confirm, setConfirm] = useState(null);

  const filtered = users.filter(u=>{
    if (tFilter!=="all" && u.tenantId!==tFilter) return false;
    if (rFilter!=="all" && u.role!==rFilter) return false;
    if (q && !u.name.toLowerCase().includes(q.toLowerCase()) && !u.email.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const getTenantName = id => tenants.find(t=>t.id===id)?.name||"—";

  const saveUser = (form) => {
    if (!form.id) {
      setUsers(prev=>[...prev,{...form,id:"u"+(prev.length+1),created:new Date().toISOString().slice(0,10),lastLogin:null}]);
    } else {
      setUsers(prev=>prev.map(u=>u.id===form.id?{...u,...form}:u));
    }
    setModal(null);
  };

  const toggleStatus = id => {
    setUsers(prev=>prev.map(u=>u.id===id?{...u,status:u.status==="active"?"suspended":"active"}:u));
    setConfirm(null);
  };

  const ROLES = ["tenant_admin","manager","user","read_only"];

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--serif)",fontSize:26,marginBottom:3 }}>User Accounts</h1>
          <p style={{ fontSize:13,color:"var(--muted)" }}>{users.length} accounts across all tenants</p>
        </div>
        <button className="btn" style={{ background:"#03080f",color:"#f5f0e8",borderRadius:999,fontSize:13,padding:"9px 18px",display:"flex",alignItems:"center",gap:7 }} onClick={()=>setModal({})}>
          <Ic.Plus s={13}/> New User
        </button>
      </div>

      <div style={{ display:"flex",gap:10,marginBottom:18,flexWrap:"wrap",alignItems:"center" }}>
        <div className="sa-search"><Ic.Search s={14}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search users…"/></div>
        <select style={{ padding:"7px 10px",border:"1px solid var(--line-2)",borderRadius:7,fontSize:12,background:"var(--surface)",color:"var(--ink)",fontFamily:"var(--sans)" }} value={tFilter} onChange={e=>setTFilter(e.target.value)}>
          <option value="all">All Tenants</option>
          {tenants.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select style={{ padding:"7px 10px",border:"1px solid var(--line-2)",borderRadius:7,fontSize:12,background:"var(--surface)",color:"var(--ink)",fontFamily:"var(--sans)" }} value={rFilter} onChange={e=>setRFilter(e.target.value)}>
          <option value="all">All Roles</option>
          {ROLES.map(r=><option key={r} value={r}>{r.replace("_"," ")}</option>)}
        </select>
      </div>

      <div className="sa-card" style={{ padding:0,overflow:"hidden" }}>
        <table className="sa-tbl">
          <thead><tr><th>Name</th><th>Email</th><th>Tenant</th><th>Role</th><th>Status</th><th>MFA</th><th>Last Login</th><th></th></tr></thead>
          <tbody>
            {filtered.map(u=>(
              <tr key={u.id}>
                <td>
                  <div style={{ display:"flex",alignItems:"center",gap:9 }}>
                    <div style={{ width:30,height:30,borderRadius:8,background:"#0b2f6b",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0 }}>
                      {u.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                    </div>
                    <span style={{ fontWeight:500,fontSize:13 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ fontSize:12,color:"var(--muted)" }}>{u.email}</td>
                <td style={{ fontSize:12,maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{getTenantName(u.tenantId)}</td>
                <td><span className="sa-badge" style={{ background:"var(--bg-alt)",color:"var(--ink)" }}>{u.role.replace(/_/g," ")}</span></td>
                <td><SaBadge type={u.status}/></td>
                <td>{u.mfa?<span style={{ color:"#1b6b4a",fontSize:12,fontWeight:600 }}>✓ On</span>:<span style={{ color:"#a3331f",fontSize:12 }}>Off</span>}</td>
                <td style={{ fontSize:12,color:"var(--muted)",whiteSpace:"nowrap" }}>{fmtTime(u.lastLogin)}</td>
                <td>
                  <div style={{ display:"flex",gap:5 }}>
                    <button title="Edit" onClick={()=>setModal(u)} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--muted)",padding:5,display:"flex",alignItems:"center" }}><Ic.Edit s={13}/></button>
                    <button title={u.status==="active"?"Suspend":"Reinstate"} onClick={()=>setConfirm({id:u.id,name:u.name,action:u.status==="active"?"suspend":"reinstate"})} style={{ background:"none",border:"none",cursor:"pointer",color:u.status==="active"?"#a3331f":"#1b6b4a",padding:5,display:"flex",alignItems:"center" }}>
                      {u.status==="active"?<Ic.Trash s={13}/>:<Ic.Check s={13}/>}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={8} style={{ textAlign:"center",padding:"40px 0",color:"var(--muted)" }}>No users match your filter.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* User modal */}
      {modal!==null && (
        <div className="sa-modal-bg" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="sa-modal">
            <div className="sa-modal-head">
              <div style={{ fontFamily:"var(--serif)",fontSize:17 }}>{modal.id?"Edit User":"New User"}</div>
              <button onClick={()=>setModal(null)} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--muted)",display:"flex" }}><Ic.X s={16}/></button>
            </div>
            <div className="sa-modal-body" style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div className="sa-grid-2">
                <div className="sa-field"><label>Full Name</label><input value={modal.name||""} onChange={e=>setModal(m=>({...m,name:e.target.value}))} placeholder="Jane Smith"/></div>
                <div className="sa-field"><label>Email</label><input type="email" value={modal.email||""} onChange={e=>setModal(m=>({...m,email:e.target.value}))} placeholder="jane@company.com"/></div>
              </div>
              <div className="sa-grid-2">
                <div className="sa-field"><label>Tenant</label>
                  <select value={modal.tenantId||""} onChange={e=>setModal(m=>({...m,tenantId:e.target.value}))}>
                    <option value="">— Select tenant —</option>
                    {tenants.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="sa-field"><label>Role</label>
                  <select value={modal.role||"user"} onChange={e=>setModal(m=>({...m,role:e.target.value}))}>
                    {ROLES.map(r=><option key={r} value={r}>{r.replace(/_/g," ")}</option>)}
                  </select>
                </div>
              </div>
              <div className="sa-field"><label>Status</label>
                <select value={modal.status||"active"} onChange={e=>setModal(m=>({...m,status:e.target.value}))}>
                  <option value="active">Active</option><option value="pending">Pending</option><option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div className="sa-modal-foot">
              <button className="btn btn-ghost" onClick={()=>setModal(null)}>Cancel</button>
              <button className="btn" style={{ background:"#03080f",color:"#f5f0e8",borderRadius:999 }} onClick={()=>saveUser(modal)}>{modal.id?"Save Changes":"Create User"}</button>
            </div>
          </div>
        </div>
      )}

      {confirm && <Confirm
        title={confirm.action==="suspend"?"Suspend user?":"Reinstate user?"}
        msg={`${confirm.name} will ${confirm.action==="suspend"?"lose access to the platform":"regain access to the platform"}.`}
        okLabel={confirm.action==="suspend"?"Suspend":"Reinstate"}
        danger={confirm.action==="suspend"}
        onOk={()=>toggleStatus(confirm.id)}
        onCancel={()=>setConfirm(null)}
      />}
    </div>
  );
};

// ── Roles & Permissions ───────────────────────────────────────────────────────
const RolesView = () => {
  const cols = ["superAdmin","admin","tenantAdmin","manager","user"];
  const colLabels = { superAdmin:"Super Admin", admin:"Admin", tenantAdmin:"Tenant Admin", manager:"Manager", user:"User" };
  const colColors = { superAdmin:"#b8935a", admin:"#0b2f6b", tenantAdmin:"#16478f", manager:"#1b6b4a", user:"#5b6b86" };

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"var(--serif)",fontSize:26,marginBottom:3 }}>Roles & Permissions</h1>
        <p style={{ fontSize:13,color:"var(--muted)" }}>System-wide permission matrix — read-only reference</p>
      </div>

      <div className="sa-card" style={{ padding:0,overflow:"auto" }}>
        <table className="sa-tbl">
          <thead>
            <tr>
              <th style={{ minWidth:200 }}>Permission</th>
              {cols.map(c=>(
                <th key={c} style={{ textAlign:"center",minWidth:110 }}>
                  <span style={{ color:colColors[c] }}>{colLabels[c]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS_MATRIX.map(row=>(
              <tr key={row.perm}>
                <td style={{ fontSize:13,fontWeight:500 }}>{row.perm}</td>
                {cols.map(c=>(
                  <td key={c} style={{ textAlign:"center" }}>
                    <div style={{ display:"flex",justifyContent:"center" }}>
                      <div className={`perm-cell${row[c]?" on":""}`} style={{ cursor:"default" }}>
                        {row[c]&&<Ic.Check s={13}/>}
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop:20,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12 }}>
        {cols.map(c=>(
          <div key={c} className="sa-card" style={{ padding:"14px 16px" }}>
            <div style={{ fontSize:11,fontWeight:700,color:colColors[c],textTransform:"uppercase",letterSpacing:".08em",marginBottom:5 }}>{colLabels[c]}</div>
            <div style={{ fontSize:22,fontWeight:700,fontFamily:"var(--serif)" }}>{PERMISSIONS_MATRIX.filter(r=>r[c]).length}</div>
            <div style={{ fontSize:12,color:"var(--muted)" }}>of {PERMISSIONS_MATRIX.length} permissions</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Billing View ──────────────────────────────────────────────────────────────
const BillingView = ({ tenants }) => {
  const totalMRR = tenants.reduce((a,t)=>a+t.mrr,0);
  const maxMrr = Math.max(...REV_MONTHS.map(m=>m.mrr));
  const sorted = [...tenants].filter(t=>t.mrr>0).sort((a,b)=>b.mrr-a.mrr);

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"var(--serif)",fontSize:26,marginBottom:3 }}>Billing & Revenue</h1>
        <p style={{ fontSize:13,color:"var(--muted)" }}>Platform-wide revenue overview</p>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24 }}>
        {[
          { label:"Current MRR",  val:fmt(totalMRR),      col:"#b8935a" },
          { label:"ARR",          val:fmt(totalMRR*12),    col:"#0b2f6b" },
          { label:"Paying Tenants",val:tenants.filter(t=>t.mrr>0).length, col:"#1b6b4a" },
          { label:"Avg MRR",      val:fmt(Math.round(totalMRR/tenants.filter(t=>t.mrr>0).length)), col:"#16478f" },
        ].map(s=>(
          <div key={s.label} className="sa-stat" style={{ borderLeftColor:s.col }}>
            <div style={{ fontSize:11,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8 }}>{s.label}</div>
            <div style={{ fontSize:26,fontWeight:700,fontFamily:"var(--serif)",color:s.col }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:22,marginBottom:22 }}>
        <div className="sa-card">
          <div style={{ fontFamily:"var(--serif)",fontSize:17,marginBottom:4 }}>MRR Trend</div>
          <div style={{ fontSize:12,color:"var(--muted)",marginBottom:18 }}>Monthly recurring revenue growth</div>
          <div style={{ display:"flex",alignItems:"flex-end",gap:8,height:150 }}>
            {REV_MONTHS.map(m=>{
              const scale = m.mrr/maxMrr;
              return (
                <div key={m.month} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,height:"100%" }}>
                  <div style={{ fontSize:10,color:"var(--muted)",fontWeight:600 }}>{fmtK(m.mrr)}</div>
                  <div style={{ flex:1,width:"100%",display:"flex",flexDirection:"column",justifyContent:"flex-end" }}>
                    <div style={{ width:"100%",background:"linear-gradient(to top,#0b2f6b,#16478f)",borderRadius:"4px 4px 0 0",height:`${scale*110}px`,transition:"height .4s" }}/>
                  </div>
                  <div style={{ fontSize:10,color:"var(--muted)",whiteSpace:"nowrap" }}>{m.month}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="sa-card">
          <div style={{ fontFamily:"var(--serif)",fontSize:17,marginBottom:4 }}>Revenue by Plan</div>
          <div style={{ fontSize:12,color:"var(--muted)",marginBottom:16 }}>MRR breakdown</div>
          {["enterprise","business","starter"].map(plan=>{
            const planMrr = tenants.filter(t=>t.plan===plan).reduce((a,t)=>a+t.mrr,0);
            const p = PLAN[plan];
            return (
              <div key={plan} style={{ marginBottom:14 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                  <span className="sa-badge" style={{ color:p.color,background:p.bg }}>{p.label}</span>
                  <span style={{ fontSize:13,fontWeight:600 }}>{fmt(planMrr)}</span>
                </div>
                <div style={{ height:6,background:"var(--bg-alt)",borderRadius:3 }}>
                  <div style={{ height:6,background:p.color,borderRadius:3,width:`${(planMrr/totalMRR)*100}%`,transition:"width .4s" }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sa-card" style={{ padding:0,overflow:"hidden" }}>
        <div style={{ padding:"16px 20px",borderBottom:"1px solid var(--line)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ fontFamily:"var(--serif)",fontSize:17 }}>Tenant Billing</div>
          <button className="btn btn-ghost" style={{ fontSize:12,padding:"6px 14px",borderRadius:999,display:"flex",alignItems:"center",gap:6 }}><Ic.Download s={12}/>Export CSV</button>
        </div>
        <table className="sa-tbl">
          <thead><tr><th>Tenant</th><th>Plan</th><th>MRR</th><th>ARR</th><th>Users</th><th>Next Billing</th><th>Status</th></tr></thead>
          <tbody>
            {sorted.map(t=>{
              const plan=PLAN[t.plan]||PLAN.starter;
              return (
                <tr key={t.id}>
                  <td style={{ fontWeight:500,fontSize:13 }}>{t.name}</td>
                  <td><span className="sa-badge" style={{ color:plan.color,background:plan.bg }}>{plan.label}</span></td>
                  <td style={{ fontWeight:600 }}>{fmt(t.mrr)}</td>
                  <td style={{ color:"var(--muted)",fontSize:12 }}>{fmt(t.mrr*12)}</td>
                  <td style={{ fontSize:13 }}>{t.users}</td>
                  <td style={{ fontSize:12,color:"var(--muted)" }}>1 Jun 2026</td>
                  <td><SaBadge type={t.status}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Audit Log ─────────────────────────────────────────────────────────────────
const AuditView = ({ audit }) => {
  const [sev, setSev] = useState("all");
  const [q, setQ]     = useState("");

  const filtered = audit.filter(e=>{
    if (sev!=="all" && e.sev!==sev) return false;
    if (q && !e.actor.toLowerCase().includes(q.toLowerCase()) && !e.action.toLowerCase().includes(q.toLowerCase()) && !e.target.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const sevCfg = {
    info:    { color:"#16478f", bg:"rgba(22,71,143,.08)"  },
    success: { color:"#1b6b4a", bg:"rgba(27,107,74,.09)"  },
    warning: { color:"#8b6a3a", bg:"rgba(139,106,58,.12)" },
    danger:  { color:"#a3331f", bg:"rgba(163,51,31,.10)"  },
  };

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"var(--serif)",fontSize:26,marginBottom:3 }}>Audit Log</h1>
        <p style={{ fontSize:13,color:"var(--muted)" }}>System-wide event history</p>
      </div>

      <div style={{ display:"flex",gap:10,marginBottom:18,flexWrap:"wrap",alignItems:"center" }}>
        <div className="sa-search"><Ic.Search s={14}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search events…"/></div>
        {["all","info","success","warning","danger"].map(s=>(
          <button key={s} className={`sa-chip-filter${sev===s?" on":""}`} onClick={()=>setSev(s)}>
            {s.charAt(0).toUpperCase()+s.slice(1)}
          </button>
        ))}
        <button className="btn btn-ghost" style={{ fontSize:12,padding:"6px 14px",borderRadius:999,marginLeft:"auto",display:"flex",alignItems:"center",gap:6 }}><Ic.Download s={12}/>Export</button>
      </div>

      <div className="sa-card" style={{ padding:0,overflow:"hidden" }}>
        <table className="sa-tbl">
          <thead><tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Target</th><th>IP</th><th>Severity</th></tr></thead>
          <tbody>
            {filtered.map(e=>{
              const sc = sevCfg[e.sev]||sevCfg.info;
              return (
                <tr key={e.id}>
                  <td style={{ fontSize:12,color:"var(--muted)",whiteSpace:"nowrap",fontFamily:"var(--mono)" }}>{fmtTime(e.ts)}</td>
                  <td style={{ fontSize:12,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{e.actor}</td>
                  <td style={{ fontFamily:"var(--mono)",fontSize:11 }}>{e.action}</td>
                  <td style={{ fontSize:12,color:"var(--muted)",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{e.target}</td>
                  <td style={{ fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)" }}>{e.ip}</td>
                  <td><span className={`sa-badge sev-${e.sev}`}>{e.sev}</span></td>
                </tr>
              );
            })}
            {!filtered.length && <tr><td colSpan={6} style={{ textAlign:"center",padding:"40px 0",color:"var(--muted)" }}>No events match your filter.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Integrations View ─────────────────────────────────────────────────────────
const IntegrationsView = ({ integrations, setIntegrations }) => {
  const connected    = integrations.filter(i=>i.status==="connected").length;
  const errored      = integrations.filter(i=>i.status==="error").length;
  const disconnected = integrations.filter(i=>i.status==="disconnected").length;

  const toggle = id => {
    setIntegrations(prev=>prev.map(i=>{
      if (i.id!==id) return i;
      const next = i.status==="disconnected"?"connected":i.status==="connected"?"disconnected":i.status;
      return { ...i, status:next, lastSync:next==="connected"?new Date().toISOString():i.lastSync };
    }));
  };

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"var(--serif)",fontSize:26,marginBottom:3 }}>Integrations</h1>
        <p style={{ fontSize:13,color:"var(--muted)" }}>{connected} connected · {errored} errors · {disconnected} disconnected</p>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
        {integrations.map(i=>{
          const sc = STAT[i.status]||STAT.inactive;
          return (
            <div key={i.id} className="int-card">
              <div className="int-icon" style={{ fontSize:22 }}>{i.icon}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:3 }}>
                  <div style={{ fontWeight:600,fontSize:14 }}>{i.name}</div>
                  <span className="sa-badge" style={{ color:sc.color,background:sc.bg }}>{i.status}</span>
                </div>
                <div style={{ fontSize:11,color:"var(--muted)",marginBottom:4 }}>{i.cat}</div>
                {i.lastSync && <div style={{ fontSize:11,color:"var(--muted)",display:"flex",alignItems:"center",gap:4 }}><Ic.Clock s={11}/>{fmtTime(i.lastSync)}</div>}
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end" }}>
                <div className={`toggle${i.status==="connected"?" on":" off"}`} onClick={()=>toggle(i.id)} title={i.status==="connected"?"Disconnect":"Connect"}/>
                {i.status==="error" && <span style={{ fontSize:10,color:"#a3331f",fontWeight:600 }}>CHECK API KEY</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── System Config View ────────────────────────────────────────────────────────
const SystemConfigView = ({ flags, setFlags }) => {
  const [settings, setSettings] = useState({
    supportEmail: "support@nexapoint.io",
    platformDomain: "nexapoint.io",
    sessionTimeout: "480",
    maxUsersPerTenant: "200",
    dataRetentionDays: "365",
    backupFrequency: "daily",
    logLevel: "info",
  });

  const toggleFlag = id => setFlags(prev=>prev.map(f=>f.id===id?{...f,enabled:!f.enabled}:f));
  const setSetting = k => e => setSettings(s=>({...s,[k]:e.target.value}));

  const health = [
    { label:"API Gateway",    status:"operational", uptime:"99.97%", region:"eu-west-1" },
    { label:"Auth Service",   status:"operational", uptime:"99.99%", region:"eu-west-1" },
    { label:"Database",       status:"operational", uptime:"99.95%", region:"eu-west-1" },
    { label:"File Storage",   status:"operational", uptime:"100%",   region:"eu-west-1" },
    { label:"Email Service",  status:"operational", uptime:"99.92%", region:"global"    },
    { label:"Search Index",   status:"degraded",    uptime:"98.41%", region:"eu-west-1" },
  ];

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"var(--serif)",fontSize:26,marginBottom:3 }}>System Configuration</h1>
        <p style={{ fontSize:13,color:"var(--muted)" }}>Global platform settings and feature flags</p>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:22 }}>
        {/* Feature flags */}
        <div>
          <div className="sa-card" style={{ marginBottom:20 }}>
            <div style={{ fontFamily:"var(--serif)",fontSize:17,marginBottom:4 }}>Feature Flags</div>
            <div style={{ fontSize:12,color:"var(--muted)",marginBottom:18 }}>Toggle platform-wide and tenant-level features</div>
            <div style={{ display:"flex",flexDirection:"column",gap:0 }}>
              {flags.map((f,i)=>(
                <div key={f.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i<flags.length-1?"1px solid var(--line)":"none" }}>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:2 }}>
                      <span style={{ fontSize:13,fontWeight:500 }}>{f.label}</span>
                      <span className="sa-badge" style={{ background:"var(--bg-alt)",color:"var(--muted)",fontSize:9 }}>{f.scope}</span>
                    </div>
                    <div style={{ fontSize:12,color:"var(--muted)" }}>{f.desc}</div>
                  </div>
                  <div className={`toggle${f.enabled?" on":" off"}`} onClick={()=>toggleFlag(f.id)}/>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
          {/* System health */}
          <div className="sa-card">
            <div style={{ fontFamily:"var(--serif)",fontSize:17,marginBottom:4 }}>System Health</div>
            <div style={{ fontSize:12,color:"var(--muted)",marginBottom:16 }}>Real-time service status</div>
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {health.map(h=>(
                <div key={h.label} style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:8,height:8,borderRadius:"50%",background:h.status==="operational"?"#1b6b4a":"#b8935a",flexShrink:0 }}/>
                  <div style={{ flex:1,fontSize:13,fontWeight:500 }}>{h.label}</div>
                  <span style={{ fontSize:11,color:"var(--muted)",fontFamily:"var(--mono)" }}>{h.uptime}</span>
                  <span className="sa-badge" style={{ background:h.status==="operational"?"rgba(27,107,74,.09)":"rgba(184,147,90,.12)",color:h.status==="operational"?"#1b6b4a":"#8b6a3a",fontSize:9 }}>{h.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform settings */}
          <div className="sa-card">
            <div style={{ fontFamily:"var(--serif)",fontSize:17,marginBottom:16 }}>Platform Settings</div>
            <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
              {[
                { k:"supportEmail",       label:"Support Email",           type:"email" },
                { k:"platformDomain",     label:"Platform Domain",         type:"text"  },
                { k:"sessionTimeout",     label:"Session Timeout (min)",   type:"number" },
                { k:"maxUsersPerTenant",  label:"Max Users / Tenant",      type:"number" },
                { k:"dataRetentionDays",  label:"Data Retention (days)",   type:"number" },
              ].map(f=>(
                <div key={f.k} className="sa-field">
                  <label>{f.label}</label>
                  <input type={f.type} value={settings[f.k]} onChange={setSetting(f.k)}/>
                </div>
              ))}
              <div className="sa-field"><label>Log Level</label>
                <select value={settings.logLevel} onChange={setSetting("logLevel")}>
                  <option value="error">Error</option><option value="warn">Warn</option><option value="info">Info</option><option value="debug">Debug</option>
                </select>
              </div>
              <div className="sa-field"><label>Backup Frequency</label>
                <select value={settings.backupFrequency} onChange={setSetting("backupFrequency")}>
                  <option value="hourly">Hourly</option><option value="daily">Daily</option><option value="weekly">Weekly</option>
                </select>
              </div>
              <button className="btn" style={{ marginTop:4,background:"#03080f",color:"#f5f0e8",borderRadius:999,fontSize:13,alignSelf:"flex-start",padding:"9px 20px" }}>Save Settings</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Nav config ────────────────────────────────────────────────────────────────
const NAV = [
  { section:null },
  { id:"dashboard",     label:"Dashboard",         Icon:Ic.Dashboard    },
  { section:"Directory" },
  { id:"tenants",       label:"Tenants",           Icon:Ic.Tenants      },
  { id:"users",         label:"User Accounts",     Icon:Ic.Users        },
  { id:"roles",         label:"Roles & Permissions",Icon:Ic.Roles       },
  { section:"Finance" },
  { id:"billing",       label:"Billing & Revenue", Icon:Ic.Billing      },
  { section:"Platform" },
  { id:"audit",         label:"Audit Log",         Icon:Ic.Audit        },
  { id:"integrations",  label:"Integrations",      Icon:Ic.Integrations },
  { id:"config",        label:"System Config",     Icon:Ic.Config       },
];

// ── Root App ──────────────────────────────────────────────────────────────────
function SuperAdminApp() {
  const [user, setUser]               = useState(null);
  const [authed, setAuthed]           = useState(false);
  const [view, setView]               = useState("dashboard");
  const [tenants, setTenants]         = useState(INIT_TENANTS);
  const [users, setUsers]             = useState(INIT_USERS);
  const [audit]                       = useState(INIT_AUDIT);
  const [integrations, setIntegrations] = useState(INIT_INTEGRATIONS);
  const [flags, setFlags]             = useState(INIT_FLAGS);

  useEffect(()=>{
    const raw = sessionStorage.getItem("np_portal_auth");
    if (raw) {
      try {
        const u = JSON.parse(raw);
        if (u.type==="superadmin") { setUser(u); setAuthed(true); return; }
      } catch {}
    }
    setAuthed(false);
  }, []);

  const handleLogin = u => { setUser(u); setAuthed(true); };
  const logout = () => { sessionStorage.removeItem("np_portal_auth"); setUser(null); setAuthed(false); };

  if (!authed) return <LoginScreen onLogin={handleLogin}/>;

  const activeLabel = NAV.find(n=>n.id===view)?.label||"";
  const alertCount  = integrations.filter(i=>i.status==="error").length;

  let content;
  if (view==="dashboard")    content = <Dashboard   tenants={tenants} users={users} audit={audit}/>;
  else if (view==="tenants") content = <TenantsView tenants={tenants} setTenants={setTenants} users={users}/>;
  else if (view==="users")   content = <UsersView   users={users} setUsers={setUsers} tenants={tenants}/>;
  else if (view==="roles")   content = <RolesView/>;
  else if (view==="billing") content = <BillingView tenants={tenants}/>;
  else if (view==="audit")   content = <AuditView   audit={audit}/>;
  else if (view==="integrations") content = <IntegrationsView integrations={integrations} setIntegrations={setIntegrations}/>;
  else if (view==="config")  content = <SystemConfigView flags={flags} setFlags={setFlags}/>;

  return (
    <div className="sa-shell">
      <aside className="sa-sidebar">
        <div className="sa-logo">
          <div className="sa-logo-mark">N</div>
          <div>
            <div className="sa-logo-name">NexaPoint</div>
            <div className="sa-logo-label">Super Admin</div>
          </div>
        </div>

        <nav style={{ flex:1,padding:"8px 0" }}>
          {NAV.map((n,i)=>{
            if (n.section!==undefined&&!n.id) {
              return n.section
                ? <div key={i} className="sa-nav-section">{n.section}</div>
                : <div key={i} style={{ height:8 }}/>;
            }
            const hasAlert = n.id==="integrations" && alertCount>0;
            return (
              <button key={n.id} className={`sa-nav-item${view===n.id?" active":""}`} onClick={()=>setView(n.id)}>
                <n.Icon s={15}/>{n.label}
                {hasAlert && <span className="sa-nav-badge">{alertCount}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sa-user-block">
          <div className="sa-user-av">SA</div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:12,fontWeight:600,color:"#f5f0e8",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{user?.name}</div>
            <div style={{ fontSize:10,color:"rgba(255,255,255,.35)" }}>{user?.role}</div>
          </div>
          <button onClick={logout} title="Sign out" style={{ background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,.3)",padding:4,display:"flex",alignItems:"center" }}>
            <Ic.Logout s={14}/>
          </button>
        </div>
      </aside>

      <main className="sa-main">
        <div className="sa-topbar">
          <div style={{ display:"flex",alignItems:"center",gap:8,flex:1 }}>
            <Ic.Shield s={15}/>
            <span style={{ fontSize:13,color:"var(--muted)" }}>Super Admin</span>
            <span style={{ fontSize:13,color:"var(--muted)" }}>/</span>
            <span style={{ fontSize:13,fontWeight:600 }}>{activeLabel}</span>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            {alertCount>0 && (
              <button onClick={()=>setView("integrations")} style={{ display:"flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:7,background:"rgba(163,51,31,.1)",border:"1px solid rgba(163,51,31,.2)",color:"#a3331f",fontSize:12,fontWeight:600,cursor:"pointer" }}>
                <Ic.Alert s={13}/>{alertCount} integration error
              </button>
            )}
            <span style={{ fontSize:12,color:"var(--muted)" }}>{user?.email}</span>
            <button className="btn btn-ghost" style={{ fontSize:12,padding:"5px 12px",borderRadius:999,display:"flex",alignItems:"center",gap:6 }} onClick={logout}>
              <Ic.Logout s={12}/>Sign out
            </button>
          </div>
        </div>

        <div className="sa-content">
          {content}
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<SuperAdminApp/>);
