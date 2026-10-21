const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Task = require("./models/Task");
const User = require("./models/User");
const { setCache, invalidateTaskCache } = require("./utils/cache");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/task_manager_db";

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(MONGO_URI, {
      driverInfo: { name: "Mongoose", version: "9.10.1" },
    });
    console.log("Connected to MongoDB successfully.");

    // 1. Clean existing tasks and seed users
    console.log("Clearing existing tasks and seed users...");
    await Task.deleteMany({});
    await User.deleteMany({ email: { $in: ["ronak@example.com", "admin@example.com"] } });

    // 2. Create primary user
    console.log("Creating default user: ronak@example.com...");
    const primaryUser = await User.create({
      name: "Ronak Chhaniyara",
      email: "ronak@example.com",
      password: "password123", // Pre-save hook automatically hashes this
      role: "admin",
    });

    const facultyUser = await User.create({
      name: "Dr. Faculty Evaluator",
      email: "admin@example.com",
      password: "adminpassword123",
      role: "admin",
    });

    console.log("Users created successfully with bcrypt hashing.");

    // 3. Create realistic sample tasks
    const sampleTasks = [
      {
        title: "Design Mongoose Task Schema with Pre-save Validation",
        description:
          "Enforce schema validation rules on title, description, priority enum, and timestamps using Mongoose ODM with pre-save whitespace trimming.",
        completed: true,
        priority: "high",
        user: primaryUser._id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Implement JWT Authentication & Refresh Token Rotation",
        description:
          "Secure backend endpoints with bcrypt password hashing and 1-hour expiration JWT Bearer tokens in custom auth middleware.",
        completed: true,
        priority: "high",
        user: primaryUser._id,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Set up Multi-Stage Docker Container for React Frontend",
        description:
          "Containerize the Vite frontend using multi-stage Alpine build and orchestrate with backend and MongoDB services via docker-compose.",
        completed: false,
        priority: "high",
        user: primaryUser._id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Integrate Generative AI API for Automated Deliverables",
        description:
          "Connect backend to Google Gemini / OpenAI with server-side API key isolation and a local heuristic engine for graceful offline degradation.",
        completed: true,
        priority: "high",
        user: primaryUser._id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Configure In-Memory Server Caching with Node-Cache",
        description:
          "Cache GET /tasks responses with a 60-second TTL to reduce database query latency by over 20x and invalidate on write mutations.",
        completed: true,
        priority: "medium",
        user: facultyUser._id,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Implement Route-Based Lazy Loading with React.lazy",
        description:
          "Optimize bundle size by code-splitting routes with Suspense fallback to improve First Contentful Paint (FCP) and Lighthouse metrics.",
        completed: true,
        priority: "medium",
        user: primaryUser._id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Create GitHub Actions CI/CD Automated Test Pipeline",
        description:
          "Configure .github/workflows/ci.yml with a MongoDB service container, automated Jest test execution, and frontend bundle verification.",
        completed: false,
        priority: "medium",
        user: primaryUser._id,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      {
        title: "Build Controlled Contact Form with Live Keystroke Counter",
        description:
          "Develop reactive form inputs tied to React useState hooks with dynamic keystroke count display and UI visibility toggles.",
        completed: true,
        priority: "medium",
        user: primaryUser._id,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Consume Public GitHub REST API with Loading Spinner",
        description:
          "Fetch repository list from GitHub endpoint inside useEffect with conditional rendering for loading, error, and retry states.",
        completed: true,
        priority: "medium",
        user: primaryUser._id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Optimize Vanilla CSS Glassmorphism & Dark Mode Theme",
        description:
          "Implement modern CSS custom properties, backdrop blur filters, and accessible color contrast across light and dark themes.",
        completed: true,
        priority: "low",
        user: primaryUser._id,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Refactor Centralized API Client with Error Interceptors",
        description:
          "Consolidate fetch wrapper in services/api.js with automatic Bearer token injection and global 401 session expiration handling.",
        completed: false,
        priority: "low",
        user: primaryUser._id,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        title: "Generate Performance Profile Screenshots for Lab File",
        description:
          "Profile network transfer sizes, cache hit ratios, and event loop latency across all 13 practical lab modules.",
        completed: false,
        priority: "low",
        user: primaryUser._id,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    ];

    console.log(`Inserting ${sampleTasks.length} rich sample tasks...`);
    const createdTasks = await Task.insertMany(sampleTasks);
    console.log(`Successfully seeded ${createdTasks.length} tasks!`);

    // 4. Prime the in-memory cache
    console.log("Priming in-memory cache with all tasks...");
    invalidateTaskCache();
    const sortedTasks = await Task.find().sort({ createdAt: -1 });
    setCache("all_tasks", sortedTasks, 60);

    console.log("\n========================================================");
    console.log("✅ SEEDING COMPLETE!");
    console.log(`- Created User: ronak@example.com (Password: password123)`);
    console.log(`- Created User: admin@example.com (Password: adminpassword123)`);
    console.log(`- Seeded ${createdTasks.length} sample tasks (High: 4, Med: 5, Low: 3)`);
    console.log(`- Completion rate: 7 completed / 5 pending (~58%)`);
    console.log("========================================================\n");

    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seedData();
