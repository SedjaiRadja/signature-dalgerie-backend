const API_URL = "http://localhost:5000/api";

let cart = 0;

const count = document.getElementById("count");
const toast = document.getElementById("toast");
const productsList = document.getElementById("products-list");

let timer;

function notify(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(timer);

    timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}


// Images locales utilisées comme fallback
const localImages = {
    Karakou: "images/WhatsApp Image 2026-10-30 at 00.10.28.jpeg",
    Caftan: "images/WhatsApp Image 2026-10-30 at 00.04.32.jpeg",
    Qendoura: "images/WhatsApp Image 2026-10-29 at 23.51.25.jpeg",
    Blouza: "images/WhatsApp Image 2026-10-29 at 23.59.25 (1).jpeg",
    Chadda: "images/WhatsApp Image 2026-10-30 at 00.02.42.jpeg",
    Melhfa: "images/WhatsApp Image 2026-10-30 at 00.43.54.jpeg"
};


// Récupérer les produits depuis le Backend
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
            throw new Error("Impossible de récupérer les produits");
        }

        const data = await response.json();

        displayProducts(data.products);

    } catch (error) {
        console.error("Products error:", error);

        productsList.textContent =
            "Impossible de charger les produits. Vérifiez la connexion au serveur.";
    }
}

// Afficher les produits
function displayProducts(products) {
    productsList.innerHTML = "";

    if (!products || products.length === 0) {
        productsList.textContent = "Aucun produit disponible.";
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

// Ajouter un produit au panier (compteur temporaire)

productsList.addEventListener("click", event => {
    const button = event.target.closest(".add");

    if (button) {
        cart++;
        count.textContent = cart;
        notify("تمت إضافة القطعة إلى السلة");
        return;
    }

    const card = event.target.closest(".product-card");

    if (card?.dataset.productId) {
        window.location.href =
            `product-details.html?id=${encodeURIComponent(card.dataset.productId)}`;
    }
});

// Navigation au clavier
productsList.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;

    const card = event.target.closest(".product-card");

    if (!card || event.target.closest("button")) return;

    event.preventDefault();

    window.location.href =
        `product-details.html?id=${encodeURIComponent(card.dataset.productId)}`;
});



// Afficher le nombre de produits dans le panier
document.getElementById("cart").addEventListener("click", () => {
    notify("عدد القطع في السلة: " + cart);
});


// Bouton favoris
document.getElementById("fav").addEventListener("click", () => {
    notify("قائمة المفضلة");
});


// Ouvrir le menu
document.getElementById("menu").addEventListener("click", () => {
    document.getElementById("nav").classList.toggle("open");
});


// Fermer le menu après sélection
document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", () => {
        document.getElementById("nav").classList.remove("open");
    });
});


// Recherche dans les collections
document.getElementById("search").addEventListener("input", event => {
    const query = event.target.value.toLowerCase().trim();

    let visibleCount = 0;

    document.querySelectorAll(".tile").forEach(tile => {
        const match = tile.dataset.name.toLowerCase().includes(query);

        tile.style.display = match ? "" : "none";

        if (match) visibleCount++;
    });

    document.getElementById("empty").hidden = visibleCount !== 0;
});


// Charger les produits au démarrage
loadProducts();