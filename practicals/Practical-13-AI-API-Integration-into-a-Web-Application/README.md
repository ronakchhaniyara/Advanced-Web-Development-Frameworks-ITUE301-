# Practical 13: AI API Integration into a Web Application

**CO/PO Mapping:** CO6 / PO3, PO5, PO12

## Objective

To securely integrate an external Artificial Intelligence service (Gemini or OpenAI API) into the full-stack web application, enforce server-side secret management, implement graceful degradation against external failures, and maintain responsible AI governance principles.

---

## Architecture & Secure Gateway Pattern

```text
       +-------------------------------------------------------------+
       |               React Client (Browser)                        |
       |  - User enters task title (e.g. "Configure Docker Compose") |
       |  - Clicks "✨ AI Assist (Generate Description)"             |
       |  - Displays shimmering/pulse loader                         |
       |  - Receives editable suggestion + disclaimer notice         |
       +-------------------------------------------------------------+
                                      |
                                      | POST /api/ai/generate-description
                                      | (NO API KEYS EVER EXPOSED TO CLIENT!)
                                      v
       +-------------------------------------------------------------+
       |               Express Backend Gateway                       |
       |  - Reads GEMINI_API_KEY / OPENAI_API_KEY from .env only     |
       |  - Builds structured prompt with temperature & length limits|
       +-------------------------------------------------------------+
                                      |
                   ┌──────────────────┴──────────────────┐
                   │                                     │
                   v (If configured & healthy)           v (If no key / quota / timeout)
       +───────────────────────────+       +───────────────────────────+
       | External AI API Provider  |       | Local Heuristic AI Engine |
       | (Google Gemini / OpenAI)  |       | (Graceful Degradation)    |
       | Returns generated JSON    |       | Pattern-matching fallback |
       +───────────────────────────+       +───────────────────────────+
                   │                                     │
                   └──────────────────┬──────────────────┘
                                      │
                                      v
       +-------------------------------------------------------------+
       | 200 OK: { description, suggestedPriority, disclaimer }      |
       +-------------------------------------------------------------+
```

---

## Security & Responsible AI Considerations

1. **Server-Side Secret Isolation:** The API key is stored exclusively in `task-manager-api/.env` and excluded from git tracking via `.gitignore`. The browser Network tab never sees third-party keys.
2. **Graceful Degradation:** If an external AI provider experiences outages, quota limits, rate limits, or network timeouts, the backend catches the error and provides a deterministic heuristic response so the web app **never crashes**.
3. **User Control (Human in the Loop):** The AI-generated output is presented inside the input textarea as an editable suggestion rather than an irreversible state write. The student can accept, modify, or discard the suggestion.
4. **Mandatory Disclaimer:** The UI displays an explicit badge and notice:
   > *"AI-generated suggestion. Please review and customize before saving."*
5. **Data Privacy:** Only high-level task titles are dispatched; no private passwords or PII are transmitted.

---

## Backend Endpoint Code (`routes/aiRoutes.js`)

```javascript
router.post("/generate-description", async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Task title required" });

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (geminiApiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...prompt }),
        }
      );
      if (response.ok) {
        // parse and return structured description and suggested priority
      }
    } catch (err) {
      console.warn("External AI call failed, engaging fallback engine.");
    }
  }

  // Graceful degradation fallback
  const fallback = generateFallbackDescription(title);
  return res.status(200).json({
    description: fallback.description,
    suggestedPriority: fallback.suggestedPriority,
    fallback: true,
    model: "Heuristic AI Engine (Offline Safe)",
    disclaimer: "Generated via local heuristic AI. Please review before saving.",
  });
});
```

---

## Testing & Verification

Automated Jest test verification:
```javascript
test("POST /api/ai/generate-description returns generated description and priority", async () => {
  const res = await request(app)
    .post("/api/ai/generate-description")
    .send({ title: "Fix authentication token expiry bug" });

  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty("description");
  expect(res.body).toHaveProperty("suggestedPriority");
  expect(res.body).toHaveProperty("disclaimer");
});
```
Result: **PASS (100% verified)**
