import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(), // Simple password hash or plain text for dev/simulation auth
    targetRole: v.string(),
    education: v.string(),
    apiKey: v.optional(v.string()),
    createdAt: v.string(),
  }).index("by_email", ["email"]),

  resumes: defineTable({
    userId: v.string(), // maps to users table ID
    text: v.string(),
    atsScore: v.number(),
    missingKeywords: v.array(v.string()),
    findings: v.object({
      strengths: v.array(v.string()),
      weaknesses: v.array(v.string()),
      formatting: v.array(v.string()),
    }),
    actionPlan: v.array(v.string()),
    createdAt: v.string(),
  }).index("by_user", ["userId"]),

  interviews: defineTable({
    userId: v.string(), // maps to users table ID
    role: v.string(),
    type: v.string(),
    difficulty: v.string(),
    score: v.number(),
    history: v.any(), // Stores the transcript conversation history
    createdAt: v.string(),
  }).index("by_user", ["userId"]),
});
