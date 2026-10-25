
import type { FastifyPluginAsync } from "fastify";
import { pool } from "../db.js";
import { parseId } from "../utils/parse-id.js";

const productsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/products", async () => {
    const result = await pool.query(
      "SELECT id, name, price FROM products ORDER BY id"
    );

    return result.rows;
  });

  app.get<{ Params: { id: string } }>(
    "/products/:id",
    async (request, reply) => {
      const id = parseId(request.params.id);

      if (id === null) {
        return reply.code(400).send({
          error: "Invalid product ID",
        });
      }

      const result = await pool.query(
        "SELECT id, name, price FROM products WHERE id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({
          error: "Product not found",
        });
      }

      return result.rows[0];
    }
  );
};

export default productsRoutes;
