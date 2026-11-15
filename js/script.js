(() => {
    const savedTheme = localStorage.getItem("campus-theme");
    if (savedTheme) document.documentElement.dataset.theme = savedTheme;
    document.documentElement.classList.add("theme-ready");
    const countdownDate = document.querySelector("#home-next-date");

    if (countdownDate) {
        const targetDate = new Date(countdownDate.dateTime).getTime();
        const smallTimer = document.querySelector("#small-countdown");
        const largeTimer = document.querySelector("#large-countdown");

        function updateCountdown() {
            const remaining = Math.max(0, targetDate - Date.now());
            const days = Math.floor(remaining / 86400000);
            const hours = Math.floor((remaining / 3600000) % 24);
            const minutes = Math.floor((remaining / 60000) % 60);
            const seconds = Math.floor((remaining / 1000) % 60);
            const values = [days, hours, minutes, seconds];

            [smallTimer, largeTimer].forEach((timer) => {
                if (!timer) return;
                timer.querySelectorAll("[data-time-part]").forEach((part, index) => {
                    part.textContent = String(values[index]).padStart(2, "0");
                });
            });
        }

        updateCountdown();
        window.setInterval(updateCountdown, 1000);
    }

    const navButton = document.querySelector(".mobile-nav-toggle");
    const navLinks = document.querySelector(".site-nav-links");

    if (navButton && navLinks) {
        navButton.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("nav-open");
            navButton.setAttribute("aria-expanded", String(isOpen));
            navButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
        });
    }

    const themeButton = document.querySelector(".theme-toggle");

    if (themeButton) {
        const themeIcon = themeButton.querySelector("i");
        const darkTheme = document.documentElement.dataset.theme === "dark";
        if (themeIcon) {
            themeIcon.classList.toggle("fa-sun", darkTheme);
            themeIcon.classList.toggle("fa-moon", !darkTheme);
        }
        themeButton.setAttribute("aria-label", darkTheme ? "Use light theme" : "Use dark theme");
        themeButton.addEventListener("click", () => {
            const isDark = document.documentElement.dataset.theme !== "dark";
            document.documentElement.dataset.theme = isDark ? "dark" : "light";
            localStorage.setItem("campus-theme", isDark ? "dark" : "light");
            const themeIcon = themeButton.querySelector("i");
            if (themeIcon) {
                themeIcon.classList.toggle("fa-sun", !isDark);
                themeIcon.classList.toggle("fa-moon", isDark);
            }
            themeButton.setAttribute("aria-label", isDark ? "Use light theme" : "Use dark theme");
        });
    }

    document.querySelectorAll("[data-like-button]").forEach((button) => {
        button.addEventListener("click", () => {
            const liked = button.getAttribute("aria-pressed") !== "true";
            const count = button.querySelector("[data-like-count]");
            const icon = button.querySelector("i");
            const eventTitle = button.closest("[data-event-card]").querySelector("h3").textContent.trim();

            if (!count) return;

            const total = Number(count.textContent) + (liked ? 1 : -1);
            count.textContent = String(total);
            button.classList.toggle("liked", liked);
            button.setAttribute("aria-pressed", String(liked));
            button.setAttribute("aria-label", `${liked ? "Unlike" : "Like"} ${eventTitle} (${total} likes)`);

            if (icon) {
                icon.classList.toggle("fa-solid", liked);
                icon.classList.toggle("fa-regular", !liked);
            }
        });
    });

    const eventDialog = document.querySelector("#event-dialog");

    if (eventDialog) {
        let activeEventCard = null;
        const registrationButton = eventDialog.querySelector("#event-register");
        const registrationForm = eventDialog.querySelector("#event-registration-form");
        const registrationMessage = eventDialog.querySelector("#event-registration-status");
        const closeButton = eventDialog.querySelector(".event-dialog-close");

        document.querySelectorAll("[data-event-details]").forEach((button) => {
            button.addEventListener("click", (event) => {
                if (button.matches("a")) event.preventDefault();
                const card = button.closest("[data-event-card]");
                if (!card) return;

                activeEventCard = card;
                const title = card.querySelector("h3").textContent.trim();
                const category = card.querySelector(".category-pill").textContent.trim();
                const image = card.querySelector(".event-poster img");
                const viewCount = card.querySelector("[data-view-count]");
                const registrationKey = `registered-${card.dataset.eventDate}-${title}`;
                const isRegistered = localStorage.getItem(registrationKey) === "true";

                eventDialog.querySelector("#event-dialog-title").textContent = title;
                eventDialog.querySelector("#event-dialog-poster-title").textContent = title;
                eventDialog.querySelector("#event-dialog-category").textContent = category;
                eventDialog.querySelector("#event-dialog-category").className =
                    `category-pill category-${category.toLowerCase()}`;
                eventDialog.querySelector("#event-dialog-description").textContent = card.dataset.description;
                eventDialog.querySelector("#event-dialog-date").textContent = card.dataset.eventDate;
                eventDialog.querySelector("#event-dialog-time").textContent = card.dataset.eventTime;
                eventDialog.querySelector("#event-dialog-venue").textContent = card.dataset.eventVenue;
                eventDialog.querySelector("#event-dialog-organizer").textContent = card.dataset.organizer;
                eventDialog.querySelector("#event-dialog-likes").textContent =
                    card.querySelector("[data-like-count]").textContent;

                if (image) {
                    const dialogImage = eventDialog.querySelector("#event-dialog-image");
                    dialogImage.src = image.src;
                    dialogImage.alt = image.alt;
                }

                if (viewCount) {
                    viewCount.textContent = String(Number(viewCount.textContent) + 1);
                    viewCount.parentElement.setAttribute("aria-label", `${viewCount.textContent} views`);
                }

                eventDialog.querySelector("#event-dialog-views").textContent = viewCount.textContent;
                eventDialog.querySelector("#event-dialog-registrations").textContent =
                    card.querySelector("[data-registration-count]").textContent;
                registrationButton.disabled = isRegistered;
                registrationButton.textContent = isRegistered ? "Already registered" : "Register for event";
                registrationForm.hidden = isRegistered;
                registrationForm.dataset.registrationKey = registrationKey;
                registrationForm.reset();
                registrationMessage.hidden = true;
                eventDialog.showModal();
            });
        });

        registrationForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const key = registrationForm.dataset.registrationKey;
            if (!activeEventCard || localStorage.getItem(key) === "true") return;
            if (!registrationForm.reportValidity()) return;

            const count = activeEventCard.querySelector("[data-registration-count]");
            count.textContent = String(Number(count.textContent) + 1);
            localStorage.setItem(key, "true");
            count.parentElement.setAttribute("aria-label", `${count.textContent} registered`);
            activeEventCard.dataset.registered = "true";
            eventDialog.querySelector("#event-dialog-registrations").textContent = count.textContent;
            registrationButton.disabled = true;
            registrationButton.textContent = "Already registered";
            registrationForm.hidden = true;
            registrationMessage.hidden = false;
            registrationForm.hidden = true;
        });

        closeButton.addEventListener("click", () => eventDialog.close());
        eventDialog.addEventListener("click", (event) => {
            if (event.target === eventDialog) eventDialog.close();
        });
    }

    document.querySelectorAll("[data-filter-group]").forEach((group) => {
        const listName = group.dataset.filterGroup;
        const cardList = document.querySelector(`[data-card-list="${listName}"]`);

        if (!cardList) return;

        const cards = Array.from(cardList.querySelectorAll("[data-category]"));
        const search = group.querySelector("[data-card-search]");
        const emptyMessage = document.querySelector(`[data-empty-state="${listName}"]`);
        let selectedCategory = "All";

        function filterCards() {
            const searchText = search ? search.value.trim().toLowerCase() : "";
            let visibleCards = 0;

            cards.forEach((card) => {
                const matchesCategory = selectedCategory === "All"
                    || card.dataset.category === selectedCategory;
                const matchesSearch = card.textContent.toLowerCase().includes(searchText);
                card.hidden = !matchesCategory || !matchesSearch;
                if (!card.hidden) visibleCards += 1;
            });

            if (emptyMessage) emptyMessage.hidden = visibleCards > 0;
        }

        group.addEventListener("click", (event) => {
            const button = event.target.closest("[data-filter-value]");
            if (!button) return;

            selectedCategory = button.dataset.filterValue;
            group.querySelectorAll("[data-filter-value]").forEach((filterButton) => {
                filterButton.classList.toggle("active", filterButton === button);
            });
            filterCards();
        });

        if (search) search.addEventListener("input", filterCards);
    });

    const feedbackTab = document.querySelector('[data-form-tab="feedback"]');
    const proposalTab = document.querySelector('[data-form-tab="proposal"]');
    const feedbackForm = document.querySelector("#feedback-form");
    const proposalForm = document.querySelector("#proposal-form");

    function showContactForm(showProposal) {
        if (!feedbackForm || !proposalForm) return;
        feedbackForm.classList.toggle("d-none", showProposal);
        proposalForm.classList.toggle("d-none", !showProposal);
        if (feedbackTab) {
            feedbackTab.classList.toggle("active", !showProposal);
            feedbackTab.setAttribute("aria-selected", String(!showProposal));
        }
        if (proposalTab) {
            proposalTab.classList.toggle("active", showProposal);
            proposalTab.setAttribute("aria-selected", String(showProposal));
        }
    }

    if (feedbackTab && proposalTab) {
        feedbackTab.addEventListener("click", () => showContactForm(false));
        proposalTab.addEventListener("click", () => showContactForm(true));
        if (window.location.search.includes("form=proposal")) showContactForm(true);
    }

    document.querySelectorAll(".hub-form").forEach((form) => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            if (!form.reportValidity()) return;

            const successMessage = form.querySelector(".form-success");
            if (successMessage) successMessage.classList.remove("d-none");
            form.reset();
        });
    });

    document.querySelectorAll(".footer-signup").forEach((form) => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            if (!form.reportValidity()) return;

            form.reset();
            const successMessage = form.nextElementSibling;
            if (successMessage) successMessage.classList.remove("d-none");
        });
    });
})();
