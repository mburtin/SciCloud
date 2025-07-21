# Open-source Scientific SaaS Project

_This document serves as a reference for any LLM working on this project._

## Overview

**Project Name**: Open-source and self-hosting scientific SaaS for laboratory management.

**Objective**:  
Create a modular platform for the scientific community to manage consumables, equipment, experiments, projects, and ensure traceability.
The project includes file management (images, documents, etc.) and Git integration for version control of scripts and protocols. 
Users can easily add community-developed features as modules.

**Important Constraints**:

- The project must be developed entirely in English (code, documentation, user interface)
- Use **pnpm** as the package manager
- Self-hosted by default with Docker

## Technology Stack

### Frontend Framework

- **Vue 3**: Reactive UI framework with Composition API
- **Vite**: Fast build tool and development server
- **Vue Router**: Client-side routing
- **Pinia**: State management

### Backend Framework

- **AdonisJS 6**: Will look later if it's necessary

### Database & Backend Services

- **Supabase** (self-hosted):
  - **PostgreSQL**: Relational database
  - **Auth**: User authentication and authorization
  - **Storage**: File storage for images, documents, etc.

### UI & Design System

- **ShadCN/UI**: High-quality accessible components
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Vue**: Beautiful icon library
- **VueUse**: Collection of essential Vue composition utilities

### Additional Services

- **Redis**: Additional caching and session storage
- **Gitea**: Lightweight Git server for code versioning (Docker container)

### Development & Deployment
- **TypeScript**: Type safety throughout the application
- **Vite**: Fast build tool and development server
- **pnpm**: Fast, disk space efficient package manager
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Docker & Docker Compose**: Container orchestration
- **Vitest**: Unit testing framework
- **Playwright**: E2E testing

## Project structure

scicloud/
├── apps/
│ ├── web/                  # Vue 3 + Vite application
│ ├── server/               # AdonisJS API
│ ├── supabase/             # Supabase configuration
│ └── shared/               # Shared types and utilities
├── docker/                 # Docker configurations
├── docs/                   # Documentation
├── tests/                  # E2E tests
├── docker-compose.yml      # Service orchestration
├── pnpm-workspace.yaml     # PNPM workspace configuration
└── package.json            # Root package.json
└── .npmrc                  # Root .npmrc
