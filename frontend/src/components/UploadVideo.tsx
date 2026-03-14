import { useState, useRef, DragEvent } from "react";
import { useNavigate } from "react-router-dom";

const PIPELINE_STEPS = [
  {
    n: "01", label: "Video Upload",
    desc: "Securely streamed to the ingestion server via chunked multipart upload.",
    color: "#52c6ff", bg: "rgba(82,198,255,0.1)",
  },
  {
    n: "02", label: "Frame Extraction",
    desc: "FFmpeg decodes the video and extracts 1 frame per second as JPEG.",
    color: "#3b9eff", bg: "rgba(59,158,255,0.1)",
  },
  {
    n: "03", label: "CLIP Embedding",
    desc: "Each frame is run through CLIP ViT-L/14 on GPU — generating a 768-dim vector.",
    color: "#a78bfa", bg: "rgba(167,139,250,0.1)",
  },
  {
    n: "04", label: "Vector Indexing",
    desc: "Embeddings stored in Milvus 2.4 with HNSW index for sub-40ms ANN queries.",
    color: "#34d399", bg: "rgba(52,211,153,0.1)",
  },
];

type UploadStatus = "idle" | "uploading" | "processing" | "done" | "error";

interface FileItem { file: File; status: UploadStatus; progress: number; id: string; }

function formatSize(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export function UploadVideo() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const items: FileItem[] = Array.from(newFiles)
      .filter(f => f.type.startsWith("video/") || f.name.match(/\.(mp4|mov|avi|mkv|webm)$/i))
      .map(f => ({ file: f, status: "idle", progress: 0, id: Math.random().toString(36).slice(2) }));
    if (!items.length) return;
    setFiles(prev => [...prev, ...items]);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault(); setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const simulateUpload = (id: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: "uploading", progress: 0 } : f));
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 18 + 4;
      if (prog >= 100) {
        clearInterval(interval);
        setFiles(prev => prev.map(f => f.id === id ? { ...f, status: "processing", progress: 100 } : f));
        setTimeout(() => {
          setFiles(prev => prev.map(f => f.id === id ? { ...f, status: "done" } : f));
        }, 2400);
      } else {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: Math.round(prog) } : f));
      }
    }, 180);
  };

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));

  const statusBadge = (s: UploadStatus, p: number) => {
    if (s === "idle")       return <span className="badge">READY</span>;
    if (s === "uploading")  return <span className="badge badge-warn">UPLOADING {p}%</span>;
    if (s === "processing") return <span className="badge badge-warn">PROCESSING</span>;
    if (s === "done")       return <span className="badge badge-success">INDEXED</span>;
    if (s === "error")      return <span className="badge badge-error">ERROR</span>;
  };

  return (
    <div className="page" style={{ paddingTop: 36 }}>
      <div className="animate-fadeUp" style={{ marginBottom: 32 }}>
        <div className="badge" style={{ marginBottom: 12 }}>PHASE 1 · INGESTION</div>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.8px", marginBottom: 10 }}>
          Upload <span className="text-cyan">Videos</span>
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 520, lineHeight: 1.7 }}>
          Drop any video file below. Our pipeline will extract frames, generate CLIP embeddings, and make it searchable with natural language — automatically.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>

        {/* LEFT: upload zone + file list */}
        <div>
          {/* Drop zone */}
          <div
            className={`animate-fadeUp upload-zone${dragging ? " dragging" : ""}`}
            style={{ animationDelay: ".1s", marginBottom: 20 }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="video/*" multiple style={{ display: "none" }} onChange={e => addFiles(e.target.files)} />

            {/* animated icon */}
            <div className="animate-float" style={{ marginBottom: 20 }}>
              <div style={{ width: 72, height: 72, borderRadius: 16, border: "1.5px solid var(--cyan-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", background: "rgba(82,198,255,0.06)" }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 20V8M10 14l6-6 6 6" />
                  <path d="M6 24h20" />
                </svg>
              </div>
            </div>

            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>
              {dragging ? "Release to add files" : "Drop videos here"}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
              or click to browse — MP4, MOV, AVI, MKV, WebM
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {["Max 10GB / file", "Up to 20 files", "GPU-accelerated"].map(t => (
                <span key={t} className="badge">{t}</span>
              ))}
            </div>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="animate-fadeIn card-elevated" style={{ padding: "16px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div className="font-mono" style={{ fontSize: 10, color: "var(--cyan-dim)", letterSpacing: ".1em" }}>
                  QUEUED FILES ({files.length})
                </div>
                <button
                  className="btn btn-primary"
                  style={{ padding: "6px 16px", fontSize: 12 }}
                  onClick={() => files.filter(f => f.status === "idle").forEach(f => simulateUpload(f.id))}
                >
                  Upload All
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {files.map(item => (
                  <div key={item.id} style={{ background: "rgba(82,198,255,0.03)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 6, background: "var(--cyan-ghost)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round"><path d="M2 2h7l3 3v7H2z"/><path d="M9 2v3h3"/></svg>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.file.name}</div>
                          <div className="font-mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>{formatSize(item.file.size)}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                        {statusBadge(item.status, item.progress)}
                        {item.status === "idle" && (
                          <button className="btn btn-primary" style={{ padding: "4px 12px", fontSize: 11 }} onClick={() => simulateUpload(item.id)}>Upload</button>
                        )}
                        <button
                          style={{ width: 26, height: 26, border: "1px solid var(--border-subtle)", borderRadius: 5, background: "transparent", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          onClick={() => removeFile(item.id)}
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/></svg>
                        </button>
                      </div>
                    </div>

                    {(item.status === "uploading" || item.status === "processing") && (
                      <div>
                        <div style={{ height: 3, background: "var(--cyan-ghost)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${item.status === "processing" ? 100 : item.progress}%`, background: item.status === "processing" ? "#a78bfa" : "var(--cyan)", borderRadius: 2, transition: "width .2s ease", animation: item.status === "processing" ? "shimmer 1.2s ease-in-out infinite" : "none" }} />
                        </div>
                        <div className="font-mono" style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                          {item.status === "uploading" ? `Uploading… ${item.progress}%` : "Processing frames with CLIP…"}
                        </div>
                      </div>
                    )}
                    {item.status === "done" && (
                      <div className="font-mono" style={{ fontSize: 10, color: "#34d399" }}>✓ Indexed and searchable</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: pipeline viz */}
        <div>
          <div className="animate-fadeUp card-elevated" style={{ animationDelay: ".18s", padding: "18px 16px", marginBottom: 14 }}>
            <div className="font-mono" style={{ fontSize: 10, color: "var(--cyan-dim)", letterSpacing: ".1em", marginBottom: 16 }}>PROCESSING PIPELINE</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {PIPELINE_STEPS.map((s, i) => (
                <div key={s.n} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: s.bg, border: `1px solid ${s.color}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span className="font-mono" style={{ fontSize: 11, color: s.color }}>{s.n}</span>
                    </div>
                    {i < PIPELINE_STEPS.length - 1 && (
                      <div style={{ width: 1, height: 28, background: "var(--border-subtle)", margin: "3px 0" }} />
                    )}
                  </div>
                  <div style={{ paddingTop: 6, paddingBottom: i < PIPELINE_STEPS.length - 1 ? 0 : 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3, color: s.color }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.55 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supported formats */}
          <div className="animate-fadeUp card" style={{ animationDelay: ".24s", padding: "14px 16px", marginBottom: 14 }}>
            <div className="font-mono" style={{ fontSize: 10, color: "var(--cyan-dim)", letterSpacing: ".1em", marginBottom: 10 }}>SUPPORTED FORMATS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["MP4", "MOV", "AVI", "MKV", "WebM", "FLV", "WMV", "M4V"].map(f => (
                <span key={f} className="badge">{f}</span>
              ))}
            </div>
          </div>

          <div className="animate-fadeUp" style={{ animationDelay: ".3s" }}>
            <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={() => navigate("/search")}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="6" cy="6" r="4"/><line x1="9" y1="9" x2="12" y2="12"/></svg>
              Search Existing Videos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}