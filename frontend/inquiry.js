/* Inquiry modal controller script for Atomic Media */

document.addEventListener("DOMContentLoaded", () => {
  const triggers = document.querySelectorAll("[data-inquiry-trigger]");
  const modal = document.getElementById("inquiryModal");
  const closeBtns = document.querySelectorAll(".inquiry-modal-close, .inquiry-modal-close-success");
  const overlay = document.querySelector(".inquiry-modal-overlay");
  const form = document.getElementById("inquiryForm");
  const successMsg = document.getElementById("inquirySuccess");
  const submitBtn = form.querySelector(".inquiry-submit-btn");

  const openModal = () => {
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // Prevent scrolling behind modal
  };

  const closeModal = () => {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = ""; // Restore scrolling

    // Reset form after animations finish
    setTimeout(() => {
      form.reset();
      form.style.display = "flex";
      successMsg.style.display = "none";
      submitBtn.classList.remove("loading");
    }, 400);
  };

  triggers.forEach((btn) => {
    btn.addEventListener("click", openModal);
  });

  closeBtns.forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  overlay.addEventListener("click", closeModal);

  // Esc key closes modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });

  // Handle Form Submission to MongoDB API
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("inquiryName").value.trim();
    const email = document.getElementById("inquiryEmail").value.trim();
    const company = document.getElementById("inquiryCompany").value.trim();
    const service = document.getElementById("inquiryService").value;
    const budget = document.getElementById("inquiryBudget").value;
    const brief = document.getElementById("inquiryMessage").value.trim();

    if (!name || !email || !service || !budget || !brief) {
      alert("Please fill in all required fields.");
      return;
    }

    submitBtn.classList.add("loading");

    // Construct request body matching the Message model
    const payload = {
      name,
      email,
      company,
      subject: `Project Inquiry - ${service} [${budget}]`,
      message: `Selected Service Node: ${service}\nTarget Budget Allocation: ${budget}\n\nClient Brief & Project Parameters:\n${brief}`
    };

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to transmit inquiry to server.");
      }

      // Transmission Success
      setTimeout(() => {
        form.style.display = "none";
        successMsg.style.display = "flex";
        submitBtn.classList.remove("loading");
      }, 800);

    } catch (error) {
      console.error("Transmission error:", error);
      alert(`System connection error: ${error.message || "Failed to contact database."}`);
      submitBtn.classList.remove("loading");
    }
  });
});
