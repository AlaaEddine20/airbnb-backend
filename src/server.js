const express = require("express");
const cors = require("cors");
const listEndPoints = require("express-list-endpoints");

const placesRoutes = require("./services/places/Places");
// const ownersRoutes = require("./services/owners/Owners");
// const usersRoutes = require("./services/users/Users");

const {
  badRequestHandler,
  unauthorizedHandler,
  forbiddenHandler,
  notFoundHandler,
  genericErrorHandler,
} = require("./errorHandling");

const server = express();

const port = process.env.PORT || 5000;

const loggerMiddleWare = (req, res, next) => {
  console.log(`Logged ${req.url} -- ${new Date()}`);
  next();
};

server.use(express.json());
server.use(loggerMiddleWare);

const whiteList =
  process.env.NODE_ENV === "production"
    ? [process.env.FE_URL_PROD]
    : [process.env.FE_URL_DEV];

const corsOptions = {
  origin: function (origin, callback) {
    if (whiteList.indexOf(origin) !== -1) {
      // ALLOWED
      callback(null, true);
    } else {
      // NOT ALLOWED
      callback(new Error("NOT ALLOWED - CORS ISSUES"));
    }
  },
};

server.use(cors(corsOptions));

// ROUTES
server.use("/places", placesRoutes);
// server.use("/owners", ownersRoutes);
// server.use("/users", usersRoutes);

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
