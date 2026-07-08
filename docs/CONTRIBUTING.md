# Contributing

Thanks for your interest in improving the Global AI Adoption Heat Map! This is an
open-source project (Apache 2.0) and contributions of all sizes are welcome.

## Before you start

1. Read [AGENT_RULES.md](../AGENT_RULES.md) — the project's engineering
   constitution (personas, architecture principles, non-negotiables).
2. Skim [docs/ARCHITECTURE.md](ARCHITECTURE.md) to see how the pieces fit.
3. Set up locally with [DEVELOPMENT.md](../DEVELOPMENT.md).

## Ways to contribute

- **Data**: better/real sources for adoption, stock, or hardware series.
- **Features**: new visualizations, endpoints, or dashboard panels.
- **Docs**: clarify setup, fix typos, add examples.
- **Bugs**: reproduce, report, or fix. Open an issue first for anything large.

## Workflow

```bash
# 1. Fork & clone, then create a branch off main
git checkout -b feat/short-description

# 2. Make your change. Keep commits focused and conventional:
#    feat: … / fix: … / docs: … / refactor: … / test: …

# 3. Before pushing, everything must be green:
npm run typecheck      # strict TypeScript, no `any`
npm run lint           # ESLint + Prettier
npm run test           # unit tests
npm run build          # both workspaces build

# 4. Push and open a Pull Request against main.
```

## Standards (enforced in CI)

- **TypeScript strict**; no `any`. Prefer explicit return types.
- **Naming**: PascalCase components, camelCase utils, `snake_case` DB columns.
- **Layering** (backend): route → controller → service → repository. Controllers
  don't touch repositories; services don't touch `req`/`res`.
- **API contract** lives in `shared/types` — update it when you change a response.
- **Tests** for new business logic; aim to keep critical paths ≥ 70% covered.
- **Comments** explain *why*, not *what*.

## Adding a new data series (typical PR shape)

1. Entity in `backend/src/database/entities/` + register in `data-source.ts`.
2. A `seed-*.ts` script (idempotent; compare by ISO-date string).
3. Service + controller + route under `/api/v1/…`.
4. Shared type in `shared/types/index.ts`.
5. A frontend service + a dashboard panel (single-hue charts, brand accent).
6. Verify end-to-end against a live Oracle before opening the PR.

## Commit / PR checklist

- [ ] `typecheck`, `lint`, `test`, `build` all pass locally
- [ ] Updated `shared/types` if the API changed
- [ ] Updated docs (`docs/API.md`, `ARCHITECTURE.md`) if relevant
- [ ] Verified the change actually runs (not just compiles)

## Code of Conduct

Be kind and constructive. See [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions are licensed under the
Apache License 2.0.
