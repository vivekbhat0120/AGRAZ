document.addEventListener("DOMContentLoaded", () => {
  // Theme Toggle Logic
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  // Check for saved theme preference
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "dark") {
    body.classList.add("dark-mode");
  }

  // Guard against missing element to avoid runtime errors
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      body.classList.toggle("dark-mode");

      // Save preference
      if (body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
      } else {
        localStorage.setItem("theme", "light");
      }
    });
  }

  // Mobile Menu Toggle
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  const navItems = document.querySelectorAll(".nav-links li a");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      // Simple fast hamburger animation toggle if needed
      hamburger.classList.toggle("toggle");
    });
  }

  // Close mobile menu when a link is clicked
  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      if (navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
      }
      // If this is the Careers link, force navigation to ensure it opens the career page
      const href = item.getAttribute("href");
      if (href && href === "career.html") {
        e.preventDefault();
        window.location.href = href;
      }
    });
  });

  // Also ensure any other links that point to career.html (e.g., the "View Open Positions" button) navigate reliably
  // Use a flexible selector (contains) to catch variations like './career.html' or '/career.html'
  const careerAnchors = document.querySelectorAll('a[href*="career.html"]');
  careerAnchors.forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href) return;
      // If already on the career page, allow default behavior (so internal anchors like #open-positions still work)
      if (
        window.location.pathname &&
        window.location.pathname.endsWith("career.html")
      ) {
        return;
      }
      // Otherwise enforce navigation to the careers page
      e.preventDefault();
      window.location.href = href;
    });
  });

  // Sticky Header
  const header = document.querySelector("header");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Scroll Animations using Intersection Observer
  const observerOptions = {
    threshold: 0.15, // Trigger when 15% of the element is visible
    rootMargin: "0px",
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  const fadeElements = document.querySelectorAll(".fade-in");
  fadeElements.forEach((el) => {
    observer.observe(el);
  });

  // Populate site from CompanyData (if available)
  if (window.CompanyData) {
    const data = window.CompanyData;

    // Logo
    const logoName = document.getElementById("logo-name");
    const logoSuffix = document.getElementById("logo-suffix");
    if (logoName)
      logoName.textContent = data.company?.name || logoName.textContent;
    if (logoSuffix)
      logoSuffix.textContent = data.company?.suffix || logoSuffix.textContent;

    // Hero
    const heroTitleEl = document.getElementById("hero-title");
    const heroSub = document.getElementById("hero-sub");
    if (heroTitleEl && data.company?.tagLine)
      heroTitleEl.innerHTML = data.company.tagLine;
    if (heroSub && data.company?.shortDesc)
      heroSub.textContent = data.company.shortDesc;

    // About, mission, vision
    const aboutIntro = document.getElementById("about-intro");
    if (aboutIntro && data.aboutIntro) aboutIntro.textContent = data.aboutIntro;
    const missionTitle = document.getElementById("mission-title");
    const missionText = document.getElementById("mission-text");
    const visionTitle = document.getElementById("vision-title");
    const visionText = document.getElementById("vision-text");
    if (missionTitle && data.mission?.title)
      missionTitle.textContent = data.mission.title;
    if (missionText && data.mission?.text)
      missionText.textContent = data.mission.text;
    if (visionTitle && data.vision?.title)
      visionTitle.textContent = data.vision.title;
    if (visionText && data.vision?.text)
      visionText.textContent = data.vision.text;

    // Generate services
    const servicesGrid = document.getElementById("services-grid");
    if (servicesGrid && Array.isArray(data.services)) {
      servicesGrid.innerHTML = "";
      data.services.forEach((s) => {
        const div = document.createElement("div");
        div.className = "service-card fade-in";
        div.innerHTML = `<i class="${s.icon}"></i><h3>${s.title}</h3><p>${s.desc}</p>`;
        servicesGrid.appendChild(div);
        observer.observe(div);
      });
    }

    // Generate products
    const productsGrid = document.getElementById("products-grid");
    if (productsGrid && Array.isArray(data.products)) {
      productsGrid.innerHTML = "";
      data.products.forEach((p) => {
        const card = document.createElement("div");
        card.className = "product-card fade-in";
        card.innerHTML = `<div class="product-icon"><i class="${p.icon}"></i></div>
                          <div class="product-info"><h3>${p.title}</h3><p>${p.desc}</p>
                          <!-- <a href="#" class="btn-text">Learn More <i class="fas fa-arrow-right"></i></a> --></div>`;
        productsGrid.appendChild(card);
        observer.observe(card);
      });
    }

    // Generate careers list (for career.html)
    const jobsGrid = document.getElementById("jobs-grid");
    if (jobsGrid && Array.isArray(data.careers)) {
      jobsGrid.innerHTML = "";
      let lastFocusedEl = null;

      // Ensure a modal element exists for job details
      let jobModal = document.getElementById("job-modal");
      const createJobModal = () => {
        if (jobModal) return jobModal;
        jobModal = document.createElement("div");
        jobModal.id = "job-modal";
        jobModal.className = "modal-overlay";
        jobModal.innerHTML = `
          <div class="modal" role="dialog" aria-modal="true" tabindex="-1">
            <button class="modal-close" aria-label="Close">&times;</button>
            <div class="modal-header"><h2></h2><p class="job-meta"></p></div>
            <div class="modal-body"></div>
            <div class="modal-footer"></div>
          </div>
        `;
        document.body.appendChild(jobModal);
        jobModal.setAttribute("aria-hidden", "true");

        // Close handlers
        jobModal.addEventListener("click", (e) => {
          if (e.target === jobModal) closeJobModal();
        });
        const closeBtn = jobModal.querySelector(".modal-close");
        if (closeBtn) closeBtn.addEventListener("click", closeJobModal);

        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") closeJobModal();
        });

        return jobModal;
      };

      const openJobModal = (job) => {
        if (!job) return;
        createJobModal();
        const bodyEl = jobModal.querySelector(".modal-body");
        const footerEl = jobModal.querySelector(".modal-footer");
        const applyHref = job.applyUrl
          ? job.applyUrl
          : `mailto:${job.applyEmail}?subject=${encodeURIComponent("Application for " + job.title)}`;
        const applyTarget = job.applyUrl
          ? ' target="_blank" rel="noopener noreferrer"'
          : "";

        // Populate header (fixed at top of modal) and scrollable body
        const headerEl = jobModal.querySelector(".modal-header");
        if (headerEl) {
          headerEl.querySelector("h2").textContent = job.title;
          const meta = headerEl.querySelector(".job-meta");
          if (meta)
            meta.textContent = `${job.location} • ${job.type} • ${job.experience}`;
        }

        // Populate scrollable body with only the details (keeps the header fixed and out of the scroll area)
        bodyEl.innerHTML = `
          <div class="job-details">${job.details || `<p>${job.desc}</p>`}</div>
        `;

        // Populate footer (pinned, does not scroll)
        footerEl.innerHTML = `
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary modal-cancel-btn">Close</button>
            <a class="btn btn-primary" href="${applyHref}"${applyTarget}>Apply</a>
          </div>
        `;

        // Close button inside footer (cancel button)
        const innerCancel = jobModal.querySelector(".modal-cancel-btn");
        if (innerCancel) innerCancel.addEventListener("click", closeJobModal);

        // Save focus and open modal
        lastFocusedEl = document.activeElement;
        jobModal.classList.add("open");
        document.body.classList.add("modal-open");
        jobModal.setAttribute("aria-hidden", "false");
        const modalEl = jobModal.querySelector(".modal");
        if (modalEl) modalEl.focus();
      };

      const closeJobModal = () => {
        if (!jobModal) return;
        jobModal.classList.remove("open");
        document.body.classList.remove("modal-open");
        jobModal.setAttribute("aria-hidden", "true");
        if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
          lastFocusedEl.focus();
        }
        lastFocusedEl = null;
      };

      // Render job cards
      data.careers.forEach((job) => {
        const card = document.createElement("div");
        card.className = "job-card fade-in";
        const applyHref = job.applyUrl
          ? job.applyUrl
          : `mailto:${job.applyEmail}?subject=${encodeURIComponent("Application for " + job.title)}`;
        const applyTarget = job.applyUrl
          ? ' target="_blank" rel="noopener noreferrer"'
          : "";
        // Always provide a "Details" button for each job card (opens modal)
        const detailsBtn = `<button type="button" class="btn btn-secondary details-btn" data-job-id="${job.id}" aria-label="View details for ${job.title}">Details</button>`;

        card.innerHTML = `
          <h3>${job.title}</h3>
          <p class="job-meta">${job.location} • ${job.type} • ${job.experience}</p>
          <p>${job.desc}</p>
          <div class="job-actions">
            ${detailsBtn}
            <a class="btn btn-primary apply-btn" href="${applyHref}"${applyTarget}>Apply</a>
          </div>
        `;

        jobsGrid.appendChild(card);
        observer.observe(card);
      });

      // Delegate Details clicks
      document.addEventListener("click", (e) => {
        const target = e.target;
        if (target && target.matches && target.matches(".details-btn")) {
          const id = target.dataset.jobId;
          const job = data.careers.find((j) => j.id === id);
          openJobModal(job);
        }
      });
    }

    // Contact
    const cAddress = document.getElementById("contact-address");
    const cEmail = document.getElementById("contact-email");
    const cPhone = document.getElementById("contact-phone");
    if (cAddress && data.contact?.address)
      cAddress.textContent = data.contact.address;
    if (cEmail && data.contact?.email) {
      cEmail.href = `mailto:${data.contact.email}`;
      cEmail.textContent = data.contact.email;
    }
    if (cPhone && data.contact?.phone) {
      cPhone.href = `tel:${data.contact.phone}`;
      cPhone.textContent = data.contact.phone;
    }

    // Social links
    const socialMap = [
      ["social-linkedin", data.social?.linkedin],
      ["social-github", data.social?.github],
      ["social-twitter", data.social?.twitter],
      ["social-instagram", data.social?.instagram],
    ];
    socialMap.forEach(([id, url]) => {
      const el = document.getElementById(id);
      if (el && url) el.href = url;
    });

    // Footer
    const footerYear = document.getElementById("footer-year");
    const footerName = document.getElementById("footer-name");
    const footerPara = document.getElementById("footer-text");
    if (footerYear) footerYear.textContent = "2025";
    if (footerName)
      footerName.textContent = `${data.company?.name} ${data.company?.suffix}`;
    if (footerPara && data.company?.footerDesc)
      footerPara.textContent = data.company.footerDesc;
  }
});
