const trains = new Map();

export function getTrain(id) {
  return trains.get(id);
}

export function getAllTrains() {
  return [...trains.values()];
}

export function upsertTrain(id, patch) {
  const existing = trains.get(id) ?? {
    id,
    route: [],
    lastNode: null,
    nextNode: null,
    lastEventTime: null,
    confidence: 0.5,
  };

  trains.set(id, { ...existing, ...patch });
}

export async function initState() {
  console.log("state init ok");
}
