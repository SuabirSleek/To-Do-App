import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTodoSchema, updateTodoSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // GET all todos
  app.get("/api/todos", async (_req, res) => {
    try {
      const todos = await storage.getAllTodos();
      res.json(todos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch todos" });
    }
  });

  // GET all categories
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // GET single todo
  app.get("/api/todos/:id", async (req, res) => {
    try {
      const todo = await storage.getTodo(req.params.id);
      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      res.json(todo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch todo" });
    }
  });

  // POST create todo
  app.post("/api/todos", async (req, res) => {
    try {
      const parsed = insertTodoSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid todo data",
          errors: parsed.error.errors 
        });
      }
      const todo = await storage.createTodo(parsed.data);
      res.status(201).json(todo);
    } catch (error) {
      res.status(500).json({ message: "Failed to create todo" });
    }
  });

  // PATCH update todo
  app.patch("/api/todos/:id", async (req, res) => {
    try {
      const parsed = updateTodoSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid update data",
          errors: parsed.error.errors 
        });
      }
      const todo = await storage.updateTodo(req.params.id, parsed.data);
      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      res.json(todo);
    } catch (error) {
      res.status(500).json({ message: "Failed to update todo" });
    }
  });

  // DELETE todo
  app.delete("/api/todos/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTodo(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Todo not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete todo" });
    }
  });

  return httpServer;
}
