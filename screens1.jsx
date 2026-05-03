// Screen components for NexaPoint ERP prototype

// ---------- Icons ----------
const Icon = {
  Check: ({ s = 14 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>),
  Arrow: ({ s = 14 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>),
  Back: ({ s = 14 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>),
  Cart: ({ s = 14 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>),
  Lock: ({ s = 12 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>),
  Download: ({ s = 14 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>),
  Mail: ({ s = 14 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>),
  Print: ({ s = 14 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>),
  Sun: ({ s = 14 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>),
  Moon: ({ s = 14 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>),
};

// ---------- Top Nav ----------
const Nav = ({ step, cartCount, onGoHome, theme, onToggleTheme, onPortalLogin }) => {
  const crumbs = [
    { id: "bundles", label: "Bundles" },
    { id: "configure", label: "Configure" },
    { id: "cart", label: "Order" },
    { id: "checkout", label: "Checkout" },
    { id: "receipt", label: "Receipt" },
    { id: "tracker", label: "Track" },
  ];
  return (
    <div className="nav">
      <div className="nav-logo" onClick={onGoHome} style={{ cursor: "pointer" }}>
        <div className="nav-logo-mark"/>
        <span>NexaPoint</span>
      </div>
      <div className="nav-trail">
        {crumbs.map((c, i) => (
          <React.Fragment key={c.id}>
            <div className={"crumb" + (c.id === step ? " active" : "")}>{c.label}</div>
            {i < crumbs.length - 1 && <span style={{ opacity: .3 }}>·</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="nav-right">
        <span style={{ fontSize: 12 }}>support@nexapoint.io</span>
        <button
          onClick={onToggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--line-2)",
            background: "var(--surface)", display: "grid", placeItems: "center",
            cursor: "pointer", color: "var(--ink)", transition: "all .2s ease",
          }}
        >
          {theme === "dark" ? <Icon.Sun s={16}/> : <Icon.Moon s={16}/>}
        </button>
        <button
          onClick={onPortalLogin}
          className="btn btn-primary"
          style={{ fontSize: 12, padding: "8px 18px", borderRadius: 999, gap: 6 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          Staff Portal
        </button>
        <button className="nav-cart" title="Cart" style={{ cursor: "default" }}>
          <Icon.Cart/> {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
      </div>
    </div>
  );
};

// ---------- 1. Device Catalog ----------
const DeviceCatalog = ({ devices, onPick, currency, categoryFilter, setCategoryFilter }) => {
  const cats = [
    { id: "all", label: "All devices" },
    { id: "mac", label: "Mac" },
    { id: "iphone", label: "iPhone" },
    { id: "android", label: "Android" },
  ];
  const filtered = categoryFilter === "all" ? devices : devices.filter(d => d.category === categoryFilter);
  const [qtys, setQtys] = React.useState({});
  const getQty = (id) => qtys[id] || 1;
  const setQty = (id, val) => setQtys(q => ({ ...q, [id]: Math.max(1, Math.min(99, val)) }));

  return (
    <div className="page page-enter">
      <div className="hero">
        <div>
          <div className="eyebrow">Step 01 · Hardware</div>
          <h1 style={{ marginTop: 14 }}>Business software, <em>starts with the right hardware.</em></h1>
          <div className="hero-meta">
            <span><span className="dot"/> Zero-touch provisioning</span>
            <span><span className="dot"/> 36-month lease options</span>
            <span><span className="dot"/> Pre-loaded NexaPoint OS</span>
          </div>
        </div>
        <div>
          <p style={{ maxWidth: 360 }}>
            Select the device and quantity you'd like NexaPoint software deployed on. Every unit ships certified, pre-configured, and covered under our enterprise service agreement.
          </p>
        </div>
      </div>

      <div className="filter-bar">
        <span className="label">Category</span>
        {cats.map(c => (
          <button key={c.id} className={"chip" + (categoryFilter === c.id ? " active" : "")} onClick={() => setCategoryFilter(c.id)}>{c.label}</button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>{filtered.length} models available</span>
      </div>

      <div className="device-grid">
        {filtered.map(d => {
          const V = d.visual;
          const qty = getQty(d.id);
          return (
            <div key={d.id} className="device-card">
              {d.badge && <span className={"badge" + (d.badge === "New" ? " new" : "")}>{d.badge}</span>}
              <div className="device-visual" onClick={() => onPick(d, qty)} style={{ cursor: "pointer" }}><V/></div>
              <div onClick={() => onPick(d, qty)} style={{ cursor: "pointer" }}>
                <div className="device-name">{d.name}</div>
                <div className="device-subtitle">{d.subtitle}</div>
                <div className="device-specs">
                  {d.specs.map(s => <span key={s}>{s}</span>)}
                </div>
              </div>

              {/* Quantity stepper */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0 4px", borderTop: "1px dashed var(--line)" }}>
                <span style={{ fontSize: 12, color: "var(--muted)", flex: 1 }}>Qty</span>
                <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid var(--line-2)", borderRadius: 8, overflow: "hidden", background: "var(--surface-2)" }}>
                  <button
                    onClick={e => { e.stopPropagation(); setQty(d.id, qty - 1); }}
                    style={{ width: 32, height: 32, border: "none", background: "transparent", cursor: "pointer", color: "var(--ink)", fontSize: 16, display: "grid", placeItems: "center", transition: "background .15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-alt)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >−</button>
                  <input
                    type="number" min="1" max="99" value={qty}
                    onChange={e => setQty(d.id, parseInt(e.target.value) || 1)}
                    onClick={e => e.stopPropagation()}
                    style={{ width: 38, textAlign: "center", border: "none", borderLeft: "1px solid var(--line)", borderRight: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", fontSize: 13, fontWeight: 500, padding: "0 2px", height: 32, fontFamily: "var(--sans)", MozAppearance: "textfield" }}
                  />
                  <button
                    onClick={e => { e.stopPropagation(); setQty(d.id, qty + 1); }}
                    style={{ width: 32, height: 32, border: "none", background: "transparent", cursor: "pointer", color: "var(--ink)", fontSize: 16, display: "grid", placeItems: "center", transition: "background .15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-alt)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >+</button>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 15 }}>{fmtMoney(d.price * qty, currency)}</div>
                  {qty > 1 && <div style={{ fontSize: 11, color: "var(--muted)" }}>{fmtMoney(d.price, currency)} ea.</div>}
                </div>
              </div>

              <button className="btn btn-primary btn-block" style={{ marginTop: 4 }} onClick={() => onPick(d, qty)}>
                Select {qty > 1 ? `${qty} units` : "device"} <Icon.Arrow/>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- 2. Software Catalog ----------
const SoftwareCatalog = ({ device, deviceQty, software, selected, toggle, onBack, onNext, currency }) => {
  const qty = deviceQty || 1;
  const chosen = software.filter(s => selected.includes(s.id));
  const monthlyUSD = chosen.reduce((a, s) => a + s.monthly, 0);
  const V = device?.visual;
  return (
    <div className="page page-enter">
      <button className="btn btn-ghost" style={{ marginBottom: 20 }} onClick={onBack}><Icon.Back/> Back to hardware</button>
      <div className="soft-head">
        <div>
          <div className="eyebrow">Step 02 · Software catalog</div>
          <h1 style={{ marginTop: 12 }}>Choose what goes on your <em style={{ fontStyle: "italic", color: "var(--accent-2)" }}>{device?.name}</em></h1>
          <p style={{ marginTop: 14, maxWidth: 600 }}>
            Select any combination of NexaPoint modules. All modules share a single data model — add more any time without re-implementation.
          </p>
        </div>
        {V && <div style={{ width: 220, height: 140 }}><V/></div>}
      </div>

      <div className="split">
        <div className="soft-grid">
          {software.map(s => {
            const sel = selected.includes(s.id);
            return (
              <div key={s.id} className={"soft-card" + (sel ? " selected" : "")} onClick={() => toggle(s.id)}>
                <div className="soft-head-row">
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div className="soft-icon">{s.icon}</div>
                    <div>
                      <div className="soft-name">{s.name}</div>
                      <div className="soft-tag">{s.tag}</div>
                    </div>
                  </div>
                  <div className="soft-check">{sel && <Icon.Check s={12}/>}</div>
                </div>
                <div className="soft-desc">{s.desc}</div>
                <div className="soft-meta">
                  <div><span style={{ color: "var(--muted)" }}>{s.features.length} feature areas</span></div>
                  <div className="soft-price">{fmtMoney(s.monthly, currency)}<span style={{ color: "var(--muted)", fontSize: 12, fontFamily: "var(--sans)", fontWeight: 400 }}>/mo</span></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="side-card">
          <h3>Your selection</h3>
          <div className="sub">{device?.name}</div>
          {chosen.length === 0 ? (
            <div className="side-empty">No modules selected yet.<br/>Tap any card to add it.</div>
          ) : (
            <>
              <div className="side-line">
                <span className="k">Device × {qty} (one-time)</span>
                <span className="v">{fmtMoney(device.price * qty, currency)}</span>
              </div>
              {chosen.map(s => (
                <div key={s.id} className="side-line">
                  <span className="k">{s.name}</span>
                  <span className="v">{fmtMoney(s.monthly, currency)}/mo</span>
                </div>
              ))}
              <div className="side-total">
                <div>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)" }}>Monthly software</div>
                  <div className="v">{fmtMoney(monthlyUSD, currency)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)" }}>Device</div>
                  <div className="v">{fmtMoney(device.price, currency)}</div>
                </div>
              </div>
              <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 16 }} onClick={onNext} disabled={chosen.length === 0}>
                Generate proposal <Icon.Arrow/>
              </button>
              <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 10 }}>
                Proposal includes scope, timeline & costs
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- 3. Proposal ----------
const Proposal = ({ device, deviceQty, software, selected, onBack, onAccept, currency, proposalRef }) => {
  const qty = deviceQty || 1;
  const chosen = software.filter(s => selected.includes(s.id));
  const monthlyUSD = chosen.reduce((a, s) => a + s.monthly, 0);
  const implFeeUSD = 1500 + chosen.length * 600;
  const annualUSD = monthlyUSD * 12;
  const totalYear1 = device.price * qty + implFeeUSD + annualUSD;
  const today = new Date();
  const validTil = new Date(today); validTil.setDate(validTil.getDate() + 30);

  return (
    <div className="page page-enter">
      <button className="btn btn-ghost" style={{ marginBottom: 20 }} onClick={onBack}><Icon.Back/> Back to catalog</button>
      <div className="proposal">
        <div className="proposal-head">
          <div>
            <div className="ref" style={{ marginBottom: 8 }}>Proposal · {proposalRef}</div>
            <h1>Commercial <em style={{ fontStyle: "italic", color: "var(--accent-2)" }}>Proposal</em></h1>
            <p style={{ marginTop: 8, fontSize: 13 }}>Prepared by NexaPoint ERP Ltd. · Valid until {validTil.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="nav-logo-mark" style={{ marginLeft: "auto", width: 40, height: 40 }}/>
            <div style={{ fontFamily: "var(--serif)", fontSize: 18, marginTop: 10 }}>NexaPoint</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>ERP Ltd.</div>
          </div>
        </div>

        <div className="proposal-meta">
          <div><div className="m-label">Deployment target</div><div className="m-val">{device.name}</div></div>
          <div><div className="m-label">Modules</div><div className="m-val">{chosen.length} selected</div></div>
          <div><div className="m-label">Go-live</div><div className="m-val">6–10 weeks</div></div>
          <div><div className="m-label">Issued</div><div className="m-val">{today.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</div></div>
        </div>

        <div className="proposal-section">
          <h2><span className="num">01</span> Executive summary</h2>
          <p style={{ fontSize: 14, maxWidth: 720 }}>
            This proposal outlines the scope, deliverables and commercial terms for deploying {chosen.length} NexaPoint modules
            onto your {device.name}. The engagement includes provisioning, implementation, data migration, user training, and 12 months of enterprise support.
            All modules operate on a single governed data model, enabling unified reporting from day one.
          </p>
        </div>

        <div className="proposal-section">
          <h2><span className="num">02</span> Scope of software</h2>
          {chosen.map(s => (
            <div key={s.id} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div className="soft-icon" style={{ width: 32, height: 32, borderRadius: 6, fontSize: 11 }}>{s.icon}</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 17 }}>{s.name}</div>
                <span style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginLeft: "auto" }}>{s.tag}</span>
              </div>
              <div className="feat-list">
                {s.features.map(([t, d]) => (
                  <div key={t} className="feat"><div className="feat-dot"/><div><strong>{t}</strong><span>{d}</span></div></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="proposal-section">
          <h2><span className="num">03</span> Implementation timeline</h2>
          <div className="timeline">
            <div className="tl-step"><div className="tl-week">W 1–2</div><div className="tl-title">Discovery</div><div className="tl-desc">Process mapping, data audit, user interviews</div></div>
            <div className="tl-step"><div className="tl-week">W 3–5</div><div className="tl-title">Configure</div><div className="tl-desc">Modules tailored to workflows, integrations scoped</div></div>
            <div className="tl-step"><div className="tl-week">W 6–8</div><div className="tl-title">Migrate & train</div><div className="tl-desc">Historical data, role-based training, UAT</div></div>
            <div className="tl-step"><div className="tl-week">W 9–10</div><div className="tl-title">Go-live</div><div className="tl-desc">Cutover, hypercare, post-launch review</div></div>
          </div>
        </div>

        <div className="proposal-section">
          <h2><span className="num">04</span> Commercial terms</h2>
          <table className="cost-table">
            <thead><tr><th>Item</th><th className="num">Unit</th><th className="num">Qty</th><th className="num">Amount</th></tr></thead>
            <tbody>
              <tr>
                <td><strong style={{ fontFamily: "var(--serif)" }}>{device.name}</strong><br/><span style={{ fontSize: 12, color: "var(--muted)" }}>Hardware · {device.specs.join(", ")}</span></td>
                <td className="num">{fmtMoney(device.price, currency)}</td>
                <td className="num">{qty}</td>
                <td className="num">{fmtMoney(device.price * qty, currency)}</td>
              </tr>
              {chosen.map(s => (
                <tr key={s.id}>
                  <td><strong style={{ fontFamily: "var(--serif)" }}>{s.name}</strong><br/><span style={{ fontSize: 12, color: "var(--muted)" }}>{s.tag} · 12-month subscription</span></td>
                  <td className="num">{fmtMoney(s.monthly, currency)}/mo</td>
                  <td className="num">12</td>
                  <td className="num">{fmtMoney(s.monthly * 12, currency)}</td>
                </tr>
              ))}
              <tr>
                <td><strong style={{ fontFamily: "var(--serif)" }}>Implementation & Onboarding</strong><br/><span style={{ fontSize: 12, color: "var(--muted)" }}>Base {fmtMoney(1500, currency)} + {fmtMoney(600, currency)} per module</span></td>
                <td className="num">—</td>
                <td className="num">1</td>
                <td className="num">{fmtMoney(implFeeUSD, currency)}</td>
              </tr>
              <tr className="row-total">
                <td colSpan="3">Year 1 total (ex. tax)</td>
                <td className="num">{fmtMoney(totalYear1, currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="proposal-foot">
          <div>
            <div className="sig">For NexaPoint · <span className="line"/> <em style={{ fontFamily: "var(--serif)" }}>A. Khan, Director</em></div>
            <div className="sig" style={{ marginTop: 8 }}>For Client  · <span className="line"/> <em style={{ color: "var(--muted)" }}>(to be signed)</em></div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost btn-lg" onClick={() => window.print()}><Icon.Download/> Download PDF</button>
            <button className="btn btn-primary btn-lg" onClick={onAccept}>Accept proposal <Icon.Arrow/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Login Modal ----------
const LoginModal = ({ onClose, onLogin }) => {
  const [email, setEmail] = React.useState("admin@nexapoint.io");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handle = () => {
    if (email.trim() === "superadmin@nexapoint.io" && password === "super123") {
      setLoading(true);
      setTimeout(() => onLogin(email, "superadmin"), 800);
    } else if (email.trim() === "credit@nexapoint.io" && password === "credit123") {
      setLoading(true);
      setTimeout(() => onLogin(email, "credit"), 800);
    } else if (email.trim() === "admin@nexapoint.io" && password === "admin123") {
      setLoading(true);
      setTimeout(() => onLogin(email, "portal"), 800);
    } else if (email.trim() === "engineer@nexapoint.io" && password === "eng123") {
      setLoading(true);
      setTimeout(() => onLogin(email, "engineer"), 800);
    } else {
      setError("Invalid credentials — use a demo account shown below.");
    }
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, background: "rgba(11,30,58,.65)", zIndex: 1000,
        display: "grid", placeItems: "center", backdropFilter: "blur(5px)",
      }}
    >
      <div style={{
        background: "var(--surface)", border: "1px solid var(--line-2)",
        borderRadius: "var(--radius-lg)", padding: "40px 40px 32px", width: "min(420px,92vw)",
        boxShadow: "var(--shadow-lg)", animation: "fadeUp .3s cubic-bezier(.2,.8,.2,1)",
        position: "relative",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16, width: 30, height: 30, borderRadius: "50%",
          border: "1px solid var(--line-2)", background: "var(--surface)", cursor: "pointer",
          display: "grid", placeItems: "center", color: "var(--muted)", fontSize: 16, lineHeight: 1,
        }}>×</button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div className="nav-logo-mark" style={{ width: 32, height: 32 }}/>
          <div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 17, lineHeight: 1.1 }}>NexaPoint</div>
            <div style={{ fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--accent-2)", fontWeight: 600 }}>Internal Portal</div>
          </div>
        </div>

        <h2 style={{ fontFamily: "var(--serif)", fontSize: 26, marginBottom: 6 }}>Staff Login</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24, lineHeight: 1.5 }}>
          Sign in to access your NexaPoint internal portal — Operations or Engineering.
        </p>

        <div className="field" style={{ marginBottom: 14 }}>
          <label>Email address</label>
          <input
            type="email" value={email} autoFocus
            onChange={e => { setEmail(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handle()}
          />
        </div>
        <div className="field" style={{ marginBottom: 20 }}>
          <label>Password</label>
          <input
            type="password" value={password} placeholder="••••••••"
            onChange={e => { setPassword(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handle()}
          />
        </div>

        {error && (
          <div style={{
            fontSize: 12, color: "var(--danger)", marginBottom: 14, padding: "10px 12px",
            background: "color-mix(in srgb, var(--danger) 8%, var(--surface))",
            borderRadius: "var(--radius-sm)", border: "1px solid color-mix(in srgb, var(--danger) 25%, var(--line))",
          }}>{error}</div>
        )}

        <button className="btn btn-primary btn-block btn-lg" onClick={handle} disabled={loading} style={{ marginBottom: 16 }}>
          {loading ? "Signing in…" : "Sign in to Portal"}
        </button>

        <div style={{
          padding: "12px 14px", background: "var(--bg-alt)", borderRadius: "var(--radius-sm)",
          fontSize: 12, color: "var(--muted)", display: "flex", flexDirection: "column", gap: 7,
        }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ flexShrink: 0, fontSize: 14 }}>&#9679;</span>
            <span><strong style={{ color: "var(--ink)" }}>Super Admin:</strong> superadmin@nexapoint.io · super123</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ flexShrink: 0, fontSize: 14 }}>&#9679;</span>
            <span><strong style={{ color: "var(--ink)" }}>Credit Manager:</strong> credit@nexapoint.io · credit123</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ flexShrink: 0, fontSize: 14 }}>&#9679;</span>
            <span><strong style={{ color: "var(--ink)" }}>Operations:</strong> admin@nexapoint.io · admin123</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ flexShrink: 0, fontSize: 14 }}>&#9679;</span>
            <span><strong style={{ color: "var(--ink)" }}>Engineering:</strong> engineer@nexapoint.io · eng123</span>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Icon, Nav, DeviceCatalog, SoftwareCatalog, Proposal, LoginModal });
