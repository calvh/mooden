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

      db.User.findById(user.id)
        .then((dbUser) => res.status(200).json(dbUser))
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
        entryDate: Date(),
        mood: 5
      }
      */

      db.Datapoint.create(req.body)
        .then((dbDatapoint) => {
          return db.User.updateOne(
            { _id: user._id },
            {
              $push: {
                datapoints: dbDatapoint._id,
              },
            }
          );
        })
        .then((dbUser) => res.json(dbUser))
        .catch((err) => res.status(500).send(err));
    })(req, res, next);
  });

  return router;
};
