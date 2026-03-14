import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ── Types ──────────────────────────────────────────────── */
interface Phase {
  phase: string;
  label: string;
  desc: string;
  status: "done" | "active" | "pending";
  count: string;
}

/* ── Data ───────────────────────────────────────────────── */
const PHASES: Phase[] = [
  {
    phase: "01",
    label: "Ingestion",
    desc: "Video decoding & frame extraction at 1 FPS",
    status: "done",
    count: "1,247 hrs",
  },
  {
    phase: "02",
    label: "Embedding",
    desc: "CLIP ViT-L/14 GPU batch vector generation",
    status: "done",
    count: "4.49M frames",
  },
  {
    phase: "03",
    label: "Indexing",
    desc: "Milvus 2.4 vector DB storage + HNSW index",
    status: "active",
    count: "97.3%",
  },
  {
    phase: "04",
    label: "Search",
    desc: "NL query → CLIP text encoder → ANN lookup",
    status: "pending",
    count: "Ready soon",
  },
];

const STATS = [
  { label: "Hours Indexed", value: "1,247" },
  { label: "Frames Embedded", value: "4.49M" },
  { label: "Avg Query", value: "38ms" },
  { label: "DB Vectors", value: "4.2M" },
];

const SUGGESTIONS = [
  "person writing on whiteboard",
  "code on screen with terminal",
  "graph showing accuracy improving",
  "two people discussing at desk",
  "slide with neural network diagram",
];

const TECH = [
  { k: "Model", v: "CLIP ViT-L/14" },
  { k: "Vector DB", v: "Milvus 2.4" },
  { k: "Frame rate", v: "1 FPS" },
  { k: "Embed. dim", v: "768" },
  { k: "GPU cluster", v: "A100 ×4" },
  { k: "Index type", v: "HNSW" },
];

/* ── Phase node ─────────────────────────────────────────── */
function PhaseNode({ p }: { p: Phase }) {
  const colors = {
    done: { border: "#52c6ff", bg: "rgba(82,198,255,0.16)" },
    active: { border: "#3b9eff", bg: "rgba(59,158,255,0.12)" },
    pending: { border: "rgba(82,198,255,0.2)", bg: "transparent" },
  };
  const c = colors[p.status];
  return (
    <div
      className="phase-item"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "8px 6px",
        borderRadius: 8,
        transition: "background .2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(82,198,255,0.04)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 2,
        }}
      >
        <div
          className="step-node"
          style={{
            border: `1.5px solid ${c.border}`,
            background: c.bg,
            animation:
              p.status === "active"
                ? "shimmer 1.6s ease-in-out infinite"
                : "none",
          }}
        >
          {p.status === "done" && (
            <svg width="11" height="11" viewBox="0 0 11 11">
              <polyline
                points="2.5,5.5 5,8 9,2.5"
                fill="none"
                stroke="#52c6ff"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          )}
          {p.status === "active" && (
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#3b9eff",
              }}
            />
          )}
          {p.status === "pending" && (
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "rgba(82,198,255,0.22)",
              }}
            />
          )}
        </div>
        {p.phase !== "04" && <div className="step-connector" />}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color:
                p.status === "pending" ? "rgba(237,240,251,0.28)" : "#edf0fb",
            }}
          >
            {p.label}
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: 10,
              color:
                p.status === "active"
                  ? "#3b9eff"
                  : p.status === "done"
                    ? "rgba(82,198,255,0.65)"
                    : "rgba(237,240,251,0.2)",
            }}
          >
            {p.count}
          </span>
        </div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(237,240,251,0.32)",
            marginTop: 2,
            lineHeight: 1.5,
          }}
        >
          {p.desc}
        </div>
      </div>
    </div>
  );
}

/* ── Home page ──────────────────────────────────────────── */
export function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (q?: string) => {
    const term = (q ?? query).trim();
    if (!term) return;
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="page" style={{ paddingTop: 40 }}>
      {/* ── Staggered header ── */}
      <div
        className="animate-fadeUp"
        style={{ marginBottom: 40, maxWidth: 640 }}
      >
        <div className="badge" style={{ marginBottom: 14 }}>
          PHASE 3 · INDEXING IN PROGRESS
        </div>
        <h1
          style={{
            fontSize: 44,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-1px",
            marginBottom: 14,
          }}
        >
          Find any moment in
          <br />
          <span className="text-cyan">1,247 hours</span> of video
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "var(--text-secondary)",
            lineHeight: 1.7,
          }}
        >
          Describe a scene in plain English. CLIP transforms your words and
          every video frame into the same vector space — then finds the closest
          match instantly.
        </p>
      </div>

      {/* ── Stats row ── */}
      <div
        className="animate-fadeUp"
        style={{
          animationDelay: ".08s",
          display: "flex",
          gap: 10,
          marginBottom: 36,
          flexWrap: "wrap",
        }}
      >
        {STATS.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-val">{s.value}</div>
            <div className="stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* LEFT: search hero */}
        <div className="animate-fadeUp" style={{ animationDelay: ".14s" }}>
          <div
            className="card-elevated"
            style={{
              padding: "32px 28px 26px",
              position: "relative",
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            {/* corner bracket */}
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 100,
                height: 100,
                borderBottom: "1px solid rgba(82,198,255,0.1)",
                borderLeft: "1px solid rgba(82,198,255,0.1)",
                borderRadius: "0 14px 0 70px",
              }}
            />

            <div style={{ marginBottom: 22 }}>
              <div
                className="font-mono"
                style={{
                  fontSize: 10,
                  color: "var(--text-muted)",
                  letterSpacing: ".1em",
                  marginBottom: 8,
                }}
              >
                SEMANTIC QUERY
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                Type any visual description — objects, actions, colors,
                emotions, settings. No need to remember filenames or timestamps.
              </p>
            </div>

            {/* search box */}
            <div
              className="search-wrap"
              style={{ marginBottom: 14 }}
              onClick={() => inputRef.current?.focus()}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle
                  cx="7"
                  cy="7"
                  r="4.5"
                  stroke="var(--cyan)"
                  strokeWidth="1.5"
                />
                <line
                  x1="10.5"
                  y1="10.5"
                  x2="14"
                  y2="14"
                  stroke="var(--cyan)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <input
                ref={inputRef}
                className="search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Describe a scene, action, or concept…"
              />
              <button
                className="btn btn-primary"
                style={{ padding: "7px 18px", fontSize: 12 }}
                onClick={() => handleSearch()}
              >
                SEARCH
              </button>
            </div>

            {/* suggestion pills */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                alignItems: "center",
              }}
            >
              <span
                className="font-mono"
                style={{ fontSize: 10, color: "var(--text-muted)" }}
              >
                TRY
              </span>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSearch(s)}
                  style={{
                    fontSize: 11,
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 20,
                    padding: "4px 12px",
                    background: "transparent",
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                    transition: "all .15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.borderColor =
                      "var(--cyan-border-hi)";
                    (e.target as HTMLElement).style.color = "var(--cyan)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.borderColor =
                      "var(--border-subtle)";
                    (e.target as HTMLElement).style.color =
                      "var(--text-secondary)";
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* How it works row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            {[
              {
                n: "01",
                title: "Type a description",
                body: "Write in plain English — describe what you see, not what file it's in.",
              },
              {
                n: "02",
                title: "CLIP encodes it",
                body: "Your text becomes a 768-dim vector in the same space as video frames.",
              },
              {
                n: "03",
                title: "Instant results",
                body: "HNSW index finds the nearest frames across 4.49M embeddings in <40ms.",
              },
            ].map((item) => (
              <div
                key={item.n}
                className="card"
                style={{ padding: "18px 16px" }}
              >
                <div
                  className="font-mono"
                  style={{
                    fontSize: 10,
                    color: "var(--cyan)",
                    marginBottom: 8,
                  }}
                >
                  {item.n}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {item.body}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Pipeline */}
          <div
            className="animate-fadeUp card-elevated"
            style={{ animationDelay: ".2s", padding: "16px 14px" }}
          >
            <div
              className="font-mono"
              style={{
                fontSize: 10,
                color: "var(--cyan-dim)",
                letterSpacing: ".1em",
                marginBottom: 14,
              }}
            >
              PIPELINE STATUS
            </div>
            {PHASES.map((p) => (
              <PhaseNode key={p.phase} p={p} />
            ))}
          </div>

          {/* Tech stack */}
          <div
            className="animate-fadeUp card"
            style={{ animationDelay: ".26s", padding: "16px 14px" }}
          >
            <div
              className="font-mono"
              style={{
                fontSize: 10,
                color: "var(--cyan-dim)",
                letterSpacing: ".1em",
                marginBottom: 12,
              }}
            >
              TECH STACK
            </div>
            {TECH.map((t) => (
              <div
                key={t.k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {t.k}
                </span>
                <span
                  className="font-mono"
                  style={{ fontSize: 11, color: "var(--cyan)" }}
                >
                  {t.v}
                </span>
              </div>
            ))}
          </div>

          {/* Upload CTA */}
          <div className="animate-fadeUp" style={{ animationDelay: ".32s" }}>
            <button
              className="btn btn-ghost"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "12px",
              }}
              onClick={() => navigate("/upload")}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 9V2M4 5l3-3 3 3" />
                <path d="M2 11h10" />
              </svg>
              Upload More Videos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
