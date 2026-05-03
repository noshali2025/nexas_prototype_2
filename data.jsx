// Data, device illustrations, and software definitions for NexaPoint ERP

// --- Device SVGs (stylized, Apple-store-like) ---
const MacBookSVG = () => (
  <svg className="dev-svg" viewBox="0 0 280 180" fill="none">
    <defs>
      <linearGradient id="mbScreen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1a2a4a"/><stop offset="1" stopColor="#0b1c3a"/>
      </linearGradient>
      <linearGradient id="mbBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e9e8e3"/><stop offset="1" stopColor="#c9c6bc"/>
      </linearGradient>
    </defs>
    <rect x="40" y="30" width="200" height="120" rx="6" fill="url(#mbBody)" stroke="#b5b1a4"/>
    <rect x="48" y="38" width="184" height="104" rx="3" fill="url(#mbScreen)"/>
    <circle cx="140" cy="42" r="1.2" fill="#2a3d5f"/>
    <rect x="60" y="50" width="50" height="3" rx="1.5" fill="#b8935a" opacity=".7"/>
    <rect x="60" y="58" width="140" height="2" rx="1" fill="#4a5d80" opacity=".5"/>
    <rect x="60" y="64" width="110" height="2" rx="1" fill="#4a5d80" opacity=".35"/>
    <rect x="60" y="78" width="70" height="50" rx="2" fill="#16478f" opacity=".6"/>
    <rect x="138" y="78" width="62" height="24" rx="2" fill="#4a5d80" opacity=".25"/>
    <rect x="138" y="106" width="62" height="22" rx="2" fill="#4a5d80" opacity=".25"/>
    <rect x="30" y="150" width="220" height="5" rx="2" fill="url(#mbBody)" stroke="#b5b1a4"/>
    <rect x="120" y="150" width="40" height="3" rx="1" fill="#a8a599"/>
  </svg>
);

const IMacSVG = () => (
  <svg className="dev-svg" viewBox="0 0 280 180" fill="none">
    <defs>
      <linearGradient id="imScreen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1a2a4a"/><stop offset="1" stopColor="#0b1c3a"/>
      </linearGradient>
    </defs>
    <rect x="30" y="20" width="220" height="120" rx="8" fill="#eceae4" stroke="#b5b1a4"/>
    <rect x="38" y="28" width="204" height="104" rx="3" fill="url(#imScreen)"/>
    <circle cx="140" cy="32" r="1.2" fill="#2a3d5f"/>
    <rect x="50" y="44" width="60" height="4" rx="2" fill="#b8935a" opacity=".7"/>
    <rect x="50" y="54" width="140" height="3" rx="1.5" fill="#fff" opacity=".3"/>
    <rect x="50" y="62" width="100" height="3" rx="1.5" fill="#fff" opacity=".2"/>
    <rect x="50" y="78" width="90" height="48" rx="3" fill="#16478f" opacity=".6"/>
    <rect x="148" y="78" width="86" height="22" rx="2" fill="#fff" opacity=".15"/>
    <rect x="148" y="104" width="86" height="22" rx="2" fill="#fff" opacity=".15"/>
    <path d="M130 140 L130 155 L110 165 L170 165 L150 155 L150 140 Z" fill="#d4d1c5" stroke="#b5b1a4"/>
    <ellipse cx="140" cy="168" rx="38" ry="3" fill="#c9c6bc"/>
  </svg>
);

const IPhoneSVG = ({ color = "#1a2a4a" }) => (
  <svg className="dev-svg" viewBox="0 0 280 180" fill="none">
    <defs>
      <linearGradient id="ipPhone" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={color}/><stop offset="1" stopColor="#000"/>
      </linearGradient>
    </defs>
    <rect x="112" y="14" width="56" height="152" rx="11" fill="url(#ipPhone)" stroke="#2a3d5f"/>
    <rect x="115" y="17" width="50" height="146" rx="9" fill="#0a1628"/>
    <rect x="133" y="21" width="14" height="4" rx="2" fill="#000"/>
    <rect x="119" y="30" width="42" height="50" rx="3" fill="#16478f" opacity=".5"/>
    <rect x="122" y="36" width="14" height="2" rx="1" fill="#b8935a"/>
    <rect x="122" y="42" width="30" height="1.5" rx="1" fill="#fff" opacity=".4"/>
    <rect x="122" y="47" width="24" height="1.5" rx="1" fill="#fff" opacity=".3"/>
    <g>
      <rect x="119" y="86" width="19" height="19" rx="4" fill="#fff" opacity=".85"/>
      <rect x="142" y="86" width="19" height="19" rx="4" fill="#b8935a" opacity=".9"/>
      <rect x="119" y="109" width="19" height="19" rx="4" fill="#fff" opacity=".6"/>
      <rect x="142" y="109" width="19" height="19" rx="4" fill="#fff" opacity=".7"/>
      <rect x="119" y="132" width="19" height="19" rx="4" fill="#16478f" opacity=".8"/>
      <rect x="142" y="132" width="19" height="19" rx="4" fill="#fff" opacity=".5"/>
    </g>
  </svg>
);

const AndroidSVG = ({ color = "#0b1e3a" }) => (
  <svg className="dev-svg" viewBox="0 0 280 180" fill="none">
    <rect x="112" y="14" width="56" height="152" rx="8" fill={color} stroke="#2a3d5f"/>
    <rect x="115" y="17" width="50" height="146" rx="6" fill="#0a1628"/>
    <circle cx="140" cy="23" r="1.6" fill="#000"/>
    <rect x="119" y="32" width="42" height="14" rx="2" fill="#16478f" opacity=".35"/>
    <rect x="122" y="36" width="18" height="2" rx="1" fill="#fff" opacity=".7"/>
    <rect x="122" y="40" width="24" height="1.5" rx="1" fill="#fff" opacity=".4"/>
    <rect x="119" y="50" width="42" height="38" rx="3" fill="#b8935a" opacity=".8"/>
    <rect x="122" y="56" width="16" height="2" rx="1" fill="#fff"/>
    <rect x="122" y="62" width="30" height="1.5" rx="1" fill="#fff" opacity=".6"/>
    <g>
      <rect x="119" y="94" width="19" height="19" rx="3" fill="#16478f" opacity=".7"/>
      <rect x="142" y="94" width="19" height="19" rx="3" fill="#fff" opacity=".8"/>
      <rect x="119" y="117" width="19" height="19" rx="3" fill="#fff" opacity=".6"/>
      <rect x="142" y="117" width="19" height="19" rx="3" fill="#b8935a" opacity=".6"/>
      <rect x="119" y="140" width="42" height="14" rx="3" fill="#fff" opacity=".2"/>
    </g>
  </svg>
);

// --- Devices ---
const DEVICES = [
  { id: "mbp16", category: "mac", name: "MacBook Pro 16″", subtitle: "M4 Max · workstation-class", specs: ["M4 Max", "64GB", "2TB SSD"], price: 3499, badge: "New", visual: MacBookSVG },
  { id: "mbp14", category: "mac", name: "MacBook Pro 14″", subtitle: "M4 Pro · pro performance", specs: ["M4 Pro", "24GB", "1TB SSD"], price: 1999, visual: MacBookSVG },
  { id: "mba15", category: "mac", name: "MacBook Air 15″", subtitle: "M4 · thin & light", specs: ["M4", "16GB", "512GB SSD"], price: 1299, visual: MacBookSVG },
  { id: "imac", category: "mac", name: "iMac 24″", subtitle: "M4 · all-in-one desktop", specs: ["M4", "16GB", "512GB SSD"], price: 1599, visual: IMacSVG },
  { id: "iphone16pro", category: "iphone", name: "iPhone 16 Pro", subtitle: "6.3″ Super Retina XDR", specs: ["A18 Pro", "256GB", "Titanium"], price: 1099, badge: "New", visual: () => <IPhoneSVG color="#2a3d5f"/> },
  { id: "iphone16", category: "iphone", name: "iPhone 16", subtitle: "6.1″ Super Retina", specs: ["A18", "128GB", "Ultramarine"], price: 799, visual: () => <IPhoneSVG color="#16478f"/> },
  { id: "iphone15", category: "iphone", name: "iPhone 15", subtitle: "6.1″ Super Retina", specs: ["A16", "128GB", "Black"], price: 699, visual: () => <IPhoneSVG color="#1a1a1a"/> },
  { id: "pixel9", category: "android", name: "Pixel 9 Pro", subtitle: "6.3″ Super Actua", specs: ["Tensor G4", "256GB", "Obsidian"], price: 999, visual: () => <AndroidSVG color="#0b1e3a"/> },
  { id: "galaxys24", category: "android", name: "Galaxy S24 Ultra", subtitle: "6.8″ Dynamic AMOLED", specs: ["Snapdragon 8", "512GB", "Titanium"], price: 1299, badge: "Pro", visual: () => <AndroidSVG color="#3a2a4a"/> },
];

// --- Software catalog ---
const SOFTWARE = [
  {
    id: "erp", name: "NexaPoint ERP Suite", tag: "Flagship",
    icon: "ER", monthly: 249,
    desc: "Full enterprise resource planning — finance, procurement, supply chain, and manufacturing in one unified core.",
    features: [
      ["Financial Core", "GL, AP/AR, multi-entity consolidation, tax engine"],
      ["Procurement & SCM", "RFQ, vendor scoring, 3-way match, shipping"],
      ["Manufacturing", "BOM, MRP, shop-floor, quality control"],
      ["Assets & Projects", "Fixed assets, project costing, WIP reporting"],
      ["Compliance Suite", "IFRS, GAAP, SOX audit trails, e-invoicing"],
      ["AI Forecasting", "Demand planning, cash-flow projections, anomaly detection"],
    ],
  },
  {
    id: "bms", name: "Business Management System", tag: "Operations",
    icon: "BM", monthly: 149,
    desc: "Process orchestration, KPIs, approvals and document workflows for every department.",
    features: [
      ["Workflow Designer", "Drag-and-drop BPMN with SLA tracking"],
      ["Approvals Engine", "Hierarchical, role-based, mobile-first approvals"],
      ["Document Vault", "Versioning, e-sign, secure sharing"],
      ["KPI Dashboards", "Real-time executive scorecards"],
    ],
  },
  {
    id: "crm", name: "Customer Relationship Manager", tag: "Revenue",
    icon: "CR", monthly: 129,
    desc: "Pipeline, contacts, quoting and post-sale success — tightly integrated with billing.",
    features: [
      ["Pipeline & Deals", "Kanban, forecasting, weighted probability"],
      ["Quote-to-Cash", "Proposals sync directly to ERP invoicing"],
      ["Customer 360", "Unified contact, ticket, invoice & usage view"],
      ["Territory Mgmt", "Quota, commission, compensation plans"],
    ],
  },
  {
    id: "inv", name: "Inventory & Warehouse", tag: "Supply",
    icon: "IW", monthly: 119,
    desc: "Multi-warehouse stock, barcode/RFID, transfers, cycle counts and landed costs.",
    features: [
      ["Real-time Stock", "Bins, lots, serials across unlimited warehouses"],
      ["Barcode & RFID", "Native scanner apps for iOS and Android"],
      ["Transfers & Picks", "Wave picking, put-away strategies"],
      ["Cycle Counts", "ABC analysis, reconciliation workflows"],
    ],
  },
  {
    id: "fin", name: "Accounting & Finance", tag: "Ledger",
    icon: "AF", monthly: 99,
    desc: "Standalone double-entry accounting with banking, tax and reporting built in.",
    features: [
      ["Ledger & Journals", "Double-entry, multi-currency, fiscal calendars"],
      ["Bank Reconciliation", "Direct feeds, smart matching rules"],
      ["Tax Engine", "VAT, GST, sales tax, withholding, filings"],
      ["Financial Reports", "P&L, balance sheet, cash flow, custom"],
    ],
  },
  {
    id: "hr", name: "HR & Payroll", tag: "People",
    icon: "HR", monthly: 89,
    desc: "Employee lifecycle, time-off, payroll runs and compliance across regions.",
    features: [
      ["Employee Records", "Org chart, contracts, documents, e-sign"],
      ["Attendance & Leave", "Timesheets, shift patterns, leave accrual"],
      ["Payroll Engine", "Multi-country payroll, tax tables, payslips"],
      ["Performance", "OKRs, 1:1s, 360° reviews, learning paths"],
    ],
  },
  {
    id: "pos", name: "POS / Retail", tag: "Frontline",
    icon: "PS", monthly: 79,
    desc: "Point-of-sale across stores, offline-resilient, synced live to your ERP stock.",
    features: [
      ["Terminal Apps", "iPad, Android tablet, dedicated POS hardware"],
      ["Offline Mode", "Transactions queue and sync on reconnect"],
      ["Loyalty & Promos", "Cards, coupons, tiered pricing"],
      ["End-of-Day", "Z-reports, cash drops, shift reconciliation"],
    ],
  },
  {
    id: "bi", name: "Analytics & BI", tag: "Insight",
    icon: "BI", monthly: 139,
    desc: "Warehouse, semantic layer and dashboards — every module feeds it automatically.",
    features: [
      ["Data Warehouse", "Managed warehouse, incremental ETL"],
      ["Semantic Layer", "Governed metrics, row-level security"],
      ["Dashboards", "Drag-and-drop, scheduled delivery, embeds"],
      ["AI Insights", "Natural-language queries, anomaly alerts"],
    ],
  },
];

// Currency config
const CURRENCIES = {
  USD: { symbol: "$", rate: 1, code: "USD" },
  EUR: { symbol: "€", rate: 0.92, code: "EUR" },
  PKR: { symbol: "₨", rate: 278, code: "PKR" },
  GBP: { symbol: "£", rate: 0.79, code: "GBP" },
};

const fmtMoney = (usd, curCode = "USD") => {
  const c = CURRENCIES[curCode];
  const v = usd * c.rate;
  const formatted = v >= 1000
    ? v.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return `${c.symbol}${formatted}`;
};

Object.assign(window, { DEVICES, SOFTWARE, CURRENCIES, fmtMoney, MacBookSVG, IMacSVG, IPhoneSVG, AndroidSVG });
