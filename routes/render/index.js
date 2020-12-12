module.exports = (router, passport, db, jwt, tokens) => {
  // for all routes perform a check on refresh token and redirect to dashboard if valid
  router.get("/*", (req, res, next) => {
    if (req.originalUrl.startsWith("/dashboard")) {
      // skip any /dashboard routes
      return next();
    }

    // all other routes
    passport.authenticate("jwtRefresh", (err, user, info) => {
      if (err) {
        // 500 Internal Server Error: The server has encountered a situation it doesn't know how to handle
        return res.status(500).send(err);
      }
      if (!user) {
        // invalid refresh token
        return next();
      }

      // valid refresh token
      res.redirect("/dashboard");
    })(req, res, next);
  });
  router.get("/", (req, res, next) => {
    return res.render("index");
  });

  router.get("/home", (req, res, next) => {
    return res.redirect("/");
  });

  router.get("/login", (req, res, next) => {
    return res.render("login");
  });

  router.get("/register", (req, res, next) => {
    return res.render("register");
  });

  // protected route
  router.get("/dashboard", (req, res, next) => {
    passport.authenticate("jwtRefresh", (err, user, info) => {
      if (err) {
        // 500 Internal Server Error: The server has encountered a situation it doesn't know how to handle
        return res.status(500).send(err);
      }
      if (!user) {
        // invalid refresh token
        return res.redirect("/login");
      }

      res.render("dashboard");
    })(req, res, next);
  });

  router.get("*", (req, res, next) => {
    return res.status(404).render("404");
  });

  return router;
};
