
import Fastify from "fastify";
import awsLambdaFastify from "@fastify/aws-lambda";
import healthRoutes from "../routes/health.js";

const app = Fastify({
  logger: true,
});

app.register(healthRoutes);

export const handler = awsLambdaFastify(app);
