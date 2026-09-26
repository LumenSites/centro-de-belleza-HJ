(function () {
  var WA = "https://wa.me/529621066907";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Promociones vigentes. Deja el arreglo vacío si no hay una promo confirmada.
  // Al agregar una, se muestra sola en la sección. No uses precios viejos.
  // { service, price, validity, note, featured }
  var promotions = [];

  function waLink(message) {
    return WA + "?text=" + encodeURIComponent(message);
  }

  function initWhatsApp() {
    document.querySelectorAll("[data-wa]").forEach(function (link) {
      var message = link.getAttribute("data-wa");
      if (!message) return;
      link.href = waLink(message);
    });
  }

  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.querySelector(".nav-panel");
    if (!toggle || !panel) return;
    var label = toggle.querySelector(".sr-only");

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      panel.classList.toggle("is-open", open);
      panel.inert = !open;
      document.body.classList.toggle("menu-open", open);
      if (label) label.textContent = open ? "Cerrar menú" : "Abrir menú";
      if (open) {
        var first = panel.querySelector("a");
        if (first) first.focus();
      }
    }

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      setOpen(!open);
      if (!toggle.getAttribute("aria-expanded") || toggle.getAttribute("aria-expanded") === "false") {
        toggle.focus();
      }
    });

    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    var desktop = window.matchMedia("(min-width: 980px)");
    var onDesktop = function (event) {
      if (event.matches) setOpen(false);
    };
    if (desktop.addEventListener) desktop.addEventListener("change", onDesktop);
  }

  function initReveals() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-in");
      });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  function initNavSpy() {
    var links = document.querySelectorAll("a.js-spy");
    var sections = document.querySelectorAll("main section[id]");
    if (!links.length || !sections.length || !("IntersectionObserver" in window)) return;

    var current = "";
    var observer = new IntersectionObserver(
      function (entries) {
        var visible = entries
          .filter(function (entry) {
            return entry.isIntersecting;
          })
          .sort(function (a, b) {
            return b.intersectionRatio - a.intersectionRatio;
          })[0];
        if (!visible) return;
        var id = visible.target.id;
        if (id === current) return;
        current = id;
        links.forEach(function (link) {
          if (link.getAttribute("href") === "#" + id) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      },
      { rootMargin: "-30% 0px -45% 0px", threshold: [0.15, 0.35, 0.6] }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function initFaq() {
    var buttons = document.querySelectorAll(".faq-btn");
    buttons.forEach(function (button) {
      var panel = document.getElementById(button.getAttribute("aria-controls"));
      if (!panel) return;
      panel.inert = true;
      panel.setAttribute("aria-hidden", "true");

      button.addEventListener("click", function () {
        var open = button.getAttribute("aria-expanded") === "true";
        var item = button.closest(".faq-item");
        button.setAttribute("aria-expanded", open ? "false" : "true");
        if (item) item.classList.toggle("is-open", !open);
        panel.inert = open;
        panel.setAttribute("aria-hidden", open ? "true" : "false");
      });
    });
  }

  function initPromos() {
    var slot = document.getElementById("promo-slot");
    if (!slot || !promotions.length) return;

    var grid = document.createElement("div");
    grid.className = "promo-grid";

    promotions.forEach(function (promo) {
      if (!promo || !promo.service) return;
      var card = document.createElement("article");
      card.className = "promo-card" + (promo.featured ? " is-featured" : "");

      var kicker = document.createElement("p");
      kicker.className = "promo-kicker";
      kicker.textContent = promo.validity ? promo.validity : "Consulta vigencia";

      var title = document.createElement("h3");
      title.textContent = promo.service;

      var price = document.createElement("p");
      price.className = "promo-price";
      price.textContent = promo.price ? promo.price : "Consulta precio";

      card.appendChild(kicker);
      card.appendChild(title);
      card.appendChild(price);

      if (promo.note) {
        var note = document.createElement("p");
        note.textContent = promo.note;
        card.appendChild(note);
      }

      var link = document.createElement("a");
      link.className = "btn btn-primary";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.href = waLink(
        "Hola Centro de Belleza HJ, me gustaría información sobre la promoción de " + promo.service + "."
      );
      link.textContent = "Consultar promo";
      card.appendChild(link);
      grid.appendChild(card);
    });

    if (!grid.childElementCount) return;
    slot.replaceChildren(grid);
  }

  function initStickyCta() {
    var bar = document.querySelector(".sticky-cta");
    var targets = [document.getElementById("cita"), document.querySelector(".footer")].filter(Boolean);
    if (!bar || !targets.length || !("IntersectionObserver" in window)) return;
    var visible = new Set();
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
        var hide = visible.size > 0;
        bar.classList.toggle("is-tucked", hide);
        bar.inert = hide;
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach(function (target) {
      observer.observe(target);
    });
  }

  initWhatsApp();
  initHeader();
  initMenu();
  initReveals();
  initNavSpy();
  initFaq();
  initPromos();
  initStickyCta();
})();
