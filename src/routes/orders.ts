
import type { FastifyPluginAsync } from "fastify";
import { pool } from "../db.js";
import { parseId } from "../utils/parse-id.js";

type OrderStatus =
  | "received"
  | "preparing"
  | "ready"
  | "completed";

const ordersRoutes: FastifyPluginAsync = async (app) => {
  app.post<{
    Body: {
      productId: number;
      quantity: number;
    };
  }>(
    "/orders",
    {
      schema: {
        body: {
          type: "object",
          required: ["productId", "quantity"],
          additionalProperties: false,
          properties: {
            productId: {
              type: "integer",
              minimum: 1,
              maximum: 2147483647,
            },
            quantity: {
              type: "integer",
              minimum: 1,
              maximum: 99,
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { productId, quantity } = request.body;

      const result = await pool.query(
        `INSERT INTO orders
          (product_id, quantity, unit_price, total_price)
         SELECT id, $2::integer, price, price * $2::integer
         FROM products
         WHERE id = $1::integer
         RETURNING
           id,
           product_id AS "productId",
           quantity,
           unit_price AS "unitPrice",
           total_price AS "totalPrice",
           status`,
        [productId, quantity]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({
          error: "Product not found",
        });
      }

      return reply.code(201).send(result.rows[0]);
    }
  );

  app.get<{ Params: { id: string } }>(
    "/orders/:id",
    async (request, reply) => {
      const id = parseId(request.params.id);

      if (id === null) {
        return reply.code(400).send({
          error: "Invalid order ID",
        });
      }

      const result = await pool.query(
        `SELECT
           id,
           product_id AS "productId",
           quantity,
           unit_price AS "unitPrice",
           total_price AS "totalPrice",
           status,
           created_at AS "createdAt"
         FROM orders
         WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({
          error: "Order not found",
        });
      }

      return result.rows[0];
    }
  );

  app.patch<{
    Params: { id: string };
    Body: { status: OrderStatus };
  }>(
    "/orders/:id/status",
    {
      schema: {
        body: {
          type: "object",
          required: ["status"],
          additionalProperties: false,
          properties: {
            status: {
              type: "string",
              enum: [
                "received",
                "preparing",
                "ready",
                "completed",
              ],
            },
          },
        },
      },
    },
    async (request, reply) => {
      const id = parseId(request.params.id);

      if (id === null) {
        return reply.code(400).send({
          error: "Invalid order ID",
        });
      }

      const nextStatus = request.body.status;

      const result = await pool.query(
        `UPDATE orders
         SET status = $2::text
         WHERE id = $1
           AND (
             (status = 'received' AND $2::text = 'preparing')
             OR
             (status = 'preparing' AND $2::text = 'ready')
             OR
             (status = 'ready' AND $2::text = 'completed')
           )
         RETURNING
           id,
           product_id AS "productId",
           quantity,
           unit_price AS "unitPrice",
           total_price AS "totalPrice",
           status`,
        [id, nextStatus]
      );

      if (result.rows.length > 0) {
        return reply.code(200).send(result.rows[0]);
      }

      const existing = await pool.query(
        "SELECT id FROM orders WHERE id = $1",
        [id]
      );

      if (existing.rows.length === 0) {
        return reply.code(404).send({
          error: "Order not found",
        });
      }

      return reply.code(409).send({
        error: "Invalid status transition",
      });
    }
  );
};

export default ordersRoutes;
