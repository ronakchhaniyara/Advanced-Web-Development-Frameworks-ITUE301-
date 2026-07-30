import { Route, Routes } from "react-router-dom";
import { useState } from "react";
import NavBar from "./components/NavBar";
import Home from "./components/Home";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import NotFound from "./components/NotFound";
import "./App.css";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const skills = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Python",
    "Data Science",
  ];

  const projects = [
    "Student Management System",
    "Portfolio Website",
    "Library Management Portal",
  ];

  return (
    <div className={isDarkMode ? "app-shell dark" : "app-shell"}>
      <NavBar
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((currentMode) => !currentMode)}
      />

      <main className="page-content">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                name="Ronak Chhaniyara"
                themeColor="#0f4c81"
                bio="I am a B.Tech IT student building reusable React interfaces and learning modern frontend development."
                skillList={skills}
                email="ronak@example.com"
              />
            }
          />
          <Route path="/projects" element={<Projects projectList={projects} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
