/* Shakya portfolio interactions — no libraries required */

const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const navLinkItems = document.querySelectorAll(".nav-link");
const contactForm = document.getElementById("contactForm");
const formFeedback = document.getElementById("formFeedback");
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

/* Contribution graph is illustrative only — it does not represent real activity. */
const contributionGrid = document.getElementById("contributionGrid");
if (contributionGrid) {
  // Fixed pattern so the placeholder does not imply changing personal statistics.
  const pattern = [
    0,1,0,2,0,0,3,1,0,2,0,1,0,0,2,1,0,3,0,1,0,2,0,1,0,0,
    1,0,2,1,0,3,0,1,0,2,1,0,2,0,1,0,3,1,0,2,0,1,0,2,1,0,
    0,2,1,0,1,0,2,0,3,1,0,2,0,1,0,2,0,1,3,0,1,0,2,0,1,0,
    2,0,1,3,0,1,0,2,1,0,2,0,1,3,0,1,0,2,0,1,2,0,1,0,2,0,
    0,1,0,2,1,0,3,0,1,0,2,1,0,2,0,1,3,0,1,0,2,1,0,2,0,1,
    1,0,2,0,1,3,0,1,0,2,0,1,2,0,1,0,2,1,0,3,0,1,0,2,0,1,
    0,2,0,1,0,2,1,0,3,0,1,2,0,1,0,2,0,1,0,2,1,0,3,0,1,0
  ];
  pattern.forEach((level) => {
    const cell = document.createElement("span");
    cell.className = `contribution-cell level-${level}`;
    cell.setAttribute("aria-hidden", "true");
    contributionGrid.appendChild(cell);
  });
}

/* Contact form is a front-end preview, not connected to a mail or form service. */
contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;

  const message = "Form preview only — connect a form service (such as Formspree or your own backend) to receive messages.";
  if (formFeedback) formFeedback.textContent = message;
  showToast("Your form fields look good. No message was sent because the form is not connected yet.");
});

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
