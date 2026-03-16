import { useState, useRef, useCallback, DragEvent } from "react";
import { useNavigate } from "react-router-dom";

/* ── API ──────────────────────────────────────────────────── */
const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:8000";

/* ── Types ────────────────────────────────────────────────── */
type UploadStatus = "idle" | "uploading" | "processing" | "done" | "error";
interface FileItem {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  videoId: string | null;
  errorMsg: string | null;
  abortCtrl: AbortController | null;
}
interface UploadResponse {
  message: string;
  video_id: string;
}

/* ── Pipeline steps ─────────────────────────────────────── */
const PIPELINE_STEPS = [
  { n: "01", label: "Video Upload",     desc: "Chunked multipart stream to the ingestion server.",           color: "text-[#52c6ff]", border: "border-[#52c6ff]/25", bg: "bg-[#52c6ff]/10"  },
  { n: "02", label: "Frame Extraction", desc: "FFmpeg decodes and extracts 1 frame/sec as JPEG.",            color: "text-[#3b9eff]", border: "border-[#3b9eff]/25", bg: "bg-[#3b9eff]/10"  },
  { n: "03", label: "CLIP Embedding",   desc: "Each frame through CLIP ViT-L/14 on GPU — 768-dim vector.", color: "text-[#a78bfa]", border: "border-[#a78bfa]/25", bg: "bg-[#a78bfa]/10"  },
  { n: "04", label: "Vector Indexing",  desc: "Milvus 2.4 HNSW index — sub-40ms ANN similarity queries.",  color: "text-[#34d399]", border: "border-[#34d399]/25", bg: "bg-[#34d399]/10"  },
];

/* ── Helpers ──────────────────────────────────────────────── */
function uid() { return Math.random().toString(36).slice(2); }
function formatSize(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 ** 3) return `${(b / 1024 ** 2).toFixed(1)} MB`;
  return `${(b / 1024 ** 3).toFixed(2)} GB`;
}

/** XHR upload with byte-level progress, wrapped in async/await */
async function uploadWithProgress(
  file: File,
  onProgress: (n: number) => void,
  signal: AbortSignal
): Promise<UploadResponse> {
  return new Promise<UploadResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append("file", file);

    signal.addEventListener("abort", () => {
      xhr.abort();
      reject(new DOMException("Cancelled", "AbortError"));
    });

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    });

    xhr.onload = async () => {
      try {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText) as UploadResponse);
        } else {
          const err = JSON.parse(xhr.responseText)?.detail || `HTTP ${xhr.status}`;
          reject(new Error(err));
        }
      } catch {
        reject(new Error("Invalid JSON response"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.open("POST", `${API_BASE}/api/v1/videos/upload`);
    xhr.send(form);
  });
}

/** Poll GET /api/videos/:id until completed/failed */
async function pollStatus(videoId: string, signal: AbortSignal) {
  const deadline = Date.now() + 300_000;

  while (Date.now() < deadline) {
    if (signal.aborted) return "failed";
    await new Promise((r) => setTimeout(r, 3000));
    try {
      const res = await fetch(`${API_BASE}/api/v1/videos/${videoId}`);
      if (!res.ok) continue;
      const d = await res.json();
      if (d.status === "ready") return "completed";
      if (d.status === "failed") return "failed";
    } catch { /* network blip — keep polling */ }
  }

  return "timeout";
}

/* ── Status badge ────────────────────────────────────────── */
function StatusBadge({ status, progress }: { status: UploadStatus; progress: number }) {
  const map: Record<UploadStatus, { cls: string; label: string }> = {
    idle:       { cls: "font-mono text-[10px] text-[#52c6ff] bg-[#52c6ff]/10 border border-[#52c6ff]/25 px-2 py-0.5 rounded",            label: "READY" },
    uploading:  { cls: "font-mono text-[10px] text-yellow-300 bg-yellow-400/10 border border-yellow-400/25 px-2 py-0.5 rounded",         label: `UPLOADING ${progress}%` },
    processing: { cls: "font-mono text-[10px] text-yellow-300 bg-yellow-400/10 border border-yellow-400/25 px-2 py-0.5 rounded animate-pulse", label: "PROCESSING" },
    done:       { cls: "font-mono text-[10px] text-green-300 bg-green-400/10 border border-green-400/25 px-2 py-0.5 rounded",            label: "INDEXED" },
    error:      { cls: "font-mono text-[10px] text-red-300 bg-red-400/10 border border-red-400/25 px-2 py-0.5 rounded",                  label: "ERROR" },
  };
  const { cls, label } = map[status];
  return <span className={cls}>{label}</span>;
}

/* ── Upload component ────────────────────────────────────── */
export function Upload() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);

  const patch = useCallback(
    (id: string, delta: Partial<FileItem>) =>
      setFiles((p) => p.map((f) => (f.id === id ? { ...f, ...delta } : f))),
    []
  );

  const addFiles = useCallback((list: FileList | null) => {
    if (!list) return;
    const valid = Array.from(list).filter(
      (f) => f.type.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm|flv|wmv|m4v)$/i.test(f.name)
    );
    if (!valid.length) return;
    setFiles((p) => [
      ...p,
      ...valid.map<FileItem>((f) => ({
        id: uid(), file: f, status: "idle", progress: 0,
        videoId: null, errorMsg: null, abortCtrl: null,
      })),
    ]);
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); },
    [addFiles]
  );

  const startUpload = useCallback(
    async (id: string) => {
      const abort = new AbortController();

      setFiles((p) => {
        const item = p.find((f) => f.id === id);
        if (!item || item.status !== "idle") return p;
        return p.map((f) =>
          f.id === id ? { ...f, status: "uploading" as UploadStatus, progress: 0, abortCtrl: abort, errorMsg: null } : f
        );
      });

      // Grab the file outside of setFiles so we can use it in the async flow
      const item = files.find((f) => f.id === id);
      if (!item) return;

      try {
        const data = await uploadWithProgress(
          item.file,
          (pct) => patch(id, { progress: pct }),
          abort.signal
        );
        patch(id, { status: "processing", progress: 100, videoId: data.video_id });

        const result = await pollStatus(data.video_id, abort.signal);
        patch(id, {
          status: result === "completed" ? "done" : "error",
          abortCtrl: null,
          errorMsg:
            result === "failed"  ? "Server-side processing failed" :
            result === "timeout" ? "Processing timed out" : null,
        });
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          patch(id, { status: "idle", progress: 0, abortCtrl: null });
        } else {
          patch(id, {
            status: "error",
            errorMsg: err instanceof Error ? err.message : "Upload failed",
            abortCtrl: null,
          });
        }
      }
    },
    [files, patch]
  );

  const cancelUpload = useCallback((item: FileItem) => item.abortCtrl?.abort(), []);
  const retryUpload  = useCallback(
    (id: string) => { patch(id, { status: "idle", progress: 0, errorMsg: null }); setTimeout(() => startUpload(id), 0); },
    [patch, startUpload]
  );
  const removeFile = useCallback((id: string) => {
    setFiles((p) => { p.find((f) => f.id === id)?.abortCtrl?.abort(); return p.filter((f) => f.id !== id); });
  }, []);

  const idleCount = files.filter((f) => f.status === "idle").length;
  const doneCount = files.filter((f) => f.status === "done").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@400;600;700;800&display=swap');
        body { font-family: 'Syne', sans-serif; background: #050d14; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .animate-fade-up { animation: fadeUp 0.4s ease both; }
        .animate-float   { animation: float 3s ease-in-out infinite; }
        .animate-shimmer {
          background: linear-gradient(90deg, #a78bfa 25%, #c4b5fd 50%, #a78bfa 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
      `}</style>

      <div className="max-w-[1360px] mx-auto px-6 pt-9 pb-16 text-[#e8f4ff]">

        {/* ── Header ── */}
        <div className="animate-fade-up mb-8">
          <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-mono tracking-wider bg-[#52c6ff]/10 text-[#52c6ff] border border-[#52c6ff]/25 mb-4">
            PHASE 1 · INGESTION
          </span>
          <h1 className="text-[36px] font-extrabold tracking-tight mb-2.5">
            Upload <span className="text-[#52c6ff]">Videos</span>
          </h1>
          <p className="text-sm text-white/55 max-w-xl leading-relaxed">
            Drop any video file below. Our pipeline will extract frames, generate CLIP embeddings,
            and make it searchable with natural language — automatically.
          </p>
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-5 items-start">

          {/* ── LEFT ── */}
          <div>

            {/* Drop zone */}
            <div
              className={`animate-fade-up [animation-delay:80ms] relative border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all duration-200 mb-5
                ${dragging
                  ? "border-[#52c6ff]/55 bg-[#52c6ff]/[0.04]"
                  : "border-[#52c6ff]/[0.22] hover:border-[#52c6ff]/40 hover:bg-[#52c6ff]/[0.03]"}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />

              <div className="animate-float mb-5">
                <div className="w-[72px] h-[72px] rounded-2xl border border-[#52c6ff]/30 bg-[#52c6ff]/[0.06] flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-[#52c6ff]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 22V8M10 14l6-6 6 6" /><path d="M5 26h22" />
                  </svg>
                </div>
              </div>

              <p className="text-[17px] font-bold mb-2">
                {dragging ? "Release to add files" : "Drop videos here"}
              </p>
              <p className="text-[13px] text-white/50 mb-4">
                or click to browse — MP4, MOV, AVI, MKV, WebM
              </p>
              <div className="flex gap-2 justify-center flex-wrap">
                {["Max 10 GB / file", "Up to 20 files", "GPU-accelerated"].map((t) => (
                  <span key={t} className="font-mono text-[10px] text-[#52c6ff] bg-[#52c6ff]/10 border border-[#52c6ff]/25 px-2 py-1 rounded">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* File queue */}
            {files.length > 0 && (
              <div className="animate-fade-up bg-[#0e1628]/90 border border-[#52c6ff]/15 rounded-2xl backdrop-blur-xl p-4">

                {/* Queue header */}
                <div className="flex justify-between items-center mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[10px] text-[#52c6ff]/60 tracking-[0.1em]">
                      QUEUED FILES ({files.length})
                    </span>
                    {doneCount > 0 && (
                      <span className="font-mono text-[10px] text-green-300 bg-green-400/10 border border-green-400/25 px-2 py-0.5 rounded">
                        {doneCount} INDEXED
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {idleCount > 0 && (
                      <button
                        onClick={() => files.filter((f) => f.status === "idle").forEach((f) => startUpload(f.id))}
                        className="px-4 py-1.5 text-[12px] font-semibold text-[#52c6ff] bg-[#52c6ff]/15 border border-[#52c6ff]/45 rounded-lg hover:bg-[#52c6ff]/25 transition-all cursor-pointer font-mono"
                      >
                        Upload All ({idleCount})
                      </button>
                    )}
                    <button
                      onClick={() => setFiles([])}
                      className="px-3 py-1.5 text-[12px] font-semibold text-white/45 border border-[#52c6ff]/[0.18] rounded-lg bg-transparent hover:bg-[#52c6ff]/5 hover:text-white transition-all cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* File rows */}
                <div className="flex flex-col gap-2">
                  {files.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-xl p-3 border transition-colors ${
                        item.status === "error"
                          ? "bg-red-500/[0.04] border-red-500/20"
                          : "bg-[#52c6ff]/[0.03] border-[#52c6ff]/10"
                      }`}
                    >
                      <div className="flex justify-between items-center gap-2">

                        {/* File info */}
                        <div className="flex gap-2.5 items-center min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#52c6ff]/[0.12] flex items-center justify-center shrink-0">
                            <svg className="w-3.5 h-3.5 text-[#52c6ff]" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                              <path d="M2 2h7l3 3v7H2z" /><path d="M9 2v3h3" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold truncate">{item.file.name}</p>
                            <p className="font-mono text-[10px] text-white/35">
                              {formatSize(item.file.size)}
                              {item.videoId && (
                                <span className="ml-2 text-[#52c6ff]/50">id:{item.videoId.slice(0, 8)}…</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <StatusBadge status={item.status} progress={item.progress} />

                          {item.status === "idle" && (
                            <button
                              onClick={() => startUpload(item.id)}
                              className="px-3 py-1 text-[11px] font-semibold text-[#52c6ff] bg-[#52c6ff]/15 border border-[#52c6ff]/40 rounded-md hover:bg-[#52c6ff]/25 transition-all cursor-pointer"
                            >
                              Upload
                            </button>
                          )}
                          {(item.status === "uploading" || item.status === "processing") && (
                            <button
                              onClick={() => cancelUpload(item)}
                              className="px-3 py-1 text-[11px] text-white/45 border border-[#52c6ff]/[0.18] rounded-md bg-transparent hover:text-white hover:border-[#52c6ff]/35 transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                          {item.status === "error" && (
                            <button
                              onClick={() => retryUpload(item.id)}
                              className="px-3 py-1 text-[11px] font-semibold text-[#52c6ff] bg-[#52c6ff]/15 border border-[#52c6ff]/40 rounded-md hover:bg-[#52c6ff]/25 transition-all cursor-pointer"
                            >
                              Retry
                            </button>
                          )}
                          {item.status === "done" && (
                            <button
                              onClick={() => navigate(`/search?q=video:${item.videoId}`)}
                              className="px-3 py-1 text-[11px] text-white/45 border border-[#52c6ff]/[0.18] rounded-md bg-transparent hover:text-[#52c6ff] hover:border-[#52c6ff]/35 transition-all cursor-pointer"
                            >
                              Search ↗
                            </button>
                          )}

                          <button
                            onClick={() => removeFile(item.id)}
                            className="w-6 h-6 flex items-center justify-center border border-[#52c6ff]/15 rounded text-white/35 hover:text-white hover:border-[#52c6ff]/35 transition-all cursor-pointer bg-transparent"
                          >
                            <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                              <line x1="1" y1="1" x2="9" y2="9" /><line x1="9" y1="1" x2="1" y2="9" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {(item.status === "uploading" || item.status === "processing") && (
                        <div className="mt-2.5">
                          <div className="h-[3px] bg-[#52c6ff]/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-200 ${
                                item.status === "processing" ? "animate-shimmer w-full" : "bg-[#52c6ff]"
                              }`}
                              style={item.status === "uploading" ? { width: `${item.progress}%` } : undefined}
                            />
                          </div>
                          <p className="font-mono text-[10px] text-white/30 mt-1.5">
                            {item.status === "uploading"
                              ? `Uploading… ${item.progress}%`
                              : "Processing frames with CLIP…"}
                          </p>
                        </div>
                      )}

                      {item.status === "done" && (
                        <p className="font-mono text-[10px] text-green-400 mt-2">
                          ✓ Indexed and searchable · video_id: {item.videoId}
                        </p>
                      )}
                      {item.status === "error" && item.errorMsg && (
                        <p className="font-mono text-[10px] text-red-400 mt-2">✗ {item.errorMsg}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT ── */}
          <div className="flex flex-col gap-3.5">

            {/* Pipeline */}
            <div className="animate-fade-up [animation-delay:160ms] bg-[#0e1628]/90 border border-[#52c6ff]/15 rounded-2xl backdrop-blur-xl p-4">
              <p className="font-mono text-[10px] text-[#52c6ff]/60 tracking-[0.1em] mb-4">
                PROCESSING PIPELINE
              </p>
              {PIPELINE_STEPS.map((s, i) => (
                <div key={s.n} className="flex gap-3 items-start">
                  <div className="flex flex-col items-center">
                    <div className={`w-[34px] h-[34px] rounded-xl ${s.bg} border ${s.border} flex items-center justify-center shrink-0`}>
                      <span className={`font-mono text-[11px] ${s.color}`}>{s.n}</span>
                    </div>
                    {i < PIPELINE_STEPS.length - 1 && (
                      <div className="w-px h-7 bg-[#52c6ff]/10 my-1" />
                    )}
                  </div>
                  <div className="pt-2 pb-1">
                    <p className={`text-[13px] font-semibold mb-1 ${s.color}`}>{s.label}</p>
                    <p className="text-[11px] text-white/50 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* API info */}
            <div className="animate-fade-up [animation-delay:210ms] bg-[#0b1220]/80 border border-[#52c6ff]/[0.12] rounded-xl backdrop-blur-lg p-4">
              <p className="font-mono text-[10px] text-[#52c6ff]/60 tracking-[0.1em] mb-2.5">
                API ENDPOINT
              </p>
              <div className="bg-[#52c6ff]/[0.04] border border-[#52c6ff]/[0.12] rounded-lg p-3">
                <p className="font-mono text-[11px] text-[#52c6ff] mb-1.5">
                  POST /api/videos/upload
                </p>
                <p className="font-mono text-[10px] text-white/40 leading-relaxed">
                  Content-Type: multipart/form-data<br />
                  Field: <span className="text-[#52c6ff]/65">video</span> (File)<br />
                  Returns: <span className="text-green-400">VideoUploadResponse</span>
                </p>
              </div>
            </div>

            {/* Formats */}
            <div className="animate-fade-up [animation-delay:250ms] bg-[#0b1220]/80 border border-[#52c6ff]/[0.12] rounded-xl backdrop-blur-lg p-4">
              <p className="font-mono text-[10px] text-[#52c6ff]/60 tracking-[0.1em] mb-3">
                SUPPORTED FORMATS
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["MP4", "MOV", "AVI", "MKV", "WebM", "FLV", "WMV", "M4V"].map((f) => (
                  <span key={f} className="font-mono text-[10px] text-[#52c6ff] bg-[#52c6ff]/10 border border-[#52c6ff]/[0.22] px-2 py-1 rounded">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Search link */}
            <button
              onClick={() => navigate("/search")}
              className="animate-fade-up [animation-delay:290ms] w-full flex items-center justify-center gap-2 py-3 text-[13px] font-semibold text-white/50 border border-[#52c6ff]/[0.18] rounded-xl bg-transparent hover:bg-[#52c6ff]/5 hover:text-white hover:border-[#52c6ff]/35 transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="6" cy="6" r="4" /><line x1="9" y1="9" x2="12" y2="12" />
              </svg>
              Search Existing Videos
            </button>
          </div>
        </div>
      </div>
    </>
  );
}