# Advanced Web Development Frameworks - Student Portfolio & Task Management Platform

[![CI Pipeline](https://github.com/ronakchhaniyara/Advanced-Web-Development-Frameworks-ITUE301-/actions/workflows/ci.yml/badge.svg)](https://github.com/ronakchhaniyara/Advanced-Web-Development-Frameworks-ITUE301-/actions)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.21-lightgrey?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-brightgreen?logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![Jest](https://img.shields.io/badge/Tested%20with-Jest%20%26%20Supertest-red?logo=jest)

A comprehensive, production-grade full-stack web application built to fulfill all **13 Practicals** for Advanced Web Development Frameworks. The project features a modern Vite + React frontend coupled with an Express and MongoDB backend, featuring JWT authentication, server-side in-memory caching, asynchronous background event processing, Docker containerization, GitHub Actions CI/CD, and AI integration.

---

## 📋 Curriculum Practicals Matrix (100% Completed)

| Practical | Title | Core Technologies | Status |
| :---: | :--- | :--- | :---: |
| **01** | **React & Component Architecture** | Vite, Reusable Functional Components, Props Data Flow | ✅ Complete |
| **02** | **State Management & Client Routing** | React Router v7, `useState`, Controlled Inputs, Dark/Light Mode | ✅ Complete |
| **03** | **API Integration & Data Rendering** | Fetch API, `useEffect`, Async Loading & Error States, GitHub API | ✅ Complete |
| **04** | **RESTful API with Node & Express** | Express.js, In-Memory CRUD, Custom Logging & Error Middleware | ✅ Complete |
| **05** | **MongoDB & Schema Design with Mongoose** | MongoDB, Mongoose Schemas, Field Constraints, Pre-Save Hooks | ✅ Complete |
| **06** | **Full Stack Integration (React + Node + Mongo)** | CORS, Centralized API Client, Synchronized State, Delete Modal | ✅ Complete |
| **07** | **Authentication & Middleware Pipeline** | bcryptjs Hashing, JWT Bearer Tokens, Protected Routes, `/me` | ✅ Complete |
| **08** | **Performance Optimization & Lazy Loading** | `React.lazy()`, `Suspense`, Route-Based Code Splitting Chunks | ✅ Complete |
| **09** | **In-Memory Caching & Query Optimization** | `node-cache`, 60s TTL, Cache Invalidation on Writes, Stats API | ✅ Complete |
| **10** | **Asynchronous Event-Driven Architecture** | Node.js native `EventEmitter`, Non-Blocking Responses, Audit Logs | ✅ Complete |
| **11** | **Containerization with Docker Compose** | Dockerfile (Frontend & Backend), `docker-compose.yml`, Networks | ✅ Complete |
| **12** | **CI/CD Pipeline with GitHub Actions** | `.github/workflows/ci.yml`, Jest, Supertest, Automated Validation | ✅ Complete |
| **13** | **AI API Integration in Web Applications** | Gemini/OpenAI API Gateway, Graceful Degradation Fallback Engine | ✅ Complete |

---

## 🏛️ System Architecture

```text
                                BROWSER CLIENT (localhost:5173)
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  React 19 SPA (Code-Split via React.lazy & Suspense)                                   │
│  ├── Home.jsx                - Bio, Reusable Components & Props (Practical 1)          │
│  ├── TaskManager.jsx         - Full-Stack CRUD, AI Assist & Cache Badges (Pract 6, 13)│
│  ├── Projects.jsx            - Public GitHub API Fetch, Search & Filter (Practical 3)  │
│  ├── AnalyticsDashboard.jsx  - Real-Time Chart Visualizations & Telemetry (Pract 8, 9) │
│  ├── SystemActivity.jsx      - Live Async EventEmitter Activity Stream (Practical 10)  │
│  ├── Contact.jsx             - Controlled Inputs & Real-Time State (Practical 2)       │
│  └── ToastContainer.jsx      - Action Feedback & Alerts                                │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTP Requests (CORS + JWT Authorization: Bearer <token>)
                                            v
                               EXPRESS BACKEND API (localhost:5000)
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  Express Server Pipeline                                                               │
│  ├── CORS Middleware          - Enabled for Vite Dev & Production Origin               │
│  ├── Request Logger           - Method, URL, and Timestamp logging (Practical 4)       │
│  ├── JSON Content-Type Guard  - Rejects malformed write payloads                       │
│  ├── In-Memory Cache Layer    - node-cache (stdTTL: 60s) for GET requests (Practical 9)│
│  ├── Event Emitter Pipeline   - Non-blocking async event notifications (Practical 10)  │
│  ├── AI Proxy Gateway         - Gemini/OpenAI integration + Heuristic Fallback (P 13)  │
│  └── Central Error Handler    - Structured JSON errors for schema validation (P 5)     │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Mongoose ODM
                                            v
                                MONGODB DATABASE (localhost:27017)
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  task_manager_db                                                                       │
│  ├── tasks Collection: { title, description, completed, priority, user, createdAt }    │
│  └── users Collection: { name, email, password (bcrypt hash), role, createdAt }        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Running the Project Locally

### 1. Prerequisites
- Node.js (v18+) and npm
- MongoDB running locally on port `27017` (or MongoDB Atlas connection string)

### 2. Run Backend (Terminal 1)
```bash
cd task-manager-api
npm install
npm start
```
*Backend runs on `http://localhost:5000`.*

### 3. Run Frontend (Terminal 2)
```bash
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🧪 Running Automated Tests (Practical 12)

Run the full Jest and Supertest backend test suite:
```bash
cd task-manager-api
npm test
```

### Test Suite Output
```text
PASS tests/api.test.js
  Practical 4, 5 & 6: Task RESTful API & Full-Stack Integration
    ✓ GET /tasks returns 200 with task array (Practical 4 & 12 Requirement)
    ✓ POST /tasks creates a new task (Practical 5 Mongoose Schema Validation)
    ✓ POST /tasks fails with 400 when title is missing
    ✓ GET /tasks/:id fetches single task
    ✓ PUT /tasks/:id updates a task
    ✓ DELETE /tasks/:id deletes the created task
  Practical 7: Authentication & Middleware Pipeline
    ✓ POST /register creates a new user and returns JWT token
    ✓ POST /login authenticates with valid credentials
    ✓ GET /me returns user profile with valid Bearer token
    ✓ GET /me rejects with 401 when token is missing
  Practical 9: In-Memory Caching (node-cache)
    ✓ GET /tasks serves from cache on second request (X-Cache: HIT)
  Practical 13: AI Integration & Graceful Fallback
    ✓ POST /api/ai/generate-description returns generated description and priority

Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
```

---

## 🐳 Running with Docker Compose (Practical 11)

Launch all 3 services (Frontend, Backend, and MongoDB) with a single command:

```bash
docker-compose up --build
```

- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`
- **MongoDB:** `mongodb://localhost:27017`
- **Data Persistence:** Automated via named volume `mongo-data`.

---

## 📁 Repository Structure

```text
student-portfolio/
├── .github/workflows/
│   └── ci.yml                 # Practical 12: GitHub Actions CI Pipeline
├── practicals/                # Comprehensive documentation for Practicals 1 - 13
│   ├── Practical-1-React-Components/
│   ├── Practical-2-State-and-Routing/
│   ├── Practical-3-API-Integration-and-Data-Rendering/
│   ├── Practical-4-Building-a-RESTful-API-with-Node.js-and-Express/
│   ├── Practical-5-MongoDB-Integration-and-Schema-Design-with-Mongoose/
│   ├── Practical-6-Full-Stack-Integration-React-Node-MongoDB/
│   ├── Practical-7-Authentication-and-Middleware-Pipeline/
│   ├── Practical-8-Performance-Optimization-and-Lazy-Loading-in-React/
│   ├── Practical-9-In-Memory-Caching-and-Query-Optimization/
│   ├── Practical-10-Asynchronous-Processing-with-Event-Driven-Architecture/
│   ├── Practical-11-Containerization-with-Docker-and-Docker-Compose/
│   ├── Practical-12-CI-CD-Pipeline-with-GitHub-Actions/
│   └── Practical-13-AI-API-Integration-into-a-Web-Application/
├── src/
│   ├── components/
│   │   ├── AnalyticsDashboard.jsx  # Practical 8 & 9: Code-split chart dashboard
│   │   ├── AuthModal.jsx           # Practical 7: JWT sign-in / registration
│   │   ├── Contact.jsx             # Practical 2: Controlled input state
│   │   ├── Home.jsx                # Practical 1: Reusable composition
│   │   ├── NavBar.jsx              # Active routing, theme & auth indicator
│   │   ├── PageLoader.jsx          # Practical 8: Suspense fallback UI
│   │   ├── Projects.jsx            # Practical 3: GitHub REST API integration
│   │   ├── SystemActivity.jsx      # Practical 10: Asynchronous event timeline
│   │   ├── TaskManager.jsx         # Practical 6 & 13: Full stack task UI + AI
│   │   └── Toast.jsx               # User feedback notifications
│   ├── context/
│   │   ├── AuthContext.jsx         # Global authentication state provider
│   │   └── useAuth.js              # Custom auth hook
│   ├── services/
│   │   ├── api.js                  # Centralized REST API client
│   │   └── toast.js                # Event-based notification dispatcher
│   ├── App.jsx                     # Route definitions with React.lazy & Suspense
│   ├── App.css                     # Responsive glassmorphism & dark/light theme
│   └── main.jsx                    # React entry wrapped in BrowserRouter
├── task-manager-api/
│   ├── events/
│   │   ├── taskEvents.js           # Practical 10: EventEmitter instance
│   │   └── taskListeners.js        # Practical 10: Background async listeners
│   ├── middleware/
│   │   ├── auth.js                 # Practical 7: JWT Bearer verification
│   │   └── validation.js           # Practical 7: Request payload validation
│   ├── models/
│   │   ├── Task.js                 # Practical 5: Validated Mongoose schema
│   │   └── User.js                 # Practical 7: Hashed password User schema
│   ├── routes/
│   │   ├── aiRoutes.js             # Practical 13: AI generator with fallback
│   │   ├── authRoutes.js           # Practical 7: /register, /login, /me
│   │   ├── systemRoutes.js         # Practical 9 & 10: Cache and event telemetry
│   │   └── taskRoutes.js           # Practical 6 & 9: Cached CRUD endpoints
│   ├── tests/
│   │   └── api.test.js             # Practical 12: Jest + Supertest integration tests
│   ├── utils/
│   │   └── cache.js                # Practical 9: node-cache utility & stats
│   ├── Dockerfile                  # Practical 11: Backend containerfile
│   ├── server.js                   # Express app configuration & middleware
│   └── package.json
├── Dockerfile                      # Practical 11: Multi-stage Frontend containerfile
├── docker-compose.yml              # Practical 11: Multi-container orchestration
└── vite.config.js
```

---

## 👨‍💻 Author

**Ronak Chhaniyara**  
B.Tech Information Technology  
Advanced Web Development Frameworks (ITUE301)
