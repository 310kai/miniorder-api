
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

app.listen({ port: 3000, host: "127.0.0.1" })
  .then((address) => {
    console.log(`MiniOrder API running at ${address}`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
