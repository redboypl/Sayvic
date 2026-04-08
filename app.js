const menuItems = [
  {
    name: "Mini Cheesecake",
    description: "Cheesecake de fresa con textura cremosa y una base de galleta dorada.",
    model: "Models/Cupcake.glb",
    alt: "Mini Cheesecake 3D"
  },
  {
    name: "Mini Brownie",
    description: "Brownie intenso y suave con un toque de chocolate amargo.",
    model: "Models/Cupcake.glb",
    alt: "Mini Brownie 3D"
  },
  {
    name: "Mini Macarón",
    description: "Macarón delicado con relleno cremoso y colores pastel.",
    model: "Models/Cupcake.glb",
    alt: "Mini Macaron 3D"
  }
];

const menuEl = document.getElementById("menu");
const previewEl = document.getElementById("preview");
const previewName = document.getElementById("preview-name");
const previewDescription = document.getElementById("preview-description");
const previewModel = document.getElementById("preview-model");

function createCard(item, index) {
  const card = document.createElement("article");
  card.className = "item-card";
  card.innerHTML = `
    <span class="item-badge"><span></span>Nuevo</span>
    <h2 class="item-title">${item.name}</h2>
    <p class="item-desc">${item.description}</p>
    <div class="actions">
      <button type="button" data-index="${index}">Ver Modelo 3D</button>
    </div>
  `;
  card.querySelector("button").addEventListener("click", () => selectItem(index));
  return card;
}

function renderMenu() {
  menuEl.innerHTML = "";
  menuItems.forEach((item, index) => menuEl.appendChild(createCard(item, index)));
}

function selectItem(index) {
  const item = menuItems[index];
  previewName.textContent = item.name;
  previewDescription.textContent = item.description;
  previewModel.setAttribute("src", item.model);
  previewModel.setAttribute("alt", item.alt);
  previewEl.classList.remove("hidden");
  previewEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

renderMenu();
selectItem(0);
