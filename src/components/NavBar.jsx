import { NavLink } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function NavBar({ isDarkMode, onToggleTheme, onOpenAuth }) {
  const { user, isAuthenticated } = useAuth();

  const getLinkClassName = ({ isActive }) =>
    isActive ? "nav-link nav-link-active" : "nav-link";

  return (
    <nav className="nav-bar">
      <div className="nav-brand">
        <NavLink to="/" className="brand-link">
          <span className="brand-dot" />
          <span className="brand-text">Portfolio & Labs</span>
        </NavLink>
      </div>

      <div className="nav-links">
        <NavLink to="/" end className={getLinkClassName}>
          Home
        </NavLink>
        <NavLink to="/tasks" className={getLinkClassName}>
          Tasks <span className="nav-chip">Full-Stack</span>
        </NavLink>
        <NavLink to="/projects" className={getLinkClassName}>
          Projects <span className="nav-chip">GitHub</span>
        </NavLink>
        <NavLink to="/analytics" className={getLinkClassName}>
          Analytics
        </NavLink>
        <NavLink to="/activity" className={getLinkClassName}>
          Activity
        </NavLink>
        <NavLink to="/contact" className={getLinkClassName}>
          Contact
        </NavLink>
      </div>

      <div className="nav-actions">
        {isAuthenticated && user ? (
          <button
            type="button"
            className="user-profile-button"
            onClick={onOpenAuth}
            title="View user profile"
          >
            <span className="user-icon-badge">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </span>
            <span className="user-name-text">{user.name.split(" ")[0]}</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-secondary auth-nav-btn"
            onClick={onOpenAuth}
          >
            Sign In
          </button>
        )}

        <button
          type="button"
          className="theme-button"
          onClick={onToggleTheme}
          aria-label="Toggle dark/light theme"
        >
          {isDarkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
