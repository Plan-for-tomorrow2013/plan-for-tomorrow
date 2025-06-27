# Urban Planning Admin Portal

## 🏢 Admin Portal Overview

The Admin Portal is the administrative interface for managing the Urban Planning Professionals Portal. It provides comprehensive tools for managing consultants, reviewing work tickets, handling assessments, and overseeing the entire platform operations.

## �� Current Features

### ✅ **Implemented**
- **Work Ticket Management**: Review and process consultant work tickets
- **Consultant Management**: Manage consultant profiles and categories
- **Assessment Review**: Review and approve pre-prepared assessments
- **Document Management**: Handle document uploads and downloads
- **Knowledge Base Management**: Manage assessment templates and content
- **Announcement System**: Create and manage platform announcements
- **Real-time Updates**: Live status tracking and notifications

### 🔄 **In Progress**
- **Authentication System**: Admin user authentication and authorization
- **Database Integration**: Migration to Supabase for data persistence
- **Advanced Analytics**: Dashboard analytics and reporting

### 🎯 **Planned**
- **User Management**: Admin user roles and permissions
- **Audit Logging**: Comprehensive activity tracking
- **Advanced Reporting**: Detailed analytics and insights
- **Bulk Operations**: Mass processing capabilities

## 📁 Project Structure

admin/
├── src/
│ ├── app/ # Next.js 14 App Router
│ │ ├── api/ # API routes
│ │ │ ├── admin/ # Admin-specific APIs
│ │ │ ├── announcements/ # Announcement management
│ │ │ ├── consultants/ # Consultant management
│ │ │ ├── consultant-tickets/ # Ticket processing
│ │ │ ├── documents/ # Document handling
│ │ │ ├── jobs/ # Job management
│ │ │ ├── kb-/ # Knowledge base APIs
│ │ │ ├── pre-prepared-/ # Assessment management
│ │ │ └── work-tickets/ # Work ticket processing
│ │ ├── admin/ # Admin dashboard pages
│ │ │ ├── announcements/ # Announcement management
│ │ │ ├── consultants/ # Consultant management
│ │ │ ├── consultants-tickets/ # Ticket review
│ │ │ ├── kb-/ # Knowledge base management
│ │ │ ├── pre-prepared-/ # Assessment management
│ │ │ └── work-tickets/ # Work ticket management
│ │ ├── globals.css # Global styles
│ │ ├── layout.tsx # Root layout
│ │ └── page.tsx # Landing page
│ ├── components/ # Admin-specific components
│ ├── lib/ # Utilities and configurations
│ └── tests/ # Test files
├── data/ # Local data storage
├── jobs/ # Job data files
├── public/ # Static assets
└── package.json # Dependencies and scripts


## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **Database**: Prisma ORM (PostgreSQL planned)
- **Rich Text**: TipTap editor
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint + Prettier

## 🚀 Quick Start

### **Prerequisites**
- Node.js (v18 or higher)
- npm or yarn
- Access to the shared component library

### **Installation**

1. **Install Dependencies**
   ```bash
   cd admin
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
   Navigate to [http://localhost:3001](http://localhost:3001)

## 🔧 Environment Configuration

### **Required Environment Variables**

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

# Database (Coming Soon)
DATABASE_URL=your_database_url

# Authentication (Coming Soon)
JWT_SECRET=your_jwt_secret
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Logging
LOG_LEVEL=debug
```

### **Development Variables**

```env
# Development Features
DEBUG_MODE=true
DEBUG_LEVEL=debug
ENABLE_API_LOGS=true
LOG_SQL_QUERIES=true
SHOW_DETAILED_ERRORS=true

# Rate Limiting (Development)
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_WINDOW_MS=900000
```

## 🎛️ Core Features

### **Dashboard**
- Overview of system status
- Recent activity feed
- Quick access to common actions
- System statistics and metrics

### **Work Ticket Management**
- Review submitted work tickets
- Process consultant requests
- Track ticket status and progress
- Handle document uploads and downloads
- Manage ticket assignments

### **Consultant Management**
- Manage consultant profiles
- Handle consultant categories
- Review consultant submissions
- Track consultant performance
- Manage consultant access

### **Assessment Management**
- Review pre-prepared assessments
- Manage assessment templates
- Handle assessment submissions
- Track assessment status
- Generate assessment reports

### **Knowledge Base Management**
- Manage assessment templates
- Update content and sections
- Handle file uploads
- Organize knowledge base structure
- Track content versions

### **Document Management**
- Handle document uploads
- Manage file storage
- Process document downloads
- Track document versions
- Organize document categories

### **Announcement System**
- Create platform announcements
- Manage announcement visibility
- Track announcement engagement
- Schedule announcements
- Archive old announcements

## �� API Endpoints

### **Work Tickets**
- `GET /api/work-tickets` - List all work tickets
- `POST /api/work-tickets/upload` - Upload work ticket document
- `POST /api/work-tickets/return` - Return work ticket to professional

### **Consultants**
- `GET /api/consultants` - List all consultants
- `POST /api/consultants` - Create new consultant
- `PUT /api/consultants/:id` - Update consultant
- `DELETE /api/consultants/:id` - Delete consultant

### **Assessments**
- `GET /api/pre-prepared-assessments` - List assessments
- `POST /api/pre-prepared-assessments` - Create assessment
- `PUT /api/pre-prepared-assessments/:id` - Update assessment
- `DELETE /api/pre-prepared-assessments/:id` - Delete assessment

### **Knowledge Base**
- `GET /api/kb-*-assessments` - List knowledge base assessments
- `POST /api/kb-*-assessments` - Create knowledge base assessment
- `GET /api/kb-*-sections` - List knowledge base sections
- `POST /api/kb-*-sections` - Create knowledge base section

### **Documents**
- `GET /api/documents` - List documents
- `POST /api/documents/upload` - Upload document
- `GET /api/download-document` - Download document

### **Announcements**
- `GET /api/announcements` - List announcements
- `POST /api/announcements` - Create announcement
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement

## �� UI Components

### **Custom Components**
- **WorkTicketManager**: Comprehensive work ticket management
- **ConsultantManager**: Consultant profile management
- **AssessmentManager**: Assessment review and management
- **DocumentUploader**: File upload with progress tracking
- **RichTextEditor**: TipTap-based content editor
- **DataTable**: Sortable and filterable data tables

### **Radix UI Integration**
- **Dialog**: Modal dialogs for confirmations
- **Tabs**: Tabbed interfaces for organization
- **Select**: Dropdown selections
- **Toast**: Notification system
- **Progress**: Progress indicators
- **Navigation**: Navigation menus

## 🧪 Testing

### **Test Structure**

src/
├── tests/
│ ├── components/ # Component tests
│ ├── pages/ # Page tests
│ ├── api/ # API route tests
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
npm test -- --testPathPattern=WorkTicketManager.test.tsx
```

### **Testing Guidelines**
- Test user interactions and workflows
- Mock external dependencies
- Test error handling scenarios
- Maintain high test coverage for critical features
- Use React Testing Library best practices

## �� Development Scripts

### **Development**
```bash
npm run dev              # Start development server
npm run dev:debug        # Start with debug logging
```

### **Building**
```bash
npm run build            # Build for production
npm run start            # Start production server
```

### **Code Quality**
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
```

### **Database** (Coming Soon)
```bash
npm run db:push          # Push schema changes
npm run db:studio        # Open Prisma Studio
```

### **Testing**
```bash
npm run test             # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

## 🔧 Development Guidelines

### **Code Organization**
1. **API Routes**: Place in `src/app/api/` with clear naming
2. **Pages**: Organize by feature in `src/app/admin/`
3. **Components**: Create reusable components in `src/components/`
4. **Utilities**: Place helper functions in `src/lib/`
5. **Types**: Use TypeScript interfaces for all data structures

### **Best Practices**
- Use TypeScript for all new code
- Follow Next.js 14 App Router conventions
- Implement proper error handling
- Use appropriate HTTP status codes
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

### **Security Considerations**
- Validate all input data
- Implement proper authentication (coming soon)
- Use environment variables for sensitive data
- Sanitize file uploads
- Implement rate limiting
- Log security events

## 🚧 Troubleshooting

### **Common Issues**

1. **Port Already in Use**
   ```bash
   # Check what's using port 3001
   lsof -i :3001
   
   # Kill the process
   kill -9 <PID>
   ```

2. **File Upload Issues**
   ```bash
   # Ensure upload directory exists
   mkdir -p uploads
   
   # Check file permissions
   chmod 755 uploads
   ```

3. **Database Issues** (Coming Soon)
   ```bash
   # Check database connection
   npm run db:studio
   
   # Reset database
   npm run db:push --force-reset
   ```

4. **Environment Variables**
   ```bash
   # Verify .env.local exists
   ls -la .env.local
   
   # Check variable values
   cat .env.local
   ```

### **Development Tips**
- Use browser DevTools for debugging
- Monitor network requests
- Check server logs for errors
- Use the debug mode for verbose logging
- Test file uploads with different file types

## 📚 Related Documentation

- **[Main Project README](../README.md)**: Overall project overview
- **[Professional Portal README](../urban-planning-portal/README.md)**: Frontend portal documentation
- **[System Architecture](../docs/system-architecture.md)**: Technical architecture
- **[Project Vision](../docs/PROJECT.md)**: Project goals and roadmap
- **[TODO.md](../TODO.md)**: Development roadmap and tasks

## 🤝 Contributing

1. Follow the established coding standards
2. Write tests for new features
3. Update API documentation
4. Test admin workflows thoroughly
5. Consider security implications

## 📄 License

This project is proprietary software. All rights reserved.

---

**Last Updated**: December 2024  
**Version**: 0.1.0  
**Status**: Active Development