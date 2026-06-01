import express from "express";
import cors from "cors";
import { spawn } from "child_process";

const app = express();

app.use(cors());
app.get("/", (req, res) => {
  res.send("Backend OK");
});
app.get("/stream", (req, res) => {

  const url = req.query.url;

  if (!url) {
    return res.status(400).send("Missing url");
  }

  res.setHeader("Content-Type", "video/mp4");

  const ffmpeg = spawn("ffmpeg", [
    "-i", url,

    "-map", "0:v:0",
    "-map", "0:a:0",

    "-c:v", "copy",

    "-c:a", "aac",
    "-ac", "2",
    "-ar", "48000",
    "-b:a", "192k",

    "-movflags",
    "frag_keyframe+empty_moov+default_base_moof",

    "-f",
    "mp4",

    "pipe:1"
  ]);

  ffmpeg.stderr.on("data", d => {
    console.log(d.toString());
  });

  ffmpeg.stdout.pipe(res);

  req.on("close", () => {
    ffmpeg.kill("SIGKILL");
  });
});

app.listen(process.env.PORT || 3000);
