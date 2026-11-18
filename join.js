// Beta waitlist form: sends without leaving the page. Without JavaScript the form still
// posts directly and the server redirects back here with ?joined=1 or ?error=….
(function () {
  "use strict";
  var form = document.querySelector(".join-form");
  if (!form) return;
  var status = form.querySelector(".join-status");
  var button = form.querySelector("button");
  var email = form.elements.email;
  var started = form.elements.started_at;

  var CONFIRMED = "You’re on the list ✈️";
  var MESSAGES = {
    invalid_email: "That email doesn’t look right. Check it and try again.",
    invalid_home_airport: "Use an airport code like LAX, or a city name.",
    invalid_spots: "Keep “What do you spot?” under 120 characters.",
    rate_limited: "Too many tries. Please wait a little and try again.",
    unavailable: "Something went wrong on our end. Please try again shortly."
  };

  started.value = String(Date.now());

  function show(message, ok) {
    status.textContent = message;
    status.classList.toggle("is-ok", !!ok);
    status.classList.toggle("is-error", !ok);
  }

  function done() {
    show(CONFIRMED, true);
    form.classList.add("is-done");
  }

  // Back from a no-JavaScript submission.
  var params = new URLSearchParams(window.location.search);
  if (params.get("joined") === "1") done();
  else if (params.get("error")) show(MESSAGES[params.get("error")] || MESSAGES.unavailable, false);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var value = email.value.trim();
    if (!value || !email.checkValidity()) {
      show(MESSAGES.invalid_email, false);
      email.focus();
      return;
    }
    button.disabled = true;
    show("Sending…", true);
    var body = {
      email: value,
      home_airport: form.elements.home_airport.value.trim(),
      spots: form.elements.spots.value.trim(),
      website: form.elements.website.value,
      started_at: started.value
    };
    fetch(form.action, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (data) {
          if (response.ok && data.ok) done();
          else show(MESSAGES[data.error] || MESSAGES.unavailable, false);
        });
      })
      .catch(function () { show(MESSAGES.unavailable, false); })
      .then(function () { button.disabled = false; });
  });
})();
