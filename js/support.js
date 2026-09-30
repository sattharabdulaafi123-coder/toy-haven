/* ==========================================================================
   Toy Haven - Feedback & Support page
   Validated feedback form (saved to localStorage) and FAQ accordion.
   ========================================================================== */

"use strict";

const MESSAGE_MAX = 500;

function initFeedbackForm() {
  const form = document.getElementById("feedback-form");
  const nameInput = document.getElementById("fb-name");
  const emailInput = document.getElementById("fb-email");
  const messageInput = document.getElementById("fb-message");
  const counter = document.getElementById("char-count");
  const confirmPanel = document.getElementById("feedback-confirm");
  const messageCheck = function (value) {
    const base = validators.minLength("message", 20)(value);
    if (base) return base;
    return value.length > MESSAGE_MAX ? "Message must be under " + MESSAGE_MAX + " characters." : "";
  };

  liveValidate(nameInput, validators.name);
  liveValidate(emailInput, validators.email);
  liveValidate(messageInput, messageCheck);

  messageInput.addEventListener("input", function () {
    counter.textContent = messageInput.value.length + " / " + MESSAGE_MAX;
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const valid = validateFields([
      { input: nameInput, check: validators.name },
      { input: emailInput, check: validators.email },
      { input: messageInput, check: messageCheck }
    ]);
    if (!valid) return;

    const feedback = loadData(STORAGE_KEYS.feedback, []);
    feedback.push({
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      message: messageInput.value.trim(),
      date: new Date().toISOString()
    });
    saveData(STORAGE_KEYS.feedback, feedback);

    document.getElementById("confirm-name").textContent = nameInput.value.trim().split(" ")[0];
    form.reset();
    counter.textContent = "0 / " + MESSAGE_MAX;
    form.hidden = true;
    confirmPanel.hidden = false;
    confirmPanel.focus();
  });

  document.getElementById("send-another").addEventListener("click", function () {
    confirmPanel.hidden = true;
    form.hidden = false;
    nameInput.focus();
  });
}

function initAccordion() {
  const triggers = Array.from(document.querySelectorAll(".acc-trigger"));
  const toggleAll = document.getElementById("faq-toggle-all");

  function setOpen(trigger, open) {
    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    trigger.setAttribute("aria-expanded", open ? "true" : "false");
    panel.classList.toggle("open", open);
    panel.inert = !open;
  }

  function updateToggleAll() {
    const allOpen = triggers.every(function (trigger) {
      return trigger.getAttribute("aria-expanded") === "true";
    });
    toggleAll.textContent = allOpen ? "Collapse All" : "Expand All";
  }

  triggers.forEach(function (trigger) {
    setOpen(trigger, false);
    trigger.addEventListener("click", function () {
      setOpen(trigger, trigger.getAttribute("aria-expanded") !== "true");
      updateToggleAll();
    });
  });

  toggleAll.addEventListener("click", function () {
    const openAll = toggleAll.textContent === "Expand All";
    triggers.forEach(function (trigger) {
      setOpen(trigger, openAll);
    });
    updateToggleAll();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initFeedbackForm();
  initAccordion();
});
