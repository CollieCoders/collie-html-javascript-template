async function injectPartial(rootId, url) {
  const root = document.getElementById(rootId);
  if (!root) return;

  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) {
      console.error(`Failed to load ${url}:`, res.status, res.statusText);
      return;
    }

    const html = await res.text();
    root.innerHTML = html;
  } catch (err) {
    console.error(`Error loading ${url}:`, err);
  }
}

async function bootstrap() {
  // Inject all the compiled Collie partials
  await Promise.all([
    injectPartial("header-root", "/generated/Header.html"),
    injectPartial("hero-root", "/generated/Hero.html"),
    injectPartial("features-root", "/generated/Features.html"),
    injectPartial("pipeline-root", "/generated/Pipeline.html"),
    injectPartial("tooling-root", "/generated/Tooling.html"),
    injectPartial("quickstart-root", "/generated/Quickstart.html"),
    injectPartial("footer-root", "/generated/Footer.html"),
  ]);

  // Now that header HTML exists, wire up the menu toggle behavior
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      nav.classList.toggle("nav-open");
    });
  }
}

bootstrap();
