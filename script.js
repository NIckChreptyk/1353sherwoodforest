/* 1353 Sherwood Forest — interactions */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- nav state ---------- */
  var nav = document.getElementById("nav");
  var fab = document.getElementById("fab");
  var hero = document.getElementById("hero");

  function onScroll() {
    var past = window.scrollY > 40;
    nav.classList.toggle("is-scrolled", past);
    if (fab) fab.classList.toggle("is-visible", window.scrollY > hero.offsetHeight * 0.75);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById("navBurger");
  var navLinks = document.getElementById("navLinks");
  burger.addEventListener("click", function () {
    var open = nav.classList.toggle("menu-open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  });
  navLinks.addEventListener("click", function (e) {
    if (e.target.tagName === "A" && nav.classList.contains("menu-open")) {
      nav.classList.remove("menu-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  });

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- animated counters ---------- */
  var counters = document.querySelectorAll(".stat__num");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var format = el.getAttribute("data-format");
    var dur = 1600;
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      var val = Math.round(target * eased);
      el.textContent = format === "comma" ? val.toLocaleString("en-CA") : String(val);
      if (p < 1) requestAnimationFrame(frame);
    }
    if (reduceMotion) {
      el.textContent = format === "comma" ? target.toLocaleString("en-CA") : String(target);
    } else {
      requestAnimationFrame(frame);
    }
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- flip cards (tap for touch devices) ---------- */
  document.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("click", function () {
      var flipped = card.classList.toggle("is-flipped");
      card.setAttribute("aria-pressed", flipped ? "true" : "false");
    });
  });

  /* ---------- unit toggle (ft default, m optional) ---------- */
  var unitButtons = document.querySelectorAll(".unit");
  var dimEls = document.querySelectorAll(".room__dims");

  function mToFtIn(m) {
    var totalIn = m / 0.0254;
    var ft = Math.floor(totalIn / 12);
    var inch = Math.round(totalIn % 12);
    if (inch === 12) { ft += 1; inch = 0; }
    return ft + "′" + (inch > 0 ? inch + "″" : "");
  }
  function fmt(m, unit) {
    return unit === "m"
      ? m.toFixed(2).replace(/0$/, "") + " m"
      : mToFtIn(m);
  }
  function renderDims(unit) {
    dimEls.forEach(function (el) {
      var l = parseFloat(el.getAttribute("data-l"));
      var w = parseFloat(el.getAttribute("data-w"));
      el.textContent = fmt(l, unit) + " × " + fmt(w, unit);
    });
    unitButtons.forEach(function (btn) {
      var active = btn.getAttribute("data-unit") === unit;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
    try { localStorage.setItem("sherwood-unit", unit); } catch (e) {}
  }
  unitButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      renderDims(btn.getAttribute("data-unit"));
    });
  });
  var savedUnit = "ft";
  try { savedUnit = localStorage.getItem("sherwood-unit") || "ft"; } catch (e) {}
  renderDims(savedUnit === "m" ? "m" : "ft");

  /* ---------- gallery filters ---------- */
  var filterButtons = document.querySelectorAll(".filter");
  var tiles = Array.prototype.slice.call(document.querySelectorAll(".tile"));
  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      filterButtons.forEach(function (b) { b.classList.toggle("is-active", b === btn); });
      tiles.forEach(function (tile) {
        var cats = tile.getAttribute("data-cat") || "";
        var show = f === "all" || cats.indexOf(f) !== -1;
        tile.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* ---------- lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var lbClose = document.getElementById("lbClose");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");
  var current = -1;

  function visibleTiles() {
    return tiles.filter(function (t) { return !t.classList.contains("is-hidden"); });
  }
  function openLightbox(tile) {
    var vis = visibleTiles();
    current = vis.indexOf(tile);
    if (current === -1) return;
    showTile(vis[current]);
    lightbox.hidden = false;
    requestAnimationFrame(function () { lightbox.classList.add("is-open"); });
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }
  function showTile(tile) {
    var img = tile.querySelector("img");
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = tile.getAttribute("data-caption") || "";
  }
  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(function () { lightbox.hidden = true; }, 320);
  }
  function step(dir) {
    var vis = visibleTiles();
    if (!vis.length) return;
    current = (current + dir + vis.length) % vis.length;
    showTile(vis[current]);
  }
  tiles.forEach(function (tile) {
    tile.addEventListener("click", function () { openLightbox(tile); });
  });
  lbClose.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", function () { step(-1); });
  lbNext.addEventListener("click", function () { step(1); });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
  /* swipe */
  var touchX = null;
  lightbox.addEventListener("touchstart", function (e) {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 48) step(dx > 0 ? -1 : 1);
    touchX = null;
  }, { passive: true });

  /* ---------- gentle parallax on full-bleed images ---------- */
  var bleeds = Array.prototype.slice.call(document.querySelectorAll(".bleed"));
  if (!reduceMotion && bleeds.length && window.matchMedia("(min-width: 720px)").matches) {
    var ticking = false;
    function parallax() {
      bleeds.forEach(function (section) {
        var img = section.querySelector(".bleed__img");
        var rect = section.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        var progress = (rect.top + rect.height / 2 - window.innerHeight / 2) /
                       (window.innerHeight / 2 + rect.height / 2);
        img.style.transform = "translateY(" + (progress * -5.5) + "%)";
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
    }, { passive: true });
    parallax();
  }
})();