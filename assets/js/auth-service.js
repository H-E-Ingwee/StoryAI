// Auth Service: Manages JWT tokens, user session, API calls
const API_URL = "http://localhost:3000/api";

function getToken() {
  return localStorage.getItem("storyai_token");
}

function setToken(token) {
  localStorage.setItem("storyai_token", token);
}

function getUser() {
  const user = localStorage.getItem("storyai_user");
  return user ? JSON.parse(user) : null;
}

function setUser(user) {
  localStorage.setItem("storyai_user", JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem("storyai_token");
  localStorage.removeItem("storyai_user");
}

async function apiCall(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json"
    }
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
    const error = await response.json();
    throw new Error(error.message || response.statusText);
  }
  return response.json();
}

async function register(name, email, password) {
  const data = await apiCall("/auth/register", "POST", { name, email, password });
  setToken(data.token);
  setUser(data.user);
  return data;
}

async function login(email, password) {
  const data = await apiCall("/auth/login", "POST", { email, password });
  setToken(data.token);
  setUser(data.user);
  return data;
}

function logout() {
  clearAuth();
}

async function getProfile() {
  return apiCall("/api/auth/me", "GET");
}

// Project API calls
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
