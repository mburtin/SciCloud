# SciCloud - Supabase Database Architecture

## Overview

SciCloud uses Supabase (PostgreSQL) as its primary database with a comprehensive security model based on Row Level Security (RLS) and secure functions. The database follows PostgreSQL best practices with emphasis on data isolation, security, and performance.

## Database Structure

### Core Tables

#### 1. Authentication & User Management
- **`auth.users`** (Supabase managed): Core authentication data
- **`public.user_profiles`**: Extended user information and roles
- **`public.user_view`**: Combined view of auth and profile data

#### 2. Project Management
- **`public.projects`**: Research projects with status, budget, and metadata
- **`public.project_members`**: Many-to-many relationship for project teams
- **`public.user_favorite_projects`**: User favorite project tracking

#### 3. Laboratory Management
- **`public.animals`**: Animal tracking with health records and protocols
- **`public.instruments`**: Equipment management with maintenance tracking
- **`public.consumables`**: Inventory management with stock levels

#### 4. Content & Communication
- **`public.notes`**: Personal and project-linked notes with tags
- **`public.user_calendar`**: Personal calendar events with categorization
- **`public.notifications`**: System notifications with type categorization
- **`public.notification_settings`**: User notification preferences

#### 5. Storage
- **`storage.objects`**: File storage for project documents
- **`storage.buckets`**: Storage bucket configuration

## Security Architecture

### Row Level Security (RLS)

**All tables have RLS enabled** with policies controlling data access:

#### Common RLS Patterns

##### 1. User-Scoped Data
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own data" ON table_name
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
```

##### 2. Public Read with Owner Modification
```sql
-- Anyone can read, only creator/admin can modify
CREATE POLICY "Public read access" ON table_name
  FOR SELECT USING (TRUE);

CREATE POLICY "Creator can modify" ON table_name
  FOR UPDATE USING (created_by = (SELECT auth.uid()));
```

##### 3. Role-Based Access
```sql
-- Admin or creator access
CREATE POLICY "Admin or creator access" ON table_name
  FOR ALL USING (
    created_by = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );
```

### Secure Functions (SECURITY DEFINER)

Critical operations use `SECURITY DEFINER` functions to bypass RLS safely:

#### Admin Functions
- `public.admin_update_user_role(uuid, text)`: Role management
- `public.admin_delete_user(uuid)`: User deletion
- `public.get_all_user_profiles()`: Admin user listing

#### Utility Functions
- `public.get_user_profile(uuid)`: Secure profile access
- `public.is_admin_user(uuid)`: Admin role checking
- `public.users_exist()`: Bootstrap checking

### Function Security Best Practices

#### 1. Always Use `SET search_path = ''`
```sql
CREATE OR REPLACE FUNCTION function_name()
RETURNS return_type
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- CRITICAL: Prevents search_path attacks
AS $$
BEGIN
  -- Function body
END;
$$;
```

#### 2. Input Validation
```sql
-- Always validate role inputs
IF new_role NOT IN ('admin', 'user') THEN
  RAISE EXCEPTION 'Invalid role: must be admin or user';
END IF;
```

#### 3. Permission Checks
```sql
-- Verify admin permissions before sensitive operations
IF NOT public.is_admin_user(auth.uid()) THEN
  RAISE EXCEPTION 'Unauthorized: Only admins can perform this action';
END IF;
```

## Database Schema Conventions

### Naming Conventions

#### Tables
- **Lowercase with underscores**: `user_profiles`, `project_members`
- **Plural nouns**: `animals`, `instruments`, `notifications`
- **Junction tables**: `user_favorite_projects`

#### Columns
- **Lowercase with underscores**: `first_name`, `created_at`
- **Boolean fields**: `is_active`, `maintenance_due`
- **Foreign keys**: `user_id`, `project_id`

#### Constraints
- **Primary keys**: Always `id UUID DEFAULT gen_random_uuid()`
- **Foreign keys**: `REFERENCES table_name(id) ON DELETE CASCADE/RESTRICT`
- **Check constraints**: Meaningful names like `check_project_date_order`

### Standard Column Patterns

#### Audit Fields
Every table should include:
```sql
created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
updated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
version INTEGER DEFAULT 1 NOT NULL
```

#### UUID Primary Keys
```sql
id UUID DEFAULT gen_random_uuid() PRIMARY KEY
```

#### Timestamps
```sql
-- Use TIMESTAMPTZ for timezone awareness
created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
```

### Indexing Strategy

#### Performance Indexes
```sql
-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_table_user_id ON table_name(user_id);

-- Query optimization indexes
CREATE INDEX IF NOT EXISTS idx_table_created_at ON table_name(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_table_user_date ON table_name(user_id, created_at);
```

#### Specialized Indexes
```sql
-- GIN indexes for arrays and JSONB
CREATE INDEX IF NOT EXISTS idx_table_tags ON table_name USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_table_metadata ON table_name USING GIN(metadata);
```

## Common Development Patterns

### Triggers for Auto-Updates

#### Updated_at Triggers
```sql
-- Standard trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Apply to table
CREATE TRIGGER update_table_updated_at
    BEFORE UPDATE ON table_name
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Data Validation

#### Check Constraints
```sql
-- Enum-like constraints
status TEXT CHECK (status IN ('active', 'completed', 'paused')),

-- Range constraints
progress INTEGER CHECK (progress >= 0 AND progress <= 100),

-- Date logic constraints
CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date)
```

#### Complex Validation
```sql
-- Multi-column validation
CHECK (all_day = TRUE OR (start_time < end_time)),

-- Format validation
CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$')
```

## Security Best Practices

### 1. RLS Policy Design

#### Avoid Recursive Policies
```sql
-- ❌ BAD: Can cause infinite recursion
CREATE POLICY "Members can view" ON project_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.user_id = auth.uid()  -- Self-reference!
    )
  );

-- ✅ GOOD: Use external table references
CREATE POLICY "Non-recursive members view" ON project_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_members.project_id
      AND p.created_by = auth.uid()
    )
  );
```

#### Principle of Least Privilege
```sql
-- Only grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON table_name TO authenticated;
-- Don't grant DELETE unless specifically needed
```

### 2. Function Security

#### Input Sanitization
```sql
-- Always validate UUIDs
IF target_user_id IS NULL THEN
  RAISE EXCEPTION 'User ID cannot be null';
END IF;

-- Validate enum values
IF status NOT IN ('active', 'inactive', 'pending') THEN
  RAISE EXCEPTION 'Invalid status value: %', status;
END IF;
```

#### Error Handling
```sql
BEGIN
  -- Main logic here
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and re-raise with context
    RAISE EXCEPTION 'Operation failed: %', SQLERRM;
END;
```

### 3. Storage Security

#### Bucket Policies
```sql
-- File access control
CREATE POLICY "Allow authenticated users" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'project-documents' AND
    auth.role() = 'authenticated'
  );
```

## Common Errors & Solutions

### 1. RLS Policy Conflicts

**Error**: `insufficient_privilege` or infinite recursion

**Cause**: Policies referencing the same table they're applied to

**Solution**: Use external table references or SECURITY DEFINER functions
```sql
-- Instead of self-referencing policies, use admin functions
CREATE OR REPLACE FUNCTION public.user_can_access_project(project_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = $1 AND user_id = auth.uid()
  );
END;
$$;
```

### 2. Search Path Vulnerabilities

**Error**: Potential privilege escalation

**Cause**: Missing `SET search_path = ''` in SECURITY DEFINER functions

**Solution**: Always set empty search path
```sql
-- ❌ VULNERABLE
CREATE FUNCTION dangerous_function()
SECURITY DEFINER
AS $$
BEGIN
  -- Could be exploited via search_path manipulation
END;
$$;

-- ✅ SECURE
CREATE FUNCTION secure_function()
SECURITY DEFINER
SET search_path = ''  -- Always include this!
AS $$
BEGIN
  -- Safe from search_path attacks
END;
$$;
```

### 3. Migration Ordering Issues

**Error**: Table/function dependencies not found

**Cause**: Incorrect migration execution order

**Solution**: Use proper dependency management
```sql
-- Check if function exists before dropping
DROP FUNCTION IF EXISTS function_name();

-- Use IF NOT EXISTS for tables
CREATE TABLE IF NOT EXISTS table_name (...);

-- Handle missing columns gracefully
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'new_column'
  ) THEN
    ALTER TABLE projects ADD COLUMN new_column TEXT;
  END IF;
END $$;
```

### 4. UUID vs String Comparisons

**Error**: Type mismatch in UUID comparisons

**Cause**: Comparing UUID with text literals

**Solution**: Proper type casting
```sql
-- ❌ BAD
WHERE user_id = 'string-uuid'

-- ✅ GOOD
WHERE user_id = 'string-uuid'::UUID
-- OR
WHERE user_id = auth.uid()  -- Already UUID type
```

### 5. Timezone Handling

**Error**: Inconsistent date handling across timezones

**Cause**: Using TIMESTAMP instead of TIMESTAMPTZ

**Solution**: Always use timezone-aware types
```sql
-- ❌ BAD
created_at TIMESTAMP DEFAULT NOW()

-- ✅ GOOD
created_at TIMESTAMPTZ DEFAULT NOW()
-- OR for UTC consistency
created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
```

## Performance Optimization

### Query Optimization

#### Index Usage
```sql
-- Ensure indexes exist for frequent queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_table_frequent_query
ON table_name(column1, column2);

-- Monitor index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

#### Avoid N+1 Queries
```sql
-- Use JOINs instead of multiple queries
SELECT p.*, pm.role
FROM projects p
LEFT JOIN project_members pm ON p.id = pm.project_id
WHERE pm.user_id = auth.uid();
```

### Connection Management

#### Function Optimization
```sql
-- Use STABLE/IMMUTABLE when appropriate
CREATE FUNCTION read_only_function()
RETURNS TABLE(...)
STABLE  -- Function doesn't modify data
SET search_path = ''
AS $$...$$;
```

## Backup & Recovery

### Migration Strategy
- **Sequential naming**: `YYYYMMDDHHMMSS_description.sql`
- **Atomic operations**: Each migration should be self-contained
- **Rollback capability**: Include reverse operations when possible

### Data Integrity
- **Foreign key constraints**: Ensure referential integrity
- **Check constraints**: Validate business rules at database level
- **Unique constraints**: Prevent duplicate data

## Future Considerations

### Scalability Planning
- **Partitioning**: Consider table partitioning for large datasets
- **Read Replicas**: Plan for read-only replicas for reporting
- **Connection Pooling**: Implement connection pooling for high traffic

### Monitoring
- **Query Performance**: Monitor slow queries and optimize
- **RLS Policy Impact**: Track policy evaluation performance
- **Storage Growth**: Monitor storage usage and cleanup strategies

### Security Enhancements
- **Audit Logging**: Implement comprehensive audit trails
- **Encryption**: Consider column-level encryption for sensitive data
- **Access Patterns**: Regular review of access patterns and permissions
