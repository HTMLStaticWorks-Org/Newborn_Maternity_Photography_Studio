/* ==========================================================================
   ATELIER SOLÈNE — Luxury Newborn & Maternity Photography Studio Template
   Main JavaScript: Theme, RTL, Fixed Navbar, Gallery, Lightbox, Dashboard & Forms
   ========================================================================== */

(function () {
  'use strict';

  const THEME_STORAGE_KEY = 'atelier_solene_theme';
  const DIR_STORAGE_KEY = 'atelier_solene_dir';

  /* --------------------------------------------------------------------------
     1. THEME & RTL MANAGEMENT (Light/Dark + LTR/RTL with localStorage)
     -------------------------------------------------------------------------- */
  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    document.querySelectorAll('.theme-toggle-btn').forEach((btn) => {
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
      }
      btn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
      btn.setAttribute(
        'title',
        theme === 'dark' ? 'Switch to Ivory Light Mode' : 'Switch to Espresso Dark Mode'
      );
    });
  }

  function getPreferredDir() {
    const saved = localStorage.getItem(DIR_STORAGE_KEY);
    if (saved === 'rtl' || saved === 'ltr') {
      return saved;
    }
    return 'ltr';
  }

  function applyDirection(dir) {
    document.documentElement.setAttribute('dir', dir);
    localStorage.setItem(DIR_STORAGE_KEY, dir);

    document.querySelectorAll('.rtl-toggle-btn').forEach((btn) => {
      // Keep strictly "RTL" text inside button as requested
      btn.textContent = 'RTL';
      btn.setAttribute('aria-pressed', dir === 'rtl' ? 'true' : 'false');
      btn.setAttribute(
        'title',
        dir === 'rtl' ? 'Switch to Left-to-Right (LTR)' : 'Switch to Right-to-Left (RTL)'
      );
    });
  }

  applyTheme(getPreferredTheme());
  applyDirection(getPreferredDir());

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(getPreferredTheme());
    applyDirection(getPreferredDir());

    document.querySelectorAll('.theme-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', function () {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    });

    document.querySelectorAll('.rtl-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', function () {
        const current = document.documentElement.getAttribute('dir') || 'ltr';
        applyDirection(current === 'rtl' ? 'ltr' : 'rtl');
      });
    });

    /* ------------------------------------------------------------------------
       2. FIXED NAVBAR SCROLL SHADOW & BACK TO TOP
       ------------------------------------------------------------------------ */
    const navbar = document.querySelector('.studio-navbar');
    const backToTopBtn = document.querySelector('.back-to-top');

    function syncBodyNavbarOffset() {
      if (navbar && document.body.classList.contains('has-fixed-navbar')) {
        document.body.style.paddingTop = navbar.offsetHeight + 'px';
      }
    }

    syncBodyNavbarOffset();
    window.addEventListener('resize', syncBodyNavbarOffset);

    function handleScroll() {
      const scrollY = window.scrollY || window.pageYOffset;
      if (navbar) {
        if (scrollY > 24) {
          navbar.classList.add('navbar-scrolled');
        } else {
          navbar.classList.remove('navbar-scrolled');
        }
      }
      if (backToTopBtn) {
        if (scrollY > 420) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Desktop Hover + Click compatibility for Home Dropdown
    document.querySelectorAll('.studio-navbar .nav-item.dropdown').forEach((item) => {
      const toggle = item.querySelector('.dropdown-toggle');
      const menu = item.querySelector('.dropdown-menu');
      if (!toggle || !menu) return;

      item.addEventListener('mouseenter', function () {
        if (window.innerWidth >= 1200) {
          menu.classList.add('show');
          toggle.setAttribute('aria-expanded', 'true');
        }
      });

      item.addEventListener('mouseleave', function () {
        if (window.innerWidth >= 1200) {
          menu.classList.remove('show');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });

    /* ------------------------------------------------------------------------
       3. GRACEFUL IMAGE FALLBACK HANDLER
       ------------------------------------------------------------------------ */
    document.querySelectorAll('img').forEach((img) => {
      img.addEventListener('error', function () {
        if (this.dataset.fallbackApplied) return;
        this.dataset.fallbackApplied = 'true';
        const altText = (this.getAttribute('alt') || 'Atelier Solène Fine Art Portrait').replace(/"/g, '');
        const svgPlaceholder = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1100" viewBox="0 0 900 1100">
          <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#F2EBE1"/>
              <stop offset="50%" stop-color="#E8DCCB"/>
              <stop offset="100%" stop-color="#D8B4A6"/>
            </linearGradient>
          </defs>
          <rect width="900" height="1100" fill="url(#g)"/>
          <rect x="45" y="45" width="810" height="1010" fill="none" stroke="#B08D5B" stroke-width="1.5" stroke-opacity="0.45"/>
          <text x="450" y="540" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#5A5049" font-style="italic">Atelier Solène</text>
          <text x="450" y="585" text-anchor="middle" font-family="sans-serif" font-size="14" letter-spacing="3" fill="#87766B">${altText.slice(0, 42).toUpperCase()}</text>
        </svg>`;
        this.src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgPlaceholder);
      });
    });

    /* ------------------------------------------------------------------------
       4. GALLERY CATEGORY FILTERING & LIGHTBOX
       ------------------------------------------------------------------------ */
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item-wrap');
    const galleryCountEl = document.getElementById('galleryVisibleCount');

    function filterGallery(category) {
      let visibleCount = 0;
      galleryItems.forEach((item) => {
        const itemCats = (item.getAttribute('data-category') || '').split(' ');
        if (category === 'all' || itemCats.includes(category)) {
          item.classList.remove('is-hidden');
          visibleCount++;
        } else {
          item.classList.add('is-hidden');
        }
      });

      if (galleryCountEl) {
        galleryCountEl.textContent = visibleCount;
      }

      if (window.gsap) {
        const visibleNodes = document.querySelectorAll('.gallery-item-wrap:not(.is-hidden)');
        gsap.fromTo(
          visibleNodes,
          { opacity: 0.25, y: 14 },
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.04, ease: 'power2.out', overwrite: true }
        );
      }
    }

    if (filterBtns.length > 0 && galleryItems.length > 0) {
      filterBtns.forEach((btn) => {
        btn.addEventListener('click', function () {
          filterBtns.forEach((b) => b.classList.remove('active'));
          this.classList.add('active');
          filterGallery(this.getAttribute('data-filter') || 'all');
        });
      });

      const urlParams = new URLSearchParams(window.location.search);
      const initialCat = urlParams.get('category');
      if (initialCat) {
        const matchingBtn = document.querySelector(`.gallery-filter-btn[data-filter="${initialCat}"]`);
        if (matchingBtn) {
          matchingBtn.click();
        }
      }
    }

    // Interactive Lightbox
    const lightbox = document.getElementById('studioLightbox');
    const lightboxImg = document.getElementById('lightboxImage');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxMeta = document.getElementById('lightboxMeta');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    let currentLightboxIndex = 0;

    function getVisibleGalleryCards() {
      const wraps = Array.from(document.querySelectorAll('.gallery-item-wrap:not(.is-hidden)'));
      if (wraps.length > 0) {
        return wraps.map((w) => w.querySelector('.gallery-card')).filter(Boolean);
      }
      return Array.from(document.querySelectorAll('.gallery-card'));
    }

    function openLightboxAt(index) {
      if (!lightbox || !lightboxImg) return;
      const cards = getVisibleGalleryCards();
      if (cards.length === 0) return;

      currentLightboxIndex = (index + cards.length) % cards.length;
      const card = cards[currentLightboxIndex];
      const img = card.querySelector('img');
      const title = card.getAttribute('data-title') || (img ? img.alt : 'Fine-Art Portrait');
      const meta = card.getAttribute('data-meta') || 'Atelier Solène Archive';
      const fullSrc = card.getAttribute('data-full') || (img ? img.src : '');

      lightboxImg.src = fullSrc;
      lightboxImg.alt = title;
      if (lightboxTitle) lightboxTitle.textContent = title;
      if (lightboxMeta) lightboxMeta.textContent = meta;
      if (lightboxCounter) {
        lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${cards.length}`;
      }

      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.gallery-card').forEach((card) => {
      card.addEventListener('click', function () {
        const cards = getVisibleGalleryCards();
        const idx = cards.indexOf(this);
        openLightboxAt(idx >= 0 ? idx : 0);
      });

      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const cards = getVisibleGalleryCards();
          const idx = cards.indexOf(this);
          openLightboxAt(idx >= 0 ? idx : 0);
        }
      });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', function (e) {
        e.stopPropagation();
        openLightboxAt(currentLightboxIndex - 1);
      });
    }
    if (lightboxNext) {
      lightboxNext.addEventListener('click', function (e) {
        e.stopPropagation();
        openLightboxAt(currentLightboxIndex + 1);
      });
    }
    if (lightbox) {
      lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox || e.target.classList.contains('lightbox-inner')) {
          closeLightbox();
        }
      });
    }

    document.addEventListener('keydown', function (e) {
      if (!lightbox || !lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') openLightboxAt(currentLightboxIndex - 1);
      if (e.key === 'ArrowRight') openLightboxAt(currentLightboxIndex + 1);
    });

    /* ------------------------------------------------------------------------
       5. PASSWORD VISIBILITY TOGGLES
       ------------------------------------------------------------------------ */
    document.querySelectorAll('.password-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', function () {
        const targetId = this.getAttribute('data-target');
        const input = targetId
          ? document.getElementById(targetId)
          : this.parentElement.querySelector('input');
        if (!input) return;

        const isPassword = input.getAttribute('type') === 'password';
        input.setAttribute('type', isPassword ? 'text' : 'password');

        const icon = this.querySelector('i');
        if (icon) {
          icon.className = isPassword ? 'bi bi-eye-slash' : 'bi bi-eye';
        }
        this.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
      });
    });

    /* ------------------------------------------------------------------------
       6. CONTACT ENQUIRY FORM PRE-FILL & VALIDATION
       ------------------------------------------------------------------------ */
    const enquiryForm = document.getElementById('sessionEnquiryForm');
    if (enquiryForm) {
      const params = new URLSearchParams(window.location.search);
      const pkgName = params.get('package');
      const sessionCat = params.get('session');

      const sessionSelect = document.getElementById('sessionType');
      const notesField = document.getElementById('additionalRequirements');
      const selectedPkgBanner = document.getElementById('selectedPackageBanner');
      const selectedPkgText = document.getElementById('selectedPackageText');

      if (sessionCat && sessionSelect) {
        Array.from(sessionSelect.options).forEach((opt) => {
          if (opt.value.toLowerCase().includes(sessionCat.toLowerCase())) {
            sessionSelect.value = opt.value;
          }
        });
      }

      if (pkgName) {
        if (selectedPkgBanner && selectedPkgText) {
          selectedPkgBanner.classList.remove('d-none');
          selectedPkgText.textContent = pkgName;
        }
        if (notesField && !notesField.value) {
          notesField.value = `Enquiring regarding the "${pkgName}" collection. Please share available dates and wardrobe consultation slots.`;
        }
      }

      const prefDateInput = document.getElementById('preferredSessionDate');
      if (prefDateInput) {
        const todayStr = new Date().toISOString().split('T')[0];
        prefDateInput.setAttribute('min', todayStr);
      }

      enquiryForm.addEventListener('submit', function (e) {
        e.preventDefault();
        let isValid = true;

        enquiryForm.querySelectorAll('[required]').forEach((field) => {
          const val = field.value.trim();
          let fieldValid = val.length > 0;

          if (field.type === 'email' && fieldValid) {
            fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
          }
          if (field.type === 'tel' && fieldValid) {
            fieldValid = /^[+\d\s\-()]{8,18}$/.test(val);
          }

          if (!fieldValid) {
            field.classList.add('is-invalid');
            isValid = false;
          } else {
            field.classList.remove('is-invalid');
          }

          field.addEventListener('input', function () {
            this.classList.remove('is-invalid');
          }, { once: true });
        });

        if (!isValid) return;

        const clientName = document.getElementById('fullName')?.value || 'Valued Guest';
        const chosenSession = document.getElementById('sessionType')?.value || 'Bespoke Portrait Session';
        const chosenDate = document.getElementById('preferredSessionDate')?.value || 'Flexible Date';
        const chosenLocation = enquiryForm.querySelector('input[name="preferredLocation"]:checked')?.value || 'Studio';

        const successBox = document.getElementById('enquirySuccessFeedback');
        const summarySpan = document.getElementById('enquirySummaryDetails');

        if (summarySpan) {
          summarySpan.textContent = `Thank you, ${clientName}. Your request for a ${chosenSession} (${chosenLocation}) around ${chosenDate} has been received by our Studio Concierge. We will respond within 24 hours.`;
        }

        if (successBox) {
          successBox.classList.remove('d-none');
          enquiryForm.reset();
          successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }

    /* ------------------------------------------------------------------------
       7. CLIENT PORTAL LOGIN & SIGN UP HANDLERS
       ------------------------------------------------------------------------ */
    const loginForm = document.getElementById('clientLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const emailInput = document.getElementById('loginEmail');
        const passInput = document.getElementById('loginPassword');
        let valid = true;

        if (!emailInput || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
          emailInput?.classList.add('is-invalid');
          valid = false;
        } else {
          emailInput.classList.remove('is-invalid');
        }

        if (!passInput || passInput.value.trim().length < 6) {
          passInput?.classList.add('is-invalid');
          valid = false;
        } else {
          passInput.classList.remove('is-invalid');
        }

        if (!valid) return;

        const feedback = document.getElementById('loginPortalFeedback');
        if (feedback) {
          feedback.classList.remove('d-none');
        }
      });
    }

    const forgotPasswordTrigger = document.getElementById('forgotPasswordLink');
    if (forgotPasswordTrigger) {
      forgotPasswordTrigger.addEventListener('click', function (e) {
        e.preventDefault();
        const resetNotice = document.getElementById('forgotPasswordNotice');
        if (resetNotice) {
          resetNotice.classList.toggle('d-none');
        }
      });
    }

    const signupForm = document.getElementById('clientSignupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        let valid = true;

        const nameInput = document.getElementById('signupName');
        const emailInput = document.getElementById('signupEmail');
        const phoneInput = document.getElementById('signupPhone');
        const passInput = document.getElementById('signupPassword');
        const confirmInput = document.getElementById('signupConfirmPassword');
        const termsCheck = document.getElementById('signupTerms');

        if (!nameInput || nameInput.value.trim().length < 2) {
          nameInput?.classList.add('is-invalid');
          valid = false;
        } else {
          nameInput.classList.remove('is-invalid');
        }

        if (!emailInput || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
          emailInput?.classList.add('is-invalid');
          valid = false;
        } else {
          emailInput.classList.remove('is-invalid');
        }

        if (!phoneInput || !/^[+\d\s\-()]{8,18}$/.test(phoneInput.value.trim())) {
          phoneInput?.classList.add('is-invalid');
          valid = false;
        } else {
          phoneInput.classList.remove('is-invalid');
        }

        if (!passInput || passInput.value.length < 8) {
          passInput?.classList.add('is-invalid');
          valid = false;
        } else {
          passInput.classList.remove('is-invalid');
        }

        if (!confirmInput || confirmInput.value !== passInput?.value || !confirmInput.value) {
          confirmInput?.classList.add('is-invalid');
          valid = false;
        } else {
          confirmInput.classList.remove('is-invalid');
        }

        if (!termsCheck || !termsCheck.checked) {
          termsCheck?.classList.add('is-invalid');
          valid = false;
        } else {
          termsCheck.classList.remove('is-invalid');
        }

        if (!valid) return;

        const feedback = document.getElementById('signupPortalFeedback');
        if (feedback) {
          feedback.classList.remove('d-none');
          signupForm.reset();
        }
      });
    }

    // Social Auth Demo Feedback (Google & Apple buttons on Login / Sign Up)
    document.querySelectorAll('.auth-social-btn').forEach((btn) => {
      btn.addEventListener('click', function () {
        const provider = this.getAttribute('data-provider') || 'Social';
        const targetFeedback =
          document.getElementById('loginPortalFeedback') ||
          document.getElementById('signupPortalFeedback');
        if (targetFeedback) {
          targetFeedback.classList.remove('d-none');
          const msgSpan = targetFeedback.querySelector('span');
          if (msgSpan) {
            msgSpan.textContent = `${provider} authentication UI preview selected. In production, connect your OAuth client ID or visit the Client Dashboard preview directly.`;
          }
        }
      });
    });

    /* ------------------------------------------------------------------------
       8. CLIENT DASHBOARD INTERACTIONS (BOOKING, GALLERIES, PRINTS, SIDEBAR)
       ------------------------------------------------------------------------ */
    const dashSidebar = document.getElementById('dashboardSidebar');
    const dashBackdrop = document.getElementById('sidebarBackdrop');
    const dashToggleBtn = document.getElementById('dashboardMenuToggle');
    const dashNavButtons = document.querySelectorAll('.dashboard-nav-link[data-tab]');
    const dashPanels = document.querySelectorAll('.dashboard-panel');

    function closeMobileSidebar() {
      dashSidebar?.classList.remove('open');
      dashBackdrop?.classList.remove('show');
    }

    if (dashToggleBtn && dashSidebar) {
      dashToggleBtn.addEventListener('click', function () {
        dashSidebar.classList.toggle('open');
        dashBackdrop?.classList.toggle('show');
      });
    }

    if (dashBackdrop) {
      dashBackdrop.addEventListener('click', closeMobileSidebar);
    }

    function activateDashboardTab(tabId) {
      dashNavButtons.forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
      });
      dashPanels.forEach((p) => {
        p.classList.toggle('active', p.id === tabId);
      });
      closeMobileSidebar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (dashNavButtons.length > 0) {
      dashNavButtons.forEach((btn) => {
        btn.addEventListener('click', function () {
          const targetTab = this.getAttribute('data-tab');
          if (targetTab) activateDashboardTab(targetTab);
        });
      });

      document.querySelectorAll('[data-jump-tab]').forEach((jumpBtn) => {
        jumpBtn.addEventListener('click', function () {
          const targetTab = this.getAttribute('data-jump-tab');
          if (targetTab) activateDashboardTab(targetTab);
        });
      });
    }

    // Favorite Proofing Heart Toggle in Dashboard Galleries
    const favCountEl = document.getElementById('favoritesCount');
    function updateFavoritesCount() {
      if (!favCountEl) return;
      const count = document.querySelectorAll('.favorite-heart-btn.liked').length;
      favCountEl.textContent = count;
    }

    document.querySelectorAll('.favorite-heart-btn').forEach((btn) => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        this.classList.toggle('liked');
        const icon = this.querySelector('i');
        if (icon) {
          icon.className = this.classList.contains('liked') ? 'bi bi-heart-fill' : 'bi bi-heart';
        }
        updateFavoritesCount();
      });
    });

    // Dashboard Session Booking Form
    const dashBookingForm = document.getElementById('dashboardBookingForm');
    if (dashBookingForm) {
      dashBookingForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const typeEl = document.getElementById('dashSessionType');
        const dateEl = document.getElementById('dashSessionDate');
        const feedbackEl = document.getElementById('dashBookingFeedback');
        const upcomingList = document.getElementById('upcomingSessionsList');

        if (!typeEl?.value || !dateEl?.value) {
          typeEl?.classList.toggle('is-invalid', !typeEl.value);
          dateEl?.classList.toggle('is-invalid', !dateEl.value);
          return;
        }
        typeEl.classList.remove('is-invalid');
        dateEl.classList.remove('is-invalid');

        if (upcomingList) {
          const loc = document.getElementById('dashSessionLocation')?.value || 'Studio Sanctuary';
          const newItem = document.createElement('div');
          newItem.className = 'p-3 bg-ivory border rounded-1 d-flex justify-content-between align-items-center flex-wrap gap-2';
          newItem.style.borderColor = 'var(--border-gold)';
          newItem.innerHTML = `
            <div>
              <strong class="d-block font-serif fs-5">${typeEl.value}</strong>
              <span class="small text-muted-luxury">${dateEl.value} &bull; ${loc}</span>
            </div>
            <span class="badge bg-surface text-gold border" style="border-color: var(--border-gold) !important;">Requested</span>
          `;
          upcomingList.prepend(newItem);
        }

        if (feedbackEl) {
          feedbackEl.classList.remove('d-none');
        }
        dashBookingForm.reset();
      });
    }

    // Dashboard Print Order Calculator & Submission
    const printInputs = document.querySelectorAll('.print-qty-input');
    const printTotalEl = document.getElementById('printOrderTotal');
    const printOrderForm = document.getElementById('printOrderForm');

    function recalculatePrintTotal() {
      if (!printTotalEl) return;
      let total = 0;
      printInputs.forEach((input) => {
        const qty = Math.max(0, parseInt(input.value || '0', 10));
        const price = parseInt(input.getAttribute('data-price') || '0', 10);
        total += qty * price;
      });
      printTotalEl.textContent = '₹' + total.toLocaleString('en-IN');
    }

    if (printInputs.length > 0) {
      printInputs.forEach((inp) => inp.addEventListener('input', recalculatePrintTotal));
      recalculatePrintTotal();
    }

    if (printOrderForm) {
      printOrderForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const feedback = document.getElementById('printOrderFeedback');
        const totalText = printTotalEl ? printTotalEl.textContent : '₹0';
        if (totalText === '₹0') {
          alert('Please select at least one archival print or linen album quantity to place an order.');
          return;
        }
        if (feedback) {
          feedback.classList.remove('d-none');
          const summary = document.getElementById('printOrderSummaryText');
          if (summary) {
            summary.textContent = `Your heirloom print order totaling ${totalText} has been submitted to our print lab concierge for studio proofing verification.`;
          }
        }
      });
    }

    /* ------------------------------------------------------------------------
       9. GSAP SUBTLE EDITORIAL ANIMATIONS
       ------------------------------------------------------------------------ */
    if (window.gsap) {
      if (window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
      }

      const heroFadeEls = document.querySelectorAll('.gsap-hero-fade');
      if (heroFadeEls.length > 0) {
        gsap.fromTo(
          heroFadeEls,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out' }
        );
      }

      const revealBlocks = document.querySelectorAll('.gsap-reveal');
      revealBlocks.forEach((el) => {
        if (window.ScrollTrigger) {
          gsap.fromTo(
            el,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 88%',
                once: true
              }
            }
          );
        }
      });
    }
  });
})();
