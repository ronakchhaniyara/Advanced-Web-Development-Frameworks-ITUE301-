# Practical 12: CI/CD Pipeline with GitHub Actions

**CO/PO Mapping:** CO5 / PO3, PO5

## Objective

To automate testing, linting, and build verification of the full-stack application using GitHub Actions on every commit and pull request.

---

## Pipeline Workflow Architecture

```text
git push origin main / Pull Request
 │
 ├── GitHub Actions Trigger (on: push, pull_request)
 │
 └── Runner: ubuntu-latest
     │
     ├── Service: MongoDB (mongo:6 on port 27017 with mongosh healthcheck)
     │
     ├── Step 1: actions/checkout@v4 (Check out code)
     ├── Step 2: actions/setup-node@v4 (Node 18.x with npm cache)
     ├── Step 3: Install frontend dependencies (npm ci)
     ├── Step 4: Verify frontend production bundle (npm run build)
     ├── Step 5: Install backend dependencies (npm ci)
     ├── Step 6: Run automated integration tests (npm test)
     │   ├── Task CRUD integration tests
     │   ├── Schema validation failure tests
     │   ├── JWT authentication & protected route tests
     │   ├── In-memory caching (HIT/MISS) tests
     │   └── AI fallback generation tests
     └── Step 7: Report Pass (Green checkmark) or Fail (Red X)
```

---

## GitHub Actions Configuration (`.github/workflows/ci.yml`)

```yaml
name: Full Stack CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:6
        ports:
          - 27017:27017
        options: >-
          --health-cmd mongosh
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js 18.x
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: "npm"

      - name: Install Frontend Dependencies
        run: npm ci || npm install

      - name: Verify Frontend Build
        run: npm run build

      - name: Install Backend Dependencies
        working-directory: ./task-manager-api
        run: npm ci || npm install

      - name: Run Backend Integration & Unit Tests (Jest + Supertest)
        working-directory: ./task-manager-api
        env:
          MONGO_URI: mongodb://127.0.0.1:27017/task_manager_test_db
          JWT_SECRET: ci_pipeline_jwt_secret_token_12345
          NODE_ENV: test
        run: npm test
```

---

## Automated Test Results

Local and CI execution using `npm test` runs 12 assertions across 4 test suites:

```text
PASS tests/api.test.js
  Practical 4, 5 & 6: Task RESTful API & Full-Stack Integration
    √ GET /tasks returns 200 with task array (Practical 4 & 12 Requirement) (96 ms)
    √ POST /tasks creates a new task (Practical 5 Mongoose Schema Validation) (70 ms)
    √ POST /tasks fails with 400 when title is missing (35 ms)
    √ GET /tasks/:id fetches single task (33 ms)
    √ PUT /tasks/:id updates a task (33 ms)
    √ DELETE /tasks/:id deletes the created task (33 ms)
  Practical 7: Authentication & Middleware Pipeline
    √ POST /register creates a new user and returns JWT token (194 ms)
    √ POST /login authenticates with valid credentials (130 ms)
    √ GET /me returns user profile with valid Bearer token (24 ms)
    √ GET /me rejects with 401 when token is missing (17 ms)
  Practical 9: In-Memory Caching (node-cache)
    √ GET /tasks serves from cache on second request (X-Cache: HIT) (38 ms)
  Practical 13: AI Integration & Graceful Fallback
    √ POST /api/ai/generate-description returns generated description and priority (29 ms)

Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        2.496 s
```
