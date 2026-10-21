const express = require("express");
const router = express.Router();

/**
 * Intelligent Fallback Generator for Graceful Degradation
 * Used when no external API key is provided or when external AI services fail/timeout.
 */
const generateFallbackDescription = (title) => {
  const lower = title.toLowerCase();
  let suggestedPriority = "medium";
  let description = "";

  if (lower.includes("auth") || lower.includes("login") || lower.includes("security") || lower.includes("jwt")) {
    suggestedPriority = "high";
    description = `Implement and test secure authentication flow for "${title}". Verify token issuance, protect private endpoints, validate request payloads, and handle authorization errors.`;
  } else if (lower.includes("bug") || lower.includes("fix") || lower.includes("crash") || lower.includes("critical")) {
    suggestedPriority = "high";
    description = `Investigate root cause of "${title}", reproduce issue with test cases, apply defensive fixes, and verify stability across all supported environments.`;
  } else if (lower.includes("database") || lower.includes("mongo") || lower.includes("schema") || lower.includes("migration")) {
    suggestedPriority = "high";
    description = `Design and refine data models for "${title}". Ensure index optimization, validate constraints, and maintain data consistency across write operations.`;
  } else if (lower.includes("ui") || lower.includes("css") || lower.includes("design") || lower.includes("style") || lower.includes("theme")) {
    suggestedPriority = "low";
    description = `Enhance user interface aesthetics and responsiveness for "${title}". Implement smooth transitions, verify dark/light mode contrast, and test across device widths.`;
  } else if (lower.includes("test") || lower.includes("jest") || lower.includes("ci") || lower.includes("docker")) {
    suggestedPriority = "medium";
    description = `Automate integration testing and deployment workflow for "${title}". Validate edge cases, monitor pass/fail status, and configure reliable continuous delivery.`;
  } else {
    description = `Complete key milestones for "${title}". Break down into actionable deliverables, track progress, review code quality, and verify end-to-end functionality.`;
  }

  return { description, suggestedPriority };
};

/**
 * POST /api/ai/generate-description
 * Generates an intelligent task description and suggests priority.
 * Gracefully degrades if external API key is missing or fails.
 */
router.post("/generate-description", async (req, res) => {
  const { title } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      error: "Task title is required to generate AI suggestion",
    });
  }

  const cleanTitle = title.trim();
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  // 1. If Gemini API key is configured, attempt calling Gemini REST endpoint
  if (geminiApiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an agile software engineering assistant. Given the task title "${cleanTitle}", produce a concise 2-sentence task description and suggest priority (low, medium, or high). Reply in strict JSON format: {"description": "...", "priority": "low|medium|high"}.`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 150,
            },
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.status(200).json({
            description: parsed.description,
            suggestedPriority: parsed.priority || "medium",
            fallback: false,
            model: "Gemini 1.5 Flash",
            disclaimer: "AI-generated suggestion. Please review before applying.",
          });
        }
      }
    } catch (apiErr) {
      console.warn("[AI API] Gemini call failed, falling back to local heuristic engine:", apiErr.message);
    }
  }

  // 2. If OpenAI API key is configured, attempt calling OpenAI endpoint
  if (openaiApiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a concise software task planner. Respond with valid JSON only: {\"description\": \"...\", \"priority\": \"low|medium|high\"}",
            },
            {
              role: "user",
              content: `Write a short 2-sentence description and priority for: "${cleanTitle}"`,
            },
          ],
          temperature: 0.5,
          max_tokens: 150,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const content = json?.choices?.[0]?.message?.content || "";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.status(200).json({
            description: parsed.description,
            suggestedPriority: parsed.priority || "medium",
            fallback: false,
            model: "GPT-4o Mini",
            disclaimer: "AI-generated suggestion. Please review before applying.",
          });
        }
      }
    } catch (apiErr) {
      console.warn("[AI API] OpenAI call failed, falling back to local heuristic engine:", apiErr.message);
    }
  }

  // 3. Graceful degradation: Deterministic heuristic engine (always succeeds!)
  const fallbackResult = generateFallbackDescription(cleanTitle);

  return res.status(200).json({
    description: fallbackResult.description,
    suggestedPriority: fallbackResult.suggestedPriority,
    fallback: true,
    model: "Heuristic AI Engine (Offline Safe)",
    disclaimer: "Generated via local heuristic AI. Please review and customize before saving.",
  });
});

module.exports = router;
