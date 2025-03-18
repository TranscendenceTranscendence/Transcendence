import { parentPort } from "worker_threads";

if (!parentPort) {
  throw new Error(
    "No parent port, this file should only be run as a worker thread.",
  );
}

if (parentPort) {
  parentPort.on("message", (data) => {
    console.log("Received in worker:", data);
    parentPort?.postMessage("Processed: " + data);
  });
}
