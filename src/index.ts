
import Fastify from "fastify";

import { pool } from "./db.js";

const app = Fastify({
  logger: true,
});

type Product = {
  id: number;
  name: string;
  price: number;
};

const products: Product[] = [
  { id: 1, name: "コーヒー", price: 350 },
  { id: 2, name: "カフェラテ", price: 450 },
  { id: 3, name: "抹茶ラテ", price: 500 },
];

app.get("/health", async () => {
  return { status: "ok" };
});

app.get("/products", async () => {
  return products;
});

app.get<{ Params: { id: string } }>(
  "/products/:id",
  async (request, reply) => {
    const id = Number(request.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return reply.code(400).send({
        error: "Invalid product ID",
      });
    }

    const product = products.find((item) => item.id === id);

    if (!product) {
      return reply.code(404).send({
        error: "Product not found",
      });
    }

    return product;
  }
);



type OrderStatus =
  | "received"
  | "preparing"
  | "ready"
  | "completed";

type Order = {
  id: number;
  productId: number;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
};


const orders: Order[] = [];

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
          productId: { type: "integer", minimum: 1 },
          quantity: { type: "integer", minimum: 1 },
        },
      },
    },
  },
  async (request, reply) => {
    const { productId, quantity } = request.body;

    const product = products.find(
      (item) => item.id === productId
    );

    if (!product) {
      return reply.code(404).send({
        error: "Product not found",
      });
    }

    const order: Order = {
      id: orders.length + 1,
      productId,
      quantity,
      totalPrice: product.price * quantity,
      status: "received",
    };

    orders.push(order);

    return reply.code(201).send(order);
  }
);


app.get<{ Params: { id: string } }>(
  "/orders/:id",
  async (request, reply) => {
    const id = Number(request.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return reply.code(400).send({
        error: "Invalid order ID",
      });
    }

    const order = orders.find(
      (item) => item.id === id
    );

    if (!order) {
      return reply.code(404).send({
        error: "Order not found",
      });
    }

    return reply.code(200).send(order);
  }
);

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  received: ["preparing"],
  preparing: ["ready"],
  ready: ["completed"],
  completed: [],
};

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
            enum: ["received", "preparing", "ready", "completed"],
          },
        },
      },
    },
  },
  async (request, reply) => {
    const id = Number(request.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return reply.code(400).send({
        error: "Invalid order ID",
      });
    }

    const order = orders.find((item) => item.id === id);

    if (!order) {
      return reply.code(404).send({
        error: "Order not found",
      });
    }

    const nextStatus = request.body.status;

    if (!allowedTransitions[order.status].includes(nextStatus)) {
      return reply.code(409).send({
        error: "Invalid status transition",
      });
    }

    order.status = nextStatus;

    return reply.code(200).send(order);
  }
);

app.get("/db-products", async () => {
  const result = await pool.query(
    "SELECT id, name, price FROM products ORDER BY id"
  );

  return result.rows;
});


app.post<{
  Body: {
    productId: number;
    quantity: number;
  };
}>(
  "/db-orders",
  {
    schema: {
      body: {
        type: "object",
        required: ["productId", "quantity"],
        additionalProperties: false,
        properties: {
          productId: { type: "integer", minimum: 1 },
          quantity: { type: "integer", minimum: 1, maximum: 99 },
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
  "/db-orders/:id",
  async (request, reply) => {
    const id = Number(request.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
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

    return reply.code(200).send(result.rows[0]);
  }
);

app.listen({ port: 3000, host: "127.0.0.1" })
  .then((address) => {
    console.log(`MiniOrder API running at ${address}`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
