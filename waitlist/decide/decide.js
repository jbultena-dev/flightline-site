// Confirmation page for the owner's signed Approve/Waitlist links. Opening the page only
// previews the request; the decision is made when Confirm is pressed (a POST), so email
// link scanners can't approve anyone. Everything is shown with textContent.
(function () {
  "use strict";
  var ENDPOINT = "https://srpjvponziksyfwjsfgt.supabase.co/functions/v1/waitlist-decision";
  var params = new URLSearchParams(window.location.search);
  var link = {
    id: params.get("id") || "", action: params.get("action") || "", exp: params.get("exp") || "",
    nonce: params.get("nonce") || "", sig: params.get("sig") || ""
  };
  var details = document.querySelector(".decide-details");
  var form = document.querySelector(".decide-form");
  var button = form.querySelector("button");
  var status = document.querySelector(".decide-status");
  var VERB = { approve: "Approve", waitlist: "Waitlist" };
  var ERRORS = {
    invalid_link: "This link isn’t valid.",
    expired: "This link has expired (links last 7 days). Make a new one with Scripts/waitlist_link.py.",
    used: "This link has already been used.",
    not_allowed: "That change isn’t allowed from the request’s current status.",
    not_found: "That request no longer exists.",
    testflight_link_missing: "Approval is off: set the TESTFLIGHT_PUBLIC_LINK secret first.",
    unavailable: "Something went wrong. Try again in a moment."
  };
  var EMAIL = {
    sent: "The email was sent.",
    already_sent: "They already had this email, so it wasn’t sent again.",
    failed: "But the email couldn’t be sent: check the function logs.",
    not_configured: "But email is off: RESEND_API_KEY isn’t set."
  };

  function show(message, ok) {
    status.textContent = message;
    status.classList.toggle("is-ok", !!ok);
    status.classList.toggle("is-error", !ok);
  }

  function call(mode) {
    var body = { mode: mode, id: link.id, action: link.action, exp: link.exp, nonce: link.nonce, sig: link.sig };
    return fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (data) {
          return { ok: response.ok, data: data };
        });
      });
  }

  function fill(request) {
    var when = request.created_at ? new Date(request.created_at).toLocaleString() : "";
    var values = { email: request.email, home_airport: request.home_airport || "(not given)",
                   spots: request.spots || "(not given)", created_at: when, status: request.status };
    Array.prototype.forEach.call(details.querySelectorAll("[data-field]"), function (cell) {
      cell.textContent = values[cell.getAttribute("data-field")] || "";
    });
    details.hidden = false;
  }

  if (!VERB[link.action]) {
    show(ERRORS.invalid_link, false);
    return;
  }

  call("preview").then(function (reply) {
    if (!reply.ok || !reply.data.request) {
      show(ERRORS[reply.data.error] || ERRORS.unavailable, false);
      return;
    }
    fill(reply.data.request);
    button.textContent = "Confirm: " + VERB[link.action];
    form.hidden = false;
    show("Check the details, then confirm.", true);
  }).catch(function () { show(ERRORS.unavailable, false); });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    button.disabled = true;
    show("Saving…", true);
    call("confirm").then(function (reply) {
      if (!reply.ok) {
        show(ERRORS[reply.data.error] || ERRORS.unavailable, false);
        button.disabled = false;
        return;
      }
      var done = reply.data.status === "approved" ? "Approved." : "Waitlisted.";
      if (reply.data.result === "unchanged") done = "Already " + reply.data.status + ".";
      form.hidden = true;
      details.querySelector('[data-field="status"]').textContent = reply.data.status;
      show(done + " " + (EMAIL[reply.data.email] || ""), reply.data.email === "sent" || reply.data.email === "already_sent");
    }).catch(function () {
      show(ERRORS.unavailable, false);
      button.disabled = false;
    });
  });
})();
