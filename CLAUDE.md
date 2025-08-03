# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Prerequisites
- **pnpm** as package manager (pnpm@10.13.1)
- **Supabase CLI** for local database

### Starting Development
```bash
# Start Supabase, Edge Functions, and web dev server concurrently
pnpm dev

### Build & Deployment
```bash
pnpm web:build        # Build production version
pnpm web:preview      # Preview production build
```

### Code Quality
```bash
pnpm lint            # Run ESLint on entire project
pnpm lint:fix        # Auto-fix linting issues
pnpm type-check      # Run TypeScript type checking (vue-tsc --noEmit)
```

### Supabase Management
```bash
pnpm supabase:status  # Check Supabase services status
pnpm supabase:stop    # Stop local Supabase instance
```

## Architecture Overview

### Project Structure
This is a **pnpm workspace monorepo** with the following apps:
- `apps/web/` - Vue 3 frontend application (main development focus)
- `apps/server/` - AdonisJS API (planned, not yet implemented)
- `apps/supabase/` - Supabase configuration and migrations
- `apps/shared/` - Shared types and utilities

### Frontend Stack (apps/web/)
- **Vue 3** with Composition API and `<script setup>` syntax
- **Vite** as build tool and dev server
- **Vue Router** for client-side routing with lazy-loaded pages
- **Pinia** for state management
- **TypeScript** throughout
- **Tailwind CSS** + **ShadCN/UI** component library (using Radix Vue)
- **Supabase** for backend services (auth, database, storage)

### Development Environment
- **Vite dev server**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323
- **Supabase API**: http://localhost:54321
- Vue DevTools and Vite DevTools enabled in development

## Development Guidelines
- **English Only**: All code, comments, variable names, function names, and documentation must be in English
- **Prioritize Reusability**: Before writing a new function, always search the codebase to determine if a similar utility already exists. Reuse existing code whenever possible to avoid duplication.
- **No Legacy/Backward Compatibility**: Do not create legacy methods or backward compatibility layers - always refactor cleanly
- **Read the documentation**: Read the documentation in the `docs` folder for more information about the project or research last documentations on the web

## Architecture

### Architectural Principles (S.O.L.I.D.)

Our architecture is designed around the S.O.L.I.D. principles to ensure the codebase is scalable, maintainable, and robust.

- **(S) Single Responsibility Principle**: Each part of our architecture has one, and only one, reason to change.
  - **Services**: Manage API communication.
  - **Stores**: Manage a specific domain of global state (e.g., `authStore`).
  - **Composables**: Manage a single piece of reactive UI logic (e.g., `useFormValidation`).
  - **Components**: Represent a single piece of the UI.

- **(O) Open/Closed Principle**: Our architecture is open for extension, but closed for modification.
  - We use **Composables** and Vue **Slots** to extend component functionality without altering their source code, preventing breaking changes.

- **(L) Liskov Substitution Principle**: Subtypes must be substitutable for their base types.
  - Our components follow this by maintaining consistent APIs (`props` and `emits`). A specialized component (e.g., `<FancyButton>`) can replace a base component (e.g., `<BaseButton>`) as long as it respects the same contract.

- **(I) Interface Segregation Principle**: No code should be forced to depend on methods it does not use.
  - We create small, focused components with specific `props` rather than large, monolithic components with dozens of conditional props. This is enforced through clear TypeScript interfaces for props.

- **(D) Dependency Inversion Principle**: High-level modules depend on abstractions, not on low-level implementations.
  - This is central to our architecture: **Components** depend on **Stores/Composables** (abstractions), which in turn depend on **Services** (data access abstractions). The components have no knowledge of Supabase; they only know how to interact with the abstraction layers.
```
