const express = require("express");
const uniqid = require("uniqid");
const { getOwners, writeOwners } = require("../../fsUtilities");

const ownersRouter = express.Router();

// POST OWNER INFOS
ownersRouter.post("/", async (req, res, next) => {
  try {
    const owners = await getOwners();

    const ownerFound = owners.find(
      (owner) => owner.UserName === req.body.UserName
    );

    if (!ownerFound) {
      owners.push({
        ...req.body,
        ownerID: uniqid(),
      });

      await writeOwners(owners);
      res.status(200).send("Successfully loaded!");
    } else {
      const error = new Error();
      error.httpStatusCode = 400;
      error.message =
        "Owner already registered, please choose a different name.";
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// GET ALL OWNERS
ownersRouter.get("/", async (req, res, next) => {
  try {
    const owners = await getOwners();
    res.send(owners);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// DELETE OWNER BY ID
ownersRouter.delete("/:ownerID", async (req, res, next) => {
  try {
    const owners = await getOwners();
    const ownerFound = owners.find((owner) => owner.ID === req.params.ownerID);

    if (ownerFound) {
      const filteredOwners = owners.filter(
        (owner) => owner.ID !== req.params.ownerID
      );
      await writeOwners(filteredOwners);
      res.status(204, "Deleted").send();
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      error.message = "Owner ID doesn't exist";
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
module.exports = ownersRouter;
