import { useRef, useEffect, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/* ── Animated neural background canvas ─────────────────── */
export function NeuralCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    type Node = { x: number; y: number; vx: number; vy: number; r: number };
    const nodes: Node[] = Array.from({ length: 55 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.8,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > c.width) n.vx *= -1;
        if (n.y < 0 || n.y > c.height) n.vy *= -1;
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const d = Math.hypot(n.x - m.x, n.y - m.y);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = `rgba(82,198,255,${0.1 * (1 - d / 130)})`;
            ctx.lineWidth = 0.6; ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(82,198,255,0.5)"; ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas
      ref={ref}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", opacity: 0.4, pointerEvents: "none", zIndex: 1 }}
    />
  );
}

/* ── SVG Icons ──────────────────────────────────────────── */
const HomeIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 7l6-5 6 5v7H10v-4H6v4H2z" />
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="7" cy="7" r="4.5" /><line x1="10.5" y1="10.5" x2="14" y2="14" />
  </svg>
);
const UploadIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 10V3M5 6l3-3 3 3" /><path d="M3 12h10" />
  </svg>
);

/* ── Navbar ─────────────────────────────────────────────── */
export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const active = (p: string) => location.pathname === p || location.pathname.startsWith(p + "?");

  return (
    <nav className="navbar">
      <button className="navbar-brand" onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer" }}>
        <div className="brand-mark">
          <div className="brand-ring" />
          <div className="brand-dot" />
        </div>
        <div>
          <div className="brand-name">VectorVision</div>
          <div className="brand-sub">SEMANTIC VIDEO SEARCH</div>
        </div>
      </button>

      <div className="navbar-nav">
        {[
          { label: "Home", path: "/", Icon: HomeIcon },
          { label: "Search", path: "/search", Icon: SearchIcon },
          { label: "Upload", path: "/upload", Icon: UploadIcon },
        ].map(({ label, path, Icon }) => (
          <button
            key={path}
            className={`nav-link${active(path) ? " active" : ""}`}
            onClick={() => navigate(path)}
          >
            <Icon />{label}
          </button>
        ))}
      </div>

      <div className="nav-status">
        <div className="status-dot" />
        SYSTEM ONLINE
      </div>
    </nav>
  );
}

/* ── Root Layout ────────────────────────────────────────── */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="scanline" />
      <div className="grid-bg" />
      <NeuralCanvas />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <Navbar />
      <main style={{ position: "relative", zIndex: 5 }}>
        {children}
      </main>
    </>
  );
}