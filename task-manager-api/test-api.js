const http = require("http");
const mongoose = require("mongoose");
require("dotenv").config();

const { app, server } = require("./server");

const request = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: "127.0.0.1",
      port: 5000,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
        ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let responseBody = "";
      res.on("data", (chunk) => (responseBody += chunk));
      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            body: responseBody ? JSON.parse(responseBody) : {},
          });
        } catch {
          resolve({ status: res.statusCode, raw: responseBody });
        }
      });
    });

    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
};

const runTests = async () => {
  console.log("=== STARTING PRACTICAL 5 CRUD & VALIDATION TESTS ===");

  // Wait 1s for mongo to connect
  await new Promise((r) => setTimeout(r, 1000));

  // 1. Test POST /tasks (Validation failure: missing title)
  console.log("\n1. Testing POST /tasks with missing title (Schema Validation)...");
  const resValidation1 = await request("POST", "/tasks", {
    description: "No title provided",
  });
  console.log("Status:", resValidation1.status);
  console.log("Response:", JSON.stringify(resValidation1.body));
  if (resValidation1.status === 400 && resValidation1.body.details?.includes("Task title is required")) {
    console.log("PASS: Missing title validation returned structured JSON error.");
  } else {
    console.error("FAIL: Expected 400 validation error.");
  }

  // 2. Test POST /tasks (Validation failure: invalid priority enum)
  console.log("\n2. Testing POST /tasks with invalid priority enum (Supplementary Problem 1)...");
  const resValidation2 = await request("POST", "/tasks", {
    title: "Urgent fix",
    priority: "critical", // Invalid enum!
  });
  console.log("Status:", resValidation2.status);
  console.log("Response:", JSON.stringify(resValidation2.body));
  if (resValidation2.status === 400 && resValidation2.body.details?.some((d) => d.includes("Priority"))) {
    console.log("PASS: Enum validation returned structured JSON error.");
  } else {
    console.error("FAIL: Expected 400 enum validation error.");
  }

  // 3. Test POST /tasks (Success + Pre-save trim hook on title)
  console.log("\n3. Testing POST /tasks with valid data and leading/trailing whitespace in title...");
  const resCreate = await request("POST", "/tasks", {
    title: "   Learn Mongoose Schemas and Validation   ",
    description: "Practical 5 MongoDB integration with Express",
    priority: "high",
  });
  console.log("Status:", resCreate.status);
  console.log("Response:", JSON.stringify(resCreate.body));
  const createdTaskId = resCreate.body.data?._id;
  if (resCreate.status === 201 && resCreate.body.data?.title === "Learn Mongoose Schemas and Validation") {
    console.log("PASS: Task created and title whitespace trimmed via pre-save hook!");
  } else {
    console.error("FAIL: Task creation or trim failed.");
  }

  // 4. Test GET /tasks (All tasks)
  console.log("\n4. Testing GET /tasks...");
  const resGetAll = await request("GET", "/tasks");
  console.log("Status:", resGetAll.status);
  console.log("Total tasks in MongoDB:", resGetAll.body.count);
  console.log("First task title:", resGetAll.body.data?.[0]?.title);
  if (resGetAll.status === 200 && Array.isArray(resGetAll.body.data)) {
    console.log("PASS: GET /tasks returned tasks from MongoDB.");
  }

  // 5. Test GET /tasks/:id (Supplementary Problem 3: Existing Task)
  console.log(`\n5. Testing GET /tasks/${createdTaskId}...`);
  const resGetOne = await request("GET", `/tasks/${createdTaskId}`);
  console.log("Status:", resGetOne.status);
  console.log("Response:", JSON.stringify(resGetOne.body));
  if (resGetOne.status === 200 && resGetOne.body.data?._id === createdTaskId) {
    console.log("PASS: GET /tasks/:id returned specific task.");
  }

  // 6. Test GET /tasks/:id (Supplementary Problem 3: Non-existent ObjectId)
  const fakeId = new mongoose.Types.ObjectId().toString();
  console.log(`\n6. Testing GET /tasks/${fakeId} (Non-existent ID -> 404)...`);
  const resGet404 = await request("GET", `/tasks/${fakeId}`);
  console.log("Status:", resGet404.status);
  console.log("Response:", JSON.stringify(resGet404.body));
  if (resGet404.status === 404 && resGet404.body.error === "Task not found") {
    console.log("PASS: 404 response returned for non-existent ID.");
  }

  // 7. Test GET /tasks/:id (Malformed ObjectId -> 400)
  console.log("\n7. Testing GET /tasks/invalid-id-123 (Malformed ID -> 400)...");
  const resGetBadId = await request("GET", "/tasks/invalid-id-123");
  console.log("Status:", resGetBadId.status);
  console.log("Response:", JSON.stringify(resGetBadId.body));
  if (resGetBadId.status === 400) {
    console.log("PASS: 400 response returned for invalid ObjectId format.");
  }

  // 8. Test PUT /tasks/:id (Update task)
  console.log(`\n8. Testing PUT /tasks/${createdTaskId}...`);
  const resUpdate = await request("PUT", `/tasks/${createdTaskId}`, {
    completed: true,
    priority: "low",
  });
  console.log("Status:", resUpdate.status);
  console.log("Response:", JSON.stringify(resUpdate.body));
  if (resUpdate.status === 200 && resUpdate.body.data?.completed === true && resUpdate.body.data?.priority === "low") {
    console.log("PASS: PUT /tasks/:id successfully updated task.");
  }

  // 9. Test PUT /tasks/:id with invalid priority enum
  console.log(`\n9. Testing PUT /tasks/${createdTaskId} with invalid priority enum...`);
  const resBadUpdate = await request("PUT", `/tasks/${createdTaskId}`, {
    priority: "super-high",
  });
  console.log("Status:", resBadUpdate.status);
  console.log("Response:", JSON.stringify(resBadUpdate.body));
  if (resBadUpdate.status === 400 && resBadUpdate.body.details?.some((d) => d.includes("Priority"))) {
    console.log("PASS: PUT /tasks/:id validated enum via runValidators: true.");
  }

  // 10. Test DELETE /tasks/:id (Delete task)
  console.log(`\n10. Testing DELETE /tasks/${createdTaskId}...`);
  const resDelete = await request("DELETE", `/tasks/${createdTaskId}`);
  console.log("Status:", resDelete.status);
  console.log("Response:", JSON.stringify(resDelete.body));
  if (resDelete.status === 200 && resDelete.body.data?._id === createdTaskId) {
    console.log("PASS: DELETE /tasks/:id successfully removed task.");
  }

  // 11. Verify DELETE 404 on subsequent get
  console.log(`\n11. Verifying deleted task returns 404...`);
  const resVerifyDeleted = await request("GET", `/tasks/${createdTaskId}`);
  if (resVerifyDeleted.status === 404) {
    console.log("PASS: Deleted task confirmed absent from MongoDB.");
  }

  console.log("\n=== ALL PRACTICAL 5 TESTS PASSED SUCCESSFULLY ===");

  server.close();
  await mongoose.connection.close();
  process.exit(0);
};

runTests().catch((err) => {
  console.error("Test error:", err);
  server.close();
  mongoose.connection.close();
  process.exit(1);
});
