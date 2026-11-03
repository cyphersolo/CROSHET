// Made in Rwanda Crochet — Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initCart();
  initFeaturedProducts();
  initShopPage();
  initNewsletterForm();
  initContactForm();
});

// Header scroll effect
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// Mobile menu
function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
}

// Cart functionality
let cart = JSON.parse(localStorage.getItem('mirCart')) || [];

function initCart() {
  const cartBtn = document.getElementById('cartBtn');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartClose = document.getElementById('cartClose');
  const checkoutBtn = document.getElementById('checkoutBtn');

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast('Your cart is empty');
        return;
      }
      window.location.href = 'checkout.html';
    });
  }

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) {
      const id = parseInt(e.target.dataset.id);
      addToCart(id);
    }
    if (e.target.classList.contains('cart-item-remove')) {
      const id = parseInt(e.target.dataset.id);
      removeFromCart(id);
    }
  });

  updateCartUI();
}

function openCart() {
  document.getElementById('cartOverlay')?.classList.add('open');
  document.getElementById('cartDrawer')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.body.style.overflow = '';
}

function addToCart(productId) {
  const product = getProductById(productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  updateCartUI();
  showToast(`${product.name} added to cart`);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('mirCart', JSON.stringify(cart));
}

function updateCartUI() {
  const countEl = document.getElementById('cartCount');
  const itemsEl = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (countEl) countEl.textContent = totalItems;
  if (totalEl) totalEl.textContent = formatPrice(totalPrice);

  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Your cart is empty</p>';
    return;
  }

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">${formatPrice(item.price)} × ${item.quantity}</p>
        <button class="cart-item-remove" data-id="${item.id}">Remove</button>
      </div>
    </div>
  `).join('');
}

// Featured products on homepage
function initFeaturedProducts() {
  const container = document.getElementById('featuredProducts');
  if (!container) return;

  const featured = getFeaturedProducts(4);
  container.innerHTML = featured.map(createProductCard).join('');
}

// Shop page
function initShopPage() {
  const container = document.getElementById('shopProducts');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const category = params.get('category');

  renderShopProducts(category);
  initShopFilters();
}

function renderShopProducts(category = null) {
  const container = document.getElementById('shopProducts');
  const countEl = document.getElementById('productCount');
  if (!container) return;

  let filtered = getProductsByCategory(category);

  const activeFilters = getActiveFilters();
  if (activeFilters.length > 0) {
    filtered = filtered.filter(p => activeFilters.includes(p.category));
  }

  const sortValue = document.getElementById('sortSelect')?.value;
  filtered = sortProducts(filtered, sortValue);

  container.innerHTML = filtered.map(createProductCard).join('');

  if (countEl) {
    countEl.textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;
  }
}

function getActiveFilters() {
  const checkboxes = document.querySelectorAll('.filter-group input[type="checkbox"]:checked');
  return Array.from(checkboxes).map(cb => cb.value);
}

function sortProducts(products, sortBy) {
  const sorted = [...products];
  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

function initShopFilters() {
  const checkboxes = document.querySelectorAll('.filter-group input[type="checkbox"]');
  const sortSelect = document.getElementById('sortSelect');

  const params = new URLSearchParams(window.location.search);
  const category = params.get('category');
  if (category) {
    checkboxes.forEach(cb => {
      if (cb.value === category) cb.checked = true;
    });
  }

  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => renderShopProducts());
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', () => renderShopProducts());
  }
}

// Newsletter form
function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Thank you for subscribing!');
    form.reset();
  });
}

// Contact form
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Message sent! We\'ll get back to you soon.');
    form.reset();
  });
}

// Toast notification
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => toast.classList.remove('show'), 3000);
}
