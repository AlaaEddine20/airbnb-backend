const express = require("express");
const listEndPoints = require("express-list-endpoints");
const {
  badRequestHandler,
  unauthorizedHandler,
  forbiddenHandler,
  notFoundHandler,
  genericErrorHandler,
} = require("./errorHandling");

const placesRoutes = require("./services/places/Places");
const ownersRoutes = require("./services/owners/Owners");
const usersRoutes = require("./services/users/Users");

const server = express();

server.use(express.json());

server.get("/", (req, res, next) => res.send("Server is running..."));

// ROUTES
server.use("/places", placesRoutes);
server.use("/owners", ownersRoutes);
server.use("/users", usersRoutes);

const port = process.env.PORT || 5000;

// ERROR HANDLERS
server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(forbiddenHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

console.log(listEndPoints(server));

server.listen(port, () => {
  if (process.env.FE_URL_PROD === "production") {
    console.log("Running on cloud on port", port);
  } else {
    console.log("Running locally on port", port);
  }
});
