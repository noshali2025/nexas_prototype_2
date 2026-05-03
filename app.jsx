// Main App — multi-product cart with bundles, KYC, e-sig, tracker, admin

const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "currency": "USD"
}/*EDITMODE-END*/;

function App() {
  const [theme, setTheme] = useState(TWEAK_DEFAULTS.theme);
  const [currency, setCurrency] = useState(TWEAK_DEFAULTS.currency);

  const [step, setStep] = useState(() => localStorage.getItem("np_step") || "bundles");
  const [activeBundle, setActiveBundle] = useState(null);
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("np_cart")) || []; } catch { return []; }
  });
  const [form, setForm] = useState(null);
  const [adminView, setAdminView] = useState(false);
  const [toast, setToast] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [orderRef] = useState(() => "NP-" + new Date().getFullYear() + "-" + Math.floor(10000 + Math.random() * 90000));
  const [orderDate] = useState(() => new Date());

  useEffect(() => { localStorage.setItem("np_step", step); }, [step]);
  useEffect(() => { localStorage.setItem("np_cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);

  const persistTweak = (edits) => window.parent.postMessage({ type: "__edit_mode_set_keys", edits }, "*");
  const toggleTheme = () => { const t = theme === "dark" ? "light" : "dark"; setTheme(t); persistTweak({ theme: t }); };

  const handlePortalLogin = (email, destination) => {
    if (destination === "superadmin") {
      sessionStorage.setItem("np_portal_auth", JSON.stringify({ email, name: "System Super Admin", role: "Super Administrator", type: "superadmin" }));
      window.location.href = "superadmin.html";
      return;
    }
    if (destination === "admin") {
      sessionStorage.setItem("np_portal_auth", JSON.stringify({ email, name: "System Administrator", role: "Administrator", type: "admin" }));
      window.location.href = "admin.html";
      return;
    }
    if (destination === "credit") {
      sessionStorage.setItem("np_portal_auth", JSON.stringify({ email, name: "Olivia Reed", role: "Credit & Compliance Manager", type: "credit" }));
      window.location.href = "credit.html";
      return;
    }
    const isEng = destination === "engineer";
    sessionStorage.setItem("np_portal_auth", JSON.stringify({
      email,
      name:  isEng ? "Sarah Chen"               : "Operations Manager",
      role:  isEng ? "Lead Implementation Engineer" : "Ops Manager",
      type:  destination,
    }));
    window.location.href = isEng ? "engineer.html" : "portal.html";
  };

  const reset = () => {
    setStep("bundles"); setActiveBundle(null); setCart([]); setForm(null); setAdminView(false);
    localStorage.removeItem("np_step"); localStorage.removeItem("np_cart");
  };

  const persistOrder = (formData) => {
    const totals = calcCartTotals(cart);
    const payload = { orderRef, orderDate: orderDate.toISOString(), currency, cart, totals, form: formData };
    localStorage.setItem("np_last_order", JSON.stringify(payload));
  };

  let screen;
  if (step === "bundles") {
    screen = <BundleCatalog
      onPickBundle={(b) => { setActiveBundle(b); setStep("configure"); window.scrollTo(0,0); }}
      onStartManual={() => { setStep("manual"); window.scrollTo(0,0); }}
      currency={currency}
    />;
  } else if (step === "manual") {
    screen = <ManualBuilder
      currency={currency}
      onBack={() => setStep("bundles")}
      onAddToCart={(item) => { setCart(c => [...c, item]); setStep("cart"); window.scrollTo(0,0); }}
    />;
  } else if (step === "configure" && activeBundle) {
    screen = <BundleConfigurator
      bundle={activeBundle} currency={currency}
      onBack={() => setStep("bundles")}
      onAddToCart={(item) => { setCart(c => [...c, item]); setActiveBundle(null); setStep("cart"); window.scrollTo(0,0); }}
    />;
  } else if (step === "cart") {
    screen = <CartReview
      cart={cart} currency={currency}
      onRemove={(i) => setCart(c => c.filter((_, idx) => idx !== i))}
      onAddMore={() => setStep("bundles")}
      onCheckout={() => { setStep("checkout"); window.scrollTo(0,0); }}
    />;
  } else if (step === "checkout") {
    screen = <MultiCheckoutForm
      cart={cart} currency={currency}
      onBack={() => setStep("cart")}
      onSubmit={(f) => {
        setForm(f); persistOrder(f);
        setStep("receipt"); setToast(true);
        setTimeout(() => setToast(false), 6000);
        window.scrollTo(0,0);
      }}
    />;
  } else if (step === "receipt") {
    screen = <MultiReceipt
      cart={cart} form={form || {}} currency={currency} orderRef={orderRef} orderDate={orderDate}
      onTrack={() => { setStep("tracker"); window.scrollTo(0,0); }}
      onNewOrder={reset}
    />;
  } else if (step === "tracker") {
    screen = <OrderTracker
      cart={cart} form={form || {}} orderRef={orderRef} orderDate={orderDate} currency={currency}
      adminView={adminView} onToggleAdmin={() => setAdminView(v => !v)}
      onBack={() => setStep("receipt")}
    />;
  } else {
    screen = <BundleCatalog onPickBundle={(b) => { setActiveBundle(b); setStep("configure"); }} currency={currency}/>;
  }

  const cartCount = cart.length;

  return (
    <div className="app-shell">
      <Nav step={step} cartCount={cartCount} onGoHome={reset} theme={theme} onToggleTheme={toggleTheme} onPortalLogin={() => setShowLoginModal(true)}/>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onLogin={handlePortalLogin}/>}
      {screen}
      <AdminToast show={toast} orderRef={orderRef} onDismiss={() => setToast(false)}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
