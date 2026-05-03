// Manual builder — Devices → SIMs → Software, then add to cart

const ManualBuilder = ({ onBack, onAddToCart, currency }) => {
  const [stage, setStage] = React.useState(1);
  const [deviceLines, setDeviceLines] = React.useState([]); // [{deviceId, qty}]
  const [simLines, setSimLines] = React.useState([]);       // [{simId, qty}]
  const [softwareIds, setSoftwareIds] = React.useState([]);

  const addDevice = (id) => setDeviceLines(ls => {
    const e = ls.find(l => l.deviceId === id);
    return e ? ls.map(l => l.deviceId === id ? { ...l, qty: l.qty + 1 } : l) : [...ls, { deviceId: id, qty: 1 }];
  });
  const setDeviceQty = (id, q) => setDeviceLines(ls =>
    ls.map(l => l.deviceId === id ? { ...l, qty: Math.max(0, q) } : l).filter(l => l.qty > 0)
  );
  const addSim = (id) => setSimLines(ls => {
    const e = ls.find(l => l.simId === id);
    return e ? ls.map(l => l.simId === id ? { ...l, qty: l.qty + 1 } : l) : [...ls, { simId: id, qty: 1 }];
  });
  const setSimQty = (id, q) => setSimLines(ls =>
    ls.map(l => l.simId === id ? { ...l, qty: Math.max(0, q) } : l).filter(l => l.qty > 0)
  );
  const toggleSoftware = (id) => setSoftwareIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);

  const totalDevices = deviceLines.reduce((a, l) => a + l.qty, 0);
  const totalSims = simLines.reduce((a, l) => a + l.qty, 0);
  const oneTime = deviceLines.reduce((a, l) => {
    const d = DEVICES.find(x => x.id === l.deviceId); return a + (d ? d.price * l.qty : 0);
  }, 0);
  const monthlyTotal = simLines.reduce((a, l) => {
    const s = SIMS.find(x => x.id === l.simId); return a + (s ? s.monthly * l.qty : 0);
  }, 0) + softwareIds.reduce((a, id) => {
    const s = SOFTWARE.find(x => x.id === id); return a + (s ? s.monthly : 0);
  }, 0);

  const stages = [
    { id: 1, label: "Devices", icon: "📱", count: totalDevices },
    { id: 2, label: "SIM plans", icon: "📶", count: totalSims },
    { id: 3, label: "Software", icon: "◆", count: softwareIds.length },
  ];

  const canProceed = stage === 1 ? totalDevices > 0 : stage === 2 ? true : true; // SIM optional, software optional
  const canAddToCart = totalDevices > 0;

  const addToCart = () => {
    const item = {
      id: "manual-" + Date.now(),
      bundleName: "Custom build",
      bundleId: "custom",
      accent: "#b8935a",
      isCustom: true,
      devices: [...deviceLines],
      simLines: [...simLines],
      softwareIds: [...softwareIds],
    };
    onAddToCart(item);
  };

  return (
    <div className="page page-enter">
      <button className="btn btn-ghost" style={{ marginBottom: 20 }} onClick={() => stage > 1 ? setStage(stage - 1) : onBack()}>
        <Icon.Back/> {stage > 1 ? "Previous step" : "Back to bundles"}
      </button>

      <div className="hero" style={{ paddingBottom: 24 }}>
        <div>
          <div className="eyebrow">Manual build · Step {stage} of 3</div>
          <h1 style={{ marginTop: 12 }}>
            {stage === 1 && <>Pick your <em>devices.</em></>}
            {stage === 2 && <>Add your <em>SIM plans.</em></>}
            {stage === 3 && <>Choose your <em>software.</em></>}
          </h1>
        </div>
        <div>
          <p style={{ maxWidth: 360 }}>
            {stage === 1 && "Mix any combination of Mac, iPhone, or Android. Set quantity per model."}
            {stage === 2 && "Optional. Attach SIM plans for any phones — quantities can differ from device counts."}
            {stage === 3 && "Pick the modules to install. You can add or remove later from the cart."}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, padding: 8, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14 }}>
        {stages.map((s, i) => (
          <button
            key={s.id} type="button"
            onClick={() => { if (s.id <= stage || (s.id === 2 && totalDevices > 0) || (s.id === 3 && totalDevices > 0)) setStage(s.id); }}
            style={{
              flex: 1, padding: "14px 16px", borderRadius: 10, cursor: "pointer", textAlign: "left",
              border: "1px solid " + (stage === s.id ? "var(--brand)" : "transparent"),
              background: stage === s.id ? "color-mix(in srgb, var(--brand) 8%, var(--surface))" : "transparent",
              color: "var(--ink)", display: "flex", alignItems: "center", gap: 14,
            }}
          >
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: stage === s.id ? "var(--brand)" : "var(--bg-alt)", color: stage === s.id ? "var(--bg)" : "var(--muted)", display: "grid", placeItems: "center", fontFamily: "var(--serif)", fontSize: 14 }}>
              {s.id < stage ? <Icon.Check s={14}/> : s.id}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: 15 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                {s.count > 0 ? `${s.count} selected` : (s.id === 1 ? "Required" : "Optional")}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28, alignItems: "start" }}>
        {/* Main content */}
        <div>
          {stage === 1 && <ManualDevices deviceLines={deviceLines} addDevice={addDevice} setDeviceQty={setDeviceQty} currency={currency}/>}
          {stage === 2 && <ManualSims simLines={simLines} addSim={addSim} setSimQty={setSimQty} currency={currency} totalDevices={totalDevices}/>}
          {stage === 3 && <ManualSoftware softwareIds={softwareIds} toggleSoftware={toggleSoftware} currency={currency}/>}
        </div>

        {/* Sticky summary */}
        <ManualSummary
          deviceLines={deviceLines} simLines={simLines} softwareIds={softwareIds}
          oneTime={oneTime} monthlyTotal={monthlyTotal} currency={currency}
          onRemoveDevice={(id) => setDeviceQty(id, 0)}
          onRemoveSim={(id) => setSimQty(id, 0)}
          onRemoveSoftware={(id) => toggleSoftware(id)}
        />
      </div>

      {/* Footer actions */}
      <div className="action-row" style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--line)", display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          {!canAddToCart && <div style={{ fontSize: 12, color: "var(--muted)" }}>Add at least one device to continue.</div>}
          {canAddToCart && stage < 3 && <div style={{ fontSize: 12, color: "var(--muted)" }}>You can add this build to your order at any step.</div>}
        </div>
        {stage > 1 && (
          <button className="btn btn-ghost btn-lg" onClick={() => setStage(stage - 1)}><Icon.Back/> Previous</button>
        )}
        {stage < 3 && (
          <button className="btn btn-primary btn-lg" onClick={() => canProceed && setStage(stage + 1)} disabled={!canProceed} style={{ opacity: canProceed ? 1 : .5 }}>
            Next: {stage === 1 ? "SIMs" : "Software"} <Icon.Arrow/>
          </button>
        )}
        {stage === 3 && (
          <button className="btn btn-primary btn-lg" onClick={addToCart} disabled={!canAddToCart} style={{ opacity: canAddToCart ? 1 : .5 }}>
            Add to order <Icon.Arrow/>
          </button>
        )}
      </div>
    </div>
  );
};

// ---------- Devices step ----------
const ManualDevices = ({ deviceLines, addDevice, setDeviceQty, currency }) => {
  const [cat, setCat] = React.useState("all");
  const cats = [
    { id: "all", label: "All devices" },
    { id: "mac", label: "Mac" },
    { id: "iphone", label: "iPhone" },
    { id: "android", label: "Android" },
  ];
  const filtered = cat === "all" ? DEVICES : DEVICES.filter(d => d.category === cat);
  return (
    <div>
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <span className="label">Category</span>
        {cats.map(c => (
          <button key={c.id} className={"chip" + (cat === c.id ? " active" : "")} onClick={() => setCat(c.id)}>{c.label}</button>
        ))}
      </div>
      <div className="device-grid">
        {filtered.map(d => {
          const V = d.visual;
          const line = deviceLines.find(l => l.deviceId === d.id);
          const qty = line ? line.qty : 0;
          return (
            <div key={d.id} className="device-card" style={{ borderColor: qty > 0 ? "var(--brand)" : undefined, boxShadow: qty > 0 ? "0 0 0 1px var(--brand) inset" : undefined }}>
              {d.badge && <span className={"badge" + (d.badge === "New" ? " new" : "")}>{d.badge}</span>}
              <div className="device-visual"><V/></div>
              <div>
                <div className="device-name">{d.name}</div>
                <div className="device-subtitle">{d.subtitle}</div>
                <div className="device-specs">{d.specs.map(s => <span key={s}>{s}</span>)}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px dashed var(--line)" }}>
                <div className="device-price" style={{ fontSize: 18 }}>{fmtMoney(d.price, currency)}</div>
                {qty === 0 ? (
                  <button className="btn btn-primary" style={{ padding: "8px 14px", fontSize: 13 }} onClick={() => addDevice(d.id)}>Add <Icon.Arrow/></button>
                ) : (
                  <QtyStepper value={qty} onChange={(v) => setDeviceQty(d.id, v)}/>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- SIMs step ----------
const ManualSims = ({ simLines, addSim, setSimQty, currency, totalDevices }) => {
  return (
    <div>
      <div style={{ padding: 14, background: "color-mix(in srgb, var(--brand) 5%, var(--surface))", border: "1px dashed color-mix(in srgb, var(--brand) 25%, var(--line))", borderRadius: 10, marginBottom: 20, fontSize: 13, color: "var(--ink-2)", display: "flex", alignItems: "start", gap: 10 }}>
        <span>📶</span>
        <span>You've added <strong>{totalDevices}</strong> device{totalDevices === 1 ? "" : "s"}. SIMs are optional — only add them for phones that need cellular connectivity.</span>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        {SIMS.map(s => {
          const line = simLines.find(l => l.simId === s.id);
          const qty = line ? line.qty : 0;
          return (
            <div key={s.id} style={{ padding: 22, background: "var(--surface)", border: "1px solid " + (qty > 0 ? "var(--brand)" : "var(--line-2)"), borderRadius: 14, display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "center", boxShadow: qty > 0 ? "0 0 0 1px var(--brand) inset" : undefined }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--ink)" }}>{s.name}</div>
                  {s.tag && <span style={{ fontSize: 10, padding: "2px 10px", borderRadius: 999, background: "var(--accent)", color: "var(--brand)", fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase" }}>{s.tag}</span>}
                </div>
                <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "0 0 12px", lineHeight: 1.5 }}>{s.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {s.features.map((f, i) => (
                    <span key={i} style={{ fontSize: 11, padding: "4px 10px", background: "var(--bg-alt)", borderRadius: 6, color: "var(--ink-2)" }}>✓ {f}</span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
                <div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 26, color: "var(--ink)", lineHeight: 1 }}>{fmtMoney(s.monthly, currency)}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>per SIM / month</div>
                </div>
                {qty === 0 ? (
                  <button className="btn btn-primary" style={{ padding: "8px 14px", fontSize: 13 }} onClick={() => addSim(s.id)}>Add SIM <Icon.Arrow/></button>
                ) : (
                  <QtyStepper value={qty} onChange={(v) => setSimQty(s.id, v)} label="SIMs"/>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Software step ----------
const ManualSoftware = ({ softwareIds, toggleSoftware, currency }) => {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
      {SOFTWARE.map(s => {
        const on = softwareIds.includes(s.id);
        return (
          <div
            key={s.id}
            onClick={() => toggleSoftware(s.id)}
            style={{
              padding: 22, background: "var(--surface)",
              border: "1px solid " + (on ? "var(--brand)" : "var(--line-2)"),
              borderRadius: 14, cursor: "pointer", position: "relative",
              boxShadow: on ? "0 0 0 1px var(--brand) inset" : undefined,
              transition: "all .15s ease",
            }}
          >
            <div style={{ position: "absolute", top: 16, right: 16, width: 24, height: 24, borderRadius: 6, border: "1.5px solid " + (on ? "var(--brand)" : "var(--line-2)"), background: on ? "var(--brand)" : "transparent", display: "grid", placeItems: "center", color: "var(--bg)" }}>
              {on && <Icon.Check s={14}/>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: on ? "var(--brand)" : "var(--bg-alt)", color: on ? "var(--bg)" : "var(--ink)", display: "grid", placeItems: "center", fontFamily: "var(--serif)", fontSize: 15, fontWeight: 600 }}>
                {s.icon || s.name.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ paddingRight: 36 }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 17, color: "var(--ink)" }}>{s.name}</div>
                {s.tag && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.tag}</div>}
              </div>
            </div>
            <p style={{ fontSize: 12, color: "var(--ink-2)", margin: "8px 0 14px", lineHeight: 1.5 }}>{s.desc || ""}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 12, borderTop: "1px dashed var(--line)" }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--ink)" }}>{fmtMoney(s.monthly, currency)}<span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 4 }}>/mo</span></div>
              <div style={{ fontSize: 11, color: on ? "var(--brand)" : "var(--muted)", fontWeight: 600 }}>{on ? "✓ Selected" : "Click to add"}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- Sticky summary ----------
const ManualSummary = ({ deviceLines, simLines, softwareIds, oneTime, monthlyTotal, currency, onRemoveDevice, onRemoveSim, onRemoveSoftware }) => {
  return (
    <div style={{ position: "sticky", top: 96, padding: 24, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14 }}>
      <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>Your build</div>

      {deviceLines.length === 0 && simLines.length === 0 && softwareIds.length === 0 ? (
        <div style={{ padding: "24px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
          Nothing added yet.<br/>Start picking devices →
        </div>
      ) : (
        <>
          {deviceLines.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>📱 DEVICES</div>
              {deviceLines.map(l => {
                const d = DEVICES.find(x => x.id === l.deviceId);
                if (!d) return null;
                return (
                  <div key={l.deviceId} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px dashed var(--line)" }}>
                    <div style={{ flex: 1, fontSize: 13 }}><strong style={{ fontFamily: "var(--serif)" }}>{l.qty}×</strong> {d.name}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-2)", fontFamily: "var(--serif)" }}>{fmtMoney(d.price * l.qty, currency)}</div>
                    <button onClick={() => onRemoveDevice(l.deviceId)} style={{ width: 20, height: 20, borderRadius: "50%", border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", padding: 0, fontSize: 14 }}>×</button>
                  </div>
                );
              })}
            </div>
          )}
          {simLines.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>📶 SIMS</div>
              {simLines.map(l => {
                const s = SIMS.find(x => x.id === l.simId);
                if (!s) return null;
                return (
                  <div key={l.simId} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px dashed var(--line)" }}>
                    <div style={{ flex: 1, fontSize: 13 }}><strong style={{ fontFamily: "var(--serif)" }}>{l.qty}×</strong> {s.name}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>{fmtMoney(s.monthly * l.qty, currency)}/mo</div>
                    <button onClick={() => onRemoveSim(l.simId)} style={{ width: 20, height: 20, borderRadius: "50%", border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", padding: 0, fontSize: 14 }}>×</button>
                  </div>
                );
              })}
            </div>
          )}
          {softwareIds.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>◆ SOFTWARE</div>
              {softwareIds.map(id => {
                const s = SOFTWARE.find(x => x.id === id);
                if (!s) return null;
                return (
                  <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px dashed var(--line)" }}>
                    <div style={{ flex: 1, fontSize: 13 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>{fmtMoney(s.monthly, currency)}/mo</div>
                    <button onClick={() => onRemoveSoftware(id)} style={{ width: 20, height: 20, borderRadius: "50%", border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", padding: 0, fontSize: 14 }}>×</button>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "2px solid var(--ink)", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--muted)" }}>Hardware (one-time)</span>
              <span style={{ fontFamily: "var(--serif)", fontSize: 16 }}>{fmtMoney(oneTime, currency)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--muted)" }}>Recurring</span>
              <span style={{ fontFamily: "var(--serif)", fontSize: 16 }}>{fmtMoney(monthlyTotal, currency)}<span style={{ fontSize: 11, color: "var(--muted)" }}>/mo</span></span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ---------- Reusable qty stepper ----------
const QtyStepper = ({ value, onChange, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid var(--line-2)", borderRadius: 8, overflow: "hidden", background: "var(--surface)" }}>
    <button onClick={(e) => { e.stopPropagation(); onChange(value - 1); }} style={{ width: 32, height: 32, border: "none", background: "transparent", cursor: "pointer", color: "var(--ink)", fontSize: 16 }}>−</button>
    <div style={{ minWidth: 36, textAlign: "center", fontFamily: "var(--serif)", fontSize: 14, padding: "0 4px", borderLeft: "1px solid var(--line)", borderRight: "1px solid var(--line)", height: 32, lineHeight: "32px" }}>
      {value}{label ? <span style={{ fontSize: 10, color: "var(--muted)", marginLeft: 2 }}>{label}</span> : null}
    </div>
    <button onClick={(e) => { e.stopPropagation(); onChange(value + 1); }} style={{ width: 32, height: 32, border: "none", background: "transparent", cursor: "pointer", color: "var(--ink)", fontSize: 16 }}>+</button>
  </div>
);

Object.assign(window, { ManualBuilder });
