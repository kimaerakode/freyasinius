const header = document.querySelector("header");
const headerNav = document.querySelector("header nav");
const mobileMedia = window.matchMedia("(max-width: 1280px)");
const headerHiddenKey = "mobileHeaderHidden";

if (header && headerNav) {
	const headerToggle = document.createElement("button");
	headerToggle.type = "button";
	headerToggle.className = "header-toggle";
	headerToggle.textContent = "Menu";
	headerToggle.setAttribute("aria-label", "Show navigation");
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

		headerToggle.classList.toggle("is-visible", isMobile && isHeaderHidden);
		headerToggle.setAttribute("aria-hidden", String(!(isMobile && isHeaderHidden)));
	};

	headerNav.addEventListener("click", (event) => {
		const link = event.target.closest("a");
		if (!link || !mobileMedia.matches) return;

		header.classList.add("is-hidden");
		setPersistedHidden(true);
		syncHeaderToggle();
	});

	headerToggle.addEventListener("click", () => {
		header.classList.remove("is-hidden");
		setPersistedHidden(false);
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
