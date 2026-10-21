# Practical 7: Authentication and Middleware Pipeline

**CO/PO Mapping:** CO2, CO6 / PO3, PO5

## Objective

To implement secure user authentication using bcrypt password hashing and JSON Web Tokens (JWT), and protect API routes using custom Express middleware.

---

## Prerequisites

- **Practical 6 completed:** Full-stack Task Management application connecting React to Node/Express/MongoDB.
- **Conceptual understanding:** One-way cryptographic hashing (bcrypt) vs reversible encryption, stateless authentication via Bearer tokens.

---

## Authentication Architecture & Flow

```text
1. User Registration:
   POST /register { name, email, password }
   └── Schema pre('save') hook: bcrypt.genSalt(10) -> bcrypt.hash(password)
   └── Save User document to MongoDB -> sign JWT -> return 201 + token

2. User Login:
   POST /login { email, password }
   └── Find User by email -> bcrypt.compare(password, user.password)
   └── Sign JWT with JWT_SECRET (1 hour expiry) -> return 200 + token

3. Protected Route Request:
   Client HTTP Request (Header: "Authorization: Bearer <token>")
   ├── [Request Logging Middleware]
   ├── [Auth Middleware (middleware/auth.js)]
   │   ├── Verifies token format
   │   ├── jwt.verify(token, process.env.JWT_SECRET)
   │   └── Attaches decoded payload: req.user = { id, email, role }
   ├── [Input Validation Middleware (middleware/validation.js)]
   └── Route Controller (Executes business logic)
```

---

## Key Files & Code Snippets

### 1. User Model with Pre-Save Hashing (`models/User.js`)
```javascript
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
```

### 2. JWT Verification Middleware (`middleware/auth.js`)
```javascript
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: err.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
    });
  }
};
```

### 3. Current User Profile Endpoint (`GET /me`)
Returns the logged-in user's profile from the decoded JWT payload without returning the password hash:
```javascript
router.get("/me", requireAuth, async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password");
  res.status(200).json({ message: "Current user profile", user });
});
```

### 4. Client-side Auth State & 401 Interception (`src/context/AuthContext.jsx`)
- Stores token securely in `localStorage`.
- Automatically attaches token to all outgoing requests via `Authorization: Bearer <token>`.
- Automatically detects `401 Unauthorized` responses and logs out expired sessions while showing a clear alert.

---

## Verification & Testing

Run the automated test suite in `task-manager-api`:
```bash
npm test
```
Outputs passing checks for:
- User registration with password hashing.
- User login with password verification and JWT generation.
- Access to `GET /me` with valid token.
- Rejection with `401 Unauthorized` when token is missing or invalid.
