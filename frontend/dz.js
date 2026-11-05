const API_URL = "http://localhost:5000/api";

// ==============================
// DOM ELEMENTS
// ==============================

const menuButton = document.getElementById("menu");
const navigation = document.getElementById("nav");

const count = document.getElementById("count");
const toast = document.getElementById("toast");
const productsList = document.getElementById("products-list");

const searchInput = document.getElementById("search");
let selectedCategory = null;
let cart = Number(localStorage.getItem("cartCount")) || 0;
let allProducts = [];
let timer;


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
    if (count) {
        count.textContent = cart;
    }

    localStorage.setItem("cartCount", cart);
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
// LOAD PRODUCTS FROM BACKEND
// ==============================

async function loadProducts() {

    try {
        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
            throw new Error("Impossible de récupérer les produits");
        }

        const data = await response.json();

        allProducts = Array.isArray(data)
            ? data
            : data.products || [];

        displayProducts(allProducts);

    } catch (error) {

        console.error("Products error:", error);

        productsList.textContent =
            "Impossible de charger les produits. Vérifiez la connexion au serveur.";
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

    products.forEach(product => {

        // Product Card
        const card = document.createElement("div");

        card.className = "product-card";
        card.dataset.productId = product._id;
        card.style.cursor = "pointer";
        card.tabIndex = 0;

        card.setAttribute("role", "link");
        card.setAttribute(
            "aria-label",
            `Voir les détails de ${product.name}`
        );


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

        price.textContent =
            `${Number(product.price).toLocaleString("fr-FR")} DA`;


        // Add to Cart Button
        const button = document.createElement("button");

        button.textContent = "Ajouter au panier";
        button.className = "add";
        button.dataset.productId = product._id;
        button.type = "button";


        // Build Card
        info.append(category, title, price, button);

        card.append(image, info);

        productsList.appendChild(card);
    });
}


// ==============================
// SEARCH PRODUCTS
// ==============================

function handleSearch(query) {

    const normalizedQuery = query
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const filteredProducts = allProducts.filter(product => {

        const matchesCategory =
            !selectedCategory || product.category === selectedCategory;

        const searchableContent = [
            product.name,
            product.description,
            product.category
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        const matchesSearch =
            !normalizedQuery ||
            searchableContent.includes(normalizedQuery);

        return matchesCategory && matchesSearch;
    });

    displayProducts(filteredProducts);
}

// ==============================
// COLLECTION FILTER
// ==============================

const collectionsGrid = document.getElementById("grid");

if (collectionsGrid) {

    collectionsGrid.addEventListener("click", event => {

        const tile = event.target.closest(".tile");

        if (!tile) return;

        const category = tile.dataset.category;

        // Toggle category selection
        if (selectedCategory === category) {
            selectedCategory = null;
        } else {
            selectedCategory = category;
        }

        // Update active styling
        document.querySelectorAll(".tile").forEach(item => {
            item.classList.toggle(
                "active",
                item.dataset.category === selectedCategory
            );

            item.setAttribute(
                "aria-pressed",
                item.dataset.category === selectedCategory
            );
        });

        // Apply filters
        handleSearch(searchInput?.value || "");

        // Scroll to products
        productsList.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    // Keyboard accessibility
    collectionsGrid.addEventListener("keydown", event => {

        if (event.key !== "Enter" && event.key !== " ") return;

        const tile = event.target.closest(".tile");

        if (!tile) return;

        event.preventDefault();
        tile.click();
    });
}

    // Keyboard accessibility
    collectionsGrid.addEventListener("keydown", event => {

        if (event.key !== "Enter" && event.key !== " ") return;

        const tile = event.target.closest(".tile");

        if (!tile) return;

        event.preventDefault();
        tile.click();
    });

// Search while typing
if (searchInput) {

    searchInput.addEventListener("input", event => {
        handleSearch(event.target.value);
    });


    // Submit search with Enter
    searchInput.addEventListener("keydown", event => {

        if (event.key === "Enter") {
            event.preventDefault();

            handleSearch(searchInput.value);
            searchInput.blur();
        }


        // Clear search with Escape
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

    productsList.addEventListener("click", event => {

        const button = event.target.closest(".add");

        // Add to Cart
        if (button) {

            cart++;

            updateCartCount();

            notify("تمت إضافة القطعة إلى السلة");

            return;
        }


        // Open Product Details
        const card = event.target.closest(".product-card");

        if (card?.dataset.productId) {

            window.location.href =
                `product-details.html?id=${encodeURIComponent(card.dataset.productId)}`;
        }
    });


    // Keyboard Navigation
    productsList.addEventListener("keydown", event => {

        if (event.key !== "Enter" && event.key !== " ") return;

        const card = event.target.closest(".product-card");

        if (!card || event.target.closest("button")) return;

        event.preventDefault();

        window.location.href =
            `product-details.html?id=${encodeURIComponent(card.dataset.productId)}`;
    });
}


// ==============================
// CART BUTTON
// ==============================

const cartButton = document.getElementById("cart");

if (cartButton) {

    cartButton.addEventListener("click", () => {

        notify("عدد القطع في السلة: " + cart);

    });
}


// ==============================
// LOAD PRODUCTS ON START
// ==============================

loadProducts();
