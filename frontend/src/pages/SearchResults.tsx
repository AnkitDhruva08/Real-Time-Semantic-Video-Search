import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

/* ── Dummy data ─────────────────────────────────────────── */
const DUMMY = [
  { id: 1, title: "Neural Network Training Session",  file: "ml_lecture_series_ep12.mp4",      timestamp: "00:14:32", seconds: 872,  similarity: 0.97, thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=340&q=75", tag: "AI/ML"      },
  { id: 2, title: "Gradient Descent Visualization",   file: "deep_learning_fundamentals.mp4",  timestamp: "00:38:10", seconds: 2290, similarity: 0.91, thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=340&q=75", tag: "Math"       },
  { id: 3, title: "Backpropagation Explained",        file: "cs231n_lecture_04.mp4",           timestamp: "01:02:45", seconds: 3765, similarity: 0.87, thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=340&q=75", tag: "Lecture"    },
  { id: 4, title: "Loss Function Convergence",        file: "stanford_ml_2024.mp4",            timestamp: "00:52:18", seconds: 3138, similarity: 0.82, thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=340&q=75", tag: "Statistics" },
  { id: 5, title: "Transformer Architecture Overview",file: "attention_is_all_you_need.mp4",   timestamp: "00:08:55", seconds: 535,  similarity: 0.78, thumbnail: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=340&q=75", tag: "NLP"        },
  { id: 6, title: "CLIP Model Embedding Space",       file: "openai_clip_demo.mp4",            timestamp: "00:22:07", seconds: 1327, similarity: 0.74, thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=340&q=75", tag: "Vision"     },
];
type Result = typeof DUMMY[0];

/* ── Sub-components ─────────────────────────────────────── */
function SimBar({ v }: { v: number }) {
  const color = v >= 0.9 ? "#52c6ff" : v >= 0.8 ? "#3b9eff" : "#1e6ab8";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <div className="sim-bar-track">
        <div className="sim-bar-fill" style={{ width: `${v * 100}%`, background: color }} />
      </div>
      <span className="font-mono" style={{ fontSize: 10, color: "#52c6ff", minWidth: 36 }}>{Math.round(v * 100)}%</span>
    </div>
  );
}

function PlayerExpand({ r }: { r: Result }) {
  const pct = (r.seconds / 7200) * 100;
  return (
    <div className="animate-fadeIn" style={{ marginTop: 14, padding: 14, background: "rgba(82,198,255,0.04)", borderRadius: 10, border: "1px solid var(--border-default)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Jumping to matched frame</span>
        <span className="badge">{r.timestamp}</span>
      </div>
      {/* scrubber */}
      <div style={{ position: "relative", height: 4, background: "var(--cyan-ghost)", borderRadius: 2, marginBottom: 12 }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: "var(--cyan)", borderRadius: 2 }} />
        <div style={{ position: "absolute", top: -4, left: `${pct}%`, width: 12, height: 12, borderRadius: "50%", background: "var(--cyan)", border: "2px solid var(--bg-base)", transform: "translateX(-50%)" }} />
      </div>
      {/* controls */}
      <div style={{ display: "flex", gap: 8 }}>
        {(["-30s", "▶  Play", "+30s", "Clip"] as const).map(btn => (
          <button
            key={btn}
            style={{
              flex: btn === "▶  Play" ? 2 : 1, padding: "8px 0",
              background: btn === "▶  Play" ? "rgba(82,198,255,0.14)" : "rgba(82,198,255,0.04)",
              border: `1px solid ${btn === "▶  Play" ? "var(--cyan-border-hi)" : "var(--border-subtle)"}`,
              borderRadius: 7,
              color: btn === "▶  Play" ? "var(--cyan)" : "var(--text-secondary)",
              fontSize: 11, fontFamily: "var(--font-mono)", cursor: "pointer",
            }}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────── */
export function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get("q") ?? "";

  const [liveQuery, setLiveQuery] = useState(q);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [selected, setSelected] = useState<Result | null>(null);
  const [done, setDone] = useState(false);
  const [view, setView] = useState<"list" | "grid">("list");

  useEffect(() => {
    if (!q) return;
    setLiveQuery(q);
    setIsLoading(true); setResults([]); setDone(false); setSelected(null);
    const t = setTimeout(() => { setIsLoading(false); setDone(true); setResults(DUMMY); }, 1600);
    return () => clearTimeout(t);
  }, [q]);

  const doSearch = (term = liveQuery) => {
    const t = term.trim();
    if (!t) return;
    navigate(`/search?q=${encodeURIComponent(t)}`);
  };

  return (
    <div className="page" style={{ paddingTop: 28 }}>

      {/* ── Sticky search bar ── */}
      <div className="animate-fadeUp" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="search-wrap" style={{ flex: 1 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="4.5" stroke="var(--cyan)" strokeWidth="1.5" />
              <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              className="search-input"
              value={liveQuery}
              onChange={e => setLiveQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && doSearch()}
              placeholder="Refine your search…"
            />
            {isLoading && <div style={{ width: 18, height: 18, border: "2px solid var(--border-default)", borderTopColor: "var(--cyan)", borderRadius: "50%", animation: "spin .8s linear infinite", flexShrink: 0 }} />}
          </div>
          <button className="btn btn-primary" onClick={() => doSearch()}>SEARCH</button>
          <button className="btn btn-ghost" onClick={() => navigate("/")}>← Home</button>
        </div>
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ width: 56, height: 56, border: "2px solid var(--border-subtle)", borderTopColor: "var(--cyan)", borderRadius: "50%", animation: "spin .9s linear infinite", margin: "0 auto 20px" }} />
          <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>Scanning vector embeddings…</div>
          <div className="font-mono" style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>ANN search across 4.49M frames</div>
        </div>
      )}

      {/* ── Results ── */}
      {done && results.length > 0 && (
        <>
          {/* header row */}
          <div className="animate-fadeIn" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span className="font-mono" style={{ fontSize: 11, color: "var(--cyan-dim)" }}>
              {results.length} RESULTS
            </span>
            <span className="font-mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>—</span>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>"{q}"</span>
            <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
            {/* view toggle */}
            <div style={{ display: "flex", gap: 4 }}>
              {(["list", "grid"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="btn"
                  style={{
                    padding: "5px 12px", fontSize: 11,
                    background: view === v ? "var(--cyan-ghost)" : "transparent",
                    borderColor: view === v ? "var(--cyan-border)" : "var(--border-subtle)",
                    color: view === v ? "var(--cyan)" : "var(--text-muted)",
                  }}
                >
                  {v === "list"
                    ? <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect y="0" width="12" height="2" rx="1"/><rect y="5" width="12" height="2" rx="1"/><rect y="10" width="12" height="2" rx="1"/></svg>
                    : <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect width="5" height="5" rx="1"/><rect x="7" width="5" height="5" rx="1"/><rect y="7" width="5" height="5" rx="1"/><rect x="7" y="7" width="5" height="5" rx="1"/></svg>
                  }
                  {v}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>sorted by similarity</span>
          </div>

          {/* cards */}
          {view === "list" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {results.map((r, i) => (
                <div
                  key={r.id}
                  className={`result-card${selected?.id === r.id ? " selected" : ""}`}
                  style={{ animationDelay: `${i * 0.055}s` }}
                  onClick={() => setSelected(selected?.id === r.id ? null : r)}
                >
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    {/* thumb */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <img src={r.thumbnail} alt={r.title} style={{ width: 130, height: 74, objectFit: "cover", borderRadius: 8, display: "block", opacity: .88 }} />
                      <div style={{ position: "absolute", bottom: 5, right: 5, background: "rgba(6,10,18,.88)", borderRadius: 3, padding: "2px 6px", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--cyan)", border: "1px solid var(--border-subtle)" }}>
                        {r.timestamp}
                      </div>
                      <div style={{ position: "absolute", top: 5, left: 5, width: 22, height: 22, background: "rgba(6,10,18,.82)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="8" height="10" viewBox="0 0 8 10"><polygon points="1,1 7,5 1,9" fill="var(--cyan)" /></svg>
                      </div>
                    </div>
                    {/* meta */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                        <span className="badge">{r.tag}</span>
                        <span className="font-mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>#{String(i + 1).padStart(2, "0")}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 9, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.file}</div>
                      <SimBar v={r.similarity} />
                    </div>
                    {/* arrow */}
                    <div style={{ width: 32, height: 32, border: "1px solid var(--border-default)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", flexShrink: 0, alignSelf: "center" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6h8M6 2l4 4-4 4"/>
                      </svg>
                    </div>
                  </div>
                  {selected?.id === r.id && <PlayerExpand r={r} />}
                </div>
              ))}
            </div>
          ) : (
            /* Grid view */
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {results.map((r, i) => (
                <div
                  key={r.id}
                  className={`result-card${selected?.id === r.id ? " selected" : ""}`}
                  style={{ animationDelay: `${i * 0.05}s`, padding: 12 }}
                  onClick={() => setSelected(selected?.id === r.id ? null : r)}
                >
                  <div style={{ position: "relative", marginBottom: 10 }}>
                    <img src={r.thumbnail} alt={r.title} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: 8, display: "block", opacity: .88 }} />
                    <div style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(6,10,18,.88)", borderRadius: 3, padding: "2px 6px", fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--cyan)" }}>{r.timestamp}</div>
                    <div style={{ position: "absolute", top: 6, left: 6 }}><span className="badge">{r.tag}</span></div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.file}</div>
                  <SimBar v={r.similarity} />
                  {selected?.id === r.id && <PlayerExpand r={r} />}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── No results ── */}
      {done && results.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div className="animate-float" style={{ fontSize: 52, marginBottom: 20, opacity: .4 }}>∅</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No matches found</div>
          <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>
            No frames matched <strong>"{q}"</strong>. Try broader or different keywords.
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn btn-ghost" onClick={() => navigate("/")}>Try New Search</button>
            <button className="btn btn-primary" onClick={() => navigate("/upload")}>Upload Videos</button>
          </div>
        </div>
      )}

      {/* ── Empty query ── */}
      {!q && !isLoading && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 14 }}>Enter a search query above to begin.</div>
        </div>
      )}
    </div>
  );
}