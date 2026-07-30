function Header({ name, themeColor }) {
  return (
    <header className="hero-banner">
      <p className="eyebrow">Student Portfolio</p>
      <h1 style={{ color: themeColor }}>{name}'s Portfolio</h1>
      <p className="hero-copy">
        Exploring component-based UI, props, routing, and state management with React.
      </p>
    </header>
  );
}

export default Header;
