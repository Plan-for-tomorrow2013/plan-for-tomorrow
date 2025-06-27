# Supabase Migration & Authentication TODO

## Overview
This document outlines the steps needed to migrate from localStorage to Supabase for data persistence, authentication, and real-time features.

**📋 Related Documentation:**
- [Database Schema Documentation](./docs/database-schema.md) - Complete schema design and migration strategy
- [System Architecture](./docs/system-architecture.md) - Current and target architecture
- [Project Overview](./docs/PROJECT.md) - Project vision and roadmap

## Phase 1: Supabase Setup & Authentication (Critical First Step)

### 1. Set Up Supabase Project
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize project
supabase init

# Start local development
supabase start
```

### 2. Environment Configuration
**File: `.env.local`**
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Storage Configuration
STORAGE_TYPE=supabase
```

### 3. Install Supabase Dependencies
```bash
# Install Supabase client
npm install @supabase/supabase-js

# Install auth helpers for Next.js
npm install @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
```

### 4. Create Supabase Client
**File: `shared/lib/supabase.ts`**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Server-side client (for API routes)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

## Phase 2: Authentication Implementation

### 1. Create Auth Context
**File: `shared/contexts/auth-context.tsx`**
```typescript
import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@shared/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: any) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: metadata }
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### 2. Create Auth Components
**File: `shared/components/auth/SignInForm.tsx`**
```typescript
import { useState } from 'react'
import { useAuth } from '@shared/contexts/auth-context'

export function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await signIn(email, password)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
```

### 3. Create Protected Route Component
**File: `shared/components/auth/ProtectedRoute.tsx`**
```typescript
import { useAuth } from '@shared/contexts/auth-context'
import { SignInForm } from './SignInForm'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return fallback || <SignInForm />
  }

  return <>{children}</>
}
```

## Phase 3: Database Schema with Supabase

### 1. Create Supabase Schema
**File: `supabase/migrations/001_initial_schema.sql`**
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'professional', 'consultant');
CREATE TYPE job_status AS ENUM ('active', 'completed', 'archived');
CREATE TYPE quote_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Jobs table
CREATE TABLE jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status job_status DEFAULT 'active',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quote requests table
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

-- User profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  company TEXT,
  phone TEXT,
  role user_role DEFAULT 'professional',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences table
CREATE TABLE user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_key TEXT NOT NULL,
  preference_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, preference_key)
);

-- Documents table
CREATE TABLE documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jobs
CREATE POLICY "Users can view own jobs" ON jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs" ON jobs
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for quote_requests
CREATE POLICY "Users can view related quote requests" ON quote_requests
  FOR SELECT USING (
    auth.uid() = job_id IN (
      SELECT id FROM jobs WHERE user_id = auth.uid()
    ) OR auth.uid() = consultant_id
  );

CREATE POLICY "Users can insert quote requests" ON quote_requests
  FOR INSERT WITH CHECK (
    auth.uid() = job_id IN (
      SELECT id FROM jobs WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for documents
CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_quote_requests_job_id ON quote_requests(job_id);
CREATE INDEX idx_quote_requests_consultant_id ON quote_requests(consultant_id);
CREATE INDEX idx_documents_job_id ON documents(job_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_requests_updated_at BEFORE UPDATE ON quote_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Create Database Types
**File: `shared/types/database.ts`**
```typescript
export type UserRole = 'admin' | 'professional' | 'consultant'
export type JobStatus = 'active' | 'completed' | 'archived'
export type QuoteStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string
          title: string
          description: string | null
          status: JobStatus
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: JobStatus
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: JobStatus
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      quote_requests: {
        Row: {
          id: string
          job_id: string
          consultant_id: string
          status: QuoteStatus
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          consultant_id: string
          status?: QuoteStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          consultant_id?: string
          status?: QuoteStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          company: string | null
          phone: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          company?: string | null
          phone?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          company?: string | null
          phone?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          preference_key: string
          preference_value: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          preference_key: string
          preference_value?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          preference_key?: string
          preference_value?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          job_id: string
          user_id: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          user_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          user_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

## Future Documentation (Post-Migration)

These documentation items should be created after the core Supabase migration is complete and the application is stable.

### 1. API Documentation
**Priority: Medium**
- Create OpenAPI/Swagger documentation for all endpoints
- Document request/response schemas
- Include authentication requirements
- Add error codes and handling
- Create API testing documentation

### 2. Component Library Documentation
**Priority: Low**
- Document all shared UI components
- Create component storybook
- Include usage examples and props documentation
- Add accessibility guidelines
- Create design system documentation

### 3. Testing Strategy Documentation
**Priority: Medium**
- Document testing approach and coverage requirements
- Create testing guidelines for new features
- Document integration testing strategy
- Add performance testing guidelines
- Create testing environment setup

### 4. Deployment Documentation
**Priority: High (Post-Migration)**
- Document deployment process and environments
- Create CI/CD pipeline documentation
- Add environment-specific configurations
- Document backup and recovery procedures
- Create monitoring and alerting setup

### 5. Security Documentation
**Priority: High (Post-Migration)**
- Document security practices and policies
- Create security audit checklist
- Add data protection guidelines
- Document access control procedures
- Create incident response procedures

### 6. Performance Documentation
**Priority: Medium**
- Document performance benchmarks
- Create optimization guidelines
- Add caching strategies
- Document database query optimization
- Create load testing procedures

### 7. User Guide Documentation
**Priority: Low**
- Create end-user documentation
- Add video tutorials
- Create FAQ section
- Document troubleshooting guides
- Add feature walkthroughs

---

**Note:** Focus on completing the Supabase migration and core functionality first. These documentation items can be addressed incrementally as the application stabilizes and grows.