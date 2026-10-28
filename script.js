/* script.js — Азтай савар, Лаб 6 */
(function () {
  "use strict";

  var root = document.documentElement;
  var CLOSE_MS = 8000;                       /* утас/гараар нээсэн карт буцах хугацаа (мс) */

  /* ---------- 0. Loader: хуудас ачаалагдтал харуулаад, дараа нь картуудыг дараалан гаргана ---------- */
  var MIN_LOADER_MS = 450;                   /* loader хамгийн багадаа энэ хугацаанд харагдана */
  var startedAt = performance.now();
  document.body.setAttribute("aria-busy", "true");

  function finishLoading() {
    if (root.classList.contains("is-loaded")) { return; }
    var wait = Math.max(0, MIN_LOADER_MS - (performance.now() - startedAt));
    window.setTimeout(function () {
      root.classList.add("is-loaded");       /* CSS: loader алга болж, stagger animation эхэлнэ */
      document.body.removeAttribute("aria-busy");
    }, wait);
  }

  if (document.readyState === "complete") { finishLoading(); }
  else { window.addEventListener("load", finishLoading); }
  window.setTimeout(finishLoading, 5000);    /* зураг удаан ачаалагдвал ч гацахгүй */

  /* ---------- 1. Dark / Light горим (хадгалдаг) ---------- */
  var themeButton = document.getElementById("themeToggle");
  var themeIcon = document.getElementById("themeIcon");
  var themeText = document.getElementById("themeText");

  function applyTheme(mode) {
    var dark = mode === "dark";
    root.setAttribute("data-theme", dark ? "dark" : "light");
    if (themeIcon) { themeIcon.textContent = dark ? "\u2600" : "\u263E"; }   /* ☀ / ☾ */
    if (themeText) { themeText.textContent = dark ? "Өдрийн горим" : "Шөнийн горим"; }
    try { localStorage.setItem("theme", mode); } catch (e) {}
  }

  applyTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");

  if (themeButton) {
    themeButton.addEventListener("click", function () {
      applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  /* ---------- 2. Stagger: картуудад --i (0,1,2...) автоматаар оноох ---------- */
  document.querySelectorAll(".pets__grid, .offers").forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (item, index) {
      item.style.setProperty("--i", index);
    });
  });

  /* ---------- 3. 3D flip card ----------
     Хулгана картад хүрэхэд өөрөө эргэж, холдоход буцна.
     Утас/гар (touch, keyboard): дарахад эргэж, 8 секундын дараа чимээгүй буцна. */
  var timers = new WeakMap();

  Array.prototype.forEach.call(document.querySelectorAll(".flip-card"), function (card) {
    var button = card.querySelector(".flip-card__button");
    var back = card.querySelector(".flip-card__back");
    var baseLabel = button.getAttribute("aria-label");
    var backText = back.textContent.replace(/\s+/g, " ").trim();
    var lastInput = "";

    function isFlipped() { return card.classList.contains("is-flipped"); }

    function flip(on, autoClose) {
      window.clearTimeout(timers.get(card));
      card.classList.toggle("is-flipped", on);
      button.setAttribute("aria-pressed", String(on));
      /* aria-label нь доторх текстийг далдалдаг тул ар талын текстийг нэмж өгнө */
      button.setAttribute("aria-label", on ? baseLabel + ". " + backText : baseLabel);
      if (on && autoClose) {
        timers.set(card, window.setTimeout(function () { flip(false, false); }, CLOSE_MS));
      }
    }

    /* Хулгана / үзэг: hover */
    card.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "touch") { return; }
      flip(true, false);
    });
    card.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "touch") { return; }
      flip(false, false);
    });

    card.addEventListener("pointerdown", function (e) { lastInput = e.pointerType; });

    /* Touch ба гар (Enter/Space): дарахад эргүүлнэ. Хулганаар дарахад hover аль хэдийн эргүүлсэн тул алгасна */
    button.addEventListener("click", function () {
      if (lastInput === "mouse" || lastInput === "pen") { lastInput = ""; return; }
      flip(!isFlipped(), true);
    });

    button.addEventListener("keydown", function (event) {
      lastInput = "key";
      if (event.key === "Escape" && isFlipped()) { flip(false, false); }
    });
  });
}());