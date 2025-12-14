import { type User, type InsertUser, type Todo, type InsertTodo, type UpdateTodo } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllTodos(): Promise<Todo[]>;
  getTodo(id: string): Promise<Todo | undefined>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(id: string, updates: UpdateTodo): Promise<Todo | undefined>;
  deleteTodo(id: string): Promise<boolean>;
  getCategories(): Promise<string[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private todos: Map<string, Todo>;

  constructor() {
    this.users = new Map();
    this.todos = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllTodos(): Promise<Todo[]> {
    return Array.from(this.todos.values());
  }

  async getTodo(id: string): Promise<Todo | undefined> {
    return this.todos.get(id);
  }

  async createTodo(insertTodo: InsertTodo): Promise<Todo> {
    const id = randomUUID();
    const todo: Todo = { 
      id, 
      text: insertTodo.text, 
      completed: insertTodo.completed ?? false,
      priority: insertTodo.priority ?? "medium",
      category: insertTodo.category ?? null,
    };
    this.todos.set(id, todo);
    return todo;
  }

  async updateTodo(id: string, updates: UpdateTodo): Promise<Todo | undefined> {
    const todo = this.todos.get(id);
    if (!todo) return undefined;
    
    const updatedTodo: Todo = {
      ...todo,
      ...updates,
    };
    this.todos.set(id, updatedTodo);
    return updatedTodo;
  }

  async deleteTodo(id: string): Promise<boolean> {
    return this.todos.delete(id);
  }

  async getCategories(): Promise<string[]> {
    const categories = new Set<string>();
    const todos = Array.from(this.todos.values());
    for (const todo of todos) {
      if (todo.category) {
        categories.add(todo.category);
      }
    }
    return Array.from(categories).sort();
  }
}

export const storage = new MemStorage();
