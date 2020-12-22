module.exports = (router, passport, db, jwt, tokens) => {
  // ------------------------------  REGISTER  ------------------------------

  router.post("/register", (req, res, next) => {
    // pass request to passport: register strategy
    passport.authenticate("register", async (err, user, info) => {
      // use custom callback

      if (err) {
        // 500 Internal Server Error: The server has encountered a situation it doesn't know how to handle
        return res.status(500).send(err);
      }

      if (!user && !info.authError && !info.validateError) {
        // missing credentials
        // 400 Bad Request: The server could not understand the request due to invalid syntax
        return res.status(400).send(info);
      }

      if (!user && info.authError) {
        // duplicate email
        // 409 Conflict: request conflicts with the current state of the server
        return res.status(409).send(info);
      }

      if (!user && info.validateError) {
        // bad email or password format, details in validateError object
        // 400 Bad Request: The server could not understand the request due to invalid syntax
        return res.status(400).send(info);
      }

      // registration was successful, send a refresh token in a cookie and redirect to dashboard
      const refreshToken = tokens.createRefreshToken(user, jwt);
      try {
        await tokens.storeRefreshToken(db, user, refreshToken);
        tokens.sendRefreshToken(res, refreshToken);
        return res.redirect("/dashboard");
      } catch (err) {
        return res.status(500).send(err);
      }
    })(req, res, next);
  });

  // --------------------------------  LOGIN  -------------------------------
  router.post("/login", (req, res, next) => {
    // pass request to passport: login strategy
    passport.authenticate("login", async (err, user, info) => {
      // use custom callback

      if (err) {
        // 500 Internal Server Error: The server has encountered a situation it doesn't know how to handle
        return res.status(500).send(err);
      }

      if (!user && !info.authError) {
        // missing credentials
        // 400 Bad Request: The server could not understand the request due to invalid syntax
        return res.status(400).send(info);
      }

      if (!user && info.authError === "email") {
        // email does not exist in database
        // 404 Not Found: The server can not find the requested resource
        return res.status(404).send(info);
      }

      if (!user && info.authError === "password") {
        // wrong password
        // 401 Unauthorized: Unauthenticated
        return res.status(401).send(info);
      }

      // login was successful, send a refresh token in a cookie and redirect to dashboard
      const refreshToken = tokens.createRefreshToken(user, jwt);
      try {
        await tokens.storeRefreshToken(db, user, refreshToken);
        tokens.sendRefreshToken(res, refreshToken);
        return res.redirect("/dashboard");
      } catch (err) {
        return res.status(500).send(err);
      }
    })(req, res, next);
  });

  // ------------------------------  LOGOUT  ------------------------------

  router.post("/logout", (req, res) => {
    // clear cookie on client
    res.clearCookie("refreshToken");

    const token = req.cookies["refreshToken"];

    jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          // invalid token error
          res.status(500).send(err);
        }

        // remove refresh token from database
        try {
          await db.User.findByIdAndUpdate(decoded.id, {
            $unset: { refreshToken: "" },
          }).exec();

          // clear successful
          res.redirect("/");
        } catch (err) {
          // db error; unable to remove refresh token from database
          res.status(500).send(err);
        }
      }
    );
  });

  // ---------------------------  ACCESS TOKEN  ---------------------------
  // todo this is an API route
  router.post("/dashboard", (req, res) => {
    passport.authenticate("jwtAccess", (err, user, info) => {
      if (err) {
        // invalid refresh token
        return res.redirect("/login");
      }
    });
  });

  // -------------  ISSUE NEW ACCESS TOKEN WITH REFRESH TOKEN  ------------
  router.post("/refresh-token", (req, res, next) => {
    passport.authenticate("jwtRefresh", async (err, user, info) => {
      if (err) {
        // 500 Internal Server Error: The server has encountered a situation it doesn't know how to handle
        return res.status(500).send(err);
      }

      if (!user) {
        // invalid refresh token or user not found
        return res.redirect("/login");
      }

      // refresh token valid, issue new refresh and access tokens
      const refreshToken = tokens.createRefreshToken(user, jwt);
      try {
        // store refresh token in database
        await tokens.storeRefreshToken(db, user, refreshToken);
        tokens.sendRefreshToken(res, refreshToken);

        // send access token and expiry date
        res.status(200).send(tokens.createAccessToken(user, jwt));
      } catch (err) {
        return res.status(500).send(err);
      }
    })(req, res, next);
  });

  return router;
};
