
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from "vitest";

import { buildApp } from "../src/app.js";

describe("MiniOrder API", () => {
  const app = buildApp();

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /health が200を返す", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
    });
  });

  it("不正な商品IDを拒否する", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/products/abc",
    });

    expect(response.statusCode).toBe(400);
  });

  it("不正な注文IDを拒否する", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/orders/abc",
    });

    expect(response.statusCode).toBe(400);
  });

  it("注文数量0を拒否する", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/orders",
      payload: {
        productId: 1,
        quantity: 0,
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it("商品IDがない注文を拒否する", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/orders",
      payload: {
        quantity: 2,
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it("不正なステータスを拒否する", async () => {
    const response = await app.inject({
      method: "PATCH",
      url: "/orders/1/status",
      payload: {
        status: "unknown",
      },
    });

    expect(response.statusCode).toBe(400);
  });
});
