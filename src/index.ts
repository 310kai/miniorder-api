

import { buildApp } from "./app.js";


const app = buildApp();

app.listen({
  port: 3000,
  host: "127.0.0.1",
})
  .then((address) => {
    console.log(`MiniOrder API running at ${address}`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
