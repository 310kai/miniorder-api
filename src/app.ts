
import Fastify from "fastify";
import healthRoutes from "./routes/health.js";
import productsRoutes from "./routes/products.js";
import ordersRoutes from "./routes/orders.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(healthRoutes);
  app.register(productsRoutes);
  app.register(ordersRoutes);

  return app;
}
