
CREATE TABLE IF NOT EXISTS products (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  total_price INTEGER NOT NULL CHECK (total_price >= 0),
  status TEXT NOT NULL DEFAULT 'received'
    CHECK (status IN (
      'received',
      'preparing',
      'ready',
      'completed'
    )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO products (name, price)
SELECT name, price
FROM (
  VALUES
    ('コーヒー', 350),
    ('カフェラテ', 450),
    ('抹茶ラテ', 500)
) AS initial_products(name, price)
WHERE NOT EXISTS (SELECT 1 FROM products);
