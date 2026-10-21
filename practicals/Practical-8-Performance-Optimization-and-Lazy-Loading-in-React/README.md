# Practical 8: Performance Optimization and Lazy Loading in React

**CO/PO Mapping:** CO1 / PO3, PO5

## Objective

To improve frontend initial page load performance, minimize main bundle size, and implement route-based code splitting using `React.lazy()` and `Suspense`.

---

## Theory & Architectural Architecture

### Before Code Splitting (Monolithic Bundle)
Every component (`Home`, `Projects`, `TaskManager`, `AnalyticsDashboard`, `Contact`, `NotFound`) is compiled and packaged into a single monolithic JavaScript bundle downloaded upfront when the user first hits `/`:
```text
Client Request: GET /
└── Downloads main.bundle.js (~280 KB)
    └── Contains Home + Projects + Tasks + Analytics + Contact + NotFound
```

### After Route-Based Lazy Loading (Optimized Chunks)
Only the foundational runtime and current route component are downloaded on initial visit. Subsequent routes are dynamically fetched on demand via async `import()`:
```text
Client Request: GET /
├── Downloads index.js (Core React runtime, ~77 KB gzip)
└── Downloads Home.chunk.js (~0.54 KB gzip)

User Clicks Nav Link: /tasks
└── Triggers dynamic import()
    ├── <Suspense fallback={<PageLoader />}> renders
    └── Downloads TaskManager.chunk.js (~3.57 KB gzip)

User Clicks Nav Link: /analytics
└── Triggers dynamic import()
    └── Downloads AnalyticsDashboard.chunk.js (~1.66 KB gzip)
```

---

## Implementation in `src/App.jsx`

```javascript
import { lazy, Suspense } from "react";
import PageLoader from "./components/PageLoader";

// Route-based code splitting
const Home = lazy(() => import("./components/Home"));
const TaskManager = lazy(() => import("./components/TaskManager"));
const Projects = lazy(() => import("./components/Projects"));
const AnalyticsDashboard = lazy(() => import("./components/AnalyticsDashboard"));
const SystemActivity = lazy(() => import("./components/SystemActivity"));
const Contact = lazy(() => import("./components/Contact"));
const NotFound = lazy(() => import("./components/NotFound"));

function App() {
  return (
    <Suspense fallback={<PageLoader text="Loading page bundle..." />}>
      <Routes>
        <Route path="/" element={<Home ... />} />
        <Route path="/tasks" element={<TaskManager />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/activity" element={<SystemActivity />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
```

---

## Measured Performance & Build Comparison

Vite build output demonstrates independent chunk production:

| Asset Name | Type | Size | Gzip Size | Load Timing |
| :--- | :--- | :--- | :--- | :--- |
| `index.html` | Entry HTML | 0.46 kB | 0.30 kB | Initial load |
| `index.css` | Global CSS | 19.52 kB | 4.78 kB | Initial load |
| `index.js` | Core Framework | 243.52 kB | 77.97 kB | Initial load |
| `Home.js` | Route Chunk | 1.41 kB | 0.54 kB | On `/` visit |
| `Projects.js` | Route Chunk | 1.90 kB | 0.94 kB | On `/projects` visit |
| `TaskManager.js` | Route Chunk | 11.54 kB | 3.57 kB | On `/tasks` visit |
| `AnalyticsDashboard.js` | Heavy Chart Chunk | 6.04 kB | 1.66 kB | On `/analytics` visit |
| `SystemActivity.js` | Event Stream Chunk | 3.25 kB | 1.16 kB | On `/activity` visit |
| `Contact.js` | Route Chunk | 0.99 kB | 0.54 kB | On `/contact` visit |

### Key Observations
1. **Initial Payload Reduction:** The browser only fetches the code required to render the initial landing view, cutting initial route parsing time.
2. **Heavy Component Isolation:** Large components like `AnalyticsDashboard` with complex SVG charts and math routines are deferred until explicitly navigated to.
3. **Graceful Fallback:** While chunks load over simulated slow connections (e.g., DevTools Slow 3G throttling), the Suspense `<PageLoader />` delivers visual feedback preventing blank screens.
