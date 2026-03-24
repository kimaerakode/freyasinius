const pageId = document.body?.id;
const mobileMedia = window.matchMedia("(max-width: 1280px)");
const headerHiddenKey = "mobileHeaderHidden";

const getHashId = (value) => {
  if (!value?.startsWith("#") || value.length < 2) return null;
  try {
    return decodeURIComponent(value.slice(1));
  } catch {
    return value.slice(1);
  }
};

const initHeaderMenu = () => {
  const header = document.querySelector("header");
  const nav = header?.querySelector("nav");
  if (!header || !nav) return;

  const hasOverlayMobileMenu = ["about", "portfolio"].includes(pageId);
  const toggle = document.createElement("button");
  let lockedY = 0;

  const saveHidden = (isHidden) => {
    try {
      if (isHidden) sessionStorage.setItem(headerHiddenKey, "1");
      else sessionStorage.removeItem(headerHiddenKey);
    } catch {
      // Ignore sessionStorage errors.
    }
  };

  const lockScroll = (isOpen) => {
    if (!hasOverlayMobileMenu) return;

    if (isOpen) {
      if (document.body.classList.contains("menu-open")) return;
      lockedY = window.scrollY;
      document.documentElement.classList.add("menu-open");
      document.body.classList.add("menu-open");
      document.body.style.top = `-${lockedY}px`;
      return;
    }

    if (!document.body.classList.contains("menu-open")) return;

    const topOffset = Number.parseInt(document.body.style.top || "0", 10);
    const restoreY = Number.isNaN(topOffset) ? lockedY : Math.abs(topOffset);
    document.documentElement.classList.remove("menu-open");
    document.body.classList.remove("menu-open");
    document.body.style.top = "";
    window.scrollTo(0, restoreY);
  };

  const sync = () => {
    const isMobile = mobileMedia.matches;
    const isHidden = header.classList.contains("is-hidden");
    toggle.classList.toggle("is-visible", isMobile);
    toggle.setAttribute("aria-hidden", String(!isMobile));
    toggle.textContent = isHidden ? "Menu" : "Close";
    toggle.setAttribute(
      "aria-label",
      isHidden ? "Show navigation" : "Hide navigation",
    );
    lockScroll(isMobile && !isHidden);
  };

  const setHidden = (isHidden) => {
    header.classList.toggle("is-hidden", isHidden);
    saveHidden(isHidden);
    sync();
  };

  toggle.type = "button";
  toggle.className = "header-toggle";
  document.body.appendChild(toggle);

  nav.addEventListener("click", (event) => {
    if (mobileMedia.matches && event.target.closest("a")) setHidden(true);
  });

  toggle.addEventListener("click", () => {
    setHidden(!header.classList.contains("is-hidden"));
  });

  window.addEventListener("resize", () => {
    if (!mobileMedia.matches) setHidden(false);
    else sync();
  });

  try {
    if (
      mobileMedia.matches &&
      sessionStorage.getItem(headerHiddenKey) === "1"
    ) {
      header.classList.add("is-hidden");
    }
  } catch {
    // Ignore sessionStorage errors.
  }

  sync();
};

const initPortfolioTabs = () => {
  if (pageId !== "portfolio") return;

  const articles = Array.from(
    document.querySelectorAll("#portfolio .content.portfolio > article[id]"),
  );
  const links = Array.from(
    document.querySelectorAll("#portfolio .nav-bar a[href^='#']"),
  );
  if (articles.length === 0 || links.length === 0) return;

  const getArticleId = (targetId) => {
    if (!targetId) return null;
    const articleMatch = articles.find((article) => article.id === targetId);
    if (articleMatch) return articleMatch.id;
    const target = document.getElementById(targetId);
    return target?.closest("article[id]")?.id ?? null;
  };

  const render = (activeArticleId) => {
    const showAll = !activeArticleId;

    articles.forEach((article) => {
      article.hidden = !showAll && article.id !== activeArticleId;
    });

    links.forEach((link) => {
      const articleId = getArticleId(getHashId(link.getAttribute("href")));
      link.classList.toggle(
        "active",
        !showAll && articleId === activeArticleId,
      );
    });
  };

  const applyHash = (hash) => {
    render(getArticleId(getHashId(hash)));
  };

  links.forEach((link) => {
    const hash = link.getAttribute("href");
    if (!getArticleId(getHashId(hash))) return;

    link.addEventListener("click", (event) => {
      event.preventDefault();
      applyHash(hash);
      history.replaceState(null, "", hash);
    });
  });

  window.addEventListener("hashchange", () => applyHash(window.location.hash));
  applyHash(window.location.hash);
};

initHeaderMenu();
initPortfolioTabs();
