import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Phase {
  phase: string;
  label: string;
  desc: string;
  status: "done" | "active" | "pending";
  count: string;
}

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

function PhaseNode({ p }: { p: Phase }) {
  const color =
    p.status === "done"
      ? "bg-cyan-400"
      : p.status === "active"
      ? "bg-blue-500 animate-pulse"
      : "bg-gray-500";

  return (
    <div className="flex gap-3 mb-3">
      <div className={`w-3 h-3 rounded-full mt-1 ${color}`} />

      <div>
        <div className="text-sm font-semibold">{p.label}</div>
        <div className="text-xs text-gray-400">{p.desc}</div>
      </div>
    </div>
  );
}

export function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (q?: string) => {
    const term = (q ?? query).trim();
    if (!term) return;

    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 px-6 py-16">
      <div className="max-w-6xl mx-auto">

        {/* HERO */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-3">
            Semantic Video Search
          </h1>

          <p className="text-gray-400 max-w-xl">
            Describe any scene in plain English and instantly find the matching
            moment across thousands of hours of video.
          </p>
        </div>

        {/* STATS */}
        <div className="flex flex-wrap gap-4 mb-10">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="bg-slate-900 border border-cyan-400/10 rounded-lg px-6 py-4"
            >
              <div className="text-xl font-semibold">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-[1fr_300px] gap-6">

          {/* SEARCH */}
          <div>
            <div className="bg-slate-900 border border-cyan-400/10 rounded-xl p-8 mb-6">

              <div className="flex gap-3">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Describe a scene..."
                  className="flex-1 bg-slate-950 border border-cyan-400/20 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-400"
                />

                <button
                  onClick={() => handleSearch()}
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
                >
                  Search
                </button>
              </div>

              {/* suggestions */}
              <div className="flex flex-wrap gap-2 mt-4">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSearch(s)}
                    className="text-xs border border-cyan-400/20 px-3 py-1 rounded-full text-cyan-400 hover:bg-cyan-400/10"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* HOW IT WORKS */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                "Type description",
                "CLIP encodes text",
                "Vector search finds frames",
              ].map((item) => (
                <div
                  key={item}
                  className="bg-slate-900 border border-cyan-400/10 rounded-lg p-4"
                >
                  <div className="font-semibold mb-1">{item}</div>
                  <div className="text-xs text-gray-400">
                    Semantic vector search pipeline
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SIDEBAR */}
          <div>
            <div className="bg-slate-900 border border-cyan-400/10 rounded-xl p-6 mb-4">
              <div className="text-xs text-gray-400 mb-4">
                PIPELINE STATUS
              </div>

              {PHASES.map((p) => (
                <PhaseNode key={p.phase} p={p} />
              ))}
            </div>

            <button
              onClick={() => navigate("/upload")}
              className="w-full border border-cyan-400/30 text-cyan-400 rounded-lg py-3 hover:bg-cyan-400/10"
            >
              Upload Video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}