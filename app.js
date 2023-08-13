const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3Driver = require("sqlite3");
const app = express();
app.use(express.json());
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
// API 2 Return a state based on the state ID

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `SELECT * FROM state
    WHERE state_id = ${stateId};`;
  const stateObject = await db.get(getStateQuery);
  response.send(stateObject);
});

// API 3 create a district in district table

app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const addDistrictQuery = `INSERT INTO district
    (district_name,state_id,cases,cured,active,deaths)
    VALUES ("${districtName}",${stateId},${cases},
    ${cured},${active},${deaths});`;
  const dbResponse = await db.run(addDistrictQuery);
  response.send("District Successfully Added");
});

// API 4 return a district based on the districtID
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `SELECT * FROM district
    WHERE district_id = ${districtId};`;
  const districtObject = await db.get(getDistrictQuery);
  response.send(districtObject);
});

// API 5 delete a district by district id
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteQuery = `DELETE FROM district 
    WHERE district_id = ${districtId};`;
  await db.run(deleteQuery);
  response.send("District Removed");
});

// API 6 update a district by district Id

app.put("/districts/:districtId/", async (request, response) => {
  const districtDetails = request.body;
  const { districtId } = request.params;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateDistrictQuery = `UPDATE  district SET
    district_name = "${districtName}",
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths}
    WHERE district_id = ${districtId};`;
  await db.run(updateDistrictQuery);
  response.send("District Details Updated");
});

// API 7 return statistics of total cases
//  ,cured ,active,deaths of specific state
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateStatsQuery = `
    SELECT 
        SUM(cases),
        SUM(cured),
        SUM(active),
        SUM(deaths)
    FROM 
        district
    WHERE 
        state_id = ${stateId};`;
  const stats = await db.get(getStateStatsQuery);
  console.log(stats);
  response.send({
    totalCases: stats["SUM(cases)"],
    totalCured: stats["SUM(cured)"],
    totalActive: stats["SUM(active)"],
    totalDeaths: stats["SUM(deaths)"],
  });
});

// API 8 return an object
//  containing state name of
// district based on district Id

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `
    select state_id from district
    where district_id = ${districtId};
    `; //With this we will get the state_id using district table
  const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery);
  const getStateNameQuery = `
    select state_name as stateName from state
    where state_id = ${getDistrictIdQueryResponse.state_id};
    `; //With this we will get state_name as stateName using the state_id
  const getStateNameQueryResponse = await database.get(getStateNameQuery);
  response.send(getStateNameQueryResponse);
}); //sending the required response
module.exports = app;
