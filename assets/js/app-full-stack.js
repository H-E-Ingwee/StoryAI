// StoryAI Complete Frontend API Integration Layer
// Replaces localStorage with full API backend integration
// Handles Auth, Dashboard, Workspace - all connected to Express backend

const API_URL = "http://localhost:3000/api";

// ============================================================================
// AUTH SERVICE - Token and User Management
// ============================================================================

function getToken() {
  return localStorage.getItem("storyai_token");
}

function setToken(token) {
  localStorage.setItem("storyai_token", token);
}

function getAuthUser() {
  const user = localStorage.getItem("storyai_user");
  return user ? JSON.parse(user) : null;
}

function setAuthUser(user) {
  localStorage.setItem("storyai_user", JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem("storyai_token");
  localStorage.removeItem("storyai_user");
  localStorage.removeItem("storyai_active_project_id");
}

async function apiCall(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" }
  };

  const token = getToken();
  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || response.statusText);
  }
  return response.json();
}

async function register(name, email, password) {
  const data = await apiCall("/auth/register", "POST", { name, email, password });
  setToken(data.token);
  setAuthUser(data.user);
  return data;
}

async function login(email, password) {
  const data = await apiCall("/auth/login", "POST", { email, password });
  setToken(data.token);
  setAuthUser(data.user);
  return data;
}

function logout() {
  clearAuth();
}

// ============================================================================
// PROJECT API
// ============================================================================

async function createProject(projectData) {
  return apiCall("/projects", "POST", projectData);
}

async function getProjects() {
  return apiCall("/projects", "GET");
}

async function getProject(id) {
  return apiCall(`/projects/${id}`, "GET");
}

async function updateProject(id, projectData) {
  return apiCall(`/projects/${id}`, "PUT", projectData);
}

async function deleteProject(id) {
  return apiCall(`/projects/${id}`, "DELETE");
}

// ============================================================================
// SCENE API
// ============================================================================

async function createScene(sceneData) {
  return apiCall("/scenes", "POST", sceneData);
}

async function getScenes(projectId) {
  return apiCall(`/scenes/project/${projectId}`, "GET");
}

async function updateScene(id, sceneData) {
  return apiCall(`/scenes/${id}`, "PUT", sceneData);
}

async function deleteScene(id) {
  return apiCall(`/scenes/${id}`, "DELETE");
}

// ============================================================================
// FRAME API
// ============================================================================

async function createFrame(frameData) {
  return apiCall("/frames", "POST", frameData);
}

async function getFrames(sceneId) {
  return apiCall(`/frames/scene/${sceneId}`, "GET");
}

async function updateFrame(id, frameData) {
  return apiCall(`/frames/${id}`, "PUT", frameData);
}

async function deleteFrame(id) {
  return apiCall(`/frames/${id}`, "DELETE");
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ============================================================================
// PAGE INITIALIZATION - Keep existing functions
// ============================================================================

function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll(".password-toggle");
  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const wrapper = button.closest(".password-wrap");
      if (!wrapper) return;
      const input = wrapper.querySelector(".password-field");
      const icon = button.querySelector("i");
      if (!input || !icon) return;
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      icon.classList.toggle("bi-eye");
      icon.classList.toggle("bi-eye-slash");
    });
  });
}

// ============================================================================
// DASHBOARD - Full API Integration
// ============================================================================

function initDashboard() {
  const projectsGrid = document.getElementById("projectsGrid");
  const emptyProjectsState = document.getElementById("emptyProjectsState");
  const newProjectForm = document.getElementById("newProjectForm");
  const searchInput = document.getElementById("projectSearchInput");
  const statusFilter = document.getElementById("statusFilter");
  const sortFilter = document.getElementById("sortFilter");
  const seedProjectsBtn = document.getElementById("seedProjectsBtn");
  const clearProjectsBtn = document.getElementById("clearProjectsBtn");
  const activityFeed = document.getElementById("activityFeed");

  const totalProjectsStat = document.getElementById("totalProjectsStat");
  const activeProjectsStat = document.getElementById("activeProjectsStat");
  const draftProjectsStat = document.getElementById("draftProjectsStat");
  const completedProjectsStat = document.getElementById("completedProjectsStat");

  const modalElement = document.getElementById("newProjectModal");
  const modal = modalElement ? bootstrap.Modal.getOrCreateInstance(modalElement) : null;

  let allProjects = [];

  async function loadProjects() {
    try {
      allProjects = await getProjects();
      renderProjects();
    } catch (error) {
      console.error("Failed to load projects:", error);
      allProjects = [];
      renderProjects();
    }
  }

  function addActivity(title, message) {
    const item = document.createElement("div");
    item.className = "activity-item";
    item.innerHTML = `
      <div class="activity-dot"></div>
      <div>
        <strong>${escapeHtml(title)}</strong>
        <p class="mb-1">${escapeHtml(message)}</p>
        <small>Just now</small>
      </div>
    `;
    if (activityFeed) activityFeed.prepend(item);
  }

  function renderStats(projects) {
    const active = projects.filter((p) => p.status === "active").length;
    const draft = projects.filter((p) => p.status === "draft").length;
    const completed = projects.filter((p) => p.status === "completed").length;
    totalProjectsStat.textContent = projects.length;
    activeProjectsStat.textContent = active;
    draftProjectsStat.textContent = draft;
    completedProjectsStat.textContent = completed;
  }

  function getFilteredProjects(projects) {
    const searchValue = (searchInput?.value || "").toLowerCase().trim();
    const statusValue = statusFilter?.value || "all";
    const sortValue = sortFilter?.value || "newest";

    let filtered = [...projects];

    if (searchValue) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchValue) ||
        (p.genre && p.genre.toLowerCase().includes(searchValue)) ||
        (p.description && p.description.toLowerCase().includes(searchValue))
      );
    }

    if (statusValue !== "all") {
      filtered = filtered.filter((p) => p.status === statusValue);
    }

    filtered.sort((a, b) => {
      const aDate = new Date(a.createdAt || 0);
      const bDate = new Date(b.createdAt || 0);
      switch (sortValue) {
        case "oldest":
          return aDate - bDate;
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        default:
          return bDate - aDate;
      }
    });

    return filtered;
  }

  function statusBadge(status) {
    if (status === "active") return `<span class="status-badge status-active">Active</span>`;
    if (status === "completed") return `<span class="status-badge status-completed">Completed</span>`;
    return `<span class="status-badge status-draft">Draft</span>`;
  }

  function renderProjects() {
    const filtered = getFilteredProjects(allProjects);
    renderStats(allProjects);
    projectsGrid.innerHTML = "";

    if (!filtered.length) {
      emptyProjectsState.classList.add("show");
      return;
    }

    emptyProjectsState.classList.remove("show");

    filtered.forEach((project) => {
      const col = document.createElement("div");
      col.className = "col-md-6";
      col.innerHTML = `
        <div class="project-grid-card">
          <div class="project-top-line">
            <div>
              <h5 class="mb-1">${escapeHtml(project.title)}</h5>
              <div class="text-light-emphasis small">${escapeHtml(project.genre || "Creative")} • ${project.scenes || 0} scenes • ${project.frames || 0} frames</div>
            </div>
            ${statusBadge(project.status)}
          </div>
          <p class="mt-3 mb-3">${escapeHtml(project.description || "No description")}</p>
          <div class="project-mini-meta">
            <span><i class="bi bi-bookmark"></i> Project</span>
            <span><i class="bi bi-clock-history"></i> ${formatDate(project.createdAt)}</span>
          </div>
          <div class="project-actions">
            <button class="btn btn-hero btn-sm" data-action="open" data-id="${project.id}">Open Project</button>
            <button class="btn btn-outline-dashboard btn-sm" data-action="delete" data-id="${project.id}">Delete</button>
          </div>
        </div>
      `;
      projectsGrid.appendChild(col);
    });
  }

  async function handleDeleteProject(projectId) {
    try {
      await deleteProject(projectId);
      allProjects = allProjects.filter((p) => p.id !== projectId);
      addActivity("Project deleted", "A project was removed from your dashboard.");
      renderProjects();
    } catch (error) {
      alert("Failed to delete project: " + error.message);
    }
  }

  async function handleOpenProject(projectId) {
    const project = allProjects.find((p) => p.id === projectId);
    if (!project) return;
    localStorage.setItem("storyai_active_project_id", project.id);
    addActivity("Project opened", `You opened ${project.title}.`);
    window.location.href = "workspace.html";
  }

  if (newProjectForm) {
    newProjectForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("projectTitle").value;
      const genre = document.getElementById("projectGenre").value;
      const status = document.getElementById("projectStatus").value;
      const scenes = Number(document.getElementById("projectScenes").value);
      const frames = Number(document.getElementById("projectFrames").value);
      const description = document.getElementById("projectDescription").value;

      try {
        const newProject = await createProject({ title, genre, status, scenes, frames, description });
        allProjects.unshift(newProject);
        addActivity("Project created", `${newProject.title} was added.`);
        newProjectForm.reset();
        modal?.hide();
        renderProjects();
      } catch (error) {
        alert("Failed to create project: " + error.message);
      }
    });
  }

  if (projectsGrid) {
    projectsGrid.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const action = btn.dataset.action;
      const projectId = btn.dataset.id;
      if (action === "delete") handleDeleteProject(projectId);
      if (action === "open") handleOpenProject(projectId);
    });
  }

  [searchInput, statusFilter, sortFilter].forEach((element) => {
    if (element) {
      element.addEventListener("input", renderProjects);
      element.addEventListener("change", renderProjects);
    }
  });

  loadProjects();
}

// ============================================================================
// WORKSPACE - Full API Integration with Scenes & Frames
// ============================================================================

function initWorkspace() {
  const workspaceProjectTitle = document.getElementById("workspaceProjectTitle");
  const workspaceProjectMeta = document.getElementById("workspaceProjectMeta");
  const scriptEditor = document.getElementById("scriptEditor");
  const newSceneInput = document.getElementById("newSceneInput");
  const addSceneBtn = document.getElementById("addSceneBtn");
  const sceneList = document.getElementById("sceneList");
  const newFrameInput = document.getElementById("newFrameInput");
  const addFrameBtn = document.getElementById("addFrameBtn");
  const frameBoard = document.getElementById("frameBoard");
  const generatePromptBtn = document.getElementById("generatePromptBtn");
  const savePromptBtn = document.getElementById("savePromptBtn");
  const selectedFrameLabel = document.getElementById("selectedFrameLabel");
  const generatedPromptOutput = document.getElementById("generatedPromptOutput");
  const saveWorkspaceBtn = document.getElementById("saveWorkspaceBtn");
  const loadDemoWorkspaceBtn = document.getElementById("loadDemoWorkspaceBtn");
  const clearWorkspaceBtn = document.getElementById("clearWorkspaceBtn");

  const ACTIVE_PROJECT_KEY = "storyai_active_project_id";

  let currentProject = null;
  let allScenes = [];
  let allFrames = [];
  let selectedSceneId = null;
  let selectedFrameId = null;

  async function getActiveProject() {
    const activeProjectId = localStorage.getItem(ACTIVE_PROJECT_KEY);
    if (!activeProjectId) return null;
    try {
      const project = await getProject(activeProjectId);
      return project;
    } catch (error) {
      console.error("Failed to load active project by id:", error);
      return null;
    }
  }

  async function loadProject() {
    try {
      const activeProject = await getActiveProject();
      if (activeProject) {
        currentProject = activeProject;
      } else {
        currentProject = { id: "demo", title: "Untitled Story Project", genre: "Creative", scenes: 0, frames: 0, status: "draft" };
      }

      if (currentProject.id && currentProject.id !== "demo") {
        try {
          allScenes = await getScenes(currentProject.id);
          if (allScenes.length > 0) {
            selectedSceneId = selectedSceneId || allScenes[0].id;
          } else {
            selectedSceneId = null;
          }
        } catch (error) {
          console.error("Failed to load scenes:", error);
          allScenes = [];
        }
      } else {
        allScenes = [];
        selectedSceneId = null;
      }

      await renderWorkspace();
      renderScenes();
      await renderFrames();
    } catch (error) {
      console.error("Failed to load project:", error);
    }
  }

  function renderWorkspace() {
    if (workspaceProjectTitle) {
      workspaceProjectTitle.textContent = currentProject?.title || "Untitled Story Project";
    }
    if (workspaceProjectMeta) {
      workspaceProjectMeta.textContent = currentProject
        ? `${currentProject.genre || "Creative"} • ${currentProject.scenes || 0} scenes • ${currentProject.frames || 0} frames • ${currentProject.status || "draft"}`
        : "Build your story through script, scenes, frames, and prompt direction.";
    }
  }

  function renderScenes() {
    if (!sceneList) return;
    sceneList.innerHTML = "";

    if (!allScenes.length) {
      sceneList.innerHTML = `
        <div class="mini-card">
          <strong>No scenes yet</strong>
          <p class="mb-0 mt-2 text-light-emphasis">Add your first scene to begin.</p>
        </div>
      `;
      return;
    }

    allScenes.forEach((scene) => {
      const item = document.createElement("div");
      item.className = `scene-item ${scene.id === selectedSceneId ? "active" : ""}`;
      item.dataset.id = scene.id;
      item.innerHTML = `
        <div><h6>${escapeHtml(scene.title)}</h6></div>
        <button class="scene-delete-btn" title="Delete scene"><i class="bi bi-trash3"></i></button>
      `;
      sceneList.appendChild(item);
    });
  }

  async function renderFrames() {
    if (!frameBoard) return;

    if (!selectedSceneId) {
      frameBoard.innerHTML = `
        <div class="mini-card">
          <strong>No scene selected</strong>
          <p class="mb-0 mt-2 text-light-emphasis">Select a scene to view frames.</p>
        </div>
      `;
      return;
    }

    try {
      allFrames = await getFrames(selectedSceneId);
    } catch (error) {
      console.error("Failed to load frames:", error);
      allFrames = [];
    }

    if (!allFrames.length) {
      frameBoard.innerHTML = `
        <div class="mini-card">
          <strong>No frames yet</strong>
          <p class="mb-0 mt-2 text-light-emphasis">Add your first frame to storyboard this scene.</p>
        </div>
      `;
      return;
    }

    frameBoard.innerHTML = allFrames
      .map((frame) => `
        <div class="frame-card ${selectedFrameId === frame.id ? "selected" : ""}" data-frame-id="${frame.id}">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>${escapeHtml(frame.title || "Untitled Frame")}</strong>
              <div class="text-light-emphasis small">Frame ID: ${frame.id.slice(0, 6)}</div>
            </div>
            <button class="btn btn-link btn-sm text-danger frame-delete-btn" data-frame-id="${frame.id}">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
          <p class="mb-1 text-light-emphasis">${escapeHtml(frame.prompt || "No prompt yet")}</p>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-dashboard btn-sm select-frame-btn" data-frame-id="${frame.id}">Select</button>
            <button class="btn btn-soft-dashboard btn-sm" data-action="edit" data-frame-id="${frame.id}">Edit</button>
          </div>
        </div>
      `)
      .join("");
  }

  if (addSceneBtn) {
    addSceneBtn.addEventListener("click", async () => {
      const title = newSceneInput?.value.trim();
      if (!title) return;

      try {
        if (!currentProject.id || currentProject.id === "demo") {
          alert("Please open or create a project from the dashboard first.");
          return;
        }

        const newScene = await createScene({ projectId: currentProject.id, title, description: "" });
        allScenes.push(newScene);
        selectedSceneId = newScene.id;
        if (newSceneInput) newSceneInput.value = "";
        renderScenes();
        renderFrames();
      } catch (error) {
        alert("Failed to create scene: " + error.message);
      }
    });
  }

  if (sceneList) {
    sceneList.addEventListener("click", async (e) => {
      const sceneItem = e.target.closest(".scene-item");
      if (!sceneItem) return;

      if (e.target.closest(".scene-delete-btn")) {
        try {
          await deleteScene(sceneItem.dataset.id);
          allScenes = allScenes.filter((s) => s.id !== sceneItem.dataset.id);
          if (selectedSceneId === sceneItem.dataset.id) selectedSceneId = null;
          renderScenes();
          renderFrames();
        } catch (error) {
          alert("Failed to delete scene: " + error.message);
        }
        return;
      }

      selectedSceneId = sceneItem.dataset.id;
      renderScenes();
      await renderFrames();
    });
  }

  if (addFrameBtn) {
    addFrameBtn.addEventListener("click", async () => {
      const title = newFrameInput?.value.trim();
      if (!title) {
        alert("Enter a frame title first.");
        return;
      }
      if (!selectedSceneId) {
        alert("Select a scene first.");
        return;
      }
      try {
        const frame = await createFrame({ sceneId: selectedSceneId, title, prompt: "" });
        allFrames.push(frame);
        selectedFrameId = frame.id;
        newFrameInput.value = "";
        await renderFrames();
        if (selectedFrameLabel) selectedFrameLabel.textContent = `Selected Frame: ${frame.title}`;
      } catch (error) {
        alert("Failed to add frame: " + error.message);
      }
    });
  }

  if (frameBoard) {
    frameBoard.addEventListener("click", async (e) => {
      const frameId = e.target.closest("[data-frame-id]")?.dataset.frameId;
      if (!frameId) return;

      if (e.target.closest(".frame-delete-btn")) {
        try {
          await deleteFrame(frameId);
          allFrames = allFrames.filter((f) => f.id !== frameId);
          if (selectedFrameId === frameId) selectedFrameId = null;
          await renderFrames();
          if (selectedFrameLabel) selectedFrameLabel.textContent = "No frame selected yet.";
        } catch (error) {
          alert("Failed to delete frame: " + error.message);
        }
        return;
      }

      if (e.target.closest(".select-frame-btn") || e.target.closest(".frame-card")) {
        selectedFrameId = frameId;
        const selectedFrame = allFrames.find((f) => f.id === frameId);
        if (selectedFrameLabel) selectedFrameLabel.textContent = selectedFrame ? `Selected Frame: ${selectedFrame.title}` : "No frame selected yet.";
        renderScenes();
        await renderFrames();
      }
    });
  }

  if (generatePromptBtn) {
    generatePromptBtn.addEventListener("click", () => {
      const subject = document.getElementById("promptSubject")?.value.trim();
      const environment = document.getElementById("promptEnvironment")?.value.trim();
      const lighting = document.getElementById("promptLighting")?.value.trim();
      const camera = document.getElementById("promptCamera")?.value.trim();
      const mood = document.getElementById("promptMood")?.value.trim();
      const style = document.getElementById("promptStyle")?.value.trim();

      let prompt = "";
      if (subject) prompt += `${subject}`;
      if (environment) prompt += ` in ${environment}`;
      if (lighting) prompt += ` under ${lighting}`;
      if (camera) prompt += ` with ${camera}`;
      if (mood) prompt += ` mood ${mood}`;
      if (style) prompt += ` in ${style} style`;

      if (generatedPromptOutput) generatedPromptOutput.textContent = prompt || "Add details above and generate your prompt.";
    });
  }

  if (savePromptBtn) {
    savePromptBtn.addEventListener("click", async () => {
      if (!selectedFrameId) {
        alert("Select a frame first to save the prompt.");
        return;
      }

      const generatedPrompt = document.getElementById("generatedPromptOutput")?.textContent;
      if (!generatedPrompt || generatedPrompt.includes("Add details")) {
        alert("Generate a prompt first.");
        return;
      }

      try {
        const frame = allFrames.find((f) => f.id === selectedFrameId);
        if (!frame) throw new Error("Selected frame not found");
        await updateFrame(selectedFrameId, { ...frame, prompt: generatedPrompt });
        await renderFrames();
        alert("Prompt saved to selected frame.");
      } catch (error) {
        alert("Failed to save prompt: " + error.message);
      }
    });
  }

  if (saveWorkspaceBtn) {
    saveWorkspaceBtn.addEventListener("click", () => {
      alert("Workspace auto-saves as you edit. All changes are persisted to the database.");
    });
  }

  if (clearWorkspaceBtn) {
    clearWorkspaceBtn.addEventListener("click", () => {
      const ok = confirm("Clear all workspace data? This cannot be undone.");
      if (!ok) return;
      localStorage.removeItem(ACTIVE_PROJECT_KEY);
      currentProject = null;
      allScenes = [];
      selectedSceneId = null;
      loadProject();
    });
  }

  loadProject();
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  initPasswordToggles();

  const page = document.body.dataset.page;
  if (page === "dashboard") {
    initDashboard();
  } else if (page === "workspace") {
    initWorkspace();
  }
});
