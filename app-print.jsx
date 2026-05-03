// Print-mode App — renders all 5 screens stacked, each on its own page.
const { useState, useEffect } = React;

const DEMO_FORM = {
  company: "Acme Industries Ltd.",
  contact: "Jane Doe", role: "Chief Financial Officer",
  email: "jane.doe@acme.com", phone: "+1 555 234 5678",
  address: "1 Infinite Loop, Suite 400", city: "Cupertino", country: "United States", postal: "95014",
  seats: "25", deployment: "cloud", payment: "card",
  cardName: "Jane A. Doe", cardNum: "4242 4242 4242 4242", cardExp: "04/28", cardCvc: "123",
  terms: true,
};

function PrintApp() {
  const device = DEVICES.find(d => d.id === "mbp16");
  const selected = ["erp", "bms", "bi"];
  const currency = "USD";
  const orderRef = "NP-2026-48271";
  const proposalRef = "PR-2026-3814";
  const orderDate = new Date();

  const pageStyle = { pageBreakAfter: "always", breakAfter: "page", minHeight: "auto" };

  return (
    <div className="app-shell print-mode">
      <div className="print-page" style={pageStyle}>
        <Nav step="devices" cartCount={0} onGoHome={() => {}} onOpenTweaks={() => {}}/>
        <DeviceCatalog devices={DEVICES} onPick={() => {}} currency={currency} categoryFilter="all" setCategoryFilter={() => {}}/>
      </div>

      <div className="print-page" style={pageStyle}>
        <Nav step="software" cartCount={selected.length} onGoHome={() => {}} onOpenTweaks={() => {}}/>
        <SoftwareCatalog device={device} software={SOFTWARE} selected={selected} toggle={() => {}} onBack={() => {}} onNext={() => {}} currency={currency}/>
      </div>

      <div className="print-page" style={pageStyle}>
        <Nav step="proposal" cartCount={selected.length} onGoHome={() => {}} onOpenTweaks={() => {}}/>
        <Proposal device={device} software={SOFTWARE} selected={selected} onBack={() => {}} onAccept={() => {}} currency={currency} proposalRef={proposalRef}/>
      </div>

      <div className="print-page" style={pageStyle}>
        <Nav step="form" cartCount={selected.length} onGoHome={() => {}} onOpenTweaks={() => {}}/>
        <CheckoutForm device={device} software={SOFTWARE} selected={selected} currency={currency} onBack={() => {}} onSubmit={() => {}}/>
      </div>

      <div className="print-page" style={{ ...pageStyle, pageBreakAfter: "auto", breakAfter: "auto" }}>
        <Nav step="receipt" cartCount={selected.length} onGoHome={() => {}} onOpenTweaks={() => {}}/>
        <Receipt device={device} software={SOFTWARE} selected={selected} form={DEMO_FORM} currency={currency} orderRef={orderRef} orderDate={orderDate} onNewOrder={() => {}}/>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<PrintApp/>);

// Auto-print once fonts and layout are ready
(async () => {
  try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch {}
  await new Promise(r => setTimeout(r, 800));
  window.print();
})();
