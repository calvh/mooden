module.exports = (router, passport, jwt, db) => {
  router.get("/data", (req, res, next) => {
    passport.authenticate("jwtAccess", (err, user, info) => {
      if (err) {
        // 500 Internal Server Error: The server has encountered a situation it doesn't know how to handle
        console.log(err);
        return res.status(500).send(err);
      }

      if (!user) {
        // invalid refresh token or user not found
        return res.redirect("/login");
      }

      db.Datapoint.find({ user: user._id }, "date mood")
        .then((dbDatapoints) => res.json(dbDatapoints))
        .catch((err) => res.status(500).send(err));
    })(req, res, next);
  });

  router.put("/data", (req, res, next) => {
    passport.authenticate("jwtAccess", (err, user, info) => {
      if (err) {
        // 500 Internal Server Error: The server has encountered a situation it doesn't know how to handle
        console.log(err);
        return res.status(500).send(err);
      }

      if (!user) {
        // invalid refresh token or user not found
        return res.redirect("/login");
      }

      db.Datapoint.deleteMany({ user: user._id })
        .then((result) => res.json(result))
        .catch((err) => res.status(500).send(err));
    })(req, res, next);
  });

  router.post("/data", (req, res, next) => {
    passport.authenticate("jwtAccess", (err, user, info) => {
      if (err) {
        // 500 Internal Server Error: The server has encountered a situation it doesn't know how to handle
        console.log(err);
        return res.status(500).send(err);
      }

      if (!user) {
        // invalid refresh token or user not found
        return res.redirect("/login");
      }

      /*
      req.body = {
        entryDate: Date,
        mood: int
      }
      */

      db.Datapoint.create({ user: user._id, ...req.body })
        .then((dbDatapoint) => res.json(dbDatapoint))
        .catch((err) => res.status(500).send(err));
    })(req, res, next);
  });

  return router;
};
