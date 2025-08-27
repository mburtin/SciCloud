# SciCloud - General Architecture Documentation

## Overview

SciCloud is a scientific laboratory management platform built with modern web technologies. It provides comprehensive project management, animal tracking, instrument management, and user collaboration features for research facilities.

## Technology Stack

### Frontend (Vue 3)
- **Vue 3** with Composition API and `<script setup>` syntax
- **Vite** as build tool and development server
- **Vue Router** for client-side routing with lazy-loaded pages
- **Pinia** for state management
- **TypeScript** throughout the application
- **Tailwind CSS v4** + **ShadCN/UI** component library (Radix Vue)
- **Vue Sonner** for toast notifications
- **TipTap** for rich text editing (notes system)
- **Vue i18n** for internationalization (French/English)
- **VeeValidate** for form validation
- **@tanstack/vue-table** for data tables
- **date-fns** for date manipulation

### Backend Services
- **Supabase** as the primary backend service providing:
  - PostgreSQL database with Row Level Security (RLS)
  - Authentication and user management
  - Real-time subscriptions
  - File storage
  - Edge Functions for server-side operations

### Package Management
- **pnpm** as the package manager with workspace configuration
- **Monorepo structure** with multiple applications

## Project Structure

```
SciCloud/
├── apps/
│   ├── web/                    # Vue 3 frontend application
│   ├── server/                 # AdonisJS API (planned, not implemented)
│   ├── supabase/              # Supabase configuration
│   └── shared/                # Shared types and utilities
├── tests/
│   ├── e2e/                   # End-to-end tests (Playwright)
│   └── web/                   # Unit tests (Vitest)
├── docs/                      # Documentation
└── docker/                    # Docker configuration
```

### Frontend Architecture (`apps/web/`)

```
src/
├── components/
│   ├── ui/                   # ShadCN/UI base components
│   ├── shared/               # Reusable business components
│   ├── scheduler/            # Calendar/scheduler components
│   ├── editor/               # Rich text editor components
│   ├── notes/                # Notes management components
│   ├── notifications/        # Notification system components
│   ├── admin/                # Admin-specific components
│   ├── labs/                 # Laboratory management components
│   └── projects/             # Project management components
├── pages/                    # Route-level components
│   ├── dashboard/
│   ├── projects/
│   ├── labs/
│   ├── profile/
│   ├── admin/
│   ├── notes/                # Notes page
│   └── calendar/             # Calendar page
├── stores/                    # Pinia state management
├── services/                  # API communication layer
├── composables/               # Vue composables for reusable logic
├── router/                    # Vue Router configuration
├── types/                     # TypeScript type definitions
├── i18n/                      # Internationalization files
└── lib/                       # Third-party library configurations
```

## Data Flow Architecture

```
UI Components
      ↓
   Stores (Pinia)
      ↓
   Services
      ↓
  Supabase Client
      ↓
PostgreSQL Database
```

### State Management Pattern
1. **Components** call store actions
2. **Stores** coordinate with services and manage reactive state
3. **Services** handle API communication and data transformation
4. **Supabase** manages database operations and real-time updates

## Database Architecture

### Tables Overview
- `user_profiles`: Extended user information beyond auth
- `projects`: Research project management
- `project_members`: Project team associations
- `user_favorite_projects`: User project favorites
- `animals`: Laboratory animal tracking
- `instruments`: Equipment management
- `consumables`: Inventory management
- `user_notifications`: System notifications
- `user_notification_settings`: User notification preferences
- `notes`: Personal and project-linked notes
- `user_calendar`: Personal calendar events and scheduling

### Security Model
- **Row Level Security (RLS)** enabled on all tables
- **Role-based permissions** (admin/user)
- **Secure functions** for admin operations
- **Edge functions** for secure server-side operations
