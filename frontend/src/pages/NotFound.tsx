import { useNavigate } from "react-router-dom";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "calc(100vh - 60px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 24px",
        position: "relative",
        zIndex: 5,
      }}
    >
      {/* 404 glitch */}
      <div className="animate-fadeUp" style={{ marginBottom: 28 }}>
        <div
          className="glitch"
          data-text="404"
          style={{
            fontSize: 120,
            fontWeight: 800,
            fontFamily: "var(--font-mono)",
            color: "var(--cyan)",
            lineHeight: 1,
            letterSpacing: "-4px",
            opacity: 0.9,
          }}
        >
          404
        </div>
      </div>

      {/* animated radar icon */}
      <div className="animate-fadeUp" style={{ animationDelay: ".1s", marginBottom: 28 }}>
        <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto" }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: i * 10,
                borderRadius: "50%",
                border: "1px solid var(--cyan-border)",
                opacity: 1 - i * 0.25,
                animation: `pulse-ring ${2 + i * 0.4}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/>
              <path d="M5 12a7 7 0 1 0 14 0 7 7 0 1 0-14 0"/>
              <path d="M3 3l18 18" stroke="#ff3c6e" opacity=".6"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="animate-fadeUp" style={{ animationDelay: ".16s", marginBottom: 10 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 10 }}>
          Frame not found
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 380, lineHeight: 1.7 }}>
          The vector embedding for this page doesn't exist in our index. It may have been moved or the URL is incorrect.
        </p>
      </div>

      {/* mono context line */}
      <div className="animate-fadeUp" style={{ animationDelay: ".22s", marginBottom: 32 }}>
        <div
          className="font-mono"
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            background: "rgba(82,198,255,0.04)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 6,
            padding: "6px 16px",
            display: "inline-block",
          }}
        >
          Error: ANN_LOOKUP_FAILED · similarity_score = 0.00
        </div>
      </div>

      {/* Actions */}
      <div className="animate-fadeUp" style={{ animationDelay: ".28s", display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 7l6-5 6 5v6H9V9H5v4H1z"/>
          </svg>
          Go Home
        </button>
        <button className="btn btn-ghost" onClick={() => navigate("/search")}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="6.5" cy="6.5" r="4.5"/>
            <line x1="10" y1="10" x2="13" y2="13"/>
          </svg>
          Search Videos
        </button>
        <button className="btn btn-ghost" onClick={() => navigate("/upload")}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 9V2M4 5l3-3 3 3"/><path d="M2 11h10"/>
          </svg>
          Upload Videos
        </button>
      </div>

      {/* bottom decorative line */}
      <div
        className="animate-fadeIn"
        style={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: 0.3,
        }}
      >
        <div style={{ width: 60, height: 1, background: "var(--cyan)" }} />
        <span className="font-mono" style={{ fontSize: 10, color: "var(--cyan)" }}>VECTORVISION</span>
        <div style={{ width: 60, height: 1, background: "var(--cyan)" }} />
      </div>
    </div>
  );
}