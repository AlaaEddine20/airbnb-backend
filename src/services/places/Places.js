const express = require("express");
const { check, validationResult } = require("express-validator");
const uniqid = require("uniqid");
const multer = require("multer");
const cloudinary = require("../../cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { getPlaces, writePlaces, getOwners } = require("../../fsUtilities");
// ROUTER
const placesRouter = express.Router();

// VALIDATION
const validationPlaces = [
  check("title").exists().withMessage("title is required!"),
  check("description").exists().withMessage("description is required!"),
];

// STORAGE
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "places-img",
  },
});

const cloudinaryMulter = multer({ storage: storage });

// GET ALL PLACES
placesRouter.get("/", async (req, res, next) => {
  try {
    const places = await getPlaces();

    res.send(await places);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// POST PLACES BY OWNER ID
placesRouter.post("/:ownerID", validationPlaces, async (req, res, next) => {
  try {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      const error = new Error();
      error.message = validationErrors;
      error.httpStatusCode = 400;
      return next(error);
    }

    const places = await getPlaces();
    const owners = await getOwners();

    const streetAddress = req.body.address.street;
    const place = places.find(
      (place) => place.address.street === streetAddress
    );
    const owner = owners.find((owner) => owner.ownerID === req.params.ownerID);

    if (!owner) {
      const error = new Error();
      error.httpStatusCode = 400;
      error.message = "Owner not found!";
      next(error);
    }

    if (place) {
      return next(new Error("Place already exists!"));
    }
    const newPlace = {
      ...req.body,
      ownerID: req.params.ownerID,
      createdAt: new Date(),
      placeID: uniqid(),
      ownerName: req.body.Username,
    };
    places.push(newPlace);
    await writePlaces(places);
    res.status(201).send("Successfully posted");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// UPLOAD IMAGE TO PLACE
placesRouter.post(
  "/upload/:placeID/:ownerID",
  cloudinaryMulter.array("image"),
  async (req, res, next) => {
    try {
      const places = await getPlaces();
      const owners = await getOwners();
      places.push({
        ...req.body,
        img: req.file.path,
      });
      await writePlaces(places);
      res.json(places);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

module.exports = placesRouter;
