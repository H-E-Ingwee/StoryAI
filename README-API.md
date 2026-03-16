# StoryAI - Full-Stack Storyboard & Concept Art Generation Platform

**A complete web-based system for transforming scripts into visual storyboards with AI-powered prompt generation and collaborative tools.**

---

## 🎨 Project Overview

StoryAI is a professional creative platform built for:
- **Independent filmmakers** planning visual direction
- **Students** creating storyboard projects  
- **Scriptwriters** visualizing scenes
- **Concept developers** organizing ideas into boards

**Current Stack:**
- Frontend: HTML5, CSS3, Vanilla JavaScript, Bootstrap 5
- Backend: Node.js + Express.js
- Database: SQLite (Sequelize ORM)
- Auth: JWT + bcrypt
- API: RESTful endpoints

---

## 🚀 Quick Start

### Prerequisites
- Node.js (16+)
- npm or yarn

### Installation

```bash
cd StoryAI
npm install
```

### Create Environment

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` if using PostgreSQL instead of SQLite:
```env
PORT=3000
JWT_SECRET=your_super_secret_key_here
DB_DIALECT=sqlite
DB_STORAGE=storyai_dev.sqlite
```

### Start Backend Server

```bash
npm start
# Or for development with auto-reload:
# npm install --save-dev nodemon
# npm run dev
```

Server runs on `http://localhost:3000`

### Access Frontend

Open in browser:
- **Home:** `http://localhost:3000/index.html`
- **Dashboard:** `http://localhost:3000/dashboard.html`
- **Workspace:** `http://localhost:3000/workspace.html`

---

## 📋 API Endpoints

### Authentication

#### Register New User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "Brian Ingwee",
  "email": "user@example.com",
  "password": "secretpassword"
}

Response: { user: {...}, token: "jwt_token_here" }
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secretpassword"
}

Response: { user: {...}, token: "jwt_token_here" }
```

#### Get Current User Profile
```
GET /api/auth/me
Authorization: Bearer {token}

Response: { user: {...} }
```

---

### Projects

#### Create Project
```
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Beneath the Silence",
  "genre": "Drama",
  "status": "active",  // draft, active, completed
  "scenes": 12,
  "frames": 36,
  "description": "A character-driven visual storytelling project..."
}

Response: { id, title, genre, status, scenes, frames, description, createdAt, ... }
```

#### Get All Projects
```
GET /api/projects
Authorization: Bearer {token}

Response: [{ id, title, genre, ... }, ...]
```

#### Get Project by ID
```
GET /api/projects/{projectId}
Authorization: Bearer {token}
```

#### Update Project
```
PUT /api/projects/{projectId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "completed",
  ...
}
```

#### Delete Project
```
DELETE /api/projects/{projectId}
Authorization: Bearer {token}
```

---

### Scenes

#### Create Scene
```
POST /api/scenes
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectId": "uuid",
  "title": "Scene 1 — Room at Night",
  "description": "Initial establishing moment"
}

Response: { id, projectId, title, description, order, createdAt, ... }
```

#### Get Scenes for Project
```
GET /api/scenes/project/{projectId}
Authorization: Bearer {token}
```

#### Update Scene
```
PUT /api/scenes/{sceneId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Scene Title",
  "description": "...",
  "order": 1
}
```

#### Delete Scene
```
DELETE /api/scenes/{sceneId}
Authorization: Bearer {token}
```

---

### Frames

#### Create Frame
```
POST /api/frames
Authorization: Bearer {token}
Content-Type: application/json

{
  "sceneId": "uuid",
  "title": "Opening Wide Shot",
  "prompt": "A young woman seated by a window in dim lighting...",
  "imageUrl": null
}

Response: { id, sceneId, title, prompt, imageUrl, order, createdAt, ... }
```

#### Get Frames for Scene
```
GET /api/frames/scene/{sceneId}
Authorization: Bearer {token}
```

#### Update Frame
```
PUT /api/frames/{frameId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Frame Title",
  "prompt": "Updated prompt text",
  "imageUrl": "https://...",
  "order": 0
}
```

#### Delete Frame
```
DELETE /api/frames/{frameId}
Authorization: Bearer {token}
```

---

## 📁 Project Structure

```
StoryAI/
├── server.js                 # Entry point
├── app.js                    # Express app setup
├── config/
│   └── database.js           # Sequelize config
├── models/
│   ├── user.model.js
│   ├── project.model.js
│   ├── scene.model.js
│   ├── frame.model.js
│   ├── prompt.model.js
│   └── index.js
├── controllers/
│   ├── auth.controller.js
│   ├── project.controller.js
│   ├── scene.controller.js
│   └── frame.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── project.routes.js
│   ├── scene.routes.js
│   └── frame.routes.js
├── middlewares/
│   └── auth.middleware.js
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app-full-stack.js # Complete API integration
│   │   ├── auth-service.js   # Auth utilities
│   │   └── app.js            # Legacy (keep for reference)
│   ├── images/
│   └── icons/
├── components/
│   ├── navbar.html
│   └── footer.html
├── *.html                    # Frontend pages
├── package.json
├── .env                      # Local environment (gitignored)
├── .env.example
└── README.md
```

---

## 🔑 Key Features Implemented

### ✅ Complete
- [x] User registration & login with JWT
- [x] Project CRUD (Create, Read, Update, Delete)
- [x] Scene management
- [x] Frame organization
- [x] Database schema & models
- [x] RESTful API endpoints
- [x] Frontend-backend integration
- [x] Responsive Bootstrap UI
- [x] Activity feed on dashboard
- [x] Project filtering & search

### 🔄 In Progress
- [ ] AI image generation integration (service layer ready)
- [ ] Prompt generation refinement
- [ ] Storyboard board view
- [ ] Drag-and-drop frame reordering
- [ ] Character/location preset management

### 📋 Planned
- [ ] Export to PDF
- [ ] Batch frame generation
- [ ] Collaboration & sharing
- [ ] Custom style presets
- [ ] Version history
- [ ] Comments & annotations
- [ ] Mobile app

---

## 🧪 Testing the System

### 1. Test Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Brian Ingwee",
    "email": "brian@storyai.com",
    "password": "TestPassword123"
  }'
```

**Expected Response:**
```json
{
  "user": { "id": "uuid", "name": "Brian Ingwee", "email": "brian@storyai.com" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 2. Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "brian@storyai.com",
    "password": "TestPassword123"
  }'
```

Save the returned `token` for subsequent requests.

### 3. Test Project Creation

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer {YOUR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Film",
    "genre": "Drama",
    "status": "active",
    "scenes": 5,
    "frames": 15,
    "description": "A beautiful story about connection"
  }'
```

### 4. Test through Dashboard UI

1. Open `http://localhost:3000/dashboard.html` (bypass login for testing)
2. Click "New Project"
3. Fill form and submit
4. See project appear in list (pulled from API)
5. Click "Open Project" to go to workspace

---

## 🔐 Authentication Flow

1. **Register/Login** → JWT token stored in localStorage
2. **API Calls** → Token sent in `Authorization: Bearer {token}` header
3. **Backend** → Middleware validates token, extracts user
4. **Protected Routes** → `GET /api/projects` only accessible with valid token

---

## 📦 Database Schema

### Users
```sql
CREATE TABLE "Users" (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)
```

### Projects
```sql
CREATE TABLE "Projects" (
  id UUID PRIMARY KEY,
  userId UUID NOT NULL REFERENCES "Users"(id),
  title VARCHAR(255) NOT NULL,
  genre VARCHAR(255),
  status VARCHAR(50),  -- draft, active, completed
  scenes INTEGER DEFAULT 0,
  frames INTEGER DEFAULT 0,
  description TEXT,
  createdAt TIMESTAMP
)
```

### Scenes
```sql
CREATE TABLE "Scenes" (
  id UUID PRIMARY KEY,
  projectId UUID NOT NULL REFERENCES "Projects"(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  "order" INTEGER DEFAULT 0
)
```

### Frames
```sql
CREATE TABLE "Frames" (
  id UUID PRIMARY KEY,
  sceneId UUID NOT NULL REFERENCES "Scenes"(id),
  title VARCHAR(255) NOT NULL,
  prompt TEXT,
  imageUrl VARCHAR(500),
  "order" INTEGER DEFAULT 0
)
```

---

## 🎯 Next Steps to Production

### Phase 3: AI Integration
1. Create `services/generation.service.js`
2. Add Stability AI / MidJourney / Replicate integration
3. Create `/api/generate` endpoint
4. Queue job system for batch generation

### Phase 4: Advanced Features
1. Storyboard board layout
2. Drag-and-drop reordering
3. Character & location management
4. Style preset system

### Phase 5: Export & Delivery
1. PDF generation (use `puppeteer` or `html2pdf`)
2. Image collage export
3. Presentation mode
4. Email sharing

### Phase 6: Deployment
1. Move to PostgreSQL on Render/Railway
2. Deploy frontend separately or via Express static
3. Set up CI/CD pipeline
4. Configure custom domain

---

## 🛠️ Development Tips

### Adding a New Feature

1. **API Endpoint**: Add route in `routes/`
2. **Controller Logic**: Implement in `controllers/`
3. **Database**: Update model if needed
4. **Frontend**: Add API call in `app-full-stack.js`
5. **UI**: Update HTML and add event listeners

### Example: Add Prompt API

```javascript
// routes/prompt.routes.js
router.post("/", authenticate, createPrompt);

// controllers/prompt.controller.js
exports.createPrompt = async (req, res, next) => {
  const { frameId, text, style } = req.body;
  const prompt = await Prompt.create({ frameId, text, style });
  res.status(201).json(prompt);
};

// app-full-stack.js
async function createPrompt(promptData) {
  return apiCall("/prompts", "POST", promptData);
}
```

### Running in Development Mode

```bash
npm install --save-dev nodemon
npm run dev
# Auto-restarts server on file changes
```

---

## 🚨 Troubleshooting

### Backend won't start
- Check `.env` file exists with `PORT=3000`
- Ensure SQLite file is writable
- Try: `rm storyai_dev.sqlite && npm start`

### Login fails
- Verify email/password in request
- Check database has user record
- Check JWT_SECRET in `.env`

### API returns 401
- Verify token is sent in `Authorization` header
- Token format should be: `Bearer {token}`
- Token may have expired (7 day expiry)

### Dashboard shows no projects
- Verify you're logged in (check localStorage for token)
- Create a new project via API or form
- Check browser console for errors

---

## 📚 Learning Resources

- [Express.js Docs](https://expressjs.com/)
- [Sequelize ORM](https://sequelize.org/)
- [JWT Auth](https://jwt.io/)
- [Bootstrap 5](https://getbootstrap.com/)

---

## 📄 License

ISC - See LICENSE file

---

## 👤 Created By

**H-E-Ingwee** for NuruLife Productions  
*Shining Light, Transforming Lives through Story*

**Current Version:** 0.1.0 MVP  
**Last Updated:** March 17, 2026

---

## ✨ What to Build Next

1. **Try the system:** Register → Create project → Add scenes → View workspace
2. **Test API:** Use curl or Postman with examples above
3. **Add AI:** Implement Stability AI or Replicate integration
4. **Refine UI:** Polish workspace frame layout
5. **Deploy:** Get it live on Railway or Render

**Happy creating!** 🎬✨
