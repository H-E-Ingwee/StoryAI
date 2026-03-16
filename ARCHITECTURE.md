# StoryAI Architecture & Technical Design

## System Overview

StoryAI is a **3-tier full-stack application** with clear separation of concerns:

```
┌─────────────────────────────┐
│   Frontend (Browser)        │
│  HTML + Bootstrap + JS      │
│   app-full-stack.js         │
└──────────────┬──────────────┘
               │ REST API
               │ JSON + JWT
┌──────────────▼──────────────┐
│   Backend (Express.js)      │
│  Routes → Controllers       │
│  Middleware (Auth)          │
└──────────────┬──────────────┘
               │ SQL Queries
               │ Sequelize ORM
┌──────────────▼──────────────┐
│   Database (SQLite/PG)      │
│  5 Tables with Relations    │
│  UUID Primary Keys          │
└─────────────────────────────┘
```

---

## Design Patterns

### 1. **MVC Architecture** (Backend)

**Model** → Database schema & validation (Sequelize models)  
**View** → JSON responses (handled by controllers)  
**Controller** → Business logic (validates, queries, returns data)

**File Organization:**
```
controllers/auth.controller.js   → register, login, profile
controllers/project.controller.js → CRUD for projects
controllers/scene.controller.js   → CRUD for scenes
controllers/frame.controller.js   → CRUD for frames

routes/auth.routes.js          → POST /auth/register, /auth/login
routes/project.routes.js       → GET /projects, POST /projects, etc.
routes/scene.routes.js         → GET /scenes/project/, POST, PUT, DELETE
routes/frame.routes.js         → GET /frames/scene/, POST, PUT, DELETE
```

### 2. **Layered API Pattern**

Each API call flows through distinct layers:

```
Request
   ↓
Routes (mount handlers)
   ↓
Middleware (verify JWT token)
   ↓
Controller (business logic, validation)
   ↓
Model (Sequelize query)
   ↓
Database (execute SQL)
   ↓
Response (JSON)
```

### 3. **Service Layer** (Frontend)

`app-full-stack.js` contains all API integration:
- Central `apiCall()` function (handles Bearer token injection, error handling)
- Auth functions: `login()`, `register()`, `logout()`
- Project functions: `getProjects()`, `createProject()`, etc.
- Scene functions: `getScenes()`, `createScene()`, etc.
- Frame functions: `getFrames()`, `createFrame()`, etc.

**Benefit:** Single point of concern for API communication

---

## Data Relationships

### Entity-Relationship Diagram

```
User (1) ──────→ (Many) Projects
         │
         └─→ Primary Key: id (UUID)
             Foreign Keys: None (top level)

Project (1) ──────→ (Many) Scenes
         │
         ├─ Primary Key: id (UUID)
         ├─ Foreign Key: userId → User.id
         └─ Cascade Delete: When User deleted, all Projects deleted

Scene (1) ──────→ (Many) Frames
      │
      ├─ Primary Key: id (UUID)
      ├─ Foreign Key: projectId → Project.id
      └─ Cascade Delete: When Project deleted, all Scenes deleted

Frame (1) ──────→ (Many) Prompts
      │
      ├─ Primary Key: id (UUID)
      ├─ Foreign Key: sceneId → Scene.id
      └─ Cascade Delete: When Scene deleted, all Frames deleted

Prompt
      │
      ├─ Primary Key: id (UUID)
      ├─ Foreign Key: frameId → Frame.id
      └─ Cascade Delete: When Frame deleted, all Prompts deleted
```

**Key Principle:** Hierarchy enforced by foreign keys + cascade deletes

---

## Authentication & Authorization

### JWT Token Flow

1. **User Registration**
   ```
   POST /api/auth/register
   { name, email, password }
   ↓
   Controller hashes password with bcrypt
   ↓
   Creates User record
   ↓
   Generates JWT token (sign with JWT_SECRET)
   ↓
   Returns { user, token }
   ↓
   Frontend stores token in localStorage
   ```

2. **User Login**
   ```
   POST /api/auth/login
   { email, password }
   ↓
   Controller finds user by email
   ↓
   Verifies password with bcrypt.compare()
   ↓
   Generates new JWT token
   ↓
   Returns { user, token }
   ```

3. **Protected API Calls**
   ```
   GET /api/projects
   Header: Authorization: Bearer eyJhbGc...
   ↓
   Middleware extracts token
   ↓
   Verifies signature with JWT_SECRET
   ↓
   Attaches user to request.user
   ↓
   Controller accesses req.user.id for ownership checks
   ↓
   Returns only data owned by authenticated user
   ```

### Token Security

- **Secret:** Stored in `.env` (never committed to git)
- **Expiry:** None set (stateless, but consider adding 7-day expiry in production)
- **Transport:** HTTPS only (enable in production)
- **Storage:** localStorage (consider httpOnly cookies in production)

---

## API Response Format

All responses follow consistent JSON structure:

### Success Response
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "uuid",
  "title": "My Project",
  "genre": "Drama",
  "status": "active",
  "scenes": 5,
  "frames": 15,
  "description": "...",
  "createdAt": "2025-03-17T10:30:00.000Z",
  "updatedAt": "2025-03-17T10:30:00.000Z"
}
```

### Error Response
```json
{
  "message": "User not authenticated",
  "status": 401,
  "error": { ... }
}
```

---

## Middleware Stack

```
Express Setup
   ↓
cors() → Allow cross-origin requests
   ↓
express.json() → Parse JSON bodies
   ↓
express.static() → Serve HTML/CSS/JS
   ↓
Routes mounted
   ├─ /api/auth/... → authenticate OPTIONAL on login/register
   ├─ /api/projects → authenticate REQUIRED (middleware)
   ├─ /api/scenes → authenticate REQUIRED
   ├─ /api/frames → authenticate REQUIRED
   │
   └─ Each protected route:
      ├─ Runs auth.middleware.js
      ├─ Checks Authorization header
      ├─ Verifies JWT signature
      ├─ Attaches user to req
      └─ Passes to controller
   ↓
Error handler (catches all errors, returns 500)
```

---

## Database Configuration

### Development (SQLite)
```javascript
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'storyai_dev.sqlite'
});
```

**Pros:**
- No server needed
- File-based (easy to backup)
- Perfect for local development
- Zero configuration

**Cons:**
- Doesn't scale to multiple servers
- Limited concurrency
- 5 MB typical project size limit

### Production (PostgreSQL)
```javascript
const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  dialect: 'postgres'
});
```

**Pros:**
- Enterprise-grade reliability
- Horizontal scaling
- ACID compliance
- Advanced features (full-text search, JSON columns, etc.)

**Cons:**
- Requires hosted database
- Higher costs
- More configuration needed

---

## Frontend Architecture

### app-full-stack.js Structure

```javascript
// 1. Token Management
getToken()        // Retrieve from localStorage
setToken(token)   // Save to localStorage
clearAuth()       // Logout

// 2. Generic API Wrapper
apiCall(endpoint, method, body)
  ├─ Add Authorization header (Bearer token)
  ├─ Send request
  ├─ Parse response
  ├─ Handle errors with user alerts
  └─ Return JSON

// 3. Auth Service
register(name, email, password)    // POST /auth/register
login(email, password)             // POST /auth/login
logout()                           // Remove token

// 4. Project Service
getProjects()                      // GET /projects
createProject(data)                // POST /projects
updateProject(id, data)            // PUT /projects/:id
deleteProject(id)                  // DELETE /projects/:id

// 5. Scene Service
getScenes(projectId)               // GET /scenes/project/:projectId
createScene(projectId, title)      // POST /scenes
updateScene(id, data)              // PUT /scenes/:id
deleteScene(id)                    // DELETE /scenes/:id

// 6. Frame Service
getFrames(sceneId)                 // GET /frames/scene/:sceneId
createFrame(sceneId, title)        // POST /frames
updateFrame(id, data)              // PUT /frames/:id
deleteFrame(id)                    // DELETE /frames/:id

// 7. UI Initialization
initDashboard()
  ├─ Load all projects from /api/projects
  ├─ Render project grid
  ├─ Setup filtering/sorting/search
  ├─ Setup event listeners for create/delete/open
  └─ Show activity feed

initWorkspace()
  ├─ Get active project from localStorage
  ├─ Load scenes from /api/scenes/project/:id
  ├─ Render scene list
  ├─ Setup scene create/delete
  ├─ Load frames when scene selected
  ├─ Render frame board
  └─ Setup frame operations
```

### Frontend Storage Strategy

**localStorage:**
```javascript
localStorage.token          // JWT token (for API auth)
localStorage.activeProject  // { id, title } of selected project
```

**State Management:**
```javascript
allProjects = []   // Loaded from /api/projects
allScenes = []     // Loaded from /api/scenes/project/:id
allFrames = []     // Loaded from /api/frames/scene/:id
selectedSceneId    // Currently selected scene
```

---

## Error Handling

### Backend Error Flow
```
try {
  // Fetch from database
  const project = await Project.findByPk(id);
  if (!project) {
    return res.status(404).json({ message: "Not found" });
  }
  res.json(project);
} catch (error) {
  next(error);  // Pass to error handler middleware
}
```

### Frontend Error Handling
```javascript
async apiCall(endpoint, method = "GET", body = null) {
  try {
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${data.message}`);
    }
    
    return response.json();
  } catch (error) {
    // Show alert to user
    alert(`Error: ${error.message}`);
    // Log for debugging
    console.error('API Error:', error);
    throw error;
  }
}
```

---

## Deployment Checklist

### Before Production

- [ ] Switch to PostgreSQL database
- [ ] Set strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS/TLS
- [ ] Set NODE_ENV=production
- [ ] Use environment variables for all secrets
- [ ] Enable CORS only for trusted domains
- [ ] Add request rate limiting
- [ ] Set up database backups
- [ ] Configure health monitoring
- [ ] Add logging service
- [ ] Run security audit (`npm audit`)
- [ ] Set up CI/CD pipeline
- [ ] Test end-to-end on staging

### Infrastructure Options

**Option 1: Render.com**
- Deploy backend as Web Service
- PostgreSQL hosted
- ~$12/month
- Auto SSL

**Option 2: Railway.app**
- Single project deployment
- PostgreSQL addon
- ~$5-10/month
- Dashboard UI excellent

**Option 3: AWS/Heroku**
- Most control
- Highest complexity
- Enterprise features
- $25+/month

---

## Performance Considerations

### Current Bottlenecks
1. N+1 queries (scenes loaded per project)
2. No pagination on project/scene lists
3. No caching on API responses
4. Large image uploads unoptimized

### Optimization Timeline

**Short-term (Sprint 1):**
- Add pagination (20 projects per page)
- Implement eager loading in Sequelize
- Add response caching headers

**Medium-term (Sprint 2):**
- Redis caching layer
- Image CDN (Cloudinary, AWS S3)
- Database indexing on userId, projectId, sceneId
- API response compression

**Long-term (Sprint 3):**
- GraphQL instead of REST
- Real-time WebSocket for collaborative editing
- Read replicas for scaling

---

## Testing Strategy

### Unit Tests (Controllers)
```javascript
describe('projectController', () => {
  it('should create project for authenticated user', async () => {
    const req = { user: { id: userId }, body: {...} };
    const res = { status: () => ({json: ()=>{}}) };
    await createProject(req, res);
  });
});
```

### Integration Tests (API Endpoints)
```javascript
describe('POST /api/projects', () => {
  it('should return 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/projects')
      .expect(401);
  });
});
```

### E2E Tests (Workflows)
```javascript
describe('User Workflow', () => {
  it('should register → create project → add scene → add frame', async () => {
    // 1. Register
    // 2. Create project
    // 3. Add scene
    // 4. Add frame
    // 5. Verify in database
  });
});
```

---

## Future Architecture Considerations

### Phase 2: AI Integration
```
Frame Created
   ↓
Save to database
   ↓
Queue to job processor
   ↓
Call AI API (Stability, MidJourney, etc)
   ↓
Store image URL
   ↓
Notify frontend (WebSocket)
```

### Phase 3: Real-time Collaboration
```
User A edits scene
   ↓
Emit via WebSocket
   ↓
Broadcast to User B
   ↓
Update UI in real-time
```

### Phase 4: Microservices
```
API Server (Node/Express)
   ├─ Job Queue (Bull/RabbitMQ)
   ├─ Image Generation Service (Python/FastAPI)
   ├─ PDF Export Service (Node)
   └─ Analytics Service (Segment)
```

---

## Code Quality Guidelines

### Naming Conventions
- **Files:** camelCase (e.g., `projectController.js`)
- **Functions:** camelCase (e.g., `createProject()`)
- **Variables:** camelCase (e.g., `userId`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `JWT_SECRET`)
- **Database tables:** PascalCase (e.g., `Projects`)
- **Database columns:** snake_case (e.g., `created_at`)

### Code Organization
- **Route files:** Mount routes and middleware
- **Controller files:** Business logic, validation, responses
- **Model files:** Schema definition, hooks, methods
- **Utility files:** Helpers, constants, shared logic

### Comment Standards
```javascript
// X - Good: Explains why, not what
// Cascade delete on project to clean up orphaned scenes
router.delete("/:id", deleteProject);

// X - Bad: Restates code
// Delete the project by id
router.delete("/:id", deleteProject);
```

---

**Version:** 0.1.0 MVP  
**Last Updated:** March 17, 2026
