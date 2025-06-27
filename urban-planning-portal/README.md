# Urban Planning Professionals Portal - Frontend

## ��️ Portal Overview

The Professional Portal is the main user-facing application for urban planning professionals. It provides a comprehensive suite of tools for managing development projects, collaborating with consultants, and generating compliance assessments.

## �� Current Features

### ✅ **Implemented**
- **Job Management**: Create, view, and manage urban planning projects
- **Document Store**: Upload, organize, and manage project documents
- **Consultant Integration**: Request quotes and track consultant progress
- **Assessment Tools**: Pre-prepared assessments for various planning categories
- **Real-time Status**: Live tracking of consultant tickets and document status
- **Responsive Design**: Mobile-friendly interface with modern UI
- **Type Safety**: Full TypeScript integration with shared types

### 🔄 **In Progress**
- **Authentication**: Supabase-based user authentication
- **State Management**: React Query + Zustand optimization
- **Database Integration**: Migration from localStorage to Supabase

### 🎯 **Planned**
- **Spatial Planning**: GIS integration and zoning analysis
- **AI Assistant**: Document analysis and compliance recommendations
- **Real-time Collaboration**: Multi-user editing and commenting
- **Mobile App**: Progressive Web App (PWA) features

## 📁 Project Structure

urban-planning-portal/
├── src/
│ ├── app/ # Next.js 14 App Router
│ │ ├── api/ # API routes
│ │ ├── professionals/ # Main portal pages
│ │ │ ├── dashboard/ # User dashboard
│ │ │ ├── jobs/ # Job management
│ │ │ ├── consultants/ # Consultant integration
│ │ │ ├── knowledge-base/ # Assessment tools
│ │ │ └── layout.tsx # Portal layout
│ │ ├── globals.css # Global styles
│ │ ├── layout.tsx # Root layout
│ │ └── page.tsx # Landing page
│ ├── components/ # Portal-specific components
│ │ ├── ui/ # Basic UI components
│ │ └── features/ # Feature-specific components
│ ├── hooks/ # Custom React hooks
│ ├── lib/ # Utilities and configurations
│ └── types/ # TypeScript types (using shared)
├── public/ # Static assets
│ ├── documents/ # Document templates
│ ├── images/ # Static images
│ └── pre-prepared/ # Assessment files
├── data/ # Local data storage
│ └── jobs/ # Job data files
└── package.json # Dependencies and scripts


## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Query + Zustand
- **UI Components**: Shared component library
- **Authentication**: Supabase Auth (planned)
- **Database**: Supabase (planned)
- **Real-time**: Supabase Realtime (planned)

## 🚀 Quick Start

### **Prerequisites**
- Node.js (v18 or higher)
- npm or yarn
- Access to the shared component library

### **Installation**

1. **Install Dependencies**
   ```bash
   cd urban-planning-portal
   npm install
   ```

2. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Update with your values
   nano .env.local
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Configuration

### **Required Environment Variables**

```env
# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001

# Feature Flags
NEXT_PUBLIC_ENABLE_DEBUG_TOOLS=true
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
NEXT_PUBLIC_SHOW_DEVELOPMENT_BANNER=true

# External Services (Optional)
NEXT_PUBLIC_ARCGIS_API_KEY=your_arcgis_key
NEXT_PUBLIC_MAPS_API_KEY=your_maps_key

# Supabase Configuration (Coming Soon)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Development Variables**

```env
# Development Features
NEXT_PUBLIC_ENABLE_DEBUG_TOOLS=true
NEXT_PUBLIC_SHOW_GRID_OVERLAY=false
NEXT_PUBLIC_ENABLE_MAP_DEBUG=false
NEXT_PUBLIC_SHOW_DEVELOPMENT_BANNER=true

# Performance
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=false
```

## �� Core Features

### **Dashboard**
- Project overview and statistics
- Recent activity feed
- Quick access to common actions
- Status indicators for ongoing work

### **Job Management**
- Create new urban planning projects
- View and edit project details
- Track project status and progress
- Organize project documents

### **Document Store**
- Upload and manage project documents
- Category-based organization
- Version control and history
- Search and filtering capabilities
- Download and sharing options

### **Consultant Integration**
- Browse consultant categories
- Request quotes from consultants
- Track quote request status
- Visual indicators for requested quotes
- Document sharing with consultants

### **Assessment Tools**
- Pre-prepared assessment templates
- Dynamic form generation
- Report creation and export
- Compliance checking tools

### **Knowledge Base**
- Development application guides
- Complying development resources
- NatHERS & BASIX assessments
- Waste management tools
- Traffic and stormwater assessments

## 🔗 Shared Components Integration

The portal leverages the shared component library for consistency and maintainability:

### **UI Components**
```typescript
import { Button } from '@shared/components/ui/button'
import { Card } from '@shared/components/ui/card'
import { Input } from '@shared/components/ui/input'
```

### **Contexts**
```typescript
import { useJobs } from '@shared/hooks/useJobs'
import { useConsultants } from '@shared/contexts/consultant-context'
import { useSiteDetails } from '@shared/contexts/site-details-context'
```

### **Types**
```typescript
import { Job } from '@shared/types/jobs'
import { Document } from '@shared/types/documents'
import { Consultant } from '@shared/types/consultants'
```

### **Services**
```typescript
import { jobService } from '@shared/services/jobService'
import { consultantService } from '@shared/services/consultantService'
import { documentService } from '@shared/services/documentService'
```

## 🎨 UI/UX Features

### **Design System**
- **Colors**: Consistent color palette with semantic meaning
- **Typography**: Hierarchical text system
- **Spacing**: Systematic spacing scale
- **Components**: Reusable UI components
- **Icons**: Consistent iconography

### **Responsive Design**
- Mobile-first approach
- Tablet and desktop optimizations
- Touch-friendly interactions
- Adaptive layouts

### **Accessibility**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## �� State Management

### **Current Implementation**
- **React Query**: Server state management
- **React Context**: Shared state across components
- **useState/useReducer**: Local component state
- **localStorage**: User preferences (temporary)

### **Planned Optimization**
- **Zustand**: Global client state management
- **Supabase**: Server state and real-time updates
- **React Query**: Enhanced caching and synchronization

## 🧪 Testing

### **Test Structure**

src/
├── tests/
│ ├── components/ # Component tests
│ ├── hooks/ # Hook tests
│ ├── pages/ # Page tests
│ └── utils/ # Utility tests


### **Running Tests**
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=Button.test.tsx
```

### **Testing Guidelines**
- Use React Testing Library for component tests
- Test user interactions, not implementation details
- Maintain high test coverage for critical features
- Mock external dependencies appropriately

## �� Development Scripts

### **Development**
```bash
npm run dev              # Start development server
npm run dev:debug        # Start with debug logging
```

### **Building**
```bash
npm run build            # Build for production
npm run build:analyze    # Analyze bundle size
```

### **Code Quality**
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run format           # Format with Prettier
npm run type-check       # TypeScript type checking
```

### **Testing**
```bash
npm run test             # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

## 🔧 Development Guidelines

### **Code Organization**
1. **Components**: Place in appropriate feature directories
2. **Hooks**: Create custom hooks for reusable logic
3. **Types**: Use shared types from `@shared/types`
4. **Services**: Keep API calls in service files
5. **Utils**: Place utility functions in `lib/` directory

### **Best Practices**
- Use TypeScript for all new code
- Follow the established component patterns
- Leverage shared components when possible
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

### **Performance**
- Use React.memo for expensive components
- Implement proper loading states
- Optimize bundle size with code splitting
- Use React Query for efficient data fetching
- Monitor Core Web Vitals

## 🚧 Troubleshooting

### **Common Issues**

1. **Port Already in Use**
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Shared Components Not Found**
   ```bash
   # Rebuild shared components
   cd ../shared
   npm run build
   
   # Restart development server
   npm run dev
   ```

3. **TypeScript Errors**
   ```bash
   # Check types
   npm run type-check
   
   # Regenerate types if needed
   npm run build
   ```

4. **Environment Variables**
   ```bash
   # Verify .env.local exists
   ls -la .env.local
   
   # Check variable names (must start with NEXT_PUBLIC_)
   cat .env.local
   ```

### **Development Tips**
- Use React DevTools for component debugging
- Monitor network requests in browser DevTools
- Check console for error messages
- Use the debug tools when enabled
- Test on different screen sizes

## 📚 Related Documentation

- **[Main Project README](../README.md)**: Overall project overview
- **[Shared Components](../shared/README.md)**: Shared library documentation
- **[System Architecture](../docs/system-architecture.md)**: Technical architecture
- **[Project Vision](../docs/PROJECT.md)**: Project goals and roadmap
- **[TODO.md](../TODO.md)**: Development roadmap and tasks

## 🤝 Contributing

1. Follow the established coding standards
2. Use shared components when possible
3. Write tests for new features
4. Update documentation as needed
5. Test on multiple devices and browsers

## 📄 License

This project is proprietary software. All rights reserved.

---

**Last Updated**: December 2024  
**Version**: 0.1.0  
**Status**: Active Development