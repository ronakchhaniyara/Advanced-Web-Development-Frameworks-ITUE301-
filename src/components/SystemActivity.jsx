import { useState, useEffect } from "react";
import { getEventLogs, clearEventLogs } from "../services/api";
import Spinner from "./Spinner";

export default function SystemActivity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await getEventLogs();
      setLogs(res.data?.logs || []);
    } catch {
      // ignore poll error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
    let interval = null;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleClear = async () => {
    await clearEventLogs();
    setLogs([]);
  };

  return (
    <section className="events-container">
      <div className="content-card events-header-card">
        <div className="badge-row">
          <span className="pill-badge pill-purple">Practical 10: Event-Driven Processing</span>
          <span className="pill-badge pill-blue">Node.js native EventEmitter</span>
        </div>
        <div className="events-title-row">
          <div>
            <h1>Asynchronous Background Event Stream</h1>
            <p className="section-copy">
              Observe non-blocking background operations. When task write operations occur,
              the API responds immediately (201) while Node.js <code>EventEmitter</code> handles
              audit notifications and background indexing asynchronously.
            </p>
          </div>
          <div className="events-action-bar">
            <button
              type="button"
              className={`toggle-button ${autoRefresh ? "active" : ""}`}
              onClick={() => setAutoRefresh((prev) => !prev)}
            >
              {autoRefresh ? "Auto-Refresh ON (3s)" : "Auto-Refresh PAUSED"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClear}
            >
              Clear Stream
            </button>
          </div>
        </div>
      </div>

      <div className="content-card">
        {loading && logs.length === 0 ? (
          <Spinner />
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <p>No background events recorded yet.</p>
            <p className="metric-subtext">
              Go to the <strong>Tasks</strong> tab, create, update, or delete a task, and observe
              the non-blocking asynchronous event lifecycle here!
            </p>
          </div>
        ) : (
          <div className="event-stream-timeline">
            {logs.map((log) => (
              <div key={log.id} className={`event-log-card event-type-${log.event}`}>
                <div className="event-log-top">
                  <span className="event-type-badge">{log.event.toUpperCase()}</span>
                  <span className="event-time">
                    {new Date(log.listenerExecutedAt || log.responseSentAt).toLocaleTimeString()}
                  </span>
                </div>
                <h4 className="event-title">{log.title}</h4>
                <p className="event-msg">{log.message}</p>

                <div className="event-timestamps-proof">
                  <div className="timestamp-block">
                    <span className="t-label">API Responded:</span>
                    <code className="t-val">{log.responseSentAt || "N/A"}</code>
                  </div>
                  <div className="timestamp-block">
                    <span className="t-label">Listener Executed:</span>
                    <code className="t-val">{log.listenerExecutedAt || "N/A"}</code>
                  </div>
                  {log.asyncCompletedAt && (
                    <div className="timestamp-block">
                      <span className="t-label">Async Completed:</span>
                      <code className="t-val">{log.asyncCompletedAt}</code>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
