import { useState } from "react";
import "./App.css";

const LANGUAGES = ["Python", "JavaScript", "TypeScript", "Java", "C++", "Go", "Rust"];
const FOCUS_OPTIONS = [
  { value: "all", label: "All Issues" },
  { value: "bugs", label: "Bugs" },
  { value: "security", label: "Security" },
  { value: "performance", label: "Performance" },
  { value: "style", label: "Style" },
];
const TABS = ["all", "bugs", "security", "performance", "style", "suggestions", "improved"];
const TAB_LABELS = {
  all: "All", bugs: "Bugs", security: "Security",
  performance: "Performance", style: "Style",
  suggestions: "Suggestions", improved: "Improved Code"
};
const CAT_MAP = {
  bugs: "bug", security: "security",
  performance: "performance", style: "style", suggestions: "suggestion"
};
const SEV_COLOR = { high: "sev-high", medium: "sev-medium", low: "sev-low" };

function ScoreRing({ score }) {
  const color = score >= 75 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="score-ring-wrap">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 65 65)" style={{ transition: "stroke-dashoffset 1s ease" }} />
        <text x="65" y="60" textAnchor="middle" fontSize="26" fontWeight="700" fill={color}>{score}</text>
        <text x="65" y="78" textAnchor="middle" fontSize="12" fill="#94a3b8">/ 100</text>
      </svg>
      <span className="score-verdict" style={{ color }}>
        {score >= 75 ? "Excellent" : score >= 50 ? "Needs Work" : "Critical Issues"}
      </span>
    </div>
  );
}

function IssueCard({ issue }) {
  return (
    <div className="issue-card">
      <div className="issue-header">
        <span className={`sev-badge ${SEV_COLOR[issue.severity] || "sev-low"}`}>
          {issue.severity?.toUpperCase()}
        </span>
        <span className="cat-badge">{issue.category}</span>
        <span className="issue-title">{issue.title}</span>
      </div>
      <p className="issue-desc">{issue.description}</p>
      {issue.fix && (
        <div className="fix-block">
          <span className="fix-label">Suggested Fix</span>
          <pre className="fix-code"><code>{issue.fix}</code></pre>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("Python");
  const [focus, setFocus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const handleReview = async () => {
    if (!code.trim()) { setError("Please paste some code first."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const res = await fetch("https://ai-code-reviewer-api-3e5b.onrender.com/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: language.toLowerCase(), focus }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Server error"); }
      const data = await res.json();
      setResult(data); setActiveTab("all");
    } catch (e) {
      setError(e.message || "Could not connect. Make sure backend is running on port 8000.");
    } finally { setLoading(false); }
  };

  const getIssues = (tab) => {
    if (!result?.issues) return [];
    if (tab === "all") return result.issues;
    return result.issues.filter(i => i.category === CAT_MAP[tab]);
  };

  const count = (tab) => getIssues(tab).length;

  const renderContent = () => {
    if (activeTab === "improved") {
      return result?.improved_code
        ? <pre className="improved-pre"><code>{result.improved_code}</code></pre>
        : <p className="empty-msg">No improved code available.</p>;
    }
    const issues = getIssues(activeTab);
    if (!issues.length) return <p className="empty-msg">No issues found in this category.</p>;
    return issues.map((issue, i) => <IssueCard key={i} issue={issue} />);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand-dot" />
          <span className="brand-name">CodeReview<b>AI</b></span>
        </div>
      </header>

      <div className="page">
        <div className="left-panel">
          <div className="panel-header">
            <span className="panel-title">Code Editor</span>
            <div className="panel-controls">
              <select className="ctrl-select" value={language} onChange={e => setLanguage(e.target.value)}>
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
              <select className="ctrl-select" value={focus} onChange={e => setFocus(e.target.value)}>
                {FOCUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <textarea
            className="code-area"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder={`# Paste your ${language} code here...`}
            spellCheck={false}
          />

          {error && <div className="err-box">{error}</div>}

          <button className="review-btn" onClick={handleReview} disabled={loading}>
            {loading
              ? <span className="loading-row"><span className="ld"/><span className="ld"/><span className="ld"/> Analyzing...</span>
              : "Analyze Code"}
          </button>
        </div>

        <div className="right-panel">
          {!result && !loading && (
            <div className="placeholder-state">
              <div className="placeholder-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                  <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
                </svg>
              </div>
              <p className="placeholder-text">Paste your code and click Analyze Code to get instant AI feedback</p>
            </div>
          )}

          {loading && (
            <div className="placeholder-state">
              <div className="spinner" />
              <p className="placeholder-text">Reviewing your code...</p>
            </div>
          )}

          {result && (
            <div className="results-wrap">
              <div className="score-row">
                <ScoreRing score={result.score} />
                <div className="score-meta">
                  <p className="score-summary">{result.summary}</p>
                  <div className="issue-counts">
                    {["bugs","security","performance","style","suggestions"].map(t => (
                      <div key={t} className="count-chip">
                        <span className="count-num">{count(t)}</span>
                        <span className="count-label">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="tabs-bar">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    className={`tab-btn ${activeTab === tab ? "tab-active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {TAB_LABELS[tab]}
                    {tab !== "improved" && count(tab) > 0 && (
                      <span className="tab-count">{count(tab)}</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="tab-body">{renderContent()}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
