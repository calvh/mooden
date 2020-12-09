module.exports = (router) => {
  router.get("/", (req, res) => {
    res.render("index");
  });
  router.get("/dashboard", (req, res) => {
    res.render("dashboard");
  });
  router.get("*", (req, res) => {
    res.status(404).render("404");
  });
};
