const path = require("path");
const express = require("express");
const app = express();

app.use(express.static(path.join(__dirname, "public")));

// -----------------------------  HANDLEBARS  -----------------------------
const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

// -------------------------  EXPRESS MIDDLEWARE  -------------------------
const logger = require("morgan");
const cookieParser = require("cookie-parser");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// -------------------------------  MONGODB  ------------------------------

const mongoose = require("mongoose");
const dbName = "moodle";
const MONGODB_URI = process.env.MONGODB_URI || `mongodb://localhost/${dbName}`;
const db = require("./models")(mongoose);
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const controller = {}; // todo

// ----------------------------  MOUNT ROUTER  ----------------------------
const router = express.Router();
require("./routes")(router);
app.use("/", router);

// ---------------------------  ERROR HANDLING  ---------------------------
const createError = require("http-errors");
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// ----------------------------  START SERVER  ----------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Server started on port ${PORT}!`);
});

module.exports = app;
