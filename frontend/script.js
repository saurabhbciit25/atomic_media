import { initScrollReveal, initParallax } from "./animations/scroll-effects.js";
import { initHoverEffects } from "./animations/hover-effects.js";
import { initPageTransitions } from "./animations/page-transitions.js";

const navToggle = document.querySelector(".nav-toggle");
const navMobile = document.querySelector(".nav-mobile");
const navShell = document.querySelector(".nav-shell");
const navClose = document.querySelector(".nav-close");
const navLinks = document.querySelectorAll("[data-target]");
const pageSections = document.querySelectorAll("main section[id]");
const mouseGlow = document.querySelector(".mouse-glow");

const posterFallback =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 1000'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23141416'/%3E%3Cstop offset='1' stop-color='%230a0a0c'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='1000' fill='url(%23g)'/%3E%3Ccircle cx='180' cy='220' r='220' fill='%23ff571a' fill-opacity='0.12'/%3E%3Ccircle cx='660' cy='140' r='180' fill='%23ffb59e' fill-opacity='0.12'/%3E%3C/svg%3E";

const ensurePoster = (video) => {
  if (!video || video.getAttribute("poster")) {
    return;
  }
  video.setAttribute("poster", posterFallback);
};

const syncNavState = () => {
  navShell?.classList.toggle("scrolled", window.scrollY > 24);
};

const setMenuState = (open) => {
  navToggle?.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("nav-open", open);
  navMobile?.setAttribute("aria-hidden", String(!open));
};

navToggle?.addEventListener("click", (event) => {
  event.stopPropagation();
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  setMenuState(!isOpen);
});

navClose?.addEventListener("click", (event) => {
  event.stopPropagation();
  setMenuState(false);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const target = link.getAttribute("data-target");
    if (!target) {
      return;
    }
    const section = document.getElementById(target);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setMenuState(false);
  });
});

navMobile?.addEventListener("click", (event) => {
  if (event.target === navMobile) {
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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuState(false);
  }
});

const initCinematicVideoSection = () => {
  const section = document.querySelector("[data-cinematic-video]");
  if (!section) {
    return;
  }

  const video = section.querySelector(".cinematic-video");
  const source = video?.querySelector("source[data-src]");
  const audioToggle = section.querySelector("[data-cinematic-audio-toggle]");

  if (!video) {
    return;
  }

  let isLoaded = false;
  let isVisible = false;

  const safePlay = () => {
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  const safePause = () => {
    if (!video.paused) {
      video.pause();
    }
  };

  const loadVideo = () => {
    if (isLoaded) {
      return;
    }
    const sourcePath = source?.dataset.src?.trim() || video.dataset.src?.trim();
    if (!sourcePath) {
      return;
    }
    ensurePoster(video);
    if (source) {
      source.src = sourcePath;
      source.removeAttribute("data-src");
    } else {
      video.src = sourcePath;
      video.removeAttribute("data-src");
    }
    video.setAttribute("preload", "metadata");
    video.load();
    isLoaded = true;
  };

  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.autoplay = true;
  video.setAttribute("muted", "");
  video.setAttribute("loop", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("autoplay", "");
  video.setAttribute("preload", "metadata");
  ensurePoster(video);

  video.addEventListener("loadeddata", () => {
    if (isVisible) {
      safePlay();
    }
  });

  const syncAudioToggle = () => {
    if (!audioToggle) {
      return;
    }
    const isMuted = video.muted;
    audioToggle.classList.toggle("is-unmuted", !isMuted);
    audioToggle.setAttribute("aria-pressed", String(!isMuted));
    audioToggle.setAttribute("aria-label", isMuted ? "Unmute video" : "Mute video");
    const label = audioToggle.querySelector(".cinematic-audio-toggle-label");
    if (label) {
      label.textContent = isMuted ? "UNMUTE" : "MUTE";
    }
  };

  audioToggle?.addEventListener("click", () => {
    loadVideo();
    video.muted = !video.muted;
    if (!video.muted) {
      video.volume = 1;
      safePlay();
    }
    syncAudioToggle();
  });

  syncAudioToggle();

  if (typeof IntersectionObserver === "undefined") {
    loadVideo();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.target !== section) {
          return;
        }

        const shouldPlay = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        isVisible = shouldPlay;

        if (shouldPlay) {
          loadVideo();
          safePlay();
          section.classList.add("is-playing");
          return;
        }

        safePause();
        section.classList.remove("is-playing");
      });
    },
    { threshold: [0, 0.35, 0.6] }
  );

  observer.observe(section);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      safePause();
      return;
    }

    if (isVisible) {
      safePlay();
    }
  });
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      navLinks.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("data-target") === entry.target.id
        );
      });
    });
  },
  { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
);

pageSections.forEach((section) => sectionObserver.observe(section));

syncNavState();
window.addEventListener("scroll", syncNavState, { passive: true });

window.addEventListener("mousemove", (event) => {
  if (!mouseGlow) {
    return;
  }
  mouseGlow.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
});

const initWorkShowcase = () => {
  const workCards = Array.from(document.querySelectorAll(".work-card"));
  if (!workCards.length) {
    return;
  }

  const videos = workCards
    .map((card) => {
      const video = card.querySelector(".work-video");
      const list = card.dataset.videos
        ? card.dataset.videos.split("|").map((item) => item.trim()).filter(Boolean)
        : [];
      const dataSrc = video?.dataset.src?.trim();
      const fallbackSrc = video?.getAttribute("src");
      const sources = list.length ? list : dataSrc ? [dataSrc] : fallbackSrc ? [fallbackSrc] : [];
      return {
        card,
        video,
        sources,
        index: 0,
        isSwitching: false,
        isLoaded: false,
      };
    })
    .filter((item) => item.video && item.sources.length);

  if (!videos.length) {
    return;
  }

  const safePlay = (video) => {
    if (!video || !video.paused) {
      return;
    }
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  const safePause = (video) => {
    if (!video || video.paused) {
      return;
    }
    video.pause();
  };

  const ensureVideoSource = (item) => {
    if (!item.video || item.isLoaded) {
      return;
    }
    ensurePoster(item.video);
    item.video.setAttribute("preload", "metadata");
    item.video.src = item.sources[item.index];
    item.video.load();
    item.isLoaded = true;
  };

  const switchVideo = (item, nextIndex) => {
    if (item.isSwitching) {
      return;
    }
    const total = item.sources.length;
    if (total < 2) {
      return;
    }
    ensureVideoSource(item);
    item.isSwitching = true;
    item.card.classList.add("is-switching");
    const targetIndex = typeof nextIndex === "number" ? nextIndex : (item.index + 1) % total;

    window.setTimeout(() => {
      item.index = targetIndex;
      item.video.src = item.sources[item.index];
      item.video.load();
      safePlay(item.video);
    }, 320);
  };

  videos.forEach((item) => {
    const { card, video, sources } = item;
    ensurePoster(video);
    video.setAttribute("preload", "none");
    video.loop = sources.length <= 1;
    if (sources.length > 1) {
      video.addEventListener("ended", () => switchVideo(item));
    }

    video.addEventListener("loadeddata", () => {
      card.classList.add("is-ready");
      if (item.isSwitching) {
        item.isSwitching = false;
        card.classList.remove("is-switching");
      }
    });
  });

  const itemsByCard = new Map(videos.map((item) => [item.card, item]));

  const preloadObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const item = itemsByCard.get(entry.target);
        if (!item) {
          return;
        }
        ensureVideoSource(item);
        preloadObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "200px 0px", threshold: 0 }
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const item = itemsByCard.get(entry.target);
        if (!item) {
          return;
        }
        if (entry.isIntersecting) {
          ensureVideoSource(item);
          safePlay(item.video);
        } else {
          safePause(item.video);
        }
      });
    },
    { threshold: 0.35 }
  );

  workCards.forEach((card) => {
    preloadObserver.observe(card);
    observer.observe(card);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      videos.forEach(({ video }) => safePause(video));
      return;
    }
    videos.forEach((item) => {
      if (item.isLoaded) {
        safePlay(item.video);
      }
    });
  });
};

const initWorksSlider = () => {
  const slider = document.querySelector("[data-works-slider]");
  if (!slider) {
    return;
  }

  const viewport = slider.querySelector(".works-slider-viewport");
  const slides = Array.from(slider.querySelectorAll(".works-slide"));
  const prevButton = slider.querySelector(".slider-btn.prev");
  const nextButton = slider.querySelector(".slider-btn.next");
  const progressBar = slider.querySelector(".slider-progress-bar");
  const currentLabel = slider.querySelector(".slider-index .current");
  const totalLabel = slider.querySelector(".slider-index .total");

  if (!viewport || !slides.length) {
    return;
  }

  if (totalLabel) {
    totalLabel.textContent = String(slides.length).padStart(2, "0");
  }

  const slideItems = slides
    .map((slide) => ({
      slide,
      video: slide.querySelector(".works-slide-video"),
      loaded: false,
    }))
    .filter((item) => item.video);

  const safePlay = (video) => {
    if (!video || !video.paused) {
      return;
    }
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  const safePause = (video) => {
    if (!video || video.paused) {
      return;
    }
    video.pause();
  };

  const loadVideo = (item) => {
    if (!item || item.loaded || !item.video) {
      return;
    }
    const source = item.video.dataset.src;
    if (!source) {
      return;
    }
    ensurePoster(item.video);
    item.video.setAttribute("preload", "metadata");
    item.video.src = source;
    item.video.load();
    item.loaded = true;
  };

  slideItems.forEach((item) => {
    ensurePoster(item.video);
    item.video.setAttribute("preload", "none");
    item.video.addEventListener("loadeddata", () => {
      item.slide.classList.add("is-ready");
    });
  });

  const lazyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const item = slideItems.find((candidate) => candidate.slide === entry.target);
        if (item) {
          loadVideo(item);
        }
      });
    },
    { root: viewport, rootMargin: "200px 0px", threshold: 0.1 }
  );

  const playObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const item = slideItems.find((candidate) => candidate.slide === entry.target);
        if (!item || !item.video) {
          return;
        }
        if (entry.isIntersecting) {
          loadVideo(item);
          safePlay(item.video);
        } else {
          safePause(item.video);
        }
      });
    },
    { root: viewport, threshold: 0.5 }
  );

  slideItems.forEach((item) => {
    lazyObserver.observe(item.slide);
    playObserver.observe(item.slide);
  });

  let activeIndex = -1;
  let pendingIndex = null;
  let autoTimer = null;
  let resumeTimer = null;
  let scrollTimer = null;
  const autoplayDelay = 6000;
  const resumeDelay = 5000;

  const setProgress = () => {
    if (!progressBar) {
      return;
    }
    progressBar.style.animation = "none";
    progressBar.offsetHeight;
    progressBar.style.animation = `slider-progress ${autoplayDelay}ms linear forwards`;
  };

  const setIndex = (index, force = false) => {
    if (!force && index === activeIndex) {
      return;
    }
    activeIndex = index;
    if (currentLabel) {
      currentLabel.textContent = String(index + 1).padStart(2, "0");
    }
    setProgress();
  };

  const getOffsetFor = (slide) => {
    const centerOffset = (viewport.clientWidth - slide.clientWidth) / 2;
    return Math.max(0, slide.offsetLeft - centerOffset);
  };

  const goTo = (index, behavior = "smooth") => {
    const normalized = (index + slides.length) % slides.length;
    const target = slides[normalized];
    if (!target) {
      return;
    }
    pendingIndex = normalized;
    viewport.scrollTo({ left: getOffsetFor(target), behavior });
    setIndex(normalized);
  };

  const getNearestIndex = () => {
    const center = viewport.scrollLeft + viewport.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    slides.forEach((slide, index) => {
      const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
      const distance = Math.abs(center - slideCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    return closestIndex;
  };

  const snapToNearest = () => {
    goTo(getNearestIndex());
  };

  const stopAutoplay = () => {
    if (!autoTimer) {
      return;
    }
    window.clearInterval(autoTimer);
    autoTimer = null;
    if (progressBar) {
      progressBar.style.animation = "none";
    }
  };

  const startAutoplay = () => {
    if (autoTimer || slides.length < 2) {
      setProgress();
      return;
    }
    autoTimer = window.setInterval(() => {
      goTo(activeIndex + 1);
    }, autoplayDelay);
    setProgress();
  };

  const handleInteraction = () => {
    stopAutoplay();
    pendingIndex = null;
    if (resumeTimer) {
      window.clearTimeout(resumeTimer);
    }
    resumeTimer = window.setTimeout(() => {
      startAutoplay();
    }, resumeDelay);
  };

  prevButton?.addEventListener("click", () => {
    handleInteraction();
    goTo(activeIndex - 1);
  });

  nextButton?.addEventListener("click", () => {
    handleInteraction();
    goTo(activeIndex + 1);
  });

  viewport.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }
    viewport.scrollLeft += event.deltaY;
    event.preventDefault();
    handleInteraction();
  }, { passive: false });

  let isDragging = false;
  let dragStartX = 0;
  let dragStartScroll = 0;

  viewport.addEventListener("pointerdown", (event) => {
    isDragging = true;
    dragStartX = event.clientX;
    dragStartScroll = viewport.scrollLeft;
    if (event.pointerId !== undefined) {
      viewport.setPointerCapture(event.pointerId);
    }
    viewport.classList.add("is-dragging");
    handleInteraction();
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!isDragging) {
      return;
    }
    const delta = event.clientX - dragStartX;
    viewport.scrollLeft = dragStartScroll - delta;
  });

  const endDrag = (event) => {
    if (!isDragging) {
      return;
    }
    isDragging = false;
    if (event.pointerId !== undefined && viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
    viewport.classList.remove("is-dragging");
    snapToNearest();
  };

  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
  viewport.addEventListener("pointerleave", endDrag);

  if (!("PointerEvent" in window)) {
    let isTouching = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartScroll = 0;

    viewport.addEventListener("touchstart", (event) => {
      if (event.touches.length !== 1) {
        return;
      }
      isTouching = true;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
      touchStartScroll = viewport.scrollLeft;
      handleInteraction();
    }, { passive: true });

    viewport.addEventListener("touchmove", (event) => {
      if (!isTouching || event.touches.length !== 1) {
        return;
      }
      const deltaX = event.touches[0].clientX - touchStartX;
      const deltaY = event.touches[0].clientY - touchStartY;
      if (Math.abs(deltaX) <= Math.abs(deltaY)) {
        return;
      }
      event.preventDefault();
      viewport.scrollLeft = touchStartScroll - deltaX;
    }, { passive: false });

    const endTouch = () => {
      if (!isTouching) {
        return;
      }
      isTouching = false;
      snapToNearest();
    };

    viewport.addEventListener("touchend", endTouch);
    viewport.addEventListener("touchcancel", endTouch);
  }

  viewport.addEventListener("scroll", () => {
    if (scrollTimer) {
      window.clearTimeout(scrollTimer);
    }
    scrollTimer = window.setTimeout(() => {
      const nearest = getNearestIndex();
      if (pendingIndex !== null && nearest !== pendingIndex) {
        return;
      }
      setIndex(nearest);
      pendingIndex = null;
    }, 120);
  });

  window.addEventListener("resize", () => {
    goTo(activeIndex, "auto");
  });

  slideItems.slice(0, 2).forEach((item) => {
    item.video.setAttribute("preload", "auto");
    loadVideo(item);
    safePlay(item.video);
  });
  goTo(0, "auto");
  startAutoplay();
};

const initStackMobileCarousel = () => {
  const carousel = document.querySelector(".stack-grid");
  if (!carousel) {
    return;
  }

  const cards = Array.from(carousel.querySelectorAll(".stack-card"));
  const mobileQuery = window.matchMedia("(max-width: 767.98px)");
  const autoplayDelay = 4000;
  const resumeDelay = 3000;
  let activeIndex = 0;
  let autoTimer = null;
  let resumeTimer = null;
  let scrollTimer = null;
  let isPaused = false;

  if (cards.length < 2) {
    return;
  }

  const getOffsetFor = (card) => {
    const centerOffset = (carousel.clientWidth - card.clientWidth) / 2;
    return Math.max(0, card.offsetLeft - centerOffset);
  };

  const goTo = (index, behavior = "smooth") => {
    if (!mobileQuery.matches) {
      return;
    }
    activeIndex = (index + cards.length) % cards.length;
    carousel.scrollTo({ left: getOffsetFor(cards[activeIndex]), behavior });
  };

  const getNearestIndex = () => {
    const center = carousel.scrollLeft + carousel.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(center - cardCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  const stopAutoplay = () => {
    if (!autoTimer) {
      return;
    }
    window.clearInterval(autoTimer);
    autoTimer = null;
  };

  const startAutoplay = () => {
    if (!mobileQuery.matches || autoTimer || isPaused) {
      return;
    }
    autoTimer = window.setInterval(() => {
      goTo(activeIndex + 1);
    }, autoplayDelay);
  };

  const pauseForInteraction = () => {
    if (!mobileQuery.matches) {
      return;
    }
    isPaused = true;
    carousel.classList.add("is-user-interacting");
    stopAutoplay();
    if (resumeTimer) {
      window.clearTimeout(resumeTimer);
    }
  };

  const resumeAfterInteraction = () => {
    if (!mobileQuery.matches) {
      return;
    }
    activeIndex = getNearestIndex();
    carousel.classList.remove("is-user-interacting");
    if (resumeTimer) {
      window.clearTimeout(resumeTimer);
    }
    resumeTimer = window.setTimeout(() => {
      isPaused = false;
      startAutoplay();
    }, resumeDelay);
  };

  const syncMode = () => {
    stopAutoplay();
    if (resumeTimer) {
      window.clearTimeout(resumeTimer);
      resumeTimer = null;
    }
    isPaused = false;
    carousel.classList.remove("is-user-interacting");

    if (!mobileQuery.matches) {
      carousel.scrollTo({ left: 0, behavior: "auto" });
      activeIndex = 0;
      return;
    }

    goTo(activeIndex, "auto");
    startAutoplay();
  };

  carousel.addEventListener("touchstart", pauseForInteraction, { passive: true });
  carousel.addEventListener("touchend", resumeAfterInteraction, { passive: true });
  carousel.addEventListener("touchcancel", resumeAfterInteraction, { passive: true });
  carousel.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") {
      return;
    }
    pauseForInteraction();
  });
  carousel.addEventListener("pointerup", resumeAfterInteraction);
  carousel.addEventListener("pointercancel", resumeAfterInteraction);

  carousel.addEventListener("scroll", () => {
    if (!mobileQuery.matches) {
      return;
    }
    if (scrollTimer) {
      window.clearTimeout(scrollTimer);
    }
    scrollTimer = window.setTimeout(() => {
      activeIndex = getNearestIndex();
    }, 120);
  }, { passive: true });

  mobileQuery.addEventListener?.("change", syncMode);
  window.addEventListener("resize", () => {
    if (mobileQuery.matches) {
      goTo(activeIndex, "auto");
    }
  });

  syncMode();
};

initPageTransitions();
initScrollReveal();
initHoverEffects();
initParallax();
initWorkShowcase();
initWorksSlider();
initStackMobileCarousel();
initCinematicVideoSection();
