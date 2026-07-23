import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Simple password hashing simulation for frontend auth safety
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
};

// Mutation to register/signup a user
export const signup = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    targetRole: v.string(),
    education: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("A user with this email address already exists.");
    }

    const passwordHash = simpleHash(args.password);

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      passwordHash,
      targetRole: args.targetRole,
      education: args.education,
      createdAt: new Date().toISOString(),
    });

    return userId;
  },
});

// Mutation to login a user
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("No user found with this email address.");
    }

    const passwordHash = simpleHash(args.password);
    if (user.passwordHash !== passwordHash) {
      throw new Error("Incorrect password. Please try again.");
    }

    // Return user without password hash
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  },
});

// Query to get user by ID
export const get = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Safely cast to user ID
    try {
      const user = await ctx.db.get(args.userId as any);
      if (!user) return null;
      
      const u = user as any;
      const { passwordHash: _, ...safeUser } = u;
      return safeUser;
    } catch {
      return null;
    }
  },
});

// Mutation to update user details
export const updateProfile = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    targetRole: v.string(),
    education: v.string(),
    apiKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId as any);
    if (!user) {
      throw new Error("User not found.");
    }

    await ctx.db.patch(args.userId as any, {
      name: args.name,
      targetRole: args.targetRole,
      education: args.education,
      apiKey: args.apiKey,
    });

    return { success: true };
  },
});
