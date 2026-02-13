const CONTENT = {
  ui: {
    pageTitle: "Наші валентинки",
    backButton: "Назад",
    navLetter: "Лист",
    navMoments: "Наші моменти",
    letterSectionTitle: "Лист, що оживає",
    envelopeTapLabel: "Натисни, щоб відкрити",
    envelopeOpenedLabel: "Лист відкрито",
    letterCardTitle: "Твій лист",
    surpriseButton: "Відкрити сюрприз",
    momentsSectionTitle: "Мапа наших моментів",
    momentsSubtitle: "Маленький маршрут місць, де наші серця зупинялись.",
    galleryTitle: "Наша галерея сюрпризів",
  },
  letter: {
    greeting: "Моя любов,",
    intro:
      "Кожен день із тобою схожий на маленький затишний світ, де все стає теплішим і світлішим.",
    reasons: [
      "Ти робиш навіть звичайні дні чарівними.",
      "Ти слухаєш мене всім серцем.",
      "Ти перетворюєш маленькі миті на найулюбленіші спогади.",
    ],
    closing: "Назавжди твоя людина. З Днем святого Валентина.",
  },
  gallery: [
    {
      id: "g1",
      type: "image",
      caption: "Наше перше фото разом.",
      url: "", // TODO: Add real image path, e.g. "assets/first-photo.jpg"
      alt: "Плейсхолдер для нашого першого фото",
    },
    {
      id: "g2",
      type: "image",
      caption: "Теплий спогад із нашого побачення.",
      url: "", // TODO: Add real image path
      alt: "Плейсхолдер для спогаду про побачення",
    },
    {
      id: "g3",
      type: "video",
      caption: "Коротке відео з нашого улюбленого дня.",
      embedUrl: "", // TODO: Add a real video embed URL when ready
    },
    {
      id: "g4",
      type: "image",
      caption: "Наша маленька пригода, яку ми не забули.",
      url: "", // TODO: Add real image path
      alt: "Плейсхолдер для спогаду про пригоду",
    },
  ],
  moments: [
    {
      id: "m1",
      title: "Перша зустріч",
      date: "Додай дату",
      description: "Мить, коли все раптом стало дуже теплим і рідним.",
      imagePlaceholder: "", // TODO: Add image URL/path for this moment
      icon: "\uD83C\uDF38",
    },
    {
      id: "m2",
      title: "Перше побачення",
      date: "Додай дату",
      description: "Трохи хвилювання, багато усмішок і вечір, що промайнув занадто швидко.",
      imagePlaceholder: "", // TODO: Add image URL/path for this moment
      icon: "\uD83C\uDF70",
    },
    {
      id: "m3",
      title: "Перший поцілунок",
      date: "Додай дату",
      description: "Мить, у якій час ніби зупинився лише для нас двох.",
      imagePlaceholder: "", // TODO: Add image URL/path for this moment
      icon: "\uD83D\uDC8B",
    },
    {
      id: "m4",
      title: "Найсмішніший момент",
      date: "Додай дату",
      description: "Той спогад, де ми сміялися до сліз і досі його згадуємо.",
      imagePlaceholder: "", // TODO: Add image URL/path for this moment
      icon: "\uD83D\uDE02",
    },
  ],
};

const ui = {
  pageTitle: document.querySelector("title"),
  tabs: Array.from(document.querySelectorAll(".tab")),
  tabLetter: document.getElementById("tabLetter"),
  tabMoments: document.getElementById("tabMoments"),
  backButton: document.getElementById("backButton"),
  sections: {
    letterSection: document.getElementById("letterSection"),
    momentsSection: document.getElementById("momentsSection"),
  },
  letterTitle: document.getElementById("letterTitle"),
  letterCardTitle: document.getElementById("letterCardTitle"),
  momentsTitle: document.getElementById("momentsTitle"),
  momentsSubtitle: document.getElementById("momentsSubtitle"),
  envelopeButton: document.getElementById("envelopeButton"),
  envelopeLabel: document.getElementById("envelopeLabel"),
  envelopeShell: document.querySelector(".envelope-shell"),
  typedMessage: document.getElementById("typedMessage"),
  typingCursor: document.getElementById("typingCursor"),
  surpriseButton: document.getElementById("surpriseButton"),
  galleryTitle: document.getElementById("galleryTitle"),
  galleryModal: document.getElementById("galleryModal"),
  galleryViewport: document.getElementById("galleryViewport"),
  galleryCaption: document.getElementById("galleryCaption"),
  galleryPrev: document.getElementById("galleryPrev"),
  galleryNext: document.getElementById("galleryNext"),
  momentModal: document.getElementById("momentModal"),
  momentModalTitle: document.getElementById("momentModalTitle"),
  momentModalDate: document.getElementById("momentModalDate"),
  momentModalDescription: document.getElementById("momentModalDescription"),
  momentModalMedia: document.getElementById("momentModalMedia"),
  timelineList: document.getElementById("timelineList"),
  floatingHearts: document.getElementById("floatingHearts"),
  burstLayer: document.getElementById("burstLayer"),
};

const state = {
  currentSection: "letterSection",
  sectionHistory: ["letterSection"],
  envelopeOpened: false,
  typingStarted: false,
  galleryIndex: 0,
  activeModalId: null,
};

init();

function init() {
  setupViewportHeightVar();
  hydrateStaticText();
  createFloatingHearts(10);
  renderTimeline();
  setupNavigation();
  setupEnvelope();
  setupModals();
  setupGalleryControls();
  updateBackButtonState();
}

function setupViewportHeightVar() {
  const updateViewportHeight = () => {
    document.documentElement.style.setProperty("--app-vh", `${window.innerHeight}px`);
  };

  updateViewportHeight();
  window.addEventListener("resize", updateViewportHeight, { passive: true });
  window.addEventListener("orientationchange", updateViewportHeight);
}

function hydrateStaticText() {
  ui.pageTitle.textContent = CONTENT.ui.pageTitle;
  ui.backButton.textContent = CONTENT.ui.backButton;
  ui.tabLetter.textContent = CONTENT.ui.navLetter;
  ui.tabMoments.textContent = CONTENT.ui.navMoments;
  ui.letterTitle.textContent = CONTENT.ui.letterSectionTitle;
  ui.envelopeLabel.textContent = CONTENT.ui.envelopeTapLabel;
  ui.letterCardTitle.textContent = CONTENT.ui.letterCardTitle;
  ui.surpriseButton.textContent = CONTENT.ui.surpriseButton;
  ui.momentsTitle.textContent = CONTENT.ui.momentsSectionTitle;
  ui.momentsSubtitle.textContent = CONTENT.ui.momentsSubtitle;
  ui.galleryTitle.textContent = CONTENT.ui.galleryTitle;
}

function setupNavigation() {
  ui.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.target;
      if (!target) return;
      switchSection(target, true);
    });
  });

  ui.backButton.addEventListener("click", () => {
    if (state.activeModalId) {
      closeModal(state.activeModalId);
      return;
    }

    if (state.sectionHistory.length > 1) {
      state.sectionHistory.pop();
      const previous = state.sectionHistory[state.sectionHistory.length - 1];
      switchSection(previous, false);
      return;
    }

    if (state.currentSection !== "letterSection") {
      state.sectionHistory = ["letterSection"];
      switchSection("letterSection", false);
    }
  });
}

function switchSection(sectionId, pushToHistory) {
  if (!ui.sections[sectionId] || sectionId === state.currentSection) return;

  Object.entries(ui.sections).forEach(([id, section]) => {
    const isActive = id === sectionId;
    section.classList.toggle("is-active", isActive);
    section.setAttribute("aria-hidden", String(!isActive));
  });

  ui.tabs.forEach((tab) => {
    const isCurrent = tab.dataset.target === sectionId;
    tab.classList.toggle("is-active", isCurrent);
    tab.setAttribute("aria-selected", String(isCurrent));
  });

  state.currentSection = sectionId;

  if (pushToHistory) {
    const last = state.sectionHistory[state.sectionHistory.length - 1];
    if (last !== sectionId) state.sectionHistory.push(sectionId);
  }

  updateBackButtonState();
}

function updateBackButtonState() {
  const canGoBack = state.activeModalId || state.sectionHistory.length > 1 || state.currentSection !== "letterSection";
  ui.backButton.disabled = !canGoBack;
  ui.backButton.setAttribute("aria-disabled", String(!canGoBack));
}

function setupEnvelope() {
  ui.envelopeButton.addEventListener("click", () => {
    if (state.envelopeOpened) return;

    state.envelopeOpened = true;
    ui.envelopeShell.classList.add("is-open");
    ui.envelopeButton.setAttribute("aria-expanded", "true");
    ui.envelopeLabel.textContent = CONTENT.ui.envelopeOpenedLabel;

    burstFromElement(ui.envelopeShell, 16);

    window.setTimeout(() => {
      startTypewriter();
    }, 640);
  });
}

function startTypewriter() {
  if (state.typingStarted) return;
  state.typingStarted = true;

  const { greeting, intro, reasons, closing } = CONTENT.letter;
  const message = `${greeting}\n\n${intro}\n\n${reasons.map((item) => `\u2022 ${item}`).join("\n")}\n\n${closing}`;

  typeWriter(message, ui.typedMessage, {
    speed: 28,
    onDone: () => {
      ui.typingCursor.classList.add("hidden");
      ui.surpriseButton.classList.remove("hidden");
      ui.surpriseButton.classList.add("revealed");
    },
  });
}

function typeWriter(text, targetEl, options) {
  let index = 0;
  targetEl.textContent = "";
  ui.typingCursor.classList.remove("hidden");

  const tick = () => {
    targetEl.textContent = text.slice(0, index);
    index += 1;

    if (index <= text.length) {
      const char = text.charAt(index - 1);
      const pause = getTypingDelay(char, options.speed);
      window.setTimeout(tick, pause);
      return;
    }

    if (typeof options.onDone === "function") options.onDone();
  };

  tick();
}

function getTypingDelay(char, baseSpeed) {
  if (char === "\n") return 160;
  if (char === "." || char === "!" || char === "?") return 170;
  if (char === ",") return 100;
  return baseSpeed + Math.floor(Math.random() * 24);
}

function setupModals() {
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-close-modal]");
    if (!trigger) return;
    const modalId = trigger.getAttribute("data-close-modal");
    if (modalId) closeModal(modalId);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.activeModalId) {
      closeModal(state.activeModalId);
    }
  });

  ui.surpriseButton.addEventListener("click", (event) => {
    burstFromPoint(event.clientX, event.clientY, 18, ui.surpriseButton);
    state.galleryIndex = 0;
    renderGalleryItem();
    openModal("galleryModal");
  });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.remove("hidden");
  state.activeModalId = modalId;
  document.body.classList.add("modal-open");
  updateBackButtonState();
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.add("hidden");

  const anyOpenModal = document.querySelector(".modal:not(.hidden)");
  if (!anyOpenModal) {
    state.activeModalId = null;
    document.body.classList.remove("modal-open");
  } else {
    state.activeModalId = anyOpenModal.id;
  }

  updateBackButtonState();
}

function setupGalleryControls() {
  ui.galleryPrev.addEventListener("click", () => {
    state.galleryIndex = wrapIndex(state.galleryIndex - 1, CONTENT.gallery.length);
    renderGalleryItem();
  });

  ui.galleryNext.addEventListener("click", () => {
    state.galleryIndex = wrapIndex(state.galleryIndex + 1, CONTENT.gallery.length);
    renderGalleryItem();
  });
}

function renderGalleryItem() {
  const item = CONTENT.gallery[state.galleryIndex];
  if (!item) return;

  ui.galleryViewport.innerHTML = "";
  const wrapper = document.createElement("article");
  wrapper.className = "gallery-item";
  wrapper.appendChild(createMediaElement(item, "gallery"));
  ui.galleryViewport.appendChild(wrapper);

  ui.galleryCaption.textContent = `${item.caption} (${state.galleryIndex + 1}/${CONTENT.gallery.length})`;
}

function renderTimeline() {
  ui.timelineList.innerHTML = "";

  CONTENT.moments.forEach((moment) => {
    const item = document.createElement("li");
    item.className = "timeline-item";

    const pin = document.createElement("button");
    pin.type = "button";
    pin.className = "timeline-pin";
    pin.setAttribute("aria-label", `Відкрити спогад: ${moment.title}`);
    pin.dataset.id = moment.id;
    pin.textContent = moment.icon || "\u2764";

    const card = document.createElement("article");
    card.className = "timeline-card";
    card.innerHTML = `
      <h3 class="moment-title">${escapeHtml(moment.title)}</h3>
      <p class="moment-meta">${escapeHtml(moment.date || "Дату ще не додано")}</p>
      <p class="moment-preview">${escapeHtml(moment.description)}</p>
    `;

    pin.addEventListener("click", (event) => {
      const allPins = ui.timelineList.querySelectorAll(".timeline-pin");
      allPins.forEach((node) => node.classList.remove("is-selected"));
      pin.classList.add("is-selected");

      populateMomentModal(moment);
      openModal("momentModal");
      burstFromPoint(event.clientX, event.clientY, 16, pin);
    });

    item.appendChild(pin);
    item.appendChild(card);
    ui.timelineList.appendChild(item);
  });
}

function populateMomentModal(moment) {
  ui.momentModalTitle.textContent = `${moment.icon ? `${moment.icon} ` : ""}${moment.title}`;
  ui.momentModalDate.textContent = moment.date || "Мить поза часом";
  ui.momentModalDescription.textContent = moment.description;
  ui.momentModalMedia.innerHTML = "";

  const mediaItem = {
    type: "image",
    caption: `Медіа моменту: ${moment.title}`,
    url: moment.imagePlaceholder,
    alt: `Плейсхолдер для: ${moment.title}`,
  };

  ui.momentModalMedia.appendChild(createMediaElement(mediaItem, "moment"));
}

function createMediaElement(item, context) {
  if (item.type === "image" && item.url) {
    const img = document.createElement("img");
    img.src = item.url;
    img.alt = item.alt || item.caption || "Фото спогаду";
    img.loading = "lazy";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.style.borderRadius = "12px";
    return img;
  }

  if (item.type === "video" && item.embedUrl) {
    const iframe = document.createElement("iframe");
    iframe.src = item.embedUrl;
    iframe.title = item.caption || "Відео спогаду";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "0";
    iframe.style.borderRadius = "12px";
    return iframe;
  }

  const placeholder = document.createElement("div");
  placeholder.className = `media-placeholder ${item.type === "video" ? "video" : ""}`;

  if (item.type === "video") {
    placeholder.innerHTML = `
      <div>
        <strong>Місце для відео</strong><br />
        <small>TODO: Замінити на iframe через <code>embedUrl</code></small>
      </div>
    `;
    return placeholder;
  }

  placeholder.innerHTML = `
    <div>
      <strong>${context === "moment" ? "Місце для фото моменту" : "Місце для фото"}</strong><br />
      <small>TODO: Замінити на реальне зображення через <code>url</code></small>
    </div>
  `;
  return placeholder;
}

function createFloatingHearts(count) {
  ui.floatingHearts.innerHTML = "";
  for (let i = 0; i < count; i += 1) {
    const heart = document.createElement("span");
    heart.className = "float-heart";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.bottom = `${-20 - Math.random() * 50}px`;
    heart.style.animationDuration = `${12 + Math.random() * 14}s`;
    heart.style.animationDelay = `${-Math.random() * 12}s`;
    ui.floatingHearts.appendChild(heart);
  }
}

function burstFromElement(element, count) {
  const rect = element.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  burstFromPoint(x, y, count);
}

function burstFromPoint(x, y, count = 14, fallbackElement) {
  const colors = ["#ff80b8", "#f36ea5", "#ffb6d3", "#f8a2cd", "#ffd1e4", "#ff7ca0"];
  const total = Math.max(12, Math.min(20, count));
  let pointX = x;
  let pointY = y;

  if ((!pointX && pointX !== 0) || (!pointY && pointY !== 0) || (pointX === 0 && pointY === 0)) {
    if (fallbackElement) {
      const rect = fallbackElement.getBoundingClientRect();
      pointX = rect.left + rect.width / 2;
      pointY = rect.top + rect.height / 2;
    }
  }

  pointX = typeof pointX === "number" ? pointX : window.innerWidth / 2;
  pointY = typeof pointY === "number" ? pointY : window.innerHeight / 2;

  for (let i = 0; i < total; i += 1) {
    const particle = document.createElement("span");
    const isHeart = Math.random() > 0.45;
    particle.className = `burst-particle${isHeart ? " heart" : ""}`;
    particle.style.setProperty("--x", `${pointX}px`);
    particle.style.setProperty("--y", `${pointY}px`);
    particle.style.setProperty("--particle-color", colors[Math.floor(Math.random() * colors.length)]);

    const angle = ((Math.PI * 2) / total) * i + (Math.random() * 0.4 - 0.2);
    const distance = 45 + Math.random() * 70;
    particle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);

    particle.addEventListener(
      "animationend",
      () => {
        particle.remove();
      },
      { once: true }
    );

    ui.burstLayer.appendChild(particle);
  }
}

function wrapIndex(value, length) {
  return (value + length) % length;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
