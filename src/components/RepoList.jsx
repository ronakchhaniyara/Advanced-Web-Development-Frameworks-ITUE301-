function RepoList({ repos }) {
  return (
    <div className="repo-list">
      {repos.map((repo) => (
        <article key={repo.id} className="repo-card">
          <h2>{repo.name}</h2>
          <p>Stars: {repo.stargazers_count}</p>
          <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
            View Repository
          </a>
        </article>
      ))}
    </div>
  );
}

export default RepoList;
