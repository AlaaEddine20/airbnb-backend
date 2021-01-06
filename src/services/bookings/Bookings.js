const express = require("express");
const uniqid = require("uniqid");
const { check, validationResult } = require("express-validator");
const { getBookings, writeBookings } = require("../../fsUtilities");

// ROUTER
const bookingsRouter = express.Router();

//

// POST BOOKING BY USERS
bookingsRouter.post("/placeID", async (req, res, next) => {
  try {
    const bookings = await getBookings();

    const bookingFound = bookings.find(
      (booking) => booking.name === req.body.name
    );

    if (!bookingFound) {
      bookings.push({
        ...req.body,
        booking_id: uniqid(),
        user_id: uniqid(),
      });

      await writeBookings(bookings);
      res.status(200).send("Booked successfully!");
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

module.exports = bookingsRouter;
