// 外在 OuterStyle：主题、滚动进度、入场、试一课、应用界面切换。无外部请求。
(function () {
  'use strict';

  var root = document.documentElement;
  var themeBtn = document.getElementById('theme-toggle');

  function syncTheme() {
    var dark = root.getAttribute('data-theme') === 'dark';
    if (themeBtn) themeBtn.setAttribute('aria-label', dark ? '切换为浅色' : '切换为深色');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0C0C0C' : '#F4F1EA');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('outerstyle-theme', next); } catch (e) {}
      syncTheme();
    });
  }
  syncTheme();

  var head = document.querySelector('.site-head');
  var bar = document.getElementById('progress-bar');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset || 0;
    if (head) head.classList.toggle('is-stuck', y > 8);
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(1, Math.max(0, y / h)) : 0;
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }
  }

  function requestScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      onScroll();
      ticking = false;
    });
  }

  onScroll();
  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll, { passive: true });

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  var items = document.querySelectorAll('.reveal');
  if (items.length) {
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
      items.forEach(function (el) { io.observe(el); });
    }
  }

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.pstep'));
  var frames = Array.prototype.slice.call(document.querySelectorAll('.preview-frame'));

  function showScreen(id, focus) {
    tabs.forEach(function (tab) {
      var on = tab.getAttribute('data-screen') === id;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
    });
    frames.forEach(function (frame) {
      var on = frame.id === 'screen-' + id;
      frame.classList.toggle('is-active', on);
      if (on) frame.removeAttribute('aria-hidden');
      else frame.setAttribute('aria-hidden', 'true');
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () {
      showScreen(tab.getAttribute('data-screen'));
    });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      if (next !== null) {
        e.preventDefault();
        showScreen(tabs[next].getAttribute('data-screen'), true);
      }
    });
  });

  var looks = Array.prototype.slice.call(document.querySelectorAll('.look'));
  var verdict = document.getElementById('verdict');
  var verdictText = document.getElementById('verdict-text');
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var copy = {
    a: 'A。砖红只落在鞋上，面积不到一成；视线有落点，整体还是安静的。',
    b: 'A。B 的砖红铺满上装，视线先被衣服抓住；鞋子再浅，也接不住。'
  };

  function choose(btn) {
    var choice = btn.getAttribute('data-choice');
    looks.forEach(function (el) {
      el.setAttribute('aria-pressed', el === btn ? 'true' : 'false');
    });
    if (!verdict || !verdictText) return;

    var wasOpen = verdict.classList.contains('is-open');
    verdict.removeAttribute('inert');
    verdict.setAttribute('aria-hidden', 'false');
    verdictText.textContent = copy[choice] || copy.a;
    verdict.classList.add('is-open');

    if (verdictText.animate && !reduced) {
      verdictText.animate(
        [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
        { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' }
      );
    }

    if (!wasOpen && window.innerWidth <= 900) {
      var top = verdict.getBoundingClientRect().top + window.pageYOffset - 84;
      window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
    }
  }

  looks.forEach(function (btn) {
    btn.addEventListener('click', function () { choose(btn); });
  });
})();
