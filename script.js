// Header/menu state
const header = document.querySelector("header");
const headerNav = document.querySelector("header nav");
const mobileMedia = window.matchMedia("(max-width: 1280px)");
const headerHiddenKey = "mobileHeaderHidden";
const pageId = document.body?.id;
const hasOverlayMobileMenu = pageId === "about" || pageId === "portfolio";

let lockedScrollY = 0;
let isScrollLocked = false;

// Lock scroll only when the fullscreen mobile menu is open.
const setScrollLock = (isLocked) => {
  if (!hasOverlayMobileMenu) return;

  if (isLocked) {
    if (isScrollLocked) return;

    lockedScrollY = window.scrollY;
    document.documentElement.classList.add("menu-open");
    document.body.classList.add("menu-open");
    document.body.style.top = `-${lockedScrollY}px`;
    isScrollLocked = true;
    return;
  }

  if (!isScrollLocked) return;

  const topOffset = Number.parseInt(document.body.style.top || "0", 10);
  const restoreY = Number.isNaN(topOffset)
    ? lockedScrollY
    : Math.abs(topOffset);

  document.documentElement.classList.remove("menu-open");
  document.body.classList.remove("menu-open");
  document.body.style.top = "";
  isScrollLocked = false;
  window.scrollTo(0, restoreY);
};

if (header && headerNav) {
  // Mobile menu toggle button
  const headerToggle = document.createElement("button");
  headerToggle.type = "button";
  headerToggle.className = "header-toggle";
  headerToggle.textContent = "Close";
  headerToggle.setAttribute("aria-label", "Hide navigation");
  document.body.appendChild(headerToggle);

  const setPersistedHidden = (isHidden) => {
    try {
      if (isHidden) {
        sessionStorage.setItem(headerHiddenKey, "1");
      } else {
        sessionStorage.removeItem(headerHiddenKey);
      }
    } catch {
      // Ignore storage errors (e.g., private mode restrictions).
    }
  };

  const getPersistedHidden = () => {
    try {
      return sessionStorage.getItem(headerHiddenKey) === "1";
    } catch {
      return false;
    }
  };

  const syncHeaderToggle = () => {
    const isMobile = mobileMedia.matches;
    const isHeaderHidden = header.classList.contains("is-hidden");
    const isMenuOpen = isMobile && !isHeaderHidden;

    headerToggle.classList.toggle("is-visible", isMobile);
    headerToggle.setAttribute("aria-hidden", String(!isMobile));
    headerToggle.textContent = isHeaderHidden ? "Menu" : "Close";
    headerToggle.setAttribute(
      "aria-label",
      isHeaderHidden ? "Show navigation" : "Hide navigation",
    );

    setScrollLock(isMenuOpen);
  };

  // Close menu after tapping any navigation link on mobile.
  headerNav.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link || !mobileMedia.matches) return;

    header.classList.add("is-hidden");
    setPersistedHidden(true);
    syncHeaderToggle();
  });

  headerToggle.addEventListener("click", () => {
    const isHidden = header.classList.toggle("is-hidden");
    setPersistedHidden(isHidden);
    syncHeaderToggle();
  });

  window.addEventListener("resize", () => {
    if (!mobileMedia.matches) {
      header.classList.remove("is-hidden");
      setPersistedHidden(false);
    }
    syncHeaderToggle();
  });

  if (mobileMedia.matches && getPersistedHidden()) {
    header.classList.add("is-hidden");
  }

  // Ensure UI and scroll lock are in sync on initial load.
  syncHeaderToggle();
}

// Portfolio section visibility state
if (pageId === "portfolio") {
  const portfolioArticles = Array.from(
    document.querySelectorAll("#portfolio .content.portfolio > article[id]"),
  );

  if (portfolioArticles.length > 0) {
    const articleIds = new Set(portfolioArticles.map((article) => article.id));
    const allHashLinks = Array.from(
      document.querySelectorAll('#portfolio a[href^="#"]'),
    );

    const getHashId = (value) => {
      if (!value || !value.startsWith("#") || value.length < 2) return null;

      try {
        return decodeURIComponent(value.slice(1));
      } catch {
        return value.slice(1);
      }
    };

    const getArticleForTargetId = (targetId) => {
      if (!targetId) return null;
      if (articleIds.has(targetId)) return targetId;

      const targetElement = document.getElementById(targetId);
      const parentArticle = targetElement?.closest("article[id]");
      return parentArticle?.id ?? null;
    };

    const setVisibleArticle = (articleId) => {
      portfolioArticles.forEach((article) => {
        article.hidden = article.id !== articleId;
      });

      allHashLinks.forEach((link) => {
        const linkTargetId = getHashId(link.getAttribute("href"));
        const linkArticleId = getArticleForTargetId(linkTargetId);
        link.classList.toggle("active", linkArticleId === articleId);
      });
    };

    const showFromHash = (hash) => {
      const targetId = getHashId(hash);
      const targetArticleId =
        getArticleForTargetId(targetId) ?? portfolioArticles[0].id;

      setVisibleArticle(targetArticleId);
    };

    allHashLinks.forEach((link) => {
      const targetId = getHashId(link.getAttribute("href"));
      const targetArticleId = getArticleForTargetId(targetId);
      if (!targetArticleId) return;

      link.addEventListener("click", (event) => {
        event.preventDefault();
        showFromHash(`#${targetId}`);
        history.replaceState(null, "", `#${targetId}`);
      });
    });

    window.addEventListener("hashchange", () => {
      showFromHash(window.location.hash);
    });

    showFromHash(window.location.hash);
  }
}
