module.exports = (router) => {
  router.get("/", (req, res) => {
    res.render("index");
  });
  router.get("/login", (req, res) => {
    res.render("login", { style: "signin.css" });
  });
  router.get("/register", (req, res) => {
    res.render("register", { style: "signin.css" });
  });
  router.get("/dashboard", (req, res) => {
    res.render("dashboard");
  });
  router.get("*", (req, res) => {
    res.status(404).render("404");
  });

  return router;
};
