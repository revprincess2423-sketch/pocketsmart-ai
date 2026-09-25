document.addEventListener("DOMContentLoaded", function () {
  // Mobile nav toggle
  var navToggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("main-nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  // AI recommendation fetch (recommendations.html)
  var btn = document.getElementById("get-recommendation-btn");
  var resultBox = document.getElementById("recommendation-result");
  if (btn && resultBox) {
    btn.addEventListener("click", function () {
      btn.disabled = true;
      var originalLabel = btn.textContent;
      btn.textContent = "Thinking...";
      resultBox.style.display = "block";
      resultBox.className = "recommendation-box";
      resultBox.textContent = "Contacting AI service...";

      fetch("/api/recommendations", { method: "POST" })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          if (data.success) {
            resultBox.className = "recommendation-box";
            resultBox.textContent = data.recommendation;
          } else {
            resultBox.className = "recommendation-box error";
            resultBox.textContent = "AI recommendation unavailable: " + data.error;
          }
        })
        .catch(function (err) {
          resultBox.className = "recommendation-box error";
          resultBox.textContent = "Request failed: " + err;
        })
        .finally(function () {
          btn.disabled = false;
          btn.textContent = originalLabel;
        });
    });
  }
});
