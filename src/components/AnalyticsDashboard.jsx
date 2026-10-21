import { useState, useEffect } from "react";
import { getTasks, getCacheStats, getSystemHealth } from "../services/api";
import Spinner from "./Spinner";

export default function AnalyticsDashboard() {
  const [tasks, setTasks] = useState([]);
  const [cacheStats, setCacheStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [taskRes, cacheRes, healthRes] = await Promise.allSettled([
          getTasks(),
          getCacheStats(),
          getSystemHealth(),
        ]);

        if (taskRes.status === "fulfilled") {
          setTasks(taskRes.value.data?.data || []);
        }
        if (cacheRes.status === "fulfilled") {
          setCacheStats(cacheRes.value.data?.stats || null);
        }
        if (healthRes.status === "fulfilled") {
          setHealth(healthRes.value.data || null);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="analytics-loading content-card">
        <Spinner />
        <p className="loading-caption">Aggregating real-time database and cache telemetry...</p>
      </div>
    );
  }

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const highCount = tasks.filter((t) => t.priority === "high").length;
  const medCount = tasks.filter((t) => t.priority === "medium").length;
  const lowCount = tasks.filter((t) => t.priority === "low").length;

  const highPct = total > 0 ? Math.round((highCount / total) * 100) : 0;
  const medPct = total > 0 ? Math.round((medCount / total) * 100) : 0;
  const lowPct = total > 0 ? Math.round((lowCount / total) * 100) : 0;

  return (
    <section className="analytics-container">
      {/* Header */}
      <div className="content-card analytics-header-card">
        <div className="badge-row">
          <span className="pill-badge pill-purple">Practical 8: Lazy Loaded Route</span>
          <span className="pill-badge pill-blue">Practical 9: Cache Telemetry</span>
        </div>
        <h1>Performance & Task Analytics Dashboard</h1>
        <p className="section-copy">
          This dashboard is dynamically code-split using <code>React.lazy()</code> and
          visualizes task completion rates, server caching efficiency, and full-stack health metrics.
        </p>
      </div>

      {/* Grid of Metric Cards */}
      <div className="analytics-grid">
        {/* Completion Donut / Gauge */}
        <div className="content-card metric-card">
          <h3>Task Completion Rate</h3>
          <div className="gauge-wrap">
            <svg viewBox="0 0 36 36" className="circular-chart blue">
              <path
                className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle"
                strokeDasharray={`${completionPercentage}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage">
                {completionPercentage}%
              </text>
            </svg>
          </div>
          <div className="metric-footer">
            <span>✓ Completed: <strong>{completed}</strong></span>
            <span>⏳ Incomplete: <strong>{pending}</strong></span>
          </div>
        </div>

        {/* Priority Distribution Chart */}
        <div className="content-card metric-card">
          <h3>Task Priority Breakdown</h3>
          <div className="bar-charts-list">
            <div className="bar-row">
              <div className="bar-label">
                <span>🔴 High ({highCount})</span>
                <span>{highPct}%</span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill fill-high"
                  style={{ width: `${highPct}%` }}
                />
              </div>
            </div>

            <div className="bar-row">
              <div className="bar-label">
                <span>🟡 Medium ({medCount})</span>
                <span>{medPct}%</span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill fill-med"
                  style={{ width: `${medPct}%` }}
                />
              </div>
            </div>

            <div className="bar-row">
              <div className="bar-label">
                <span>🟢 Low ({lowCount})</span>
                <span>{lowPct}%</span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill fill-low"
                  style={{ width: `${lowPct}%` }}
                />
              </div>
            </div>
          </div>
          <p className="metric-subtext">Total active items in database: {total}</p>
        </div>

        {/* Cache Performance (Practical 9) */}
        <div className="content-card metric-card">
          <h3>In-Memory Cache (node-cache)</h3>
          {cacheStats ? (
            <div className="cache-stats-display">
              <div className="cache-stat-item">
                <span className="c-label">Hit Ratio:</span>
                <span className="c-val hit-ratio">{cacheStats.hitRatio}</span>
              </div>
              <div className="cache-stat-item">
                <span className="c-label">Cache Hits:</span>
                <span className="c-val">{cacheStats.hits}</span>
              </div>
              <div className="cache-stat-item">
                <span className="c-label">Cache Misses:</span>
                <span className="c-val">{cacheStats.misses}</span>
              </div>
              <div className="cache-stat-item">
                <span className="c-label">Invalidations:</span>
                <span className="c-val">{cacheStats.invalidations}</span>
              </div>
              <div className="cache-stat-item">
                <span className="c-label">TTL Window:</span>
                <span className="c-val">{cacheStats.stdTTL} seconds</span>
              </div>
            </div>
          ) : (
            <p className="empty-state">Cache metrics initializing...</p>
          )}
        </div>

        {/* System Health */}
        <div className="content-card metric-card">
          <h3>Backend Environment Health</h3>
          {health ? (
            <div className="health-details">
              <div className="health-row">
                <span>Database:</span>
                <strong className="health-online">● {health.database?.status}</strong>
              </div>
              <div className="health-row">
                <span>Node.js:</span>
                <span>{health.nodeVersion}</span>
              </div>
              <div className="health-row">
                <span>Uptime:</span>
                <span>{health.uptimeSeconds}s</span>
              </div>
              <div className="health-row">
                <span>RAM Heap:</span>
                <span>
                  {Math.round(health.memoryUsage?.heapUsed / 1024 / 1024)} MB /{" "}
                  {Math.round(health.memoryUsage?.heapTotal / 1024 / 1024)} MB
                </span>
              </div>
            </div>
          ) : (
            <p className="empty-state">Backend offline or connecting...</p>
          )}
        </div>
      </div>
    </section>
  );
}
