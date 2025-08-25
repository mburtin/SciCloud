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

## Core Features & Modules

### 1. Project Management
- Project creation, editing, and deletion
- Team member management with role-based permissions
- Document storage and management
- Task management and progress tracking
- Project favorites and categorization

### 2. Laboratory Management
- **Animal Management**: Complete animal tracking with health records
- **Instrument Management**: Equipment tracking and maintenance scheduling
- **Consumables Management**: Inventory tracking with stock level monitoring

### 3. User Management
- User profiles with role-based access control
- Admin panel for user administration
- Profile customization and preferences

### 4. Notification System
- Real-time notifications via Supabase subscriptions
- Configurable notification preferences
- Bell component with notification count

### 5. Dashboard & Analytics
- Overview statistics and metrics
- Recent activity tracking
- Quick access to key features
