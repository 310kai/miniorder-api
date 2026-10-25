
import Fastify from "fastify";

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


type Order = {
  id: number;
  productId: number;
  quantity: number;
  totalPrice: number;
  status: "received";
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

app.listen({ port: 3000, host: "127.0.0.1" })
  .then((address) => {
    console.log(`MiniOrder API running at ${address}`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
