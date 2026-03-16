console.log("StoryAI frontend loaded successfully.");

document.addEventListener("DOMContentLoaded", () => {
  initPasswordToggles();

  const page = document.body.dataset.page;
  if (page === "dashboard") {
    initDashboard();
  }
});

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

function initDashboard() {
  const STORAGE_KEY = "storyai_projects";

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

  function getProjects() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  }

  function saveProjects(projects) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }

  function addActivity(title, message) {
    const timeLabel = "Just now";
    const item = document.createElement("div");
    item.className = "activity-item";
    item.innerHTML = `
      <div class="activity-dot"></div>
      <div>
        <strong>${escapeHtml(title)}</strong>
        <p class="mb-1">${escapeHtml(message)}</p>
        <small>${timeLabel}</small>
      </div>
    `;

    if (activityFeed) {
      activityFeed.prepend(item);
    }
  }

  function createProjectObject(formData) {
    return {
      id: crypto.randomUUID(),
      title: formData.get("title")?.trim() || "",
      genre: formData.get("genre")?.trim() || "",
      status: formData.get("status") || "draft",
      scenes: Number(formData.get("scenes") || 0),
      frames: Number(formData.get("frames") || 0),
      tag: formData.get("tag")?.trim() || "Creative Project",
      description: formData.get("description")?.trim() || "",
      createdAt: new Date().toISOString()
    };
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
      filtered = filtered.filter((project) => {
        return (
          project.title.toLowerCase().includes(searchValue) ||
          project.genre.toLowerCase().includes(searchValue) ||
          project.description.toLowerCase().includes(searchValue) ||
          project.tag.toLowerCase().includes(searchValue)
        );
      });
    }

    if (statusValue !== "all") {
      filtered = filtered.filter((project) => project.status === statusValue);
    }

    filtered.sort((a, b) => {
      switch (sortValue) {
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "newest":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  }

  function statusBadge(status) {
    if (status === "active") {
      return `<span class="status-badge status-active">Active</span>`;
    }
    if (status === "completed") {
      return `<span class="status-badge status-completed">Completed</span>`;
    }
    return `<span class="status-badge status-draft">Draft</span>`;
  }

  function renderProjects() {
    const projects = getProjects();
    const filteredProjects = getFilteredProjects(projects);

    renderStats(projects);
    projectsGrid.innerHTML = "";

    if (!filteredProjects.length) {
      emptyProjectsState.classList.add("show");
      return;
    }

    emptyProjectsState.classList.remove("show");

    filteredProjects.forEach((project) => {
      const col = document.createElement("div");
      col.className = "col-md-6";

      col.innerHTML = `
        <div class="project-grid-card">
          <div class="project-top-line">
            <div>
              <h5 class="mb-1">${escapeHtml(project.title)}</h5>
              <div class="text-light-emphasis small">${escapeHtml(project.genre)} • ${project.scenes} scenes • ${project.frames} frames</div>
            </div>
            ${statusBadge(project.status)}
          </div>

          <p class="mt-3 mb-3">${escapeHtml(project.description)}</p>

          <div class="project-mini-meta">
            <span><i class="bi bi-bookmark"></i> ${escapeHtml(project.tag || "Creative Project")}</span>
            <span><i class="bi bi-clock-history"></i> ${formatDate(project.createdAt)}</span>
          </div>

          <div class="project-actions">
            <button class="btn btn-hero btn-sm" data-action="open" data-id="${project.id}">
              Open Project
            </button>
            <button class="btn btn-outline-dashboard btn-sm" data-action="delete" data-id="${project.id}">
              Delete
            </button>
          </div>
        </div>
      `;

      projectsGrid.appendChild(col);
    });
  }

  function deleteProject(projectId) {
    const projects = getProjects().filter((project) => project.id !== projectId);
    saveProjects(projects);
    addActivity("Project deleted", "A project was removed from your dashboard.");
    renderProjects();
  }

  function openProject(projectId) {
    const projects = getProjects();
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    addActivity("Project opened", `You opened ${project.title}.`);
    alert(`Project workspace for "${project.title}" will be connected in the next build step.`);
  }

  function seedDemoProjects() {
    const existing = getProjects();
    if (existing.length) {
      const confirmed = confirm("Demo projects will be added to your current list. Continue?");
      if (!confirmed) return;
    }

    const demoProjects = [
      {
        id: crypto.randomUUID(),
        title: "Beneath the Silence",
        genre: "Drama",
        status: "active",
        scenes: 12,
        frames: 36,
        tag: "Film Concept",
        description: "A character-driven visual storytelling project with emotional tone exploration and continuity planning.",
        createdAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: "Gems in the Ruff",
        genre: "Premiere Concept",
        status: "draft",
        scenes: 8,
        frames: 21,
        tag: "Pitch Deck",
        description: "A presentation-ready board combining scene prompts, mood references, and promotional direction.",
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: "Kingdom Stories Pitch Board",
        genre: "Creative Presentation",
        status: "completed",
        scenes: 6,
        frames: 18,
        tag: "Presentation Prep",
        description: "A polished concept board built to communicate story structure and visual tone clearly.",
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ];

    saveProjects([...existing, ...demoProjects]);
    addActivity("Demo projects added", "Sample StoryAI projects were loaded into your dashboard.");
    renderProjects();
  }

  function clearProjects() {
    const confirmed = confirm("This will remove all saved dashboard projects from this browser. Continue?");
    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEY);
    addActivity("Projects cleared", "All dashboard projects were removed.");
    renderProjects();
  }

  if (newProjectForm) {
    newProjectForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(newProjectForm);
      formData.set("title", document.getElementById("projectTitle").value);
      formData.set("genre", document.getElementById("projectGenre").value);
      formData.set("status", document.getElementById("projectStatus").value);
      formData.set("scenes", document.getElementById("projectScenes").value);
      formData.set("frames", document.getElementById("projectFrames").value);
      formData.set("tag", document.getElementById("projectTag").value);
      formData.set("description", document.getElementById("projectDescription").value);

      const newProject = createProjectObject(formData);
      const projects = getProjects();
      projects.unshift(newProject);
      saveProjects(projects);

      addActivity("Project created", `${newProject.title} was added to your dashboard.`);
      newProjectForm.reset();
      modal?.hide();
      renderProjects();
    });
  }

  if (projectsGrid) {
    projectsGrid.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;

      const action = button.dataset.action;
      const projectId = button.dataset.id;

      if (action === "delete") {
        deleteProject(projectId);
      }

      if (action === "open") {
        openProject(projectId);
      }
    });
  }

  [searchInput, statusFilter, sortFilter].forEach((element) => {
    if (element) {
      element.addEventListener("input", renderProjects);
      element.addEventListener("change", renderProjects);
    }
  });

  if (seedProjectsBtn) {
    seedProjectsBtn.addEventListener("click", seedDemoProjects);
  }

  if (clearProjectsBtn) {
    clearProjectsBtn.addEventListener("click", clearProjects);
  }

  renderProjects();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
const WORKSPACE_STORAGE_KEY = "storyai_workspace_data";

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "workspace") {
    initWorkspace();
  }
});

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

  const promptSubject = document.getElementById("promptSubject");
  const promptEnvironment = document.getElementById("promptEnvironment");
  const promptLighting = document.getElementById("promptLighting");
  const promptCamera = document.getElementById("promptCamera");
  const promptMood = document.getElementById("promptMood");
  const promptStyle = document.getElementById("promptStyle");

  const generatePromptBtn = document.getElementById("generatePromptBtn");
  const savePromptBtn = document.getElementById("savePromptBtn");
  const generatedPromptOutput = document.getElementById("generatedPromptOutput");
  const selectedFrameLabel = document.getElementById("selectedFrameLabel");

  const saveWorkspaceBtn = document.getElementById("saveWorkspaceBtn");
  const loadDemoWorkspaceBtn = document.getElementById("loadDemoWorkspaceBtn");
  const clearWorkspaceBtn = document.getElementById("clearWorkspaceBtn");

  let workspace = getWorkspaceData();
  let selectedSceneId = workspace.selectedSceneId || null;
  let selectedFrameId = workspace.selectedFrameId || null;

  renderWorkspace();

  addSceneBtn?.addEventListener("click", () => {
    const title = newSceneInput.value.trim();
    if (!title) return;

    const scene = {
      id: crypto.randomUUID(),
      title,
      frames: []
    };

    workspace.scenes.push(scene);
    selectedSceneId = scene.id;
    newSceneInput.value = "";
    persistWorkspace();
    renderWorkspace();
  });

  addFrameBtn?.addEventListener("click", () => {
    const title = newFrameInput.value.trim();
    if (!title) return;

    const activeScene = workspace.scenes.find((scene) => scene.id === selectedSceneId);
    if (!activeScene) {
      alert("Please create or select a scene first.");
      return;
    }

    const frame = {
      id: crypto.randomUUID(),
      title,
      prompt: "",
      tags: []
    };

    activeScene.frames.push(frame);
    selectedFrameId = frame.id;
    newFrameInput.value = "";
    persistWorkspace();
    renderWorkspace();
  });

  sceneList?.addEventListener("click", (event) => {
    const sceneElement = event.target.closest(".scene-item");
    if (!sceneElement) return;

    if (event.target.closest(".scene-delete-btn")) {
      deleteScene(sceneElement.dataset.id);
      return;
    }

    selectedSceneId = sceneElement.dataset.id;
    selectedFrameId = null;
    persistWorkspace();
    renderWorkspace();
  });

  frameBoard?.addEventListener("click", (event) => {
    const frameElement = event.target.closest(".frame-item");
    if (!frameElement) return;

    if (event.target.closest(".frame-delete-btn")) {
      deleteFrame(frameElement.dataset.id);
      return;
    }

    selectedFrameId = frameElement.dataset.id;
    persistWorkspace();
    renderWorkspace();
  });

  generatePromptBtn?.addEventListener("click", () => {
    const prompt = buildPrompt();
    generatedPromptOutput.textContent = prompt || "Please fill in some prompt fields first.";
  });

  savePromptBtn?.addEventListener("click", () => {
    const frame = getSelectedFrame();
    if (!frame) {
      alert("Please select a frame first.");
      return;
    }

    const prompt = buildPrompt();
    frame.prompt = prompt;
    frame.tags = [
      promptCamera.value.trim(),
      promptLighting.value.trim(),
      promptMood.value.trim()
    ].filter(Boolean);

    persistWorkspace();
    renderWorkspace();
  });

  saveWorkspaceBtn?.addEventListener("click", () => {
    workspace.script = scriptEditor.value;
    persistWorkspace();
    alert("Workspace saved successfully.");
  });

  loadDemoWorkspaceBtn?.addEventListener("click", () => {
    workspace = {
      projectTitle: "Beneath the Silence",
      projectMeta: "Drama project workspace • Script, scenes, frames, and prompt direction",
      script:
        "INT. ROOM - NIGHT\nNova sits by the window in silence. The room is dim, carrying the weight of emotional tension.\n\nEXT. STREET - DAWN\nA quiet road begins to brighten as the first light of morning breaks through.",
      scenes: [
        {
          id: crypto.randomUUID(),
          title: "Scene 1 — Room at Night",
          frames: [
            {
              id: crypto.randomUUID(),
              title: "Opening Wide Shot",
              prompt:
                "A young woman seated by a window in a dim room at night, emotional stillness, cinematic lighting, wide shot, moody atmosphere, realistic film style.",
              tags: ["Wide Shot", "Moody", "Night"]
            },
            {
              id: crypto.randomUUID(),
              title: "Close Emotional Beat",
              prompt:
                "Close-up of a young woman staring out the window, soft shadow lighting, emotional tension, cinematic realism, intimate camera framing.",
              tags: ["Close-Up", "Emotion", "Shadow"]
            }
          ]
        },
        {
          id: crypto.randomUUID(),
          title: "Scene 2 — Dawn Street",
          frames: [
            {
              id: crypto.randomUUID(),
              title: "Morning Establishing Shot",
              prompt:
                "A quiet empty street at dawn, soft golden light, peaceful atmosphere, wide cinematic shot, realistic concept art.",
              tags: ["Dawn", "Wide Shot", "Peaceful"]
            }
          ]
        }
      ],
      selectedSceneId: null,
      selectedFrameId: null
    };

    selectedSceneId = workspace.scenes[0]?.id || null;
    selectedFrameId = workspace.scenes[0]?.frames[0]?.id || null;
    persistWorkspace();
    renderWorkspace();
  });

  clearWorkspaceBtn?.addEventListener("click", () => {
    const confirmed = confirm("Clear this workspace data?");
    if (!confirmed) return;

    workspace = getDefaultWorkspace();
    selectedSceneId = null;
    selectedFrameId = null;
    persistWorkspace();
    renderWorkspace();
  });

  scriptEditor?.addEventListener("input", () => {
    workspace.script = scriptEditor.value;
    persistWorkspace();
  });

  function buildPrompt() {
    const fields = [
      promptSubject.value.trim(),
      promptEnvironment.value.trim(),
      promptLighting.value.trim(),
      promptCamera.value.trim(),
      promptMood.value.trim(),
      promptStyle.value.trim()
    ].filter(Boolean);

    return fields.join(", ");
  }

  function getSelectedFrame() {
    for (const scene of workspace.scenes) {
      const frame = scene.frames.find((item) => item.id === selectedFrameId);
      if (frame) return frame;
    }
    return null;
  }

  function deleteScene(sceneId) {
    workspace.scenes = workspace.scenes.filter((scene) => scene.id !== sceneId);

    if (selectedSceneId === sceneId) {
      selectedSceneId = workspace.scenes[0]?.id || null;
      selectedFrameId = null;
    }

    persistWorkspace();
    renderWorkspace();
  }

  function deleteFrame(frameId) {
    workspace.scenes = workspace.scenes.map((scene) => ({
      ...scene,
      frames: scene.frames.filter((frame) => frame.id !== frameId)
    }));

    if (selectedFrameId === frameId) {
      selectedFrameId = null;
    }

    persistWorkspace();
    renderWorkspace();
  }

  function renderWorkspace() {
    workspaceProjectTitle.textContent = workspace.projectTitle || "Untitled Story Project";
    workspaceProjectMeta.textContent =
      workspace.projectMeta || "Build your story through script, scenes, frames, and prompt direction.";

    scriptEditor.value = workspace.script || "";

    renderScenes();
    renderFrames();
    hydratePromptFields();

    selectedFrameLabel.textContent = getSelectedFrame()
      ? getSelectedFrame().title
      : "No frame selected yet.";
  }

  function renderScenes() {
    sceneList.innerHTML = "";

    if (!workspace.scenes.length) {
      sceneList.innerHTML = `
        <div class="mini-card">
          <strong>No scenes yet</strong>
          <p class="mb-0 mt-2 text-light-emphasis">Add your first scene to begin structuring the story.</p>
        </div>
      `;
      return;
    }

    workspace.scenes.forEach((scene, index) => {
      const item = document.createElement("div");
      item.className = `scene-item ${scene.id === selectedSceneId ? "active" : ""}`;
      item.dataset.id = scene.id;
      item.innerHTML = `
        <div>
          <h6>${escapeHtml(scene.title)}</h6>
          <small>${scene.frames.length} frame(s)</small>
        </div>
        <button class="scene-delete-btn" title="Delete scene">
          <i class="bi bi-trash3"></i>
        </button>
      `;
      sceneList.appendChild(item);

      if (!selectedSceneId && index === 0) {
        selectedSceneId = scene.id;
      }
    });
  }

  function renderFrames() {
    frameBoard.innerHTML = "";

    const activeScene = workspace.scenes.find((scene) => scene.id === selectedSceneId);

    if (!activeScene) {
      frameBoard.innerHTML = `
        <div class="mini-card">
          <strong>No active scene selected</strong>
          <p class="mb-0 mt-2 text-light-emphasis">Select or create a scene to begin adding storyboard frames.</p>
        </div>
      `;
      return;
    }

    if (!activeScene.frames.length) {
      frameBoard.innerHTML = `
        <div class="mini-card">
          <strong>No frames yet</strong>
          <p class="mb-0 mt-2 text-light-emphasis">Add your first frame for ${escapeHtml(activeScene.title)}.</p>
        </div>
      `;
      return;
    }

    activeScene.frames.forEach((frame) => {
      const item = document.createElement("div");
      item.className = `frame-item ${frame.id === selectedFrameId ? "active" : ""}`;
      item.dataset.id = frame.id;
      item.innerHTML = `
        <div class="frame-top">
          <div>
            <h6>${escapeHtml(frame.title)}</h6>
            <p>${escapeHtml(frame.prompt || "No saved prompt yet.")}</p>
          </div>
          <button class="frame-delete-btn" title="Delete frame">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
        <div class="frame-tags">
          ${(frame.tags || [])
            .map((tag) => `<span class="frame-tag">${escapeHtml(tag)}</span>`)
            .join("")}
        </div>
      `;
      frameBoard.appendChild(item);
    });
  }

  function hydratePromptFields() {
    const frame = getSelectedFrame();

    if (!frame || !frame.prompt) {
      promptSubject.value = "";
      promptEnvironment.value = "";
      promptLighting.value = "";
      promptCamera.value = "";
      promptMood.value = "";
      promptStyle.value = "";
      generatedPromptOutput.textContent = "Your generated prompt will appear here.";
      return;
    }

    generatedPromptOutput.textContent = frame.prompt;
  }

  function persistWorkspace() {
    workspace.selectedSceneId = selectedSceneId;
    workspace.selectedFrameId = selectedFrameId;
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));
  }

  function getWorkspaceData() {
    const saved = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!saved) return getDefaultWorkspace();

    try {
      return JSON.parse(saved);
    } catch {
      return getDefaultWorkspace();
    }
  }

  function getDefaultWorkspace() {
    return {
      projectTitle: "Untitled Story Project",
      projectMeta: "Build your story through script, scenes, frames, and prompt direction.",
      script: "",
      scenes: [],
      selectedSceneId: null,
      selectedFrameId: null
    };
  }
}