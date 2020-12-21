"use strict";

$(function () {
  $(document).on("submit", "#form-login", (e) => {
    e.preventDefault();

    const email = $("#input-email").val();
    const password = $("#input-password").val();

    const login = async () => {
      try {
        const opts = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify({ email, password }),
        };

        const response = await fetch("/auth/login", opts);
        if (response.status === 200) {
          // login success - redirect to dashboard
          window.location.replace(response.url);
        } else {
          // login failed
          console.log("login failed");
          throw new Error(response.statusText);
        }
      } catch (err) {
        console.log(err);
      }
    };

    login();
  });
});
