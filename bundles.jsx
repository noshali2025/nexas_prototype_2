// SIM plans + bundle configurator data
const SIMS = [
  {
    id: "biz-voice-unlimited", name: "Business Voice + Data Unlimited",
    tag: "Most popular", monthly: 35,
    desc: "Unlimited UK minutes, texts and 5G data. EU roaming included, 100GB cap outside EU.",
    features: ["Unlimited UK calls & texts", "Unlimited 5G data", "EU roaming included", "Tethering & hotspot", "Business-grade SLA"],
  },
  {
    id: "biz-voice-25", name: "Business Voice + 25GB",
    tag: "Value", monthly: 22,
    desc: "Unlimited UK minutes with a generous 25GB 5G allowance for everyday business use.",
    features: ["Unlimited UK calls & texts", "25GB 5G data", "EU roaming 10GB", "Visual voicemail"],
  },
  {
    id: "biz-voice-lite", name: "Business Voice Lite",
    tag: "Entry", monthly: 14,
    desc: "Essential business connectivity for lower-usage roles and field staff.",
    features: ["2000 minutes", "Unlimited texts", "8GB 5G data", "UK-only"],
  },
];

// Pre-built bundles combining device + SIM + software
const BUNDLES = [
  {
    id: "field-sales",
    name: "Field Sales Kit",
    tagline: "Phone · SIM · CRM — everything a field rep needs on day one.",
    deviceIds: ["iphone16"], simId: "biz-voice-unlimited", softwareIds: ["crm"],
    accent: "#16478f",
  },
  {
    id: "finance-desk",
    name: "Finance Desk",
    tagline: "MacBook Pro loaded with ERP + Accounting for your back-office team.",
    deviceIds: ["mbp14"], simId: null, softwareIds: ["erp", "fin"],
    accent: "#8b6a3a",
  },
  {
    id: "retail-counter",
    name: "Retail Counter",
    tagline: "iMac + POS + Inventory — a complete store-in-a-box.",
    deviceIds: ["imac"], simId: null, softwareIds: ["pos", "inv"],
    accent: "#1b6b4a",
  },
  {
    id: "mobile-exec",
    name: "Mobile Executive",
    tagline: "Flagship phone on unlimited data with BMS + BI on the go.",
    deviceIds: ["iphone16pro"], simId: "biz-voice-unlimited", softwareIds: ["bms", "bi"],
    accent: "#2a3d5f",
  },
  {
    id: "workforce-android",
    name: "Workforce Android",
    tagline: "Pixel 9 Pro + Voice Unlimited + HR for distributed teams.",
    deviceIds: ["pixel9"], simId: "biz-voice-25", softwareIds: ["hr"],
    accent: "#5b3a8b",
  },
  {
    id: "custom", name: "Build your own",
    tagline: "Start from scratch — pick any device, SIM plan, and software combination.",
    deviceIds: [], simId: null, softwareIds: [], accent: "#0b1e3a", custom: true,
  },
];

Object.assign(window, { SIMS, BUNDLES });
