(function () {
  "use strict";

  const loader = document.querySelector(".page-loader");
  const navShell = document.querySelector(".nav-shell");
  const navToggle = document.querySelector(".nav-toggle");
  const navMobile = document.querySelector(".nav-mobile");
  const navClose = document.querySelector(".nav-close");
  const mouseGlow = document.querySelector(".mouse-glow");

  const syncNavState = () => {
    navShell?.classList.toggle("scrolled", window.scrollY > 24);
  };

  const setMenuState = (open) => {
    navToggle?.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
    navMobile?.setAttribute("aria-hidden", String(!open));
  };

  window.addEventListener("load", () => {
    loader?.classList.add("hidden");
  });

  syncNavState();
  window.addEventListener("scroll", syncNavState, { passive: true });

  navToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    setMenuState(navToggle.getAttribute("aria-expanded") !== "true");
  });

  navClose?.addEventListener("click", (event) => {
    event.stopPropagation();
    setMenuState(false);
  });

  navMobile?.addEventListener("click", (event) => {
    if (event.target === navMobile) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
    }
  });

  document.addEventListener("click", (event) => {
    const isOpen = document.body.classList.contains("nav-open");
    if (!isOpen) {
      return;
    }

    const target = event.target;
    if (target instanceof Element && navShell?.contains(target)) {
      return;
    }

    setMenuState(false);
  });

  document.querySelectorAll("[data-nav-href]").forEach((button) => {
    button.addEventListener("click", () => {
      const href = button.getAttribute("data-nav-href");
      if (!href) {
        return;
      }
      setMenuState(false);
      window.location.href = href;
    });
  });

  window.addEventListener("mousemove", (event) => {
    if (!mouseGlow) {
      return;
    }
    mouseGlow.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px 120px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    document.querySelectorAll(".reveal").forEach((element) => {
      element.classList.add("in-view");
    });
  }
})();
