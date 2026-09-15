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