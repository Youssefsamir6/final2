// ═══════════════════════════════════════════════════════════════════════════════
// GUARDIAN AI — App Logic
// Smart Attendance & Monitoring System
// ═══════════════════════════════════════════════════════════════════════════════

const { useState, useEffect, useRef, useCallback } = React;

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
const BASE = "http://127.0.0.1:8000";

const PAGES = [
  { id: "realtime", label: "Live Monitor", icon: "📷" },
  { id: "pipeline", label: "Pipeline",     icon: "⚡" },
  { id: "database", label: "Database",     icon: "👤" },
  { id: "dataset",  label: "Dataset",      icon: "📁" },
];

const PIPELINE_STAGES = [
  { key: "validation",   label: "Validating dataset" },
  { key: "building_db", label: "Building databases" },
  { key: "loading_test", label: "Loading test images" },
  { key: "optimizing",  label: "Genetic optimization" },
  { key: "benchmarking",label: "Benchmarking models" },
  { key: "done",        label: "Complete" },
];

const PAGE_NAV_KEY       = "guardian_current_page";
const PIPELINE_CACHE_KEY = "guardian_pipeline_result";

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL STREAM STATE — survives component unmount/remount across navigation
// ═══════════════════════════════════════════════════════════════════════════════
const STREAM_STATE = {
  running: false,   // true while backend stream is active
  dbReady: false,
  modelsOk: false,
};

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL PIPELINE STATE — survives navigation so UI restores correctly on remount
// ═══════════════════════════════════════════════════════════════════════════════
const PIPELINE_STATE = {
  loading:  false,      // are we currently polling?
  progress: null,       // last known progress object
};

// ═══════════════════════════════════════════════════════════════════════════════
// API CLIENT
// ═══════════════════════════════════════════════════════════════════════════════
const api = async (method, path, body = null, isForm = false) => {
  const opts = { method, headers: {} };
  if (body) {
    if (isForm) {
      opts.body = body;
    } else {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
  }
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
};

// ═══════════════════════════════════════════════════════════════════════════════
// LOCAL STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
const storage = {
  get: (key, fallback = null) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { /* quota exceeded */ }
  },
  del: (key) => {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TOAST SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════
let _toastId  = 0;
let _setToasts = null;

const toast = {
  show: (msg, type = "info") => {
    const id = ++_toastId;
    _setToasts && _setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => _setToasts && _setToasts(prev => prev.filter(t => t.id !== id)), 3800);
  },
  ok:   (m) => toast.show(m, "success"),
  err:  (m) => toast.show(m, "error"),
  info: (m) => toast.show(m, "info"),
};

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    _setToasts = setToasts;
    return () => { _setToasts = null; };
  }, []);
  const icons = { success: "✓", error: "✕", info: "◈" };
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className="toast-icon">{icons[t.type]}</span>
          <span className="toast-msg">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

function Spinner({ light }) {
  return <div className={`spinner${light ? " light" : ""}`} />;
}

function Banner({ type, title, children, list }) {
  const icons = { error: "⚠", success: "✓", warn: "◈" };
  return (
    <div className={`banner ${type}`}>
      <span className="banner-icon">{icons[type]}</span>
      <div className="banner-body">
        <div className="banner-title">{title}</div>
        {children && <div style={{ marginTop: 4, opacity: 0.85 }}>{children}</div>}
        {list && list.length > 0 && (
          <ul className="banner-list">
            {list.map(x => <li key={x}>{x}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}

function DropZone({ onFile, preview }) {
  const [drag, setDrag] = useState(false);
  return (
    <div
      className={`drop-zone${drag ? " drag-over" : ""}`}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
    >
      <input
        type="file"
        accept="image/*"
        onChange={e => e.target.files[0] && onFile(e.target.files[0])}
      />
      {preview
        ? <img src={preview} className="preview-img" alt="preview" />
        : <>
            <div className="drop-icon">🖼</div>
            <div className="drop-text">Drop image or click to browse</div>
            <div className="drop-hint">JPG · PNG · BMP · WEBP</div>
          </>
      }
    </div>
  );
}

function PersonCard({ person, onDelete, showMissing }) {
  const initials = person.name.slice(0, 2).toUpperCase();
  return (
    <div className={`person-card${showMissing ? " missing" : ""}`}>
      <div className="person-avatar">{initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="person-name">{person.name}</div>
        <div className="person-count">
          {person.image_count} image{person.image_count !== 1 ? "s" : ""}
        </div>
        {showMissing && <span className="person-badge badge-missing">Missing test</span>}
        {!showMissing && person.in_db !== undefined && (
          <span className={`person-badge ${person.in_db ? "badge-ok" : "badge-warn"}`}>
            {person.in_db ? "✓ In DB" : "⚠ No DB match"}
          </span>
        )}
      </div>
      {onDelete && (
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(person.name)}
          title="Remove"
        >✕</button>
      )}
    </div>
  );
}

function EmptyState({ icon = "📭", title, sub }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      {sub && <div className="empty-sub">{sub}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHART COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function BarChart({ pure, hybrid }) {
  const metrics = [
    { key: "accuracy",  label: "Accuracy" },
    { key: "precision", label: "Precision" },
    { key: "recall",    label: "Recall" },
    { key: "f1_score",  label: "F1 Score" },
  ];
  return (
    <div className="bar-chart">
      {metrics.map(m => (
        <div key={m.key}>
          <div className="bar-metric-label">{m.label}</div>
          <div className="bar-row">
            <div className="bar-lbl">InsightFace</div>
            <div className="bar-track">
              <div className="bar-fill pure" style={{ width: `${(pure[m.key] * 100).toFixed(1)}%` }}>
                <span>{(pure[m.key] * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <div className="bar-row" style={{ marginTop: 4 }}>
            <div className="bar-lbl">Hybrid</div>
            <div className="bar-track">
              <div className="bar-fill hybrid" style={{ width: `${(hybrid[m.key] * 100).toFixed(1)}%` }}>
                <span>{(hybrid[m.key] * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ConfusionMatrix({ matrix, labels }) {
  if (!matrix || !labels) return null;
  const max = Math.max(...matrix.flat());
  const getStyle = (v) => {
    const alpha = max > 0 ? v / max : 0;
    const bg = v === 0
      ? "var(--surface3)"
      : `rgba(0, 212, 255, ${0.08 + alpha * 0.7})`;
    const color = alpha > 0.6 ? "#000" : "var(--text)";
    return { background: bg, color };
  };
  return (
    <div className="cm-wrap">
      <table className="cm-table">
        <thead>
          <tr>
            <th />
            {labels.map(l => (
              <th key={l} style={{ color: "var(--accent)", fontSize: 9 }}>
                {l.substring(0, 8)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <th style={{ textAlign: "right", paddingRight: 10, color: "var(--text2)", fontSize: 9 }}>
                {labels[i].substring(0, 8)}
              </th>
              {row.map((v, j) => (
                <td key={j} style={getStyle(v)}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE: REALTIME
// ═══════════════════════════════════════════════════════════════════════════════

function RealtimePage() {
  // Initialise directly from global state — no flicker on remount
  const [streaming,  setStreaming]  = useState(STREAM_STATE.running);
  const [dbReady,    setDbReady]    = useState(STREAM_STATE.dbReady);
  const [modelsOk,   setModelsOk]   = useState(STREAM_STATE.modelsOk);
  const [buildingDb, setBuildingDb] = useState(false);
  const imgRef = useRef(null);

  const getStreamUrl = useCallback(
    () => `${BASE}/realtime/stream?t=${Date.now()}`,
    []
  );

  // Re-attach the img src without flickering — only update if URL actually differs
  const attachStream = useCallback(() => {
    if (!imgRef.current) return;
    const next = getStreamUrl();
    // Only reassign if the element currently has no src or an obviously stale one
    if (!imgRef.current.src || !imgRef.current.src.includes("/realtime/stream")) {
      imgRef.current.src = next;
    } else {
      // Keep the existing live connection — just ensure element is visible
      imgRef.current.style.opacity = "1";
    }
  }, [getStreamUrl]);

  // On mount: fetch fresh status + reconnect stream if it was previously running
  useEffect(() => {
    api("GET", "/realtime/status")
      .then(d => {
        const dbOk   = d.db_ready     ?? STREAM_STATE.dbReady;
        const mOk    = d.models_loaded ?? STREAM_STATE.modelsOk;
        STREAM_STATE.dbReady   = dbOk;
        STREAM_STATE.modelsOk  = mOk;
        setDbReady(dbOk);
        setModelsOk(mOk);
      })
      .catch(() => {});

    // If stream was running before we navigated away, reconnect immediately
    if (STREAM_STATE.running) {
      // Small delay so the img element is mounted and ref is ready
      const t = setTimeout(attachStream, 60);
      return () => clearTimeout(t);
    }
  }, [attachStream]);

  // Reconnect when tab regains focus (handles OS-level tab switch)
  useEffect(() => {
    const onFocus = () => {
      if (STREAM_STATE.running && imgRef.current) {
        // Only force reconnect if src looks broken (empty or error state)
        if (!imgRef.current.src || imgRef.current.naturalWidth === 0) {
          imgRef.current.src = getStreamUrl();
        }
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [getStreamUrl]);

  const handleBuildDb = async () => {
    setBuildingDb(true);
    try {
      await api("POST", "/realtime/build-db");
      STREAM_STATE.dbReady = true;
      setDbReady(true);
      toast.ok("Recognition database built — ready to stream.");
    } catch (e) {
      toast.err(e.message);
    } finally {
      setBuildingDb(false);
    }
  };

  const handleStream = () => {
    if (streaming) {
      // Stop stream
      api("POST", "/realtime/stop").catch(() => {});
      if (imgRef.current) imgRef.current.src = "";
      STREAM_STATE.running = false;
      setStreaming(false);
    } else {
      // Start stream
      STREAM_STATE.running = true;
      setStreaming(true);
      // Use rAF to ensure the img element is visible before we set src
      requestAnimationFrame(() => {
        if (imgRef.current) imgRef.current.src = getStreamUrl();
      });
    }
  };

  const handleStreamError = () => {
    // Only treat as a hard error if we expected the stream to be running
    if (STREAM_STATE.running) {
      STREAM_STATE.running = false;
      setStreaming(false);
      toast.err("Stream disconnected — check the backend.");
    }
  };

  const statusRows = [
    ["YOLO Detector",   modelsOk,  "Loaded"],
    ["InsightFace",     modelsOk,  "Loaded"],
    ["Hybrid Features", modelsOk,  "Loaded"],
    ["Recognition DB",  dbReady,   "Built"],
    ["Camera Stream",   streaming, "Active"],
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">Guardian AI · Monitor</div>
          <div className="page-title">Live <span className="hl">Camera</span></div>
          <div className="page-sub">Real-time face detection and recognition</div>
        </div>
      </div>

      {!modelsOk && (
        <Banner type="warn" title="Models initializing…">
          Backend is loading YOLO + InsightFace. This takes ~30s on first run.
        </Banner>
      )}

      {/* Stream viewport */}
      <div className="stream-wrap">
        {/*
          We always render the img element when streaming is true.
          The key trick: keep the img in the DOM while navigating by never
          setting src="" unless the user explicitly stops the stream.
        */}
        {streaming
          ? <img
              ref={imgRef}
              className="stream-img"
              alt="live stream"
              onError={handleStreamError}
            />
          : <div className="stream-off">
              <div className="stream-off-icon">📷</div>
              <div className="stream-off-text">Camera offline</div>
            </div>
        }

        {/* Corner brackets */}
        <div className="stream-corner tl" />
        <div className="stream-corner tr" />
        <div className="stream-corner bl" />
        <div className="stream-corner br" />

        {streaming && (
          <div className="live-badge">
            <div className="live-dot" />
            LIVE
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="stream-controls">
        <button
          className="btn btn-primary"
          onClick={handleStream}
          disabled={!modelsOk}
        >
          {streaming ? "⏹ Stop Stream" : "▶ Start Stream"}
        </button>
        <button
          className="btn btn-ghost"
          onClick={handleBuildDb}
          disabled={!modelsOk || buildingDb}
        >
          {buildingDb ? <><Spinner light /> Building DB…</> : "⟳ Build Recognition DB"}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 6 }}>
          <span className={`status-dot${dbReady ? " online" : ""}`} />
          <span className="status-text">{dbReady ? "DB Ready" : "DB not built"}</span>
        </div>
      </div>

      <div className="divider" />

      <div className="two-col">
        {/* How it works */}
        <div className="card">
          <div className="card-title">How It Works</div>
          {[
            ["Build Recognition DB", "to load embeddings from the face database"],
            ["Start Stream",         "to activate the webcam feed"],
            ["YOLO Detection",       "detects faces in each frame in real-time"],
            ["Hybrid Recognition",   "Gold = known · Red = unknown identity"],
          ].map(([hl, rest], i) => (
            <div key={i} className="how-step">
              <div className="how-num">{i + 1}</div>
              <div>
                <span className="how-hl">{hl}</span>{" "}
                <span>{rest}</span>
              </div>
            </div>
          ))}
        </div>

        {/* System status */}
        <div className="card">
          <div className="card-title">System Status</div>
          {statusRows.map(([lbl, ok, yes]) => (
            <div key={lbl} className="status-row">
              <span className="status-row-label">{lbl}</span>
              <span className={`status-row-val ${ok ? "ok" : "off"}`}>
                {ok ? `● ${yes}` : "○ Offline"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE: PIPELINE
// ═══════════════════════════════════════════════════════════════════════════════

// Single shared poll interval — lives outside React so it survives navigation
let _pipelinePollInterval = null;
// Registry of active PipelinePage setState callbacks (updated on each mount)
let _pipelineSetProgress  = null;
let _pipelineSetLoading   = null;
let _pipelineSetResult    = null;
let _pipelineSetResultSrc = null;

function startPipelinePolling() {
  if (_pipelinePollInterval) return; // already polling

  _pipelinePollInterval = setInterval(async () => {
    try {
      const p = await api("GET", "/pipeline/progress");

      // Write to global state so remounts can read it immediately
      PIPELINE_STATE.progress = p;

      // Update the currently mounted component if any
      _pipelineSetProgress && _pipelineSetProgress(p);

      if (!p.running) {
        stopPipelinePolling();
        PIPELINE_STATE.loading = false;
        _pipelineSetLoading && _pipelineSetLoading(false);

        if (p.error) {
          toast.err(`Pipeline failed: ${p.error}`);
        } else {
          try {
            const res = await api("GET", "/pipeline/result");
            if (res && res.status === "success") {
              storage.set(PIPELINE_CACHE_KEY, res);
              _pipelineSetResult    && _pipelineSetResult(res);
              _pipelineSetResultSrc && _pipelineSetResultSrc("live");
            }
          } catch { /* ignore */ }
          toast.ok("Pipeline complete — results ready.");
        }
      }
    } catch {
      stopPipelinePolling();
      PIPELINE_STATE.loading = false;
      _pipelineSetLoading && _pipelineSetLoading(false);
    }
  }, 1200);
}

function stopPipelinePolling() {
  if (_pipelinePollInterval) {
    clearInterval(_pipelinePollInterval);
    _pipelinePollInterval = null;
  }
}

function PipelinePage() {
  const [validation,   setValidation]   = useState(null);
  const [progress,     setProgress]     = useState(PIPELINE_STATE.progress);
  const [result,       setResult]       = useState(() => storage.get(PIPELINE_CACHE_KEY));
  const [loading,      setLoading]      = useState(PIPELINE_STATE.loading);
  const [resultSource, setResultSource] = useState(
    storage.get(PIPELINE_CACHE_KEY) ? "cache" : null
  );

  // Register this instance's setState callbacks so the shared poller can drive them
  useEffect(() => {
    _pipelineSetProgress  = setProgress;
    _pipelineSetLoading   = setLoading;
    _pipelineSetResult    = setResult;
    _pipelineSetResultSrc = setResultSource;

    return () => {
      // Deregister on unmount — poller keeps running but won't call stale setters
      _pipelineSetProgress  = null;
      _pipelineSetLoading   = null;
      _pipelineSetResult    = null;
      _pipelineSetResultSrc = null;
    };
  }, []);

  // On mount: check validation + probe backend for live state
  useEffect(() => {
    checkValidation();

    // Probe backend: is a pipeline currently running?
    api("GET", "/pipeline/progress")
      .then(p => {
        PIPELINE_STATE.progress = p;
        setProgress(p);

        if (p.running) {
          // Backend is running — make sure our UI reflects it and polling is active
          PIPELINE_STATE.loading = true;
          setLoading(true);
          startPipelinePolling(); // safe: no-op if already polling
        } else {
          // Not running — try to fetch the latest result silently
          PIPELINE_STATE.loading = false;
          setLoading(false);
          api("GET", "/pipeline/result")
            .then(data => {
              if (data && data.status === "success") {
                setResult(data);
                storage.set(PIPELINE_CACHE_KEY, data);
                setResultSource("live");
              }
            })
            .catch(() => { /* keep cached result */ });
        }
      })
      .catch(() => {
        // Backend unreachable — fall back to cached result silently
        PIPELINE_STATE.loading = false;
        setLoading(false);
      });
  }, []);

  const checkValidation = async () => {
    try { setValidation(await api("GET", "/pipeline/validate")); }
    catch (e) { toast.err(e.message); }
  };

  const handleStartPipeline = async () => {
    setLoading(true);
    PIPELINE_STATE.loading  = true;
    PIPELINE_STATE.progress = null;
    setProgress(null);
    setResult(null);
    setResultSource(null);

    try {
      const r = await api("POST", "/pipeline/run");
      if (r.status === "error") {
        toast.err(`Validation failed: ${r.missing_people?.join(", ")}`);
        setLoading(false);
        PIPELINE_STATE.loading = false;
        return;
      }
      toast.info("Pipeline started — optimizing parameters…");
      startPipelinePolling();
    } catch (e) {
      toast.err(e.message);
      setLoading(false);
      PIPELINE_STATE.loading = false;
    }
  };

  const stageIdx   = PIPELINE_STAGES.findIndex(s => s.key === progress?.stage);
  const lastUpdated = result?.timestamp
    ? new Date(result.timestamp).toLocaleString()
    : null;

  // Show progress card whenever loading OR when we have in-flight progress from a
  // previous navigation (progress present AND backend confirmed it's running)
  const showProgress = loading && progress;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">Guardian AI · Analysis</div>
          <div className="page-title">Pipeline <span className="hl">Dashboard</span></div>
          <div className="page-sub">Genetic optimization · Hybrid benchmarking · Full metrics</div>
        </div>
        {lastUpdated && (
          <div style={{
            fontFamily: "var(--mono)", fontSize: 10,
            color: "var(--text3)", textAlign: "right"
          }}>
            <div style={{ color: "var(--text2)", marginBottom: 2 }}>Last run</div>
            {lastUpdated}
          </div>
        )}
      </div>

      {/* Validation banner */}
      {validation && (
        validation.status === "ok"
          ? <Banner type="success" title="Dataset validation passed — ready to run" />
          : <Banner
              type="error"
              title="Missing test data — pipeline blocked"
              list={validation.missing_people}
            >
              Add test images for these people in the Dataset page.
            </Banner>
      )}

      {/* Controls */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28, alignItems: "center", flexWrap: "wrap" }}>
        <button
          className="btn btn-primary"
          onClick={handleStartPipeline}
          disabled={loading || validation?.status !== "ok"}
        >
          {loading ? <><Spinner /> Running…</> : "▶ Run Pipeline"}
        </button>
        <button className="btn btn-ghost" onClick={checkValidation} disabled={loading}>
          ⟳ Re-check Validation
        </button>
        {/* Inline running indicator when loading but progress not yet received */}
        {loading && !progress && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)"
          }}>
            <Spinner light />
            Connecting to pipeline…
          </div>
        )}
      </div>

      {/* Progress card — visible whenever pipeline is running (even after remount) */}
      {showProgress && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            Pipeline Progress
            <span style={{
              fontFamily: "var(--mono)", fontSize: 10,
              color: "var(--accent)", background: "var(--accent-dim)",
              border: "1px solid var(--accent-border)",
              padding: "2px 8px", borderRadius: 100,
            }}>RUNNING</span>
          </div>
          <div className="progress-wrap">
            <div
              className="progress-fill"
              style={{
                width: `${progress.percent}%`,
                transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
          </div>
          <div style={{
            fontFamily: "var(--mono)", fontSize: 11,
            color: "var(--accent)", marginBottom: 16
          }}>
            {progress.percent}% — {progress.message}
          </div>
          <div className="stages">
            {PIPELINE_STAGES.map((s, i) => {
              const isDone   = stageIdx > i || progress.stage === "done";
              const isActive = stageIdx === i && progress.running;
              return (
                <div
                  key={s.key}
                  className={`stage-row${isActive ? " active" : ""}${isDone ? " done" : ""}`}
                >
                  <div className="stage-dot" />
                  {s.label}
                  {isDone && <span style={{ marginLeft: 6, fontSize: 10 }}>✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Results */}
      {result && result.status === "success" && (
        <>
          {resultSource && (
            <div className={`result-meta ${resultSource}`}>
              <div className="result-meta-dot" />
              {resultSource === "cache"
                ? "Showing cached result — refreshing from backend…"
                : "Live result — freshly fetched from backend"}
            </div>
          )}

          {/* Metric cards */}
          <div className="metrics-grid">
            {[
              { label: "Accuracy",  val: result.hybrid.accuracy,  sub: "Hybrid MUFM" },
              { label: "Precision", val: result.hybrid.precision, sub: "Hybrid MUFM" },
              { label: "Recall",    val: result.hybrid.recall,    sub: "Hybrid MUFM" },
              { label: "F1 Score",  val: result.hybrid.f1_score,  sub: "Hybrid MUFM" },
              { label: "FPS",       val: result.hybrid.fps,       sub: "Hybrid", raw: true },
              { label: "Pure FPS",  val: result.pure.fps,         sub: "InsightFace", raw: true },
            ].map(m => (
              <div key={m.label} className="metric-card">
                <div className="metric-label">{m.label}</div>
                <div className={`metric-value${m.raw ? " neutral" : ""}`}>
                  {m.raw ? m.val.toFixed(1) : (m.val * 100).toFixed(1) + "%"}
                </div>
                <div className="metric-sub">{m.sub}</div>
              </div>
            ))}
          </div>

          <div className="two-col" style={{ marginBottom: 24 }}>
            {/* Bar chart */}
            <div className="card">
              <div className="card-title">Accuracy Comparison</div>
              <BarChart pure={result.pure} hybrid={result.hybrid} />
            </div>
            {/* GA params */}
            <div className="card">
              <div className="card-title">Optimized Parameters (GA)</div>
              {Object.entries(result.optimized_params).map(([k, v]) => (
                <div key={k} className="params-row">
                  <span className="params-key">{k.replace(/_/g, " ")}</span>
                  <span className="params-val">{typeof v === "number" ? v : String(v)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Confusion matrix */}
          <div className="card">
            <div className="card-title">Confusion Matrix — Hybrid MUFM</div>
            <ConfusionMatrix matrix={result.confusion_matrix} labels={result.class_labels} />
          </div>
        </>
      )}

      {/* No results empty state */}
      {!result && !loading && (
        <div className="card">
          <EmptyState
            icon="⚡"
            title="No pipeline results yet"
            sub="Run the pipeline to generate accuracy metrics, confusion matrix, and optimized parameters."
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE: DATABASE
// ═══════════════════════════════════════════════════════════════════════════════

function DatabasePage() {
  const [people,     setPeople]     = useState([]);
  const [name,       setName]       = useState("");
  const [file,       setFile]       = useState(null);
  const [preview,    setPreview]    = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const [validation, setValidation] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  const load = async () => {
    setLoadingData(true);
    try {
      const [db, v] = await Promise.all([
        api("GET", "/database/list"),
        api("GET", "/pipeline/validate"),
      ]);
      setPeople(db.people || []);
      setValidation(v);
    } catch (e) {
      toast.err(e.message);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onFile = (f) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleAdd = async () => {
    if (!name.trim()) { toast.err("Enter a person name."); return; }
    if (!file)        { toast.err("Select an image.");    return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("image", file);
      await api("POST", "/database/add-person", fd, true);
      toast.ok(`${name.trim()} added to database.`);
      setName(""); setFile(null); setPreview(null);
      load();
    } catch (e) {
      toast.err(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (personName) => {
    if (!confirm(`Remove "${personName}" from the database?`)) return;
    try {
      await api("DELETE", `/database/person/${encodeURIComponent(personName)}`);
      toast.ok(`${personName} removed.`);
      load();
    } catch (e) {
      toast.err(e.message);
    }
  };

  const missingSet = new Set(validation?.missing_people || []);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">Guardian AI · Identity</div>
          <div className="page-title">Face <span className="hl">Database</span></div>
          <div className="page-sub">Register identities for recognition</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load} disabled={loadingData}>
          {loadingData ? <Spinner light /> : "⟳ Refresh"}
        </button>
      </div>

      <div className="two-col">
        {/* Add form */}
        <div className="card">
          <div className="card-title">Register New Identity</div>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input
              className="input-field"
              placeholder="e.g. Ahmed Sayed"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Face Image</label>
            <DropZone onFile={onFile} preview={preview} />
          </div>
          {preview && (
            <div style={{
              fontFamily: "var(--mono)", fontSize: 10,
              color: "var(--text3)", marginBottom: 14
            }}>{file?.name}</div>
          )}
          <button
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={uploading || !name.trim() || !file}
            style={{ width: "100%" }}
          >
            {uploading ? <><Spinner /> Saving…</> : "+ Add to Database"}
          </button>
        </div>

        {/* People list */}
        <div>
          <div className="section-head">
            <div className="section-title">{people.length} Registered Identities</div>
          </div>

          {loadingData ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
              <Spinner light />
            </div>
          ) : people.length === 0 ? (
            <EmptyState
              icon="👤"
              title="No identities registered"
              sub="Add your first person using the form to begin face recognition."
            />
          ) : (
            <div className="people-grid">
              {people.map(p => (
                <PersonCard
                  key={p.name}
                  person={p}
                  showMissing={missingSet.has(p.name)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE: DATASET
// ═══════════════════════════════════════════════════════════════════════════════

function DatasetPage() {
  const [status,     setStatus]     = useState(null);
  const [name,       setName]       = useState("");
  const [file,       setFile]       = useState(null);
  const [preview,    setPreview]    = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const load = async () => {
    setLoadingData(true);
    try { setStatus(await api("GET", "/dataset/status")); }
    catch (e) { toast.err(e.message); }
    finally { setLoadingData(false); }
  };

  useEffect(() => { load(); }, []);

  const onFile = (f) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleAdd = async () => {
    if (!name.trim()) { toast.err("Enter a person name."); return; }
    if (!file)        { toast.err("Select an image."); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("image", file);
      const r = await api("POST", "/dataset/add-test", fd, true);
      toast.ok(r.message);
      setName(""); setFile(null); setPreview(null);
      load();
    } catch (e) {
      toast.err(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (personName) => {
    if (!confirm(`Remove test data for "${personName}"?`)) return;
    try {
      await api("DELETE", `/dataset/person/${encodeURIComponent(personName)}`);
      toast.ok(`Test data for ${personName} removed.`);
      load();
    } catch (e) {
      toast.err(e.message);
    }
  };

  const missing    = status?.missing_from_test || [];
  const valOk      = status?.validation_ok;
  const testPeople = status?.test_people || [];
  const dbPeople   = status?.db_people   || [];

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">Guardian AI · Testing</div>
          <div className="page-title">Test <span className="hl">Dataset</span></div>
          <div className="page-sub">Manage test images — must mirror the face database</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load} disabled={loadingData}>
          {loadingData ? <Spinner light /> : "⟳ Refresh"}
        </button>
      </div>

      {/* Validation banner */}
      {status && (
        valOk
          ? <Banner type="success" title={`All ${dbPeople.length} identities have test data — pipeline ready`} />
          : <Banner
              type="error"
              title={`${missing.length} identity${missing.length !== 1 ? "ies" : "y"} missing test data — pipeline blocked`}
              list={missing}
            >
              Upload at least one test image per missing identity below.
            </Banner>
      )}

      <div className="two-col">
        {/* Upload form */}
        <div className="card">
          <div className="card-title">Add Test Image</div>
          <div className="input-group">
            <label className="input-label">Person Name</label>
            <input
              className="input-field"
              placeholder="Must match database name exactly"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
            />
          </div>

          {/* Quick-fill missing names */}
          {missing.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{
                fontFamily: "var(--mono)", fontSize: 9.5,
                color: "var(--text3)", letterSpacing: 1.5,
                textTransform: "uppercase", marginBottom: 8
              }}>
                Click to fill missing name:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {missing.map(m => (
                  <button
                    key={m}
                    className="btn btn-ghost btn-sm"
                    style={{
                      fontSize: 10,
                      color: "var(--red)",
                      borderColor: "rgba(255,77,109,0.25)"
                    }}
                    onClick={() => setName(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Test Image</label>
            <DropZone onFile={onFile} preview={preview} />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={uploading || !name.trim() || !file}
            style={{ width: "100%" }}
          >
            {uploading ? <><Spinner /> Uploading…</> : "+ Add Test Image"}
          </button>
        </div>

        {/* Status columns */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Test people */}
          <div>
            <div className="section-head">
              <div className="section-title">Test Images ({testPeople.length})</div>
            </div>
            {loadingData ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
                <Spinner light />
              </div>
            ) : testPeople.length === 0 ? (
              <EmptyState
                icon="📁"
                title="No test images uploaded yet"
                sub="Upload test images to validate pipeline accuracy."
              />
            ) : (
              <div className="people-grid">
                {testPeople.map(p => (
                  <PersonCard
                    key={p.name}
                    person={p}
                    showMissing={false}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* DB people reference */}
          <div>
            <div className="section-head">
              <div className="section-title">Database Identities ({dbPeople.length})</div>
            </div>
            <div className="people-grid">
              {dbPeople.map(p => {
                const isMissing = missing.includes(p.name);
                return (
                  <div key={p.name} className={`person-card${isMissing ? " missing" : ""}`}>
                    <div className="person-avatar">{p.name.slice(0, 2).toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="person-name">{p.name}</div>
                      <span className={`person-badge ${isMissing ? "badge-missing" : "badge-ok"}`}>
                        {isMissing ? "⚠ Needs test data" : "✓ Has test data"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════

function App() {
  // Persist current page in localStorage
  const [page, setPage] = useState(() => {
    const saved = storage.get(PAGE_NAV_KEY, "realtime");
    return PAGES.find(p => p.id === saved) ? saved : "realtime";
  });
  const [online, setOnline] = useState(false);
  // Fade key: incrementing it forces re-animation when switching pages
  const [fadeKey, setFadeKey] = useState(0);

  const navigate = useCallback((id) => {
    if (id === page) return; // no-op for same page
    setPage(id);
    setFadeKey(k => k + 1);
    storage.set(PAGE_NAV_KEY, id);
  }, [page]);

  // Health check polling
  useEffect(() => {
    const ping = async () => {
      try {
        await fetch(`${BASE}/health`);
        setOnline(true);
      } catch {
        setOnline(false);
      }
    };
    ping();
    const interval = setInterval(ping, 10000);
    return () => clearInterval(interval);
  }, []);

  const PageMap = {
    realtime: <RealtimePage />,
    pipeline: <PipelinePage />,
    database: <DatabasePage />,
    dataset:  <DatasetPage />,
  };

  return (
    <div className="shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-eyebrow">System v2.0</div>
          <div className="logo-mark">
            GUARDIAN<span className="accent"> AI</span>
          </div>
          <div className="logo-sub">Intelligent Recognition Platform</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {PAGES.map(p => (
            <div
              key={p.id}
              className={`nav-item${page === p.id ? " active" : ""}`}
              onClick={() => navigate(p.id)}
            >
              <span className="nav-icon">{p.icon}</span>
              <span className="nav-label">{p.label}</span>
              {/* Pipeline running indicator dot in sidebar */}
              {p.id === "pipeline" && PIPELINE_STATE.loading && (
                <span style={{
                  width: 6, height: 6,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  boxShadow: "0 0 6px var(--accent-glow)",
                  animation: "livePulse 1.1s ease infinite",
                  flexShrink: 0,
                }} />
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="backend-status">
            <span className={`status-dot${online ? " online" : ""}`} />
            <span className="status-text">
              {online ? "Backend online" : "Backend offline"}
            </span>
          </div>
          <div className="sidebar-version">Guardian AI · 2025</div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="main">
        {/* key prop triggers page enter animation on navigation */}
        <div key={fadeKey} style={{ flex: 1, animation: "pageEnter 0.3s cubic-bezier(0.4,0,0.2,1)" }}>
          {PageMap[page]}
        </div>
      </main>

      {/* ── Toasts ── */}
      <ToastContainer />
    </div>
  );
}

// Mount
ReactDOM.createRoot(document.getElementById("root")).render(<App />);