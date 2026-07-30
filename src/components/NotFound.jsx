import { Link } from "react-router-dom";

function NotFound() {
  return (
    <section className="content-card">
      <h1>404 Not Found</h1>
      <p className="section-copy">
        The page you requested does not exist. Use the navigation bar or return home.
      </p>
      <Link className="back-link" to="/">
        Go Back Home
      </Link>
    </section>
  );
}

export default NotFound;
