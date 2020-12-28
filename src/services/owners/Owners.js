const express = require("express");
const multer = require("multer");
const cloudinary = require("../cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { getOwners, writeOwners } = require("../../fsUtilities");
const { get } = require("../places/Places");

const ownersRouter = express.Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "airbnb-clone",
  },
});

const cloudinaryMulter = multer({ storage: storage });

ownersRouter.post(
  "/",
  cloudinaryMulter.single("cover"),
  async (req, res, next) => {
    try {
      const owners = await getOwners();

      owners.push({
        ...req.body,
        username: "",
        image: req.file.path,
      });

      await writeOwners(owners);
      req.json(owners);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
