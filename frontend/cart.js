
const API_URL = "http://localhost:5000/api";

// ==============================
// DOM ELEMENTS
// ==============================

const loadingElement = document.getElementById("cart-loading");
const emptyCart = document.getElementById("empty-cart");
const cartContent = document.getElementById("cart-content");
const cartItemsContainer = document.getElementById("cart-items");

const errorElement = document.getElementById("cart-error");

const countElement = document.getElementById("count");
const summaryCount = document.getElementById("summary-count");
const subtotalElement = document.getElementById("subtotal");
const totalPriceElement = document.getElementById("total-price");

const clearCartButton = document.getElementById("clear-cart");
const checkoutButton = document.getElementById("checkout-button");

const cartButton = document.getElementById("cart");
const menuButton = document.getElementById("menu");
const navigation = document.getElementById("nav");

const messageElement = document.getElementById("cart-message");

let cartEntries = [];
let messageTimer;


// ==============================
// LOCAL STORAGE
// ==============================

function getStoredCart() {
    try {
        const cart = JSON.parse(
            localStorage.getItem("cartItems") || "[]"
        );

        return Array.isArray(cart) ? cart : [];

    } catch (error) {
        console.error("Cart storage error:", error);
        return [];
    }
}


function saveCart() {
    const items = cartEntries.map(entry => entry.item);

    localStorage.setItem("cartItems", JSON.stringify(items));

    updateCartCounter();
}


function updateCartCounter() {
    const cart = getStoredCart();

    const total = cart.reduce((sum, item) => {
        return sum + (Number(item.quantity) || 0);
    }, 0);

    localStorage.setItem("cartCount", total);

    if (countElement) {
        countElement.textContent = total;
    }
}


// ==============================
// FORMAT PRICE
// ==============================

function formatPrice(price) {
    return `${Number(price || 0).toLocaleString("fr-FR")} DA`;
}


// ==============================
// NOTIFICATION
// ==============================

function showMessage(message) {
    if (!messageElement) return;

    messageElement.textContent = message;
    messageElement.classList.add("show");

    clearTimeout(messageTimer);

    messageTimer = setTimeout(() => {
        messageElement.classList.remove("show");
    }, 2800);
}


// ==============================
// FETCH PRODUCT FROM API
// ==============================

async function getProduct(productId) {
    const response = await fetch(
        `${API_URL}/products/${encodeURIComponent(productId)}`
    );

    if (!response.ok) {
        throw new Error("Produit introuvable");
    }

    const data = await response.json();

    const product = data.product || data;

    if (!product || !product._id) {
        throw new Error("Données produit invalides");
    }

    return product;
}


// ==============================
// LOAD CART
// ==============================

async function loadCart() {
    const storedCart = getStoredCart();

    updateCartCounter();

    if (storedCart.length === 0) {
        showEmptyCart();
        return;
    }

    try {
        cartEntries = await Promise.all(
            storedCart.map(async item => {
                try {
                    const product = await getProduct(item.productId);

                    return {
                        item,
                        product,
                        unavailable: false
                    };

                } catch (error) {
                    console.warn(
                        `Product ${item.productId} unavailable:`,
                        error
                    );

                    // Keep the saved item visible if its product
                    // was removed or is temporarily unavailable.
                    return {
                        item,
                        product: {
                            _id: item.productId,
                            name: item.name || "Produit indisponible",
                            price: Number(item.price) || 0,
                            image: item.image || "",
                            category: "",
                            stock: 0,
                            isActive: false
                        },
                        unavailable: true
                    };
                }
            })
        );

        renderCart();

    } catch (error) {
        console.error("Cart loading error:", error);

        showError(
            "Impossible de charger votre panier. Veuillez réessayer."
        );
    }
}


// ==============================
// CART STATES
// ==============================

function showEmptyCart() {
    loadingElement.hidden = true;
    cartContent.hidden = true;
    emptyCart.hidden = false;
}


function showError(message) {
    loadingElement.hidden = true;
    cartContent.hidden = true;
    emptyCart.hidden = true;

    errorElement.hidden = false;
    errorElement.textContent = message;
}


// ==============================
// RENDER CART
// ==============================

function renderCart() {
    loadingElement.hidden = true;
    errorElement.hidden = true;

    if (cartEntries.length === 0) {
        showEmptyCart();
        return;
    }

    emptyCart.hidden = true;
    cartContent.hidden = false;

    cartItemsContainer.innerHTML = "";

    cartEntries.forEach((entry, index) => {
        const article = createCartItem(entry, index);

        cartItemsContainer.appendChild(article);
    });

    updateSummary();
}


// ==============================
// CREATE CART ITEM
// ==============================

function createCartItem(entry, index) {
    const { item, product, unavailable } = entry;

    const quantity = Number(item.quantity) || 1;
    const stock = Number(product.stock) || 0;
    const price = Number(product.price) || 0;

    const itemTotal = price * quantity;

    const image =
        product.images?.find(src =>
            typeof src === "string" &&
            src.trim() !== "" &&
            !src.includes("example.com")
        ) ||
        product.image ||
        item.image ||
        "";

    const article = document.createElement("article");
    article.className = "cart-item";

    // IMAGE
    const imageContainer = document.createElement("div");
    imageContainer.className = "cart-item-image";

    if (image) {
        const img = document.createElement("img");

        img.src = image;
        img.alt = product.name || "Produit";

        img.onerror = () => {
            img.style.display = "none";
        };

        imageContainer.appendChild(img);
    }

    // INFO
    const info = document.createElement("div");
    info.className = "cart-item-info";

    const top = document.createElement("div");
    top.className = "cart-item-top";

    const productInfo = document.createElement("div");

    const category = document.createElement("p");
    category.className = "cart-item-category";
    category.textContent = product.category || "";

    const name = document.createElement("h3");
    name.className = "cart-item-name";
    name.textContent = product.name || item.name || "Produit";

    productInfo.append(category, name);

    const priceElement = document.createElement("p");
    priceElement.className = "cart-item-price";
    priceElement.textContent = formatPrice(itemTotal);

    top.append(productInfo, priceElement);

    // OPTIONS
    const options = document.createElement("div");
    options.className = "cart-item-options";

    if (item.size) {
        const size = document.createElement("span");
        size.textContent = `Taille : ${item.size}`;
        options.appendChild(size);
    }

    if (item.color) {
        const color = document.createElement("span");
        color.textContent = `Couleur : ${item.color}`;
        options.appendChild(color);
    }

    if (unavailable || product.isActive === false || stock <= 0) {
        const status = document.createElement("span");
        status.textContent = "Produit indisponible";
        status.style.color = "#A3483D";
        options.appendChild(status);
    } else if (quantity > stock) {
        const status = document.createElement("span");
        status.textContent = `Stock disponible : ${stock}`;
        status.style.color = "#A3483D";
        options.appendChild(status);
    }

    productInfo.appendChild(options);

    // BOTTOM
    const bottom = document.createElement("div");
    bottom.className = "cart-item-bottom";

    // QUANTITY
    const quantityControl = document.createElement("div");
    quantityControl.className = "quantity-control";

    const decreaseButton = document.createElement("button");
    decreaseButton.type = "button";
    decreaseButton.textContent = "−";
    decreaseButton.setAttribute("aria-label", "Diminuer la quantité");
    decreaseButton.disabled = quantity <= 1;

    decreaseButton.addEventListener("click", () => {
        changeQuantity(index, -1);
    });

    const quantityText = document.createElement("span");
    quantityText.textContent = quantity;

    const increaseButton = document.createElement("button");
    increaseButton.type = "button";
    increaseButton.textContent = "+";
    increaseButton.setAttribute("aria-label", "Augmenter la quantité");

    increaseButton.disabled =
        unavailable ||
        product.isActive === false ||
        quantity >= stock;

    increaseButton.addEventListener("click", () => {
        changeQuantity(index, 1);
    });

    quantityControl.append(
        decreaseButton,
        quantityText,
        increaseButton
    );

    // REMOVE
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-item";
    removeButton.textContent = "Supprimer";

    removeButton.addEventListener("click", () => {
        removeItem(index);
    });

    bottom.append(quantityControl, removeButton);

    info.append(top, bottom);
    article.append(imageContainer, info);

    return article;
}


// ==============================
// UPDATE QUANTITY
// ==============================

function changeQuantity(index, amount) {
    const entry = cartEntries[index];

    if (!entry) return;

    const currentQuantity = Number(entry.item.quantity) || 1;
    const stock = Number(entry.product.stock) || 0;

    const newQuantity = currentQuantity + amount;

    if (newQuantity < 1) return;

    if (
        amount > 0 &&
        (
            entry.unavailable ||
            entry.product.isActive === false ||
            newQuantity > stock
        )
    ) {
        showMessage("Quantité indisponible en stock.");
        return;
    }

    entry.item.quantity = newQuantity;

    saveCart();
    renderCart();
}


// ==============================
// REMOVE ITEM
// ==============================

function removeItem(index) {
    if (!cartEntries[index]) return;

    cartEntries.splice(index, 1);

    saveCart();
    renderCart();

    showMessage("Produit supprimé du panier.");
}


// ==============================
// CLEAR CART
// ==============================

if (clearCartButton) {
    clearCartButton.addEventListener("click", () => {
        if (cartEntries.length === 0) return;

        const confirmed = confirm(
            "Voulez-vous vraiment vider votre panier ?"
        );

        if (!confirmed) return;

        cartEntries = [];

        localStorage.removeItem("cartItems");

        saveCart();
        renderCart();

        showMessage("Votre panier a été vidé.");
    });
}


// ==============================
// ORDER SUMMARY
// ==============================

function updateSummary() {
    const totalItems = cartEntries.reduce((sum, entry) => {
        return sum + (Number(entry.item.quantity) || 0);
    }, 0);

    const totalPrice = cartEntries.reduce((sum, entry) => {
        const price = Number(entry.product.price) || 0;
        const quantity = Number(entry.item.quantity) || 0;

        return sum + price * quantity;
    }, 0);

    const hasUnavailableItems = cartEntries.some(entry => {
        const stock = Number(entry.product.stock) || 0;
        const quantity = Number(entry.item.quantity) || 0;

        return (
            entry.unavailable ||
            entry.product.isActive === false ||
            stock <= 0 ||
            quantity > stock
        );
    });

    summaryCount.textContent = totalItems;
    subtotalElement.textContent = formatPrice(totalPrice);
    totalPriceElement.textContent = formatPrice(totalPrice);

    checkoutButton.disabled = hasUnavailableItems;
    checkoutButton.title = hasUnavailableItems
        ? "Vérifiez les produits et les quantités indisponibles."
        : "";
}


// ==============================
// CHECKOUT
// ==============================

if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
        showMessage(
            "La commande en ligne sera bientôt disponible."
        );
    });
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

    navigation.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navigation.classList.remove("open");

            menuButton.setAttribute("aria-expanded", "false");
            menuButton.setAttribute("aria-label", "Ouvrir le menu");
        });
    });
}


// ==============================
// HEADER CART BUTTON
// ==============================

if (cartButton) {
    cartButton.addEventListener("click", () => {
        window.location.href = "cart.html";
    });
}


// ==============================
// ESCAPE KEY
// ==============================

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && navigation && menuButton) {
        navigation.classList.remove("open");

        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Ouvrir le menu");
    }
});


// ==============================
// START
// ==============================

loadCart();
