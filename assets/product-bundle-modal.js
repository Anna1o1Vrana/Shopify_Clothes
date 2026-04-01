document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector("[data-bundle-section]");
  const modal = section.querySelector("[data-bundle-modal]");
  const openModal = section.querySelector("[data-modal-trigger]");
  const closeBtn = section.querySelector("[data-close-modal]");

  const selected = new Set();

  // modal functionality
  if (openModal && modal) {
    openModal.addEventListener("click", () => {
      modal.removeAttribute("hidden");
      document.body.classList.add("overflow-hidden");
    });
  }

  const closeModal = () => {
    modal.setAttribute("hidden", true);
    document.body.classList.remove("overflow-hidden");
  };

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
    if (e.target.closest("[data-close-modal]")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hasAttribute("hidden")) {
      closeModal();
    }
  });

  // select product
  section.querySelectorAll(".bundle-product").forEach((item) => {
    item.addEventListener("click", () => {
      const variantId = item.dataset.variant;

      if (selected.has(variantId)) {
        selected.delete(variantId);
        item.classList.remove("active");
      } else {
        selected.add(variantId);
        item.classList.add("active");
      }
    });
  });

  // add all to cart
  // section.querySelector('.add-all').addEventListener('click', async () => {
  //   if (!selected.size) return;

  //   const items = [...selected].map(id => ({
  //     id,
  //     quantity: 1
  //   }));

  //   try {
  //     const res = await fetch('/cart/add.js', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({ items })
  //     });

  //     const data = await res.json();

  //     // optional: trigger cart drawer refresh
  //     document.dispatchEvent(new CustomEvent('cart:updated', { detail: data }));

  //     closeModal();
  //   } catch (err) {
  //     console.error(err);
  //   }
  // });


  // select product
  section.querySelectorAll('.bundle-product').forEach(item => {
    item.addEventListener('click', () => {
      const variantId = item.dataset.variant;

      if (selected.has(variantId)) {
        selected.delete(variantId);
        item.classList.remove('active');
      } else {
        selected.add(variantId);
        item.classList.add('active');
      }
    });
  });

  // add all to cart
  section.querySelector('.add-all').addEventListener('click', async () => {
    if (!selected.size) return;

    const items = [...selected].map(id => ({
      id,
      quantity: 1
    }));

    try {
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ items })
        });
  
        const data = await res.json();
        // optional: trigger cart drawer refresh
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: data }));

      closeModal();
    } catch (err) {
      console.error(err);
    }
  });
});
