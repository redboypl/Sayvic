/* ============================
   s.sdesserts – main.js
   ============================ */

const STORAGE_KEY = 'sdesserts_photos';

/* ── Cargar galería desde localStorage ── */
function loadGallery() {
  const gallery = document.getElementById('gallery');
  const emptyMsg = document.getElementById('gallery-empty');
  if (!gallery) return;

  const photos = getPhotos();

  if (photos.length === 0) {
    if (emptyMsg) emptyMsg.style.display = 'flex';
    return;
  }

  if (emptyMsg) emptyMsg.style.display = 'none';

  photos.forEach((photo, index) => {
    const card = document.createElement('div');
    card.className = 'gallery-card fade-in';
    card.dataset.index = index;
    card.innerHTML = `
      <div class="thumb">
        <img src="${photo.data}" alt="${photo.caption || 'Postre'}" />
      </div>
      <div class="overlay"></div>
      ${photo.caption ? `<div class="gallery-caption">${photo.caption}</div>` : ''}
    `;
    card.addEventListener('click', () => openLightbox(index));
    gallery.appendChild(card);
  });

  // Stagger
  document.querySelectorAll('.gallery-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 60}ms`;
  });

  // Trigger fade-in
  requestAnimationFrame(() => {
    document.querySelectorAll('.gallery-card').forEach(card => card.classList.add('visible'));
  });
}

function getPhotos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

/* ── LIGHTBOX ── */
let currentIndex = 0;

function openLightbox(index) {
  const photos = getPhotos();
  currentIndex = index;
  updateLightbox(photos);
  document.getElementById('lightbox').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function updateLightbox(photos) {
  const photo = photos[currentIndex];
  document.getElementById('lightbox-img').src = photo.data;
  document.getElementById('lightbox-img').alt = photo.caption || '';
  document.getElementById('lightbox-caption').textContent = photo.caption || '';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
document.getElementById('lightbox')?.addEventListener('click', (e) => {
  if (e.target.id === 'lightbox') closeLightbox();
});

document.getElementById('lightbox-prev')?.addEventListener('click', () => {
  const photos = getPhotos();
  currentIndex = (currentIndex - 1 + photos.length) % photos.length;
  updateLightbox(photos);
});

document.getElementById('lightbox-next')?.addEventListener('click', () => {
  const photos = getPhotos();
  currentIndex = (currentIndex + 1) % photos.length;
  updateLightbox(photos);
});

document.addEventListener('keydown', (e) => {
  const lb = document.getElementById('lightbox');
  if (!lb?.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') document.getElementById('lightbox-prev').click();
  if (e.key === 'ArrowRight') document.getElementById('lightbox-next').click();
});

/* ── Fade-in on scroll (spec cards, contact) ── */
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

document.querySelectorAll('.spec-card, .contact-section').forEach((el) => {
  el.classList.add('fade-in');
  observer.observe(el);
});

document.querySelectorAll('.spec-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 80}ms`;
});

/* ── Init ── */
loadGallery();
