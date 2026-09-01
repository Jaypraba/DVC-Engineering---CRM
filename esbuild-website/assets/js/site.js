/* ES Build — navigation behaviour.
   In Framer this is replaced by the built-in Navigation Bar component +
   a Menu overlay; see FRAMER-BUILD-GUIDE.md. */
(function () {
  "use strict";

  var body = document.body;
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Services dropdown: hover/focus on desktop, click to expand on mobile.
  var menus = Array.prototype.slice.call(document.querySelectorAll(".has-menu"));
  var desktop = window.matchMedia("(min-width: 1041px)");

  function closeAll(except) {
    menus.forEach(function (m) {
      if (m !== except) {
        m.setAttribute("data-open", "false");
        var b = m.querySelector("button");
        if (b) b.setAttribute("aria-expanded", "false");
      }
    });
  }

  menus.forEach(function (menu) {
    var button = menu.querySelector("button");
    if (!button) return;

    button.addEventListener("click", function (e) {
      e.preventDefault();
      var open = menu.getAttribute("data-open") === "true";
      closeAll(menu);
      menu.setAttribute("data-open", String(!open));
      button.setAttribute("aria-expanded", String(!open));
    });

    menu.addEventListener("mouseenter", function () {
      if (desktop.matches) { closeAll(menu); menu.setAttribute("data-open", "true"); button.setAttribute("aria-expanded", "true"); }
    });
    menu.addEventListener("mouseleave", function () {
      if (desktop.matches) { menu.setAttribute("data-open", "false"); button.setAttribute("aria-expanded", "false"); }
    });
    menu.addEventListener("focusout", function (e) {
      if (desktop.matches && !menu.contains(e.relatedTarget)) {
        menu.setAttribute("data-open", "false");
        button.setAttribute("aria-expanded", "false");
      }
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    closeAll(null);
    if (body.classList.contains("nav-open")) {
      body.classList.remove("nav-open");
      if (toggle) { toggle.setAttribute("aria-expanded", "false"); toggle.focus(); }
    }
  });

  document.addEventListener("click", function (e) {
    if (desktop.matches && !e.target.closest(".has-menu")) closeAll(null);
  });

  // Reset mobile menu state when resizing back to desktop.
  desktop.addEventListener("change", function (ev) {
    if (ev.matches) {
      body.classList.remove("nav-open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
      closeAll(null);
    }
  });
})();
