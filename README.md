# Urban Planning Professionals Portal

## 🏗️ Project Overview

A comprehensive digital workflow system for urban planning professionals that automates and streamlines development project lifecycles. The platform combines spatial data, compliance checking, document management, and real-time collaboration to create a fully automated, scalable service.

## 🚀 Current Status

### ✅ **Implemented Features**
- **Dual Portal Architecture**: Admin portal (port 3001) and Professional portal (port 3000)
- **Document Management**: Upload, store, and manage project documents
- **Job Management**: Create and manage urban planning projects
- **Consultant Integration**: Quote request system with visual indicators
- **Assessment Tools**: Pre-prepared assessments for various planning categories
- **Real-time Updates**: Live status tracking for consultant tickets
- **Shared Component Library**: Reusable UI components and utilities
- **TypeScript Support**: Full type safety across the application

### 🔄 **In Progress**
- **Authentication System**: Supabase-based user authentication
- **Database Migration**: Moving from localStorage to Supabase
- **State Management Optimization**: React Query + Zustand implementation

### �� **Planned Features**
- **Spatial Planning Intelligence**: GIS integration and zoning analysis
- **AI Assistant**: Document analysis and compliance recommendations
- **Real-time Collaboration**: Multi-user workflows and live editing
- **Mobile Application**: Cross-platform mobile support

## ��️ Architecture

### **Monorepo Structure**

urban-planning-professionals-portal/
├── admin/ # Admin portal (Next.js)
│ ├── src/app/ # Admin pages and API routes
│ ├── src/lib/ # Admin utilities and components
│ └── data/ # Admin data storage
├── urban-planning-portal/ # Professional portal (Next.js)
│ ├── src/app/ # Portal pages and API routes
│ ├── src/components/ # Portal-specific components
│ └── public/ # Static assets
├── shared/ # Shared components and utilities
│ ├── components/ # Reusable UI components
│ ├── contexts/ # React contexts
│ ├── hooks/ # Custom React hooks
│ ├── services/ # API services
│ ├── types/ # TypeScript type definitions
│ └── utils/ # Utility functions
├── docs/ # Project documentation
├── prisma/ # Database schema and migrations
└── TODO.md # Development roadmap

### **Technology Stack**
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **State Management**: React Query (@tanstack/react-query), Zustand
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **Development**: ESLint, Prettier, Husky, Jest

## ��️ Development Setup

### **Prerequisites**
- Node.js (v18 or higher)
- npm or yarn
- Git

### **Quick Start**

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd urban-planning-professionals-portal
   npm install
   ```

2. **Environment Setup**
   ```bash
   # Copy environment templates
   cp .env.example .env.local
   cp admin/.env.example admin/.env.local
   cp urban-planning-portal/.env.example urban-planning-portal/.env.local
   ```

3. **Supabase Setup** (Coming Soon)
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Initialize Supabase project
   supabase init
   supabase start
   ```

4. **Start Development Servers**
   ```bash
   # Start both applications
   npm run dev
   
   # Or start individually
   npm run dev:admin      # Admin portal (http://localhost:3001)
   npm run dev:portal     # Professional portal (http://localhost:3000)
   ```

## 🔧 Environment Configuration

### **Root Environment Variables**
```env
# Supabase Configuration (Coming Soon)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Storage Configuration
STORAGE_TYPE=supabase
```

### **Admin Portal Environment**
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=debug
```

### **Professional Portal Environment**
```env
# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001

# Feature Flags
NEXT_PUBLIC_ENABLE_DEBUG_TOOLS=true
NEXT_PUBLIC_ENABLE_MOCK_DATA=false

# External Services
NEXT_PUBLIC_ARCGIS_API_KEY=your_arcgis_key
```

## 📁 Key Directories

### **Shared Components** (`shared/`)
- **`components/ui/`**: Reusable UI components (buttons, forms, modals)
- **`contexts/`**: React contexts for state management
- **`hooks/`**: Custom React hooks
- **`services/`**: API service functions
- **`types/`**: TypeScript type definitions
- **`utils/`**: Utility functions and helpers

### **Admin Portal** (`admin/`)
- **`src/app/api/`**: Admin API routes
- **`src/app/admin/`**: Admin dashboard pages
- **`src/lib/`**: Admin-specific utilities
- **`data/`**: JSON data storage

### **Professional Portal** (`urban-planning-portal/`)
- **`src/app/professionals/`**: Professional user pages
- **`src/app/api/`**: Portal API routes
- **`public/documents/`**: Document templates and assets

## 🚀 Available Scripts

### **Development**
```bash
npm run dev              # Start both applications
npm run dev:admin        # Start admin portal only
npm run dev:portal       # Start professional portal only
```

### **Building**
```bash
npm run build            # Build both applications
npm run build:admin      # Build admin portal
npm run build:portal     # Build professional portal
```

### **Testing**
```bash
npm run test             # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

### **Code Quality**
```bash
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking
```

### **Database** (Coming Soon)
```bash
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
```

## 🔐 Authentication & Security

### **Current State**
- Basic session management with localStorage
- Role-based access control (Admin/Professional)
- File upload security

### **Planned Implementation** (Supabase)
- **User Authentication**: Email/password, social login
- **Row Level Security**: Database-level access control
- **JWT Tokens**: Secure session management
- **Multi-factor Authentication**: Enhanced security
- **Audit Logging**: Track user actions

## 📊 Data Management

### **Current Storage**
- **File System**: Document storage in local directories
- **JSON Files**: Configuration and metadata storage
- **localStorage**: User preferences and session data

### **Planned Migration** (Supabase)
- **PostgreSQL Database**: Structured data storage
- **Supabase Storage**: File and document storage
- **Real-time Subscriptions**: Live data updates
- **Backup & Recovery**: Automated data protection

## �� Core Features

### **Job Management**
- Create and manage urban planning projects
- Track project status and progress
- Document organization and version control
- Client collaboration tools

### **Consultant Integration**
- Quote request system with visual indicators
- Consultant ticket management
- Document sharing and review
- Status tracking and notifications

### **Assessment Tools**
- Pre-prepared assessment templates
- Dynamic report generation
- Compliance checking
- Export and sharing capabilities

### **Document Management**
- File upload and storage
- Version control and history
- Category-based organization
- Search and filtering

## 🔄 Development Workflow

### **Code Organization**
1. **Shared Components**: Place reusable code in `shared/`
2. **Portal-Specific**: Keep portal-specific code in respective directories
3. **Type Safety**: Use TypeScript interfaces from `shared/types/`
4. **API Routes**: Follow RESTful conventions

### **State Management**
- **Server State**: React Query for API data
- **Client State**: Zustand for UI state
- **Form State**: React Hook Form for forms
- **Global State**: React Context for shared state

### **Testing Strategy**
- **Unit Tests**: Jest for utility functions
- **Component Tests**: React Testing Library
- **Integration Tests**: API route testing
- **E2E Tests**: Playwright (planned)

## 🚧 Troubleshooting

### **Common Issues**

1. **Port Conflicts**
   ```bash
   # Check if ports are in use
   lsof -i :3000
   lsof -i :3001
   
   # Kill processes if needed
   kill -9 <PID>
   ```

2. **File Permission Issues**
   ```bash
   # Ensure upload directories exist
   mkdir -p admin/uploads
   mkdir -p urban-planning-portal/public/documents
   ```

3. **TypeScript Errors**
   ```bash
   # Regenerate shared types
   npm run type-check
   ```

4. **Database Issues** (Coming Soon)
   ```bash
   # Reset Supabase local development
   supabase stop
   supabase start
   ```

### **Development Tips**
- Use `npm run dev` to start both applications simultaneously
- Check browser console and terminal for error messages
- Use React DevTools for component debugging
- Monitor network requests in browser DevTools

## 📚 Documentation

- **`docs/PROJECT.md`**: Project vision and roadmap
- **`docs/system-architecture.md`**: Technical architecture
- **`TODO.md`**: Development roadmap and tasks
- **`shared/README.md`**: Shared components documentation

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow the coding standards
4. **Test your changes**: Run tests and verify functionality
5. **Commit your changes**: Use conventional commit messages
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**: Provide clear description and screenshots

### **Coding Standards**
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For technical support or questions:
- Check the documentation in the `docs/` directory
- Review the `TODO.md` for current development status
- Open an issue for bugs or feature requests
- Contact the development team for urgent matters

---

**Last Updated**: December 2024  
**Version**: 0.1.0  
**Status**: Active Development