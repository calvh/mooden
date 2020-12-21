"use strict";

$(function () {
  $(document).on("submit", "#form-register", (e) => {
    e.preventDefault();

    const email = $("#input-email").val();
    const password = $("#input-password").val();

    const register = async () => {
      try {
        const opts = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify({ email, password }),
        };

        const response = await fetch("/auth/register", opts);
        if (response.status === 200) {
          // register success - redirect to dashboard
          window.location.replace(response.url);
        } else {
          // register failed
          console.log("register failed");
          throw new Error(response.statusText);
        }
      } catch (err) {
        console.log(err);
      }
    };

    register();
  });
});
