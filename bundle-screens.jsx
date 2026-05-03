// Bundle configurator + multi-item cart screens

const { useState: useStateB, useEffect: useEffectB } = React;

// ---------- Bundle selection screen ----------
const BundleCatalog = ({ onPickBundle, onStartManual, currency }) => {
  return (
    <div className="page page-enter">
      <div className="hero">
        <div>
          <div className="eyebrow">Step 01 · Start your order</div>
          <h1 style={{ marginTop: 14 }}>Pre-built kits, <em>or build your own.</em></h1>
          <div className="hero-meta">
            <span><span className="dot"/> Multi-product orders</span>
            <span><span className="dot"/> Phone + SIM + software</span>
            <span><span className="dot"/> Fully configurable</span>
          </div>
        </div>
        <div>
          <p style={{ maxWidth: 360 }}>
            Choose a starter kit for the role you're buying for, or build an order from scratch — pick devices, then SIMs, then software, in your own order.
          </p>
        </div>
      </div>

      {/* Two main paths */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 32, marginBottom: 24 }}>
        <div style={{ padding: 24, border: "2px solid var(--brand)", borderRadius: 14, background: "color-mix(in srgb, var(--brand) 6%, var(--surface))" }}>
          <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--brand)", fontWeight: 600 }}>Path A · Recommended</div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 26, margin: "8px 0 8px", color: "var(--ink)" }}>Pick a bundle</h2>
          <p style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 16, lineHeight: 1.5 }}>Role-based kits with hardware + SIM + software pre-selected. Customise everything before checkout.</p>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>{BUNDLES.length} kits available · jump to bundles below ↓</div>
        </div>
        <div style={{ padding: 24, border: "1px solid var(--line-2)", borderRadius: 14, background: "var(--surface)", display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--accent)", fontWeight: 600 }}>Path B · Manual</div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 26, margin: "8px 0 8px", color: "var(--ink)" }}>Build it yourself</h2>
          <p style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 16, lineHeight: 1.5 }}>Step through Devices → SIMs → Software at your own pace. Add what you want, skip what you don't.</p>
          <button className="btn btn-primary" style={{ alignSelf: "flex-start", marginTop: "auto" }} onClick={onStartManual}>
            Start building manually <Icon.Arrow/>
          </button>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "8px 0 20px" }}>
        <div style={{ flex: 1, height: 1, background: "var(--line)" }}/>
        <div style={{ fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--muted)" }}>Or pick a bundle</div>
        <div style={{ flex: 1, height: 1, background: "var(--line)" }}/>
      </div>

      <div className="device-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {BUNDLES.map(b => {
          const devs = b.deviceIds.map(id => DEVICES.find(d => d.id === id)).filter(Boolean);
          const sim = b.simId ? SIMS.find(s => s.id === b.simId) : null;
          const softs = b.softwareIds.map(id => SOFTWARE.find(s => s.id === id)).filter(Boolean);
          const oneTime = devs.reduce((a, d) => a + d.price, 0);
          const monthly = (sim ? sim.monthly : 0) + softs.reduce((a, s) => a + s.monthly, 0);
          return (
            <div key={b.id} className="device-card" onClick={() => onPickBundle(b)} style={{ cursor: "pointer" }}>
              <div style={{ height: 6, background: b.accent, borderRadius: 3, marginBottom: 4 }}/>
              <div className="device-name" style={{ fontSize: 22 }}>{b.name}</div>
              <div className="device-subtitle" style={{ fontSize: 13, minHeight: 36 }}>{b.tagline}</div>
              {!b.custom ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "12px 0", borderTop: "1px dashed var(--line)", borderBottom: "1px dashed var(--line)" }}>
                  {devs.map(d => <div key={d.id} style={{ fontSize: 12, color: "var(--ink-2)" }}>📱 {d.name}</div>)}
                  {sim && <div style={{ fontSize: 12, color: "var(--ink-2)" }}>📶 {sim.name}</div>}
                  {softs.map(s => <div key={s.id} style={{ fontSize: 12, color: "var(--ink-2)" }}>◆ {s.name}</div>)}
                </div>
              ) : (
                <div style={{ padding: "14px 0", borderTop: "1px dashed var(--line)", borderBottom: "1px dashed var(--line)", fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>
                  Blank canvas — add any mix of devices, SIMs and software.
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginTop: "auto", paddingTop: 8 }}>
                <div>
                  {oneTime > 0 && <div style={{ fontFamily: "var(--serif)", fontSize: 20 }}>{fmtMoney(oneTime, currency)}</div>}
                  {monthly > 0 && <div style={{ fontSize: 12, color: "var(--muted)" }}>+ {fmtMoney(monthly, currency)}/mo</div>}
                  {b.custom && <div style={{ fontSize: 12, color: "var(--muted)" }}>Starts from scratch</div>}
                </div>
                <button className="btn btn-primary" style={{ padding: "8px 14px", fontSize: 13 }}>
                  {b.custom ? "Start building" : "Customise"} <Icon.Arrow/>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Configurator (customise bundle) ----------
const BundleConfigurator = ({ bundle, onBack, onAddToCart, currency }) => {
  const [deviceLines, setDeviceLines] = useStateB(() =>
    bundle.deviceIds.map(id => ({ deviceId: id, qty: 1 }))
  );
  const [simId, setSimId] = useStateB(bundle.simId);
  const [simQty, setSimQty] = useStateB(bundle.simId ? 1 : 0);
  const [softwareIds, setSoftwareIds] = useStateB([...bundle.softwareIds]);

  const addDevice = (id) => {
    setDeviceLines(ls => {
      const existing = ls.find(l => l.deviceId === id);
      if (existing) return ls.map(l => l.deviceId === id ? { ...l, qty: l.qty + 1 } : l);
      return [...ls, { deviceId: id, qty: 1 }];
    });
  };
  const updateDeviceQty = (id, q) => setDeviceLines(ls => ls.map(l => l.deviceId === id ? { ...l, qty: Math.max(0, q) } : l).filter(l => l.qty > 0));
  const removeDevice = (id) => setDeviceLines(ls => ls.filter(l => l.deviceId !== id));
  const toggleSoftware = (id) => setSoftwareIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);

  const deviceCost = deviceLines.reduce((a, l) => {
    const d = DEVICES.find(x => x.id === l.deviceId);
    return a + (d ? d.price * l.qty : 0);
  }, 0);
  const sim = simId ? SIMS.find(s => s.id === simId) : null;
  const simMonthly = sim ? sim.monthly * simQty : 0;
  const softMonthly = softwareIds.reduce((a, id) => { const s = SOFTWARE.find(x => x.id === id); return a + (s ? s.monthly : 0); }, 0);
  const totalMonthly = simMonthly + softMonthly;

  const canAdd = deviceLines.length > 0 || simId || softwareIds.length > 0;

  const handleAdd = () => {
    onAddToCart({
      bundleName: bundle.name,
      accent: bundle.accent,
      devices: deviceLines,
      simId, simQty,
      softwareIds,
    });
  };

  return (
    <div className="page page-enter">
      <button className="btn btn-ghost" style={{ marginBottom: 20 }} onClick={onBack}><Icon.Back/> Back to bundles</button>

      <div className="soft-head">
        <div>
          <div className="eyebrow" style={{ color: bundle.accent }}>Customise · {bundle.name}</div>
          <h1 style={{ marginTop: 12 }}>Configure your <em style={{ fontStyle: "italic", color: "var(--accent-2)" }}>bundle</em></h1>
          <p style={{ marginTop: 14, maxWidth: 600 }}>
            Adjust devices, SIMs and software to match your team. Add this bundle to your order, then build more if you need different configurations.
          </p>
        </div>
      </div>

      <div className="split">
        <div>
          {/* Devices */}
          <section style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: 18, marginBottom: 14, display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent-2)" }}>01</span> Devices
              <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)", fontWeight: 400 }}>{deviceLines.length} selected</span>
            </h3>
            {deviceLines.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                {deviceLines.map(l => {
                  const d = DEVICES.find(x => x.id === l.deviceId);
                  if (!d) return null;
                  const V = d.visual;
                  return (
                    <div key={l.deviceId} style={{ display: "flex", alignItems: "center", gap: 14, padding: 12, background: "var(--bg-alt)", borderRadius: "var(--radius-sm)" }}>
                      <div style={{ width: 64, height: 44 }}><V/></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "var(--serif)", fontSize: 15 }}>{d.name}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>{fmtMoney(d.price, currency)} each</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line-2)", borderRadius: 8, overflow: "hidden", background: "var(--surface)" }}>
                        <button onClick={() => updateDeviceQty(l.deviceId, l.qty - 1)} style={{ width: 28, height: 28, border: "none", background: "transparent", cursor: "pointer", color: "var(--ink)" }}>−</button>
                        <span style={{ width: 30, textAlign: "center", fontSize: 13, fontWeight: 500 }}>{l.qty}</span>
                        <button onClick={() => updateDeviceQty(l.deviceId, l.qty + 1)} style={{ width: 28, height: 28, border: "none", background: "transparent", cursor: "pointer", color: "var(--ink)" }}>+</button>
                      </div>
                      <div style={{ fontFamily: "var(--serif)", fontSize: 14, minWidth: 80, textAlign: "right" }}>{fmtMoney(d.price * l.qty, currency)}</div>
                      <button onClick={() => removeDevice(l.deviceId)} title="Remove" style={{ width: 28, height: 28, border: "1px solid var(--line-2)", borderRadius: 6, background: "var(--surface)", cursor: "pointer", color: "var(--muted)" }}>×</button>
                    </div>
                  );
                })}
              </div>
            )}
            <details style={{ borderTop: "1px dashed var(--line)", paddingTop: 12 }}>
              <summary style={{ cursor: "pointer", fontSize: 13, color: "var(--accent-2)", fontWeight: 500 }}>＋ Add another device</summary>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}>
                {DEVICES.map(d => (
                  <button key={d.id} onClick={() => addDevice(d.id)} style={{ padding: 10, border: "1px solid var(--line)", borderRadius: 8, background: "var(--surface-2)", textAlign: "left", cursor: "pointer", fontSize: 12, color: "var(--ink-2)" }}>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 13, color: "var(--ink)" }}>{d.name}</div>
                    <div style={{ color: "var(--muted)", marginTop: 2 }}>{fmtMoney(d.price, currency)}</div>
                  </button>
                ))}
              </div>
            </details>
          </section>

          {/* SIM Plans */}
          <section style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: 18, marginBottom: 14, display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent-2)" }}>02</span> MVNO SIM plan
              <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)", fontWeight: 400 }}>Optional</span>
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: simId ? 14 : 0 }}>
              <div onClick={() => { setSimId(null); setSimQty(0); }} className={"soft-card" + (simId === null ? " selected" : "")} style={{ padding: 16 }}>
                <div className="soft-name" style={{ fontSize: 15 }}>No SIM</div>
                <div className="soft-desc" style={{ fontSize: 12 }}>Device only, no cellular plan.</div>
              </div>
              {SIMS.map(s => (
                <div key={s.id} onClick={() => { setSimId(s.id); if (simQty === 0) setSimQty(1); }} className={"soft-card" + (simId === s.id ? " selected" : "")} style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div className="soft-name" style={{ fontSize: 15 }}>{s.name}</div>
                      <div className="soft-tag">{s.tag}</div>
                    </div>
                    <div className="soft-check">{simId === s.id && <Icon.Check s={12}/>}</div>
                  </div>
                  <div className="soft-desc" style={{ fontSize: 12, margin: "6px 0" }}>{s.desc}</div>
                  <div className="soft-price" style={{ fontSize: 15 }}>{fmtMoney(s.monthly, currency)}<span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--sans)", fontWeight: 400 }}>/mo</span></div>
                </div>
              ))}
            </div>
            {simId && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "var(--bg-alt)", borderRadius: "var(--radius-sm)" }}>
                <span style={{ fontSize: 13, color: "var(--muted)", flex: 1 }}>Number of SIMs to provision</span>
                <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line-2)", borderRadius: 8, overflow: "hidden", background: "var(--surface)" }}>
                  <button onClick={() => setSimQty(Math.max(1, simQty - 1))} style={{ width: 32, height: 32, border: "none", background: "transparent", cursor: "pointer", color: "var(--ink)" }}>−</button>
                  <span style={{ width: 36, textAlign: "center", fontSize: 13, fontWeight: 500 }}>{simQty}</span>
                  <button onClick={() => setSimQty(simQty + 1)} style={{ width: 32, height: 32, border: "none", background: "transparent", cursor: "pointer", color: "var(--ink)" }}>+</button>
                </div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 15, minWidth: 80, textAlign: "right" }}>{fmtMoney(simMonthly, currency)}/mo</div>
              </div>
            )}
          </section>

          {/* Software */}
          <section style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: 24 }}>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: 18, marginBottom: 14, display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent-2)" }}>03</span> Software modules
              <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)", fontWeight: 400 }}>{softwareIds.length} selected</span>
            </h3>
            <div className="soft-grid">
              {SOFTWARE.map(s => {
                const sel = softwareIds.includes(s.id);
                return (
                  <div key={s.id} className={"soft-card" + (sel ? " selected" : "")} onClick={() => toggleSoftware(s.id)} style={{ padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div className="soft-icon" style={{ width: 34, height: 34, fontSize: 11 }}>{s.icon}</div>
                        <div>
                          <div className="soft-name" style={{ fontSize: 14 }}>{s.name}</div>
                          <div className="soft-tag">{s.tag}</div>
                        </div>
                      </div>
                      <div className="soft-check">{sel && <Icon.Check s={12}/>}</div>
                    </div>
                    <div className="soft-price" style={{ marginTop: 8, fontSize: 14 }}>{fmtMoney(s.monthly, currency)}<span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--sans)", fontWeight: 400 }}>/mo</span></div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="side-card">
          <h3>Bundle summary</h3>
          <div className="sub">{bundle.name}</div>

          {deviceLines.length === 0 && !simId && softwareIds.length === 0 ? (
            <div className="side-empty">Pick at least one item to add this bundle to your order.</div>
          ) : (
            <>
              {deviceLines.map(l => {
                const d = DEVICES.find(x => x.id === l.deviceId);
                return d ? <div key={l.deviceId} className="side-line"><span className="k">{d.name} × {l.qty}</span><span className="v">{fmtMoney(d.price * l.qty, currency)}</span></div> : null;
              })}
              {sim && <div className="side-line"><span className="k">{sim.name} × {simQty}</span><span className="v">{fmtMoney(simMonthly, currency)}/mo</span></div>}
              {softwareIds.map(id => {
                const s = SOFTWARE.find(x => x.id === id);
                return s ? <div key={id} className="side-line"><span className="k">{s.name}</span><span className="v">{fmtMoney(s.monthly, currency)}/mo</span></div> : null;
              })}
              <div className="side-total">
                <div>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)" }}>One-time</div>
                  <div className="v">{fmtMoney(deviceCost, currency)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)" }}>Monthly</div>
                  <div className="v">{fmtMoney(totalMonthly, currency)}</div>
                </div>
              </div>
              <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 16 }} onClick={handleAdd} disabled={!canAdd}>
                Add to order <Icon.Arrow/>
              </button>
              <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 10 }}>
                You can add more bundles after this one
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- Cart / Review Order ----------
const CartReview = ({ cart, onRemove, onAddMore, onCheckout, currency }) => {
  const totals = calcCartTotals(cart);
  return (
    <div className="page page-enter">
      <div className="hero" style={{ gridTemplateColumns: "1fr auto" }}>
        <div>
          <div className="eyebrow">Your order</div>
          <h1 style={{ marginTop: 12 }}>Review & <em style={{ fontStyle: "italic", color: "var(--accent-2)" }}>proceed</em></h1>
          <p style={{ marginTop: 14, maxWidth: 600 }}>
            {cart.length === 0 ? "Your order is empty. Add at least one bundle to proceed." : `${cart.length} bundle${cart.length>1?"s":""} in this order. Add more if you need additional configurations for different teams.`}
          </p>
        </div>
        <button className="btn btn-ghost btn-lg" onClick={onAddMore}>＋ Add another bundle</button>
      </div>

      <div className="split" style={{ marginTop: 32 }}>
        <div>
          {cart.length === 0 ? (
            <div className="side-empty" style={{ padding: 60 }}>No bundles yet — start by picking a starter kit.</div>
          ) : cart.map((item, i) => {
            const devs = (item.devices || []).map(l => ({ ...l, d: DEVICES.find(x => x.id === l.deviceId) })).filter(x => x.d);
            const sim = item.simId ? SIMS.find(s => s.id === item.simId) : null;
            const simLines = (item.simLines || []).map(l => ({ ...l, s: SIMS.find(x => x.id === l.simId) })).filter(x => x.s);
            const softs = (item.softwareIds || []).map(id => SOFTWARE.find(s => s.id === id)).filter(Boolean);
            const one = devs.reduce((a, x) => a + x.d.price * x.qty, 0);
            const monthly = (sim ? sim.monthly * item.simQty : 0)
              + simLines.reduce((a, x) => a + x.s.monthly * x.qty, 0)
              + softs.reduce((a, s) => a + s.monthly, 0);
            return (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: 24, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "start", gap: 16, marginBottom: 16 }}>
                  <div style={{ width: 6, alignSelf: "stretch", background: item.accent, borderRadius: 3 }}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)" }}>{item.isCustom ? "Custom" : "Bundle"} {i + 1}</div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 22, marginTop: 2 }}>{item.bundleName}</div>
                  </div>
                  <button onClick={() => onRemove(i)} style={{ padding: "6px 12px", fontSize: 12, border: "1px solid var(--line-2)", borderRadius: 999, background: "var(--surface)", color: "var(--muted)", cursor: "pointer" }}>Remove</button>
                </div>
                <div style={{ display: "grid", gap: 8, paddingTop: 14, borderTop: "1px dashed var(--line)" }}>
                  {devs.map(x => <div key={x.deviceId} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>📱 {x.d.name} × {x.qty}</span><span style={{ fontVariantNumeric: "tabular-nums" }}>{fmtMoney(x.d.price * x.qty, currency)}</span></div>)}
                  {sim && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>📶 {sim.name} × {item.simQty}</span><span style={{ fontVariantNumeric: "tabular-nums" }}>{fmtMoney(sim.monthly * item.simQty, currency)}/mo</span></div>}
                  {simLines.map(x => <div key={x.simId} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>📶 {x.s.name} × {x.qty}</span><span style={{ fontVariantNumeric: "tabular-nums" }}>{fmtMoney(x.s.monthly * x.qty, currency)}/mo</span></div>)}
                  {softs.map(s => <div key={s.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>◆ {s.name}</span><span style={{ fontVariantNumeric: "tabular-nums" }}>{fmtMoney(s.monthly, currency)}/mo</span></div>)}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 24, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)", fontSize: 13 }}>
                  <span>One-time: <strong style={{ fontFamily: "var(--serif)" }}>{fmtMoney(one, currency)}</strong></span>
                  <span>Monthly: <strong style={{ fontFamily: "var(--serif)" }}>{fmtMoney(monthly, currency)}</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="side-card">
          <h3>Order total</h3>
          <div className="sub">{cart.length} bundle{cart.length !== 1 ? "s" : ""}</div>
          <div className="side-line"><span className="k">Hardware (one-time)</span><span className="v">{fmtMoney(totals.oneTime, currency)}</span></div>
          <div className="side-line"><span className="k">SIM + software (monthly)</span><span className="v">{fmtMoney(totals.monthly, currency)}</span></div>
          <div className="side-line"><span className="k">Implementation</span><span className="v">{fmtMoney(totals.impl, currency)}</span></div>
          <div className="side-total">
            <div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--muted)" }}>Year 1 total</div>
              <div className="v">{fmtMoney(totals.year1, currency)}</div>
            </div>
          </div>
          <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 16 }} onClick={onCheckout} disabled={cart.length === 0}>
            Continue to proposal <Icon.Arrow/>
          </button>
          <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 10 }}>
            Includes KYC verification & e-signature
          </div>
        </div>
      </div>
    </div>
  );
};

// helper
const calcCartTotals = (cart) => {
  let oneTime = 0, monthly = 0, totalSoftwareModules = 0;
  cart.forEach(item => {
    (item.devices || item.deviceLines || []).forEach(l => { const d = DEVICES.find(x => x.id === l.deviceId); if (d) oneTime += d.price * l.qty; });
    // single-sim shape
    if (item.simId) { const s = SIMS.find(x => x.id === item.simId); if (s) monthly += s.monthly * item.simQty; }
    // multi-sim shape (manual builds)
    if (item.simLines) item.simLines.forEach(l => { const s = SIMS.find(x => x.id === l.simId); if (s) monthly += s.monthly * l.qty; });
    (item.softwareIds || []).forEach(id => { const s = SOFTWARE.find(x => x.id === id); if (s) { monthly += s.monthly; totalSoftwareModules += 1; } });
  });
  const impl = cart.length > 0 ? 1500 + totalSoftwareModules * 600 : 0;
  const year1 = oneTime + impl + monthly * 12;
  return { oneTime, monthly, impl, year1, totalSoftwareModules };
};

Object.assign(window, { BundleCatalog, BundleConfigurator, CartReview, calcCartTotals });
