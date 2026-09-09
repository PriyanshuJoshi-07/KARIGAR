import { createApp } from "./app.js";
import { config } from "./utils/config.js";
import { prisma } from "./utils/prisma.js";

const app = createApp();

app.listen(config.port, "0.0.0.0", () => {
  console.log(`KARIGAR API listening on ${config.port} (demoMode=${config.demoMode})`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
