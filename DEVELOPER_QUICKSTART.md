# StoryAI Developer Quick Start

_Quick reference guide for developers and contributors_

---

## Installation (5 minutes)

```bash
# 1. Clone/navigate to project
cd c:\Users\HP\Documents\GitHub\StoryAI

# 2. Install dependencies
npm install

# 3. Create .env
cp .env.example .env

# 4. Start backend
npm start
# or for development with hot reload:
npm run dev

# 5. Open frontend
# Visit: http://localhost:3000/dashboard.html
```

---

## Project Structure

```
┌─ server.js           Entry point (load .env, require app.js, listen)
├─ app.js              Express setup, middleware, route mounting
├─ config/
│  └─ database.js      Sequelize instance, multi-dialect support
├─ models/             Data schemas (User, Project, Scene, Frame, Prompt)
├─ controllers/        Business logic (create, read, update, delete)
├─ routes/             Route handlers (mount controllers)
├─ middlewares/        JWT verification
├─ assets/
│  ├─ js/
│  │  └─ app-full-stack.js    🔥 Main frontend integration
│  ├─ css/
│  ├─ images/
│  └─ icons/
├─ login.html, signup.html, dashboard.html, workspace.html
└─ .env, package.json
```

---

## Key Files

### `app-full-stack.js` (1000+ lines)
**The MAIN integration file. All frontend-backend communication goes here.**

Contains:
- `apiCall(endpoint, method, body)` - Generic fetch wrapper with Bearer token
- Auth: `register()`, `login()`, `logout()`
- Projects: `createProject()`, `getProjects()`, `updateProject()`, `deleteProject()`
- Scenes: `createScene()`, `getScenes()`, `updateScene()`, `deleteScene()`
- Frames: `createFrame()`, `getFrames()`, `updateFrame()`, `deleteFrame()`
- UI: `initDashboard()`, `initWorkspace()`

**If you need to:**
- Add a new API call → Add function here
- Change how dashboard renders → Update `initDashboard()`
- Change workspace behavior → Update `initWorkspace()`
- Fix API errors → Check error handling in `apiCall()`

---

## Common Tasks

### 1. Add a New API Endpoint

**Example: Set project status to active/draft**

```javascript
// 1. Update database model (models/project.model.js)
// ✓ Already has 'status' field

// 2. Add in controller (controllers/project.controller.js)
exports.updateProjectStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const project = await Project.findByPk(id);
    if (!project) return res.status(404).json({ message: "Not found" });
    
    project.status = status;
    await project.save();
    res.json(project);
  } catch (error) {
    next(error);
  }
};

// 3. Add route (routes/project.routes.js)
router.patch("/:id/status", authenticate, updateProjectStatus);

// 4. Update app.js if needed
// ✓ Route already mounted

// 5. Add to frontend (assets/js/app-full-stack.js)
async function updateProjectStatus(projectId, status) {
  return apiCall(`/projects/${projectId}/status`, "PATCH", { status });
}

// 6. Use in dashboard
await updateProjectStatus(projectId, "completed");
await initDashboard(); // Refresh list
```

### 2. Deploy to Production

```bash
# 1. Install PostgreSQL on target server
# 2. Create database: createdb storyai

# 3. Update .env for production
PORT=3000
JWT_SECRET=very_long_random_secret_key_min_32_chars
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=storyai
DB_USER=postgres
DB_PASS=password

# 4. Start backend
npm install --production
npm start

# 5. Use reverse proxy (nginx)
# Point domain to localhost:3000
```

### 3. Debug API Issues

```javascript
// In app.js, add logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// In controller, log before/after queries
console.log("Fetching projects for user:", req.user.id);
const projects = await Project.findAll({ where: { userId: req.user.id } });
console.log("Found:", projects.length);

// In frontend, check network tab in DevTools
// Look for: Status 200 vs 401 vs 500
```

### 4. Add a New Database Field

```javascript
// 1. Modify model (models/project.model.js)
const Project = sequelize.define("Project", {
  title: DataTypes.STRING,
  genre: DataTypes.STRING,
  status: DataTypes.STRING,
  rating: DataTypes.FLOAT,  // NEW FIELD
  // ... other fields
});

// 2. Restart server (auto-syncs database)
npm start

// 3. Update API response (automatically included)
// projects will now have rating field

// 4. Update frontend to use new field
// In app-full-stack.js renderProjects():
// Add: <span>${project.rating} ⭐</span>
```

### 5. Test Login Flow

```bash
# 1. Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"pass123"}'

# Save token from response

# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'

# Save NEW token

# 3. Create project (requires token)
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","genre":"Drama","status":"active"}'

# 4. Verify database
sqlite3 storyai_dev.sqlite
> SELECT * FROM "Users";
> SELECT * FROM "Projects";
```

---

## Debugging Tips

### Backend Issues

```javascript
// Check database connection
// In app.js:
sequelize.authenticate().then(() => {
  console.log("✓ Database connected");
}).catch(err => {
  console.error("✗ Database error:", err);
});

// Check routes registered
// Run: curl http://localhost:3000/api/health
// Should return: {"status":"ok","uptime":xxx}

// Check middleware order
// In app.js, log all requests:
app.use((req, res, next) => {
  console.log(new Date(), req.method, req.path, req.headers.authorization);
  next();
});
```

### Frontend Issues

```javascript
// In browser DevTools Console:

// Check if token exists
localStorage.getItem('token')

// Check if API call made
// Network tab → filter by "projects" → check Status

// Check if page initialized
console.log('Dashboard initialized:', allProjects)

// Make manual API call
fetch('/api/projects', {
  headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
})
.then(r => r.json())
.then(data => console.log(data))
```

---

## Environment Variables

### Development (.env)
```env
PORT=3000
JWT_SECRET=storyai_super_secret
DB_DIALECT=sqlite
DB_STORAGE=storyai_dev.sqlite
```

### Production (.env)
```env
PORT=3000
JWT_SECRET=use_a_very_long_random_key_generated_with_openssl_rand
DB_DIALECT=postgres
DB_HOST=db.example.com
DB_PORT=5432
DB_NAME=storyai
DB_USER=storyai_user
DB_PASS=secure_password
NODE_ENV=production
```

### Generate Strong Secret
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows PowerShell:
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -Count 32 | ForEach-Object {[char]$_}) -join ''))
```

---

## Database Queries

### Check Users
```sql
sqlite> SELECT * FROM "Users";
```

### Check Projects for User
```sql
sqlite> SELECT * FROM "Projects" WHERE "userId" = 'user-uuid-here';
```

### Check Scenes for Project
```sql
sqlite> SELECT * FROM "Scenes" WHERE "projectId" = 'project-uuid-here';
```

### Delete Project (cascades to scenes/frames)
```sql
sqlite> DELETE FROM "Projects" WHERE id = 'project-uuid-here';
```

### Connect to SQLite
```bash
sqlite3 storyai_dev.sqlite
```

---

## Performance Monitoring

### Add to app.js
```javascript
// Response time logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`SLOW: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  next();
});

// Endpoint metrics
const metrics = {};
app.use((req, res, next) => {
  const key = `${req.method} ${req.path}`;
  metrics[key] = (metrics[key] || 0) + 1;
  next();
});
app.get('/metrics', (req, res) => res.json(metrics));
```

---

## Security Checklist

- [ ] JWT_SECRET is strong (min 32 chars)
- [ ] Passwords hashed with bcrypt (salt rounds ≥ 10)
- [ ] Protected routes verify authentication
- [ ] No sensitive data in logs
- [ ] CORS configured (not wildcard in production)
- [ ] SQL injection impossible (using Sequelize ORM)
- [ ] HTTPS enabled (in production)
- [ ] No API keys in code (use .env)
- [ ] Rate limiting on auth endpoints
- [ ] CSRF protection on forms

---

## Dependencies

```json
{
  "express": "REST framework",
  "sequelize": "Database ORM",
  "sqlite3": "Local database",
  "pg": "PostgreSQL support",
  "bcrypt": "Password hashing",
  "jsonwebtoken": "JWT tokens",
  "dotenv": "Environment variables",
  "cors": "Cross-origin requests",
  "multer": "File uploads (prepared)"
}
```

---

## Next Features to Build

**Priority 1:**
- [ ] Test end-to-end flow (register → project → scene → frame)
- [ ] Frame visual rendering in workspace
- [ ] Delete frame functionality

**Priority 2:**
- [ ] Prompt builder UI integration
- [ ] AI image generation integration
- [ ] Pagination on project/scene lists

**Priority 3:**
- [ ] PDF export
- [ ] Storyboard board view
- [ ] Drag-and-drop reordering
- [ ] Character management

---

## Quick Commands

```bash
# Start development server (auto-reload)
npm run dev

# Start production server
npm start

# Check database
sqlite3 storyai_dev.sqlite ".tables"

# Check running processes
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process on port 3000
kill -9 $(lsof -t -i :3000)  # macOS/Linux
taskkill /PID 1234 /F  # Windows (replace 1234)

# Test API endpoint
curl -X GET http://localhost:3000/api/health

# Watch logs
tail -f nohup.out  # After running: nohup npm start > nohup.out 2>&1 &

# Restart server gracefully
pm2 restart app  # If using PM2 process manager
```

---

## Useful Resources

- [Express Docs](https://expressjs.com/)
- [Sequelize ORM](https://sequelize.org/docs/v6/getting-started/)
- [JWT Debugger](https://jwt.io/)
- [Postman API Testing](https://www.postman.com/)
- [Bootstrap 5 Components](https://getbootstrap.com/docs/5.0/components)

---

## Questions?

1. **Server won't start?** → Check `.env` exists with PORT=3000
2. **API returns 401?** → Check Bearer token in Authorization header
3. **Database errors?** → Delete `storyai_dev.sqlite` and restart
4. **Frontend blank?** → Check browser console for errors, verify `app-full-stack.js` loaded

---

**Happy coding! 🚀**  
*Remember: Small commits, clear messages, test before pushing*
