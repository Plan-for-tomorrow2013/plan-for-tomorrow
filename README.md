# Urban Planning Professionals Portal

## Environment Setup

This project consists of two applications: an admin portal and a user-facing portal. Each application requires its own environment configuration.

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Environment Files Structure

```
urban-planning-professionals-portal/
├── .env                    # Root environment variables (database)
├── .env.local             # Root local environment variables
├── admin/
│   ├── .env.local         # Admin application environment variables
│   ├── .env.development.local  # Development-specific variables
│   └── .env.example       # Admin environment template
└── urban-planning-portal/
    ├── .env.local         # Portal application environment variables
    ├── .env.development.local  # Development-specific variables
    └── .env.example       # Portal environment template
```

### Setting Up Environment Variables

1. **Root Environment Variables**
   - Copy `.env.example` to `.env`
   - Update the database connection string:
     ```
     DATABASE_URL="postgres://user:password@localhost:5432/database?schema=public"
     ```

2. **Admin Application**
   - Navigate to the `admin` directory
   - Copy `.env.example` to `.env.local`
   - Update the following required variables:
     ```
     PORT=3001
     DATABASE_URL="postgres://user:password@localhost:5432/database?schema=public"
     JWT_SECRET=your_jwt_secret_here
     ```

3. **Urban Planning Portal**
   - Navigate to the `urban-planning-portal` directory
   - Copy `.env.example` to `.env.local`
   - Update the following required variables:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:3001
     NEXT_PUBLIC_APP_URL=http://localhost:3000
     ```

### Key Environment Variables

#### Admin Application
- `PORT`: Server port (default: 3001)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `UPLOAD_DIR`: Directory for file uploads
- `ALLOWED_ORIGINS`: CORS allowed origins
- `SMTP_*`: Email configuration for notifications
- `LOG_LEVEL`: Logging level (debug, info, warn, error)
- `RATE_LIMIT_*`: API rate limiting configuration

#### Urban Planning Portal
- `NEXT_PUBLIC_API_URL`: Admin API endpoint
- `NEXT_PUBLIC_APP_URL`: Portal frontend URL
- `NEXT_PUBLIC_JWT_COOKIE_NAME`: JWT cookie name
- `NEXT_PUBLIC_ARCGIS_*`: ArcGIS map service URLs
- `NEXT_PUBLIC_ENABLE_*`: Feature flags
- `NEXT_PUBLIC_THEME`: UI theme setting
- `NEXT_PUBLIC_DEFAULT_LOCALE`: Default language

### Development Setup

1. Install dependencies:
   ```bash
   # Root directory
   npm install

   # Admin application
   cd admin
   npm install

   # Portal application
   cd ../urban-planning-portal
   npm install
   ```

2. Set up the database:
   ```bash
   # From the root directory
   npx prisma generate
   npx prisma db push
   ```

3. Start the applications:
   ```bash
   # Admin application (port 3001)
   cd admin
   npm run dev

   # Portal application (port 3000)
   cd ../urban-planning-portal
   npm run dev
   ```

### Environment Variables Security

- Never commit `.env.local` files to version control
- Keep sensitive information secure
- Use different environment variables for development, staging, and production
- Regularly rotate secrets and API keys
- Use strong, unique values for secrets

### Troubleshooting

Common issues and solutions:

1. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists and is accessible

2. **Port Conflicts**
   - Admin runs on port 3001
   - Portal runs on port 3000
   - Change ports in respective `.env.local` files if needed

3. **CORS Issues**
   - Verify `ALLOWED_ORIGINS` in admin `.env.local`
   - Check `NEXT_PUBLIC_API_URL` in portal `.env.local`

4. **File Upload Issues**
   - Ensure `UPLOAD_DIR` exists and is writable
   - Check `MAX_FILE_SIZE` limits

### Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Development Environment Setup

1. **Development Database**
   - Create a development database:
     ```bash
     createdb urbanplanning_dev
     ```
   - Update DATABASE_URL in `.env.development.local` to point to the development database

2. **Development Scripts**
   - Admin application:
     ```bash
     # Regular development
     npm run dev
     
     # Debug mode with verbose logging
     npm run dev:debug
     ```
   - Portal application:
     ```bash
     # Regular development
     npm run dev
     
     # Debug mode with verbose logging
     npm run dev:debug
     ```

3. **Development Features**
   - Debug tools enabled
   - Verbose logging
   - Mock data available
   - Development-specific UI elements
   - Relaxed security settings
   - Performance monitoring

4. **Development Ports**
   - Admin: http://localhost:3001
   - Portal: http://localhost:3000

### Development-Specific Variables

#### Admin Development Variables
- `DEBUG_MODE`: Enable debug mode
- `DEBUG_LEVEL`: Set logging level
- `ENABLE_API_LOGS`: Enable API request logging
- `LOG_SQL_QUERIES`: Log database queries
- `SHOW_DETAILED_ERRORS`: Show full error details
- `RATE_LIMIT_MAX_REQUESTS`: Higher limit for development

#### Portal Development Variables
- `NEXT_PUBLIC_ENABLE_DEBUG_TOOLS`: Enable development tools
- `NEXT_PUBLIC_SHOW_GRID_OVERLAY`: Show layout grid
- `NEXT_PUBLIC_ENABLE_MOCK_DATA`: Enable mock data
- `NEXT_PUBLIC_ENABLE_MAP_DEBUG`: Enable map debugging
- `NEXT_PUBLIC_SHOW_DEVELOPMENT_BANNER`: Show development mode banner

### Development Tools

1. **Database Management**
   ```bash
   # View database with Prisma Studio
   npm run db:studio
   
   # Push schema changes
   npm run db:push
   ```

2. **Testing**
   ```bash
   # Run tests
   npm run test
   
   # Watch mode
   npm run test:watch
   
   # Coverage report
   npm run test:coverage
   ```

3. **Performance Analysis**
   ```bash
   # Analyze bundle size
   npm run analyze
   ```

### Development Best Practices

1. **Code Quality**
   - Run linter before committing: `npm run lint`
   - Maintain test coverage
   - Use TypeScript strictly

2. **Database**
   - Use development database
   - Reset data when needed
   - Use migrations for schema changes

3. **Debugging**
   - Use Chrome DevTools
   - Enable React DevTools
   - Check network requests
   - Monitor console logs

4. **Performance**
   - Monitor bundle size
   - Check render performance
   - Profile API calls
   - Use React DevTools profiler 