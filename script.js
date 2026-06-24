/* Rift Transportation — site behaviors */
(function () {
	"use strict";

	// ============== YEAR ==============
	var yearEl = document.getElementById("year");
	if (yearEl) yearEl.textContent = new Date().getFullYear();

	// ============== THEME TOGGLE ==============
	var root = document.documentElement;
	var themeToggle = document.getElementById("themeToggle");

	// Respect system preference (no persistence needed in preview)
	var prefersLight =
		window.matchMedia &&
		window.matchMedia("(prefers-color-scheme: light)").matches;
	root.setAttribute("data-theme", prefersLight ? "light" : "dark");

	if (themeToggle) {
		themeToggle.addEventListener("click", function () {
			var current =
				root.getAttribute("data-theme") === "light" ? "light" : "dark";
			var next = current === "light" ? "dark" : "light";
			root.setAttribute("data-theme", next);
			// theme stored in-memory only
			// Update meta theme-color
			var meta = document.querySelector('meta[name="theme-color"]');
			if (meta)
				meta.setAttribute(
					"content",
					next === "light" ? "#faf7f1" : "#0b0c0d",
				);
		});
	}

	// ============== MOBILE MENU ==============
	var navToggle = document.getElementById("navToggle");
	var mobileMenu = document.getElementById("mobileMenu");
	if (navToggle && mobileMenu) {
		navToggle.addEventListener("click", function () {
			var open = navToggle.getAttribute("aria-expanded") === "true";
			var next = !open;
			navToggle.setAttribute("aria-expanded", String(next));
			if (next) {
				mobileMenu.hidden = false;
				requestAnimationFrame(function () {
					mobileMenu.setAttribute("data-open", "true");
				});
			} else {
				mobileMenu.removeAttribute("data-open");
				mobileMenu.hidden = true;
			}
		});
		// Close mobile menu after clicking a link
		mobileMenu.querySelectorAll("a").forEach(function (a) {
			a.addEventListener("click", function () {
				navToggle.setAttribute("aria-expanded", "false");
				mobileMenu.removeAttribute("data-open");
				mobileMenu.hidden = true;
			});
		});
	}

	// ============== REVEAL ON SCROLL ==============
	if ("IntersectionObserver" in window) {
		var io = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						entry.target.classList.add("in");
						io.unobserve(entry.target);
					}
				});
			},
			{ rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
		);

		document.querySelectorAll(".reveal").forEach(function (el) {
			io.observe(el);
		});
	} else {
		document.querySelectorAll(".reveal").forEach(function (el) {
			el.classList.add("in");
		});
	}

	// ============== FORM HANDLERS ==============
	function handleSubmit(formId, successId, onSuccess) {
		var form = document.getElementById(formId);
		var success = document.getElementById(successId);
		if (!form) return;

		form.addEventListener("submit", function (e) {
			// e.preventDefault(); <-- REMOVE OR COMMENT THIS OUT
			if (!form.checkValidity()) {
				e.preventDefault(); // Only stop it if it's invalid!
				form.reportValidity();
				return;
			}
			// Capture the form data
			var data = new FormData(form);

			// Manually send the data to the URL in the form's 'action' attribute
			fetch(form.action, {
				method: form.method,
				body: data,
				headers: {
					Accept: "application/json",
				},
			})
				.then(function (response) {
					if (response.ok) {
						// What happens when Formspree successfully gets the data:
						if (success) success.hidden = false;
						if (typeof onSuccess === "function") onSuccess();
						form.reset();

						// Re-trigger your button gating check so the button disables again on reset
						var btn = form.querySelector('button[type="submit"]');
						if (btn) btn.disabled = true;

						// Hide message after a delay
						setTimeout(function () {
							if (success) success.hidden = true;
						}, 6000);
					} else {
						alert(
							"Oops! There was a problem submitting your form. Please try again.",
						);
					}
				})
				.catch(function (error) {
					alert(
						"Network error. Please check your connection and try again.",
					);
				});
		});
	}
	// ============== SMOOTH SCROLL OFFSET ==============
	document.querySelectorAll('a[href^="#"]').forEach(function (link) {
		link.addEventListener("click", function (e) {
			var hash = this.getAttribute("href");
			if (!hash || hash === "#") return;
			var target = document.querySelector(hash);
			if (!target) return;
			e.preventDefault();
			var header = document.querySelector(".site-header");
			var offset = header ? header.offsetHeight + 8 : 0;
			var top =
				target.getBoundingClientRect().top +
				window.pageYOffset -
				offset;
			window.scrollTo({ top: top, behavior: "smooth" });
		});
	});
})();

// ============== EBOOK BUTTON GATING ==============
(function () {
	const form = document.getElementById("ebookForm");
	const btn = document.getElementById("ebookSubmit");
	if (!form || !btn) return;

	function checkFields() {
		const inputs = form.querySelectorAll(
			"input[required], select[required]",
		);
		const allFilled = Array.from(inputs).every(
			(el) => el.value.trim() !== "",
		);
		btn.disabled = !allFilled;
	}

	form.addEventListener("input", checkFields);
	form.addEventListener("change", checkFields);
	checkFields();
})();

// ============== CTA BUTTON GATING ==============
(function () {
	const form = document.getElementById("ctaForm");
	const btn = document.getElementById("ctaSubmit");
	if (!form || !btn) return;

	function check() {
		const required = form.querySelectorAll(
			"input[required], select[required], textarea[required]",
		);
		const filled = Array.from(required).every(
			(el) => el.value.trim() !== "",
		);
		btn.disabled = !filled;
	}

	form.addEventListener("input", check);
	form.addEventListener("change", check);
	check();
})();
