const express = require("express");
const uniqid = require("uniqid");
const { getUsers, writeUsers } = require("../../fsUtilities");

const usersRouter = express.Router();

usersRouter.post("/", async (req, res, next) => {
  try {
    const users = await getUsers();

    const userFound = users.find((user) => user.name === req.body.name);

    if (!userFound) {
      users.push({
        ...req.body,
        userID: uniqid(),
      });

      await writeUsers(users);
      res.status(200).send("Signed up!");
    } else {
      const error = new Error();
      error.httpStatusCode = 400;
      error.message = "User already exists, choose a different name!";
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = usersRouter;
