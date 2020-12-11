module.exports = (router, passport, db, jwt) => {
  /* GET users listing. */
  router.get("/users", function (req, res, next) {
    res.send("respond with a resource");
  });
};
