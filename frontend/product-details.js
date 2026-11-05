
const API_URL = "http://localhost:5000/api";

// ==============================
// DOM ELEMENTS
// ==============================

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

const loading = document.getElementById("loading");
const errorElement = document.getElementById("error");
const details = document.getElementById("product-details");

const mainImage = document.getElementById("main-image");
const thumbnails = document.getElementById("thumbnails");

const cartCount = document.getElementById("count");
const cartButton = document.getElementById("cart");

const quantityElement = document.getElementById("quantity");

const menuButton = document.getElementById("menu");
const navigation = document.getElementById("nav");
const searchInput = document.getElementById("search");

let product = null;
let quantity = 1;
let messageTimer;

let selectedSize = null;
let selectedColor = null;

let cart = Number(localStorage.getItem("cartCount") || 0);

if (cartCount) {
    cartCount.textContent = cart;
}


// ==============================
// HEADER NAVIGATION
// ==============================

if (menuButton && navigation) {

    menuButton.addEventListener("click", () => {

        const isOpen = navigation.classList.toggle("open");

        menuButton.setAttribute("aria-expanded", isOpen);

        menuButton.setAttribute(
            "aria-label",
            isOpen ? "Fermer le menu" : "Ouvrir le menu"
        );
    });

    // Close menu after selecting a link
    navigation.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            navigation.classList.remove("open");

            menuButton.setAttribute("aria-expanded", "false");
            menuButton.setAttribute("aria-label", "Ouvrir le menu");
        });
    });
}


// Close menu with Escape
document.addEventListener("keydown", event => {

    if (event.key === "Escape" && navigation && menuButton) {

        navigation.classList.remove("open");

        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Ouvrir le menu");
    }
});


// ==============================
// HEADER SEARCH
// ==============================

if (searchInput) {

    searchInput.addEventListener("keydown", event => {

        if (event.key === "Enter") {

            event.preventDefault();

            const query = searchInput.value.trim();

            if (!query) return;

            window.location.href =
                `dz.html?search=${encodeURIComponent(query)}#products`;
        }

        if (event.key === "Escape") {
            searchInput.value = "";
            searchInput.blur();
        }
    });
}


// ==============================
// CART COUNTER
// ==============================

function updateCartCount() {

    cart = Number(localStorage.getItem("cartCount") || 0);

    if (cartCount) {
        cartCount.textContent = cart;
    }
}

updateCartCount();


// Header cart button
if (cartButton) {

    cartButton.addEventListener("click", () => {

        const message = document.getElementById("cart-message");

        if (message) {

            message.textContent =
                `Votre panier contient ${cart} article(s).`;

            clearTimeout(messageTimer);

            messageTimer = setTimeout(() => {
                message.textContent = "";
            }, 2500);
        }
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
    Melhfa: "images/WhatsApp Image 2026-10-30 at 00.43.54.jpeg"
};


// ==============================
// COLOR TRANSLATIONS
// ==============================

const colorTranslations = {
    black: "Noir",
    white: "Blanc",
    red: "Rouge",
    blue: "Bleu",
    green: "Vert",
    pink: "Rose",
    beige: "Beige",
    gold: "Doré",
    silver: "Argenté",
    brown: "Marron",
    yellow: "Jaune",
    purple: "Violet",

    noir: "Noir",
    blanc: "Blanc",
    rouge: "Rouge",
    bleu: "Bleu",
    vert: "Vert",
    rose: "Rose",
    dore: "Doré",
    "doré": "Doré",
    argent: "Argenté",
    "argenté": "Argenté",
    marron: "Marron",
    jaune: "Jaune",
    violet: "Violet"
};


// Color HEX
const colorHex = {
    Noir: "#222222",
    Blanc: "#FFFFFF",
    Rouge: "#C62828",
    Bleu: "#2455A4",
    Vert: "#47734B",
    Rose: "#E8A1B5",
    Beige: "#D8C3A5",
    Doré: "#C5A044",
    Argenté: "#C0C0C0",
    Marron: "#795548",
    Jaune: "#F4D03F",
    Violet: "#8054A1"
};


// Convert colors to French
function normalizeColor(color) {

    const key = String(color).trim().toLowerCase();

    return colorTranslations[key] || color;
}


// ==============================
// PRODUCT IMAGES
// ==============================

function getProductImages(product) {

    const fallback = localImages[product.category];

    const validImages = (product.images || []).filter(image =>
        image && !image.includes("example.com")
    );

    const images = validImages.length > 0
        ? validImages
        : fallback
            ? [fallback]
            : [];

    return [...new Set(images)];
}


// ==============================
// LOAD PRODUCT
// ==============================

async function loadProduct() {

    if (!productId) {
        showError();
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/products/${encodeURIComponent(productId)}`
        );

        if (!response.ok) {
            throw new Error("Produit introuvable");
        }

        const data = await response.json();

        product = data.product || data;

        if (!product || !product._id) {
            throw new Error("Données produit invalides");
        }

        displayProduct();

    } catch (err) {

        console.error("Product details error:", err);

        showError();
    }
}


// ==============================
// DISPLAY PRODUCT
// ==============================

function displayProduct() {

    loading.hidden = true;
    details.hidden = false;

    document.title =
        `${product.name} | Signature d'Algérie`;

    document.getElementById("product-category").textContent =
        product.category || "";

    document.getElementById("image-category").textContent =
        product.category || "";

    document.getElementById("product-name").textContent =
        product.name || "";

    document.getElementById("product-price").textContent =
        `${Number(product.price).toLocaleString("fr-FR")} DA`;

    document.getElementById("product-description").textContent =
        product.description || "Aucune description disponible.";

    document.getElementById("info-category").textContent =
        product.category || "";

    // Display sizes and colors
    displayOptions(product);

    // Display images
    const images = getProductImages(product);

    if (images.length > 0) {
        displayImages(images);
    } else if (mainImage) {
        mainImage.alt = product.name;
    }

    // Stock and availability
    updateStock();
}


// ==============================
// DISPLAY PRODUCT OPTIONS
// ==============================

function displayOptions(product) {

    const sizesContainer = document.getElementById("product-sizes");
    const colorsContainer = document.getElementById("product-colors");

    if (!sizesContainer || !colorsContainer) {
        console.error("Product options elements not found.");
        return;
    }

    selectedSize = null;
    selectedColor = null;

    sizesContainer.innerHTML = "";
    colorsContainer.innerHTML = "";


    // Available sizes
    (product.sizes || []).forEach(size => {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "option-btn";
        button.textContent = size;

        button.addEventListener("click", () => {

            sizesContainer.querySelectorAll(".option-btn")
                .forEach(btn => btn.classList.remove("selected"));

            button.classList.add("selected");

            selectedSize = size;
        });

        sizesContainer.appendChild(button);
    });


    // Available colors
    (product.colors || []).forEach(color => {

        const frenchColor = normalizeColor(color);

        const button = document.createElement("button");

        button.type = "button";
        button.className = "color-option";
        button.title = frenchColor;

        const circle = document.createElement("span");

        circle.className = "color-circle";

        circle.style.backgroundColor =
            colorHex[frenchColor] || "#CCCCCC";

        const label = document.createElement("span");

        label.textContent = frenchColor;

        button.appendChild(circle);
        button.appendChild(label);

        button.addEventListener("click", () => {

            colorsContainer.querySelectorAll(".color-option")
                .forEach(btn => btn.classList.remove("selected"));

            button.classList.add("selected");

            selectedColor = frenchColor;
        });

        colorsContainer.appendChild(button);
    });
}


// ==============================
// DISPLAY PRODUCT IMAGES
// ==============================

function displayImages(images) {

    if (!mainImage || !thumbnails) return;

    mainImage.src = images[0];
    mainImage.alt = product.name;

    thumbnails.innerHTML = "";

    images.forEach((image, index) => {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "thumbnail";

        if (index === 0) {
            button.classList.add("active");
        }

        const img = document.createElement("img");

        img.src = image;
        img.alt = `${product.name} ${index + 1}`;

        button.appendChild(img);

        button.addEventListener("click", () => {

            mainImage.src = image;

            thumbnails.querySelectorAll(".thumbnail")
                .forEach(item => item.classList.remove("active"));

            button.classList.add("active");
        });

        thumbnails.appendChild(button);
    });


    // Fallback image
    mainImage.onerror = () => {

        mainImage.onerror = null;

        const fallback = localImages[product.category];

        if (fallback && mainImage.src !== fallback) {
            mainImage.src = fallback;
        }
    };
}


// ==============================
// STOCK AND AVAILABILITY
// ==============================

function updateStock() {

    const stock = Number(product.stock) || 0;
    const isActive = product.isActive !== false;

    const stockText = document.getElementById("product-stock");
    const stockDot = document.getElementById("stock-dot");

    const statusText = document.getElementById("product-status");

    const addButton = document.getElementById("add-to-cart");
    const quantitySection = document.getElementById("quantity-section");

    if (!isActive) {

        if (statusText) {
            statusText.textContent = "Produit actuellement indisponible";
        }

        if (stockText) {
            stockText.textContent = "Produit désactivé";
        }

    } else if (stock > 0) {

        if (statusText) {
            statusText.textContent = "Produit disponible";
        }

        if (stockText) {
            stockText.textContent = `${stock} pièces disponibles`;
        }

    } else {

        if (statusText) {
            statusText.textContent = "Produit temporairement indisponible";
        }

        if (stockText) {
            stockText.textContent = "Rupture de stock";
        }
    }

    const available = isActive && stock > 0;

    if (stockDot) {
        stockDot.classList.toggle("out", !available);
    }

    if (addButton) {
        addButton.disabled = !available;
    }

    if (quantitySection) {
        quantitySection.hidden = !available;
    }

    updateQuantityButtons();
}


// ==============================
// QUANTITY
// ==============================

function updateQuantityButtons() {

    if (quantityElement) {
        quantityElement.textContent = quantity;
    }

    const decreaseButton = document.getElementById("decrease");
    const increaseButton = document.getElementById("increase");

    if (decreaseButton) {
        decreaseButton.disabled = quantity <= 1;
    }

    if (increaseButton) {

        increaseButton.disabled =
            !product ||
            product.isActive === false ||
            quantity >= Number(product.stock);
    }
}


// Increase quantity
const increaseButton = document.getElementById("increase");

if (increaseButton) {

    increaseButton.addEventListener("click", () => {

        if (
            product &&
            product.isActive !== false &&
            quantity < Number(product.stock)
        ) {
            quantity++;

            updateQuantityButtons();
        }
    });
}


// Decrease quantity
const decreaseButton = document.getElementById("decrease");

if (decreaseButton) {

    decreaseButton.addEventListener("click", () => {

        if (quantity > 1) {
            quantity--;

            updateQuantityButtons();
        }
    });
}


// ==============================
// ADD TO CART
// ==============================

const addToCartButton = document.getElementById("add-to-cart");

if (addToCartButton) {

    addToCartButton.addEventListener("click", () => {

        if (
            !product ||
            product.isActive === false ||
            Number(product.stock) <= 0
        ) {
            return;
        }


        // Validate size
        if (product.sizes?.length > 0 && !selectedSize) {

            alert("Veuillez choisir une taille.");

            return;
        }


        // Validate color
        if (product.colors?.length > 0 && !selectedColor) {

            alert("Veuillez choisir une couleur.");

            return;
        }


        // Get cart items
        let cartItems = JSON.parse(
            localStorage.getItem("cartItems") || "[]"
        );


        // Find same product with same options
        const existingItem = cartItems.find(item =>
            item.productId === product._id &&
            item.size === selectedSize &&
            item.color === selectedColor
        );


        // Check available stock
        const currentQuantity = existingItem
            ? Number(existingItem.quantity) || 0
            : 0;

        if (currentQuantity + quantity > Number(product.stock)) {

            alert("Quantité demandée indisponible en stock.");

            return;
        }


        // Update or add product
        if (existingItem) {

            existingItem.quantity += quantity;

        } else {

            cartItems.push({
                productId: product._id,
                name: product.name,
                price: Number(product.price),
                image: getProductImages(product)[0] || "",
                size: selectedSize,
                color: selectedColor,
                quantity: quantity
            });
        }


        // Save cart
        localStorage.setItem(
            "cartItems",
            JSON.stringify(cartItems)
        );


        // Update counter
        cart += quantity;

        localStorage.setItem("cartCount", cart);

        updateCartCount();


        // Confirmation message
        const message = document.getElementById("cart-message");

        if (message) {

            message.textContent =
                "Produit ajouté au panier avec succès !";

            clearTimeout(messageTimer);

            messageTimer = setTimeout(() => {
                message.textContent = "";
            }, 2500);
        }
    });
}


// ==============================
// SHOW ERROR
// ==============================

function showError() {

    if (loading) loading.hidden = true;

    if (details) details.hidden = true;

    if (errorElement) errorElement.hidden = false;
}


// ==============================
// START
// ==============================

loadProduct();
