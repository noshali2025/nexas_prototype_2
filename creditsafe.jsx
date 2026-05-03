// CreditSafe finance panel — eligibility, application, score reveal, monthly schedule

const CreditSafePanel = ({ form, up, totals, taxUSD, currency, errors }) => {
  const totalFinanceableUSD = totals.oneTime + totals.impl + (totals.monthly * 12) + taxUSD;
  // Money helper
  const m = (v) => fmtMoney(v, currency);

  // Eligibility derived from form (live)
  const annualRev = parseFloat((form.csAnnualRev || "").toString().replace(/[^0-9.]/g, "")) || 0;
  const yearsTrading = parseFloat(form.csYearsTrading || "0") || 0;
  const ccjs = form.csCcjs;

  const elig = {
    yearsOk: yearsTrading >= 2,
    revOk: annualRev >= 100000,
    ccjsOk: ccjs === "none" || ccjs === "discharged",
    consentOk: form.csConsent,
    regOk: !!form.companyReg && form.companyReg.length >= 6,
  };
  const eligibleScore = [elig.yearsOk, elig.revOk, elig.ccjsOk, elig.regOk].filter(Boolean).length;
  const isEligible = eligibleScore >= 3 && elig.regOk; // soft check: 3 of 4 + reg

  const term = form.csTerm || 36;
  // Stable APR derived from term, not random
  const apr = term <= 12 ? 0.069 : term <= 24 ? 0.079 : term <= 36 ? 0.089 : term <= 48 ? 0.099 : 0.109;
  const r = apr / 12;
  const monthly = totalFinanceableUSD * (r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1);
  const totalRepaid = monthly * term;
  const interestPaid = totalRepaid - totalFinanceableUSD;

  const [running, setRunning] = React.useState(false);
  const runCheck = () => {
    if (!isEligible) return;
    setRunning(true);
    setTimeout(() => {
      // Deterministic-ish score from eligibility
      const score = Math.min(98, 55 + eligibleScore * 8 + Math.min(yearsTrading, 8) * 2 + (annualRev > 500000 ? 6 : annualRev > 250000 ? 3 : 0));
      const limitUSD = Math.max(25000, Math.round((annualRev * 0.18) / 1000) * 1000);
      up("csScore", score);
      up("csLimit", limitUSD);
      up("csChecked", true);
      up("csApproved", score >= 65 && limitUSD >= totalFinanceableUSD);
      setRunning(false);
    }, 1700);
  };

  const resetCheck = () => {
    up("csChecked", false); up("csApproved", false); up("csScore", 0); up("csLimit", 0);
  };

  const band =
    form.csScore >= 85 ? { label: "Very low risk", c: "#1e7a4d" } :
    form.csScore >= 70 ? { label: "Low risk", c: "#2c8b4f" } :
    form.csScore >= 55 ? { label: "Below average risk", c: "#b8935a" } :
    { label: "Above average risk", c: "#a4471f" };

  const overLimit = form.csChecked && form.csLimit < totalFinanceableUSD;

  return (
    <div style={{ marginTop: 20, padding: 0, background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "18px 22px", background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%)", color: "#fff", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,.12)", display: "grid", placeItems: "center", border: "1px solid rgba(255,255,255,.2)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="6" width="18" height="13" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
            <path d="M7 15h2M12 15h5"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 17, fontWeight: 500 }}>CreditSafe Business Finance</div>
          <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>Spread your full order over fixed monthly instalments. No early repayment fees.</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", opacity: .7 }}>Powered by</div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 15, marginTop: 2 }}>creditsafe<span style={{ color: "var(--accent)" }}>.</span></div>
        </div>
      </div>

      {/* Eligibility checklist */}
      <div style={{ padding: "20px 22px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 15, color: "var(--ink)" }}>Eligibility criteria</div>
          <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".05em", textTransform: "uppercase" }}>Check before you apply</div>
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { ok: elig.regOk, label: "UK / EU registered company (CRN required)" },
            { ok: elig.yearsOk, label: "Trading for 2+ years" },
            { ok: elig.revOk, label: "Annual revenue ≥ $100,000" },
            { ok: elig.ccjsOk, label: "No active CCJs / undischarged insolvency" },
          ].map((it, i) => (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: it.ok ? "var(--ink)" : "var(--muted)" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: it.ok ? "#2c8b4f" : "var(--bg-alt)", display: "grid", placeItems: "center", color: "#fff", flexShrink: 0, border: it.ok ? "none" : "1px solid var(--line-2)" }}>
                {it.ok ? <Icon.Check s={12}/> : <span style={{ width: 6, height: 1.5, background: "var(--muted)" }}/>}
              </div>
              <span>{it.label}</span>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: isEligible ? "color-mix(in srgb, #2c8b4f 10%, var(--surface))" : "color-mix(in srgb, #b8935a 10%, var(--surface))", border: "1px solid " + (isEligible ? "color-mix(in srgb, #2c8b4f 25%, transparent)" : "color-mix(in srgb, #b8935a 30%, transparent)"), fontSize: 12, color: "var(--ink-2)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14 }}>{isEligible ? "✓" : "ℹ"}</span>
          <span>
            {isEligible
              ? "You meet the criteria. Complete the short application below to run a soft credit check."
              : "Fill in the fields below to confirm eligibility. A soft check has no impact on your business credit score."}
          </span>
        </div>
      </div>

      {/* Application form */}
      <div style={{ padding: "20px 22px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 15, color: "var(--ink)", marginBottom: 14 }}>Quick application</div>
        <div className="field-grid">
          <div className="field">
            <label>Annual revenue (USD) <span className="req">*</span></label>
            <input
              value={form.csAnnualRev || ""}
              onChange={e => up("csAnnualRev", e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="e.g. 750000"
              disabled={form.csChecked}
            />
          </div>
          <div className="field">
            <label>Years trading <span className="req">*</span></label>
            <input
              type="number" min="0" max="60" step="0.5"
              value={form.csYearsTrading || ""}
              onChange={e => up("csYearsTrading", e.target.value)}
              placeholder="e.g. 4.5"
              disabled={form.csChecked}
            />
          </div>
        </div>
        <div className="field-grid full" style={{ marginTop: 14 }}>
          <div className="field">
            <label>County Court Judgments (CCJs) <span className="req">*</span></label>
            <select value={form.csCcjs} onChange={e => up("csCcjs", e.target.value)} disabled={form.csChecked} style={{ height: 44, padding: "0 14px", borderRadius: 8, border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontFamily: "inherit", fontSize: 14 }}>
              <option value="none">None on record</option>
              <option value="discharged">Discharged / satisfied only</option>
              <option value="active">One or more active CCJs</option>
            </select>
          </div>
        </div>
        <label style={{ display: "flex", alignItems: "start", gap: 10, marginTop: 16, fontSize: 12, color: "var(--ink-2)", cursor: "pointer", lineHeight: 1.5 }}>
          <input
            type="checkbox" checked={!!form.csConsent}
            onChange={e => up("csConsent", e.target.checked)}
            disabled={form.csChecked}
            style={{ marginTop: 3 }}
          />
          <span>
            I authorise NexaPoint and CreditSafe to perform a <strong>soft credit search</strong> on the company and named director to assess affordability. This will <em>not</em> affect your credit rating. A hard search will only run if you proceed to sign the finance agreement on stage 3.
          </span>
        </label>
      </div>

      {/* Term selector + indicative monthly */}
      <div style={{ padding: "20px 22px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 15, color: "var(--ink)" }}>Choose your term</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Representative APR · interest fixed for term</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 16 }}>
          {[12, 24, 36, 48, 60].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => up("csTerm", t)}
              style={{
                padding: "12px 8px", borderRadius: 10,
                border: "1px solid " + (term === t ? "var(--brand)" : "var(--line-2)"),
                background: term === t ? "color-mix(in srgb, var(--brand) 8%, var(--surface))" : "var(--surface)",
                color: "var(--ink)", cursor: "pointer", textAlign: "center",
                transition: "all .15s ease",
              }}
            >
              <div style={{ fontFamily: "var(--serif)", fontSize: 17 }}>{t}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2, letterSpacing: ".05em", textTransform: "uppercase" }}>months</div>
            </button>
          ))}
        </div>

        {/* Monthly preview */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 0, padding: "16px 18px", background: "var(--bg-alt)", borderRadius: 10, border: "1px solid var(--line)" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>Monthly</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 28, color: "var(--ink)", marginTop: 4, lineHeight: 1 }}>{m(monthly)}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>for {term} months</div>
          </div>
          <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>APR</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--ink)", marginTop: 4 }}>{(apr * 100).toFixed(1)}%</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>fixed</div>
          </div>
          <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>Total interest</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--ink)", marginTop: 4 }}>{m(interestPaid)}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>over term</div>
          </div>
          <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>Total repayable</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--ink)", marginTop: 4 }}>{m(totalRepaid)}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>incl. interest</div>
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--muted)", textAlign: "right" }}>
          Financed amount: {m(totalFinanceableUSD)} (hardware + software annual + implementation + tax)
        </div>
      </div>

      {/* Run check / result */}
      <div style={{ padding: "22px", background: "var(--bg-alt)" }}>
        {!form.csChecked ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ fontSize: 12, color: "var(--muted)", maxWidth: 360 }}>
              We'll run an instant soft check using your CRN, director KYC, and the figures above. Decision in seconds.
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={runCheck}
              disabled={!isEligible || running}
              style={{ opacity: isEligible && !running ? 1 : .5, cursor: isEligible && !running ? "pointer" : "not-allowed" }}
            >
              {running ? (
                <>
                  <span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "cs-spin .8s linear infinite", marginRight: 8, verticalAlign: -1 }}/>
                  Running soft check…
                </>
              ) : (
                <>Run CreditSafe check <Icon.Arrow/></>
              )}
            </button>
          </div>
        ) : form.csApproved ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 16, borderBottom: "1px solid var(--line)" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#2c8b4f", display: "grid", placeItems: "center", color: "#fff" }}>
                <Icon.Check s={20}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--ink)" }}>Approved · pre-qualified</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  Conditional offer subject to final hard check at e-sign. Reference <code style={{ fontFamily: "var(--mono)", fontSize: 11 }}>CS-{Math.floor(Math.random() * 90000) + 10000}</code>
                </div>
              </div>
              <button type="button" onClick={resetCheck} style={{ background: "transparent", border: "1px solid var(--line-2)", color: "var(--ink-2)", padding: "8px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
                Re-run check
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.1fr", gap: 0, paddingTop: 16 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>Business credit score</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 36, color: band.c, lineHeight: 1 }}>{form.csScore}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>/ 100</div>
                </div>
                <div style={{ marginTop: 8, height: 6, borderRadius: 3, background: "var(--line)", overflow: "hidden" }}>
                  <div style={{ width: `${form.csScore}%`, height: "100%", background: band.c, transition: "width .6s ease" }}/>
                </div>
                <div style={{ fontSize: 11, color: band.c, marginTop: 6, fontWeight: 600 }}>{band.label}</div>
              </div>
              <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 18 }}>
                <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>Approved limit</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--ink)", marginTop: 6 }}>{m(form.csLimit)}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>across all NexaPoint products</div>
              </div>
              <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 18 }}>
                <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>You'll pay</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--brand)", marginTop: 6 }}>{m(monthly)} / mo</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>for {term} months · first payment 30 days after dispatch</div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 14, borderBottom: "1px solid var(--line)" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#a4471f", display: "grid", placeItems: "center", color: "#fff", fontSize: 22, fontFamily: "var(--serif)" }}>
                !
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--ink)" }}>
                  {overLimit ? "Approved — limit below order total" : "Unable to pre-qualify on these terms"}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2, maxWidth: 480 }}>
                  {overLimit
                    ? `Your CreditSafe limit (${m(form.csLimit)}) is below this order's financed amount (${m(totalFinanceableUSD)}). Reduce the order or part-pay the difference.`
                    : "Based on the soft check, we can't offer monthly finance on this order. You can pay by card, wire, or PO instead."}
                </div>
              </div>
              <button type="button" onClick={resetCheck} style={{ background: "transparent", border: "1px solid var(--line-2)", color: "var(--ink-2)", padding: "8px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
                Re-run
              </button>
            </div>
            <div style={{ paddingTop: 14, fontSize: 12, color: "var(--ink-2)" }}>
              <strong>Score returned:</strong> {form.csScore}/100 · <strong>Limit:</strong> {m(form.csLimit)}.
              Soft checks have no impact on your credit rating. Reference <code style={{ fontFamily: "var(--mono)", fontSize: 11 }}>CS-{Math.floor(Math.random() * 90000) + 10000}</code>.
            </div>
          </div>
        )}
        {errors.csApproved && (
          <div style={{ marginTop: 12, fontSize: 12, color: "#a4471f" }}>{errors.csApproved}</div>
        )}
      </div>
    </div>
  );
};

// CSS keyframes (injected once)
if (!document.getElementById("cs-keyframes")) {
  const s = document.createElement("style");
  s.id = "cs-keyframes";
  s.textContent = "@keyframes cs-spin { to { transform: rotate(360deg) } }";
  document.head.appendChild(s);
}

Object.assign(window, { CreditSafePanel });
