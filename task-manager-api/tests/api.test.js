const request = require("supertest");
const mongoose = require("mongoose");
require("dotenv").config();
const { app } = require("../server");
const Task = require("../models/Task");
const User = require("../models/User");

const TEST_MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/task_manager_test_db";

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      driverInfo: { name: "Mongoose", version: "9.10.1" },
    });
  }
});

afterAll(async () => {
  try {
    await Task.deleteMany({ title: /Test/ });
    await User.deleteMany({ email: /test.*@example\.com/ });
  } catch (err) {
    console.error("Cleanup error:", err.message);
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

describe("Practical 4, 5 & 6: Task RESTful API & Full-Stack Integration", () => {
  let createdTaskId = null;

  test("GET /tasks returns 200 with task array (Practical 4 & 12 Requirement)", async () => {
    const res = await request(app).get("/tasks");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("POST /tasks creates a new task (Practical 5 Mongoose Schema Validation)", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({
        title: "Test Task Practical 12",
        description: "Automated test description",
        priority: "high",
        completed: false,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty("_id");
    expect(res.body.data.title).toBe("Test Task Practical 12");
    expect(res.body.data.priority).toBe("high");
    createdTaskId = res.body.data._id;
  });

  test("POST /tasks fails with 400 when title is missing", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({
        description: "Missing title",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Validation Error");
    expect(res.body.details).toContain("Task title is required");
  });

  test("GET /tasks/:id fetches single task", async () => {
    if (!createdTaskId) return;
    const res = await request(app).get(`/tasks/${createdTaskId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data._id).toBe(createdTaskId);
  });

  test("PUT /tasks/:id updates a task", async () => {
    if (!createdTaskId) return;
    const res = await request(app)
      .put(`/tasks/${createdTaskId}`)
      .send({
        completed: true,
        priority: "medium",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.completed).toBe(true);
  });

  test("DELETE /tasks/:id deletes the created task", async () => {
    if (!createdTaskId) return;
    const res = await request(app).delete(`/tasks/${createdTaskId}`);
    expect(res.statusCode).toBe(200);
  });
});

describe("Practical 7: Authentication & Middleware Pipeline", () => {
  const testEmail = `test_${Date.now()}@example.com`;
  let authToken = null;

  test("POST /register creates a new user and returns JWT token", async () => {
    const res = await request(app).post("/register").send({
      name: "Test Runner",
      email: testEmail,
      password: "password123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe(testEmail);
  });

  test("POST /login authenticates with valid credentials", async () => {
    const res = await request(app).post("/login").send({
      email: testEmail,
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    authToken = res.body.token;
  });

  test("GET /me returns user profile with valid Bearer token", async () => {
    const res = await request(app)
      .get("/me")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(testEmail);
  });

  test("GET /me rejects with 401 when token is missing", async () => {
    const res = await request(app).get("/me");
    expect(res.statusCode).toBe(401);
  });
});

describe("Practical 9: In-Memory Caching (node-cache)", () => {
  test("GET /tasks serves from cache on second request (X-Cache: HIT)", async () => {
    // First request primes cache
    const res1 = await request(app).get("/tasks");
    expect(res1.statusCode).toBe(200);

    // Second request within TTL should hit cache
    const res2 = await request(app).get("/tasks");
    expect(res2.statusCode).toBe(200);
    expect(res2.headers["x-cache"]).toBe("HIT");
  });
});

describe("Practical 13: AI Integration & Graceful Fallback", () => {
  test("POST /api/ai/generate-description returns generated description and priority", async () => {
    const res = await request(app)
      .post("/api/ai/generate-description")
      .send({
        title: "Fix authentication token expiry bug",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("description");
    expect(res.body.description.length).toBeGreaterThan(10);
    expect(res.body).toHaveProperty("suggestedPriority");
    expect(res.body).toHaveProperty("disclaimer");
  });
});
