console.log("StoryAI frontend loaded successfully.");

document.addEventListener("DOMContentLoaded", () => {
  const toggleButtons = document.querySelectorAll(".password-toggle");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const wrapper = button.closest(".password-wrap");
      const input = wrapper.querySelector(".password-field");
      const icon = button.querySelector("i");

      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";

      icon.classList.toggle("bi-eye");
      icon.classList.toggle("bi-eye-slash");
    });
  });
});