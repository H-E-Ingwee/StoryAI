# StoryAI System Architecture

System design for a modern, scalable storyboard generation platform.

## 🎯 High-Level Architecture

```
┌────────────────────────────────────────┐
│  Browser / Client                      │
│  Next.js 14 + React 19 + Tailwind CSS  │
└─────────────┬──────────────────────────┘
              │ HTTP JSON API (JWT Auth)
              ↓
┌────────────────────────────────────────┐
│  API Gateway / Backend                 │
│  NestJS + Express + TypeScript         │
│  ├─ Auth Module (JWT)                  │
│  ├─ Projects Module (CRUD)             │
│  ├─ Scenes Module                      │
│  ├─ Frames Module                      │
│  ├─ Prompts Module                     │
│  ├─ Generation Module (async jobs)     │
│  └─ Export Module                      │
└─────────────┬──────────────────────────┘
              │ Prisma ORM
              ↓
┌────────────────────────────────────────┐
│  Relational Database                   │
│  PostgreSQL with 15+ Models            │
└────────────────────────────────────────┘
              
              +  External Services
              ├─ Replicate (Image Generation)
              ├─ Supabase Storage (Files)
              └─ Anthropic/OpenAI (LLM)
```

## 🏗️ Project Structure

```
storyai/
├── apps/
│   ├── web/                    ← Next.js Frontend
│   │   ├── src/app/            ← Pages (app router)
│   │   ├── src/components/     ← React components
│   │   ├── src/lib/
│   │   │   ├── api-client.ts   ← Axios client
│   │   │   └── hooks/          ← React hooks
│   │   └── src/styles/         ← Tailwind + globals
│   │
│   └── api/                    ← NestJS Backend
│       ├── src/
│       │   ├── main.ts         ← Entry point
│       │   ├── app.module.ts   ← Root module
│       │   ├── common/         ← Shared
│       │   │   └── prisma/     ← DB service
│       │   ├── auth/           ← Login/register
│       │   ├── users/          ← User profiles
│       │   ├── projects/       ← Project CRUD
│       │   ├── scenes/         ← Scene parsing
│       │   ├── frames/         ← Frame management
│       │   ├── prompts/        ← AI prompts
│       │   ├── generation/     ← Image gen
│       │   ├── assets/         ← Image storage
│       │   ├── consistency/    ← Profiles
│       │   └── exports/        ← PDF/sheets
│       └── tsconfig.json
│
├── packages/
│   ├── db/
│   │   ├── prisma/
│   │   │   ├── schema.prisma   ← All models
│   │   │   └── migrations/     ← Schema history
│   │   └── package.json
│   │
│   └── types/
│       ├── src/index.ts        ← Shared types
│       └── package.json
│
├── turbo.json                  ← Build config
├── pnpm-workspace.yaml         ← Workspace
├── tsconfig.json               ← TypeScript
└── package.json                ← Root deps
```

## 📊 Database Schema (15 Models)

**Auth & Users:**
- User (email, username, passwordHash, profile)
- Session (tokens, expiry)

**Core Data:**
- Project (user's storyboard)
- ScriptDocument (raw script text)
- Scene (extracted from script)
- Frame (individual storyboard panel)

**AI & Generation:**
- PromptVersion (editable prompts)
- GeneratedAsset (image + metadata)
- GenerationJob (async task tracking)

**Consistency & Reference:**
- CharacterProfile (reusable characters)
- LocationProfile (reusable locations)
- StylePreset (reusable art styles)
- ReferenceImage (user's image library)

**Tracking:**
- ProjectHistory (changelog)
- ExportRecord (export artifacts)
- AuditLog (activity log)

## 🔐 Authentication Architecture

```
User Registration/Login
         ↓
POST /auth/register | /auth/login
         ↓
Backend validates email + password
         ↓
Generate JWT token (expires 24h)
         ↓
Store session in database
         ↓
Return { user, accessToken }
         ↓
Frontend stores token in localStorage
         ↓
All requests include:
Authorization: Bearer {token}
         ↓
Backend JwtStrategy validates
         ↓
If valid → Attach user to request
↓
If invalid → Return 401 → Redirect to login
```

## 🎯 Module Design Pattern

Each NestJS module follows:

```typescript
// module.ts - Dependency Injection Setup
@Module({
  imports: [PrismaModule, OtherModules],
  controllers: [Controller],
  providers: [Service],
  exports: [Service]
})

// service.ts - Business Logic & Authorization
@Injectable()
class Service {
  // Authorization checks here
  async create(userId, dto) {
    // Verify ownership/permissions
    // Execute business logic
    // Return result
  }
}

// controller.ts - HTTP Routes
@Controller('endpoint')
class Controller {
  @Post()
  @UseGuards(JwtGuard)
  async create(@Request() req, @Body() dto) {
    // Call service with userId
    // Service handles auth
  }
}
```

**Key Principle:** Authorization in SERVICE layer, not controller.

## 🔀 Request Flow Example

User creates frame:

```
1. UI submits form
   POST /frames body: {sceneId, frameNumber, title}

2. Controller receives
   @Post() @UseGuards(JwtGuard) create(@Request() req)
   - Guard checks JWT validity

3. Service processes
   FramesService.create(req.user.id, dto)
   - Verify user owns project
   - Create frame in database
   - Generate initial prompt

4. Response sent
   { frame: {...} }

5. UI updates
   React Query invalidates cache
   Component re-renders
```

## 🛡️ Security Measures

- 🔒 Passwords hashed with bcrypt (10 salt rounds)
- 🔒 JWT tokens with 24h expiry
- 🔒 Resource ownership verification in services
- 🔒 Input validation with Zod
- 🔒 CORS configured with Vercel domain
- 🔒 SQL injection prevented (Prisma ORM)
- 🔒 CSRF ready (future: CSRF tokens)

## 📈 Performance Considerations

- ✅ Database indexes on userId, projectId, status
- ✅ Prisma query optimization (select fields)
- ✅ Turborepo intelligent caching
- ✅ Next.js image optimization
- ✅ CDN for generated images (Supabase)
- 🔄 Redis caching (future)
- 🔄 Background job queue (future)

## 🚀 Deployment

```
Development:
  Frontend: localhost:3000 (Next.js dev)
  Backend: localhost:3001 (NestJS dev)

Production:
  Frontend: Vercel (auto-deploy on push)
  Backend: Railway or Render (Docker)
  Database: Supabase (managed PostgreSQL)
  Storage: Supabase Storage (CDN)
```

## 🔄 Async Operations (Future)

Long-running tasks use job queue pattern:

```
POST /generation/generate
  Returns: { job: { id, status: "QUEUED" } }
         ↓
Backend processes asynchronously
         ↓
GET /generation/jobs/{id}
  Returns: { status: "COMPLETED", imageUrl: "..." }
         ↓
Or: WebSocket for real-time updates
```

## 📚 Key Design Decisions

| Decision | Why |
|----------|-----|
| Monorepo | Shared types, unified dev |
| NestJS | Strong typing, modular, team-ready |
| Prisma | Type-safe ORM, migrations |
| Next.js | SSR/SSG, SEO, API routes |
| JWT | Stateless, scalable |
| Turborepo | Fast builds, caching |
| PostgreSQL | Relational data, ACID |

## 🎓 Learning Path for Developers

1. Understand monorepo: apps/web, apps/api, packages/
2. Read database schema: packages/db/prisma/schema.prisma
3. Study reference module: apps/api/src/projects/
4. Understand auth flow: apps/api/src/auth/
5. Add new endpoint following pattern
6. Wire frontend: apps/web/src/app/

## 🔗 Related Documentation

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Local setup
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - Roadmap
- [DEVELOPER_QUICKSTART.md](./DEVELOPER_QUICKSTART.md) - Dev reference

---

This architecture is designed to be professional, scalable, type-safe, and maintainable.
