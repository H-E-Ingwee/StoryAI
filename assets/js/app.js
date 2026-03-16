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