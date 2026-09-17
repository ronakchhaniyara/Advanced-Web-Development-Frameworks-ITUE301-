import { useEffect, useState } from "react";
import Spinner from "./Spinner";
import ErrorMessage from "./ErrorMessage";
import RepoList from "./RepoList";

const GITHUB_USERNAME = "ronakchhaniyara";
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;

function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRepositories = () => {
    setLoading(true);
    setError(null);

    fetch(GITHUB_API_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch repositories");
        }

        return res.json();
      })
      .then((data) => {
        const ownRepositories = Array.isArray(data)
          ? data.filter(
              (repo) => repo.owner?.login === GITHUB_USERNAME && repo.fork === false
            )
          : [];

        setRepos(ownRepositories);
      })
      .catch((err) => {
        setError(err.message);
        setRepos([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    // The empty dependency array runs this fetch once when Projects mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRepositories();
  }, []);

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchRepositories} />;
  }

  return (
    <section className="content-card">
      <h1>My GitHub Projects</h1>
      <p className="section-copy">
        This page fetches public repositories from my GitHub account and renders
        only my original projects with loading, error, and search states.
      </p>

      <label className="form-field" htmlFor="repo-search">
        Search Repositories
      </label>
      <input
        id="repo-search"
        className="repo-search-input"
        type="text"
        placeholder="Search repositories..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />

      {repos.length === 0 ? (
        <p className="empty-state">No repositories available.</p>
      ) : filteredRepos.length === 0 ? (
        <p className="empty-state">No repositories found.</p>
      ) : (
        <RepoList repos={filteredRepos} />
      )}
    </section>
  );
}

export default Projects;
