// Form + Receipt screens

const CheckoutForm = ({ device, deviceQty, software, selected, currency, onBack, onSubmit }) => {
  const qty = deviceQty || 1;
  const chosen = software.filter(s => selected.includes(s.id));
  const monthlyUSD = chosen.reduce((a, s) => a + s.monthly, 0);
  const implFeeUSD = 1500 + chosen.length * 600;
  const annualUSD = monthlyUSD * 12;
  const subtotalUSD = device.price * qty + implFeeUSD + annualUSD;

  const [form, setForm] = React.useState({
    company: "", contact: "", role: "", email: "", phone: "",
    address: "", city: "", country: "United States", postal: "",
    seats: "25", deployment: "cloud", payment: "card",
    cardName: "", cardNum: "", cardExp: "", cardCvc: "",
    terms: false,
  });
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);

  const up = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.company.trim()) e.company = "Company name is required";
    if (!form.contact.trim()) e.contact = "Contact person is required";
    if (!form.role.trim()) e.role = "Role is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid business email required";
    if (!/^[\d\s+\-()]{7,}$/.test(form.phone)) e.phone = "Valid phone required";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.postal.trim()) e.postal = "Postal code required";
    if (+form.seats < 1) e.seats = "At least 1 seat";
    if (form.payment === "card") {
      if (!form.cardName.trim()) e.cardName = "Name on card required";
      if (!/^\d[\d\s]{13,}$/.test(form.cardNum)) e.cardNum = "Valid card number";
      if (!/^\d{2}\/\d{2}$/.test(form.cardExp)) e.cardExp = "MM/YY";
      if (!/^\d{3,4}$/.test(form.cardCvc)) e.cardCvc = "CVC";
    }
    if (!form.terms) e.terms = "Please accept the terms";
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    setTimeout(() => { onSubmit(form); }, 900);
  };

  return (
    <div className="page page-enter">
      <button className="btn btn-ghost" style={{ marginBottom: 20 }} onClick={onBack}><Icon.Back/> Back to proposal</button>
      <div className="form-wrap">
        <div className="form-card">
          <div className="form-head">
            <div className="eyebrow">Step 04 · Checkout</div>
            <h1 style={{ marginTop: 10, fontSize: 38 }}>Complete your order</h1>
            <p style={{ marginTop: 10, maxWidth: 600 }}>Fill in your organization's details — we'll provision your {device.name} and schedule kickoff within 2 business days.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <div className="form-section-title">Organization</div>
              <div className="field-grid">
                <div className={"field" + (errors.company ? " has-error" : "")}>
                  <label>Company name <span className="req">*</span></label>
                  <input value={form.company} onChange={e => up("company", e.target.value)} placeholder="Acme Industries Ltd."/>
                  <span className="err">{errors.company}</span>
                </div>
                <div className={"field" + (errors.seats ? " has-error" : "")}>
                  <label>Team size / seats <span className="req">*</span></label>
                  <input type="number" min="1" value={form.seats} onChange={e => up("seats", e.target.value)}/>
                  <span className="err">{errors.seats}</span>
                </div>
                <div className={"field" + (errors.contact ? " has-error" : "")}>
                  <label>Contact person <span className="req">*</span></label>
                  <input value={form.contact} onChange={e => up("contact", e.target.value)} placeholder="Jane Doe"/>
                  <span className="err">{errors.contact}</span>
                </div>
                <div className={"field" + (errors.role ? " has-error" : "")}>
                  <label>Role / title <span className="req">*</span></label>
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
                  <input value={form.phone} onChange={e => up("phone", e.target.value)} placeholder="+1 555 234 5678"/>
                  <span className="err">{errors.phone}</span>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">Billing address</div>
              <div className="field-grid full">
                <div className={"field" + (errors.address ? " has-error" : "")}>
                  <label>Street address <span className="req">*</span></label>
                  <input value={form.address} onChange={e => up("address", e.target.value)} placeholder="1 Infinite Loop, Suite 400"/>
                  <span className="err">{errors.address}</span>
                </div>
              </div>
              <div className="field-grid" style={{ marginTop: 14, gridTemplateColumns: "2fr 1fr 1fr" }}>
                <div className={"field" + (errors.city ? " has-error" : "")}>
                  <label>City <span className="req">*</span></label>
                  <input value={form.city} onChange={e => up("city", e.target.value)} placeholder="Cupertino"/>
                  <span className="err">{errors.city}</span>
                </div>
                <div className="field">
                  <label>Country</label>
                  <select value={form.country} onChange={e => up("country", e.target.value)}>
                    <option>United States</option><option>United Kingdom</option>
                    <option>Germany</option><option>France</option>
                    <option>Pakistan</option><option>India</option>
                    <option>United Arab Emirates</option><option>Singapore</option>
                  </select>
                </div>
                <div className={"field" + (errors.postal ? " has-error" : "")}>
                  <label>Postal code <span className="req">*</span></label>
                  <input value={form.postal} onChange={e => up("postal", e.target.value)} placeholder="95014"/>
                  <span className="err">{errors.postal}</span>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">Deployment preference</div>
              <div className="radio-row">
                <div className={"radio-card" + (form.deployment === "cloud" ? " active" : "")} onClick={() => up("deployment", "cloud")}>
                  <div className="r-dot"/>
                  <div>
                    <div className="r-title">Cloud-hosted</div>
                    <div className="r-desc">Fully managed on NexaPoint Cloud · fastest go-live · SOC 2 Type II</div>
                  </div>
                </div>
                <div className={"radio-card" + (form.deployment === "onprem" ? " active" : "")} onClick={() => up("deployment", "onprem")}>
                  <div className="r-dot"/>
                  <div>
                    <div className="r-title">On-premise</div>
                    <div className="r-desc">Self-hosted on your infrastructure · full data residency control</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">Payment method</div>
              <div className="pay-row">
                {[
                  { id: "card", title: "Credit / debit card", desc: "Charged immediately" },
                  { id: "wire", title: "Bank wire transfer", desc: "Invoice within 24h" },
                  { id: "po", title: "Purchase order", desc: "Net 30 terms" },
                ].map(p => (
                  <div key={p.id} className={"radio-card" + (form.payment === p.id ? " active" : "")} onClick={() => up("payment", p.id)}>
                    <div className="r-dot"/>
                    <div>
                      <div className="r-title">{p.title}</div>
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
                      <input value={form.cardName} onChange={e => up("cardName", e.target.value)} placeholder="Jane A. Doe"/>
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
                      <input value={form.cardCvc} onChange={e => up("cardCvc", e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="123"/>
                      <span className="err">{errors.cardCvc}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-section">
              <label style={{ display: "flex", gap: 10, alignItems: "start", cursor: "pointer", fontSize: 13, color: "var(--ink-2)" }}>
                <input type="checkbox" checked={form.terms} onChange={e => up("terms", e.target.checked)} style={{ marginTop: 3 }}/>
                <span>I accept the <u>Master Services Agreement</u>, <u>Data Processing Addendum</u>, and authorize NexaPoint ERP Ltd. to charge the amount above.</span>
              </label>
              {errors.terms && <div style={{ fontSize: 11, color: "var(--danger)", marginTop: 4, marginLeft: 22 }}>{errors.terms}</div>}
            </div>

            <div className="form-foot">
              <div className="secure-note"><Icon.Lock/> 256-bit TLS encryption · PCI DSS Level 1</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>Total due today</div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 24 }}>{fmtMoney(subtotalUSD * 1.08, currency)}</div>
                </div>
                <button className="btn btn-primary btn-lg" type="submit" disabled={submitting}>
                  {submitting ? "Processing…" : <>Complete order <Icon.Arrow/></>}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Receipt = ({ device, deviceQty, software, selected, form, currency, orderRef, orderDate, onNewOrder }) => {
  const qty = deviceQty || 1;
  const chosen = software.filter(s => selected.includes(s.id));
  const monthlyUSD = chosen.reduce((a, s) => a + s.monthly, 0);
  const implFeeUSD = 1500 + chosen.length * 600;
  const annualUSD = monthlyUSD * 12;
  const subtotalUSD = device.price * qty + implFeeUSD + annualUSD;
  const taxUSD = subtotalUSD * 0.08;
  const totalUSD = subtotalUSD + taxUSD;

  return (
    <div className="page page-enter">
      <div className="success-banner">
        <div className="check"><Icon.Check s={18}/></div>
        <div>
          <div className="t">Order confirmed — thank you, {form.contact.split(" ")[0] || "there"}.</div>
          <div className="s">A confirmation email has been sent to <strong>{form.email}</strong>. Expect provisioning kickoff within 2 business days.</div>
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
            <span className="k">Invoice no.</span>
            <span className="v">{orderRef}</span>
            <span className="k">Issued</span>
            <span className="v" style={{ fontSize: 14 }}>{orderDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
            <span className="k">Status</span>
            <span className="v" style={{ fontSize: 14, color: "#7fe2b0" }}>● Paid</span>
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
              {form.email}
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
            <thead>
              <tr><th>Description</th><th className="num">Qty</th><th className="num">Unit</th><th className="num">Amount</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="item-name">{device.name}{qty > 1 ? ` × ${qty} units` : ""}</div>
                  <div className="item-desc">{device.subtitle} · {device.specs.join(", ")} · pre-configured with NexaPoint OS</div>
                </td>
                <td className="num">{qty}</td>
                <td className="num">{fmtMoney(device.price, currency)}</td>
                <td className="num">{fmtMoney(device.price * qty, currency)}</td>
              </tr>
              {chosen.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="item-name">{s.name}</div>
                    <div className="item-desc">{s.tag} module · {form.seats} seats · 12-month subscription · {form.deployment === "cloud" ? "Cloud-hosted" : "On-premise"}</div>
                  </td>
                  <td className="num">12 mo</td>
                  <td className="num">{fmtMoney(s.monthly, currency)}</td>
                  <td className="num">{fmtMoney(s.monthly * 12, currency)}</td>
                </tr>
              ))}
              <tr>
                <td>
                  <div className="item-name">Implementation & onboarding</div>
                  <div className="item-desc">Discovery, configuration, data migration, user training, hypercare</div>
                </td>
                <td className="num">1</td>
                <td className="num">{fmtMoney(implFeeUSD, currency)}</td>
                <td className="num">{fmtMoney(implFeeUSD, currency)}</td>
              </tr>
            </tbody>
          </table>

          <div className="inv-totals">
            <div className="note">
              <strong style={{ color: "var(--ink)" }}>Payment terms.</strong> Paid via {form.payment === "card" ? "credit card ending in " + (form.cardNum.slice(-4) || "••••") : form.payment === "wire" ? "bank wire transfer" : "purchase order (Net 30)"}. Year 2 renewal auto-invoiced 30 days prior. Questions? Reply to your confirmation email or write to <u>billing@nexapoint.io</u>.
            </div>
            <div className="box">
              <dl>
                <dt>Subtotal</dt><dd>{fmtMoney(subtotalUSD, currency)}</dd>
                <dt>VAT / sales tax (8%)</dt><dd>{fmtMoney(taxUSD, currency)}</dd>
                <div className="grand">
                  <span className="k">Total</span>
                  <span className="v">{fmtMoney(totalUSD, currency)}</span>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="inv-foot">
          <div>
            <div className="k">Order reference</div>
            <div className="v">{orderRef}</div>
          </div>
          <div>
            <div className="k">Deployment</div>
            <div className="v">{form.deployment === "cloud" ? "NexaPoint Cloud" : "On-premise"}</div>
          </div>
          <div>
            <div className="k">Kickoff</div>
            <div className="v">Within 2 business days</div>
          </div>
        </div>
      </div>

      <div className="action-row">
        <a className="btn btn-ghost btn-lg" href="confirmation-email.html" target="_blank"><Icon.Mail/> View confirmation email</a>
        <button className="btn btn-ghost btn-lg" onClick={() => window.print()}><Icon.Print/> Print receipt</button>
        <button className="btn btn-primary btn-lg" onClick={onNewOrder}>Start new order <Icon.Arrow/></button>
      </div>
    </div>
  );
};

Object.assign(window, { CheckoutForm, Receipt });
