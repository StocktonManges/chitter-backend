import express from "express";
import { usersController } from "./routes/users";
import { postsController } from "./routes/posts";
import cors from "cors";
import { authController } from "./routes/auth";
import { exec } from "child_process";
import { onRequest } from "firebase-functions/v2/https";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", cors(), (_req, res) => {
  res.send(
    "<h1>Welcome to the Chitter REST API! Feel free to check out the 'users' and 'posts' endpoints.</h1>"
  );
});

app.use("/users", usersController);
app.use("/posts", postsController);
app.use("/auth", authController);

app.get("/reseed-data", (_req, res) => {
  exec("npm run seed", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error.message}`);
      return res.status(500).json("Error executing script");
    }
    if (stderr) {
      console.error(`Script stderr: ${stderr}`);
    }
    console.log(`Script output: ${stdout}`);
    return res.status(200).json("Script executed successfully");
  });
});

export const sqliteApp = onRequest(app);
