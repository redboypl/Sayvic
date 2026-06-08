/* ============================
   s.sdesserts – admin.js
   ============================ */

const STORAGE_KEY   = 'sdesserts_photos';
const SESSION_KEY   = 'sdesserts_session';
const CREDENTIALS   = { user: 'admin', pass: 'dulce123' };
const MAX_SIZE_MB   = 5;

/* ══════════════════════════════
   AUTH
══════════════════════════════ */
function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

function showPanel() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-panel').style.display  = 'block';
  renderAdminGallery();
}

function showLogin() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('admin-panel').style.display  = 'none';
}

document.getElementById('login-btn').addEventListener('click', () => {
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value;
  const err  = document.getElementById('login-error');

  if (user === CREDENTIALS.user && pass === CREDENTIALS.pass) {
    sessionStorage.setItem(SESSION_KEY, 'true');
    err.textContent = '';
    showPanel();
  } else {
    err.textContent = 'Usuario o contraseña incorrectos.';
    document.getElementById('login-pass').value = '';
  }
});

['login-user', 'login-pass'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('login-btn').click();
  });
});

document.getElementById('logout-btn').addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  showLogin();
});

/* ══════════════════════════════
   STORAGE HELPERS
══════════════════════════════ */
function getPhotos() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function savePhotos(photos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      alert('Almacenamiento lleno. Elimina algunas fotos para continuar.');
    }
    return false;
  }
}

/* ══════════════════════════════
   UPLOAD ZONE
══════════════════════════════ */
const uploadZone    = document.getElementById('upload-zone');
const fileInput     = document.getElementById('file-input');
const previewArea   = document.getElementById('preview-area');
const previewGrid   = document.getElementById('preview-grid');
let   pendingFiles  = [];

document.getElementById('upload-trigger').addEventListener('click', () => fileInput.click());

uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('drag-over');
});
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  handleFiles([...e.dataTransfer.files]);
});

fileInput.addEventListener('change', () => {
  handleFiles([...fileInput.files]);
  fileInput.value = '';
});

function handleFiles(files) {
  const images = files.filter(f => f.type.startsWith('image/'));
  const tooBig = images.filter(f => f.size > MAX_SIZE_MB * 1024 * 1024);
  const valid  = images.filter(f => f.size <= MAX_SIZE_MB * 1024 * 1024);

  if (tooBig.length) {
    alert(`${tooBig.length} archivo(s) superan los ${MAX_SIZE_MB} MB y no se pueden agregar.`);
  }
  if (!valid.length) return;

  pendingFiles = valid;
  previewGrid.innerHTML = '';

  valid.forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const item = document.createElement('div');
      item.className = 'preview-item';
      item.innerHTML = `
        <img src="${e.target.result}" alt="preview" />
        <input
          type="text"
          class="caption-input"
          placeholder="Descripción (opcional)"
          data-index="${i}"
        />
      `;
      previewGrid.appendChild(item);
    };
    reader.readAsDataURL(file);
  });

  uploadZone.style.display = 'none';
  previewArea.style.display = 'block';
}

document.getElementById('cancel-upload').addEventListener('click', resetUpload);

function resetUpload() {
  pendingFiles = [];
  previewGrid.innerHTML = '';
  uploadZone.style.display = 'flex';
  previewArea.style.display = 'none';
}

document.getElementById('confirm-upload').addEventListener('click', () => {
  const captions = [...document.querySelectorAll('.caption-input')];
  const photos   = getPhotos();
  let   done     = 0;

  if (!pendingFiles.length) return;

  pendingFiles.forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      photos.push({
        id:      Date.now() + i,
        data:    e.target.result,
        caption: captions[i]?.value.trim() || '',
        date:    new Date().toLocaleDateString('es-ES'),
      });
      done++;
      if (done === pendingFiles.length) {
        savePhotos(photos);
        resetUpload();
        renderAdminGallery();
      }
    };
    reader.readAsDataURL(file);
  });
});

/* ══════════════════════════════
   ADMIN GALLERY
══════════════════════════════ */
function renderAdminGallery() {
  const container = document.getElementById('admin-gallery');
  const noPhotos  = document.getElementById('no-photos');
  const count     = document.getElementById('photo-count');
  const photos    = getPhotos();

  count.textContent = `${photos.length} foto${photos.length !== 1 ? 's' : ''}`;

  // Clear cards (keep no-photos msg)
  [...container.querySelectorAll('.admin-photo-card')].forEach(c => c.remove());

  if (photos.length === 0) {
    noPhotos.style.display = 'block';
    return;
  }
  noPhotos.style.display = 'none';

  photos.forEach((photo, index) => {
    const card = document.createElement('div');
    card.className = 'admin-photo-card';
    card.innerHTML = `
      <div class="admin-thumb">
        <img src="${photo.data}" alt="${photo.caption || 'Foto'}" />
      </div>
      <div class="admin-photo-info">
        <p class="admin-photo-caption">${photo.caption || '<em>Sin descripción</em>'}</p>
        <p class="admin-photo-date">${photo.date}</p>
      </div>
      <button class="btn-icon-delete" data-index="${index}" title="Eliminar">🗑</button>
    `;
    container.appendChild(card);
  });

  // Delete buttons
  container.querySelectorAll('.btn-icon-delete').forEach(btn => {
    btn.addEventListener('click', () => openDeleteModal(Number(btn.dataset.index)));
  });
}

/* ══════════════════════════════
   DELETE MODAL
══════════════════════════════ */
let deleteIndex = null;

function openDeleteModal(index) {
  deleteIndex = index;
  document.getElementById('delete-modal').style.display = 'flex';
}

document.getElementById('cancel-delete').addEventListener('click', () => {
  deleteIndex = null;
  document.getElementById('delete-modal').style.display = 'none';
});

document.getElementById('confirm-delete').addEventListener('click', () => {
  if (deleteIndex === null) return;
  const photos = getPhotos();
  photos.splice(deleteIndex, 1);
  savePhotos(photos);
  deleteIndex = null;
  document.getElementById('delete-modal').style.display = 'none';
  renderAdminGallery();
});

/* ══════════════════════════════
   INIT
══════════════════════════════ */
if (isLoggedIn()) { showPanel(); } else { showLogin(); }
