import express from "express";
import cors from "cors";
import { spawn } from "child_process";

const app = express();

app.use(cors());

// 🟢 test simple Railway
app.get("/", (req, res) => {
  res.send("Backend OK 🚀");
});

// 🎬 STREAM ENDPOINT
app.get("/stream", (req, res) => {

  const url = req.query.url;

  if (!url) {
    return res.status(400).send("Missing url");
  }

  console.log("🎬 New stream request:", url);

  // Headers streaming navigateur
  res.writeHead(200, {
    "Content-Type": "video/mp4",
    "Accept-Ranges": "bytes",
    "Connection": "keep-alive",
    "Cache-Control": "no-cache",
  });

  const ffmpeg = spawn("ffmpeg", [
    "-re",
    "-i", url,

    // video
    "-map", "0:v:0",
    "-c:v", "copy",

    // audio → conversion obligatoire navigateur
    "-map", "0:a:0",
    "-c:a", "aac",
    "-ac", "2",
    "-ar", "48000",
    "-b:a", "192k",

    // IMPORTANT streaming browser
    "-movflags",
    "frag_keyframe+empty_moov+default_base_moof+faststart",

    "-f", "mp4",
    "pipe:1"
  ]);

  // 🔥 logs ffmpeg (TRÈS IMPORTANT pour debug)
  ffmpeg.stderr.on("data", (data) => {
    console.log("FFMPEG:", data.toString());
  });

  ffmpeg.on("error", (err) => {
    console.error("❌ FFmpeg spawn error:", err);
  });

  ffmpeg.on("close", (code) => {
    console.log("FFmpeg exited with code:", code);
  });

  // stream vers navigateur
  ffmpeg.stdout.pipe(res);

  // stop si utilisateur quitte
  req.on("close", () => {
    console.log("🛑 Client disconnected, killing ffmpeg");
    ffmpeg.kill("SIGKILL");
  });
});

// 🚀 IMPORTANT RAILWAY FIX
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port", PORT);
});
