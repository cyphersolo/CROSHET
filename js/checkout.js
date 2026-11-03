// Made in Rwanda Crochet — Checkout & Payments

let paymentConfig = null;

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initCart();
  initCheckout();
});

function getCart() {
  return JSON.parse(localStorage.getItem('mirCart')) || [];
}

function getCartTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function clearCart() {
  localStorage.removeItem('mirCart');
}

async function initCheckout() {
  const summaryEl = document.getElementById('orderSummary');
  const emptyEl = document.getElementById('checkoutEmpty');
  const formEl = document.getElementById('checkoutLayout');
  if (!summaryEl) return;

  const cart = getCart();

  if (cart.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    if (formEl) formEl.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (formEl) formEl.style.display = 'block';

  renderOrderSummary(cart);

  try {
    const res = await fetch('api/get-config.php');
    paymentConfig = await res.json();
    renderPaymentMethods(paymentConfig);
  } catch {
    showToast('Could not load payment options. Ensure XAMPP Apache is running.');
  }

  document.querySelector('#checkoutForm')?.addEventListener('submit', handleCheckout);

  document.getElementById('paymentMethods')?.addEventListener('change', (e) => {
    if (e.target.name !== 'payment') return;
    togglePaymentUI(e.target.value);
  });
}

function togglePaymentUI(method) {
  const payBtn = document.getElementById('payBtn');
  const paypalContainer = document.getElementById('paypal-button-container');

  if (method === 'paypal') {
    payBtn.style.display = 'none';
    paypalContainer.style.display = 'block';
    initPayPalButtons();
  } else {
    payBtn.style.display = 'block';
    paypalContainer.style.display = 'none';
  }
}

let paypalInitialized = false;

function initPayPalButtons() {
  if (paypalInitialized || !paymentConfig?.providers?.paypal) return;
  if (typeof paypal === 'undefined') {
    setTimeout(initPayPalButtons, 500);
    return;
  }

  paypalInitialized = true;
  const container = document.getElementById('paypal-button-container');
  container.innerHTML = '';

  paypal.Buttons({
    style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' },
    createOrder: async () => {
      const cart = getCart();
      const res = await fetch('api/paypal-create-order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data.order_id;
    },
    onApprove: async (data) => {
      const captureRes = await fetch('api/paypal-capture-order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: data.orderID }),
      });
      const captureData = await captureRes.json();
      if (captureData.success) {
        clearCart();
        window.location.href = `payment-success.html?provider=paypal&ref=${data.orderID}`;
      } else {
        showToast(captureData.message || 'PayPal payment failed');
      }
    },
    onError: (err) => showToast('PayPal error: ' + (err.message || 'Please try again')),
  }).render('#paypal-button-container');
}

function renderOrderSummary(cart) {
  const summaryEl = document.getElementById('orderSummary');
  const subtotalEl = document.getElementById('subtotal');
  const totalEl = document.getElementById('orderTotal');
  const total = getCartTotal(cart);

  summaryEl.innerHTML = cart.map(item => `
    <div class="checkout-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="checkout-item-info">
        <p class="checkout-item-name">${item.name}</p>
        <p class="checkout-item-qty">Qty: ${item.quantity}</p>
      </div>
      <p class="checkout-item-price">${formatPrice(item.price * item.quantity)}</p>
    </div>
  `).join('');

  if (subtotalEl) subtotalEl.textContent = formatPrice(total);
  if (totalEl) totalEl.textContent = formatPrice(total);
}

function renderPaymentMethods(config) {
  const container = document.getElementById('paymentMethods');
  if (!container || !config?.providers) return;

  const providers = config.providers;
  const methods = [];
  const hasOnlinePayment = providers.flutterwave || providers.paypal || providers.stripe;

  if (providers.flutterwave) {
    methods.push(`
      <label class="payment-option">
        <input type="radio" name="payment" value="flutterwave" checked>
        <div class="payment-option-content">
          <strong>Flutterwave</strong>
          <span>Card, MTN Mobile Money, Airtel Money (Rwanda)</span>
        </div>
      </label>
    `);
  }

  if (providers.paypal) {
    methods.push(`
      <label class="payment-option">
        <input type="radio" name="payment" value="paypal">
        <div class="payment-option-content">
          <strong>PayPal</strong>
          <span>Pay with your PayPal account</span>
        </div>
      </label>
    `);
  }

  if (providers.stripe) {
    methods.push(`
      <label class="payment-option">
        <input type="radio" name="payment" value="stripe">
        <div class="payment-option-content">
          <strong>Stripe</strong>
          <span>Credit & debit cards (international)</span>
        </div>
      </label>
    `);
  }

  methods.push(`
    <label class="payment-option">
      <input type="radio" name="payment" value="whatsapp"${!hasOnlinePayment ? ' checked' : ''}>
      <div class="payment-option-content">
        <strong>WhatsApp Order</strong>
        <span>Pay via Mobile Money — message us at +250 786 698 491</span>
      </div>
    </label>
  `);

  container.innerHTML = methods.join('');

  if (providers.paypal) {
    loadPayPalSDK(providers.paypal.client_id, providers.paypal.mode);
  }
}

function loadPayPalSDK(clientId, mode) {
  if (document.getElementById('paypal-sdk')) return;

  const script = document.createElement('script');
  script.id = 'paypal-sdk';
  script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD${mode === 'sandbox' ? '&buyer-country=US' : ''}`;
  document.body.appendChild(script);
}

function getCustomerDetails() {
  const form = document.querySelector('#checkoutForm');
  const data = new FormData(form);
  return {
    firstName: data.get('firstName')?.trim(),
    lastName: data.get('lastName')?.trim(),
    email: data.get('email')?.trim(),
    phone: data.get('phone')?.trim(),
    address: data.get('address')?.trim(),
    city: data.get('city')?.trim(),
    country: data.get('country')?.trim() || 'RW',
  };
}

function generateTxRef() {
  return 'MIR-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function handleCheckout(e) {
  e.preventDefault();

  const cart = getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty');
    return;
  }

  const customer = getCustomerDetails();
  if (!customer.email || !customer.phone) {
    showToast('Please fill in your email and phone number');
    return;
  }

  const method = document.querySelector('input[name="payment"]:checked')?.value;
  const payBtn = document.getElementById('payBtn');
  payBtn.disabled = true;
  payBtn.textContent = 'Processing...';

  try {
    switch (method) {
      case 'flutterwave':
        await payWithFlutterwave(cart, customer);
        break;
      case 'paypal':
        showToast('Use the PayPal button below to complete payment');
        break;
      case 'stripe':
        await payWithStripe(cart, customer);
        break;
      case 'whatsapp':
        payWithWhatsApp(cart, customer);
        break;
      default:
        showToast('Please select a payment method');
    }
  } catch (err) {
    showToast(err.message || 'Payment failed. Please try again.');
  } finally {
    payBtn.disabled = false;
    payBtn.textContent = 'Complete Payment';
  }
}

async function payWithFlutterwave(cart, customer) {
  const publicKey = paymentConfig?.providers?.flutterwave?.public_key;
  if (!publicKey || publicKey.includes('your-public-key')) {
    throw new Error('Flutterwave keys not configured. Edit api/config.local.php');
  }

  if (typeof FlutterwaveCheckout === 'undefined') {
    await loadScript('https://checkout.flutterwave.com/v3.js');
  }

  const total = getCartTotal(cart);
  const txRef = generateTxRef();
  const currency = paymentConfig.currency || 'USD';

  return new Promise((resolve, reject) => {
    FlutterwaveCheckout({
      public_key: publicKey,
      tx_ref: txRef,
      amount: total,
      currency: currency,
      payment_options: 'card,mobilemoneyrwanda,ussd,banktransfer',
      customer: {
        email: customer.email,
        phone_number: customer.phone.replace(/\s/g, ''),
        name: `${customer.firstName} ${customer.lastName}`,
      },
      customizations: {
        title: 'Made in Rwanda Crochet',
        description: cart.map(i => i.name).join(', ').substring(0, 100),
        logo: '',
      },
      meta: {
        address: customer.address,
        city: customer.city,
      },
      callback: async (response) => {
        if (response.status === 'successful') {
          await verifyFlutterwavePayment(response.transaction_id);
          clearCart();
          window.location.href = `payment-success.html?provider=flutterwave&ref=${txRef}`;
          resolve();
        } else {
          reject(new Error('Payment was not completed'));
        }
      },
      onclose: () => {
        const btn = document.getElementById('payBtn');
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Complete Payment';
        }
      },
    });
  });
}

async function verifyFlutterwavePayment(transactionId) {
  const res = await fetch('api/verify-flutterwave.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transaction_id: transactionId }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Payment verification failed');
  }
  return data;
}

async function payWithStripe(cart, customer) {
  const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '');

  const res = await fetch('api/stripe-create-session.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: cart,
      email: customer.email,
      base_url: baseUrl,
    }),
  });
  const data = await res.json();
  if (!data.success || !data.url) {
    throw new Error(data.message || 'Failed to start Stripe checkout');
  }

  window.location.href = data.url;
}

function payWithWhatsApp(cart, customer) {
  const total = getCartTotal(cart);
  const items = cart.map(i => `• ${i.name} x${i.quantity} — ${formatPrice(i.price * i.quantity)}`).join('\n');
  const message = encodeURIComponent(
    `Hello Made in Rwanda Crochet! I'd like to place an order:\n\n${items}\n\n*Total: ${formatPrice(total)}*\n\nName: ${customer.firstName} ${customer.lastName}\nEmail: ${customer.email}\nPhone: ${customer.phone}\nAddress: ${customer.address}, ${customer.city}\n\nI'd like to pay via Mobile Money.`
  );
  window.open(`https://wa.me/250786698491?text=${message}`, '_blank');
  showToast('Opening WhatsApp to complete your order');
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// Payment success page verification
async function initPaymentSuccess() {
  const params = new URLSearchParams(window.location.search);
  const provider = params.get('provider');

  if (provider === 'stripe') {
    const sessionId = params.get('session_id');
    if (sessionId) {
      try {
        const res = await fetch('api/verify-stripe.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        });
        const data = await res.json();
        if (data.success) {
          clearCart();
          document.getElementById('paymentDetails').textContent =
            `Amount paid: ${formatPrice(data.amount)} ${data.currency}`;
        }
      } catch {
        document.getElementById('paymentDetails').textContent =
          'Your payment is being processed.';
      }
    }
  }

  if (provider === 'flutterwave' || provider === 'paypal') {
    clearCart();
    const ref = params.get('ref');
    if (ref) {
      document.getElementById('paymentDetails').textContent = `Reference: ${ref}`;
    }
  }
}

if (document.getElementById('paymentSuccess')) {
  initPaymentSuccess();
}
