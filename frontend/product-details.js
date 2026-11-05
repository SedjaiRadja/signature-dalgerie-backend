
const API_URL = "http://localhost:5000/api";

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

const loading = document.getElementById("loading");
const errorElement = document.getElementById("error");
const details = document.getElementById("product-details");

const mainImage = document.getElementById("main-image");
const thumbnails = document.getElementById("thumbnails");

const cartCount = document.getElementById("cart-count");
const quantityElement = document.getElementById("quantity");

let product = null;
let quantity = 1;
let messageTimer;

let selectedSize = null;
let selectedColor = null;

let cart = Number(localStorage.getItem("cartCount") || 0);

cartCount.textContent = cart;


// Images locales utilisées comme fallback
const localImages = {
    Karakou: "images/WhatsApp Image 2026-10-30 at 00.10.28.jpeg",
    Caftan: "images/WhatsApp Image 2026-10-30 at 00.04.32.jpeg",
    Qendoura: "images/WhatsApp Image 2026-10-29 at 23.51.25.jpeg",
    Blouza: "images/WhatsApp Image 2026-10-29 at 23.59.25 (1).jpeg",
    Chadda: "images/WhatsApp Image 2026-10-30 at 00.02.42.jpeg",
    Melhfa: "images/WhatsApp Image 2026-10-30 at 00.43.54.jpeg"
};


// Traduction des couleurs en français
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


// Couleurs HEX
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


// Convertir les couleurs en français
function normalizeColor(color) {
    const key = String(color).trim().toLowerCase();

    return colorTranslations[key] || color;
}


// Récupérer les images du produit
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


// Charger le produit
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


// Afficher le produit
function displayProduct() {
    loading.hidden = true;
    details.hidden = false;

    document.title = `${product.name} | Signature d'Algérie`;

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

    // Afficher les tailles et les couleurs
    displayOptions(product);

    // Afficher les images
    const images = getProductImages(product);

    if (images.length > 0) {
        displayImages(images);
    } else {
        mainImage.alt = product.name;
    }

    // Stock et favoris
    updateStock();
    updateFavoriteButton();
}


// Afficher les tailles et couleurs disponibles
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


    // Tailles disponibles
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


    // Couleurs disponibles
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


// Afficher les images et thumbnails
function displayImages(images) {
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

            document.querySelectorAll(".thumbnail").forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");
        });

        thumbnails.appendChild(button);
    });

    // Image de secours
    mainImage.onerror = () => {
        mainImage.onerror = null;

        const fallback = localImages[product.category];

        if (fallback && mainImage.src !== fallback) {
            mainImage.src = fallback;
        }
    };
}


// Stock et disponibilité
function updateStock() {
    const stock = Number(product.stock) || 0;
    const isActive = product.isActive !== false;

    const stockText = document.getElementById("product-stock");
    const stockDot = document.getElementById("stock-dot");

    const statusText = document.getElementById("product-status");

    const addButton = document.getElementById("add-to-cart");
    const quantitySection = document.getElementById("quantity-section");

    if (!isActive) {
        statusText.textContent = "Produit actuellement indisponible";
        stockText.textContent = "Produit désactivé";

    } else if (stock > 0) {
        statusText.textContent = "Produit disponible";
        stockText.textContent = `${stock} pièces disponibles`;

    } else {
        statusText.textContent = "Produit temporairement indisponible";
        stockText.textContent = "Rupture de stock";
    }

    const available = isActive && stock > 0;

    stockDot.classList.toggle("out", !available);

    addButton.disabled = !available;
    quantitySection.hidden = !available;

    updateQuantityButtons();
}


// Quantité
function updateQuantityButtons() {
    quantityElement.textContent = quantity;

    document.getElementById("decrease").disabled =
        quantity <= 1;

    document.getElementById("increase").disabled =
        !product ||
        product.isActive === false ||
        quantity >= Number(product.stock);
}


// Augmenter la quantité
document.getElementById("increase").addEventListener("click", () => {

    if (
        product &&
        product.isActive !== false &&
        quantity < Number(product.stock)
    ) {
        quantity++;

        updateQuantityButtons();
    }
});


// Diminuer la quantité
document.getElementById("decrease").addEventListener("click", () => {

    if (quantity > 1) {
        quantity--;

        updateQuantityButtons();
    }
});


// Ajouter au panier
document.getElementById("add-to-cart").addEventListener("click", () => {

    if (
        !product ||
        product.isActive === false ||
        Number(product.stock) <= 0
    ) {
        return;
    }


    // Vérifier la taille
    if (product.sizes?.length > 0 && !selectedSize) {
        alert("Veuillez choisir une taille.");
        return;
    }


    // Vérifier la couleur
    if (product.colors?.length > 0 && !selectedColor) {
        alert("Veuillez choisir une couleur.");
        return;
    }


    // Récupérer le panier
    let cartItems = JSON.parse(
        localStorage.getItem("cartItems") || "[]"
    );


    // Chercher le même produit avec les mêmes options
    const existingItem = cartItems.find(item =>
        item.productId === product._id &&
        item.size === selectedSize &&
        item.color === selectedColor
    );


    // Vérifier le stock disponible
    const currentQuantity = existingItem
        ? Number(existingItem.quantity) || 0
        : 0;

    if (currentQuantity + quantity > Number(product.stock)) {
        alert("Quantité demandée indisponible en stock.");
        return;
    }


    // Mettre à jour ou ajouter le produit
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


    // Sauvegarder le panier
    localStorage.setItem(
        "cartItems",
        JSON.stringify(cartItems)
    );


    // Mettre à jour le compteur
    cart += quantity;

    localStorage.setItem("cartCount", cart);

    cartCount.textContent = cart;


    // Message de confirmation
    const message = document.getElementById("cart-message");

    message.textContent =
        "Produit ajouté au panier avec succès !";

    clearTimeout(messageTimer);

    messageTimer = setTimeout(() => {
        message.textContent = "";
    }, 2500);
});


// Favoris
const favoriteButton = document.getElementById("favorite");

let favorites = JSON.parse(
    localStorage.getItem("favorites") || "[]"
);


// Mettre à jour le bouton favoris
function updateFavoriteButton() {
    const isFavorite = favorites.includes(productId);

    favoriteButton.classList.toggle("active", isFavorite);

    favoriteButton.textContent = isFavorite ? "♥" : "♡";
}


// Ajouter ou retirer des favoris
favoriteButton.addEventListener("click", () => {

    const index = favorites.indexOf(productId);

    if (index === -1) {
        favorites.push(productId);

    } else {
        favorites.splice(index, 1);
    }

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

    updateFavoriteButton();
});


// Afficher une erreur
function showError() {
    loading.hidden = true;
    details.hidden = true;
    errorElement.hidden = false;
}


// Démarrage
loadProduct();
