# Development Guide

## Local Development Setup

### 1. Prerequisites

- **Docker** & **Docker Compose** (v3.9+)
- **Node.js** 20 LTS
- **npm** or **yarn**
- **Git**

### 2. Clone & Install

```bash
git clone https://github.com/lucaruboni/Global_AI_adoption_heat_map
cd Global_AI_adoption_heat_map
npm install
```

### 3. Environment Configuration

```bash
# Create backend .env from template
cp backend/.env.example backend/.env

# Create frontend .env from template
cp frontend/.env.example frontend/.env
```

Both files are pre-configured for local development.

### 4. Start Services

```bash
# Start all services (frontend, backend, Oracle, Redis)
npm run dev

# In a separate terminal, watch for code changes
npm run dev:watch
```

Wait for services to be healthy:
- **Backend**: http://localhost:3000/health
- **Frontend**: http://localhost:5173
- **Oracle**: localhost:1521 (XEPDB1)
- **Redis**: localhost:6379

### 5. Database Initialization

Migrations run automatically when the Oracle container starts. To manually check or run migrations:

```bash
# View current schema
docker-compose exec oracle sqlplus aiheatmap/aiheatmap_dev_123@XEPDB1

# List tables
SELECT table_name FROM user_tables;

# Exit SQL*Plus
EXIT;
```

---

## Folder Organization

```
project-root/
├── frontend/               # React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page-level components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API calls
│   │   ├── stores/        # Zustand state
│   │   ├── styles/        # SCSS
│   │   ├── utils/         # Helpers
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/            # Static assets
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/               # Express API
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Data access
│   │   ├── middleware/    # Auth, errors, logs
│   │   ├── routes/        # API routes
│   │   ├── types/         # Interfaces
│   │   ├── utils/         # Helpers
│   │   ├── index.ts
│   │   └── __tests__/     # Test files
│   ├── migrations/        # Database migrations
│   ├── jest.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                # Shared types
│   └── types/
│       └── index.ts       # Shared interfaces
│
└── docker-compose.yml
```

---

## Code Standards

### TypeScript

- **Strict mode**: ✅ Enabled
- **No `any` types**: ✅ Required
- **Null checks**: ✅ Required
- **Unused variables**: ⚠️ Error

```bash
# Type check entire project
npm run typecheck

# Just backend
npm run typecheck -w backend

# Just frontend
npm run typecheck -w frontend
```

### Linting & Formatting

```bash
# Lint all code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format with Prettier
npm run format
```

**Pre-commit hooks** automatically run linting & formatting. To bypass (not recommended):

```bash
git commit --no-verify
```

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `CountryCard.tsx` |
| Hooks | `useXxx` camelCase | `useCountries.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Database tables | snake_case | `country_stats` |
| Database columns | snake_case | `created_at` |

---

## Testing

### Frontend (Vitest)

```bash
# Run tests
npm run test -w frontend

# Watch mode
npm run test:watch -w frontend

# Coverage report
npm run test:coverage -w frontend
```

### Backend (Jest)

```bash
# Run tests
npm run test -w backend

# Watch mode
npm run test:watch -w backend

# Coverage report
npm run test:coverage -w backend
```

**Minimum coverage**: 70% (lines, branches, functions)

---

## Database

### SQL*Plus Access

```bash
# Connect to Oracle
docker-compose exec oracle sqlplus aiheatmap/aiheatmap_dev_123@XEPDB1

# View current user
SHOW USER;

# List tables
SELECT table_name FROM user_tables;

# View column structure
DESC country_stats_snapshots;

# Exit
EXIT;
```

### Viewing Logs

```bash
# Oracle startup logs
docker-compose logs oracle -f

# Backend API logs
docker-compose logs backend -f

# Frontend dev server logs
docker-compose logs frontend -f
```

---

## Common Tasks

### Add a New Database Table

1. Create migration SQL in `database-migrations/0X-description.sql`
2. Restart Oracle container: `docker-compose restart oracle`
3. Verify in SQL*Plus

### Add a New API Endpoint

1. Create controller: `backend/src/controllers/UserController.ts`
2. Create service: `backend/src/services/UserService.ts`
3. Create route: `backend/src/routes/users.ts`
4. Mount route in `backend/src/index.ts`
5. Test with `npm run test -w backend`

### Add a New React Component

1. Create file: `frontend/src/components/MyComponent.tsx`
2. Add tests: `frontend/src/components/MyComponent.test.tsx`
3. Export from `frontend/src/components/index.ts`
4. Use in pages/other components

### View API Documentation

```bash
# OpenAPI spec (coming in Phase 2)
# Will be available at http://localhost:3000/api/docs
```

---

## Debugging

### Backend

```bash
# Add this to your code
import { logger } from './utils/logger';
logger.info('Message', { data: 'value' });

# View logs
docker-compose logs backend -f
```

### Frontend

```bash
# Browser DevTools (F12)
# Console tab shows logged messages

# Add this to your code
import { logger } from './utils/logger';
logger.info('Message', data);
```

### Database

```bash
# Query logs
docker-compose exec oracle sqlplus aiheatmap/aiheatmap_dev_123@XEPDB1
SELECT * FROM country_stats_snapshots WHERE ROWNUM <= 10;
```

---

## Troubleshooting

### Services won't start

```bash
# Clean up containers and volumes
npm run dev:clean

# Rebuild and start
npm run dev
```

### Port already in use

```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or modify docker-compose.yml ports
```

### Database connection errors

```bash
# Check Oracle health
docker-compose logs oracle -f

# Verify credentials in backend/.env
# User: aiheatmap
# Password: aiheatmap_dev_123
# SID: XEPDB1

# Restart just Oracle
docker-compose restart oracle
```

### TypeScript errors

```bash
# Clear cache and reinstall
npm run typecheck
npm ci
npm run build -w backend
npm run build -w frontend
```

---

## Performance Tips

### Frontend

- Use `React.memo()` for expensive components
- Lazy load route components with `React.lazy()`
- Use `useCallback()` to prevent unnecessary re-renders
- Monitor bundle size: `npm run build -w frontend && ls -lh frontend/dist`

### Backend

- Use database indexes (defined in schema)
- Implement Redis caching for expensive queries
- Use connection pooling for Oracle
- Monitor response times in logs

---

## Before Committing

Run this checklist:

```bash
# Type check
npm run typecheck

# Lint & format
npm run lint:fix && npm run format

# Test
npm run test

# Build
npm run build

# Finally, commit
git add .
git commit -m "feat: description of change"
```

Or let Git hooks do it automatically! ✅

---

## Need Help?

- **Architecture questions**: Read [AGENT_RULES.md](AGENT_RULES.md)
- **API questions**: See [API.md](docs/API.md) (coming Phase 2)
- **Database questions**: Read [database-migrations/](database-migrations/)
- **Code examples**: Check existing components/services
- **Issues**: [GitHub Issues](https://github.com/lucaruboni/Global_AI_adoption_heat_map/issues)

---

**Last Updated**: 2026-07-07
