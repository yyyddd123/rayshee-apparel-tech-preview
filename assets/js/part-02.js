(function () {
  'use strict';
  function initCartButtons() {
    const api = window.Rayshee;
    if (!api) return;
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-add-sample]');
      if (!button) return;
      event.preventDefault();
      const form = button.closest('[data-product-options]');
      const get = (name) => form ? form.querySelector(`[name="${name}"]`)?.value : '';
      const item = {
        id: button.dataset.addSample,
        name: button.dataset.sampleName,
        template: button.dataset.template || 'A',
        color: get('color') || 'Default',
        size: get('size') || 'Mixed sizes',
        logo: get('logo') || 'Blank + Label',
        qty: Number(get('quantity') || 1),
        price: Number(button.dataset.samplePrice || 0)
      };
      const cart = api.readCart();
      const signature = [item.id, item.color, item.size, item.logo].join('|');
      const existing = cart.find((entry) => entry.signature === signature);
      if (existing) existing.qty += item.qty;
      else cart.push({ ...item, signature });
      api.writeCart(cart);
      api.openModal('cart-added-modal');
    });
  }

  function renderCart() {
    const api = window.Rayshee;
    const list = document.querySelector('[data-cart-list]');
    if (!api || !list) return;
    const cart = api.readCart();
    const subtotalNode = document.querySelector('[data-cart-subtotal]');
    if (!cart.length) {
      list.innerHTML = `<div class="empty-state"><h3>Your sample cart is empty.</h3><p>Select a product detail page to add a physical sample.</p><a class="btn primary" href="${api.link('products/index.html')}">VIEW ALL PRODUCTS</a></div>`;
      if (subtotalNode) subtotalNode.textContent = 'To be confirmed';
      const checkout = document.querySelector('[data-checkout-link]');
      if (checkout) checkout.setAttribute('aria-disabled', 'true');
      return;
    }
    list.innerHTML = cart.map((item, index) => `
      <article class="cart-line">
        <div class="visual product-${(index % 6) + 1}" aria-hidden="true"></div>
        <div>
          <h3>${api.escapeHtml(item.name)}</h3>
          <p class="muted">${api.escapeHtml(item.color)} · ${api.escapeHtml(item.size)} · ${api.escapeHtml(item.logo)}</p>
          <div class="qty" aria-label="Quantity controls">
            <button type="button" data-cart-decrease="${index}" aria-label="Decrease quantity">−</button>
            <span>${item.qty}</span>
            <button type="button" data-cart-increase="${index}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="btn outline small" type="button" data-cart-remove="${index}">REMOVE</button>
      </article>`).join('');
    if (subtotalNode) subtotalNode.textContent = 'Confirmed at checkout';
  }

  function initCartPage() {
    const page = document.querySelector('[data-cart-page]');
    if (!page || !window.Rayshee) return;
    const api = window.Rayshee;
    renderCart();
    page.addEventListener('click', (event) => {
      const cart = api.readCart();
      const increase = event.target.closest('[data-cart-increase]');
      const decrease = event.target.closest('[data-cart-decrease]');
      const remove = event.target.closest('[data-cart-remove]');
      if (increase) cart[Number(increase.dataset.cartIncrease)].qty += 1;
      if (decrease) {
        const index = Number(decrease.dataset.cartDecrease);
        cart[index].qty = Math.max(1, cart[index].qty - 1);
      }
      if (remove) cart.splice(Number(remove.dataset.cartRemove), 1);
      if (increase || decrease || remove) {
        api.writeCart(cart);
        renderCart();
      }
    });
  }

  function initCheckout() {
    const form = document.querySelector('form[data-checkout-form]');
    if (!form || !window.Rayshee) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      window.Rayshee.writeCart([]);
      window.Rayshee.openModal('order-success-modal');
      form.reset();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initCartButtons();
    initCartPage();
    initCheckout();
  });
})();