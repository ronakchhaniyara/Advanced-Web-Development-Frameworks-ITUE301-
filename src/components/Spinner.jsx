function Spinner() {
  return (
    <section className="content-card status-card" aria-live="polite">
      <div className="spinner" aria-hidden="true"></div>
      <p>Loading repositories...</p>
    </section>
  );
}

export default Spinner;
