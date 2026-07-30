import Header from "./Header";
import About from "./About";
import Skills from "./Skills";
import Footer from "./Footer";

function Home({ name, themeColor, bio, skillList, email }) {
  return (
    <div className="portfolio-page">
      <Header name={name} themeColor={themeColor} />
      <About bio={bio} />
      <section className="intro-card">
        <h2>Welcome</h2>
        <p>This is my first React portfolio website built with reusable components.</p>
      </section>
      <Skills skillList={skillList} />
      <Footer email={email} />
    </div>
  );
}

export default Home;
