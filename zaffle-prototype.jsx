import { useState, useEffect, useMemo } from "react";

const COLORS = {
  ink: "#16213A",
  paper: "#F5F1E6",
  paper2: "#ECE5D3",
  forest: "#1F4D3A",
  forestDark: "#163826",
  brass: "#B8862E",
  clay: "#B5432D",
  line: "#DAD2BE",
  white: "#FFFFFF",
};

const LISTINGS = [
  {
    id: "l1",
    address: "1842 W 25th St",
    neighborhood: "Ohio City",
    city: "Cleveland",
    state: "OH",
    beds: 3,
    baths: 2,
    sqft: 1840,
    yearBuilt: 1911,
    features: ["Front porch", "Updated kitchen", "Near market district"],
    appraisedValue: 268000,
    minThreshold: 210000,
    poolSize: 10000,
    ticketsSold: 8210,
    accent: "forest",
    mapX: 34,
    mapY: 58,
    endsInMs: 1000 * 60 * 60 * 19,
    tiers: [
      { qty: 1, price: 20 },
      { qty: 3, price: 50 },
      { qty: 7, price: 100 },
    ],
  },
  {
    id: "l2",
    address: "3311 Fulton Rd",
    neighborhood: "Tremont",
    city: "Cleveland",
    state: "OH",
    beds: 4,
    baths: 2.5,
    sqft: 2210,
    yearBuilt: 1928,
    features: ["Two-car garage", "Renovated bath", "Walk to Lincoln Park"],
    appraisedValue: 312000,
    minThreshold: 250000,
    poolSize: 10000,
    ticketsSold: 3040,
    accent: "brass",
    mapX: 58,
    mapY: 40,
    endsInMs: 1000 * 60 * 60 * 24 * 6,
    tiers: [
      { qty: 1, price: 20 },
      { qty: 3, price: 50 },
      { qty: 7, price: 100 },
    ],
  },
  {
    id: "l3",
    address: "17490 Van Aken Blvd",
    neighborhood: "Shaker Heights",
    city: "Shaker Heights",
    state: "OH",
    beds: 5,
    baths: 3,
    sqft: 3120,
    yearBuilt: 1936,
    features: ["Slate roof", "Finished basement", "Corner lot"],
    appraisedValue: 415000,
    minThreshold: 340000,
    poolSize: 12000,
    ticketsSold: 11480,
    accent: "clay",
    mapX: 78,
    mapY: 62,
    endsInMs: 1000 * 60 * 55,
    tiers: [
      { qty: 1, price: 20 },
      { qty: 3, price: 50 },
      { qty: 7, price: 100 },
    ],
  },
  {
    id: "l4",
    address: "1502 Detroit Ave",
    neighborhood: "Detroit-Shoreway",
    city: "Cleveland",
    state: "OH",
    beds: 2,
    baths: 1,
    sqft: 1120,
    yearBuilt: 1902,
    features: ["Original woodwork", "Fenced yard", "Near the RTA line"],
    appraisedValue: 189000,
    minThreshold: 150000,
    poolSize: 8000,
    ticketsSold: 2210,
    accent: "forest",
    mapX: 22,
    mapY: 28,
    endsInMs: 1000 * 60 * 60 * 24 * 11,
    tiers: [
      { qty: 1, price: 20 },
      { qty: 3, price: 50 },
      { qty: 7, price: 100 },
    ],
  },
  {
    id: "l5",
    address: "2077 Lee Rd",
    neighborhood: "Cleveland Heights",
    city: "Cleveland Heights",
    state: "OH",
    beds: 4,
    baths: 2,
    sqft: 2450,
    yearBuilt: 1922,
    features: ["Sunroom", "Original tile", "Near Coventry Village"],
    appraisedValue: 298000,
    minThreshold: 235000,
    poolSize: 10000,
    ticketsSold: 6120,
    accent: "brass",
    mapX: 66,
    mapY: 22,
    endsInMs: 1000 * 60 * 60 * 24 * 2,
    tiers: [
      { qty: 1, price: 20 },
      { qty: 3, price: 50 },
      { qty: 7, price: 100 },
    ],
  },
  {
    id: "l6",
    address: "14209 Detroit Ave",
    neighborhood: "Lakewood",
    city: "Lakewood",
    state: "OH",
    beds: 3,
    baths: 1.5,
    sqft: 1560,
    yearBuilt: 1919,
    features: ["Steps to the lake", "Updated electric", "Built-ins"],
    appraisedValue: 224000,
    minThreshold: 180000,
    poolSize: 9000,
    ticketsSold: 4870,
    accent: "clay",
    mapX: 10,
    mapY: 12,
    endsInMs: 1000 * 60 * 60 * 24 * 4,
    tiers: [
      { qty: 1, price: 20 },
      { qty: 3, price: 50 },
      { qty: 7, price: 100 },
    ],
  },
];

function accentHex(name) {
  return COLORS[name] || COLORS.forest;
}

function money(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function useCountdown(endsInMs) {
  const target = useMemo(() => Date.now() + endsInMs, [endsInMs]);
  const [remaining, setRemaining] = useState(target - Date.now());
  useEffect(() => {
    const t = setInterval(() => setRemaining(Math.max(0, target - Date.now())), 1000);
    return () => clearInterval(t);
  }, [target]);
  const totalSec = Math.floor(remaining / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  return { days, hours, mins, secs, urgent: remaining < 1000 * 60 * 60 * 24 };
}

function HouseArt({ accent, size = 1 }) {
  const a = accentHex(accent);
  return (
    <svg viewBox="0 0 200 140" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect x="0" y="0" width="200" height="140" fill={COLORS.paper2} />
      <rect x="0" y="95" width="200" height="45" fill="#DFD6BC" />
      <rect x="50" y="60" width="100" height="60" fill={COLORS.white} stroke={COLORS.ink} strokeWidth="1.5" />
      <polygon points="42,62 100,20 158,62" fill={a} stroke={COLORS.ink} strokeWidth="1.5" />
      <rect x="93" y="88" width="14" height="32" fill={COLORS.ink} />
      <rect x="60" y="72" width="16" height="16" fill="#EAF2EE" stroke={COLORS.ink} strokeWidth="1" />
      <rect x="124" y="72" width="16" height="16" fill="#EAF2EE" stroke={COLORS.ink} strokeWidth="1" />
      <circle cx="170" cy="24" r="10" fill={COLORS.brass} opacity="0.85" />
      <rect x="18" y="100" width="6" height="30" fill={COLORS.forestDark} />
      <circle cx="21" cy="94" r="14" fill={COLORS.forest} opacity="0.9" />
    </svg>
  );
}

function TicketStub({ leftLabel, leftValue, rightLabel, rightValue, accent = "forest" }) {
  const dots = new Array(14).fill(0);
  return (
    <div style={{ position: "relative", background: COLORS.ink, borderRadius: 10, overflow: "hidden", color: COLORS.paper }}>
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1, padding: "12px 14px" }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.65 }}>{leftLabel}</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, marginTop: 2, color: accentHex(accent) }}>{leftValue}</div>
        </div>
        <div style={{ width: 0, position: "relative" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, left: -1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "4px 0" }}>
            {dots.map((_, i) => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS.paper }} />
            ))}
          </div>
        </div>
        <div style={{ flex: 1, padding: "12px 14px", textAlign: "right" }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.65 }}>{rightLabel}</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, marginTop: 2 }}>{rightValue}</div>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ pct, accent }) {
  return (
    <div style={{ height: 8, borderRadius: 6, background: COLORS.paper2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: accentHex(accent), borderRadius: 6, transition: "width 0.4s ease" }} />
    </div>
  );
}

function CountdownChip({ endsInMs }) {
  const { days, hours, mins, secs, urgent } = useCountdown(endsInMs);
  const label = days > 0 ? `${days}d ${hours}h left` : `${hours}h ${mins}m ${secs}s left`;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px",
        borderRadius: 20,
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 12,
        background: urgent ? "rgba(181,67,45,0.12)" : "rgba(31,77,58,0.1)",
        color: urgent ? COLORS.clay : COLORS.forest,
        border: `1px solid ${urgent ? COLORS.clay : COLORS.forest}`,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: urgent ? COLORS.clay : COLORS.forest }} />
      {label}
    </div>
  );
}

function ListingCard({ listing, onOpen }) {
  const pct = (listing.ticketsSold / listing.poolSize) * 100;
  return (
    <div
      onClick={() => onOpen(listing)}
      style={{
        background: COLORS.white,
        borderRadius: 14,
        border: `1px solid ${COLORS.line}`,
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 10px 24px rgba(22,33,58,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ height: 150 }}>
        <HouseArt accent={listing.accent} />
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 18, color: COLORS.ink }}>{listing.address}</div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#6B6656" }}>
            {listing.neighborhood}, {listing.city} {listing.state}
          </div>
        </div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.ink, display: "flex", gap: 12 }}>
          <span>{listing.beds} bd</span>
          <span>{listing.baths} ba</span>
          <span>{listing.sqft.toLocaleString()} sqft</span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {listing.tiers.map((t) => (
            <span
              key={t.qty}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                padding: "3px 8px",
                borderRadius: 20,
                background: COLORS.paper2,
                color: COLORS.ink,
              }}
            >
              ${t.price} / {t.qty} {t.qty === 1 ? "ticket" : "tickets"}
            </span>
          ))}
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Inter, sans-serif", fontSize: 12, color: "#6B6656", marginBottom: 4 }}>
            <span>{listing.ticketsSold.toLocaleString()} / {listing.poolSize.toLocaleString()} tickets</span>
            <span>{Math.round(pct)}%</span>
          </div>
          <ProgressBar pct={pct} accent={listing.accent} />
        </div>
        <div style={{ marginTop: "auto", paddingTop: 4 }}>
          <CountdownChip endsInMs={listing.endsInMs} />
        </div>
      </div>
    </div>
  );
}

function MapView({ listings, onOpen }) {
  return (
    <div style={{ position: "relative", background: "#E7E1CE", borderRadius: 14, border: `1px solid ${COLORS.line}`, height: 480, overflow: "hidden" }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect width="100" height="100" fill="#E9E3D1" />
        {[10, 25, 40, 55, 70, 85].map((x) => (
          <line key={"v" + x} x1={x} y1="0" x2={x} y2="100" stroke="#D8CFB6" strokeWidth="0.4" />
        ))}
        {[10, 25, 40, 55, 70, 85].map((y) => (
          <line key={"h" + y} x1="0" y1={y} x2="100" y2={y} stroke="#D8CFB6" strokeWidth="0.4" />
        ))}
        <rect x="45" y="8" width="14" height="18" fill="#D7E2D2" />
        <rect x="4" y="70" width="20" height="22" fill="#D7E2D2" />
      </svg>
      {listings.map((l) => (
        <div
          key={l.id}
          onClick={() => onOpen(l)}
          title={l.address}
          style={{
            position: "absolute",
            left: `${l.mapX}%`,
            top: `${l.mapY}%`,
            transform: "translate(-50%, -100%)",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              background: accentHex(l.accent),
              color: COLORS.white,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              padding: "4px 8px",
              borderRadius: "14px 14px 14px 2px",
              boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
              whiteSpace: "nowrap",
            }}
          >
            ${l.tiers[0].price}+
          </div>
        </div>
      ))}
    </div>
  );
}

function PurchaseFlow({ listing, onClose }) {
  const [step, setStep] = useState(1);
  const [tierIdx, setTierIdx] = useState(0);
  const [assignedNumbers, setAssignedNumbers] = useState([]);
  const tier = listing.tiers[tierIdx];

  function confirmPurchase() {
    const start = listing.ticketsSold + 1;
    const nums = Array.from({ length: tier.qty }, (_, i) => start + i);
    setAssignedNumbers(nums);
    setStep(3);
  }

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18, minWidth: 320 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 20, color: COLORS.ink }}>
          {step === 3 ? "You're entered" : "Buy raffle tickets"}
        </div>
        <button onClick={onClose} style={closeBtnStyle}>Close</button>
      </div>

      {step === 1 && (
        <>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#6B6656" }}>{listing.address}, {listing.neighborhood}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {listing.tiers.map((t, i) => (
              <label
                key={t.qty}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: `1.5px solid ${i === tierIdx ? COLORS.forest : COLORS.line}`,
                  cursor: "pointer",
                  background: i === tierIdx ? "rgba(31,77,58,0.06)" : COLORS.white,
                }}
                onClick={() => setTierIdx(i)}
              >
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: COLORS.ink }}>
                  {t.qty} {t.qty === 1 ? "ticket" : "tickets"}
                </span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, color: COLORS.forest }}>${t.price}</span>
              </label>
            ))}
          </div>
          <button onClick={() => setStep(2)} style={primaryBtnStyle}>Continue to payment</button>
        </>
      )}

      {step === 2 && (
        <>
          <TicketStub leftLabel="Tickets" leftValue={tier.qty} rightLabel="Total" rightValue={`$${tier.price}`} accent={listing.accent} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input placeholder="Name on card" style={inputStyle} />
            <input placeholder="Card number" style={inputStyle} />
            <div style={{ display: "flex", gap: 10 }}>
              <input placeholder="MM / YY" style={{ ...inputStyle, flex: 1 }} />
              <input placeholder="CVC" style={{ ...inputStyle, flex: 1 }} />
            </div>
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#8A8570" }}>
            Payment processed by Stripe on behalf of the licensed nonprofit conducting this raffle. Preview only — not a live charge.
          </div>
          <button onClick={confirmPurchase} style={primaryBtnStyle}>Confirm purchase — ${tier.price}</button>
        </>
      )}

      {step === 3 && (
        <>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: COLORS.ink }}>
            Your {tier.qty === 1 ? "ticket is" : "tickets are"} in for {listing.address}.
          </div>
          <TicketStub
            leftLabel="Your numbers"
            leftValue={assignedNumbers.length > 2 ? `${assignedNumbers[0]}–${assignedNumbers[assignedNumbers.length - 1]}` : assignedNumbers.join(", ")}
            rightLabel="Draw closes"
            rightValue={<CountdownChipInline endsInMs={listing.endsInMs} />}
            accent={listing.accent}
          />
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.ink }}>
            <input type="checkbox" defaultChecked /> Alert me 24 hours and 1 hour before this raffle closes
          </label>
          <button onClick={onClose} style={primaryBtnStyle}>Back to browsing</button>
        </>
      )}
    </div>
  );
}

function CountdownChipInline({ endsInMs }) {
  const { days, hours, mins } = useCountdown(endsInMs);
  return <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{days > 0 ? `${days}d ${hours}h` : `${hours}h ${mins}m`}</span>;
}

const inputStyle = {
  fontFamily: "Inter, sans-serif",
  fontSize: 14,
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px solid ${COLORS.line}`,
  outline: "none",
  background: COLORS.paper,
  color: COLORS.ink,
};

const primaryBtnStyle = {
  fontFamily: "Inter, sans-serif",
  fontSize: 14,
  fontWeight: 600,
  padding: "12px 16px",
  borderRadius: 10,
  border: "none",
  background: COLORS.forest,
  color: COLORS.paper,
  cursor: "pointer",
};

const closeBtnStyle = {
  fontFamily: "Inter, sans-serif",
  fontSize: 13,
  padding: "6px 10px",
  borderRadius: 8,
  border: `1px solid ${COLORS.line}`,
  background: "transparent",
  color: COLORS.ink,
  cursor: "pointer",
};

function ListingDetail({ listing, onClose, onBuy }) {
  const pct = (listing.ticketsSold / listing.poolSize) * 100;
  const raised = listing.ticketsSold * 24;
  return (
    <div style={{ display: "flex", flexDirection: "column", maxHeight: "80vh", overflow: "auto" }}>
      <div style={{ height: 220 }}>
        <HouseArt accent={listing.accent} />
      </div>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "Fraunces, serif", fontSize: 26, color: COLORS.ink }}>{listing.address}</div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#6B6656" }}>
              {listing.neighborhood}, {listing.city} {listing.state} · Built {listing.yearBuilt}
            </div>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>Close</button>
        </div>

        <div style={{ display: "flex", gap: 18, fontFamily: "Inter, sans-serif", fontSize: 14, color: COLORS.ink }}>
          <span>{listing.beds} bed</span>
          <span>{listing.baths} bath</span>
          <span>{listing.sqft.toLocaleString()} sqft</span>
          <span>Appraised at {money(listing.appraisedValue)}</span>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {listing.features.map((f) => (
            <span key={f} style={{ fontFamily: "Inter, sans-serif", fontSize: 12, padding: "5px 10px", borderRadius: 20, background: COLORS.paper2, color: COLORS.ink }}>
              {f}
            </span>
          ))}
        </div>

        <div style={{ height: 1, background: COLORS.line, margin: "4px 0" }} />

        <TicketStub
          leftLabel="Raised so far"
          leftValue={money(raised)}
          rightLabel="Minimum needed"
          rightValue={money(listing.minThreshold)}
          accent={listing.accent}
        />

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Inter, sans-serif", fontSize: 13, color: "#6B6656", marginBottom: 6 }}>
            <span>{listing.ticketsSold.toLocaleString()} of {listing.poolSize.toLocaleString()} tickets sold</span>
            <span>{Math.round(pct)}%</span>
          </div>
          <ProgressBar pct={pct} accent={listing.accent} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <CountdownChip endsInMs={listing.endsInMs} />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#8A8570" }}>
            If this raffle doesn't reach its minimum, ticket holders are refunded or the deadline is extended — never left in limbo.
          </span>
        </div>

        <button onClick={() => onBuy(listing)} style={primaryBtnStyle}>Buy tickets</button>
      </div>
    </div>
  );
}

function ListHomePreview() {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: COLORS.forest, marginBottom: 6 }}>
        Preview — licensed brokers only
      </div>
      <div style={{ fontFamily: "Fraunces, serif", fontSize: 26, color: COLORS.ink, marginBottom: 20 }}>Submit a home for raffle</div>
      <div style={{ background: COLORS.white, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
        <FieldRow label="Property address" placeholder="1842 W 25th St, Cleveland, OH" />
        <div style={{ display: "flex", gap: 12 }}>
          <FieldRow label="Broker license number" placeholder="OH-482910" wide />
          <FieldRow label="Licensing state" placeholder="Ohio" wide />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <FieldRow label="Minimum raise threshold" placeholder="$210,000" wide />
          <FieldRow label="Ticket pool size" placeholder="10,000" wide />
        </div>
        <FieldRow label="Raffle window" placeholder="45 days from approval" />
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#8A8570" }}>
          Submissions are reviewed against the active raffle permit before going live.
        </div>
        <button style={primaryBtnStyle}>Submit for review</button>
      </div>
    </div>
  );
}

function FieldRow({ label, placeholder, wide }) {
  return (
    <div style={{ flex: wide ? 1 : "unset", display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#6B6656" }}>{label}</label>
      <input placeholder={placeholder} style={inputStyle} />
    </div>
  );
}

function AdminPreview() {
  const pending = [
    { addr: "1842 W 25th St, Ohio City", status: "Pending review" },
    { addr: "3311 Fulton Rd, Tremont", status: "Pending review" },
  ];
  const resolutions = [
    { addr: "17490 Van Aken Blvd, Shaker Heights", note: "Closes in 55 min · 96% funded" },
  ];
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: COLORS.forest, marginBottom: 6 }}>
        Preview — nonprofit admin
      </div>
      <div style={{ fontFamily: "Fraunces, serif", fontSize: 26, color: COLORS.ink, marginBottom: 20 }}>Raffle operations</div>

      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: COLORS.ink, marginBottom: 10 }}>Listings awaiting approval</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {pending.map((p) => (
          <div key={p.addr} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.white, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: "12px 16px" }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: COLORS.ink }}>{p.addr}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...closeBtnStyle, borderColor: COLORS.forest, color: COLORS.forest }}>Approve</button>
              <button style={closeBtnStyle}>Reject</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: COLORS.ink, marginBottom: 10 }}>Resolution queue</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {resolutions.map((r) => (
          <div key={r.addr} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.white, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: "12px 16px" }}>
            <div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: COLORS.ink }}>{r.addr}</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#8A8570" }}>{r.note}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...closeBtnStyle, borderColor: COLORS.brass, color: COLORS.brass }}>Extend</button>
              <button style={{ ...closeBtnStyle, borderColor: COLORS.clay, color: COLORS.clay }}>Refund</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ZaffleApp() {
  const [tab, setTab] = useState("browse");
  const [mode, setMode] = useState("list");
  const [selected, setSelected] = useState(null);
  const [buying, setBuying] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sort, setSort] = useState("ending");

  const sorted = useMemo(() => {
    const arr = [...LISTINGS];
    if (sort === "ending") arr.sort((a, b) => a.endsInMs - b.endsInMs);
    if (sort === "price") arr.sort((a, b) => a.tiers[0].price - b.tiers[0].price);
    if (sort === "funded") arr.sort((a, b) => b.ticketsSold / b.poolSize - a.ticketsSold / a.poolSize);
    return arr;
  }, [sort]);

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: COLORS.paper, minHeight: "100vh", color: COLORS.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
        * { box-sizing: border-box; }
        button:hover { opacity: 0.92; }
        input:focus { border-color: ${COLORS.forest} !important; }
      `}</style>

      <div style={{ position: "sticky", top: 0, zIndex: 20, background: COLORS.paper, borderBottom: `1px solid ${COLORS.line}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 24, color: COLORS.forest }}>Zaffle</span>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#8A8570" }}>Give yourself a chance</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <NavTab label="Browse" active={tab === "browse"} onClick={() => setTab("browse")} />
            <NavTab label="List a home" active={tab === "list"} onClick={() => setTab("list")} />
            <NavTab label="Nonprofit admin" active={tab === "admin"} onClick={() => setTab("admin")} />
            <div style={{ position: "relative", marginLeft: 8 }}>
              <button onClick={() => setNotifOpen((v) => !v)} style={{ ...closeBtnStyle, padding: "8px 10px" }}>Alerts</button>
              {notifOpen && (
                <div style={{ position: "absolute", right: 0, top: "110%", width: 260, background: COLORS.white, border: `1px solid ${COLORS.line}`, borderRadius: 10, boxShadow: "0 12px 28px rgba(22,33,58,0.14)", padding: 10 }}>
                  <NotifRow text="New listing in Ohio City matches your saved search" time="2h ago" />
                  <NotifRow text="Shaker Heights raffle closes in 1 hour" time="Just now" accent="clay" />
                  <NotifRow text="Lakewood raffle extended 3 days" time="Yesterday" />
                </div>
              )}
            </div>
            <button style={{ ...primaryBtnStyle, padding: "9px 16px", marginLeft: 6 }}>Sign in</button>
          </div>
        </div>
      </div>

      {tab === "browse" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px 60px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ fontFamily: "Fraunces, serif", fontSize: 28, color: COLORS.ink }}>Homes raffling now in Ohio</div>
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#6B6656", marginBottom: 20 }}>
            Every raffle is run by a licensed nonprofit. A $20 ticket gets you the same shot as anyone else.
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", background: COLORS.paper2, borderRadius: 10, padding: 3 }}>
              <SegButton label="List" active={mode === "list"} onClick={() => setMode("list")} />
              <SegButton label="Map" active={mode === "map"} onClick={() => setMode("map")} />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ ...inputStyle, padding: "8px 10px" }}>
              <option value="ending">Sort: ending soonest</option>
              <option value="price">Sort: lowest ticket price</option>
              <option value="funded">Sort: most funded</option>
            </select>
          </div>

          {mode === "list" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
              {sorted.map((l) => (
                <ListingCard key={l.id} listing={l} onOpen={setSelected} />
              ))}
            </div>
          ) : (
            <MapView listings={sorted} onOpen={setSelected} />
          )}
        </div>
      )}

      {tab === "list" && <ListHomePreview />}
      {tab === "admin" && <AdminPreview />}

      {selected && !buying && (
        <Overlay onClose={() => setSelected(null)}>
          <ListingDetail listing={selected} onClose={() => setSelected(null)} onBuy={setBuying} />
        </Overlay>
      )}

      {buying && (
        <Overlay onClose={() => { setBuying(null); setSelected(null); }}>
          <PurchaseFlow listing={buying} onClose={() => { setBuying(null); setSelected(null); }} />
        </Overlay>
      )}
    </div>
  );
}

function NavTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: 13,
        fontWeight: 500,
        padding: "8px 12px",
        borderRadius: 8,
        border: "none",
        background: active ? COLORS.paper2 : "transparent",
        color: COLORS.ink,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function SegButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: 13,
        padding: "7px 16px",
        borderRadius: 8,
        border: "none",
        background: active ? COLORS.white : "transparent",
        color: COLORS.ink,
        cursor: "pointer",
        boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
      }}
    >
      {label}
    </button>
  );
}

function NotifRow({ text, time, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "8px 6px", borderBottom: `1px solid ${COLORS.paper}` }}>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: accent ? accentHex(accent) : COLORS.ink }}>{text}</span>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#A39E8B" }}>{time}</span>
    </div>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(22,33,58,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 20,
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: COLORS.paper, borderRadius: 16, maxWidth: 560, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}>
        {children}
      </div>
    </div>
  );
}
