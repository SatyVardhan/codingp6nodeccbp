const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3Driver = require("sqlite3");
const app = express();
let db = null;
const dbpath = path.join(__dirname, "covid19India.db");
const initialiseServerAndDatabase = async () => {
  try {
    db = await open({ filename: dbpath, driver: sqlite3Driver.Database });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DATABASE ERROR:${e.message}`);
    process.exit(1);
  }
};
initialiseServerAndDatabase();

// API 1 return a list all states in state table

app.get("/states/", async (request, response) => {
  const getAllStatesQuery = `
    SELECT * FROM states;`;
  const statesList = await db.all(getAllStatesQuery);
  const convertToCamelCase = (stateObject) => {
    return {
      stateId: stateObject.state_id,
      stateName: stateObject.state_name,
      population: stateObject.population,
    };
  };
  response.send(statesList.map((eachitem) => convertToCamelCase(eachitem)));
});
