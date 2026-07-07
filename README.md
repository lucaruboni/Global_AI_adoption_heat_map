# Global AI Adoption Heat Map

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Status: In Development](https://img.shields.io/badge/Status-In%20Development-yellow.svg)](DEVELOPMENT.md)

Track and visualize **global AI adoption patterns** in real-time. Download historical datasets, analyze trends, and understand how the world is adopting AI across regions, sectors, and use cases.

## 🌍 Vision

Transform raw AI adoption data into actionable insights. This open-source platform aggregates:

- **AI Usage Trends** — Track adoption over time by country, region, and sector
- **Company Valuations** — Real-time stock prices & market cap for AI companies
- **Hardware Infrastructure** — GPU, CPU, and RAM sales indicating local inference capacity
- **Economic Impact** — Correlate AI adoption with GDP and workforce transformation

## ✨ Features (Roadmap)

- **Interactive 3D Globe** — Visualize global AI usage with Three.js
- **Time-Series Dashboard** — Track adoption trends from 2023 to present
- **Historical Data Export** — Download datasets in CSV + Parquet formats
- **Live Stock Integration** — Monitor AI company valuations
- **Regional Analysis** — Understand regional adoption patterns
- **Sector Breakdown** — See which industries drive AI usage

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- Git

### Setup (5 minutes)

```bash
# Clone the repository
git clone https://github.com/yourusername/global-ai-adoption-heatmap
cd global-ai-adoption-heatmap

# Start the full stack (frontend + backend + Oracle + Redis)
docker-compose up

# In another terminal, install dependencies (monorepo)
npm install

# Run migrations (automatically on Docker startup)
# Database is ready at localhost:1521
```

Visit:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1
- **Health Check**: http://localhost:3000/health

## 📚 Documentation

- **[AGENT_RULES.md](AGENT_RULES.md)** — Architecture principles, personas, tech stack (for contributors)
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** — Detailed system design (coming in Phase 2)
- **[API.md](docs/API.md)** — REST API reference (coming in Phase 2)
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** — Local setup, testing, debugging (coming in Phase 2)
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** — Production checklist (coming in Phase 2)

## 🏗️ Project Structure

```
.
├── frontend/              # React + TypeScript UI
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Route-level pages
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API clients
│   │   ├── stores/        # State management (Zustand)
│   │   └── styles/        # SCSS + CSS variables
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/               # Node.js + Express API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Data access (TypeORM)
│   │   ├── middleware/    # Auth, logging, errors
│   │   ├── routes/        # API endpoints
│   │   ├── types/         # TypeScript interfaces
│   │   └── index.ts       # Server entry
│   ├── migrations/        # Database schemas
│   └── jest.config.js
│
├── shared/                # Shared types
│   └── types/             # TypeScript interfaces
│
├── docker-compose.yml     # Local dev environment
├── AGENT_RULES.md         # Constitution for contributors
└── package.json           # Monorepo root
```

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 18 + TypeScript + SCSS + Vite |
| **Backend** | Node.js 20 + Express + TypeORM |
| **Database** | Oracle Autonomous (dev: Oracle XE) |
| **Cache** | Redis |
| **Visualization** | Three.js + Recharts |
| **Containerization** | Docker + Docker Compose |
| **Testing** | Vitest (frontend) + Jest (backend) |
| **Linting** | ESLint + Prettier |

## 📊 Data Sources

- **Anthropic Economic Index (AEI)** — Global AI adoption metrics
- **Alpha Vantage** — Stock prices & market data
- **Hardware Vendors** — GPU/CPU sales indices

## 🤝 Contributing

This is an **open-source project** and we welcome contributions!

1. Read [AGENT_RULES.md](AGENT_RULES.md) for architecture & coding standards
2. Fork the repository
3. Create a feature branch: `git checkout -b feature/my-feature`
4. Commit with clear messages: `git commit -m "feat: add new feature"`
5. Push and open a Pull Request

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines (coming soon).

## 📝 License

Licensed under the **Apache License 2.0**. See [LICENSE](LICENSE) for details.

## 🙋 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/global-ai-adoption-heatmap/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/global-ai-adoption-heatmap/discussions)
- **Email**: lucaruboni@gmail.com

## 🗺️ Roadmap

### Phase 1: Foundations ✅ (In Progress)
- [x] Monorepo setup
- [x] Docker Compose environment
- [x] TypeScript configuration
- [x] Database schema
- [ ] GitHub Actions CI/CD

### Phase 2: Backend API (Coming July 2026)
- [ ] REST API endpoints
- [ ] Authentication (JWT)
- [ ] Data aggregation services
- [ ] Stock price integration

### Phase 3: Frontend UI (Coming July 2026)
- [ ] Dashboard with charts
- [ ] Download feature
- [ ] User registration
- [ ] Email notifications

### Phase 4: Data Pipelines (Coming August 2026)
- [ ] Daily AEI ingestion
- [ ] Weekly aggregations
- [ ] Stock price updates
- [ ] Historical backfills

### Phase 5: Polish & Launch (Coming August 2026)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Comprehensive docs
- [ ] Public launch

---

**Status**: Pre-release (Phase 1/5 complete) | **Last Updated**: 2026-07-07
