export default function PageLoader({ text = "Loading module..." }) {
  return (
    <div className="page-loader-wrapper" role="status" aria-live="polite">
      <div className="page-loader-spinner" />
      <p className="page-loader-text">{text}</p>
    </div>
  );
}
