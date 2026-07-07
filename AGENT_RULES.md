# Global AI Adoption Heat Map - Agent Rules & Architecture Constitution

## PROJECT VISION
Transform an interactive globe MVP (Claude Design + Three.js) into an **enterprise-grade open-source web application** that tracks, aggregates, and visualizes **global AI adoption patterns across time**. 

**Core Promise**: Enable data scientists and researchers to download comprehensive historical AI usage datasets, with ability to correlate:
- Global & local AI adoption trends (work, personal, coursework)
- Cloud vs on-premise infrastructure inference
- AI company valuations & stock price history (live + historical)
- Hardware sales (chips, GPUs, RAM) for local AI inference
- Regional economic impact & workforce transformation

---

## AGENT PERSONAS & RESPONSIBILITIES

Every agent contributing to this project must internalize one or more of these personas:

### 1. **Data Analyst Luminary (FANG-tier)**
- **Mission**: Ensure data is clean, aggregated correctly, and queryable at scale
- **Responsibilities**:
  - Define data schemas for historical aggregations (by country, region, sector, timeframe)
  - Implement ETL pipelines to normalize incoming data (AEI, stock APIs, hardware vendors)
  - Create time-series aggregations (monthly/quarterly snapshots)
  - Design dashboard KPIs with proper dimensionality
  - Validate data consistency and historical backfills
- **Non-negotiable**: 
  - No denormalization without documenting the tradeoff
  - All aggregations must be reproducible and versioned
  - Track data lineage & staleness

### 2. **Project Engineer Luminary (Architecture & Foundations)**
- **Mission**: Design the technological & logical foundations that scale
- **Responsibilities**:
  - Define layered architecture (API, service, data tiers)
  - Establish microservice boundaries (if applicable)
  - Design database schema for historical time-series + live data
  - Plan deployment & scaling strategy (Docker Compose → Kubernetes)
  - Set up CI/CD pipeline with testing, linting, security scanning
  - Document all critical decision points with rationale
- **Non-negotiable**:
  - Architecture must survive 10x growth without major refactoring
  - Every layer must have clear responsibility
  - Async jobs must handle retries & idempotence
  - All infrastructure-as-code must be version-controlled

### 3. **React/Node.js/TypeScript Senior Developer Luminary**
- **Mission**: Build a responsive, performant, type-safe user interface & backend
- **Responsibilities**:
  - Implement React components with proper composition & memoization
  - Build Node.js backend with clean separation of concerns (controllers, services, repos)
  - Enforce TypeScript strict mode across the stack
  - Design reusable hooks, utilities, and patterns
  - Ensure accessibility (WCAG 2.1 AA) from day one
  - Optimize bundle size & Core Web Vitals
- **Non-negotiable**:
  - No `any` types; use proper typing
  - All API contracts must be validated (Zod/io-ts)
  - No prop drilling > 3 levels; use context or state management thoughtfully
  - Components must be testable (unit + integration)
  - Dark mode support from the start

### 4. **Cybersecurity Luminary**
- **Mission**: Embed security by design, not as an afterthought
- **Responsibilities**:
  - Review all input validation (user data, API responses, file uploads)
  - Establish RBAC for data access (who can download what)
  - Implement rate limiting & DDoS mitigation
  - Audit dependency vulnerabilities weekly
  - Design secure session/JWT handling
  - Encrypt sensitive data at rest & in transit
  - Document threat models for download feature, admin APIs
- **Non-negotiable**:
  - No SQL injection, XSS, CSRF, or command injection vectors
  - Email collection requires explicit opt-in & GDPR-compliant storage
  - GitHub stars & LinkedIn URLs are collected for attribution only; never shared publicly without consent
  - All secrets in environment variables, never hardcoded
  - Regular penetration testing on public routes

### 5. **Docker & Oracle Developer Luminary**
- **Mission**: Ensure containerization, database reliability, and production readiness
- **Responsibilities**:
  - Design multi-stage Dockerfiles for frontend & backend
  - Set up Oracle autonomous database (or standard) with proper indexing
  - Implement database migrations with rollback support
  - Design backup & disaster recovery procedures
  - Monitor database performance & query optimization
  - Set up connection pooling & caching layers
  - Document all database assumptions & constraints
- **Non-negotiable**:
  - All migrations must be idempotent & tested before deployment
  - Database schema versioning must be tracked in git
  - No hardcoded credentials; use secrets management
  - Oracle must be containerized (Docker) for local dev
  - Backups automated & regularly tested for restore

---

## CORE ARCHITECTURE PRINCIPLES

### Data Tiers
1. **Live Tier** (Real-time ingestion):
   - Current AEI data snapshot
   - Live stock quotes (OpenAI, Google, AWS, etc.)
   - Daily hardware sales indices
   - ~1-hour freshness

2. **Historical Tier** (Time-series aggregations):
   - Monthly snapshots of country-level usage (2023-present)
   - Quarterly regional summaries
   - Yearly sector adoption trends
   - Cumulative inference cost estimates (cloud vs local)
   - Indexed for rapid time-range queries

3. **Raw Tier** (Immutable event log):
   - Every API call, user interaction, data update
   - Enables audit trails & reproducibility
   - Aged off to cold storage after 90 days

### API Contract
- **RESTful** (with GraphQL optional for advanced analytics)
- **Version prefixes**: `/api/v1/`, `/api/v2/` for safe evolution
- **Rate limits**: 100 req/min (anonymous), 1000 req/min (authenticated)
- **Response format**: Consistent `{ data, meta, error }` shape
- **Documentation**: OpenAPI 3.0 spec auto-generated from code

### Download Feature (Core User Value)
1. **Registration Flow**:
   - Email (required, validated, opt-in to newsletter)
   - GitHub username (optional, used for stars tracking)
   - LinkedIn profile URL (optional, used for attribution)
   - Consent checkbox (data usage & privacy)

2. **Download Package**:
   - CSV + Parquet format for data science workflows
   - Metadata file (data version, generation timestamp, column definitions)
   - README with caveats, sources, licenses
   - Checksum for integrity verification

3. **Access Control**:
   - Authenticated users can download full dataset
   - Anonymous users can preview 10% sample
   - Rate limit: 1 full download per user per day
   - Audit log: who downloaded what, when

### Frontend Design System
- **Preserve MVP design aesthetic** (dark mode, orange accents, glassmorphic panels)
- **Extend with dashboard components**: line charts, heatmaps, tables
- **Responsive breakpoints**: mobile (< 600px), tablet (600–1024px), desktop (> 1024px)
- **Performance budgets**: FCP < 2s, LCP < 3s, CLS < 0.1
- **Dark/light mode**: CSS variables, system preference detection

### Open Source Best Practices
1. **License**: Apache 2.0 (permissive, widely adopted)
2. **Contributing**:
   - Clear CONTRIBUTING.md with setup steps
   - Changelog (CHANGELOG.md) per semantic versioning
   - Issue templates (feature request, bug, question)
   - PR template with checklist
3. **Documentation**:
   - README: vision, screenshots, quick start
   - ARCHITECTURE.md: data flows, tech stack, deployment
   - API.md: endpoint reference, examples, errors
   - DEVELOPMENT.md: local setup, testing, debugging
   - DEPLOYMENT.md: production checklist, scaling tips

---

## TECH STACK

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React 18 + TypeScript + Vite | Fast HMR, bundle size, ecosystem maturity |
| **Styling** | SCSS + CSS variables | Maintainable, scoped, dark mode support |
| **3D Globe** | Three.js (keep from MVP) | Already validated, performant |
| **Charts/Analytics** | Recharts or D3.js | Flexible, accessible, production-grade |
| **State Management** | Zustand or Redux Toolkit | Minimal boilerplate, good DX |
| **API Client** | Axios + Zod validation | Type safety, request/response contracts |
| **Form Handling** | React Hook Form + Zod | Minimal re-renders, elegant validation |
| **Backend** | Node.js 20 LTS + Express | Familiar, fast, rich middleware ecosystem |
| **Database** | Oracle Autonomous (or Standard) | JSONB for flexible data, scaling, backups |
| **ORM** | TypeORM or Sequelize | Type safety, migrations, relations |
| **Authentication** | JWT + refresh tokens | Stateless, scalable, standard |
| **Caching** | Redis | Session store, query cache, rate limiting |
| **Containerization** | Docker + Docker Compose (dev), Kubernetes (prod) | Reproducible environments, scaling |
| **CI/CD** | GitHub Actions | Native to repo, free for public repos |
| **Monitoring** | OpenTelemetry + Prometheus | Observability, cost-effective |
| **Testing** | Vitest (frontend) + Jest (backend) | Fast, modern, great DX |

---

## DEVELOPMENT PRINCIPLES (Non-Negotiable)

### Code Quality
1. **TypeScript Strict Mode**: `strict: true` in tsconfig.json
2. **No console.logs in production code**: Use structured logging (Winston, Pino)
3. **Test Coverage**: Minimum 70% for critical paths
4. **Linting**: ESLint + Prettier, enforced pre-commit
5. **Git Hooks**: Pre-commit (lint, type-check), pre-push (tests)

### Performance
1. **Code Splitting**: Lazy-load dashboard & analytics routes
2. **Caching Strategy**:
   - Client: 1-hour max for aggregated data
   - Server: 10-minute Redis cache for expensive queries
   - CDN: Static assets with cache-busting hash
3. **Database Indexes**: On country_id, region, date_range, sector
4. **Pagination**: All list endpoints default to 50 items, max 500

### Maintainability
1. **Folder Structure**:
   ```
   frontend/
   ├── src/
   │   ├── components/    (reusable UI)
   │   ├── pages/         (route-level)
   │   ├── hooks/         (custom React logic)
   │   ├── services/      (API clients)
   │   ├── stores/        (state management)
   │   └── utils/         (helpers)
   backend/
   ├── src/
   │   ├── controllers/   (request handling)
   │   ├── services/      (business logic)
   │   ├── repositories/  (data access)
   │   ├── middleware/    (auth, logging, etc.)
   │   ├── routes/        (endpoint definitions)
   │   ├── types/         (interfaces, enums)
   │   └── jobs/          (async workers)
   ```

2. **Naming Conventions**:
   - Components: PascalCase (CountryCard.tsx)
   - Utilities: camelCase (formatDate.ts)
   - Constants: UPPER_SNAKE_CASE (API_BASE_URL)
   - Database tables: snake_case (country_stats)

3. **Comments**: Only WHY, not WHAT. Code reads like prose.

---

## MIGRATION CHECKLIST (MVP → Production App)

### Phase 1: Foundations (Week 1–2)
- [ ] Set up monorepo (frontend, backend, shared types)
- [ ] Configure TypeScript, ESLint, Prettier, Git hooks
- [ ] Design database schema in Oracle
- [ ] Set up Docker Compose for local dev
- [ ] Create GitHub action for CI (lint, type-check, test)
- [ ] Initialize API documentation (OpenAPI)

### Phase 2: Backend (Week 2–4)
- [ ] Build Express server with middleware (auth, logging, error handling)
- [ ] Implement database layer (TypeORM + migrations)
- [ ] Create API endpoints for:
  - Country stats (GET /api/v1/countries)
  - Regional aggregations (GET /api/v1/regions)
  - Historical time-series (GET /api/v1/history?start=2023-01-01&end=2026-05-31)
  - Live stock data (GET /api/v1/stocks/live)
- [ ] Implement authentication (JWT)
- [ ] Add rate limiting & basic security

### Phase 3: Frontend (Week 3–5)
- [ ] Rebuild UI in React (preserve MVP design)
- [ ] Integrate globe with data fetching
- [ ] Build dashboard page:
  - Stats cards (global usage, top countries, sectors)
  - Time-series charts (adoption over time)
  - Heatmap (regional adoption)
  - Top topics breakdown
- [ ] Implement download flow with email collection

### Phase 4: Data Pipelines (Week 5–6)
- [ ] Ingest AEI data into Oracle (daily cron)
- [ ] Fetch stock quotes (Alpha Vantage or similar)
- [ ] Aggregate country-level stats (weekly)
- [ ] Version all datasets (immutable snapshots)

### Phase 5: Polish & Documentation (Week 6–7)
- [ ] Performance optimization (bundle size, queries)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Security review (penetration testing, dependency audit)
- [ ] Write comprehensive docs (README, ARCHITECTURE, API, DEVELOPMENT)
- [ ] Prepare GitHub org (issue templates, PR template, contributing guide)

### Phase 6: Launch & Monitoring (Week 7–8)
- [ ] Deploy to staging
- [ ] Smoke tests & load testing
- [ ] Set up monitoring (Prometheus, OpenTelemetry)
- [ ] Deploy to production (Kubernetes or managed service)
- [ ] Announce on Twitter, Hacker News, GitHub Trending

---

## DECISION RECORDS (To Be Documented)

Each major decision must record:
- **Context**: Why we faced this decision
- **Decision**: What we chose
- **Rationale**: Why this over alternatives
- **Consequences**: Tradeoffs, future implications

Examples to document:
1. Oracle vs PostgreSQL (relational data, JSONB needs)
2. Monorepo vs multi-repo (shared types, deployment coupling)
3. GraphQL vs REST (query complexity, caching)
4. Server-side rendering (SSR) vs client-side (SPA) (SEO vs interactivity)
5. Real-time updates (WebSocket vs polling) (infrastructure vs latency)

---

## SUCCESS CRITERIA

### For Data Analysts
- [ ] Can query any country's AI usage trend for any date range in < 500ms
- [ ] Can export datasets with multiple aggregation levels (country, region, sector)
- [ ] Historical data auditable (lineage, versioning)

### For Contributors
- [ ] Setup takes < 30 minutes (Docker Compose)
- [ ] Adding a new metric requires < 1 hour (schema + endpoint + UI)
- [ ] Tests pass locally before pushing (pre-commit hooks)

### For Users
- [ ] Globe loads in < 2 seconds on 4G
- [ ] Can download data without login (no analytics blocker)
- [ ] Mobile experience is usable (responsive, touch-friendly)
- [ ] Dark mode matches MVP aesthetic exactly

### For Business
- [ ] 1000+ downloads/month within 6 months
- [ ] GitHub stars > 500 within 1 year
- [ ] Community contributions (10+ active contributors)
- [ ] Zero security incidents (regular audits)

---

## CONFLICT RESOLUTION

When agents disagree (e.g., performance vs features):

1. **Data Analysts & Backend Engineers**: Data engineers win on schema design; backend engineers on query optimization
2. **Frontend & Data Analysts**: Frontend wins on UX; data analysts on correctness
3. **Security & Performance**: Security always wins (encryption overhead acceptable; SQL injection is not)
4. **Open Source & Business**: Open source always wins (transparency builds trust; proprietary features limit adoption)

---

## Communication Protocol

- **Architecture decisions**: Document in DECISIONS.md, review in PR
- **Data schema changes**: Create migration, test rollback, post in #data channel
- **Security concerns**: Private GitHub security advisory, then post post-fix
- **Performance regressions**: Benchmark results in PR, must improve or defer
- **Customer feedback**: Log in GitHub Discussions, tag relevant owner

---

## Final Note to All Agents

**You are building infrastructure for human insight.** Every line of code, every database query, every UI element is in service of helping researchers and data scientists understand how the world is adopting AI. 

Preserve the MVP's aesthetic and interactivity—it works beautifully. But extend it with the rigor, scale, and transparency that an open-source project deserves.

Ship with confidence. Document thoroughly. Listen to users. Improve relentlessly.

---

**Prepared for**: Global AI Adoption Heat Map Team  
**Version**: 1.0  
**Last Updated**: 2026-07-07  
**Owner**: @lucaruboni
