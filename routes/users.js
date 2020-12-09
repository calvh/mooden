module.exports = (router, controller) => {
  /* GET users listing. */
  router.get("/users", function (req, res, next) {
    res.send("respond with a resource");
  });
};
