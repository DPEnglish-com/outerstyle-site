/* =========================================================================
   外在 OuterStyle 宣传站 · 交互
   与 WorkoutLoop / PaperEcho 两站同一套写法：每次动效都要能一句话说明理由，
   全部一次性、不循环。无滚动劫持、无循环动画、无视差。零依赖。

   滚动相关的四件事（进度线、导航状态、导航滑块、时间轴当前步）
   共用一个 scroll 监听 + 一个 rAF，避免四个监听各自触发重排。
   ========================================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- 阅读进度细线 ---- */
  function makeReadProgress() {
    if (reduceMotion) return null;

    var bar = document.createElement("div");
    bar.className = "read-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    return function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var ratio = max > 0 ? Math.min(doc.scrollTop / max, 1) : 0;
      bar.style.transform = "scaleX(" + ratio + ")";
    };
  }

  /* ---- 导航滚动状态 ---- */
  function makeHeaderState() {
    var header = document.getElementById("site-header");
    if (!header) return null;
    return function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
  }

  /* ---- 导航滑块：当前在哪个区块 ---- */
  function makeNavSpy() {
    var nav = document.getElementById("site-nav");
    if (!nav) return null;

    var marker = nav.querySelector(".nav-marker");
    var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    if (!marker || !links.length) return null;

    var pairs = links.map(function (a) {
      var id = a.getAttribute("href").slice(1);
      var section = document.getElementById(id);
      return section ? { link: a, section: section } : null;
    }).filter(Boolean);
    if (!pairs.length) return null;

    var current = null;

    function place(link) {
      var base = parseFloat(
        window.getComputedStyle(marker).getPropertyValue("--nav-base")
      ) || 240;
      marker.style.setProperty("--nav-x", link.offsetLeft + "px");
      marker.style.setProperty("--nav-scale", String(link.offsetWidth / base));
      marker.classList.add("is-on");
    }

    function update() {
      var line = window.scrollY + window.innerHeight * 0.34;
      var active = null;
      for (var i = 0; i < pairs.length; i++) {
        if (pairs[i].section.offsetTop <= line) active = pairs[i];
      }
      if (active === current) return;
      if (current) {
        current.link.classList.remove("is-active");
        current.link.removeAttribute("aria-current");
      }
      current = active;
      if (current) {
        current.link.classList.add("is-active");
        current.link.setAttribute("aria-current", "true");
        place(current.link);
      } else {
        marker.classList.remove("is-on");
      }
    }

    window.addEventListener("resize", function () {
      if (current) place(current.link);
    }, { passive: true });

    return update;
  }

  /* ---- 时间轴：当前读到第几步 ---- */
  function makeStepsSpy() {
    var list = document.getElementById("steps");
    if (!list) return null;

    var items = Array.prototype.slice.call(list.children);
    if (!items.length) return null;

    var current = null;

    function update() {
      var line = window.innerHeight * 0.42;
      var active = null;
      for (var i = 0; i < items.length; i++) {
        if (items[i].getBoundingClientRect().top <= line) active = items[i];
      }
      if (items[0].getBoundingClientRect().top > line) active = null;
      if (active === current) return;
      current = active;
      items.forEach(function (li) { li.classList.toggle("is-current", li === current); });
    }

    return update;
  }

  /* ---- 首屏分段入场 ---- */
  function initRise() {
    var items = document.querySelectorAll(".rise");
    if (!items.length) return;

    if (reduceMotion) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add("is-in"); });
      return;
    }
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        Array.prototype.forEach.call(items, function (el) { el.classList.add("is-in"); });
      });
    });
  }

  /* ---- 入场揭示：用 IntersectionObserver，每个元素只揭示一次 ---- */
  function initReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (e) { return e.isIntersecting; });
      batch.forEach(function (entry, i) {
        var el = entry.target;
        el.style.transitionDelay = (i * 70) + "ms";
        el.classList.add("is-visible");
        observer.unobserve(el);
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px"
    });

    Array.prototype.forEach.call(items, function (el) { observer.observe(el); });

    /* 安全网：观察器在某些环境可能始终不报告可见，元素就会一直停在
       opacity:0。只放行"此刻已经在视口内、却仍没被揭示"的元素，
       不无差别放行，否则滚动揭示等于没有。 */
    window.setTimeout(function () {
      var vh = window.innerHeight || 0;
      var degenerate = vh < 200;
      Array.prototype.forEach.call(items, function (el) {
        if (el.classList.contains("is-visible")) return;
        var r = el.getBoundingClientRect();
        var inView = r.top < vh && r.bottom > 0;
        if (degenerate || inView) {
          el.style.transitionDelay = "0ms";
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      });
    }, 1200);
  }

  /* ---- 截图解码失败兜底 ---- */
  function initShotFallback() {
    var imgs = document.querySelectorAll(".shot img");
    Array.prototype.forEach.call(imgs, function (img) {
      img.addEventListener("error", function () {
        var fig = img.closest(".shot");
        if (fig) fig.classList.add("is-broken");
      });
    });
  }

  /* ---- 页脚年份 ---- */
  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function init() {
    var updaters = [
      makeReadProgress(),
      makeHeaderState(),
      makeNavSpy(),
      makeStepsSpy()
    ].filter(Boolean);

    if (updaters.length) {
      var ticking = false;
      function run() {
        updaters.forEach(function (fn) { fn(); });
        ticking = false;
      }
      function onScroll() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(run);
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      run();
    }

    initRise();
    initReveal();
    initShotFallback();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
