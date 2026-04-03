# Developer Handoff Document - Harding Homes Management System

## 🎯 Purpose
This document provides everything a new developer needs to understand, maintain, and extend the Harding Homes Management System.

---

## 📋 Quick Start for Developers

### 1. Access the Codebase
The complete source code is in your GitHub repository:
- **All code files**: Every component, page, service, and configuration
- **Database migrations**: Complete schema history in `supabase/migrations/`
- **Documentation**: Setup guides, API docs, and user manuals in `docs/`

### 2. Local Development Setup

```bash
# Clone the repository
git clone <your-github-repo-url>
cd harding-homes

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev

# Open http://localhost:3000
```

### 3. Required Accounts
- **Supabase Account**: For database and authentication
  - Project URL: https://bmemzrjbvzcrgngqufae.supabase.co
  - Access database console, auth settings, storage
- **Vercel Account**: For production deployment
  - One-click deploy from GitHub
  - Automatic CI/CD pipeline

---

## 🗄️ Database Understanding

### Schema Overview
The system uses **24 PostgreSQL tables** managed by Supabase:

#### Core Business Tables
- `profiles` - User authentication and profiles
- `customers` - Customer records
- `leads` - Sales enquiries
- `jobs` - Main job records (linked to leads, customers, quotes, invoices)
- `quotes` - Job quotations
- `invoices` - Job invoices

#### Operations
- `team_members` - Team user profiles
- `job_assignments` - Who's working on what
- `schedule` - Job scheduling
- `tasks` - Task management
- `inventory` - Stock management
- `vehicles` - Fleet tracking
- `purchase_orders` - PO management
- `suppliers` - Supplier information

#### Media & Communication
- `photos` - Job photos with GPS metadata
- `documents` - File attachments
- `notifications` - In-app notifications
- `email_templates` - Customizable email templates

#### Access Control
- `user_roles` - Role-based permissions
- `customer_portal_access` - Customer portal permissions

#### Configuration
- `company_settings` - Company-wide settings

### Database Migrations
All schema changes are tracked in `supabase/migrations/`:
- Automatically generated with timestamps
- Applied via Supabase Management API
- Full migration history preserved
- Can be rolled back via reverse SQL

### Row Level Security (RLS)
Every table has RLS policies:
- **Owner/Office Manager**: Full access
- **Site Manager**: Job and team access
- **Builder**: Assigned job access only
- **Customer**: Own data only

**Key Policy Pattern**:
```sql
-- Example: Jobs table SELECT policy for Site Managers
CREATE POLICY "site_managers_select_jobs" ON jobs
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'site_manager'
  );
```

---

## 🏗️ Code Architecture

### File Organization
```
src/
├── pages/              # Next.js routes (Page Router)
│   ├── index.tsx       # Dashboard (/)
│   ├── jobs.tsx        # Jobs list (/jobs)
│   ├── jobs/[id].tsx   # Job detail (/jobs/:id)
│   ├── api/            # API endpoints
│   └── ...
├── components/         # React components
│   ├── ui/            # shadcn/ui base components
│   ├── dashboard/     # Dashboard-specific widgets
│   ├── DashboardLayout.tsx
│   └── ...
├── services/          # Business logic (API calls)
│   ├── authService.ts
│   ├── roleService.ts
│   └── ...
├── integrations/      # External services
│   └── supabase/
│       ├── client.ts           # Supabase client instance
│       ├── types.ts            # Database types export
│       └── database.types.ts   # Auto-generated types (DO NOT EDIT)
├── hooks/             # Custom React hooks
├── contexts/          # React context providers
├── lib/               # Utility functions
└── types/             # TypeScript type definitions
```

### Key Design Patterns

#### 1. **Service Layer Pattern**
All Supabase interactions go through service files:

```typescript
// services/jobService.ts
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export async function getJobById(id: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select(`
      *,
      customer:customers(*),
      quotes(*),
      photos(*)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
```

#### 2. **Type-Safe Database Queries**
Always use generated types:

```typescript
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Table row type
type Job = Tables<"jobs">;

// Insert type (excludes auto-generated fields)
type NewJob = TablesInsert<"jobs">;

// Update type (all fields optional)
type JobUpdate = TablesUpdate<"jobs">;
```

#### 3. **Component Composition**
Page components use layout + feature components:

```typescript
// pages/jobs.tsx
export default function JobsPage() {
  return (
    <DashboardLayout>
      <Header title="Jobs" />
      <JobFilters />
      <JobPipeline />
      <JobsTable />
    </DashboardLayout>
  );
}
```

#### 4. **Custom Hooks for Data Fetching**
```typescript
// hooks/useJobs.ts
export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });
    setJobs(data || []);
    setLoading(false);
  }

  return { jobs, loading, refresh: loadJobs };
}
```

---

## 🔐 Authentication Flow

### Staff Login
1. User visits `/staff-login`
2. Enters email + password
3. `authService.signIn()` calls Supabase Auth
4. Success → Redirect to dashboard
5. `roleService.getUserRole()` determines permissions
6. Role-based UI rendering

### Customer Portal Login
1. Customer visits `/portal/login`
2. Separate authentication flow
3. Limited access to customer-specific data
4. Only sees their own jobs, quotes, invoices

### Role Hierarchy
```
Owner (highest privileges)
  ├── Office Manager (administrative)
  ├── Site Manager (job management)
  └── Builder (execution)
Customer (portal access only)
```

### Protected Routes
Use `PermissionGate` component:
```typescript
<PermissionGate allowedRoles={["owner", "office_manager"]}>
  <AdminSettings />
</PermissionGate>
```

---

## 🛠️ Common Development Tasks

### Adding a New Page
1. Create file in `src/pages/` (e.g., `my-page.tsx`)
2. Export default component
3. Add to navigation in `src/components/Navigation.tsx`
4. Add permission check if needed

### Adding a New Database Table
```sql
-- Create migration via Supabase SQL editor or execute_sql_query
CREATE TABLE my_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "users_select_own" ON my_table
  FOR SELECT USING (auth.uid() = user_id);
```

After migration:
- Types auto-regenerate in `database.types.ts`
- Import and use: `import type { Tables } from "@/integrations/supabase/types"`

### Adding a New API Route
```typescript
// pages/api/my-endpoint.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Your logic here
  res.status(200).json({ success: true });
}
```

### Creating a New Service
```typescript
// services/myService.ts
import { supabase } from "@/integrations/supabase/client";

export async function myFunction() {
  const { data, error } = await supabase
    .from("my_table")
    .select("*");

  if (error) throw error;
  return data;
}
```

---

## 🐛 Debugging Guide

### Check Errors
1. Open browser DevTools (F12)
2. Check Console tab for JavaScript errors
3. Check Network tab for failed API calls
4. Check Supabase logs in dashboard

### Common Issues

#### Database Query Fails
```typescript
// ❌ Bad: Ignores errors
const { data } = await supabase.from("jobs").select("*");

// ✅ Good: Handles errors
const { data, error } = await supabase.from("jobs").select("*");
if (error) {
  console.error("Query failed:", error);
  throw error;
}
```

#### RLS Blocking Data
- Check if user is authenticated: `supabase.auth.getSession()`
- Verify RLS policies in Supabase dashboard
- Test with service role key (bypasses RLS) to confirm data exists

#### Type Errors
- Run `npm run build` to check TypeScript errors
- Regenerate types if schema changed (auto-happens after migrations)
- Check import paths use `@/` alias

---

## 🚀 Deployment Process

### Development → Production
1. **Test Locally**
   ```bash
   npm run build
   npm run start
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```

3. **Vercel Auto-Deploy**
   - Vercel watches GitHub repo
   - Automatically builds and deploys on push
   - Preview deployments for pull requests
   - Production deployment on main branch

### Environment Variables (Vercel)
Set in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (secret)
- `NEXT_PUBLIC_SITE_URL`

---

## 📊 Monitoring & Analytics

### Performance Monitoring
- Vercel Analytics (built-in)
- Next.js speed insights
- Database query performance in Supabase

### Error Tracking
- Check Vercel function logs
- Supabase database logs
- Browser console errors

### User Analytics (Planned)
- Google Analytics integration
- User behavior tracking
- Feature usage metrics

---

## 🔄 Updating Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update package-name

# Update all (careful!)
npm update

# After updates, test thoroughly
npm run build
npm run dev
```

### Critical Dependencies
- Next.js: Follow upgrade guides carefully
- Supabase: Check breaking changes
- React: Major version changes need review

---

## 🧪 Testing Strategy

### Current State
- Manual testing via UI
- TypeScript compile-time checks
- ESLint code quality checks

### Recommended Additions
```bash
# Unit tests (Jest)
npm install --save-dev jest @testing-library/react

# E2E tests (Cypress)
npm install --save-dev cypress

# API testing (Postman/Insomnia)
```

---

## 📚 Learning Resources

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [Page Router Guide](https://nextjs.org/docs/pages)

### Supabase
- [Supabase Docs](https://supabase.com/docs)
- [JavaScript Client](https://supabase.com/docs/reference/javascript)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### Tailwind CSS
- [Tailwind Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

## 🆘 Getting Help

### When Stuck
1. Check browser console for errors
2. Check Supabase logs
3. Review this documentation
4. Check GitHub issues
5. Consult Next.js/Supabase docs

### Code Comments
Most complex logic has inline comments explaining the "why", not just the "what".

---

## 📝 Code Style Guide

### Naming Conventions
- **Components**: PascalCase (`MyComponent.tsx`)
- **Functions**: camelCase (`getUserData()`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Files**: kebab-case for pages (`my-page.tsx`)

### TypeScript
- Prefer interfaces over types for object shapes
- Use explicit return types for public functions
- Avoid `any` type - use `unknown` if truly unknown

### React
- Functional components only
- Use hooks (no class components)
- Extract reusable logic into custom hooks
- Keep components focused (single responsibility)

### Imports
```typescript
// Group imports logically
import { useState, useEffect } from "react";       // React
import { supabase } from "@/integrations/supabase/client";  // External
import { Button } from "@/components/ui/button";   // Internal UI
import { getUserRole } from "@/services/roleService";  // Services
import type { Job } from "@/types";                // Types
```

---

## 🎯 Development Workflow

### Feature Development
1. Create feature branch: `git checkout -b feature/my-feature`
2. Develop and test locally
3. Commit with clear messages
4. Push and create pull request
5. Review and merge to main
6. Vercel auto-deploys

### Bug Fixes
1. Create branch: `git checkout -b fix/bug-name`
2. Reproduce bug locally
3. Fix and verify
4. Test related features
5. Commit and merge

### Database Changes
1. Write migration SQL
2. Test in Supabase SQL editor
3. Apply via API or dashboard
4. Verify types auto-regenerate
5. Update code to use new schema
6. Test thoroughly

---

## ✅ Pre-Deployment Checklist

Before deploying major changes:
- [ ] TypeScript compiles: `npm run build`
- [ ] ESLint passes: `npm run lint`
- [ ] All features tested manually
- [ ] Database migrations applied
- [ ] Environment variables updated
- [ ] No console errors in production mode
- [ ] Mobile responsive
- [ ] Authentication works
- [ ] RLS policies correct

---

## 🔮 Future Technical Debt

Areas for improvement:
1. Add comprehensive test suite
2. Implement error boundary components
3. Add loading states everywhere
4. Optimize image loading (lazy load)
5. Add request caching layer
6. Implement optimistic UI updates
7. Add webhook handling
8. Improve offline support

---

**Document Version**: 1.0  
**Last Updated**: April 3, 2026  
**Maintained By**: Development Team

For questions about this codebase, refer to the inline code comments and this documentation first.