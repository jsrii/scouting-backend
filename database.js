import mysql from "mysql2";
import dotenv from "dotenv";
import { log } from "console";
dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

export async function getTeamData(id, eventName, APIKey) {
  if (APIKey == process.env.APIKEY) {
    const [rows] = await pool.query(`
            SELECT * 
            FROM ${eventName}
            WHERE id = ${id}
            `);
    return rows[0];
  } else if (APIKey != process.env.APIKEY) {
    return "Invalid API Key!";
  } else {
    return "Unknown Error! :(";
  }
}

export async function setTeam(creationRequest, headers) {
  const APIKey = headers["api-key"];
  const eventName = headers["event-name"];
  if (APIKey == process.env.APIKEY) {
    const keys = [
      "teamNum",
      "ab1",
      "ab2",
      "ab3",
      "strengths",
      "weaknesses",
      "botImage",
      "institution",
    ];
    const values = [
      creationRequest.teamNum,
      creationRequest.ab1,
      creationRequest.ab2,
      creationRequest.ab3,
      JSON.stringify(creationRequest.strengths),
      JSON.stringify(creationRequest.weaknesses),
      creationRequest.botImage,
      creationRequest.institution,
    ];

    console.log(creationRequest);

    const setValues = keys.map((key, index) => `${key} = ?`).join(", ");

    const queryValues = [...values, creationRequest.id];

    const query = `
            UPDATE ${eventName}
            SET ${setValues}
            WHERE id = ?;
          `;

    const [result] = await pool.query(query, [
      ...queryValues,
      creationRequest.id,
    ]);
    return result;
  } else if (APIKey != process.env.APIKEY) {
    return "Invalid API Key!";
  } else {
    return "Unknown Error! :(";
  }
}

export async function getTeams(table, APIKey) {
  if (APIKey == process.env.APIKEY) {
    const result = await pool.query(`SELECT * FROM ${table}`);
    return result;
  } else if (APIKey != process.env.APIKEY) {
    return "Invalid API Key!";
  } else {
    return "Unknown Error! :(";
  }
}

export async function createTeam(creationRequest, headers) {
  if (headers["api-key"] == process.env.APIKEY) {
    const eventName = headers["event-name"];
    const [result] = await pool.query(
      `
        INSERT INTO ?? (teamNum, ab1, ab2, ab3, strengths, weaknesses, botImage, institution)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
      [
        eventName,
        creationRequest.teamNum,
        creationRequest.ab1,
        creationRequest.ab2,
        creationRequest.ab3,
        JSON.stringify(creationRequest.strengths),
        JSON.stringify(creationRequest.weaknesses),
        creationRequest.botImage,
        creationRequest.institution,
      ]
    );
    return result;
  } else if (APIKey != process.env.APIKEY) {
    return "Invalid API Key!";
  } else {
    return "Unknown Error! :(";
  }
}

export async function deleteTeam(id, table, APIKey) {
  if (APIKey == process.env.APIKEY) {
    const [result] = await pool.query(`DELETE FROM ${table} WHERE id = ${id}`);
    return result;
  } else if (APIKey != process.env.APIKEY) {
    return "Invalid API Key!";
  } else {
    return "Unknown Error! :(";
  }
}

export async function getEvents(headers) {
  const APIKey = headers["api-key"];

  if (APIKey == process.env.APIKEY) {
    const [result] = await pool.query("SHOW TABLES like '2%'");
    return result;
  } else if (APIKey != process.env.APIKEY) {
    return "Invalid API Key!"
  } else {
    return "Unknown Error! :(";
  }
}

export async function checkIfEmail(email) {
  const [result] = await pool.query(`SELECT * FROM userTable WHERE email = '${email}'`);
  return result;
}

// const emailResult = await checkIfEmail("jas.kanthan@gmail.com");
// console.log(emailResult);

// const teamData = await deleteTeam(
//   1,
//   "2024onham",
//   `${import.meta.env.VITE_BACKEND_API_KEY}`
// );
// console.log(teamData);

// const teamData = await createTeam(
//   4325,
//   10,
//   10,
//   10,
//   '["leadership", "creativity", "communication"]',
//   '["impatience", "perfectionism", "disorganization"]',
//   "2024onham",
//   `${import.meta.env.VITE_BACKEND_API_KEY}`
// );
// console.log(teamData);

// const teamData = await getTeamData(
//   1,
//   "2024onham",
//   `${import.meta.env.VITE_BACKEND_API_KEY}`
// );
// console.log(teamData);

// const teamPublish = await setData(
//   1,
//   7200,
//   10,
//   10,
//   10,
//   '["leadership", "creativity", "communication"]',
//   '["impatience", "perfectionism", "disorganization"]',
//   "2024onham",
//   `${import.meta.env.VITE_BACKEND_API_KEY}`
// );
// console.log(teamPublish);
