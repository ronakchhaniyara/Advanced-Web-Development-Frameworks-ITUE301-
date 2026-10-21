import { lazy, Suspense, useState } from "react";
import { Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import PageLoader from "./components/PageLoader";
import ToastContainer from "./components/Toast";
import AuthModal from "./components/AuthModal";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

// Practical 8: Performance Optimization via Route-Based Code Splitting
const Home = lazy(() => import("./components/Home"));
const TaskManager = lazy(() => import("./components/TaskManager"));
const Projects = lazy(() => import("./components/Projects"));
const AnalyticsDashboard = lazy(() => import("./components/AnalyticsDashboard"));
const SystemActivity = lazy(() => import("./components/SystemActivity"));
const Contact = lazy(() => import("./components/Contact"));
const NotFound = lazy(() => import("./components/NotFound"));

function AppContent() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const skills = [
    "HTML5",
    "CSS3 / Vanilla CSS",
    "JavaScript (ES6+)",
    "React 19 & Router",
    "Node.js & Express",
    "MongoDB & Mongoose",
    "RESTful API & Caching",
    "Docker & CI/CD Pipelines",
    "AI APIs (Gemini/OpenAI)",
  ];

  return (
    <div className={isDarkMode ? "app-shell dark" : "app-shell"}>
      <NavBar
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((prev) => !prev)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <main className="page-content">
        <Suspense fallback={<PageLoader text="Loading page bundle..." />}>
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  name="Ronak Chhaniyara"
                  themeColor="#0f4c81"
                  bio="I am a B.Tech IT student specializing in full-stack web architectures, reactive client applications, scalable Node/Express microservices, and AI integrations."
                  skillList={skills}
                  email="ronak@example.com"
                />
              }
            />
            <Route path="/tasks" element={<TaskManager />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/activity" element={<SystemActivity />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {/* Floating Notifications and Auth Modal */}
      <ToastContainer />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
