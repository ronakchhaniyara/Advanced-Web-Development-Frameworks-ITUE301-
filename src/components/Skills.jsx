function Skills({ skillList }) {
  return (
    <section className="content-card">
      <h2>Skills</h2>
      <ul className="skill-grid">
        {skillList.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>
    </section>
  );
}

export default Skills;
