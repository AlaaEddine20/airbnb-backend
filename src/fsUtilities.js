const { readJSON, writeJSON } = require("fs-extra");
const { join } = require("path");

const placesPath = join(__dirname, "./services/places/Places.json");
const ownersPath = join(__dirname, "./services/owners/Owners.json");
const usersPath = join(__dirname, "./services/users/Users.json");

const readDB = async (filePath) => {
  try {
    const fileJson = await readJSON(filePath);
    return fileJson;
  } catch (error) {
    throw new Error(error);
  }
};

const writeDB = async (filePath, fileContent) => {
  try {
    await writeJSON(filePath, fileContent);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  getPlaces: async () => readDB(placesPath),
  writePlaces: async (placesData) => writeDB(placesPath, placesData),
  getOwners: async () => readDB(ownersPath),
  writeOwners: async (ownersData) => writeDB(ownersPath, ownersData),
  getUsers: async () => readDB(usersPath),
  writeUsers: async (usersData) => writeDB(usersPath, usersData),
};
