const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "cricketMatchDetailss.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertPlayerDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

const convertMatchDbObjectToResponseObject = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

// GET API 1

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      player_details;`;
  const playersArray = await database.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertPlayerDbObjectToResponseObject(eachPlayer)
    )
  );
});

// GET 2 specified playerID

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT 
      *
    FROM 
      player_details 
    WHERE 
      player_id = ${playerId};`;
  const player = await database.get(getPlayerQuery);
  response.send(convertPlayerDbObjectToResponseObject(player));
});

/// ### API 3 Put

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerQuery = `
  UPDATE
    player_details
  SET
    player_name = '${playerName}',
  WHERE
    player_id = ${playerId};
  `;

  await database.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

/// GET specified match Details 4

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
    SELECT 
      *
    FROM 
      match_details
    WHERE 
      match_id = ${matchId};`;
  const match = await database.get(getMatchQuery);
  response.send(convertMatchDbObjectToResponseObject(match));
});

/// GET /players/:playerId/matches 5

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerPlayersQuery = `
    SELECT
        *
    FROM
    player_match_score
    WHERE
      player_match_id=${playerId};`;
  const player = await database.get(getPlayerPlayersQuery);
  response.send({ player });
});

/// GET matches/matches/player 6

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchesMatchQuery = `
    SELECT
        *
    FROM
    player_match_score
    WHERE
      player_match_id=${matchId};`;
  const match = await database.get(getMatchesMatchQuery);
  response.send({ match });
});

/// GET /players/:playerId/playerScores` 7

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerPlayersQuery = `
    SELECT
        player_id,
        sum(score),
        count(fours),
        count(sixes)
    FROM
    player_match_score
    WHERE
      player_id=${playerId};`;
  const player = await database.get(getPlayerPlayersQuery);
  response.send({ player });
});

module.exports = app;
