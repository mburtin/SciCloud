# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Prerequisites
- **pnpm** as package manager (pnpm@10.13.1)
- **Supabase CLI** for local database

### Starting Development
```bash
# Start both Supabase and web dev server concurrently
pnpm dev

# Or start individually:
pnpm supabase:start    # Start local Supabase instance
pnpm web:dev          # Start Vue.js dev server on port 3000
```

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

### Key Frontend Architecture Patterns

#### Authentication & Routing
- Authentication handled by Pinia store (`stores/auth.store.ts`)
- Route-level authentication guards in router
- Login redirects and session validation on each route change
- Supabase client configured with PKCE flow for enhanced security

#### Component Organization
- **UI Components**: `src/components/ui/` - ShadCN/UI components (Button, Dialog, etc.)
- **Shared Components**: `src/components/shared/` - Reusable business components
- **Lab Components**: `src/components/labs/` - Laboratory-specific components
- **Layout System**: `src/layouts/` with Header and Sidebar components

#### Service Layer
Services in `src/services/` handle API calls and business logic:
- `api.ts` - Base API configuration
- `auth.service.ts`, `user.service.ts` - Authentication and user management
- `dashboard.service.ts`, `projects.service.ts` - Feature-specific services
- `lab.service.ts` - Laboratory management functionality

#### State Management
- **Pinia stores** in `src/stores/`
- Primary store: `auth.store.ts` for authentication state
- Mock data in `src/mocks/` for development

### Database & Backend
- **Supabase** self-hosted setup (localhost:54321 for API, localhost:54323 for Studio)
- PostgreSQL database with migrations in `apps/supabase/migrations/`
- Row Level Security (RLS) enabled
- Type-safe database access with generated TypeScript types

### Development Environment
- **Vite dev server**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323
- **Supabase API**: http://localhost:54321
- Vue DevTools and Vite DevTools enabled in development

## Key Configuration Files

### TypeScript Configuration
- Root: `tsconfig.json` and `tsconfig.base.json`
- Web app: `apps/web/tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`

### Linting
- ESLint config in `eslint.config.js` (flat config format)
- TypeScript and JavaScript rules configured
- Vue files excluded from root ESLint (handled by web app config)

### Supabase
- Configuration: `apps/supabase/config.toml`
- Local development URLs and ports pre-configured
- Auth settings: signup enabled, email confirmations disabled for dev

## Architecture Responsibilities

### Clear Separation of Concerns

#### **Services Layer** - Pure API Communication
**Responsibility**: Handle HTTP requests and data transformation only
  - Make API calls to backend/Supabase
  - Transform raw responses to typed objects
  - Handle HTTP errors
  - NO business logic, state, or UI concerns
  - Think "data access layer"
```

#### **Pinia Stores** - Global State + Business Logic
**Responsibility**: Application-wide state and business rules
  - Global reactive state accessible from multiple components
  - Business logic and validation rules
  - Coordinate between services
  - DevTools integration for debugging
  - Server-side rendering compatibility
  - Think "application state manager"
```

#### **Composables** - Vue-Specific Logic
**Responsibility**: Component-level reactive logic and local state
  - Local reactive state for UI (search, filters, forms)
  - Reusable stateful logic between components
  - Vue lifecycle and reactivity management
  - Multiple instances possible (non-singleton)
  - Think "reusable reactive functions"
```

### Architecture Flow
```
Component → Composable → Store → Service → Supabase
    ↑         ↑         ↑        ↑
   UI      Vue Logic  Business  API
  State     + Local   Logic +   Calls
           Reactive   Global
            State     State
```

## Development Guidelines

### Core Development Principles
- **English Only**: All code, comments, variable names, function names, and documentation must be in English
- **No Legacy/Backward Compatibility**: Do not create legacy methods or backward compatibility layers - always refactor cleanly
- **Major Changes Protocol**: For significant architectural changes, always warn the user and provide a detailed implementation plan before proceeding

### Component Development
- Use Vue 3 Composition API with `<script setup lang="ts">`
- Follow existing patterns in `src/components/ui/` for new UI components
- Leverage ShadCN/UI components and Tailwind utilities
- Use proper TypeScript typing with interfaces from `src/types/`

### Service Integration
- Use Supabase client from `src/lib/supabase.ts`
- Follow existing service patterns for API calls
- Handle authentication state through Pinia auth store
- Mock data available in `src/mocks/` for development

### Routing
- Add new routes in `src/router/modules/` following existing patterns
- Use lazy loading for page components
- Set appropriate `requiresAuth` meta for protected routes
- Follow nested route structure for complex features

### Testing
- Test commands available but framework not specified in current setup
- Run `pnpm web:test` for testing (command exists but implementation TBD)

## Important Notes
- Project must be developed entirely in English
- Use pnpm exclusively as package manager
- Self-hosted deployment focus with Docker support planned
- Laboratory management domain with focus on consumables, equipment, experiments, and projects