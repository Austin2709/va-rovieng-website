const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");
const currentYear = document.querySelector("#current-year");
const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));
const heroPhotoTrigger = document.querySelector(".hero-photo-trigger");
const previousSlideButton = document.querySelector(".slide-previous");
const nextSlideButton = document.querySelector(".slide-next");
const fieldCarousels = Array.from(document.querySelectorAll(".field-carousel"));
const fieldCarouselAutoplayInterval = 4000;
const pageScrollbarTrack = document.querySelector(".page-scrollbar-track");
const pageScrollbarLine = pageScrollbarTrack?.querySelector(".page-scrollbar-line");
const photoDialog = document.querySelector(".photo-dialog");
const photoDialogClose = document.querySelector(".photo-dialog-close");
const photoDialogImage = document.querySelector("#photo-dialog-image");
const photoDialogCaption = document.querySelector("#photo-dialog-caption");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let activeSlideIndex = 0;

function setMenuOpen(isOpen) {
  if (!menuToggle || !primaryNav) {
    return;
  }

  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu",
  );
  primaryNav.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });
}

window.addEventListener("resize", () => {
  if (
    window.matchMedia("(min-width: 901px)").matches &&
    menuToggle?.getAttribute("aria-expanded") === "true"
  ) {
    setMenuOpen(false);
    if (document.activeElement === menuToggle) {
      primaryNav?.querySelector("a")?.focus();
    }
  }
});

if (primaryNav) {
  primaryNav.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      setMenuOpen(false);
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && photoDialog?.open) {
    event.preventDefault();
    photoDialog.close();
    return;
  }

  if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

function openPhotoViewer(source, caption) {
  if (!photoDialog || !photoDialogImage || !photoDialogCaption) {
    return;
  }

  photoDialogImage.src = source;
  photoDialogImage.alt = caption;
  photoDialogCaption.textContent = caption;
  if (!photoDialog.open) {
    photoDialog.showModal();
  }
}

function getMaximumPageScroll() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function updatePageScrollbar() {
  if (!pageScrollbarTrack || !pageScrollbarLine) {
    return;
  }

  const maximumScroll = getMaximumPageScroll();
  const progress = maximumScroll > 0 ? window.scrollY / maximumScroll : 0;
  pageScrollbarTrack.style.setProperty(
    "--scroll-offset",
    `${progress * pageScrollbarLine.clientHeight}px`,
  );
  pageScrollbarTrack.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
}

function scrollToPagePosition(clientY) {
  if (!pageScrollbarLine) {
    return;
  }

  const lineBounds = pageScrollbarLine.getBoundingClientRect();
  if (lineBounds.height === 0) {
    return;
  }

  const progress = Math.max(0, Math.min(1, (clientY - lineBounds.top) / lineBounds.height));
  window.scrollTo({ top: progress * getMaximumPageScroll(), behavior: "auto" });
}

function showSlide(index) {
  if (heroSlides.length === 0) {
    return;
  }

  activeSlideIndex = (index + heroSlides.length) % heroSlides.length;
  const activeSlide = heroSlides[activeSlideIndex];
  const caption = activeSlide.dataset.caption || "Project photo";

  heroSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === activeSlideIndex);
  });

  if (heroPhotoTrigger) {
    heroPhotoTrigger.setAttribute("aria-label", `View photo: ${caption}`);
  }
}

fieldCarousels.forEach((carousel) => {
  const frame = carousel.querySelector(".field-carousel-frame");
  const slides = Array.from(carousel.querySelectorAll(".field-carousel-slide"));
  const counter = carousel.querySelector(".field-carousel-counter");
  const autoplayToggle = carousel.querySelector(".field-carousel-autoplay-toggle");
  if (!frame || slides.length === 0) {
    return;
  }

  let isDragging = false;
  let isInteracting = false;
  let didDrag = false;
  let isAutoplayPaused = false;
  let activeIndex = 0;
  let dragStartX = 0;
  let dragStartScrollLeft = 0;

  const updateCounterAnnouncement = () => {
    if (!counter) {
      return;
    }

    const otherElementFocused =
      carousel.contains(document.activeElement) && document.activeElement !== autoplayToggle;
    counter.setAttribute(
      "aria-live",
      prefersReducedMotion || isAutoplayPaused || otherElementFocused ? "polite" : "off",
    );
  };

  const shouldPauseAutoplay = () => {
    const bounds = carousel.getBoundingClientRect();
    const otherElementFocused =
      carousel.contains(document.activeElement) && document.activeElement !== autoplayToggle;
    const mouseHoveringFrame =
      window.matchMedia("(hover: hover)").matches && frame.matches(":hover");

    return (
      isAutoplayPaused ||
      isInteracting ||
      mouseHoveringFrame ||
      otherElementFocused ||
      document.hidden ||
      photoDialog?.open === true ||
      bounds.bottom <= 0 ||
      bounds.top >= window.innerHeight
    );
  };

  const updateSlide = (index) => {
    activeIndex = Math.max(0, Math.min(index, slides.length - 1));
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.tabIndex = isActive ? 0 : -1;
    });

    if (counter) {
      counter.textContent = `${activeIndex + 1} / ${slides.length}`;
    }
    updateCounterAnnouncement();
  };

  if (autoplayToggle) {
    autoplayToggle.hidden = prefersReducedMotion || slides.length < 2;
    autoplayToggle.addEventListener("click", () => {
      isAutoplayPaused = !isAutoplayPaused;
      autoplayToggle.textContent = isAutoplayPaused ? "Resume" : "Pause";
      autoplayToggle.setAttribute(
        "aria-label",
        isAutoplayPaused ? "Resume automatic slide changes" : "Pause automatic slide changes",
      );
      updateCounterAnnouncement();
    });
  }

  carousel.addEventListener("focusin", updateCounterAnnouncement);
  carousel.addEventListener("focusout", () => {
    window.requestAnimationFrame(updateCounterAnnouncement);
  });

  slides.forEach((slide) => {
    const caption = slide.alt || "Carousel photo";
    slide.setAttribute("role", "button");
    slide.setAttribute("aria-label", `View full-size photo: ${caption}`);
    slide.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      openPhotoViewer(slide.currentSrc || slide.src, caption);
    });
  });

  frame.addEventListener("click", (event) => {
    if (didDrag) {
      didDrag = false;
      return;
    }

    if (event.detail === 0) {
      return;
    }

    const clickedSlide =
      slides.find((slide) => slide === event.target) ?? slides[activeIndex];
    openPhotoViewer(clickedSlide.currentSrc || clickedSlide.src, clickedSlide.alt || "Carousel photo");
  });

  frame.addEventListener("scroll", () => {
    const slideWidth = frame.clientWidth;
    if (slideWidth > 0) {
      updateSlide(Math.round(frame.scrollLeft / slideWidth));
    }
  });

  frame.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = Math.max(
      0,
      Math.min(activeIndex + direction, slides.length - 1),
    );
    frame.scrollTo({
      left: nextIndex * frame.clientWidth,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });

  frame.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    isInteracting = true;
    if (event.pointerType !== "mouse") {
      return;
    }

    isDragging = true;
    didDrag = false;
    dragStartX = event.clientX;
    dragStartScrollLeft = frame.scrollLeft;
    frame.classList.add("is-dragging");
    frame.setPointerCapture(event.pointerId);
  });

  frame.addEventListener("pointermove", (event) => {
    if (isDragging) {
      if (Math.abs(event.clientX - dragStartX) > 4) {
        didDrag = true;
      }
      frame.scrollLeft = dragStartScrollLeft - (event.clientX - dragStartX);
    }
  });

  const stopDrag = () => {
    isDragging = false;
    isInteracting = false;
    frame.classList.remove("is-dragging");
  };

  frame.addEventListener("pointerup", stopDrag);
  frame.addEventListener("pointercancel", stopDrag);
  frame.addEventListener("dragstart", (event) => event.preventDefault());
  updateSlide(0);

  if (!prefersReducedMotion && slides.length > 1) {
    window.setInterval(() => {
      if (shouldPauseAutoplay()) {
        return;
      }

      const nextIndex = (activeIndex + 1) % slides.length;
      frame.scrollTo({
        left: nextIndex * frame.clientWidth,
        behavior: nextIndex === 0 ? "auto" : "smooth",
      });
    }, fieldCarouselAutoplayInterval);
  }
});

if (pageScrollbarTrack && pageScrollbarLine) {
  let isDraggingScrollbar = false;
  let pendingPageScrollbarFrame = null;

  const schedulePageScrollbarUpdate = () => {
    if (pendingPageScrollbarFrame !== null) {
      return;
    }

    pendingPageScrollbarFrame = window.requestAnimationFrame(() => {
      pendingPageScrollbarFrame = null;
      updatePageScrollbar();
    });
  };

  pageScrollbarTrack.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    isDraggingScrollbar = true;
    pageScrollbarTrack.classList.add("is-dragging");
    pageScrollbarTrack.setPointerCapture(event.pointerId);
    pageScrollbarTrack.focus({ preventScroll: true });
    scrollToPagePosition(event.clientY);
    event.preventDefault();
  });

  pageScrollbarTrack.addEventListener("pointermove", (event) => {
    if (isDraggingScrollbar) {
      scrollToPagePosition(event.clientY);
    }
  });

  const stopScrollbarDrag = () => {
    isDraggingScrollbar = false;
    pageScrollbarTrack.classList.remove("is-dragging");
  };

  pageScrollbarTrack.addEventListener("pointerup", stopScrollbarDrag);
  pageScrollbarTrack.addEventListener("pointercancel", stopScrollbarDrag);
  pageScrollbarTrack.addEventListener("keydown", (event) => {
    const currentScroll = window.scrollY;
    const maximumScroll = getMaximumPageScroll();
    const arrowStep = Math.max(40, window.innerHeight * 0.1);
    let targetScroll;

    switch (event.key) {
      case "ArrowUp":
        targetScroll = currentScroll - arrowStep;
        break;
      case "ArrowDown":
        targetScroll = currentScroll + arrowStep;
        break;
      case "PageUp":
        targetScroll = currentScroll - window.innerHeight * 0.9;
        break;
      case "PageDown":
        targetScroll = currentScroll + window.innerHeight * 0.9;
        break;
      case "Home":
        targetScroll = 0;
        break;
      case "End":
        targetScroll = maximumScroll;
        break;
      default:
        return;
    }

    event.preventDefault();
    window.scrollTo({
      top: Math.max(0, Math.min(targetScroll, maximumScroll)),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });

  window.addEventListener("scroll", schedulePageScrollbarUpdate, { passive: true });
  window.addEventListener("resize", schedulePageScrollbarUpdate);
  window.addEventListener("load", schedulePageScrollbarUpdate);
  updatePageScrollbar();
}

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const revealTargets = document.querySelectorAll(
    ".field-update-inner, .focus-heading, .metal-card, .approach-grid, .closing-content, .presentation-heading, .presentation-outline",
  );
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.12 },
  );

  revealTargets.forEach((target) => {
    target.classList.add("motion-reveal");
    revealObserver.observe(target);
  });
}

if (heroPhotoTrigger) {
  heroPhotoTrigger.addEventListener("click", () => {
    const activeSlide = heroSlides[activeSlideIndex];
    if (activeSlide) {
      openPhotoViewer(activeSlide.src, activeSlide.dataset.caption || "Project photo");
    }
  });
}

previousSlideButton?.addEventListener("click", () => {
  showSlide(activeSlideIndex - 1);
});

nextSlideButton?.addEventListener("click", () => {
  showSlide(activeSlideIndex + 1);
});

document.querySelectorAll(".field-photo-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const source = trigger.dataset.photoSrc;
    const caption = trigger.dataset.photoCaption;
    if (source && caption) {
      openPhotoViewer(source, caption);
    }
  });
});

document.querySelectorAll(".brand-logo-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const logo = trigger.querySelector(".brand-logo");
    if (logo) {
      openPhotoViewer(logo.src, "VA ROVIENG CO.,LTD logo");
    }
  });
});

if (photoDialogClose && photoDialog) {
  photoDialogClose.addEventListener("click", () => {
    photoDialog.close();
  });
}

if (photoDialog) {
  photoDialog.addEventListener("click", (event) => {
    if (event.target === photoDialog) {
      photoDialog.close();
    }
  });
}

showSlide(activeSlideIndex);

if (heroSlides.length > 1 && !prefersReducedMotion) {
  window.setInterval(() => {
    if (!document.hidden) {
      showSlide(activeSlideIndex + 1);
    }
  }, 5000);
}

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}
