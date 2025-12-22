const menuToggle = document.querySelector('.menu-toggle')
const nav = document.querySelector('.nav')

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    nav.classList.toggle('nav-open')
  })
}

// Inject compiled Collie hero HTML
async function injectHero() {
  const heroRoot = document.getElementById('hero-root')
  if (!heroRoot) return

  try {
    const res = await fetch('/generated/Hero.html', { cache: 'no-cache' })
    if (!res.ok) {
      console.error('Failed to load Hero.html', res.status)
      return
    }
    const html = await res.text()
    heroRoot.innerHTML = html
  } catch (err) {
    console.error('Error loading Hero.html', err)
  }
}

injectHero()
