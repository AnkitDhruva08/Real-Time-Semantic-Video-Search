import { useState } from "react";
import { useNavigate } from "react-router-dom";

/* ─────────────────── Types ─────────────────── */

interface Phase {
  phase: string;
  label: string;
  desc: string;
  status: "done" | "active" | "pending";
  count: string;
}

/* ─────────────────── Data ─────────────────── */

const PHASES: Phase[] = [
  {
    phase: "01",
    label: "Ingestion",
    desc: "Video decoding & frame extraction",
    status: "done",
    count: "1,247 hrs",
  },
  {
    phase: "02",
    label: "Embedding",
    desc: "CLIP embedding generation",
    status: "done",
    count: "4.49M frames",
  },
  {
    phase: "03",
    label: "Indexing",
    desc: "Vector DB indexing",
    status: "active",
    count: "97%",
  },
  {
    phase: "04",
    label: "Search",
    desc: "Natural language video search",
    status: "pending",
    count: "Ready",
  },
];

const STATS = [
  { label: "Hours Indexed", value: "1,247" },
  { label: "Frames Embedded", value: "4.49M" },
  { label: "Avg Query", value: "38ms" },
  { label: "Vectors", value: "4.2M" },
];

const SUGGESTIONS = [
  "person writing on whiteboard",
  "people discussing at desk",
  "coding on laptop",
  "presentation slide with chart",
];

const HOW_IT_WORKS = [
  { step: "01", title: "Type description", desc: "Plain English query about any scene or moment" },
  { step: "02", title: "CLIP encodes text", desc: "Text converted to semantic vector embedding" },
  { step: "03", title: "Vector search finds frames", desc: "Nearest-neighbour search across 4.49M frames" },
];

/* ─────────────────── Phase Node ─────────────────── */

function PhaseNode({ p }: { p: Phase }) {
  const dotClass =
    p.status === "done"
      ? "bg-[#00ffc8] shadow-[0_0_8px_rgba(0,255,200,0.6)]"
      : p.status === "active"
      ? "bg-[#52c6ff] animate-pulse shadow-[0_0_8px_rgba(82,198,255,0.6)]"
      : "bg-white/20";

  const labelClass =
    p.status === "done"
      ? "text-white"
      : p.status === "active"
      ? "text-[#52c6ff]"
      : "text-white/35";

  const countClass =
    p.status === "done"
      ? "text-[#00ffc8]"
      : p.status === "active"
      ? "text-[#52c6ff]"
      : "text-white/25";

  return (
    <div className="flex items-start gap-3 mb-4 last:mb-0">
      {/* Dot + connector */}
      <div className="flex flex-col items-center gap-1 pt-0.5">
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotClass}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm font-bold ${labelClass}`}>{p.label}</span>
          <span className={`text-[11px] font-mono font-bold ${countClass}`}>{p.count}</span>
        </div>
        <div className="text-[11px] text-white/35 mt-0.5">{p.desc}</div>
      </div>
    </div>
  );
}

/* ─────────────────── Main Page ─────────────────── */

export function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (q?: string) => {
    const term = (q ?? query).trim();
    if (!term) return;
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@400;600;700;800&display=swap');
        body { font-family: 'Syne', sans-serif; background: #050d14; }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { opacity: 0.6; transform: scale(1);   }
          100% { opacity: 0;   transform: scale(1.6); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
      `}</style>

      <div
        className="min-h-screen bg-[#050d14] text-[#e8f4ff] px-5 py-16"
        style={{ animation: "fadeSlideIn 0.5s ease" }}
      >
        <div className="max-w-6xl mx-auto">

          {/* ── HERO ── */}
          <div className="mb-12">
            {/* Live badge */}
            <div className="flex items-center gap-2 mb-5">
              <div className="relative w-2 h-2">
                <div className="w-2 h-2 rounded-full bg-[#00ffc8]" />
                <div
                  className="absolute inset-[-4px] rounded-full border-2 border-[#00ffc8]"
                  style={{ animation: "pulse-ring 1.5s ease-out infinite" }}
                />
              </div>
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#00ffc8]/70 font-mono">
                System Online
              </span>
            </div>

            <h1
              className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Semantic{" "}
              <span className="bg-gradient-to-r from-[#00ffc8] to-[#52c6ff] bg-clip-text text-transparent">
                Video Search
              </span>
            </h1>

            <p className="text-white/45 max-w-xl text-base leading-relaxed">
              Describe any scene in plain English and instantly find the matching
              moment across thousands of hours of video.
            </p>
          </div>

          {/* ── STATS ── */}
          <div className="flex flex-wrap gap-3 mb-10">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="bg-white/[0.03] border border-white/[0.07] rounded-xl px-5 py-3.5 hover:border-[rgba(0,255,200,0.2)] transition-colors duration-200"
              >
                <div className="text-xl font-bold text-white font-mono">{s.value}</div>
                <div className="text-[11px] text-white/35 mt-0.5 tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── MAIN GRID ── */}
          <div className="grid md:grid-cols-[1fr_300px] gap-5">

            {/* LEFT: Search + How it works */}
            <div>

              {/* Search Card */}
              <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-7 mb-5">
                <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-white/30 mb-5">
                  Search Frames
                </div>

                {/* Input row */}
                <div className="flex gap-2.5">
                  <div className="flex-1 relative flex items-center">
                    <span className="absolute left-4 text-base text-white/25 pointer-events-none">
                      🔍
                    </span>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Describe a scene…"
                      className="w-full py-3 pl-11 pr-4 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white text-sm outline-none transition-all duration-200 placeholder:text-white/20 focus:border-[rgba(0,255,200,0.45)] focus:shadow-[0_0_0_3px_rgba(0,255,200,0.07)] font-[Syne,sans-serif]"
                    />
                  </div>

                  <button
                    onClick={() => handleSearch()}
                    className="px-6 py-3 rounded-xl border-none bg-gradient-to-r from-[#00ffc8] to-[#52c6ff] text-[#050d14] font-bold text-sm tracking-widest cursor-pointer shadow-[0_0_20px_rgba(0,255,200,0.18)] hover:opacity-90 transition-opacity duration-200"
                  >
                    SEARCH
                  </button>
                </div>

                {/* Suggestions */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSearch(s)}
                      className="text-[11px] border border-[rgba(0,255,200,0.2)] px-3 py-1 rounded-full text-[#00ffc8] hover:bg-[rgba(0,255,200,0.1)] transition-colors duration-150 font-[Syne,sans-serif] tracking-wide"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* How it works */}
              <div className="grid md:grid-cols-3 gap-3">
                {HOW_IT_WORKS.map((item, i) => (
                  <div
                    key={item.step}
                    className="bg-white/[0.025] border border-white/[0.07] rounded-xl p-4 hover:border-[rgba(0,255,200,0.15)] transition-colors duration-200"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div className="text-[10px] font-mono font-bold text-[#00ffc8]/50 mb-2 tracking-widest">
                      {item.step}
                    </div>
                    <div className="font-bold text-sm text-white mb-1">{item.title}</div>
                    <div className="text-[11px] text-white/35 leading-relaxed">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Sidebar */}
            <div>

              {/* Pipeline Status */}
              <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-5 mb-3">
                <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-white/30 mb-5">
                  Pipeline Status
                </div>

                {PHASES.map((p) => (
                  <PhaseNode key={p.phase} p={p} />
                ))}
              </div>

              {/* Upload button */}
              <button
                onClick={() => navigate("/upload")}
                className="w-full border border-[rgba(0,255,200,0.25)] text-[#00ffc8] rounded-xl py-3 text-sm font-bold tracking-widest hover:bg-[rgba(0,255,200,0.07)] transition-colors duration-200 font-[Syne,sans-serif]"
              >
                + UPLOAD VIDEO
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}