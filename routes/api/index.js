module.exports = (router, passport, jwt, db) => {
  /* GET users listing. */
  router.get("/users", function (req, res, next) {
    res.send("respond with a resource");
  });

  return router;
};
