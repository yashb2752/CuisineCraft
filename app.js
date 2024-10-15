const express = require("express");
const app = express();
require("dotenv").config();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const db = require("./db");

// import the model files
const Person = require("./models/person");
const MenuItem = require("./models/MenuItem");

// import the router files
const personRoutes = require("./routes/personRoutes");
const menuRoutes = require("./routes/menuRoutes");

// import passport
const passport = require("./auth");

// middleware
const logRequest = (req, res, next) => {
  console.log(
    `[${new Date().toLocaleString()}] Request Made to:${req.originalUrl}`
  );
  next(); // move on to the next phase ie to  server
};
app.use(logRequest);

app.use(passport.initialize());
const localAuthMiddleware = passport.authenticate("local", { session: false });
app.get("/", function (req, res) {
  res.send("welcome to my Hotel");
});
// use the routers

app.use("/person", personRoutes);
app.use("/menu-items", menuRoutes);

app.listen(8000, () => {
  console.log("listening on port 8000");
});
