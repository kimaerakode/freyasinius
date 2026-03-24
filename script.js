const header = document.querySelector("header");
const headerNav = document.querySelector("header nav");
const mobileMedia = window.matchMedia("(max-width: 1280px)");
const headerHiddenKey = "mobileHeaderHidden";
const pageId = document.body?.id;
const hasOverlayMobileMenu = pageId === "about" || pageId === "portfolio";

let lockedScrollY = 0;

const setScrollLock = (isLocked) => {
  if (!hasOverlayMobileMenu) return;

  if (isLocked) {
    lockedScrollY = window.scrollY;
    document.documentElement.classList.add("menu-open");
    document.body.classList.add("menu-open");
    document.body.style.top = `-${lockedScrollY}px`;
    return;
  }

  document.documentElement.classList.remove("menu-open");
  document.body.classList.remove("menu-open");
  document.body.style.top = "";
  window.scrollTo(0, lockedScrollY);
};

if (header && headerNav) {
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

  syncHeaderToggle();
}
