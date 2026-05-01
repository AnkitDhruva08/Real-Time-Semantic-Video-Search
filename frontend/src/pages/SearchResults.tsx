import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

/* ─────────────────── Types ─────────────────── */

type Result = {
  tag: any;
  id: string;
  title: string;
  file: string;
  video: string;
  timestamp: string;
  seconds: number;
  similarity: number;
  thumbnail: string;
};

/* ─────────────────── Similarity Bar ─────────────────── */

function SimBar({ v }: { v: number }) {
  const colorClass =
    v >= 0.9
      ? "text-[#00ffc8]"
      : v >= 0.8
      ? "text-[#00c9a7]"
      : "text-[#0097a7]";

  const barColor =
    v >= 0.9
      ? "from-[#00ffc8] to-[#52c6ff]"
      : v >= 0.8
      ? "from-[#00c9a7] to-[#52c6ff]"
      : "from-[#0097a7] to-[#52c6ff]";

  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex-1 h-1 bg-white/[0.08] rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-[width] duration-[600ms] ease-[cubic-bezier(.4,0,.2,1)]`}
          style={{ width: `${v * 100}%` }}
        />
      </div>
      <span
        className={`text-[11px] font-bold ${colorClass} min-w-[38px] font-mono tracking-wider`}
      >
        {Math.round(v * 100)}%
      </span>
    </div>
  );
}

/* ─────────────────── Tag Pill ─────────────────── */

function TagPill({ tag }: { tag: string }) {
  return (
    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[rgba(0,255,200,0.12)] text-[#00ffc8] border border-[rgba(0,255,200,0.25)]">
      {tag}
    </span>
  );
}

/* ─────────────────── Player Expand ─────────────────── */

function PlayerExpand({ r }: { r: Result }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const jumpToTime = async () => {
      v.currentTime = r.seconds;
      try {
        await v.play();
      } catch {
        // autoplay blocked — user can press play manually
      }
    };

    if (v.readyState >= 1) {
      jumpToTime();
    } else {
      v.addEventListener("loadedmetadata", jumpToTime);
      return () => v.removeEventListener("loadedmetadata", jumpToTime);
    }
  }, [r.seconds]);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mt-4 p-4 rounded-xl bg-[rgba(0,255,200,0.05)] border border-[rgba(0,255,200,0.15)]"
    >
      <video
        ref={videoRef}
        src={r.video}
        poster={r.thumbnail}
        controls
        muted
        playsInline
        preload="metadata"
        className="w-full rounded-lg"
      />
      <div className="mt-2 text-xs text-white/50">
        Jumped to timestamp: {r.timestamp}
      </div>
    </div>
  );
}

/* ─────────────────── Shimmer Skeleton ─────────────────── */

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`animate-[shimmer_1.4s_infinite] bg-[linear-gradient(90deg,#0a1520_25%,#0d1e2e_50%,#0a1520_75%)] bg-[length:200%_100%] ${className}`}
    />
  );
}

/* ─────────────────── Result Card ─────────────────── */

function ResultCard({
  r,
  view,
  isSelected,
  onToggle,
  index,
}: {
  r: Result;
  view: "list" | "grid";
  isSelected: boolean;
  onToggle: () => void;
  index: number;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const cardBase = isSelected
    ? "bg-[rgba(0,255,200,0.07)] border-[rgba(0,255,200,0.3)]"
    : "bg-white/[0.025] border-white/[0.07]";

  if (view === "grid") {
    return (
      <div
        onClick={onToggle}
        className={`${cardBase} border rounded-2xl overflow-hidden cursor-pointer transition-all duration-200`}
        style={{
          animationDelay: `${index * 0.05}s`,
          animation: "fadeSlideIn 0.35s ease both",
        }}
      >
        {/* Thumbnail */}
        <div className="relative w-full aspect-video bg-[#0a1520] overflow-hidden">
          {!imgLoaded && !imgError && <Shimmer className="absolute inset-0" />}

          {imgError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 text-xs gap-1.5">
              <span className="text-3xl">🎞️</span>
              <span>No Preview</span>
            </div>
          ) : (
            <img
              src={r.thumbnail}
              alt={r.title}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                imgLoaded ? "block" : "hidden"
              }`}
            />
          )}

          {/* Time badge */}
          <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-white text-[11px] font-mono px-2 py-0.5 rounded-md font-semibold">
            {formatTime(r.seconds)}
          </div>

          {/* Play overlay */}
          <div
            className={`absolute inset-0 bg-[rgba(0,255,200,0.1)] flex items-center justify-center transition-opacity duration-200 ${
              isSelected ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="w-11 h-11 rounded-full bg-[rgba(0,255,200,0.9)] flex items-center justify-center text-[18px] text-[#050d14] font-black">
              ▶
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="px-3.5 py-3">
          <div className="font-bold text-sm text-white mb-1 leading-snug truncate">
            {r.title}
          </div>
          <div className="text-[11px] text-white/40 mb-1.5 truncate">{r.file}</div>
          {r.tag && <TagPill tag={r.tag} />}
          <SimBar v={r.similarity} />
        </div>

        {isSelected && (
          <div className="px-3.5 pb-3.5">
            <PlayerExpand r={r} />
          </div>
        )}
      </div>
    );
  }

  // LIST view
  return (
    <div
      onClick={onToggle}
      className={`${cardBase} border rounded-2xl p-3.5 cursor-pointer transition-all duration-200`}
      style={{
        animationDelay: `${index * 0.05}s`,
        animation: "fadeSlideIn 0.35s ease both",
      }}
    >
      <div className="flex gap-4 items-start">
        {/* Thumbnail */}
        <div className="relative w-40 h-[90px] flex-shrink-0 rounded-xl overflow-hidden bg-[#0a1520]">
          {!imgLoaded && !imgError && <Shimmer className="absolute inset-0" />}

          {imgError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 text-[11px] gap-1">
              <span className="text-2xl">🎞️</span>
              <span>No Preview</span>
            </div>
          ) : (
            <img
              src={r.thumbnail}
              alt={r.title}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover ${imgLoaded ? "block" : "hidden"}`}
            />
          )}

          {/* Time badge */}
          <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-mono px-1.5 py-px rounded font-semibold">
            {formatTime(r.seconds)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2.5 mb-1">
            <div className="font-bold text-[15px] text-white leading-snug">
              {r.title}
            </div>
            {r.tag && <TagPill tag={r.tag} />}
          </div>

          <div className="text-xs text-white/40 mb-2 truncate">📁 {r.file}</div>

          <SimBar v={r.similarity} />
        </div>

        {/* Expand arrow */}
        <div
          className={`text-white/30 text-lg self-center transition-transform duration-200 ${
            isSelected ? "rotate-180" : "rotate-0"
          }`}
        >
          ⌄
        </div>
      </div>

      {isSelected && <PlayerExpand r={r} />}
    </div>
  );
}

/* ─────────────────── Main Page ─────────────────── */

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const q = searchParams.get("q") ?? "";

  const [liveQuery, setLiveQuery] = useState(q);
  const [results, setResults] = useState<Result[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"similarity" | "time">("similarity");

  /* ── Fetch ── */
  const fetchVideoData = async (query: string) => {
  setIsLoading(true);
  setError("");

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/search?q=${encodeURIComponent(query || "")}`
    );

    if (!response.ok) throw new Error(`API Error ${response.status}`);

    const data = await response.json();

    const mapped = (data.results || []).map((r: any) => ({
      id: r.frame_id ?? `${r.video_id}-${r.timestamp}`,
      title: r.title ?? "Video",
      file: r.video_url ?? "",
      video: `http://localhost:8000/videos/${r.filename ?? r.video_id}`,
      timestamp: new Date(r.timestamp * 1000).toISOString().substr(11, 8),
      seconds: r.timestamp,
      similarity: r.similarity ?? 1,
      thumbnail: `http://localhost:8000${r.thumbnail_url}`,
    }));

    setResults(mapped);

  } catch (err) {

    console.error(err);
    setError("Failed to fetch videos. Please check your connection.");
    setResults([]);

  } finally {

    setIsLoading(false);

  }
};

  useEffect(() => {
  setLiveQuery(q || "");
  fetchVideoData(q || "");
}, [q]);
  const doSearch = (term = liveQuery) => {
    const t = term.trim();
    if (!t) return;
    setSelected(null);
    navigate(`/search?q=${encodeURIComponent(t)}`);
  };

  const sortedResults = [...results].sort((a, b) =>
    sortBy === "similarity" ? b.similarity - a.similarity : a.seconds - b.seconds
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@400;600;700;800&display=swap');

        body { font-family: 'Syne', sans-serif; }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }

        @keyframes pulse-ring {
          0%   { opacity: 0.6; transform: scale(1);   }
          100% { opacity: 0;   transform: scale(1.6); }
        }
      `}</style>

      <div
        className="max-w-[980px] mx-auto px-5 pt-8 pb-20"
        style={{ animation: "fadeSlideIn 0.4s ease" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/")}
            className="bg-transparent border-none cursor-pointer text-white/40 text-2xl px-2 py-1 rounded-lg transition-colors duration-200 hover:text-[#00ffc8]"
            title="Home"
          >
            ←
          </button>

          <div className="text-[13px] font-bold tracking-[0.14em] uppercase text-white/25">
            Video Frame Search
          </div>

          {/* Live indicator */}
          <div className="ml-auto relative w-2 h-2">
            <div className="w-2 h-2 rounded-full bg-[#00ffc8]" />
            <div
              className="absolute inset-[-4px] rounded-full border-2 border-[#00ffc8]"
              style={{ animation: "pulse-ring 1.5s ease-out infinite" }}
            />
          </div>
        </div>

        {/* ── Search Bar ── */}
        <div className="flex gap-2.5 mb-7 relative">
          <div className="flex-1 relative flex items-center">
            <span className="absolute left-4 text-base text-white/30 pointer-events-none">
              🔍
            </span>
            <input
              value={liveQuery}
              onChange={(e) => setLiveQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch()}
              placeholder="Search video frames by concept, object, scene…"
              className="w-full py-3.5 pl-11 pr-4 bg-white/[0.05] border border-white/[0.12] rounded-xl text-white text-[15px] outline-none transition-all duration-200 placeholder:text-white/25 focus:border-[rgba(0,255,200,0.5)] focus:shadow-[0_0_0_3px_rgba(0,255,200,0.08)] font-[Syne,sans-serif]"
            />
          </div>

          <button
            onClick={() => doSearch()}
            className="px-7 py-3.5 rounded-xl border-none bg-gradient-to-r from-[#00ffc8] to-[#52c6ff] text-[#050d14] font-bold text-sm tracking-widest cursor-pointer shadow-[0_0_24px_rgba(0,255,200,0.2)] transition-opacity duration-200 hover:opacity-90"
          >
            SEARCH
          </button>
        </div>

        {/* ── Loading ── */}
        {isLoading && (
          <div
            className="text-center py-24"
            style={{ animation: "fadeSlideIn 0.3s ease" }}
          >
            <div className="w-11 h-11 border-[3px] border-[rgba(0,255,200,0.15)] border-t-[#00ffc8] rounded-full animate-spin mx-auto mb-5" />
            <div className="text-white/40 text-sm tracking-widest">
              Searching video embeddings…
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="px-4 py-3.5 bg-[rgba(255,80,80,0.08)] border border-[rgba(255,80,80,0.2)] rounded-xl text-[#ff8080] text-sm mb-5">
            ⚠ {error}
          </div>
        )}

        {/* ── Results ── */}
        {!isLoading && results.length > 0 && (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2.5">
              <div className="text-[13px] text-white/45 tracking-wide">
                <span className="text-[#00ffc8] font-bold font-mono">
                  {results.length}
                </span>{" "}
                results for{" "}
                <span className="text-white/70">"{q}"</span>
              </div>

              <div className="flex gap-2 items-center">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "similarity" | "time")
                  }
                  className="px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-lg text-white/65 text-xs cursor-pointer outline-none font-[Syne,sans-serif]"
                >
                  <option value="similarity">Sort: Similarity</option>
                  <option value="time">Sort: Timestamp</option>
                </select>

                {/* View Toggle */}
                <div className="flex bg-white/[0.05] border border-white/10 rounded-lg overflow-hidden">
                  {(["grid", "list"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      className={`px-3.5 py-1.5 border-none text-xs font-semibold tracking-wider cursor-pointer transition-all duration-150 font-[Syne,sans-serif] ${
                        view === v
                          ? "bg-[rgba(0,255,200,0.15)] text-[#00ffc8]"
                          : "bg-transparent text-white/40"
                      }`}
                    >
                      {v === "grid" ? "⊞ Grid" : "☰ List"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cards */}
            {view === "list" ? (
              <div className="flex flex-col gap-2.5">
                {sortedResults.map((r, i) => (
                  <ResultCard
                    key={r.id}
                    r={r}
                    view="list"
                    isSelected={selected === r.id}
                    onToggle={() =>
                      setSelected(selected === r.id ? null : r.id)
                    }
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
                {sortedResults.map((r, i) => (
                  <ResultCard
                    key={r.id}
                    r={r}
                    view="grid"
                    isSelected={selected === r.id}
                    onToggle={() =>
                      setSelected(selected === r.id ? null : r.id)
                    }
                    index={i}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Empty State ── */}
        {!isLoading && results.length === 0 && q && !error && (
          <div
            className="text-center py-24"
            style={{ animation: "fadeSlideIn 0.3s ease" }}
          >
            <div className="text-5xl mb-4">🎞️</div>
            <div className="text-lg font-bold text-white/60 mb-2">
              No matches found
            </div>
            <div className="text-sm text-white/30">
              Try a different search term or broaden your query
            </div>
          </div>
        )}
      </div>
    </>
  );
}