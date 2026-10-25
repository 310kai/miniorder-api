
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import { buildApp } from "../src/app.js";
import { pool } from "../src/db.js";

const app = buildApp();

async function createOrder() {
  const response = await app.inject({
    method: "POST",
    url: "/orders",
    payload: {
      productId: 1,
      quantity: 2,
    },
  });

  expect(response.statusCode).toBe(201);

  return response.json() as {
    id: number;
    totalPrice: number;
    status: string;
  };
}

describe("MiniOrder DB Integration", () => {
  beforeAll(async () => {
    if (
      process.env.DB_NAME !== "miniorder_test" ||
      process.env.DB_HOST !== "127.0.0.1" ||
      process.env.DB_PORT !== "5434"
    ) {
      throw new Error("Test database configuration is required");
    }

    const check = await pool.query(
      "SELECT current_database() AS name"
    );

    if (check.rows[0]?.name !== "miniorder_test") {
      throw new Error("Connected to an unexpected database");
    }

    await app.ready();
  });

  beforeEach(async () => {
    await pool.query(
      "TRUNCATE TABLE orders RESTART IDENTITY"
    );
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it("商品一覧をDBから取得できる", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/products",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveLength(3);
  });

  it("注文がDBに保存される", async () => {
    const order = await createOrder();

    expect(order.totalPrice).toBe(700);

    const result = await pool.query(
      "SELECT total_price FROM orders WHERE id = $1",
      [order.id]
    );

    expect(result.rows[0].total_price).toBe(700);
  });

  it("保存した注文を取得できる", async () => {
    const order = await createOrder();

    const response = await app.inject({
      method: "GET",
      url: `/orders/${order.id}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().id).toBe(order.id);
  });

  it("注文状態を更新し不正な遷移を拒否する", async () => {
    const order = await createOrder();

    const updated = await app.inject({
      method: "PATCH",
      url: `/orders/${order.id}/status`,
      payload: {
        status: "preparing",
      },
    });

    expect(updated.statusCode).toBe(200);
    expect(updated.json().status).toBe("preparing");

    const invalid = await app.inject({
      method: "PATCH",
      url: `/orders/${order.id}/status`,
      payload: {
        status: "completed",
      },
    });

    expect(invalid.statusCode).toBe(409);

    const result = await pool.query(
      "SELECT status FROM orders WHERE id = $1",
      [order.id]
    );

    expect(result.rows[0].status).toBe("preparing");
  });
});
