# Database Schema Documentation

## Overview

This document outlines the database schema for the Urban Planning Professionals Portal, including both the current Prisma schema and the planned Supabase migration schema.

## Current Schema (Prisma)

The current application uses a Prisma schema with PostgreSQL, but it's limited to assessment management functionality.

### Current Models

```prisma
// Current Prisma Schema (prisma/schema.prisma)

model User {
  id          String       @id @default(cuid())
  email       String       @unique
  name        String?
  password    String
  role        UserRole     @default(USER)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  assessments Assessment[]
}

model AssessmentType {
  id          String       @id @default(cuid())
  value       String       @unique
  label       String
  description String?
  file        String?
  documentId  String?
  version     Int?
  isCustom    Boolean      @default(false)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  assessments Assessment[]
}

model Category {
  id          String       @id @default(cuid())
  name        String
  description String?
  icon        String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  assessments Assessment[]
}

model Assessment {
  id            String           @id @default(cuid())
  title         String
  description   String?
  status        AssessmentStatus @default(DRAFT)
  typeId        String
  categoryId    String
  userId        String
  dueDate       DateTime?
  completedDate DateTime?
  score         Int?
  feedback      String?
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  category      Category         @relation(fields: [categoryId], references: [id])
  type          AssessmentType   @relation(fields: [typeId], references: [id])
  user          User             @relation(fields: [userId], references: [id])
}

model Announcement {
  id        String   @id @default(uuid())
  title     String
  content   String
  author    String
  date      DateTime @default(now())
}

enum UserRole {
  USER
  ADMIN
}

enum AssessmentStatus {
  DRAFT
  IN_PROGRESS
  COMPLETED
  REVIEWED
}
```

### Current Schema Limitations

1. **Limited Scope**: Only covers assessment management
2. **Missing Core Features**: No job management, consultant management, or document storage
3. **No Authentication Integration**: Basic user model without proper auth
4. **No File Storage**: No document management capabilities
5. **No Real-time Features**: No support for real-time updates

## Planned Supabase Schema

The planned migration to Supabase will provide a comprehensive schema that supports all current and future features.

### Core Tables

#### 1. Jobs Table
```sql
CREATE TABLE jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  address TEXT,
  council TEXT,
  current_stage TEXT,
  status job_status DEFAULT 'active',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_data JSONB,
  site_details JSONB,
  manual_submission JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. Quote Requests Table
```sql
CREATE TABLE quote_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status quote_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, consultant_id)
);
```

#### 3. User Profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  company TEXT,
  phone TEXT,
  role user_role DEFAULT 'professional',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. Documents Table
```sql
CREATE TABLE documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  category TEXT,
  original_name TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. User Preferences Table
```sql
CREATE TABLE user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_key TEXT NOT NULL,
  preference_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, preference_key)
);
```

#### 6. Assessments Table (Enhanced)
```sql
CREATE TABLE assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  status assessment_status DEFAULT 'draft',
  title TEXT,
  description TEXT,
  content JSONB,
  score INTEGER,
  feedback TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 7. Purchased Assessments Table
```sql
CREATE TABLE purchased_assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 8. Consultant Categories Table
```sql
CREATE TABLE consultant_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 9. Consultant Profiles Table
```sql
CREATE TABLE consultant_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  category_id UUID REFERENCES consultant_categories(id),
  company_name TEXT,
  phone TEXT,
  website TEXT,
  description TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 10. Work Tickets Table
```sql
CREATE TABLE work_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status ticket_status DEFAULT 'pending',
  documents JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Custom Types

```sql
-- User roles
CREATE TYPE user_role AS ENUM ('admin', 'professional', 'consultant');

-- Job statuses
CREATE TYPE job_status AS ENUM ('active', 'completed', 'archived');

-- Quote request statuses
CREATE TYPE quote_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Assessment statuses
CREATE TYPE assessment_status AS ENUM ('draft', 'in_progress', 'completed', 'reviewed');

-- Ticket statuses
CREATE TYPE ticket_status AS ENUM ('pending', 'in_progress', 'completed', 'returned');
```

### Row Level Security (RLS) Policies

```sql
-- Jobs policies
CREATE POLICY "Users can view own jobs" ON jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs" ON jobs
  FOR DELETE USING (auth.uid() = user_id);

-- Quote requests policies
CREATE POLICY "Users can view related quote requests" ON quote_requests
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM jobs WHERE id = job_id
    ) OR auth.uid() = consultant_id
  );

-- Documents policies
CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own documents" ON documents
  FOR ALL USING (auth.uid() = user_id);

-- Assessments policies
CREATE POLICY "Users can view own assessments" ON assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own assessments" ON assessments
  FOR ALL USING (auth.uid() = user_id);
```

### Indexes for Performance

```sql
-- Jobs indexes
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_council ON jobs(council);

-- Quote requests indexes
CREATE INDEX idx_quote_requests_job_id ON quote_requests(job_id);
CREATE INDEX idx_quote_requests_consultant_id ON quote_requests(consultant_id);
CREATE INDEX idx_quote_requests_status ON quote_requests(status);

-- Documents indexes
CREATE INDEX idx_documents_job_id ON documents(job_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_category ON documents(category);

-- Assessments indexes
CREATE INDEX idx_assessments_job_id ON assessments(job_id);
CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_type ON assessments(type);

-- Work tickets indexes
CREATE INDEX idx_work_tickets_job_id ON work_tickets(job_id);
CREATE INDEX idx_work_tickets_consultant_id ON work_tickets(consultant_id);
CREATE INDEX idx_work_tickets_status ON work_tickets(status);
```

## Data Migration Strategy

### Phase 1: Schema Setup
1. Create Supabase project
2. Set up authentication
3. Create all tables and types
4. Set up RLS policies
5. Create indexes

### Phase 2: Data Migration
1. Migrate user data from Prisma to Supabase Auth
2. Migrate assessment data
3. Migrate job data (from localStorage)
4. Migrate document metadata
5. Migrate user preferences

### Phase 3: Application Updates
1. Update API endpoints to use Supabase
2. Update frontend to use Supabase client
3. Update authentication flow
4. Update file storage to use Supabase Storage

### Phase 4: Testing & Validation
1. Test all CRUD operations
2. Validate RLS policies
3. Test authentication flows
4. Performance testing
5. Data integrity validation

## TypeScript Types

The schema will be accompanied by comprehensive TypeScript types:

```typescript
// Database types (generated from Supabase)
export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string
          title: string
          description: string | null
          address: string | null
          council: string | null
          current_stage: string | null
          status: JobStatus
          user_id: string
          property_data: any | null
          site_details: any | null
          manual_submission: any | null
          created_at: string
          updated_at: string
        }
        Insert: { /* ... */ }
        Update: { /* ... */ }
      }
      // ... other tables
    }
  }
}

// Application types
export interface Job {
  id: string
  title: string
  description?: string
  address: string
  council: string
  currentStage: string
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: string
  updatedAt?: string
  propertyData?: PropertyData
  siteDetails?: SiteDetails
  consultants?: Record<ConsultantCategory, Consultant[]>
  documents?: Record<string, Document>
  assessments?: Record<string, Assessment>
}

export interface Consultant {
  id: string
  name: string
  category: ConsultantCategory
  company?: string
  phone?: string
  email?: string
  isVerified: boolean
}

export interface Document {
  id: string
  fileName: string
  originalName: string
  type: string
  size: number
  uploadedAt: string
  category?: string
}
```

## Benefits of New Schema

1. **Comprehensive Coverage**: Supports all current and planned features
2. **Built-in Authentication**: Leverages Supabase Auth
3. **Real-time Capabilities**: Built-in real-time subscriptions
4. **File Storage**: Integrated Supabase Storage
5. **Security**: Row Level Security policies
6. **Scalability**: Optimized for growth
7. **Type Safety**: Full TypeScript support
8. **Performance**: Proper indexing and optimization

## Migration Timeline

- **Week 1-2**: Schema setup and Supabase configuration
- **Week 3-4**: Data migration and testing
- **Week 5-6**: Application updates and integration
- **Week 7-8**: Testing, validation, and deployment

This schema provides a solid foundation for the current application while supporting future growth and feature expansion. 