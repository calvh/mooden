module.exports = (router, passport, jwt, db) => {
  const createAndSendTokens = (user, res, req) => {
    // create access token
    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    // create refresh token
    const refreshToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7D" }
    );

    // store new refresh token in database
    db.User.findByIdAndUpdate(user._id, refreshToken, { new: true })
      .then((dbUser) => {
        // storage successful
        // send access token in response and refresh token as an HTTP cookie
        res
          .status(200)
          .send({
            accessToken,
            email: req.body.email,
          })
          .cookie("refreshToken", token, {
            httpOnly: true,
            path: "/refresh_token",
          });
      })
      .catch((err) => {
        // db error; unable to store refresh token in database
        res.status(500).send(err);
      });
  };

  // ------------------------------  REGISTER  ------------------------------

  router.post("/register", (req, res, next) => {
    // pass request to passport: register strategy
    passport.authenticate("register", (err, user, info) => {
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

      // registration was successful, automatically login user
      req.logIn(user, { session: false }, (err) => {
        if (err) {
          // 500 Internal Server Error: The server has encountered a situation it doesn't know how to handle
          return res.status(500).send(err);
        }

        createAndSendTokens(user, res, req);
      });
    })(req, res, next);
  });

  // --------------------------------  LOGIN  -------------------------------
  router.post("/login", (req, res, next) => {
    // pass request to passport: login strategy
    passport.authenticate("login", (err, user, info) => {
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

      // everything checks out, proceed to login user
      req.logIn(user, { session: false }, (err) => {
        if (err) {
          // 500 Internal Server Error: The server has encountered a situation it doesn't know how to handle
          return res.status(500).send(err);
        }

        createAndSendTokens(user, res, req);
      });
    })(req, res, next);
  });

  // ------------------------------  LOGOUT  ------------------------------

  router.post("/logout", (_req, res) => {
    // clear cookie on client
    res.clearCookie("refreshToken", { path: "/refresh_token" });

    // clear refresh token in database
    db.User.findByIdAndUpdate(user._id, { $unset: { refreshToken: "" } })
      .then((dbUser) => {
        // clear successful
        res.status(200).send({
          message: "Successfully logged out",
        });
      })
      .catch((err) => {
        // db error
        res.status(500).send(err);
      });
  });

  // -------------  ISSUE NEW ACCESS TOKEN WITH REFRESH TOKEN  ------------
  router.post("/refresh_token", (req, res) => {
    passport.authenticate("jwtRefresh", (err, user, info) => {
      if (err) {
        // invalid refresh token
        // todo redirect to homepage
        return res.send({ accessToken: "" });
      }

      createAndSendTokens(user, res, req);
    });
  });

  return router;
};
