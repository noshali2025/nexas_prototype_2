// Checkout (with KYC + e-sig) + Receipt + Tracker for multi-item cart

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c]));

// ── KYC Document Upload Widget ─────────────────────────────────────────────
const KycUpload = ({ label, hint, icon, value, onChange, error, required }) => {
  const ref = React.useRef();
  const [drag, setDrag] = React.useState(false);

  const handleFile = (file) => {
    if (!file) return;
    onChange({ name: file.name, size: file.size, mime: file.type });
  };

  return (
    <div>
      <div
        onClick={() => ref.current.click()}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        style={{
          border: `2px dashed ${error ? "var(--danger)" : value ? "#1b6b4a" : drag ? "var(--ink)" : "var(--line-2)"}`,
          borderRadius: "var(--radius-sm)", padding: "20px 16px", textAlign: "center",
          cursor: "pointer", transition: "all .18s",
          background: value ? "rgba(27,107,74,.05)" : drag ? "var(--bg-alt)" : "var(--surface-2)",
        }}
      >
        <input ref={ref} type="file" accept="image/*,.pdf" style={{ display: "none" }}
          onChange={e => handleFile(e.target.files[0])} />
        {value ? (
          <div style={{ color: "#1b6b4a" }}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>✓</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{value.name}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>
              {(value.size / 1024).toFixed(0)} KB · Click to replace
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)", marginBottom: 4 }}>
              {label}{required && <span style={{ color: "var(--danger)", marginLeft: 3 }}>*</span>}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8, lineHeight: 1.4 }}>{hint}</div>
            <div style={{ fontSize: 11, padding: "5px 12px", background: "var(--bg-alt)", borderRadius: 20, display: "inline-block", color: "var(--ink-2)" }}>
              Click to upload or drag &amp; drop
            </div>
          </div>
        )}
      </div>
      {error && <div style={{ fontSize: 11, color: "var(--danger)", marginTop: 5 }}>{error}</div>}
    </div>
  );
};

const MultiCheckoutForm = ({ cart, currency, onBack, onSubmit }) => {
  const totals = calcCartTotals(cart);
  const taxUSD = (totals.oneTime + totals.impl + totals.monthly * 12) * 0.08;
  const totalDueUSD = totals.year1 + taxUSD;

  const [form, setForm] = React.useState({
    company: "", tradingName: "", companyReg: "", vatNumber: "",
    contact: "", role: "", email: "", phone: "",
    address: "", city: "", country: "United Kingdom", postal: "",
    deployment: "cloud", payment: "card",
    cardName: "", cardNum: "", cardExp: "", cardCvc: "",
    // CreditSafe finance
    csTerm: 36, // months
    csAnnualRev: "", csYearsTrading: "", csCcjs: "none", csConsent: false,
    csChecked: false, csApproved: false, csScore: 0, csLimit: 0,
    // KYC
    directorName: "", directorDob: "", directorAddress: "", idType: "passport", idNumber: "",
    kycConsent: false,
    // KYC documents
    kycDocId: null, kycDocIdBack: null, kycDocAddress: null, kycDocCompany: null, kycSelfie: null,
    // e-sig
    signature: "", signDate: new Date().toISOString().slice(0,10),
    terms: false, msa: false,
  });
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);
  const [stage, setStage] = React.useState(1); // 1=details, 2=kyc, 3=sign

  const up = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })); };

  const validateStage = (n) => {
    const e = {};
    if (n === 1) {
      if (!form.company.trim()) e.company = "Required";
      if (!form.companyReg.trim()) e.companyReg = "Required";
      if (!form.contact.trim()) e.contact = "Required";
      if (!form.role.trim()) e.role = "Required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
      if (!/^[\d\s+\-()]{7,}$/.test(form.phone)) e.phone = "Valid phone required";
      if (!form.address.trim()) e.address = "Required";
      if (!form.city.trim()) e.city = "Required";
      if (!form.postal.trim()) e.postal = "Required";
      if (form.payment === "card") {
        if (!form.cardName.trim()) e.cardName = "Required";
        if (!/^\d[\d\s]{13,}$/.test(form.cardNum)) e.cardNum = "Valid card number";
        if (!/^\d{2}\/\d{2}$/.test(form.cardExp)) e.cardExp = "MM/YY";
        if (!/^\d{3,4}$/.test(form.cardCvc)) e.cardCvc = "CVC";
      }
      if (form.payment === "creditsafe") {
        if (!form.csApproved) e.csApproved = "Please complete a CreditSafe check first";
      }
    } else if (n === 2) {
      if (!form.directorName.trim()) e.directorName = "Required";
      if (!form.directorDob) e.directorDob = "Required";
      if (!form.directorAddress.trim()) e.directorAddress = "Required";
      if (!form.idNumber.trim()) e.idNumber = "Required";
      if (!form.kycDocId) e.kycDocId = "Please upload your photo ID";
      if (!form.kycDocAddress) e.kycDocAddress = "Please upload proof of address";
      if (!form.kycSelfie) e.kycSelfie = "Please upload a selfie for biometric verification";
      if (!form.kycConsent) e.kycConsent = "Please consent to KYC verification";
    } else if (n === 3) {
      if (!form.signature.trim() || form.signature.trim().length < 4) e.signature = "Type your full legal name";
      if (!form.terms) e.terms = "Required";
      if (!form.msa) e.msa = "Required";
    }
    return e;
  };

  const next = () => {
    const e = validateStage(stage);
    if (Object.keys(e).length) { setErrors(e); return; }
    setStage(stage + 1); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    const e = validateStage(3);
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    setTimeout(() => onSubmit(form), 1100);
  };

  return (
    <div className="page page-enter">
      <button className="btn btn-ghost" style={{ marginBottom: 20 }} onClick={() => stage > 1 ? setStage(stage - 1) : onBack()}>
        <Icon.Back/> Back
      </button>

      <div className="form-wrap">
        <div className="form-card">
          <div className="form-head">
            <div className="eyebrow">Checkout · Stage {stage} of 3</div>
            <h1 style={{ marginTop: 10, fontSize: 38 }}>
              {stage === 1 && "Company & payment"}
              {stage === 2 && "KYC verification"}
              {stage === 3 && "E-sign & finalise"}
            </h1>
            <p style={{ marginTop: 10, maxWidth: 600 }}>
              {stage === 1 && "Tell us who's buying. Your details secure credit approval and set up billing."}
              {stage === 2 && "UK financial regulations require director identification for business credit. Fully digital — takes 2 minutes."}
              {stage === 3 && "Review the master agreement, sign electronically, and you're done."}
            </p>
            <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
              {[1,2,3].map(n => (
                <div key={n} style={{ flex: 1, height: 4, borderRadius: 2, background: n <= stage ? "var(--ink)" : "var(--line)" }}/>
              ))}
            </div>
          </div>

          {stage === 1 && (
            <>
              <div className="form-section">
                <div className="form-section-title">Company</div>
                <div className="field-grid">
                  <div className={"field" + (errors.company ? " has-error" : "")}>
                    <label>Legal company name <span className="req">*</span></label>
                    <input value={form.company} onChange={e => up("company", e.target.value)} placeholder="Acme Industries Ltd."/>
                    <span className="err">{errors.company}</span>
                  </div>
                  <div className="field">
                    <label>Trading name (if different)</label>
                    <input value={form.tradingName} onChange={e => up("tradingName", e.target.value)} placeholder="Acme"/>
                  </div>
                  <div className={"field" + (errors.companyReg ? " has-error" : "")}>
                    <label>Company registration № <span className="req">*</span></label>
                    <input value={form.companyReg} onChange={e => up("companyReg", e.target.value)} placeholder="12345678"/>
                    <span className="err">{errors.companyReg}</span>
                  </div>
                  <div className="field">
                    <label>VAT number (optional)</label>
                    <input value={form.vatNumber} onChange={e => up("vatNumber", e.target.value)} placeholder="GB 123 4567 89"/>
                  </div>
                  <div className={"field" + (errors.contact ? " has-error" : "")}>
                    <label>Contact person <span className="req">*</span></label>
                    <input value={form.contact} onChange={e => up("contact", e.target.value)} placeholder="Jane Doe"/>
                    <span className="err">{errors.contact}</span>
                  </div>
                  <div className={"field" + (errors.role ? " has-error" : "")}>
                    <label>Role <span className="req">*</span></label>
                    <input value={form.role} onChange={e => up("role", e.target.value)} placeholder="CFO"/>
                    <span className="err">{errors.role}</span>
                  </div>
                  <div className={"field" + (errors.email ? " has-error" : "")}>
                    <label>Business email <span className="req">*</span></label>
                    <input type="email" value={form.email} onChange={e => up("email", e.target.value)} placeholder="jane@acme.com"/>
                    <span className="err">{errors.email}</span>
                  </div>
                  <div className={"field" + (errors.phone ? " has-error" : "")}>
                    <label>Phone <span className="req">*</span></label>
                    <input value={form.phone} onChange={e => up("phone", e.target.value)} placeholder="+44 20 7946 0011"/>
                    <span className="err">{errors.phone}</span>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">Billing & delivery address</div>
                <div className="field-grid full">
                  <div className={"field" + (errors.address ? " has-error" : "")}>
                    <label>Street address <span className="req">*</span></label>
                    <input value={form.address} onChange={e => up("address", e.target.value)} placeholder="22 Finsbury Square, Floor 6"/>
                    <span className="err">{errors.address}</span>
                  </div>
                </div>
                <div className="field-grid" style={{ marginTop: 14, gridTemplateColumns: "2fr 1fr 1fr" }}>
                  <div className={"field" + (errors.city ? " has-error" : "")}>
                    <label>City <span className="req">*</span></label>
                    <input value={form.city} onChange={e => up("city", e.target.value)}/>
                    <span className="err">{errors.city}</span>
                  </div>
                  <div className="field">
                    <label>Country</label>
                    <select value={form.country} onChange={e => up("country", e.target.value)}>
                      <option>United Kingdom</option><option>United States</option>
                      <option>Germany</option><option>France</option>
                      <option>Ireland</option><option>United Arab Emirates</option>
                    </select>
                  </div>
                  <div className={"field" + (errors.postal ? " has-error" : "")}>
                    <label>Postal code <span className="req">*</span></label>
                    <input value={form.postal} onChange={e => up("postal", e.target.value)}/>
                    <span className="err">{errors.postal}</span>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">Deployment</div>
                <div className="radio-row">
                  <div className={"radio-card" + (form.deployment === "cloud" ? " active" : "")} onClick={() => up("deployment", "cloud")}>
                    <div className="r-dot"/>
                    <div><div className="r-title">Cloud-hosted</div><div className="r-desc">Fully managed · fastest go-live · SOC 2 Type II</div></div>
                  </div>
                  <div className={"radio-card" + (form.deployment === "onprem" ? " active" : "")} onClick={() => up("deployment", "onprem")}>
                    <div className="r-dot"/>
                    <div><div className="r-title">On-premise</div><div className="r-desc">Self-hosted · full data residency control</div></div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">Payment</div>
                <div className="pay-row" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  {[
                    { id: "card", title: "Card", desc: "Charged on dispatch" },
                    { id: "wire", title: "Bank wire", desc: "Invoice in 24h" },
                    { id: "po", title: "Purchase order", desc: "Net 30 · approved partners" },
                    { id: "creditsafe", title: "CreditSafe finance", desc: "Spread cost over 12–60 months", badge: "Monthly" },
                  ].map(p => (
                    <div key={p.id} className={"radio-card" + (form.payment === p.id ? " active" : "")} onClick={() => up("payment", p.id)} style={{ position: "relative" }}>
                      <div className="r-dot"/>
                      <div style={{ flex: 1 }}>
                        <div className="r-title">
                          {p.title}
                          {p.badge && (
                            <span style={{ marginLeft: 8, fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "var(--accent)", color: "var(--brand)", fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase" }}>{p.badge}</span>
                          )}
                        </div>
                        <div className="r-desc">{p.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {form.payment === "card" && (
                  <div style={{ marginTop: 20, padding: 20, background: "var(--bg-alt)", borderRadius: "var(--radius-sm)" }}>
                    <div className="field-grid full">
                      <div className={"field" + (errors.cardName ? " has-error" : "")}>
                        <label>Name on card <span className="req">*</span></label>
                        <input value={form.cardName} onChange={e => up("cardName", e.target.value)}/>
                        <span className="err">{errors.cardName}</span>
                      </div>
                    </div>
                    <div className="field-grid" style={{ marginTop: 14, gridTemplateColumns: "2fr 1fr 1fr" }}>
                      <div className={"field" + (errors.cardNum ? " has-error" : "")}>
                        <label>Card number <span className="req">*</span></label>
                        <input value={form.cardNum} onChange={e => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
                          up("cardNum", v);
                        }} placeholder="4242 4242 4242 4242"/>
                        <span className="err">{errors.cardNum}</span>
                      </div>
                      <div className={"field" + (errors.cardExp ? " has-error" : "")}>
                        <label>Expiry <span className="req">*</span></label>
                        <input value={form.cardExp} onChange={e => {
                          let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                          if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                          up("cardExp", v);
                        }} placeholder="04/28"/>
                        <span className="err">{errors.cardExp}</span>
                      </div>
                      <div className={"field" + (errors.cardCvc ? " has-error" : "")}>
                        <label>CVC <span className="req">*</span></label>
                        <input value={form.cardCvc} onChange={e => up("cardCvc", e.target.value.replace(/\D/g, "").slice(0, 4))}/>
                        <span className="err">{errors.cardCvc}</span>
                      </div>
                    </div>
                  </div>
                )}

                {form.payment === "creditsafe" && (
                  <CreditSafePanel form={form} up={up} totals={totals} taxUSD={taxUSD} currency={currency} errors={errors}/>
                )}
              </div>
            </>
          )}

          {stage === 2 && (
            <>
              <div style={{ padding: 16, background: "color-mix(in srgb, var(--brand) 8%, var(--surface))", border: "1px solid color-mix(in srgb, var(--brand) 20%, var(--line))", borderRadius: "var(--radius-sm)", marginBottom: 24, display: "flex", gap: 12, alignItems: "start" }}>
                <Icon.Lock s={16}/>
                <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
                  <strong style={{ color: "var(--ink)" }}>Secure director verification.</strong> Your data is encrypted and processed by our KYC partner Onfido. Used only for credit & compliance checks.
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">Director details</div>
                <div className="field-grid">
                  <div className={"field" + (errors.directorName ? " has-error" : "")}>
                    <label>Full legal name <span className="req">*</span></label>
                    <input value={form.directorName} onChange={e => up("directorName", e.target.value)} placeholder="Jane Alexandra Doe"/>
                    <span className="err">{errors.directorName}</span>
                  </div>
                  <div className={"field" + (errors.directorDob ? " has-error" : "")}>
                    <label>Date of birth <span className="req">*</span></label>
                    <input type="date" value={form.directorDob} onChange={e => up("directorDob", e.target.value)}/>
                    <span className="err">{errors.directorDob}</span>
                  </div>
                </div>
                <div className="field-grid full" style={{ marginTop: 14 }}>
                  <div className={"field" + (errors.directorAddress ? " has-error" : "")}>
                    <label>Home address <span className="req">*</span></label>
                    <input value={form.directorAddress} onChange={e => up("directorAddress", e.target.value)} placeholder="10 Downing Street, London SW1A 2AA"/>
                    <span className="err">{errors.directorAddress}</span>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">ID document</div>
                <div className="pay-row">
                  {[
                    { id: "passport", title: "Passport" },
                    { id: "drivers", title: "Driver's licence" },
                    { id: "national", title: "National ID" },
                  ].map(p => (
                    <div key={p.id} className={"radio-card" + (form.idType === p.id ? " active" : "")} onClick={() => up("idType", p.id)}>
                      <div className="r-dot"/>
                      <div><div className="r-title">{p.title}</div></div>
                    </div>
                  ))}
                </div>
                <div className="field-grid full" style={{ marginTop: 14 }}>
                  <div className={"field" + (errors.idNumber ? " has-error" : "")}>
                    <label>Document number <span className="req">*</span></label>
                    <input value={form.idNumber} onChange={e => up("idNumber", e.target.value)} placeholder="•••••••••"/>
                    <span className="err">{errors.idNumber}</span>
                  </div>
                </div>
                <KycUpload
                  label={`${form.idType === "passport" ? "Passport photo page" : form.idType === "drivers" ? "Driving licence (front)" : "National ID card (front)"}`}
                  hint="JPG, PNG or PDF · Max 10 MB"
                  icon="🪪"
                  value={form.kycDocId}
                  onChange={v => up("kycDocId", v)}
                  error={errors.kycDocId}
                  required
                />
                {(form.idType === "drivers" || form.idType === "national") && (
                  <div style={{ marginTop: 10 }}>
                    <KycUpload
                      label={`${form.idType === "drivers" ? "Driving licence (back)" : "National ID card (back)"}`}
                      hint="JPG, PNG or PDF · Max 10 MB"
                      icon="🪪"
                      value={form.kycDocIdBack}
                      onChange={v => up("kycDocIdBack", v)}
                    />
                  </div>
                )}
              </div>

              <div className="form-section">
                <div className="form-section-title">Document uploads</div>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18, lineHeight: 1.5 }}>
                  Upload the following documents so our compliance team and AI verification system can process your application. All documents are encrypted end-to-end.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <KycUpload
                    label="Proof of address"
                    hint="Utility bill or bank statement · dated within 90 days"
                    icon="🏠"
                    value={form.kycDocAddress}
                    onChange={v => up("kycDocAddress", v)}
                    error={errors.kycDocAddress}
                    required
                  />
                  <KycUpload
                    label="Company registration certificate"
                    hint="Companies House certificate or Articles of Association"
                    icon="🏢"
                    value={form.kycDocCompany}
                    onChange={v => up("kycDocCompany", v)}
                  />
                </div>
                <div style={{ padding: "14px 16px", background: "color-mix(in srgb, var(--brand) 6%, var(--surface))", border: "1px solid color-mix(in srgb, var(--brand) 18%, var(--line))", borderRadius: "var(--radius-sm)", marginBottom: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>🤖</span> AI Biometric Verification
                  </div>
                  <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, marginBottom: 14 }}>
                    Our AI system will compare your selfie to your ID photo to verify your identity in seconds. Please upload a clear, well-lit photo of your face looking directly at the camera — no sunglasses.
                  </p>
                  <KycUpload
                    label="Selfie photo (biometric check)"
                    hint="Clear photo of your face · JPG or PNG · Max 5 MB"
                    icon="🤳"
                    value={form.kycSelfie}
                    onChange={v => up("kycSelfie", v)}
                    error={errors.kycSelfie}
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <label style={{ display: "flex", gap: 10, alignItems: "start", cursor: "pointer", fontSize: 13, color: "var(--ink-2)" }}>
                  <input type="checkbox" checked={form.kycConsent} onChange={e => up("kycConsent", e.target.checked)} style={{ marginTop: 3 }}/>
                  <span>I confirm the details above are accurate and I consent to NexaPoint and its regulated partners performing identity verification, biometric checks, and credit searches. I understand this may be recorded on my credit file.</span>
                </label>
                {errors.kycConsent && <div style={{ fontSize: 11, color: "var(--danger)", marginTop: 4, marginLeft: 22 }}>{errors.kycConsent}</div>}
              </div>
            </>
          )}

          {stage === 3 && (
            <>
              <div className="form-section">
                <div className="form-section-title">Order summary</div>
                <div style={{ padding: 20, background: "var(--bg-alt)", borderRadius: "var(--radius-sm)", fontSize: 13 }}>
                  {cart.map((item, i) => (
                    <div key={i} style={{ paddingBottom: 10, marginBottom: 10, borderBottom: i < cart.length - 1 ? "1px dashed var(--line)" : "none" }}>
                      <div style={{ fontFamily: "var(--serif)", fontSize: 15, marginBottom: 4 }}>{item.bundleName}</div>
                      <div style={{ color: "var(--muted)", fontSize: 12 }}>
                        {[
                          (item.devices || []).map(l => { const d = DEVICES.find(x => x.id === l.deviceId); return d ? `${d.name} ×${l.qty}` : null; }).filter(Boolean).join(" · "),
                          item.simId ? `${SIMS.find(s => s.id === item.simId)?.name} ×${item.simQty}` : null,
                          (item.simLines || []).map(l => { const s = SIMS.find(x => x.id === l.simId); return s ? `${s.name} ×${l.qty}` : null; }).filter(Boolean).join(" · "),
                          (item.softwareIds || []).length > 0 ? item.softwareIds.map(id => SOFTWARE.find(s => s.id === id)?.name).filter(Boolean).join(", ") : null,
                        ].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "2px solid var(--ink)", fontFamily: "var(--serif)", fontSize: 18 }}>
                    <span>Total due today (incl. tax)</span>
                    <span>{fmtMoney(totalDueUSD, currency)}</span>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">Master Services Agreement</div>
                <div style={{ padding: 20, background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", maxHeight: 220, overflowY: "auto", fontSize: 12, lineHeight: 1.6, color: "var(--muted)" }}>
                  <p style={{ color: "var(--ink-2)", fontWeight: 500 }}>MASTER SERVICES AGREEMENT — v4.2 · January 2026</p>
                  <p>This Master Services Agreement ("Agreement") governs the provision of hardware, software modules, and MVNO connectivity services by NexaPoint ERP Ltd. ("NexaPoint") to the client ("Customer") identified above.</p>
                  <p><strong>1. Term.</strong> The Agreement commences on the date of signature and continues for twelve (12) months ("Initial Term"), automatically renewing for successive 12-month periods unless terminated with 60 days' written notice.</p>
                  <p><strong>2. Fees & Payment.</strong> Hardware charges are due on dispatch. Software & SIM subscriptions are billed monthly in advance. Implementation fees are due in two milestones: 50% on kickoff, 50% on go-live.</p>
                  <p><strong>3. Service Levels.</strong> NexaPoint commits to 99.9% platform uptime, 4-hour P1 response, and next-business-day replacement for faulty hardware under warranty.</p>
                  <p><strong>4. Data Protection.</strong> NexaPoint acts as Data Processor. A Data Processing Addendum (UK GDPR-compliant) forms part of this Agreement.</p>
                  <p><strong>5. Liability.</strong> NexaPoint's aggregate liability in any 12-month period shall not exceed fees paid in that period, except for breaches of confidentiality, data protection, or gross negligence.</p>
                  <p><strong>6. Governing Law.</strong> England and Wales. Disputes resolved in the courts of London.</p>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">Electronic signature</div>
                <div className="field-grid">
                  <div className={"field" + (errors.signature ? " has-error" : "")}>
                    <label>Type your full legal name to sign <span className="req">*</span></label>
                    <input
                      value={form.signature}
                      onChange={e => up("signature", e.target.value)}
                      placeholder="Jane Alexandra Doe"
                      style={{ fontFamily: "var(--serif)", fontSize: 22, fontStyle: "italic", letterSpacing: "0.01em", padding: "16px 14px" }}
                    />
                    <span className="err">{errors.signature}</span>
                  </div>
                  <div className="field">
                    <label>Date</label>
                    <input type="date" value={form.signDate} onChange={e => up("signDate", e.target.value)}/>
                  </div>
                </div>
                {form.signature && (
                  <div style={{ marginTop: 14, padding: 20, borderRadius: "var(--radius-sm)", background: "linear-gradient(180deg, var(--surface-2), var(--bg-alt))", border: "1px solid var(--line)" }}>
                    <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Signed by</div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 32, fontStyle: "italic", color: "var(--ink)", borderBottom: "1px solid var(--ink)", display: "inline-block", paddingBottom: 4, paddingRight: 40 }}>
                      {form.signature}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
                      Signed on {new Date(form.signDate).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })} · IP 192.0.2.14 · Audit ID NP-SIG-{Math.floor(Math.random()*900000+100000)}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-section" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <label style={{ display: "flex", gap: 10, alignItems: "start", cursor: "pointer", fontSize: 13, color: "var(--ink-2)" }}>
                  <input type="checkbox" checked={form.msa} onChange={e => up("msa", e.target.checked)} style={{ marginTop: 3 }}/>
                  <span>I have read and agree to the <u>Master Services Agreement</u> and <u>Data Processing Addendum</u>.</span>
                </label>
                {errors.msa && <div style={{ fontSize: 11, color: "var(--danger)", marginLeft: 22 }}>{errors.msa}</div>}
                <label style={{ display: "flex", gap: 10, alignItems: "start", cursor: "pointer", fontSize: 13, color: "var(--ink-2)" }}>
                  <input type="checkbox" checked={form.terms} onChange={e => up("terms", e.target.checked)} style={{ marginTop: 3 }}/>
                  <span>I authorise NexaPoint ERP Ltd. to charge the amount above and enter the Customer into this binding agreement.</span>
                </label>
                {errors.terms && <div style={{ fontSize: 11, color: "var(--danger)", marginLeft: 22 }}>{errors.terms}</div>}
              </div>
            </>
          )}

          <div className="form-foot">
            <div className="secure-note"><Icon.Lock/> 256-bit TLS · PCI DSS L1 · UK GDPR</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>Total due today</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 24 }}>{fmtMoney(totalDueUSD, currency)}</div>
              </div>
              {stage < 3
                ? <button className="btn btn-primary btn-lg" onClick={next}>Continue <Icon.Arrow/></button>
                : <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting}>{submitting ? "Submitting…" : <>Sign & place order <Icon.Arrow/></>}</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Receipt ----------
const MultiReceipt = ({ cart, form, currency, orderRef, orderDate, onTrack, onNewOrder }) => {
  const totals = calcCartTotals(cart);
  const taxUSD = (totals.oneTime + totals.impl + totals.monthly * 12) * 0.08;
  const grandTotalUSD = totals.year1 + taxUSD;

  return (
    <div className="page page-enter">
      <div className="success-banner">
        <div className="check"><Icon.Check s={18}/></div>
        <div>
          <div className="t">Order confirmed — thank you, {(form.contact || "").split(" ")[0] || "there"}.</div>
          <div className="s">Confirmation sent to <strong>{form.email}</strong>. KYC passed; dispatch within 2 business days.</div>
        </div>
      </div>

      <div className="invoice">
        <div className="inv-top">
          <div>
            <div className="brand">
              <div className="brand-mark"/>
              <div>
                <h1>Invoice</h1>
                <p>NexaPoint ERP Ltd. · Order confirmation</p>
              </div>
            </div>
          </div>
          <div className="ref-block">
            <span className="k">Invoice no.</span><span className="v">{orderRef}</span>
            <span className="k">Issued</span><span className="v" style={{ fontSize: 14 }}>{orderDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
            <span className="k">Status</span><span className="v" style={{ fontSize: 14, color: "#7fe2b0" }}>● Paid</span>
          </div>
        </div>

        <div className="inv-parties">
          <div>
            <div className="party-label">Billed to</div>
            <div className="party-name">{form.company}</div>
            <div className="party-detail">
              {form.contact} · {form.role}<br/>
              {form.address}<br/>
              {form.city}, {form.postal}<br/>
              {form.country}<br/>
              {form.email}<br/>
              Reg № {form.companyReg}
            </div>
          </div>
          <div>
            <div className="party-label">From</div>
            <div className="party-name">NexaPoint ERP Ltd.</div>
            <div className="party-detail">
              22 Finsbury Square, Floor 6<br/>
              London EC2A 1DX, United Kingdom<br/>
              VAT GB 382 194 552<br/>
              billing@nexapoint.io
            </div>
          </div>
        </div>

        <div className="inv-body">
          <table className="inv-table">
            <thead><tr><th>Description</th><th className="num">Qty</th><th className="num">Unit</th><th className="num">Amount</th></tr></thead>
            <tbody>
              {cart.map((item, bi) => [
                <tr key={`bh-${bi}`} style={{ background: "var(--bg-alt)" }}>
                  <td colSpan="4" style={{ padding: "10px 14px", fontFamily: "var(--serif)", fontSize: 14, color: "var(--ink)", borderLeft: `3px solid ${item.accent}` }}>
                    {item.isCustom ? "Custom" : "Bundle"} {bi + 1} · {item.bundleName}
                  </td>
                </tr>,
                ...(item.devices || []).map(l => {
                  const d = DEVICES.find(x => x.id === l.deviceId);
                  if (!d) return null;
                  return (
                    <tr key={`d-${bi}-${l.deviceId}`}>
                      <td><div className="item-name">{d.name}</div><div className="item-desc">{d.subtitle} · {d.specs.join(", ")}</div></td>
                      <td className="num">{l.qty}</td>
                      <td className="num">{fmtMoney(d.price, currency)}</td>
                      <td className="num">{fmtMoney(d.price * l.qty, currency)}</td>
                    </tr>
                  );
                }),
                item.simId && (() => {
                  const s = SIMS.find(x => x.id === item.simId);
                  return s ? (
                    <tr key={`s-${bi}`}>
                      <td><div className="item-name">{s.name}</div><div className="item-desc">{s.tag} · MVNO SIM · 12-month contract</div></td>
                      <td className="num">{item.simQty} × 12 mo</td>
                      <td className="num">{fmtMoney(s.monthly, currency)}</td>
                      <td className="num">{fmtMoney(s.monthly * 12 * item.simQty, currency)}</td>
                    </tr>
                  ) : null;
                })(),
                ...(item.simLines || []).map(l => {
                  const s = SIMS.find(x => x.id === l.simId);
                  if (!s) return null;
                  return (
                    <tr key={`sl-${bi}-${l.simId}`}>
                      <td><div className="item-name">{s.name}</div><div className="item-desc">{s.tag} · MVNO SIM · 12-month contract</div></td>
                      <td className="num">{l.qty} × 12 mo</td>
                      <td className="num">{fmtMoney(s.monthly, currency)}</td>
                      <td className="num">{fmtMoney(s.monthly * 12 * l.qty, currency)}</td>
                    </tr>
                  );
                }),
                ...(item.softwareIds || []).map(id => {
                  const s = SOFTWARE.find(x => x.id === id);
                  if (!s) return null;
                  return (
                    <tr key={`sw-${bi}-${id}`}>
                      <td><div className="item-name">{s.name}</div><div className="item-desc">{s.tag} · 12-month subscription · {form.deployment === "cloud" ? "Cloud-hosted" : "On-premise"}</div></td>
                      <td className="num">12 mo</td>
                      <td className="num">{fmtMoney(s.monthly, currency)}</td>
                      <td className="num">{fmtMoney(s.monthly * 12, currency)}</td>
                    </tr>
                  );
                }),
              ]).flat().filter(Boolean)}
              <tr>
                <td><div className="item-name">Implementation & onboarding</div><div className="item-desc">Discovery, configuration, data migration, user training, hypercare</div></td>
                <td className="num">1</td>
                <td className="num">{fmtMoney(totals.impl, currency)}</td>
                <td className="num">{fmtMoney(totals.impl, currency)}</td>
              </tr>
            </tbody>
          </table>

          <div className="inv-totals">
            <div className="note">
              <strong style={{ color: "var(--ink)" }}>Signed electronically.</strong> By {form.signature || form.contact} on {new Date(form.signDate || orderDate).toLocaleDateString()}. KYC verified via Onfido. Payment via {
                form.payment === "card" ? `card ending ${(form.cardNum || "").slice(-4)}` :
                form.payment === "wire" ? "bank wire" :
                form.payment === "creditsafe" ? `CreditSafe finance · ${form.csTerm || 36}-month plan` :
                "PO · Net 30"
              }.
              {form.payment === "creditsafe" && form.csApproved && (() => {
                const term = form.csTerm || 36;
                const apr = term <= 12 ? 0.069 : term <= 24 ? 0.079 : term <= 36 ? 0.089 : term <= 48 ? 0.099 : 0.109;
                const r = apr / 12;
                const monthly = grandTotalUSD * (r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1);
                return (
                  <div style={{ marginTop: 14, padding: 14, background: "color-mix(in srgb, var(--brand) 6%, var(--surface))", borderRadius: 8, border: "1px solid color-mix(in srgb, var(--brand) 18%, var(--line))" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                      <strong style={{ fontFamily: "var(--serif)", color: "var(--ink)", fontSize: 14 }}>CreditSafe finance plan</strong>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>APR {(apr * 100).toFixed(1)}% fixed</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, fontSize: 12, color: "var(--ink-2)" }}>
                      <div><div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>Monthly</div><div style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--ink)" }}>{fmtMoney(monthly, currency)}</div></div>
                      <div><div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>Term</div><div style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--ink)" }}>{term} months</div></div>
                      <div><div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>First payment</div><div style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--ink)" }}>30 days</div></div>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="box">
              <dl>
                <dt>Hardware</dt><dd>{fmtMoney(totals.oneTime, currency)}</dd>
                <dt>Annual subscriptions</dt><dd>{fmtMoney(totals.monthly * 12, currency)}</dd>
                <dt>Implementation</dt><dd>{fmtMoney(totals.impl, currency)}</dd>
                <dt>VAT / sales tax (8%)</dt><dd>{fmtMoney(taxUSD, currency)}</dd>
                <div className="grand"><span className="k">Total</span><span className="v">{fmtMoney(grandTotalUSD, currency)}</span></div>
              </dl>
            </div>
          </div>
        </div>

        <div className="inv-foot">
          <div><div className="k">Order reference</div><div className="v">{orderRef}</div></div>
          <div><div className="k">Deployment</div><div className="v">{form.deployment === "cloud" ? "NexaPoint Cloud" : "On-premise"}</div></div>
          <div><div className="k">Kickoff</div><div className="v">Within 2 business days</div></div>
        </div>
      </div>

      <div className="action-row">
        <button className="btn btn-primary btn-lg" onClick={onTrack}>Track your order <Icon.Arrow/></button>
        <a className="btn btn-ghost btn-lg" href="confirmation-email.html" target="_blank"><Icon.Mail/> View confirmation email</a>
        <button className="btn btn-ghost btn-lg" onClick={() => window.print()}><Icon.Print/> Print receipt</button>
        <button className="btn btn-ghost btn-lg" onClick={onNewOrder}>Start new order</button>
      </div>
    </div>
  );
};

// ---------- Order Tracker ----------
const OrderTracker = ({ cart, form, orderRef, orderDate, onBack, currency, adminView, onToggleAdmin }) => {
  // Sequential stages
  const stages = [
    { id: "placed",    title: "Order placed",         desc: "Received and logged in your account",                     done: true },
    { id: "credit",    title: "KYC & credit approved", desc: "Director ID verified via Onfido · credit check passed",  done: true },
    { id: "signed",    title: "Agreement e-signed",   desc: `Signed by ${form.signature || form.contact} · archived`,  done: true },
    { id: "dispatch",  title: "Dispatch scheduled",   desc: "Hardware packed · courier label printed",                 done: true, current: true },
    { id: "shipped",   title: "Out for delivery",     desc: "Tracking: DHL 1Z999AA10123456784",                        done: false },
    { id: "delivered", title: "Delivered & activated", desc: "Zero-touch provisioning triggers on first boot",         done: false },
  ];
  const totals = calcCartTotals(cart);

  return (
    <div className="page page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <button className="btn btn-ghost" onClick={onBack}><Icon.Back/> Back to receipt</button>
        <button className="btn btn-ghost" onClick={onToggleAdmin}>
          {adminView ? "👤 Customer view" : "🛠 Switch to Ops view"}
        </button>
      </div>

      <div className="hero" style={{ gridTemplateColumns: "1fr auto", paddingBottom: 24 }}>
        <div>
          <div className="eyebrow">{adminView ? "Ops dashboard" : "Order status"}</div>
          <h1 style={{ marginTop: 12 }}>{adminView ? <>Dispatch <em style={{ fontStyle: "italic", color: "var(--accent-2)" }}>queue</em></> : <>Your <em style={{ fontStyle: "italic", color: "var(--accent-2)" }}>order</em>, in progress</>}</h1>
          <p style={{ marginTop: 12, maxWidth: 560 }}>
            {adminView ? "Internal operations view — approve, print labels and trigger dispatch." : "We'll email updates at every stage. Expected delivery within 3–5 business days."}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)" }}>Reference</div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 22 }}>{orderRef}</div>
        </div>
      </div>

      {!adminView ? (
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 32, marginTop: 32 }}>
          {/* Tracker */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: 40 }}>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: 20, marginBottom: 24 }}>Progress</h3>
            <div style={{ position: "relative" }}>
              {stages.map((s, i) => (
                <div key={s.id} style={{ display: "grid", gridTemplateColumns: "40px 1fr auto", gap: 16, paddingBottom: i < stages.length - 1 ? 28 : 0, position: "relative" }}>
                  {i < stages.length - 1 && (
                    <div style={{ position: "absolute", left: 19, top: 32, bottom: -4, width: 2, background: s.done ? "var(--success)" : "var(--line)" }}/>
                  )}
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: s.done ? "var(--success)" : s.current ? "var(--ink)" : "var(--surface)",
                    border: s.done ? "none" : s.current ? "none" : "1.5px solid var(--line-2)",
                    color: s.done || s.current ? "#fff" : "var(--muted)",
                    display: "grid", placeItems: "center", fontWeight: 600, fontSize: 13, zIndex: 1, position: "relative",
                  }}>
                    {s.done ? <Icon.Check s={16}/> : s.current ? <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#fff", animation: "pulse 2s infinite" }}/> : i + 1}
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 16, color: s.done || s.current ? "var(--ink)" : "var(--muted)" }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{s.desc}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".06em", textTransform: "uppercase", whiteSpace: "nowrap", alignSelf: "start", marginTop: 4 }}>
                    {s.done ? "✓ Done" : s.current ? "In progress" : "Pending"}
                  </div>
                </div>
              ))}
            </div>
            <style dangerouslySetInnerHTML={{ __html: "@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .4 } }" }}/>
          </div>

          {/* Summary */}
          <div className="side-card" style={{ position: "static" }}>
            <h3>Shipping to</h3>
            <div className="sub">{form.company}</div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, padding: "10px 0", borderBottom: "1px dashed var(--line)" }}>
              {form.contact}<br/>{form.address}<br/>{form.city}, {form.postal}<br/>{form.country}
            </div>
            <div style={{ padding: "14px 0", borderBottom: "1px dashed var(--line)", fontSize: 13 }}>
              <div style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>Courier</div>
              <div>DHL Express · 1Z999AA10123456784</div>
            </div>
            <div style={{ padding: "14px 0", fontSize: 13 }}>
              <div style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>Expected</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 16 }}>{new Date(orderDate.getTime() + 4*86400000).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</div>
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 10 }}>Contact support</button>
          </div>
        </div>
      ) : (
        /* Admin / Ops view */
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", overflow: "hidden", marginTop: 24 }}>
          <div style={{ padding: "18px 28px", background: "var(--ink)", color: "var(--bg)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            <div><div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", opacity: .6 }}>Open orders</div><div style={{ fontFamily: "var(--serif)", fontSize: 24 }}>14</div></div>
            <div><div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", opacity: .6 }}>Dispatch today</div><div style={{ fontFamily: "var(--serif)", fontSize: 24 }}>6</div></div>
            <div><div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", opacity: .6 }}>Awaiting KYC</div><div style={{ fontFamily: "var(--serif)", fontSize: 24 }}>2</div></div>
            <div><div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", opacity: .6 }}>Revenue MTD</div><div style={{ fontFamily: "var(--serif)", fontSize: 24 }}>{fmtMoney(totals.year1 * 8, currency)}</div></div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-alt)" }}>
                {["Ref", "Customer", "Items", "Stage", "Value", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 20px", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Current order, highlighted */}
              <tr style={{ background: "color-mix(in srgb, var(--accent) 8%, var(--surface))" }}>
                <td style={{ padding: "16px 20px", fontFamily: "var(--mono)", fontSize: 12, borderBottom: "1px solid var(--line)" }}>{orderRef} <span style={{ padding: "2px 6px", background: "var(--accent)", color: "#fff", borderRadius: 4, fontSize: 10, marginLeft: 6 }}>NEW</span></td>
                <td style={{ padding: "16px 20px", fontSize: 13, borderBottom: "1px solid var(--line)" }}><div style={{ fontFamily: "var(--serif)" }}>{form.company}</div><div style={{ color: "var(--muted)", fontSize: 11 }}>{form.email}</div></td>
                <td style={{ padding: "16px 20px", fontSize: 12, color: "var(--muted)", borderBottom: "1px solid var(--line)" }}>{cart.length} bundle{cart.length > 1 ? "s" : ""} · {cart.reduce((a, it) => a + (it.devices || []).reduce((b, l) => b + l.qty, 0), 0)} device{cart.reduce((a, it) => a + (it.devices || []).reduce((b, l) => b + l.qty, 0), 0) !== 1 ? "s" : ""}</td>
                <td style={{ padding: "16px 20px", fontSize: 12, borderBottom: "1px solid var(--line)" }}><span style={{ padding: "3px 10px", background: "var(--ink)", color: "var(--bg)", borderRadius: 999, fontSize: 11 }}>● Dispatch</span></td>
                <td style={{ padding: "16px 20px", fontFamily: "var(--serif)", fontSize: 14, borderBottom: "1px solid var(--line)" }}>{fmtMoney(totals.year1, currency)}</td>
                <td style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
                  <button className="btn btn-primary" style={{ padding: "6px 14px", fontSize: 12 }}>Print label</button>
                </td>
              </tr>
              {/* Fake other rows */}
              {[
                { ref: "NP-2026-48270", co: "Riverside Logistics", stage: "Shipped", stageColor: "#1b6b4a", items: "2 bundles · 4 devices", val: 8240 },
                { ref: "NP-2026-48269", co: "Harrow Medical Group", stage: "KYC review", stageColor: "#b8935a", items: "1 bundle · 12 devices", val: 24100 },
                { ref: "NP-2026-48268", co: "Delta Foods", stage: "Delivered", stageColor: "#5b6b86", items: "3 bundles · 18 devices", val: 51200 },
                { ref: "NP-2026-48267", co: "Baker & Kohl LLP", stage: "Signed", stageColor: "#16478f", items: "1 bundle · 6 devices", val: 12400 },
              ].map(r => (
                <tr key={r.ref}>
                  <td style={{ padding: "16px 20px", fontFamily: "var(--mono)", fontSize: 12, borderBottom: "1px solid var(--line)" }}>{r.ref}</td>
                  <td style={{ padding: "16px 20px", fontSize: 13, borderBottom: "1px solid var(--line)", fontFamily: "var(--serif)" }}>{r.co}</td>
                  <td style={{ padding: "16px 20px", fontSize: 12, color: "var(--muted)", borderBottom: "1px solid var(--line)" }}>{r.items}</td>
                  <td style={{ padding: "16px 20px", fontSize: 12, borderBottom: "1px solid var(--line)" }}><span style={{ padding: "3px 10px", background: r.stageColor, color: "#fff", borderRadius: 999, fontSize: 11 }}>● {r.stage}</span></td>
                  <td style={{ padding: "16px 20px", fontFamily: "var(--serif)", fontSize: 14, borderBottom: "1px solid var(--line)" }}>{fmtMoney(r.val, currency)}</td>
                  <td style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", fontSize: 12, color: "var(--muted)" }}>View</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ---------- Admin toast ----------
const AdminToast = ({ show, orderRef, onDismiss }) => {
  if (!show) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, left: 24, zIndex: 200,
      background: "var(--ink)", color: "var(--bg)", padding: "16px 20px",
      borderRadius: "var(--radius)", boxShadow: "var(--shadow-lg)",
      display: "flex", alignItems: "center", gap: 14, maxWidth: 380,
      animation: "slideIn .4s cubic-bezier(.2,.8,.2,1)",
    }}>
      <style dangerouslySetInnerHTML={{ __html: "@keyframes slideIn { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }" }}/>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent)", display: "grid", placeItems: "center", flexShrink: 0 }}>🛠</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 14 }}>Ops: new order queued</div>
        <div style={{ fontSize: 12, opacity: .7, marginTop: 2 }}>{orderRef} awaiting dispatch</div>
      </div>
      <button onClick={onDismiss} style={{ color: "var(--bg)", opacity: .6, padding: 4, cursor: "pointer", background: "none", border: "none" }}>✕</button>
    </div>
  );
};

Object.assign(window, { MultiCheckoutForm, MultiReceipt, OrderTracker, AdminToast });
