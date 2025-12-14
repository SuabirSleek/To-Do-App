import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const priorityEnum = z.enum(["low", "medium", "high"]);
export type Priority = z.infer<typeof priorityEnum>;

export const todos = pgTable("todos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  completed: boolean("completed").notNull().default(false),
  priority: text("priority").notNull().default("medium"),
  category: text("category"),
});

export const insertTodoSchema = createInsertSchema(todos).omit({
  id: true,
}).extend({
  priority: priorityEnum.optional().default("medium"),
  category: z.string().nullable().optional(),
});

export const updateTodoSchema = createInsertSchema(todos).partial().omit({
  id: true,
}).extend({
  priority: priorityEnum.optional(),
  category: z.string().nullable().optional(),
});

export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type UpdateTodo = z.infer<typeof updateTodoSchema>;
export type Todo = typeof todos.$inferSelect;
