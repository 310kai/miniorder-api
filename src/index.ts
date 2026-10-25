
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

console.log("MiniOrder 商品一覧");
console.table(products);
