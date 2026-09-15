(function () {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const root = document.body.dataset.root || './';
  const link = (path) => `${root}${path}`.replace(/\/+/g, '/');
  const cartKey = 'rayshee-sample-cart-v1';

  function readCart() {
    try { return JSON.parse(localStorage.getItem(cartKey)) || []; } catch (_) { return []; }
  }
  function writeCart(items) {
    localStorage.setItem(cartKey, JSON.stringify(items));
    updateCartCount();
  }
  function updateCartCount() {
    const count = readCart().reduce((total, item) => total + Number(item.qty || 0), 0);
    $$('[data-cart-count]').forEach((node) => {
      node.textContent = count ? String(count).padStart(2, '0') : '00';
      node.hidden = count === 0;
    });
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  }
  window.Rayshee = { $, $$, link, cartKey, readCart, writeCart, updateCartCount, escapeHtml };

  function initHeader() {
    const toggle = $('.mobile-toggle');
    const nav = $('.mobile-nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
      document.body.classList.toggle('menu-open', !open);
    });
    $$('.mobile-nav .nav-item.has-children > .nav-link').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const item = button.closest('.nav-item');
        const open = item.classList.toggle('open');
        button.setAttribute('aria-expanded', String(open));
      });
    });
    $$('.mobile-nav a').forEach((anchor) => anchor.addEventListener('click', () => {
      if (!anchor.closest('.dropdown')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
      }
    }));
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    const focusTarget = modal.querySelector('button, a, input, summary');
    if (focusTarget) focusTarget.focus();
  }
  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (!$('.modal.open')) document.body.classList.remove('modal-open');
  }
  window.Rayshee.openModal = openModal;
  window.Rayshee.closeModal = closeModal;

  function initModals() {
    $$('[data-open-modal]').forEach((trigger) => trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openModal(trigger.dataset.openModal);
    }));
    $$('.modal').forEach((modal) => {
      $$('[data-close-modal]', modal).forEach((button) => button.addEventListener('click', () => closeModal(modal)));
      modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(modal); });
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeModal($('.modal.open'));
    });
  }

  function showSuccess(form, message) {
    let status = $('.form-status', form);
    if (!status) {
      status = document.createElement('div');
      status.className = 'form-status';
      form.appendChild(status);
    }
    status.textContent = message;
    status.classList.add('show');
    status.setAttribute('role', 'status');
  }

  function initForms() {
    $$('form[data-demo-form]').forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const type = form.dataset.demoForm;
        if (type === 'catalog') {
          openModal('catalog-success-modal');
          form.reset();
          return;
        }
        const message = type === 'inquiry'
          ? 'Thank you. Your project details have been received. Our team will review them during working hours.'
          : 'Thank you. Your message has been received.';
        showSuccess(form, message);
        form.reset();
      });
    });
  }

  function initReveal() {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const items = $$('[data-reveal]');
    if (!items.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    items.forEach((item) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(18px)';
      item.style.transition = 'opacity .55s ease, transform .55s ease';
      observer.observe(item);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initModals();
    initForms();
    updateCartCount();
    initReveal();
    $$('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });
  });
})();
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