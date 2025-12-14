# TaskFlow - Simple Task Management App

## Overview

TaskFlow is a task management web application built with a modern full-stack architecture. The application allows users to create, complete, and delete tasks through an intuitive interface inspired by Material Design and productivity apps like Todoist and Things. The project uses React for the frontend, Express for the backend, and is configured to use PostgreSQL with Drizzle ORM for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework and Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server, providing fast HMR (Hot Module Replacement)
- **Wouter** for lightweight client-side routing (alternative to React Router)
- **TanStack Query (React Query)** for server state management, caching, and data synchronization

**UI Component System**
- **shadcn/ui** component library built on Radix UI primitives
- Components follow the "New York" style variant with customizable theming
- **Tailwind CSS** for utility-first styling with custom design tokens
- Custom color system using HSL values with CSS variables for theme consistency
- Typography uses Inter/SF Pro Display fonts from Google Fonts

**State Management Strategy**
- Server state managed by TanStack Query with automatic refetching disabled (staleTime: Infinity)
- Local UI state managed with React hooks
- No global client state management library (Redux/Zustand) as the app is relatively simple

**Design System**
- Material Design principles with generous spacing (Tailwind units: 2, 4, 6, 8)
- Maximum container width of `max-w-2xl` centered on the page
- Responsive design with mobile-first approach
- Custom elevation system using box shadows and opacity-based overlays

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript for the HTTP server
- RESTful API design with routes under `/api` prefix
- Custom logging middleware tracking request duration and responses

**API Structure**
- `GET /api/todos` - Fetch all todos
- `GET /api/todos/:id` - Fetch single todo by ID
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update existing todo
- `DELETE /api/todos/:id` - Delete todo

**Request/Response Flow**
- JSON body parsing with Express middleware
- Zod schema validation for incoming data (insertTodoSchema, updateTodoSchema)
- Consistent error responses with appropriate HTTP status codes (400 for validation, 404 for not found, 500 for server errors)

**Storage Layer Abstraction**
- `IStorage` interface defines the contract for data operations
- `MemStorage` provides in-memory implementation for development
- Architecture supports swapping to database-backed storage without changing business logic
- Storage operations are async to accommodate future database integration

### Data Storage Solutions

**Database Configuration**
- **PostgreSQL** as the target database (configured but not actively connected in current implementation)
- **Drizzle ORM** for type-safe database queries and schema management
- **@neondatabase/serverless** driver for PostgreSQL connectivity

**Schema Design**
- **Users Table**: id (UUID), username (unique), password
- **Todos Table**: id (UUID), text, completed (boolean, default false)
- UUIDs generated using PostgreSQL's `gen_random_uuid()` function
- Schema defined in `shared/schema.ts` for sharing between client and server

**Migration Strategy**
- Drizzle Kit configured for schema migrations in `migrations/` directory
- `db:push` script for pushing schema changes to database
- Shared schema types ensure type safety across the full stack

### External Dependencies

**UI Component Libraries**
- **Radix UI** - Comprehensive set of unstyled, accessible component primitives (accordion, dialog, dropdown, popover, etc.)
- **lucide-react** - Icon library for consistent iconography
- **class-variance-authority** - Utility for creating component variants
- **tailwind-merge** and **clsx** - Class name management utilities

**Form Management**
- **react-hook-form** - Form state management
- **@hookform/resolvers** - Integration with Zod for validation

**Development Tools**
- **tsx** - TypeScript execution for development server
- **esbuild** - Fast bundling for production server code
- **Replit plugins** - Development banner, cartographer, and runtime error overlay for Replit environment

**Build Optimization**
- Server dependencies bundled with esbuild to reduce cold start times
- Allowlist of specific dependencies to bundle (database drivers, utilities)
- Client code bundled with Vite for optimal production performance

### Development vs Production

**Development Mode**
- Vite dev server with HMR proxied through Express
- Source maps enabled for debugging
- Replit-specific development tools active
- Live reload on file changes

**Production Mode**
- Static assets served from `dist/public` directory
- Server code bundled to single `dist/index.cjs` file
- Environment detection via `NODE_ENV`
- Fallback to `index.html` for client-side routing (SPA)