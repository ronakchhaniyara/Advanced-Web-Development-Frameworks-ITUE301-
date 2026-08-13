function ErrorMessage({ message, onRetry }) {
  return (
    <section className="content-card status-card" role="alert">
      <h2>Something went wrong</h2>
      <p>{message}</p>
      <button type="button" className="toggle-button" onClick={onRetry}>
        Retry
      </button>
    </section>
  );
}

export default ErrorMessage;
