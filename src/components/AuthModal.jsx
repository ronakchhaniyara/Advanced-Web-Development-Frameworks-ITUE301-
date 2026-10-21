import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { showToast } from "../services/toast";

export default function AuthModal({ isOpen, onClose }) {
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (!name.trim()) throw new Error("Name is required");
        await register(name, email, password);
        showToast("Account created successfully! Logged in.", "success");
      } else {
        await login(email, password);
        showToast("Logged in successfully!", "success");
      }
      onClose();
    } catch (err) {
      setFormError(err.message || "Authentication failed. Check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    showToast("Logged out successfully.", "info");
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>{isAuthenticated ? "👤 User Profile" : isRegisterMode ? "Create Account" : "Sign In"}</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {isAuthenticated && user ? (
          <div className="profile-details-view">
            <div className="profile-avatar">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <h3 className="profile-name">{user.name}</h3>
            <p className="profile-email">{user.email}</p>
            <div className="profile-meta">
              <span className="pill-badge pill-blue">Role: {user.role || "Student"}</span>
              <span className="pill-badge pill-purple">JWT Secured</span>
            </div>
            <div className="profile-actions">
              <button type="button" className="btn btn-danger btn-block" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="auth-tab-switch">
              <button
                type="button"
                className={`tab-btn ${!isRegisterMode ? "tab-active" : ""}`}
                onClick={() => {
                  setIsRegisterMode(false);
                  setFormError("");
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`tab-btn ${isRegisterMode ? "tab-active" : ""}`}
                onClick={() => {
                  setIsRegisterMode(true);
                  setFormError("");
                }}
              >
                Register
              </button>
            </div>

            {formError && <div className="auth-error-banner">{formError}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              {isRegisterMode && (
                <div className="form-group">
                  <label className="form-label" htmlFor="auth-name">
                    Full Name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    className="styled-input"
                    placeholder="e.g., Ronak Chhaniyara"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="auth-email">
                  Email Address
                </label>
                <input
                  id="auth-email"
                  type="email"
                  className="styled-input"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="auth-password">
                  Password
                </label>
                <input
                  id="auth-password"
                  type="password"
                  className="styled-input"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : isRegisterMode
                  ? "Register & Sign In"
                  : "Sign In"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
