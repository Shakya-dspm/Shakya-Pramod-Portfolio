/* Shakya portfolio interactions — no libraries required */

const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const navLinkItems = document.querySelectorAll(".nav-link");
const toast = document.getElementById("toast");

/* Theme toggle: starts dark, remembers the user's choice in this browser. */
const savedTheme = localStorage.getItem("shakya-portfolio-theme");
if (savedTheme === "light" || savedTheme === "dark") {
  root.dataset.theme = savedTheme;
}

function updateThemeButton() {
  const isLight = root.dataset.theme === "light";
  themeToggle?.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
  themeToggle?.setAttribute("title", isLight ? "Switch to dark theme" : "Switch to light theme");
}

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = nextTheme;
  localStorage.setItem("shakya-portfolio-theme", nextTheme);
  updateThemeButton();
});

updateThemeButton();

/* Mobile navigation */
function closeMenu() {
  navLinks?.classList.remove("is-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Open navigation menu");
  document.body.classList.remove("menu-open");
}

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  if (isOpen) {
    closeMenu();
  } else {
    navLinks.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close navigation menu");
    document.body.classList.add("menu-open");
  }
});

navLinkItems.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 640) closeMenu();
});

/* Highlight the current section in the navigation. */
const observedSections = document.querySelectorAll("main section[id]");
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinkItems.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });
  observedSections.forEach((section) => sectionObserver.observe(section));
}

/* Public GitHub API integration */
const githubApiBase = "https://api.github.com/users/Shakya-dspm";
const githubAvatar = document.getElementById("githubAvatar");
const githubProfileStatus = document.getElementById("githubProfileStatus");
const githubRepositories = document.getElementById("githubRepositories");
const githubRepositoriesStatus = document.getElementById("githubRepositoriesStatus");
const featuredRepositoryNames = new Set([
  "weather-application",
  "defence-unit-management-system",
  "number-guess-game"
]);

async function fetchGithubJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" }
  });

  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      throw new Error("GitHub's public API is rate-limiting requests. Please use the profile link to view current data.");
    }
    throw new Error(`GitHub data is temporarily unavailable (HTTP ${response.status}). Please use the profile link.`);
  }

  return response.json();
}

function setGithubStatus(element, message, state) {
  if (!element) return;
  element.textContent = message;
  element.dataset.state = state;
}

function setGithubStat(id, value) {
  const element = document.getElementById(id);
  if (element && Number.isFinite(value)) {
    element.textContent = new Intl.NumberFormat().format(value);
  }
}

function isGithubRepositoryUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "github.com";
  } catch {
    return false;
  }
}

function getGithubAvatarUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "avatars.githubusercontent.com" ? url.href : null;
  } catch {
    return null;
  }
}

async function loadGithubProfile() {
  try {
    const profile = await fetchGithubJson(githubApiBase);
    if (!profile || typeof profile.login !== "string"
      || !Number.isFinite(profile.public_repos)
      || !Number.isFinite(profile.followers)
      || !Number.isFinite(profile.following)) {
      throw new Error("GitHub returned an unexpected profile response. Please use the profile link.");
    }

    document.getElementById("githubName").textContent = profile.name || profile.login;
    document.getElementById("githubUsername").textContent = `@${profile.login}`;
    document.getElementById("githubBio").textContent = profile.bio || "No public bio is set on GitHub.";
    setGithubStat("githubRepoCount", profile.public_repos);
    setGithubStat("githubFollowerCount", profile.followers);
    setGithubStat("githubFollowingCount", profile.following);

    const avatarUrl = getGithubAvatarUrl(profile.avatar_url);
    if (githubAvatar && avatarUrl) {
      githubAvatar.src = avatarUrl;
      githubAvatar.alt = `${profile.name || profile.login} GitHub avatar`;
      githubAvatar.hidden = false;
      githubAvatar.addEventListener("error", () => {
        githubAvatar.hidden = true;
      }, { once: true });
    }

    setGithubStatus(githubProfileStatus, "Profile details loaded from GitHub's public API.", "success");
  } catch (error) {
    setGithubStatus(
      githubProfileStatus,
      error instanceof Error ? error.message : "Could not load GitHub profile data. Please use the profile link.",
      "error"
    );
  }
}

function formatGithubDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Update date unavailable";
  return `Updated ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date)}`;
}

function createRepositoryCard(repository) {
  const card = document.createElement("article");
  card.className = "github-repository-card";

  const heading = document.createElement("h4");
  const link = document.createElement("a");
  link.href = new URL(repository.html_url).href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = repository.name;
  heading.appendChild(link);

  const description = document.createElement("p");
  description.textContent = repository.description || "No repository description published.";

  const metadata = document.createElement("div");
  metadata.className = "github-repository-meta";
  const language = document.createElement("span");
  language.textContent = repository.language || "Language not detected";
  const stars = document.createElement("span");
  stars.textContent = Number.isFinite(repository.stargazers_count)
    ? `★ ${repository.stargazers_count} stars`
    : "Stars unavailable";
  const updated = document.createElement("span");
  updated.textContent = formatGithubDate(repository.updated_at);
  metadata.append(language, stars, updated);

  card.append(heading, description, metadata);
  return card;
}

async function loadGithubRepositories() {
  try {
    const repositories = await fetchGithubJson(`${githubApiBase}/repos?sort=updated&per_page=30`);
    if (!Array.isArray(repositories)) {
      throw new Error("GitHub returned an unexpected repository response.");
    }

    const recentRepositories = repositories
      .filter((repository) => repository && typeof repository.name === "string"
        && isGithubRepositoryUrl(repository.html_url)
        && repository.private !== true
        && !featuredRepositoryNames.has(repository.name.toLowerCase()))
      .slice(0, 4);

    if (!recentRepositories.length) {
      githubRepositories.replaceChildren();
      setGithubStatus(
        githubRepositoriesStatus,
        "No other public repositories are available to show. Visit the GitHub profile for the complete list.",
        "empty"
      );
      return;
    }

    githubRepositories.replaceChildren(...recentRepositories.map(createRepositoryCard));
    setGithubStatus(
      githubRepositoriesStatus,
      `Showing ${recentRepositories.length} recently updated public repositories, excluding the featured project cards.`,
      "success"
    );
  } catch (error) {
    githubRepositories.replaceChildren();
    setGithubStatus(
      githubRepositoriesStatus,
      error instanceof Error ? error.message : "Could not load repositories. Please use the GitHub profile link.",
      "error"
    );
  }
}

if (githubProfileStatus && githubRepositoriesStatus && githubRepositories) {
  loadGithubProfile();
  loadGithubRepositories();
}

let toastTimer;
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 5000);
}

/* Footer year */
const yearElement = document.getElementById("currentYear");
if (yearElement) yearElement.textContent = new Date().getFullYear();
