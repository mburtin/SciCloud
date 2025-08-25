# SciCloud - Services Architecture Documentation

## Overview

SciCloud uses a service-oriented architecture where each service handles a specific domain of business logic and data operations. All services follow the S.O.L.I.D. principles and provide a clean abstraction layer between the UI components and the Supabase backend.

## Service Architecture Pattern

### Design Principles
- **Single Responsibility**: Each service manages one specific domain
- **TypeScript First**: Strong typing for all interfaces and operations
- **Error Handling**: Consistent error management across all services
- **Authentication**: Automatic user context validation where needed
- **Singleton Pattern**: Services exported as singleton instances

### Service Structure
```typescript
export class ServiceName {
  // CRUD Operations
  async getItems(): Promise<Item[]>
  async getItemById(id: string): Promise<Item | null>
  async createItem(data: ItemInsert): Promise<Item>
  async updateItem(id: string, updates: ItemUpdate): Promise<Item>
  async deleteItem(id: string): Promise<void>

  // Domain-specific methods
  async specializedOperation(): Promise<Result>
}

export const serviceName = new ServiceName()
```

## Core Services

### 1. Authentication Service (`auth.service.ts`)

**Purpose**: Handles user authentication and session management

**Key Interfaces**:
- `LoginCredentials`: Email/password login data
- `RegisterCredentials`: User registration data
- `AuthResult<T>`: Standardized response wrapper

**Main Operations**:
- `getCurrentSession()`: Retrieve current user session
- `getCurrentUser()`: Get server-validated user data
- `signInWithPassword()`: Email/password authentication
- `signUp()`: User registration
- `signOut()`: Session termination
- `resetPassword()`: Password reset functionality

**Security Features**:
- JWT token validation
- Session persistence
- Secure password reset flow

---

### 2. User Management Service (`user.service.ts`)

**Purpose**: Manages user profiles and administrative operations

**Key Interfaces**:
- `User`: Combined auth and profile data
- `ProfileUpdate`: Profile modification data
- `UserRole`: Admin/user role management

**Main Operations**:
- `fetchUser(userId)`: Get user profile by ID
- `fetchAllUsers()`: Admin-only user listing
- `createUser(userData)`: Secure user creation via Edge Functions
- `deleteUser(userId)`: Secure user deletion via Edge Functions
- `updateProfile(userId, data)`: Profile updates
- `updatePassword()`: Self-service password changes
- `updateEmail()`: Email address changes
- `searchUserID(query)`: User search functionality

**Security Model**:
- Row Level Security (RLS) enforcement
- Admin-only operations via Edge Functions
- Password verification for sensitive changes
- Role-based access control

---

### 3. Projects Service (`projects.service.ts`)

**Purpose**: Research project management and collaboration

**Key Interfaces**:
- `Project`: Complete project data
- `ProjectInsert`/`ProjectUpdate`: CRUD operation data
- `ProjectMemberRole`: Team member permissions

**Main Operations**:
- `getProjects()`: List all projects with favorite status
- `getProjectById(id)`: Single project retrieval
- `createProject(data)`: New project creation
- `updateProject(id, updates)`: Project modifications
- `deleteProject(id)`: Project removal
- `toggleFavorite(id)`: User favorite management
- `addProjectMember()`: Team collaboration
- `removeProjectMember()`: Member management
- `updateProjectMemberRole()`: Permission management

**Features**:
- Favorite projects per user
- Team member management
- Progress tracking
- Category and priority management
- Budget tracking

---

### 4. Laboratory Management Services

#### Animals Service (`animals.service.ts`)

**Purpose**: Laboratory animal tracking and health management

**Key Interfaces**:
- `Animal`: Complete animal record
- `AnimalDocument`: File attachments
- `Measurement`: Health measurements
- `MedicalRecord`: Veterinary records

**Main Operations**:
- `getAnimals()`: Animal inventory listing
- `getAnimalById(id)`: Single animal retrieval
- `createAnimal(data)`: New animal registration
- `updateAnimal(id, updates)`: Record updates
- `deleteAnimal(id)`: Animal removal
- `updateAnimalStatus()`: Status management (alive/deceased/transferred)
- `updateAnimalHealthStatus()`: Health status tracking
- `addMeasurement()`: Health measurement logging
- `addDocument()`: File attachment management
- `searchAnimals(query)`: Animal search functionality

**Specialized Features**:
- Health status monitoring
- Weight and measurement tracking
- Veterinary record management
- Protocol compliance tracking
- Housing management
- Document attachments

#### Instruments Service (`instruments.service.ts`)

**Purpose**: Laboratory equipment management and maintenance

**Key Interfaces**:
- `Instrument`: Equipment record
- `InstrumentStatus`: Availability states
- `InstrumentInsert`/`InstrumentUpdate`: CRUD data

**Main Operations**:
- `getInstruments()`: Equipment inventory
- `getInstrumentById(id)`: Single instrument retrieval
- `createInstrument(data)`: Equipment registration
- `updateInstrument(id, updates)`: Record updates
- `deleteInstrument(id)`: Equipment removal
- `updateInstrumentStatus()`: Status management
- `updateMaintenanceDue()`: Maintenance scheduling
- `getInstrumentsByStatus()`: Status filtering
- `getInstrumentsRequiringMaintenance()`: Maintenance alerts
- `searchInstruments(query)`: Equipment search

**Features**:
- Status tracking (available/in-use/maintenance/broken)
- Maintenance scheduling
- Serial number management
- Location tracking
- Category-based organization

#### Consumables Service (`consumables.service.ts`)

**Purpose**: Laboratory inventory and stock management

**Key Interfaces**:
- `Consumable`: Inventory item
- `ConsumableInsert`/`ConsumableUpdate`: CRUD data

**Main Operations**:
- `getConsumables()`: Inventory listing
- `getConsumableById(id)`: Single item retrieval
- `getConsumableByReference()`: Reference-based lookup
- `createConsumable(data)`: New item registration
- `updateConsumable(id, updates)`: Record updates
- `deleteConsumable(id)`: Item removal
- `updateStock()`: Stock level management

**Features**:
- Stock level monitoring
- Reference number tracking
- Supplier management
- Category organization
- Low stock alerts

---

### 5. Calendar Service (`calendar.service.ts`)

**Purpose**: Personal calendar and event scheduling

**Key Interfaces**:
- `SchedulerEvent`: Calendar event data
- `CalendarEventInsert`/`CalendarEventUpdate`: CRUD data
- `EventCategory`: Event categorization
- `CalendarQueryOptions`: Filtering options

**Main Operations**:
- `getEvents(options)`: Event retrieval with filtering
- `getEventsByDate(date)`: Day-specific events
- `getEventsByWeek(start, end)`: Week view data
- `getEvent(id)`: Single event retrieval
- `createEvent(data)`: Event creation
- `updateEvent(id, updates)`: Event modifications
- `deleteEvent(id)`: Event removal
- `getEventsByCategory()`: Category filtering
- `getUpcomingEvents()`: Future events
- `searchEvents(query)`: Event search

**Features**:
- Multi-view support (day/week)
- Event categorization (maintenance/experiment/training/meeting/custom)
- All-day event support
- Location and attendee management
- Color coding
- Time slot management

---

### 6. Notes Service (`notes.service.ts`)

**Purpose**: Personal and project-linked note management

**Key Interfaces**:
- `Note`: Complete note data
- `NoteInsert`/`NoteUpdate`: CRUD data

**Main Operations**:
- `getNotes()`: User's note collection
- `getNoteById(id)`: Single note retrieval
- `getProjectNotes(projectId)`: Project-specific notes
- `createNote(data)`: Note creation
- `updateNote(id, updates)`: Note modifications
- `deleteNote(id)`: Note removal
- `searchNotes(query)`: Full-text search
- `getNotesByTags(tags)`: Tag-based filtering

**Features**:
- Rich text content (TipTap integration)
- Tag-based organization
- Project association
- Full-text search
- Personal note management

---

### 7. Notifications Service (`notifications.service.ts`)

**Purpose**: Real-time notification system

**Key Interfaces**:
- `Notification`: Notification data
- `NotificationSettings`: User preferences
- `NotificationInsert`/`NotificationUpdate`: CRUD data
- `RealtimeNotificationPayload`: Real-time updates

**Main Operations**:
- `getNotifications()`: User notification listing
- `getNotification(id)`: Single notification retrieval
- `createNotification(data)`: Notification creation
- `markAsRead(id)`: Read status management
- `markAllAsRead()`: Bulk read operations
- `deleteNotification(id)`: Notification removal
- `getSettings()`: User preferences
- `updateSettings()`: Preference management
- `subscribeToNotifications()`: Real-time subscriptions
- `getUnreadCount()`: Unread notification count

**Features**:
- Real-time notifications via Supabase subscriptions
- Configurable notification types
- Quiet hours management
- Email and push notification preferences
- Priority levels
- Type-based categorization

---

### 8. Dashboard Service (`dashboard.service.ts`)

**Purpose**: Dashboard statistics and overview data

**Key Interfaces**:
- `StatCard`: Dashboard statistics
- `RecentProject`: Recent activity data
- `Deadline`: Upcoming deadlines

**Main Operations**:
- `getStatCards()`: Dashboard statistics computation
- `getRecentProjects()`: Recent project activity
- `getUpcomingDeadlines()`: Deadline management

**Features**:
- Client-side statistics computation
- Project activity tracking
- Team activity metrics
- Progress monitoring

---

### 9. Documents Service (`documents.service.ts`)

**Purpose**: File storage and document management

**Key Interfaces**:
- `Document`: File metadata
- Upload/download options

**Main Operations**:
- `uploadDocument()`: File upload to Supabase Storage
- `listDocuments()`: Document listing
- `deleteDocument()`: File removal
- `downloadDocument()`: File download
- `viewDocument()`: File preview

**Features**:
- Supabase Storage integration
- File type detection
- Size formatting
- Secure file handling
- Project/owner association

## Service Integration Patterns

### Store Integration
Services are consumed by Pinia stores, which manage reactive state:

```typescript
// In store
const { data } = await projectsService.getProjects()
projects.value = data
```

### Error Handling
All services follow consistent error handling:

```typescript
try {
  const result = await service.operation()
  return result
} catch (error) {
  throw new Error(`Operation failed: ${error.message}`)
}
```

### Authentication Context
Services automatically handle user authentication where required:

```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) throw new Error('User not authenticated')
```

## Security Considerations

### Row Level Security (RLS)
- All database operations respect RLS policies
- User-scoped data automatically filtered
- Admin operations properly secured

### Edge Functions
- Sensitive operations (user creation/deletion) use Edge Functions
- Server-side validation for critical operations
- Secure role management

### Data Validation
- TypeScript interfaces enforce data structure
- Input validation at service level
- Consistent error responses
