const API_URL = "https://signature-dalgerie-backend.onrender.com/api";
// ==============================
// DOM ELEMENTS
// ==============================

const menuButton = document.getElementById("menu");
const navigation = document.getElementById("nav");

const count = document.getElementById("count");
const toast = document.getElementById("toast");
const productsList = document.getElementById("products-list");
const searchInput = document.getElementById("search");
const cartButton = document.getElementById("cart");

let selectedCategory = null;
let allProducts = [];
let selectedProduct = null;
let timer;

let cartItems = [];

try {
  cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
} catch (error) {
  cartItems = [];
}

// ==============================
// NOTIFICATIONS
// ==============================

function notify(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(timer);

  timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

// ==============================
// CART COUNTER
// ==============================

function updateCartCount() {
  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  if (count) {
    count.textContent = total;
  }

  localStorage.setItem("cartItems", JSON.stringify(cartItems));
  localStorage.setItem("cartCount", total);
}

updateCartCount();

// ==============================
// MOBILE NAVIGATION
// ==============================

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("open");

    menuButton.setAttribute("aria-expanded", isOpen);

    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Fermer le menu" : "Ouvrir le menu",
    );
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navigation.classList.remove("open");

      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Ouvrir le menu");
    });
  });
}

// ==============================
// LOCAL IMAGES FALLBACK
// ==============================

const localImages = {
  Karakou: "images/WhatsApp Image 2026-10-30 at 00.10.28.jpeg",
  Caftan: "images/WhatsApp Image 2026-10-30 at 00.04.32.jpeg",
  Qendoura: "images/WhatsApp Image 2026-10-29 at 23.51.25.jpeg",
  Blouza: "images/WhatsApp Image 2026-10-29 at 23.59.25 (1).jpeg",
  Chadda: "images/WhatsApp Image 2026-10-30 at 00.02.42.jpeg",
  Melhfa: "images/WhatsApp Image 2026-10-30 at 00.43.54.jpeg",
};

// ==============================
// LOAD PRODUCTS FROM BACKEND
// ==============================

async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);

    if (!response.ok) {
      throw new Error("Impossible de récupérer les produits");
    }

    const data = await response.json();

    allProducts = Array.isArray(data) ? data : data.products || [];

    handleSearch(searchInput?.value || "");
  } catch (error) {
    console.error("Products error:", error);

    if (productsList) {
      productsList.textContent =
        "Impossible de charger les produits. Vérifiez la connexion au serveur.";
    }
  }
}

// ==============================
// DISPLAY PRODUCTS
// ==============================

function displayProducts(products) {
  if (!productsList) return;

  productsList.innerHTML = "";

  if (!products || products.length === 0) {
    const emptyMessage = document.createElement("p");

    emptyMessage.className = "empty-message";

    emptyMessage.textContent = searchInput?.value.trim()
      ? "Aucun produit ne correspond à votre recherche."
      : "Aucun produit disponible pour le moment.";

    productsList.appendChild(emptyMessage);

    return;
  }

  products.forEach((product) => {
    // Product Card
    const card = document.createElement("div");

    card.className = "product-card";
    card.dataset.productId = product._id;
    card.style.cursor = "pointer";
    card.tabIndex = 0;

    card.setAttribute("role", "link");

    card.setAttribute("aria-label", `Voir les détails de ${product.name}`);

    // Product Image
    const image = document.createElement("img");

    image.className = "product-image";

    const apiImage = product.images?.[0];

    image.src =
      apiImage && !apiImage.includes("example.com")
        ? apiImage
        : localImages[product.category] || "";

    image.alt = product.name;

    image.onerror = () => {
      image.onerror = null;

      image.src = localImages[product.category] || "";
    };

    // Product Info
    const info = document.createElement("div");

    info.className = "product-info";

    // Category
    const category = document.createElement("p");

    category.className = "product-category";
    category.textContent = product.category;

    // Name
    const title = document.createElement("h3");

    title.className = "product-title";
    title.textContent = product.name;

    // Price
    const price = document.createElement("p");

    price.className = "product-price";

    price.textContent = `${Number(product.price).toLocaleString("fr-FR")} DA`;

    // Add To Cart Button
    const button = document.createElement("button");

    button.textContent = "Ajouter au panier";
    button.className = "add";
    button.type = "button";
    button.dataset.productId = product._id;

    if (!product.isActive || Number(product.stock) <= 0) {
      button.disabled = true;
      button.textContent = "Indisponible";
    }

    // Build Card
    info.append(category, title, price, button);

    card.append(image, info);

    productsList.appendChild(card);
  });
}

// ==============================
// ADD TO CART MODAL
// ==============================

function createCartModal() {
  const modal = document.createElement("div");

  modal.id = "cart-modal";
  modal.className = "cart-modal";

  modal.innerHTML = `
        <div class="cart-modal-overlay"></div>

        <div class="cart-modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title">

            <button
                type="button"
                class="modal-close"
                aria-label="Fermer"
            >
                &times;
            </button>

            <p class="modal-subtitle">SIGNATURE D'ALGÉRIE</p>

            <h2 id="modal-title">Choisissez vos options</h2>

            <p class="modal-product-name"></p>

            <div class="modal-field">
                <label for="modal-size">Taille</label>
                <select id="modal-size"></select>
            </div>

            <div class="modal-field">
                <label for="modal-color">Couleur</label>
                <select id="modal-color"></select>
            </div>

            <div class="modal-field">
                <label for="modal-quantity">Quantité</label>
                <div class="modal-quantity">
                    <button type="button" id="quantity-minus">−</button>
                    <span id="modal-quantity">1</span>
                    <button type="button" id="quantity-plus">+</button>
                </div>
            </div>

            <button type="button" class="modal-add-button">
                Ajouter au panier
            </button>

        </div>
    `;

  document.body.appendChild(modal);

  return modal;
}

const cartModal = createCartModal();

const modalSize = cartModal.querySelector("#modal-size");
const modalColor = cartModal.querySelector("#modal-color");
const modalQuantity = cartModal.querySelector("#modal-quantity");
const modalProductName = cartModal.querySelector(".modal-product-name");

let selectedQuantity = 1;

// ==============================
// MODAL OPTIONS
// ==============================

function fillSelect(select, options, label) {
  select.innerHTML = "";

  if (!options || options.length === 0) {
    const option = document.createElement("option");

    option.value = "";
    option.textContent = "Non spécifié";

    select.appendChild(option);

    return;
  }

  options.forEach((value) => {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = value;

    select.appendChild(option);
  });
}

// ==============================
// OPEN MODAL
// ==============================

function openCartModal(product) {
  if (!product) return;

  if (product.isActive === false || Number(product.stock) <= 0) {
    notify("Cette pièce est actuellement indisponible.");

    return;
  }

  selectedProduct = product;
  selectedQuantity = 1;

  modalProductName.textContent = product.name;

  fillSelect(modalSize, product.sizes, "Taille");
  fillSelect(modalColor, product.colors, "Couleur");

  modalQuantity.textContent = selectedQuantity;

  cartModal.classList.add("active");

  document.body.style.overflow = "hidden";
}

// ==============================
// CLOSE MODAL
// ==============================

function closeCartModal() {
  cartModal.classList.remove("active");

  document.body.style.overflow = "";

  selectedProduct = null;
}

cartModal
  .querySelector(".modal-close")
  .addEventListener("click", closeCartModal);

cartModal
  .querySelector(".cart-modal-overlay")
  .addEventListener("click", closeCartModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartModal.classList.contains("active")) {
    closeCartModal();
  }
});

// ==============================
// MODAL QUANTITY
// ==============================

cartModal.querySelector("#quantity-minus").addEventListener("click", () => {
  if (selectedQuantity > 1) {
    selectedQuantity--;

    modalQuantity.textContent = selectedQuantity;
  }
});

cartModal.querySelector("#quantity-plus").addEventListener("click", () => {
  if (!selectedProduct) return;

  const stock = Number(selectedProduct.stock) || 0;

  if (selectedQuantity < stock) {
    selectedQuantity++;

    modalQuantity.textContent = selectedQuantity;
  } else {
    notify("Quantité maximale disponible atteinte.");
  }
});

// ==============================
// CONFIRM ADD TO CART
// ==============================

cartModal.querySelector(".modal-add-button").addEventListener("click", () => {
  if (!selectedProduct) return;

  const product = selectedProduct;

  const size = modalSize.value;
  const color = modalColor.value;

  const stock = Number(product.stock) || 0;

  if (selectedQuantity > stock) {
    notify("Stock insuffisant.");

    return;
  }

  // Find existing item
  const existingItem = cartItems.find(
    (item) =>
      item.productId === product._id &&
      item.size === size &&
      item.color === color,
  );

  if (existingItem) {
    if (existingItem.quantity + selectedQuantity > stock) {
      notify("Stock insuffisant pour cette quantité.");

      return;
    }

    existingItem.quantity += selectedQuantity;
  } else {
    cartItems.push({
      productId: product._id,
      name: product.name,
      price: Number(product.price),

      image:
        product.images?.[0] && !product.images[0].includes("example.com")
          ? product.images[0]
          : localImages[product.category] || "",

      size,
      color,

      quantity: selectedQuantity,
    });
  }

  updateCartCount();

  closeCartModal();

  notify("تمت إضافة القطعة إلى السلة");
});

// ==============================
// SEARCH PRODUCTS
// ==============================

function handleSearch(query) {
  const normalizedQuery = query
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;

    const searchableContent = [
      product.name,
      product.description,
      product.category,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const matchesSearch =
      !normalizedQuery || searchableContent.includes(normalizedQuery);

    return matchesCategory && matchesSearch;
  });

  displayProducts(filteredProducts);
}

// ==============================
// COLLECTION FILTER
// ==============================

const collectionsGrid = document.getElementById("grid");

if (collectionsGrid) {
  collectionsGrid.addEventListener("click", (event) => {
    const tile = event.target.closest(".tile");

    if (!tile) return;

    const category = tile.dataset.category;

    selectedCategory = selectedCategory === category ? null : category;

    document.querySelectorAll(".tile").forEach((item) => {
      const isActive = item.dataset.category === selectedCategory;

      item.classList.toggle("active", isActive);

      item.setAttribute("aria-pressed", isActive);
    });

    handleSearch(searchInput?.value || "");

    productsList?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });

  collectionsGrid.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    const tile = event.target.closest(".tile");

    if (!tile) return;

    event.preventDefault();

    tile.click();
  });
}

// ==============================
// SEARCH EVENTS
// ==============================

if (searchInput) {
  searchInput.addEventListener("input", (event) => {
    handleSearch(event.target.value);
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      handleSearch(searchInput.value);

      searchInput.blur();
    }

    if (event.key === "Escape") {
      searchInput.value = "";

      handleSearch("");

      searchInput.blur();
    }
  });
}

// ==============================
// PRODUCTS INTERACTIONS
// ==============================

if (productsList) {
  productsList.addEventListener("click", (event) => {
    // Add to Cart
    const button = event.target.closest(".add");

    if (button) {
      event.stopPropagation();

      const product = allProducts.find(
        (item) => item._id === button.dataset.productId,
      );

      openCartModal(product);

      return;
    }

    // Open Product Details
    const card = event.target.closest(".product-card");

    if (card?.dataset.productId) {
      window.location.href = `product-details.html?id=${encodeURIComponent(card.dataset.productId)}`;
    }
  });

  // Keyboard Navigation
  productsList.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    if (event.target.closest("button")) return;

    const card = event.target.closest(".product-card");

    if (!card) return;

    event.preventDefault();

    window.location.href = `product-details.html?id=${encodeURIComponent(card.dataset.productId)}`;
  });
}

// ==============================
// HEADER CART
// ==============================

if (cartButton) {
  cartButton.addEventListener("click", () => {
    window.location.href = "cart.html";
  });
}

// ==============================
// RESTORE SEARCH FROM URL
// ==============================

const urlParams = new URLSearchParams(window.location.search);

const initialSearch = urlParams.get("search");

if (initialSearch && searchInput) {
  searchInput.value = initialSearch;
}

// ==============================
// LOAD PRODUCTS ON START
// ==============================

loadProducts();
