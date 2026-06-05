import { upsertTrain } from "../engine/state.js";

export function startTDFeed() {
  console.log("td feed started (mock)");

  setInterval(() => {
    // fake update
    upsertTrain("6M76", {
      lastNode: { lat: 52.4, lon: -1.9 },
      nextNode: { lat: 52.5, lon: -1.8 },
      lastEventTime: Date.now(),
    });
  }, 5000);
}
