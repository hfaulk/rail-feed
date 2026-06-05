import express from "express";
import { initState } from "./engine/state.js";
import { startTDFeed } from "./feeds/td.js";

const app = express();
const PORT = 3000;

// initialise everything
await initState();
startTDFeed();

app.get("/trains", async (req, res) => {
  const { getAllTrains } = await import("./engine/state.js");
  res.json(getAllTrains());
});

app.listen(PORT, () => {
  console.log(`running on http://localhost:${PORT}`);
});
