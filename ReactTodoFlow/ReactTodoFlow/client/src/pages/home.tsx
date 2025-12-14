import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle2, Plus, Trash2, ClipboardList, Loader2, AlertCircle, RefreshCw,
  Pencil, Check, X, Search, ArrowUpDown, Tag, Flag
} from "lucide-react";
import type { Todo, Priority } from "@shared/schema";
import { useState, useMemo } from "react";

const addTaskSchema = z.object({
  text: z.string().trim().min(1, "Task text is required").max(500, "Task text is too long"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  category: z.string().trim().optional(),
});

type AddTaskForm = z.infer<typeof addTaskSchema>;

const editTaskSchema = z.object({
  text: z.string().trim().min(1, "Task text is required").max(500, "Task text is too long"),
});

type EditTaskForm = z.infer<typeof editTaskSchema>;

type FilterType = "all" | "active" | "completed";
type SortType = "newest" | "oldest" | "priority" | "alphabetical";

const priorityColors: Record<Priority, string> = {
  low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  high: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

const priorityLabels: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const priorityOrder: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function TodoInput({ 
  onAdd, 
  isPending, 
  existingCategories 
}: { 
  onAdd: (text: string, priority: Priority, category?: string) => void; 
  isPending: boolean;
  existingCategories: string[];
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const form = useForm<AddTaskForm>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: {
      text: "",
      priority: "medium",
      category: "",
    },
  });

  const onSubmit = (data: AddTaskForm) => {
    onAdd(data.text.trim(), data.priority, data.category?.trim() || undefined);
    form.reset();
    setShowAdvanced(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div className="flex gap-3 flex-wrap">
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem className="flex-1 min-w-0">
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Add a new task..."
                    disabled={isPending}
                    data-testid="input-new-task"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowAdvanced(!showAdvanced)}
            data-testid="button-toggle-options"
          >
            <Flag className="h-4 w-4" />
          </Button>
          <Button 
            type="submit" 
            disabled={isPending}
            data-testid="button-add-task"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Add Task</span>
          </Button>
        </div>
        
        {showAdvanced && (
          <div className="flex gap-3 flex-wrap items-center">
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem className="w-32">
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-priority">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="flex-1 min-w-[120px]">
                  <FormControl>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="text"
                        placeholder="Category (optional)"
                        className="pl-9"
                        list="category-suggestions"
                        disabled={isPending}
                        data-testid="input-category"
                      />
                      <datalist id="category-suggestions">
                        {existingCategories.map(cat => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}
      </form>
    </Form>
  );
}

function TodoItemEdit({
  todo,
  onSave,
  onCancel,
  isSaving,
}: {
  todo: Todo;
  onSave: (text: string) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const form = useForm<EditTaskForm>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      text: todo.text,
    },
  });

  const onSubmit = (data: EditTaskForm) => {
    onSave(data.text.trim());
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 flex-1">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem className="flex-1 min-w-0">
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  autoFocus
                  disabled={isSaving}
                  data-testid={`input-edit-${todo.id}`}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isSaving}
          data-testid={`button-save-edit-${todo.id}`}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onCancel}
          disabled={isSaving}
          data-testid={`button-cancel-edit-${todo.id}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
}

function TodoItem({ 
  todo, 
  onToggle, 
  onDelete,
  onEdit,
  onUpdatePriority,
  onUpdateCategory,
  isToggling,
  isDeleting,
  isEditing,
  editingId,
  isSaving,
}: { 
  todo: Todo; 
  onToggle: (id: string, completed: boolean) => void; 
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onUpdatePriority: (id: string, priority: Priority) => void;
  onUpdateCategory: (id: string, category: string | null) => void;
  isToggling: boolean;
  isDeleting: boolean;
  isEditing: boolean;
  editingId: string | null;
  isSaving: boolean;
}) {
  const [localEditingId, setLocalEditingId] = useState<string | null>(null);
  const isCurrentlyEditing = editingId === todo.id || localEditingId === todo.id;

  const handleStartEdit = () => {
    setLocalEditingId(todo.id);
  };

  const handleSaveEdit = (text: string) => {
    onEdit(todo.id, text);
    setLocalEditingId(null);
  };

  const handleCancelEdit = () => {
    setLocalEditingId(null);
  };

  return (
    <div 
      className={`group flex items-center gap-3 p-4 rounded-lg border bg-card border-card-border transition-all duration-200 ${
        todo.completed ? 'opacity-60' : ''
      } ${isDeleting ? 'opacity-50 scale-95' : ''}`}
      data-testid={`todo-item-${todo.id}`}
    >
      <div className="flex items-center justify-center">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={(checked) => onToggle(todo.id, checked as boolean)}
          disabled={isToggling || isDeleting || isCurrentlyEditing}
          aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
          data-testid={`checkbox-todo-${todo.id}`}
        />
      </div>
      
      {isCurrentlyEditing ? (
        <TodoItemEdit
          todo={todo}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          isSaving={isSaving}
        />
      ) : (
        <>
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <span 
              className={`text-base leading-relaxed transition-all duration-200 ${
                todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'
              }`}
              data-testid={`text-todo-${todo.id}`}
            >
              {todo.text}
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant="outline" 
                className={`text-xs ${priorityColors[todo.priority as Priority]}`}
                data-testid={`badge-priority-${todo.id}`}
              >
                {priorityLabels[todo.priority as Priority]}
              </Badge>
              {todo.category && (
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                  data-testid={`badge-category-${todo.id}`}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {todo.category}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 md:opacity-0 max-md:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleStartEdit}
              disabled={isDeleting || todo.completed}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Edit task"
              data-testid={`button-edit-${todo.id}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(todo.id)}
              disabled={isDeleting}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Delete task"
              data-testid={`button-delete-${todo.id}`}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function FilterBar({
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
}: {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  categories: string[];
}) {
  return (
    <div className="space-y-3">
      <Tabs value={filter} onValueChange={(v) => onFilterChange(v as FilterType)}>
        <TabsList className="w-full" data-testid="tabs-filter">
          <TabsTrigger value="all" className="flex-1" data-testid="tab-all">All</TabsTrigger>
          <TabsTrigger value="active" className="flex-1" data-testid="tab-active">Active</TabsTrigger>
          <TabsTrigger value="completed" className="flex-1" data-testid="tab-completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
        
        <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortType)}>
          <SelectTrigger className="w-[140px]" data-testid="select-sort">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="alphabetical">A-Z</SelectItem>
          </SelectContent>
        </Select>
        
        {categories.length > 0 && (
          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger className="w-[140px]" data-testid="select-category-filter">
              <Tag className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}

function TodoList({ 
  todos, 
  onToggle, 
  onDelete,
  onEdit,
  onUpdatePriority,
  onUpdateCategory,
  togglingIds,
  deletingIds,
  editingId,
  savingIds,
  emptyMessage,
}: { 
  todos: Todo[]; 
  onToggle: (id: string, completed: boolean) => void; 
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onUpdatePriority: (id: string, priority: Priority) => void;
  onUpdateCategory: (id: string, category: string | null) => void;
  togglingIds: Set<string>;
  deletingIds: Set<string>;
  editingId: string | null;
  savingIds: Set<string>;
  emptyMessage?: string;
}) {
  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <ClipboardList className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">
          {emptyMessage || "No tasks yet"}
        </h3>
        <p className="text-muted-foreground text-sm">
          {emptyMessage ? "Try adjusting your filters" : "Add one to get started!"}
        </p>
      </div>
    );
  }

  const incompleteTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <div className="space-y-2">
      {incompleteTodos.map((todo) => (
        <TodoItem 
          key={todo.id} 
          todo={todo} 
          onToggle={onToggle} 
          onDelete={onDelete}
          onEdit={onEdit}
          onUpdatePriority={onUpdatePriority}
          onUpdateCategory={onUpdateCategory}
          isToggling={togglingIds.has(todo.id)}
          isDeleting={deletingIds.has(todo.id)}
          isEditing={editingId === todo.id}
          editingId={editingId}
          isSaving={savingIds.has(todo.id)}
        />
      ))}
      {completedTodos.length > 0 && incompleteTodos.length > 0 && (
        <div className="py-2">
          <div className="border-t border-border" />
        </div>
      )}
      {completedTodos.map((todo) => (
        <TodoItem 
          key={todo.id} 
          todo={todo} 
          onToggle={onToggle} 
          onDelete={onDelete}
          onEdit={onEdit}
          onUpdatePriority={onUpdatePriority}
          onUpdateCategory={onUpdateCategory}
          isToggling={togglingIds.has(todo.id)}
          isDeleting={deletingIds.has(todo.id)}
          isEditing={editingId === todo.id}
          editingId={editingId}
          isSaving={savingIds.has(todo.id)}
        />
      ))}
    </div>
  );
}

function TaskCounter({ todos, filter }: { todos: Todo[]; filter: FilterType }) {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const active = total - completed;
  
  if (total === 0) return null;
  
  const filterLabel = filter === "all" 
    ? `${total} ${total === 1 ? 'task' : 'tasks'}` 
    : filter === "active" 
      ? `${active} active` 
      : `${completed} completed`;
  
  return (
    <p className="text-sm text-muted-foreground" data-testid="text-task-counter">
      {filterLabel} • {completed} of {total} done
    </p>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">Failed to load tasks</h3>
      <p className="text-muted-foreground text-sm mb-4">Something went wrong. Please try again.</p>
      <Button variant="outline" onClick={onRetry} data-testid="button-retry">
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}

export default function Home() {
  const { toast } = useToast();
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("newest");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: todos = [], isLoading, isError, refetch } = useQuery<Todo[]>({
    queryKey: ['/api/todos'],
  });

  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ['/api/categories'],
  });

  const filteredAndSortedTodos = useMemo(() => {
    let result = [...todos];
    
    if (filter === "active") {
      result = result.filter(t => !t.completed);
    } else if (filter === "completed") {
      result = result.filter(t => t.completed);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.text.toLowerCase().includes(query) ||
        (t.category && t.category.toLowerCase().includes(query))
      );
    }
    
    if (categoryFilter !== "all") {
      result = result.filter(t => t.category === categoryFilter);
    }
    
    result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return 0;
        case "priority":
          return priorityOrder[a.priority as Priority] - priorityOrder[b.priority as Priority];
        case "alphabetical":
          return a.text.localeCompare(b.text);
        case "newest":
        default:
          return 0;
      }
    });
    
    if (sortBy === "newest") {
      result.reverse();
    }
    
    return result;
  }, [todos, filter, searchQuery, sortBy, categoryFilter]);

  const addTodoMutation = useMutation({
    mutationFn: async ({ text, priority, category }: { text: string; priority: Priority; category?: string }) => {
      return apiRequest('POST', '/api/todos', { text, completed: false, priority, category: category || null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Task added",
        description: "Your new task has been created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleTodoMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      setTogglingIds(prev => new Set(prev).add(id));
      return apiRequest('PATCH', `/api/todos/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: (_, __, { id }) => {
      setTogglingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
  });

  const editTodoMutation = useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      setSavingIds(prev => new Set(prev).add(id));
      return apiRequest('PATCH', `/api/todos/${id}`, { text });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos'] });
      setEditingId(null);
      toast({
        title: "Task updated",
        description: "Your task has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save task. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: (_, __, { id }) => {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
  });

  const updatePriorityMutation = useMutation({
    mutationFn: async ({ id, priority }: { id: string; priority: Priority }) => {
      return apiRequest('PATCH', `/api/todos/${id}`, { priority });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update priority. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, category }: { id: string; category: string | null }) => {
      return apiRequest('PATCH', `/api/todos/${id}`, { category });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingIds(prev => new Set(prev).add(id));
      return apiRequest('DELETE', `/api/todos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Task deleted",
        description: "The task has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: (_, __, id) => {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
  });

  const handleAddTodo = (text: string, priority: Priority, category?: string) => {
    addTodoMutation.mutate({ text, priority, category });
  };

  const handleToggleTodo = (id: string, completed: boolean) => {
    toggleTodoMutation.mutate({ id, completed });
  };

  const handleEditTodo = (id: string, text: string) => {
    editTodoMutation.mutate({ id, text });
  };

  const handleUpdatePriority = (id: string, priority: Priority) => {
    updatePriorityMutation.mutate({ id, priority });
  };

  const handleUpdateCategory = (id: string, category: string | null) => {
    updateCategoryMutation.mutate({ id, category });
  };

  const handleDeleteTodo = (id: string) => {
    deleteTodoMutation.mutate(id);
  };

  const getEmptyMessage = () => {
    if (searchQuery.trim()) return "No tasks match your search";
    if (filter === "active") return "No active tasks";
    if (filter === "completed") return "No completed tasks";
    if (categoryFilter !== "all") return `No tasks in "${categoryFilter}"`;
    return undefined;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <Card className="overflow-visible">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="rounded-lg bg-primary/10 p-2">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-2xl font-semibold" data-testid="text-app-title">
                  TaskFlow
                </CardTitle>
                <CardDescription>
                  <TaskCounter todos={todos} filter={filter} />
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <TodoInput 
              onAdd={handleAddTodo} 
              isPending={addTodoMutation.isPending}
              existingCategories={categories}
            />
            
            {todos.length > 0 && (
              <FilterBar
                filter={filter}
                onFilterChange={setFilter}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                categories={categories}
              />
            )}
            
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : isError ? (
              <ErrorState onRetry={() => refetch()} />
            ) : (
              <TodoList 
                todos={filteredAndSortedTodos} 
                onToggle={handleToggleTodo} 
                onDelete={handleDeleteTodo}
                onEdit={handleEditTodo}
                onUpdatePriority={handleUpdatePriority}
                onUpdateCategory={handleUpdateCategory}
                togglingIds={togglingIds}
                deletingIds={deletingIds}
                editingId={editingId}
                savingIds={savingIds}
                emptyMessage={getEmptyMessage()}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
