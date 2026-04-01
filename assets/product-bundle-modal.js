class BundleSection {
  constructor(section) {
    this.section = section;
    this.modal = section.querySelector("[data-bundle-modal]");
    this.openBtn = section.querySelector("[data-modal-trigger]");
    this.cards = Array.from(section.querySelectorAll("[data-product]"));
    this.selected = new Set();
    this.init();
  }

  init() {
    if (!this.section) return;
    this.bindModal();
    this.bindProducts();
    this.bindKeyboard();
  }

  bindModal() {
    if (!this.modal || !this.openBtn) return;

    this.openBtn.addEventListener("click", () => {
      this.openModal();
    });

    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal || e.target.closest("[data-close-modal]")) {
        this.closeModal();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !this.modal.hasAttribute("hidden")) {
        this.closeModal();
      }
    });
  }

  openModal() {
    this.modal.removeAttribute("hidden");
    document.body.classList.add("overflow-hidden");

    this.initFocus();
  }

  closeModal() {
    this.modal.setAttribute("hidden", true);
    document.body.classList.remove("overflow-hidden");

    this.openBtn?.focus();
  }

  initFocus() {
    if (!this.cards.length) return;

    this.cards.forEach((card, i) => {
      card.setAttribute("tabindex", i === 0 ? "0" : "-1");
    });

    this.cards[0].focus();
  }

  updateFocus(newIndex) {
    this.cards.forEach((card) => card.setAttribute("tabindex", "-1"));
    this.cards[newIndex].setAttribute("tabindex", "0");
    this.cards[newIndex].focus();
  }

  bindProducts() {
    this.cards.forEach((card) => {
      const select = card.querySelector("[data-variants]");
      const button = card.querySelector(".product-card__add-to-bag");

      const priceEl = card.querySelector("[data-price]");
      const compareEl = card.querySelector("[data-compare]");
      const imageEl = card.querySelector("[data-image]");
      const titleEl = card.querySelector("[data-title]");

      card.addEventListener("click", () => {
        const id = card.dataset.variantId;
        if (!id) return;

        if (this.selected.has(id)) {
          this.selected.delete(id);
          card.classList.remove("active");
        } else {
          this.selected.add(id);
          card.classList.add("active");
        }
      });

      if (select) {
        select.addEventListener("change", () => {
          const option = select.selectedOptions[0];

          const variantId = option.value;
          const price = Number(option.dataset.price);
          const compare = Number(option.dataset.compare);
          const image = option.dataset.image;
          const title = option.dataset.title;

          card.dataset.variantId = variantId;

          if (priceEl) {
            priceEl.textContent = this.formatPrice(price);
          }

          if (compareEl) {
            if (compare && compare > price) {
              compareEl.textContent = this.formatPrice(compare);
              compareEl.style.display = "inline";
            } else {
              compareEl.style.display = "none";
            }
          }

          if (image && imageEl) {
            imageEl.src = image;
          }

          if (title && titleEl) {
            titleEl.textContent = title.toUpperCase();
          }
        });
      }

      if (button) {
        button.addEventListener("click", async (e) => {
          e.stopPropagation();

          const variantId = card.dataset.variantId;
          if (!variantId) return;

          await this.addToCart(button, variantId);
        });
      }
    });
  }

  async addToCart(button, variantId) {
    button.disabled = true;
    button.textContent = "Adding...";

    try {
      const res = await fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: variantId, quantity: 1 }),
      });

      if (!res.ok) throw new Error("Add to cart failed");

      const data = await res.json();

      button.textContent = "Added ✓";

      document.dispatchEvent(
        new CustomEvent("cart:updated", {
          detail: data,
        }),
      );
    } catch (err) {
      console.error(err);
      button.textContent = "Error";
    } finally {
      setTimeout(() => {
        button.disabled = false;
        button.textContent = "Add to bag";
      }, 1500);
    }
  }

  formatPrice(cents) {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);
  }

  bindKeyboard() {
    this.cards.forEach((card, index) => {
      const select = card.querySelector("[data-variants]");
      const button = card.querySelector(".product-card__add-to-bag");

      card.addEventListener("keydown", (e) => {
        const optionsCount = select?.options.length || 0;

        // variant switch
        if (select && optionsCount) {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            select.selectedIndex = (select.selectedIndex + 1) % optionsCount;
            select.dispatchEvent(new Event("change"));
            return;
          }

          if (e.key === "ArrowLeft") {
            e.preventDefault();
            select.selectedIndex =
              (select.selectedIndex - 1 + optionsCount) % optionsCount;
            select.dispatchEvent(new Event("change"));
            return;
          }
        }

        if (e.key === "ArrowDown") {
          e.preventDefault();
          const next = index + 1;
          if (next < this.cards.length) this.updateFocus(next);
          return;
        }

        if (e.key === "ArrowUp") {
          e.preventDefault();
          const prev = index - 1;
          if (prev >= 0) this.updateFocus(prev);
          return;
        }

        if (e.key === "Enter" && button) {
          e.preventDefault();
          button.click();
        }
      });
    });
  }
}

function initBundleSections() {
  document.querySelectorAll("[data-bundle-section]").forEach((section) => {
    new BundleSection(section);
  });
}

document.addEventListener("DOMContentLoaded", initBundleSections);

document.addEventListener("shopify:section:load", (e) => {
  const section = e.target;
  if (section.matches("[data-bundle-section]")) {
    new BundleSection(section);
  }
});
