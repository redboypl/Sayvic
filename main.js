/* ============================
   s.sdesserts – main.js
   ============================ */

/* ── Fade-in on scroll ── */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(
  '.gallery-card, .spec-card, .contact-section'
).forEach((el) => {
  el.classList.add('fade-in');
  observer.observe(el);
});

/* Inject fade-in styles dynamically */
const style = document.createElement('style');
style.textContent = `
  .fade-in {
    opacity: 0;
    transform: translateY(18px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .fade-in.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(style);

/* ── Staggered gallery cards ── */
document.querySelectorAll('.gallery-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 60}ms`;
});

/* ── Staggered spec cards ── */
document.querySelectorAll('.spec-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 80}ms`;
});
