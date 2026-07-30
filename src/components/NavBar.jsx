import { NavLink } from "react-router-dom";

function NavBar({ isDarkMode, onToggleTheme }) {
  const getLinkClassName = ({ isActive }) =>
    isActive ? "nav-link nav-link-active" : "nav-link";

  return (
    <nav className="nav-bar">
      <div className="nav-links">
        <NavLink to="/" end className={getLinkClassName}>
          Home
        </NavLink>
        <NavLink to="/projects" className={getLinkClassName}>
          Projects
        </NavLink>
        <NavLink to="/contact" className={getLinkClassName}>
          Contact
        </NavLink>
      </div>

      <button type="button" className="theme-button" onClick={onToggleTheme}>
        {isDarkMode ? "Light Mode" : "Dark Mode"}
      </button>
    </nav>
  );
}

export default NavBar;
