# Urban Planning Professionals Portal

## Directory Structure

```
src/
├── app/             # Next.js app router pages and layouts
├── components/      # React components
│   ├── ui/         # Basic UI components (using shared components)
│   └── features/   # Feature-specific components
├── hooks/          # Custom React hooks
├── lib/            # Core utilities, services, and configurations
├── types/          # TypeScript type definitions (using shared types)
├── utils/          # Utility functions
└── __tests__/      # Test files

public/
├── documents/      # Document templates and static files
├── images/        # Static images
└── pre-prepared/  # Pre-prepared assessment files
```

## Environment Variables

The application uses different environment files for different environments:
- `.env.development` - Development environment
- `.env.test` - Test environment
- `.env.production` - Production environment
- `.env` - Local overrides (not committed)
- `.env.example` - Template showing required variables

### Required Environment Variables

#### API Configuration
- `NEXT_PUBLIC_API_URL` - Base URL for API endpoints

#### Authentication
- `NEXTAUTH_URL` - NextAuth.js URL
- `NEXTAUTH_SECRET` - Secret key for NextAuth.js

#### Database
- `DATABASE_URL` - PostgreSQL connection string

#### Storage
- `STORAGE_ACCOUNT` - Azure Storage account name
- `STORAGE_ACCESS_KEY` - Azure Storage access key
- `STORAGE_CONTAINER` - Azure Storage container name

#### External Services
- `GEOCODING_API_KEY` - ArcGIS geocoding service API key
- `MAPS_API_KEY` - Maps service API key

#### Feature Flags
- `ENABLE_DOCUMENT_UPLOAD` - Enable/disable document upload feature
- `ENABLE_PRE_PREPARED` - Enable/disable pre-prepared assessments

#### Monitoring
- `SENTRY_DSN` - Sentry error tracking DSN

#### Development
- `NODE_ENV` - Node environment (development/test/production)
- `DEBUG` - Enable/disable debug mode

## Shared Components

This portal uses shared components from the `shared` directory. Key shared resources:

- UI Components: `@shared/components/ui/*`
- Types: `@shared/types/*`
- Services: `@shared/services/*`
- Contexts: `@shared/contexts/*`

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update variables with your values

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development Guidelines

1. Use shared components whenever possible
2. Place portal-specific components in `src/components/features`
3. Keep business logic in appropriate services
4. Follow TypeScript types from shared directory
5. Never commit sensitive environment variables

## Testing

```bash
npm run test
```

## Building

```bash
npm run build
```

## Deployment

[Add deployment instructions here]
