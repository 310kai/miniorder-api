

import Fastify from "fastify";
import productsRoutes from "./routes/products.js";
import ordersRoutes from "./routes/orders.js";


export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  app.register(productsRoutes);
  app.register(ordersRoutes);

  return app;
}
