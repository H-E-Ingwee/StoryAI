# StoryAI - Complete Setup Guide

## 📋 What You've Just Built

You have a **production-ready monorepo scaffold** for StoryAI with:

- ✅ **Backend**: NestJS with TypeScript, Prisma ORM, PostgreSQL
- ✅ **Frontend**: Next.js 14, React 19, Tailwind CSS, shadcn/ui
- ✅ **Database**: Comprehensive Prisma schema with 15+ models
- ✅ **Auth**: JWT-based authentication with password hashing
- ✅ **Project Structure**: Clean separation of concerns across packages

---

## 🚀 Quick Start

### 1. **Install Dependencies**

```bash
# Install pnpm if you don't have it
npm install -g pnpm@8

# Install all dependencies in the monorepo
pnpm install
```

### 2. **Setup Database**

```bash
# Copy environment file
cp .env.example .env.local

# Generate Prisma Client
pnpm db:generate

# Run migrations
pnpm db:migrate

# (Optional) Seed test data
pnpm db:seed
```

**Important**: Edit `.env.local` and set `DATABASE_URL`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/storyai_dev"
```

You can use:
- **Supabase** (free tier, https://supabase.com)
- **Neon** (free PostgreSQL, https://neon.tech)
- **Local PostgreSQL** (docker run -d -e POSTGRES_PASSWORD=password -p 5432:5432 postgres)

### 3. **Generate JWT Secret**

```bash
# Generate a secure JWT secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Add to .env.local
```

### 4. **Run Development Servers**

```bash
# Start both frontend and backend in parallel
pnpm dev

# Or run individually:
# Backend:  pnpm --filter=@storyai/api dev
# Frontend: pnpm --filter=@storyai/web dev
```

Access:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

---

## 📁 Project Structure

```
storyai/
├── apps/
│   ├── web/              # Next.js frontend
│   │   ├── src/app       # App router pages
│   │   ├── src/components
│   │   └── src/lib       # Utilities, API client
│   │
│   └── api/              # NestJS backend
│       ├── src/auth      # Authentication
│       ├── src/projects  # Projects management
│       ├── src/auth      # Auth services
│       └── src/common    # Shared utilities
│
├── packages/
│   ├── db/               # Prisma schema & migrations
│   └── types/            # Shared TypeScript types
│
└── docs/                 # Documentation
```

---

## 🔐 Environment Variables

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-a-secret>
```

**Backend (.env.local)**:
```env
DATABASE_URL=postgresql://...
JWT_SECRET=<generate-a-secret>
JWT_EXPIRATION=24h
API_PORT=3001
NODE_ENV=development
```

---

## 🛠️ Key Commands

```bash
# Development
pnpm dev                 # Start all apps
pnpm dev --filter=@storyai/api    # Backend only
pnpm dev --filter=@storyai/web    # Frontend only

# Building
pnpm build               # Build all apps
pnpm build --filter=@storyai/web

# Linting & Formatting
pnpm lint                # Run ESLint
pnpm format              # Format with Prettier

# Database
pnpm db:generate         # Generate Prisma client
pnpm db:migrate          # Run migrations
pnpm db:migrate:deploy   # Deploy migrations (production)
pnpm db:seed             # Seed test data
pnpm db:studio           # Open Prisma Studio

# Testing
pnpm test                # Run all tests
```

---

## 📚 API Documentation

### **Auth Endpoints**

```bash
# Register
POST /auth/register
{
  "email": "user@example.com",
  "username": "newuser",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}

# Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

# Get Profile
GET /auth/profile
Headers: Authorization: Bearer <token>

# Logout
POST /auth/logout
Headers: Authorization: Bearer <token>
```

### **Project Endpoints**

```bash
# Create Project
POST /projects
{
  "title": "My Storyboard",
  "description": "A creative project"
}

# List Projects
GET /projects

# Get Project
GET /projects/:id

# Update Project
PUT /projects/:id
{
  "title": "Updated Title",
  "status": "IN_PROGRESS"
}

# Delete Project
DELETE /projects/:id
```

Swagger docs available at: `http://localhost:3001/api/docs`

---

## 🎯 Next Steps (Build Roadmap)

### Phase 3: Core Features
- [ ] **Scripts Module**: Upload & parse screenplay text
- [ ] **Scenes**: Create and organize scenes
- [ ] **Frames**: Create frames with shot type suggestions
- [ ] **Prompts**: Generate and edit AI prompts

### Phase 4: AI Integration
- [ ] **Image Generation**: Integrate Replicate API
- [ ] **Prompt Enhancement**: Style presets and cinematic prompting
- [ ] **Generation Jobs**: Track long-running tasks
- [ ] **AsyncGenerationService**: WebSocket support for progress

### Phase 5: Consistency & Polish
- [ ] **Character Profiles**: Save and reuse character references
- [ ] **Style Locks**: Maintain visual consistency
- [ ] **Export**: PDF and image sheet exports
- [ ] **UI Refinement**: Storyboard board layout with drag-and-drop

---

## 🧪 Test the Setup

### Test Backend

```bash
# Terminal 1: Start backend
pnpm --filter=@storyai/api dev

# Terminal 2: Test with curl
curl http://localhost:3001/health

# Register user
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPass123!"
  }'
```

### Test Frontend

```bash
# Terminal 1: Start frontend
pnpm --filter=@storyai/web dev

# Visit http://localhost:3000
# - You should see landing page
# - Sign up a test account
# - Access the dashboard
```

---

## 🐳 Docker Setup (Optional)

If you prefer Docker:

```bash
# Start PostgreSQL
docker run -d \
  --name storyai-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=storyai_dev \
  -p 5432:5432 \
  postgres:15

# Update .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/storyai_dev"

# Run migrations
pnpm db:migrate
```

---

## 📊 Database Models Overview

- **User**: Authentication & profiles
- **Project**: Storyboard projects
- **Scene**: Script scenes
- **Frame**: Individual storyboard frames
- **PromptVersion**: AI prompt versions for each frame
- **GeneratedAsset**: Images generated by AI
- **GenerationJob**: Async job tracking
- **CharacterProfile**: Reusable character references
- **LocationProfile**: Reusable location references
- **StylePreset**: Reusable art style presets
- **ReferenceImage**: Image library
- **ExportRecord**: Export history

See full schema: `packages/db/prisma/schema.prisma`

---

## 🔧 Troubleshooting

### Port 3000/3001 Already In Use

```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Database Connection Error

```bash
# Verify DATABASE_URL in .env.local
# Test connection
pnpm db:studio
```

### Prisma Client Not Generated

```bash
pnpm install
pnpm db:generate
```

---

## 📖 Resources

- **Next.js Docs**: https://nextjs.org/docs
- **NestJS Docs**: https://docs.nestjs.com
- **Prisma Docs**: https://www.prisma.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

---

## 🎨 Architecture Decisions

### Why NestJS?
- Strong typing with TypeScript
- Built-in dependency injection
- Modular structure scales well
- Great for team projects

### Why Turborepo?
- Monorepo simplifies local development
- Shared types prevent drift
- Single deployment artifact possible
- Easy to split into separate repos later

### Why Prisma?
- Type-safe database
- Easy migrations
- Superior DX over any other ORM
- Great for rapid development

---

## 🚀 Production Deployment

### Frontend (Vercel)
```bash
vercel deploy --prod
```

### Backend (Railway/Render)
Point repository to Railway/Render dashboard

### Database
Use Supabase/Neon managed PostgreSQL

See: `DEPLOYMENT.md` (to be created)

---

## 📝 Next Development Focus

After you get familiar with this setup, work on:

1. **Script Parser**: Parse screenplay text into scenes
2. **Frame Generation**: Create frames UI with prompt builder
3. **Image Generation**: Wire up Replicate API
4. **Storyboard Board**: Drag-and-drop frame arrangement
5. **Export Pipeline**: PDF + image sheet generation

---

## 💡 Tips for Development

- Use Prisma Studio for database inspection: `pnpm db:studio`
- Check Swagger API docs at `/api/docs` during development
- Keep components small and modular (shadcn/ui philosophy)
- Use React Query for data fetching (configured in frontend)
- Test API endpoints with Swagger before frontend integration

---

**Happy coding! 🎉 You now have a solid foundation for StoryAI!**

If you encounter issues, check the individual app README files (apps/web/README.md, apps/api/README.md).
