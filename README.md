# StoryAI - AI-Powered Storyboard & Concept Art Generator

Transform scripts into stunning storyboards and concept art with AI-powered image generation.

## 🎯 Quick Links

- **Setup Guide**: [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Local development setup
- **Status & Roadmap**: [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - What's built & what's next
- **API Docs**: http://localhost:3001/api/docs (when running)

## ⚡ Quick Start (5 Minutes)

```bash
# 1. Install dependencies
pnpm install

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local and set DATABASE_URL

# 3. Setup database
pnpm db:generate
pnpm db:migrate

# 4. Start development
pnpm dev

# 5. Access
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# API Docs: http://localhost:3001/api/docs
```

## 📁 Project Structure

```
storyai/
├── apps/
│   ├── web/              # Next.js frontend
│   │   ├── src/app/      # Pages (app router)
│   │   ├── src/components/
│   │   └── src/lib/      # Utilities, API client
│   │
│   └── api/              # NestJS backend
│       ├── src/auth/     # Authentication
│       ├── src/projects/ # Projects management
│       └── src/common/   # Shared services
│
├── packages/
│   ├── db/               # Prisma schema & migrations
│   └── types/            # Shared TypeScript types
│
└── docs/                 # Documentation
```

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | NestJS, TypeScript, Prisma ORM |
| Database | PostgreSQL (Supabase/Neon/local) |
| Auth | JWT with password hashing |
| Storage | Supabase Storage (for images) |
| Image Generation | Replicate API |
| Deployment | Vercel (frontend), Railway (backend), Supabase (database) |

## 🚀 Core Features (Planned)

- ✅ User authentication & project management
- 🔄 Script parsing and scene extraction
- 🎬 AI-powered image generation with visual consistency
- 📸 Storyboard board layout with drag-and-drop
- 🎨 Character profiles and style presets
- 📤 Export to PDF and image sheets

## 📚 Documentation

- **For Setup**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **For Development**: See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)
- **API Reference**: Available at `/api/docs` when backend is running
- **Database Schema**: See `packages/db/prisma/schema.prisma`

## 🔐 Environment Variables

Required (see `.env.example` for full list):
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `NEXT_PUBLIC_API_URL` - Backend API URL

## 🤝 Development

### Working on Backend
```bash
pnpm --filter=@storyai/api dev
```

### Working on Frontend
```bash
pnpm --filter=@storyai/web dev
```

### Database Commands
```bash
pnpm db:generate    # Generate Prisma client
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Prisma UI
pnpm db:seed        # Seed test data
```

## 📊 Current Status

**Phase 1 Complete** ✅
- Monorepo setup with Turborepo
- Database schema designed
- Backend auth & projects API
- Frontend landing page & dashboard

**Phase 2 In Progress**
- Scenes & Frames CRUD
- Script parsing
- Image generation integration

## 💡 Next Steps

See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for detailed roadmap.

## 🐛 Troubleshooting

For common issues and solutions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md#troubleshooting).

## 📜 License

MIT - See LICENSE file

---

**Questions?** Check the documentation or see [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for details.
