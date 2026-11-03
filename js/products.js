const products = [
  {
    id: 1,
    name: "Kigali Tote Bag",
    category: "bags",
    price: 45.00,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683073?w=400&h=400&fit=crop",
    badge: "Best Seller"
  },
  {
    id: 2,
    name: "Sunset Crochet Top",
    category: "clothing",
    price: 38.00,
    originalPrice: 48.00,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop",
    badge: "Sale"
  },
  {
    id: 3,
    name: "Heritage Bucket Hat",
    category: "hats",
    price: 22.00,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&h=400&fit=crop",
    badge: null
  },
  {
    id: 4,
    name: "Woven Statement Earrings",
    category: "accessories",
    price: 18.00,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop",
    badge: "New"
  },
  {
    id: 5,
    name: "Volcanic Coaster Set",
    category: "home-decor",
    price: 28.00,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
    badge: null
  },
  {
    id: 6,
    name: "Imigongo Crossbody",
    category: "bags",
    price: 52.00,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop",
    badge: "Premium"
  },
  {
    id: 7,
    name: "Lake Kivu Cardigan",
    category: "clothing",
    price: 65.00,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop",
    badge: null
  },
  {
    id: 8,
    name: "Savanna Sun Hat",
    category: "hats",
    price: 30.00,
    originalPrice: 35.00,
    image: "https://images.unsplash.com/photo-1575428652377-274d73b7d9b1?w=400&h=400&fit=crop",
    badge: "Sale"
  },
  {
    id: 9,
    name: "Agaseke Mini Pouch",
    category: "accessories",
    price: 15.00,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1601924994987-9e4d314877da?w=400&h=400&fit=crop",
    badge: null
  },
  {
    id: 10,
    name: "Rwanda Flag Wall Hanging",
    category: "home-decor",
    price: 55.00,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=400&fit=crop",
    badge: "Limited"
  },
  {
    id: 11,
    name: "Market Day Shopper",
    category: "bags",
    price: 40.00,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d12836?w=400&h=400&fit=crop",
    badge: null
  },
  {
    id: 12,
    name: "Umurimo Crochet Dress",
    category: "clothing",
    price: 78.00,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop",
    badge: "New"
  }
];

const categoryLabels = {
  bags: "Bags",
  clothing: "Clothing",
  hats: "Hats",
  accessories: "Accessories",
  "home-decor": "Home Decor"
};

function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

function createProductCard(product) {
  const priceHtml = product.originalPrice
    ? `<span class="original">${formatPrice(product.originalPrice)}</span>${formatPrice(product.price)}`
    : formatPrice(product.price);

  const badgeHtml = product.badge
    ? `<span class="product-badge">${product.badge}</span>`
    : "";

  return `
    <article class="product-card" data-id="${product.id}" data-category="${product.category}">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        ${badgeHtml}
        <div class="product-quick-add">
          <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
        </div>
      </div>
      <div class="product-info">
        <p class="product-category">${categoryLabels[product.category]}</p>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">${priceHtml}</p>
      </div>
    </article>
  `;
}

function getFeaturedProducts(count = 4) {
  return products.filter(p => p.badge).slice(0, count);
}

function getProductsByCategory(category) {
  if (!category) return products;
  return products.filter(p => p.category === category);
}

function getProductById(id) {
  return products.find(p => p.id === parseInt(id));
}
