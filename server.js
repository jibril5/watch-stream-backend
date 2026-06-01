import express from "express";
import cors from "cors";
import { spawn } from "child_process";

const app = express();
app.use(cors());

app.get("/stream", (req, res) => {

  const url = req.query.url;
  if (!url) return res.status(400).send("Missing url");

  res.setHeader("Content-Type", "video/mp4");

  const ffmpeg = spawn("ffmpeg", [
    "-i", url,
    "-c:v", "copy",
    "-c:a", "aac",
    "-b:a", "192k",
    "-f", "mp4",
    "pipe:1"
  ]);

  ffmpeg.stdout.pipe(res);

  req.on("close", () => ffmpeg.kill("SIGKILL"));
});

app.listen(3000, () => {
  console.log("Server running");
});
