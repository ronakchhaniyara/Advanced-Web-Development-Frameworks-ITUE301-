function Projects({ projectList }) {
  return (
    <section className="content-card">
      <h1>Projects</h1>
      <p className="section-copy">
        Three sample projects are listed below as part of the post-lab portfolio extension.
      </p>
      <ul className="project-list">
        {projectList.map((project) => (
          <li key={project}>{project}</li>
        ))}
      </ul>
    </section>
  );
}

export default Projects;
