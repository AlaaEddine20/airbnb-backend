const express = require("express");
const { check, validationResult } = require("express-validator");
const { join } = require("path");
const { getPlaces, writePlaces } = require("../../fsUtilities");

const placesRouter = express.Router();
const ownersRouter = express.Router();

const validationPlaces = [
  check("title").exists().withMessage("title is required!"),
  check("description").exists().withMessage("description is required!"),
];

placesRouter.get("/", async (req, res, next) => {
  try {
    const places = await getPlaces();

    res.send(await places);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

placesRouter.post("/", validationPlaces, async (req, res, next) => {
  try {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      const error = new Error();
      error.message = validationErrors;
      error.httpStatusCode = 400;
      next(error);
    } else {
      const places = await getPlaces();
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
module.exports = placesRouter;
