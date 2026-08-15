const { amazonLink, products, sizes } = window.AOFMOKA;
const displayProducts = [...products].reverse();

const PANEL_EXIT_MS = 220;
const productGrid = document.querySelector("#product-grid");
const siteHeader = document.querySelector(".site-header");
const headerHomeLink = document.querySelector(".header-bar");
const sizePanel = document.querySelector("#aofmoka-size-panel");

let selectedProductIndex = null;
let panelMode = "closed";
let closeTimer;

function updateHeaderFade() {
  siteHeader.classList.toggle("site-header-scrolled", window.scrollY !== 0);
}

function scrollPageToAbsoluteTop(event) {
  event.preventDefault();
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  if (window.location.hash) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }
}

function setExpandedProduct(productIndex) {
  productGrid.querySelectorAll(".product-card").forEach((card) => {
    const isExpanded = productIndex !== null && Number(card.dataset.productIndex) === productIndex;
    card.setAttribute("aria-expanded", String(isExpanded));
  });
}

function openProductSizes(product, productIndex) {
  window.clearTimeout(closeTimer);
  selectedProductIndex = productIndex;
  panelMode = "open";
  sizePanel.hidden = false;
  sizePanel.className = "product-size-panel product-size-panel-open";
  sizePanel.setAttribute("aria-hidden", "false");
  sizePanel.setAttribute("aria-label", `${product.name} sizes available on Amazon`);
  sizePanel.innerHTML = `
    <div class="product-size-surface">
      <div class="dock-amazon-badge">
        <span>available at</span>
        <span class="amazon-lockup" role="img" aria-label="Amazon">
          <img class="amazon-word" src="./brand/amazon-word-white.svg" alt="" aria-hidden="true" />
          <img class="amazon-smile" src="./brand/amazon-smile-orange.svg" alt="" aria-hidden="true" />
        </span>
      </div>
      <div class="dock-actions" aria-label="${product.name} sizes">
        ${sizes.filter((size) => product.sizes[size]).map((size) => `<a href="${amazonLink(product.sizes[size])}" aria-label="Buy ${product.name} in size ${size} on Amazon">${size.toLowerCase()}</a>`).join("")}
      </div>
    </div>`;
  setExpandedProduct(productIndex);
}

function closeProductSizes() {
  if (panelMode === "closed" || panelMode === "closing") return;
  window.clearTimeout(closeTimer);
  panelMode = "closing";
  sizePanel.classList.remove("product-size-panel-open");
  sizePanel.classList.add("product-size-panel-closing");
  sizePanel.setAttribute("aria-hidden", "true");
  setExpandedProduct(null);
  closeTimer = window.setTimeout(() => {
    panelMode = "closed";
    selectedProductIndex = null;
    sizePanel.hidden = true;
    sizePanel.className = "product-size-panel product-size-panel-closed";
    sizePanel.replaceChildren();
  }, PANEL_EXIT_MS);
}

function renderProducts() {
  productGrid.innerHTML = displayProducts.map((product, index) => (
    `<button class="product-card" type="button" data-product-index="${index}" aria-label="Choose a size for ${product.name}" aria-controls="aofmoka-size-panel" aria-expanded="false">
      <div class="product-image">
        <img src="./products/${product.image}" alt="${product.name} AOFMOKA graphic shirt" />
      </div>
      <div class="product-meta"><h2>${product.name.toLowerCase()}</h2></div>
    </button>`
  )).join("");

  productGrid.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", () => {
      const productIndex = Number(card.dataset.productIndex);
      if (panelMode === "open" && selectedProductIndex === productIndex) {
        closeProductSizes();
        return;
      }
      openProductSizes(displayProducts[productIndex], productIndex);
    });
  });
}

window.addEventListener("scroll", updateHeaderFade, { passive: true });
headerHomeLink.addEventListener("click", scrollPageToAbsoluteTop);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeProductSizes();
});

renderProducts();
updateHeaderFade();
