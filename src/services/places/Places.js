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

const cloudinaryStorage = multer({ storage: storage });

// POST PLACES BY OWNER ID
placesRouter.post(
  "/:owner_id/delete",
  validationPlaces,
  async (req, res, next) => {
    try {
      const validationErrors = validationResult(req);

      const places = await getPlaces();
      const owners = await getOwners();
      if (!validationErrors.isEmpty()) {
        const error = new Error();
        error.message = validationErrors;
        error.httpStatusCode = 400;
        return next(error);
      }
      // CHECKING IF THE PLACE EXISTS IN THE DB BY THE ADDRESS
      const streetAddress = req.body.address.street;
      const place = places.find(
        (place) => place.address.street === streetAddress
      );
      // IF THE ADDRESS EXISTS RETURN...
      if (place) {
        return next(new Error("Place already exists!"));
      }

      // CHECKING IF THE OWNER EXISTS IN DB
      const owner = owners.find(
        (owner) => owner.owner_id === req.params.owner_id
      );

      if (!owner) {
        const error = new Error();
        error.httpStatusCode = 400;
        error.message = "Owner not found!";
        next(error);
      }
      // AFTER THE CHECKS ARE PASSED THEN POST
      const newPlace = {
        ...req.body,
        place_pics: [],
        owner_id: req.params.owner_id,
        ownerName: owner.UserName,
        place_id: uniqid(),
        createdAt: new Date(),
      };
      places.push(newPlace);
      await writePlaces(places);
      res.status(201).send("Successfully posted");
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

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

// DELETE PLACE
placesRouter.delete("/:place_id", async (req, res, next) => {
  try {
    const places = await getPlaces();
    // FIND PLACE
    const placeFound = places.find(
      (place) => place.place_id === req.params.place_id
    );
    if (!placeFound) {
      res.send(new Error("Place not found"));
    } else {
      const filteredPlaces = places.filter(
        (place) => place.place_id !== req.params.place_id
      );
      await writePlaces(filteredPlaces);
      res.status(204).send("Deleted!");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// EDIT PLACE
placesRouter.put("/:place_id", validationPlaces, async (req, res, next) => {
  try {
    const places = await getPlaces();

    const placeIndex = places.findIndex(
      (place) => place.place_id === req.params.place_id
    );
    if (placeIndex !== -1) {
      const updatedPlace = [
        ...places.slice(0, placeIndex),
        { ...places[placeIndex], ...req.body },
        ...places.slice(placeIndex + 1),
      ];
      await writePlaces(updatedPlace);
      res.send("Updated!");
    } else {
      err = new Error();
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// PLACE IMAGE UPLOAD
placesRouter.post(
  "/:owner_id/place_id/upload",
  cloudinaryStorage.array("image", 2),
  async (req, res, next) => {
    // const validationErrors = validationResult(req);

    try {
      // CHECK IF THERE'RE ERRORS
      if (!validationErrors.isEmpty()) {
        const error = new Error();
        error.httpStatusCode = 400;
        error.message = validationErrors;
        return next(error);
      }

      // CHECKING IF THE OWNER EXISTS IN DB
      const owners = await getOwners();
      const owner = owners.find(
        (owner) => owner.owner_id === req.params.owner_id
      );
      // IF NOT SEND ERROR
      if (!owner) {
        return next(new Error("Owner not found!"));
      }
      // CHECKING IF THE PLACE EXISTS IN THE DB BY THE ADDRESS
      const places = await getPlaces();
      const place = places.find(
        (place) => place.place_id === req.params.place_id
      );
      // IF NOT SEND ERROR
      if (!place) {
        next(new Error("Place not found!"));
      } else {
        const place_pics = req.body.place_pics;
        place_pics.push({
          ...req.body,
          image: req.file.path,
        });
        await writePlaces(places);
        res.send("ok");
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

module.exports = placesRouter;
