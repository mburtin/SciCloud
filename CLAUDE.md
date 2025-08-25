## Project Overview

Scicloud is a open-source scientific laboratory management platform. It provides several features to simplify research life. It a self-hosted and modular solution using modern and secure technologies. Users can create or install community-based modules to extend the platform's functionality.

## Using Modular Prompts

To work effectively on specific areas of SciCloud, research the codebase and ask Claude to include relevant context files:

- **UI Components**: `Please read .docs/ui-components.md` - For SciCloud UI development
- **Backend Services**: `Please read .docs/services.md` - Overview of all service architecture
- **Database**: `Please read .docs/supabase.md` - Database architecture and security
- **Modules System**: `Please read .docs/modules-system.md` - (Coming soon)
- **Language Support**: `Please read .docs/language-support.md` - Internationalization system
- **Deploy System**: `Please read .docs/build-system.md` - (Coming soon)
- **E2E Testing**: `Please read .docs/testing.md` - Unit and E2E tests

## Architecture Overview

### Project Structure
This is a **pnpm workspace monorepo** with the following apps:
- `apps/web/` - Vue 3 frontend application (main development focus)
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

## Development Guidelines

### 🚨 CRITICAL RULES:
- **English Only**: All code, comments, variable names, function names, and documentation must be in English
- **Read the documentation**: Read the documentation in the `docs` folder for more information about the project or research last documentations on the web
- **Prioritize Reusability**: Before writing a new function, always search the codebase to determine if a similar utility already exists. Reuse existing code whenever possible to avoid duplication.
- **No Legacy/Backward Compatibility**: Do not create legacy methods or backward compatibility layers - always refactor cleanly
- **Follow S.O.L.I.D. principles**: Follow the S.O.L.I.D. principles to ensure the codebase is scalable, maintainable, and robust

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
