import {
  getTeamData,
  setTeam,
  getTeams,
  createTeam,
  deleteTeam,
  getEvents,
  checkIfEmail
} from "./database.js";
import express from "express";
import cors from "cors";
import ImgurClient from "imgur";
import expressFS from "express-fileupload";
import fs from "fs";
import path from "path";
import multer from "multer";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { log } from "console";
import exp from "constants";
dotenv.config();

const client = new ImgurClient({
  accessToken: process.env.ACCESS_TOKEN,
});

const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    // Save to uploads folder
    callBack(null, "./uploads");
  },
  filename: (req, file, callBack) => {
    // Generate a unique file name
    callBack(null, `${file.originalname}`);
  },
});

let upload = multer({ storage: storage }); // Use custom storage

const app = express();

var corsOptions = {
  origin: "http://192.168.1.40:8080",
  credentials: true,
  optionsSuccessStatus: 204,
};

// Use CORS middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Routes
app.get("/getteam", async (req, res) => {
  const id = req.headers["team-id"];
  const eventName = req.headers["event-name"];
  const APIKey = req.headers["api-key"];

  try {
    const teamData = await getTeamData(id, eventName, APIKey);
    res.send(teamData);
  } catch (error) {
    console.error("Error fetching team data:", error);
    res.status(500).send("Failed to fetch team data.");
  }
});

app.get("/getteams", async (req, res) => {
  console.log("Got a hit!");
  const eventName = req.headers["event-name"];
  const APIKey = req.headers["api-key"];
  try {
    const teamData = await getTeams(eventName, APIKey);
    res.json(teamData);
  } catch (error) {
    console.error("Error fetching team data:", error);
    res.status(500).send("Failed to fetch team data.");
  }
});

app.post("/createteam", async (req, res) => {
  const creationRequest = req.body.body;
  const headers = req.body.headers;
  const eventName = req.body.headers["event-name"];
  const APIKey = req.body.headers["api-key"];
  console.log(APIKey);

  try {
    const createT = await createTeam(creationRequest, headers);

    res.json(createT);
  } catch (error) {
    console.error("Error fetching team data:", error);
    res.status(500).send("Failed to fetch team data.");
  }
});

app.post("/botimage", upload.single("file"), async (req, res, next) => {
  console.log("bot imgggg");

  const file = req.file;
  let filePath = "./uploads/" + file.filename;
  console.log(file); // Log file details for debugging

  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  const response = await client.upload({
    image: fs.createReadStream(filePath),
    type: "stream",
  });
  console.log(response);
  res.send(response.data.link);
});

app.get("/deleteteam", async (req, res) => {
  const eventName = req.headers["event-name"];
  const APIKey = req.headers["api-key"];
  const entryToDelete = req.headers["entry-to-delete"];
  console.log(
    "Api Key is: " + eventName + " Entry to delete is: " + entryToDelete
  );
  console.log(req.headers);

  try {
    const deleteT = await deleteTeam(entryToDelete, eventName, APIKey);
    res.send(deleteT);
  } catch (error) {
    console.error("Error fetching team data:", error);
    res.status(500).send("Failed to fetch team data.");
  }
});

app.post("/updateteam", async (req, res) => {
  const creationRequest = req.body.body;
  const headers = req.body.headers;

  try {
    const updateTeam = await setTeam(creationRequest, headers);

    res.json(updateTeam);
  } catch (error) {
    console.error("Error fetching team data:", error);
    res.status(500).send("Failed to fetch team data.");
  }
});

app.get("/getevents", async (req, res) => {
  const headers = req.headers;
  console.log(headers);

  try {
    const events = await getEvents(headers);
    res.json(events);
  } catch (error) {
    console.error("Error fetching tables data:", error);
    res.status(500).send("Failed to fetch tables data.");
  }
});

app.post("/login", async (req, res) => {
  console.log(req.body.email);
  const email = req.body.email;
  const password = req.body.password;


  try {
    const emailStatus = await checkIfEmail(email);

    console.log(emailStatus[0]);


    if (!emailStatus[0])
      return res.status(400).json({ message: "Email does not match!" })

    if (emailStatus[0].password !== password)
      return res.status(400).json({ message: "password does not match!" })

    const jwtToken = jwt.sign({
      email: emailStatus[0].email,
    }, process.env.JWT_SECRET, { expiresIn: 3600 });
    res.json({
      message: "Successful Login", token: jwtToken, avatarUrl: emailStatus[0].avatarUrl,
      name: emailStatus[0].name
    })
  } catch (err) {
    res.status(500).json({ message: "Error with connecting to backend!" + err });
  }
});

app.get("/status", (req, res) => {
  res.send({ Status: "Running" });
});

app.listen(7777, () => {
  console.log("Server is running on port 7777");
});
