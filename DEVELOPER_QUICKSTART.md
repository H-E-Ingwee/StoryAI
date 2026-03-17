# Developer Quick Start - StoryAI

Fast reference for developers joining the StoryAI team.

## 📦 Prerequisites

- **Node.js**: 18+ (check with `node --version`)
- **pnpm**: 8+ (install with `npm install -g pnpm@8`)
- **Git**: Latest version
- **PostgreSQL** or Supabase account (for database)

## ⚡ 5-Minute Setup

```bash
# 1. Clone and navigate
git clone https://github.com/H-E-Ingwee/StoryAI.git
cd StoryAI

# 2. Install dependencies (fast with pnpm)
pnpm install

# 3. Setup environment
cp .env.example .env.local

# Now edit .env.local - most important: DATABASE_URL
# Get database URL from:
# - Supabase: https://supabase.com (free tier)
# - Neon: https://neon.tech (free Postgres)
# - Local: Start Postgres and use connection string

# 4. Initialize database
pnpm db:generate
pnpm db:migrate

# 5. Start all apps
pnpm dev

# Applications now running:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# API Docs: http://localhost:3001/api/docs
```

## 📁 Quick Navigation

| What | Where | See Also |
|------|-------|----------|
| Frontend code | `apps/web/src/` | Next.js 14 patterns |
| Backend code | `apps/api/src/` | NestJS patterns |
| Database schema | `packages/db/prisma/schema.prisma` | Prisma docs |
| Shared types | `packages/types/src/index.ts` | API contracts |
| Setup all details | `SETUP_GUIDE.md` | Environment details |
| Status & roadmap | `IMPLEMENTATION_STATUS.md` | What to work on |

## 🎯 First Task Options

### Pick One to Get Started:

1. **Backend Easy** - Complete Scenes CRUD
   - File: `apps/api/src/scenes/scenes.service.ts`
   - Reference: `apps/api/src/projects/` (already done)

2. **Frontend Easy** - Create Scenes List Page
   - File: `apps/web/src/app/projects/[id]/scenes/page.tsx`
   - Use React Query for data fetching

3. **Full-Stack Medium** - Script Upload Endpoint
   - Backend: `apps/api/src/scripts/`
   - Frontend: Form in project workspace

4. **Integration Hard** - Replicate API Integration
   - Environment: Add `REPLICATE_API_TOKEN`
   - File: `apps/api/src/generation/`

## 🔐 Key Commands

```bash
# Development
pnpm dev                          # Start all
pnpm --filter=@storyai/api dev   # Backend only
pnpm --filter=@storyai/web dev   # Frontend only

# Database
pnpm db:generate                  # Regenerate Prisma client
pnpm db:migrate                   # Run pending migrations
pnpm db:migrate dev               # Create new migration (after schema change)
pnpm db:studio                    # Open Prisma visual UI
pnpm db:seed                      # Seed test data (when implemented)

# Quality
pnpm lint                         # Run linter
pnpm format                       # Format code with Prettier
pnpm test                         # Run tests

# Building
pnpm build                        # Build all apps
```

## 🏗️ Architecture at a Glance

```
User Request
    ↓
Next.js Frontend (http://localhost:3000)
    • React components + Tailwind
    • API calls via axios client
    ↓
NestJS Backend (http://localhost:3001)
    • Express under the hood
    • Module-based structure
    • JWT authentication
    ↓
PostgreSQL Database
    • 15+ tables via Prisma
    • Type-safe queries
    • Migrations tracked
```

## 📝 TypeScript Pattern

Both frontend and backend use TypeScript. Key files:

```typescript
// types/index.ts defines shared types
import type { Project, Frame, PromptVersion } from '@storyai/types'

// Backend uses these for responses
// Frontend uses these for API calls
```

## 🚨 Common Issues (Quick Fix)

| Issue | Fix |
|-------|-----|
| Port 3000/3001 in use | `lsof -ti:3000 \| xargs kill -9` |
| "Cannot find Prisma client" | `pnpm db:generate` |
| Database connection error | Check `DATABASE_URL` in `.env.local` |
| Modules not found | `pnpm install` - pnpm handles monorepo |
| TypeScript errors | Check `tsconfig.json` paths |

## 🧪 Testing Your Setup

```bash
# Test backend
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}

# Test API with auth
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"test","password":"Test123!"}'

# Test frontend
# Visit http://localhost:3000 - should show landing page
```

## 📚 Additional Resources

- **Full Setup**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **What's Built**: [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **NestJS Docs**: https://docs.nestjs.com
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

## 💬 Getting Help

1. Check the relevant doc (Setup/Status/Architecture)
2. Look at reference implementations (Projects module in backend)
3. Check Swagger docs at `/api/docs` (if backend running)
4. Use Prisma Studio: `pnpm db:studio`

---

**Ready?** Pick a task above and start building! 🚀
