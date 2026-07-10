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
git clone https://github.com/lucaruboni/Global_AI_adoption_heat_map
cd Global_AI_adoption_heat_map

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
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — Detailed system design
- **[docs/API.md](docs/API.md)** — REST API reference
- **[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)** — How to contribute
- **[DEVELOPMENT.md](DEVELOPMENT.md)** — Local setup, testing, debugging
- **Production deploy** — `docker-compose.prod.yml` + [.env.prod.example](.env.prod.example)

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

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines, and
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) / [docs/API.md](docs/API.md) for the
system design and API reference.

## 📝 License

Licensed under the **Apache License 2.0**. See [LICENSE](LICENSE) for details.

## 🙋 Support

- **Issues**: [GitHub Issues](https://github.com/lucaruboni/Global_AI_adoption_heat_map/issues)
- **Discussions**: [GitHub Discussions](https://github.com/lucaruboni/Global_AI_adoption_heat_map/discussions)
- **Email**: lucaruboni@gmail.com

## 🗺️ Roadmap

### Phase 1: Foundations ✅
- [x] Monorepo setup, Docker Compose, TypeScript strict config
- [x] Oracle database schema, GitHub Actions CI

### Phase 2: Backend API ✅
- [x] REST endpoints (countries, regions), TypeORM + Oracle
- [x] JWT authentication, Zod validation, structured errors

### Phase 3: Frontend UI ✅
- [x] Three.js globe ported to React (MVP design preserved)
- [x] Dashboard with charts, email-gated download, user registration

### Phase 4: Data Pipelines ✅
- [x] Historical time-series (2023–2026 backcast snapshots)
- [x] Company stock valuations, gated server-side CSV download + audit

### Phase 5: Data breadth & open source ✅
- [x] Hardware sales index (GPU/CPU/RAM) — local-AI-capacity proxy
- [x] Apache 2.0 license, CONTRIBUTING / ARCHITECTURE / API docs, issue & PR templates

### Phase 6: Integrations & production ✅
- [x] Multi-format export (CSV / JSON / Parquet), frontend code-splitting
- [x] Live stock feed (Alpha Vantage) + email notifications (graceful fallbacks)
- [x] Production Docker images (backend + nginx frontend) & compose

### Next
- [ ] Real (non-backcast) historical data sources
- [ ] Production TypeORM migrations (dev currently uses `synchronize`)
- [ ] Test suite (unit + integration + E2E)
- [ ] Redis caching for hot queries

---

**Status**: All core phases complete & verified | **Last Updated**: 2026-07-09
