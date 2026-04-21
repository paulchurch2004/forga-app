# Professional Application Development Skill

Use this skill for modern fullstack architecture, React/frontend patterns, backend API design, database optimization, deployment strategies, security, testing, and DevOps best practices.

## Modern Architecture Patterns

### Modular Monolith (2025 Consensus Starting Point)

Deploys as single unit but internally divided into loosely coupled, domain-driven modules.

```
project/
├── modules/
│   ├── orders/
│   │   ├── domain/         # Business logic, entities
│   │   ├── application/    # Use cases, services
│   │   ├── infrastructure/ # DB, external services
│   │   └── api/            # Routes, controllers
│   ├── payments/
│   ├── users/
│   └── notifications/
├── shared/                 # Shared kernel
└── infrastructure/         # Cross-cutting concerns
```

### Decision Framework

| Pattern | When to Use |
|---------|-------------|
| **Modular Monolith** | Small teams (≤5 devs), MVPs, domain not well-understood |
| **Microservices** | Teams need independent deployment, independent scaling, strong DevOps maturity |
| **Serverless** | Event-driven workloads, sporadic traffic, API endpoints |

### Clean/Hexagonal Architecture
- Place business logic at center
- Dependencies point inward
- Apply within modules, not entire application (avoid over-abstraction)

### DDD (Domain-Driven Design)
- **Bounded contexts**: Define where logic belongs
- **Aggregates**: Enforce consistency
- **Domain events**: Signal changes between modules

## Frontend: React Best Practices (2025)

### React Server Components (RSC)
- **Standard in 2025** (not experimental)
- Keep data fetching and heavy computation in Server Components (default)
- Mark components `'use client'` only for: interactivity, event handlers, browser APIs

### State Management Decision Framework

| Library | When to Use | Bundle Size |
|---------|-------------|-------------|
| Context API | Simple prop-drilling, theme/auth | 0 KB |
| **Zustand** | Most projects (top choice 2025) | ~3 KB |
| Jotai | Complex interdependent/derived state | ~3 KB |
| Redux Toolkit | Large enterprise, strict patterns, time-travel debug | ~34 KB |
| TanStack Query | Server state (caching, refetch, pagination) | ~12 KB |

**2025 consensus:**
1. Start with Context API for simple cases
2. Graduate to **Zustand** for performance needs
3. **Always** use TanStack Query for server state
4. Redux Toolkit only for large-team enterprise apps

### Key React Patterns

**Custom Hooks** (most powerful pattern):
```javascript
function useAuth() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    // Auth logic
  }, []);
  return { user, login, logout };
}
```

**Compound Components** (shared implicit state):
```javascript
<Tabs>
  <TabList>
    <Tab>One</Tab>
    <Tab>Two</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>Panel 1</TabPanel>
    <TabPanel>Panel 2</TabPanel>
  </TabPanels>
</Tabs>
```

**Atomic Design**: atoms → molecules → organisms

**React Compiler** (React 19):
- Automatic memoization
- **30-60% reduction** in unnecessary re-renders

### Forms & Validation
- **React Hook Form** + **Zod** validation (standard)

### Styling
- **Tailwind CSS** (2025 default for most new projects)

### Recommended Folder Structure

```
src/
├── app/              # Next.js App Router pages
├── components/
│   ├── ui/           # Reusable primitives (Button, Input)
│   ├── features/     # Feature-specific components
│   └── layouts/
├── hooks/            # Custom hooks
├── lib/              # Utilities, API clients
├── types/            # TypeScript definitions
├── stores/           # State management
└── styles/           # Global styles
```

## Backend: Node.js and Python

### Node.js/Express Structure

```javascript
// app.js - API declaration
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes...

module.exports = app;

// server.js - Network concerns
const app = require('./app');
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));
```

**Critical:**
- Use TypeScript with `tsx` runner
- Never block event loop
- Use `async/await` for all I/O operations

### Python/FastAPI Structure

```python
from fastapi import FastAPI
from pydantic import BaseSettings

app = FastAPI()

# Use async def for I/O-bound routes
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}

# Use def for CPU-bound (runs in threadpool)
@app.post("/process")
def process_data(data: dict):
    # CPU-intensive work
    return result
```

**Best practices:**
- Pydantic `BaseSettings` for config
- `APIRouter` for modular routes
- Ruff for linting + formatting
- Deploy with Uvicorn (never `--reload` in production)
- Offload CPU work to Celery/workers

## API Design

### REST API Conventions
- Plural nouns for resources (`/api/users`)
- HTTP methods (GET/POST/PUT/PATCH/DELETE)
- URL versioning (`/api/v1/`)
- Consistent error response format
- Cursor-based pagination for large datasets

### When to Use GraphQL
- Mobile apps need reduced bandwidth (60-90% fewer network requests)
- Multiple clients have different data requirements

### When to Use tRPC
- End-to-end type-safe APIs in TypeScript monorepos
- Gaining traction in 2025

## Database Design

### SQL vs NoSQL

**Choose PostgreSQL (SQL) when:**
- Data is structured and relational
- ACID compliance matters
- Complex queries/JOINs needed

**Choose MongoDB (NoSQL) when:**
- Unstructured/semi-structured data
- Flexible schemas
- High write throughput

**2025 trend:** Polyglot persistence
- SQL for billing
- NoSQL for activity logs
- Redis for caching

### PostgreSQL Indexing Strategies

```sql
-- Partial index for active users only
CREATE INDEX active_users_idx ON users (email) WHERE status = 'active';

-- Composite index for common query patterns
CREATE INDEX users_email_status_idx ON users (email, status);

-- BRIN index for time-series data
CREATE INDEX orders_date_brin ON orders USING BRIN (created_at);
```

**Always use `EXPLAIN ANALYZE` to identify slow queries.**

**Connection pooling essential** for production (PgBouncer, typically `max: 20`)

### ORM Choice (2025)

| ORM | Best For |
|-----|----------|
| **Prisma** | Maximum abstraction, mature tooling (Prisma 7 pure TypeScript) |
| **Drizzle** | SQL-level control, fastest serverless cold starts (~7.4KB) |

Both are fully type-safe. **Never use `synchronize: true` in production.**

## Authentication & Authorization

### JWT Best Practices
- **Access tokens**: Short-lived (**15 min max**), stored **in memory** (JS variable)
- **Refresh tokens**: Longer-lived (7-30 days), **httpOnly, secure, SameSite cookies**
- **Never** store tokens in localStorage (XSS vulnerable)
- Implement refresh token rotation
- Use **RS256** (asymmetric) signing for production
- OAuth 2.1 requires **PKCE** for all client types

### Passkeys/WebAuthn (2025 Mainstream)
- NIST SP 800-63-4 recognizes synced passkeys as AAL2 authenticators
- Phishing-resistant
- Works with Face ID/Touch ID/Windows Hello
- **For new consumer apps: passkeys should be primary auth** with email/password as fallback

### Auth Provider Recommendations

| Provider | Best For |
|----------|----------|
| **Clerk** | React/Next.js (best DX) |
| **Auth0** | Broadest SDK coverage (45+ libraries) |
| **WorkOS** | B2B SaaS enterprise SSO |
| **Auth.js** | Open-source Next.js native auth |

## CI/CD with GitHub Actions

```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - uses: actions/cache@v4
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
      - run: npm ci
      - run: npm test
      - run: npm run build
```

### Security Best Practices
- Pin actions to **full SHA hashes** (not tags)
- Use `permissions` key for minimum required tokens
- Use `concurrency` to prevent race conditions
- Caching reduces build times **50-80%**

### Environment Promotion
dev → staging → production
- Automated gates
- Manual approvals for production

## Docker Best Practices

```dockerfile
# Multi-stage build
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app
COPY --from=build /app/dist ./dist
CMD ["node", "dist/index.js"]
```

**Key practices:**
- Use **multi-stage builds**
- Use minimal base images (`-slim` or Alpine)
- Order instructions from least-to-most frequently changed
- Run as **non-root** user
- Use `.dockerignore` to exclude `.git`, `node_modules`
- Scan images with Trivy, Grype, or Docker Scout
- Define `HEALTHCHECK` for production

## Deployment Platform Comparison

| Platform | Best For | Key Advantage |
|----------|----------|---------------|
| **Vercel** | Frontend/Next.js | Git-push deploy, global CDN, edge functions |
| **Railway** | Full-stack startups | Best DX, managed DBs, templates |
| **Fly.io** | Global low-latency | Edge VMs, multi-region |
| **AWS (ECS/Lambda)** | Enterprise | Broadest service catalog |
| **GCP (Cloud Run)** | Container apps | Scale-to-zero, clear pricing |

**Recommended pattern:**
Vercel (frontend) → Railway/Render (API) → Fly.io (globally distributed)

### Deployment Strategies

| Strategy | When to Use |
|----------|-------------|
| **Rolling updates** | Routine bug fixes (zero additional infra) |
| **Canary** | Major feature releases (5→25→50→100% with monitoring) |
| **Blue-green** | Critical security patches (instant switch, 2× infra) |

## Testing Strategies

### Testing Pyramid
- **Unit tests** ~70% (fast, cheap)
- **Integration tests** ~20% (API endpoints, DB interactions)
- **E2E tests** ~10% (real user journeys, slowest)

Avoid "ice cream cone" anti-pattern (too many E2E, too few unit)

### Tools

**Unit Testing:**
- Jest or Vitest (JavaScript)
- pytest (Python)
- Mock external dependencies only
- **Coverage target: 80%** (focus on critical business logic)

**Integration Testing:**
- supertest (Node.js) or httpx (Python) for API endpoints
- Testcontainers for disposable DB instances

**E2E: Playwright vs Cypress (2025)**
- **Playwright** leads for: cross-browser, CI/CD performance (35-45% faster), multi-tab/domain
- **Cypress** excellent for local development DX
- Playwright surpassed Cypress in npm downloads (June 2024)

### What to Test
✅ Business logic, edge cases, error handling, API contracts, critical user flows, security-sensitive code

❌ Framework internals, trivial getters/setters, third-party libraries, implementation details, CSS styling

## Performance Optimization

### Core Web Vitals Targets (2025)
- **LCP** ≤ 2.5s (loading)
- **INP** ≤ 200ms (responsiveness - replaced FID March 2024)
- **CLS** ≤ 0.1 (visual stability)

### Priority Optimization Order
1. React Compiler
2. Code splitting
3. Image optimization
4. Proper state architecture
**Delivers 60-80% of gains**

### Frontend Optimizations
- Lazy load routes and heavy components
- Serve images in WebP/AVIF with `<picture>`
- Use `<link rel="preload">` for hero images/fonts
- Break long JavaScript tasks (>50ms) into smaller chunks

### Backend Optimizations
- Redis/Memcached for caching
- Proper indexing and `EXPLAIN ANALYZE`
- Connection pooling
- Structured logging

## Observability Stack

### Budget-Friendly
**Prometheus** (metrics) + **Grafana** (dashboards) + **Sentry** (errors) ≈ **$26/mo**
vs. Datadog at $500+/mo

### OpenTelemetry
Vendor-neutral instrumentation standard

### Four Pillars
1. **Metrics** (numeric measurements)
2. **Events** (discrete occurrences)
3. **Logs** (timestamped records)
4. **Traces** (end-to-end request flow)

### Logging Best Practices
- Use JSON structured format
- Consistent fields (timestamp, level, service, request_id, message)
- Attach correlation IDs across services
- **Never log passwords, tokens, or PII**

## Security - OWASP Top 10:2025

### New Entries
- **A03: Software Supply Chain Failures** (highest exploit/impact)
- **A10: Mishandling of Exceptional Conditions**
- **A01: Broken Access Control** (remains #1)

### Essential Protections

**SQL Injection:**
- Always use parameterized queries/prepared statements
- ORMs parameterize by default

**XSS (Cross-Site Scripting):**
- Content Security Policy (most effective defense)
- Disable inline JavaScript (`script-src 'self'`)
- Auto-escape template output (React does by default)
- Sanitize with DOMPurify

**CSRF:**
- SameSite cookies + CSRF tokens
- Modern frameworks include built-in protection

**Supply Chain:**
- Pin all dependencies with lockfiles and integrity hashes
- Use Dependabot/Renovate for automated updates
- Run `npm audit` in every CI build
- Consider Socket.dev for malicious package detection

### Security Headers (Must-Have)

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Secret Management
- **Never hardcode secrets**
- `.env` files (gitignored) for development
- Vault solutions (HashiCorp Vault, AWS Secrets Manager) for production
- Rotate secrets regularly

## Troubleshooting

### Frontend Debugging

**React Performance:**
- Use React DevTools Profiler
- Check for unnecessary re-renders (missing React.memo or proper keys)
- Verify expensive calculations use useMemo
- React 19 Compiler resolves most memoization issues automatically

**State Management Bugs:**
- **Zustand**: Ensure selectors specific (`s => s.count` not `useStore()`)
- **Context**: Split by update frequency if consumers re-render excessively
- **TanStack Query**: Stale data = incorrect cache key configuration

### Backend Debugging

**N+1 Query Detection:**
- Enable query logging (`log_min_duration_statement = 1000` in PostgreSQL)
- Use `EXPLAIN ANALYZE`
- Prisma: use `include` for eager loading
- Drizzle: use explicit JOINs

**Connection Pool Exhaustion:**
- Monitor with `pg_stat_activity`
- Set appropriate `max` connections
- Use PgBouncer in transaction mode

**Memory Leaks in Node.js:**
- Use `--inspect` flag and Chrome DevTools Memory tab
- Common causes: unclosed event listeners, global caches without TTL, retained closures

### Deployment Issues

**Docker Container Crashes:**
- Check logs: `docker logs <container>`
- Verify health checks
- Ensure non-root user has file permissions
- Watch for OOM kills (set memory limits explicitly)

**CI/CD Failures:**
- Pin action versions to SHA hashes
- Verify lock file hashes match
- Flaky tests: isolate test databases, avoid time-dependent assertions

### Security Incident Response

**Dependency Vulnerability:**
- `npm audit fix` for auto-fixable
- Evaluate severity with CVSS score
- Critical/High: fix immediately
- Medium/Low: schedule for next sprint

**Leaked Secrets:**
- Immediately rotate all affected credentials
- Audit access logs
- Add pre-commit hooks (`git-secrets`, `detect-secrets`)

## Development Stack (2025 Recommended)

### Frontend
Next.js 15 + React 19 + TypeScript + Tailwind CSS + Zustand + TanStack Query + React Hook Form + Zod

### Backend
Node.js (Express/Fastify) or Python (FastAPI)

### Database
PostgreSQL + Prisma/Drizzle + Redis

### Auth
Clerk or Auth.js

### Testing
Vitest (unit) + Playwright (E2E) + Testing Library (components)

### CI/CD
GitHub Actions

### Deploy
Vercel (frontend) + Railway/Fly.io (backend)

### Monitoring
Sentry (errors) + Prometheus + Grafana

## Security Tools

- **npm audit / pip audit**: Run on every CI build
- **Dependabot / Renovate**: Automated dependency updates
- **Snyk**: Deep vulnerability scanning
- **Trivy / Docker Scout**: Container image scanning
- **helmet.js**: Express security headers middleware
- **Socket.dev**: Malicious package detection

## Kubernetes Essentials for Developers

### Core Concepts
- **Pods**: Smallest unit
- **Deployments**: Manage replicas/updates
- **Services**: Stable networking
- **Ingress**: External HTTP routing
- **ConfigMaps/Secrets**: Externalized config

### Key Commands
```bash
kubectl get pods
kubectl apply -f <file>
kubectl scale deployment
kubectl logs
```

### Helm Charts
Package configs into reusable templates

### Rolling Updates
Default zero-downtime strategy

## Infrastructure as Code

### Terraform
- Declarative, cloud-agnostic
- Largest ecosystem
- HCL syntax

### Pulumi
- Real programming languages (Python, TypeScript, Go)
- Teams preferring traditional code

**Both support:**
- Multi-cloud
- Version-controlled infrastructure
- Drift detection

## Quick-Start Security Checklist

1. ✅ Enable HTTPS + HSTS on all environments
2. ✅ Set CSP, X-Content-Type-Options, X-Frame-Options headers
3. ✅ Use parameterized queries for all database access
4. ✅ Validate and sanitize all user input server-side
5. ✅ Run dependency scanning in CI (`npm audit`)
6. ✅ Enable automated dependency updates (Dependabot)
7. ✅ Store secrets in vault/env vars, never in code
8. ✅ Set secure cookie flags (HttpOnly, Secure, SameSite)
9. ✅ Implement rate limiting on all APIs
10. ✅ Set up error tracking (Sentry) and structured logging
11. ✅ Scan Docker images for vulnerabilities
12. ✅ Run containers as non-root users
13. ✅ Pin all dependency and base image versions
14. ✅ Use PKCE for all OAuth flows
